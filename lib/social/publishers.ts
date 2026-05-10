// Graph API publishers for the scheduled-posts cron. Two platforms:
//
//   • Facebook Page  — single POST to /{pageId}/feed (text-only)
//                      or /{pageId}/photos (with image).
//
//   • Instagram Business — two-step container flow:
//                      1) POST /{igUserId}/media          → returns creation_id
//                      2) POST /{igUserId}/media_publish  → returns post_id
//                      IG REQUIRES a public image url; text-only is rejected.
//
// Both functions return a discriminated union so the cron can record
// granular failure reasons instead of a generic "post failed".

const META_API_VERSION = 'v19.0'

export type PublishResult =
  | { ok: true; postId: string }
  | { ok: false; error: string; code?: string }

interface FbArgs {
  pageId: string
  accessToken: string
  message: string
  imageUrl?: string | null
  fetchImpl?: typeof fetch
}

interface IgArgs {
  igUserId: string
  accessToken: string
  message: string
  imageUrl: string
  fetchImpl?: typeof fetch
}

function readGraphError(body: unknown, fallback: string): { error: string; code?: string } {
  if (body && typeof body === 'object' && 'error' in body) {
    const e = (body as { error?: { message?: unknown; code?: unknown } }).error || {}
    const message = typeof e.message === 'string' ? e.message : fallback
    const code = typeof e.code === 'number' ? String(e.code) : typeof e.code === 'string' ? e.code : undefined
    return { error: message, code }
  }
  return { error: fallback }
}

export async function publishToFacebook(args: FbArgs): Promise<PublishResult> {
  const fetchImpl = args.fetchImpl ?? fetch
  const endpoint = args.imageUrl
    ? `https://graph.facebook.com/${META_API_VERSION}/${args.pageId}/photos`
    : `https://graph.facebook.com/${META_API_VERSION}/${args.pageId}/feed`

  const params = new URLSearchParams()
  if (args.imageUrl) {
    params.set('url', args.imageUrl)
    params.set('caption', args.message)
  } else {
    params.set('message', args.message)
  }
  params.set('access_token', args.accessToken)

  let res: Response
  try {
    res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, ...readGraphError(body, `Facebook API ${res.status}`) }
  }
  // /feed returns { id: "<pageId>_<postId>" }; /photos returns { id, post_id }
  const postId = (body as { post_id?: string; id?: string }).post_id || (body as { id?: string }).id
  if (!postId) {
    return { ok: false, error: 'Facebook API returned no post id' }
  }
  return { ok: true, postId }
}

export async function publishToInstagram(args: IgArgs): Promise<PublishResult> {
  const fetchImpl = args.fetchImpl ?? fetch
  // Step 1 — create the media container.
  let containerRes: Response
  try {
    const params = new URLSearchParams()
    params.set('image_url', args.imageUrl)
    params.set('caption', args.message)
    params.set('access_token', args.accessToken)
    containerRes = await fetchImpl(
      `https://graph.facebook.com/${META_API_VERSION}/${args.igUserId}/media`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params },
    )
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }
  const containerBody = await containerRes.json().catch(() => ({}))
  if (!containerRes.ok) {
    return { ok: false, ...readGraphError(containerBody, `Instagram container ${containerRes.status}`) }
  }
  const creationId = (containerBody as { id?: string }).id
  if (!creationId) {
    return { ok: false, error: 'Instagram container returned no creation id' }
  }

  // Step 2 — publish the container.
  let publishRes: Response
  try {
    const params = new URLSearchParams()
    params.set('creation_id', creationId)
    params.set('access_token', args.accessToken)
    publishRes = await fetchImpl(
      `https://graph.facebook.com/${META_API_VERSION}/${args.igUserId}/media_publish`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params },
    )
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }
  const publishBody = await publishRes.json().catch(() => ({}))
  if (!publishRes.ok) {
    return { ok: false, ...readGraphError(publishBody, `Instagram publish ${publishRes.status}`) }
  }
  const postId = (publishBody as { id?: string }).id
  if (!postId) {
    return { ok: false, error: 'Instagram publish returned no post id' }
  }
  return { ok: true, postId }
}
