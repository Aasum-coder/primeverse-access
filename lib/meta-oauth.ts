// HMAC-signed OAuth state for the Meta connect flow.
//
// The OAuth callback receives ?state=… from the user's browser via a Meta
// redirect. Without a signature, anyone could craft a callback URL that
// upserts a Meta connection onto an arbitrary distributor_id. The signed
// state pins the callback to the distributor that initiated the connect
// (signed at request time with META_APP_SECRET), and bounds the window
// to 10 minutes so a leaked URL stops working quickly.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

interface StatePayload {
  distributor_id: string
  nonce: string
  expires_at: number
}

function getSecret(): string {
  const secret = process.env.META_APP_SECRET
  if (!secret) throw new Error('META_APP_SECRET is not configured')
  return secret
}

function base64urlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  return Buffer.from(padded, 'base64')
}

function sign(payloadB64: string, secret: string): string {
  return base64urlEncode(createHmac('sha256', secret).update(payloadB64).digest())
}

export function signOAuthState(distributorId: string, now: number = Date.now()): string {
  const payload: StatePayload = {
    distributor_id: distributorId,
    nonce: randomBytes(16).toString('hex'),
    expires_at: now + STATE_TTL_MS,
  }
  const payloadB64 = base64urlEncode(JSON.stringify(payload))
  const sig = sign(payloadB64, getSecret())
  return `${payloadB64}.${sig}`
}

export function verifyOAuthState(
  state: string | null | undefined,
  now: number = Date.now(),
): { distributorId: string } | null {
  if (!state || typeof state !== 'string') return null

  const dot = state.indexOf('.')
  if (dot <= 0 || dot === state.length - 1) return null

  const payloadB64 = state.slice(0, dot)
  const sig = state.slice(dot + 1)

  let secret: string
  try {
    secret = getSecret()
  } catch {
    return null
  }

  const expected = sign(payloadB64, secret)
  const sigBuf = Buffer.from(sig, 'utf8')
  const expBuf = Buffer.from(expected, 'utf8')
  if (sigBuf.length !== expBuf.length) return null
  if (!timingSafeEqual(sigBuf, expBuf)) return null

  let payload: StatePayload
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8')) as StatePayload
  } catch {
    return null
  }

  if (typeof payload.distributor_id !== 'string' || payload.distributor_id.length === 0) return null
  if (typeof payload.expires_at !== 'number' || payload.expires_at <= now) return null

  return { distributorId: payload.distributor_id }
}

// Logging helper — truncate ids longer than 20 chars to first 12.
export function shortId(id: string | null | undefined): string {
  if (!id) return '<none>'
  return id.length > 20 ? id.slice(0, 12) : id
}
