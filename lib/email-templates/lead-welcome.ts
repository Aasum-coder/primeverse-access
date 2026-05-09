import { baseEmailTemplate } from './base'

// Email #1 — sent the moment a lead signs up on an IB landing page (or is
// added manually from the dashboard).
//
// Phase A shape:
//   • Primary CTA — register on PU Prime via the IB's affiliate link
//   • Secondary CTA — "Enter my UID" (deep-links to /verify-uid?token=…)
//   • Tertiary link — "Already a PU Prime client? click here" (flips the
//     existing_client_flag so the IB knows to reach out manually)
//
// uidVerifyUrl + existingClientUrl are optional. When omitted (e.g. the
// manual-add path where the IB already supplied a UID), the template
// renders just the broker CTA.

type Lang = 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

interface Translation {
  subject: string
  preview: string
  hi: string
  intro_line: string
  why_label: string
  why_bullets: string[]
  step1_title: string
  step1_button: string
  step2_title: string
  step2_body: string
  step2_button: string
  existing_client_label: string
  existing_client_link: string
  questions: string
  sign_off_prefix: string
  sign_off: string
}

// en / no / es — translated for Phase A. Other languages use the en copy
// for the NEW two-CTA layout; PR B will translate them properly. The
// fallback keeps the email shipping in every locale we already support.
const translations: Record<Lang, Translation> = {
  en: {
    subject: 'Welcome {firstName} — let’s get you started',
    preview: 'Two short steps and you’re in.',
    hi: 'Hi',
    intro_line: 'Thanks for joining. I’m {ibName}, and I’ll personally make sure you get up and running.',
    why_label: 'Why PU Prime',
    why_bullets: [
      'Regulated by ASIC, FSCA, and SCB',
      'Spreads from 0.0 pips on major pairs',
      'Up to 1:500 leverage',
      'Fast withdrawals (most under 24h)',
    ],
    step1_title: 'STEP 1 — Register on PU Prime',
    step1_button: 'Register on PU Prime',
    step2_title: 'STEP 2 — Send me your UID',
    step2_body: 'Once you’ve registered, click below to enter your PU Prime UID. This unlocks instant access to my community + tools.',
    step2_button: 'Enter my UID',
    existing_client_label: 'Already a PU Prime client?',
    existing_client_link: 'Click here so I can reach out manually',
    questions: 'Questions? Just reply to this email — it goes straight to my inbox.',
    sign_off_prefix: '—',
    sign_off: '{ibName}',
  },
  no: {
    subject: 'Velkommen {firstName} — la oss komme i gang',
    preview: 'To korte steg og du er inne.',
    hi: 'Hei',
    intro_line: 'Takk for at du ble med. Jeg er {ibName}, og jeg sørger personlig for at du kommer skikkelig i gang.',
    why_label: 'Hvorfor PU Prime',
    why_bullets: [
      'Regulert av ASIC, FSCA og SCB',
      'Spread fra 0,0 pips på de store parene',
      'Opptil 1:500 giring',
      'Raske uttak (de fleste under 24 timer)',
    ],
    step1_title: 'STEG 1 — Registrer deg hos PU Prime',
    step1_button: 'Registrer deg hos PU Prime',
    step2_title: 'STEG 2 — Send meg UID-en din',
    step2_body: 'Når du har registrert deg, klikk under for å legge inn PU Prime-UID-en din. Det låser opp umiddelbar tilgang til fellesskapet mitt og verktøyene mine.',
    step2_button: 'Legg inn UID',
    existing_client_label: 'Allerede PU Prime-kunde?',
    existing_client_link: 'Klikk her, så tar jeg kontakt manuelt',
    questions: 'Spørsmål? Bare svar på denne e-posten — den går rett til innboksen min.',
    sign_off_prefix: '—',
    sign_off: '{ibName}',
  },
  es: {
    subject: 'Bienvenido {firstName} — vamos a empezar',
    preview: 'Dos pasos cortos y estás dentro.',
    hi: 'Hola',
    intro_line: 'Gracias por unirte. Soy {ibName}, y me aseguraré personalmente de que arranques bien.',
    why_label: 'Por qué PU Prime',
    why_bullets: [
      'Regulado por ASIC, FSCA y SCB',
      'Spreads desde 0,0 pips en los pares principales',
      'Hasta 1:500 de apalancamiento',
      'Retiros rápidos (la mayoría en menos de 24 h)',
    ],
    step1_title: 'PASO 1 — Regístrate en PU Prime',
    step1_button: 'Registrarme en PU Prime',
    step2_title: 'PASO 2 — Envíame tu UID',
    step2_body: 'Una vez registrado, haz clic abajo para introducir tu UID de PU Prime. Eso desbloquea acceso instantáneo a mi comunidad y mis herramientas.',
    step2_button: 'Introducir mi UID',
    existing_client_label: '¿Ya eres cliente de PU Prime?',
    existing_client_link: 'Haz clic aquí para que te contacte manualmente',
    questions: '¿Tienes preguntas? Responde a este correo — me llega directo.',
    sign_off_prefix: '—',
    sign_off: '{ibName}',
  },
  // The remaining six fall back to en for the new two-CTA copy. PR B
  // will translate properly.
  sv: null as never,
  ru: null as never,
  ar: null as never,
  tl: null as never,
  pt: null as never,
  th: null as never,
}
// Hydrate the fallbacks at module load so the template can lookup any Lang
// without branching.
for (const lang of ['sv', 'ru', 'ar', 'tl', 'pt', 'th'] as Lang[]) {
  translations[lang] = translations.en
}

