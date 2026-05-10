import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { signOAuthState, verifyOAuthState, shortId } from './meta-oauth'

const TEST_SECRET = 'test_app_secret_xyz_1234567890'
const ORIGINAL_SECRET = process.env.META_APP_SECRET

beforeEach(() => {
  process.env.META_APP_SECRET = TEST_SECRET
})

test('signOAuthState produces a string with one dot separator', () => {
  const state = signOAuthState('dist-uuid-1')
  assert.equal(state.split('.').length, 2)
})

test('verifyOAuthState round-trips a freshly-signed state', () => {
  const state = signOAuthState('dist-uuid-1')
  const result = verifyOAuthState(state)
  assert.deepEqual(result, { distributorId: 'dist-uuid-1' })
})

test('two signs of the same id produce different states (nonce + expiry differ)', () => {
  const a = signOAuthState('dist-uuid-1')
  const b = signOAuthState('dist-uuid-1')
  assert.notEqual(a, b)
})

test('verifyOAuthState rejects an empty/null state', () => {
  assert.equal(verifyOAuthState(null), null)
  assert.equal(verifyOAuthState(''), null)
  assert.equal(verifyOAuthState(undefined), null)
})

test('verifyOAuthState rejects a state without dot separator', () => {
  assert.equal(verifyOAuthState('garbage'), null)
})

test('verifyOAuthState rejects a tampered payload', () => {
  const state = signOAuthState('dist-uuid-1')
  const [, sig] = state.split('.')
  // Inject a different (well-formed) payload but keep the original signature
  const fakePayload = Buffer.from(JSON.stringify({
    distributor_id: 'attacker',
    nonce: 'aa',
    expires_at: Date.now() + 100000,
  })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const tampered = `${fakePayload}.${sig}`
  assert.equal(verifyOAuthState(tampered), null)
})

test('verifyOAuthState rejects a state signed with a different secret', () => {
  const state = signOAuthState('dist-uuid-1')
  process.env.META_APP_SECRET = 'different_secret'
  assert.equal(verifyOAuthState(state), null)
})

test('verifyOAuthState rejects an expired state', () => {
  const past = Date.now() - 60_000
  const state = signOAuthState('dist-uuid-1', past - 11 * 60 * 1000)
  assert.equal(verifyOAuthState(state), null)
})

test('verifyOAuthState rejects a state about to expire if now > expires_at', () => {
  const issued = 1_000_000
  const state = signOAuthState('dist-uuid-1', issued)
  // 11 minutes after issuance: TTL is 10 minutes, so this is expired
  assert.equal(verifyOAuthState(state, issued + 11 * 60 * 1000), null)
  // 9 minutes after issuance: still valid
  assert.deepEqual(verifyOAuthState(state, issued + 9 * 60 * 1000), { distributorId: 'dist-uuid-1' })
})

test('verifyOAuthState returns null when META_APP_SECRET is missing', () => {
  const state = signOAuthState('dist-uuid-1')
  delete process.env.META_APP_SECRET
  assert.equal(verifyOAuthState(state), null)
  process.env.META_APP_SECRET = TEST_SECRET
})

test('signOAuthState throws when META_APP_SECRET is missing', () => {
  delete process.env.META_APP_SECRET
  assert.throws(() => signOAuthState('dist-uuid-1'), /META_APP_SECRET/)
  process.env.META_APP_SECRET = TEST_SECRET
})

test('shortId truncates long ids and passes through short ones', () => {
  assert.equal(shortId('abc'), 'abc')
  assert.equal(shortId('a'.repeat(20)), 'a'.repeat(20))
  assert.equal(shortId('a'.repeat(36)), 'a'.repeat(12))
  assert.equal(shortId(null), '<none>')
})

// Restore the env var for any tests run after this file finishes
process.env.META_APP_SECRET = ORIGINAL_SECRET
