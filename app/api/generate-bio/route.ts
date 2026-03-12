import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const langNames: Record<string, string> = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  es: 'Spanish', ru: 'Russian', ar: 'Arabic', tl: 'Filipino/Tagalog',
}

const langCodes = ['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl']

export async function POST(request: Request) {
  const { answers, language, tone } = await request.json()
  if (!answers || !language || !tone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
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

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content || ''

    // Parse JSON from response, handling potential markdown fences
    let cleaned = content.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const bios = JSON.parse(cleaned)
    return NextResponse.json({ bios })
  } catch (error) {
    console.error('Generate bio error:', error)
    return NextResponse.json({ error: 'Failed to generate bio: ' + String(error) }, { status: 500 })
  }
}
