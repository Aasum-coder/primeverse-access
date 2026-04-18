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

    // 2. Send welcome email to the LEAD (new 3-step KYC narrative)
    if (leadEmail) {
      try {
        const { subject, html } = buildLeadWelcomeEmail({
          leadName: leadName || '',
          distributorName: distributorName || 'your representative',
          referralLink: referralLink || 'https://puvip.co/la-partners/Primesync',
          lang: language || 'en',
        })

        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [leadEmail],
          subject,
          html,
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
