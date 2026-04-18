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
  // Final reminder variant (72h)
  final_subject: string
  final_preview: string
  final_heading: string
  final_body_1: string
  final_urgency: string
}

const translations: Record<string, NudgeTranslation> = {
  en: {
    subject: "You're almost there — finish your profile and go live",
    preview: "Your dashboard is set up. Just a few details left before your landing page is ready.",
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
    final_subject: 'Last reminder — your landing page is waiting for you',
    final_preview: "Your SYSTM8 page still isn't live. This is your final reminder to finish up.",
    final_heading: '{name}, this is your last reminder',
    final_body_1: "Your SYSTM8 landing page still isn't live. We don't want you to miss out — completing your profile takes less than 5 minutes, and your page will start working for you immediately.",
    final_urgency: "This is the last time we'll remind you. After this, it's up to you — but we'd love to see your page go live.",
  },
  no: {
    subject: 'Du er nesten der — fullfør profilen og gå live',
    preview: 'Dashboardet ditt er satt opp. Bare noen detaljer igjen før landingssiden din er klar.',
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
    final_subject: 'Siste påminnelse — landingssiden din venter på deg',
    final_preview: 'SYSTM8-siden din er fortsatt ikke live. Dette er din siste påminnelse.',
    final_heading: '{name}, dette er din siste påminnelse',
    final_body_1: 'SYSTM8-landingssiden din er fortsatt ikke live. Vi vil ikke at du skal gå glipp av dette — å fullføre profilen tar under 5 minutter, og siden din begynner å jobbe for deg umiddelbart.',
    final_urgency: 'Dette er siste gang vi minner deg på det. Etter dette er det opp til deg — men vi vil gjerne se siden din gå live.',
  },
  sv: {
    subject: 'Du är nästan där — fyll i profilen och gå live',
    preview: 'Din dashboard är klar. Bara några detaljer kvar innan din landningssida är redo.',
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
    final_subject: 'Sista påminnelsen — din landningssida väntar på dig',
    final_preview: 'Din SYSTM8-sida är fortfarande inte live. Detta är din sista påminnelse.',
    final_heading: '{name}, detta är din sista påminnelse',
    final_body_1: 'Din SYSTM8-landningssida är fortfarande inte live. Vi vill inte att du ska missa detta — att fylla i din profil tar mindre än 5 minuter, och din sida börjar jobba för dig direkt.',
    final_urgency: 'Detta är sista gången vi påminner dig. Efter detta är det upp till dig — men vi skulle gärna se din sida gå live.',
  },
  es: {
    subject: 'Ya casi estás — completa tu perfil y lanza tu página',
    preview: 'Tu panel está configurado. Solo faltan unos detalles para que tu landing page esté lista.',
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
    final_subject: 'Último recordatorio — tu landing page te está esperando',
    final_preview: 'Tu página SYSTM8 todavía no está activa. Este es tu último recordatorio.',
    final_heading: '{name}, este es tu último recordatorio',
    final_body_1: 'Tu landing page de SYSTM8 todavía no está activa. No queremos que te lo pierdas — completar tu perfil toma menos de 5 minutos, y tu página comenzará a trabajar para ti de inmediato.',
    final_urgency: 'Esta es la última vez que te lo recordamos. Después de esto, depende de ti — pero nos encantaría ver tu página en vivo.',
  },
  ru: {
    subject: 'Вы почти у цели — заполните профиль и запустите страницу',
    preview: 'Ваш дашборд настроен. Осталось несколько деталей до готовности страницы.',
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
    final_subject: 'Последнее напоминание — ваша страница ждёт вас',
    final_preview: 'Ваша страница SYSTM8 всё ещё не запущена. Это последнее напоминание.',
    final_heading: '{name}, это последнее напоминание',
    final_body_1: 'Ваша страница SYSTM8 всё ещё не запущена. Мы не хотим, чтобы вы упустили эту возможность — заполнение профиля займёт менее 5 минут, и страница начнёт работать на вас сразу.',
    final_urgency: 'Это последний раз, когда мы напоминаем. После этого решение за вами — но мы будем рады увидеть вашу страницу.',
  },
  ar: {
    subject: 'أنت على وشك الانتهاء — أكمل ملفك وانطلق',
    preview: 'لوحة التحكم جاهزة. بقيت بعض التفاصيل قبل أن تصبح صفحتك جاهزة.',
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
    final_subject: 'تذكير أخير — صفحتك في انتظارك',
    final_preview: 'صفحة SYSTM8 الخاصة بك لا تزال غير مباشرة. هذا تذكيرك الأخير.',
    final_heading: '{name}، هذا تذكيرك الأخير',
    final_body_1: 'صفحة الهبوط الخاصة بك في SYSTM8 لا تزال غير مباشرة. لا نريدك أن تفوت هذه الفرصة — إكمال ملفك يستغرق أقل من 5 دقائق، وستبدأ صفحتك بالعمل لك فوراً.',
    final_urgency: 'هذه آخر مرة نذكرك فيها. بعد ذلك الأمر بيدك — لكننا نود أن نرى صفحتك مباشرة.',
  },
  tl: {
    subject: 'Halos ka na — tapusin ang profile at i-launch na',
    preview: 'Naka-set up na ang dashboard mo. Kaunting detalye na lang bago maging live ang page mo.',
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
    final_subject: 'Huling paalala — naghihintay sa iyo ang landing page mo',
    final_preview: 'Hindi pa rin live ang SYSTM8 page mo. Ito na ang huling paalala.',
    final_heading: '{name}, ito na ang huling paalala mo',
    final_body_1: 'Hindi pa rin live ang SYSTM8 landing page mo. Ayaw naming mapalampas mo ito — wala pang 5 minuto ang pag-complete ng profile mo, at agad nang magsisimulang magtrabaho ang page mo para sa iyo.',
    final_urgency: 'Ito na ang huling beses na magpapaalala kami. Pagkatapos nito, nasa iyo na — pero gusto naming makita ang page mo na maging live.',
  },
  pt: {
    subject: 'Você está quase lá — complete seu perfil e vá ao ar',
    preview: 'Seu painel está configurado. Só faltam alguns detalhes para sua landing page ficar pronta.',
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
    final_subject: 'Último lembrete — sua landing page está esperando por você',
    final_preview: 'Sua página SYSTM8 ainda não está no ar. Este é seu último lembrete.',
    final_heading: '{name}, este é seu último lembrete',
    final_body_1: 'Sua landing page do SYSTM8 ainda não está no ar. Não queremos que você perca isso — completar seu perfil leva menos de 5 minutos, e sua página começará a trabalhar para você imediatamente.',
    final_urgency: 'Esta é a última vez que vamos lembrar. Depois disso, é com você — mas adoraríamos ver sua página no ar.',
  },
  th: {
    subject: 'คุณเกือบถึงแล้ว — ทำโปรไฟล์ให้เสร็จแล้วเปิดตัวเลย',
    preview: 'แดชบอร์ดพร้อมแล้ว เหลือแค่รายละเอียดอีกนิดก่อน landing page จะพร้อม',
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
    final_subject: 'การแจ้งเตือนครั้งสุดท้าย — landing page กำลังรอคุณอยู่',
    final_preview: 'หน้า SYSTM8 ของคุณยังไม่ live นี่คือการแจ้งเตือนครั้งสุดท้าย',
    final_heading: '{name} นี่คือการแจ้งเตือนครั้งสุดท้าย',
    final_body_1: 'Landing page SYSTM8 ของคุณยังไม่ live เราไม่อยากให้คุณพลาด — การทำโปรไฟล์ให้เสร็จใช้เวลาไม่ถึง 5 นาที และหน้าเว็บจะเริ่มทำงานให้คุณทันที',
    final_urgency: 'นี่เป็นครั้งสุดท้ายที่เราจะเตือน หลังจากนี้ขึ้นอยู่กับคุณ — แต่เราอยากเห็นหน้าเว็บของคุณ live',
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
    <td width="28" valign="top" style="padding:8px 0;color:#c9a84c;font-size:16px;line-height:1.4;">
      &rarr;
    </td>
    <td valign="top" style="padding:8px 0 8px 4px;color:#E0E0E0;font-size:15px;line-height:1.4;">
      ${text}
    </td>
  </tr>`
}

export type NudgeVariant = 'profile_nudge' | 'profile_nudge_final'

interface NudgeEmailOptions {
  name: string
  incomplete: IncompleteSteps
  lang?: string
  variant?: NudgeVariant
}

export function buildNudgeEmail({ name, incomplete, lang = 'en', variant = 'profile_nudge' }: NudgeEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'
  const isFinal = variant === 'profile_nudge_final'

  // Pick subject/preview/heading/body based on variant
  const subject = isFinal ? t.final_subject : t.subject
  const preview = isFinal ? t.final_preview : t.preview
  const heading = isFinal ? t.final_heading : t.heading
  const bodyIntro = isFinal ? t.final_body_1 : t.body_1
  const urgencyText = isFinal ? t.final_urgency : t.urgency

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
<h1 style="color:#c9a84c;font-size:22px;margin:0 0 20px;text-align:${textAlign};">${heading.replace('{name}', name)}</h1>

<!-- Body intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${bodyIntro}</p>

<!-- What's left label -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};font-weight:700;">${t.body_2}</p>

<!-- Dynamic incomplete steps -->
${stepsHtml}

<!-- Urgency -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:${textAlign};">${urgencyText}</p>

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

<!-- Closing body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_3}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject }
}
