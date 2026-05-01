/**
 * Decodes a JWT's payload and returns true if its `exp` claim is in the
 * future. Pure function — no network, no SDK. Used as a pre-flight check
 * in lib/voice/auth.ts so we don't waste a Supabase round trip on
 * obviously stale tokens (the cookie-token-is-stale failure mode that
 * surfaced after Hotfix #5's diagnostic).
 *
 * Tolerant of malformed input: returns false rather than throwing.
 */
export function isJwtFresh(
  token: string | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    )
    if (!payload || typeof payload.exp !== 'number' || payload.exp <= 0) return false
    return payload.exp * 1000 > nowMs
  } catch {
    return false
  }
}
