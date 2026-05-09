// Single-use random token for the verify-uid + existing-client links in
// Email #1. 32 bytes of crypto randomness encoded as 64-char hex; cleared
// from leads.verify_token once verification succeeds, expired after 30 days.

import { randomBytes } from 'node:crypto'

export const VERIFY_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function generateVerifyToken(): string {
  return randomBytes(32).toString('hex')
}

export function verifyTokenExpiryFromNow(now: Date = new Date()): string {
  return new Date(now.getTime() + VERIFY_TOKEN_TTL_MS).toISOString()
}

export type TokenStatus = 'valid' | 'expired' | 'missing'

// Pure check — caller still has to look up the row to confirm the token
// wasn't consumed by a previous verification.
export function classifyToken(
  token: string | null | undefined,
  expiresAt: string | null | undefined,
  now: Date = new Date(),
): TokenStatus {
  if (!token) return 'missing'
  if (!expiresAt) return 'expired'
  const expiresMs = Date.parse(expiresAt)
  if (!Number.isFinite(expiresMs)) return 'expired'
  return expiresMs > now.getTime() ? 'valid' : 'expired'
}
