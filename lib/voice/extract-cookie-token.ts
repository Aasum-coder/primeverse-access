/**
 * Extracts the Supabase access_token from the request cookies, bypassing
 * @supabase/ssr's session-reconstruction code path entirely.
 *
 * Why we need this: PRs #203 and #204 used @supabase/ssr's createServerClient
 * to read the session, but the GoTrueClient internal flow kept hitting
 * "Invalid Refresh Token: Refresh Token Not Found" because the cookie this
 * app's frontend sets sometimes lacks a usable refresh_token (consequence of
 * the multiple-GoTrueClient-instances warning visible in the browser console
 * — at least 8 createClient call sites in the frontend race on cookie writes).
 *
 * For an "is the requester authenticated" check we only need the access_token,
 * not the refresh_token. Once extracted, we hand it to auth.getUser(token) —
 * the same path that already works for the bearer header — and Supabase
 * validates the JWT against its auth servers.
 *
 * Cookie format support:
 *   - Unchunked + base64- prefix:  sb-{ref}-auth-token=base64-eyJ…
 *   - Chunked + base64- prefix:    sb-{ref}-auth-token.0=base64-eyJ…
 *                                  sb-{ref}-auth-token.1=…
 *   - Legacy JSON array:           sb-{ref}-auth-token=[\"<access>\",\"<refresh>\",…]
 *   - Legacy JSON object:          sb-{ref}-auth-token={\"access_token\":\"…\",…}
 *
 * Hotfix #8 hardening: Hotfix #7's trace showed the extractor returning null
 * on the live production cookie despite working in PR #206's diagnostic.
 * Most likely culprit: Vercel/Next URL-decodes cookie values on the way in,
 * which can swap `+` to space inside a base64 payload. Buffer.from(_, 'base64')
 * tolerantly skips spaces, producing byte-misaligned garbage and a JSON.parse
 * failure. The decoder now tries multiple strategies in order and falls back
 * to a regex extract on any string that contains "access_token":"...".
 */

interface CookieEntry {
  name: string
  value: string
}

const AUTH_COOKIE_RE = /^sb-.+-auth-token(?:\.(\d+))?$/

// Direct JSON regex — extracts the access_token field from any JSON-ish
// string, even when JSON.parse would fail on surrounding garbage. Allows
// any non-quote, non-backslash chars in the value (JWTs don't contain
// either, so this is safe).
const ACCESS_TOKEN_REGEX = /"access_token"\s*:\s*"([^"\\]+)"/

interface Group {
  unchunked: string | null
  chunks: { index: number; value: string }[]
}

function groupAuthCookies(cookies: CookieEntry[]): Map<string, Group> {
  const groups = new Map<string, Group>()
  for (const c of cookies) {
    const m = c.name.match(AUTH_COOKIE_RE)
    if (!m) continue
    const baseName = c.name.replace(/\.\d+$/, '')
    if (!groups.has(baseName)) groups.set(baseName, { unchunked: null, chunks: [] })
    const g = groups.get(baseName)!
    if (m[1] !== undefined) {
      g.chunks.push({ index: parseInt(m[1], 10), value: c.value })
    } else {
      g.unchunked = c.value
    }
  }
  return groups
}

function reassembleValue(g: Group): string {
  if (g.chunks.length > 0) {
    return g.chunks.sort((a, b) => a.index - b.index).map(c => c.value).join('')
  }
  return g.unchunked ?? ''
}

// Returns every plausible decoding of a base64-prefixed value. Caller picks
// the first one that yields an access_token. Multiple strategies guard
// against URL-encoding artifacts (`+` ↔ space, `+/=` ↔ `-_~`, etc).
function decodeBase64Value(value: string): string[] {
  const out: string[] = []
  const tries = [
    // Standard base64, value as-is
    value,
    // base64url variant — handled by Node's 'base64url' encoding below
    value,
    // URL-encoding artifact: spaces in the value were originally `+`
    value.replace(/ /g, '+'),
    // URL-safe → standard mapping (manual)
    value.replace(/-/g, '+').replace(/_/g, '/'),
    // After URL-decoding the value (in case Vercel double-encoded somehow)
    (() => { try { return decodeURIComponent(value) } catch { return value } })(),
  ]
  const encodings: BufferEncoding[] = ['base64', 'base64url', 'base64', 'base64', 'base64']
  for (let i = 0; i < tries.length; i++) {
    try {
      const decoded = Buffer.from(tries[i], encodings[i]).toString('utf8')
      if (decoded) out.push(decoded)
    } catch {
      // skip this strategy
    }
  }
  return out
}

