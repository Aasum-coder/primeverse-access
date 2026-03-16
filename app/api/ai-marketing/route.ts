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

  const { type, language, name } = body
  const langLabel = langNames[language] || 'English'
  const nameNote = name ? `The IB partner's name is "${name}".` : ''

  const groq = new Groq({ apiKey })

  try {
    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'post') {
      const { platform, topic, tone } = body
      if (!platform || !topic || !tone) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      systemPrompt = `You are a social media marketing expert for 1Move Academy, a premium trading education and financial services ecosystem powered by PrimeVerse. You create engaging social media posts for IB (Introducing Broker) partners.

Write content that:
- Is optimized for ${platform}
- Uses a ${tone} tone
- Includes relevant emojis naturally
- Is engaging and designed for high interaction
- Relates to trading, finance, wealth building, or the 1Move/PrimeVerse ecosystem
- Feels authentic and personal, not corporate
${nameNote}

Write in ${langLabel}. Return ONLY the post text, nothing else. No quotes around it.`

      userPrompt = `Write a ${platform} post about: ${topic}`
    } else if (type === 'caption') {
      const { topic, style } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      systemPrompt = `You are a social media caption specialist for 1Move Academy / PrimeVerse trading ecosystem. You write scroll-stopping captions for images and videos.

Write a caption that:
- Is short and punchy (1-3 sentences max)
- Includes 2-4 relevant emojis
- Creates curiosity or engagement
- Relates to trading, finance, wealth building, or lifestyle
- Style: ${style || 'engaging'}
${nameNote}

Write in ${langLabel}. Return ONLY the caption text. Then on a new line, add "---" and suggest 5 emoji combinations that would work well with this caption (one per line).`

      userPrompt = `Write a caption for: ${topic}`
    } else if (type === 'hashtags') {
      const { topic, platform } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const mixLangNote = language !== 'en' ? `Mix both English and ${langLabel} hashtags for maximum reach.` : ''

      systemPrompt = `You are a hashtag research expert for trading, finance, and the 1Move Academy / PrimeVerse ecosystem.

Research and suggest 30 relevant hashtags for the given niche/topic, optimized for ${platform || 'Instagram'}.
${mixLangNote}

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

      userPrompt = `Find hashtags for: ${topic}`
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
