import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { ApiResponse } from './types'

// Bearer-token + cookie-session auth for the My Voice API.
//
// Primary path: read the auth session from request cookies via the anon
// client — same shape used by app/api/create-default-stages/route.ts and
// other in-dashboard endpoints. This is what fetch() calls from the
// authenticated browser session use (no Authorization header is set in
// the fetch).
//
// Fallback path: bearer token in Authorization header. Lets server-to-
// server callers (cron, scripts) authenticate without a cookie.

export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // 1. Cookie-session path (browser fetches from the dashboard)
  const cookieHeader = request.headers.get('cookie') || ''
  if (cookieHeader) {
    const cookieClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { cookie: cookieHeader } },
    })
    const { data, error } = await cookieClient.auth.getUser()
    if (!error && data?.user) return data.user.id
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
