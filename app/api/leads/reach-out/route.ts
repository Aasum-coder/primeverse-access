import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Reach-out marking endpoint. The dashboard "Reach Out" modal POSTs here
// after the IB clicks one of the channel buttons (email / WhatsApp /
// Telegram). The actual send happens client-side via mailto: or
// wa.me/t.me deep links — this route only records that the contact
// happened, so the lead doesn't get pinged twice and the Pipeline can
// flip the row to the "contacted" state.
//
// Auth: Bearer token in Authorization header (same pattern as every
// other authenticated route in this repo).
// Authorization: the caller must own the lead — distributors can only
// mark their own leads as reached out.
//
// Request body: { lead_id: string, channel: 'email'|'whatsapp'|'telegram', message?: string }
// `message` is accepted for forward compatibility but not persisted
// (no column for it in the leads table by design — the IB sends the
// message via their mail client / messaging app, we just record that
// they did).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

const ALLOWED_CHANNELS = new Set(['email', 'whatsapp', 'telegram'])

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 })
  }
  const { data: userData, error: authErr } = await supabaseAnon.auth.getUser(token)
  if (authErr || !userData?.user) {
    return NextResponse.json({ error: 'Invalid bearer token' }, { status: 401 })
  }

  let body: { lead_id?: string; channel?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const leadId = body.lead_id
  const channel = body.channel
  if (!leadId || typeof leadId !== 'string') {
    return NextResponse.json({ error: 'lead_id required' }, { status: 400 })
  }
  if (!channel || !ALLOWED_CHANNELS.has(channel)) {
    return NextResponse.json({ error: 'channel must be email, whatsapp, or telegram' }, { status: 400 })
  }

  // Resolve caller distributor id (service role bypasses RLS so the
  // ownership check below is authoritative).
  const { data: dist, error: distErr } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (distErr || !dist?.id) {
    return NextResponse.json({ error: 'No distributor for this user' }, { status: 404 })
  }

  // Ownership check: the lead must belong to the caller's distributor row.
  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('id, distributor_id, reached_out_at')
    .eq('id', leadId)
    .maybeSingle()
  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }
  if (lead.distributor_id !== dist.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: updateErr } = await supabaseAdmin
    .from('leads')
    .update({
      reached_out_at: new Date().toISOString(),
      reached_out_by: dist.id,
      reached_out_channel: channel,
    })
    .eq('id', leadId)

  if (updateErr) {
    console.error('[reach-out] update failed:', updateErr.message)
    return NextResponse.json({ error: 'Failed to mark as contacted' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
