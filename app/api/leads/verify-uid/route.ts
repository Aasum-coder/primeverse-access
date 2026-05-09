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

  // Post-verify side-effects:
  //   1. Generate Telegram deep-link token, persist it on the lead row
  //   2. UPSERT bot_verified_users (fallback path for the @OneMoveAccessBot)
  //   3. Send the verified-access email
  // Idempotent — if already sent (column verified_access_email_sent_at),
  // we skip everything. Non-blocking — failures are logged, lead stays
  // verified, user-facing success is unaffected.
  try {
    const { data: leadFull } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, verified_access_email_sent_at')
      .eq('id', lead.id)
      .maybeSingle()

    if (!leadFull?.email || !leadFull?.name) {
      console.warn(`[leads/verify-uid] post-verify skipped — missing name/email leadId=${lead.id}`)
    } else if (leadFull.verified_access_email_sent_at) {
      console.info(`[leads/verify-uid] verified-access already sent leadId=${lead.id} — skipping`)
    } else {
      const { generateTelegramLinkToken, telegramLinkTokenExpiryFromNow, buildTelegramDeepLink } =
        await import('@/lib/leads/telegram-link')
      const { buildVerifiedAccessEmail } = await import('@/lib/email-templates/verified-access')

      const tgToken = generateTelegramLinkToken()
      const tgExpiry = telegramLinkTokenExpiryFromNow()

      const { error: tgUpdErr } = await supabaseAdmin
        .from('leads')
        .update({
          telegram_link_token: tgToken,
          telegram_link_token_expires_at: tgExpiry,
        })
        .eq('id', lead.id)

      if (tgUpdErr) {
        console.error(`[leads/verify-uid] telegram token persist failed leadId=${lead.id}: ${tgUpdErr.message}`)
      }

      // UPSERT to bot_verified_users — fallback path: if the lead skips the
      // deep-link and just enters their UID in the bot, they still get
      // auto-approved.
      const nameParts = (leadFull.name || '').split(' ')
      const { error: bvErr } = await supabaseAdmin
        .from('bot_verified_users')
        .upsert(
          {
            uid: String(uidNum),
            email: leadFull.email,
            first_name: nameParts[0] || null,
            last_name: nameParts.slice(1).join(' ') || null,
            member_status: 'approved',
            source: 'systm8_lead',
            source_detail: 'IB-recruited lead, UID verified',
            systm8_lead_id: lead.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'uid' },
        )

      if (bvErr) {
        console.error(`[leads/verify-uid] bot_verified_users upsert failed leadId=${lead.id}: ${bvErr.message}`)
      }

      // Send the verified-access email
      const { subject, html } = buildVerifiedAccessEmail({
        name: leadFull.name,
        telegramDeepLink: buildTelegramDeepLink(tgToken),
      })

      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        console.warn(`[leads/verify-uid] RESEND_API_KEY not configured; skipping verified-access email leadId=${lead.id}`)
      } else {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: '1Move Academy <noreply@primeverseaccess.com>',
            to: [leadFull.email],
            subject,
            html,
          }),
        })

        if (!resendRes.ok) {
          const errText = await resendRes.text().catch(() => 'unknown')
          console.error(`[leads/verify-uid] verified-access email failed leadId=${lead.id} status=${resendRes.status} body=${errText.slice(0, 200)}`)
        } else {
          // Mark sent — even on Resend success-but-marked-failed path, this
          // prevents double-sends.
          await supabaseAdmin
            .from('leads')
            .update({ verified_access_email_sent_at: new Date().toISOString() })
            .eq('id', lead.id)
          console.info(`[leads/verify-uid] verified-access email sent leadId=${lead.id}`)
        }
      }
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown'
    console.error(`[leads/verify-uid] post-verify side-effects failed leadId=${lead.id}: ${reason}`)
  }

  rateLimitReset(token)
  console.info(`[leads/verify-uid] granted leadId=${lead.id} uid=${uidNum}`)
  return NextResponse.json({ ok: true, granted: true, client: result.client })
}
