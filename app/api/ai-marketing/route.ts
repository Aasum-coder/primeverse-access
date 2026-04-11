import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const langNames: Record<string, string> = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  es: 'Spanish', ru: 'Russian', ar: 'Arabic', tl: 'Filipino/Tagalog',
  pt: 'Portuguese', th: 'Thai',
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key is not configured.' }, { status: 500 })
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
  const hasVoice = vp && Object.keys(vp).length > 0 && (vp.experience || vp.tone || vp.never_say || vp.audience || vp.example1)
  const voiceContext = hasVoice
    ? `
VOICE PROFILE — THE REAL PERSON YOU ARE WRITING AS:
- Who they are: ${vp.experience || '(not specified)'}
- Their natural tone: ${vp.tone || '(not specified)'}
- Their audience: ${vp.audience || '(not specified)'}
- Phrases / styles they would NEVER use: ${vp.never_say || '(not specified)'}
${vp.example1 ? `- How they actually write (example 1):\n"""\n${vp.example1}\n"""` : ''}
${vp.example2 ? `- How they actually write (example 2):\n"""\n${vp.example2}\n"""` : ''}

You must match this voice exactly. Cadence, vocabulary, sentence length, level of formality — all of it. If their examples use short sentences, you use short sentences. If they swear, you can swear. If they never use emojis, you never use emojis. Sound like THEM, not like an AI writing about them.
`
    : `
VOICE PROFILE — NOT PROVIDED:
No voice profile was supplied. Default to a grounded, credible, human voice — someone with real experience who speaks plainly. No hype. No marketing-speak. No AI tells. Short sentences. Specific details. Think "experienced practitioner talking to a peer", not "brand account broadcasting to followers".
`

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

      // Step 1 — Build identity string from voice_profile
      const identity = voice_profile ? `
You are ${voice_profile.experience || 'an experienced marketer and trading enthusiast'}.
Your tone is: ${voice_profile.tone || 'direct and credible'}.
Your audience: ${voice_profile.audience || 'people who want more from life'}.
You never say things like: ${voice_profile.never_say || 'I just discovered, amazing opportunity, level up'}.
` : `You are an experienced marketer in the trading education space.
Your tone is direct and credible. No hype. No generic phrases.`

      // Step 2 — Build examples string from voice_profile
      const examples = voice_profile?.example1 ? `
This is exactly how you write. Study this and match the style precisely:

YOUR WRITING EXAMPLE:
${voice_profile.example1}
${voice_profile.example2 ? `\nANOTHER EXAMPLE:\n${voice_profile.example2}` : ''}
` : `
This is how you write:
---
Something most people don't realize about copytrading:

You're not just copying trades.
You're copying years of experience.

The trader you follow has already made the mistakes.
Already learned when to hold. When to cut.

You just get the result.

That's why I use it — not because it's passive income.
But because it lets me learn from people who are better than me.

Is that cheating? I don't think so.
I think it's smart.
---`

      // Step 3 — Build the full system prompt
      systemPrompt = `
${identity}

${examples}

THIS IS WHAT BAD OUTPUT LOOKS LIKE — NEVER DO THIS:
---
I'm minimizing risk with copytrading 📊. My portfolio's consistency is now my top priority.
Check them out! #CopyTradingStrategy #RiskManagement #1MoveAcademy
---
That output is generic, robotic, and sounds nothing like a real person. Avoid it completely.

NOW: You are about to post on ${platform}.

Platform format rules:
- Facebook: 4-10 short lines. One sentence per line. No hashtags. End with a thought or soft question.
- Instagram: Hook on line 1. 4-6 lines. Max 5 hashtags at the very end.
- TikTok: 2-3 lines only. Scroll-stopping first line. One CTA.
- LinkedIn: 3-5 paragraphs. Insight-driven. No emojis.
- X/Twitter: Max 2 sentences. Under 280 chars.

Tone for this post: ${tone}
Topic: ${topic}
Language: ${langLabel} — write EVERY word in ${langLabel}. This is non-negotiable.
${langInstruction}

Write the post now.
Return ONLY the post text.
No intro. No explanation. No "Here is your post".
Just the post, ready to publish.
`

      userPrompt = `Write one ${tone} ${platform} post in ${langLabel} about: ${topic}.

Remember: you ARE this person. Not writing on their behalf — you are them. First person. No name mentions. Match the writing example's cadence exactly.${previousPostsBlock}${previousPostsBlock ? '\n\nThe post you write MUST be completely different from every previous post above — different hook style, different opening word, different angle, different emotional beat, different sentence structure. If a previous post was a question, do not open with a question. If it was a story, do not tell a story. Rotate fully.' : ''}`
    } else if (type === 'caption') {
      const { topic, style } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const captionLangInstruction = langLabel !== 'English'
        ? `CRITICAL LANGUAGE RULE: You MUST write your entire response in ${langLabel}. Do NOT use English at all. Every single word must be in ${langLabel}.`
        : ''

      systemPrompt = `You are a ghostwriter. You write image captions on behalf of a real person.
Your job is to sound EXACTLY like them — not like an AI, not like a marketing template.
The caption accompanies an image, so it should complement — not re-describe — what the reader is already seeing.
${voiceContext}
PLATFORM / STYLE CONTEXT: ${style || 'engaging'}

CAPTION RULES:
- 1-3 sentences. 50 words max. Shorter is better.
- First person only (I, me, my). You ARE the author.
- Never mention anyone by name. Never third-person references to the author.
- Never start with "I just", "Excited to", "Thrilled to", "Happy to announce", "Did you know".
- Open with something that earns attention in the first 5 words.
- Complement the image — imply, reference, or react to what's shown. Do not literally describe it.
- End with curiosity, a soft question, or a line that sticks. Not a hard sell.
- Max 2 emojis. Only if they add meaning. Never decorative.
- Never use: "game-changer", "level up", "dive in", "cutting-edge", "amazing opportunity", "journey", "blessed", "amazing", "incredible", "excited", "grateful", "unlock", "elevate", "thrive".
- Brand names (1Move, PrimeVerse, PuPrime, SYSTM8) stay in English — everything else must be in ${langLabel}.

TONE RULES for ${style || 'engaging'}:
- Professional: credible and structured, no slang.
- Casual: conversational, short, like texting a friend.
- Motivational: real energy, no hype. Outcome over promise.
- Educational: teach one thing using contrast.
- Engaging (default): make the reader stop scrolling and think.

NO HASHTAGS. Hashtags come from a separate tool. Do not include any # symbols.

LANGUAGE: Write entirely in ${langLabel}. Every word. ${captionLangInstruction}

GOOD EXAMPLE (casual, lifestyle/trading image):
---
Three years ago I couldn't read a chart.

Now I'm the one people ask.

Not because I'm smart — because I didn't quit when it was boring.
---

BAD EXAMPLE (never produce this):
---
I just had an amazing day working on my trading journey! 🚀✨ So excited to share this game-changer with all of you! 💎📈 #trading #lifestyle #blessed
---

OUTPUT: Return ONLY the caption text. No hashtags. No emoji suggestions. No "Here is your caption:". No quotes. Nothing else.`

      userPrompt = `Write one first-person caption in ${langLabel} for an image about: ${topic}. Follow every rule. No hashtags. No name mentions. Sound like the voice profile.`
    } else if (type === 'hashtags') {
      const { topic, platform } = body
      if (!topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      const hashtagLangNote = language !== 'en'
        ? `CRITICAL LANGUAGE RULE: You MUST include hashtags in ${langLabel}. At least half of the hashtags in each category should be in ${langLabel}. Mix ${langLabel} and English hashtags for maximum reach in ${langLabel}-speaking markets.`
        : ''

      systemPrompt = `You are a hashtag research specialist. You do not write marketing copy. You only surface real, currently-used hashtags that native users of ${platform || 'Instagram'} would actually search or follow.
${voiceContext}
OBJECTIVE:
Return a curated hashtag set for the given topic on ${platform || 'Instagram'}, grouped by reach tier. Quality over quantity. Every hashtag must be one a real person in this niche would actually use.

HARD RULES:
- Every hashtag must start with #, single word, no spaces, no punctuation.
- No hashtags that include brand names such as #1MoveAcademy, #PrimeVerse, #PuPrime, #SYSTM8 — unless the user's topic explicitly names that brand.
- No fake or made-up hashtags. No "#MyTradingVibes" style filler.
- No banned fluff words: #blessed, #grateful, #amazing, #hustle, #grindmode, #motivationmonday, #journey, #lifestyle (unless topic is literally about lifestyle).
- No duplicates across the three groups.
- Hashtags must match the ${platform || 'Instagram'} culture (e.g. TikTok uses shorter, trendier tags; LinkedIn uses longer, professional ones; Twitter/X uses almost none).
${hashtagLangNote}

GROUPING — return EXACTLY:
- "top": 2 broad, high-volume hashtags (millions of posts, wide reach, low targeting).
- "medium": 4 mid-niche hashtags (tens of thousands to low millions, balanced reach and relevance).
- "niche": 3 very specific hashtags (targeted, lower volume, high-intent audience).

Total: 9 hashtags. Not 10. Not 30. 9.

OUTPUT FORMAT — JSON only, no markdown, no code fences, no commentary:
{
  "top": ["#example1", "#example2"],
  "medium": ["#example1", "#example2", "#example3", "#example4"],
  "niche": ["#example1", "#example2", "#example3"]
}

GOOD EXAMPLE (topic: "copytrading", platform: Instagram):
{
  "top": ["#trading", "#forex"],
  "medium": ["#copytrading", "#forextrader", "#tradingcommunity", "#forexsignals"],
  "niche": ["#copytradingforex", "#passiveforex", "#tradingmentorship"]
}

BAD EXAMPLE (never produce this):
{
  "top": ["#blessed", "#grindmode", "#amazing", "#1MoveAcademy"],
  "medium": ["#tradingjourney", "#investmentvibes"],
  "niche": ["#PrimeVerseLife"]
}

Return the JSON object only. Nothing before it. Nothing after it.`

      userPrompt = `Research hashtags for ${platform || 'Instagram'} on the topic: ${topic}. Language preference: ${langLabel}. Return only the JSON with exactly 2 top, 4 medium, 3 niche hashtags. No brand names unless the topic explicitly mentions them.`
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : ''
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
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI error (${error.status}): ${error.message}` }, { status: error.status || 500 })
    }
    return NextResponse.json({ error: 'Failed to generate content: ' + String(error) }, { status: 500 })
  }
}
