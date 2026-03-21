import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

function buildICSContent(event_title: string, event_date: string, zoom_link: string | null): string {
  const start = new Date(event_date)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SYSTM8//PrimeverseAccess//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event_title}`,
    `LOCATION:${zoom_link || ''}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Event starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function formatEventDateCET(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const formatted = d.toLocaleString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'
  })
  return formatted
}

function buildEventApprovalEmail(full_name: string, event_title: string, zoom_link: string | null, event_date: string | null): string {
  const zoomButton = zoom_link
    ? `<a href="${zoom_link}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;">JOIN ZOOM CALL</a>`
    : '<p style="font-size:13px;color:#9a917e;">The meeting link will be shared closer to the event date.</p>'

  const dateBlock = event_date
    ? `<p style="font-size:15px;color:#d4a537;line-height:1.7;margin:0 0 20px;">📅 ${formatEventDateCET(event_date)} — CET (Central European Time)</p>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">You're Approved! 🎉</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
        Hey ${full_name || 'there'},
      </p>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
        Your registration for <strong style="color:#d4a537;">${event_title}</strong> has been approved! You're all set to join.
      </p>
      ${dateBlock}
      ${zoomButton}
      <p style="font-size:12px;color:#5a5347;margin-top:24px;line-height:1.6;">
        Need help? Contact your team leader or use the Report feature in your dashboard.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
  </div>
</body></html>`
}

function buildEventRejectionEmail(full_name: string, event_title: string, status_note: string | null): string {
  const reasonBlock = status_note
    ? `<div style="background:rgba(212,165,55,0.06);border:1px solid rgba(212,165,55,0.15);border-radius:8px;padding:16px;margin:16px 0;">
        <p style="font-size:13px;color:#9a917e;margin:0;"><strong style="color:#d4a537;">Reason:</strong> ${status_note}</p>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">Registration Update</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 16px;">
        Hey ${full_name || 'there'},<br/><br/>
        We've reviewed your registration for <strong style="color:#d4a537;">${event_title}</strong> and unfortunately it was <strong style="color:#d4a537;">not approved</strong> at this time.
      </p>
      ${reasonBlock}
      <p style="font-size:14px;color:#9a917e;line-height:1.7;margin:16px 0 0;">
        Contact your team leader if you have questions.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
  </div>
</body></html>`
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, full_name, event_title, zoom_link, status, status_note, event_date } = body

  if (!email || !event_title || !status) {
    return NextResponse.json({ error: 'Missing required fields: email, event_title, status' }, { status: 400 })
  }

  try {
    if (status === 'approved') {
      const attachments: { filename: string; content: string }[] = []
      if (event_date) {
        const icsContent = buildICSContent(event_title, event_date, zoom_link || null)
        const base64IcsContent = Buffer.from(icsContent).toString('base64')
        attachments.push({ filename: 'SYSTM8-Launch-Call.ics', content: base64IcsContent })
      }
      const { error } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [email],
        subject: `You're in! ${event_title} — Access Details Inside`,
        html: buildEventApprovalEmail(full_name || '', event_title, zoom_link || null, event_date || null),
        attachments,
      })
      if (error) {
        console.error('[send-event-approval] Resend error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (status === 'rejected') {
      const { error } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [email],
        subject: `Update on your ${event_title} registration`,
        html: buildEventRejectionEmail(full_name || '', event_title, status_note || null),
      })
      if (error) {
        console.error('[send-event-approval] Resend error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid status. Must be "approved" or "rejected".' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[send-event-approval] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send email' }, { status: 500 })
  }
}
