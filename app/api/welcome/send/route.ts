import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { signWelcomeToken } from '@/lib/welcome-token'
import { buildWelcomeEmail } from '@/lib/emails/welcome'

// Send the new-flow welcome email. Designed to be called by the
// 1moveacademy.com marketing site immediately after it inserts its
// lead row (the lead-form submit endpoint lives in that other repo,
// so it POSTs to this URL after the row is created).
//
// Body: { email: string, leadId: string }
// Auth: shared WELCOME_TOKEN_SECRET as the Bearer token (same secret
// used to sign the link). The marketing site already needs this
// secret to call here; using it as auth avoids spinning up a separate
// "client API key" for one consumer.
//
// On success returns { sent: true }. Failures never leak Resend
// internals to the caller — they log here and return a 502.
//
// NOTE: from-address is richard@send.1moveacademy.com. The Resend
// account must have send.1moveacademy.com verified (SPF + DKIM) for
// this to succeed. Until that's set up, sends will fail.

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  const secret = process.env.WELCOME_TOKEN_SECRET || ''
  if (!secret || secret.length < 32) {
    console.error('[welcome/send] WELCOME_TOKEN_SECRET missing or too short')
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }
  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { email?: unknown; leadId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : ''
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
  }

  let kingdomUrl: string
  let unsubscribeUrl: string
  try {
    const welcomeToken = signWelcomeToken(email, leadId)
    kingdomUrl = `https://unlock.1moveacademy.com/?t=${encodeURIComponent(welcomeToken)}`
    unsubscribeUrl = `https://1moveacademy.com/unsubscribe?token=${encodeURIComponent(welcomeToken)}`
  } catch (err) {
    console.error('[welcome/send] sign failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('[welcome/send] RESEND_API_KEY missing')
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const { html, text } = buildWelcomeEmail({ kingdomUrl, unsubscribeUrl })

  try {
    const { error: sendErr } = await resend.emails.send({
      from: 'Richard from 1Move <richard@send.1moveacademy.com>',
      replyTo: 'richard@1moveacademy.com',
      to: [email],
      subject: 'Welcome to 1Move — one step left',
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@1moveacademy.com>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'campaign', value: 'welcome-v2' },
        { name: 'flow', value: 'unlock' },
      ],
    })

    if (sendErr) {
      console.error('[welcome/send] resend error:', sendErr.message)
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 })
    }
  } catch (err) {
    console.error('[welcome/send] unexpected error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 })
  }

  console.info(`[welcome/send] sent leadId=${leadId} siteRedirect=${SITE_URL}`)
  return NextResponse.json({
    sent: true,
    // The marketing site uses this to send the lead to PU Prime after
    // submit. TODO: switch this to a per-IB partner link when the
    // 1moveacademy.com form starts capturing an IB code.
    redirectTo: process.env.PUPRIME_PARTNER_LINK || 'https://puprime.com/',
  })
}
