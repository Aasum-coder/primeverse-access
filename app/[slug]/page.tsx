'use client'

import { useEffect, useState, use, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

function parseProfileImage(value: string | null) {
  if (!value) return { url: '', x: 50, y: 50 }
  try {
    const p = JSON.parse(value)
    if (p && typeof p.url === 'string') return { url: p.url, x: p.x ?? 50, y: p.y ?? 50 }
  } catch {}
  return { url: value, x: 50, y: 50 }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LANGS = {
  en: { flag: 'GB', label: 'English' },
  no: { flag: 'NO', label: 'Norsk' },
  sv: { flag: 'SE', label: 'Svenska' },
  es: { flag: 'ES', label: 'Español' },
  ru: { flag: 'RU', label: 'Русский' },
  ar: { flag: 'SA', label: 'العربية' },
}

type LangKey = keyof typeof LANGS

const T: Record<LangKey, Record<string, string>> = {
  en: {
    nav_cta: 'Get Access Now',
    hero_tag: '1Move × PrimeVerse · Education Partner',
    hero_h1a: 'Get Access with',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: "Your gateway to the world's best trading community — guided by",
    hero_sub2: ', your dedicated education partner.',
    hero_btn: 'Get Access Now',
    scroll: 'Scroll for more',
    about_label: 'About PrimeVerse',
    about_h2: 'Education-First Trading Ecosystem',
    about_p1: 'PrimeVerse is a premium, compliance-first trading education platform built for serious participants. We provide structured learning paths, professional-grade tools, and curated broker access — all within one unified ecosystem.',
    about_p2: 'Members gain access to live sessions with experienced traders, proprietary educational frameworks, and a regulated environment designed to develop long-term skill, not short-term speculation.',
    about_p3: 'Our community is built on transparency, education, and sustainable growth — positioned for traders who take their craft seriously.',
    stat1: 'Live Community', stat2: 'Education', stat3: 'Compliant',
    dist_badge: '1Move Academy Representative',
    process_label: 'Process',
    process_h2: 'How It Works',
    process_p: 'Five clear steps to activate your PrimeVerse membership through the 1Move verified IB link.',
    s1t: 'Register Your Interest', s1d: 'Click Get Access Now and enter your name and email to get started.',
    s2t: 'Open Broker Account', s2d: "You'll be redirected to the official broker registration page via our verified IB link.",
    s3t: 'Complete KYC', s3d: 'Verify your identity to activate your account and meet compliance requirements.',
    s4t: 'Save Your UID', s4d: 'After registration, note your unique broker User ID from your account dashboard.',
    s5t: 'Return & Submit UID', s5d: 'Come back to this page and submit your UID below to complete community verification.',
    uid_label: 'Step 5', uid_h2: 'Submit Your UID', uid_p: 'Already registered with the broker? Submit your UID here to begin verification.',
    uid_card_h: 'Submit Your UID', uid_card_p: 'Enter your full name, email and broker UID below.',
    f_name: 'Full Name', f_email: 'Email Address', f_uid: 'Broker UID',
    f_name_ph: 'Your full name', f_email_ph: 'your@email.com', f_uid_ph: 'e.g. 1234567',
    uid_btn: 'Request Verification',
    uid_success: 'Request received.',
    uid_success2: 'will review and approve your access shortly. Please allow up to 24 hours.',
    modal_h: 'Get Access Now', modal_p: 'Complete your details to proceed to broker registration.',
    chk1: 'I accept the Terms & Conditions',
    chk2: 'I have read and understand the full risk disclaimer',
    chk3: 'I consent to receiving community updates and educational content by email',
    modal_btn: 'Confirm & Proceed to Registration',
    tab1: '1. Register', tab2: '2. Broker', tab3: '3. Submit UID',
    broker_h: 'Opening Broker Registration…',
    broker_p: 'A new tab has opened with the broker registration page. Complete your registration there, then come back here.',
    broker_btn: 'I have registered — Submit my UID',
    broker_fallback: "Tab did not open?",
    risk_label: 'Risk Disclaimer',
    risk_text: 'Trading financial instruments including forex, CFDs, and derivatives carries a high level of risk and may not be suitable for all investors. You may lose more than your initial investment. Past performance is not indicative of future results. This platform is for educational purposes only and does not constitute financial advice.',
    legal_label: 'Privacy & Legal',
    cookie_title: 'Cookie Notice:',
    cookie_text: 'This site uses essential session cookies to maintain core functionality. No tracking or third-party advertising cookies are deployed.',
    ip_title: 'IP Logging:',
    ip_text: 'Visitor IP addresses and form submission timestamps are logged for fraud prevention and security purposes.',
    footer_rights: 'All rights reserved.',
  },
  no: {
    nav_cta: 'Få tilgang nå',
    hero_tag: '1Move × PrimeVerse · Utdanningspartner',
    hero_h1a: 'Få tilgang med',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: 'Din inngang til verdens beste tradingmiljø — veiledet av',
    hero_sub2: ', din dedikerte utdanningspartner.',
    hero_btn: 'Få tilgang nå',
    scroll: 'Scroll for mer',
    about_label: 'Om PrimeVerse',
    about_h2: 'Utdanning-først trading-økosystem',
    about_p1: 'PrimeVerse er en premium trading-utdanningsplattform bygget for seriøse deltakere. Vi tilbyr strukturerte læringsveier, verktøy av profesjonell kvalitet og kurert meglertilgang — alt i ett samlet økosystem.',
    about_p2: 'Medlemmer får tilgang til livesesjoner med erfarne tradere, proprietære utdanningsrammeverk og et regulert miljø designet for å utvikle langsiktige ferdigheter.',
    about_p3: 'Vårt fellesskap er bygget på åpenhet, utdanning og bærekraftig vekst — for tradere som tar håndverket sitt seriøst.',
    stat1: 'Live fellesskap', stat2: 'Utdanning', stat3: 'Compliant',
    dist_badge: '1Move Academy-representant',
    process_label: 'Prosess',
    process_h2: 'Slik fungerer det',
    process_p: 'Fem klare steg for å aktivere PrimeVerse-medlemskapet ditt via 1Move-linken.',
    s1t: 'Registrer interessen din', s1d: 'Klikk "Få tilgang nå" og skriv inn navn og e-post.',
    s2t: 'Åpne meglerkonto', s2d: 'Du videresendes til den offisielle meglerregistreringssiden via vår verifiserte IB-link.',
    s3t: 'Fullfør KYC', s3d: 'Bekreft identiteten din for å aktivere kontoen og oppfylle krav.',
    s4t: 'Lagre UID-en din', s4d: 'Etter registrering, noter din unike bruker-ID fra kontodashbordet.',
    s5t: 'Kom tilbake og send inn UID', s5d: 'Kom tilbake til denne siden og send inn UID-en din nedenfor.',
    uid_label: 'Steg 5', uid_h2: 'Send inn UID-en din', uid_p: 'Allerede registrert hos megleren? Send inn UID-en din her.',
    uid_card_h: 'Send inn UID', uid_card_p: 'Skriv inn fullt navn, e-post og megler-UID nedenfor.',
    f_name: 'Fullt navn', f_email: 'E-postadresse', f_uid: 'Megler-UID',
    f_name_ph: 'Ditt fulle navn', f_email_ph: 'din@epost.com', f_uid_ph: 'f.eks. 1234567',
    uid_btn: 'Be om verifisering',
    uid_success: 'Forespørsel mottatt.',
    uid_success2: 'vil gjennomgå og godkjenne tilgangen din snart. Venligst vent opptil 24 timer.',
    modal_h: 'Få tilgang nå', modal_p: 'Fyll inn detaljene dine for å gå til meglerregistrering.',
    chk1: 'Jeg aksepterer vilkår og betingelser',
    chk2: 'Jeg har lest og forstår risikoansvarsfraskrivelsen',
    chk3: 'Jeg samtykker til å motta fellesskapsoppdateringer på e-post',
    modal_btn: 'Bekreft og gå til registrering',
    tab1: '1. Registrer', tab2: '2. Megler', tab3: '3. Send UID',
    broker_h: 'Åpner meglerregistrering…',
    broker_p: 'En ny fane har åpnet seg. Fullfør registreringen der, og kom tilbake hit.',
    broker_btn: 'Jeg har registrert meg — Send inn UID',
    broker_fallback: 'Fanen åpnet seg ikke?',
    risk_label: 'Risikofraskrivelse',
    risk_text: 'Trading med finansielle instrumenter inkludert forex, CFD-er og derivater innebærer høy risiko og er kanskje ikke egnet for alle investorer. Du kan tape mer enn din opprinnelige investering. Tidligere resultater er ikke en indikasjon på fremtidige resultater. Denne plattformen er kun for utdanningsformål og utgjør ikke finansiell rådgivning.',
    legal_label: 'Personvern & juss',
    cookie_title: 'Informasjonskapsler:',
    cookie_text: 'Denne siden bruker essensielle informasjonskapsler. Ingen sporing eller tredjeparts reklamecookies brukes.',
    ip_title: 'IP-logging:',
    ip_text: 'Besøkendes IP-adresser logges for svindelforebygging og sikkerhet.',
    footer_rights: 'Alle rettigheter forbeholdt.',
  },
  sv: {
    nav_cta: 'Få tillgång nu',
    hero_tag: '1Move × PrimeVerse · Utbildningspartner',
    hero_h1a: 'Få tillgång med',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: 'Din ingång till världens bästa tradingmiljö — guidad av',
    hero_sub2: ', din dedikerade utbildningspartner.',
    hero_btn: 'Få tillgång nu',
    scroll: 'Scrolla för mer',
    about_label: 'Om PrimeVerse',
    about_h2: 'Utbildning-först trading-ekosystem',
    about_p1: 'PrimeVerse är en premium tradingutbildningsplattform byggd för seriösa deltagare. Vi erbjuder strukturerade inlärningsvägar, verktyg av professionell kvalitet och kurerad mäklartillgång.',
    about_p2: 'Medlemmar får tillgång till livesessioner med erfarna traders, proprietära utbildningsramverk och en reglerad miljö.',
    about_p3: 'Vår gemenskap är byggd på transparens, utbildning och hållbar tillväxt.',
    stat1: 'Live-gemenskap', stat2: 'Utbildning', stat3: 'Compliant',
    dist_badge: '1Move Academy-representant',
    process_label: 'Process',
    process_h2: 'Hur det fungerar',
    process_p: 'Fem tydliga steg för att aktivera ditt PrimeVerse-medlemskap via 1Move-länken.',
    s1t: 'Registrera ditt intresse', s1d: 'Klicka på "Få tillgång nu" och ange ditt namn och e-post.',
    s2t: 'Öppna mäklarkonto', s2d: 'Du omdirigeras till den officiella mäklarregistreringssidan.',
    s3t: 'Slutför KYC', s3d: 'Verifiera din identitet för att aktivera ditt konto.',
    s4t: 'Spara ditt UID', s4d: 'Anteckna ditt unika mäklar-användar-ID från kontodashboarden.',
    s5t: 'Återvänd och skicka in UID', s5d: 'Kom tillbaka till den här sidan och skicka in ditt UID.',
    uid_label: 'Steg 5', uid_h2: 'Skicka in ditt UID', uid_p: 'Redan registrerad hos mäklaren? Skicka in ditt UID här.',
    uid_card_h: 'Skicka in UID', uid_card_p: 'Ange ditt fullständiga namn, e-post och mäklar-UID nedan.',
    f_name: 'Fullständigt namn', f_email: 'E-postadress', f_uid: 'Mäklar-UID',
    f_name_ph: 'Ditt fullständiga namn', f_email_ph: 'din@epost.com', f_uid_ph: 't.ex. 1234567',
    uid_btn: 'Begär verifiering',
    uid_success: 'Begäran mottagen.',
    uid_success2: 'kommer att granska och godkänna din åtkomst snart. Vänta upp till 24 timmar.',
    modal_h: 'Få tillgång nu', modal_p: 'Fyll i dina uppgifter för att gå vidare till mäklarregistrering.',
    chk1: 'Jag accepterar villkoren',
    chk2: 'Jag har läst och förstår riskfriskrivningen',
    chk3: 'Jag samtycker till att ta emot uppdateringar via e-post',
    modal_btn: 'Bekräfta och fortsätt till registrering',
    tab1: '1. Registrera', tab2: '2. Mäklare', tab3: '3. Skicka UID',
    broker_h: 'Öppnar mäklarregistrering…',
    broker_p: 'En ny flik har öppnats. Slutför registreringen där och kom sedan tillbaka.',
    broker_btn: 'Jag har registrerat mig — Skicka in UID',
    broker_fallback: 'Fliken öppnades inte?',
    risk_label: 'Riskfriskrivning',
    risk_text: 'Handel med finansiella instrument innefattar hög risk och kan inte vara lämplig för alla investerare. Du kan förlora mer än din ursprungliga investering. Tidigare resultat är inte en indikation på framtida resultat.',
    legal_label: 'Integritet & juridik',
    cookie_title: 'Cookies:',
    cookie_text: 'Denna webbplats använder viktiga sessionscookies. Inga spårnings- eller reklamcookies används.',
    ip_title: 'IP-loggning:',
    ip_text: 'Besökarens IP-adresser loggas för bedrägeriförebyggande och säkerhet.',
    footer_rights: 'Alla rättigheter förbehållna.',
  },
  es: {
    nav_cta: 'Obtener acceso',
    hero_tag: '1Move × PrimeVerse · Socio Educativo',
    hero_h1a: 'Obtén acceso con',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: 'Tu puerta de entrada a la mejor comunidad de trading del mundo — guiada por',
    hero_sub2: ', tu socio educativo dedicado.',
    hero_btn: 'Obtener acceso ahora',
    scroll: 'Desplázate para más',
    about_label: 'Acerca de PrimeVerse',
    about_h2: 'Ecosistema de Trading con Educación Primero',
    about_p1: 'PrimeVerse es una plataforma de educación en trading premium construida para participantes serios. Ofrecemos rutas de aprendizaje estructuradas, herramientas de grado profesional y acceso a brókers seleccionados.',
    about_p2: 'Los miembros tienen acceso a sesiones en vivo con traders experimentados y marcos educativos propietarios.',
    about_p3: 'Nuestra comunidad está construida sobre transparencia, educación y crecimiento sostenible.',
    stat1: 'Comunidad en vivo', stat2: 'Educación', stat3: 'Cumplimiento',
    dist_badge: 'Representante de 1Move Academy',
    process_label: 'Proceso',
    process_h2: 'Cómo funciona',
    process_p: 'Cinco pasos claros para activar tu membresía de PrimeVerse a través del enlace IB verificado de 1Move.',
    s1t: 'Registra tu interés', s1d: 'Haz clic en "Obtener acceso" e ingresa tu nombre y correo.',
    s2t: 'Abre una cuenta de bróker', s2d: 'Serás redirigido a la página oficial de registro del bróker.',
    s3t: 'Completa el KYC', s3d: 'Verifica tu identidad para activar tu cuenta.',
    s4t: 'Guarda tu UID', s4d: 'Después del registro, anota tu ID de usuario único del bróker.',
    s5t: 'Regresa y envía tu UID', s5d: 'Vuelve a esta página y envía tu UID abajo para completar la verificación.',
    uid_label: 'Paso 5', uid_h2: 'Envía tu UID', uid_p: '¿Ya registrado con el bróker? Envía tu UID aquí.',
    uid_card_h: 'Enviar UID', uid_card_p: 'Ingresa tu nombre completo, correo y UID del bróker abajo.',
    f_name: 'Nombre completo', f_email: 'Correo electrónico', f_uid: 'UID del bróker',
    f_name_ph: 'Tu nombre completo', f_email_ph: 'tu@correo.com', f_uid_ph: 'ej. 1234567',
    uid_btn: 'Solicitar verificación',
    uid_success: 'Solicitud recibida.',
    uid_success2: 'revisará y aprobará tu acceso en breve. Por favor espera hasta 24 horas.',
    modal_h: 'Obtener acceso ahora', modal_p: 'Completa tus datos para proceder al registro del bróker.',
    chk1: 'Acepto los Términos y Condiciones',
    chk2: 'He leído y entiendo el descargo de responsabilidad de riesgo',
    chk3: 'Consiento recibir actualizaciones de la comunidad por correo',
    modal_btn: 'Confirmar y proceder al registro',
    tab1: '1. Registrar', tab2: '2. Bróker', tab3: '3. Enviar UID',
    broker_h: 'Abriendo registro del bróker…',
    broker_p: 'Se ha abierto una nueva pestaña. Completa el registro allí y luego regresa aquí.',
    broker_btn: 'Me he registrado — Enviar UID',
    broker_fallback: '¿No se abrió la pestaña?',
    risk_label: 'Descargo de riesgo',
    risk_text: 'El comercio de instrumentos financieros conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puede perder más de su inversión inicial. El rendimiento pasado no indica resultados futuros.',
    legal_label: 'Privacidad y legal',
    cookie_title: 'Aviso de cookies:',
    cookie_text: 'Este sitio utiliza cookies de sesión esenciales. No se utilizan cookies de seguimiento ni publicitarias.',
    ip_title: 'Registro de IP:',
    ip_text: 'Las direcciones IP de los visitantes se registran con fines de seguridad y prevención del fraude.',
    footer_rights: 'Todos los derechos reservados.',
  },
  ru: {
    nav_cta: 'Получить доступ',
    hero_tag: '1Move × PrimeVerse · Образовательный партнёр',
    hero_h1a: 'Получить доступ с',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: 'Ваш путь в лучшее трейдинговое сообщество мира — под руководством',
    hero_sub2: ', вашего образовательного партнёра.',
    hero_btn: 'Получить доступ',
    scroll: 'Прокрутите вниз',
    about_label: 'О PrimeVerse',
    about_h2: 'Торговая экосистема с приоритетом обучения',
    about_p1: 'PrimeVerse — это премиальная платформа для обучения трейдингу. Мы предоставляем структурированные пути обучения, профессиональные инструменты и доступ к проверенным брокерам.',
    about_p2: 'Члены получают доступ к живым сессиям с опытными трейдерами и проприетарным образовательным программам.',
    about_p3: 'Наше сообщество построено на прозрачности, образовании и устойчивом росте.',
    stat1: 'Живое сообщество', stat2: 'Образование', stat3: 'Соответствие',
    dist_badge: 'Представитель 1Move Academy',
    process_label: 'Процесс',
    process_h2: 'Как это работает',
    process_p: 'Пять чётких шагов для активации членства PrimeVerse через верифицированную ссылку 1Move.',
    s1t: 'Зарегистрируйте интерес', s1d: 'Нажмите "Получить доступ" и введите имя и email.',
    s2t: 'Откройте счёт у брокера', s2d: 'Вы будете перенаправлены на официальную страницу регистрации брокера.',
    s3t: 'Пройдите KYC', s3d: 'Подтвердите личность для активации аккаунта.',
    s4t: 'Сохраните UID', s4d: 'После регистрации запишите ваш уникальный ID пользователя брокера.',
    s5t: 'Вернитесь и отправьте UID', s5d: 'Вернитесь на эту страницу и отправьте UID ниже.',
    uid_label: 'Шаг 5', uid_h2: 'Отправьте ваш UID', uid_p: 'Уже зарегистрированы у брокера? Отправьте UID здесь.',
    uid_card_h: 'Отправить UID', uid_card_p: 'Введите ваше полное имя, email и UID брокера ниже.',
    f_name: 'Полное имя', f_email: 'Email адрес', f_uid: 'UID брокера',
    f_name_ph: 'Ваше полное имя', f_email_ph: 'ваш@email.com', f_uid_ph: 'напр. 1234567',
    uid_btn: 'Запросить верификацию',
    uid_success: 'Запрос получен.',
    uid_success2: 'проверит и одобрит ваш доступ в ближайшее время. Ожидайте до 24 часов.',
    modal_h: 'Получить доступ', modal_p: 'Заполните данные для перехода к регистрации брокера.',
    chk1: 'Я принимаю Условия и положения',
    chk2: 'Я прочитал и понимаю отказ от ответственности за риски',
    chk3: 'Я согласен получать обновления сообщества по email',
    modal_btn: 'Подтвердить и перейти к регистрации',
    tab1: '1. Регистрация', tab2: '2. Брокер', tab3: '3. Отправить UID',
    broker_h: 'Открытие регистрации брокера…',
    broker_p: 'Открылась новая вкладка. Завершите регистрацию там и вернитесь сюда.',
    broker_btn: 'Я зарегистрировался — Отправить UID',
    broker_fallback: 'Вкладка не открылась?',
    risk_label: 'Предупреждение о рисках',
    risk_text: 'Торговля финансовыми инструментами сопряжена с высоким уровнем риска и может подходить не всем инвесторам. Вы можете потерять больше первоначальных вложений. Прошлые результаты не гарантируют будущих.',
    legal_label: 'Конфиденциальность и правовые вопросы',
    cookie_title: 'Уведомление о cookies:',
    cookie_text: 'Сайт использует основные файлы cookie сессии. Отслеживающие или рекламные cookie не используются.',
    ip_title: 'Логирование IP:',
    ip_text: 'IP-адреса посетителей регистрируются в целях безопасности и предотвращения мошенничества.',
    footer_rights: 'Все права защищены.',
  },
  ar: {
    nav_cta: 'احصل على الوصول الآن',
    hero_tag: '1Move × PrimeVerse · شريك التعليم',
    hero_h1a: 'احصل على الوصول مع',
    hero_h1b: '1Move × PrimeVerse',
    hero_sub: 'بوابتك إلى أفضل مجتمع تداول في العالم — بإرشاد من',
    hero_sub2: '، شريكك التعليمي المخصص.',
    hero_btn: 'احصل على الوصول الآن',
    scroll: 'مرر لأسفل لمزيد',
    about_label: 'حول PrimeVerse',
    about_h2: 'نظام بيئي للتداول يضع التعليم أولاً',
    about_p1: 'PrimeVerse منصة تعليمية متميزة للتداول مبنية للمشاركين الجادين. نوفر مسارات تعليمية منظمة وأدوات احترافية ووصولاً منسقاً للوسطاء.',
    about_p2: 'يحصل الأعضاء على وصول إلى جلسات مباشرة مع متداولين ذوي خبرة وأطر تعليمية خاصة.',
    about_p3: 'مجتمعنا مبني على الشفافية والتعليم والنمو المستدام.',
    stat1: 'مجتمع حي', stat2: 'تعليم', stat3: 'متوافق',
    dist_badge: 'ممثل 1Move Academy',
    process_label: 'العملية',
    process_h2: 'كيف يعمل',
    process_p: 'خمس خطوات واضحة لتفعيل عضويتك في PrimeVerse.',
    s1t: 'سجّل اهتمامك', s1d: 'انقر على "احصل على الوصول" وأدخل اسمك وبريدك الإلكتروني.',
    s2t: 'افتح حساباً لدى الوسيط', s2d: 'سيتم توجيهك إلى صفحة التسجيل الرسمية للوسيط.',
    s3t: 'أكمل KYC', s3d: 'تحقق من هويتك لتفعيل حسابك.',
    s4t: 'احفظ UID الخاص بك', s4d: 'بعد التسجيل، سجّل معرف المستخدم الفريد من لوحة الوسيط.',
    s5t: 'عُد وأرسل UID', s5d: 'عُد إلى هذه الصفحة وأرسل UID الخاص بك أدناه.',
    uid_label: 'الخطوة 5', uid_h2: 'أرسل UID الخاص بك', uid_p: 'هل أنت مسجل بالفعل لدى الوسيط؟ أرسل UID هنا.',
    uid_card_h: 'إرسال UID', uid_card_p: 'أدخل اسمك الكامل والبريد الإلكتروني وUID الوسيط أدناه.',
    f_name: 'الاسم الكامل', f_email: 'البريد الإلكتروني', f_uid: 'UID الوسيط',
    f_name_ph: 'اسمك الكامل', f_email_ph: 'بريدك@example.com', f_uid_ph: 'مثال: 1234567',
    uid_btn: 'طلب التحقق',
    uid_success: 'تم استلام الطلب.',
    uid_success2: 'سيراجع ويوافق على وصولك قريباً. يرجى الانتظار حتى 24 ساعة.',
    modal_h: 'احصل على الوصول الآن', modal_p: 'أكمل بياناتك للمتابعة إلى تسجيل الوسيط.',
    chk1: 'أوافق على الشروط والأحكام',
    chk2: 'قرأت وأفهم إخلاء المسؤولية عن المخاطر',
    chk3: 'أوافق على تلقي تحديثات المجتمع عبر البريد الإلكتروني',
    modal_btn: 'تأكيد والمتابعة للتسجيل',
    tab1: '١. التسجيل', tab2: '٢. الوسيط', tab3: '٣. إرسال UID',
    broker_h: 'فتح تسجيل الوسيط…',
    broker_p: 'تم فتح علامة تبويب جديدة. أكمل التسجيل هناك ثم عُد هنا.',
    broker_btn: 'لقد سجلت — إرسال UID',
    broker_fallback: 'لم تفتح علامة التبويب؟',
    risk_label: 'إخلاء مسؤولية المخاطر',
    risk_text: 'ينطوي تداول الأدوات المالية على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لجميع المستثمرين. قد تخسر أكثر من استثمارك الأولي. الأداء السابق لا يشير إلى النتائج المستقبلية.',
    legal_label: 'الخصوصية والقانون',
    cookie_title: 'إشعار ملفات تعريف الارتباط:',
    cookie_text: 'يستخدم هذا الموقع ملفات تعريف الارتباط الأساسية للجلسة. لا يتم نشر ملفات تعريف الارتباط للتتبع أو الإعلانات.',
    ip_title: 'تسجيل IP:',
    ip_text: 'يتم تسجيل عناوين IP الخاصة بالزوار لأغراض أمنية ومنع الاحتيال.',
    footer_rights: 'جميع الحقوق محفوظة.',
  },
}

export default function DistributorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [distributor, setDistributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<'register' | 'broker' | 'uid'>('register')
  const [form, setForm] = useState({ name: '', email: '' })
  const [uidForm, setUidForm] = useState({ name: '', email: '', uid: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lang, setLang] = useState<LangKey>('en')
  const [langOpen, setLangOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const t = T[lang]
  const isRtl = lang === 'ar'

  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDistributor = async () => {
      const { data: rows, error } = await supabase.from('distributors').select('*').eq('slug', slug).limit(1)
      const data = rows?.[0] ?? null
      if (error || !data || !data.id) {
        console.error('[slug page] Supabase error:', error)
        setDbError(error?.message || 'No data returned')
        setNotFound(true)
        setLoading(false)
        return
      }
      // Track page view
      await supabase.from('page_views').insert({ distributor_id: data.id, slug: data.slug })
        .then(() => {}) // fire-and-forget, ignore errors
      setDistributor(data)
      setLoading(false)
    }
    fetchDistributor()
  }, [slug])

  // Focus the close button when modal opens; restore focus on close
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modalOpen) {
      closeButtonRef.current?.focus()
    }
  }, [modalOpen])

  // Trap focus inside modal when open
  useEffect(() => {
    if (!modalOpen) return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
      }
      if (e.key === 'Escape') { setModalOpen(false); setStep('register') }
    }
    modal.addEventListener('keydown', trap)
    return () => modal.removeEventListener('keydown', trap)
  }, [modalOpen])

  const handleGetAccess = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('broker')
    const referralLink = dist?.referral_link || 'https://puvip.co/la-partners/Primesync'
    setTimeout(() => { window.open(referralLink, '_blank') }, 1200)
  }

  const handleUidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: uidForm.name, email: uidForm.email, uid: uidForm.uid, uid_verified: false, referral_link_used: slug })
    if (error) { alert('Something went wrong. Please try again.'); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName: uidForm.name, leadEmail: uidForm.email, leadUid: uidForm.uid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) return <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#c9a84c', fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: '0.2em' }}>Loading…</div></div>
  if (notFound) return <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#7a7a72', textAlign: 'center' }}><div style={{ color: '#c9a84c', fontSize: '2rem', marginBottom: '1rem' }}>✦</div><p>Page not found.</p>{dbError && <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', color: '#ff6b6b', background: '#1a0000', padding: '0.5rem 1rem', borderRadius: 4, maxWidth: 360, wordBreak: 'break-all' }}>Debug: {dbError}</p>}<p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#888', maxWidth: 300 }}>Slug: {slug}</p></div></div>

  const dist = distributor

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{--black:#080808;--deep:#0f0f0f;--card:#141414;--border:#222;--border2:#2c2c2c;--gold:#c9a84c;--gold-l:#dfc278;--gold-d:rgba(201,168,76,.12);--gold-b:rgba(201,168,76,.25);--white:#f0ede8;--grey:#7a7a72;--r:4px}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:var(--black);color:var(--white);font-family:'DM Sans',sans-serif;font-weight:300;line-height:1.7;overflow-x:hidden}
        a{color:var(--gold);text-decoration:none}
        img{max-width:100%;display:block}
        nav{position:fixed;top:0;left:0;right:0;z-index:500;display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;height:70px;background:rgba(8,8,8,.93);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
        .nav-brand-text{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:400;letter-spacing:.06em;color:var(--gold)}
        .nav-brand-text em{font-style:normal;color:var(--white);opacity:.55}
        .btn-nav{background:transparent;border:1px solid var(--border2);color:var(--grey);font-family:'DM Sans',sans-serif;font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;padding:.46rem 1.1rem;cursor:pointer;border-radius:var(--r);transition:border-color .2s,color .2s}
        .btn-nav:hover{border-color:var(--gold);color:var(--gold)}
        .lang-wrap{position:relative}
        .lang-btn{background:transparent;border:1px solid var(--border2);color:var(--grey);font-family:'DM Sans',sans-serif;font-size:.78rem;padding:.46rem 1rem;cursor:pointer;border-radius:var(--r);display:flex;align-items:center;gap:.5rem;transition:border-color .2s,color .2s;white-space:nowrap}
        .lang-btn:hover{border-color:var(--gold);color:var(--gold)}
        .lang-drop{position:absolute;top:calc(100% + 8px);right:0;background:var(--card);border:1px solid var(--border2);border-radius:var(--r);min-width:160px;overflow:hidden;display:none;box-shadow:0 16px 48px rgba(0,0,0,.65);z-index:600}
        .lang-drop.open{display:block}
        .lang-drop button{display:flex;align-items:center;gap:.7rem;width:100%;background:none;border:none;color:var(--white);font-family:'DM Sans',sans-serif;font-size:.82rem;text-align:left;padding:.65rem 1.1rem;cursor:pointer;transition:background .15s,color .15s}
        .lang-drop button:hover{background:var(--gold-d);color:var(--gold)}
        .lang-drop button.active{color:var(--gold)}
        .flag-badge{display:inline-block;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);color:var(--gold);font-size:.6rem;font-weight:700;letter-spacing:.08em;padding:.15rem .4rem;border-radius:2px;font-family:'DM Sans',sans-serif}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 5rem;position:relative;overflow:hidden}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(201,168,76,.07) 0%,transparent 70%);pointer-events:none}
        .hero-line{width:1px;height:56px;background:linear-gradient(to bottom,transparent,var(--gold),transparent);margin:0 auto 2.2rem}
        .hero-tag{font-size:.68rem;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1.4rem}
        .hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.6rem,6.5vw,5rem);font-weight:300;line-height:1.06;margin-bottom:1.4rem;max-width:820px}
        .hero-h1 em{font-style:italic;color:var(--gold-l)}
        .hero-sub{font-size:clamp(.95rem,2vw,1.08rem);color:var(--grey);max-width:500px;margin:0 auto 2.8rem}
        .hero-sub strong{color:var(--white);font-weight:500}
        .btn-gold{display:inline-block;background:linear-gradient(135deg,#b8922a 0%,#e8c96a 25%,#c9a84c 45%,#f0d878 55%,#c9a84c 70%,#a07828 85%,#d4aa50 100%);background-size:200% 200%;color:var(--black);font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:.95rem 2.8rem;border:none;cursor:pointer;border-radius:var(--r);transition:background-position .4s ease,transform .18s,box-shadow .3s;box-shadow:0 2px 8px rgba(201,168,76,.25),inset 0 1px 0 rgba(255,255,255,.15);position:relative;overflow:hidden}
        .btn-gold::after{content:'';position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .5s ease}
        .btn-gold:hover{background-position:100% 100%;transform:translateY(-2px);box-shadow:0 6px 24px rgba(201,168,76,.4)}
        .btn-gold:hover::after{left:125%}
        .scroll-hint{margin-top:2rem;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--grey);display:flex;flex-direction:column;align-items:center;gap:.5rem;opacity:.5}
        .scroll-tick{width:1px;height:36px;background:linear-gradient(to bottom,var(--gold),transparent);animation:tick 2s ease-in-out infinite}
        @keyframes tick{0%,100%{opacity:.35}50%{opacity:1}}
        section{padding:5.5rem 2rem}
        .wrap{max-width:940px;margin:0 auto}
        .wrap-sm{max-width:640px;margin:0 auto}
        .sec-label{font-size:.68rem;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:.9rem;display:flex;align-items:center;gap:.8rem}
        .sec-label::after{content:'';height:1px;width:50px;background:var(--border2)}
        .sec-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4.5vw,3rem);font-weight:300;line-height:1.12;margin-bottom:1.4rem}
        .sec-p{color:var(--grey);font-size:1rem;max-width:520px;line-height:1.8}
        .about{background:var(--deep)}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
        .about-body{color:var(--grey);line-height:1.85;font-size:.97rem}
        .about-body p+p{margin-top:1.1rem}
        .about-stats{display:flex;gap:2rem;margin-top:2.2rem;flex-wrap:wrap}
        .stat span{font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:300;color:var(--gold);display:block;line-height:1}
        .stat small{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--grey);display:block;margin-top:.25rem}
        .dist-card{background:var(--card);border:1px solid var(--border2);border-radius:10px;padding:2.4rem;position:relative;overflow:hidden}
        .dist-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--gold),transparent)}
        .dist-portrait{width:100%;max-width:240px;aspect-ratio:3/4;object-fit:cover;object-position:top;border-radius:6px;border:1px solid var(--border2);margin:0 auto 1.8rem}
        .dist-badge{display:inline-block;background:var(--gold-d);border:1px solid var(--gold-b);color:var(--gold);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .9rem;border-radius:2px;margin-bottom:1.4rem}
        .dist-quote{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;color:var(--white);line-height:1.7;margin-bottom:1.2rem;white-space:pre-line}
        .dist-author{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
        .steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:1.3rem;margin-top:3rem;perspective:1200px}
        .step{background:var(--card);border:1px solid var(--border);border-radius:6px;padding:1.8rem 1.4rem;position:relative;transition:border-color .25s,box-shadow .25s;overflow:hidden;cursor:default}
        .step:hover{border-color:var(--gold-b);box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 30px rgba(201,168,76,.08)}
        .step-shine{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .25s;z-index:2;border-radius:6px}
        .step-n{font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:300;color:var(--border2);position:absolute;top:1rem;right:1.2rem;line-height:1;z-index:1}
        .step-icon{width:34px;height:34px;border-radius:50%;background:var(--gold-d);border:1px solid var(--gold-b);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:.82rem;margin-bottom:1rem;position:relative;z-index:1}
        .step-title{font-size:.88rem;font-weight:500;color:var(--white);margin-bottom:.4rem;position:relative;z-index:1}
        .step-desc{font-size:.8rem;color:var(--grey);line-height:1.65;position:relative;z-index:1}
        .fcard{background:var(--card);border:1px solid var(--border2);border-radius:8px;padding:2.5rem;position:relative;overflow:hidden}
        .fcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--gold),transparent)}
        .fh{font-family:'Cormorant Garamond',serif;font-size:1.75rem;font-weight:300;margin-bottom:.4rem}
        .fsub{font-size:.83rem;color:var(--grey);margin-bottom:1.9rem}
        .fg{margin-bottom:1.1rem}
        .fl{display:block;font-size:.7rem;letter-spacing:.13em;text-transform:uppercase;color:var(--grey);margin-bottom:.45rem}
        .fi{width:100%;background:rgba(255,255,255,.03);border:1px solid var(--border2);color:var(--white);font-family:'DM Sans',sans-serif;font-size:.93rem;padding:.82rem 1rem;border-radius:var(--r);outline:none;transition:border-color .2s}
        .fi:focus{border-color:var(--gold)}
        .fi::placeholder{color:#3a3a3a}
        .fsubmit{width:100%;background:linear-gradient(135deg,#b8922a 0%,#e8c96a 25%,#c9a84c 45%,#f0d878 55%,#c9a84c 70%,#a07828 85%,#d4aa50 100%);background-size:200% 200%;color:var(--black);font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;padding:.95rem;border:none;cursor:pointer;border-radius:var(--r);margin-top:.6rem;transition:background-position .4s,transform .18s;position:relative;overflow:hidden}
        .fsubmit::after{content:'';position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .5s ease}
        .fsubmit:hover{background-position:100% 100%;transform:translateY(-1px)}
        .fsubmit:hover::after{left:125%}
        .fsubmit:disabled{opacity:.6;cursor:not-allowed}
        .fcheck{display:flex;align-items:flex-start;gap:.7rem;margin-bottom:.85rem}
        .fcheck input[type=checkbox]{width:15px;height:15px;margin-top:3px;flex-shrink:0;accent-color:var(--gold);cursor:pointer}
        .fcheck label{font-size:.8rem;color:var(--grey);cursor:pointer;line-height:1.5}
        .smsg{background:rgba(201,168,76,.07);border:1px solid var(--gold-b);border-radius:var(--r);padding:1.1rem 1.4rem;font-size:.86rem;color:var(--gold-l);line-height:1.65;margin-top:.8rem}
        .moverlay{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);z-index:600;display:flex;align-items:center;justify-content:center;padding:1.5rem;opacity:0;pointer-events:none;transition:opacity .28s}
        .moverlay.open{opacity:1;pointer-events:all}
        .modal{background:var(--card);border:1px solid var(--border2);border-radius:10px;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;padding:2.5rem;position:relative}
        .modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--gold),transparent)}
        .mclose{position:absolute;top:.9rem;right:.9rem;background:none;border:none;color:var(--grey);font-size:1.2rem;cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:color .2s}
        .mclose:hover{color:var(--white)}
        .step-tab{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;padding:.4rem .9rem;border-radius:var(--r);border:1px solid var(--border2);color:var(--grey)}
        .step-tab.active{border-color:var(--gold);color:var(--gold);background:var(--gold-d)}
        .step-tab.done{border-color:var(--border2);color:#3a3a3a}
        .orn{display:flex;align-items:center;justify-content:center;gap:1rem;padding:.5rem 0;color:var(--gold)}
        .orn-line{flex:1;height:1px;background:linear-gradient(to right,transparent,var(--border));max-width:180px}
        .orn-line.r{background:linear-gradient(to left,transparent,var(--border))}
        footer{background:var(--black);border-top:1px solid var(--border);padding:3rem 2rem 2.2rem}
        .ftr{max-width:940px;margin:0 auto}
        .ftr-logo{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--gold);letter-spacing:.1em;margin-bottom:1.6rem}
        .ftr-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;margin-bottom:1.8rem}
        .ftr-label{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.7rem}
        .ftr-text{font-size:.76rem;color:var(--grey);line-height:1.75}
        .ftr-divider{height:1px;background:var(--border);margin:1.8rem 0}
        .ftr-bottom{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;font-size:.73rem;color:#3e3e3e}
        @media(max-width:720px){nav{padding:0 1.2rem}.about-grid{grid-template-columns:1fr;gap:2rem}.ftr-grid{grid-template-columns:1fr}.modal,.fcard{padding:1.8rem 1.4rem}}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
        .btn-gold:focus-visible,.btn-nav:focus-visible,.fsubmit:focus-visible,.lang-btn:focus-visible,.lang-drop button:focus-visible,.mclose:focus-visible,.fi:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
      `}</style>

      {/* NAV */}
      <nav dir={isRtl ? 'rtl' : 'ltr'} aria-label="Main navigation">
        <span className="nav-brand-text" aria-label="1Move × PrimeVerse">1Move <em aria-hidden="true">×</em> PrimeVerse</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button ref={triggerRef} className="btn-nav" onClick={() => setModalOpen(true)}>{t.nav_cta}</button>
          <div className="lang-wrap">
            <button
              className="lang-btn"
              onClick={() => setLangOpen(!langOpen)}
              aria-label={`Select language, current: ${LANGS[lang].label}`}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <span className="flag-badge" aria-hidden="true">{LANGS[lang].flag}</span> {LANGS[lang].label} <span style={{ opacity: 0.5, fontSize: '0.65rem' }} aria-hidden="true">▼</span>
            </button>
            <div className={`lang-drop${langOpen ? ' open' : ''}`} role="listbox" aria-label="Select language">
              {(Object.keys(LANGS) as LangKey[]).map(k => (
                <button key={k} role="option" aria-selected={lang === k} className={lang === k ? 'active' : ''} onClick={() => { setLang(k); setLangOpen(false) }}>
                  <span className="flag-badge" aria-hidden="true">{LANGS[k].flag}</span> {LANGS[k].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="main-content" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="hero-bg" />
        <div className="hero-line" />
        <p className="hero-tag">{t.hero_tag}</p>
        <h1 className="hero-h1">{t.hero_h1a}<br /><em>{t.hero_h1b}</em></h1>
        <p className="hero-sub">{t.hero_sub} <strong>{dist.name}</strong>{t.hero_sub2}</p>
        <button className="btn-gold" onClick={() => setModalOpen(true)}>{t.hero_btn}</button>
        <div className="scroll-hint"><div className="scroll-tick" /><span>{t.scroll}</span></div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="wrap">
          <div className="about-grid">
            <div>
              <div className="sec-label">{t.about_label}</div>
              <h2 className="sec-h2">{t.about_h2}</h2>
              <div className="about-body">
                <p>{t.about_p1}</p>
                <p>{t.about_p2}</p>
                <p>{t.about_p3}</p>
              </div>
              <div className="about-stats">
                <div className="stat"><span>24/7</span><small>{t.stat1}</small></div>
                <div className="stat"><span>Pro</span><small>{t.stat2}</small></div>
                <div className="stat"><span>KYC</span><small>{t.stat3}</small></div>
              </div>
            </div>
            <div>
              <div className="dist-card">
                {(() => { const pi = parseProfileImage(dist.profile_image); return pi.url ? (
                  <img className="dist-portrait" src={pi.url} alt={dist.name}
                    style={{ objectPosition: `${pi.x}% ${pi.y}%` }} />
                ) : (
                  <div style={{ width: '100%', maxWidth: 240, aspectRatio: '3/4', background: 'var(--border)', borderRadius: 6, margin: '0 auto 1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey)', fontSize: '3rem' }}>✦</div>
                )})()}
                <div className="dist-badge">{t.dist_badge}</div>
                {dist.bio && <p className="dist-quote">{dist.bio}</p>}
                <div className="dist-author">— {dist.name} · 1Move Academy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: 'var(--black)' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="wrap">
          <div className="sec-label">{t.process_label}</div>
          <h2 className="sec-h2">{t.process_h2}</h2>
          <p className="sec-p">{t.process_p}</p>
          <div className="steps-grid">
            {[
              { n: '01', title: t.s1t, desc: t.s1d },
              { n: '02', title: t.s2t, desc: t.s2d },
              { n: '03', title: t.s3t, desc: t.s3d },
              { n: '04', title: t.s4t, desc: t.s4d },
              { n: '05', title: t.s5t, desc: t.s5d },
            ].map(s => (
              <div className="step" key={s.n}
                onMouseMove={e => {
                  const el = e.currentTarget; const shine = el.querySelector('.step-shine') as HTMLElement
                  const rect = el.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top
                  const cx = rect.width / 2; const cy = rect.height / 2
                  el.style.transform = `perspective(800px) rotateX(${((y - cy) / cy) * -10}deg) rotateY(${((x - cx) / cx) * 10}deg) scale3d(1.03,1.03,1.03)`
                  if (shine) { shine.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(223,194,120,0.32) 0%, rgba(201,168,76,0.10) 35%, transparent 70%)`; shine.style.opacity = '1' }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget; const shine = el.querySelector('.step-shine') as HTMLElement
                  el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
                  if (shine) shine.style.opacity = '0'
                }}
              >
                <div className="step-shine" />
                <span className="step-n">{s.n}</span>
                <div className="step-icon">✦</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBMIT UID */}
      <section style={{ background: 'var(--deep)' }} id="submit-uid" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="wrap-sm">
          <div className="sec-label">{t.uid_label}</div>
          <h2 className="sec-h2">{t.uid_h2}</h2>
          <p className="sec-p" style={{ marginBottom: '2.4rem' }}>{t.uid_p}</p>
          <div className="fcard">
            {submitted ? (
              <div className="smsg" role="status" aria-live="polite"><span aria-hidden="true">✦ &nbsp;</span>{t.uid_success} {dist.name} {t.uid_success2}</div>
            ) : (
              <>
                <h3 className="fh">{t.uid_card_h}</h3>
                <p className="fsub">{t.uid_card_p}</p>
                <form onSubmit={handleUidSubmit} noValidate>
                  <div className="fg"><label className="fl" htmlFor="uid-name">{t.f_name}</label><input id="uid-name" className="fi" type="text" placeholder={t.f_name_ph} required aria-required="true" value={uidForm.name} onChange={e => setUidForm({ ...uidForm, name: e.target.value })} /></div>
                  <div className="fg"><label className="fl" htmlFor="uid-email">{t.f_email}</label><input id="uid-email" className="fi" type="email" placeholder={t.f_email_ph} required aria-required="true" value={uidForm.email} onChange={e => setUidForm({ ...uidForm, email: e.target.value })} /></div>
                  <div className="fg"><label className="fl" htmlFor="uid-uid">{t.f_uid}</label><input id="uid-uid" className="fi" type="text" placeholder={t.f_uid_ph} required aria-required="true" value={uidForm.uid} onChange={e => setUidForm({ ...uidForm, uid: e.target.value })} /></div>
                  <button className="fsubmit" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? '…' : t.uid_btn}</button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--deep)', padding: '0 2rem' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div className="orn"><div className="orn-line r" />✦<div className="orn-line" /></div>
        </div>
      </div>

      {/* SOCIAL MEDIA ICONS */}
      {(dist.social_tiktok || dist.social_instagram || dist.social_facebook || dist.social_snapchat || dist.social_linkedin) && (
        <div style={{ background: 'var(--deep)', padding: '1.5rem 0 0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {dist.social_tiktok && (
            <a href={dist.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.85 4.85 0 01-1-.1z"/></svg>
            </a>
          )}
          {dist.social_instagram && (
            <a href={dist.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
          )}
          {dist.social_facebook && (
            <a href={dist.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
          {dist.social_snapchat && (
            <a href={dist.social_snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289.294-.166.633-.236.887-.236.357 0 .654.118.804.319.219.293.105.672-.082.921a2.27 2.27 0 01-.195.207c-.174.162-.502.404-1.272.596-.09.023-.18.043-.276.064l-.081.019c-.122.03-.234.073-.345.168-.158.135-.22.314-.243.449a1.4 1.4 0 00-.006.375c.348.059.675.151.982.279 1.112.465 1.725 1.195 1.76 1.548.024.249-.096.591-.758.591-.106 0-.225-.015-.345-.045a5.3 5.3 0 01-2.199-1.158 1.24 1.24 0 00-.553-.27c-.09 0-.18.015-.255.045a4.1 4.1 0 01-1.379.33c-.675.06-1.35-.09-1.86-.36a3.1 3.1 0 01-.39-.24.775.775 0 00-.42-.135.77.77 0 00-.42.135 3.1 3.1 0 01-.39.24c-.51.27-1.185.42-1.86.36a4.1 4.1 0 01-1.379-.33.64.64 0 00-.255-.045 1.24 1.24 0 00-.553.27A5.3 5.3 0 013.7 18.885a1.5 1.5 0 01-.345.045c-.662 0-.782-.342-.758-.591.035-.353.648-1.083 1.76-1.548.307-.128.634-.22.982-.279a1.4 1.4 0 00-.006-.375c-.024-.135-.085-.314-.243-.449-.111-.095-.223-.138-.345-.168l-.081-.019a4.6 4.6 0 01-.276-.064c-.77-.192-1.098-.434-1.272-.596a2.27 2.27 0 01-.195-.207c-.187-.249-.301-.628-.082-.921.15-.201.447-.319.804-.319.254 0 .593.07.887.236.3.169.659.273.959.289.198 0 .326-.045.401-.09a8.7 8.7 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.016.793 12.006.793h.2z"/></svg>
            </a>
          )}
          {dist.social_linkedin && (
            <a href={dist.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="ftr">
          <div className="ftr-logo">1Move × PrimeVerse</div>
          <div className="ftr-grid">
            <div>
              <div className="ftr-label">{t.risk_label}</div>
              <p className="ftr-text">{t.risk_text}</p>
            </div>
            <div>
              <div className="ftr-label">{t.legal_label}</div>
              <p className="ftr-text"><strong style={{ color: 'var(--white)', fontWeight: 500 }}>{t.cookie_title}</strong> {t.cookie_text}</p>
              <p className="ftr-text" style={{ marginTop: '.9rem' }}><strong style={{ color: 'var(--white)', fontWeight: 500 }}>{t.ip_title}</strong> {t.ip_text}</p>
            </div>
          </div>
          <div className="ftr-divider" />
          <div className="ftr-bottom">
            <span>© 2025 1Move × PrimeVerse via {dist.name}. {t.footer_rights}</span>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      <div
        className={`moverlay${modalOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) { setModalOpen(false); setStep('register'); triggerRef.current?.focus() } }}
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-hidden={!modalOpen}
      >
        <div
          ref={modalRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            ref={closeButtonRef}
            className="mclose"
            onClick={() => { setModalOpen(false); setStep('register'); triggerRef.current?.focus() }}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">✕</span>
          </button>
          <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1.8rem', flexWrap: 'wrap' }} role="list" aria-label="Steps">
            <span role="listitem" className={`step-tab${step === 'register' ? ' active' : ' done'}`} aria-current={step === 'register' ? 'step' : undefined}>{t.tab1}</span>
            <span role="listitem" className={`step-tab${step === 'broker' ? ' active' : step === 'uid' ? ' done' : ''}`} aria-current={step === 'broker' ? 'step' : undefined}>{t.tab2}</span>
            <span role="listitem" className={`step-tab${step === 'uid' ? ' active' : ''}`} aria-current={step === 'uid' ? 'step' : undefined}>{t.tab3}</span>
          </div>

          {step === 'register' && (
            <>
              <h2 id="modal-title" className="fh">{t.modal_h}</h2>
              <p className="fsub">{t.modal_p}</p>
              <form onSubmit={handleGetAccess} noValidate>
                <div className="fg"><label className="fl" htmlFor="modal-name">{t.f_name}</label><input id="modal-name" className="fi" type="text" placeholder={t.f_name_ph} required aria-required="true" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="fg"><label className="fl" htmlFor="modal-email">{t.f_email}</label><input id="modal-email" className="fi" type="email" placeholder={t.f_email_ph} required aria-required="true" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div style={{ margin: '1.4rem 0 1rem' }}>
                  <div className="fcheck"><input type="checkbox" id="chk1" required aria-required="true" /><label htmlFor="chk1">{t.chk1}</label></div>
                  <div className="fcheck"><input type="checkbox" id="chk2" required aria-required="true" /><label htmlFor="chk2">{t.chk2}</label></div>
                  <div className="fcheck"><input type="checkbox" id="chk3" required aria-required="true" /><label htmlFor="chk3">{t.chk3}</label></div>
                </div>
                <button className="fsubmit" type="submit">{t.modal_btn}</button>
              </form>
            </>
          )}

          {step === 'broker' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--gold)', fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">✦</div>
              <h2 id="modal-title" className="fh">{t.broker_h}</h2>
              <p className="fsub" style={{ marginTop: '.5rem' }}>{t.broker_p}</p>
              <button className="btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => setStep('uid')}>{t.broker_btn}</button>
              <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--grey)' }}>{t.broker_fallback} <a href="https://puvip.co/la-partners/Primesync" target="_blank" rel="noopener noreferrer">Click here<span className="sr-only"> (opens in new tab)</span></a></p>
            </div>
          )}

          {step === 'uid' && (
            <>
              <h2 id="modal-title" className="fh">{t.uid_card_h}</h2>
              <p className="fsub">{t.uid_card_p}</p>
              {submitted ? (
                <div className="smsg" role="status" aria-live="polite"><span aria-hidden="true">✦ &nbsp;</span>{t.uid_success} {dist.name} {t.uid_success2}</div>
              ) : (
                <form onSubmit={handleUidSubmit} noValidate>
                  <div className="fg"><label className="fl" htmlFor="modal-uid-name">{t.f_name}</label><input id="modal-uid-name" className="fi" type="text" placeholder={t.f_name_ph} required aria-required="true" value={uidForm.name} onChange={e => setUidForm({ ...uidForm, name: e.target.value })} /></div>
                  <div className="fg"><label className="fl" htmlFor="modal-uid-email">{t.f_email}</label><input id="modal-uid-email" className="fi" type="email" placeholder={t.f_email_ph} required aria-required="true" value={uidForm.email} onChange={e => setUidForm({ ...uidForm, email: e.target.value })} /></div>
                  <div className="fg"><label className="fl" htmlFor="modal-uid-uid">{t.f_uid}</label><input id="modal-uid-uid" className="fi" type="text" placeholder={t.f_uid_ph} required aria-required="true" value={uidForm.uid} onChange={e => setUidForm({ ...uidForm, uid: e.target.value })} /></div>
                  <button className="fsubmit" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? '…' : t.uid_btn}</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
