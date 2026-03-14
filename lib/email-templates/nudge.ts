import { baseEmailTemplate } from './base'

interface NudgeTranslation {
  subject: string
  preview: string
  heading: string
  body_1: string
  body_2: string
  step_referral: string
  step_bio: string
  step_photo: string
  step_page: string
  urgency: string
  cta: string
  body_3: string
  help: string
  sign_name: string
}

const translations: Record<string, NudgeTranslation> = {
  en: {
    subject: "You're so close — your landing page is almost ready",
    preview: "You signed up yesterday but your page isn't live yet. 5 minutes is all it takes.",
    heading: "Hey {name}, you're so close!",
    body_1: "You signed up for SYSTM8 yesterday — but your landing page isn't live yet. You're just a few steps away from having your own professional page working for you around the clock.",
    body_2: "Here's what's left:",
    step_referral: 'Add your PuPrime referral link',
    step_bio: 'Write your bio (or let our AI do it in 60 seconds)',
    step_photo: 'Upload a profile photo',
    step_page: 'Generate your landing page',
    urgency: "The IBs who launch their page within the first 24 hours get the most momentum. Don't let this window slip.",
    cta: 'FINISH MY PROFILE',
    body_3: "This takes less than 5 minutes — and once your page is live, leads can start finding you immediately.",
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Du er så nærme — landingssiden din er nesten klar',
    preview: 'Du registrerte deg i går, men siden din er ikke live ennå. Det tar bare 5 minutter.',
    heading: 'Hei {name}, du er så nærme!',
    body_1: 'Du registrerte deg for SYSTM8 i går — men landingssiden din er ikke live ennå. Du er bare noen få steg unna å ha din egen profesjonelle side som jobber for deg døgnet rundt.',
    body_2: 'Her er hva som gjenstår:',
    step_referral: 'Legg til PuPrime referral-lenken din',
    step_bio: 'Skriv bioen din (eller la vår AI gjøre det på 60 sekunder)',
    step_photo: 'Last opp et profilbilde',
    step_page: 'Generer landingssiden din',
    urgency: 'De som lanserer siden sin innen de første 24 timene får mest momentum. Ikke la dette vinduet glippe.',
    cta: 'FULLFØR PROFILEN MIN',
    body_3: 'Dette tar under 5 minutter — og når siden din er live, kan leads begynne å finne deg umiddelbart.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Du är så nära — din landningssida är nästan klar',
    preview: 'Du registrerade dig igår men din sida är inte live ännu. Det tar bara 5 minuter.',
    heading: 'Hej {name}, du är så nära!',
    body_1: 'Du registrerade dig för SYSTM8 igår — men din landningssida är inte live ännu. Du är bara några steg ifrån att ha din egen professionella sida som jobbar för dig dygnet runt.',
    body_2: 'Här är vad som återstår:',
    step_referral: 'Lägg till din PuPrime referral-länk',
    step_bio: 'Skriv din bio (eller låt vår AI göra det på 60 sekunder)',
    step_photo: 'Ladda upp ett profilfoto',
    step_page: 'Generera din landningssida',
    urgency: 'De som lanserar sin sida inom de första 24 timmarna får mest momentum. Låt inte detta fönster glida förbi.',
    cta: 'FYLL I MIN PROFIL',
    body_3: 'Det tar mindre än 5 minuter — och när din sida är live kan leads börja hitta dig omedelbart.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: 'Estás tan cerca — tu landing page está casi lista',
    preview: 'Te registraste ayer pero tu página aún no está activa. Solo toma 5 minutos.',
    heading: '¡Hey {name}, estás tan cerca!',
    body_1: 'Te registraste en SYSTM8 ayer — pero tu landing page aún no está activa. Estás a solo unos pasos de tener tu propia página profesional trabajando para ti las 24 horas.',
    body_2: 'Esto es lo que falta:',
    step_referral: 'Agrega tu enlace de referido PuPrime',
    step_bio: 'Escribe tu bio (o deja que nuestra IA lo haga en 60 segundos)',
    step_photo: 'Sube una foto de perfil',
    step_page: 'Genera tu landing page',
    urgency: 'Los IBs que lanzan su página en las primeras 24 horas obtienen más impulso. No dejes pasar esta oportunidad.',
    cta: 'COMPLETAR MI PERFIL',
    body_3: 'Esto toma menos de 5 minutos — y una vez que tu página esté activa, los leads pueden empezar a encontrarte de inmediato.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'Вы так близко — ваша страница почти готова',
    preview: 'Вы зарегистрировались вчера, но страница ещё не запущена. Это займёт всего 5 минут.',
    heading: 'Привет, {name}, вы так близко!',
    body_1: 'Вы зарегистрировались в SYSTM8 вчера — но ваша страница ещё не запущена. Вам осталось всего несколько шагов до собственной профессиональной страницы, работающей на вас круглосуточно.',
    body_2: 'Вот что осталось:',
    step_referral: 'Добавьте вашу реферальную ссылку PuPrime',
    step_bio: 'Напишите биографию (или наш AI сделает это за 60 секунд)',
    step_photo: 'Загрузите фото профиля',
    step_page: 'Сгенерируйте вашу страницу',
    urgency: 'IB, которые запускают страницу в первые 24 часа, получают наибольший импульс. Не упустите это окно.',
    cta: 'ЗАПОЛНИТЬ ПРОФИЛЬ',
    body_3: 'Это займёт менее 5 минут — и как только страница будет запущена, лиды смогут найти вас немедленно.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'أنت قريب جداً — صفحتك جاهزة تقريباً',
    preview: 'سجلت أمس لكن صفحتك ليست مباشرة بعد. يستغرق الأمر 5 دقائق فقط.',
    heading: 'مرحباً {name}، أنت قريب جداً!',
    body_1: 'سجلت في SYSTM8 أمس — لكن صفحة الهبوط الخاصة بك ليست مباشرة بعد. أنت على بعد خطوات قليلة من امتلاك صفحتك المهنية الخاصة التي تعمل لك على مدار الساعة.',
    body_2: 'إليك ما تبقى:',
    step_referral: 'أضف رابط الإحالة PuPrime الخاص بك',
    step_bio: 'اكتب سيرتك الذاتية (أو دع الذكاء الاصطناعي يفعل ذلك في 60 ثانية)',
    step_photo: 'ارفع صورة للملف الشخصي',
    step_page: 'أنشئ صفحة الهبوط الخاصة بك',
    urgency: 'وسطاء IB الذين يطلقون صفحتهم خلال أول 24 ساعة يحصلون على أكبر زخم. لا تدع هذه الفرصة تفلت.',
    cta: 'إكمال ملفي الشخصي',
    body_3: 'يستغرق هذا أقل من 5 دقائق — وبمجرد أن تصبح صفحتك مباشرة، يمكن للعملاء المحتملين البدء في العثور عليك فوراً.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'Malapit ka na — halos tapos na ang landing page mo',
    preview: 'Nag-sign up ka kahapon pero hindi pa live ang page mo. 5 minuto lang ang kailangan.',
    heading: 'Hey {name}, malapit ka na!',
    body_1: 'Nag-sign up ka sa SYSTM8 kahapon — pero hindi pa live ang landing page mo. Ilang hakbang na lang at magkakaroon ka na ng sariling professional na page na nagtatrabaho para sa iyo 24/7.',
    body_2: 'Ito ang natitira:',
    step_referral: 'Idagdag ang PuPrime referral link mo',
    step_bio: 'Isulat ang bio mo (o hayaan ang AI namin na gawin ito sa 60 segundo)',
    step_photo: 'Mag-upload ng profile photo',
    step_page: 'I-generate ang landing page mo',
    urgency: 'Ang mga IB na nag-launch ng page nila sa unang 24 na oras ang pinakamalakas ang momentum. Huwag mong palagpasin ang pagkakataon.',
    cta: 'TAPUSIN ANG PROFILE KO',
    body_3: 'Wala pang 5 minuto ito — at kapag live na ang page mo, magsisimula nang makahanap sa iyo ang mga leads.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Você está tão perto — sua landing page está quase pronta',
    preview: 'Você se cadastrou ontem mas sua página ainda não está no ar. Leva apenas 5 minutos.',
    heading: 'Hey {name}, você está tão perto!',
    body_1: 'Você se cadastrou no SYSTM8 ontem — mas sua landing page ainda não está no ar. Você está a poucos passos de ter sua própria página profissional trabalhando para você 24 horas por dia.',
    body_2: 'Aqui está o que falta:',
    step_referral: 'Adicione seu link de indicação PuPrime',
    step_bio: 'Escreva sua bio (ou deixe nossa IA fazer isso em 60 segundos)',
    step_photo: 'Faça upload de uma foto de perfil',
    step_page: 'Gere sua landing page',
    urgency: 'Os IBs que lançam sua página nas primeiras 24 horas ganham mais impulso. Não deixe essa janela escapar.',
    cta: 'COMPLETAR MEU PERFIL',
    body_3: 'Isso leva menos de 5 minutos — e assim que sua página estiver no ar, leads podem começar a te encontrar imediatamente.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คุณใกล้มากแล้ว — landing page ของคุณเกือบพร้อม',
    preview: 'คุณสมัครเมื่อวาน แต่หน้าเว็บยังไม่ live ใช้เวลาแค่ 5 นาที',
    heading: 'เฮ้ {name} คุณใกล้มากแล้ว!',
    body_1: 'คุณสมัคร SYSTM8 เมื่อวาน — แต่ landing page ของคุณยังไม่ live คุณเหลืออีกแค่ไม่กี่ขั้นตอนก็จะมีหน้าเว็บมืออาชีพของตัวเองที่ทำงานให้คุณตลอด 24 ชั่วโมง',
    body_2: 'นี่คือสิ่งที่เหลือ:',
    step_referral: 'เพิ่มลิงก์แนะนำ PuPrime ของคุณ',
    step_bio: 'เขียนไบโอของคุณ (หรือให้ AI ของเราทำใน 60 วินาที)',
    step_photo: 'อัปโหลดรูปโปรไฟล์',
    step_page: 'สร้าง landing page ของคุณ',
    urgency: 'IB ที่เปิดตัวหน้าเว็บภายใน 24 ชั่วโมงแรกจะได้แรงส่งมากที่สุด อย่าปล่อยให้โอกาสนี้หลุดไป',
    cta: 'ทำโปรไฟล์ให้เสร็จ',
    body_3: 'ใช้เวลาไม่ถึง 5 นาที — และเมื่อหน้าเว็บ live แล้ว leads จะเริ่มพบคุณได้ทันที',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_name: '— ทีม 1Move',
  },
}

