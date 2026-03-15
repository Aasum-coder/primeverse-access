import { baseEmailTemplate } from './base'

interface VerificationTranslation {
  subject: string
  preview: string
  heading: string
  greeting: string
  body: string
  cta: string
  features_intro: string
  feature_1: string
  feature_2: string
  feature_3: string
  feature_4: string
  expiry: string
  sign_off: string
  sign_name: string
}

const translations: Record<string, VerificationTranslation> = {
  en: {
    subject: 'Verify your email — Your IB dashboard is waiting',
    preview: 'One click to unlock your personal IB dashboard and landing page.',
    heading: 'Verify your email address',
    greeting: 'Hi {name},',
    body: 'Thanks for signing up! Please verify your email address to activate your IB dashboard and start building your personal landing page.',
    cta: 'Verify Email Address',
    features_intro: "Once verified, you'll get access to:",
    feature_1: 'Your personal landing page with a custom URL',
    feature_2: 'A real-time lead management dashboard',
    feature_3: 'AI-powered tools from SYSTM8',
    feature_4: 'Multi-language support for global reach',
    expiry: 'This link expires in 24 hours. If you did not create an account, you can safely ignore this email.',
    sign_off: 'Welcome aboard,',
    sign_name: 'The 1Move Team',
  },
  no: {
    subject: 'Verifiser e-posten din — IB-dashboardet ditt venter',
    preview: 'Ett klikk for å låse opp ditt personlige IB-dashboard og landingsside.',
    heading: 'Verifiser e-postadressen din',
    greeting: 'Hei {name},',
    body: 'Takk for at du registrerte deg! Vennligst verifiser e-postadressen din for å aktivere IB-dashboardet ditt og begynne å bygge din personlige landingsside.',
    cta: 'Verifiser e-postadresse',
    features_intro: 'Når du er verifisert, får du tilgang til:',
    feature_1: 'Din personlige landingsside med en egendefinert URL',
    feature_2: 'Et sanntids lead management-dashboard',
    feature_3: 'AI-drevne verktøy fra SYSTM8',
    feature_4: 'Flerspråklig støtte for global rekkevidde',
    expiry: 'Denne lenken utløper om 24 timer. Hvis du ikke opprettet en konto, kan du trygt ignorere denne e-posten.',
    sign_off: 'Velkommen om bord,',
    sign_name: '1Move-teamet',
  },
  sv: {
    subject: 'Verifiera din e-post — Din IB-dashboard väntar',
    preview: 'Ett klick för att låsa upp din personliga IB-dashboard och landningssida.',
    heading: 'Verifiera din e-postadress',
    greeting: 'Hej {name},',
    body: 'Tack för att du registrerade dig! Vänligen verifiera din e-postadress för att aktivera din IB-dashboard och börja bygga din personliga landningssida.',
    cta: 'Verifiera e-postadress',
    features_intro: 'När du är verifierad får du tillgång till:',
    feature_1: 'Din personliga landningssida med en anpassad URL',
    feature_2: 'En realtids lead management-dashboard',
    feature_3: 'AI-drivna verktyg från SYSTM8',
    feature_4: 'Flerspråkigt stöd för global räckvidd',
    expiry: 'Denna länk upphör om 24 timmar. Om du inte skapade ett konto kan du lugnt ignorera detta e-postmeddelande.',
    sign_off: 'Välkommen ombord,',
    sign_name: '1Move-teamet',
  },
  es: {
    subject: 'Verifica tu email — Tu panel IB te está esperando',
    preview: 'Un clic para desbloquear tu panel IB personal y tu página de aterrizaje.',
    heading: 'Verifica tu dirección de email',
    greeting: 'Hola {name},',
    body: '¡Gracias por registrarte! Por favor verifica tu dirección de email para activar tu panel IB y comenzar a construir tu página de aterrizaje personal.',
    cta: 'Verificar email',
    features_intro: 'Una vez verificado, tendrás acceso a:',
    feature_1: 'Tu página de aterrizaje personal con una URL personalizada',
    feature_2: 'Un panel de gestión de leads en tiempo real',
    feature_3: 'Herramientas impulsadas por IA de SYSTM8',
    feature_4: 'Soporte multilingüe para alcance global',
    expiry: 'Este enlace expira en 24 horas. Si no creaste una cuenta, puedes ignorar este email de forma segura.',
    sign_off: 'Bienvenido a bordo,',
    sign_name: 'El equipo de 1Move',
  },
  ru: {
    subject: 'Подтвердите email — Ваш IB-дашборд ждёт',
    preview: 'Один клик, чтобы открыть ваш персональный IB-дашборд и лендинг.',
    heading: 'Подтвердите ваш email',
    greeting: 'Привет, {name}!',
    body: 'Спасибо за регистрацию! Пожалуйста, подтвердите ваш email, чтобы активировать IB-дашборд и начать создание вашей персональной страницы.',
    cta: 'Подтвердить email',
    features_intro: 'После подтверждения вы получите доступ к:',
    feature_1: 'Персональная страница с уникальным URL',
    feature_2: 'Дашборд управления лидами в реальном времени',
    feature_3: 'AI-инструменты от SYSTM8',
    feature_4: 'Мультиязычная поддержка для глобального охвата',
    expiry: 'Эта ссылка действительна 24 часа. Если вы не создавали аккаунт, просто проигнорируйте это письмо.',
    sign_off: 'Добро пожаловать,',
    sign_name: 'Команда 1Move',
  },
  ar: {
    subject: 'تحقق من بريدك الإلكتروني — لوحة IB الخاصة بك في انتظارك',
    preview: 'نقرة واحدة لفتح لوحة IB الشخصية وصفحة الهبوط الخاصة بك.',
    heading: 'تحقق من عنوان بريدك الإلكتروني',
    greeting: 'مرحباً {name}،',
    body: 'شكراً لتسجيلك! يرجى التحقق من عنوان بريدك الإلكتروني لتفعيل لوحة IB الخاصة بك والبدء في بناء صفحة الهبوط الشخصية.',
    cta: 'تحقق من البريد الإلكتروني',
    features_intro: 'بعد التحقق، ستحصل على:',
    feature_1: 'صفحة هبوط شخصية برابط مخصص',
    feature_2: 'لوحة إدارة العملاء المحتملين في الوقت الفعلي',
    feature_3: 'أدوات مدعومة بالذكاء الاصطناعي من SYSTM8',
    feature_4: 'دعم متعدد اللغات للوصول العالمي',
    expiry: 'ينتهي هذا الرابط خلال 24 ساعة. إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.',
    sign_off: 'أهلاً بك معنا،',
    sign_name: 'فريق 1Move',
  },
  tl: {
    subject: 'I-verify ang iyong email — Ang IB dashboard mo ay naghihintay',
    preview: 'Isang click para ma-unlock ang iyong personal na IB dashboard at landing page.',
    heading: 'I-verify ang iyong email address',
    greeting: 'Hi {name},',
    body: 'Salamat sa pag-sign up! Paki-verify ang iyong email address para ma-activate ang iyong IB dashboard at simulang buuin ang iyong personal na landing page.',
    cta: 'I-verify ang Email',
    features_intro: 'Kapag na-verify ka na, magkakaroon ka ng access sa:',
    feature_1: 'Iyong personal na landing page na may custom URL',
    feature_2: 'Real-time lead management dashboard',
    feature_3: 'AI-powered tools mula sa SYSTM8',
    feature_4: 'Multi-language support para sa global reach',
    expiry: 'Ang link na ito ay mag-e-expire sa loob ng 24 na oras. Kung hindi ka gumawa ng account, maaari mong ligtas na balewalain ang email na ito.',
    sign_off: 'Welcome aboard,',
    sign_name: 'Ang 1Move Team',
  },
  pt: {
    subject: 'Verifique seu email — Seu painel IB está esperando',
    preview: 'Um clique para desbloquear seu painel IB pessoal e landing page.',
    heading: 'Verifique seu endereço de email',
    greeting: 'Olá {name},',
    body: 'Obrigado por se cadastrar! Por favor, verifique seu endereço de email para ativar seu painel IB e começar a construir sua landing page pessoal.',
    cta: 'Verificar email',
    features_intro: 'Após a verificação, você terá acesso a:',
    feature_1: 'Sua landing page pessoal com uma URL personalizada',
    feature_2: 'Um painel de gestão de leads em tempo real',
    feature_3: 'Ferramentas com IA do SYSTM8',
    feature_4: 'Suporte multilíngue para alcance global',
    expiry: 'Este link expira em 24 horas. Se você não criou uma conta, pode ignorar este email com segurança.',
    sign_off: 'Bem-vindo a bordo,',
    sign_name: 'A equipe 1Move',
  },
  th: {
    subject: 'ยืนยันอีเมลของคุณ — แดชบอร์ด IB ของคุณรอคุณอยู่',
    preview: 'คลิกเดียวเพื่อปลดล็อกแดชบอร์ด IB และ landing page ส่วนตัวของคุณ',
    heading: 'ยืนยันที่อยู่อีเมลของคุณ',
    greeting: 'สวัสดี {name},',
    body: 'ขอบคุณที่สมัครสมาชิก! กรุณายืนยันที่อยู่อีเมลของคุณเพื่อเปิดใช้งานแดชบอร์ด IB และเริ่มสร้าง landing page ส่วนตัวของคุณ',
    cta: 'ยืนยันอีเมล',
    features_intro: 'เมื่อยืนยันแล้ว คุณจะได้เข้าถึง:',
    feature_1: 'Landing page ส่วนตัวพร้อม URL ที่กำหนดเอง',
    feature_2: 'แดชบอร์ดจัดการ lead แบบเรียลไทม์',
    feature_3: 'เครื่องมือ AI จาก SYSTM8',
    feature_4: 'รองรับหลายภาษาสำหรับการเข้าถึงทั่วโลก',
    expiry: 'ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง หากคุณไม่ได้สร้างบัญชี สามารถเพิกเฉยอีเมลนี้ได้อย่างปลอดภัย',
    sign_off: 'ยินดีต้อนรับ,',
    sign_name: 'ทีม 1Move',
  },
}

