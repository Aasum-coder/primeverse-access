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

  const { conversationText, contextText, language, tone, imageBase64 } = body

  if (!conversationText?.trim()) {
    return NextResponse.json({ error: 'Conversation text is required.' }, { status: 400 })
  }

  const langLabel = langNames[language] || 'English'
  const groq = new Groq({ apiKey })

  const langInstruction = langLabel !== 'English'
    ? `\nCRITICAL LANGUAGE RULE: The REPLY section MUST be written entirely in ${langLabel}. Do NOT use English for the reply. The ANALYSIS section can be in English. Brand names (1Move, PrimeVerse, PU Prime, SYSTM8) must stay in English — everything else in the REPLY must be in ${langLabel}.`
    : ''

  const imageNote = imageBase64
    ? '\nNote: The user also provided a screenshot of the conversation for additional context. Use the conversation text provided as the primary source.'
    : ''

  const contextNote = contextText?.trim()
    ? `\n\nAdditional context about this lead: ${contextText.trim()}`
    : ''

  const systemPrompt = `You are an expert sales coach and objection handler for 1Move Academy — a trading education platform and IB (Introducing Broker) network powered by PU Prime. You help IBs craft perfect responses to leads who have objections or questions. You understand trading, financial freedom, passive income, and community-based growth. You always write responses that are authentic, non-pushy, and focused on solving the lead's real concern. Never use aggressive sales tactics.${langInstruction}${imageNote}`

  const userPrompt = `Analyze this conversation/objection and provide:

1. ANALYSIS (2-3 sentences): What is the main objection or concern? What is the lead's underlying fear or hesitation?

2. REPLY: Write a ${tone.toLowerCase()} reply in ${langLabel} that:
- Directly addresses the objection
- Is warm and authentic, not salesy
- Positions 1Move Academy and trading as a solution to their real concern
- Ends with a soft call to action (question or next step)
- Is ready to copy-paste (no placeholders)
- Max 150 words

Conversation/Objection:
${conversationText.trim()}${contextNote}

Format your response EXACTLY as:
ANALYSIS: [your analysis here]
REPLY: [your reply here]`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })

    const content = completion.choices[0]?.message?.content || ''
    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI. Please try again.' }, { status: 500 })
    }

    // Parse ANALYSIS and REPLY sections
    let analysis = ''
    let reply = ''

    const analysisMatch = content.match(/ANALYSIS:\s*([\s\S]*?)(?=\nREPLY:|$)/i)
    const replyMatch = content.match(/REPLY:\s*([\s\S]*)/i)

    if (analysisMatch) {
      analysis = analysisMatch[1].trim()
    }
    if (replyMatch) {
      reply = replyMatch[1].trim()
    }

    // Fallback: if parsing failed, use entire content as reply
    if (!reply) {
      reply = content.trim()
    }

    return NextResponse.json({ analysis, reply })
  } catch (error: unknown) {
    console.error('[ai-reply-assistant] Error:', error)
    if (error instanceof Groq.APIError) {
      return NextResponse.json({ error: `AI error (${error.status}): ${error.message}` }, { status: error.status || 500 })
    }
    return NextResponse.json({ error: 'Failed to generate reply: ' + String(error) }, { status: 500 })
  }
}
