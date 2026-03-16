'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/* ─────────────────────────────────────────────
   SYSTM8 Beta Access — Exclusive IB Beta Program
   Flow: Personal invite → /beta → Submit UID + Book Zoom → Join Beta Group
   Only for 1Move Academy Marketing Team
   ───────────────────────────────────────────── */

const LOGO_URL = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

/* ─── TRANSLATIONS (9 languages) ─── */
type LangKey = 'no' | 'en' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

const langLabels: Record<LangKey, string> = {
  no: 'Norsk',
  en: 'English',
  sv: 'Svenska',
  es: 'Español',
  ru: 'Русский',
  ar: 'العربية',
  tl: 'Filipino',
  pt: 'Português',
  th: 'ไทย',
}

const T: Record<LangKey, Record<string, string>> = {
  no: {
    title: 'SYSTM8 Beta Program',
    subtitle: 'Du er invitert til noe som aldri har eksistert i IB-industrien.',
    subtitle2: 'SYSTM8 er det første AI-drevne IB-dashboardet i sitt slag — og du har muligheten til å forme det fra innsiden.',
    invite_badge: 'Kun med invitasjon',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Søk om beta-tilgang',
    card_p: 'Verifiser din IB-status og book en personlig gjennomgang. Plassene er svært begrensede.',
    name_label: 'Fullt navn',
    name_ph: 'Ditt fulle navn',
    email_label: 'E-post',
    email_ph: 'din@epost.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'Din megler-UID (f.eks. 1234567)',
    uid_hint: 'Finnes under "Min profil" i PU Prime. Brukes til å verifisere din IB-status.',
    phone_label: 'Telefon',
    phone_opt: '(valgfritt)',
    phone_ph: '+47 XXX XX XXX',
    submit: 'Book min Zoom-gjennomgang',
    loading: 'Sender...',
    err_fields: 'Vennligst fyll inn navn, e-post og PU Prime UID.',
    err_email: 'Ugyldig e-postadresse.',
    err_uid: 'PU Prime UID må være et gyldig tall.',
    err_generic: 'Noe gikk galt. Prøv igjen.',
    success_h: 'Du er registrert!',
    success_p1: 'Takk, {name}. Din søknad om beta-tilgang er mottatt.',
    success_p2: 'Vi verifiserer din IB-status og sender deg en Zoom-invitasjon innen 24 timer.',
    success_p3: 'Under samtalen får du en eksklusiv gjennomgang av SYSTM8 og mulighet til å bli med i beta-gruppen.',
    success_uid: 'Din UID: {uid}',
    success_status: 'Status: Venter på verifisering',
    what_h: 'Hva skjer videre?',
    what_1: 'Vi verifiserer din PU Prime IB-status',
    what_2: 'Du mottar en personlig Zoom-invitasjon',
    what_3: 'Gjennomgang av SYSTM8 — én-til-én med teamet',
    what_4: 'Du blir med i den eksklusive beta-gruppen',
    why_h: 'Hvorfor du er valgt',
    why_p: 'Bare et utvalgt antall IB-partnere fra 1Move Academy Marketing Team inviteres til å delta i beta-programmet. Dine innspill vil direkte forme verktøyet som setter en ny standard for hele IB-industrien.',
    feat_1: 'Sanntids IB-dashboard med AI-innsikt',
    feat_2: 'Automatisert lead-tracking og konvertering',
    feat_3: 'Provisjonsanalyse og team-performance',
    feat_4: 'AI-drevne markedsføringsverktøy',
    feat_5: 'Direkte innflytelse på produktutviklingen',
    excl_badge: 'Begrenset antall plasser',
    footer_note: 'SYSTM8 Beta Program er et eksklusivt initiativ fra 1Move Academy. Kun verifiserte IB-partnere fra Marketing Team kan delta.',
    step1: 'Verifiser',
    step2: 'Zoom-call',
    step3: 'Beta-tilgang',
  },
  en: {
    title: 'SYSTM8 Beta Program',
    subtitle: 'You have been invited to something that has never existed in the IB industry.',
    subtitle2: 'SYSTM8 is the first AI-powered IB dashboard of its kind — and you have the opportunity to shape it from the inside.',
    invite_badge: 'By invitation only',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Apply for beta access',
    card_p: 'Verify your IB status and book a personal walkthrough. Spots are extremely limited.',
    name_label: 'Full name',
    name_ph: 'Your full name',
    email_label: 'Email',
    email_ph: 'you@email.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'Your broker UID (e.g. 1234567)',
    uid_hint: 'Found under "My Profile" in PU Prime. Used to verify your IB status.',
    phone_label: 'Phone',
    phone_opt: '(optional)',
    phone_ph: '+1 XXX XXX XXXX',
    submit: 'Book my Zoom walkthrough',
    loading: 'Submitting...',
    err_fields: 'Please enter your name, email and PU Prime UID.',
    err_email: 'Invalid email address.',
    err_uid: 'PU Prime UID must be a valid number.',
    err_generic: 'Something went wrong. Please try again.',
    success_h: 'You\'re registered!',
    success_p1: 'Thank you, {name}. Your beta access application has been received.',
    success_p2: 'We will verify your IB status and send you a Zoom invitation within 24 hours.',
    success_p3: 'During the call you\'ll get an exclusive walkthrough of SYSTM8 and the opportunity to join the beta group.',
    success_uid: 'Your UID: {uid}',
    success_status: 'Status: Pending verification',
    what_h: 'What happens next?',
    what_1: 'We verify your PU Prime IB status',
    what_2: 'You receive a personal Zoom invitation',
    what_3: 'One-on-one SYSTM8 walkthrough with the team',
    what_4: 'You join the exclusive beta group',
    why_h: 'Why you were chosen',
    why_p: 'Only a select number of IB partners from the 1Move Academy Marketing Team are invited to participate in the beta program. Your input will directly shape the tool that sets a new standard for the entire IB industry.',
    feat_1: 'Real-time IB dashboard with AI insights',
    feat_2: 'Automated lead tracking and conversion',
    feat_3: 'Commission analytics and team performance',
    feat_4: 'AI-powered marketing tools',
    feat_5: 'Direct influence on product development',
    excl_badge: 'Limited spots available',
    footer_note: 'SYSTM8 Beta Program is an exclusive initiative by 1Move Academy. Only verified IB partners from the Marketing Team can participate.',
    step1: 'Verify',
    step2: 'Zoom call',
    step3: 'Beta access',
  },
  sv: {
    title: 'SYSTM8 Betaprogram',
    subtitle: 'Du har bjudits in till något som aldrig har funnits i IB-branschen.',
    subtitle2: 'SYSTM8 är den första AI-drivna IB-dashboarden i sitt slag — och du har möjligheten att forma den inifrån.',
    invite_badge: 'Endast med inbjudan',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Ansök om betatillgång',
    card_p: 'Verifiera din IB-status och boka en personlig genomgång. Platserna är mycket begränsade.',
    name_label: 'Fullständigt namn',
    name_ph: 'Ditt fullständiga namn',
    email_label: 'E-post',
    email_ph: 'din@epost.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'Ditt mäklar-UID (t.ex. 1234567)',
    uid_hint: 'Finns under "Min profil" i PU Prime. Används för att verifiera din IB-status.',
    phone_label: 'Telefon',
    phone_opt: '(valfritt)',
    phone_ph: '+46 XXX XXX XXXX',
    submit: 'Boka min Zoom-genomgång',
    loading: 'Skickar...',
    err_fields: 'Vänligen fyll i namn, e-post och PU Prime UID.',
    err_email: 'Ogiltig e-postadress.',
    err_uid: 'PU Prime UID måste vara ett giltigt nummer.',
    err_generic: 'Något gick fel. Försök igen.',
    success_h: 'Du är registrerad!',
    success_p1: 'Tack, {name}. Din ansökan om betatillgång har mottagits.',
    success_p2: 'Vi verifierar din IB-status och skickar dig en Zoom-inbjudan inom 24 timmar.',
    success_p3: 'Under samtalet får du en exklusiv genomgång av SYSTM8 och möjlighet att gå med i betagruppen.',
    success_uid: 'Ditt UID: {uid}',
    success_status: 'Status: Väntar på verifiering',
    what_h: 'Vad händer nu?',
    what_1: 'Vi verifierar din PU Prime IB-status',
    what_2: 'Du får en personlig Zoom-inbjudan',
    what_3: 'En-till-en SYSTM8-genomgång med teamet',
    what_4: 'Du går med i den exklusiva betagruppen',
    why_h: 'Varför du är utvald',
    why_p: 'Bara ett utvalt antal IB-partners från 1Move Academy Marketing Team bjuds in till betaprogrammet. Dina synpunkter kommer direkt att forma verktyget som sätter en ny standard för hela IB-branschen.',
    feat_1: 'Realtids IB-dashboard med AI-insikter',
    feat_2: 'Automatiserad lead-tracking och konvertering',
    feat_3: 'Provisionsanalys och teamprestanda',
    feat_4: 'AI-drivna marknadsföringsverktyg',
    feat_5: 'Direkt inflytande på produktutvecklingen',
    excl_badge: 'Begränsat antal platser',
    footer_note: 'SYSTM8 Betaprogram är ett exklusivt initiativ från 1Move Academy. Endast verifierade IB-partners från Marketing Team kan delta.',
    step1: 'Verifiera',
    step2: 'Zoom-samtal',
    step3: 'Betatillgång',
  },
  es: {
    title: 'Programa Beta SYSTM8',
    subtitle: 'Has sido invitado a algo que nunca ha existido en la industria IB.',
    subtitle2: 'SYSTM8 es el primer dashboard IB impulsado por IA de su tipo — y tienes la oportunidad de darle forma desde dentro.',
    invite_badge: 'Solo con invitación',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Solicita acceso beta',
    card_p: 'Verifica tu estatus de IB y reserva una presentación personal. Los lugares son extremadamente limitados.',
    name_label: 'Nombre completo',
    name_ph: 'Tu nombre completo',
    email_label: 'Correo electrónico',
    email_ph: 'tu@correo.com',
    uid_label: 'UID de PU Prime',
    uid_ph: 'Tu UID de broker (ej. 1234567)',
    uid_hint: 'Se encuentra en "Mi perfil" en PU Prime. Se usa para verificar tu estatus de IB.',
    phone_label: 'Teléfono',
    phone_opt: '(opcional)',
    phone_ph: '+34 XXX XXX XXX',
    submit: 'Reservar mi sesión Zoom',
    loading: 'Enviando...',
    err_fields: 'Por favor, ingresa tu nombre, correo y UID de PU Prime.',
    err_email: 'Dirección de correo inválida.',
    err_uid: 'El UID de PU Prime debe ser un número válido.',
    err_generic: 'Algo salió mal. Inténtalo de nuevo.',
    success_h: '¡Estás registrado!',
    success_p1: 'Gracias, {name}. Tu solicitud de acceso beta ha sido recibida.',
    success_p2: 'Verificaremos tu estatus de IB y te enviaremos una invitación de Zoom en 24 horas.',
    success_p3: 'Durante la llamada recibirás una presentación exclusiva de SYSTM8 y la oportunidad de unirte al grupo beta.',
    success_uid: 'Tu UID: {uid}',
    success_status: 'Estado: Pendiente de verificación',
    what_h: '¿Qué sigue?',
    what_1: 'Verificamos tu estatus de IB en PU Prime',
    what_2: 'Recibes una invitación personal de Zoom',
    what_3: 'Presentación uno a uno de SYSTM8 con el equipo',
    what_4: 'Te unes al grupo beta exclusivo',
    why_h: 'Por qué fuiste elegido',
    why_p: 'Solo un número selecto de socios IB del 1Move Academy Marketing Team son invitados al programa beta. Tus aportes darán forma directa a la herramienta que establecerá un nuevo estándar para toda la industria IB.',
    feat_1: 'Dashboard IB en tiempo real con IA',
    feat_2: 'Seguimiento automatizado de leads y conversión',
    feat_3: 'Análisis de comisiones y rendimiento del equipo',
    feat_4: 'Herramientas de marketing impulsadas por IA',
    feat_5: 'Influencia directa en el desarrollo del producto',
    excl_badge: 'Plazas limitadas',
    footer_note: 'El Programa Beta SYSTM8 es una iniciativa exclusiva de 1Move Academy. Solo los socios IB verificados del Marketing Team pueden participar.',
    step1: 'Verificar',
    step2: 'Zoom',
    step3: 'Acceso beta',
  },
  ru: {
    title: 'Бета-программа SYSTM8',
    subtitle: 'Вы приглашены к тому, чего ещё никогда не существовало в IB-индустрии.',
    subtitle2: 'SYSTM8 — первая в своём роде IB-панель на базе ИИ, и у вас есть возможность формировать её изнутри.',
    invite_badge: 'Только по приглашению',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Подать заявку на бета-доступ',
    card_p: 'Подтвердите свой IB-статус и забронируйте персональный обзор. Количество мест крайне ограничено.',
    name_label: 'Полное имя',
    name_ph: 'Ваше полное имя',
    email_label: 'Электронная почта',
    email_ph: 'вы@почта.com',
    uid_label: 'UID PU Prime',
    uid_ph: 'Ваш UID брокера (напр. 1234567)',
    uid_hint: 'Находится в «Мой профиль» в PU Prime. Используется для проверки вашего IB-статуса.',
    phone_label: 'Телефон',
    phone_opt: '(необязательно)',
    phone_ph: '+7 XXX XXX XXXX',
    submit: 'Забронировать Zoom-обзор',
    loading: 'Отправка...',
    err_fields: 'Пожалуйста, введите имя, email и UID PU Prime.',
    err_email: 'Недействительный адрес электронной почты.',
    err_uid: 'UID PU Prime должен быть числом.',
    err_generic: 'Что-то пошло не так. Попробуйте снова.',
    success_h: 'Вы зарегистрированы!',
    success_p1: 'Спасибо, {name}. Ваша заявка на бета-доступ получена.',
    success_p2: 'Мы проверим ваш IB-статус и отправим приглашение в Zoom в течение 24 часов.',
    success_p3: 'Во время звонка вы получите эксклюзивный обзор SYSTM8 и возможность присоединиться к бета-группе.',
    success_uid: 'Ваш UID: {uid}',
    success_status: 'Статус: Ожидание проверки',
    what_h: 'Что дальше?',
    what_1: 'Мы проверяем ваш IB-статус в PU Prime',
    what_2: 'Вы получите персональное приглашение в Zoom',
    what_3: 'Персональный обзор SYSTM8 с командой',
    what_4: 'Вы вступаете в эксклюзивную бета-группу',
    why_h: 'Почему вы были выбраны',
    why_p: 'Лишь избранные IB-партнёры из 1Move Academy Marketing Team приглашены в бета-программу. Ваш вклад напрямую повлияет на инструмент, который установит новый стандарт для всей IB-индустрии.',
    feat_1: 'IB-дашборд в реальном времени с ИИ-аналитикой',
    feat_2: 'Автоматическое отслеживание лидов и конверсий',
    feat_3: 'Аналитика комиссий и эффективность команды',
    feat_4: 'Маркетинговые инструменты на базе ИИ',
    feat_5: 'Прямое влияние на разработку продукта',
    excl_badge: 'Ограниченное количество мест',
    footer_note: 'Бета-программа SYSTM8 — эксклюзивная инициатива 1Move Academy. Участвовать могут только проверенные IB-партнёры из Marketing Team.',
    step1: 'Проверка',
    step2: 'Zoom',
    step3: 'Бета-доступ',
  },
  ar: {
    title: 'برنامج SYSTM8 التجريبي',
    subtitle: 'لقد تمت دعوتك إلى شيء لم يسبق له مثيل في صناعة IB.',
    subtitle2: 'SYSTM8 هي أول لوحة تحكم IB مدعومة بالذكاء الاصطناعي من نوعها — ولديك الفرصة لتشكيلها من الداخل.',
    invite_badge: 'بدعوة فقط',
    team_badge: '1Move Academy فريق التسويق',
    card_h: 'التقدم للوصول التجريبي',
    card_p: 'تحقق من حالة IB الخاصة بك واحجز عرضًا شخصيًا. الأماكن محدودة للغاية.',
    name_label: 'الاسم الكامل',
    name_ph: 'اسمك الكامل',
    email_label: 'البريد الإلكتروني',
    email_ph: 'you@email.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'معرف الوسيط الخاص بك (مثل 1234567)',
    uid_hint: 'يوجد ضمن "ملفي الشخصي" في PU Prime. يُستخدم للتحقق من حالة IB.',
    phone_label: 'الهاتف',
    phone_opt: '(اختياري)',
    phone_ph: '+966 XXX XXX XXXX',
    submit: 'احجز جلسة Zoom الخاصة بي',
    loading: 'جاري الإرسال...',
    err_fields: 'يرجى إدخال الاسم والبريد الإلكتروني و PU Prime UID.',
    err_email: 'عنوان بريد إلكتروني غير صالح.',
    err_uid: 'يجب أن يكون PU Prime UID رقمًا صالحًا.',
    err_generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    success_h: 'تم تسجيلك!',
    success_p1: 'شكرًا لك، {name}. تم استلام طلب الوصول التجريبي.',
    success_p2: 'سنتحقق من حالة IB الخاصة بك ونرسل لك دعوة Zoom خلال 24 ساعة.',
    success_p3: 'خلال المكالمة ستحصل على عرض حصري لـ SYSTM8 وفرصة الانضمام إلى المجموعة التجريبية.',
    success_uid: 'معرفك: {uid}',
    success_status: 'الحالة: في انتظار التحقق',
    what_h: 'ماذا بعد؟',
    what_1: 'نتحقق من حالة IB الخاصة بك في PU Prime',
    what_2: 'تتلقى دعوة Zoom شخصية',
    what_3: 'عرض SYSTM8 فردي مع الفريق',
    what_4: 'تنضم إلى المجموعة التجريبية الحصرية',
    why_h: 'لماذا تم اختيارك',
    why_p: 'فقط عدد مختار من شركاء IB من فريق التسويق في 1Move Academy تتم دعوتهم للمشاركة في البرنامج التجريبي. ستشكل مساهماتك الأداة التي ستضع معيارًا جديدًا لصناعة IB بأكملها.',
    feat_1: 'لوحة تحكم IB في الوقت الفعلي مع رؤى الذكاء الاصطناعي',
    feat_2: 'تتبع تلقائي للعملاء المحتملين والتحويل',
    feat_3: 'تحليلات العمولات وأداء الفريق',
    feat_4: 'أدوات تسويق مدعومة بالذكاء الاصطناعي',
    feat_5: 'تأثير مباشر على تطوير المنتج',
    excl_badge: 'أماكن محدودة',
    footer_note: 'برنامج SYSTM8 التجريبي هو مبادرة حصرية من 1Move Academy. يمكن فقط لشركاء IB المعتمدين من فريق التسويق المشاركة.',
    step1: 'تحقق',
    step2: 'Zoom',
    step3: 'وصول تجريبي',
  },
  tl: {
    title: 'SYSTM8 Beta Program',
    subtitle: 'Iniimbitahan ka sa isang bagay na hindi pa naiiral sa IB industry.',
    subtitle2: 'Ang SYSTM8 ang kauna-unahang AI-powered IB dashboard ng uri nito — at may pagkakataon kang hubugin ito mula sa loob.',
    invite_badge: 'Sa pamamagitan ng imbitasyon lamang',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Mag-apply para sa beta access',
    card_p: 'I-verify ang iyong IB status at mag-book ng personal na walkthrough. Napaka-limitado ang mga puwesto.',
    name_label: 'Buong pangalan',
    name_ph: 'Ang iyong buong pangalan',
    email_label: 'Email',
    email_ph: 'ikaw@email.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'Ang iyong broker UID (hal. 1234567)',
    uid_hint: 'Makikita sa "My Profile" sa PU Prime. Ginagamit para i-verify ang iyong IB status.',
    phone_label: 'Telepono',
    phone_opt: '(opsyonal)',
    phone_ph: '+63 XXX XXX XXXX',
    submit: 'I-book ang aking Zoom walkthrough',
    loading: 'Isinusumite...',
    err_fields: 'Mangyaring ilagay ang iyong pangalan, email at PU Prime UID.',
    err_email: 'Hindi wastong email address.',
    err_uid: 'Ang PU Prime UID ay dapat maging wastong numero.',
    err_generic: 'May nangyaring mali. Subukan muli.',
    success_h: 'Nakarehistro ka na!',
    success_p1: 'Salamat, {name}. Natanggap na ang iyong aplikasyon para sa beta access.',
    success_p2: 'I-ve-verify namin ang iyong IB status at magpapadala ng Zoom invitation sa loob ng 24 oras.',
    success_p3: 'Sa tawag makakakuha ka ng eksklusibong walkthrough ng SYSTM8 at pagkakataong sumali sa beta group.',
    success_uid: 'Ang iyong UID: {uid}',
    success_status: 'Status: Naghihintay ng verification',
    what_h: 'Ano ang susunod?',
    what_1: 'Vine-verify namin ang iyong PU Prime IB status',
    what_2: 'Makakatanggap ka ng personal na Zoom invitation',
    what_3: 'One-on-one SYSTM8 walkthrough kasama ang team',
    what_4: 'Sasali ka sa eksklusibong beta group',
    why_h: 'Bakit ka napili',
    why_p: 'Isang piling bilang ng IB partners mula sa 1Move Academy Marketing Team lamang ang inimbitahan sa beta program. Ang iyong input ay direktang huhubog sa tool na magtatakda ng bagong pamantayan para sa buong IB industry.',
    feat_1: 'Real-time IB dashboard na may AI insights',
    feat_2: 'Automated lead tracking at conversion',
    feat_3: 'Commission analytics at team performance',
    feat_4: 'AI-powered marketing tools',
    feat_5: 'Direktang impluwensya sa product development',
    excl_badge: 'Limitadong puwesto',
    footer_note: 'Ang SYSTM8 Beta Program ay isang eksklusibong inisyatiba ng 1Move Academy. Tanging verified IB partners mula sa Marketing Team lamang ang maaaring lumahok.',
    step1: 'I-verify',
    step2: 'Zoom call',
    step3: 'Beta access',
  },
  pt: {
    title: 'Programa Beta SYSTM8',
    subtitle: 'Você foi convidado para algo que nunca existiu na indústria IB.',
    subtitle2: 'O SYSTM8 é o primeiro dashboard IB com IA do seu tipo — e você tem a oportunidade de moldá-lo por dentro.',
    invite_badge: 'Apenas com convite',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'Solicitar acesso beta',
    card_p: 'Verifique seu status de IB e agende uma apresentação pessoal. As vagas são extremamente limitadas.',
    name_label: 'Nome completo',
    name_ph: 'Seu nome completo',
    email_label: 'E-mail',
    email_ph: 'voce@email.com',
    uid_label: 'UID PU Prime',
    uid_ph: 'Seu UID do broker (ex. 1234567)',
    uid_hint: 'Encontrado em "Meu Perfil" no PU Prime. Usado para verificar seu status de IB.',
    phone_label: 'Telefone',
    phone_opt: '(opcional)',
    phone_ph: '+55 XX XXXXX-XXXX',
    submit: 'Agendar minha sessão Zoom',
    loading: 'Enviando...',
    err_fields: 'Por favor, insira seu nome, e-mail e UID do PU Prime.',
    err_email: 'Endereço de e-mail inválido.',
    err_uid: 'O UID do PU Prime deve ser um número válido.',
    err_generic: 'Algo deu errado. Tente novamente.',
    success_h: 'Você está registrado!',
    success_p1: 'Obrigado, {name}. Sua solicitação de acesso beta foi recebida.',
    success_p2: 'Verificaremos seu status de IB e enviaremos um convite Zoom em até 24 horas.',
    success_p3: 'Durante a chamada você receberá uma apresentação exclusiva do SYSTM8 e a oportunidade de entrar no grupo beta.',
    success_uid: 'Seu UID: {uid}',
    success_status: 'Status: Aguardando verificação',
    what_h: 'O que acontece agora?',
    what_1: 'Verificamos seu status de IB no PU Prime',
    what_2: 'Você recebe um convite pessoal do Zoom',
    what_3: 'Apresentação individual do SYSTM8 com a equipe',
    what_4: 'Você entra no grupo beta exclusivo',
    why_h: 'Por que você foi escolhido',
    why_p: 'Apenas um número seleto de parceiros IB do 1Move Academy Marketing Team são convidados para o programa beta. Sua contribuição moldará diretamente a ferramenta que definirá um novo padrão para toda a indústria IB.',
    feat_1: 'Dashboard IB em tempo real com insights de IA',
    feat_2: 'Rastreamento automatizado de leads e conversão',
    feat_3: 'Análise de comissões e performance da equipe',
    feat_4: 'Ferramentas de marketing com IA',
    feat_5: 'Influência direta no desenvolvimento do produto',
    excl_badge: 'Vagas limitadas',
    footer_note: 'O Programa Beta SYSTM8 é uma iniciativa exclusiva da 1Move Academy. Apenas parceiros IB verificados do Marketing Team podem participar.',
    step1: 'Verificar',
    step2: 'Zoom',
    step3: 'Acesso beta',
  },
  th: {
    title: 'โปรแกรมเบต้า SYSTM8',
    subtitle: 'คุณได้รับเชิญเข้าร่วมสิ่งที่ไม่เคยมีมาก่อนในอุตสาหกรรม IB',
    subtitle2: 'SYSTM8 คือแดชบอร์ด IB ที่ขับเคลื่อนด้วย AI ตัวแรกในประเภทนี้ — และคุณมีโอกาสที่จะกำหนดทิศทางจากภายใน',
    invite_badge: 'เฉพาะผู้ที่ได้รับเชิญ',
    team_badge: '1Move Academy Marketing Team',
    card_h: 'สมัครเข้าถึงเบต้า',
    card_p: 'ยืนยันสถานะ IB ของคุณและจองการนำเสนอส่วนตัว จำนวนจำกัดมาก',
    name_label: 'ชื่อเต็ม',
    name_ph: 'ชื่อเต็มของคุณ',
    email_label: 'อีเมล',
    email_ph: 'you@email.com',
    uid_label: 'PU Prime UID',
    uid_ph: 'UID โบรกเกอร์ของคุณ (เช่น 1234567)',
    uid_hint: 'อยู่ภายใต้ "โปรไฟล์ของฉัน" ใน PU Prime ใช้เพื่อยืนยันสถานะ IB',
    phone_label: 'โทรศัพท์',
    phone_opt: '(ไม่บังคับ)',
    phone_ph: '+66 XX XXX XXXX',
    submit: 'จองเซสชัน Zoom ของฉัน',
    loading: 'กำลังส่ง...',
    err_fields: 'กรุณากรอกชื่อ อีเมล และ PU Prime UID',
    err_email: 'ที่อยู่อีเมลไม่ถูกต้อง',
    err_uid: 'PU Prime UID ต้องเป็นตัวเลขที่ถูกต้อง',
    err_generic: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    success_h: 'ลงทะเบียนแล้ว!',
    success_p1: 'ขอบคุณ {name} ได้รับใบสมัครเข้าถึงเบต้าของคุณแล้ว',
    success_p2: 'เราจะตรวจสอบสถานะ IB ของคุณและส่งคำเชิญ Zoom ภายใน 24 ชั่วโมง',
    success_p3: 'ระหว่างการโทร คุณจะได้รับการนำเสนอ SYSTM8 แบบเอกสิทธิ์และโอกาสเข้าร่วมกลุ่มเบต้า',
    success_uid: 'UID ของคุณ: {uid}',
    success_status: 'สถานะ: รอการตรวจสอบ',
    what_h: 'ขั้นตอนต่อไป?',
    what_1: 'เราตรวจสอบสถานะ IB ของคุณใน PU Prime',
    what_2: 'คุณจะได้รับคำเชิญ Zoom ส่วนตัว',
    what_3: 'นำเสนอ SYSTM8 แบบตัวต่อตัวกับทีม',
    what_4: 'คุณเข้าร่วมกลุ่มเบต้าพิเศษ',
    why_h: 'ทำไมคุณถูกเลือก',
    why_p: 'เฉพาะพันธมิตร IB ที่ได้รับเลือกจาก 1Move Academy Marketing Team เท่านั้นที่ได้รับเชิญเข้าร่วมโปรแกรมเบต้า ข้อมูลของคุณจะกำหนดทิศทางเครื่องมือที่จะตั้งมาตรฐานใหม่ให้กับอุตสาหกรรม IB ทั้งหมด',
    feat_1: 'แดชบอร์ด IB แบบเรียลไทม์พร้อมข้อมูลเชิงลึก AI',
    feat_2: 'การติดตามลีดอัตโนมัติและการแปลง',
    feat_3: 'การวิเคราะห์ค่าคอมมิชชันและประสิทธิภาพทีม',
    feat_4: 'เครื่องมือการตลาดที่ขับเคลื่อนด้วย AI',
    feat_5: 'อิทธิพลโดยตรงต่อการพัฒนาผลิตภัณฑ์',
    excl_badge: 'จำนวนจำกัด',
    footer_note: 'โปรแกรมเบต้า SYSTM8 เป็นโครงการพิเศษจาก 1Move Academy เฉพาะพันธมิตร IB ที่ผ่านการตรวจสอบจาก Marketing Team เท่านั้นที่สามารถเข้าร่วม',
    step1: 'ยืนยัน',
    step2: 'Zoom',
    step3: 'เบต้า',
  },
}

