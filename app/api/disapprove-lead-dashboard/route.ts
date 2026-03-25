import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const UNSUBSCRIBE_FOOTER = `<p style="text-align:center;font-size:10px;color:#3a3630;margin-top:16px;line-height:1.5;">You received this email because you registered on primeverseaccess.com.<br/>To unsubscribe, reply with 'unsubscribe' in the subject line.</p>`

export async function POST(request: Request) {
  try {
    // Verify user is logged in via Authorization header
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lead_id } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })
    }

    // Fetch lead details
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, name, email')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Update lead status
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ uid_verified: false, rejected: true })
      .eq('id', lead_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update lead: ' + updateError.message }, { status: 500 })
    }

    // Send rejection email to the lead
    if (lead.email) {
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">We couldn't verify your UID</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
        Hey ${lead.name || 'there'},
      </p>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
        Unfortunately we were unable to verify the trading account UID you submitted. This can happen if the UID doesn't match our records or belongs to a different management group.
      </p>
      <p style="margin:0 0 16px;">
        <a href="https://chat.whatsapp.com/EQICXW2pgB0Ky9LRbjjod6" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;margin:8px 0;">Get Help on WhatsApp</a>
      </p>
      <p style="font-size:14px;color:#9a917e;line-height:1.7;margin:0;">
        Our support team will help you get verified &mdash; The 1Move Team
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
    ${UNSUBSCRIBE_FOOTER}
  </div>
</body></html>`

      const text = `We couldn't verify your UID

Hey ${lead.name || 'there'},

Unfortunately we were unable to verify the trading account UID you submitted. This can happen if the UID doesn't match our records or belongs to a different management group.

Get help on WhatsApp: https://chat.whatsapp.com/EQICXW2pgB0Ky9LRbjjod6

Our support team will help you get verified — The 1Move Team

You received this email because you registered on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`

      try {
        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject: 'Your UID could not be verified',
          html,
          text,
          headers: {
            'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        })
      } catch (emailErr: any) {
        console.error('[disapprove-lead-dashboard] Failed to send rejection email:', emailErr?.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[disapprove-lead-dashboard] Error:', err?.message)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
