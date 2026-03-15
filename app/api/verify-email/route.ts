import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildVerificationEmail } from '@/lib/email-templates/verification'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

export async function POST(request: Request) {
  const { email, lang } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  // Generate the actual Supabase verification link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://primeverseaccess.com'}/login`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkError?.message || 'Failed to generate verification link' },
      { status: 500 },
    )
  }

  const name = email.split('@')[0]

  const { html, subject } = buildVerificationEmail({
    name,
    verificationUrl: linkData.properties.action_link,
    lang: lang || 'en',
  })

  const { error } = await resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [email],
    subject,
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
