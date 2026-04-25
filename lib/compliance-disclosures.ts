// Compliance disclosure detection + insertion for AI-generated marketing
// content. Triggers when the post mentions trading / financial services /
// brand keywords, then prepends an "Ad" tag and appends a risk disclaimer
// in the IB's selected output language.

export type DisclosureLang =
  | 'en' | 'no' | 'sv' | 'es' | 'pt' | 'ru' | 'ar' | 'tl' | 'th'

const SUPPORTED: ReadonlySet<DisclosureLang> = new Set([
  'en', 'no', 'sv', 'es', 'pt', 'ru', 'ar', 'tl', 'th',
])

export const DISCLOSURES: Record<DisclosureLang, { top: string; bottom: string }> = {
  no: { top: 'Reklame.', bottom: 'Trading innebærer risiko.' },
  sv: { top: 'Reklam.',  bottom: 'Trading innebär risk.' },
  en: { top: 'Ad.',      bottom: 'Trading involves risk.' },
  es: { top: 'Publicidad.', bottom: 'Operar implica riesgo.' },
  pt: { top: 'Publicidade.', bottom: 'Operar envolve riscos.' },
  ru: { top: 'Реклама.', bottom: 'Торговля связана с риском.' },
  ar: { top: 'إعلان.',   bottom: 'التداول ينطوي على مخاطر.' },
  tl: { top: 'Patalastas.', bottom: 'May panganib ang trading.' },
  th: { top: 'โฆษณา.',  bottom: 'การเทรดมีความเสี่ยง.' },
}

// Single-token ASCII keywords — matched with a start-of-word boundary so
// inflections and Nordic compounds still trigger ("trading" matches both
// "trading" and "tradinglinje") while preventing mid-word false positives
// ("ROI" doesn't match inside "EUROIRA").
const KEYWORDS_WORD_BOUNDARY: readonly string[] = [
  // Brand
  'puprime', '1move', 'primeverse', 'metatrader', 'mt5', 'mt4',
  // Trading — Norwegian / Swedish
  'trading', 'tradingen', 'trader', 'traderen', 'traders',
  'aksjer', 'aksjehandel', 'aktier',
  'kryptovaluta', 'krypto', 'crypto', 'cryptocurrency',
  'bitcoin', 'btc', 'eth',
  'forex', 'valutahandel',
  'cfd', 'derivater', 'derivatives',
  'børs', 'børsen', 'børsmarked',
  'investering', 'investere', 'investor', 'investering', 'investing', 'investment',
  'profitt', 'profit', 'roi', 'avkastning', 'gevinst', 'returns',
  'leverage', 'gearing', 'belåning', 'margin',
  'signal', 'signaler', 'signals',
  'kursmål', 'pip', 'pips',
  'analyse', 'analysis',
  'inntekt', 'broker', 'brokerage', 'megler',
  'stocks',
  // Spanish / Portuguese
  'acciones', 'inversión', 'invertir', 'inversor',
  'mercado', 'bolsa', 'criptomonedas',
  'apalancamiento', 'ganancia', 'beneficio',
  'corredor', 'bróker',
]

// Multi-word phrases and non-ASCII tokens — matched as case-insensitive
// substring. JS \b doesn't behave for Cyrillic/Arabic/Thai (script chars
// aren't \w in JS regex), so substring is the practical choice.
const KEYWORDS_SUBSTRING: readonly string[] = [
  // Brand multi-word
  'pu prime', '1move academy', 'titan robotics', 'btc-titan', 'xau-titan',
  'introducing broker',
  // Trading multi-word EN/NO
  'currency trading', 'stock market', 'technical analysis', 'fundamental analysis',
  'passive income', 'passiv inntekt', 'tjene penger', 'bli rik', 'make money',
  // Russian
  'трейдинг', 'инвест', 'биржа', 'криптовалюта', 'форекс', 'брокер',
  'акции',
  // Arabic
  'تداول', 'استثمار', 'سوق', 'بورصة', 'فوركس',
  // Thai
  'เทรด', 'ลงทุน', 'หุ้น', 'ตลาด', 'ฟอเร็กซ์',
]

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveLang(input: string | undefined | null): DisclosureLang {
  if (!input) return 'en'
  const lower = input.toLowerCase() as DisclosureLang
  return SUPPORTED.has(lower) ? lower : 'en'
}

function normalizeLine(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?]+$/u, '')
}

export function hasExistingTopDisclosure(content: string, lang: DisclosureLang): boolean {
  const want = normalizeLine(DISCLOSURES[lang].top)
  const firstLine = normalizeLine((content || '').split('\n')[0] || '')
  return firstLine === want
}

export function hasExistingBottomDisclosure(content: string, lang: DisclosureLang): boolean {
  const want = normalizeLine(DISCLOSURES[lang].bottom)
  const lines = (content || '').trim().split('\n')
  const lastLine = normalizeLine(lines[lines.length - 1] || '')
  return lastLine === want
}

export interface DisclosureCheck {
  triggered: boolean
  matchedKeywords: string[]
  language: DisclosureLang
  alreadyPresent: { top: boolean; bottom: boolean }
}

export function shouldShowDisclosures(
  content: string,
  selectedLang: string | undefined | null
): DisclosureCheck {
  const language = resolveLang(selectedLang)
  if (!content || !content.trim()) {
    return {
      triggered: false,
      matchedKeywords: [],
      language,
      alreadyPresent: { top: false, bottom: false },
    }
  }

  const lower = content.toLowerCase()
  const matched: string[] = []

  // Word-boundary regex pass (ASCII only)
  for (const kw of KEYWORDS_WORD_BOUNDARY) {
    const re = new RegExp(`\\b${escapeRegex(kw)}`, 'iu')
    if (re.test(content)) matched.push(kw)
  }

  // Substring pass (multi-word + non-ASCII)
  for (const kw of KEYWORDS_SUBSTRING) {
    if (lower.includes(kw.toLowerCase())) matched.push(kw)
  }

  return {
    triggered: matched.length > 0,
    matchedKeywords: matched,
    language,
    alreadyPresent: {
      top: hasExistingTopDisclosure(content, language),
      bottom: hasExistingBottomDisclosure(content, language),
    },
  }
}

export function getDisclosures(language: string | undefined | null): { top: string; bottom: string } {
  return DISCLOSURES[resolveLang(language)]
}

/**
 * Wraps content with localized top + bottom disclosures, only adding pieces
 * that aren't already present. No-op when content is empty.
 */
export function applyDisclosures(content: string, language: string | undefined | null): string {
  if (!content || !content.trim()) return content || ''
  const lang = resolveLang(language)
  const { top, bottom } = DISCLOSURES[lang]
  const hasTop = hasExistingTopDisclosure(content, lang)
  const hasBottom = hasExistingBottomDisclosure(content, lang)
  const parts: string[] = []
  if (!hasTop) parts.push(top, '')
  parts.push(content.trim())
  if (!hasBottom) parts.push('', bottom)
  return parts.join('\n')
}
