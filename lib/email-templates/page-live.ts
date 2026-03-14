import { baseEmailTemplate } from './base'

interface PageLiveTranslation {
  subject: string
  preview: string
  heading: string
  sub_heading: string
  body_1: string
  link_label: string
  cta_share: string
  cta_view: string
  body_2: string
  tip_1: string
  tip_2: string
  tip_3: string
  tip_4: string
  body_3: string
  help: string
  sign_off: string
  sign_name: string
}

const translations: Record<string, PageLiveTranslation> = {
  en: {
    subject: 'Your page is LIVE! Start sharing your link now',
    preview: "Congratulations! Your personal landing page is ready — here's your link.",
    heading: 'Congratulations, {name}! 🚀',
    sub_heading: 'Your page is officially LIVE!',
    body_1: 'Your personal landing page is now online and ready to receive leads 24/7. This is YOUR page — built around your profile, your bio, and your unique referral link.',
    link_label: 'Your link:',
    cta_share: 'SHARE MY PAGE',
    cta_view: 'VIEW MY PAGE',
    body_2: 'Share it everywhere — here are the fastest ways to get your first leads:',
    tip_1: 'Send it to 5 people you know who trade or want to learn',
    tip_2: 'Post it on your Instagram, TikTok, or Facebook story',
    tip_3: 'Drop it in your WhatsApp or Telegram groups',
    tip_4: 'Add it to your social media bio',
    body_3: 'Every person who clicks your link and signs up becomes your lead. The sooner you share, the faster you grow.',
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_off: "Let's make it happen!",
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Siden din er LIVE! Begynn å dele lenken din nå',
    preview: 'Gratulerer! Din personlige landingsside er klar — her er lenken din.',
    heading: 'Gratulerer, {name}! 🚀',
    sub_heading: 'Siden din er offisielt LIVE!',
    body_1: 'Din personlige landingsside er nå online og klar til å motta leads 24/7. Dette er DIN side — bygget rundt profilen din, bioen din og din unike referral-lenke.',
    link_label: 'Din lenke:',
    cta_share: 'DEL SIDEN MIN',
    cta_view: 'SE SIDEN MIN',
    body_2: 'Del den overalt — her er de raskeste måtene å få dine første leads:',
    tip_1: 'Send den til 5 personer du kjenner som handler eller vil lære',
    tip_2: 'Post den på Instagram, TikTok eller Facebook-storyen din',
    tip_3: 'Slipp den i WhatsApp- eller Telegram-gruppene dine',
    tip_4: 'Legg den til i biografien på sosiale medier',
    body_3: 'Hver person som klikker på lenken din og registrerer seg blir din lead. Jo raskere du deler, jo raskere vokser du.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_off: 'La oss få det til!',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Din sida är LIVE! Börja dela din länk nu',
    preview: 'Grattis! Din personliga landningssida är klar — här är din länk.',
    heading: 'Grattis, {name}! 🚀',
    sub_heading: 'Din sida är officiellt LIVE!',
    body_1: 'Din personliga landningssida är nu online och redo att ta emot leads dygnet runt. Det här är DIN sida — byggd kring din profil, din bio och din unika referral-länk.',
    link_label: 'Din länk:',
    cta_share: 'DELA MIN SIDA',
    cta_view: 'VISA MIN SIDA',
    body_2: 'Dela den överallt — här är de snabbaste sätten att få dina första leads:',
    tip_1: 'Skicka den till 5 personer du känner som handlar eller vill lära sig',
    tip_2: 'Posta den på din Instagram, TikTok eller Facebook story',
    tip_3: 'Släpp den i dina WhatsApp- eller Telegram-grupper',
    tip_4: 'Lägg till den i din bio på sociala medier',
    body_3: 'Varje person som klickar på din länk och registrerar sig blir din lead. Ju snabbare du delar, desto snabbare växer du.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_off: 'Nu kör vi!',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: '¡Tu página está EN VIVO! Empieza a compartir tu enlace ahora',
    preview: '¡Felicidades! Tu landing page personal está lista — aquí está tu enlace.',
    heading: '¡Felicidades, {name}! 🚀',
    sub_heading: '¡Tu página está oficialmente EN VIVO!',
    body_1: 'Tu landing page personal ya está en línea y lista para recibir leads 24/7. Esta es TU página — construida alrededor de tu perfil, tu bio y tu enlace de referido único.',
    link_label: 'Tu enlace:',
    cta_share: 'COMPARTIR MI PÁGINA',
    cta_view: 'VER MI PÁGINA',
    body_2: 'Compártela en todas partes — estas son las formas más rápidas de conseguir tus primeros leads:',
    tip_1: 'Envíala a 5 personas que conoces que operan o quieren aprender',
    tip_2: 'Publícala en tu historia de Instagram, TikTok o Facebook',
    tip_3: 'Compártela en tus grupos de WhatsApp o Telegram',
    tip_4: 'Agrégala a tu bio en redes sociales',
    body_3: 'Cada persona que haga clic en tu enlace y se registre se convierte en tu lead. Cuanto antes compartas, más rápido creces.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_off: '¡Hagámoslo realidad!',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'Ваша страница ЗАПУЩЕНА! Начните делиться ссылкой прямо сейчас',
    preview: 'Поздравляем! Ваша персональная страница готова — вот ваша ссылка.',
    heading: 'Поздравляем, {name}! 🚀',
    sub_heading: 'Ваша страница официально ЗАПУЩЕНА!',
    body_1: 'Ваша персональная страница теперь онлайн и готова принимать лиды 24/7. Это ВАША страница — созданная на основе вашего профиля, биографии и уникальной реферальной ссылки.',
    link_label: 'Ваша ссылка:',
    cta_share: 'ПОДЕЛИТЬСЯ СТРАНИЦЕЙ',
    cta_view: 'ПОСМОТРЕТЬ СТРАНИЦУ',
    body_2: 'Делитесь ей везде — вот самые быстрые способы получить первые лиды:',
    tip_1: 'Отправьте 5 знакомым, которые торгуют или хотят научиться',
    tip_2: 'Опубликуйте в сторис Instagram, TikTok или Facebook',
    tip_3: 'Отправьте в свои группы WhatsApp или Telegram',
    tip_4: 'Добавьте в биографию в соцсетях',
    body_3: 'Каждый, кто перейдёт по вашей ссылке и зарегистрируется, становится вашим лидом. Чем раньше вы поделитесь, тем быстрее будете расти.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_off: 'Давайте сделаем это!',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'صفحتك أصبحت مباشرة! ابدأ بمشاركة رابطك الآن',
    preview: 'تهانينا! صفحتك الشخصية جاهزة — إليك رابطك.',
    heading: 'تهانينا، {name}! 🚀',
    sub_heading: 'صفحتك أصبحت مباشرة رسمياً!',
    body_1: 'صفحتك الشخصية أصبحت الآن على الإنترنت وجاهزة لاستقبال العملاء المحتملين على مدار الساعة. هذه صفحتك أنت — مبنية حول ملفك الشخصي وسيرتك الذاتية ورابط الإحالة الخاص بك.',
    link_label: 'رابطك:',
    cta_share: 'مشاركة صفحتي',
    cta_view: 'عرض صفحتي',
    body_2: 'شاركها في كل مكان — إليك أسرع الطرق للحصول على أول عملائك:',
    tip_1: 'أرسلها لـ 5 أشخاص تعرفهم يتداولون أو يريدون التعلم',
    tip_2: 'انشرها على قصة Instagram أو TikTok أو Facebook',
    tip_3: 'أرسلها في مجموعات WhatsApp أو Telegram',
    tip_4: 'أضفها إلى السيرة الذاتية في حساباتك على وسائل التواصل',
    body_3: 'كل شخص ينقر على رابطك ويسجل يصبح عميلك المحتمل. كلما شاركت أسرع، كلما نمت أسرع.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_off: 'لنحقق ذلك!',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'LIVE na ang page mo! Simulan nang i-share ang link mo',
    preview: 'Congratulations! Handa na ang personal landing page mo — ito ang link mo.',
    heading: 'Congratulations, {name}! 🚀',
    sub_heading: 'Opisyal nang LIVE ang page mo!',
    body_1: 'Ang personal landing page mo ay online na at handang tumanggap ng leads 24/7. Ito ang IYON page — ginawa batay sa profile mo, bio mo, at ang natatanging referral link mo.',
    link_label: 'Ang link mo:',
    cta_share: 'I-SHARE ANG PAGE KO',
    cta_view: 'TINGNAN ANG PAGE KO',
    body_2: 'I-share ito sa lahat ng lugar — narito ang pinakamabilis na paraan para makakuha ng unang leads:',
    tip_1: 'Ipadala ito sa 5 taong kilala mo na nag-trade o gustong matuto',
    tip_2: 'I-post ito sa Instagram, TikTok, o Facebook story mo',
    tip_3: 'I-drop ito sa WhatsApp o Telegram groups mo',
    tip_4: 'Idagdag ito sa social media bio mo',
    body_3: 'Bawat taong mag-click sa link mo at mag-sign up ay magiging lead mo. Mas mabilis kang mag-share, mas mabilis kang lalago.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_off: 'Gawin natin ito!',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Sua página está NO AR! Comece a compartilhar seu link agora',
    preview: 'Parabéns! Sua landing page pessoal está pronta — aqui está seu link.',
    heading: 'Parabéns, {name}! 🚀',
    sub_heading: 'Sua página está oficialmente NO AR!',
    body_1: 'Sua landing page pessoal está agora online e pronta para receber leads 24/7. Esta é a SUA página — construída em torno do seu perfil, sua bio e seu link de indicação exclusivo.',
    link_label: 'Seu link:',
    cta_share: 'COMPARTILHAR MINHA PÁGINA',
    cta_view: 'VER MINHA PÁGINA',
    body_2: 'Compartilhe em todos os lugares — aqui estão as formas mais rápidas de conseguir seus primeiros leads:',
    tip_1: 'Envie para 5 pessoas que você conhece que operam ou querem aprender',
    tip_2: 'Poste nos seus Stories do Instagram, TikTok ou Facebook',
    tip_3: 'Compartilhe nos seus grupos de WhatsApp ou Telegram',
    tip_4: 'Adicione à sua bio nas redes sociais',
    body_3: 'Cada pessoa que clicar no seu link e se cadastrar se torna seu lead. Quanto antes você compartilhar, mais rápido você cresce.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_off: 'Vamos fazer acontecer!',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'หน้าเว็บของคุณ LIVE แล้ว! เริ่มแชร์ลิงก์ได้เลย',
    preview: 'ยินดีด้วย! Landing page ส่วนตัวของคุณพร้อมแล้ว — นี่คือลิงก์ของคุณ',
    heading: 'ยินดีด้วย, {name}! 🚀',
    sub_heading: 'หน้าเว็บของคุณ LIVE อย่างเป็นทางการแล้ว!',
    body_1: 'Landing page ส่วนตัวของคุณออนไลน์แล้วและพร้อมรับ leads ตลอด 24 ชั่วโมง นี่คือหน้าเว็บของคุณ — สร้างจากโปรไฟล์ ไบโอ และลิงก์แนะนำเฉพาะของคุณ',
    link_label: 'ลิงก์ของคุณ:',
    cta_share: 'แชร์หน้าเว็บ',
    cta_view: 'ดูหน้าเว็บ',
    body_2: 'แชร์ไปทุกที่ — นี่คือวิธีที่เร็วที่สุดในการได้ leads แรก:',
    tip_1: 'ส่งให้ 5 คนที่คุณรู้จักที่เทรดหรืออยากเรียนรู้',
    tip_2: 'โพสต์ใน Story ของ Instagram, TikTok หรือ Facebook',
    tip_3: 'ส่งในกลุ่ม WhatsApp หรือ Telegram',
    tip_4: 'เพิ่มในไบโอโซเชียลมีเดียของคุณ',
    body_3: 'ทุกคนที่คลิกลิงก์ของคุณและสมัครจะกลายเป็น lead ของคุณ ยิ่งแชร์เร็ว ยิ่งเติบโตเร็ว',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_off: 'มาทำให้สำเร็จกัน!',
    sign_name: '— ทีม 1Move',
  },
}

