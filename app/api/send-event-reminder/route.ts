import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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

function buildReminderEmail(full_name: string, event_title: string, zoom_link: string | null, event_date: string | null): string {
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
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">Reminder: Tomorrow! ⏰</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
        Hey ${full_name || 'there'},
      </p>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
        Just a friendly reminder — <strong style="color:#d4a537;">${event_title}</strong> is happening <strong style="color:#d4a537;">tomorrow</strong>! Make sure you're ready to join.
      </p>
      ${dateBlock}
      ${zoomButton}
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:24px 0 0;">
        See you there! 🚀
      </p>
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

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { event_id, secret } = body

  if (secret !== 'systm8-reminder-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!event_id) {
    return NextResponse.json({ error: 'Missing required field: event_id' }, { status: 400 })
  }

  try {
    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, event_date, zoom_link')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Fetch all approved registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('email, full_name')
      .eq('event_id', event_id)
      .eq('status', 'approved')

    if (regError) {
      console.error('[send-event-reminder] Registration fetch error:', regError)
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ sent: 0, errors: 0 })
    }

    // Build ICS attachment
    const attachments: { filename: string; content: string }[] = []
    if (event.event_date) {
      const icsContent = buildICSContent(event.title, event.event_date, event.zoom_link || null)
      const base64IcsContent = Buffer.from(icsContent).toString('base64')
      attachments.push({ filename: 'SYSTM8-Launch-Call.ics', content: base64IcsContent })
    }

    let sent = 0
    let errors = 0

    // Send one email per registrant
    for (const reg of registrations) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [reg.email],
          subject: '\u23F0 Reminder: SYSTM8 Launch Call \u2014 Tomorrow, Monday 23 March at 20:00 CET',
          html: buildReminderEmail(reg.full_name || '', event.title, event.zoom_link || null, event.event_date || null),
          attachments,
        })

        if (sendError) {
          console.error(`[send-event-reminder] Failed to send to ${reg.email}:`, sendError)
          errors++
        } else {
          sent++
        }
      } catch (err) {
        console.error(`[send-event-reminder] Exception sending to ${reg.email}:`, err)
        errors++
      }
    }

    return NextResponse.json({ sent, errors })
  } catch (err: any) {
    console.error('[send-event-reminder] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send reminders' }, { status: 500 })
  }
}
