import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildBroadcastEmail } from '@/lib/email-templates/broadcast'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

export async function POST(request: Request) {
  const {
    broadcastId,
    distributorId,
    title,
    message,
    channels,
    audience,
    distributorName,
    distributorSlug,
    distributorReferralLink,
  } = await request.json() as {
    broadcastId: string
    distributorId: string
    title: string
    message: string
    channels: string[]
    audience: 'all' | 'verified' | 'last7days' | 'last30days'
    distributorName: string
    distributorSlug: string
    distributorReferralLink: string
  }

  if (!broadcastId || !distributorId || !title || !message || !channels || !audience) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 1. Update broadcast status to 'sending'
  await supabaseAdmin
    .from('broadcasts')
    .update({ status: 'sending' })
    .eq('id', broadcastId)

  // 2. Fetch leads matching the audience filter for this distributor
  let query = supabaseAdmin
    .from('leads')
    .select('id, name, email, uid, uid_verified, created_at')
    .eq('distributor_id', distributorId)

  if (audience === 'verified') {
    query = query.eq('uid_verified', true)
  } else if (audience === 'last7days') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', sevenDaysAgo)
  } else if (audience === 'last30days') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', thirtyDaysAgo)
  }
  // "all" — no additional filter

  const { data: leads, error: leadsError } = await query

  if (leadsError) {
    await supabaseAdmin
      .from('broadcasts')
      .update({ status: 'failed' })
      .eq('id', broadcastId)
    return NextResponse.json({ error: 'Failed to fetch leads: ' + leadsError.message }, { status: 500 })
  }

  if (!leads || leads.length === 0) {
    await supabaseAdmin
      .from('broadcasts')
      .update({ status: 'sent', sent_count: 0, sent_at: new Date().toISOString() })
      .eq('id', broadcastId)
    return NextResponse.json({ success: true, sentCount: 0, failedCount: 0, whatsappLinks: [] })
  }

  let sentCount = 0
  let failedCount = 0
  const whatsappLinks: { name: string; url: string }[] = []

  const landingPageUrl = `https://primeverseaccess.com/${distributorSlug}`

  for (const lead of leads) {
    // 3. Email channel
    if (channels.includes('email') && lead.email) {
      const firstName = lead.name ? lead.name.split(' ')[0] : 'there'

      // Resolve merge tags in the message body
      const resolvedMessage = message
        .replace(/\{first_name\}/g, firstName)
        .replace(/\{landing_page_url\}/g, landingPageUrl)
        .replace(/\{referral_link\}/g, distributorReferralLink || '')

      const resolvedTitle = title
        .replace(/\{first_name\}/g, firstName)
        .replace(/\{landing_page_url\}/g, landingPageUrl)
        .replace(/\{referral_link\}/g, distributorReferralLink || '')

      const { html, subject } = buildBroadcastEmail({
        title: resolvedTitle,
        message: resolvedMessage,
        distributorName,
      })

      const { error: sendError } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [lead.email],
        subject,
        html,
      })

      if (sendError) {
        failedCount++
        await supabaseAdmin.from('broadcast_recipients').insert({
          broadcast_id: broadcastId,
          lead_id: lead.id,
          lead_name: lead.name,
          lead_email: lead.email,
          channel: 'email',
          status: 'failed',
        })
      } else {
        sentCount++
        await supabaseAdmin.from('broadcast_recipients').insert({
          broadcast_id: broadcastId,
          lead_id: lead.id,
          lead_name: lead.name,
          lead_email: lead.email,
          channel: 'email',
          status: 'sent',
        })
      }
    }

    // 4. WhatsApp channel — generate wa.me links for leads with phone-like UIDs
    if (channels.includes('whatsapp') && lead.uid) {
      // Check if UID looks like a phone number (digits, optional leading +, at least 7 digits)
      const cleaned = lead.uid.replace(/[\s\-()]/g, '')
      if (/^\+?\d{7,15}$/.test(cleaned)) {
        const phoneDigits = cleaned.replace(/^\+/, '')
        const firstName = lead.name ? lead.name.split(' ')[0] : 'there'

        const whatsappMessage = message
          .replace(/\{first_name\}/g, firstName)
          .replace(/\{landing_page_url\}/g, landingPageUrl)
          .replace(/\{referral_link\}/g, distributorReferralLink || '')

        const encodedMessage = encodeURIComponent(whatsappMessage)
        whatsappLinks.push({
          name: lead.name || 'Unknown',
          url: `https://wa.me/${phoneDigits}?text=${encodedMessage}`,
        })
      }
    }

    // 5. Telegram channel — coming soon
  }

  // 6. Update broadcast record with final status
  await supabaseAdmin
    .from('broadcasts')
    .update({
      status: 'sent',
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    })
    .eq('id', broadcastId)

  // 7. Return results
  return NextResponse.json({
    success: true,
    sentCount,
    failedCount,
    whatsappLinks,
    telegram: channels.includes('telegram') ? 'coming soon' : undefined,
  })
}
