import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const langNames: Record<string, string> = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  es: 'Spanish', ru: 'Russian', ar: 'Arabic', tl: 'Filipino/Tagalog',
  pt: 'Portuguese', th: 'Thai',
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key is not configured.' }, { status: 500 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { type, language } = body
  const langLabel = langNames[language] || 'English'

  const groq = new Groq({ apiKey })

  try {
    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'post') {
      const { platform, topic, tone } = body
      if (!platform || !topic || !tone) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const langInstruction = langLabel !== 'English'
        ? `CRITICAL LANGUAGE RULE: You MUST write your entire response in ${langLabel}. Do NOT use English at all. Every single word must be in ${langLabel}.`
        : ''

      systemPrompt = `You are a social media copywriter. You write posts IN THE FIRST PERSON on behalf of the user. The user IS the IB/entrepreneur writing about their own life and business. NEVER mention the user's name. NEVER refer to the user in third person. NEVER say things like "thanks to [name]" as if someone else introduced them. The user made their own choice to join this opportunity. Write as if YOU ARE the user — use "I", "me", "my" throughout. Keep it authentic, personal and natural.
${langInstruction}

Context: The user is part of 1Move Academy, a premium trading education and financial services ecosystem powered by PrimeVerse.

Write content that:
- Is optimized for ${platform}
- Uses a ${tone} tone
- Is written entirely in FIRST PERSON (I, me, my)
- Does NOT mention anyone by name — no "thanks to [person]", no third-person references
- Includes relevant emojis naturally
- Is engaging and designed for high interaction
- Relates to trading, finance, wealth building, or the 1Move/PrimeVerse ecosystem
- Feels authentic and personal, not corporate
- Brand names (1Move, PrimeVerse, PuPrime, SYSTM8) must stay in English — everything else must be in ${langLabel}

Return ONLY the post text, nothing else. No quotes around it.`

      userPrompt = `Write a ${tone} social media post for ${platform} in ${langLabel} about: ${topic}. Write entirely in first person as the author. Do not mention any person's name. Do not thank anyone by name. The author made their own choices. Keep it under 300 words. Include relevant hashtags at the end.`
    } else if (type === 'caption') {
      const { topic, style } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const captionLangInstruction = langLabel !== 'English'
        ? `CRITICAL LANGUAGE RULE: You MUST write your entire response in ${langLabel}. Do NOT use English at all. Every single word must be in ${langLabel}.`
        : ''

      systemPrompt = `You are a social media caption specialist. You write scroll-stopping captions in FIRST PERSON on behalf of the user. The user IS the author — NEVER mention anyone by name, NEVER refer to the user in third person. Use "I", "me", "my" throughout.
${captionLangInstruction}

Context: The user is part of 1Move Academy / PrimeVerse trading ecosystem.

Write a caption that:
- Is short and punchy (1-3 sentences max)
- Is written in FIRST PERSON (I, me, my)
- Does NOT mention anyone by name
- Includes 2-4 relevant emojis
- Creates curiosity or engagement
- Relates to trading, finance, wealth building, or lifestyle
- Style: ${style || 'engaging'}
- Brand names (1Move, PrimeVerse, PuPrime, SYSTM8) must stay in English — everything else must be in ${langLabel}

Return ONLY the caption text in ${langLabel}. Then on a new line, add "---" and suggest 5 emoji combinations that would work well with this caption (one per line).`

      userPrompt = `Write a first-person caption in ${langLabel} for: ${topic}. Do not mention any person's name.`
    } else if (type === 'hashtags') {
      const { topic, platform } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const hashtagLangNote = language !== 'en'
        ? `CRITICAL LANGUAGE RULE: You MUST include hashtags in ${langLabel}. At least half of the hashtags in each category should be in ${langLabel}. Mix ${langLabel} and English hashtags for maximum reach in ${langLabel}-speaking markets.`
        : ''

      systemPrompt = `You are a hashtag research expert for trading, finance, and the 1Move Academy / PrimeVerse ecosystem.

Research and suggest 30 relevant hashtags for the given niche/topic, optimized for ${platform || 'Instagram'}.
${hashtagLangNote}

Return the hashtags in this exact JSON format (no markdown, no code fences):
{
  "top": ["hashtag1", "hashtag2", ...],
  "medium": ["hashtag1", "hashtag2", ...],
  "niche": ["hashtag1", "hashtag2", ...]
}

- "top": 10 high-competition, high-volume hashtags (popular, broad reach)
- "medium": 10 medium-competition hashtags (balanced reach and relevance)
- "niche": 10 low-competition, high-relevance hashtags (targeted, specific)

Each hashtag must start with #. Make them realistic and currently trending.`

      userPrompt = `Find hashtags in ${langLabel} for: ${topic}`
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content || ''
    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI. Please try again.' }, { status: 500 })
    }

    if (type === 'hashtags') {
      let cleaned = content.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      try {
        const hashtags = JSON.parse(cleaned)
        return NextResponse.json({ hashtags })
      } catch {
        return NextResponse.json({ error: 'Failed to parse hashtag data. Please try again.' }, { status: 500 })
      }
    }

    return NextResponse.json({ content: content.trim() })
  } catch (error: unknown) {
    console.error('[ai-marketing] Error:', error)
    if (error instanceof Groq.APIError) {
      return NextResponse.json({ error: `AI error (${error.status}): ${error.message}` }, { status: error.status || 500 })
    }
    return NextResponse.json({ error: 'Failed to generate content: ' + String(error) }, { status: 500 })
  }
}