export interface IncompleteSteps {
  referral_link: boolean
  bio: boolean
  profile_image: boolean
  slug: boolean
}

function buildStepRow(text: string): string {
  return `<tr>
    <td width="28" valign="top" style="padding:8px 0;color:#D4A843;font-size:16px;line-height:1.4;">
      &rarr;
    </td>
    <td valign="top" style="padding:8px 0 8px 4px;color:#E0E0E0;font-size:15px;line-height:1.4;">
      ${text}
    </td>
  </tr>`
}

interface NudgeEmailOptions {
  name: string
  incomplete: IncompleteSteps
  lang?: string
}

export function buildNudgeEmail({ name, incomplete, lang = 'en' }: NudgeEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  // Build only the incomplete step rows
  const stepRows: string[] = []
  if (incomplete.referral_link) stepRows.push(buildStepRow(t.step_referral))
  if (incomplete.bio) stepRows.push(buildStepRow(t.step_bio))
  if (incomplete.profile_image) stepRows.push(buildStepRow(t.step_photo))
  if (incomplete.slug) stepRows.push(buildStepRow(t.step_page))

  const stepsHtml = stepRows.length > 0
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  ${stepRows.join('\n')}
</table>`
    : ''

  const content = `
<!-- Logo area handled by base template -->

<!-- Heading -->
<h1 style="color:#D4A843;font-size:22px;margin:0 0 20px;text-align:${textAlign};">${t.heading.replace('{name}', name)}</h1>

<!-- Body intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_1}</p>

<!-- What's left label -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};font-weight:700;">${t.body_2}</p>

<!-- Dynamic incomplete steps -->
${stepsHtml}

<!-- Urgency -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:${textAlign};">${t.urgency}</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:0 0 24px;">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#D4A843;color:#1A1A2E;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta}
      </a>
    </td>
  </tr>
</table>

<!-- Closing body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_3}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#D4A843;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
