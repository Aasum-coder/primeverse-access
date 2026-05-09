// Lead-language detection for Email #1 + the verify-uid page.
//
// Priority:
//   1. lead.browser_locale (captured from Accept-Language at signup)
//   2. lead's IP-resolved country (already populated for landing-page hits
//      via the existing landing_visits → x-vercel-ip-country flow)
//   3. English fallback
//
// Phase A ships proper translations for en / no / es. Other supported
// languages render the email shell in their existing translations from
// lib/email-templates/lead-welcome.ts and fall back to English copy for
// the NEW two-CTA blocks added in this PR.

export const SUPPORTED_LANGUAGES = ['en', 'no', 'sv', 'da', 'es', 'de', 'fr', 'it', 'pt'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

// ISO-3166-1 alpha-2 → ISO-639-1. Only entries we have any confidence in.
// Unknown countries fall through to 'en'.
const COUNTRY_TO_LANG: Record<string, SupportedLanguage> = {
  NO: 'no',
  SE: 'sv',
  DK: 'da',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  EC: 'es',
  GT: 'es',
  BO: 'es',
  CU: 'es',
  DO: 'es',
  HN: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  FR: 'fr',
  BE: 'fr',
  LU: 'fr',
  IT: 'it',
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
}

function isSupported(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
}

// Strip the region tag and lower-case. "no-NB" → "no", "EN_US" → "en".
function normaliseTag(tag: string): string {
  const head = tag.split(/[-_]/)[0] || ''
  return head.toLowerCase()
}

// Accept-Language is a comma-separated quality-weighted list. We only need
// the first entry that maps to a supported language.
export function parseAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim()
    if (!tag) continue
    const lang = normaliseTag(tag)
    if (isSupported(lang)) return lang
  }
  return null
}

export function detectLeadLanguage(
  browserLocale: string | null | undefined,
  ipCountry: string | null | undefined,
): SupportedLanguage {
  if (browserLocale) {
    const lang = normaliseTag(browserLocale)
    if (isSupported(lang)) return lang
  }
  if (ipCountry) {
    const cc = ipCountry.toUpperCase()
    const mapped = COUNTRY_TO_LANG[cc]
    if (mapped) return mapped
  }
  return 'en'
}
