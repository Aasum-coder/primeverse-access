import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const UNSUBSCRIBE_FOOTER = `<p style="text-align:center;font-size:10px;color:#3a3630;margin-top:16px;line-height:1.5;">You received this email because you registered on primeverseaccess.com.<br/>To unsubscribe, reply with 'unsubscribe' in the subject line.</p>`

export async function POST(request: Request) {
  try {
    const { name, email, event_title, zoom_link, event_date } = await request.json()

    if (!email || !event_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const displayName = name || 'there'
    const formattedDate = event_date
      ? new Date(event_date).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })
      : ''

    // Build Google Calendar link
    let gcalLink = ''
    if (event_date) {
      const start = new Date(event_date)
      const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour default
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event_title)}&dates=${fmt(start)}/${fmt(end)}${zoom_link ? `&details=${encodeURIComponent('Join here: ' + zoom_link)}` : ''}`
    }

    const zoomButton = zoom_link
      ? `<p style="margin:0 0 16px;">
          <a href="${zoom_link}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;margin:8px 0;">Join Call →</a>
        </p>`
      : ''

    const calendarButton = gcalLink
      ? `<p style="margin:0 0 24px;">
          <a href="${gcalLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;margin:8px 0;">📅 Add to Calendar</a>
        </p>`
      : ''

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:26px;color:#f0e6d0;margin:0 0 8px;">You're in, ${displayName}!</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:16px;color:#d4a537;font-weight:600;margin:0 0 6px;">${event_title}</p>
      ${formattedDate ? `<p style="font-size:14px;color:#9a917e;margin:0 0 24px;">${formattedDate} CET</p>` : ''}
      ${zoomButton}
      ${calendarButton}
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0;">
        See you there 🚀 — The 1Move Team
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
    ${UNSUBSCRIBE_FOOTER}
  </div>
</body></html>`

    const text = `You're in, ${displayName}!

${event_title}
${formattedDate ? formattedDate + ' CET' : ''}
${zoom_link ? '\nJoin Call: ' + zoom_link : ''}
${gcalLink ? '\nAdd to Calendar: ' + gcalLink : ''}

See you there — The 1Move Team

You received this email because you registered on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`

    const { error: sendError } = await resend.emails.send({
      from: '1Move Academy <noreply@primeverseaccess.com>',
      to: [email],
      subject: `You're registered — ${event_title} ✅`,
      html,
      text,
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    })

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
