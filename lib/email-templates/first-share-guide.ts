import { baseEmailTemplate } from './base'

interface FirstShareGuideTranslation {
  subject: string
  preview: string
  heading: string
  body_1: string
  strategy_1_label: string
  strategy_1_body: string
  strategy_1_example: string
  strategy_2_label: string
  strategy_2_body: string
  strategy_3_label: string
  strategy_3_body: string
  cta: string
  link_label: string
  body_2: string
  help: string
  sign_off: string
  sign_name: string
}

const translations: Record<string, FirstShareGuideTranslation> = {
  en: {
    subject: '3 proven ways to get your first leads today',
    preview: "Your page is live — now let's get people to see it. Here's exactly how.",
    heading: "Your page is live, {name} — now let's get you your first lead!",
    body_1: "Your landing page has been online for 24 hours. Now it's time to put it to work. The IBs who get results fastest all do the same three things:",
    strategy_1_label: 'STRATEGY 1: THE DIRECT MESSAGE',
    strategy_1_body: 'Send your link personally to 5-10 people you know who are interested in trading or financial education. A personal message converts 10x better than a public post.',
    strategy_1_example: 'Hey! I just became a partner with a professional trading education platform. Check it out here: primeverseaccess.com/{slug}',
    strategy_2_label: 'STRATEGY 2: THE SOCIAL STORY',
    strategy_2_body: "Post your link on Instagram Stories, TikTok, Facebook, or Snapchat. Add a short message like 'Excited to share this with you' and use the link sticker. Stories disappear in 24h, so people feel urgency to click.",
    strategy_3_label: 'STRATEGY 3: THE GROUP DROP',
    strategy_3_body: "Share your link in WhatsApp groups, Telegram channels, or Facebook groups where people discuss trading, investing, or side income. Add a short intro — don't just drop the link alone.",
    cta: 'SHARE MY PAGE NOW',
    link_label: 'Your link:',
    body_2: 'Remember — every single person who signs up through your link becomes your lead. One share can change everything.',
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_off: 'Go get that first lead!',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: '3 beviste måter å få dine første leads i dag',
    preview: 'Siden din er live — nå skal vi få folk til å se den. Slik gjør du det.',
    heading: 'Siden din er live, {name} — nå skal vi skaffe deg din første lead!',
    body_1: 'Landingssiden din har vært online i 24 timer. Nå er det på tide å sette den i arbeid. De som får resultater raskest gjør alle de samme tre tingene:',
    strategy_1_label: 'STRATEGI 1: DIREKTEMELDINGEN',
    strategy_1_body: 'Send lenken din personlig til 5-10 personer du kjenner som er interessert i trading eller finansiell utdanning. En personlig melding konverterer 10 ganger bedre enn et offentlig innlegg.',
    strategy_1_example: 'Hei! Jeg har nettopp blitt partner med en profesjonell handelsutdanningsplattform. Sjekk det ut her: primeverseaccess.com/{slug}',
    strategy_2_label: 'STRATEGI 2: SOSIAL STORY',
    strategy_2_body: 'Post lenken din på Instagram Stories, TikTok, Facebook eller Snapchat. Legg til en kort melding og bruk lenkeklistremerkefunksjonen. Stories forsvinner etter 24 timer, så folk føler en urgency til å klikke.',
    strategy_3_label: 'STRATEGI 3: GRUPPEDELING',
    strategy_3_body: 'Del lenken din i WhatsApp-grupper, Telegram-kanaler eller Facebook-grupper der folk diskuterer trading, investering eller ekstrainntekt. Legg til en kort intro — ikke bare slipp lenken alene.',
    cta: 'DEL SIDEN MIN NÅ',
    link_label: 'Din lenke:',
    body_2: 'Husk — hver eneste person som registrerer seg via lenken din blir din lead. Én deling kan endre alt.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_off: 'Gå og skaff den første leaden!',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: '3 beprövade sätt att få dina första leads idag',
    preview: 'Din sida är live — nu ska vi få folk att se den. Så här gör du.',
    heading: 'Din sida är live, {name} — nu ska vi skaffa dig din första lead!',
    body_1: 'Din landningssida har varit online i 24 timmar. Nu är det dags att sätta den i arbete. De som får resultat snabbast gör alla samma tre saker:',
    strategy_1_label: 'STRATEGI 1: DIREKTMEDDELANDET',
    strategy_1_body: 'Skicka din länk personligen till 5-10 personer du känner som är intresserade av trading eller finansiell utbildning. Ett personligt meddelande konverterar 10 gånger bättre än ett offentligt inlägg.',
    strategy_1_example: 'Hej! Jag har precis blivit partner med en professionell handelsutbildningsplattform. Kolla in det här: primeverseaccess.com/{slug}',
    strategy_2_label: 'STRATEGI 2: SOCIALA STORIES',
    strategy_2_body: 'Posta din länk på Instagram Stories, TikTok, Facebook eller Snapchat. Lägg till ett kort meddelande och använd länkfunktionen. Stories försvinner efter 24 timmar, så folk känner brådska att klicka.',
    strategy_3_label: 'STRATEGI 3: GRUPPDELNING',
    strategy_3_body: 'Dela din länk i WhatsApp-grupper, Telegram-kanaler eller Facebook-grupper där folk diskuterar trading, investering eller extrainkomst. Lägg till en kort intro — släpp inte bara länken ensam.',
    cta: 'DELA MIN SIDA NU',
    link_label: 'Din länk:',
    body_2: 'Kom ihåg — varje person som registrerar sig via din länk blir din lead. En delning kan förändra allt.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_off: 'Gå och skaffa den första leaden!',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: '3 formas probadas de conseguir tus primeros leads hoy',
    preview: 'Tu página está activa — ahora hagamos que la gente la vea. Así es cómo.',
    heading: 'Tu página está activa, {name} — ¡ahora consigamos tu primer lead!',
    body_1: 'Tu landing page lleva 24 horas en línea. Ahora es momento de ponerla a trabajar. Los IBs que obtienen resultados más rápido hacen las mismas tres cosas:',
    strategy_1_label: 'ESTRATEGIA 1: EL MENSAJE DIRECTO',
    strategy_1_body: 'Envía tu enlace personalmente a 5-10 personas que conoces que estén interesadas en trading o educación financiera. Un mensaje personal convierte 10 veces mejor que una publicación pública.',
    strategy_1_example: '¡Hola! Acabo de convertirme en socio de una plataforma profesional de educación en trading. Échale un vistazo aquí: primeverseaccess.com/{slug}',
    strategy_2_label: 'ESTRATEGIA 2: LA HISTORIA SOCIAL',
    strategy_2_body: 'Publica tu enlace en Instagram Stories, TikTok, Facebook o Snapchat. Agrega un mensaje corto y usa el sticker de enlace. Las historias desaparecen en 24h, así que la gente siente urgencia de hacer clic.',
    strategy_3_label: 'ESTRATEGIA 3: EL GRUPO',
    strategy_3_body: 'Comparte tu enlace en grupos de WhatsApp, canales de Telegram o grupos de Facebook donde se hable de trading, inversión o ingresos extra. Agrega una breve introducción — no solo dejes el enlace solo.',
    cta: 'COMPARTIR MI PÁGINA AHORA',
    link_label: 'Tu enlace:',
    body_2: 'Recuerda — cada persona que se registre a través de tu enlace se convierte en tu lead. Una sola compartida puede cambiarlo todo.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_off: '¡Ve por ese primer lead!',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: '3 проверенных способа получить первые лиды сегодня',
    preview: 'Ваша страница запущена — теперь давайте привлечём людей. Вот как.',
    heading: 'Ваша страница запущена, {name} — теперь давайте получим первый лид!',
    body_1: 'Ваша страница онлайн уже 24 часа. Теперь пора заставить её работать. IB, которые получают результаты быстрее всех, делают одни и те же три вещи:',
    strategy_1_label: 'СТРАТЕГИЯ 1: ЛИЧНОЕ СООБЩЕНИЕ',
    strategy_1_body: 'Отправьте ссылку лично 5-10 знакомым, которые интересуются трейдингом или финансовым образованием. Личное сообщение конвертирует в 10 раз лучше публичного поста.',
    strategy_1_example: 'Привет! Я только что стал партнёром профессиональной платформы для обучения трейдингу. Посмотри здесь: primeverseaccess.com/{slug}',
    strategy_2_label: 'СТРАТЕГИЯ 2: СТОРИС В СОЦСЕТЯХ',
    strategy_2_body: 'Опубликуйте ссылку в сторис Instagram, TikTok, Facebook или Snapchat. Добавьте короткое сообщение и используйте стикер ссылки. Сторис исчезают через 24 часа, поэтому люди чувствуют срочность.',
    strategy_3_label: 'СТРАТЕГИЯ 3: ГРУППЫ И КАНАЛЫ',
    strategy_3_body: 'Поделитесь ссылкой в группах WhatsApp, каналах Telegram или группах Facebook, где обсуждают трейдинг, инвестиции или дополнительный доход. Добавьте краткое вступление — не просто бросайте ссылку.',
    cta: 'ПОДЕЛИТЬСЯ СТРАНИЦЕЙ',
    link_label: 'Ваша ссылка:',
    body_2: 'Помните — каждый, кто зарегистрируется по вашей ссылке, становится вашим лидом. Одна публикация может изменить всё.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_off: 'Вперёд за первым лидом!',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: '3 طرق مجربة للحصول على أول عملائك اليوم',
    preview: 'صفحتك مباشرة — الآن دعنا نجعل الناس يرونها. إليك الطريقة.',
    heading: 'صفحتك مباشرة، {name} — الآن دعنا نحصل لك على أول عميل!',
    body_1: 'صفحة الهبوط الخاصة بك على الإنترنت منذ 24 ساعة. حان الوقت لوضعها في العمل. وسطاء IB الذين يحصلون على نتائج أسرع يفعلون نفس الأشياء الثلاثة:',
    strategy_1_label: 'الاستراتيجية 1: الرسالة المباشرة',
    strategy_1_body: 'أرسل رابطك شخصياً لـ 5-10 أشخاص تعرفهم مهتمين بالتداول أو التعليم المالي. الرسالة الشخصية تحول 10 أضعاف أفضل من المنشور العام.',
    strategy_1_example: 'مرحباً! لقد أصبحت للتو شريكاً مع منصة تعليم تداول احترافية. تفقدها هنا: primeverseaccess.com/{slug}',
    strategy_2_label: 'الاستراتيجية 2: قصة السوشيال ميديا',
    strategy_2_body: 'انشر رابطك على قصص Instagram أو TikTok أو Facebook أو Snapchat. أضف رسالة قصيرة واستخدم ملصق الرابط. القصص تختفي خلال 24 ساعة، لذا يشعر الناس بالحاجة للنقر.',
    strategy_3_label: 'الاستراتيجية 3: المجموعات',
    strategy_3_body: 'شارك رابطك في مجموعات WhatsApp أو قنوات Telegram أو مجموعات Facebook التي يناقش فيها الناس التداول أو الاستثمار أو الدخل الإضافي. أضف مقدمة قصيرة — لا ترسل الرابط وحده.',
    cta: 'مشاركة صفحتي الآن',
    link_label: 'رابطك:',
    body_2: 'تذكر — كل شخص يسجل من خلال رابطك يصبح عميلك. مشاركة واحدة يمكن أن تغير كل شيء.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_off: 'انطلق واحصل على أول عميل!',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: '3 napatunayang paraan para makakuha ng unang leads mo ngayon',
    preview: 'Live na ang page mo — ngayon, papasukin natin ang mga tao. Ganito ang gagawin.',
    heading: 'Live na ang page mo, {name} — ngayon kumuha tayo ng unang lead mo!',
    body_1: 'Ang landing page mo ay online na ng 24 na oras. Ngayon ay oras na para pagtrabahuhin ito. Ang mga IB na pinakamabilis makakuha ng resulta ay gumagawa ng parehong tatlong bagay:',
    strategy_1_label: 'STRATEHIYA 1: ANG DIRECT MESSAGE',
    strategy_1_body: 'Ipadala ang link mo nang personal sa 5-10 taong kilala mo na interesado sa trading o financial education. Ang personal na mensahe ay 10 beses mas epektibo kaysa sa public post.',
    strategy_1_example: 'Hey! Naging partner na ako ng isang professional trading education platform. Tingnan mo dito: primeverseaccess.com/{slug}',
    strategy_2_label: 'STRATEHIYA 2: ANG SOCIAL STORY',
    strategy_2_body: 'I-post ang link mo sa Instagram Stories, TikTok, Facebook, o Snapchat. Maglagay ng maikling mensahe at gamitin ang link sticker. Nawawala ang Stories sa loob ng 24 oras, kaya nararamdaman ng mga tao ang urgency na mag-click.',
    strategy_3_label: 'STRATEHIYA 3: ANG GROUP DROP',
    strategy_3_body: 'I-share ang link mo sa WhatsApp groups, Telegram channels, o Facebook groups kung saan pinag-uusapan ang trading, investing, o side income. Maglagay ng maikling intro — huwag lang i-drop ang link na mag-isa.',
    cta: 'I-SHARE ANG PAGE KO NGAYON',
    link_label: 'Ang link mo:',
    body_2: 'Tandaan — bawat taong mag-sign up sa pamamagitan ng link mo ay magiging lead mo. Isang share lang ang kailangan para magbago ang lahat.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_off: 'Kunin na ang unang lead mo!',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: '3 formas comprovadas de conseguir seus primeiros leads hoje',
    preview: 'Sua página está no ar — agora vamos fazer as pessoas verem. Veja como.',
    heading: 'Sua página está no ar, {name} — agora vamos conseguir seu primeiro lead!',
    body_1: 'Sua landing page está online há 24 horas. Agora é hora de colocá-la para trabalhar. Os IBs que conseguem resultados mais rápido fazem as mesmas três coisas:',
    strategy_1_label: 'ESTRATÉGIA 1: A MENSAGEM DIRETA',
    strategy_1_body: 'Envie seu link pessoalmente para 5-10 pessoas que você conhece que se interessam por trading ou educação financeira. Uma mensagem pessoal converte 10x melhor que uma publicação pública.',
    strategy_1_example: 'Oi! Acabei de me tornar parceiro de uma plataforma profissional de educação em trading. Confira aqui: primeverseaccess.com/{slug}',
    strategy_2_label: 'ESTRATÉGIA 2: O STORY SOCIAL',
    strategy_2_body: 'Poste seu link nos Stories do Instagram, TikTok, Facebook ou Snapchat. Adicione uma mensagem curta e use o adesivo de link. Stories desaparecem em 24h, então as pessoas sentem urgência para clicar.',
    strategy_3_label: 'ESTRATÉGIA 3: O GRUPO',
    strategy_3_body: 'Compartilhe seu link em grupos de WhatsApp, canais de Telegram ou grupos de Facebook onde as pessoas discutem trading, investimentos ou renda extra. Adicione uma breve introdução — não apenas solte o link sozinho.',
    cta: 'COMPARTILHAR MINHA PÁGINA AGORA',
    link_label: 'Seu link:',
    body_2: 'Lembre-se — cada pessoa que se cadastrar através do seu link se torna seu lead. Um compartilhamento pode mudar tudo.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_off: 'Vá buscar esse primeiro lead!',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: '3 วิธีที่พิสูจน์แล้วในการได้ leads แรกวันนี้',
    preview: 'หน้าเว็บของคุณ live แล้ว — ตอนนี้มาทำให้คนเห็นกัน นี่คือวิธี',
    heading: 'หน้าเว็บ live แล้ว, {name} — มาหา lead แรกกัน!',
    body_1: 'Landing page ของคุณออนไลน์มา 24 ชั่วโมงแล้ว ถึงเวลาทำให้มันทำงาน IB ที่ได้ผลลัพธ์เร็วที่สุดทำ 3 สิ่งเหมือนกัน:',
    strategy_1_label: 'กลยุทธ์ 1: ข้อความส่วนตัว',
    strategy_1_body: 'ส่งลิงก์ของคุณเป็นการส่วนตัวให้ 5-10 คนที่คุณรู้จักที่สนใจการเทรดหรือการศึกษาด้านการเงิน ข้อความส่วนตัวมีอัตราการแปลงมากกว่าโพสต์สาธารณะ 10 เท่า',
    strategy_1_example: 'สวัสดี! ผมเพิ่งเป็นพาร์ทเนอร์กับแพลตฟอร์มการศึกษาการเทรดมืออาชีพ ลองดูที่นี่: primeverseaccess.com/{slug}',
    strategy_2_label: 'กลยุทธ์ 2: SOCIAL STORY',
    strategy_2_body: 'โพสต์ลิงก์ของคุณบน Instagram Stories, TikTok, Facebook หรือ Snapchat เพิ่มข้อความสั้นๆ และใช้สติ๊กเกอร์ลิงก์ Stories หายไปใน 24 ชม. ทำให้คนรู้สึกอยากคลิก',
    strategy_3_label: 'กลยุทธ์ 3: แชร์ในกลุ่ม',
    strategy_3_body: 'แชร์ลิงก์ในกลุ่ม WhatsApp, ช่อง Telegram หรือกลุ่ม Facebook ที่คนพูดคุยเรื่องการเทรด การลงทุน หรือรายได้เสริม เพิ่มบทนำสั้นๆ — อย่าแค่โยนลิงก์เปล่าๆ',
    cta: 'แชร์หน้าเว็บตอนนี้',
    link_label: 'ลิงก์ของคุณ:',
    body_2: 'จำไว้ — ทุกคนที่สมัครผ่านลิงก์ของคุณจะกลายเป็น lead ของคุณ การแชร์ครั้งเดียวสามารถเปลี่ยนทุกอย่าง',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_off: 'ไปหา lead แรกเลย!',
    sign_name: '— ทีม 1Move',
  },
}

