import crypto from 'crypto'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const UNSUBSCRIBE_FOOTER = `<p style="text-align:center;font-size:10px;color:#3a3630;margin-top:16px;line-height:1.5;">You received this email because you registered on primeverseaccess.com.<br/>To unsubscribe, reply with 'unsubscribe' in the subject line.</p>`

function darkPage(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:480px;margin:60px auto;padding:40px 24px;text-align:center;">
    <img src="${SYSTM8_LOGO}" alt="1Move" width="64" height="64" style="border-radius:50%;border:2px solid #d4a537;margin:0 auto 24px;" />
    ${content}
    <p style="font-size:11px;color:#5a5347;margin-top:32px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
  </div>
</body></html>`
}

function verifyToken(leadId: string, token: string): boolean {
  const expected = crypto.createHash('sha256')
    .update(leadId + (process.env.TRIAGE_SECRET || ''))
    .digest('hex')
  return token === expected
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get('lead_id') || ''
  const token = searchParams.get('token') || ''

  if (!leadId || !token || !verifyToken(leadId, token)) {
    return new Response(
      darkPage(`
        <h1 style="font-family:Georgia,serif;font-size:22px;color:#d44a37;margin:0 0 12px;">Invalid or expired link</h1>
        <p style="font-size:14px;color:#9a917e;line-height:1.7;">This disapproval link is invalid or has already been used. Please log in to your dashboard to manage leads.</p>
        <a href="https://www.primeverseaccess.com" style="display:inline-block;margin-top:20px;padding:12px 32px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
      `),
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Fetch the lead to get their email
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, name, email, uid_verified')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    return new Response(
      darkPage(`
        <h1 style="font-family:Georgia,serif;font-size:22px;color:#d44a37;margin:0 0 12px;">Lead not found</h1>
        <p style="font-size:14px;color:#9a917e;line-height:1.7;">This lead could not be found in our records.</p>
        <a href="https://www.primeverseaccess.com" style="display:inline-block;margin-top:20px;padding:12px 32px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
      `),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Update leads table: mark as rejected
  await supabase
    .from('leads')
    .update({ uid_verified: false })
    .eq('id', leadId)

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
  }

  return new Response(
    darkPage(`
      <div style="width:56px;height:56px;background:linear-gradient(135deg,#2d7a3a,#3d9e4e);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <span style="font-size:28px;color:#fff;">✓</span>
      </div>
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#f0e6d0;margin:0 0 12px;">Lead disapproved</h1>
      <p style="font-size:14px;color:#9a917e;line-height:1.7;">Verification rejection email sent to <strong style="color:#d4a537;">${lead.email}</strong>.</p>
      <a href="https://www.primeverseaccess.com" style="display:inline-block;margin-top:20px;padding:12px 32px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;">Back to Dashboard</a>
    `),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
