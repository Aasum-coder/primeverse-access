import { cookies } from 'next/headers'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { extractAccessToken } from './extract-cookie-token'
import type { ApiResponse } from './types'

// Auth helper for the My Voice API. Two paths, primary first:
//
//   1. Cookie path. We extract the access_token from the sb-*-auth-token
//      cookie ourselves and hand it to client.auth.getUser(token) — the
//      same validation the bearer fallback already uses successfully.
//      We deliberately do NOT use @supabase/ssr's createServerClient
//      because PRs #203 and #204 hit "Invalid Refresh Token: Refresh
//      Token Not Found" inside the GoTrueClient init flow on this
//      project's cookies (the multiple-GoTrueClient warning visible in
//      the browser console suggests races corrupt the refresh_token).
//      Skipping the SDK's session reconstruction sidesteps that whole
//      class of failure; we only need the access_token, which all
//      cookie writes preserve.
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function userIdFromAccessToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await client.auth.getUser(token)
  if (error || !data?.user?.id) return null
  return data.user.id
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // 1. Cookie path — manual extract → auth.getUser(access_token)
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
