import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildMilestoneEmail, MILESTONES, MilestoneNumber } from '@/lib/email-templates/milestone'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

// Triggered after a new lead is created — checks if the IB just hit a milestone
export async function POST(request: Request) {
  const { distributorId } = await request.json()

  if (!distributorId) {
    return NextResponse.json({ error: 'Missing distributorId' }, { status: 400 })
  }

  // Fetch distributor profile
  const { data: dist, error: fetchError } = await supabaseAdmin
    .from('distributors')
    .select('id, name, email, slug, language')
    .eq('id', distributorId)
    .single()

  if (fetchError || !dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  // Count total leads
  const { count } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', dist.id)

  const totalLeads = count || 0

  // Check if total matches any milestone
  if (!MILESTONES.includes(totalLeads as MilestoneNumber)) {
    return NextResponse.json({ skipped: true, reason: `Lead count ${totalLeads} is not a milestone` })
  }

  const milestone = totalLeads as MilestoneNumber
  const emailType = `milestone_${milestone}`

  // Check if this milestone email was already sent
  const { data: existing } = await supabaseAdmin
    .from('email_sends')
    .select('id')
    .eq('user_id', dist.id)
    .eq('email_type', emailType)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ skipped: true, reason: `${emailType} already sent` })
  }

  const name = dist.name || dist.email?.split('@')[0] || 'there'
  const lang = dist.language || 'en'

  const { html, subject } = buildMilestoneEmail({
    name,
    slug: dist.slug,
    milestone,
    totalLeads,
    lang,
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

  // Log the send
  await supabaseAdmin.from('email_sends').insert({
    user_id: dist.id,
    email_type: emailType,
  })

  return NextResponse.json({ success: true, milestone })
}
