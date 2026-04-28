import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import {
  errorResponse,
  getUserIdFromRequest,
  successResponse,
  unauthorizedResponse,
} from '@/lib/voice/auth'
import { groq, GROQ_MODEL } from '@/lib/voice/ai-clients'
import { aiSuggestRequestSchema, type AiSuggestRequest } from '@/lib/voice/validation'

// POST /api/voice/ai-suggest
// Groq-powered builder inspiration. JSON-only output via response_format.

type Step = AiSuggestRequest['step']

const SUGGEST_PROMPTS: Record<Step, (ctx: string, current?: unknown[]) => string> = {
  topics: (ctx, current) => `Based on this IB's context, suggest 5 trading-related topics they could speak with authority on.

Their context: ${ctx}
${current?.length ? `They already have: ${(current as string[]).join(', ')}. Suggest 5 DIFFERENT ones.` : ''}

Output JSON: { "suggestions": ["topic 1", "topic 2", ...] }
Each topic 2-5 words. Specific, not generic.`,

  audience: ctx => `Based on this IB's context, suggest 3 ways to describe their target audience.

Their context: ${ctx}

Output JSON: { "suggestions": ["audience description 1", ...] }
Each 30-150 chars. Be specific about demographics, experience level, pain points.`,

  tone: ctx => `Suggest tone combinations from: educational, motivational, technical, casual, bold, empathetic, direct, story-driven.

Their context: ${ctx}

Output JSON: { "suggestions": [["tone1", "tone2"], ["tone3"], ...] }
Suggest 3 different combinations of 1-3 tones each.`,

  dos: (ctx, current) => `Suggest 5 "DO" rules for an AI that writes content as this person.

Their context: ${ctx}
${current?.length ? `Already have: ${(current as string[]).join('; ')}. Suggest 5 DIFFERENT.` : ''}

Output JSON: { "suggestions": ["rule 1", ...] }
Each 30-150 chars. Action-oriented. Specific.`,

  donts: (ctx, current) => `Suggest 5 "DON'T" rules for an AI that writes content as this person.

Their context: ${ctx}
${current?.length ? `Already have: ${(current as string[]).join('; ')}. Suggest 5 DIFFERENT.` : ''}

Output JSON: { "suggestions": ["rule 1", ...] }
Each 30-150 chars. Specific things to avoid. Include compliance items if trading-related.`,

  signature_phrases: ctx => `Suggest 5 signature phrases this person might use — short, memorable, distinctive.

Their context: ${ctx}

Output JSON: { "suggestions": ["phrase 1", ...] }
Each 5-50 chars. These will NOT be translated, so write in the language the person speaks naturally.`,
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return unauthorizedResponse()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('validation_failed', 'Body must be JSON', 400)
  }

  let parsed: AiSuggestRequest
  try {
    parsed = aiSuggestRequestSchema.parse(body)
  } catch (err) {
    const details = err instanceof ZodError ? err.issues : undefined
    return errorResponse('validation_failed', 'Invalid request', 400, details)
  }

  const promptBuilder = SUGGEST_PROMPTS[parsed.step]
  const prompt = promptBuilder(parsed.context, parsed.currentValues)

  let raw: string
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })
    raw = completion.choices[0]?.message?.content ?? ''
  } catch (err) {
    console.error('[voice/ai-suggest] Groq call failed for user', userId, parsed.step, err)
    return errorResponse('ai_error', 'AI suggestion failed', 502)
  }

  let suggestions: unknown
  try {
    const obj = JSON.parse(raw)
    suggestions = obj?.suggestions
  } catch (err) {
    console.error('[voice/ai-suggest] JSON parse failed for user', userId, parsed.step, err, raw)
    return errorResponse('ai_error', 'AI returned malformed JSON', 502)
  }

  if (!Array.isArray(suggestions)) {
    return errorResponse('ai_error', 'AI response missing suggestions array', 502)
  }

  return successResponse({ suggestions })
}
