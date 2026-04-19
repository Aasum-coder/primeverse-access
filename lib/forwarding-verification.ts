// Utilities for detecting and extracting forwarding verification emails
// sent by major email providers (Gmail, Outlook, Yahoo, iCloud, ProtonMail)
// to the inbound webhook address verify+{slug}@zapraxi.resend.app.

export type Provider =
  | 'gmail'
  | 'outlook'
  | 'yahoo'
  | 'icloud'
  | 'protonmail'
  | 'unknown'

export type ForwardingLanguage = 'en' | 'no' | 'sv' | 'unknown'

export interface ForwardingVerification {
  provider: Provider
  code: string | null
  link: string | null
  language?: ForwardingLanguage
  received_at: string
  expires_at: string
  from_address: string
  subject: string
}

function safeLower(input: string | null | undefined): string {
  return (input || '').toLowerCase()
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function detectProvider(
  fromAddress: string,
  subject: string
): Provider {
  const from = safeLower(fromAddress)
  const subj = safeLower(subject)

  if (
    from.includes('forwarding-noreply@google.com') ||
    subj.includes('gmail forwarding confirmation') ||
    subj.includes('gmail-videresending') ||
    subj.includes('gmail-vidarebefordran')
  ) {
    return 'gmail'
  }

  if (
    from.includes('no-reply@microsoft.com') ||
    from.includes('no-reply@outlook.com') ||
    from.includes('postmaster@outlook.com') ||
    subj.includes('verify your forwarding address')
  ) {
    return 'outlook'
  }

  if (
    from.includes('no-reply@cc.yahoo-inc.com') ||
    from.includes('@yahoo-inc.com') ||
    subj.includes('yahoo mail forwarding')
  ) {
    return 'yahoo'
  }

  if (
    from.includes('noreply@icloud.com') ||
    from.includes('no_reply@apple.com') ||
    subj.includes('icloud')
  ) {
    return 'icloud'
  }

  if (
    from.includes('no-reply@protonmail.com') ||
    from.includes('@proton.me') ||
    subj.includes('proton mail forwarding')
  ) {
    return 'protonmail'
  }

  return 'unknown'
}

export function isForwardingVerification(
  fromAddress: string,
  subject: string
): boolean {
  return detectProvider(fromAddress, subject) !== 'unknown'
}

export function extractCode(
  htmlBody: string,
  textBody: string,
  provider: Provider
): string | null {
  const text = textBody || ''
  const htmlText = stripHtml(htmlBody || '')
  const haystacks = [text, htmlText]

  if (provider === 'gmail') {
    const re = /\b\d{9}\b/
    for (const hay of haystacks) {
      const match = hay.match(re)
      if (match) return match[0]
    }
    return null
  }

  if (provider === 'yahoo') {
    const re = /verification code[:\s]+([A-Z0-9]{6,8})/i
    for (const hay of haystacks) {
      const match = hay.match(re)
      if (match && match[1]) return match[1]
    }
    return null
  }

  // Generic patterns for other providers
  const patterns = [
    /confirmation code[:\s]+([A-Z0-9]{4,10})/i,
    /verification code[:\s]+([A-Z0-9]{4,10})/i,
    /your code is[:\s]+([A-Z0-9]{4,10})/i,
  ]

  for (const hay of haystacks) {
    for (const re of patterns) {
      const match = hay.match(re)
      if (match && match[1]) return match[1]
    }
  }

  return null
}

// Gmail forwarding confirmation link. Nordic Gmail doesn't send a code —
// only a link in this format. Works for all languages since the host
// (mail-settings.google.com) and the vf- prefix are invariant.
const GMAIL_FORWARDING_LINK_REGEX =
  /https:\/\/mail-settings\.google\.com\/mail\/vf-[A-Za-z0-9%\-_]+/i

const LINK_PATTERNS: RegExp[] = [
  GMAIL_FORWARDING_LINK_REGEX,
  /https?:\/\/[^\s"'<>]*microsoft\.com\/[^\s"'<>]*/i,
  /https?:\/\/[^\s"'<>]*live\.com\/[^\s"'<>]*/i,
  /https?:\/\/[^\s"'<>]*icloud\.com\/[^\s"'<>]*/i,
  /https?:\/\/[^\s"'<>]*apple\.com\/[^\s"'<>]*/i,
  /https?:\/\/[^\s"'<>]*google\.com\/mail\/[^\s"'<>]*/i,
]

export function extractLink(
  htmlBody: string,
  textBody: string,
  _provider: Provider
): string | null {
  const html = htmlBody || ''
  const text = textBody || ''

  // 1) Look for anchor hrefs in html first
  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi
  let match: RegExpExecArray | null
  while ((match = hrefRe.exec(html)) !== null) {
    const url = match[1]
    for (const pat of LINK_PATTERNS) {
      if (pat.test(url)) return url
    }
  }

  // 2) Fallback: scan raw html and text for matching URLs
  const haystacks = [html, text]
  for (const hay of haystacks) {
    for (const pat of LINK_PATTERNS) {
      const m = hay.match(pat)
      if (m && m[0]) return m[0]
    }
  }

  return null
}

// Detect the human-language the forwarding confirmation mail is written in.
// Used to decide UI copy on the dashboard; falls back to 'unknown'.
export function detectLanguage(
  htmlBody: string,
  textBody: string,
  subject: string
): ForwardingLanguage {
  const hay = safeLower(
    [subject || '', textBody || '', stripHtml(htmlBody || '')].join(' ')
  )

  // Swedish markers (check before Norwegian — "bekräfta" has unique å)
  if (
    hay.includes('bekräfta') ||
    hay.includes('bekrafta') ||
    hay.includes('vidarebefordran') ||
    hay.includes('vidarebefordra')
  ) {
    return 'sv'
  }

  // Norwegian markers
  if (
    hay.includes('bekreft') ||
    hay.includes('videresending') ||
    hay.includes('videresende')
  ) {
    return 'no'
  }

  // English markers
  if (
    hay.includes('confirm') ||
    hay.includes('forwarding') ||
    hay.includes('verification')
  ) {
    return 'en'
  }

  return 'unknown'
}
