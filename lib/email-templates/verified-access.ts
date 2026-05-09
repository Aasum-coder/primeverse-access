import { baseEmailTemplate } from './base'

interface VerifiedAccessOptions {
  name: string
  /** Per-lead Telegram deep-link to @OneMoveAccessBot (with token in `?start=...`).
   *  Required for the new PU Prime API flow. The legacy mail-forwarding flow
   *  (lib/verify-rows.ts) passes the public bot URL — that path bypasses
   *  token-based linking but still gets the user into the bot. */
  telegramDeepLink: string
  /** Optional — kept so legacy callers in lib/verify-rows.ts compile. */
  referralLink?: string
}

const VIDEO_URL = 'https://youtu.be/7tvGjGndNQU'
const VIDEO_THUMBNAIL = 'https://img.youtube.com/vi/7tvGjGndNQU/hqdefault.jpg'

// Configurable via env so the bundle_token can be rotated without redeploying code.
// IMPORTANT: This URL was provided by the user as the canonical Primeverse access link.
// The bundle_token (32 hex chars with double-b at position 13: 6c6c008ec8cbb...) MUST
// match exactly — a single-character mismatch breaks Primeverse access for all leads.
const PRIMEVERSE_URL =
  process.env.PRIMEVERSE_BUNDLE_URL ||
  'https://prime-verse.mn.co/plans/1906703?bundle_token=6c6c008ec8cbb18334044f843d884087&utm_source=manual'

function goldButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;min-width:220px;text-align:center;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `
}

export function buildVerifiedAccessEmail({ name, telegramDeepLink }: VerifiedAccessOptions) {
  const firstName = name.split(' ')[0] || name || 'there'

  const content = `
    <h1 style="color:#c9a84c;font-size:24px;font-weight:700;margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;text-align:center;">
      You're in, ${firstName} ✓
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 8px;text-align:center;">
      Your PU Prime account is verified.
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:center;">
      You now have full access to everything below.
    </p>

    <!-- 1. Onboarding video with thumbnail -->
    <h2 style="color:#c9a84c;font-size:16px;font-weight:700;margin:24px 0 12px;font-family:Arial,Helvetica,sans-serif;text-align:center;letter-spacing:0.5px;">
      START HERE — WATCH THIS FIRST
    </h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px;">
      <tr>
        <td align="center" style="border-radius:8px;overflow:hidden;">
          <a href="${VIDEO_URL}" target="_blank" style="display:block;text-decoration:none;">
            <img src="${VIDEO_THUMBNAIL}" alt="Watch the onboarding video" width="480" style="display:block;border:0;outline:none;max-width:100%;height:auto;border-radius:8px;"/>
          </a>
        </td>
      </tr>
    </table>
    ${goldButton(VIDEO_URL, '▶ Watch onboarding video')}

    <div style="height:1px;background-color:rgba(201,168,76,0.2);margin:32px 0 24px;"></div>

    <!-- 2. Primeverse access -->
    <h2 style="color:#c9a84c;font-size:16px;font-weight:700;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;text-align:center;letter-spacing:0.5px;">
      JOIN PRIMEVERSE
    </h2>
    <p style="color:#E0E0E0;font-size:14px;line-height:1.6;margin:0 0 16px;text-align:center;">
      Your full community membership — courses, signals, live sessions.
    </p>
    ${goldButton(PRIMEVERSE_URL, 'Access Primeverse')}

    <div style="height:1px;background-color:rgba(201,168,76,0.2);margin:32px 0 24px;"></div>

    <!-- 3. Telegram (personal deep-link with token) -->
    <h2 style="color:#c9a84c;font-size:16px;font-weight:700;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;text-align:center;letter-spacing:0.5px;">
      CONNECT ON TELEGRAM
    </h2>
    <p style="color:#E0E0E0;font-size:14px;line-height:1.6;margin:0 0 16px;text-align:center;">
      Daily insights, real-time updates, and direct support.
    </p>
    ${goldButton(telegramDeepLink, '💬 Open Telegram bot')}

    <div style="border-top:1px solid rgba(201,168,76,0.2);padding-top:24px;margin-top:32px;">
      <p style="color:#888;font-size:13px;line-height:1.5;margin:0;text-align:center;font-style:italic;">
        People Before Profit.
      </p>
    </div>
  `

  return {
    subject: `You're verified, ${firstName} — your access links inside ✓`,
    html: baseEmailTemplate({
      content,
      previewText: 'Your account is verified. Tap inside for your access links.',
    }),
  }
}
