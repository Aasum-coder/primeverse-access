import type { NextRequest } from 'next/server'
import {
  errorResponse,
  getUserIdFromRequest,
  successResponse,
  supabaseAdmin,
  unauthorizedResponse,
} from '@/lib/voice/auth'
import { regenerateMissingSteps } from '@/lib/voice/completion'
import { claudeMessage } from '@/lib/voice/ai-clients'
import type { VoiceProfile } from '@/lib/voice/types'

// POST /api/voice/regenerate
// Generates the master English bio + the Post Writer system prompt from
// the user's 8-step input, in parallel. Caches both on the profile row.

function buildBioPrompt(v: VoiceProfile): string {
  const emojiRule =
    v.emoji_usage === 'none'
      ? 'NO emojis.'
      : v.emoji_usage === 'light'
      ? 'Max 1 emoji.'
      : 'Use 2-3 emojis naturally.'

  return `You are writing a 2-3 sentence professional bio for an Introducing Broker (IB) in trading education. The bio appears on their public landing page.

WHO THEY ARE: ${v.identity_one_liner}

WHO THEY SPEAK TO: ${v.audience}

WHAT THEY KNOW: ${(v.topics || []).join(', ')}

HOW THEY SOUND:
- Tone: ${(v.tone || []).join(', ')}
- Formality: ${v.formality}
- Emoji usage: ${v.emoji_usage}

THEIR RULES:
DO: ${(v.dos || []).join('; ')}
DON'T: ${(v.donts || []).join('; ')}

Write the bio in English. 2-3 sentences. Match the tone EXACTLY.

CRITICAL RULES:
- Sound like a real human, not a marketing robot
- DO NOT use the words: "passionate", "journey", "empowering", "unlock", "transform"
- DO NOT start with "I'm a..." or "As a..."
- ${emojiRule}
- Output ONLY the bio text — no quotes, no preamble, no explanation.`
}

function buildSystemPromptGenerator(v: VoiceProfile): string {
  return `Generate a system prompt for an AI that writes social media posts AS this person.

The system prompt will be reused for every post they generate, so make it precise and reusable.

PERSON DATA:
Identity: ${v.identity_one_liner}
Audience: ${v.audience}
Topics: ${(v.topics || []).join(', ')}
Tone: ${(v.tone || []).join(', ')}
Formality: ${v.formality}
Emoji usage: ${v.emoji_usage}
DO's: ${(v.dos || []).join('; ')}
DON'Ts: ${(v.donts || []).join('; ')}
Signature phrases (UNTRANSLATABLE — keep in original language): ${(v.signature_phrases || []).join(', ') || 'none'}

The system prompt you generate must:
1. Tell the AI it IS this person, not assisting them
2. Embed all the data above in clear sections
3. Include compliance rules for IB (PU Prime): no guaranteed returns, no specific buy/sell advice, mention CFD risk when relevant
4. Tell the AI to use signature phrases verbatim, even when post language differs
5. Include a placeholder {{POST_LANGUAGE}} that will be replaced at post-time
6. Be 400-700 words

Output ONLY the system prompt text. No preamble. No markdown headers (use plain section dividers like # WHO YOU ARE).`
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return unauthorizedResponse()

  const { data: existing, error: selectErr } = await supabaseAdmin
    .from('voice_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (selectErr) {
    console.error('[voice/regenerate] select failed for user', userId, selectErr)
    return errorResponse('db_error', 'Failed to load voice profile', 500)
  }
  if (!existing) {
    return errorResponse('not_found', 'Voice profile not found — call /api/voice/get first', 404)
  }

  const profile = existing as VoiceProfile
  const missing = regenerateMissingSteps(profile)
  if (missing.length > 0) {
    return errorResponse('incomplete_profile', 'Profile is missing required steps', 400, {
      missingSteps: missing,
    })
  }

  let bio: string
  let systemPrompt: string
  try {
    // Run both Claude calls in parallel — independent generations.
    ;[bio, systemPrompt] = await Promise.all([
      claudeMessage({ prompt: buildBioPrompt(profile), maxTokens: 200, temperature: 0.7 }),
      claudeMessage({ prompt: buildSystemPromptGenerator(profile), maxTokens: 800, temperature: 0.4 }),
    ])
  } catch (err) {
    console.error('[voice/regenerate] Claude call failed for user', userId, err)
    return errorResponse('ai_error', 'AI generation failed', 502)
  }

  if (!bio.trim() || !systemPrompt.trim()) {
    return errorResponse('ai_error', 'AI returned an empty response', 502)
  }

  const regeneratedAt = new Date().toISOString()
  const { error: updateErr } = await supabaseAdmin
    .from('voice_profiles')
    .update({
      generated_bio_en: bio.trim(),
      generated_system_prompt: systemPrompt.trim(),
      last_regenerated_at: regeneratedAt,
    })
    .eq('user_id', userId)

  if (updateErr) {
    console.error('[voice/regenerate] cache write failed for user', userId, updateErr)
    return errorResponse('db_error', 'Failed to persist generated outputs', 500)
  }

  return successResponse({ bio: bio.trim(), systemPrompt: systemPrompt.trim(), regeneratedAt })
}
