import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publishToFacebook, publishToInstagram } from './publishers'

interface MockCall { url: string; init?: RequestInit }

function makeMockFetch(responses: Array<Response | (() => Promise<Response>)>): { fetch: typeof fetch; calls: MockCall[] } {
  const calls: MockCall[] = []
  let i = 0
  const mockFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as URL).toString()
    calls.push({ url, init })
    const next = responses[i]
    if (next === undefined) throw new Error(`mock fetch ran out of responses (call ${i + 1})`)
    i++
    return typeof next === 'function' ? next() : next
  }
  return { fetch: mockFetch, calls }
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

test('publishToFacebook: text-only post hits /feed and returns the post id', async () => {
  const { fetch, calls } = makeMockFetch([jsonResponse(200, { id: '111_222' })])
  const result = await publishToFacebook({ pageId: '111', accessToken: 'tok', message: 'hello', fetchImpl: fetch })
  assert.deepEqual(result, { ok: true, postId: '111_222' })
  assert.match(calls[0].url, /\/111\/feed$/)
})

test('publishToFacebook: with image hits /photos and prefers post_id', async () => {
  const { fetch, calls } = makeMockFetch([jsonResponse(200, { id: 'media999', post_id: '111_333' })])
  const result = await publishToFacebook({
    pageId: '111', accessToken: 'tok', message: 'caption', imageUrl: 'https://img/a.jpg', fetchImpl: fetch,
  })
  assert.deepEqual(result, { ok: true, postId: '111_333' })
  assert.match(calls[0].url, /\/111\/photos$/)
})

test('publishToFacebook: surfaces Graph API error with code', async () => {
  const { fetch } = makeMockFetch([jsonResponse(403, { error: { message: 'permission denied', code: 200 } })])
  const result = await publishToFacebook({ pageId: '111', accessToken: 'tok', message: 'x', fetchImpl: fetch })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.match(result.error, /permission denied/)
    assert.equal(result.code, '200')
  }
})

test('publishToFacebook: network throw is captured', async () => {
  const { fetch } = makeMockFetch([() => Promise.reject(new Error('ECONNREFUSED'))])
  const result = await publishToFacebook({ pageId: '111', accessToken: 'tok', message: 'x', fetchImpl: fetch })
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /ECONNREFUSED/)
})

test('publishToFacebook: missing post id in response is treated as failure', async () => {
  const { fetch } = makeMockFetch([jsonResponse(200, {})])
  const result = await publishToFacebook({ pageId: '111', accessToken: 'tok', message: 'x', fetchImpl: fetch })
  assert.equal(result.ok, false)
})

test('publishToInstagram: 2-step happy path returns publish id', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(200, { id: 'creation-1' }),
    jsonResponse(200, { id: '17841444' }),
  ])
  const result = await publishToInstagram({
    igUserId: '178', accessToken: 'tok', message: 'caption', imageUrl: 'https://img/a.jpg', fetchImpl: fetch,
  })
  assert.deepEqual(result, { ok: true, postId: '17841444' })
  assert.match(calls[0].url, /\/178\/media$/)
  assert.match(calls[1].url, /\/178\/media_publish$/)
})

test('publishToInstagram: container-create failure short-circuits before publish', async () => {
  const { fetch, calls } = makeMockFetch([
    jsonResponse(400, { error: { message: 'Invalid image url', code: 100 } }),
  ])
  const result = await publishToInstagram({
    igUserId: '178', accessToken: 'tok', message: 'x', imageUrl: 'not-a-url', fetchImpl: fetch,
  })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.match(result.error, /Invalid image url/)
    assert.equal(result.code, '100')
  }
  assert.equal(calls.length, 1, 'should not call /media_publish when /media fails')
})

test('publishToInstagram: publish failure surfaces the publish error', async () => {
  const { fetch } = makeMockFetch([
    jsonResponse(200, { id: 'creation-1' }),
    jsonResponse(400, { error: { message: 'Aspect ratio not supported' } }),
  ])
  const result = await publishToInstagram({
    igUserId: '178', accessToken: 'tok', message: 'x', imageUrl: 'https://img/a.jpg', fetchImpl: fetch,
  })
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /Aspect ratio/)
})

test('publishToInstagram: missing creation id in step 1 is treated as failure', async () => {
  const { fetch } = makeMockFetch([jsonResponse(200, {})])
  const result = await publishToInstagram({
    igUserId: '178', accessToken: 'tok', message: 'x', imageUrl: 'https://img/a.jpg', fetchImpl: fetch,
  })
  assert.equal(result.ok, false)
})

test('publishToFacebook: access token is sent in the form body, not the url', async () => {
  const { fetch, calls } = makeMockFetch([jsonResponse(200, { id: '111_222' })])
  await publishToFacebook({ pageId: '111', accessToken: 'super_secret', message: 'hi', fetchImpl: fetch })
  assert.ok(!calls[0].url.includes('super_secret'), 'token must not appear in URL')
  const bodyStr = String(calls[0].init?.body ?? '')
  assert.ok(bodyStr.includes('super_secret'), 'token should be in form body')
})
