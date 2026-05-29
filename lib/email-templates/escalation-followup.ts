import { baseEmailTemplate } from './base'

// 24-hour follow-up email for leads who clicked the broker link but never
// finished registration. Tone: friendly, helpful, not pushy. The CTA is
// the SAME tracked broker URL the lead got in the first email so the
// click count stays meaningful.

type Lang = 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

interface Translation {
  subject: string
  preview: string
  hi: string
  intro: string
  reassure: string
  cta_help: string
  cta_continue: string
  button: string
  sign_off_prefix: string
  team_name: string
}

const translations: Record<Lang, Translation> = {
  en: {
    subject: 'Need help finishing your PrimeVerse registration?',
    preview: 'Pick up where you left off — no pressure.',
    hi: 'Hi',
    intro: 'We saw you started signing up at PrimeVerse via {ibName}, but it looks like you didn\'t quite finish. Totally understandable — it can be a bit fiddly the first time.',
    reassure: '{ibName} is your personal IB and is ready to help you across the finish line. If you have any questions or need help with anything, just reply to this email and you\'ll hear back quickly.',
    cta_help: 'You can also pick up where you left off here:',
    cta_continue: 'Continue registration',
    button: 'Continue registration',
    sign_off_prefix: '—',
    team_name: 'The 1Move team',
  },
  no: {
    subject: 'Trenger du hjelp med registreringen?',
    preview: 'Fortsett der du slapp — ingen press.',
    hi: 'Hei',
    intro: 'Vi så at du startet registreringen hos PrimeVerse via {ibName}, men det ser ut som du ikke fikk fullført. Helt forståelig — det kan være litt knotete første gang.',
    reassure: '{ibName} er din personlige IB og er klar til å hjelpe deg ferdig. Hvis du har spørsmål eller trenger hjelp med noe, bare svar på denne mailen så hører du fra ham/henne raskt.',
    cta_help: 'Du kan også fortsette der du slapp her:',
    cta_continue: 'Fortsett registreringen',
    button: 'Fortsett registreringen',
    sign_off_prefix: 'Hilsen,',
    team_name: '1Move-teamet',
  },
  sv: {
    subject: 'Behöver du hjälp med registreringen?',
    preview: 'Fortsätt där du slutade — ingen press.',
    hi: 'Hej',
    intro: 'Vi såg att du började registrera dig på PrimeVerse via {ibName}, men det ser ut som att du inte hann klart. Helt förståeligt — det kan vara lite krångligt första gången.',
    reassure: '{ibName} är din personliga IB och redo att hjälpa dig hela vägen. Om du har frågor eller behöver hjälp med något, svara bara på det här mejlet så hör du av honom/henne snabbt.',
    cta_help: 'Du kan också fortsätta där du slutade här:',
    cta_continue: 'Fortsätt registreringen',
    button: 'Fortsätt registreringen',
    sign_off_prefix: 'Med vänliga hälsningar,',
    team_name: '1Move-teamet',
  },
  es: {
    subject: '¿Necesitas ayuda para terminar tu registro?',
    preview: 'Retoma donde lo dejaste — sin presión.',
    hi: 'Hola',
    intro: 'Vimos que empezaste a registrarte en PrimeVerse a través de {ibName}, pero parece que no terminaste. Totalmente entendible — la primera vez puede ser un poco engorroso.',
    reassure: '{ibName} es tu IB personal y está listo/a para ayudarte a cruzar la meta. Si tienes preguntas o necesitas ayuda con algo, simplemente responde a este correo y te contestará rápido.',
    cta_help: 'También puedes retomar donde lo dejaste aquí:',
    cta_continue: 'Continuar registro',
    button: 'Continuar registro',
    sign_off_prefix: 'Un saludo,',
    team_name: 'El equipo de 1Move',
  },
  ru: {
    subject: 'Помочь завершить регистрацию в PrimeVerse?',
    preview: 'Продолжите с того места, где остановились.',
    hi: 'Привет',
    intro: 'Мы заметили, что вы начали регистрацию в PrimeVerse через {ibName}, но не закончили. Это абсолютно нормально — в первый раз может быть немного запутанно.',
    reassure: '{ibName} — ваш персональный IB и готов помочь вам дойти до конца. Если у вас есть вопросы или нужна помощь, просто ответьте на это письмо, и вы быстро получите ответ.',
    cta_help: 'Вы также можете продолжить с того места, где остановились:',
    cta_continue: 'Продолжить регистрацию',
    button: 'Продолжить регистрацию',
    sign_off_prefix: 'С уважением,',
    team_name: 'Команда 1Move',
  },
  ar: {
    subject: 'هل تحتاج مساعدة لإكمال التسجيل في PrimeVerse؟',
    preview: 'تابع من حيث توقفت — بدون أي ضغط.',
    hi: 'مرحبًا',
    intro: 'لاحظنا أنك بدأت التسجيل في PrimeVerse عبر {ibName}، لكن يبدو أنك لم تكمل العملية. هذا أمر مفهوم تمامًا — قد يكون الأمر معقدًا قليلًا في المرة الأولى.',
    reassure: '{ibName} هو/هي الـ IB الشخصي الخاص بك ومستعد لمساعدتك حتى النهاية. إذا كانت لديك أي أسئلة أو احتجت إلى مساعدة، فقط رد على هذا البريد وستحصل على رد سريع.',
    cta_help: 'يمكنك أيضًا متابعة من حيث توقفت هنا:',
    cta_continue: 'متابعة التسجيل',
    button: 'متابعة التسجيل',
    sign_off_prefix: 'مع تحياتنا،',
    team_name: 'فريق 1Move',
  },
  tl: {
    subject: 'Kailangan ng tulong para tapusin ang iyong registration?',
    preview: 'Ipagpatuloy kung saan ka huminto — walang pressure.',
    hi: 'Kumusta',
    intro: 'Nakita namin na sinimulan mong magpa-register sa PrimeVerse sa pamamagitan ni {ibName}, pero parang hindi mo natapos. Naiintindihan namin — medyo nakakalito talaga sa unang beses.',
    reassure: 'Si {ibName} ang iyong personal na IB at handa kang tulungan hanggang sa matapos. Kung may tanong ka o kailangan mo ng tulong, sumagot lang sa email na ito at mabilis kang masasagot.',
    cta_help: 'Maaari ka ring magpatuloy kung saan ka huminto dito:',
    cta_continue: 'Ipagpatuloy ang registration',
    button: 'Ipagpatuloy ang registration',
    sign_off_prefix: 'Salamat,',
    team_name: 'Ang 1Move team',
  },
  pt: {
    subject: 'Precisa de ajuda para terminar seu registro?',
    preview: 'Retome de onde parou — sem pressão.',
    hi: 'Olá',
    intro: 'Vimos que você começou a se registrar no PrimeVerse através de {ibName}, mas parece que não conseguiu finalizar. Totalmente compreensível — pode ser um pouco confuso na primeira vez.',
    reassure: '{ibName} é seu IB pessoal e está pronto para ajudá-lo a chegar ao final. Se tiver dúvidas ou precisar de ajuda com algo, simplesmente responda a este email e receberá uma resposta rápida.',
    cta_help: 'Você também pode retomar de onde parou aqui:',
    cta_continue: 'Continuar registro',
    button: 'Continuar registro',
    sign_off_prefix: 'Atenciosamente,',
    team_name: 'A equipe 1Move',
  },
  th: {
    subject: 'ต้องการความช่วยเหลือในการลงทะเบียน PrimeVerse?',
    preview: 'ดำเนินการต่อจากจุดที่ค้างไว้ — ไม่ต้องรีบร้อน',
    hi: 'สวัสดี',
    intro: 'เราเห็นว่าคุณเริ่มลงทะเบียนที่ PrimeVerse ผ่าน {ibName} แต่ดูเหมือนคุณยังไม่ได้ทำให้เสร็จ เข้าใจได้เลย — ครั้งแรกอาจจะดูยุ่งยากนิดหน่อย',
    reassure: '{ibName} คือ IB ส่วนตัวของคุณและพร้อมที่จะช่วยให้คุณดำเนินการให้สำเร็จ หากมีคำถามหรือต้องการความช่วยเหลือ เพียงตอบกลับอีเมลฉบับนี้และคุณจะได้รับการตอบกลับอย่างรวดเร็ว',
    cta_help: 'คุณยังสามารถดำเนินการต่อจากจุดที่ค้างไว้ที่นี่:',
    cta_continue: 'ดำเนินการลงทะเบียนต่อ',
    button: 'ดำเนินการลงทะเบียนต่อ',
    sign_off_prefix: 'ขอแสดงความนับถือ,',
    team_name: 'ทีม 1Move',
  },
}