function findAccessTokenInString(s: string | null | undefined): string | null {
  if (!s) return null
  // Try JSON.parse first — the canonical, fast path
  try {
    const parsed = JSON.parse(s)
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.access_token === 'string' && parsed.access_token.length > 0) {
        return parsed.access_token
      }
      if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].length > 0) {
        // Legacy [access_token, refresh_token, ...] format
        return parsed[0]
      }
    }
  } catch {
    // Fall through to regex
  }
  // Regex fallback — survives partial corruption around the access_token field
  const m = s.match(ACCESS_TOKEN_REGEX)
  if (m && m[1] && m[1].length > 0) return m[1]
  return null
}

function tryParseSession(raw: string): string | null {
  if (!raw) return null

  // Strip the "base64-" prefix that @supabase/supabase-js v2.6+ uses
  if (raw.startsWith('base64-')) {
    const value = raw.slice(7)
    for (const decoded of decodeBase64Value(value)) {
      const token = findAccessTokenInString(decoded)
      if (token) return token
    }
  }

  // Legacy: try the raw value as URL-decoded JSON / plain JSON
  for (const candidate of [raw, (() => { try { return decodeURIComponent(raw) } catch { return null } })()]) {
    if (!candidate) continue
    const token = findAccessTokenInString(candidate)
    if (token) return token
  }

  // Last resort: regex on the raw cookie value, in case it's an unexpected
  // shape that still contains "access_token":"..." somewhere inside
  const m = raw.match(ACCESS_TOKEN_REGEX)
  if (m && m[1]) return m[1]

  return null
}

/**
 * Returns the first valid access_token found across any sb-*-auth-token
 * cookie group, or null. Tolerant of all known formats; returns null
 * silently rather than throwing on malformed input.
 *
 * Logs `[voice-extractor-trace]` once per call with full cookie context
 * + the resolved token's prefix (or last failure reason). Remove the log
 * once auth has been verified working in production.
 */
export function extractAccessToken(cookies: CookieEntry[]): string | null {
  const allSb = cookies.filter(c => c.name.startsWith('sb-'))
  const auth = cookies.filter(c => AUTH_COOKIE_RE.test(c.name))
  const groups = groupAuthCookies(cookies)

  let result: string | null = null
  let lastFailure: string = auth.length === 0 ? 'no auth-token cookies' : 'all groups failed to yield access_token'
  let attempts: Array<{
    base: string
    rawPrefix: string | null
    rawLength: number
    chunkIndices: number[]
    hasUnchunked: boolean
    decoded: boolean
    accessTokenFound: boolean
  }> = []

  for (const [baseName, g] of groups.entries()) {
    const raw = reassembleValue(g)
    const token = tryParseSession(raw)
    attempts.push({
      base: baseName,
      rawPrefix: raw ? raw.slice(0, 60) : null,
      rawLength: raw.length,
      chunkIndices: g.chunks.map(c => c.index).sort((a, b) => a - b),
      hasUnchunked: g.unchunked !== null,
      decoded: raw.length > 0 && raw.startsWith('base64-'),
      accessTokenFound: token !== null,
    })
    if (token) {
      result = token
      break
    } else if (raw) {
      lastFailure = `${baseName}: tryParseSession returned null (raw len ${raw.length}, prefix: ${raw.slice(0, 40)})`
    }
  }

  // ─── DIAGNOSTIC (Hotfix #8 — remove once auth is verified) ────────────
  console.log('[voice-extractor-trace]', {
    totalCookies: cookies.length,
    allCookieNames: cookies.map(c => c.name),
    sbCookieCount: allSb.length,
    sbCookieNames: allSb.map(c => c.name),
    authCookieCount: auth.length,
    authCookieNames: auth.map(c => c.name),
    groupAttempts: attempts,
    resultIsNull: result === null,
    resultTokenPrefix: result ? result.slice(0, 20) : null,
    lastFailureReason: result === null ? lastFailure : null,
  })
  // ──────────────────────────────────────────────────────────────────────

  return result
}
