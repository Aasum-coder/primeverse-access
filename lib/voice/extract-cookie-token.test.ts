// Run with: npx tsx --test lib/voice/extract-cookie-token.test.ts
//
// Regression tests for the cookie-decoder that bypasses @supabase/ssr.
// Each test mirrors a real cookie format observed in Supabase JS v2.x.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractAccessToken } from './extract-cookie-token'

function makeBase64Session(session: object): string {
  return 'base64-' + Buffer.from(JSON.stringify(session), 'utf8').toString('base64')
}

test('returns null when there are no auth cookies', () => {
  assert.equal(extractAccessToken([]), null)
  assert.equal(extractAccessToken([{ name: 'other', value: 'x' }]), null)
})

test('unchunked, base64- prefix (current SDK default)', () => {
  const v = makeBase64Session({
    access_token: 'eyJaccessTokenA',
    refresh_token: 'r1',
    expires_at: 9999999999,
  })
  const token = extractAccessToken([
    { name: 'sb-rzlbpudnorjqgqsonweg-auth-token', value: v },
  ])
  assert.equal(token, 'eyJaccessTokenA')
})

test('chunked, base64- prefix — concatenates by index', () => {
  const session = { access_token: 'eyJaccessTokenChunked', refresh_token: 'r2' }
  const fullValue = makeBase64Session(session)
  const half = Math.ceil(fullValue.length / 2)
  const chunk0 = fullValue.slice(0, half)
  const chunk1 = fullValue.slice(half)
  const token = extractAccessToken([
    // Out of order on purpose — sort logic must put .0 first
    { name: 'sb-ref-auth-token.1', value: chunk1 },
    { name: 'sb-ref-auth-token.0', value: chunk0 },
  ])
  assert.equal(token, 'eyJaccessTokenChunked')
})

test('legacy JSON array (URL-encoded)', () => {
  const arr = ['eyJlegacyArray', 'r-legacy', null, null, null]
  const v = encodeURIComponent(JSON.stringify(arr))
  const token = extractAccessToken([
    { name: 'sb-ref-auth-token', value: v },
  ])
  assert.equal(token, 'eyJlegacyArray')
})

test('legacy JSON object (URL-encoded)', () => {
  const session = { access_token: 'eyJlegacyObject', refresh_token: 'r' }
  const v = encodeURIComponent(JSON.stringify(session))
  const token = extractAccessToken([
    { name: 'sb-ref-auth-token', value: v },
  ])
  assert.equal(token, 'eyJlegacyObject')
})

test('plain JSON without URL encoding', () => {
  const session = { access_token: 'eyJplain', refresh_token: 'r' }
  const token = extractAccessToken([
    { name: 'sb-ref-auth-token', value: JSON.stringify(session) },
  ])
  assert.equal(token, 'eyJplain')
})

test('garbage cookie returns null', () => {
  assert.equal(
    extractAccessToken([{ name: 'sb-ref-auth-token', value: 'not-base64-not-json' }]),
    null
  )
})

test('empty access_token in cookie returns null', () => {
  const v = makeBase64Session({ access_token: '', refresh_token: 'r' })
  assert.equal(
    extractAccessToken([{ name: 'sb-ref-auth-token', value: v }]),
    null
  )
})

test('cookie with no access_token field returns null', () => {
  const v = makeBase64Session({ refresh_token: 'r-only' })
  assert.equal(
    extractAccessToken([{ name: 'sb-ref-auth-token', value: v }]),
    null
  )
})

test('non-auth cookies are ignored', () => {
  const v = makeBase64Session({ access_token: 'eyJright' })
  const token = extractAccessToken([
    { name: 'session_id', value: 'abc' },
    { name: 'sb-ref-auth-token', value: v },
    { name: 'unrelated', value: 'xyz' },
  ])
  assert.equal(token, 'eyJright')
})

test('multiple sb-*-auth-token groups: first valid wins', () => {
  const okSession = makeBase64Session({ access_token: 'eyJfirst' })
  const token = extractAccessToken([
    { name: 'sb-projectA-auth-token', value: okSession },
    { name: 'sb-projectB-auth-token', value: 'garbage' },
  ])
  assert.equal(token, 'eyJfirst')
})

