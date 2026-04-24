import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildInstructionsEmail } from '@/lib/email-templates/instructions'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const SUPPORTED_LANGS = new Set(['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl', 'pt', 'th'])

// In-memory debounce map: distributorId -> last send timestamp (ms).
// Matches the 3s client-side debounce on the dashboard button. If we
// outgrow a single serverless instance, switch to Redis / Upstash.
// TODO: move to Redis once we need multi-instance rate limiting.
const lastSentAt = new Map<string, number>()
const DEBOUNCE_MS = 3_000

async function getDistributor(token: string) {
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: userData, error } = await authClient.auth.getUser(token)
  if (error || !userData?.user) return null

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id, slug, name, email')
    .eq('user_id', userData.user.id)
    .single()

  return dist || null
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const distributor = await getDistributor(token)
  if (!distributor) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (!distributor.email) {
    return NextResponse.json({ success: false, error: 'No email on file' }, { status: 400 })
  }

  // Server-side debounce (defense-in-depth for client 3s throttle)
  const now = Date.now()
  const last = lastSentAt.get(distributor.id) || 0
  if (now - last < DEBOUNCE_MS) {
    const retryAfterMs = DEBOUNCE_MS - (now - last)
    return NextResponse.json(
      { success: false, error: 'Too many requests', retry_after_ms: retryAfterMs },
      { status: 429 }
    )
  }
  lastSentAt.set(distributor.id, now)

  let body: { lang?: string } = {}
  try { body = await request.json() } catch {}
  const lang = body.lang && SUPPORTED_LANGS.has(body.lang) ? body.lang : 'en'

  try {
    const { subject, html } = buildInstructionsEmail({ name: distributor.name || '', lang })
    await resend.emails.send({
      from: '1Move Academy <noreply@primeverseaccess.com>',
      to: [distributor.email],
      subject,
      html,
    })
    console.info(`[email-instructions] Sent to ${distributor.email} for distributor ${distributor.slug} (lang=${lang})`)
    return NextResponse.json({ success: true, sent_to: distributor.email })
  } catch (err) {
    // Roll back the debounce stamp so the user can retry immediately on genuine failure.
    lastSentAt.delete(distributor.id)
    console.error(`[email-instructions] Send failed for ${distributor.slug}:`, err)
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
  }
}