/* ─── STYLES ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --success-color: #4a9d5a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    height: 100%;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
    overflow-x: hidden;
  }

  .marble-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35, 28, 18, 0.5) 0%, transparent 50%),
      linear-gradient(137deg, transparent 30%, rgba(212,165,55,0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212,165,55,0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180,140,45,0.03) 57%, transparent 59%),
      linear-gradient(142deg, transparent 40%, rgba(255,255,255,0.012) 40.2%, transparent 40.4%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }

  .marble-bg::after {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px; opacity: 0.5;
  }

  .beta-page {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 2rem 1rem 3rem;
    gap: 1.25rem;
  }

  /* ── Language Selector ── */
  .lang-selector { position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100; }

  .lang-btn {
    background: rgba(10,10,10,0.7); border: 1px solid rgba(212,165,55,0.2);
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.8rem; padding: 0.4rem 0.8rem; border-radius: 6px;
    cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px);
    display: flex; align-items: center; gap: 0.4rem;
  }
  .lang-btn:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }
  .lang-btn svg { width: 14px; height: 14px; opacity: 0.6; }

  .lang-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    background: rgba(15,13,10,0.95); border: 1px solid rgba(212,165,55,0.2);
    border-radius: 8px; overflow: hidden; min-width: 140px;
    backdrop-filter: blur(20px); box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    animation: dropIn 0.2s ease;
  }

  @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

  .lang-option {
    display: block; width: 100%; background: none; border: none;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; padding: 0.55rem 1rem; text-align: left;
    cursor: pointer; transition: all 0.2s;
  }
  .lang-option:hover { background: rgba(212,165,55,0.08); color: var(--gold-light); }
  .lang-option.active { color: var(--gold); background: rgba(212,165,55,0.06); }

  [dir="rtl"] .lang-dropdown { right: auto; left: 0; }
  [dir="rtl"] .lang-selector { right: auto; left: 1.5rem; }

  /* ── Logo ── */
  .beta-logo {
    width: 110px; height: auto;
    filter: drop-shadow(0 4px 24px rgba(212,165,55,0.25));
    margin-top: 1rem;
  }

  .beta-title {
    font-family: 'Cormorant Garamond', serif; font-weight: 700;
    font-size: 1.7rem; letter-spacing: 0.12em; text-transform: uppercase;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, var(--gold-dark) 80%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; text-align: center;
  }

  .beta-subtitle {
    font-size: 0.92rem; color: var(--text-secondary);
    text-align: center; max-width: 460px; line-height: 1.65;
  }

  .beta-subtitle strong {
    color: var(--text-primary); font-weight: 500;
  }

  /* ── Badges ── */
  .badge-row { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }

  .badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    border-radius: 20px; padding: 0.3rem 0.85rem;
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge-gold {
    background: rgba(212,165,55,0.1); border: 1px solid rgba(212,165,55,0.2);
    color: var(--gold-light);
  }

  .badge-team {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-secondary);
  }

  .badge svg { width: 13px; height: 13px; }

  /* ── Stepper ── */
  .stepper { display: flex; align-items: center; margin-bottom: 0.25rem; }

  .step-dot {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 600;
    border: 2px solid rgba(212,165,55,0.2);
    color: var(--text-secondary); background: rgba(10,10,10,0.6);
    transition: all 0.4s; flex-shrink: 0;
  }
  .step-dot.active {
    border-color: var(--gold); color: #0a0804;
    background: linear-gradient(135deg, var(--gold-light), var(--gold));
    box-shadow: 0 0 20px rgba(212,165,55,0.3);
  }
  .step-dot.done {
    border-color: var(--success-color); color: #fff;
    background: rgba(74,157,90,0.3);
  }

  .step-line {
    width: 48px; height: 2px;
    background: rgba(212,165,55,0.15); transition: background 0.4s;
  }
  .step-line.done { background: var(--success-color); }

  .step-labels { display: flex; gap: 16px; margin-top: 0.4rem; }

  .step-label {
    font-size: 0.68rem; color: var(--text-secondary);
    text-align: center; width: 72px;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  .step-label.active { color: var(--gold); }

  /* ── Card ── */
  .beta-card {
    width: 100%; max-width: 460px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 2.5rem 2rem 2rem;
    backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(212,165,55,0.05) inset, 0 24px 80px rgba(0,0,0,0.4);
    animation: cardIn 0.5s ease;
  }

  @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .card-h {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 1.4rem; color: var(--text-primary);
    margin-bottom: 0.5rem; text-align: center; letter-spacing: 0.04em;
  }

  .card-p {
    font-size: 0.85rem; color: var(--text-secondary);
    text-align: center; margin-bottom: 1.5rem; line-height: 1.55;
  }

  /* ── Fields ── */
  .field { margin-bottom: 1rem; }

  .field-label {
    display: block; font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.4rem;
  }

  .field-input {
    width: 100%; padding: 0.75rem 1rem;
    background: var(--input-bg); border: 1px solid var(--input-border);
    border-radius: 8px; color: var(--text-primary);
    font-family: 'Outfit', sans-serif; font-size: 0.95rem;
    outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: rgba(154,145,126,0.5); }
  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212,165,55,0.08);
    outline: 2px solid var(--gold); outline-offset: 1px;
  }

  .field-hint {
    font-size: 0.72rem; color: var(--text-secondary);
    margin-top: 0.35rem; line-height: 1.4; opacity: 0.8;
  }

  /* ── Gold Button ── */
  .gold-btn {
    position: relative; width: 100%;
    padding: 0.85rem 1.5rem; margin-top: 0.75rem;
    border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.92rem;
    font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer; overflow: hidden; color: #0a0804;
    background: linear-gradient(135deg, #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%, #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%);
    background-size: 200% 200%;
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 4px 16px rgba(160,120,24,0.25), 0 1px 3px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .gold-btn::before {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px);
    border-radius: inherit; pointer-events: none;
  }
  .gold-btn::after {
    content: ''; position: absolute; top: -50%; left: -75%; width: 50%; height: 200%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 58%, transparent 70%);
    transform: skewX(-20deg); transition: left 0.7s ease; pointer-events: none;
  }
  .gold-btn:hover::after { left: 125%; }
  .gold-btn:hover { transform: translateY(-1px); box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3); }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .gold-btn:disabled::after { display: none; }
  .gold-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* ── Messages ── */
  .msg { font-size: 0.82rem; padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 1rem; text-align: center; }
  .msg-error { background: rgba(212,74,55,0.1); border: 1px solid rgba(212,74,55,0.2); color: #e8755e; }
  .msg-success { background: rgba(74,157,90,0.1); border: 1px solid rgba(74,157,90,0.2); color: #6dc07f; }

  /* ── Success Card ── */
  .success-icon {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 1.25rem;
    background: linear-gradient(135deg, rgba(74,157,90,0.15), rgba(74,157,90,0.05));
    border: 2px solid rgba(74,157,90,0.3);
    display: flex; align-items: center; justify-content: center;
  }

  .success-uid-box {
    background: rgba(212,165,55,0.06); border: 1px solid rgba(212,165,55,0.15);
    border-radius: 8px; padding: 0.75rem 1rem; margin: 1rem 0;
    text-align: center;
  }

  .success-uid-box .uid-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem; font-weight: 600; color: var(--gold-light);
    letter-spacing: 0.06em;
  }

  .success-uid-box .uid-status {
    font-size: 0.75rem; color: var(--text-secondary);
    margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.06em;
  }

  .next-steps { list-style: none; padding: 0; margin: 1.25rem 0 0; }

  .next-steps li {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0; font-size: 0.85rem; color: var(--text-secondary);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .next-steps li:last-child { border-bottom: none; }

  .step-num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 600;
    background: rgba(212,165,55,0.08); border: 1px solid rgba(212,165,55,0.15);
    color: var(--gold);
  }

  /* ── Why Section ── */
  .why-section {
    width: 100%; max-width: 460px; margin-top: 0.5rem;
    animation: cardIn 0.5s ease 0.15s both;
  }

  .why-h {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 1.1rem; color: var(--text-primary);
    margin-bottom: 0.5rem; letter-spacing: 0.04em;
  }

  .why-p {
    font-size: 0.82rem; color: var(--text-secondary);
    line-height: 1.6; margin-bottom: 1rem;
  }

  .feat-grid {
    display: grid; grid-template-columns: 1fr; gap: 0.5rem;
  }

  .feat-item {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 0.82rem; color: var(--text-secondary);
    padding: 0.45rem 0;
  }

  .feat-check {
    color: var(--gold); font-size: 0.85rem; flex-shrink: 0;
  }

  /* ── Footer ── */
  .beta-footer {
    font-size: 0.72rem; color: rgba(154,145,126,0.5);
    text-align: center; max-width: 400px; line-height: 1.5;
    margin-top: 1rem; padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.04);
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .beta-card { padding: 2rem 1.5rem 1.5rem; border-radius: 12px; }
    .beta-title { font-size: 1.35rem; }
    .beta-logo { width: 90px; }
    .step-line { width: 32px; }
    .badge-row { gap: 0.35rem; }
  }
