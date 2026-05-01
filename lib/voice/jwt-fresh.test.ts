// Run with: npx tsx --test lib/voice/jwt-fresh.test.ts
//
// Regression tests for the JWT freshness pre-flight added in the
// Hotfix #6 fix. Catches the stale-cookie-token failure mode by
// short-circuiting before we hit Supabase.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isJwtFresh } from './jwt-fresh'

const NOW = 1_700_000_000_000 // arbitrary reference instant in ms

function makeJwt(payload: Record<string, unknown>): string {
  // Header doesn't matter for freshness check; signature is opaque.
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.signaturedoesnotmatterhere`
}

test('null / undefined / empty token is not fresh', () => {
  assert.equal(isJwtFresh(null, NOW), false)
  assert.equal(isJwtFresh(undefined, NOW), false)
  assert.equal(isJwtFresh('', NOW), false)
})

test('non-jwt-shaped string is not fresh', () => {
  assert.equal(isJwtFresh('not.a.jwt.with.too.many.dots', NOW), false)
  assert.equal(isJwtFresh('two.parts', NOW), false)
  assert.equal(isJwtFresh('completelygarbage', NOW), false)
})

test('jwt with malformed base64 payload is not fresh', () => {
  assert.equal(isJwtFresh('header.@@@notbase64@@@.signature', NOW), false)
})

test('jwt missing exp claim is not fresh', () => {
  assert.equal(isJwtFresh(makeJwt({ sub: 'user-123', role: 'authenticated' }), NOW), false)
})

test('jwt with non-numeric exp is not fresh', () => {
  assert.equal(isJwtFresh(makeJwt({ exp: 'soon', sub: 'u' }), NOW), false)
  assert.equal(isJwtFresh(makeJwt({ exp: null, sub: 'u' }), NOW), false)
})

test('jwt with exp in the past is not fresh (the cookie-staleness case)', () => {
  const expSec = Math.floor((NOW - 60_000) / 1000)
  assert.equal(isJwtFresh(makeJwt({ exp: expSec, sub: 'u' }), NOW), false)
})

test('jwt with exp at exactly now is not fresh (strict >)', () => {
  const expSec = Math.floor(NOW / 1000)
  // expSec * 1000 === NOW or NOW - 999, never > NOW for this construction
  assert.equal(isJwtFresh(makeJwt({ exp: expSec, sub: 'u' }), NOW), false)
})

test('jwt with exp 1 hour in the future is fresh', () => {
  const expSec = Math.floor((NOW + 60 * 60 * 1000) / 1000)
  assert.equal(isJwtFresh(makeJwt({ exp: expSec, sub: 'u' }), NOW), true)
})

test('realistic Supabase access_token shape (ES256) parses cleanly', () => {
  const exp = Math.floor((NOW + 3600 * 1000) / 1000)
  const tok = makeJwt({
    iss: 'https://rzlbpudnorjqgqsonweg.supabase.co/auth/v1',
    sub: 'b2c3d4e5-f6a7-8901-2345-6789abcdef01',
    aud: 'authenticated',
    exp,
    role: 'authenticated',
  })
  assert.equal(isJwtFresh(tok, NOW), true)
})
