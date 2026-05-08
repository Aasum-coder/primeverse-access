import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPuPrimeClient } from '@/lib/puprime/verify'

// Real-time PU Prime Identity Gateway verification, called by the IB
// dashboard right after a lead is inserted (app/page.tsx → addLead).
//
// Auth: Bearer token (matches the rest of the repo). The caller must own
// the lead's distributor_id, OR be an admin (is_admin or the bitaasum
// allow-listed email). Service-role client used for the read+update so
// the row is reachable regardless of RLS.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { leadId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const leadId = body.leadId
  if (!leadId || typeof leadId !== 'string') {
    return NextResponse.json({ error: 'leadId required' }, { status: 400 })
  }

  // Authorise: caller must own the lead's distributor_id, or be admin.
  let isAdmin = caller.email === 'bitaasum@gmail.com'
  let callerDistributorId: string | null = null
  const { data: callerDist } = await supabaseAdmin
    .from('distributors')
    .select('id, is_admin')
    .eq('user_id', caller.id)
    .maybeSingle()
  if (callerDist?.is_admin === true) isAdmin = true
  if (callerDist?.id) callerDistributorId = callerDist.id

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('id, email, uid, uid_verified, distributor_id')
    .eq('id', leadId)
    .maybeSingle()
  if (leadErr) {
    console.error(`[leads/verify-puprime] lookup failed leadId=${leadId}: ${leadErr.message}`)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (!isAdmin && lead.distributor_id !== callerDistributorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Skip the gateway when the lead has no UID — the public landing form
  // path inserts leads without a UID and verification has to wait for
  // the IB to add one through the dashboard. Mirrors spec Step 4.
  if (!lead.uid || !`${lead.uid}`.trim()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'pending_uid',
    })
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
      console.error(`[leads/verify-puprime] update failed leadId=${lead.id}: ${updErr.message}`)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({
      ok: true,
      granted: true,
      reason: result.reason ?? null,
      client: result.client,
    })
  }

  // Denial: keep uid_verified as-is (don't flip an already-true lead just
  // because the gateway is unreachable on this call), but persist the
  // source + reason so the dashboard can show why it failed.
  const { error: updErr } = await supabaseAdmin
    .from('leads')
    .update({
      verification_source: 'puprime_api',
      verification_reason: result.reason,
    })
    .eq('id', lead.id)
  if (updErr) {
    console.error(`[leads/verify-puprime] denial update failed leadId=${lead.id}: ${updErr.message}`)
  }
  return NextResponse.json({ ok: true, granted: false, reason: result.reason })
}
