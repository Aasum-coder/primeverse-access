import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { baseEmailTemplate } from '@/lib/email-templates/base'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const leadSubjects: Record<string, string> = {
  en: "You're registered — here's what happens next",
  no: 'Du er registrert — her er hva som skjer nå',
  sv: 'Du är registrerad — här är vad som händer härnäst',
  es: 'Estás registrado — aquí está lo que sucede',
  ru: 'Вы зарегистрированы — вот что будет дальше',
  ar: 'تم تسجيلك — إليك ما سيحدث بعد ذلك',
  tl: 'Nairehistro ka na — narito ang susunod',
  pt: 'Você está registrado — veja o que acontece',
  th: 'คุณได้ลงทะเบียนแล้ว — นี่คือสิ่งที่จะเกิดขึ้น',
}

function buildLeadWelcomeHtml(leadName: string, distributorName: string, referralLink: string) {
  const firstName = leadName.split(' ')[0] || leadName || 'there'
  const content = `
    <h1 style="color:#D4A843;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;">
      You're registered ✓
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${firstName},</p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">You've taken the first step.</p>
    <p style="color:#D4A843;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px;">Here's what happens next:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr><td style="padding:14px 16px;background:#1A1A2E;border-left:3px solid #D4A843;border-radius:0 6px 6px 0;">
        <div style="color:#D4A843;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 1 — Register with our broker partner</div>
        <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">Use the link below to open your trading account. It takes less than 5 minutes.</p>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr><td align="center" style="border-radius:6px;background-color:#D4A843;">
        <a href="${referralLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#1A1A2E;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Open Trading Account &rarr;</a>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr><td style="padding:14px 16px;background:#1A1A2E;border-left:3px solid #888;border-radius:0 6px 6px 0;">
        <div style="color:#aaa;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 2 — Submit your UID</div>
        <p style="color:#999;font-size:14px;line-height:1.5;margin:0;">Once registered, come back and submit your account ID (UID) to get verified.</p>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td style="padding:14px 16px;background:#1A1A2E;border-left:3px solid #555;border-radius:0 6px 6px 0;">
        <div style="color:#888;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 3 — Get access</div>
        <p style="color:#777;font-size:14px;line-height:1.5;margin:0;">After verification you get full access to Primeverse — live trading, signals, and community.</p>
      </td></tr>
    </table>

    <div style="border-top:1px solid rgba(212,168,67,0.2);padding-top:20px;margin-top:8px;">
      <p style="color:#999;font-size:13px;line-height:1.5;margin:0 0 4px;">Any questions? Contact <strong style="color:#D4A843;">${distributorName}</strong>.</p>
      <p style="color:#888;font-size:13px;line-height:1.5;margin:0;text-align:center;font-style:italic;margin-top:16px;">People Before Profit.</p>
    </div>
  `
  return baseEmailTemplate({ content, previewText: "You're registered — here's what happens next" })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, leadName, leadEmail, distributorName, distributorEmail, referralLink, language, distributorId } = body

  if (type === 'new_registration') {
    // 1. Send notification to IB (existing behavior)
    try {
      await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [distributorEmail],
        subject: 'New member waiting for verification: ' + leadName,
        html: '<h2>New lead registered</h2><p><strong>Name:</strong> ' + leadName + '</p><p><strong>Email:</strong> ' + leadEmail + '</p><p>Log in to your dashboard to verify.</p>',
      })
    } catch (err) {
      console.error('[send-lead-email] IB notification failed:', err)
    }

    // 2. Send welcome email to the LEAD (new behavior)
    if (leadEmail) {
      try {
        const lang = language || 'en'
        const refLink = referralLink || 'https://puvip.co/la-partners/Primesync'
        const distName = distributorName || 'your representative'

        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [leadEmail],
          subject: leadSubjects[lang] || leadSubjects.en,
          html: buildLeadWelcomeHtml(leadName || '', distName, refLink),
        })

        if (distributorId) {
          await supabaseAdmin.from('email_sends').insert({
            user_id: distributorId,
            email_type: 'lead_welcome',
          }).then(() => {}, () => {})
        }

        console.log('[send-lead-email] Welcome email sent to lead:', leadEmail)
      } catch (err) {
        console.error('[send-lead-email] Lead welcome email failed:', err)
      }
    }

    return NextResponse.json({ success: true })
  }

  if (type === 'approved') {
    const p = ['<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">', '<h2>Congratulations ' + leadName + '!</h2>', '<p>You have just created your PuPrime account. You now have free access to the entire Primeverse ecosystem with zero costs.</p>', '<p>You registered through <strong>' + distributorName + '</strong>, your dedicated 1Move Academy representative.</p>', '<p><a href="https://prime-verse.mn.co/plans/1906703?bundle_token=6c6c008ec8cbb18334044f843d884087&utm_source=manual" style="display:inline-block;background:#c9a84c;color:#000;padding:14px 32px;font-weight:700;text-decoration:none;border-radius:4px;margin:16px 0">Access Primeverse Now</a></p>', '<h3>Here is what you get access to:</h3>', '<p><strong>1. Trade Alerts</strong> - Signals in multiple languages.</p>', '<p><strong>2. Live Trading Sessions</strong> - Learn from professionals live.</p>', '<p><strong>3. Prerecorded Education Classes</strong> - Lessons available anytime.</p>', '<p><strong>4. Zonar</strong> - Smart Money Concept scanner.</p>', '<p><strong>5. Syphon AI</strong> - Automate your capital.</p>', '<p><strong>6. Oracle</strong> - Track your trades.</p>', '<p><strong>7. Traverse</strong> - Free hotel rooms platform.</p>', '<p><strong>8. Finance Planning</strong> - Build real wealth.</p>', '<p><strong>9. Social Media Academy</strong> - Grow your presence.</p>', '<p><strong>10. PrimeFit</strong> - Health education.</p>', '<p style="color:#888;font-size:13px;margin-top:24px">Not all services are active yet. Your UID from PuPrime is required to unlock the full platform.</p>', '<p style="color:#888;font-size:13px">Sent by ' + distributorName + ' via 1Move Academy</p>', '</div>']
    await resend.emails.send({ from: '1Move Academy <noreply@primeverseaccess.com>', to: [leadEmail], subject: 'Congratulations - Welcome to PrimeVerse!', html: p.join('') })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
