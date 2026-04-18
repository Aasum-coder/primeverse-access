import { baseEmailTemplate } from './base'

type Lang = 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

const subjects: Record<Lang, string> = {
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

interface StepCopy {
  heading: string
  registered_tag: string
  hi: string
  intro: string
  next_label: string
  step1_title: string
  step1_body: string
  step1_button: string
  step2_title: string
  step2_body: string
  step3_title: string
  step3_body: string
  spam_note: string
  any_questions: string
  contact_prefix: string
  sign_off: string
}

const copy: Record<Lang, StepCopy> = {
  en: {
    heading: "You're registered ✓",
    registered_tag: "You've taken the first step.",
    hi: 'Hi',
    intro: "Here's what happens next:",
    next_label: "HERE'S WHAT HAPPENS NEXT",
    step1_title: 'STEP 1 — Open your broker account',
    step1_body: 'Use the button below to register with PU Prime. Takes under 5 minutes.',
    step1_button: 'Open Trading Account',
    step2_title: 'STEP 2 — Complete KYC verification',
    step2_body: 'KYC is a quick identity check required by law. Your broker will guide you through it — usually takes 10-15 minutes.',
    step3_title: 'STEP 3 — Your access arrives automatically',
    step3_body: "Once your KYC is approved, you'll automatically receive a second email with direct access to the Primeverse ecosystem and 1Move Academy — usually within 24 hours.",
    spam_note: "Didn't see the access email? Check Spam/Junk and add noreply@primeverseaccess.com to your contacts.",
    any_questions: 'Any questions? Contact',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  no: {
    heading: 'Du er registrert ✓',
    registered_tag: 'Du har tatt det første steget.',
    hi: 'Hei',
    intro: 'Her er hva som skjer nå:',
    next_label: 'HER ER HVA SOM SKJER NÅ',
    step1_title: 'STEG 1 — Åpne broker-kontoen din',
    step1_body: 'Bruk knappen under for å registrere deg hos PU Prime. Tar under 5 minutter.',
    step1_button: 'Åpne handelskonto',
    step2_title: 'STEG 2 — Fullfør KYC-verifisering',
    step2_body: 'KYC er en rask identitetsbekreftelse som er lovpålagt. Megleren din veileder deg gjennom det — tar vanligvis 10-15 minutter.',
    step3_title: 'STEG 3 — Tilgangen din kommer automatisk',
    step3_body: 'Når KYC er godkjent, mottar du automatisk en e-post med direkte tilgang til Primeverse-økosystemet og 1Move Academy — vanligvis innen 24 timer.',
    spam_note: 'Ikke sett tilgangs-e-posten? Sjekk Spam/Søppel og legg til noreply@primeverseaccess.com i kontaktene dine.',
    any_questions: 'Har du spørsmål? Kontakt',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  sv: {
    heading: 'Du är registrerad ✓',
    registered_tag: 'Du har tagit det första steget.',
    hi: 'Hej',
    intro: 'Här är vad som händer härnäst:',
    next_label: 'HÄR ÄR VAD SOM HÄNDER HÄRNÄST',
    step1_title: 'STEG 1 — Öppna ditt mäklarkonto',
    step1_body: 'Använd knappen nedan för att registrera dig hos PU Prime. Tar under 5 minuter.',
    step1_button: 'Öppna handelskonto',
    step2_title: 'STEG 2 — Slutför KYC-verifiering',
    step2_body: 'KYC är en snabb identitetskontroll som krävs enligt lag. Din mäklare guidar dig — tar vanligtvis 10-15 minuter.',
    step3_title: 'STEG 3 — Din åtkomst kommer automatiskt',
    step3_body: 'När KYC är godkänt får du automatiskt ett mejl med direkt åtkomst till Primeverse-ekosystemet och 1Move Academy — vanligtvis inom 24 timmar.',
    spam_note: 'Såg du inte åtkomstmejlet? Kolla Spam/Skräppost och lägg till noreply@primeverseaccess.com i dina kontakter.',
    any_questions: 'Har du frågor? Kontakta',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  es: {
    heading: '¡Estás registrado! ✓',
    registered_tag: 'Has dado el primer paso.',
    hi: 'Hola',
    intro: 'Esto es lo que sucede a continuación:',
    next_label: 'ESTO ES LO QUE SUCEDE A CONTINUACIÓN',
    step1_title: 'PASO 1 — Abre tu cuenta de bróker',
    step1_body: 'Usa el botón de abajo para registrarte con PU Prime. Toma menos de 5 minutos.',
    step1_button: 'Abrir cuenta de trading',
    step2_title: 'PASO 2 — Completa la verificación KYC',
    step2_body: 'KYC es una verificación de identidad rápida requerida por ley. Tu bróker te guiará — suele tomar 10-15 minutos.',
    step3_title: 'PASO 3 — Tu acceso llega automáticamente',
    step3_body: 'Una vez aprobado tu KYC, recibirás automáticamente un correo con acceso directo al ecosistema Primeverse y a 1Move Academy — generalmente en 24 horas.',
    spam_note: '¿No viste el correo de acceso? Revisa Spam/Correo no deseado y añade noreply@primeverseaccess.com a tus contactos.',
    any_questions: '¿Tienes preguntas? Contacta a',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  ru: {
    heading: 'Вы зарегистрированы ✓',
    registered_tag: 'Вы сделали первый шаг.',
    hi: 'Привет',
    intro: 'Вот что произойдет дальше:',
    next_label: 'ВОТ ЧТО ПРОИЗОЙДЕТ ДАЛЬШЕ',
    step1_title: 'ШАГ 1 — Откройте брокерский счет',
    step1_body: 'Используйте кнопку ниже для регистрации в PU Prime. Займет менее 5 минут.',
    step1_button: 'Открыть торговый счет',
    step2_title: 'ШАГ 2 — Пройдите KYC-верификацию',
    step2_body: 'KYC — это быстрая проверка личности, обязательная по закону. Брокер проведет вас — обычно 10-15 минут.',
    step3_title: 'ШАГ 3 — Доступ приходит автоматически',
    step3_body: 'После одобрения KYC вы автоматически получите письмо с прямым доступом к экосистеме Primeverse и 1Move Academy — обычно в течение 24 часов.',
    spam_note: 'Не видите письмо с доступом? Проверьте Спам и добавьте noreply@primeverseaccess.com в контакты.',
    any_questions: 'Есть вопросы? Свяжитесь с',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  ar: {
    heading: 'تم تسجيلك ✓',
    registered_tag: 'لقد اتخذت الخطوة الأولى.',
    hi: 'مرحباً',
    intro: 'إليك ما سيحدث بعد ذلك:',
    next_label: 'إليك ما سيحدث بعد ذلك',
    step1_title: 'الخطوة 1 — افتح حساب الوسيط الخاص بك',
    step1_body: 'استخدم الزر أدناه للتسجيل لدى PU Prime. يستغرق أقل من 5 دقائق.',
    step1_button: 'افتح حساب التداول',
    step2_title: 'الخطوة 2 — أكمل التحقق من KYC',
    step2_body: 'KYC هو تحقق سريع من الهوية مطلوب بموجب القانون. سيرشدك الوسيط — يستغرق عادةً 10-15 دقيقة.',
    step3_title: 'الخطوة 3 — يصل وصولك تلقائيًا',
    step3_body: 'بمجرد الموافقة على KYC، ستتلقى تلقائيًا بريدًا إلكترونيًا مع وصول مباشر إلى نظام Primeverse البيئي و1Move Academy — عادةً خلال 24 ساعة.',
    spam_note: 'لم تر بريد الوصول؟ تحقق من البريد غير المرغوب فيه وأضف noreply@primeverseaccess.com إلى جهات اتصالك.',
    any_questions: 'هل لديك أسئلة؟ تواصل مع',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  tl: {
    heading: 'Nairehistro ka na ✓',
    registered_tag: 'Nagawa mo na ang unang hakbang.',
    hi: 'Kumusta',
    intro: 'Narito ang susunod na mangyayari:',
    next_label: 'NARITO ANG SUSUNOD NA MANGYAYARI',
    step1_title: 'HAKBANG 1 — Buksan ang iyong broker account',
    step1_body: 'Gamitin ang button sa ibaba para magparehistro sa PU Prime. Tumatagal ng wala pang 5 minuto.',
    step1_button: 'Buksan ang trading account',
    step2_title: 'HAKBANG 2 — Kumpletuhin ang KYC verification',
    step2_body: 'Ang KYC ay isang mabilis na pagpapatunay ng pagkakakilanlan na kinakailangan ng batas. Gagabayan ka ng broker — karaniwang 10-15 minuto.',
    step3_title: 'HAKBANG 3 — Awtomatikong darating ang iyong access',
    step3_body: 'Kapag naaprubahan ang iyong KYC, awtomatiko kang makakatanggap ng email na may direktang access sa Primeverse ecosystem at 1Move Academy — kadalasan sa loob ng 24 oras.',
    spam_note: 'Hindi nakita ang access email? Tingnan ang Spam/Junk at idagdag ang noreply@primeverseaccess.com sa iyong contacts.',
    any_questions: 'May mga tanong? Makipag-ugnayan kay',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  pt: {
    heading: 'Você está registrado ✓',
    registered_tag: 'Você deu o primeiro passo.',
    hi: 'Olá',
    intro: 'Veja o que acontece a seguir:',
    next_label: 'VEJA O QUE ACONTECE A SEGUIR',
    step1_title: 'PASSO 1 — Abra sua conta de corretor',
    step1_body: 'Use o botão abaixo para se registrar na PU Prime. Leva menos de 5 minutos.',
    step1_button: 'Abrir conta de trading',
    step2_title: 'PASSO 2 — Conclua a verificação KYC',
    step2_body: 'KYC é uma verificação de identidade rápida exigida por lei. Seu corretor vai te guiar — geralmente leva 10-15 minutos.',
    step3_title: 'PASSO 3 — Seu acesso chega automaticamente',
    step3_body: 'Após a aprovação do KYC, você receberá automaticamente um e-mail com acesso direto ao ecossistema Primeverse e à 1Move Academy — geralmente em 24 horas.',
    spam_note: 'Não viu o e-mail de acesso? Verifique Spam/Lixo eletrônico e adicione noreply@primeverseaccess.com aos seus contatos.',
    any_questions: 'Alguma dúvida? Entre em contato com',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
  th: {
    heading: 'คุณลงทะเบียนแล้ว ✓',
    registered_tag: 'คุณได้ก้าวไปสู่ขั้นตอนแรกแล้ว',
    hi: 'สวัสดี',
    intro: 'นี่คือสิ่งที่จะเกิดขึ้นต่อไป:',
    next_label: 'นี่คือสิ่งที่จะเกิดขึ้นต่อไป',
    step1_title: 'ขั้นตอนที่ 1 — เปิดบัญชีโบรกเกอร์ของคุณ',
    step1_body: 'ใช้ปุ่มด้านล่างเพื่อลงทะเบียนกับ PU Prime ใช้เวลาน้อยกว่า 5 นาที',
    step1_button: 'เปิดบัญชีเทรด',
    step2_title: 'ขั้นตอนที่ 2 — ทำการยืนยัน KYC ให้เสร็จ',
    step2_body: 'KYC คือการตรวจสอบตัวตนอย่างรวดเร็วที่กฎหมายกำหนด โบรกเกอร์จะแนะนำคุณ — ปกติใช้เวลา 10-15 นาที',
    step3_title: 'ขั้นตอนที่ 3 — การเข้าถึงของคุณจะมาอัตโนมัติ',
    step3_body: 'เมื่อ KYC ได้รับการอนุมัติ คุณจะได้รับอีเมลอัตโนมัติพร้อมสิทธิ์เข้าถึงโดยตรงสู่ระบบนิเวศ Primeverse และ 1Move Academy — ปกติภายใน 24 ชั่วโมง',
    spam_note: 'ไม่เห็นอีเมลการเข้าถึง? ตรวจสอบโฟลเดอร์สแปมและเพิ่ม noreply@primeverseaccess.com ในรายชื่อติดต่อของคุณ',
    any_questions: 'มีคำถาม? ติดต่อ',
    contact_prefix: '.',
    sign_off: 'People Before Profit.',
  },
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
  const l = (copy[lang as Lang] ? (lang as Lang) : 'en')
  const c = copy[l]

  const content = `
    <h1 style="color:#c9a84c;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;">
      ${c.heading}
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;">
      ${c.hi} ${firstName},
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${c.registered_tag}
    </p>
    <p style="color:#c9a84c;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px;">
      ${c.next_label}
    </p>

    <!-- Step 1 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">${c.step1_title}</div>
          <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">
            ${c.step1_body}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${referralLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            ${c.step1_button} &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Step 2 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">${c.step2_title}</div>
          <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">
            ${c.step2_body}
          </p>
        </td>
      </tr>
    </table>

    <!-- Step 3 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
      <tr>
        <td style="padding:14px 16px;background:#080808;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">
          <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:0.05em;margin-bottom:4px;">${c.step3_title}</div>
          <p style="color:#ccc;font-size:14px;line-height:1.5;margin:0;">
            ${c.step3_body}
          </p>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:12px;line-height:1.6;font-style:italic;margin:0 0 24px;">
      ${c.spam_note}
    </p>

    <div style="border-top:1px solid rgba(201, 168, 76,0.2);padding-top:20px;margin-top:8px;">
      <p style="color:#999;font-size:13px;line-height:1.5;margin:0 0 4px;">
        ${c.any_questions} <strong style="color:#c9a84c;">${distributorName}</strong>${c.contact_prefix}
      </p>
      <p style="color:#888;font-size:13px;line-height:1.5;margin:16px 0 0;text-align:center;font-style:italic;">
        ${c.sign_off}
      </p>
    </div>
  `

  return {
    subject: subjects[l],
    html: baseEmailTemplate({
      content,
      previewText: subjects[l],
      dir: isRtl ? 'rtl' : 'ltr',
    }),
  }
}
