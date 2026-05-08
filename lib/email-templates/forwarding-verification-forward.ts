import { baseEmailTemplate } from './base'
import type { Provider, ForwardingLanguage } from '../forwarding-verification'

// Auto-forward template for Gmail/Outlook/Yahoo/iCloud/ProtonMail forwarding-
// verification emails. The original arrives at verify+SLUG@zapraxi.resend.app
// (Resend inbound). The inbound webhook fetches the body, classifies it, then
// re-sends through this template to the IB's registered email so they can
// click the link without Richy logging into Resend.

interface ForwardTranslation {
  subject: string
  preview: string
  heading: string
  intro: string
  link_label: string
  click_button: string
  code_label: string
  original_label: string
  no_link_warning: string
  help: string
  sign_off: string
  sign_name: string
}

const PROVIDER_LABEL: Record<Provider, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  yahoo: 'Yahoo',
  icloud: 'iCloud',
  protonmail: 'ProtonMail',
  unknown: 'din e-postleverandør',
}

const translations: Record<'en' | 'no' | 'sv', ForwardTranslation> = {
  en: {
    subject: '🔐 Confirm forwarding — Auto-Verification setup',
    preview: 'Click the link below to confirm forwarding to PrimeVerse Auto-Verify.',
    heading: 'Confirm forwarding setup',
    intro: '{provider} sent the verification email below to your Auto-Verification address. Click the link to finish setup — once confirmed, PU Prime account emails will route automatically to your dashboard.',
    link_label: 'Verification link',
    click_button: 'CONFIRM FORWARDING',
    code_label: 'Verification code (if asked)',
    original_label: 'Original message from {provider}',
    no_link_warning: 'No clickable link was detected automatically. Open the original message below and click the confirmation link inside it.',
    help: 'Didn’t request this? You can ignore the email — no setup is changed until you click the link.',
    sign_off: 'Auto-Verify on your behalf,',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: '🔐 Bekreft videresending — Auto-Verification oppsett',
    preview: 'Klikk lenken under for å bekrefte videresending til PrimeVerse Auto-Verify.',
    heading: 'Bekreft videresending',
    intro: '{provider} sendte bekreftelses-e-posten under til din Auto-Verification-adresse. Klikk lenken for å fullføre oppsettet — når det er bekreftet, rutes PU Prime-konto-e-poster automatisk til dashboardet ditt.',
    link_label: 'Bekreftelseslenke',
    click_button: 'BEKREFT VIDERESENDING',
    code_label: 'Bekreftelseskode (hvis du blir spurt)',
    original_label: 'Original melding fra {provider}',
    no_link_warning: 'Ingen klikkbar lenke ble oppdaget automatisk. Åpne den originale meldingen under og klikk bekreftelseslenken der.',
    help: 'Bestilte du ikke dette? Du kan ignorere e-posten — ingenting endres før du klikker lenken.',
    sign_off: 'Auto-Verify på vegne av deg,',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: '🔐 Bekräfta vidarebefordran — Auto-Verification',
    preview: 'Klicka på länken nedan för att bekräfta vidarebefordran till PrimeVerse Auto-Verify.',
    heading: 'Bekräfta vidarebefordran',
    intro: '{provider} skickade bekräftelsemejlet nedan till din Auto-Verification-adress. Klicka på länken för att slutföra inställningen — när det är bekräftat, dirigeras PU Prime-kontomejl automatiskt till din dashboard.',
    link_label: 'Bekräftelselänk',
    click_button: 'BEKRÄFTA VIDAREBEFORDRAN',
    code_label: 'Bekräftelsekod (om du tillfrågas)',
    original_label: 'Originalmeddelande från {provider}',
    no_link_warning: 'Ingen klickbar länk upptäcktes automatiskt. Öppna originalmeddelandet nedan och klicka på bekräftelselänken där.',
    help: 'Beställde du inte detta? Du kan ignorera mejlet — inget ändras förrän du klickar på länken.',
    sign_off: 'Auto-Verify för din räkning,',
    sign_name: '— 1Move-teamet',
  },
}

interface ForwardEmailOptions {
  provider: Provider
  language: ForwardingLanguage
  link: string | null
  code: string | null
  originalHtml: string
  originalText: string
}

// Conservative HTML quoting: keep the original look but neutralise dangerous
// pieces. Not meant to be a security boundary (the recipient is the IB, not
// the public), just basic hygiene so the embedded message renders cleanly
// inside the wrapper layout.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildForwardingVerificationForwardEmail({
  provider,
  language,
  link,
  code,
  originalHtml,
  originalText,
}: ForwardEmailOptions): { html: string; subject: string } {
  const lang: 'en' | 'no' | 'sv' = language === 'no' || language === 'sv' ? language : 'en'
  const t = translations[lang]
  const providerLabel = PROVIDER_LABEL[provider] || PROVIDER_LABEL.unknown

  const linkBlock = link
    ? `
<p style="color:#888;font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">${t.link_label}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center" style="padding:0;">
      <a href="${link}" style="display:inline-block;background-color:#c9a84c;color:#080808;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.click_button}
      </a>
    </td>
  </tr>
</table>
<p style="color:#888;font-size:12px;line-height:1.5;margin:0 0 24px;word-break:break-all;">
  <a href="${link}" style="color:#c9a84c;text-decoration:none;">${escapeHtml(link)}</a>
</p>`
    : `
<p style="color:#d44a37;font-size:14px;line-height:1.6;margin:0 0 24px;padding:12px 16px;border:1px solid rgba(212,74,55,0.3);background-color:rgba(212,74,55,0.08);border-radius:6px;">
  ${t.no_link_warning}
</p>`

  const codeBlock = code
    ? `
<p style="color:#888;font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">${t.code_label}</p>
<p style="color:#c9a84c;font-size:22px;font-weight:700;letter-spacing:2px;margin:0 0 24px;font-family:'Courier New',monospace;">${escapeHtml(code)}</p>`
    : ''

  const originalBody = originalHtml && originalHtml.trim().length > 0
    ? originalHtml
    : `<pre style="white-space:pre-wrap;color:#E0E0E0;font-size:13px;line-height:1.5;margin:0;font-family:'Courier New',monospace;">${escapeHtml(originalText || '')}</pre>`

  const content = `
<h1 style="color:#c9a84c;font-size:22px;margin:0 0 20px;text-align:center;">${t.heading}</h1>

<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">${t.intro.replace('{provider}', providerLabel)}</p>

${linkBlock}
${codeBlock}

<p style="color:#888;font-size:13px;line-height:1.5;margin:24px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">${t.original_label.replace('{provider}', providerLabel)}</p>
<div style="border:1px solid #2A2A4A;border-radius:6px;padding:16px;background-color:#0a0a0a;color:#E0E0E0;font-size:14px;line-height:1.5;margin:0 0 24px;">
  ${originalBody}
</div>

<p style="color:#888;font-size:12px;line-height:1.5;margin:24px 0 16px;text-align:center;">${t.help}</p>

<p style="color:#E0E0E0;font-size:14px;line-height:1.6;margin:0;text-align:center;">
  ${t.sign_off}<br/>
  <span style="color:#c9a84c;font-weight:700;">${t.sign_name}</span>
</p>`

  return {
    html: baseEmailTemplate({ content, previewText: t.preview }),
    subject: t.subject,
  }
}
