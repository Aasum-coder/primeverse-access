import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNudgeEmail, IncompleteSteps, NudgeVariant } from '@/lib/email-templates/nudge'
import { buildFirstShareGuideEmail } from '@/lib/email-templates/first-share-guide'
import { buildUidReminderEmail } from '@/lib/email-templates/uid-reminder'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

// Combined email automation cron — runs every hour via Vercel cron
// Handles: profile_nudge (24h), profile_nudge_final (72h), first_share_guide (24h after page live, 0 leads)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  let nudgeSent = 0
  let shareSent = 0
  let uidSent = 0
  const errors: string[] = []

  // ─── PART 1: Profile nudge emails ────────────────────────────
  const { data: nudgeCandidates } = await supabaseAdmin
    .from('distributors')
    .select('id, user_id, name, email, referral_link, bio, profile_image, slug, language, created_at')
    .lt('created_at', twentyFourHoursAgo.toISOString())
    .or('referral_link.is.null,referral_link.eq.,bio.is.null,bio.eq.,profile_image.is.null,slug.is.null,slug.eq.')

  if (nudgeCandidates && nudgeCandidates.length > 0) {
    const nudgeIds = nudgeCandidates.map((c) => c.id)
    const { data: nudgeSends } = await supabaseAdmin
      .from('email_sends')
      .select('user_id, email_type')
      .in('user_id', nudgeIds)
      .in('email_type', ['profile_nudge', 'profile_nudge_final'])

    const nudgeSendMap = new Map<string, Set<string>>()
    for (const send of nudgeSends || []) {
      if (!nudgeSendMap.has(send.user_id)) nudgeSendMap.set(send.user_id, new Set())
      nudgeSendMap.get(send.user_id)!.add(send.email_type)
    }

    for (const dist of nudgeCandidates) {
      const sentTypes = nudgeSendMap.get(dist.id) || new Set()
      if (sentTypes.has('profile_nudge') && sentTypes.has('profile_nudge_final')) continue

      let variant: NudgeVariant
      if (!sentTypes.has('profile_nudge')) {
        variant = 'profile_nudge'
      } else if (!sentTypes.has('profile_nudge_final')) {
        const createdAt = new Date(dist.created_at)
        if (createdAt > seventyTwoHoursAgo) continue
        variant = 'profile_nudge_final'
      } else {
        continue
      }

      const incomplete: IncompleteSteps = {
        referral_link: !dist.referral_link,
        bio: !dist.bio,
        profile_image: !dist.profile_image,
        slug: !dist.slug,
      }

      const name = dist.name || dist.email?.split('@')[0] || 'there'
      const lang = dist.language || 'en'
      const { html, subject } = buildNudgeEmail({ name, incomplete, lang, variant })

      const { error: sendError } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [dist.email],
        subject,
        html,
      })

      if (sendError) {
        errors.push(`nudge ${dist.email}: ${sendError.message}`)
        continue
      }

      await supabaseAdmin.from('email_sends').insert({ user_id: dist.id, email_type: variant })
      nudgeSent++
    }
  }

  // ─── PART 2: First share guide (24h after page live, 0 leads) ────────
  // Find users with a slug (page live) created >24h ago
  const { data: shareCandidates } = await supabaseAdmin
    .from('distributors')
    .select('id, user_id, name, email, slug, language, created_at')
    .not('slug', 'is', null)
    .not('slug', 'eq', '')
    .lt('created_at', twentyFourHoursAgo.toISOString())

  if (shareCandidates && shareCandidates.length > 0) {
    const shareIds = shareCandidates.map((c) => c.id)

    // Check which have already received this email
    const { data: shareSends } = await supabaseAdmin
      .from('email_sends')
      .select('user_id')
      .in('user_id', shareIds)
      .eq('email_type', 'first_share_guide')

    const alreadySent = new Set((shareSends || []).map((s) => s.user_id))

    // Check lead counts for all candidates in one batch query
    const { data: leadCounts } = await supabaseAdmin
      .from('leads')
      .select('distributor_id')
      .in('distributor_id', shareIds)

    const leadsPerDist = new Map<string, number>()
    for (const lead of leadCounts || []) {
      leadsPerDist.set(lead.distributor_id, (leadsPerDist.get(lead.distributor_id) || 0) + 1)
    }

    for (const dist of shareCandidates) {
      if (alreadySent.has(dist.id)) continue
      const leadCount = leadsPerDist.get(dist.id) || 0
      if (leadCount > 0) continue // Has leads — doesn't need this email

      const name = dist.name || dist.email?.split('@')[0] || 'there'
      const lang = dist.language || 'en'
      const { html, subject } = buildFirstShareGuideEmail({ name, slug: dist.slug, lang })

      const { error: sendError } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [dist.email],
        subject,
        html,
      })

      if (sendError) {
        errors.push(`share ${dist.email}: ${sendError.message}`)
        continue
      }

      await supabaseAdmin.from('email_sends').insert({ user_id: dist.id, email_type: 'first_share_guide' })
      shareSent++
    }
  }

  // ─── PART 3: UID Reminder (leads with no UID for 48h+) ────────────
  // Find leads where UID is NULL/empty AND created >48h ago, group by distributor
  const { data: pendingLeads } = await supabaseAdmin
    .from('leads')
    .select('distributor_id')
    .or('uid.is.null,uid.eq.')
    .lt('created_at', fortyEightHoursAgo.toISOString())

  if (pendingLeads && pendingLeads.length > 0) {
    // Group by distributor and count pending leads
    const pendingPerDist = new Map<string, number>()
    for (const lead of pendingLeads) {
      pendingPerDist.set(lead.distributor_id, (pendingPerDist.get(lead.distributor_id) || 0) + 1)
    }

    const distIds = Array.from(pendingPerDist.keys())

    // Check existing uid_reminder sends (frequency cap: 72h between sends, max 2 total)
    const { data: uidSends } = await supabaseAdmin
      .from('email_sends')
      .select('user_id, sent_at')
      .in('user_id', distIds)
      .eq('email_type', 'uid_reminder')

    const uidSendMap = new Map<string, Date[]>()
    for (const send of uidSends || []) {
      if (!uidSendMap.has(send.user_id)) uidSendMap.set(send.user_id, [])
      uidSendMap.get(send.user_id)!.push(new Date(send.sent_at))
    }

    // Fetch distributor profiles for eligible IBs
    const { data: uidDists } = await supabaseAdmin
      .from('distributors')
      .select('id, name, email, language')
      .in('id', distIds)

    const seventyTwoHoursAgoMs = now.getTime() - 72 * 60 * 60 * 1000

    for (const dist of uidDists || []) {
      const previousSends = uidSendMap.get(dist.id) || []

      // Max 2 uid_reminder emails total
      if (previousSends.length >= 2) continue

      // 72h minimum between sends
      const lastSend = previousSends.length > 0
        ? Math.max(...previousSends.map((d) => d.getTime()))
        : 0
      if (lastSend > seventyTwoHoursAgoMs) continue

      const pendingCount = pendingPerDist.get(dist.id) || 0
      if (pendingCount === 0) continue

      const name = dist.name || dist.email?.split('@')[0] || 'there'
      const lang = dist.language || 'en'
      const { html, subject } = buildUidReminderEmail({ name, pendingCount, lang })

      const { error: sendError } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [dist.email],
        subject,
        html,
      })

      if (sendError) {
        errors.push(`uid_reminder ${dist.email}: ${sendError.message}`)
        continue
      }

      await supabaseAdmin.from('email_sends').insert({ user_id: dist.id, email_type: 'uid_reminder' })
      uidSent++
    }
  }

  return NextResponse.json({
    nudge_sent: nudgeSent,
    share_guide_sent: shareSent,
    uid_reminder_sent: uidSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
