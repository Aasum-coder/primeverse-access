import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildTelegramDeepLink,
  generateTelegramLinkToken,
  telegramLinkTokenExpiryFromNow,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_LINK_TOKEN_TTL_MS,
} from './telegram-link'

test('generateTelegramLinkToken returns a 48-char hex string', () => {
  const t = generateTelegramLinkToken()
  assert.equal(t.length, 48)
  assert.match(t, /^[0-9a-f]{48}$/)
})

test('two generated tokens differ', () => {
  assert.notEqual(generateTelegramLinkToken(), generateTelegramLinkToken())
})

test('telegram token length is distinct from verify-token (so they can\'t be confused)', () => {
  // verify-token is 64 hex chars; telegram is 48. Length disambiguates.
  assert.notEqual(generateTelegramLinkToken().length, 64)
})

test('telegramLinkTokenExpiryFromNow returns a 30-days-out ISO timestamp', () => {
  const now = new Date('2026-05-09T00:00:00.000Z')
  const expires = telegramLinkTokenExpiryFromNow(now)
  assert.equal(Date.parse(expires) - now.getTime(), TELEGRAM_LINK_TOKEN_TTL_MS)
})

test('buildTelegramDeepLink uses the canonical bot username + ?start=<token>', () => {
  const link = buildTelegramDeepLink('abc123')
  assert.equal(link, `https://t.me/${TELEGRAM_BOT_USERNAME}?start=abc123`)
  assert.match(link, /^https:\/\/t\.me\//)
})
