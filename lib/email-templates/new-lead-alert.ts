import { baseEmailTemplate } from './base'

interface NewLeadAlertTranslation {
  subject: string
  preview: string
  heading: string
  greeting: string
  total_leads_label: string
  first_lead_body: string
  subsequent_body: string
  next_label: string
  action_1: string
  action_2: string
  action_3: string
  cta: string
  link_label: string
  body_closing: string
  help: string
  sign_name: string
}

const translations: Record<string, NewLeadAlertTranslation> = {
  en: {
    subject: 'New lead! Someone just signed up through your page',
    preview: 'You just got a new lead, {name}. Log in to see the details.',
    heading: 'You just got a new lead! 🎉',
    greeting: 'Hey {name}, great news — someone just signed up through your personal landing page!',
    total_leads_label: 'TOTAL LEADS',
    first_lead_body: "This is your first lead — you're officially in the game. The hardest part is getting started, and you just did it. Keep sharing your link and watch the numbers grow.",
    subsequent_body: 'You now have {lead_count} leads and counting. Your page is doing the work — keep the momentum going!',
    next_label: 'What to do next:',
    action_1: 'Log in to your dashboard and check your Leads tab',
    action_2: "Submit the client UID when it's available",
    action_3: 'Keep sharing your link to get more leads',
    cta: 'VIEW MY LEADS',
    link_label: 'Your link:',
    body_closing: 'Every lead is a step forward. Keep going!',
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Ny lead! Noen registrerte seg via siden din',
    preview: 'Du fikk nettopp en ny lead, {name}. Logg inn for å se detaljene.',
    heading: 'Du fikk nettopp en ny lead! 🎉',
    greeting: 'Hei {name}, gode nyheter — noen har nettopp registrert seg via din personlige landingsside!',
    total_leads_label: 'TOTALT LEADS',
    first_lead_body: 'Dette er din første lead — du er offisielt i gang. Det vanskeligste er å komme i gang, og det har du nettopp gjort. Fortsett å dele lenken din og se tallene vokse.',
    subsequent_body: 'Du har nå {lead_count} leads og det øker. Siden din gjør jobben — hold momentumet oppe!',
    next_label: 'Hva du bør gjøre nå:',
    action_1: 'Logg inn på dashboardet og sjekk Leads-fanen',
    action_2: 'Send inn klient-UID når den er tilgjengelig',
    action_3: 'Fortsett å dele lenken din for å få flere leads',
    cta: 'SE MINE LEADS',
    link_label: 'Din lenke:',
    body_closing: 'Hver lead er et steg fremover. Fortsett!',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Ny lead! Någon registrerade sig via din sida',
    preview: 'Du fick precis en ny lead, {name}. Logga in för att se detaljerna.',
    heading: 'Du fick precis en ny lead! 🎉',
    greeting: 'Hej {name}, goda nyheter — någon har just registrerat sig via din personliga landningssida!',
    total_leads_label: 'TOTALT LEADS',
    first_lead_body: 'Det här är din första lead — du är officiellt igång. Det svåraste är att komma igång, och det har du just gjort. Fortsätt dela din länk och se siffrorna växa.',
    subsequent_body: 'Du har nu {lead_count} leads och det ökar. Din sida gör jobbet — håll momentumet uppe!',
    next_label: 'Vad du ska göra härnäst:',
    action_1: 'Logga in på din dashboard och kolla Leads-fliken',
    action_2: 'Skicka in klient-UID när det är tillgängligt',
    action_3: 'Fortsätt dela din länk för att få fler leads',
    cta: 'VISA MINA LEADS',
    link_label: 'Din länk:',
    body_closing: 'Varje lead är ett steg framåt. Fortsätt!',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: '¡Nuevo lead! Alguien se registró a través de tu página',
    preview: 'Acabas de recibir un nuevo lead, {name}. Inicia sesión para ver los detalles.',
    heading: '¡Acabas de recibir un nuevo lead! 🎉',
    greeting: 'Hey {name}, buenas noticias — ¡alguien acaba de registrarse a través de tu landing page personal!',
    total_leads_label: 'TOTAL DE LEADS',
    first_lead_body: 'Este es tu primer lead — oficialmente estás en el juego. Lo más difícil es empezar, y ya lo hiciste. Sigue compartiendo tu enlace y observa cómo crecen los números.',
    subsequent_body: 'Ahora tienes {lead_count} leads y sumando. Tu página está haciendo el trabajo — ¡mantén el impulso!',
    next_label: 'Qué hacer ahora:',
    action_1: 'Inicia sesión en tu panel y revisa la pestaña de Leads',
    action_2: 'Envía el UID del cliente cuando esté disponible',
    action_3: 'Sigue compartiendo tu enlace para obtener más leads',
    cta: 'VER MIS LEADS',
    link_label: 'Tu enlace:',
    body_closing: 'Cada lead es un paso adelante. ¡Sigue así!',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'Новый лид! Кто-то зарегистрировался через вашу страницу',
    preview: 'У вас новый лид, {name}. Войдите, чтобы увидеть детали.',
    heading: 'У вас новый лид! 🎉',
    greeting: 'Привет, {name}, отличные новости — кто-то только что зарегистрировался через вашу персональную страницу!',
    total_leads_label: 'ВСЕГО ЛИДОВ',
    first_lead_body: 'Это ваш первый лид — вы официально в игре. Самое сложное — начать, и вы это сделали. Продолжайте делиться ссылкой и наблюдайте, как растут цифры.',
    subsequent_body: 'У вас теперь {lead_count} лидов и их количество растёт. Ваша страница работает — поддерживайте импульс!',
    next_label: 'Что делать дальше:',
    action_1: 'Войдите в дашборд и проверьте вкладку Лиды',
    action_2: 'Отправьте UID клиента, когда он будет доступен',
    action_3: 'Продолжайте делиться ссылкой для получения новых лидов',
    cta: 'ПОСМОТРЕТЬ ЛИДЫ',
    link_label: 'Ваша ссылка:',
    body_closing: 'Каждый лид — это шаг вперёд. Продолжайте!',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'عميل جديد! شخص ما سجل من خلال صفحتك',
    preview: 'لديك عميل جديد، {name}. سجل الدخول لرؤية التفاصيل.',
    heading: 'لديك عميل جديد! 🎉',
    greeting: 'مرحباً {name}، أخبار رائعة — شخص ما سجل للتو من خلال صفحتك الشخصية!',
    total_leads_label: 'إجمالي العملاء',
    first_lead_body: 'هذا أول عميل لك — أنت الآن رسمياً في اللعبة. أصعب جزء هو البداية، وقد فعلتها للتو. استمر في مشاركة رابطك وشاهد الأرقام تنمو.',
    subsequent_body: 'لديك الآن {lead_count} عملاء والعدد في ازدياد. صفحتك تقوم بالعمل — حافظ على الزخم!',
    next_label: 'ما الذي يجب فعله بعد ذلك:',
    action_1: 'سجل الدخول إلى لوحة التحكم وتحقق من تبويب العملاء',
    action_2: 'أرسل معرف العميل UID عندما يكون متاحاً',
    action_3: 'استمر في مشاركة رابطك للحصول على المزيد من العملاء',
    cta: 'عرض عملائي',
    link_label: 'رابطك:',
    body_closing: 'كل عميل هو خطوة للأمام. استمر!',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'Bagong lead! May nag-sign up sa page mo',
    preview: 'May bagong lead ka, {name}. Mag-log in para makita ang detalye.',
    heading: 'May bagong lead ka! 🎉',
    greeting: 'Hey {name}, magandang balita — may nag-sign up sa pamamagitan ng personal landing page mo!',
    total_leads_label: 'KABUUANG LEADS',
    first_lead_body: 'Ito ang unang lead mo — opisyal ka nang nasa laro. Ang pinakamahirap na bahagi ay ang magsimula, at nagawa mo na ito. Patuloy na i-share ang link mo at panoorin ang mga numero na lumaki.',
    subsequent_body: 'Mayroon ka na ngayong {lead_count} leads at dumadami pa. Nagtatrabaho ang page mo — panatilihin ang momentum!',
    next_label: 'Ano ang gagawin sa susunod:',
    action_1: 'Mag-log in sa dashboard mo at tingnan ang Leads tab',
    action_2: 'I-submit ang client UID kapag available na',
    action_3: 'Patuloy na i-share ang link mo para makakuha ng mas maraming leads',
    cta: 'TINGNAN ANG MGA LEADS KO',
    link_label: 'Ang link mo:',
    body_closing: 'Bawat lead ay isang hakbang pasulong. Tuloy lang!',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Novo lead! Alguém se cadastrou pela sua página',
    preview: 'Você acabou de receber um novo lead, {name}. Faça login para ver os detalhes.',
    heading: 'Você acabou de receber um novo lead! 🎉',
    greeting: 'Hey {name}, ótimas notícias — alguém acabou de se cadastrar pela sua landing page pessoal!',
    total_leads_label: 'TOTAL DE LEADS',
    first_lead_body: 'Este é seu primeiro lead — você oficialmente está no jogo. A parte mais difícil é começar, e você acabou de fazer isso. Continue compartilhando seu link e veja os números crescerem.',
    subsequent_body: 'Você agora tem {lead_count} leads e contando. Sua página está fazendo o trabalho — mantenha o ritmo!',
    next_label: 'O que fazer agora:',
    action_1: 'Faça login no seu painel e confira a aba de Leads',
    action_2: 'Envie o UID do cliente quando estiver disponível',
    action_3: 'Continue compartilhando seu link para conseguir mais leads',
    cta: 'VER MEUS LEADS',
    link_label: 'Seu link:',
    body_closing: 'Cada lead é um passo à frente. Continue!',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'Lead ใหม่! มีคนสมัครผ่านหน้าเว็บของคุณ',
    preview: 'คุณได้ lead ใหม่, {name} เข้าสู่ระบบเพื่อดูรายละเอียด',
    heading: 'คุณได้ lead ใหม่! 🎉',
    greeting: 'เฮ้ {name} ข่าวดี — มีคนเพิ่งสมัครผ่าน landing page ส่วนตัวของคุณ!',
    total_leads_label: 'LEADS ทั้งหมด',
    first_lead_body: 'นี่คือ lead แรกของคุณ — คุณอยู่ในเกมอย่างเป็นทางการแล้ว ส่วนที่ยากที่สุดคือการเริ่มต้น และคุณเพิ่งทำได้แล้ว แชร์ลิงก์ต่อไปแล้วดูตัวเลขเติบโต',
    subsequent_body: 'ตอนนี้คุณมี {lead_count} leads และเพิ่มขึ้นเรื่อยๆ หน้าเว็บกำลังทำงาน — รักษาโมเมนตัมไว้!',
    next_label: 'สิ่งที่ต้องทำต่อไป:',
    action_1: 'เข้าสู่ระบบแดชบอร์ดและตรวจสอบแท็บ Leads',
    action_2: 'ส่ง UID ของลูกค้าเมื่อพร้อม',
    action_3: 'แชร์ลิงก์ต่อไปเพื่อรับ leads เพิ่ม',
    cta: 'ดู LEADS ของฉัน',
    link_label: 'ลิงก์ของคุณ:',
    body_closing: 'ทุก lead คือก้าวไปข้างหน้า สู้ต่อไป!',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_name: '— ทีม 1Move',
  },
}

