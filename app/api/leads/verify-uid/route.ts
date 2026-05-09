import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPuPrimeClient } from '@/lib/puprime/verify'
import { classifyToken } from '@/lib/leads/verify-token'
import { attempt as rateLimitAttempt, reset as rateLimitReset } from '@/lib/leads/verify-rate-limit'

// Public endpoint — accepts { token, uid } from the verify-uid page,
// looks up the lead by the single-use token, calls the PU Prime gateway,
// and on granted:true marks the lead as verified.
//
// Rate-limited per token (5 attempts / 30 min) so a leaked link can't be
// used to brute-force valid UIDs.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface VerifyUidBody {
  token?: string
  uid?: number | string
}

export async function POST(request: Request) {
  let body: VerifyUidBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const rawUid = body.uid
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const limit = rateLimitAttempt(token)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: limit.retryAfterSeconds
          ? { 'Retry-After': String(limit.retryAfterSeconds) }
          : {},
      },
    )
  }

  // UID may arrive as a string from the form. Coerce to integer.
  const uidNum = typeof rawUid === 'number' ? rawUid : Number(String(rawUid ?? '').trim())
  if (!Number.isInteger(uidNum) || uidNum <= 0) {
    return NextResponse.json({ error: 'invalid_uid', granted: false, reason: 'PU Prime UID must be a positive whole number' }, { status: 400 })
  }

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('id, email, uid, uid_verified, distributor_id, verify_token, verify_token_expires_at')
    .eq('verify_token', token)
    .maybeSingle()

  if (leadErr) {
    console.error(`[leads/verify-uid] db lookup error: ${leadErr.message}`)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
  if (!lead) {
    return NextResponse.json({ error: 'token_not_found' }, { status: 404 })
  }

  const tokenStatus = classifyToken(lead.verify_token, lead.verify_token_expires_at)
  if (tokenStatus !== 'valid') {
    return NextResponse.json({ error: 'token_expired' }, { status: 410 })
  }

  if (!lead.email) {
    return NextResponse.json({ error: 'lead_email_missing' }, { status: 500 })
  }

  // Already verified? Idempotent return — the page will redirect to success.
  if (lead.uid_verified === true) {
    return NextResponse.json({ ok: true, granted: true, alreadyVerified: true })
  }

  const result = await verifyPuPrimeClient(lead.email, uidNum)

  if (!result.granted) {
    // Persist the denial for the pipeline UI; don't clear the token —
    // the user may re-try with a different UID.
    await supabaseAdmin
      .from('leads')
      .update({
        uid: String(uidNum),
        verification_source: 'puprime_api',
        verification_reason: result.reason,
      })
      .eq('id', lead.id)
    return NextResponse.json({ ok: true, granted: false, reason: result.reason })
  }

  // Granted: stamp the lead, clear the token (single-use), reset the
  // limiter so a future admin re-issue starts clean.
  const nowIso = new Date().toISOString()
  const { error: updErr } = await supabaseAdmin
    .from('leads')
    .update({
      uid: String(uidNum),
      uid_verified: true,
      uid_verified_at: nowIso,
      verification_source: 'puprime_api',
      verification_reason: null,
      verify_token: null,
      verify_token_expires_at: null,
    })
    .eq('id', lead.id)

  if (updErr) {
    console.error(`[leads/verify-uid] update failed leadId=${lead.id}: ${updErr.message}`)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  rateLimitReset(token)
  console.info(`[leads/verify-uid] granted leadId=${lead.id} uid=${uidNum}`)
  return NextResponse.json({ ok: true, granted: true, client: result.client })
}
