import { createHmac, timingSafeEqual } from 'crypto'

// Stateless welcome-link token used by the new unlock flow.
//
//   <base64url(JSON.stringify(payload))> . <base64url(HMAC_SHA256(payload, secret))>
//
// Stored nowhere — the signature plus the exp claim are the only
// guard. The unlock UI calls verifyWelcomeToken on the server before
// rendering the form, and /api/welcome/verify re-validates on every
// submit so a tampered payload (different email / leadId) is rejected.
//
// TTL is 7 days — long enough to cover an IB who clicks the welcome
// email a few days after signup, short enough that a leaked link
// stops working before it can be abused.

const TOKEN_TTL_DAYS = 7

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(input: string): Buffer {
  const pad = 4 - (input.length % 4)
  const padded = input + (pad < 4 ? '='.repeat(pad) : '')
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

interface WelcomeTokenPayload {
  email: string
  leadId: string
  iat: number
  exp: number
}

export function signWelcomeToken(email: string, leadId: string): string {
  const secret = process.env.WELCOME_TOKEN_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('WELCOME_TOKEN_SECRET missing or too short (need 32+ chars)')
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: WelcomeTokenPayload = {
    email: email.toLowerCase().trim(),
    leadId,
    iat: now,
    exp: now + TOKEN_TTL_DAYS * 24 * 60 * 60,
  }

  const payloadB64 = base64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(payloadB64).digest()
  const sigB64 = base64url(sig)

  return `${payloadB64}.${sigB64}`
}

export function verifyWelcomeToken(token: string): WelcomeTokenPayload | null {
  const secret = process.env.WELCOME_TOKEN_SECRET
  if (!secret || secret.length < 32) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest()
  const providedSig = base64urlDecode(sigB64)
  if (expectedSig.length !== providedSig.length) return null
  if (!timingSafeEqual(expectedSig, providedSig)) return null

  let payload: WelcomeTokenPayload
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8'))
  } catch {
    return null
  }

  if (typeof payload.email !== 'string' || typeof payload.leadId !== 'string') return null
  if (typeof payload.exp !== 'number') return null
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp < now) return null

  return payload
}