interface VerificationEmailOptions {
  name: string
  verificationUrl: string
  lang?: string
}

export function buildVerificationEmail({ name, verificationUrl, lang = 'en' }: VerificationEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const content = `
<h1 style="color:#D4A843;font-size:22px;margin:0 0 20px;text-align:${textAlign};">${t.heading}</h1>
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};">${t.greeting.replace('{name}', name)}</p>
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:${textAlign};">${t.body}</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:0 0 28px;">
      <a href="${verificationUrl}" style="display:inline-block;background-color:#D4A843;color:#1A1A2E;padding:14px 32px;font-size:16px;font-weight:700;text-decoration:none;border-radius:6px;">
        ${t.cta} &rarr;
      </a>
    </td>
  </tr>
</table>

<!-- Feature list -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};">${t.features_intro}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="color:#E0E0E0;font-size:14px;line-height:2;padding:0 0 0 8px;text-align:${textAlign};">
      <span style="color:#D4A843;">&rarr;</span>&nbsp; ${t.feature_1}<br/>
      <span style="color:#D4A843;">&rarr;</span>&nbsp; ${t.feature_2}<br/>
      <span style="color:#D4A843;">&rarr;</span>&nbsp; ${t.feature_3}<br/>
      <span style="color:#D4A843;">&rarr;</span>&nbsp; ${t.feature_4}
    </td>
  </tr>
</table>

<!-- Expiry note -->
<p style="color:#999;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:${textAlign};">${t.expiry}</p>

<!-- Sign-off -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0;text-align:${textAlign};">
  ${t.sign_off}<br/>
  <span style="color:#D4A843;font-weight:700;">${t.sign_name}</span>
</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
