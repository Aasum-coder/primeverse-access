import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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

  const cookieStore = await cookies()
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* read-only */ },
      },
    },
  )
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!dist?.id) {
    return NextResponse.json({ error: 'No distributor for this user' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('social_connections')
    .update({ is_connected: false, access_token: null })
    .eq('distributor_id', dist.id)
    .eq('platform', platform)

  if (error) {
    console.error(`[meta-oauth] event=error code=disconnect_failed platform=${platform} details=${error.message}`)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  console.info(`[meta-oauth] event=disconnect platform=${platform} distributor_id=${shortId(dist.id)}`)
  return NextResponse.json({ success: true })
}
