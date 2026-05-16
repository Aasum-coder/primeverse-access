import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { shortId } from '@/lib/meta-oauth'

// Local disconnect — flips is_connected=false and clears the access_token
// for the caller's row. Does NOT call Meta's DELETE /<user-id>/permissions
// because we only stored Page tokens (that endpoint requires a User token
// and would 400). Soft-disconnect is enough for our purposes; the IB can
// re-OAuth at any time to overwrite the row.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  let body: { platform?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const platform = body.platform
  if (platform !== 'facebook' && platform !== 'instagram') {
    return NextResponse.json({ error: 'platform must be facebook or instagram' }, { status: 400 })
  }

  // setAll captures any Supabase-refreshed cookies so we can propagate them
  // onto the JSON response. Without this, a refreshed access / refresh
  // token pair is discarded and the next request fails with
  // "Invalid Refresh Token: Refresh Token Not Found".
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

  const { data: { user } } = await ssr.auth.getUser()
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!dist?.id) {
    return applyCookies(NextResponse.json({ error: 'No distributor for this user' }, { status: 404 }))
  }

  const { error } = await supabaseAdmin
    .from('social_connections')
    .update({ is_connected: false, access_token: null })
    .eq('distributor_id', dist.id)
    .eq('platform', platform)

  if (error) {
    console.error(`[meta-oauth] event=error code=disconnect_failed platform=${platform} details=${error.message}`)
    return applyCookies(NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 }))
  }

  console.info(`[meta-oauth] event=disconnect platform=${platform} distributor_id=${shortId(dist.id)}`)
  return applyCookies(NextResponse.json({ success: true }))
}
