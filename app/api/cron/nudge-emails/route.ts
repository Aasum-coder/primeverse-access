import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNudgeEmail, IncompleteSteps, NudgeVariant } from '@/lib/email-templates/nudge'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Vercel cron handler — runs every hour
// Secured by CRON_SECRET header check
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

  // Batch query: find all distributors who signed up >24h ago and have incomplete profiles
  // We use a single query with created_at filter rather than looping one by one
  const { data: candidates, error: fetchError } = await supabaseAdmin
    .from('distributors')
    .select('id, user_id, name, email, referral_link, bio, profile_image, slug, language, created_at')
    .lt('created_at', twentyFourHoursAgo.toISOString())
    .or('referral_link.is.null,referral_link.eq.,bio.is.null,bio.eq.,profile_image.is.null,slug.is.null,slug.eq.')

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ processed: 0, sent: 0 })
  }

  // Batch fetch all existing email sends for these candidates
  const candidateIds = candidates.map((c) => c.id)
  const { data: existingSends } = await supabaseAdmin
    .from('email_sends')
    .select('user_id, email_type')
    .in('user_id', candidateIds)
    .in('email_type', ['profile_nudge', 'profile_nudge_final'])

  // Build a lookup: user_id -> Set of email_types already sent
  const sendMap = new Map<string, Set<string>>()
  for (const send of existingSends || []) {
    if (!sendMap.has(send.user_id)) sendMap.set(send.user_id, new Set())
    sendMap.get(send.user_id)!.add(send.email_type)
  }

  let sent = 0
  const errors: string[] = []

  for (const dist of candidates) {
    const sentTypes = sendMap.get(dist.id) || new Set()

    // Already sent both nudges — skip (max 2 nudges total)
    if (sentTypes.has('profile_nudge') && sentTypes.has('profile_nudge_final')) continue

    // Determine which variant to send
    let variant: NudgeVariant
    if (!sentTypes.has('profile_nudge')) {
      // First nudge: send after 24h
      variant = 'profile_nudge'
    } else if (!sentTypes.has('profile_nudge_final')) {
      // Final nudge: only after 72h total since signup
      const createdAt = new Date(dist.created_at)
      if (createdAt > seventyTwoHoursAgo) continue // Not yet 72h old
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
      errors.push(`${dist.email}: ${sendError.message}`)
      continue
    }

    // Log the send
    await supabaseAdmin.from('email_sends').insert({
      user_id: dist.id,
      email_type: variant,
    })

    sent++
  }

  return NextResponse.json({
    processed: candidates.length,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
