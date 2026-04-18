import { baseEmailTemplate } from './base'

interface WeeklySummaryTranslation {
  subject_with_leads: string
  subject_zero: string
  preview: string
  heading: string
  greeting: string
  new_leads_label: string
  total_leads_label: string
  pending_label: string
  approved_label: string
  perf_up: string
  perf_same: string
  perf_down: string
  perf_zero: string
  tip_label: string
  tips: string[]
  cta: string
  link_label: string
  body_closing: string
  help: string
  sign_name: string
}

const translations: Record<string, WeeklySummaryTranslation> = {
  en: {
    subject_with_leads: 'Your weekly report — {new_leads} new leads this week',
    subject_zero: "Your weekly report — here's your update",
    preview: "Here's how your IB business performed this week. Check your stats.",
    heading: 'Your Weekly Report',
    greeting: "Hey {name}, here's your week in numbers:",
    new_leads_label: 'NEW LEADS',
    total_leads_label: 'TOTAL LEADS',
    pending_label: 'PENDING UIDs',
    approved_label: 'APPROVED',
    perf_up: "You're up! +{difference} leads compared to last week. Keep the momentum going!",
    perf_same: 'Steady week — same as last week. Try a new sharing strategy to break through!',
    perf_down: "Slightly slower week. Don't worry — consistency is key. Try sharing your link in a new group today.",
    perf_zero: "No new leads this week. Your page is still live and ready. One share can change everything — try sending your link to 5 people today.",
    tip_label: 'TIP OF THE WEEK',
    tips: [
      'Personal messages convert 10x better than public posts. Send your link directly to 5 people today.',
      'Post your link on Instagram or TikTok Stories — the 24-hour urgency makes people click faster.',
      'Add your PrimeVerse link to your social media bio. It works for you even when you\'re not sharing.',
      'Share your link in WhatsApp or Telegram groups about trading, investing, or financial education.',
      'Ask someone who already signed up to share your page with their friends. Word of mouth is powerful.',
      'Post a short video about why you joined PrimeVerse and include your link. Video gets more engagement.',
      'Consistency beats intensity. Share your link a little bit every day instead of a lot once a month.',
      'Reply to comments and DMs about trading with your link. Be helpful first, then share.',
    ],
    cta: 'VIEW MY DASHBOARD',
    link_label: 'Your link:',
    body_closing: "Share it today and watch next week's numbers grow.",
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject_with_leads: 'Din ukentlige rapport — {new_leads} nye leads denne uken',
    subject_zero: 'Din ukentlige rapport — her er oppdateringen din',
    preview: 'Slik presterte IB-virksomheten din denne uken. Sjekk statistikken din.',
    heading: 'Din ukentlige rapport',
    greeting: 'Hei {name}, her er uken din i tall:',
    new_leads_label: 'NYE LEADS',
    total_leads_label: 'TOTALT LEADS',
    pending_label: 'VENTENDE UIDs',
    approved_label: 'GODKJENT',
    perf_up: 'Du er opp! +{difference} leads sammenlignet med forrige uke. Hold momentumet oppe!',
    perf_same: 'Stabil uke — samme som forrige uke. Prøv en ny delingsstrategi for å bryte gjennom!',
    perf_down: 'Litt roligere uke. Ikke bekymre deg — konsistens er nøkkelen. Prøv å dele lenken din i en ny gruppe i dag.',
    perf_zero: 'Ingen nye leads denne uken. Siden din er fortsatt live og klar. Én deling kan endre alt — prøv å sende lenken din til 5 personer i dag.',
    tip_label: 'UKENS TIPS',
    tips: [
      'Personlige meldinger konverterer 10x bedre enn offentlige innlegg. Send lenken din direkte til 5 personer i dag.',
      'Post lenken din på Instagram eller TikTok Stories — 24-timers hastigheten får folk til å klikke raskere.',
      'Legg til PrimeVerse-lenken din i sosiale medier-bioen din. Den jobber for deg selv når du ikke deler.',
      'Del lenken din i WhatsApp- eller Telegram-grupper om trading, investering eller finansiell utdanning.',
      'Be noen som allerede har registrert seg om å dele siden din med vennene sine. Jungeltelegrafen er kraftig.',
      'Post en kort video om hvorfor du ble med i PrimeVerse og inkluder lenken din. Video får mer engasjement.',
      'Konsistens slår intensitet. Del lenken din litt hver dag i stedet for mye én gang i måneden.',
      'Svar på kommentarer og DMs om trading med lenken din. Vær hjelpsom først, deretter del.',
    ],
    cta: 'SE DASHBOARDET MITT',
    link_label: 'Din lenke:',
    body_closing: 'Del den i dag og se neste ukes tall vokse.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject_with_leads: 'Din veckorapport — {new_leads} nya leads denna vecka',
    subject_zero: 'Din veckorapport — här är din uppdatering',
    preview: 'Så här presterade din IB-verksamhet denna vecka. Kolla din statistik.',
    heading: 'Din veckorapport',
    greeting: 'Hej {name}, här är din vecka i siffror:',
    new_leads_label: 'NYA LEADS',
    total_leads_label: 'TOTALT LEADS',
    pending_label: 'VÄNTANDE UIDs',
    approved_label: 'GODKÄNDA',
    perf_up: 'Du är upp! +{difference} leads jämfört med förra veckan. Håll momentumet uppe!',
    perf_same: 'Stabil vecka — samma som förra veckan. Prova en ny delningsstrategi för att bryta igenom!',
    perf_down: 'Lite lugnare vecka. Oroa dig inte — konsekvens är nyckeln. Prova att dela din länk i en ny grupp idag.',
    perf_zero: 'Inga nya leads denna vecka. Din sida är fortfarande live och redo. En delning kan ändra allt — prova att skicka din länk till 5 personer idag.',
    tip_label: 'VECKANS TIPS',
    tips: [
      'Personliga meddelanden konverterar 10x bättre än offentliga inlägg. Skicka din länk direkt till 5 personer idag.',
      'Posta din länk på Instagram eller TikTok Stories — 24-timmars brådskan gör att folk klickar snabbare.',
      'Lägg till din PrimeVerse-länk i din sociala medie-bio. Den jobbar för dig även när du inte delar.',
      'Dela din länk i WhatsApp- eller Telegram-grupper om trading, investering eller finansiell utbildning.',
      'Be någon som redan registrerat sig att dela din sida med sina vänner. Mun-till-mun är kraftfullt.',
      'Posta en kort video om varför du gick med i PrimeVerse och inkludera din länk. Video får mer engagemang.',
      'Konsekvens slår intensitet. Dela din länk lite varje dag istället för mycket en gång i månaden.',
      'Svara på kommentarer och DMs om trading med din länk. Var hjälpsam först, dela sedan.',
    ],
    cta: 'VISA MIN DASHBOARD',
    link_label: 'Din länk:',
    body_closing: 'Dela den idag och se nästa veckas siffror växa.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject_with_leads: 'Tu reporte semanal — {new_leads} nuevos leads esta semana',
    subject_zero: 'Tu reporte semanal — aquí está tu actualización',
    preview: 'Así se desempeñó tu negocio IB esta semana. Revisa tus estadísticas.',
    heading: 'Tu reporte semanal',
    greeting: 'Hey {name}, aquí está tu semana en números:',
    new_leads_label: 'NUEVOS LEADS',
    total_leads_label: 'TOTAL DE LEADS',
    pending_label: 'UIDs PENDIENTES',
    approved_label: 'APROBADOS',
    perf_up: '¡Vas para arriba! +{difference} leads comparado con la semana pasada. ¡Mantén el impulso!',
    perf_same: 'Semana estable — igual que la semana pasada. ¡Prueba una nueva estrategia de compartir para avanzar!',
    perf_down: 'Semana un poco más lenta. No te preocupes — la consistencia es clave. Intenta compartir tu enlace en un nuevo grupo hoy.',
    perf_zero: 'Sin nuevos leads esta semana. Tu página sigue activa y lista. Una sola compartida puede cambiar todo — intenta enviar tu enlace a 5 personas hoy.',
    tip_label: 'CONSEJO DE LA SEMANA',
    tips: [
      'Los mensajes personales convierten 10x mejor que las publicaciones públicas. Envía tu enlace directamente a 5 personas hoy.',
      'Publica tu enlace en Instagram o TikTok Stories — la urgencia de 24 horas hace que la gente haga clic más rápido.',
      'Agrega tu enlace de PrimeVerse a tu bio de redes sociales. Trabaja para ti incluso cuando no estás compartiendo.',
      'Comparte tu enlace en grupos de WhatsApp o Telegram sobre trading, inversión o educación financiera.',
      'Pide a alguien que ya se registró que comparta tu página con sus amigos. El boca a boca es poderoso.',
      'Publica un video corto sobre por qué te uniste a PrimeVerse e incluye tu enlace. El video genera más interacción.',
      'La consistencia supera la intensidad. Comparte tu enlace un poco cada día en vez de mucho una vez al mes.',
      'Responde a comentarios y DMs sobre trading con tu enlace. Sé útil primero, luego comparte.',
    ],
    cta: 'VER MI PANEL',
    link_label: 'Tu enlace:',
    body_closing: 'Compártelo hoy y mira crecer los números de la próxima semana.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject_with_leads: 'Ваш еженедельный отчёт — {new_leads} новых лидов на этой неделе',
    subject_zero: 'Ваш еженедельный отчёт — вот ваше обновление',
    preview: 'Как ваш IB-бизнес показал себя на этой неделе. Проверьте статистику.',
    heading: 'Ваш еженедельный отчёт',
    greeting: 'Привет, {name}, вот ваша неделя в цифрах:',
    new_leads_label: 'НОВЫЕ ЛИДЫ',
    total_leads_label: 'ВСЕГО ЛИДОВ',
    pending_label: 'ОЖИДАЮЩИЕ UIDs',
    approved_label: 'ОДОБРЕНО',
    perf_up: 'Вы растёте! +{difference} лидов по сравнению с прошлой неделей. Поддерживайте темп!',
    perf_same: 'Стабильная неделя — так же, как прошлая. Попробуйте новую стратегию, чтобы прорваться!',
    perf_down: 'Чуть более спокойная неделя. Не переживайте — главное постоянство. Попробуйте поделиться ссылкой в новой группе сегодня.',
    perf_zero: 'Нет новых лидов на этой неделе. Ваша страница по-прежнему активна и готова. Одна отправка может всё изменить — попробуйте отправить ссылку 5 людям сегодня.',
    tip_label: 'СОВЕТ НЕДЕЛИ',
    tips: [
      'Личные сообщения конвертируют в 10 раз лучше, чем публичные посты. Отправьте ссылку напрямую 5 людям сегодня.',
      'Разместите ссылку в Instagram или TikTok Stories — 24-часовая срочность заставляет людей кликать быстрее.',
      'Добавьте ссылку PrimeVerse в био соцсетей. Она работает на вас, даже когда вы не делитесь.',
      'Поделитесь ссылкой в группах WhatsApp или Telegram о трейдинге, инвестициях или финансовом образовании.',
      'Попросите того, кто уже зарегистрировался, поделиться вашей страницей с друзьями. Сарафанное радио — мощная сила.',
      'Запишите короткое видео о том, почему вы присоединились к PrimeVerse, и добавьте ссылку. Видео получает больше вовлечённости.',
      'Постоянство побеждает интенсивность. Делитесь ссылкой понемногу каждый день, а не много раз в месяц.',
      'Отвечайте на комментарии и DM о трейдинге со своей ссылкой. Сначала помогите, потом делитесь.',
    ],
    cta: 'ПЕРЕЙТИ В ДАШБОРД',
    link_label: 'Ваша ссылка:',
    body_closing: 'Поделитесь сегодня и наблюдайте, как растут цифры на следующей неделе.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject_with_leads: 'تقريرك الأسبوعي — {new_leads} عملاء جدد هذا الأسبوع',
    subject_zero: 'تقريرك الأسبوعي — إليك آخر المستجدات',
    preview: 'إليك أداء عملك كـ IB هذا الأسبوع. تحقق من إحصائياتك.',
    heading: 'تقريرك الأسبوعي',
    greeting: 'مرحباً {name}، إليك أسبوعك بالأرقام:',
    new_leads_label: 'عملاء جدد',
    total_leads_label: 'إجمالي العملاء',
    pending_label: 'UIDs معلقة',
    approved_label: 'موافق عليهم',
    perf_up: 'أنت في تصاعد! +{difference} عملاء مقارنة بالأسبوع الماضي. حافظ على الزخم!',
    perf_same: 'أسبوع مستقر — مثل الأسبوع الماضي. جرب استراتيجية مشاركة جديدة للتقدم!',
    perf_down: 'أسبوع أبطأ قليلاً. لا تقلق — الاستمرارية هي المفتاح. جرب مشاركة رابطك في مجموعة جديدة اليوم.',
    perf_zero: 'لا عملاء جدد هذا الأسبوع. صفحتك لا تزال نشطة وجاهزة. مشاركة واحدة يمكن أن تغير كل شيء — جرب إرسال رابطك إلى 5 أشخاص اليوم.',
    tip_label: 'نصيحة الأسبوع',
    tips: [
      'الرسائل الشخصية تحقق نتائج أفضل 10 مرات من المنشورات العامة. أرسل رابطك مباشرة إلى 5 أشخاص اليوم.',
      'انشر رابطك على Instagram أو TikTok Stories — الحاجة الملحة لمدة 24 ساعة تجعل الناس ينقرون أسرع.',
      'أضف رابط PrimeVerse إلى بيو وسائل التواصل الاجتماعي. يعمل لصالحك حتى عندما لا تشارك.',
      'شارك رابطك في مجموعات WhatsApp أو Telegram عن التداول والاستثمار أو التعليم المالي.',
      'اطلب من شخص سجل بالفعل أن يشارك صفحتك مع أصدقائه. الكلام الشفهي قوي.',
      'انشر فيديو قصير عن سبب انضمامك إلى PrimeVerse وأضف رابطك. الفيديو يحصل على تفاعل أكثر.',
      'الاستمرارية تتفوق على الكثافة. شارك رابطك قليلاً كل يوم بدلاً من الكثير مرة واحدة في الشهر.',
      'رد على التعليقات والرسائل الخاصة عن التداول برابطك. كن مفيداً أولاً، ثم شارك.',
    ],
    cta: 'عرض لوحة التحكم',
    link_label: 'رابطك:',
    body_closing: 'شاركه اليوم وشاهد أرقام الأسبوع القادم تنمو.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject_with_leads: 'Ang weekly report mo — {new_leads} bagong leads ngayong linggo',
    subject_zero: 'Ang weekly report mo — narito ang update mo',
    preview: 'Ganito ang performance ng IB business mo ngayong linggo. Tingnan ang stats mo.',
    heading: 'Ang Weekly Report Mo',
    greeting: 'Hey {name}, narito ang linggo mo sa mga numero:',
    new_leads_label: 'BAGONG LEADS',
    total_leads_label: 'KABUUANG LEADS',
    pending_label: 'PENDING UIDs',
    approved_label: 'APPROVED',
    perf_up: 'Pataas ka! +{difference} leads kumpara sa nakaraang linggo. Panatilihin ang momentum!',
    perf_same: 'Stable na linggo — kapareho ng nakaraang linggo. Subukan ang bagong sharing strategy para mag-break through!',
    perf_down: 'Medyo mas mabagal na linggo. Huwag mag-alala — ang consistency ang susi. Subukang i-share ang link mo sa bagong grupo ngayon.',
    perf_zero: 'Walang bagong leads ngayong linggo. Live pa rin ang page mo at handa. Isang share lang ang kailangan para magbago ang lahat — subukang i-send ang link mo sa 5 tao ngayon.',
    tip_label: 'TIP NG LINGGO',
    tips: [
      'Ang personal messages ay 10x mas magaling mag-convert kaysa public posts. I-send ang link mo directly sa 5 tao ngayon.',
      'I-post ang link mo sa Instagram o TikTok Stories — ang 24-hour urgency ay nagpapaclick sa mga tao nang mas mabilis.',
      'I-add ang PrimeVerse link mo sa social media bio mo. Gumagana ito para sa iyo kahit hindi ka nagsha-share.',
      'I-share ang link mo sa WhatsApp o Telegram groups tungkol sa trading, investing, o financial education.',
      'Hilingin sa isang nag-sign up na na i-share ang page mo sa mga kaibigan nila. Malakas ang word of mouth.',
      'Mag-post ng maikling video kung bakit ka sumali sa PrimeVerse at isama ang link mo. Mas maraming engagement ang video.',
      'Ang consistency ay nananalo laban sa intensity. I-share ang link mo ng konti araw-araw sa halip na marami isang beses sa isang buwan.',
      'Sumagot sa mga komento at DMs tungkol sa trading gamit ang link mo. Maging helpful muna, tapos i-share.',
    ],
    cta: 'TINGNAN ANG DASHBOARD KO',
    link_label: 'Ang link mo:',
    body_closing: 'I-share ito ngayon at panoorin ang mga numero ng susunod na linggo na lumaki.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject_with_leads: 'Seu relatório semanal — {new_leads} novos leads esta semana',
    subject_zero: 'Seu relatório semanal — aqui está sua atualização',
    preview: 'Veja como seu negócio IB se saiu esta semana. Confira suas estatísticas.',
    heading: 'Seu relatório semanal',
    greeting: 'Hey {name}, aqui está sua semana em números:',
    new_leads_label: 'NOVOS LEADS',
    total_leads_label: 'TOTAL DE LEADS',
    pending_label: 'UIDs PENDENTES',
    approved_label: 'APROVADOS',
    perf_up: 'Você está subindo! +{difference} leads comparado com a semana passada. Mantenha o ritmo!',
    perf_same: 'Semana estável — igual à semana passada. Tente uma nova estratégia de compartilhamento para avançar!',
    perf_down: 'Semana um pouco mais lenta. Não se preocupe — consistência é a chave. Tente compartilhar seu link em um novo grupo hoje.',
    perf_zero: 'Nenhum novo lead esta semana. Sua página ainda está ativa e pronta. Um compartilhamento pode mudar tudo — tente enviar seu link para 5 pessoas hoje.',
    tip_label: 'DICA DA SEMANA',
    tips: [
      'Mensagens pessoais convertem 10x melhor que posts públicos. Envie seu link diretamente para 5 pessoas hoje.',
      'Poste seu link no Instagram ou TikTok Stories — a urgência de 24 horas faz as pessoas clicarem mais rápido.',
      'Adicione seu link PrimeVerse na bio das redes sociais. Ele trabalha para você mesmo quando você não está compartilhando.',
      'Compartilhe seu link em grupos de WhatsApp ou Telegram sobre trading, investimentos ou educação financeira.',
      'Peça a alguém que já se cadastrou para compartilhar sua página com amigos. O boca a boca é poderoso.',
      'Poste um vídeo curto sobre por que você se juntou ao PrimeVerse e inclua seu link. Vídeo gera mais engajamento.',
      'Consistência vence intensidade. Compartilhe seu link um pouco todo dia ao invés de muito uma vez por mês.',
      'Responda comentários e DMs sobre trading com seu link. Seja útil primeiro, depois compartilhe.',
    ],
    cta: 'VER MEU PAINEL',
    link_label: 'Seu link:',
    body_closing: 'Compartilhe hoje e veja os números da próxima semana crescerem.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject_with_leads: 'รายงานประจำสัปดาห์ — {new_leads} lead ใหม่สัปดาห์นี้',
    subject_zero: 'รายงานประจำสัปดาห์ — อัปเดตของคุณ',
    preview: 'ดูว่าธุรกิจ IB ของคุณทำได้อย่างไรสัปดาห์นี้ ตรวจสอบสถิติของคุณ',
    heading: 'รายงานประจำสัปดาห์ของคุณ',
    greeting: 'เฮ้ {name} นี่คือสัปดาห์ของคุณในตัวเลข:',
    new_leads_label: 'LEAD ใหม่',
    total_leads_label: 'LEAD ทั้งหมด',
    pending_label: 'UIDs ที่รอดำเนินการ',
    approved_label: 'อนุมัติแล้ว',
    perf_up: 'คุณเพิ่มขึ้น! +{difference} lead เทียบกับสัปดาห์ที่แล้ว รักษาโมเมนตัมไว้!',
    perf_same: 'สัปดาห์คงที่ — เท่ากับสัปดาห์ที่แล้ว ลองกลยุทธ์แชร์ใหม่เพื่อก้าวไปข้างหน้า!',
    perf_down: 'สัปดาห์ช้าลงเล็กน้อย ไม่ต้องกังวล — ความสม่ำเสมอคือกุญแจ ลองแชร์ลิงก์ในกลุ่มใหม่วันนี้',
    perf_zero: 'ไม่มี lead ใหม่สัปดาห์นี้ หน้าเว็บยังคงใช้งานได้และพร้อม การแชร์หนึ่งครั้งสามารถเปลี่ยนทุกอย่างได้ — ลองส่งลิงก์ให้ 5 คนวันนี้',
    tip_label: 'เคล็ดลับประจำสัปดาห์',
    tips: [
      'ข้อความส่วนตัวแปลงลูกค้าได้ดีกว่าโพสต์สาธารณะ 10 เท่า ส่งลิงก์ตรงให้ 5 คนวันนี้',
      'โพสต์ลิงก์บน Instagram หรือ TikTok Stories — ความเร่งด่วน 24 ชั่วโมงทำให้คนคลิกเร็วขึ้น',
      'เพิ่มลิงก์ PrimeVerse ในไบโอโซเชียลมีเดีย มันทำงานให้คุณแม้ตอนที่คุณไม่ได้แชร์',
      'แชร์ลิงก์ในกลุ่ม WhatsApp หรือ Telegram เกี่ยวกับการเทรด การลงทุน หรือการศึกษาด้านการเงิน',
      'ขอให้คนที่สมัครแล้วแชร์หน้าเว็บกับเพื่อนๆ การบอกต่อมีพลังมาก',
      'โพสต์วิดีโอสั้นเกี่ยวกับเหตุผลที่คุณเข้าร่วม PrimeVerse และใส่ลิงก์ วิดีโอได้รับการมีส่วนร่วมมากกว่า',
      'ความสม่ำเสมอชนะความเข้มข้น แชร์ลิงก์ทุกวันเล็กน้อยแทนที่จะมากครั้งเดียวต่อเดือน',
      'ตอบคอมเมนต์และ DM เกี่ยวกับการเทรดด้วยลิงก์ของคุณ ช่วยเหลือก่อน แล้วค่อยแชร์',
    ],
    cta: 'ดูแดชบอร์ดของฉัน',
    link_label: 'ลิงก์ของคุณ:',
    body_closing: 'แชร์วันนี้และดูตัวเลขสัปดาห์หน้าเติบโต',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_name: '— ทีม 1Move',
  },
}

