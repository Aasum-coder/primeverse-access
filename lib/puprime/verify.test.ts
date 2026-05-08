import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  verifyPuPrimeClient,
  invalidatePuPrimeCache,
  _resetPuPrimeCacheForTests,
} from './verify'

interface MockCall {
  url: string
  init: RequestInit | undefined
}

function makeMockFetch(
  responses: Array<Response | (() => Promise<Response>)>,
): { fetch: typeof fetch; calls: MockCall[] } {
  const calls: MockCall[] = []
  let i = 0
  const mockFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as URL).toString()
    calls.push({ url, init })
    const next = responses[i]
    if (next === undefined) throw new Error(`mock fetch ran out of responses (call ${i + 1})`)
    i++
    if (typeof next === 'function') return next()
    return next
  }
  return { fetch: mockFetch, calls }
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

const VALID_EMAIL = 'lead@example.com'
const VALID_UID = 667950

beforeEach(() => {
  _resetPuPrimeCacheForTests()
})

test('returns granted:true on a successful 200 from the gateway', async () => {
  const { fetch } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      reason: 'Verified PU Prime client',
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, true)
  if (result.granted) {
    assert.equal(result.client.exists, true)
    assert.equal(result.client.accessStatus, 'Active')
  }
})

test('rejects when uid is missing', async () => {
  const { fetch, calls } = makeMockFetch([])
  const result = await verifyPuPrimeClient(VALID_EMAIL, undefined as unknown as number, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  if (!result.granted) {
    assert.match(result.reason, /uid/i)
  }
  assert.equal(calls.length, 0, 'should not call the gateway when input is invalid')
})

test('rejects non-integer uid before calling the gateway', async () => {
  const { fetch, calls } = makeMockFetch([])
  const result = await verifyPuPrimeClient(VALID_EMAIL, 12.5, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  assert.equal(calls.length, 0)
})

test('rejects negative uid', async () => {
  const { fetch, calls } = makeMockFetch([])
  const result = await verifyPuPrimeClient(VALID_EMAIL, -1, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  assert.equal(calls.length, 0)
})

test('rejects malformed email before calling the gateway', async () => {
  const { fetch, calls } = makeMockFetch([])
  const result = await verifyPuPrimeClient('not-an-email', VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  assert.equal(calls.length, 0)
})

test('handles 401 unauthorised by returning granted:false (not throwing)', async () => {
  const { fetch } = makeMockFetch([jsonResponse(401, { error: 'Invalid API key' })])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  if (!result.granted) assert.match(result.reason, /authentication/i)
})

test('handles 400 with reason from the body', async () => {
  const { fetch } = makeMockFetch([jsonResponse(400, { granted: false, reason: 'PU Prime UID is required' })])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
  if (!result.granted) assert.equal(result.reason, 'PU Prime UID is required')
})

test('retries once on 429 when retry-after is supplied', async () => {
  const { fetch, calls } = makeMockFetch([
    new Response('', { status: 429, headers: { 'Retry-After': '0' } }),
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(calls.length, 2, 'should call twice — initial + retry')
  assert.equal(result.granted, true)
})

test('gives up after a single retry on 429 — no retry-after means no retry', async () => {
  const { fetch, calls } = makeMockFetch([new Response('', { status: 429 })])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(calls.length, 1)
  assert.equal(result.granted, false)
})

test('caches a successful result so a second call within the TTL skips fetch', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(calls.length, 1, 'second call should hit the cache, not the gateway')
})

test('caches a granted:false result too — denials shouldn\'t spam the gateway', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, { granted: false, reason: 'PU Prime account not found' }),
  ])
  const first = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  const second = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(first.granted, false)
  assert.equal(second.granted, false)
  assert.equal(calls.length, 1)
})

test('invalidatePuPrimeCache forces the next call to refetch', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, { granted: false, reason: 'Inactive' }),
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  const first = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(first.granted, false)
  invalidatePuPrimeCache(VALID_EMAIL)
  const second = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(second.granted, true)
  assert.equal(calls.length, 2)
})

test('case-insensitive cache: same email different case hits the same entry', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  await verifyPuPrimeClient('Lead@Example.com', VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  await verifyPuPrimeClient('lead@example.com', VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(calls.length, 1)
})

test('different uid with the same email is a cache miss', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
    jsonResponse(200, { granted: false, reason: 'Not found' }),
  ])
  await verifyPuPrimeClient(VALID_EMAIL, 111, { fetchImpl: fetch, apiKey: 'test-key' })
  await verifyPuPrimeClient(VALID_EMAIL, 222, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(calls.length, 2)
})

test('sends bearer auth header and JSON body', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'gw_test_key_1234' })
  assert.equal(calls.length, 1)
  const init = calls[0].init!
  const headers = new Headers(init.headers as Record<string, string>)
  assert.equal(headers.get('Authorization'), 'Bearer gw_test_key_1234')
  assert.equal(headers.get('Content-Type'), 'application/json')
  assert.equal(init.method, 'POST')
  assert.equal(init.body, JSON.stringify({ email: VALID_EMAIL, uid: VALID_UID }))
})

test('respects PU_PRIME_GATEWAY_URL override', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, {
      granted: true,
      client: { exists: true, thirdPartyAccessExists: true, accessStatus: 'Active' },
    }),
  ])
  await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, {
    fetchImpl: fetch,
    apiKey: 'test-key',
    baseUrl: 'https://staging.example.com/',
  })
  assert.equal(calls[0].url, 'https://staging.example.com/api/gateway/puprime/verify')
})

test('returns granted:false when the API key is not configured', async () => {
  const { fetch, calls } = makeMockFetch([])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: '' })
  assert.equal(calls.length, 0)
  assert.equal(result.granted, false)
})

test('handles a malformed JSON body gracefully', async () => {
  const { fetch } = makeMockFetch([
    new Response('not json {{', { status: 200, headers: { 'Content-Type': 'application/json' } }),
  ])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
})

test('treats fetch throwing (network error) as granted:false', async () => {
  const { fetch } = makeMockFetch([() => Promise.reject(new Error('ECONNREFUSED'))])
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey: 'test-key' })
  assert.equal(result.granted, false)
})

test('does not echo the API key into the result on failure', async () => {
  const { fetch } = makeMockFetch([jsonResponse(401, { error: 'Invalid API key' })])
  const apiKey = 'gw_secret_should_not_leak_xyz'
  const result = await verifyPuPrimeClient(VALID_EMAIL, VALID_UID, { fetchImpl: fetch, apiKey })
  if (!result.granted) {
    assert.ok(!result.reason.includes(apiKey), 'API key must never appear in any reason string')
  }
})