`

type PageStep = 'form' | 'success'

export default function BetaPage() {
  const [lang, setLang] = useState<LangKey>('no')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const [pageStep, setPageStep] = useState<PageStep>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [uid, setUid] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)
  const t = T[lang]
  const isRTL = lang === 'ar'

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const stepIndex = pageStep === 'form' ? 0 : 2

  const handleSubmit = async () => {
    setError('')

    if (!name.trim() || !email.trim() || !uid.trim()) {
      setError(t.err_fields)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.err_email)
      return
    }
    if (!/^\d{4,10}$/.test(uid.trim())) {
      setError(t.err_uid)
      return
    }

    setLoading(true)
    try {
      const { error: dbError } = await supabase.from('leads').insert({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        broker_uid: uid.trim(),
        source: 'beta-program',
        status: 'pending_verification',
      })

      if (dbError && !dbError.message.includes('duplicate')) {
        throw dbError
      }

      // Alert team about new beta applicant
      fetch('/api/new-lead-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          uid: uid.trim(),
          source: 'beta-program',
          type: 'beta_application',
        }),
      }).catch(() => {})

      setPageStep('success')
    } catch {
      setError(t.err_generic)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="marble-bg" />

        {/* Language Selector */}
        <div className="lang-selector" ref={langRef}>
          <button
            className="lang-btn"
            onClick={() => setLangOpen(!langOpen)}
            aria-label={`Select language: ${langLabels[lang]}`}
            aria-expanded={langOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
            </svg>
            {langLabels[lang]}
          </button>
          {langOpen && (
            <div className="lang-dropdown" role="listbox" aria-label="Select language">
              {(Object.keys(langLabels) as LangKey[]).map(code => (
                <button
                  key={code}
                  role="option"
                  aria-selected={code === lang}
                  className={`lang-option${code === lang ? ' active' : ''}`}
                  onClick={() => { setLang(code); setLangOpen(false) }}
                >
                  {langLabels[code]}
                </button>
              ))}
            </div>
          )}
        </div>

        <main className="beta-page" id="main-content">
          {/* Logo */}
          <img src={LOGO_URL} alt="SYSTM8" className="beta-logo" width={110} height={110} />

          {/* Title */}
          <h1 className="beta-title">{t.title}</h1>

          {/* Subtitle — exclusive tone */}
          <p className="beta-subtitle">
            {t.subtitle}
            <br /><br />
            <strong>{t.subtitle2}</strong>
          </p>

          {/* Badges */}
          <div className="badge-row">
            <span className="badge badge-gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {t.invite_badge}
            </span>
            <span className="badge badge-team">
              {t.team_badge}
            </span>
          </div>

          {/* Stepper */}
          <div>
            <div className="stepper">
              <div className={`step-dot ${pageStep === 'form' ? 'active' : 'done'}`}>
                {pageStep === 'success' ? '\u2713' : '1'}
              </div>
              <div className={`step-line ${stepIndex >= 1 ? 'done' : ''}`} />
              <div className={`step-dot ${stepIndex >= 1 ? (stepIndex >= 2 ? 'done' : 'active') : ''}`}>
                {stepIndex >= 2 ? '\u2713' : '2'}
              </div>
              <div className={`step-line ${stepIndex >= 2 ? 'done' : ''}`} />
              <div className={`step-dot ${stepIndex >= 2 ? 'active' : ''}`}>3</div>
            </div>
            <div className="step-labels">
              <span className={`step-label ${pageStep === 'form' ? 'active' : ''}`}>{t.step1}</span>
              <span className="step-label">{t.step2}</span>
              <span className={`step-label ${pageStep === 'success' ? 'active' : ''}`}>{t.step3}</span>
            </div>
          </div>

          {/* ── FORM STEP ── */}
          {pageStep === 'form' && (
            <>
              <div className="beta-card" key="form">
                <h2 className="card-h">{t.card_h}</h2>
                <p className="card-p">{t.card_p}</p>

                {error && <div className="msg msg-error" role="alert">{error}</div>}

                <div className="field">
                  <label className="field-label" htmlFor="beta-name">{t.name_label}</label>
                  <input
                    ref={nameRef}
                    id="beta-name"
                    className="field-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.name_ph}
                    autoComplete="name"
                    aria-required="true"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('beta-email')?.focus()}
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="beta-email">{t.email_label}</label>
                  <input
                    id="beta-email"
                    className="field-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.email_ph}
                    autoComplete="email"
                    aria-required="true"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('beta-uid')?.focus()}
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="beta-uid">{t.uid_label}</label>
                  <input
                    id="beta-uid"
                    className="field-input"
                    type="text"
                    value={uid}
                    onChange={e => setUid(e.target.value)}
                    placeholder={t.uid_ph}
                    inputMode="numeric"
                    aria-required="true"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('beta-phone')?.focus()}
                  />
                  <p className="field-hint">{t.uid_hint}</p>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="beta-phone">
                    {t.phone_label} <span style={{ opacity: 0.5 }}>{t.phone_opt}</span>
                  </label>
                  <input
                    id="beta-phone"
                    className="field-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t.phone_ph}
                    autoComplete="tel"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                <button
                  className="gold-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? t.loading : t.submit}
                </button>
              </div>

              {/* Why Section */}
              <div className="why-section">
                <h3 className="why-h">{t.why_h}</h3>
                <p className="why-p">{t.why_p}</p>
                <div className="feat-grid">
                  {[t.feat_1, t.feat_2, t.feat_3, t.feat_4, t.feat_5].map((feat, i) => (
                    <div className="feat-item" key={i}>
                      <span className="feat-check" aria-hidden="true">&#10003;</span>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SUCCESS STEP ── */}
          {pageStep === 'success' && (
            <div className="beta-card" key="success">
              <div className="success-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a9d5a" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h2 className="card-h">{t.success_h}</h2>
              <p className="card-p">{t.success_p1.replace('{name}', name.split(' ')[0])}</p>

              <div className="success-uid-box">
                <div className="uid-val">{t.success_uid.replace('{uid}', uid)}</div>
                <div className="uid-status">{t.success_status}</div>
              </div>

              <p className="card-p" style={{ marginBottom: '0.75rem' }}>
                {t.success_p2}
              </p>
              <p className="card-p" style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: 'var(--gold-light)', opacity: 0.8 }}>
                {t.success_p3}
              </p>

              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1.25rem', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                {t.what_h}
              </h3>

              <ol className="next-steps">
                {[t.what_1, t.what_2, t.what_3, t.what_4].map((item, i) => (
                  <li key={i}>
                    <span className="step-num">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Footer Note */}
          <p className="beta-footer">{t.footer_note}</p>
        </main>
      </div>
    </>
  )
}
