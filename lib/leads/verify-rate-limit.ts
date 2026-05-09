// In-memory rate limiter for the verify-uid endpoint. Caps the number of
// UID submission attempts per token so a leaked link can't be used to
// brute-force valid UIDs against the gateway.
//
// Lives at module scope, which means it shares state across the warm
// container's request lifecycle — same model the puprime cache uses.
// The acceptance criterion ("max 5 attempts per token") doesn't need
// cross-region durability; a leaked token still has only its own warm
// container's budget.

const MAX_ATTEMPTS_PER_TOKEN = 5
const WINDOW_MS = 30 * 60 * 1000 // 30 minutes — generous; we just want a ceiling

interface Bucket {
  count: number
  firstAttemptAt: number
}

const buckets: Map<string, Bucket> = new Map()

export interface RateLimitDecision {
  allowed: boolean
  remaining: number
  retryAfterSeconds?: number
}

export function attempt(token: string, now: number = Date.now()): RateLimitDecision {
  const existing = buckets.get(token)

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    buckets.set(token, { count: 1, firstAttemptAt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_TOKEN - 1 }
  }

  if (existing.count >= MAX_ATTEMPTS_PER_TOKEN) {
    const retryAfter = Math.max(
      1,
      Math.ceil((existing.firstAttemptAt + WINDOW_MS - now) / 1000),
    )
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter }
  }

  existing.count += 1
  return { allowed: true, remaining: MAX_ATTEMPTS_PER_TOKEN - existing.count }
}

// On a verified success the token is single-use and gets cleared by the
// route, but the limiter bucket can stick around until the window rolls.
// Drop it explicitly so an admin re-issued token starts clean.
export function reset(token: string): void {
  buckets.delete(token)
}

// Test helper.
export function _resetAllForTests(): void {
  buckets.clear()
}

export const VERIFY_RATE_LIMIT = {
  MAX_ATTEMPTS_PER_TOKEN,
  WINDOW_MS,
}
