import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyToken } from '@/lib/leads/verify-token'

// Public endpoint — accepts the verify-uid token from Email #1 and
// returns the minimum data the verify-uid page needs to render: lead
// first name, IB name, IB slug, and the lang to use.
//
// The token IS the auth here. No PII beyond the lead's first name leaks
// even if a token is brute-forced (token is 64 hex chars / ~256 bits).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, name, uid, uid_verified, browser_locale, verify_token, verify_token_expires_at, distributor_id, existing_client_flag')
    .eq('verify_token', token)
    .maybeSingle()

  if (error) {
    console.error(`[leads/lookup-by-token] db error: ${error.message}`)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }

  if (!lead) {
    return NextResponse.json({ error: 'token_not_found' }, { status: 404 })
  }

  const status = classifyToken(lead.verify_token, lead.verify_token_expires_at)
  if (status !== 'valid') {
    return NextResponse.json({ error: 'token_expired' }, { status: 410 })
  }

  if (lead.uid_verified === true) {
    return NextResponse.json({
      data: {
        firstName: extractFirstName(lead.name),
        alreadyVerified: true,
      },
    })
  }

  // Pull IB info for the page header.
  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('name, slug, profile_image')
    .eq('id', lead.distributor_id)
    .maybeSingle()

  return NextResponse.json({
    data: {
      firstName: extractFirstName(lead.name),
      alreadyVerified: false,
      existingClientFlag: lead.existing_client_flag === true,
      ib: {
        name: dist?.name || dist?.slug || null,
        slug: dist?.slug || null,
      },
      lang: parseLangFromBrowserLocale(lead.browser_locale),
    },
  })
}

function extractFirstName(fullName: string | null | undefined): string {
  if (!fullName) return ''
  return fullName.split(' ')[0] || ''
}

function parseLangFromBrowserLocale(locale: string | null | undefined): string {
  if (!locale) return 'en'
  const head = locale.split(',')[0]?.split(/[-_;]/)[0] || ''
  return head.toLowerCase() || 'en'
}
