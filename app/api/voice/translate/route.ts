import type { NextRequest } from 'next/server'
import {
  errorResponse,
  getUserIdFromRequest,
  successResponse,
  supabaseAdmin,
  unauthorizedResponse,
} from '@/lib/voice/auth'
import { claudeMessage } from '@/lib/voice/ai-clients'
import { TARGET_BIO_LANGS, type TargetLang, type VoiceProfile } from '@/lib/voice/types'

// POST /api/voice/translate
// Translates the cached generated_bio_en into the 8 other supported
// languages. Signature phrases are pinned in their original language —
// the prompt names them explicitly so Claude doesn't translate them.

const LANG_NAMES: Record<TargetLang, string> = {
  no: 'Norwegian',
  sv: 'Swedish',
  es: 'Spanish',
  ar: 'Arabic',
  ru: 'Russian',
  tl: 'Tagalog (Filipino)',
  br: 'Brazilian Portuguese',
  th: 'Thai',
}

function buildTranslatePrompt(text: string, lang: TargetLang, sigPhrases: string[]): string {
  const sigBlock = sigPhrases.length
    ? sigPhrases.map(p => `- "${p}"`).join('\n')
    : '(none)'
  return `Translate this bio to ${LANG_NAMES[lang]}. Maintain the exact same tone and energy.

CRITICAL: These signature phrases must NOT be translated — keep them in the original language exactly as written:
${sigBlock}

ORIGINAL (English):
${text}

Output ONLY the translation. No preamble. No notes.`
}

async function translateBio(text: string, lang: TargetLang, sigPhrases: string[]): Promise<string> {
  const out = await claudeMessage({
    prompt: buildTranslatePrompt(text, lang, sigPhrases),
    maxTokens: 400,
    temperature: 0.3,
  })
  return out.trim()
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
    console.error('[voice/translate] select failed for user', userId, selectErr)
    return errorResponse('db_error', 'Failed to load voice profile', 500)
  }
  if (!existing) {
    return errorResponse('not_found', 'Voice profile not found — call /api/voice/get first', 404)
  }

  const profile = existing as VoiceProfile
  if (!profile.generated_bio_en || !profile.generated_bio_en.trim()) {
    return errorResponse('no_bio', 'Run /regenerate first to produce the master English bio', 400)
  }

  let translations: Record<string, string>
  try {
    const sigPhrases = profile.signature_phrases || []
    const results = await Promise.all(
      TARGET_BIO_LANGS.map(async lang => {
        const text = await translateBio(profile.generated_bio_en!, lang, sigPhrases)
        return [lang, text] as const
      })
    )
    translations = Object.fromEntries(results)
  } catch (err) {
    console.error('[voice/translate] Claude translation failed for user', userId, err)
    return errorResponse('ai_error', 'Translation failed', 502)
  }

  // Reject if any language came back empty — partial translations would
  // surface as broken text on the public page.
  const empties = Object.entries(translations).filter(([, v]) => !v.trim())
  if (empties.length > 0) {
    console.error('[voice/translate] empty translations for user', userId, empties.map(([k]) => k))
    return errorResponse('ai_error', 'AI returned empty translations', 502, {
      missing: empties.map(([k]) => k),
    })
  }

  const translatedAt = new Date().toISOString()
  const { error: updateErr } = await supabaseAdmin
    .from('voice_profiles')
    .update({ generated_bio_translations: translations })
    .eq('user_id', userId)

  if (updateErr) {
    console.error('[voice/translate] cache write failed for user', userId, updateErr)
    return errorResponse('db_error', 'Failed to persist translations', 500)
  }

  return successResponse({ translations, translatedAt })
}
