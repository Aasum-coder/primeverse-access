import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key is not configured.' }, { status: 500 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { platforms, timezone, language, goals } = body
  if (!platforms?.length || !timezone || !language) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const groq = new Groq({ apiKey })

  const systemPrompt = `You are a social media strategist for IB partners at 1Move Academy — a trading education and financial freedom community. You create weekly content calendars that build audience, generate leads, and position the IB as an authority.`

  const userPrompt = `Create a 7-day social media posting plan for someone promoting 1Move Academy on ${platforms.join(', ')}.
Timezone: ${timezone}
Language: ${language}
Goals: ${goals || 'Build audience and generate leads'}

For each day provide 1-2 posts. Each post must have:
- day: (Monday-Sunday)
- time: best posting time in their timezone (e.g. 18:00)
- platform: which platform
- hook: the opening line only (max 10 words)
- topic: what the post is about
- post_type: post or story

Respond ONLY with valid JSON array, no markdown:
[{ "day": "...", "time": "...", "platform": "...", "hook": "...", "topic": "...", "post_type": "..." }]`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content || ''
    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 })
    }

    let cleaned = content.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    try {
      const plan = JSON.parse(cleaned)
      return NextResponse.json({ plan })
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI plan. Please try again.' }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('[content-calendar/ai-plan] Error:', error)
    return NextResponse.json({ error: 'Failed to generate plan: ' + String(error) }, { status: 500 })
  }
}
