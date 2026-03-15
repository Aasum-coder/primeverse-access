import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNudgeEmail, IncompleteSteps, NudgeVariant } from '@/lib/email-templates/nudge'
import { buildFirstShareGuideEmail } from '@/lib/email-templates/first-share-guide'
import { buildUidReminderEmail } from '@/lib/email-templates/uid-reminder'
import { buildWeeklySummaryEmail, WeeklySummaryStats } from '@/lib/email-templates/weekly-summary'
import { buildInactiveNudgeEmail } from '@/lib/email-templates/inactive-nudge'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

// Combined email automation cron — runs daily at 09:00 UTC via Vercel cron
// Handles: profile_nudge (24h), profile_nudge_final (72h), first_share_guide (24h after page live, 0 leads),
// uid_reminder (48h+, max 2), weekly_summary (Mondays only)
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
  let weeklySent = 0
  let inactiveNudgeSent = 0
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

  // ─── PART 4: Weekly Summary (Mondays only) ────────────────────────
  const isMonday = now.getUTCDay() === 1

  if (isMonday) {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Week range for display: Monday to Sunday (past 7 days)
    const weekEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000) // yesterday (Sunday)
    const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000) // last Monday

    // Find active IBs: have a slug (page live) and were created or had leads in the last 30 days
    const { data: weeklyCandidates } = await supabaseAdmin
      .from('distributors')
      .select('id, name, email, slug, language, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')

    if (weeklyCandidates && weeklyCandidates.length > 0) {
      const weeklyIds = weeklyCandidates.map((c) => c.id)

      // Get all leads for these distributors (for stats calculation)
      const { data: allLeads } = await supabaseAdmin
        .from('leads')
        .select('distributor_id, created_at, uid, uid_verified')
        .in('distributor_id', weeklyIds)

      // Build stats per distributor
      const statsMap = new Map<string, WeeklySummaryStats>()
      for (const distId of weeklyIds) {
        statsMap.set(distId, { newLeads: 0, totalLeads: 0, pending: 0, approved: 0, lastWeekLeads: 0 })
      }

      for (const lead of allLeads || []) {
        const s = statsMap.get(lead.distributor_id)
        if (!s) continue
        s.totalLeads++

        const createdAt = new Date(lead.created_at)
        if (createdAt >= sevenDaysAgo) s.newLeads++
        if (createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo) s.lastWeekLeads++

        if (!lead.uid) {
          s.pending++
        } else {
          s.approved++
        }
      }

      // Check which have already received weekly_summary this week (prevent double-send on retries)
      const { data: weeklySends } = await supabaseAdmin
        .from('email_sends')
        .select('user_id')
        .in('user_id', weeklyIds)
        .eq('email_type', 'weekly_summary')
        .gte('sent_at', sevenDaysAgo.toISOString())

      const weeklyAlreadySent = new Set((weeklySends || []).map((s) => s.user_id))

      for (const dist of weeklyCandidates) {
        if (weeklyAlreadySent.has(dist.id)) continue

        // Activity check: created in last 30 days OR has any leads in last 30 days
        const createdAt = new Date(dist.created_at)
        const stats = statsMap.get(dist.id)!
        const hasRecentLeads = (allLeads || []).some(
          (l) => l.distributor_id === dist.id && new Date(l.created_at) >= thirtyDaysAgo
        )
        if (createdAt < thirtyDaysAgo && !hasRecentLeads) continue

        const name = dist.name || dist.email?.split('@')[0] || 'there'
        const lang = dist.language || 'en'

        const { html, subject } = buildWeeklySummaryEmail({
          name,
          slug: dist.slug,
          stats,
          weekStart,
          weekEnd,
          lang,
        })

        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [dist.email],
          subject,
          html,
        })

        if (sendError) {
          errors.push(`weekly_summary ${dist.email}: ${sendError.message}`)
          continue
        }

        await supabaseAdmin.from('email_sends').insert({ user_id: dist.id, email_type: 'weekly_summary' })
        weeklySent++
      }
    }
  }

  // ─── PART 5: Inactive Nudge (7 days & 14 days since last login) ────────
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgoInactive = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

  // Find IBs with page live (slug set), last_login between 7-30 days ago
  // Use COALESCE(last_login, created_at) for users without last_login
  const { data: inactiveCandidates } = await supabaseAdmin
    .from('distributors')
    .select('id, name, email, slug, language, last_login, created_at')
    .not('slug', 'is', null)
    .not('slug', 'eq', '')

  if (inactiveCandidates && inactiveCandidates.length > 0) {
    // Filter to those inactive 7-30 days
    const eligibleInactive = inactiveCandidates.filter((dist) => {
      const lastActivity = new Date(dist.last_login || dist.created_at)
      return lastActivity <= sevenDaysAgo && lastActivity >= thirtyDaysAgoInactive
    })

    if (eligibleInactive.length > 0) {
      const inactiveIds = eligibleInactive.map((c) => c.id)

      // Fetch existing inactive_nudge sends
      const { data: inactiveSends } = await supabaseAdmin
        .from('email_sends')
        .select('user_id, email_type, sent_at')
        .in('user_id', inactiveIds)
        .in('email_type', ['inactive_nudge', 'inactive_nudge_final'])

      const inactiveSendMap = new Map<string, { types: Set<string>; lastSentAt: Date | null }>()
      for (const send of inactiveSends || []) {
        if (!inactiveSendMap.has(send.user_id)) {
          inactiveSendMap.set(send.user_id, { types: new Set(), lastSentAt: null })
        }
        const entry = inactiveSendMap.get(send.user_id)!
        entry.types.add(send.email_type)
        const sentAt = new Date(send.sent_at)
        if (!entry.lastSentAt || sentAt > entry.lastSentAt) entry.lastSentAt = sentAt
      }

      // Fetch leads created after last_login for each distributor (for "new leads while away")
      const { data: recentLeads } = await supabaseAdmin
        .from('leads')
        .select('distributor_id, created_at')
        .in('distributor_id', inactiveIds)

      const newLeadsSinceMap = new Map<string, number>()
      for (const dist of eligibleInactive) {
        const lastActivity = new Date(dist.last_login || dist.created_at)
        const count = (recentLeads || []).filter(
          (l) => l.distributor_id === dist.id && new Date(l.created_at) > lastActivity,
        ).length
        newLeadsSinceMap.set(dist.id, count)
      }

      for (const dist of eligibleInactive) {
        const sendInfo = inactiveSendMap.get(dist.id) || { types: new Set(), lastSentAt: null }

        // Already sent both → STOP
        if (sendInfo.types.has('inactive_nudge') && sendInfo.types.has('inactive_nudge_final')) continue

        const lastActivity = new Date(dist.last_login || dist.created_at)
        const daysSinceLogin = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))

        let variant: 'day7' | 'day14'
        let emailType: string

        if (!sendInfo.types.has('inactive_nudge')) {
          // Day 7 nudge: not sent yet, and last send (if any) was >6 days ago
          if (sendInfo.lastSentAt && sendInfo.lastSentAt > sixDaysAgo) continue
          variant = 'day7'
          emailType = 'inactive_nudge'
        } else if (!sendInfo.types.has('inactive_nudge_final')) {
          // Day 14 nudge: first nudge was sent, and still inactive 14+ days
          if (daysSinceLogin < 14) continue
          variant = 'day14'
          emailType = 'inactive_nudge_final'
        } else {
          continue
        }

        const name = dist.name || dist.email?.split('@')[0] || 'there'
        const lang = dist.language || 'en'
        const newLeadsSince = newLeadsSinceMap.get(dist.id) || 0

        const { html, subject } = buildInactiveNudgeEmail({
          name,
          slug: dist.slug,
          days: daysSinceLogin,
          variant,
          newLeadsSince,
          lang,
        })

        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [dist.email],
          subject,
          html,
        })

        if (sendError) {
          errors.push(`inactive_nudge ${dist.email}: ${sendError.message}`)
          continue
        }

        await supabaseAdmin.from('email_sends').insert({ user_id: dist.id, email_type: emailType })
        inactiveNudgeSent++
      }
    }
  }

  return NextResponse.json({
    nudge_sent: nudgeSent,
    share_guide_sent: shareSent,
    uid_reminder_sent: uidSent,
    weekly_summary_sent: weeklySent,
    inactive_nudge_sent: inactiveNudgeSent,
    is_monday: isMonday,
    errors: errors.length > 0 ? errors : undefined,
  })
}
