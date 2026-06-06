import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWelcomeToken } from '@/lib/welcome-token'
import { verifyPuPrimeClient } from '@/lib/puprime/verify'

// New-flow UID verifier. Called by the unlock mini-app at
// unlock.1moveacademy.com after the lead pastes their PU Prime UID.
//
// Steps:
//   1. Validate { uid, token } shape
//   2. Verify the HMAC-signed welcome token (extracts email + leadId)
//   3. Call the PU Prime Identity Gateway via the existing
//      lib/puprime/verify.ts helper (reads PU_PRIME_API_KEY +
//      PU_PRIME_GATEWAY_URL — same pattern the old verify-uid route uses)
//   4. On granted: stamp the lead row (using the real schema columns —
//      uid_verified, uid_verified_at, verification_source, uid — not
//      the spec's invented column names)
//   5. Trigger the verified-access email by inlining the same
//      Telegram-link + buildVerifiedAccessEmail + Resend POST sequence
//      the old /api/leads/verify-uid route uses, so we reuse the
//      access-email template without modifying it.
//
// Idempotent: if the lead is already verified we return success
// without re-sending the access email (gated on
// verified_access_email_sent_at).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  let body: { uid?: unknown; token?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const uidNum =
    typeof body.uid === 'number'
      ? body.uid
      : Number(String(body.uid ?? '').trim())
  if (!Number.isInteger(uidNum) || uidNum <= 0) {
    return NextResponse.json({ error: 'Invalid UID — must be a positive whole number' }, { status: 400 })
  }

  const payload = verifyWelcomeToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'Token expired or invalid. Please request a new welcome email.' },
      { status: 401 },
    )
  }

  const result = await verifyPuPrimeClient(payload.email, uidNum)

  if (!result.granted) {
    console.warn(`[welcome/verify] gateway denied email=${payload.email} reason=${result.reason}`)
    return NextResponse.json(
      { error: "We couldn't match this UID with your email at PU Prime. Please double-check both." },
      { status: 400 },
    )
  }

  // Look up the lead by id (preferred) AND by email match as a safety
  // net — if leadId is stale, the email is the strong identifier.
  const { data: lead, error: lookupErr } = await supabaseAdmin
    .from('leads')
    .select('id, email, uid_verified, verified_access_email_sent_at, name')
    .or(`id.eq.${payload.leadId},email.eq.${payload.email}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupErr || !lead) {
    console.error(
      `[welcome/verify] lead lookup failed leadId=${payload.leadId} email=${payload.email}: ${lookupErr?.message ?? 'no row'}`,
    )
    return NextResponse.json(
      { error: "We couldn't find your signup record. Please contact support." },
      { status: 404 },
    )
  }

  // Idempotent stamp — uses the REAL schema columns:
  //   uid_verified (bool), uid_verified_at (ts), verification_source (text), uid (text)
  // NOT the spec's invented is_verified/verified_at/verified_via/puprime_uid.
  const nowIso = new Date().toISOString()
  const { error: updErr } = await supabaseAdmin
    .from('leads')
    .update({
      uid: String(uidNum),
      uid_verified: true,
      uid_verified_at: nowIso,
      verification_source: 'puprime_api',
      verification_reason: null,
    })
    .eq('id', lead.id)

  if (updErr) {
    console.error(`[welcome/verify] lead update failed leadId=${lead.id}: ${updErr.message}`)
    // Don't fail the user — they ARE verified per PU Prime. Surface success.
  }

  // Trigger the verified-access email exactly the way the existing
  // /api/leads/verify-uid route does — Telegram link token + email POST.
  // Idempotent on verified_access_email_sent_at so reload-of-success
  // doesn't double-send.
  if (lead.verified_access_email_sent_at) {
    console.info(`[welcome/verify] access-email already sent leadId=${lead.id} — skipping`)
    return NextResponse.json({ success: true, alreadySent: true })
  }

  try {
    const { generateTelegramLinkToken, telegramLinkTokenExpiryFromNow, buildTelegramDeepLink } =
      await import('@/lib/leads/telegram-link')
    const { buildVerifiedAccessEmail } = await import('@/lib/email-templates/verified-access')

    const tgToken = generateTelegramLinkToken()
    const tgExpiry = telegramLinkTokenExpiryFromNow()

    const { error: tgUpdErr } = await supabaseAdmin
      .from('leads')
      .update({
        telegram_link_token: tgToken,
        telegram_link_token_expires_at: tgExpiry,
      })
      .eq('id', lead.id)
    if (tgUpdErr) {
      console.error(`[welcome/verify] telegram token persist failed leadId=${lead.id}: ${tgUpdErr.message}`)
    }

    // UPSERT to bot_verified_users so the lead is auto-approved if they
    // skip the deep-link and just enter their UID in the bot.
    const nameParts = (lead.name || '').split(' ')
    const { error: bvErr } = await supabaseAdmin
      .from('bot_verified_users')
      .upsert(
        {
          uid: String(uidNum),
          email: lead.email,
          first_name: nameParts[0] || null,
          last_name: nameParts.slice(1).join(' ') || null,
          member_status: 'approved',
          source: 'systm8_lead',
          source_detail: 'unlock flow, UID verified',
          systm8_lead_id: lead.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'uid' },
      )
    if (bvErr) {
      console.error(`[welcome/verify] bot_verified_users upsert failed leadId=${lead.id}: ${bvErr.message}`)
    }

    const { subject, html } = buildVerifiedAccessEmail({
      name: lead.name || '',
      telegramDeepLink: buildTelegramDeepLink(tgToken),
    })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn(`[welcome/verify] RESEND_API_KEY missing; access-email not sent leadId=${lead.id}`)
    } else {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject,
          html,
        }),
      })

      if (!resendRes.ok) {
        const errText = await resendRes.text().catch(() => 'unknown')
        console.error(
          `[welcome/verify] access-email failed leadId=${lead.id} status=${resendRes.status} body=${errText.slice(0, 200)}`,
        )
      } else {
        await supabaseAdmin
          .from('leads')
          .update({ verified_access_email_sent_at: new Date().toISOString() })
          .eq('id', lead.id)
        console.info(`[welcome/verify] access-email sent leadId=${lead.id}`)
      }
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown'
    console.error(`[welcome/verify] post-verify side-effects failed leadId=${lead.id}: ${reason}`)
  }

  return NextResponse.json({ success: true })
}
