import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyToken, generateVerifyToken, verifyTokenExpiryFromNow } from './verify-token'

test('generateVerifyToken returns a 64-char hex string', () => {
  const t = generateVerifyToken()
  assert.equal(t.length, 64)
  assert.match(t, /^[0-9a-f]{64}$/)
})

test('two calls produce different tokens', () => {
  const a = generateVerifyToken()
  const b = generateVerifyToken()
  assert.notEqual(a, b)
})

test('verifyTokenExpiryFromNow returns a 30-days-out ISO timestamp', () => {
  const now = new Date('2026-05-09T00:00:00.000Z')
  const expires = verifyTokenExpiryFromNow(now)
  assert.equal(expires, '2026-06-08T00:00:00.000Z')
})

test('classifyToken: missing token', () => {
  assert.equal(classifyToken(null, '2099-01-01T00:00:00.000Z'), 'missing')
  assert.equal(classifyToken('', '2099-01-01T00:00:00.000Z'), 'missing')
})

test('classifyToken: expired when expiresAt is in the past', () => {
  const now = new Date('2026-05-09T00:00:00.000Z')
  assert.equal(classifyToken('abc', '2026-05-08T00:00:00.000Z', now), 'expired')
})

test('classifyToken: valid when expiresAt is in the future', () => {
  const now = new Date('2026-05-09T00:00:00.000Z')
  assert.equal(classifyToken('abc', '2026-06-09T00:00:00.000Z', now), 'valid')
})

test('classifyToken: expired when expiresAt is null/empty/garbage', () => {
  assert.equal(classifyToken('abc', null), 'expired')
  assert.equal(classifyToken('abc', ''), 'expired')
  assert.equal(classifyToken('abc', 'not-a-date'), 'expired')
})
