import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNudgeEmail, IncompleteSteps, NudgeVariant } from '@/lib/email-templates/nudge'
import { buildFirstShareGuideEmail } from '@/lib/email-templates/first-share-guide'

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

  let nudgeSent = 0
  let shareSent = 0
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

  return NextResponse.json({
    nudge_sent: nudgeSent,
    share_guide_sent: shareSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
