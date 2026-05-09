import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyToken } from '@/lib/leads/verify-token'

// Email click target for "Already a PU Prime client?". The link in
// Email #1 is a GET (browser navigation), so we accept GET and redirect
// to a thank-you page. POST is also accepted for programmatic use.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'

async function flagExistingClient(token: string): Promise<{ ok: boolean; status: number; reason?: string }> {
  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, verify_token, verify_token_expires_at, distributor_id, name, email, existing_client_flag')
    .eq('verify_token', token)
    .maybeSingle()

  if (error) {
    console.error(`[leads/existing-client] db lookup error: ${error.message}`)
    return { ok: false, status: 500, reason: 'lookup_failed' }
  }
  if (!lead) {
    return { ok: false, status: 404, reason: 'token_not_found' }
  }

  const status = classifyToken(lead.verify_token, lead.verify_token_expires_at)
  if (status !== 'valid') {
    return { ok: false, status: 410, reason: 'token_expired' }
  }

  if (lead.existing_client_flag !== true) {
    const { error: updErr } = await supabaseAdmin
      .from('leads')
      .update({ existing_client_flag: true })
      .eq('id', lead.id)
    if (updErr) {
      console.error(`[leads/existing-client] update failed leadId=${lead.id}: ${updErr.message}`)
      return { ok: false, status: 500, reason: 'update_failed' }
    }
    console.info(`[leads/existing-client] flagged leadId=${lead.id} (${lead.email || '<no email>'})`)
  }

  return { ok: true, status: 200 }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(`${APP_BASE_URL}/verify-uid/existing-client?status=missing`, { status: 302 })
  }
  const result = await flagExistingClient(token)
  const statusParam = result.ok ? 'ok' : (result.reason || 'error')
  return NextResponse.redirect(`${APP_BASE_URL}/verify-uid/existing-client?status=${statusParam}`, { status: 302 })
}

export async function POST(request: Request) {
  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const token = body.token?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }
  const result = await flagExistingClient(token)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason || 'failed' }, { status: result.status })
  }
  return NextResponse.json({ ok: true })
}
