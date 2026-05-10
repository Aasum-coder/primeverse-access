import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyOAuthState, shortId } from '@/lib/meta-oauth'

// Meta OAuth return path. Verifies the HMAC-signed state, exchanges the
// code for a long-lived Page token, picks the first Page (Option A —
// one Page per IB), checks for an attached Instagram Business Account,
// and upserts both rows into social_connections.
//
// All error paths redirect to /?tab=resources&meta_error=<code> so the
// dashboard can surface a friendly toast. No PII or tokens leak into the
// URL on failure.
//
// Test plan (manual — see PR description):
//   1. Happy path: admin clicks Connect → approves → returns with 1 Page
//      + 1 IG → both stored → success toast
//   2. Page has no IG → only FB row stored, success toast
//   3. IB unchecks pages_manage_posts → missing_permissions error, no DB write
//   4. User cancels OAuth popup → access_denied error, no DB write
//   5. State expires (11 min after initiated) → invalid_state error, no DB write
//   6. Reconnect same Page → upsert updates token, no duplicate row
//   7. Disconnect FB → social_connections.is_connected=false for fb row, IG untouched
//   8. Disconnect IG → social_connections.is_connected=false for ig row, FB untouched

const META_API_VERSION = 'v19.0'
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.primeverseaccess.com'

const REQUIRED_SCOPES = ['pages_show_list', 'pages_manage_posts', 'instagram_basic']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function redirectWithError(code: string): NextResponse {
  return NextResponse.redirect(`${SITE_URL}/?tab=resources&meta_error=${encodeURIComponent(code)}`)
}

