import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'
const ZOOM_LINK = 'https://us06web.zoom.us/j/82831643072'
const GCAL_LINK = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=SYSTM8+Launch+Call&dates=20260323T190000Z/20260323T200000Z&details=Join+here:+https://us06web.zoom.us/j/82831643072'
const EVENT_PAGE = 'https://www.primeverseaccess.com/event/systm8-lauch-call'
const EVENT_ID = '91b4982d-243f-4401-a054-81d4b72faeaf'

const UNSUBSCRIBE_FOOTER = `<p style="text-align:center;font-size:10px;color:#3a3630;margin-top:16px;line-height:1.5;">You received this email because you registered on primeverseaccess.com.<br/>To unsubscribe, reply with 'unsubscribe' in the subject line.</p>`

function goldButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;margin:8px 0;">${text}</a>`
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      ${content}
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
    ${UNSUBSCRIBE_FOOTER}
  </div>
</body></html>`
}

function buildRegistrantEmail(name: string): string {
  return emailWrapper(`
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">We start at 8PM sharp CET</h1>
    <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
      Hey ${name || 'there'},
    </p>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
      The <strong style="color:#d4a537;">SYSTM8 Launch Call</strong> is <strong style="color:#d4a537;">tonight</strong>. Don't miss it!
    </p>
    <p style="margin:0 0 16px;">
      ${goldButton('Join Call \u2192', ZOOM_LINK)}
    </p>
    <p style="margin:0 0 24px;">
      ${goldButton('\uD83D\uDCC5 Add to Calendar', GCAL_LINK)}
    </p>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0;">
      See you tonight \uD83D\uDE80 &mdash; The 1Move Team
    </p>
  `)
}

function buildRegistrantText(name: string): string {
  return `Hey ${name || 'there'},

The SYSTM8 Launch Call is tonight. We start at 8PM sharp CET. Don't miss it!

Join Call: ${ZOOM_LINK}
Add to Calendar: ${GCAL_LINK}

See you tonight — The 1Move Team

You received this email because you registered on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`
}

function buildIBEmail(name: string): string {
  return emailWrapper(`
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">We start at 8PM sharp CET</h1>
    <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
      Hey ${name || 'there'},
    </p>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
      The <strong style="color:#d4a537;">SYSTM8 Launch Call</strong> is <strong style="color:#d4a537;">tonight</strong>. Make sure you're ready.
    </p>
    <p style="margin:0 0 16px;">
      ${goldButton('Join Call \u2192', ZOOM_LINK)}
    </p>
    <p style="margin:0 0 24px;">
      ${goldButton('\uD83D\uDCC5 Add to Calendar', GCAL_LINK)}
    </p>
    <div style="height:1px;background:rgba(212,165,55,0.15);margin:24px 0;"></div>
    <p style="font-size:15px;color:#f0e6d0;line-height:1.7;margin:0 0 8px;">
      <strong style="color:#d4a537;">Share this with your organisation:</strong>
    </p>
    <p style="font-size:14px;color:#9a917e;line-height:1.7;margin:0 0 16px;">
      Make sure everyone from your team joins tonight. Forward this or share the link directly.
    </p>
    <p style="margin:0 0 24px;">
      ${goldButton('Share Event Page', EVENT_PAGE)}
    </p>
    <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0;">
      See you tonight \uD83D\uDE80 &mdash; The 1Move Team
    </p>
  `)
}

function buildIBText(name: string): string {
  return `Hey ${name || 'there'},

The SYSTM8 Launch Call is tonight. We start at 8PM sharp CET. Make sure you're ready.

Join Call: ${ZOOM_LINK}
Add to Calendar: ${GCAL_LINK}

Share this with your organisation:
Make sure everyone from your team joins tonight. Forward this or share the link directly.
Event Page: ${EVENT_PAGE}

See you tonight — The 1Move Team

You received this email because you registered on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`
}

export async function POST(request: Request) {
  // Bearer token auth
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (token !== 'systm8-triage-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const errors: string[] = []

  try {
    // ── 1. Send reminder to all event registrants ──
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('email, full_name')
      .eq('event_id', EVENT_ID)
      .neq('status', 'rejected')

    if (regError) {
      return NextResponse.json({ error: 'Failed to fetch registrations: ' + regError.message }, { status: 500 })
    }

    let registrants_sent = 0

    for (const reg of registrations || []) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [reg.email],
          subject: 'Today — SYSTM8 Launch Call starts 8PM CET \uD83D\uDD14',
          html: buildRegistrantEmail(reg.full_name || ''),
          text: buildRegistrantText(reg.full_name || ''),
          headers: {
            'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        })

        if (sendError) {
          errors.push(`registrant ${reg.email}: ${sendError.message}`)
        } else {
          registrants_sent++
        }
      } catch (err: any) {
        errors.push(`registrant ${reg.email}: ${err?.message || 'Unknown error'}`)
      }
    }

    // ── 2. Send IB invite emails to approved distributors ──
    const { data: distributors, error: distError } = await supabase
      .from('distributors')
      .select('email, name')
      .eq('ib_status', 'approved')

    if (distError) {
      errors.push('Failed to fetch distributors: ' + distError.message)
      return NextResponse.json({ registrants_sent, ibs_sent: 0, errors })
    }

    let ibs_sent = 0

    for (const dist of distributors || []) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [dist.email],
          subject: 'Tonight — invite your whole team \uD83C\uDFC6',
          html: buildIBEmail(dist.name || ''),
          text: buildIBText(dist.name || ''),
          headers: {
            'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        })

        if (sendError) {
          errors.push(`ib ${dist.email}: ${sendError.message}`)
        } else {
          ibs_sent++
        }
      } catch (err: any) {
        errors.push(`ib ${dist.email}: ${err?.message || 'Unknown error'}`)
      }
    }

    return NextResponse.json({ registrants_sent, ibs_sent, errors })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