function buildTipRow(text: string): string {
  return `<tr>
    <td width="28" valign="top" style="padding:8px 0;color:#D4A843;font-size:16px;line-height:1.4;">
      &rarr;
    </td>
    <td valign="top" style="padding:8px 0 8px 4px;color:#E0E0E0;font-size:15px;line-height:1.4;">
      ${text}
    </td>
  </tr>`
}

interface PageLiveEmailOptions {
  name: string
  slug: string
  lang?: string
}

export function buildPageLiveEmail({ name, slug, lang = 'en' }: PageLiveEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const tipsHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  ${buildTipRow(t.tip_1)}
  ${buildTipRow(t.tip_2)}
  ${buildTipRow(t.tip_3)}
  ${buildTipRow(t.tip_4)}
</table>`

  const content = `
<!-- Heading -->
<h1 style="color:#D4A843;font-size:24px;margin:0 0 8px;text-align:center;">${t.heading.replace('{name}', name)}</h1>

<!-- Sub-heading -->
<h2 style="color:#FFFFFF;font-size:18px;margin:0 0 24px;text-align:center;font-weight:600;">${t.sub_heading}</h2>

<!-- Body intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:${textAlign};">${t.body_1}</p>

<!-- Link display box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:2px solid #D4A843;border-radius:8px;width:100%;max-width:440px;">
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">${t.link_label}</p>
            <a href="https://www.primeverseaccess.com/${slug}" style="color:#D4A843;font-size:20px;font-weight:700;text-decoration:none;word-break:break-all;">
              primeverseaccess.com/${slug}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Two CTA buttons stacked -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
  <tr>
    <td align="center">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#D4A843;color:#1A1A2E;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta_share}
      </a>
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
  <tr>
    <td align="center" style="padding:8px 0 0;">
      <a href="https://www.primeverseaccess.com/${slug}" style="display:inline-block;border:2px solid #D4A843;color:#D4A843;padding:14px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;background:transparent;">
        ${t.cta_view}
      </a>
    </td>
  </tr>
</table>

<!-- Sharing tips intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};font-weight:700;">${t.body_2}</p>

<!-- Tips -->
${tipsHtml}

<!-- Closing body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_3}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#D4A843;font-size:15px;font-weight:700;margin:0 0 4px;text-align:${textAlign};">${t.sign_off}</p>
<p style="color:#D4A843;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
