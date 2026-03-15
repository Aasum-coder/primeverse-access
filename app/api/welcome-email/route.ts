import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { buildWelcomeEmail } from '@/lib/email-templates/welcome'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

export async function POST(request: Request) {
  const { name, email, slug, lang } = await request.json()

  if (!name || !email || !slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { html, subject } = buildWelcomeEmail({
    name,
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