function buildActionRow(text: string): string {
  return `<tr>
    <td width="28" valign="top" style="padding:8px 0;color:#D4A843;font-size:16px;line-height:1.4;">
      &rarr;
    </td>
    <td valign="top" style="padding:8px 0 8px 4px;color:#E0E0E0;font-size:15px;line-height:1.4;">
      ${text}
    </td>
  </tr>`
}

interface NewLeadAlertOptions {
  name: string
  slug: string
  leadCount: number
  lang?: string
}

export function buildNewLeadAlertEmail({ name, slug, leadCount, lang = 'en' }: NewLeadAlertOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const isFirstLead = leadCount === 1
  const conditionalBody = isFirstLead
    ? t.first_lead_body
    : t.subsequent_body.replace('{lead_count}', String(leadCount))

  const content = `
<!-- Heading -->
<h1 style="color:#D4A843;font-size:24px;margin:0 0 16px;text-align:center;">${t.heading}</h1>

<!-- Greeting -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.greeting.replace('{name}', name)}</p>

<!-- Lead count scoreboard -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:2px solid #D4A843;border-radius:10px;width:200px;">
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="color:#D4A843;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">${t.total_leads_label}</p>
            <p style="color:#D4A843;font-size:52px;font-weight:800;margin:0;line-height:1;">${leadCount}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Conditional first-lead or subsequent message -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${conditionalBody}</p>

<!-- What to do next -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};font-weight:700;">${t.next_label}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  ${buildActionRow(t.action_1)}
  ${buildActionRow(t.action_2)}
  ${buildActionRow(t.action_3)}
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td align="center">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#D4A843;color:#1A1A2E;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta}
      </a>
    </td>
  </tr>
</table>

<!-- Link display box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:1px solid #2A2A4A;border-radius:6px;">
        <tr>
          <td style="padding:12px 20px;text-align:center;">
            <span style="color:#888;font-size:12px;">${t.link_label}</span><br/>
            <a href="https://www.primeverseaccess.com/${slug}" style="color:#D4A843;font-size:16px;font-weight:700;text-decoration:none;">
              primeverseaccess.com/${slug}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Closing -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_closing}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#D4A843;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview.replace('{name}', name),
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
