import { baseEmailTemplate } from './base'

type InactiveNudgeVariant = 'day7' | 'day14'

interface InactiveNudgeTranslation {
  // Day 7
  subject_7: string
  preview_7: string
  heading_7: string
  body_intro_7: string
  // Day 14
  subject_14: string
  preview_14: string
  heading_14: string
  body_intro_14: string
  pre_cta_14: string
  // Shared
  while_away_label: string
  new_leads_label: string
  has_leads_body: string
  no_leads_body: string
  what_you_can_do: string
  tip_1: string
  tip_2: string
  tip_3: string
  two_minutes: string
  cta: string
  link_label: string
  body_closing: string
  help: string
  sign_name: string
}

const translations: Record<string, InactiveNudgeTranslation> = {
  en: {
    subject_7: 'Your page is still working for you, {name}',
    preview_7: "It's been a while. Here's what's been happening while you were away.",
    heading_7: "Hey {name}, it's been a minute!",
    body_intro_7: "It's been <span style=\"color:#c9a84c;font-weight:700;\">{days}</span> days since you last checked your dashboard. No worries — your landing page has been live and working the entire time.",
    subject_14: 'We miss you, {name} — your dashboard has updates',
    preview_14: "It's been two weeks. Your page is still live. Come take a look.",
    heading_14: "It's been a while, {name}. We'd love to see you back.",
    body_intro_14: "It's been <span style=\"color:#c9a84c;font-weight:700;\">{days}</span> days since your last visit. Your landing page is still live at <a href=\"https://www.primeverseaccess.com/{slug}\" style=\"color:#c9a84c;text-decoration:none;font-weight:600;\">primeverseaccess.com/{slug}</a> — and it's still ready to bring in leads for you.",
    pre_cta_14: 'Even 5 minutes in your dashboard today can make a difference. Check your stats, share your link, and get back in the game.',
    while_away_label: 'WHILE YOU WERE AWAY',
    new_leads_label: 'NEW LEAD(S)',
    has_leads_body: 'People signed up through your page while you were gone! Log in to see who they are and follow up — they auto-verify once KYC is approved.',
    no_leads_body: "Your page is ready and waiting. Sometimes all it takes is one share to kick things off again. Here's a quick challenge: send your link to just 3 people today.",
    what_you_can_do: "Here's what you can do right now:",
    tip_1: 'Check your latest stats and leads',
    tip_2: 'Share your link in a new group or chat',
    tip_3: 'Update your bio or profile photo for a fresh look',
    two_minutes: 'It only takes 2 minutes to get back in the game.',
    cta: 'OPEN MY DASHBOARD',
    link_label: 'Your link:',
    body_closing: "We're building something big together. Don't miss out on the momentum.",
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject_7: 'Siden din jobber fortsatt for deg, {name}',
    preview_7: 'Det har gått en stund. Her er hva som har skjedd mens du var borte.',
    heading_7: 'Hei {name}, det har gått litt tid!',
    body_intro_7: 'Det har gått <span style="color:#c9a84c;font-weight:700;">{days}</span> dager siden du sist sjekket dashboardet ditt. Ingen bekymring — landingssiden din har vært aktiv og fungert hele tiden.',
    subject_14: 'Vi savner deg, {name} — dashboardet ditt har oppdateringer',
    preview_14: 'Det har gått to uker. Siden din er fortsatt aktiv. Ta en titt.',
    heading_14: 'Det har gått en stund, {name}. Vi vil gjerne se deg tilbake.',
    body_intro_14: 'Det har gått <span style="color:#c9a84c;font-weight:700;">{days}</span> dager siden ditt siste besøk. Landingssiden din er fortsatt aktiv på <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — og den er fortsatt klar til å bringe inn leads for deg.',
    pre_cta_14: 'Bare 5 minutter i dashboardet ditt i dag kan gjøre en forskjell. Sjekk statistikken din, del lenken din, og kom tilbake i spillet.',
    while_away_label: 'MENS DU VAR BORTE',
    new_leads_label: 'NY(E) LEAD(S)',
    has_leads_body: 'Folk registrerte seg via siden din mens du var borte! Logg inn for å se hvem de er og følge opp — de verifiseres automatisk når KYC er godkjent.',
    no_leads_body: 'Siden din er klar og venter. Noen ganger er alt som trengs én deling for å starte på nytt. Her er en rask utfordring: send lenken din til bare 3 personer i dag.',
    what_you_can_do: 'Her er hva du kan gjøre akkurat nå:',
    tip_1: 'Sjekk de siste statistikkene og leadsene dine',
    tip_2: 'Del lenken din i en ny gruppe eller chat',
    tip_3: 'Oppdater bioen din eller profilbildet for et nytt utseende',
    two_minutes: 'Det tar bare 2 minutter å komme tilbake i spillet.',
    cta: 'ÅPNE DASHBOARDET',
    link_label: 'Din lenke:',
    body_closing: 'Vi bygger noe stort sammen. Gå ikke glipp av momentumet.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject_7: 'Din sida jobbar fortfarande för dig, {name}',
    preview_7: 'Det har gått ett tag. Här är vad som har hänt medan du var borta.',
    heading_7: 'Hej {name}, det har gått ett tag!',
    body_intro_7: 'Det har gått <span style="color:#c9a84c;font-weight:700;">{days}</span> dagar sedan du senast kollade din dashboard. Inga problem — din landningssida har varit aktiv och fungerat hela tiden.',
    subject_14: 'Vi saknar dig, {name} — din dashboard har uppdateringar',
    preview_14: 'Det har gått två veckor. Din sida är fortfarande aktiv. Kom och ta en titt.',
    heading_14: 'Det har gått ett tag, {name}. Vi vill gärna se dig tillbaka.',
    body_intro_14: 'Det har gått <span style="color:#c9a84c;font-weight:700;">{days}</span> dagar sedan ditt senaste besök. Din landningssida är fortfarande aktiv på <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — och den är fortfarande redo att ta in leads åt dig.',
    pre_cta_14: 'Bara 5 minuter i din dashboard idag kan göra skillnad. Kolla dina statistik, dela din länk och kom tillbaka i spelet.',
    while_away_label: 'MEDAN DU VAR BORTA',
    new_leads_label: 'NY(A) LEAD(S)',
    has_leads_body: 'Folk registrerade sig via din sida medan du var borta! Logga in för att se vilka de är och följa upp — de verifieras automatiskt när KYC är godkänt.',
    no_leads_body: 'Din sida är redo och väntar. Ibland räcker det med en delning för att komma igång igen. Här är en snabb utmaning: skicka din länk till bara 3 personer idag.',
    what_you_can_do: 'Här är vad du kan göra just nu:',
    tip_1: 'Kolla dina senaste statistik och leads',
    tip_2: 'Dela din länk i en ny grupp eller chatt',
    tip_3: 'Uppdatera din bio eller profilbild för en fräsch look',
    two_minutes: 'Det tar bara 2 minuter att komma tillbaka i spelet.',
    cta: 'ÖPPNA MIN DASHBOARD',
    link_label: 'Din länk:',
    body_closing: 'Vi bygger något stort tillsammans. Missa inte momentumet.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject_7: 'Tu página sigue trabajando para ti, {name}',
    preview_7: 'Ha pasado un tiempo. Esto es lo que ha estado sucediendo mientras estabas ausente.',
    heading_7: '¡Oye {name}, ha pasado un rato!',
    body_intro_7: 'Han pasado <span style="color:#c9a84c;font-weight:700;">{days}</span> días desde que revisaste tu panel por última vez. No te preocupes — tu página de aterrizaje ha estado activa y funcionando todo el tiempo.',
    subject_14: 'Te extrañamos, {name} — tu panel tiene actualizaciones',
    preview_14: 'Han pasado dos semanas. Tu página sigue activa. Ven a echar un vistazo.',
    heading_14: 'Ha pasado un tiempo, {name}. Nos encantaría verte de vuelta.',
    body_intro_14: 'Han pasado <span style="color:#c9a84c;font-weight:700;">{days}</span> días desde tu última visita. Tu página de aterrizaje sigue activa en <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — y sigue lista para traerte leads.',
    pre_cta_14: 'Solo 5 minutos en tu panel hoy pueden hacer la diferencia. Revisa tus estadísticas, comparte tu enlace y vuelve al juego.',
    while_away_label: 'MIENTRAS ESTABAS AUSENTE',
    new_leads_label: 'NUEVO(S) LEAD(S)',
    has_leads_body: '¡Personas se registraron a través de tu página mientras estabas ausente! Inicia sesión para ver quiénes son y hacer seguimiento — se verifican automáticamente cuando se aprueba el KYC.',
    no_leads_body: 'Tu página está lista y esperando. A veces todo lo que se necesita es una compartida para que las cosas se muevan de nuevo. Aquí hay un reto rápido: envía tu enlace a solo 3 personas hoy.',
    what_you_can_do: 'Esto es lo que puedes hacer ahora mismo:',
    tip_1: 'Revisa tus últimas estadísticas y leads',
    tip_2: 'Comparte tu enlace en un nuevo grupo o chat',
    tip_3: 'Actualiza tu bio o foto de perfil para un look fresco',
    two_minutes: 'Solo toma 2 minutos volver al juego.',
    cta: 'ABRIR MI PANEL',
    link_label: 'Tu enlace:',
    body_closing: 'Estamos construyendo algo grande juntos. No te pierdas el impulso.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject_7: 'Ваша страница всё ещё работает на вас, {name}',
    preview_7: 'Прошло некоторое время. Вот что происходило, пока вас не было.',
    heading_7: 'Привет, {name}, давно не виделись!',
    body_intro_7: 'Прошло <span style="color:#c9a84c;font-weight:700;">{days}</span> дней с тех пор, как вы последний раз заходили в дашборд. Не переживайте — ваша лендинг-страница была активна и работала всё это время.',
    subject_14: 'Мы скучаем по вам, {name} — в вашем дашборде есть обновления',
    preview_14: 'Прошло две недели. Ваша страница всё ещё активна. Загляните.',
    heading_14: 'Давно вас не было, {name}. Мы будем рады видеть вас снова.',
    body_intro_14: 'Прошло <span style="color:#c9a84c;font-weight:700;">{days}</span> дней с вашего последнего визита. Ваша лендинг-страница по-прежнему активна на <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — и она по-прежнему готова привлекать лидов для вас.',
    pre_cta_14: 'Всего 5 минут в дашборде сегодня могут изменить ситуацию. Проверьте статистику, поделитесь ссылкой и вернитесь в игру.',
    while_away_label: 'ПОКА ВАС НЕ БЫЛО',
    new_leads_label: 'НОВЫЙ(Е) ЛИД(Ы)',
    has_leads_body: 'Люди зарегистрировались через вашу страницу, пока вас не было! Войдите, чтобы увидеть, кто они, и связаться лично — они верифицируются автоматически после одобрения KYC.',
    no_leads_body: 'Ваша страница готова и ждёт. Иногда достаточно одного репоста, чтобы всё заработало снова. Вот быстрый вызов: отправьте свою ссылку всего 3 людям сегодня.',
    what_you_can_do: 'Вот что вы можете сделать прямо сейчас:',
    tip_1: 'Проверьте свою последнюю статистику и лидов',
    tip_2: 'Поделитесь ссылкой в новой группе или чате',
    tip_3: 'Обновите биографию или фото профиля для свежего вида',
    two_minutes: 'Нужно всего 2 минуты, чтобы вернуться в игру.',
    cta: 'ОТКРЫТЬ ДАШБОРД',
    link_label: 'Ваша ссылка:',
    body_closing: 'Мы строим что-то большое вместе. Не упустите импульс.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject_7: 'صفحتك لا تزال تعمل من أجلك، {name}',
    preview_7: 'مر وقت. إليك ما حدث أثناء غيابك.',
    heading_7: 'مرحباً {name}، مرّ وقت!',
    body_intro_7: 'مرّ <span style="color:#c9a84c;font-weight:700;">{days}</span> يوم منذ آخر مرة تفقدت فيها لوحة التحكم. لا تقلق — صفحتك كانت نشطة وتعمل طوال الوقت.',
    subject_14: 'نفتقدك، {name} — لوحة التحكم لديها تحديثات',
    preview_14: 'مرّ أسبوعان. صفحتك لا تزال نشطة. تعال وألقِ نظرة.',
    heading_14: 'مرّ وقت، {name}. نودّ أن نراك مجدداً.',
    body_intro_14: 'مرّ <span style="color:#c9a84c;font-weight:700;">{days}</span> يوم منذ آخر زيارة لك. صفحتك لا تزال نشطة على <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — ولا تزال جاهزة لجلب العملاء لك.',
    pre_cta_14: 'حتى 5 دقائق في لوحة التحكم اليوم يمكن أن تُحدث فرقاً. تفقد إحصائياتك، شارك رابطك، وعُد إلى اللعبة.',
    while_away_label: 'أثناء غيابك',
    new_leads_label: 'عميل/عملاء جدد',
    has_leads_body: 'أشخاص سجّلوا عبر صفحتك أثناء غيابك! سجّل دخولك لمعرفة من هم وتابع شخصياً — سيتم التحقق منهم تلقائياً بمجرد الموافقة على KYC.',
    no_leads_body: 'صفحتك جاهزة وبالانتظار. أحياناً كل ما يتطلبه الأمر هو مشاركة واحدة لبدء الأمور مجدداً. إليك تحدي سريع: أرسل رابطك لـ 3 أشخاص فقط اليوم.',
    what_you_can_do: 'إليك ما يمكنك فعله الآن:',
    tip_1: 'تفقد أحدث إحصائياتك وعملائك',
    tip_2: 'شارك رابطك في مجموعة أو محادثة جديدة',
    tip_3: 'حدّث سيرتك الذاتية أو صورة ملفك الشخصي لمظهر جديد',
    two_minutes: 'يستغرق الأمر دقيقتين فقط للعودة إلى اللعبة.',
    cta: 'فتح لوحة التحكم',
    link_label: 'رابطك:',
    body_closing: 'نحن نبني شيئاً كبيراً معاً. لا تفوّت الزخم.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject_7: 'Gumagana pa rin ang page mo para sa iyo, {name}',
    preview_7: 'Matagal ka nang wala. Ito ang nangyari habang wala ka.',
    heading_7: 'Hey {name}, matagal ka nang wala!',
    body_intro_7: '<span style="color:#c9a84c;font-weight:700;">{days}</span> araw na ang nakalipas mula nang huling check mo sa dashboard mo. Huwag mag-alala — ang landing page mo ay naging live at gumagana buong oras.',
    subject_14: 'Na-miss ka namin, {name} — may mga update sa dashboard mo',
    preview_14: 'Dalawang linggo na. Live pa rin ang page mo. Tingnan mo.',
    heading_14: 'Matagal ka nang wala, {name}. Gusto ka naming makitang bumalik.',
    body_intro_14: '<span style="color:#c9a84c;font-weight:700;">{days}</span> araw na mula nang huling bisita mo. Ang landing page mo ay live pa rin sa <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — at handa pa ring mag-bring in ng leads para sa iyo.',
    pre_cta_14: 'Kahit 5 minuto lang sa dashboard mo ngayon ay makakatulong. Check ang stats mo, i-share ang link mo, at bumalik sa laro.',
    while_away_label: 'HABANG WALA KA',
    new_leads_label: 'BAGONG LEAD(S)',
    has_leads_body: 'May nag-sign up sa page mo habang wala ka! Mag-log in para makita kung sino sila at mag-follow up — awtomatikong na-verify kapag naaprubahan ang KYC.',
    no_leads_body: 'Handa at naghihintay ang page mo. Minsan ang kailangan lang ay isang share para magsimula ulit. Eto ang isang mabilis na challenge: i-send ang link mo sa 3 tao lang ngayon.',
    what_you_can_do: 'Ito ang magagawa mo ngayon:',
    tip_1: 'Tingnan ang pinakabagong stats at leads mo',
    tip_2: 'I-share ang link mo sa bagong group o chat',
    tip_3: 'I-update ang bio o profile photo mo para sa bagong look',
    two_minutes: '2 minuto lang ang kailangan para bumalik sa laro.',
    cta: 'BUKSAN ANG DASHBOARD',
    link_label: 'Ang link mo:',
    body_closing: 'May ginagawa tayong malaki. Huwag palampasin ang momentum.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject_7: 'Sua página ainda está trabalhando para você, {name}',
    preview_7: 'Faz um tempo. Veja o que aconteceu enquanto você esteve fora.',
    heading_7: 'Ei {name}, faz um tempinho!',
    body_intro_7: 'Faz <span style="color:#c9a84c;font-weight:700;">{days}</span> dias desde que você checou seu painel pela última vez. Sem preocupações — sua landing page esteve ativa e funcionando o tempo todo.',
    subject_14: 'Sentimos sua falta, {name} — seu painel tem atualizações',
    preview_14: 'Já faz duas semanas. Sua página ainda está ativa. Venha dar uma olhada.',
    heading_14: 'Faz um tempo, {name}. Adoraríamos ver você de volta.',
    body_intro_14: 'Faz <span style="color:#c9a84c;font-weight:700;">{days}</span> dias desde sua última visita. Sua landing page ainda está ativa em <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — e ainda está pronta para trazer leads para você.',
    pre_cta_14: 'Apenas 5 minutos no seu painel hoje podem fazer a diferença. Confira suas estatísticas, compartilhe seu link e volte ao jogo.',
    while_away_label: 'ENQUANTO VOCÊ ESTAVA FORA',
    new_leads_label: 'NOVO(S) LEAD(S)',
    has_leads_body: 'Pessoas se cadastraram através da sua página enquanto você esteve fora! Faça login para ver quem são e fazer follow-up — eles são verificados automaticamente quando o KYC é aprovado.',
    no_leads_body: 'Sua página está pronta e esperando. Às vezes tudo que é preciso é um compartilhamento para recomeçar. Aqui vai um desafio rápido: envie seu link para apenas 3 pessoas hoje.',
    what_you_can_do: 'Aqui está o que você pode fazer agora:',
    tip_1: 'Confira suas últimas estatísticas e leads',
    tip_2: 'Compartilhe seu link em um novo grupo ou chat',
    tip_3: 'Atualize sua bio ou foto de perfil para um visual novo',
    two_minutes: 'Leva apenas 2 minutos para voltar ao jogo.',
    cta: 'ABRIR MEU PAINEL',
    link_label: 'Seu link:',
    body_closing: 'Estamos construindo algo grande juntos. Não perca o impulso.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject_7: 'หน้าเว็บของคุณยังคงทำงานเพื่อคุณ {name}',
    preview_7: 'ผ่านไปสักพักแล้ว นี่คือสิ่งที่เกิดขึ้นขณะที่คุณไม่อยู่',
    heading_7: 'สวัสดี {name} ไม่ได้เจอกันนานเลย!',
    body_intro_7: 'ผ่านมา <span style="color:#c9a84c;font-weight:700;">{days}</span> วันแล้วตั้งแต่คุณตรวจสอบแดชบอร์ดครั้งล่าสุด ไม่ต้องกังวล — แลนดิ้งเพจของคุณยังคงใช้งานได้และทำงานตลอดเวลา',
    subject_14: 'เราคิดถึงคุณ {name} — แดชบอร์ดของคุณมีอัปเดต',
    preview_14: 'ผ่านไปสองสัปดาห์แล้ว หน้าเว็บของคุณยังคงใช้งานอยู่ มาดูกัน',
    heading_14: 'ไม่ได้เจอกันนาน {name} เราอยากเห็นคุณกลับมา',
    body_intro_14: 'ผ่านมา <span style="color:#c9a84c;font-weight:700;">{days}</span> วันแล้วตั้งแต่การเยี่ยมชมครั้งล่าสุด แลนดิ้งเพจของคุณยังคงใช้งานอยู่ที่ <a href="https://www.primeverseaccess.com/{slug}" style="color:#c9a84c;text-decoration:none;font-weight:600;">primeverseaccess.com/{slug}</a> — และยังคงพร้อมนำ lead เข้ามาให้คุณ',
    pre_cta_14: 'แค่ 5 นาทีในแดชบอร์ดวันนี้ก็สร้างความแตกต่างได้ ตรวจสอบสถิติ แชร์ลิงก์ และกลับมาลุย',
    while_away_label: 'ขณะที่คุณไม่อยู่',
    new_leads_label: 'LEAD ใหม่',
    has_leads_body: 'มีคนลงทะเบียนผ่านหน้าเว็บของคุณขณะที่คุณไม่อยู่! เข้าสู่ระบบเพื่อดูว่าเป็นใครและติดตามส่วนตัว — จะได้รับการยืนยันอัตโนมัติเมื่อ KYC ได้รับการอนุมัติ',
    no_leads_body: 'หน้าเว็บของคุณพร้อมและรออยู่ บางครั้งแค่แชร์ครั้งเดียวก็เริ่มต้นใหม่ได้ นี่คือความท้าทายด่วน: ส่งลิงก์ของคุณให้แค่ 3 คนวันนี้',
    what_you_can_do: 'นี่คือสิ่งที่คุณสามารถทำได้ตอนนี้:',
    tip_1: 'ตรวจสอบสถิติและ lead ล่าสุดของคุณ',
    tip_2: 'แชร์ลิงก์ของคุณในกลุ่มหรือแชทใหม่',
    tip_3: 'อัปเดตประวัติหรือรูปโปรไฟล์เพื่อลุคใหม่',
    two_minutes: 'ใช้เวลาแค่ 2 นาทีเพื่อกลับมาลุย',
    cta: 'เปิดแดชบอร์ด',
    link_label: 'ลิงก์ของคุณ:',
    body_closing: 'เรากำลังสร้างสิ่งยิ่งใหญ่ด้วยกัน อย่าพลาดโมเมนตัม',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_name: '— ทีม 1Move',
  },
}

