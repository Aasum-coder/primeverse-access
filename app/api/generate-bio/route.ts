import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const langNames: Record<string, string> = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  es: 'Spanish', ru: 'Russian', ar: 'Arabic', tl: 'Filipino/Tagalog',
}

const langCodes = ['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl']

export async function POST(request: Request) {
  console.log('[generate-bio] Request received')

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[generate-bio] OPENAI_API_KEY is not set in environment')
    return NextResponse.json({ error: 'OpenAI API key is not configured. Add OPENAI_API_KEY to your environment variables.' }, { status: 500 })
  }
  console.log('[generate-bio] API key found, length:', apiKey.length, 'starts with:', apiKey.substring(0, 7) + '...')

  let body
  try {
    body = await request.json()
  } catch (e) {
    console.error('[generate-bio] Failed to parse request body:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { answers, language, tone } = body
  console.log('[generate-bio] Request body:', JSON.stringify({ answers, language, tone }))

  if (!answers || !language || !tone) {
    console.error('[generate-bio] Missing fields:', { hasAnswers: !!answers, hasLanguage: !!language, hasTone: !!tone })
    return NextResponse.json({ error: 'Missing required fields: answers, language, and tone are all required' }, { status: 400 })
  }

  const toneMap: Record<string, string> = {
    professional: 'professional, polished, and confident',
    casual: 'casual, friendly, and approachable',
    motivational: 'motivational, inspiring, and energetic',
  }
  const toneDesc = toneMap[tone] || toneMap.professional

  const primaryLang = langNames[language] || 'English'
  const otherLangs = langCodes.filter(c => c !== language).map(c => `"${c}": ${langNames[c]}`).join(', ')

  const systemPrompt = `You are a professional copywriter for 1Move Academy, a premium trading education and financial services ecosystem. You write personal bios for IB (Introducing Broker) partners who have their own landing pages.

Write a bio that is:
- 3-5 sentences long
- Tone: ${toneDesc}
- Personal and authentic — uses the person's real background and motivations
- Optimized for conversion — makes visitors want to sign up through this person
- Written in third person (e.g. "John is..." not "I am...")

Do NOT include generic marketing phrases. Make it feel real and human.

Return a JSON object with the bio translated into all 7 languages. The primary language is ${primaryLang} ("${language}"). Write the primary language version first, then translate it naturally (not literally) into the other languages.

Return ONLY valid JSON in this exact format, no markdown, no code fences:
{
  "${language}": "bio in ${primaryLang}",
  ${otherLangs.split(', ').map(l => {
    const code = l.split(':')[0].replace(/"/g, '')
    const name = l.split(':')[1].trim()
    return `"${code}": "bio in ${name}"`
  }).join(',\n  ')}
}`

  const userPrompt = `Here are the interview answers:

1. Trading/finance background: ${answers.background || 'Not provided'}
2. Motivation to help others: ${answers.motivation || 'Not provided'}
3. What makes them unique: ${answers.unique || 'Not provided'}
4. Ideal client: ${answers.ideal_client || 'Not provided'}
5. What people can expect: ${answers.expectations || 'Not provided'}

Write the bio now.`

  const openai = new OpenAI({ apiKey })

  try {
    console.log('[generate-bio] Calling OpenAI API with model: gpt-4o')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    console.log('[generate-bio] OpenAI response received, finish_reason:', completion.choices[0]?.finish_reason)
    const content = completion.choices[0]?.message?.content || ''
    console.log('[generate-bio] Raw response content:', content.substring(0, 200) + '...')

    if (!content) {
      console.error('[generate-bio] Empty response from OpenAI')
      return NextResponse.json({ error: 'OpenAI returned an empty response. Please try again.' }, { status: 500 })
    }

    // Parse JSON from response, handling potential markdown fences
    let cleaned = content.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let bios
    try {
      bios = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('[generate-bio] Failed to parse JSON from OpenAI response:', parseError)
      console.error('[generate-bio] Cleaned content was:', cleaned.substring(0, 500))
      return NextResponse.json({ error: 'Failed to parse bio from AI response. Please try again.' }, { status: 500 })
    }

    console.log('[generate-bio] Successfully generated bios for languages:', Object.keys(bios).join(', '))
    return NextResponse.json({ bios })
  } catch (error: unknown) {
    console.error('[generate-bio] OpenAI API error:', error)

    // Extract detailed error info
    if (error instanceof OpenAI.APIError) {
      const msg = `OpenAI API error (${error.status}): ${error.message}`
      console.error('[generate-bio]', msg)
      return NextResponse.json({ error: msg }, { status: error.status || 500 })
    }

    return NextResponse.json({ error: 'Failed to generate bio: ' + String(error) }, { status: 500 })
  }
}
