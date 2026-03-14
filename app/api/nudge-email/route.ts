import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildNudgeEmail, IncompleteSteps } from '@/lib/email-templates/nudge'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const { userId, lang } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  // Fetch distributor profile to check completion
  const { data: dist, error: fetchError } = await supabaseAdmin
    .from('distributors')
    .select('name, email, referral_link, bio, profile_image, slug, language')
    .eq('user_id', userId)
    .single()

  if (fetchError || !dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  // Determine which steps are incomplete
  const incomplete: IncompleteSteps = {
    referral_link: !dist.referral_link,
    bio: !dist.bio,
    profile_image: !dist.profile_image,
    slug: !dist.slug,
  }

  // If everything is complete, no need to send nudge
  const hasIncomplete = Object.values(incomplete).some(Boolean)
  if (!hasIncomplete) {
    return NextResponse.json({ skipped: true, reason: 'Profile already complete' })
  }

  const name = dist.name || dist.email?.split('@')[0] || 'there'
  const emailLang = lang || dist.language || 'en'

  const { html, subject } = buildNudgeEmail({
    name,
    incomplete,
    lang: emailLang,
  })

  const { error } = await resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [dist.email],
    subject,
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, incomplete })
}
