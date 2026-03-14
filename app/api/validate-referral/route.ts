import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { referral_link } = body
  if (!referral_link || typeof referral_link !== 'string') {
    return NextResponse.json({ valid: false, error: 'Referral link is required' }, { status: 400 })
  }

  const trimmed = referral_link.trim()
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : 'https://' + trimmed)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (host !== 'puvip.co' || !url.pathname.toLowerCase().startsWith('/la-partners')) {
      return NextResponse.json({ valid: false, error: 'Only PuPrime partner links are accepted (must start with https://puvip.co/la-partners/)' }, { status: 400 })
    }
    url.protocol = 'https:'
    return NextResponse.json({ valid: true, normalized: url.toString() })
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid URL format' }, { status: 400 })
  }
}
