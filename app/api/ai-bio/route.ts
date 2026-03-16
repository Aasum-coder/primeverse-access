import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are a conversion copywriter helping a 1Move Academy representative write their personal bio for a landing page. The bio will appear where people sign up for PrimeVerse, a premium trading education ecosystem. Help them write a bio that is authentic, inspiring, and optimized for conversion. It should feel personal, warm, and credible. 3-5 sentences. Ask follow-up questions to make it personal. When ready, write the bio and prefix it with exactly: "Here is your bio:" followed by the bio in quotes.',
        messages,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ reply: 'API error: ' + (data.error?.message || res.status) }, { status: 500 })
    }

    const reply = data.content?.[0]?.text || 'No response from AI.'
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI bio error:', error)
    return NextResponse.json({ reply: 'Server error: ' + String(error) }, { status: 500 })
  }
}