test('chunked + base64 still resolves when chunks span 3 parts', () => {
  const session = { access_token: 'eyJchunked3', refresh_token: 'r' }
  const full = makeBase64Session(session)
  const third = Math.ceil(full.length / 3)
  const c0 = full.slice(0, third)
  const c1 = full.slice(third, third * 2)
  const c2 = full.slice(third * 2)
  const token = extractAccessToken([
    { name: 'sb-ref-auth-token.2', value: c2 },
    { name: 'sb-ref-auth-token.0', value: c0 },
    { name: 'sb-ref-auth-token.1', value: c1 },
  ])
  assert.equal(token, 'eyJchunked3')
})

// Hotfix #8 regression — production cookie matched all earlier tests
// in shape but extractor returned null. Most likely cause: Vercel/Next
// URL-decodes cookie values, swapping `+` ↔ space inside the base64
// payload. These tests reproduce the failure mode and assert the
// hardened decoder recovers the token via fallback strategies.

test('base64 with `+` swapped to space (Vercel URL-decode artifact)', () => {
  // Build a session whose base64 encoding contains a `+` character, then
  // simulate Vercel swapping it to a space.
  const session = {
    access_token: 'eyJrealJWT_aaaa_bbbb_cccc_dddd',
    refresh_token: 'r',
    user: { id: 'u-1', email: 'a@b.co', some: 'extra fluff to push base64 alignment so + appears' },
  }
  const fullValue = makeBase64Session(session)
  // Confirm the test fixture contains a `+` (otherwise the test isn't
  // exercising what we think it is)
  if (!fullValue.includes('+')) {
    // Force a `+` by appending more random content until one appears
    let attempt = session
    let v = fullValue
    let i = 0
    while (!v.includes('+') && i < 20) {
      attempt = { ...attempt, [`pad${i}`]: 'x'.repeat(i + 1) + '!@#$%^&*' }
      v = makeBase64Session(attempt)
      i++
    }
    if (!v.includes('+')) return // skip — can't construct fixture (vanishingly unlikely)
    const corrupted = v.replace(/\+/g, ' ')
    const token = extractAccessToken([{ name: 'sb-ref-auth-token', value: corrupted }])
    assert.equal(token, 'eyJrealJWT_aaaa_bbbb_cccc_dddd')
  } else {
    const corrupted = fullValue.replace(/\+/g, ' ')
    const token = extractAccessToken([{ name: 'sb-ref-auth-token', value: corrupted }])
    assert.equal(token, 'eyJrealJWT_aaaa_bbbb_cccc_dddd')
  }
})

test('production-shape cookie: full Supabase session blob with ES256 access_token', () => {
  // Exact shape sent by @supabase/supabase-js v2.6+ for an ES256 project.
  const session = {
    access_token:
      'eyJhbGciOiJFUzI1NiIsImtpZCI6IjkwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3J6bGJwdWRub3JqcWdxc29ud2VnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtMjM0NS02Nzg5YWJjZGVmMDEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg4MDAwMDAwLCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.fakesignature',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: 1788000000,
    refresh_token: 'fakerefresh1234567890',
    user: {
      id: 'b2c3d4e5-f6a7-8901-2345-6789abcdef01',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
    },
  }
  const cookieValue = makeBase64Session(session)
  const token = extractAccessToken([
    { name: 'sb-rzlbpudnorjqgqsonweg-auth-token', value: cookieValue },
  ])
  assert.equal(token, session.access_token)
})

test('regex fallback recovers access_token from corrupted JSON', () => {
  // Simulates partial corruption around the JSON — JSON.parse fails but
  // the regex extracts the access_token.
  const corruptedDecoded = `garbage_prefix{"access_token":"eyJrecovered_via_regex","refresh_token":"oops_invalid_json_after`
  const cookieValue = 'base64-' + Buffer.from(corruptedDecoded, 'utf8').toString('base64')
  const token = extractAccessToken([{ name: 'sb-ref-auth-token', value: cookieValue }])
  assert.equal(token, 'eyJrecovered_via_regex')
})