function redirectSuccess(): NextResponse {
  return NextResponse.redirect(`${SITE_URL}/?tab=resources&meta_connected=1`)
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const oauthError = request.nextUrl.searchParams.get('error')

  // User denied OAuth in the Meta popup
  if (oauthError) {
    console.warn(`[meta-oauth] event=callback_received error=${oauthError}`)
    return redirectWithError('access_denied')
  }

  if (!code || !state) {
    console.warn('[meta-oauth] event=callback_received state_valid=false details=missing_code_or_state')
    return redirectWithError('invalid_state')
  }

  // Verify HMAC-signed state
  const stateResult = verifyOAuthState(state)
  if (!stateResult) {
    console.warn('[meta-oauth] event=callback_received state_valid=false')
    return redirectWithError('invalid_state')
  }
  console.info(`[meta-oauth] event=callback_received state_valid=true distributor_id=${shortId(stateResult.distributorId)}`)

  const clientId = process.env.META_APP_ID ?? process.env.NEXT_PUBLIC_META_APP_ID
  const clientSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    console.error('[meta-oauth] event=error code=meta_not_configured')
    return redirectWithError('meta_not_configured')
  }

  // 1. Exchange code → short-lived token
  let shortToken: string
  let grantedScopes: string[] = []
  try {
    const tokenUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`)
    tokenUrl.searchParams.set('client_id', clientId)
    tokenUrl.searchParams.set('client_secret', clientSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)
    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json().catch(() => ({}))
    if (!tokenRes.ok || !tokenData.access_token) {
      const detail = typeof tokenData?.error?.message === 'string' ? tokenData.error.message : `status ${tokenRes.status}`
      console.error(`[meta-oauth] event=error code=token_exchange_failed details=${detail}`)
      return redirectWithError('token_exchange_failed')
    }
    shortToken = tokenData.access_token as string
    console.info('[meta-oauth] event=token_exchanged short_lived_ok=true long_lived_ok=false')
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    console.error(`[meta-oauth] event=error code=token_exchange_failed details=${detail}`)
    return redirectWithError('token_exchange_failed')
  }

  // Verify the user actually granted the scopes we need before burning a long-lived exchange.
  try {
    const debugUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/me/permissions`)
    debugUrl.searchParams.set('access_token', shortToken)
    const permsRes = await fetch(debugUrl.toString())
    const permsData = await permsRes.json().catch(() => ({}))
    if (Array.isArray(permsData?.data)) {
      grantedScopes = permsData.data
        .filter((p: { permission?: string; status?: string }) => p.status === 'granted' && typeof p.permission === 'string')
        .map((p: { permission: string }) => p.permission)
    }
    const missing = REQUIRED_SCOPES.filter(s => !grantedScopes.includes(s))
    if (missing.length > 0) {
      console.warn(`[meta-oauth] event=error code=missing_permissions details=${missing.join(',')}`)
      return redirectWithError('missing_permissions')
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    console.warn(`[meta-oauth] event=error code=permissions_check_failed details=${detail}`)
    // Non-fatal: proceed and let the Pages call enforce.
  }

  // 2. Exchange short-lived → long-lived (~60 days)
  let longToken: string
  try {
    const llUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`)
    llUrl.searchParams.set('grant_type', 'fb_exchange_token')
    llUrl.searchParams.set('client_id', clientId)
    llUrl.searchParams.set('client_secret', clientSecret)
    llUrl.searchParams.set('fb_exchange_token', shortToken)
    const llRes = await fetch(llUrl.toString())
    const llData = await llRes.json().catch(() => ({}))
    if (!llRes.ok || !llData.access_token) {
      const detail = typeof llData?.error?.message === 'string' ? llData.error.message : `status ${llRes.status}`
      console.error(`[meta-oauth] event=error code=token_exchange_failed details=${detail}`)
      return redirectWithError('token_exchange_failed')
    }
    longToken = llData.access_token as string
    console.info('[meta-oauth] event=token_exchanged short_lived_ok=true long_lived_ok=true')
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    console.error(`[meta-oauth] event=error code=token_exchange_failed details=${detail}`)
    return redirectWithError('token_exchange_failed')
  }

  // 3. Fetch Pages
  type Page = { id: string; name: string; access_token: string }
  let page: Page | undefined
  try {
    const pagesUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/me/accounts`)
    pagesUrl.searchParams.set('access_token', longToken)
    const pagesRes = await fetch(pagesUrl.toString())
    const pagesData = await pagesRes.json().catch(() => ({}))
    if (!pagesRes.ok) {
      const detail = typeof pagesData?.error?.message === 'string' ? pagesData.error.message : `status ${pagesRes.status}`
      console.error(`[meta-oauth] event=error code=pages_fetch_failed details=${detail}`)
      return redirectWithError('pages_fetch_failed')
    }
    const pages: Page[] = Array.isArray(pagesData?.data) ? pagesData.data : []
    console.info(`[meta-oauth] event=pages_fetched count=${pages.length}`)
    page = pages[0]
    if (!page) {
      return redirectWithError('no_pages')
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    console.error(`[meta-oauth] event=error code=pages_fetch_failed details=${detail}`)
    return redirectWithError('pages_fetch_failed')
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()

  // 4. Upsert Facebook row
  {
    const { error: fbError } = await supabase.from('social_connections').upsert(
      {
        distributor_id: stateResult.distributorId,
        platform: 'facebook',
        access_token: page.access_token,
        refresh_token: null,
        platform_user_id: page.id,
        platform_username: page.name,
        token_expires_at: expiresAt,
        is_connected: true,
        connected_at: now.toISOString(),
      },
      { onConflict: 'distributor_id,platform' },
    )
    if (fbError) {
      console.error(`[meta-oauth] event=error code=db_upsert_failed details=${fbError.message}`)
      return redirectWithError('db_upsert_failed')
    }
    console.info(`[meta-oauth] event=stored platform=facebook distributor_id=${shortId(stateResult.distributorId)}`)
  }

  // 5. Check Instagram Business Account on this Page
  try {
    const igLookupUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${page.id}`)
    igLookupUrl.searchParams.set('fields', 'instagram_business_account')
    igLookupUrl.searchParams.set('access_token', page.access_token)
    const igRes = await fetch(igLookupUrl.toString())
    const igData = await igRes.json().catch(() => ({}))
    const igAccountId: string | undefined = igData?.instagram_business_account?.id

    if (igAccountId) {
      // Fetch IG username
      let igUsername: string = page.name
      try {
        const igUserUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${igAccountId}`)
        igUserUrl.searchParams.set('fields', 'username')
        igUserUrl.searchParams.set('access_token', page.access_token)
        const igUserRes = await fetch(igUserUrl.toString())
        const igUserData = await igUserRes.json().catch(() => ({}))
        if (typeof igUserData?.username === 'string') igUsername = igUserData.username
      } catch {
        // Non-fatal — fall back to Page name
      }

      console.info(`[meta-oauth] event=ig_attached page_id=${shortId(page.id)} ig_id=${shortId(igAccountId)}`)

      const { error: igError } = await supabase.from('social_connections').upsert(
        {
          distributor_id: stateResult.distributorId,
          platform: 'instagram',
          // IG Business Graph calls authenticate via the parent Page token
          access_token: page.access_token,
          refresh_token: null,
          platform_user_id: igAccountId,
          platform_username: igUsername,
          token_expires_at: expiresAt,
          is_connected: true,
          connected_at: now.toISOString(),
        },
        { onConflict: 'distributor_id,platform' },
      )
      if (igError) {
        console.error(`[meta-oauth] event=error code=db_upsert_failed details=${igError.message}`)
        // Don't fail the whole flow — FB already stored.
      } else {
        console.info(`[meta-oauth] event=stored platform=instagram distributor_id=${shortId(stateResult.distributorId)}`)
      }
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    console.warn(`[meta-oauth] event=ig_lookup_failed details=${detail}`)
    // Non-fatal — FB already stored.
  }

  return redirectSuccess()
}
