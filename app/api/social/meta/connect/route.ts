import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { signOAuthState, shortId } from '@/lib/meta-oauth'

// OAuth entry point. The browser hits GET /api/social/meta/connect; we
// resolve the caller's distributor_id from the cookie session, sign it
// into the state parameter, and 302 to Meta. The callback route
// (app/api/social/meta/callback) verifies the signature on return so a
// leaked URL can't be used to attach a Meta connection to a different
// IB's row.

const META_API_VERSION = 'v19.0'
const META_SCOPES = [
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
  'business_management',
  'instagram_business_basic',
  'instagram_business_content_publish',
].join(',')

function loginRedirect(): NextResponse {
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'))
}

export async function GET(_request: NextRequest) {
  const clientId = process.env.META_APP_ID ?? process.env.NEXT_PUBLIC_META_APP_ID
  const redirectUri = process.env.META_REDIRECT_URI
  if (!clientId || !redirectUri) {
    console.error('[meta-oauth] event=error code=meta_not_configured details=missing META_APP_ID or META_REDIRECT_URI')
    return NextResponse.json({ error: 'Meta app not configured' }, { status: 500 })
  }
  if (!process.env.META_APP_SECRET) {
    console.error('[meta-oauth] event=error code=meta_not_configured details=missing META_APP_SECRET')
    return NextResponse.json({ error: 'Meta app not configured' }, { status: 500 })
  }

  // Resolve session via cookie (browser GET — no Bearer header available).
  // setAll captures any Supabase-refreshed cookies so we can propagate them
  // onto the final redirect response. Without this, a refreshed access /
  // refresh token pair is discarded and the next request fails with
  // "Invalid Refresh Token: Refresh Token Not Found", bouncing the user
  // through /login.
  const cookieStore = await cookies()
  const refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = []
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          for (const c of cookiesToSet) {
            try { cookieStore.set(c.name, c.value, c.options) } catch { /* cookieStore is readonly in some Next contexts */ }
            refreshedCookies.push(c)
          }
        },
      },
    },
  )
  const applyCookies = (res: NextResponse): NextResponse => {
    for (const c of refreshedCookies) res.cookies.set(c.name, c.value, c.options)
    return res
  }

  const { data: { user }, error: userErr } = await ssr.auth.getUser()
  if (userErr || !user) {
    console.warn('[meta-oauth] event=connect_initiated unauthenticated')
    return applyCookies(loginRedirect())
  }

  // Look up distributor_id by user_id (service role bypasses RLS so we
  // get a consistent answer regardless of dashboard policy state).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: dist, error: distErr } = await admin
    .from('distributors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (distErr || !dist?.id) {
    console.error(`[meta-oauth] event=error code=no_distributor user=${shortId(user.id)} details=${distErr?.message ?? 'no row'}`)
    return applyCookies(loginRedirect())
  }

  const state = signOAuthState(dist.id)
  console.info(`[meta-oauth] event=connect_initiated distributor_id=${shortId(dist.id)}`)

  const url = new URL(`https://www.facebook.com/${META_API_VERSION}/dialog/oauth`)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('scope', META_SCOPES)
  url.searchParams.set('response_type', 'code')

  return applyCookies(NextResponse.redirect(url.toString()))
}
