import { baseEmailTemplate } from './base'

interface WelcomeTranslation {
  subject: string
  preview: string
  heading: string
  body_1: string
  body_2: string
  step_1: string
  step_1_time: string
  step_2: string
  step_2_time: string
  step_3: string
  step_3_time: string
  step_4: string
  body_3: string
  cta: string
  help: string
  sign_off: string
  sign_name: string
}

const translations: Record<string, WelcomeTranslation> = {
  en: {
    subject: "You're in! Let's build your landing page in 5 minutes",
    preview: 'Your IB dashboard is ready. Complete your profile and go live today.',
    heading: "You're officially in, {name}! 🎉",
    body_1: 'Welcome to SYSTM8 — your personal command center for building your IB business with PrimeVerse.',
    body_2: "Your dashboard is live and ready. Here's how fast you can get started:",
    step_1: 'Complete your profile',
    step_1_time: '(2 min)',
    step_2: 'Generate your AI-powered bio',
    step_2_time: '(1 min)',
    step_3: 'Launch your personal landing page',
    step_3_time: '(1 min)',
    step_4: 'Share your link and start getting leads',
    body_3: "That's it — 5 minutes from now, you could have your own professional landing page working for you 24/7.",
    cta: 'COMPLETE MY PROFILE',
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_off: "Let's build something great together.",
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Du er inne! La oss bygge landingssiden din på 5 minutter',
    preview: 'IB-dashboardet ditt er klart. Fullfør profilen din og gå live i dag.',
    heading: 'Du er offisielt inne, {name}! 🎉',
    body_1: 'Velkommen til SYSTM8 — ditt personlige kommandosenter for å bygge din IB-virksomhet med PrimeVerse.',
    body_2: 'Dashboardet ditt er live og klart. Slik raskt kan du komme i gang:',
    step_1: 'Fullfør profilen din',
    step_1_time: '(2 min)',
    step_2: 'Generer din AI-drevne bio',
    step_2_time: '(1 min)',
    step_3: 'Lanser din personlige landingsside',
    step_3_time: '(1 min)',
    step_4: 'Del lenken din og begynn å få leads',
    body_3: 'Det er alt — om 5 minutter kan du ha din egen profesjonelle landingsside som jobber for deg 24/7.',
    cta: 'FULLFØR PROFILEN MIN',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_off: 'La oss bygge noe flott sammen.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Du är inne! Låt oss bygga din landningssida på 5 minuter',
    preview: 'Din IB-dashboard är redo. Fyll i din profil och gå live idag.',
    heading: 'Du är officiellt inne, {name}! 🎉',
    body_1: 'Välkommen till SYSTM8 — ditt personliga kommandocenter för att bygga din IB-verksamhet med PrimeVerse.',
    body_2: 'Din dashboard är live och redo. Så här snabbt kan du komma igång:',
    step_1: 'Fyll i din profil',
    step_1_time: '(2 min)',
    step_2: 'Generera din AI-drivna bio',
    step_2_time: '(1 min)',
    step_3: 'Lansera din personliga landningssida',
    step_3_time: '(1 min)',
    step_4: 'Dela din länk och börja få leads',
    body_3: 'Det är allt — om 5 minuter kan du ha din egen professionella landningssida som jobbar för dig 24/7.',
    cta: 'FYLL I MIN PROFIL',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_off: 'Låt oss bygga något fantastiskt tillsammans.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: '¡Estás dentro! Construyamos tu landing page en 5 minutos',
    preview: 'Tu panel IB está listo. Completa tu perfil y lánzalo hoy.',
    heading: '¡Estás oficialmente dentro, {name}! 🎉',
    body_1: 'Bienvenido a SYSTM8 — tu centro de mando personal para construir tu negocio IB con PrimeVerse.',
    body_2: 'Tu panel está activo y listo. Así de rápido puedes empezar:',
    step_1: 'Completa tu perfil',
    step_1_time: '(2 min)',
    step_2: 'Genera tu bio con IA',
    step_2_time: '(1 min)',
    step_3: 'Lanza tu landing page personal',
    step_3_time: '(1 min)',
    step_4: 'Comparte tu enlace y empieza a conseguir leads',
    body_3: 'Eso es todo — en 5 minutos podrías tener tu propia landing page profesional trabajando para ti 24/7.',
    cta: 'COMPLETAR MI PERFIL',
    help: 'Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_off: 'Construyamos algo grandioso juntos.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'Вы в деле! Создадим вашу страницу за 5 минут',
    preview: 'Ваш IB-дашборд готов. Заполните профиль и запуститесь сегодня.',
    heading: 'Вы официально в деле, {name}! 🎉',
    body_1: 'Добро пожаловать в SYSTM8 — ваш персональный командный центр для построения IB-бизнеса с PrimeVerse.',
    body_2: 'Ваш дашборд уже работает. Вот как быстро вы можете начать:',
    step_1: 'Заполните профиль',
    step_1_time: '(2 мин)',
    step_2: 'Сгенерируйте AI-биографию',
    step_2_time: '(1 мин)',
    step_3: 'Запустите персональную страницу',
    step_3_time: '(1 мин)',
    step_4: 'Поделитесь ссылкой и начните получать лиды',
    body_3: 'Это всё — через 5 минут у вас может быть собственная профессиональная страница, работающая на вас 24/7.',
    cta: 'ЗАПОЛНИТЬ ПРОФИЛЬ',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_off: 'Давайте создадим что-то великое вместе.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'أنت في الداخل! لنبني صفحتك في 5 دقائق',
    preview: 'لوحة IB الخاصة بك جاهزة. أكمل ملفك الشخصي وانطلق اليوم.',
    heading: 'أنت رسمياً في الداخل، {name}! 🎉',
    body_1: 'مرحباً بك في SYSTM8 — مركز التحكم الشخصي لبناء أعمال IB الخاصة بك مع PrimeVerse.',
    body_2: 'لوحة التحكم الخاصة بك جاهزة. إليك مدى سرعة البدء:',
    step_1: 'أكمل ملفك الشخصي',
    step_1_time: '(2 دقيقة)',
    step_2: 'أنشئ سيرتك الذاتية بالذكاء الاصطناعي',
    step_2_time: '(1 دقيقة)',
    step_3: 'أطلق صفحة الهبوط الشخصية',
    step_3_time: '(1 دقيقة)',
    step_4: 'شارك رابطك وابدأ في الحصول على عملاء محتملين',
    body_3: 'هذا كل شيء — بعد 5 دقائق، يمكن أن يكون لديك صفحة هبوط احترافية تعمل لك على مدار الساعة.',
    cta: 'إكمال ملفي الشخصي',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_off: 'لنبني شيئاً عظيماً معاً.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'Pasok ka na! Buuin natin ang landing page mo sa 5 minuto',
    preview: 'Handa na ang IB dashboard mo. Kumpletuhin ang profile mo at mag-go live ngayon.',
    heading: 'Opisyal ka nang pasok, {name}! 🎉',
    body_1: 'Welcome sa SYSTM8 — ang iyong personal na command center para buuin ang IB business mo sa PrimeVerse.',
    body_2: 'Live na at handa na ang dashboard mo. Ganito kabilis magsimula:',
    step_1: 'Kumpletuhin ang profile mo',
    step_1_time: '(2 min)',
    step_2: 'I-generate ang AI-powered bio mo',
    step_2_time: '(1 min)',
    step_3: 'I-launch ang personal na landing page mo',
    step_3_time: '(1 min)',
    step_4: 'I-share ang link mo at magsimulang kumuha ng leads',
    body_3: 'Iyan lang — sa loob ng 5 minuto, maaari ka nang magkaroon ng sariling professional na landing page na nagtatrabaho para sa iyo 24/7.',
    cta: 'KUMPLETUHIN ANG PROFILE KO',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_off: 'Buuin natin ang magandang bagay nang magkasama.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Você está dentro! Vamos criar sua landing page em 5 minutos',
    preview: 'Seu painel IB está pronto. Complete seu perfil e vá ao ar hoje.',
    heading: 'Você está oficialmente dentro, {name}! 🎉',
    body_1: 'Bem-vindo ao SYSTM8 — seu centro de comando pessoal para construir seu negócio IB com a PrimeVerse.',
    body_2: 'Seu painel está ativo e pronto. Veja como é rápido começar:',
    step_1: 'Complete seu perfil',
    step_1_time: '(2 min)',
    step_2: 'Gere sua bio com IA',
    step_2_time: '(1 min)',
    step_3: 'Lance sua landing page pessoal',
    step_3_time: '(1 min)',
    step_4: 'Compartilhe seu link e comece a receber leads',
    body_3: 'É isso — em 5 minutos, você pode ter sua própria landing page profissional trabalhando para você 24/7.',
    cta: 'COMPLETAR MEU PERFIL',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_off: 'Vamos construir algo incrível juntos.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คุณเข้ามาแล้ว! มาสร้าง landing page ของคุณใน 5 นาที',
    preview: 'แดชบอร์ด IB ของคุณพร้อมแล้ว ทำโปรไฟล์ให้เสร็จและเปิดใช้วันนี้',
    heading: 'คุณเข้ามาอย่างเป็นทางการแล้ว, {name}! 🎉',
    body_1: 'ยินดีต้อนรับสู่ SYSTM8 — ศูนย์บัญชาการส่วนตัวของคุณสำหรับสร้างธุรกิจ IB กับ PrimeVerse',
    body_2: 'แดชบอร์ดของคุณพร้อมใช้งานแล้ว เริ่มต้นได้เร็วขนาดนี้:',
    step_1: 'ทำโปรไฟล์ให้เสร็จ',
    step_1_time: '(2 นาที)',
    step_2: 'สร้างไบโอด้วย AI',
    step_2_time: '(1 นาที)',
    step_3: 'เปิดตัว landing page ส่วนตัว',
    step_3_time: '(1 นาที)',
    step_4: 'แชร์ลิงก์และเริ่มรับ leads',
    body_3: 'แค่นั้น — อีก 5 นาที คุณจะมี landing page มืออาชีพของตัวเองที่ทำงานให้คุณ 24/7',
    cta: 'ทำโปรไฟล์ให้เสร็จ',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_off: 'มาสร้างสิ่งที่ยอดเยี่ยมด้วยกัน',
    sign_name: '— ทีม 1Move',
  },
}

