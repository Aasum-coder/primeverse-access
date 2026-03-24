'use client'

import { useEffect, useState, use, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, notFound as triggerNotFound } from 'next/navigation'

function parseProfileImage(value: string | null) {
  if (!value) return { url: '', x: 50, y: 50 }
  try {
    const p = JSON.parse(value)
    if (p && typeof p.url === 'string') return { url: p.url, x: p.x ?? 50, y: p.y ?? 50 }
  } catch {}
  return { url: value, x: 50, y: 50 }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const LANGS = {
  en: { flag: '\u{1F1EC}\u{1F1E7}', label: 'English' },
  no: { flag: '\u{1F1F3}\u{1F1F4}', label: 'Norsk' },
  sv: { flag: '\u{1F1F8}\u{1F1EA}', label: 'Svenska' },
  es: { flag: '\u{1F1EA}\u{1F1F8}', label: 'Español' },
  ru: { flag: '\u{1F1F7}\u{1F1FA}', label: 'Русский' },
  ar: { flag: '\u{1F1F8}\u{1F1E6}', label: 'العربية' },
  tl: { flag: '\u{1F1F5}\u{1F1ED}', label: 'Filipino' },
  pt: { flag: '\u{1F1E7}\u{1F1F7}', label: 'Português' },
  th: { flag: '\u{1F1F9}\u{1F1ED}', label: 'ไทย' },
}

type LangKey = keyof typeof LANGS

const T: Record<LangKey, Record<string, string>> = {
  en: {
    nav_cta: 'Get Access Now',
    hero_h1a: 'Get Access!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: "Your gateway to the world's most advanced trading community — guided by",
    hero_sub2: ", your dedicated partner. Let's start your journey together.",
    hero_btn: 'Get Access Now',
    scroll: 'Scroll for more',
    about_label: 'About PrimeVerse',
    about_h2: 'Where Trading Education Meets Professional Infrastructure!',
    about_p1: 'PrimeVerse combines professional trading education, advanced technology, and a global community into one unified ecosystem. Learn from experienced traders, access powerful tools, and develop real market skills inside a structured environment built for long-term success.',
    stat1: 'Live Community', stat2: 'Education', stat3: 'Compliant',
    dist_badge: '1Move Academy Representative',
    process_label: 'Process',
    process_h2: 'How It Works',
    process_p: 'Five clear steps to activate your PrimeVerse membership through the 1Move verified IB link.',
    s1t: 'Register today', s1d: "Click 'Get Access Now', enter your name and email, and follow the next steps.",
    s2t: 'Open broker account', s2d: 'You will be redirected to the official registration page through our verified referral link.',
    s3t: 'Complete KYC', s3d: 'Verify your identity to activate your account and comply with European trading regulations.',
    s4t: 'Save your UID', s4d: "After registration, note your unique user ID from 'your profile' inside the broker.",
    s5t: 'Come back and verify your UID', s5d: 'At the bottom of this page you will find the verification form. Submit your UID and wait for approval. You should have full access within 24 hours.',
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
    risk_text: 'Trading financial instruments including forex, CFDs, and derivatives carries a high level of risk and may not be suitable for all investors. You could lose all of your invested capital. Past performance is not indicative of future results. This platform is for educational purposes only and does not constitute financial advice.',
    legal_label: 'Privacy & Legal',
    cookie_title: 'Cookie Notice:',
    cookie_text: 'This site uses essential session cookies to maintain core functionality. No tracking or third-party advertising cookies are deployed.',
    ip_title: 'IP Logging:',
    ip_text: 'Visitor IP addresses and form submission timestamps are logged for fraud prevention and security purposes.',
    footer_rights: 'All rights reserved.',
    somethingWentWrong: 'Something went wrong. Please try again.',
    loading: 'Loading…',
  },
  no: {
    nav_cta: 'Få tilgang nå',
    hero_h1a: 'Få tilgang!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Din inngang til verdens mest avanserte trading-fellesskap — veiledet av',
    hero_sub2: ', din dedikerte partner. La oss starte reisen sammen.',
    hero_btn: 'Få tilgang nå',
    scroll: 'Scroll for mer',
    about_label: 'Om PrimeVerse',
    about_h2: 'Der trading-utdanning møter profesjonell infrastruktur!',
    about_p1: 'PrimeVerse kombinerer profesjonell trading-utdanning, avansert teknologi og et globalt fellesskap i ett samlet økosystem. Lær av erfarne tradere, få tilgang til kraftige verktøy, og utvikle ekte markedsferdigheter i et strukturert miljø bygget for langsiktig suksess.',
    stat1: 'Live fellesskap', stat2: 'Utdanning', stat3: 'Compliant',
    dist_badge: '1Move Academy-representant',
    process_label: 'Prosess',
    process_h2: 'Slik fungerer det',
    process_p: 'Fem klare steg for å aktivere PrimeVerse-medlemskapet ditt via 1Move-linken.',
    s1t: 'Registrer deg i dag', s1d: "Klikk 'Få tilgang nå', skriv inn navn og e-post, og følg de neste stegene.",
    s2t: 'Åpne broker-konto', s2d: 'Du vil bli videresendt til den offisielle registreringssiden via vår verifiserte referral-link.',
    s3t: 'Fullfør KYC', s3d: 'Bekreft identiteten din for å aktivere kontoen og overholde europeiske trading-regler.',
    s4t: 'Lagre UID-en din', s4d: "Etter registrering, noter din unike bruker-ID fra 'din profil' inne hos brokeren.",
    s5t: 'Kom tilbake og verifiser UID-en din', s5d: 'Nederst på denne siden finner du verifiseringsskjemaet. Send inn UID-en din og vent på godkjenning. Du bør ha full tilgang innen 24 timer.',
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
    risk_text: 'Trading med finansielle instrumenter inkludert forex, CFD-er og derivater innebærer høy risiko og er kanskje ikke egnet for alle investorer. Du kan tape all din investerte kapital. Tidligere resultater er ikke en indikasjon på fremtidige resultater. Denne plattformen er kun for utdanningsformål og utgjør ikke finansiell rådgivning.',
    legal_label: 'Personvern & juss',
    cookie_title: 'Informasjonskapsler:',
    cookie_text: 'Denne siden bruker essensielle informasjonskapsler. Ingen sporing eller tredjeparts reklamecookies brukes.',
    ip_title: 'IP-logging:',
    ip_text: 'Besøkendes IP-adresser logges for svindelforebygging og sikkerhet.',
    footer_rights: 'Alle rettigheter forbeholdt.',
    somethingWentWrong: 'Noe gikk galt. Vennligst prøv igjen.',
    loading: 'Laster…',
  },
  sv: {
    nav_cta: 'Få tillgång nu',
    hero_h1a: 'Få tillgång!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Din ingång till världens mest avancerade tradingcommunity — guidad av',
    hero_sub2: ', din dedikerade partner. Låt oss börja resan tillsammans.',
    hero_btn: 'Få tillgång nu',
    scroll: 'Scrolla för mer',
    about_label: 'Om PrimeVerse',
    about_h2: 'Där tradingutbildning möter professionell infrastruktur!',
    about_p1: 'PrimeVerse kombinerar professionell tradingutbildning, avancerad teknik och en global gemenskap i ett enhetligt ekosystem. Lär dig av erfarna traders, få tillgång till kraftfulla verktyg och utveckla verkliga marknadsfärdigheter i en strukturerad miljö byggd för långsiktig framgång.',
    stat1: 'Live-gemenskap', stat2: 'Utbildning', stat3: 'Compliant',
    dist_badge: '1Move Academy-representant',
    process_label: 'Process',
    process_h2: 'Hur det fungerar',
    process_p: 'Fem tydliga steg för att aktivera ditt PrimeVerse-medlemskap via 1Move-länken.',
    s1t: 'Registrera dig idag', s1d: "Klicka på 'Få tillgång nu', ange ditt namn och e-post, och följ nästa steg.",
    s2t: 'Öppna broker-konto', s2d: 'Du omdirigeras till den officiella registreringssidan via vår verifierade referral-länk.',
    s3t: 'Slutför KYC', s3d: 'Verifiera din identitet för att aktivera ditt konto och följa europeiska handelsregler.',
    s4t: 'Spara ditt UID', s4d: "Anteckna ditt unika användar-ID från 'din profil' inne hos brokern.",
    s5t: 'Kom tillbaka och verifiera ditt UID', s5d: 'Längst ner på denna sida hittar du verifieringsformuläret. Skicka in ditt UID och vänta på godkännande. Du bör ha full tillgång inom 24 timmar.',
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
    risk_text: 'Handel med finansiella instrument inklusive forex, CFD:er och derivat innefattar en hög risknivå och kan inte vara lämplig för alla investerare. Du kan förlora hela ditt investerade kapital. Tidigare resultat är inte en indikation på framtida resultat. Denna plattform är enbart för utbildningsändamål och utgör inte finansiell rådgivning.',
    legal_label: 'Integritet & juridik',
    cookie_title: 'Cookies:',
    cookie_text: 'Denna webbplats använder viktiga sessionscookies. Inga spårnings- eller reklamcookies används.',
    ip_title: 'IP-loggning:',
    ip_text: 'Besökarens IP-adresser loggas för bedrägeriförebyggande och säkerhet.',
    footer_rights: 'Alla rättigheter förbehållna.',
    somethingWentWrong: 'Något gick fel. Försök igen.',
    loading: 'Laddar…',
  },
  es: {
    nav_cta: 'Obtener acceso',
    hero_h1a: '¡Obtén acceso!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Tu puerta de entrada a la comunidad de trading más avanzada del mundo — guiado por',
    hero_sub2: ', tu socio dedicado. Comencemos este viaje juntos.',
    hero_btn: 'Obtener acceso ahora',
    scroll: 'Desplázate para más',
    about_label: 'Acerca de PrimeVerse',
    about_h2: '¡Donde la educación en trading se encuentra con la infraestructura profesional!',
    about_p1: 'PrimeVerse combina educación profesional en trading, tecnología avanzada y una comunidad global en un ecosistema unificado. Aprende de traders experimentados, accede a herramientas poderosas y desarrolla habilidades reales de mercado en un entorno estructurado diseñado para el éxito a largo plazo.',
    stat1: 'Comunidad en vivo', stat2: 'Educación', stat3: 'Cumplimiento',
    dist_badge: 'Representante de 1Move Academy',
    process_label: 'Proceso',
    process_h2: 'Cómo funciona',
    process_p: 'Cinco pasos claros para activar tu membresía de PrimeVerse a través del enlace IB verificado de 1Move.',
    s1t: 'Regístrate hoy', s1d: "Haz clic en 'Obtener acceso ahora', ingresa tu nombre y correo, y sigue los siguientes pasos.",
    s2t: 'Abre una cuenta de bróker', s2d: 'Serás redirigido a la página oficial de registro a través de nuestro enlace de referencia verificado.',
    s3t: 'Completa el KYC', s3d: 'Verifica tu identidad para activar tu cuenta y cumplir con las regulaciones europeas de trading.',
    s4t: 'Guarda tu UID', s4d: "Después del registro, anota tu ID de usuario único desde 'tu perfil' dentro del bróker.",
    s5t: 'Vuelve y verifica tu UID', s5d: 'En la parte inferior de esta página encontrarás el formulario de verificación. Envía tu UID y espera la aprobación. Deberías tener acceso completo en 24 horas.',
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
    risk_text: 'El comercio de instrumentos financieros incluyendo forex, CFDs y derivados conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Podría perder la totalidad de su capital invertido. El rendimiento pasado no es indicativo de resultados futuros. Esta plataforma es solo con fines educativos y no constituye asesoramiento financiero.',
    legal_label: 'Privacidad y legal',
    cookie_title: 'Aviso de cookies:',
    cookie_text: 'Este sitio utiliza cookies de sesión esenciales. No se utilizan cookies de seguimiento ni publicitarias.',
    ip_title: 'Registro de IP:',
    ip_text: 'Las direcciones IP de los visitantes se registran con fines de seguridad y prevención del fraude.',
    footer_rights: 'Todos los derechos reservados.',
    somethingWentWrong: 'Algo salió mal. Inténtalo de nuevo.',
    loading: 'Cargando…',
  },
  ru: {
    nav_cta: 'Получить доступ',
    hero_h1a: 'Получите доступ!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Ваш путь в самое передовое трейдинговое сообщество мира — под руководством',
    hero_sub2: ', вашего преданного партнёра. Начнём это путешествие вместе.',
    hero_btn: 'Получить доступ',
    scroll: 'Прокрутите вниз',
    about_label: 'О PrimeVerse',
    about_h2: 'Где торговое обучение встречает профессиональную инфраструктуру!',
    about_p1: 'PrimeVerse объединяет профессиональное обучение трейдингу, передовые технологии и глобальное сообщество в единую экосистему. Учитесь у опытных трейдеров, используйте мощные инструменты и развивайте реальные рыночные навыки в структурированной среде, созданной для долгосрочного успеха.',
    stat1: 'Живое сообщество', stat2: 'Образование', stat3: 'Соответствие',
    dist_badge: 'Представитель 1Move Academy',
    process_label: 'Процесс',
    process_h2: 'Как это работает',
    process_p: 'Пять чётких шагов для активации членства PrimeVerse через верифицированную ссылку 1Move.',
    s1t: 'Зарегистрируйтесь сегодня', s1d: "Нажмите 'Получить доступ', введите имя и email, и следуйте дальнейшим шагам.",
    s2t: 'Откройте счёт у брокера', s2d: 'Вы будете перенаправлены на официальную страницу регистрации через нашу верифицированную реферальную ссылку.',
    s3t: 'Пройдите KYC', s3d: 'Подтвердите личность для активации аккаунта и соответствия европейским торговым правилам.',
    s4t: 'Сохраните UID', s4d: "После регистрации запишите ваш уникальный ID пользователя из раздела 'ваш профиль' у брокера.",
    s5t: 'Вернитесь и подтвердите UID', s5d: 'Внизу этой страницы вы найдёте форму верификации. Отправьте ваш UID и ожидайте одобрения. Полный доступ будет предоставлен в течение 24 часов.',
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
    risk_text: 'Торговля финансовыми инструментами, включая форекс, CFD и деривативы, сопряжена с высоким уровнем риска и может подходить не всем инвесторам. Вы можете потерять весь инвестированный капитал. Прошлые результаты не являются показателем будущих. Эта платформа предназначена исключительно для образовательных целей и не является финансовой консультацией.',
    legal_label: 'Конфиденциальность и правовые вопросы',
    cookie_title: 'Уведомление о cookies:',
    cookie_text: 'Сайт использует основные файлы cookie сессии. Отслеживающие или рекламные cookie не используются.',
    ip_title: 'Логирование IP:',
    ip_text: 'IP-адреса посетителей регистрируются в целях безопасности и предотвращения мошенничества.',
    footer_rights: 'Все права защищены.',
    somethingWentWrong: 'Что-то пошло не так. Попробуйте ещё раз.',
    loading: 'Загрузка…',
  },
  ar: {
    nav_cta: 'احصل على الوصول الآن',
    hero_h1a: 'احصل على الوصول!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'بوابتك إلى أكثر مجتمعات التداول تقدماً في العالم — بإرشاد من',
    hero_sub2: '، شريكك المخصص. لنبدأ هذه الرحلة معاً.',
    hero_btn: 'احصل على الوصول الآن',
    scroll: 'مرر لأسفل لمزيد',
    about_label: 'حول PrimeVerse',
    about_h2: 'حيث يلتقي تعليم التداول بالبنية التحتية الاحترافية!',
    about_p1: 'يجمع PrimeVerse بين تعليم التداول الاحترافي والتكنولوجيا المتقدمة ومجتمع عالمي في نظام بيئي موحد. تعلّم من متداولين ذوي خبرة، واحصل على أدوات قوية، وطوّر مهارات سوقية حقيقية في بيئة منظمة مصممة للنجاح على المدى الطويل.',
    stat1: 'مجتمع حي', stat2: 'تعليم', stat3: 'متوافق',
    dist_badge: 'ممثل 1Move Academy',
    process_label: 'العملية',
    process_h2: 'كيف يعمل',
    process_p: 'خمس خطوات واضحة لتفعيل عضويتك في PrimeVerse.',
    s1t: 'سجّل اليوم', s1d: "انقر على 'احصل على الوصول الآن'، أدخل اسمك وبريدك الإلكتروني، واتبع الخطوات التالية.",
    s2t: 'افتح حساب وسيط', s2d: 'سيتم توجيهك إلى صفحة التسجيل الرسمية من خلال رابط الإحالة الموثق.',
    s3t: 'أكمل KYC', s3d: 'تحقق من هويتك لتفعيل حسابك والامتثال للوائح التداول الأوروبية.',
    s4t: 'احفظ UID الخاص بك', s4d: "بعد التسجيل، سجّل معرف المستخدم الفريد من 'ملفك الشخصي' داخل الوسيط.",
    s5t: 'عُد وتحقق من UID الخاص بك', s5d: 'في أسفل هذه الصفحة ستجد نموذج التحقق. أرسل UID الخاص بك وانتظر الموافقة. يجب أن تحصل على وصول كامل خلال 24 ساعة.',
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
    risk_text: 'ينطوي تداول الأدوات المالية بما في ذلك الفوركس وعقود الفروقات والمشتقات على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لجميع المستثمرين. قد تخسر كامل رأس مالك المستثمر. الأداء السابق لا يشير إلى النتائج المستقبلية. هذه المنصة مخصصة للأغراض التعليمية فقط ولا تشكل نصيحة مالية.',
    legal_label: 'الخصوصية والقانون',
    cookie_title: 'إشعار ملفات تعريف الارتباط:',
    cookie_text: 'يستخدم هذا الموقع ملفات تعريف الارتباط الأساسية للجلسة. لا يتم نشر ملفات تعريف الارتباط للتتبع أو الإعلانات.',
    ip_title: 'تسجيل IP:',
    ip_text: 'يتم تسجيل عناوين IP الخاصة بالزوار لأغراض أمنية ومنع الاحتيال.',
    footer_rights: 'جميع الحقوق محفوظة.',
    somethingWentWrong: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    loading: '…جاري التحميل',
  },
  tl: {
    nav_cta: 'Kumuha ng Access Ngayon',
    hero_h1a: 'Kumuha ng Access!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Ang iyong daan patungo sa pinaka-advanced na trading community sa mundo — ginagabayan ni',
    hero_sub2: ', ang iyong dedikadong partner. Simulan natin ang paglalakbay na ito.',
    hero_btn: 'Kumuha ng Access Ngayon',
    scroll: 'Mag-scroll para sa higit pa',
    about_label: 'Tungkol sa PrimeVerse',
    about_h2: 'Kung Saan Nagtatagpo ang Trading Education at Propesyonal na Imprastraktura!',
    about_p1: 'Pinagsasama ng PrimeVerse ang propesyonal na trading education, advanced na teknolohiya, at isang global na komunidad sa isang pinag-isang ekosistema. Matuto mula sa mga bihasang trader, mag-access ng mga makapangyarihang tool, at bumuo ng tunay na mga kasanayan sa merkado sa loob ng isang structured na kapaligiran na ginawa para sa pangmatagalang tagumpay.',
    stat1: 'Live Community', stat2: 'Edukasyon', stat3: 'Compliant',
    dist_badge: '1Move Academy Representative',
    process_label: 'Proseso',
    process_h2: 'Paano ito gumagana',
    process_p: 'Limang malinaw na hakbang para i-activate ang iyong PrimeVerse membership sa pamamagitan ng verified IB link ng 1Move.',
    s1t: 'Mag-register ngayon', s1d: "I-click ang 'Kumuha ng Access Ngayon', ilagay ang pangalan at email, at sundin ang susunod na mga hakbang.",
    s2t: 'Buksan ang broker account', s2d: 'Ire-redirect ka sa opisyal na registration page sa pamamagitan ng aming verified referral link.',
    s3t: 'Kumpletuhin ang KYC', s3d: 'I-verify ang iyong identity para ma-activate ang account at sumunod sa European trading regulations.',
    s4t: 'I-save ang iyong UID', s4d: "Pagkatapos mag-register, tandaan ang unique user ID mula sa 'your profile' sa loob ng broker.",
    s5t: 'Bumalik at i-verify ang iyong UID', s5d: 'Sa ibaba ng page na ito mahahanap mo ang verification form. I-submit ang UID at hintayin ang approval. Dapat magkaroon ka ng full access sa loob ng 24 oras.',
    uid_label: 'Hakbang 5', uid_h2: 'I-submit ang iyong UID', uid_p: 'Naka-register na sa broker? I-submit ang UID dito.',
    uid_card_h: 'I-submit ang UID', uid_card_p: 'Ilagay ang buong pangalan, email at broker UID sa ibaba.',
    f_name: 'Buong pangalan', f_email: 'Email Address', f_uid: 'Broker UID',
    f_name_ph: 'Ang buong pangalan mo', f_email_ph: 'your@email.com', f_uid_ph: 'hal. 1234567',
    uid_btn: 'Humiling ng Verification',
    uid_success: 'Natanggap na ang request.',
    uid_success2: 'ay magsusuri at mag-a-approve ng access mo sa lalong madaling panahon. Mangyaring maghintay ng hanggang 24 oras.',
    modal_h: 'Kumuha ng Access Ngayon', modal_p: 'Kumpletuhin ang iyong mga detalye para magpatuloy sa broker registration.',
    chk1: 'Tinatanggap ko ang Terms & Conditions',
    chk2: 'Nabasa at naiintindihan ko ang buong risk disclaimer',
    chk3: 'Pumapayag ako na makatanggap ng community updates at educational content sa email',
    modal_btn: 'Kumpirmahin at Magpatuloy sa Registration',
    tab1: '1. Register', tab2: '2. Broker', tab3: '3. I-submit ang UID',
    broker_h: 'Binubuksan ang Broker Registration…',
    broker_p: 'May bagong tab na nabuksan. Kumpletuhin ang registration doon, pagkatapos bumalik dito.',
    broker_btn: 'Naka-register na ako — I-submit ang UID',
    broker_fallback: 'Hindi nabuksan ang tab?',
    risk_label: 'Risk Disclaimer',
    risk_text: 'Ang pag-trade ng mga financial instrument kabilang ang forex, CFDs, at derivatives ay may mataas na antas ng panganib at maaaring hindi angkop para sa lahat ng investor. Maaari mong mawala ang lahat ng iyong namuhunan na kapital. Ang nakaraang performance ay hindi nagpapahiwatig ng mga resulta sa hinaharap. Ang platform na ito ay para sa mga layuning pang-edukasyon lamang at hindi bumubuo ng financial advice.',
    legal_label: 'Privacy at Legal',
    cookie_title: 'Cookie Notice:',
    cookie_text: 'Gumagamit ang site na ito ng essential session cookies. Walang tracking o third-party advertising cookies ang ginagamit.',
    ip_title: 'IP Logging:',
    ip_text: 'Ang mga IP address ng mga bisita ay nire-record para sa fraud prevention at security.',
    footer_rights: 'Lahat ng karapatan ay nakalaan.',
    somethingWentWrong: 'May nangyaring mali. Subukan muli.',
    loading: 'Naglo-load…',
  },
  pt: {
    nav_cta: 'Obter acesso agora',
    hero_h1a: 'Obtenha acesso!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'Sua porta de entrada para a comunidade de trading mais avançada do mundo — guiado por',
    hero_sub2: ', seu parceiro dedicado. Vamos começar essa jornada juntos.',
    hero_btn: 'Obter acesso agora',
    scroll: 'Role para mais',
    about_label: 'Sobre o PrimeVerse',
    about_h2: 'Onde a educação em trading encontra a infraestrutura profissional!',
    about_p1: 'PrimeVerse combina educação profissional em trading, tecnologia avançada e uma comunidade global em um ecossistema unificado. Aprenda com traders experientes, acesse ferramentas poderosas e desenvolva habilidades reais de mercado em um ambiente estruturado feito para o sucesso a longo prazo.',
    stat1: 'Comunidade ao vivo', stat2: 'Educação', stat3: 'Conformidade',
    dist_badge: 'Representante da 1Move Academy',
    process_label: 'Processo',
    process_h2: 'Como funciona',
    process_p: 'Cinco passos claros para ativar sua assinatura PrimeVerse através do link IB verificado da 1Move.',
    s1t: 'Registre-se hoje', s1d: "Clique em 'Obter acesso agora', insira seu nome e e-mail e siga os próximos passos.",
    s2t: 'Abra uma conta na corretora', s2d: 'Você será redirecionado para a página oficial de registro através do nosso link de indicação verificado.',
    s3t: 'Complete o KYC', s3d: 'Verifique sua identidade para ativar sua conta e cumprir as regulamentações europeias de trading.',
    s4t: 'Salve seu UID', s4d: "Após o registro, anote seu ID de usuário único em 'seu perfil' dentro da corretora.",
    s5t: 'Volte e verifique seu UID', s5d: 'Na parte inferior desta página você encontrará o formulário de verificação. Envie seu UID e aguarde a aprovação. Você deverá ter acesso completo em 24 horas.',
    uid_label: 'Passo 5', uid_h2: 'Envie seu UID', uid_p: 'Já registrado na corretora? Envie seu UID aqui.',
    uid_card_h: 'Enviar UID', uid_card_p: 'Insira seu nome completo, e-mail e UID da corretora abaixo.',
    f_name: 'Nome completo', f_email: 'Endereço de e-mail', f_uid: 'UID da corretora',
    f_name_ph: 'Seu nome completo', f_email_ph: 'seu@email.com', f_uid_ph: 'ex. 1234567',
    uid_btn: 'Solicitar verificação',
    uid_success: 'Solicitação recebida.',
    uid_success2: 'analisará e aprovará seu acesso em breve. Aguarde até 24 horas.',
    modal_h: 'Obter acesso agora', modal_p: 'Complete seus dados para prosseguir ao registro da corretora.',
    chk1: 'Aceito os Termos e Condições',
    chk2: 'Li e compreendo o aviso de risco completo',
    chk3: 'Consinto em receber atualizações da comunidade por e-mail',
    modal_btn: 'Confirmar e prosseguir ao registro',
    tab1: '1. Registrar', tab2: '2. Corretora', tab3: '3. Enviar UID',
    broker_h: 'Abrindo registro da corretora…',
    broker_p: 'Uma nova aba foi aberta. Complete o registro lá e depois volte aqui.',
    broker_btn: 'Já me registrei — Enviar UID',
    broker_fallback: 'A aba não abriu?',
    risk_label: 'Aviso de risco',
    risk_text: 'A negociação de instrumentos financeiros incluindo forex, CFDs e derivativos envolve um alto nível de risco e pode não ser adequada para todos os investidores. Você pode perder todo o seu capital investido. Resultados passados não são indicativos de resultados futuros. Esta plataforma é apenas para fins educacionais e não constitui aconselhamento financeiro.',
    legal_label: 'Privacidade e jurídico',
    cookie_title: 'Aviso de cookies:',
    cookie_text: 'Este site usa cookies de sessão essenciais. Nenhum cookie de rastreamento ou publicidade é utilizado.',
    ip_title: 'Registro de IP:',
    ip_text: 'Os endereços IP dos visitantes são registrados para fins de segurança e prevenção de fraude.',
    footer_rights: 'Todos os direitos reservados.',
    somethingWentWrong: 'Algo deu errado. Tente novamente.',
    loading: 'Carregando…',
  },
  th: {
    nav_cta: 'รับสิทธิ์เข้าถึงตอนนี้',
    hero_h1a: 'รับสิทธิ์เข้าถึง!',
    hero_h1b: '1Move × Primeverse',
    hero_sub: 'ประตูสู่ชุมชนเทรดดิ้งที่ล้ำหน้าที่สุดในโลก — นำโดย',
    hero_sub2: ' พาร์ทเนอร์ของคุณ มาเริ่มต้นเส้นทางนี้ด้วยกัน',
    hero_btn: 'รับสิทธิ์เข้าถึงตอนนี้',
    scroll: 'เลื่อนเพื่อดูเพิ่มเติม',
    about_label: 'เกี่ยวกับ PrimeVerse',
    about_h2: 'ที่ซึ่งการศึกษาการเทรดพบกับโครงสร้างพื้นฐานระดับมืออาชีพ!',
    about_p1: 'PrimeVerse รวมการศึกษาการเทรดระดับมืออาชีพ เทคโนโลยีขั้นสูง และชุมชนระดับโลกไว้ในระบบนิเวศเดียว เรียนรู้จากเทรดเดอร์ที่มีประสบการณ์ เข้าถึงเครื่องมือที่ทรงพลัง และพัฒนาทักษะตลาดจริงในสภาพแวดล้อมที่มีโครงสร้างซึ่งสร้างขึ้นเพื่อความสำเร็จระยะยาว',
    stat1: 'ชุมชนสด', stat2: 'การศึกษา', stat3: 'ปฏิบัติตามกฎ',
    dist_badge: 'ตัวแทน 1Move Academy',
    process_label: 'ขั้นตอน',
    process_h2: 'วิธีการทำงาน',
    process_p: 'ห้าขั้นตอนที่ชัดเจนเพื่อเปิดใช้งานสมาชิก PrimeVerse ผ่านลิงก์ IB ที่ยืนยันแล้วของ 1Move',
    s1t: 'สมัครวันนี้', s1d: "คลิก 'รับสิทธิ์เข้าถึงตอนนี้' กรอกชื่อและอีเมล แล้วทำตามขั้นตอนถัดไป",
    s2t: 'เปิดบัญชีโบรกเกอร์', s2d: 'คุณจะถูกนำไปยังหน้าลงทะเบียนอย่างเป็นทางการผ่านลิงก์แนะนำที่ยืนยันแล้ว',
    s3t: 'ยืนยันตัวตน KYC', s3d: 'ยืนยันตัวตนเพื่อเปิดใช้งานบัญชีและปฏิบัติตามกฎระเบียบการเทรดของยุโรป',
    s4t: 'บันทึก UID ของคุณ', s4d: "หลังจากลงทะเบียน จดบันทึก ID ผู้ใช้ที่ไม่ซ้ำจาก 'โปรไฟล์ของคุณ' ในโบรกเกอร์",
    s5t: 'กลับมายืนยัน UID ของคุณ', s5d: 'ที่ด้านล่างของหน้านี้คุณจะพบแบบฟอร์มยืนยัน ส่ง UID ของคุณแล้วรอการอนุมัติ คุณควรได้รับสิทธิ์เต็มภายใน 24 ชั่วโมง',
    uid_label: 'ขั้นตอนที่ 5', uid_h2: 'ส่ง UID ของคุณ', uid_p: 'ลงทะเบียนกับโบรกเกอร์แล้ว? ส่ง UID ของคุณที่นี่',
    uid_card_h: 'ส่ง UID', uid_card_p: 'กรอกชื่อเต็ม อีเมล และ UID โบรกเกอร์ด้านล่าง',
    f_name: 'ชื่อ-นามสกุล', f_email: 'อีเมล', f_uid: 'UID โบรกเกอร์',
    f_name_ph: 'ชื่อเต็มของคุณ', f_email_ph: 'your@email.com', f_uid_ph: 'เช่น 1234567',
    uid_btn: 'ขอการยืนยัน',
    uid_success: 'ได้รับคำขอแล้ว',
    uid_success2: 'จะตรวจสอบและอนุมัติสิทธิ์เข้าถึงของคุณในเร็วๆ นี้ กรุณารอไม่เกิน 24 ชั่วโมง',
    modal_h: 'รับสิทธิ์เข้าถึงตอนนี้', modal_p: 'กรอกข้อมูลของคุณเพื่อดำเนินการลงทะเบียนโบรกเกอร์',
    chk1: 'ฉันยอมรับข้อกำหนดและเงื่อนไข',
    chk2: 'ฉันได้อ่านและเข้าใจข้อจำกัดความรับผิดชอบด้านความเสี่ยงทั้งหมด',
    chk3: 'ฉันยินยอมรับการอัปเดตชุมชนและเนื้อหาทางการศึกษาทางอีเมล',
    modal_btn: 'ยืนยันและดำเนินการลงทะเบียน',
    tab1: '1. สมัคร', tab2: '2. โบรกเกอร์', tab3: '3. ส่ง UID',
    broker_h: 'กำลังเปิดหน้าลงทะเบียนโบรกเกอร์…',
    broker_p: 'แท็บใหม่เปิดขึ้นแล้ว ดำเนินการลงทะเบียนที่นั่นแล้วกลับมาที่นี่',
    broker_btn: 'ฉันลงทะเบียนแล้ว — ส่ง UID',
    broker_fallback: 'แท็บไม่เปิด?',
    risk_label: 'ข้อจำกัดความรับผิดชอบด้านความเสี่ยง',
    risk_text: 'การซื้อขายตราสารทางการเงินรวมถึง forex, CFDs และอนุพันธ์มีความเสี่ยงสูงและอาจไม่เหมาะสมสำหรับนักลงทุนทุกคน คุณอาจสูญเสียเงินลงทุนทั้งหมดของคุณ ผลการดำเนินงานในอดีตไม่ได้บ่งชี้ถึงผลลัพธ์ในอนาคต แพลตฟอร์มนี้มีวัตถุประสงค์เพื่อการศึกษาเท่านั้นและไม่ถือเป็นคำแนะนำทางการเงิน',
    legal_label: 'ความเป็นส่วนตัวและกฎหมาย',
    cookie_title: 'ประกาศเรื่องคุกกี้:',
    cookie_text: 'เว็บไซต์นี้ใช้คุกกี้เซสชันที่จำเป็น ไม่มีการใช้คุกกี้ติดตามหรือโฆษณา',
    ip_title: 'การบันทึก IP:',
    ip_text: 'ที่อยู่ IP ของผู้เยี่ยมชมจะถูกบันทึกเพื่อวัตถุประสงค์ด้านความปลอดภัยและการป้องกันการฉ้อโกง',
    footer_rights: 'สงวนลิขสิทธิ์ทั้งหมด',
    somethingWentWrong: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    loading: 'กำลังโหลด…',
  },
}

const RESERVED_SLUGS = ['reset-password', 'login', 'signup', 'admin', 'auth', 'api', 'beta', 'factory', 'event']

export default function DistributorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  if (RESERVED_SLUGS.includes(slug)) {
    triggerNotFound()
  }
  const [distributor, setDistributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<'register' | 'broker' | 'uid'>('register')
  const [form, setForm] = useState({ name: '', email: '' })
  const [uidForm, setUidForm] = useState({ name: '', email: '', uid: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [lang, setLangState] = useState<LangKey>('en')
  const [langOpen, setLangOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const setLang = (code: LangKey) => {
    setLangState(code)
    try { localStorage.setItem('systm8_visitor_language', code) } catch {}
  }

  // Restore visitor language from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('systm8_visitor_language')
      if (saved && saved in LANGS) setLangState(saved as LangKey)
    } catch {}
  }, [])

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
      // Track page view with smart source detection (fire-and-forget)
      const params = new URLSearchParams(window.location.search)
      const sourceTag = params.get('s')
      const utmSource = params.get('utm_source')
      let referrer = 'Direct'
      if (sourceTag === 'share') referrer = 'Shared Link'
      else if (sourceTag === 'fb') referrer = 'Facebook'
      else if (sourceTag === 'ig') referrer = 'Instagram'
      else if (sourceTag === 'tt') referrer = 'TikTok'
      else if (sourceTag === 'wa') referrer = 'WhatsApp'
      else if (sourceTag === 'tg') referrer = 'Telegram'
      else if (utmSource) referrer = utmSource
      else if (document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('facebook')) referrer = 'Facebook'
        else if (ref.includes('instagram')) referrer = 'Instagram'
        else if (ref.includes('tiktok')) referrer = 'TikTok'
        else if (ref.includes('whatsapp')) referrer = 'WhatsApp'
        else if (ref.includes('t.me') || ref.includes('telegram')) referrer = 'Telegram'
        else if (ref.includes('linkedin')) referrer = 'LinkedIn'
        else if (ref.includes('google')) referrer = 'Google'
        else if (ref.includes('twitter') || ref.includes('x.com')) referrer = 'X / Twitter'
        else {
          try { referrer = new URL(document.referrer).hostname } catch { referrer = 'Other' }
        }
      }
      supabase.from('page_views').insert({
        distributor_id: data.id,
        slug: slug,
        created_at: new Date().toISOString(),
        referrer: referrer,
        utm_source: utmSource || null,
        utm_medium: params.get('utm_medium') || null,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }).then(() => {}, () => {})
      // Ensure bio_translations is a parsed object (handle string edge case)
      if (data.bio_translations && typeof data.bio_translations === 'string') {
        try { data.bio_translations = JSON.parse(data.bio_translations) } catch { data.bio_translations = null }
      }
      setDistributor(data)
      setLoading(false)
      // Check if current user owns this page
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user && data.user_id === userData.user.id) setIsOwner(true)
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
    setSubmitError('')
    setSubmitting(true)
    const { data: insertedLead, error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: uidForm.name, email: uidForm.email, uid: uidForm.uid, uid_verified: false, referral_link_used: slug }).select('id').single()
    if (error) { setSubmitError(t.somethingWentWrong); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName: uidForm.name, leadEmail: uidForm.email, leadUid: uidForm.uid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    fetch('/api/new-lead-alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ distributorId: distributor.id }) }).catch(() => {})
    fetch('/api/milestone-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ distributorId: distributor.id }) }).catch(() => {})
    if (insertedLead?.id) { fetch('/api/auto-enroll-workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: insertedLead.id, distributorId: distributor.id }) }).catch(() => {}) }
    // Notify IB instantly via email, Telegram, and in-app notification
    fetch('/api/uid-submitted-notification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: insertedLead?.id || '', leadName: uidForm.name, leadEmail: uidForm.email, leadUid: uidForm.uid, distributorId: distributor.id }) }).catch(() => {})
    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) return <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#c9a84c', fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: '0.2em' }}>{t.loading}</div></div>
  if (notFound) return <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#7a7a72', textAlign: 'center' }}><div style={{ color: '#c9a84c', fontSize: '2rem', marginBottom: '1rem' }}>✦</div><p>This page is not available yet.</p><p style={{ fontSize: '0.78rem', marginTop: '0.5rem', color: '#555' }}>The representative may not have set up their profile yet.</p>{dbError && <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', color: '#ff6b6b', background: '#1a0000', padding: '0.5rem 1rem', borderRadius: 4, maxWidth: 360, wordBreak: 'break-all' }}>Debug: {dbError}</p>}<p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#888', maxWidth: 300 }}>Slug: {slug}</p></div></div>

  const dist = distributor
  const translatedBio = dist.bio_translations?.[lang] || dist.bio || ''

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
        .lang-trigger{background:none;border:1px solid var(--border2);color:var(--grey);padding:.3rem .5rem;border-radius:8px;cursor:pointer;transition:all .3s;backdrop-filter:blur(10px);display:flex;align-items:center;gap:.3rem;line-height:1}
        .lang-trigger:hover{border-color:var(--gold);color:var(--gold)}
        .lang-trigger svg{width:14px;height:14px;opacity:.5;flex-shrink:0}
        .lang-trigger:hover svg{opacity:.8}
        .lang-trigger .lang-flag{font-size:1rem;line-height:1}
        .lang-modal-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:langFadeIn .2s ease}
        @keyframes langFadeIn{from{opacity:0}to{opacity:1}}
        .lang-modal{background:#1A1A2E;border:1px solid rgba(201,168,76,.25);border-radius:16px;padding:1.2rem .5rem;min-width:240px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:langSlideUp .2s ease}
        @keyframes langSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .lang-modal-title{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;color:var(--gold-l);text-align:center;padding:0 .7rem .7rem;border-bottom:1px solid rgba(201,168,76,.1);margin-bottom:.3rem}
        .lang-modal-option{display:flex;align-items:center;gap:.7rem;width:100%;background:none;border:none;color:var(--grey);font-family:'DM Sans',sans-serif;font-size:.9rem;padding:.6rem 1rem;text-align:left;cursor:pointer;transition:all .15s;border-radius:8px;margin:0 .2rem}
        .lang-modal-option:hover{background:rgba(201,168,76,.1);color:var(--gold-l)}
        .lang-modal-option-active{color:var(--gold);background:rgba(201,168,76,.07)}
        .lang-modal-option .lang-flag{font-size:1.15rem;line-height:1}
        .lang-modal-option .lang-check{margin-left:auto;opacity:.7;font-size:.75rem;color:var(--gold)}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 5rem;position:relative;overflow:hidden}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(201,168,76,.07) 0%,transparent 70%);pointer-events:none}
        .hero-line{width:1px;height:56px;background:linear-gradient(to bottom,transparent,var(--gold),transparent);margin:0 auto 2.2rem}
        .hero-h1{font-family:'Cormorant Garamond',serif;line-height:1.1;margin-bottom:1.6rem;max-width:820px;display:flex;flex-direction:column;align-items:center;gap:.3rem}
        .hero-h1-main{font-size:clamp(3rem,7.5vw,5.5rem);font-weight:700;color:var(--gold);display:block}
        .hero-h1-brand{font-size:clamp(1.6rem,4vw,2.6rem);font-weight:300;color:var(--white);display:block;opacity:.9;letter-spacing:.04em}
        .hero-sub{font-size:clamp(.92rem,2vw,1.05rem);color:var(--grey);max-width:560px;margin:0 auto 2.8rem;line-height:1.7}
        .hero-sub strong{color:var(--gold);font-weight:600}
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
        .back-dash{position:fixed;bottom:1.2rem;left:1.2rem;z-index:500;display:flex;align-items:center;gap:.4rem;background:rgba(10,10,10,.75);border:1px solid rgba(201,168,76,.2);color:var(--grey);font-family:'DM Sans',sans-serif;font-size:.75rem;padding:.5rem .9rem;border-radius:10px;cursor:pointer;backdrop-filter:blur(12px);transition:all .25s;text-decoration:none;opacity:.7}
        .back-dash:hover{opacity:1;border-color:var(--gold);color:var(--gold);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.4)}
        .back-dash svg{width:14px;height:14px;flex-shrink:0}
        @media(max-width:720px){nav{padding:0 1.2rem}.about-grid{grid-template-columns:1fr;gap:2rem}.ftr-grid{grid-template-columns:1fr}.modal,.fcard{padding:1.8rem 1.4rem}}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
        .btn-gold:focus-visible,.btn-nav:focus-visible,.fsubmit:focus-visible,.lang-trigger:focus-visible,.lang-modal-option:focus-visible,.mclose:focus-visible,.fi:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
      `}</style>

      {/* Language modal overlay */}
      {langOpen && (
        <div className="lang-modal-backdrop" onClick={() => setLangOpen(false)} role="dialog" aria-modal="true" aria-label="Select language">
          <div className="lang-modal" onClick={e => e.stopPropagation()}>
            <div className="lang-modal-title">Select language</div>
            {(Object.keys(LANGS) as LangKey[]).map(k => (
              <button
                key={k}
                className={`lang-modal-option${k === lang ? ' lang-modal-option-active' : ''}`}
                onClick={() => { setLang(k); setLangOpen(false); }}
              >
                <span className="lang-flag" aria-hidden="true">{LANGS[k].flag}</span>
                {LANGS[k].label}
                {k === lang && <span className="lang-check" aria-hidden="true">&#10003;</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav dir={isRtl ? 'rtl' : 'ltr'} aria-label="Main navigation">
        <span className="nav-brand-text" aria-label="1Move × PrimeVerse">1Move <em aria-hidden="true">×</em> PrimeVerse</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button ref={triggerRef} className="btn-nav" onClick={() => setModalOpen(true)}>{t.nav_cta}</button>
          <button
            className="lang-trigger"
            onClick={() => setLangOpen(true)}
            aria-label={`Select language, current: ${LANGS[lang].label}`}
            aria-haspopup="dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/>
            </svg>
            <span className="lang-flag" aria-hidden="true">{LANGS[lang].flag}</span>
          </button>
        </div>
      </nav>

      {/* Back to Dashboard — only visible to page owner */}
      {isOwner && (
        <button className="back-dash" onClick={() => router.push('/')} aria-label="Back to Dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Dashboard
        </button>
      )}

      {/* HERO */}
      <section className="hero" id="main-content" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="hero-bg" />
        <div className="hero-line" />
        <h1 className="hero-h1">
          <span className="hero-h1-main">{t.hero_h1a}</span>
          <span className="hero-h1-brand">{t.hero_h1b}</span>
        </h1>
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
                {translatedBio && <p className="dist-quote">{translatedBio}</p>}
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
                  {submitError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>{submitError}</p>}
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
      {(dist.social_telegram || dist.social_whatsapp || dist.social_tiktok || dist.social_instagram || dist.social_facebook || dist.social_snapchat || dist.social_linkedin || dist.social_youtube || dist.social_other) && (
        <div style={{ background: 'var(--deep)', padding: '1.5rem 0 0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {dist.social_telegram && (
            <a href={dist.social_telegram && !/^https?:\/\//i.test(dist.social_telegram) ? 'https://' + dist.social_telegram : dist.social_telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012.056 0h-.112zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
          )}
          {dist.social_whatsapp && (
            <a href={`https://wa.me/${dist.social_whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          )}
          {dist.social_tiktok && (
            <a href={dist.social_tiktok && !/^https?:\/\//i.test(dist.social_tiktok) ? 'https://' + dist.social_tiktok : dist.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.79a4.85 4.85 0 01-1-.1z"/></svg>
            </a>
          )}
          {dist.social_instagram && (
            <a href={dist.social_instagram && !/^https?:\/\//i.test(dist.social_instagram) ? 'https://' + dist.social_instagram : dist.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
          )}
          {dist.social_facebook && (
            <a href={dist.social_facebook && !/^https?:\/\//i.test(dist.social_facebook) ? 'https://' + dist.social_facebook : dist.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
          {dist.social_snapchat && (
            <a href={dist.social_snapchat && !/^https?:\/\//i.test(dist.social_snapchat) ? 'https://' + dist.social_snapchat : dist.social_snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289.294-.166.633-.236.887-.236.357 0 .654.118.804.319.219.293.105.672-.082.921a2.27 2.27 0 01-.195.207c-.174.162-.502.404-1.272.596-.09.023-.18.043-.276.064l-.081.019c-.122.03-.234.073-.345.168-.158.135-.22.314-.243.449a1.4 1.4 0 00-.006.375c.348.059.675.151.982.279 1.112.465 1.725 1.195 1.76 1.548.024.249-.096.591-.758.591-.106 0-.225-.015-.345-.045a5.3 5.3 0 01-2.199-1.158 1.24 1.24 0 00-.553-.27c-.09 0-.18.015-.255.045a4.1 4.1 0 01-1.379.33c-.675.06-1.35-.09-1.86-.36a3.1 3.1 0 01-.39-.24.775.775 0 00-.42-.135.77.77 0 00-.42.135 3.1 3.1 0 01-.39.24c-.51.27-1.185.42-1.86.36a4.1 4.1 0 01-1.379-.33.64.64 0 00-.255-.045 1.24 1.24 0 00-.553.27A5.3 5.3 0 013.7 18.885a1.5 1.5 0 01-.345.045c-.662 0-.782-.342-.758-.591.035-.353.648-1.083 1.76-1.548.307-.128.634-.22.982-.279a1.4 1.4 0 00-.006-.375c-.024-.135-.085-.314-.243-.449-.111-.095-.223-.138-.345-.168l-.081-.019a4.6 4.6 0 01-.276-.064c-.77-.192-1.098-.434-1.272-.596a2.27 2.27 0 01-.195-.207c-.187-.249-.301-.628-.082-.921.15-.201.447-.319.804-.319.254 0 .593.07.887.236.3.169.659.273.959.289.198 0 .326-.045.401-.09a8.7 8.7 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.016.793 12.006.793h.2z"/></svg>
            </a>
          )}
          {dist.social_linkedin && (
            <a href={dist.social_linkedin && !/^https?:\/\//i.test(dist.social_linkedin) ? 'https://' + dist.social_linkedin : dist.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          )}
          {dist.social_youtube && (
            <a href={dist.social_youtube && !/^https?:\/\//i.test(dist.social_youtube) ? 'https://' + dist.social_youtube : dist.social_youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          )}
          {dist.social_other && (
            <a href={dist.social_other && !/^https?:\/\//i.test(dist.social_other) ? 'https://' + dist.social_other : dist.social_other} target="_blank" rel="noopener noreferrer" aria-label="Website" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'box-shadow 0.3s, filter 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(212,165,55,0.5)'; (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.filter = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
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
                  {submitError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>{submitError}</p>}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
