import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Facebook-only post route. Resolves distributor_id from the cookie session
// (NOT the request body) so one IB cannot post on another's Page by passing
// a different uuid. Same auth pattern as /api/social/meta/disconnect.
//
// Body shape: { message: string, image_url?: string }
// Extra fields are ignored silently. distributor_id is server-resolved.
//
// Instagram posting is Phase 2; the route still hardcodes platform=facebook.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message : ''
    const image_url = typeof body?.image_url === 'string' ? body.image_url : undefined

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Resolve session via cookie (matches /api/social/meta/disconnect)
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
      return NextResponse.json({ error: 'No distributor for this user' }, { status: 401 })
    }

    console.log('META POST: received request', { distributor_id: dist.id.slice(0, 12), message: message.substring(0, 50), image_url: !!image_url })

    // Fetch Facebook connection (server-resolved distributor_id)
    const { data: connection, error: dbError } = await supabaseAdmin
      .from('social_connections')
      .select('access_token, platform_user_id')
      .eq('distributor_id', dist.id)
      .eq('platform', 'facebook')
      .eq('is_connected', true)
      .single()

    if (dbError || !connection) {
      console.log('META POST: no Facebook connection found', dbError)
      return NextResponse.json({ error: 'Facebook not connected' }, { status: 400 })
    }

    console.log('META POST: found connection for page', connection.platform_user_id)

    let result: any

    if (image_url) {
      // Post with image using /photos endpoint
      console.log('META POST: posting photo to page', connection.platform_user_id)
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${connection.platform_user_id}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            url: image_url,
            caption: message,
            access_token: connection.access_token,
          }),
        }
      )
      result = await res.json()
    } else {
      // Text-only post using /feed endpoint
      console.log('META POST: posting text to page', connection.platform_user_id)
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${connection.platform_user_id}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            message,
            access_token: connection.access_token,
          }),
        }
      )
      result = await res.json()
    }

    if (result.error) {
      console.error('META POST: Graph API error', JSON.stringify(result.error))
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    console.log('META POST: success, post_id =', result.id || result.post_id)
    return NextResponse.json({ success: true, post_id: result.id || result.post_id })
  } catch (err) {
    console.error('META POST: unexpected error', JSON.stringify(err, Object.getOwnPropertyNames(err as object)))
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