interface LeadWelcomeOptions {
  leadName: string
  // ibName / distributorName: keep both names accepted for back-compat
  // with the older send-lead-email caller; ibName takes precedence.
  ibName?: string
  distributorName?: string
  ibEmail?: string
  // puPrimeAffiliateUrl is the new spec name; referralLink is the old one.
  // Both work.
  puPrimeAffiliateUrl?: string
  referralLink?: string
  uidVerifyUrl?: string
  existingClientUrl?: string
  lang?: string
}

const FALLBACK_AFFILIATE = 'https://puvip.co/la-partners/Primesync'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function applyTokens(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => tokens[key] ?? '')
}

export function buildLeadWelcomeEmail(opts: LeadWelcomeOptions): { subject: string; html: string } {
  const leadName = opts.leadName || ''
  const firstName = (leadName.split(' ')[0] || 'there').trim() || 'there'
  const ibName = (opts.ibName || opts.distributorName || 'your representative').trim()
  const affiliate = opts.puPrimeAffiliateUrl || opts.referralLink || FALLBACK_AFFILIATE

  const langKey = (opts.lang || 'en').toLowerCase()
  const lang: Lang = (translations as Record<string, Translation>)[langKey] ? (langKey as Lang) : 'en'
  const t = translations[lang]
  const isRtl = lang === 'ar'

  const tokens = { firstName: escapeHtml(firstName), ibName: escapeHtml(ibName) }
  const subject = applyTokens(t.subject, tokens)
  const preview = applyTokens(t.preview, tokens)
  const intro = applyTokens(t.intro_line, tokens)
  const signOff = applyTokens(t.sign_off, tokens)

  const bullets = t.why_bullets
    .map(b => `<li style="margin:0 0 4px;color:#ccc;font-size:14px;line-height:1.5;">${escapeHtml(b)}</li>`)
    .join('')

  const uidStep = opts.uidVerifyUrl
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:6px;">${escapeHtml(t.step2_title)}</div>
          <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">${escapeHtml(t.step2_body)}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${escapeHtml(opts.uidVerifyUrl)}" target="_blank" style="display:inline-block;padding:13px 28px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.4px;">
            ${escapeHtml(t.step2_button)} &rarr;
          </a>
        </td>
      </tr>
    </table>`
    : ''

  const existingClientBlock = opts.existingClientUrl
    ? `
    <div style="border-top:1px solid rgba(201,168,76,0.18);padding-top:16px;margin-top:8px;">
      <p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 4px;">
        ${escapeHtml(t.existing_client_label)}
      </p>
      <a href="${escapeHtml(opts.existingClientUrl)}" target="_blank" style="color:#c9a84c;font-size:13px;text-decoration:underline;">
        ${escapeHtml(t.existing_client_link)} &rarr;
      </a>
    </div>`
    : ''

  const content = `
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 18px;">
      ${escapeHtml(t.hi)} ${escapeHtml(firstName)},
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${intro}
    </p>

    <!-- STEP 1 — broker registration (always rendered) -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:6px;">${escapeHtml(t.step1_title)}</div>
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin:8px 0 6px;">${escapeHtml(t.why_label)}</p>
          <ul style="margin:0 0 4px;padding:0 0 0 18px;">${bullets}</ul>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${escapeHtml(affiliate)}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.4px;">
            ${escapeHtml(t.step1_button)} &rarr;
          </a>
        </td>
      </tr>
    </table>

    ${uidStep}

    <p style="color:#999;font-size:13px;line-height:1.6;margin:0 0 16px;">
      ${escapeHtml(t.questions)}
    </p>

    <p style="color:#888;font-size:13px;line-height:1.5;margin:18px 0 0;">
      ${escapeHtml(t.sign_off_prefix)} <strong style="color:#c9a84c;">${signOff}</strong>
    </p>

    ${existingClientBlock}
  `

  return {
    subject,
    html: baseEmailTemplate({
      content,
      previewText: preview,
      dir: isRtl ? 'rtl' : 'ltr',
    }),
  }
}
