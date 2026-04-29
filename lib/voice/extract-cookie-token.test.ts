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
