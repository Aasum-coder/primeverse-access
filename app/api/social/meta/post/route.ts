import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { distributor_id, message, image_url } = await request.json()
    console.log('META POST: received request', { distributor_id, message: message?.substring(0, 50), image_url: !!image_url })

    if (!distributor_id || !message) {
      return NextResponse.json({ error: 'Missing distributor_id or message' }, { status: 400 })
    }

    // Fetch Facebook connection
    const { data: connection, error: dbError } = await supabase
      .from('social_connections')
      .select('access_token, platform_user_id')
      .eq('distributor_id', distributor_id)
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
