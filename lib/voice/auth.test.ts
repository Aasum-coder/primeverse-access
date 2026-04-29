// Run with: npx tsx --test lib/voice/auth.test.ts
//
// Regression test for the cookie-auth fix. Covers the pure freshness
// helper that decides whether a getSession() result is acceptable —
// this is the gate that prevents stale local sessions from being
// treated as authenticated. Module-level mocking of next/headers +
// @supabase/ssr is out of scope for the current node:test setup, so
// this is the most useful unit-test coverage we can ship without
// adding a new test runner.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSessionFresh } from './session-freshness'

const SECONDS = 1000
const NOW = 1_700_000_000_000 // arbitrary reference instant in ms

test('null expires_at is never fresh', () => {
  assert.equal(isSessionFresh(null, NOW), false)
  assert.equal(isSessionFresh(undefined, NOW), false)
})

test('zero / negative expires_at is never fresh', () => {
  assert.equal(isSessionFresh(0, NOW), false)
  assert.equal(isSessionFresh(-100, NOW), false)
})

test('past expires_at is not fresh', () => {
  const expiresSec = Math.floor((NOW - 60 * SECONDS) / SECONDS)
  assert.equal(isSessionFresh(expiresSec, NOW), false)
})

test('exact-now expires_at is not fresh (strict >)', () => {
  // expires_at is unix seconds, so cast precisely
  const expiresSec = Math.floor(NOW / SECONDS)
  // expiresSec * 1000 may equal NOW exactly or be 1ms behind — either way
  // we don't authenticate at-or-past expiry.
  assert.equal(isSessionFresh(expiresSec, NOW), false)
})

test('future expires_at is fresh', () => {
  const expiresSec = Math.floor((NOW + 60 * SECONDS) / SECONDS)
  assert.equal(isSessionFresh(expiresSec, NOW), true)
})

test('one second of headroom counts as fresh', () => {
  const expiresSec = Math.floor((NOW + 2 * SECONDS) / SECONDS)
  assert.equal(isSessionFresh(expiresSec, NOW), true)
})