interface EscalationFollowupOptions {
  leadName: string
  ibName: string
  brokerLinkUrl: string
  lang?: string
}

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

export function buildEscalationFollowupEmail(opts: EscalationFollowupOptions): { subject: string; html: string } {
  const leadName = opts.leadName || ''
  const firstName = (leadName.split(' ')[0] || 'there').trim() || 'there'
  const ibName = (opts.ibName || 'your representative').trim()
  const langKey = (opts.lang || 'en').toLowerCase()
  const lang: Lang = (translations as Record<string, Translation>)[langKey] ? (langKey as Lang) : 'en'
  const t = translations[lang]
  const isRtl = lang === 'ar'

  const tokens = { firstName: escapeHtml(firstName), ibName: escapeHtml(ibName) }
  const intro = applyTokens(t.intro, tokens)
  const reassure = applyTokens(t.reassure, tokens)

  const content = `
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 18px;">
      ${escapeHtml(t.hi)} ${escapeHtml(firstName)},
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 18px;">
      ${intro}
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${reassure}
    </p>

    <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 10px;">
      ${escapeHtml(t.cta_help)}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${escapeHtml(opts.brokerLinkUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.4px;">
            ${escapeHtml(t.button)} &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:13px;line-height:1.5;margin:18px 0 0;">
      ${escapeHtml(t.sign_off_prefix)} <strong style="color:#c9a84c;">${escapeHtml(t.team_name)}</strong>
    </p>
  `

  return {
    subject: t.subject,
    html: baseEmailTemplate({
      content,
      previewText: t.preview,
      dir: isRtl ? 'rtl' : 'ltr',
    }),
  }
}
