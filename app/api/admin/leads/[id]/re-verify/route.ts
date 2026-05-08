import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { invalidatePuPrimeCache, verifyPuPrimeClient } from '@/lib/puprime/verify'

// Admin-only force re-verification. Bypasses the in-memory cache by
// calling invalidatePuPrimeCache before the gateway hit, so a manual
// re-check always sees the current PU Prime side state — useful when an
// IB tells us "my lead is verified now but the dashboard didn't notice."
//
// Same admin auth pattern as app/api/admin/terminate-ib (Bearer →
// supabase.auth.getUser → bitaasum@ allow-list OR distributors.is_admin).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let isAdmin = caller.email === 'bitaasum@gmail.com'
  if (!isAdmin) {
    const { data: callerDist } = await supabaseAdmin
      .from('distributors')
      .select('is_admin')
      .eq('user_id', caller.id)
      .maybeSingle()
    if (callerDist?.is_admin === true) isAdmin = true
  }
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('id, email, uid, uid_verified, verification_source, verification_reason')
    .eq('id', id)
    .maybeSingle()
  if (leadErr) {
    console.error(`[admin/leads/re-verify] lookup failed leadId=${id}: ${leadErr.message}`)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (!lead.uid || !`${lead.uid}`.trim()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'pending_uid' })
  }

  const uidNumber = Number(lead.uid)
  if (!Number.isInteger(uidNumber) || uidNumber <= 0) {
    const reason = 'Invalid uid — must be a whole integer PU Prime account ID'
    await supabaseAdmin
      .from('leads')
      .update({ verification_source: 'puprime_api', verification_reason: reason })
      .eq('id', lead.id)
    return NextResponse.json({ ok: true, granted: false, reason })
  }

  // Force a fresh fetch — explicit purpose of this admin endpoint.
  invalidatePuPrimeCache(lead.email)

  const result = await verifyPuPrimeClient(lead.email, uidNumber)

  if (result.granted) {
    const nowIso = new Date().toISOString()
    const { error: updErr } = await supabaseAdmin
      .from('leads')
      .update({
        uid_verified: true,
        uid_verified_at: nowIso,
        verification_source: 'puprime_api',
        verification_reason: null,
      })
      .eq('id', lead.id)
    if (updErr) {
      console.error(`[admin/leads/re-verify] update failed leadId=${lead.id}: ${updErr.message}`)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({
      ok: true,
      granted: true,
      reason: result.reason ?? null,
      client: result.client,
    })
  }

  // Denial: persist source + reason but DO NOT flip uid_verified to false.
  // Re-verify is for "did this become verified" — not for revoking trust
  // a human already approved. Phase 2 may revisit this.
  const { error: updErr } = await supabaseAdmin
    .from('leads')
    .update({
      verification_source: 'puprime_api',
      verification_reason: result.reason,
    })
    .eq('id', lead.id)
  if (updErr) {
    console.error(`[admin/leads/re-verify] denial update failed leadId=${lead.id}: ${updErr.message}`)
  }
  return NextResponse.json({ ok: true, granted: false, reason: result.reason })
}
