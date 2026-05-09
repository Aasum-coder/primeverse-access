// Single-use Telegram deep-link token. Same shape and TTL as verify-token.
// Persisted on leads.telegram_link_token; consumed by @OneMoveAccessBot
// (Railway long-polling Python bot) which reads Supabase directly.

import { randomBytes } from 'node:crypto'

export const TELEGRAM_LINK_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const TELEGRAM_BOT_USERNAME = 'OneMoveAccessBot'

export function generateTelegramLinkToken(): string {
  return randomBytes(24).toString('hex') // 48-char hex — distinct length from verify-token
}

export function telegramLinkTokenExpiryFromNow(now: Date = new Date()): string {
  return new Date(now.getTime() + TELEGRAM_LINK_TOKEN_TTL_MS).toISOString()
}

export function buildTelegramDeepLink(token: string): string {
  return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${token}`
}