function buildStrategyBlock(label: string, body: string, exampleHtml?: string): string {
  return `
<!-- Strategy divider -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
  <tr><td style="border-top:1px solid #2A2A4A;"></td></tr>
</table>

<!-- Strategy label -->
<p style="color:#c9a84c;font-size:12px;font-weight:700;letter-spacing:1.5px;margin:20px 0 8px;text-transform:uppercase;">${label}</p>

<!-- Strategy body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;">${body}</p>

${exampleHtml || ''}`
}

interface FirstShareGuideOptions {
  name: string
  slug: string
  lang?: string
}

export function buildFirstShareGuideEmail({ name, slug, lang = 'en' }: FirstShareGuideOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  // Strategy 1 has an example message box
  const exampleBox = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:14px 16px;background-color:#0F0F23;border-${isRtl ? 'right' : 'left'}:3px solid #c9a84c;border-radius:4px;">
      <p style="color:#BBBBBB;font-size:14px;line-height:1.5;margin:0;font-style:italic;">${t.strategy_1_example.replace('{slug}', slug)}</p>
    </td>
  </tr>
</table>`

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:22px;margin:0 0 20px;text-align:${textAlign};">${t.heading.replace('{name}', name)}</h1>

<!-- Body intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 8px;text-align:${textAlign};">${t.body_1}</p>

${buildStrategyBlock(t.strategy_1_label, t.strategy_1_body, exampleBox)}
${buildStrategyBlock(t.strategy_2_label, t.strategy_2_body)}
${buildStrategyBlock(t.strategy_3_label, t.strategy_3_body)}

<!-- Divider before CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr><td style="border-top:1px solid #2A2A4A;"></td></tr>
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td align="center">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#c9a84c;color:#080808;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
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
            <a href="https://www.primeverseaccess.com/${slug}" style="color:#c9a84c;font-size:16px;font-weight:700;text-decoration:none;">
              primeverseaccess.com/${slug}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Closing body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_2}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0 0 4px;text-align:${textAlign};">${t.sign_off}</p>
<p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
