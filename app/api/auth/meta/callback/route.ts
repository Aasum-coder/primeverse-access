import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = 'https://www.primeverseaccess.com'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const distributorId = request.nextUrl.searchParams.get('state')

  if (!code || !distributorId) {
    return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
  }

  const clientId = process.env.NEXT_PUBLIC_META_APP_ID!
  const clientSecret = process.env.META_APP_SECRET!
  const redirectUri = process.env.META_REDIRECT_URI!

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      console.error('Meta token exchange failed:', tokenData)
      return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
    }
    const shortToken = tokenData.access_token

    // 2. Exchange for long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`
    )
    const longTokenData = await longTokenRes.json()
    if (!longTokenData.access_token) {
      console.error('Meta long-lived token exchange failed:', longTokenData)
      return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
    }
    const longToken = longTokenData.access_token

    // 3. Fetch user's Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken}`
    )
    const pagesData = await pagesRes.json()
    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No Facebook Pages found:', pagesData)
      return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
    }

    const page = pagesData.data[0]
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()

    // 4. Upsert Facebook connection
    const { error: fbError } = await supabase.from('social_connections').upsert({
      distributor_id: distributorId,
      platform: 'facebook',
      access_token: page.access_token,
      platform_user_id: page.id,
      platform_username: page.name,
      token_expires_at: expiresAt,
      is_connected: true,
      connected_at: now.toISOString(),
    }, { onConflict: 'distributor_id,platform' })

    if (fbError) {
      console.error('Facebook upsert error:', fbError)
      return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
    }

    // 5. Check for Instagram Business account linked to the Page
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )
    const igData = await igRes.json()

    if (igData.instagram_business_account?.id) {
      await supabase.from('social_connections').upsert({
        distributor_id: distributorId,
        platform: 'instagram',
        access_token: page.access_token,
        platform_user_id: igData.instagram_business_account.id,
        platform_username: page.name,
        token_expires_at: expiresAt,
        is_connected: true,
        connected_at: now.toISOString(),
      }, { onConflict: 'distributor_id,platform' })
    }

    return NextResponse.redirect(`${SITE_URL}/?meta_connected=true`)
  } catch (err) {
    console.error('Meta OAuth callback error:', err)
    return NextResponse.redirect(`${SITE_URL}/?meta_error=true`)
  }
}
