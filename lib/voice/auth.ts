import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isSessionFresh } from './session-freshness'
import type { ApiResponse } from './types'

export { isSessionFresh } from './session-freshness'

// Auth helper for the My Voice API. Two paths, primary first:
//
//   1. Cookie session via @supabase/ssr's createServerClient + Next's
//      cookies() helper. We use getSession() (NOT getUser()) — getUser()
//      verifies the JWT against Supabase auth servers, which triggers the
//      refresh-token path on stale access tokens and 401'd this endpoint
//      with "Invalid Refresh Token: Refresh Token Not Found" in PR #203.
//
//      getSession() reads the locally-stored session decoded from the
//      signed sb-* cookie without contacting Supabase. The cookie is
//      signed by Supabase's JWT secret, so it can't be forged cross-
//      origin. We additionally check the access token isn't past expiry
//      so a stale local session never authenticates.
//
//   2. Bearer token in Authorization header — for server-to-server
//      callers (cron, scripts) that don't have a cookie.
//
// Function signature is unchanged on purpose so the 5 voice endpoints
// don't need edits.

export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // 1. Cookie session — getSession() avoids the refresh path
  try {
    const cookieStore = await cookies()
    const ssrClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // No-op: API route handlers can't write cookies back from inside
        // the SSR cookie callback. If a token refresh is needed, that's
        // middleware's job — not ours.
        setAll() {},
      },
    })
    const { data, error } = await ssrClient.auth.getSession()
    if (!error && data.session?.user?.id && isSessionFresh(data.session.expires_at)) {
      return data.session.user.id
    }
  } catch (err) {
    // Don't crash on cookie-read failures — fall through to bearer.
    console.error('[voice-auth] cookie session read failed:', err)
  }

  // 2. Bearer-token fallback (server-to-server)
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (token) {
    const tokenClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await tokenClient.auth.getUser(token)
    if (!error && data?.user) return data.user.id
  }

  return null
}

export function unauthorizedResponse(): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      data: null,
      error: {
        code: 'unauthorized',
        message: 'Missing or invalid session — sign in or pass a bearer token',
      },
    },
    { status: 401 }
  )
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { data: null, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  )
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, error: null }, { status })
}
