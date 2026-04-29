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
 *     (current default for @supabase/supabase-js v2.6+)
 *   - Chunked + base64- prefix:    sb-{ref}-auth-token.0=base64-eyJ…
 *                                  sb-{ref}-auth-token.1=…
 *     (when total session JSON > ~3.6KB, chunks at 3072 bytes)
 *   - Legacy JSON array:           sb-{ref}-auth-token=[\"<access>\",\"<refresh>\",…]
 *     (older supabase-js, URL-encoded)
 *   - Legacy JSON object:          sb-{ref}-auth-token={\"access_token\":\"…\",…}
 */

interface CookieEntry {
  name: string
  value: string
}

const AUTH_COOKIE_RE = /^sb-.+-auth-token(?:\.(\d+))?$/

interface Group {
  unchunked: string | null
  chunks: { index: number; value: string }[]
}

function groupAuthCookies(cookies: CookieEntry[]): Map<string, Group> {
  const groups = new Map<string, Group>()
  for (const c of cookies) {
    const m = c.name.match(AUTH_COOKIE_RE)
    if (!m) continue
    // baseName excludes the trailing .N
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

function tryParseSession(raw: string): { access_token?: string } | null {
  if (!raw) return null

  // Strip the "base64-" prefix that @supabase/supabase-js v2.6+ uses
  if (raw.startsWith('base64-')) {
    try {
      const decoded = Buffer.from(raw.slice(7), 'base64').toString('utf8')
      const parsed = JSON.parse(decoded)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      // Not a valid base64-prefixed JSON — fall through
    }
  }

  // Legacy formats: try URL-decoded JSON
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      // Legacy array format: [access_token, refresh_token, provider_token, provider_refresh_token, expiry]
      return { access_token: parsed[0] }
    }
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // Not URL-encoded or not JSON
  }

  // Last resort: maybe it's already plain JSON
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      return { access_token: parsed[0] }
    }
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // Truly unparseable — give up
  }

  return null
}

/**
 * Returns the first valid access_token found across any sb-*-auth-token
 * cookie group, or null. Tolerant of all known formats; returns null
 * silently rather than throwing on malformed input.
 */
export function extractAccessToken(cookies: CookieEntry[]): string | null {
  const groups = groupAuthCookies(cookies)
  for (const g of groups.values()) {
    const raw = reassembleValue(g)
    const session = tryParseSession(raw)
    const token = session?.access_token
    if (typeof token === 'string' && token.length > 0) return token
  }
  return null
}
