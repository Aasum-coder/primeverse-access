// PU Prime Identity Gateway client. Phase 1: verifies that an email + UID
// pair maps to a real PU Prime trading account in real-time, replacing the
// mail-forwarding Auto-Verify path for the verify-at-signup flow.
//
// The API key is read from process.env.PU_PRIME_API_KEY at call time (never
// logged, never exposed to the browser). The base URL is read from
// process.env.PU_PRIME_GATEWAY_URL with a sensible default. Callers MUST
// run server-side only.

const DEFAULT_BASE_URL = 'https://puopscenter.com'
const VERIFY_PATH = '/api/gateway/puprime/verify'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_RETRY_AFTER_MS = 30 * 1000 // cap server-supplied Retry-After
const REQUEST_TIMEOUT_MS = 10 * 1000

export interface PuPrimeClient {
  exists: boolean
  thirdPartyAccessExists: boolean
  accessStatus: string
}

export type PuPrimeVerifyResult =
  | { granted: true; reason?: string; client: PuPrimeClient }
  | { granted: false; reason: string }

interface CacheEntry {
  result: PuPrimeVerifyResult
  expiresAt: number
}

// Module-level Map. In Vercel's serverless model this lives only for the
// lifetime of a single warm container — that's intentional. Cache is a
// rate-limit dodge, not a source of truth, so cold starts re-fetching is
// fine. No Redis, no DB.
const cache: Map<string, CacheEntry> = new Map()

function cacheKey(email: string, uid: number): string {
  return `${email.trim().toLowerCase()}|${uid}`
}

function readCache(email: string, uid: number): PuPrimeVerifyResult | null {
  const key = cacheKey(email, uid)
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.result
}

function writeCache(email: string, uid: number, result: PuPrimeVerifyResult): void {
  cache.set(cacheKey(email, uid), {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

// Drop every entry for a given email — across all UIDs — for force-refresh.
export function invalidatePuPrimeCache(email: string): void {
  const prefix = `${email.trim().toLowerCase()}|`
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// Test helper. Not exported via the public surface; deliberately not in
// the Phase 1 acceptance criteria. Kept for the unit tests and any future
// admin tools that want to flush cache wholesale.
export function _resetPuPrimeCacheForTests(): void {
  cache.clear()
}

function isLikelyEmail(input: string): boolean {
  // Identity Gateway does its own server-side validation; we just block
  // obviously-malformed input from burning rate-limit budget.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}

function isPositiveInteger(uid: unknown): uid is number {
  return typeof uid === 'number' && Number.isInteger(uid) && uid > 0
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null
  const seconds = Number(header)
  if (!Number.isFinite(seconds) || seconds < 0) return null
  return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface VerifyOptions {
  // Test seam — defaults to the global fetch. Production code never sets this.
  fetchImpl?: typeof fetch
  // Override per-call; otherwise read from env.
  apiKey?: string
  baseUrl?: string
}

export async function verifyPuPrimeClient(
  email: string,
  uid: number,
  options: VerifyOptions = {}
): Promise<PuPrimeVerifyResult> {
  const startedAt = Date.now()

  // Step 1 — validate inputs (mirrors gateway-side validation; saves a round trip)
  if (typeof email !== 'string' || !isLikelyEmail(email)) {
    return { granted: false, reason: 'Invalid email format' }
  }
  if (!isPositiveInteger(uid)) {
    return { granted: false, reason: 'Invalid uid — must be a positive integer PU Prime account ID' }
  }

  // Step 2 — cache hit (skip the API entirely)
  const cached = readCache(email, uid)
  if (cached) {
    console.info(`[puprime/verify] cache hit email=${redactEmail(email)} uid=${uid} granted=${cached.granted}`)
    return cached
  }

  const apiKey = options.apiKey ?? process.env.PU_PRIME_API_KEY
  if (!apiKey) {
    console.error('[puprime/verify] PU_PRIME_API_KEY not configured')
    return { granted: false, reason: 'Verification service unavailable' }
  }

  const baseUrl = (options.baseUrl ?? process.env.PU_PRIME_GATEWAY_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  const url = `${baseUrl}${VERIFY_PATH}`
  const fetchImpl = options.fetchImpl ?? fetch

  // Step 3 — POST with one retry on 429
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ email, uid }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timer)
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'network error'
      console.error(`[puprime/verify] fetch failed email=${redactEmail(email)} uid=${uid}: ${reason}`)
      return { granted: false, reason: 'Verification service unreachable' }
    }

    if (response.status === 429 && attempt === 0) {
      const waitMs = parseRetryAfter(response.headers.get('retry-after'))
      console.warn(`[puprime/verify] rate-limited email=${redactEmail(email)} uid=${uid} retryAfterMs=${waitMs ?? '<none>'}`)
      if (waitMs !== null) {
        await sleep(waitMs)
        continue
      }
      // No retry-after header on a 429 → don't loop blindly
      return { granted: false, reason: 'Rate limit exceeded — try again shortly' }
    }

    if (response.status === 401) {
      console.error('[puprime/verify] 401 unauthorized — API key missing/invalid/revoked')
      return { granted: false, reason: 'Verification service authentication failed' }
    }

    if (!response.ok) {
      const reasonFromBody = await safeReadReason(response)
      console.error(`[puprime/verify] http ${response.status} email=${redactEmail(email)} uid=${uid} reason="${reasonFromBody}"`)
      return { granted: false, reason: reasonFromBody || `Verification failed (status ${response.status})` }
    }

    let body: unknown
    try {
      body = await response.json()
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'parse error'
      console.error(`[puprime/verify] body parse failed email=${redactEmail(email)} uid=${uid}: ${reason}`)
      return { granted: false, reason: 'Verification response malformed' }
    }

    const result = normaliseResult(body)
    writeCache(email, uid, result)
    const durationMs = Date.now() - startedAt
    console.info(`[puprime/verify] ok email=${redactEmail(email)} uid=${uid} granted=${result.granted} durationMs=${durationMs}`)
    return result
  }

  // Loop fell through (rate-limited twice in a row)
  return { granted: false, reason: 'Rate limit exceeded — try again shortly' }
}

async function safeReadReason(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (body && typeof body === 'object' && typeof (body as { reason?: unknown }).reason === 'string') {
      return (body as { reason: string }).reason
    }
  } catch {
    // ignore
  }
  return ''
}

function normaliseResult(body: unknown): PuPrimeVerifyResult {
  if (!body || typeof body !== 'object') {
    return { granted: false, reason: 'Verification response malformed' }
  }
  const obj = body as Record<string, unknown>
  const granted = obj.granted === true
  const reason = typeof obj.reason === 'string' ? obj.reason : ''
  if (granted) {
    const client = obj.client && typeof obj.client === 'object' ? obj.client as Record<string, unknown> : {}
    return {
      granted: true,
      reason: reason || undefined,
      client: {
        exists: client.exists === true,
        thirdPartyAccessExists: client.thirdPartyAccessExists === true,
        accessStatus: typeof client.accessStatus === 'string' ? client.accessStatus : '',
      },
    }
  }
  return { granted: false, reason: reason || 'Not verified' }
}

// Keep the local-part identifying enough to debug with, but don't emit the
// full address into Vercel log persistence.
function redactEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return '<redacted>'
  const local = email.slice(0, at)
  const domain = email.slice(at)
  if (local.length <= 2) return `${local[0]}***${domain}`
  return `${local.slice(0, 2)}***${domain}`
}
