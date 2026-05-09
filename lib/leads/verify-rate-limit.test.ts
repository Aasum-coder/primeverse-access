import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { attempt, reset, _resetAllForTests, VERIFY_RATE_LIMIT } from './verify-rate-limit'

beforeEach(() => {
  _resetAllForTests()
})

test('first attempt is allowed and reports remaining count', () => {
  const r = attempt('token-a')
  assert.equal(r.allowed, true)
  assert.equal(r.remaining, VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN - 1)
})

test('allows up to MAX_ATTEMPTS, then blocks the next one', () => {
  for (let i = 0; i < VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN; i++) {
    const r = attempt('token-a')
    assert.equal(r.allowed, true, `attempt ${i + 1} should be allowed`)
  }
  const blocked = attempt('token-a')
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.remaining, 0)
  assert.ok(blocked.retryAfterSeconds && blocked.retryAfterSeconds > 0)
})

test('different tokens have independent buckets', () => {
  for (let i = 0; i < VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN; i++) {
    attempt('token-a')
  }
  const otherFirst = attempt('token-b')
  assert.equal(otherFirst.allowed, true)
})

test('window rolls over after WINDOW_MS', () => {
  const now = 10_000
  for (let i = 0; i < VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN; i++) {
    attempt('token-a', now + i)
  }
  const blocked = attempt('token-a', now + 1000)
  assert.equal(blocked.allowed, false)

  const future = now + VERIFY_RATE_LIMIT.WINDOW_MS + 1
  const fresh = attempt('token-a', future)
  assert.equal(fresh.allowed, true)
  assert.equal(fresh.remaining, VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN - 1)
})

test('reset clears the bucket immediately', () => {
  for (let i = 0; i < VERIFY_RATE_LIMIT.MAX_ATTEMPTS_PER_TOKEN; i++) {
    attempt('token-a')
  }
  reset('token-a')
  const fresh = attempt('token-a')
  assert.equal(fresh.allowed, true)
})
