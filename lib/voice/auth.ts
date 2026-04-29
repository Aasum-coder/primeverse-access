import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { ApiResponse } from './types'

// Auth helper for the My Voice API.
//
// Two paths, primary first:
//   1. Cookie session via @supabase/ssr's createServerClient + Next's
//      cookies() helper. Handles the chunked sb-* auth cookie that
//      @supabase/ssr writes for large sessions — manual cookie-header
//      forwarding (PR #202's approach) doesn't decode chunked cookies
//      correctly, which is why fetch() from the dashboard 401'd.
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
  // 1. Cookie-session path (browser fetches from the dashboard)
  let userId: string | null = null
  try {
    const cookieStore = await cookies()
    const ssrClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // No-op: API route handlers can't write cookies to the response
        // from inside @supabase/ssr's setAll callback. If a token refresh
        // is needed, middleware should handle it.
        setAll() {},
      },
    })
    const { data, error } = await ssrClient.auth.getUser()
    if (!error && data?.user) userId = data.user.id
  } catch {
    // cookies() can throw if called outside a request context; fall through
    // to the bearer path.
  }

  if (userId) {
    // TODO(richy): remove this temporary log after the cookie-auth fix is
    // verified in Vercel logs (per Hotfix #2 spec — confirm path: 'cookie').
    console.log('[voice-auth]', { path: 'cookie', userId })
    return userId
  }

  // 2. Bearer-token fallback (server-to-server)
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (token) {
    const tokenClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await tokenClient.auth.getUser(token)
    if (!error && data?.user) {
      // TODO(richy): remove this temporary log after verification.
      console.log('[voice-auth]', { path: 'bearer', userId: data.user.id })
      return data.user.id
    }
  }

  // TODO(richy): remove this temporary log after verification.
  console.log('[voice-auth]', { path: 'none', userId: null })
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
