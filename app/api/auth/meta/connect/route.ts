import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const distributorId = request.nextUrl.searchParams.get('distributor_id')
  if (!distributorId) {
    return NextResponse.json({ error: 'Missing distributor_id' }, { status: 400 })
  }

  const clientId = process.env.META_APP_ID ?? process.env.NEXT_PUBLIC_META_APP_ID
  const redirectUri = process.env.META_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Meta app not configured' }, { status: 500 })
  }

  const scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,business_management'
  const metaAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  metaAuthUrl.searchParams.set('client_id', clientId)
  metaAuthUrl.searchParams.set('redirect_uri', redirectUri)
  metaAuthUrl.searchParams.set('scope', scope)
  metaAuthUrl.searchParams.set('state', distributorId)
  metaAuthUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(metaAuthUrl.toString())
}
