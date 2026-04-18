import { baseEmailTemplate } from './base'

const subjects: Record<string, string> = {
  en: "You're registered — here's what happens next",
  no: 'Du er registrert — her er hva som skjer nå',
  sv: 'Du är registrerad — här är vad som händer härnäst',
  es: 'Estás registrado — aquí está lo que sucede a continuación',
  ru: 'Вы зарегистрированы — вот что произойдет дальше',
  ar: 'تم تسجيلك — إليك ما سيحدث بعد ذلك',
  tl: 'Nairehistro ka na — narito ang susunod na mangyayari',
  pt: 'Você está registrado — veja o que acontece a seguir',
  th: 'คุณได้ลงทะเบียนแล้ว — นี่คือสิ่งที่จะเกิดขึ้นต่อไป',
}

interface LeadWelcomeOptions {
  leadName: string
  distributorName: string
  referralLink: string
  lang?: string
}

export function buildLeadWelcomeEmail({ leadName, distributorName, referralLink, lang = 'en' }: LeadWelcomeOptions) {
  const firstName = leadName.split(' ')[0] || leadName || 'there'
  const isRtl = lang === 'ar'

  const content = `
    <h1 style="color:#c9a84c;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;">
      You're registered ✓
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName},
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You've taken the first step.
    </p>
    <p style="color:#c9a84c;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px;">
      Here's what happens next:
    </p>

    <!-- Step 1 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 1 — Register with our broker partner</div>
          <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">
            Use the link below to open your trading account. It takes less than 5 minutes.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${referralLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            Open Trading Account &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Step 2 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #888;border-radius:0 6px 6px 0;">
          <div style="color:#aaa;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 2 — Submit your UID</div>
          <p style="color:#999;font-size:14px;line-height:1.5;margin:0;">
            Once registered, come back and submit your account ID (UID) to get verified.
          </p>
        </td>
      </tr>
    </table>

    <!-- Step 3 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #555;border-radius:0 6px 6px 0;">
          <div style="color:#888;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">STEP 3 — Get access</div>
          <p style="color:#777;font-size:14px;line-height:1.5;margin:0;">
            After verification you get full access to Primeverse — live trading, signals, and community.
          </p>
        </td>
      </tr>
    </table>

    <div style="border-top:1px solid rgba(201, 168, 76,0.2);padding-top:20px;margin-top:8px;">
      <p style="color:#999;font-size:13px;line-height:1.5;margin:0 0 4px;">
        Any questions? Contact <strong style="color:#c9a84c;">${distributorName}</strong>.
      </p>
      <p style="color:#888;font-size:13px;line-height:1.5;margin:0;text-align:center;font-style:italic;margin-top:16px;">
        People Before Profit.
      </p>
    </div>
  `

  return {
    subject: subjects[lang] || subjects.en,
    html: baseEmailTemplate({
      content,
      previewText: "You're registered — here's what happens next",
      dir: isRtl ? 'rtl' : 'ltr',
    }),
  }
}
