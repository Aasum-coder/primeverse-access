import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildPageLiveEmail } from '@/lib/email-templates/page-live'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const { distributorId } = await request.json()

  if (!distributorId) {
    return NextResponse.json({ error: 'Missing distributorId' }, { status: 400 })
  }

  // Fetch distributor
  const { data: dist, error: fetchError } = await supabaseAdmin
    .from('distributors')
    .select('id, name, email, slug, language')
    .eq('id', distributorId)
    .single()

  if (fetchError || !dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  if (!dist.slug) {
    return NextResponse.json({ error: 'No slug — page not live' }, { status: 400 })
  }

  // Check if already sent
  const { data: existing } = await supabaseAdmin
    .from('email_sends')
    .select('id')
    .eq('user_id', dist.id)
    .eq('email_type', 'page_live')
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ skipped: true, reason: 'page_live already sent' })
  }

  const name = dist.name || dist.email?.split('@')[0] || 'there'
  const lang = dist.language || 'en'

  const { html, subject } = buildPageLiveEmail({ name, slug: dist.slug, lang })

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
    email_type: 'page_live',
  })

  return NextResponse.json({ success: true })
}
