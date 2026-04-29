/**
 * Pure helper for the My Voice cookie-auth path.
 *
 * `expires_at` from a Supabase session is unix seconds. Returns true if
 * the access token still has time on it. Lives in its own module so it
 * can be unit-tested without dragging in @supabase/ssr / next/headers
 * (which would otherwise instantiate clients at module load and need
 * env vars to be set during tests).
 */
export function isSessionFresh(
  expiresAt: number | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!expiresAt || expiresAt <= 0) return false
  return expiresAt * 1000 > nowMs
}