export interface InactiveNudgeEmailOptions {
  name: string
  slug: string
  days: number
  variant: InactiveNudgeVariant
  newLeadsSince: number
  lang?: string
}

export function buildInactiveNudgeEmail({ name, slug, days, variant, newLeadsSince, lang = 'en' }: InactiveNudgeEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'
  const isDay14 = variant === 'day14'

  const heading = (isDay14 ? t.heading_14 : t.heading_7).replace('{name}', name)
  const bodyIntro = (isDay14 ? t.body_intro_14 : t.body_intro_7)
    .replace('{days}', String(days))
    .replace(/\{slug\}/g, slug)
  const subject = (isDay14 ? t.subject_14 : t.subject_7).replace('{name}', name)
  const previewText = isDay14 ? t.preview_14 : t.preview_7

  const hasNewLeads = newLeadsSince > 0

  const leadSection = hasNewLeads
    ? `
<!-- While you were away label -->
<p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 12px;text-align:center;text-transform:uppercase;">${t.while_away_label}</p>

<!-- New leads count box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:2px solid #c9a84c;border-radius:12px;width:180px;">
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="color:#c9a84c;font-size:48px;font-weight:800;margin:0;line-height:1;">${newLeadsSince}</p>
            <p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">${t.new_leads_label}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.has_leads_body}</p>`
    : `<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.no_leads_body}</p>`

  const preCta14 = isDay14
    ? `<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.pre_cta_14}</p>`
    : ''

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:24px;margin:0 0 16px;text-align:center;font-weight:700;">${heading}</h1>

<!-- Body intro -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${bodyIntro}</p>

${leadSection}

<!-- What you can do -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};">${t.what_you_can_do}</p>

<!-- Tips -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td style="padding:6px 0;color:#E0E0E0;font-size:15px;line-height:1.6;text-align:${textAlign};">
      <span style="color:#c9a84c;font-weight:700;">${isRtl ? '←' : '→'}</span>&nbsp; ${t.tip_1}
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#E0E0E0;font-size:15px;line-height:1.6;text-align:${textAlign};">
      <span style="color:#c9a84c;font-weight:700;">${isRtl ? '←' : '→'}</span>&nbsp; ${t.tip_2}
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#E0E0E0;font-size:15px;line-height:1.6;text-align:${textAlign};">
      <span style="color:#c9a84c;font-weight:700;">${isRtl ? '←' : '→'}</span>&nbsp; ${t.tip_3}
    </td>
  </tr>
</table>

<!-- Two minutes -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.two_minutes}</p>

${preCta14}

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

<!-- Link display -->
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
    previewText,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject }
}
