import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

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

  const { type, language, distributorId, voice_profile } = body
  const langLabel = langNames[language] || 'English'

  // Build voice context from profile
  const vp = voice_profile || {}
  const voiceContext = vp && Object.keys(vp).length > 0 && (vp.experience || vp.tone || vp.never_say || vp.audience || vp.example1)
    ? `
CRITICAL: You are writing on behalf of a real person. Match their voice exactly.
WHO THEY ARE: ${vp.experience || ''}
THEIR TONE: ${vp.tone || ''}
NEVER USE THESE PHRASES OR STYLES: ${vp.never_say || ''}
THEIR AUDIENCE: ${vp.audience || ''}
${vp.example1 ? `EXAMPLE OF HOW THEY WRITE:\n${vp.example1}` : ''}
${vp.example2 ? `SECOND EXAMPLE:\n${vp.example2}` : ''}
Write as if you ARE this person. Short lines. No emojis unless they use them. No hype. No generic phrases. Sound human and credible.
` : ''

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

      // Fetch last 5 posts for anti-repetition
      let previousPostsBlock = ''
      if (distributorId) {
        const { data: prevPosts } = await supabaseAdmin
          .from('generated_posts')
          .select('content')
          .eq('distributor_id', distributorId)
          .eq('platform', platform)
          .order('created_at', { ascending: false })
          .limit(5)
        if (prevPosts && prevPosts.length > 0) {
          const postTexts = prevPosts.map((p, i) => `--- Post ${i + 1}: ${p.content}`).join('\n')
          previousPostsBlock = `\n\nPREVIOUS POSTS — DO NOT repeat these openings, structures, or themes:\n${postTexts}`
        }
      }

      systemPrompt = `${voiceContext}You are a world-class social media ghostwriter. You write SHORT, punchy, human posts IN THE FIRST PERSON for trading community members.

ABSOLUTE RULES — no exceptions:
1. Max 80 words. Not 100. Not 90. 80.
2. Every post MUST use a completely different hook style from the list: question / bold claim / micro-story / surprising fact / unpopular opinion / before-and-after / one-liner / challenge to reader
3. NEVER use the same opening word or phrase as any previous post
4. NEVER use these words: journey, blessed, game-changer, amazing, incredible, excited, grateful (unless used ironically)
5. Sound like a real person texting a friend — not a motivational poster
6. ONE call to action at the end — max one sentence
7. 3-5 hashtags only — make them specific, not generic

If previous posts are provided, treat them as FORBIDDEN territory. Different angle, different emotion, different structure — every single time.
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
- Brand names (1Move, PrimeVerse, PuPrime, SYSTM8) must stay in English — everything else must be in ${langLabel}

Return ONLY the post text, nothing else. No quotes around it.`

      userPrompt = `Write a ${tone} social media post for ${platform} in ${langLabel} about: ${topic}. Write entirely in first person as the author. Do not mention any person's name. Do not thank anyone by name. The author made their own choices. Keep it under 80 words not counting hashtags. Include 3-5 specific hashtags at the end.${previousPostsBlock}${previousPostsBlock ? '\n\nCRITICAL: The post you write must be completely different from ALL previous posts above — different hook, different angle, different emotional tone, different sentence structure. If the previous post was motivational, be practical. If it was a question, use a bold statement. Rotate completely.' : ''}`
    } else if (type === 'caption') {
      const { topic, style } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const captionLangInstruction = langLabel !== 'English'
        ? `CRITICAL LANGUAGE RULE: You MUST write your entire response in ${langLabel}. Do NOT use English at all. Every single word must be in ${langLabel}.`
        : ''

      systemPrompt = `${voiceContext}You are a social media caption specialist. You write scroll-stopping captions in FIRST PERSON on behalf of the user. The user IS the author — NEVER mention anyone by name, NEVER refer to the user in third person. Use "I", "me", "my" throughout. Max 50 words not counting hashtags. Sound human and authentic. NEVER start with "I just" or "Excited to".
${captionLangInstruction}

Context: The user is part of 1Move Academy / PrimeVerse trading ecosystem.

Write a caption that:
- Is short and punchy (1-3 sentences max, 50 words max not counting hashtags)
- Is written in FIRST PERSON (I, me, my)
- Does NOT mention anyone by name
- Does NOT start with "I just" or "Excited to"
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

      systemPrompt = `${voiceContext}You are a hashtag research expert for trading, finance, and the 1Move Academy / PrimeVerse ecosystem.

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

    // Save generated post to history for anti-repetition
    if (type === 'post' && distributorId) {
      const { platform, topic, tone } = body
      supabaseAdmin.from('generated_posts').insert({
        distributor_id: distributorId,
        platform,
        topic,
        tone,
        language: language || 'en',
        content: content.trim(),
      }).then(() => {}, () => {})
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
