import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNewLeadAlertEmail } from '@/lib/email-templates/new-lead-alert'
import { notifyIBTelegram, buildNewLeadMessage } from '@/lib/telegram/notify-ib'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

// Real-time trigger — called immediately when a new lead registers
export async function POST(request: Request) {
  const { distributorId } = await request.json()

  if (!distributorId) {
    return NextResponse.json({ error: 'Missing distributorId' }, { status: 400 })
  }

  // Fetch the IB's profile
  const { data: dist, error: fetchError } = await supabaseAdmin
    .from('distributors')
    .select('id, name, email, slug, language')
    .eq('id', distributorId)
    .maybeSingle()

  if (fetchError || !dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  // Get actual lead count at send time
  const { count } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', dist.id)

  const leadCount = count || 1

  // Newest lead for this IB — the one that just signed up
  const { data: newestLead } = await supabaseAdmin
    .from('leads')
    .select('name')
    .eq('distributor_id', dist.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Telegram ping — fires on EVERY new lead (not email-rate-limited).
  // Only delivered to IBs with telegram_status = 'linked'. Never throws.
  const telegram = await notifyIBTelegram(dist.id, (lang) =>
    buildNewLeadMessage(lang, { leadName: newestLead?.name || null, leadCount }),
  )

  // Email — rate limited: max one new_lead_alert per 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: recentSend } = await supabaseAdmin
    .from('email_sends')
    .select('id')
    .eq('user_id', dist.id)
    .eq('email_type', 'new_lead_alert')
    .gte('sent_at', thirtyMinutesAgo)
    .limit(1)

  if (recentSend && recentSend.length > 0) {
    return NextResponse.json({ skipped: true, reason: 'Email rate limited — sent within last 30 minutes', telegram: telegram.sent })
  }

  const name = dist.name || dist.email?.split('@')[0] || 'there'
  const lang = dist.language || 'en'

  const { html, subject } = buildNewLeadAlertEmail({
    name,
    slug: dist.slug,
    leadCount,
    lang,
  })

  const { error } = await resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [dist.email],
    subject,
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message, telegram: telegram.sent }, { status: 500 })
  }

  // Log the send
  await supabaseAdmin.from('email_sends').insert({
    user_id: dist.id,
    email_type: 'new_lead_alert',
  })

  return NextResponse.json({ success: true, leadCount, telegram: telegram.sent })
}
