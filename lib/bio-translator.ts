import Groq from 'groq-sdk'

export const BIO_LANG_CODES = ['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl', 'pt', 'th'] as const
export type BioLang = (typeof BIO_LANG_CODES)[number]

const LANG_NAMES: Record<BioLang, string> = {
  en: 'English',
  no: 'Norwegian',
  sv: 'Swedish',
  es: 'Spanish',
  ru: 'Russian',
  ar: 'Arabic',
  tl: 'Filipino/Tagalog',
  pt: 'Portuguese',
  th: 'Thai',
}

export interface TranslateBioOptions {
  bio: string
  fullName?: string | null
}

export interface TranslateBioResult {
  bios: Record<BioLang, string>
}

function buildSystemPrompt(fullName: string | null | undefined): string {
  const nameInstruction = fullName && fullName.trim()
    ? `The person's real name is exactly: ${fullName.trim()}. If you mention their name, use exactly "${fullName.trim()}". Never invent or use any other name.`
    : 'Do not invent or mention any name that is not already present in the source bio.'

  const jsonShape = BIO_LANG_CODES
    .map(code => `  "${code}": "bio in ${LANG_NAMES[code]}"`)
    .join(',\n')

  return `You are a professional copywriter for 1Move Academy, a premium trading education and financial services ecosystem. You produce bios for IB (Introducing Broker) partners whose landing pages are translated into 9 languages.

You will be given a single bio in one language. Your job is to produce a faithful, natural translation into all 9 languages.

Constraints for EVERY language version:
- Keep it 3-5 sentences, matching the length and substance of the source
- Write in FIRST PERSON — use "I", "my", "me". NEVER third person. NEVER refer to the person by name as if describing someone else
- Stay personal and authentic — preserve the specific details the person shared
- Do NOT add generic marketing phrases that aren't in the source
- Translate naturally (idiomatic), not literally — each version should read like a native speaker wrote it
- Preserve any proper nouns (brand names, product names, cities)

${nameInstruction}

Return ONLY valid JSON — no markdown, no code fences, no prose before or after — in this exact shape:
{
${jsonShape}
}`
}

function buildUserPrompt(bio: string): string {
  return `Source bio:\n\n${bio.trim()}\n\nTranslate it into all 9 languages following the rules above and return the JSON object.`
}

function stripJsonFences(raw: string): string {
  let s = raw.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\n?/i, '').replace(/\n?```\s*$/, '')
  }
  return s
}

function coerceResult(parsed: unknown): Record<BioLang, string> {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Groq response was not a JSON object')
  }
  const record = parsed as Record<string, unknown>
  const out = {} as Record<BioLang, string>
  for (const code of BIO_LANG_CODES) {
    const value = record[code]
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing or empty translation for language "${code}"`)
    }
    out[code] = value.trim()
  }
  return out
}

export async function translateBio({ bio, fullName }: TranslateBioOptions): Promise<TranslateBioResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const trimmed = (bio || '').trim()
  if (!trimmed) {
    throw new Error('Bio is empty')
  }

  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: buildSystemPrompt(fullName ?? null) },
      { role: 'user', content: buildUserPrompt(trimmed) },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  })

  const content = completion.choices[0]?.message?.content || ''
  if (!content) {
    throw new Error('Groq returned an empty response')
  }

  const cleaned = stripJsonFences(content)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    const preview = cleaned.substring(0, 300)
    throw new Error(`Failed to parse Groq JSON (${(err as Error).message}). Preview: ${preview}`)
  }

  return { bios: coerceResult(parsed) }
}