function buildStepRow(num: number, text: string, time: string | null): string {
  return `<tr>
    <td width="48" valign="top" style="padding:12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="36" height="36" align="center" valign="middle" style="background-color:#c9a84c;border-radius:50%;color:#080808;font-size:16px;font-weight:700;">
            ${num}
          </td>
        </tr>
      </table>
    </td>
    <td valign="middle" style="padding:12px 0 12px 12px;">
      <span style="color:#E0E0E0;font-size:15px;line-height:1.4;">${text}</span>${time ? `&nbsp;<span style="color:#888;font-size:13px;">${time}</span>` : ''}
    </td>
  </tr>`
}

interface WelcomeEmailOptions {
  name: string
  lang?: string
}

export function buildWelcomeEmail({ name, lang = 'en' }: WelcomeEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:24px;margin:0 0 24px;text-align:center;">${t.heading.replace('{name}', name)}</h1>

<!-- Body paragraphs -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};">${t.body_1}</p>
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.body_2}</p>

<!-- 4 Steps -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
  ${buildStepRow(1, t.step_1, t.step_1_time)}
  <tr><td colspan="2" style="border-bottom:1px solid #2A2A4A;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  ${buildStepRow(2, t.step_2, t.step_2_time)}
  <tr><td colspan="2" style="border-bottom:1px solid #2A2A4A;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  ${buildStepRow(3, t.step_3, t.step_3_time)}
  <tr><td colspan="2" style="border-bottom:1px solid #2A2A4A;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  ${buildStepRow(4, t.step_4, null)}
</table>

<!-- Body closing -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:20px 0 28px;text-align:${textAlign};">${t.body_3}</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:0 0 24px;">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#c9a84c;color:#080808;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta}
      </a>
    </td>
  </tr>
</table>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0;text-align:${textAlign};">
  ${t.sign_off}<br/>
  <span style="color:#c9a84c;font-weight:700;">${t.sign_name}</span>
</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
