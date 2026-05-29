import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildEscalationFollowupEmail } from '@/lib/email-templates/escalation-followup'

// Stale-click escalation. Finds leads who clicked the broker link more
// than 24 hours ago but haven't verified, sends them a friendly
// follow-up email (in their language), pings the admin Telegram chat
// (1688433893), and stamps escalation_sent_at so the cron never fires
// twice for the same lead.
//
// Schedule: daily 0 11 * * * UTC via vercel.json (Hobby plan rejects
// sub-daily crons). Per-run cap of 50 leads.

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'
const ADMIN_TELEGRAM_CHAT_ID = '1688433893'
const MAX_PER_RUN = 50

function safeNumber(input: unknown): number {
  const n = typeof input === 'number' ? input : 0
  return Number.isFinite(n) ? n : 0
}

function hoursSince(iso: string | null | undefined): number {
  if (!iso) return 0
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return 0
  return Math.max(0, Math.round((Date.now() - then) / (60 * 60 * 1000)))
}

async function sendAdminTelegram(payload: {
  leadName: string
  hoursAgo: number
  ibName: string
  leadEmail: string
  preferredChannel: string
}): Promise<{ ok: boolean; reason?: string }> {
  const botToken = process.env.SYSTM8_TELEGRAM_BOT_TOKEN
  if (!botToken) return { ok: false, reason: 'no_bot_token' }

  const text = [
    `⚠️ Lead "${payload.leadName}" clicked broker link ${payload.hoursAgo}h ago but hasn't verified.`,
    `IB: ${payload.ibName}`,
    `Email: ${payload.leadEmail}`,
    `Preferred channel: ${payload.preferredChannel}`,
  ].join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_CHAT_ID, text }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, reason: `http_${res.status}:${body.slice(0, 120)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Pull candidates: clicked broker link > 24h ago, not verified, never escalated.
  const { data: candidates, error: queryErr } = await supabaseAdmin
    .from('leads')
    .select('id, name, email, distributor_id, browser_locale, preferred_contact_channel, broker_click_at, verified_at, registration_status, uid_verified')
    .not('broker_click_at', 'is', null)
    .is('verified_at', null)
    .neq('registration_status', 'verified')
    .is('escalation_sent_at', null)
    .lt('broker_click_at', cutoff)
    .order('broker_click_at', { ascending: true })
    .limit(MAX_PER_RUN)

  if (queryErr) {
    console.error('[escalate-stale-clicks] candidate query failed:', queryErr.message)
    return NextResponse.json({ error: queryErr.message }, { status: 500 })
  }

  let emailSent = 0
  let telegramSent = 0
  let stampOnly = 0
  const errors: string[] = []

  // Resolve all distributors in one batch so we don't N+1 select.
  const distIds = Array.from(new Set((candidates || []).map(c => c.distributor_id).filter(Boolean)))
  const distMap = new Map<string, { id: string; name: string | null; email: string | null; referral_link: string | null }>()
  if (distIds.length > 0) {
    const { data: dists } = await supabaseAdmin
      .from('distributors')
      .select('id, name, email, referral_link')
      .in('id', distIds as string[])
    for (const d of dists || []) distMap.set(d.id, d)
  }

  for (const lead of candidates || []) {
    if (!lead.email) {
      stampOnly++
      await supabaseAdmin.from('leads').update({ escalation_sent_at: new Date().toISOString() }).eq('id', lead.id)
      continue
    }

    const dist = lead.distributor_id ? distMap.get(lead.distributor_id) : null
    const ibName = dist?.name || dist?.email?.split('@')[0] || 'your representative'
    const referralLink = dist?.referral_link || 'https://puvip.co/la-partners/Primesync'
    const trackedAffiliateUrl = `${APP_BASE_URL}/api/track/broker-click?lead_id=${encodeURIComponent(lead.id)}&dest=${encodeURIComponent(referralLink)}`

    // 1) Email follow-up to the lead in their language.
    try {
      const { html, subject } = buildEscalationFollowupEmail({
        leadName: lead.name || '',
        ibName,
        brokerLinkUrl: trackedAffiliateUrl,
        lang: lead.browser_locale || 'en',
      })
      const fromName = ibName.replace(/[<>"]/g, '').slice(0, 60)
      const { error: sendErr } = await resend.emails.send({
        from: `${fromName} <noreply@primeverseaccess.com>`,
        to: [lead.email],
        subject,
        html,
        replyTo: dist?.email || undefined,
      })
      if (sendErr) {
        errors.push(`email ${lead.email}: ${sendErr.message}`)
      } else {
        emailSent++
      }
    } catch (err) {
      errors.push(`email ${lead.email}: ${err instanceof Error ? err.message : String(err)}`)
    }

    // 2) Telegram alert to the admin chat.
    const tg = await sendAdminTelegram({
      leadName: lead.name || '(no name)',
      hoursAgo: hoursSince(lead.broker_click_at),
      ibName,
      leadEmail: lead.email,
      preferredChannel: lead.preferred_contact_channel || 'email',
    })
    if (tg.ok) telegramSent++
    else if (tg.reason && tg.reason !== 'no_bot_token') errors.push(`telegram lead=${lead.id}: ${tg.reason}`)

    // 3) Stamp escalation_sent_at so the next run skips this lead.
    const { error: stampErr } = await supabaseAdmin
      .from('leads')
      .update({ escalation_sent_at: new Date().toISOString() })
      .eq('id', lead.id)
    if (stampErr) errors.push(`stamp lead=${lead.id}: ${stampErr.message}`)
  }

  return NextResponse.json({
    candidates: safeNumber(candidates?.length),
    email_sent: emailSent,
    telegram_sent: telegramSent,
    stamp_only: stampOnly,
    errors: errors.length > 0 ? errors : undefined,
  })
}
