import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { translateBio } from '@/lib/bio-translator'

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'Groq API key is not configured. Add GROQ_API_KEY to your environment variables.' },
      { status: 500 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch (err) {
    console.error('[translate-bio] Failed to parse request body:', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { bio, fullName } = body || {}
  if (typeof bio !== 'string' || !bio.trim()) {
    return NextResponse.json({ error: 'Missing required field: bio' }, { status: 400 })
  }

  try {
    const { bios } = await translateBio({ bio, fullName })
    return NextResponse.json({ bios })
  } catch (err) {
    if (err instanceof Groq.APIError) {
      const msg = `Groq API error (${err.status}): ${err.message}`
      console.error('[translate-bio]', msg)
      return NextResponse.json({ error: msg }, { status: err.status || 500 })
    }
    console.error('[translate-bio] Failed:', err)
    return NextResponse.json({ error: 'Failed to translate bio: ' + String(err) }, { status: 500 })
  }
}
