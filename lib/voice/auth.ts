import { cookies } from 'next/headers'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { extractAccessToken } from './extract-cookie-token'
import { isJwtFresh } from './jwt-fresh'
import type { ApiResponse } from './types'

// Auth helper for the My Voice API. Two paths, primary first:
//
//   1. Cookie path. We extract the access_token from the sb-*-auth-token
//      cookie ourselves (sidesteps @supabase/ssr's GoTrueClient init flow
//      that 401'd in PRs #203/#204), pre-flight the JWT's exp claim
//      locally so stale cookie tokens fail fast without a Supabase round
//      trip, then validate via the SERVICE ROLE-keyed client. The
//      anon-key path can return 401 on this Supabase project's ES256-
//      signed tokens (the failure mode the diagnostic in PR #206
//      surfaced); service-role validation is unconditional.
//
//   2. Authorization: Bearer header — for server-to-server callers
//      (cron, scripts) that don't have a cookie.
//
// Function signature is unchanged so the 5 voice endpoints don't need
// edits.

export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function userIdFromAccessToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null
  // Pre-flight: skip the Supabase round trip on obviously stale tokens.
  // Catches the cookie-staleness case (frontend GoTrueClient races leave
  // an old access_token in the cookie even after a refresh).
  if (!isJwtFresh(token)) return null
  // Use the SERVICE ROLE client for token validation. Anon-key validation
  // returned 401 on this project's ES256-signed access tokens during
  // Hotfix #6 diagnosis. Service-role keyed client validates against the
  // auth server unconditionally — same call shape, different key.
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user?.id) return null
  return data.user.id
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // 1. Cookie path — manual extract → fresh-check → auth.getUser
  try {
    const cookieStore = await cookies()
    const accessToken = extractAccessToken(cookieStore.getAll())
    const userId = await userIdFromAccessToken(accessToken)
    if (userId) return userId
  } catch (err) {
    // Don't crash on cookie-read failures — fall through to bearer.
    console.error('[voice-auth] cookie path error:', err)
  }

  // 2. Bearer-token fallback (server-to-server)
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  return userIdFromAccessToken(token || null)
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
