/**
 * Normalizes Telegram input into a full HTTPS URL for storage.
 * PRESERVES original casing for display (Telegram URLs are case-insensitive
 * at resolution time, so e.g. t.me/CEO_1Move and t.me/ceo_1move both work —
 * we keep the IB's chosen casing so their brand reads correctly).
 *
 * Accepts: @CEO_1Move, CEO_1Move, t.me/CEO_1Move,
 *          https://t.me/CEO_1Move, https://t.me/@CEO_1Move,
 *          https://telegram.me/CEO_1Move
 * Rejects: too short (<5), too long (>32), numeric-only,
 *          special chars other than underscore, invite links (+xxx, /joinchat/).
 * Returns: https://t.me/<handle> with casing intact, or null if invalid.
 */
export function normalizeTelegramHandle(input: string): string | null {
  if (!input) return null

  const trimmed = input.trim()
  if (!trimmed) return null

  // Reject invite-link paths outright — they live under the same t.me
  // domain but aren't usernames (joinchat/xyz, +xxxxxx).
  const afterDomain = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?t(elegram)?\.me\//i, '')
  if (/^(joinchat\/|\+)/i.test(afterDomain)) {
    return null
  }

  // Strip common prefixes (case-insensitive protocol/domain match,
  // but NEVER touch the handle casing itself)
  const handle = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?t(elegram)?\.me\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '') // strip trailing slash / query / fragment
    .trim()

  // Telegram usernames: 5-32 chars, must start with a letter,
  // then alphanumeric + underscore.
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(handle)) {
    return null
  }

  return `https://t.me/${handle}`
}

/**
 * Extracts the @handle form from a stored canonical URL for display.
 * Preserves original casing so the IB sees the exact brand they typed.
 * E.g. "https://t.me/CEO_1Move" -> "@CEO_1Move".
 *
 * If the stored value is non-canonical (e.g. an old invite link or a
 * legacy value from before this normalization), we return it unchanged
 * so it's still editable.
 */
export function telegramHandleForDisplay(url: string | null | undefined): string {
  if (!url) return ''
  const match = url.match(/^https?:\/\/t\.me\/([a-zA-Z0-9_]+)$/i)
  return match ? `@${match[1]}` : url
}
