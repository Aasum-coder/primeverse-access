import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { signWelcomeToken } from '@/lib/welcome-token'
import { buildWelcomeEmail } from '@/lib/emails/welcome'

// Send the new-flow welcome email. Designed to be called by the
// 1moveacademy.com marketing site immediately after it inserts its
// lead row (the lead-form submit endpoint lives in that other repo,
// so it POSTs to this URL after the row is created).
//
// Body: { email: string, leadId: string, ib: string }
//   ib = the IB's `distributors.slug` — the same public identifier
//   used by primeverseaccess.com/<slug> landing pages today. The
//   marketing site reads it from its own URL (e.g. 1moveacademy.com/?ib=<slug>)
//   so each IB's share link funnels to that IB.
//
// Auth: shared WELCOME_TOKEN_SECRET as the Bearer token (same secret
// used to sign the link). The marketing site already needs this
// secret to call here; using it as auth avoids spinning up a separate
// "client API key" for one consumer.
//
// Attribution rules (loud failure — no silent fallback):
//   - `ib` slug must resolve to an existing distributor row.
//   - That row's `referral_link` must be non-empty.
//   - Otherwise return 400. Routing traffic to the wrong IB's link is
//     worse than asking the marketing site to retry.
//
// On success returns { sent: true, redirectTo: <IB's referral_link> }
// so the marketing site can window.location.href the lead onward to
// PU Prime. Failures don't leak Resend internals — they log here and
// return a 502.
//
// NOTE: from-address is richard@send.1moveacademy.com. The Resend
// account must have send.1moveacademy.com verified (SPF + DKIM) for
// this to succeed. Until that's set up, sends will fail.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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

  let body: { email?: unknown; leadId?: unknown; ib?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : ''
  const ib = typeof body.ib === 'string' ? body.ib : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
  }
  if (!ib.trim()) {
    return NextResponse.json({ error: 'Missing ib' }, { status: 400 })
  }

  // Normalize the slug before DB lookup — distributor slugs are stored
  // lowercase (the dashboard input strips uppercase) and untrimmed
  // whitespace shouldn't be possible but we guard for it anyway.
  const ibNormalized = ib.toLowerCase().trim()

  const { data: distributor, error: distErr } = await supabaseAdmin
    .from('distributors')
    .select('id, referral_link, name, slug')
    .eq('slug', ibNormalized)
    .maybeSingle()

  if (distErr) {
    console.error(`[welcome/send] distributor lookup failed ib=${ibNormalized}: ${distErr.message}`)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  // Validation order per spec:
  //   1. distributor null  → 400 ib_not_found
  //   2. referral_link null/empty → 400 missing_partner_link
  if (!distributor) {
    console.warn(`[welcome/send] 400 ib_not_found ib=${ibNormalized}`)
    return NextResponse.json(
      { error: 'IB not found', ib: ibNormalized },
      { status: 400 },
    )
  }

  if (!distributor.referral_link || !distributor.referral_link.trim()) {
    console.warn(
      `[welcome/send] 400 missing_partner_link ib=${ibNormalized} distributorId=${distributor.id}`,
    )
    return NextResponse.json(
      {
        error:
          'IB has no PU Prime partner link configured. Please ask the IB to save their referral link in My Profile.',
        distributorId: distributor.id,
      },
      { status: 400 },
    )
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

  console.info(
    `[welcome/send] sent leadId=${leadId} ib=${ibNormalized} distributorId=${distributor.id}`,
  )
  return NextResponse.json({
    sent: true,
    redirectTo: distributor.referral_link,
  })
}
