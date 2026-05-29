import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildLeadWelcomeEmail } from '@/lib/email-templates/lead-welcome'
import { generateVerifyToken, verifyTokenExpiryFromNow } from '@/lib/leads/verify-token'
import { detectLeadLanguage, parseAcceptLanguage } from '@/lib/leads/language'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'

export async function POST(request: Request) {
  const { leadName, leadEmail, distributorName, distributorSlug, language, leadId, distributorId } = await request.json()

  if (!leadEmail || !distributorId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Lead-language priority: caller-supplied > Accept-Language > x-vercel-ip-country > en.
  // Most caller paths pass `language` already (the IB landing page picks it
  // from its own language switcher), but Accept-Language + IP country are
  // useful when a lead lands on a non-localised page.
  const acceptLang = parseAcceptLanguage(request.headers.get('accept-language'))
  const ipCountry = request.headers.get('x-vercel-ip-country')
  const browserLocale = request.headers.get('accept-language') || null
  const lang = language || acceptLang || detectLeadLanguage(acceptLang, ipCountry)

  // Fetch distributor's referral link + email
  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('referral_link, email, name')
    .eq('id', distributorId)
    .maybeSingle()

  const referralLink = dist?.referral_link || 'https://puvip.co/la-partners/Primesync'
  const ibName = distributorName || dist?.name || distributorSlug || 'your representative'

  // Wrap the broker URL through /api/track/broker-click so the first
  // click stamps leads.broker_click_at. The tracker 302s onward to the
  // dest URL so the lead still lands on PU Prime. We only wrap when
  // leadId is present (anonymous test sends still get the raw URL).
  const trackedAffiliateUrl = leadId
    ? `${APP_BASE_URL}/api/track/broker-click?lead_id=${encodeURIComponent(leadId)}&dest=${encodeURIComponent(referralLink)}`
    : referralLink

  // Generate the single-use token that gates the verify-uid + existing-
  // client flows. Stamp browser_locale so any later re-send picks the
  // same language. Also stamp the issued-at expiry.
  let uidVerifyUrl: string | undefined
  let existingClientUrl: string | undefined
  if (leadId) {
    const verifyToken = generateVerifyToken()
    const verifyTokenExpiresAt = verifyTokenExpiryFromNow()
    const { error: tokenErr } = await supabaseAdmin
      .from('leads')
      .update({
        verify_token: verifyToken,
        verify_token_expires_at: verifyTokenExpiresAt,
        browser_locale: browserLocale,
      })
      .eq('id', leadId)
    if (tokenErr) {
      console.error('[send-lead-welcome] Failed to store verify token:', tokenErr.message)
    } else {
      uidVerifyUrl = `${APP_BASE_URL}/verify-uid?token=${verifyToken}`
      existingClientUrl = `${APP_BASE_URL}/api/leads/existing-client?token=${verifyToken}`
    }
  }

  // 1. Send welcome email to the lead
  let emailSent = false
  try {
    const { html, subject } = buildLeadWelcomeEmail({
      leadName: leadName || '',
      ibName,
      ibEmail: dist?.email,
      puPrimeAffiliateUrl: trackedAffiliateUrl,
      uidVerifyUrl,
      existingClientUrl,
      lang,
    })

    // Phase A fallback per spec: send from noreply with Reply-To = IB's
    // email so replies still land in the IB's inbox without per-IB sender
    // verification (separate PR).
    const fromName = ibName.replace(/[<>"]/g, '').slice(0, 60)
    const sendStartedAt = Date.now()
    const { data: sendData, error: sendErr } = await resend.emails.send({
      from: `${fromName} <noreply@primeverseaccess.com>`,
      to: [leadEmail],
      subject,
      html,
      replyTo: dist?.email || undefined,
    })

    if (sendErr) {
      console.error('[send-lead-welcome] Failed to send to lead:', sendErr)
    } else {
      emailSent = true
      const ms = Date.now() - sendStartedAt
      console.info(`[send-lead-welcome] sent leadId=${leadId || '<none>'} resendId=${sendData?.id || '<none>'} lang=${lang} durationMs=${ms}`)
      if (leadId) {
        await supabaseAdmin
          .from('leads')
          .update({ email_1_sent_at: new Date().toISOString() })
          .eq('id', leadId)
          .then(() => {}, (err: unknown) => {
            console.error('[send-lead-welcome] email_1_sent_at update failed:', err)
          })
      }
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

  return NextResponse.json({ success: true, emailSent })
}
