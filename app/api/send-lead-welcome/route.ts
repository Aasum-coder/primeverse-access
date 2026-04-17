import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildLeadWelcomeEmail } from '@/lib/email-templates/lead-welcome'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  const { leadName, leadEmail, distributorName, distributorSlug, language, leadId, distributorId } = await request.json()

  if (!leadEmail || !distributorId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch distributor's referral link
  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('referral_link, email, name')
    .eq('id', distributorId)
    .maybeSingle()

  const referralLink = dist?.referral_link || 'https://puvip.co/la-partners/Primesync'

  // 1. Send welcome email to the lead
  try {
    const { html, subject } = buildLeadWelcomeEmail({
      leadName: leadName || '',
      distributorName: distributorName || dist?.name || distributorSlug || 'your representative',
      referralLink,
      lang: language || 'en',
    })

    const { error: sendErr } = await resend.emails.send({
      from: '1Move Academy <noreply@primeverseaccess.com>',
      to: [leadEmail],
      subject,
      html,
    })

    if (sendErr) {
      console.error('[send-lead-welcome] Failed to send to lead:', sendErr)
    } else {
      await supabaseAdmin.from('email_sends').insert({
        user_id: distributorId,
        email_type: 'lead_welcome',
      }).then(() => {}, () => {})
    }
  } catch (err) {
    console.error('[send-lead-welcome] Email send error:', err)
  }

  // 2. Send notification to the IB (distributor)
  if (dist?.email) {
    try {
      await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [dist.email],
        subject: 'New lead registered on your page 🎯',
        html: `<div style="font-family:sans-serif;max-width:500px;padding:24px;color:#e0e0e0;background:#16213E;border-radius:8px;">
          <h2 style="color:#D4A843;margin:0 0 12px;">New lead registered 🎯</h2>
          <p style="margin:0 0 8px;"><strong>${leadName || 'A new lead'}</strong> just registered on your landing page.</p>
          <p style="margin:0 0 16px;color:#999;">Log in to SYSTM8 to follow up.</p>
          <a href="https://www.primeverseaccess.com" style="display:inline-block;background:#D4A843;color:#1A1A2E;padding:10px 24px;font-weight:700;text-decoration:none;border-radius:4px;">Open Dashboard →</a>
        </div>`,
      })

      await supabaseAdmin.from('email_sends').insert({
        user_id: distributorId,
        email_type: 'new_lead_alert',
      }).then(() => {}, () => {})
    } catch (err) {
      console.error('[send-lead-welcome] IB notification error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