// Localized month names for date range formatting
const monthNames: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  no: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
  sv: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  tl: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
}

function formatDateRange(start: Date, end: Date, lang: string): string {
  const months = monthNames[lang] || monthNames.en
  const startMonth = months[start.getUTCMonth()]
  const endMonth = months[end.getUTCMonth()]
  const startDay = start.getUTCDate()
  const endDay = end.getUTCDate()
  const year = end.getUTCFullYear()

  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

function buildStatCell(label: string, value: number): string {
  return `<td width="50%" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:1px solid #c9a84c;border-radius:8px;">
        <tr>
          <td style="padding:16px 12px;text-align:center;">
            <p style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">${label}</p>
            <p style="color:#c9a84c;font-size:36px;font-weight:800;margin:0;line-height:1;">${value}</p>
          </td>
        </tr>
      </table>
    </td>`
}

export interface WeeklySummaryStats {
  newLeads: number
  totalLeads: number
  pending: number
  approved: number
  lastWeekLeads: number
}

interface WeeklySummaryOptions {
  name: string
  slug: string
  stats: WeeklySummaryStats
  weekStart: Date
  weekEnd: Date
  lang?: string
}

export function getWeeklyTipIndex(): number {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 8
}

export function buildWeeklySummaryEmail({ name, slug, stats, weekStart, weekEnd, lang = 'en' }: WeeklySummaryOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const { newLeads, totalLeads, pending, approved, lastWeekLeads } = stats
  const difference = newLeads - lastWeekLeads

  const subject = newLeads > 0
    ? t.subject_with_leads.replace('{new_leads}', String(newLeads))
    : t.subject_zero

  const dateRange = formatDateRange(weekStart, weekEnd, lang)

  // Performance message
  let perfEmoji: string
  let perfText: string
  if (newLeads === 0) {
    perfEmoji = '🔇'
    perfText = t.perf_zero
  } else if (newLeads > lastWeekLeads) {
    perfEmoji = '📈'
    perfText = t.perf_up.replace('{difference}', String(difference))
  } else if (newLeads === lastWeekLeads) {
    perfEmoji = '📊'
    perfText = t.perf_same
  } else {
    perfEmoji = '📉'
    perfText = t.perf_down
  }

  // Rotating tip
  const tipIndex = getWeeklyTipIndex()
  const tip = t.tips[tipIndex]

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:26px;margin:0 0 8px;text-align:center;">${t.heading}</h1>

<!-- Date range sub-heading -->
<p style="color:#888;font-size:15px;margin:0 0 24px;text-align:center;">${dateRange}</p>

<!-- Greeting -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.greeting.replace('{name}', name)}</p>

<!-- 2x2 Stats Grid -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    ${buildStatCell(t.new_leads_label, newLeads)}
    ${buildStatCell(t.total_leads_label, totalLeads)}
  </tr>
  <tr>
    ${buildStatCell(t.pending_label, pending)}
    ${buildStatCell(t.approved_label, approved)}
  </tr>
</table>

<!-- Performance comparison message -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">
  ${perfEmoji} ${perfText}
</p>

<!-- Tip of the week box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:#0F0F23;border-${isRtl ? 'right' : 'left'}:4px solid #c9a84c;border-radius:4px;padding:16px 20px;">
      <p style="color:#c9a84c;font-size:12px;font-weight:700;letter-spacing:1px;margin:0 0 8px;text-align:${textAlign};">💡 ${t.tip_label}</p>
      <p style="color:#CCCCCC;font-size:14px;line-height:1.6;margin:0;text-align:${textAlign};">${tip}</p>
    </td>
  </tr>
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

<!-- Closing -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_closing}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject }
}
