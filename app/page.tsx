'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function parseProfileImage(value: string | null) {
  if (!value) return { url: '', x: 50, y: 50 }
  try {
    const p = JSON.parse(value)
    if (p && typeof p.url === 'string') return { url: p.url, x: p.x ?? 50, y: p.y ?? 50 }
  } catch {}
  return { url: value, x: 50, y: 50 }
}

function serializeProfileImage(url: string, x: number, y: number): string {
  return JSON.stringify({ url, x, y })
}

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

/* ─────────────────────────────────────────────
   TRANSLATIONS
   ───────────────────────────────────────────── */
const translations: Record<string, Record<string, string>> = {
  en: {
    leadsTab: 'Leads',
    profileTab: 'My profile',
    registerLead: 'Register new lead manually',
    fullName: 'Full name',
    emailAddress: 'Email address',
    uidPlaceholder: 'UID from PuPrime broker',
    addLead: 'Add lead',
    sending: 'Sending...',
    pendingHeader: 'Awaiting verification',
    noPending: 'No leads waiting.',
    approvedHeader: 'Approved members',
    noApproved: 'No approved members yet.',
    approve: 'Approve',
    approvedDate: 'Approved',
    notProvided: 'Not provided',
    editProfile: 'Edit profile',
    profileImage: 'Profile image',
    uploadImage: 'Upload image',
    changeImage: 'Change image',
    uploading: 'Uploading...',
    imageHint: 'JPG or PNG · Max 5MB',
    yourUrl: 'Your URL',
    bio: 'Bio',
    bioPlaceholder: 'Tell who you are and what your members can expect from you...',
    saveProfile: 'Save profile',
    saving: 'Saving...',
    saved: 'Saved!',
    yourPage: 'Your page',
    viewPage: 'View my page',
    logout: 'Log out',
    loading: 'Loading...',
    aiHelper: 'AI helps you',
    aiTitle: 'AI Bio-assistant',
    startAi: 'Start AI assistant',
    aiGenerating: 'Generating your bio...',
    aiNext: 'Next',
    aiChooseTone: 'Choose a tone for your bio:',
    aiPreview: 'Your generated bio:',
    aiUseThis: 'Use this bio',
    aiRegenerate: 'Generate new',
    aiStartOver: 'Start over',
    aiOtherLangs: 'View in other languages',
    aiStepOf: 'of',
    fillAll: 'Fill in all fields',
    referralRequired: 'This field must be filled in',
    slugTaken: 'This URL is already in use. Please choose another.',
    socialMedia: 'Social media',
    metricsTab: 'Metrics',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    allTime: 'All time',
    pageViews: 'Page Views',
    uniqueVisitors: 'unique visitors',
    conversions: 'Conversions',
    rate: 'rate',
    conversionRate: 'Conversion Rate',
    regToApproved: 'reg → approved',
    profileStrength: 'Profile Strength',
    customUrl: 'Custom URL',
    referralLink: 'Referral link',
    approvalRate: 'Approval Rate',
    xOfYVerified: '{0} of {1} verified',
    pageViewsOverTime: 'Page Views Over Time',
    leadBreakdown: 'Lead breakdown',
    registeredLeads: 'Registered leads',
    pendingVerification: 'Pending verification',
    conversionRateLower: 'Conversion rate',
    pending: 'pending',
    approved: 'approved',
    ibResourcesTab: 'IB Resources',
    ibResourcesSubtitle: 'Tools and training to help you succeed',
    ibTraining: 'IB Training',
    ibTrainingDesc: 'Access training materials and guides to help you get started',
    contentLibrary: 'Content Library',
    contentLibraryDesc: 'Browse marketing content, templates and inspiration for your social media',
    comingSoon: 'Coming soon',
    vipSupport: 'VIP Support',
    vipSupportDesc: 'Direct access to VIP support for IB partners',
    pvPresentation: 'PV Presentation',
    pvPresentationDesc: 'View the official PrimeVerse presentation',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Other URL',
    updateInfo: 'Update my information',
    updating: 'Updating...',
    updated: 'Updated!',
    generatePage: 'Generate my landing page',
    generatingPage: 'Generating your page...',
    pageIsLive: 'Your page is live!',
    dragToReposition: 'Drag to reposition',
    rememberToSave: 'Remember to save after repositioning',
    pageLiveAt: 'Your landing page is ready and live at:',
    viewLandingPage: 'View your landing page',
    yourPageAt: 'Your page:',
    aiDescription: 'Answer 5 questions, choose a tone, and AI will create a professional bio for you — in all languages.',
    somethingWentWrong: 'Something went wrong',
    noDataYet: 'No data yet',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Upload error: ',
    reportBug: 'Report a bug',
    bugModalTitle: 'Report a bug',
    bugModalInstructions: 'Help us improve SYSTM8! Please include a screenshot of the problem — reports without screenshots will not be processed.',
    bugWhatHappened: 'What happened?',
    bugWhatExpected: 'What did you expect to happen?',
    bugWhichPage: 'Which page were you on?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Other',
    bugScreenshot: 'Screenshot',
    bugScreenshotHint: 'PNG or JPG · Max 5MB',
    bugScreenshotRequired: 'Screenshot is required',
    bugSeverity: 'Severity',
    bugSeverityCritical: 'Critical',
    bugSeverityHigh: 'High',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Low',
    bugSend: 'Send report',
    bugCancel: 'Cancel',
    bugSending: 'Sending...',
    bugSuccess: 'Thank you! Your report has been sent.',
    bugFillRequired: 'Please fill in all required fields and attach a screenshot.',
  },
  no: {
    leadsTab: 'Leads',
    profileTab: 'Min profil',
    registerLead: 'Registrer nytt lead manuelt',
    fullName: 'Fullt navn',
    emailAddress: 'Epostadresse',
    uidPlaceholder: 'UID fra PuPrime broker',
    addLead: 'Legg til lead',
    sending: 'Sender...',
    pendingHeader: 'Venter på verifisering',
    noPending: 'Ingen leads venter.',
    approvedHeader: 'Godkjente members',
    noApproved: 'Ingen godkjente ennå.',
    approve: 'Godkjenn',
    approvedDate: 'Godkjent',
    notProvided: 'Ikke oppgitt',
    editProfile: 'Rediger profil',
    profileImage: 'Profilbilde',
    uploadImage: 'Last opp bilde',
    changeImage: 'Bytt bilde',
    uploading: 'Laster opp...',
    imageHint: 'JPG eller PNG · Maks 5MB',
    yourUrl: 'Din URL',
    bio: 'Bio',
    bioPlaceholder: 'Fortell hvem du er og hva dine members kan forvente av deg...',
    saveProfile: 'Lagre profil',
    saving: 'Lagrer...',
    saved: 'Lagret!',
    yourPage: 'Din side',
    viewPage: 'Se min side',
    logout: 'Logg ut',
    loading: 'Laster...',
    aiHelper: 'AI hjelper deg',
    aiTitle: 'AI Bio-assistent',
    startAi: 'Start AI-assistenten',
    aiGenerating: 'Genererer bioen din...',
    aiNext: 'Neste',
    aiChooseTone: 'Velg en tone for bioen din:',
    aiPreview: 'Din genererte bio:',
    aiUseThis: 'Bruk denne',
    aiRegenerate: 'Generer ny',
    aiStartOver: 'Start på nytt',
    aiOtherLangs: 'Se på andre språk',
    aiStepOf: 'av',
    fillAll: 'Fyll inn alle feltene',
    referralRequired: 'Dette feltet må fylles ut',
    slugTaken: 'Denne URL-en er allerede i bruk. Velg en annen.',
    socialMedia: 'Sosiale medier',
    metricsTab: 'Metrikk',
    daily: 'Daglig',
    weekly: 'Ukentlig',
    monthly: 'Månedlig',
    allTime: 'All tid',
    pageViews: 'Sidevisninger',
    uniqueVisitors: 'unike besøkende',
    conversions: 'Konverteringer',
    rate: 'rate',
    conversionRate: 'Konverteringsrate',
    regToApproved: 'reg → godkjent',
    profileStrength: 'Profilstyrke',
    customUrl: 'Egendefinert URL',
    referralLink: 'Referanselenke',
    approvalRate: 'Godkjenningsrate',
    xOfYVerified: '{0} av {1} verifisert',
    pageViewsOverTime: 'Sidevisninger over tid',
    leadBreakdown: 'Lead-oversikt',
    registeredLeads: 'Registrerte leads',
    pendingVerification: 'Venter på verifisering',
    conversionRateLower: 'Konverteringsrate',
    pending: 'ventende',
    approved: 'godkjent',
    ibResourcesTab: 'IB-ressurser',
    ibResourcesSubtitle: 'Verktøy og opplæring for å hjelpe deg å lykkes',
    ibTraining: 'IB-opplæring',
    ibTrainingDesc: 'Tilgang til opplæringsmateriell og guider for å komme i gang',
    contentLibrary: 'Innholdsbibliotek',
    contentLibraryDesc: 'Bla gjennom markedsføringsinnhold, maler og inspirasjon for sosiale medier',
    comingSoon: 'Kommer snart',
    vipSupport: 'VIP-støtte',
    vipSupportDesc: 'Direkte tilgang til VIP-støtte for IB-partnere',
    pvPresentation: 'PV-presentasjon',
    pvPresentationDesc: 'Se den offisielle PrimeVerse-presentasjonen',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Annen URL',
    updateInfo: 'Oppdater mine opplysninger',
    updating: 'Oppdaterer...',
    updated: 'Oppdatert!',
    generatePage: 'Generer landingssiden min',
    generatingPage: 'Genererer siden din...',
    pageIsLive: 'Siden din er live!',
    dragToReposition: 'Dra for å reposisjonere',
    rememberToSave: 'Husk å lagre etter reposisjonering',
    pageLiveAt: 'Landingssiden din er klar og live på:',
    viewLandingPage: 'Se landingssiden din',
    yourPageAt: 'Din side:',
    aiDescription: 'Svar på 5 spørsmål, velg en tone, og AI lager en profesjonell bio for deg — på alle språk.',
    somethingWentWrong: 'Noe gikk galt',
    noDataYet: 'Ingen data ennå',
    errorPrefix: 'Feil: ',
    uploadErrorPrefix: 'Feil ved opplasting: ',
    reportBug: 'Rapporter en feil',
    bugModalTitle: 'Rapporter en feil',
    bugModalInstructions: 'Hjelp oss å forbedre SYSTM8! Vennligst inkluder et skjermbilde av problemet — rapporter uten skjermbilder vil ikke bli behandlet.',
    bugWhatHappened: 'Hva skjedde?',
    bugWhatExpected: 'Hva forventet du skulle skje?',
    bugWhichPage: 'Hvilken side var du på?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landingsside',
    bugPageLogin: 'Innlogging',
    bugPageOther: 'Annet',
    bugScreenshot: 'Skjermbilde',
    bugScreenshotHint: 'PNG eller JPG · Maks 5MB',
    bugScreenshotRequired: 'Skjermbilde er påkrevd',
    bugSeverity: 'Alvorlighetsgrad',
    bugSeverityCritical: 'Kritisk',
    bugSeverityHigh: 'Høy',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Lav',
    bugSend: 'Send rapport',
    bugCancel: 'Avbryt',
    bugSending: 'Sender...',
    bugSuccess: 'Takk! Din rapport er sendt.',
    bugFillRequired: 'Vennligst fyll inn alle påkrevde felt og legg ved et skjermbilde.',
  },
  sv: {
    leadsTab: 'Leads',
    profileTab: 'Min profil',
    registerLead: 'Registrera nytt lead manuellt',
    fullName: 'Fullständigt namn',
    emailAddress: 'E-postadress',
    uidPlaceholder: 'UID från PuPrime broker',
    addLead: 'Lägg till lead',
    sending: 'Skickar...',
    pendingHeader: 'Väntar på verifiering',
    noPending: 'Inga leads väntar.',
    approvedHeader: 'Godkända members',
    noApproved: 'Inga godkända ännu.',
    approve: 'Godkänn',
    approvedDate: 'Godkänd',
    notProvided: 'Ej angiven',
    editProfile: 'Redigera profil',
    profileImage: 'Profilbild',
    uploadImage: 'Ladda upp bild',
    changeImage: 'Byt bild',
    uploading: 'Laddar upp...',
    imageHint: 'JPG eller PNG · Max 5MB',
    yourUrl: 'Din URL',
    bio: 'Bio',
    bioPlaceholder: 'Berätta vem du är och vad dina members kan förvänta sig...',
    saveProfile: 'Spara profil',
    saving: 'Sparar...',
    saved: 'Sparat!',
    yourPage: 'Din sida',
    viewPage: 'Se min sida',
    logout: 'Logga ut',
    loading: 'Laddar...',
    aiHelper: 'AI hjälper dig',
    aiTitle: 'AI Bio-assistent',
    startAi: 'Starta AI-assistenten',
    aiGenerating: 'Genererar din bio...',
    aiNext: 'Nästa',
    aiChooseTone: 'Välj en ton för din bio:',
    aiPreview: 'Din genererade bio:',
    aiUseThis: 'Använd denna',
    aiRegenerate: 'Generera ny',
    aiStartOver: 'Börja om',
    aiOtherLangs: 'Visa på andra språk',
    aiStepOf: 'av',
    fillAll: 'Fyll i alla fält',
    referralRequired: 'Detta fält måste fyllas i',
    slugTaken: 'Denna URL används redan. Välj en annan.',
    socialMedia: 'Sociala medier',
    metricsTab: 'Statistik',
    daily: 'Dagligen',
    weekly: 'Veckovis',
    monthly: 'Månadsvis',
    allTime: 'All tid',
    pageViews: 'Sidvisningar',
    uniqueVisitors: 'unika besökare',
    conversions: 'Konverteringar',
    rate: 'andel',
    conversionRate: 'Konverteringsgrad',
    regToApproved: 'reg → godkänd',
    profileStrength: 'Profilstyrka',
    customUrl: 'Anpassad URL',
    referralLink: 'Referenslänk',
    approvalRate: 'Godkännandegrad',
    xOfYVerified: '{0} av {1} verifierade',
    pageViewsOverTime: 'Sidvisningar över tid',
    leadBreakdown: 'Lead-översikt',
    registeredLeads: 'Registrerade leads',
    pendingVerification: 'Väntar på verifiering',
    conversionRateLower: 'Konverteringsgrad',
    pending: 'väntande',
    approved: 'godkända',
    ibResourcesTab: 'IB-resurser',
    ibResourcesSubtitle: 'Verktyg och utbildning för att hjälpa dig lyckas',
    ibTraining: 'IB-utbildning',
    ibTrainingDesc: 'Tillgång till utbildningsmaterial och guider för att komma igång',
    contentLibrary: 'Innehållsbibliotek',
    contentLibraryDesc: 'Bläddra bland marknadsföringsinnehåll, mallar och inspiration för sociala medier',
    comingSoon: 'Kommer snart',
    vipSupport: 'VIP-support',
    vipSupportDesc: 'Direkt tillgång till VIP-support för IB-partners',
    pvPresentation: 'PV-presentation',
    pvPresentationDesc: 'Se den officiella PrimeVerse-presentationen',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Annan URL',
    updateInfo: 'Uppdatera mina uppgifter',
    updating: 'Uppdaterar...',
    updated: 'Uppdaterat!',
    generatePage: 'Generera min landningssida',
    generatingPage: 'Genererar din sida...',
    pageIsLive: 'Din sida är live!',
    dragToReposition: 'Dra för att flytta',
    rememberToSave: 'Kom ihåg att spara efter ompositionering',
    pageLiveAt: 'Din landningssida är klar och live på:',
    viewLandingPage: 'Se din landningssida',
    yourPageAt: 'Din sida:',
    aiDescription: 'Svara på 5 frågor, välj en ton, så skapar AI en professionell bio åt dig — på alla språk.',
    somethingWentWrong: 'Något gick fel',
    noDataYet: 'Ingen data ännu',
    errorPrefix: 'Fel: ',
    uploadErrorPrefix: 'Uppladdningsfel: ',
    reportBug: 'Rapportera en bugg',
    bugModalTitle: 'Rapportera en bugg',
    bugModalInstructions: 'Hjälp oss förbättra SYSTM8! Inkludera en skärmbild av problemet — rapporter utan skärmbilder kommer inte att behandlas.',
    bugWhatHappened: 'Vad hände?',
    bugWhatExpected: 'Vad förväntade du dig skulle hända?',
    bugWhichPage: 'Vilken sida var du på?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landningssida',
    bugPageLogin: 'Inloggning',
    bugPageOther: 'Annat',
    bugScreenshot: 'Skärmbild',
    bugScreenshotHint: 'PNG eller JPG · Max 5MB',
    bugScreenshotRequired: 'Skärmbild krävs',
    bugSeverity: 'Allvarlighetsgrad',
    bugSeverityCritical: 'Kritisk',
    bugSeverityHigh: 'Hög',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Låg',
    bugSend: 'Skicka rapport',
    bugCancel: 'Avbryt',
    bugSending: 'Skickar...',
    bugSuccess: 'Tack! Din rapport har skickats.',
    bugFillRequired: 'Fyll i alla obligatoriska fält och bifoga en skärmbild.',
  },
  es: {
    leadsTab: 'Leads',
    profileTab: 'Mi perfil',
    registerLead: 'Registrar nuevo lead manualmente',
    fullName: 'Nombre completo',
    emailAddress: 'Correo electrónico',
    uidPlaceholder: 'UID de PuPrime broker',
    addLead: 'Agregar lead',
    sending: 'Enviando...',
    pendingHeader: 'Esperando verificación',
    noPending: 'No hay leads esperando.',
    approvedHeader: 'Miembros aprobados',
    noApproved: 'Ningún aprobado aún.',
    approve: 'Aprobar',
    approvedDate: 'Aprobado',
    notProvided: 'No proporcionado',
    editProfile: 'Editar perfil',
    profileImage: 'Foto de perfil',
    uploadImage: 'Subir imagen',
    changeImage: 'Cambiar imagen',
    uploading: 'Subiendo...',
    imageHint: 'JPG o PNG · Máx 5MB',
    yourUrl: 'Tu URL',
    bio: 'Bio',
    bioPlaceholder: 'Cuenta quién eres y qué pueden esperar tus miembros...',
    saveProfile: 'Guardar perfil',
    saving: 'Guardando...',
    saved: '¡Guardado!',
    yourPage: 'Tu página',
    viewPage: 'Ver mi página',
    logout: 'Cerrar sesión',
    loading: 'Cargando...',
    aiHelper: 'AI te ayuda',
    aiTitle: 'AI Bio-asistente',
    startAi: 'Iniciar asistente AI',
    aiGenerating: 'Generando tu bio...',
    aiNext: 'Siguiente',
    aiChooseTone: 'Elige un tono para tu bio:',
    aiPreview: 'Tu bio generada:',
    aiUseThis: 'Usar esta',
    aiRegenerate: 'Generar nueva',
    aiStartOver: 'Empezar de nuevo',
    aiOtherLangs: 'Ver en otros idiomas',
    aiStepOf: 'de',
    fillAll: 'Completa todos los campos',
    referralRequired: 'Este campo debe completarse',
    slugTaken: 'Esta URL ya está en uso. Elige otra.',
    socialMedia: 'Redes sociales',
    metricsTab: 'Métricas',
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    allTime: 'Todo el tiempo',
    pageViews: 'Visitas',
    uniqueVisitors: 'visitantes únicos',
    conversions: 'Conversiones',
    rate: 'tasa',
    conversionRate: 'Tasa de conversión',
    regToApproved: 'reg → aprobado',
    profileStrength: 'Fortaleza del perfil',
    customUrl: 'URL personalizada',
    referralLink: 'Enlace de referencia',
    approvalRate: 'Tasa de aprobación',
    xOfYVerified: '{0} de {1} verificados',
    pageViewsOverTime: 'Visitas a lo largo del tiempo',
    leadBreakdown: 'Desglose de leads',
    registeredLeads: 'Leads registrados',
    pendingVerification: 'Pendiente de verificación',
    conversionRateLower: 'Tasa de conversión',
    pending: 'pendientes',
    approved: 'aprobados',
    ibResourcesTab: 'Recursos IB',
    ibResourcesSubtitle: 'Herramientas y formación para ayudarte a tener éxito',
    ibTraining: 'Formación IB',
    ibTrainingDesc: 'Accede a materiales de formación y guías para comenzar',
    contentLibrary: 'Biblioteca de contenido',
    contentLibraryDesc: 'Explora contenido de marketing, plantillas e inspiración para tus redes sociales',
    comingSoon: 'Próximamente',
    vipSupport: 'Soporte VIP',
    vipSupportDesc: 'Acceso directo a soporte VIP para socios IB',
    pvPresentation: 'Presentación PV',
    pvPresentationDesc: 'Ver la presentación oficial de PrimeVerse',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Otra URL',
    updateInfo: 'Actualizar mis datos',
    updating: 'Actualizando...',
    updated: '¡Actualizado!',
    generatePage: 'Generar mi página',
    generatingPage: 'Generando tu página...',
    pageIsLive: '¡Tu página está en línea!',
    dragToReposition: 'Arrastra para reposicionar',
    rememberToSave: 'Recuerda guardar después de reposicionar',
    pageLiveAt: 'Tu página de aterrizaje está lista y activa en:',
    viewLandingPage: 'Ver tu página de aterrizaje',
    yourPageAt: 'Tu página:',
    aiDescription: 'Responde 5 preguntas, elige un tono, y la IA creará una bio profesional para ti — en todos los idiomas.',
    somethingWentWrong: 'Algo salió mal',
    noDataYet: 'Aún no hay datos',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Error de carga: ',
    reportBug: 'Reportar un error',
    bugModalTitle: 'Reportar un error',
    bugModalInstructions: '¡Ayúdanos a mejorar SYSTM8! Por favor incluye una captura de pantalla del problema — los reportes sin capturas no serán procesados.',
    bugWhatHappened: '¿Qué pasó?',
    bugWhatExpected: '¿Qué esperabas que pasara?',
    bugWhichPage: '¿En qué página estabas?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Página de aterrizaje',
    bugPageLogin: 'Inicio de sesión',
    bugPageOther: 'Otro',
    bugScreenshot: 'Captura de pantalla',
    bugScreenshotHint: 'PNG o JPG · Máx 5MB',
    bugScreenshotRequired: 'La captura de pantalla es obligatoria',
    bugSeverity: 'Gravedad',
    bugSeverityCritical: 'Crítica',
    bugSeverityHigh: 'Alta',
    bugSeverityMedium: 'Media',
    bugSeverityLow: 'Baja',
    bugSend: 'Enviar reporte',
    bugCancel: 'Cancelar',
    bugSending: 'Enviando...',
    bugSuccess: '¡Gracias! Tu reporte ha sido enviado.',
    bugFillRequired: 'Por favor completa todos los campos obligatorios y adjunta una captura de pantalla.',
  },
  ru: {
    leadsTab: 'Лиды',
    profileTab: 'Мой профиль',
    registerLead: 'Зарегистрировать лид вручную',
    fullName: 'Полное имя',
    emailAddress: 'Электронная почта',
    uidPlaceholder: 'UID от брокера PuPrime',
    addLead: 'Добавить лид',
    sending: 'Отправка...',
    pendingHeader: 'Ожидают верификации',
    noPending: 'Нет ожидающих лидов.',
    approvedHeader: 'Одобренные участники',
    noApproved: 'Пока нет одобренных.',
    approve: 'Одобрить',
    approvedDate: 'Одобрен',
    notProvided: 'Не указан',
    editProfile: 'Редактировать профиль',
    profileImage: 'Фото профиля',
    uploadImage: 'Загрузить фото',
    changeImage: 'Сменить фото',
    uploading: 'Загрузка...',
    imageHint: 'JPG или PNG · Макс 5МБ',
    yourUrl: 'Ваш URL',
    bio: 'Биография',
    bioPlaceholder: 'Расскажите, кто вы и чего могут ожидать ваши участники...',
    saveProfile: 'Сохранить профиль',
    saving: 'Сохранение...',
    saved: 'Сохранено!',
    yourPage: 'Ваша страница',
    viewPage: 'Моя страница',
    logout: 'Выйти',
    loading: 'Загрузка...',
    aiHelper: 'AI помогает',
    aiTitle: 'AI Био-ассистент',
    startAi: 'Запустить AI-ассистента',
    aiGenerating: 'Генерируем вашу биографию...',
    aiNext: 'Далее',
    aiChooseTone: 'Выберите тон для биографии:',
    aiPreview: 'Ваша сгенерированная биография:',
    aiUseThis: 'Использовать',
    aiRegenerate: 'Сгенерировать новую',
    aiStartOver: 'Начать сначала',
    aiOtherLangs: 'Посмотреть на других языках',
    aiStepOf: 'из',
    fillAll: 'Заполните все поля',
    referralRequired: 'Это поле обязательно для заполнения',
    slugTaken: 'Этот URL уже используется. Выберите другой.',
    socialMedia: 'Социальные сети',
    metricsTab: 'Метрики',
    daily: 'За день',
    weekly: 'За неделю',
    monthly: 'За месяц',
    allTime: 'За всё время',
    pageViews: 'Просмотры',
    uniqueVisitors: 'уникальных посетителей',
    conversions: 'Конверсии',
    rate: 'процент',
    conversionRate: 'Коэффициент конверсии',
    regToApproved: 'рег → одобрен',
    profileStrength: 'Сила профиля',
    customUrl: 'Свой URL',
    referralLink: 'Реферальная ссылка',
    approvalRate: 'Процент одобрения',
    xOfYVerified: '{0} из {1} подтверждено',
    pageViewsOverTime: 'Просмотры за период',
    leadBreakdown: 'Разбивка лидов',
    registeredLeads: 'Зарегистрированные лиды',
    pendingVerification: 'Ожидают верификации',
    conversionRateLower: 'Коэффициент конверсии',
    pending: 'ожидают',
    approved: 'одобрено',
    ibResourcesTab: 'Ресурсы IB',
    ibResourcesSubtitle: 'Инструменты и обучение для вашего успеха',
    ibTraining: 'Обучение IB',
    ibTrainingDesc: 'Доступ к учебным материалам и руководствам для начала работы',
    contentLibrary: 'Библиотека контента',
    contentLibraryDesc: 'Просматривайте маркетинговый контент, шаблоны и вдохновение для соцсетей',
    comingSoon: 'Скоро',
    vipSupport: 'VIP-поддержка',
    vipSupportDesc: 'Прямой доступ к VIP-поддержке для IB-партнёров',
    pvPresentation: 'Презентация PV',
    pvPresentationDesc: 'Посмотреть официальную презентацию PrimeVerse',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Другая URL',
    updateInfo: 'Обновить мои данные',
    updating: 'Обновление...',
    updated: 'Обновлено!',
    generatePage: 'Создать мою страницу',
    generatingPage: 'Создаём вашу страницу...',
    pageIsLive: 'Ваша страница онлайн!',
    dragToReposition: 'Перетащите для изменения позиции',
    rememberToSave: 'Не забудьте сохранить после изменения позиции',
    pageLiveAt: 'Ваша страница готова и доступна по адресу:',
    viewLandingPage: 'Посмотреть вашу страницу',
    yourPageAt: 'Ваша страница:',
    aiDescription: 'Ответьте на 5 вопросов, выберите тон, и AI создаст профессиональную биографию — на всех языках.',
    somethingWentWrong: 'Что-то пошло не так',
    noDataYet: 'Данных пока нет',
    errorPrefix: 'Ошибка: ',
    uploadErrorPrefix: 'Ошибка загрузки: ',
    reportBug: 'Сообщить об ошибке',
    bugModalTitle: 'Сообщить об ошибке',
    bugModalInstructions: 'Помогите нам улучшить SYSTM8! Пожалуйста, приложите скриншот проблемы — отчёты без скриншотов не будут обработаны.',
    bugWhatHappened: 'Что произошло?',
    bugWhatExpected: 'Что вы ожидали?',
    bugWhichPage: 'На какой странице вы были?',
    bugPageDashboard: 'Панель управления',
    bugPageLanding: 'Лендинг',
    bugPageLogin: 'Вход',
    bugPageOther: 'Другое',
    bugScreenshot: 'Скриншот',
    bugScreenshotHint: 'PNG или JPG · Макс 5МБ',
    bugScreenshotRequired: 'Скриншот обязателен',
    bugSeverity: 'Серьёзность',
    bugSeverityCritical: 'Критическая',
    bugSeverityHigh: 'Высокая',
    bugSeverityMedium: 'Средняя',
    bugSeverityLow: 'Низкая',
    bugSend: 'Отправить отчёт',
    bugCancel: 'Отмена',
    bugSending: 'Отправка...',
    bugSuccess: 'Спасибо! Ваш отчёт отправлен.',
    bugFillRequired: 'Пожалуйста, заполните все обязательные поля и прикрепите скриншот.',
  },
  ar: {
    leadsTab: 'العملاء المحتملون',
    profileTab: 'ملفي الشخصي',
    registerLead: 'تسجيل عميل محتمل يدوياً',
    fullName: 'الاسم الكامل',
    emailAddress: 'البريد الإلكتروني',
    uidPlaceholder: 'UID من وسيط PuPrime',
    addLead: 'إضافة عميل',
    sending: 'جاري الإرسال...',
    pendingHeader: 'بانتظار التحقق',
    noPending: 'لا يوجد عملاء بالانتظار.',
    approvedHeader: 'الأعضاء المعتمدون',
    noApproved: 'لا يوجد معتمدون بعد.',
    approve: 'اعتماد',
    approvedDate: 'معتمد',
    notProvided: 'غير متوفر',
    editProfile: 'تعديل الملف الشخصي',
    profileImage: 'صورة الملف الشخصي',
    uploadImage: 'رفع صورة',
    changeImage: 'تغيير الصورة',
    uploading: 'جاري الرفع...',
    imageHint: 'JPG أو PNG · حد أقصى 5MB',
    yourUrl: 'رابطك',
    bio: 'نبذة',
    bioPlaceholder: 'أخبرنا من أنت وماذا يمكن لأعضائك توقعه...',
    saveProfile: 'حفظ الملف الشخصي',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ!',
    yourPage: 'صفحتك',
    viewPage: 'عرض صفحتي',
    logout: 'تسجيل خروج',
    loading: 'جاري التحميل...',
    aiHelper: 'AI يساعدك',
    aiTitle: 'مساعد AI للنبذة',
    startAi: 'بدء مساعد AI',
    aiGenerating: 'جارٍ إنشاء نبذتك...',
    aiNext: 'التالي',
    aiChooseTone: 'اختر نغمة لنبذتك:',
    aiPreview: 'نبذتك المُنشأة:',
    aiUseThis: 'استخدم هذه',
    aiRegenerate: 'إنشاء جديدة',
    aiStartOver: 'البدء من جديد',
    aiOtherLangs: 'عرض بلغات أخرى',
    aiStepOf: 'من',
    fillAll: 'املأ جميع الحقول',
    referralRequired: 'يجب ملء هذا الحقل',
    slugTaken: 'هذا الرابط مستخدم بالفعل. اختر رابطاً آخر.',
    socialMedia: 'وسائل التواصل الاجتماعي',
    metricsTab: 'المقاييس',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    allTime: 'كل الوقت',
    pageViews: 'مشاهدات الصفحة',
    uniqueVisitors: 'زوار فريدون',
    conversions: 'التحويلات',
    rate: 'معدل',
    conversionRate: 'معدل التحويل',
    regToApproved: 'تسجيل → معتمد',
    profileStrength: 'قوة الملف الشخصي',
    customUrl: 'رابط مخصص',
    referralLink: 'رابط الإحالة',
    approvalRate: 'معدل الاعتماد',
    xOfYVerified: '{0} من {1} تم التحقق',
    pageViewsOverTime: 'المشاهدات عبر الزمن',
    leadBreakdown: 'تفصيل العملاء',
    registeredLeads: 'عملاء مسجلون',
    pendingVerification: 'بانتظار التحقق',
    conversionRateLower: 'معدل التحويل',
    pending: 'معلق',
    approved: 'معتمد',
    ibResourcesTab: 'موارد IB',
    ibResourcesSubtitle: 'أدوات وتدريب لمساعدتك على النجاح',
    ibTraining: 'تدريب IB',
    ibTrainingDesc: 'الوصول إلى المواد التدريبية والأدلة لمساعدتك على البدء',
    contentLibrary: 'مكتبة المحتوى',
    contentLibraryDesc: 'تصفح محتوى التسويق والقوالب والإلهام لوسائل التواصل الاجتماعي',
    comingSoon: 'قريباً',
    vipSupport: 'دعم VIP',
    vipSupportDesc: 'وصول مباشر إلى دعم VIP لشركاء IB',
    pvPresentation: 'عرض PV',
    pvPresentationDesc: 'عرض العرض التقديمي الرسمي لـ PrimeVerse',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'رابط آخر',
    updateInfo: 'تحديث بياناتي',
    updating: 'جاري التحديث...',
    updated: 'تم التحديث!',
    generatePage: 'إنشاء صفحتي',
    generatingPage: 'جاري إنشاء صفحتك...',
    pageIsLive: 'صفحتك جاهزة!',
    dragToReposition: 'اسحب لتغيير الموضع',
    rememberToSave: 'تذكّر الحفظ بعد تغيير الموضع',
    pageLiveAt: 'صفحتك جاهزة ومباشرة على:',
    viewLandingPage: 'عرض صفحتك',
    yourPageAt: 'صفحتك:',
    aiDescription: 'أجب على 5 أسئلة، اختر نغمة، وسيقوم AI بإنشاء نبذة احترافية لك — بجميع اللغات.',
    somethingWentWrong: 'حدث خطأ',
    noDataYet: 'لا توجد بيانات بعد',
    errorPrefix: 'خطأ: ',
    uploadErrorPrefix: 'خطأ في التحميل: ',
    reportBug: 'الإبلاغ عن خطأ',
    bugModalTitle: 'الإبلاغ عن خطأ',
    bugModalInstructions: 'ساعدنا في تحسين SYSTM8! يرجى تضمين لقطة شاشة للمشكلة — لن تتم معالجة التقارير بدون لقطات شاشة.',
    bugWhatHappened: 'ماذا حدث؟',
    bugWhatExpected: 'ماذا كنت تتوقع أن يحدث؟',
    bugWhichPage: 'في أي صفحة كنت؟',
    bugPageDashboard: 'لوحة التحكم',
    bugPageLanding: 'صفحة الهبوط',
    bugPageLogin: 'تسجيل الدخول',
    bugPageOther: 'أخرى',
    bugScreenshot: 'لقطة شاشة',
    bugScreenshotHint: 'PNG أو JPG · الحد الأقصى 5 ميجابايت',
    bugScreenshotRequired: 'لقطة الشاشة مطلوبة',
    bugSeverity: 'الخطورة',
    bugSeverityCritical: 'حرجة',
    bugSeverityHigh: 'عالية',
    bugSeverityMedium: 'متوسطة',
    bugSeverityLow: 'منخفضة',
    bugSend: 'إرسال التقرير',
    bugCancel: 'إلغاء',
    bugSending: 'جارٍ الإرسال...',
    bugSuccess: 'شكراً! تم إرسال تقريرك.',
    bugFillRequired: 'يرجى ملء جميع الحقول المطلوبة وإرفاق لقطة شاشة.',
  },
  tl: {
    leadsTab: 'Leads',
    profileTab: 'Aking profile',
    registerLead: 'Mag-register ng bagong lead',
    fullName: 'Buong pangalan',
    emailAddress: 'Email address',
    uidPlaceholder: 'UID mula sa PuPrime broker',
    addLead: 'Idagdag ang lead',
    sending: 'Ipinapadala...',
    pendingHeader: 'Naghihintay ng verification',
    noPending: 'Walang naghihintay na leads.',
    approvedHeader: 'Approved members',
    noApproved: 'Wala pang approved.',
    approve: 'I-approve',
    approvedDate: 'Na-approve',
    notProvided: 'Hindi ibinigay',
    editProfile: 'I-edit ang profile',
    profileImage: 'Profile picture',
    uploadImage: 'Mag-upload ng larawan',
    changeImage: 'Palitan ang larawan',
    uploading: 'Nag-a-upload...',
    imageHint: 'JPG o PNG · Max 5MB',
    yourUrl: 'Iyong URL',
    bio: 'Bio',
    bioPlaceholder: 'Sabihin kung sino ka at ano ang maaasahan ng iyong members...',
    saveProfile: 'I-save ang profile',
    saving: 'Sine-save...',
    saved: 'Na-save!',
    yourPage: 'Iyong pahina',
    viewPage: 'Tingnan ang pahina ko',
    logout: 'Mag-logout',
    loading: 'Naglo-load...',
    aiHelper: 'AI tumutulong',
    aiTitle: 'AI Bio-assistant',
    startAi: 'Simulan ang AI assistant',
    aiGenerating: 'Ginagawa ang iyong bio...',
    aiNext: 'Susunod',
    aiChooseTone: 'Pumili ng tono para sa iyong bio:',
    aiPreview: 'Ang na-generate na bio mo:',
    aiUseThis: 'Gamitin ito',
    aiRegenerate: 'Gumawa ng bago',
    aiStartOver: 'Magsimula ulit',
    aiOtherLangs: 'Tingnan sa ibang wika',
    aiStepOf: 'ng',
    fillAll: 'Punan lahat ng fields',
    referralRequired: 'Kailangang punan ang field na ito',
    slugTaken: 'Ginagamit na ang URL na ito. Pumili ng iba.',
    socialMedia: 'Social media',
    metricsTab: 'Metrics',
    daily: 'Araw-araw',
    weekly: 'Lingguhan',
    monthly: 'Buwanan',
    allTime: 'Lahat ng oras',
    pageViews: 'Mga View',
    uniqueVisitors: 'natatanging bisita',
    conversions: 'Mga Conversion',
    rate: 'rate',
    conversionRate: 'Conversion Rate',
    regToApproved: 'reg → na-approve',
    profileStrength: 'Lakas ng Profile',
    customUrl: 'Custom URL',
    referralLink: 'Referral link',
    approvalRate: 'Approval Rate',
    xOfYVerified: '{0} sa {1} na-verify',
    pageViewsOverTime: 'Mga View sa Paglipas ng Panahon',
    leadBreakdown: 'Breakdown ng leads',
    registeredLeads: 'Mga naka-register na leads',
    pendingVerification: 'Naghihintay ng verification',
    conversionRateLower: 'Conversion rate',
    pending: 'naghihintay',
    approved: 'na-approve',
    ibResourcesTab: 'IB Resources',
    ibResourcesSubtitle: 'Mga tool at pagsasanay para makatulong sa iyong tagumpay',
    ibTraining: 'IB Training',
    ibTrainingDesc: 'I-access ang mga training material at gabay para makapagsimula',
    contentLibrary: 'Content Library',
    contentLibraryDesc: 'Mag-browse ng marketing content, template at inspirasyon para sa iyong social media',
    comingSoon: 'Malapit na',
    vipSupport: 'VIP Support',
    vipSupportDesc: 'Direktang access sa VIP support para sa mga IB partner',
    pvPresentation: 'PV Presentation',
    pvPresentationDesc: 'Tingnan ang opisyal na PrimeVerse presentation',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Ibang URL',
    updateInfo: 'I-update ang aking impormasyon',
    updating: 'Ina-update...',
    updated: 'Na-update!',
    generatePage: 'Gumawa ng aking landing page',
    generatingPage: 'Ginagawa ang iyong pahina...',
    pageIsLive: 'Live na ang pahina mo!',
    dragToReposition: 'I-drag para i-reposition',
    rememberToSave: 'Tandaan na i-save pagkatapos i-reposition',
    pageLiveAt: 'Ang landing page mo ay handa na at live sa:',
    viewLandingPage: 'Tingnan ang landing page mo',
    yourPageAt: 'Ang page mo:',
    aiDescription: 'Sagutin ang 5 tanong, pumili ng tono, at gagawa ang AI ng professional bio para sa iyo — sa lahat ng wika.',
    somethingWentWrong: 'May nangyaring mali',
    noDataYet: 'Wala pang data',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Error sa pag-upload: ',
    reportBug: 'Mag-report ng bug',
    bugModalTitle: 'Mag-report ng bug',
    bugModalInstructions: 'Tulungan kaming pagbutihin ang SYSTM8! Mangyaring mag-attach ng screenshot ng problema — hindi ipoproseso ang mga report na walang screenshot.',
    bugWhatHappened: 'Ano ang nangyari?',
    bugWhatExpected: 'Ano ang inaasahan mong mangyari?',
    bugWhichPage: 'Saang page ka?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Iba pa',
    bugScreenshot: 'Screenshot',
    bugScreenshotHint: 'PNG o JPG · Max 5MB',
    bugScreenshotRequired: 'Kailangan ang screenshot',
    bugSeverity: 'Kalubhaan',
    bugSeverityCritical: 'Kritikal',
    bugSeverityHigh: 'Mataas',
    bugSeverityMedium: 'Katamtaman',
    bugSeverityLow: 'Mababa',
    bugSend: 'Ipadala ang report',
    bugCancel: 'Kanselahin',
    bugSending: 'Ipinapadala...',
    bugSuccess: 'Salamat! Naipadala na ang iyong report.',
    bugFillRequired: 'Mangyaring punan ang lahat ng kinakailangang field at mag-attach ng screenshot.',
  },
  pt: {
    leadsTab: 'Leads',
    profileTab: 'Meu perfil',
    registerLead: 'Registrar novo lead manualmente',
    fullName: 'Nome completo',
    emailAddress: 'Endereço de e-mail',
    uidPlaceholder: 'UID do broker PuPrime',
    addLead: 'Adicionar lead',
    sending: 'Enviando...',
    pendingHeader: 'Aguardando verificação',
    noPending: 'Nenhum lead aguardando.',
    approvedHeader: 'Membros aprovados',
    noApproved: 'Nenhum aprovado ainda.',
    approve: 'Aprovar',
    approvedDate: 'Aprovado',
    notProvided: 'Não informado',
    editProfile: 'Editar perfil',
    profileImage: 'Foto de perfil',
    uploadImage: 'Enviar imagem',
    changeImage: 'Trocar imagem',
    uploading: 'Enviando...',
    imageHint: 'JPG ou PNG · Máx 5MB',
    yourUrl: 'Seu URL',
    bio: 'Bio',
    bioPlaceholder: 'Conte quem você é e o que seus membros podem esperar de você...',
    saveProfile: 'Salvar perfil',
    saving: 'Salvando...',
    saved: 'Salvo!',
    yourPage: 'Sua página',
    viewPage: 'Ver minha página',
    logout: 'Sair',
    loading: 'Carregando...',
    aiHelper: 'IA te ajuda',
    aiTitle: 'Assistente de Bio IA',
    startAi: 'Iniciar assistente IA',
    aiGenerating: 'Gerando sua bio...',
    aiNext: 'Próximo',
    aiChooseTone: 'Escolha um tom para sua bio:',
    aiPreview: 'Sua bio gerada:',
    aiUseThis: 'Usar esta',
    aiRegenerate: 'Gerar nova',
    aiStartOver: 'Recomeçar',
    aiOtherLangs: 'Ver em outros idiomas',
    aiStepOf: 'de',
    fillAll: 'Preencha todos os campos',
    referralRequired: 'Este campo deve ser preenchido',
    slugTaken: 'Este URL já está em uso. Escolha outro.',
    socialMedia: 'Redes sociais',
    metricsTab: 'Métricas',
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    allTime: 'Todo o período',
    pageViews: 'Visualizações',
    uniqueVisitors: 'visitantes únicos',
    conversions: 'Conversões',
    rate: 'taxa',
    conversionRate: 'Taxa de conversão',
    regToApproved: 'reg → aprovado',
    profileStrength: 'Força do perfil',
    customUrl: 'URL personalizado',
    referralLink: 'Link de indicação',
    approvalRate: 'Taxa de aprovação',
    xOfYVerified: '{0} de {1} verificados',
    pageViewsOverTime: 'Visualizações ao longo do tempo',
    leadBreakdown: 'Detalhamento de leads',
    registeredLeads: 'Leads registrados',
    pendingVerification: 'Aguardando verificação',
    conversionRateLower: 'Taxa de conversão',
    pending: 'pendentes',
    approved: 'aprovados',
    ibResourcesTab: 'Recursos IB',
    ibResourcesSubtitle: 'Ferramentas e treinamento para ajudá-lo a ter sucesso',
    ibTraining: 'Treinamento IB',
    ibTrainingDesc: 'Acesse materiais de treinamento e guias para começar',
    contentLibrary: 'Biblioteca de conteúdo',
    contentLibraryDesc: 'Navegue por conteúdo de marketing, modelos e inspiração para suas redes sociais',
    comingSoon: 'Em breve',
    vipSupport: 'Suporte VIP',
    vipSupportDesc: 'Acesso direto ao suporte VIP para parceiros IB',
    pvPresentation: 'Apresentação PV',
    pvPresentationDesc: 'Ver a apresentação oficial do PrimeVerse',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Outro URL',
    updateInfo: 'Atualizar minhas informações',
    updating: 'Atualizando...',
    updated: 'Atualizado!',
    generatePage: 'Gerar minha landing page',
    generatingPage: 'Gerando sua página...',
    pageIsLive: 'Sua página está no ar!',
    dragToReposition: 'Arraste para reposicionar',
    rememberToSave: 'Lembre-se de salvar após reposicionar',
    pageLiveAt: 'Sua landing page está pronta e no ar em:',
    viewLandingPage: 'Ver sua landing page',
    yourPageAt: 'Sua página:',
    aiDescription: 'Responda 5 perguntas, escolha um tom, e a IA criará uma bio profissional para você — em todos os idiomas.',
    somethingWentWrong: 'Algo deu errado',
    noDataYet: 'Ainda não há dados',
    errorPrefix: 'Erro: ',
    uploadErrorPrefix: 'Erro no upload: ',
    reportBug: 'Reportar um bug',
    bugModalTitle: 'Reportar um bug',
    bugModalInstructions: 'Ajude-nos a melhorar o SYSTM8! Por favor inclua uma captura de tela do problema — relatórios sem capturas de tela não serão processados.',
    bugWhatHappened: 'O que aconteceu?',
    bugWhatExpected: 'O que você esperava que acontecesse?',
    bugWhichPage: 'Em qual página você estava?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Outro',
    bugScreenshot: 'Captura de tela',
    bugScreenshotHint: 'PNG ou JPG · Máx 5MB',
    bugScreenshotRequired: 'A captura de tela é obrigatória',
    bugSeverity: 'Gravidade',
    bugSeverityCritical: 'Crítica',
    bugSeverityHigh: 'Alta',
    bugSeverityMedium: 'Média',
    bugSeverityLow: 'Baixa',
    bugSend: 'Enviar relatório',
    bugCancel: 'Cancelar',
    bugSending: 'Enviando...',
    bugSuccess: 'Obrigado! Seu relatório foi enviado.',
    bugFillRequired: 'Por favor preencha todos os campos obrigatórios e anexe uma captura de tela.',
  },
  th: {
    leadsTab: 'ลีด',
    profileTab: 'โปรไฟล์ของฉัน',
    registerLead: 'ลงทะเบียนลีดใหม่ด้วยตนเอง',
    fullName: 'ชื่อ-นามสกุล',
    emailAddress: 'อีเมล',
    uidPlaceholder: 'UID จากโบรกเกอร์ PuPrime',
    addLead: 'เพิ่มลีด',
    sending: 'กำลังส่ง...',
    pendingHeader: 'รอการยืนยัน',
    noPending: 'ไม่มีลีดรอดำเนินการ',
    approvedHeader: 'สมาชิกที่อนุมัติแล้ว',
    noApproved: 'ยังไม่มีสมาชิกที่อนุมัติ',
    approve: 'อนุมัติ',
    approvedDate: 'อนุมัติแล้ว',
    notProvided: 'ไม่ได้ระบุ',
    editProfile: 'แก้ไขโปรไฟล์',
    profileImage: 'รูปโปรไฟล์',
    uploadImage: 'อัปโหลดรูป',
    changeImage: 'เปลี่ยนรูป',
    uploading: 'กำลังอัปโหลด...',
    imageHint: 'JPG หรือ PNG · สูงสุด 5MB',
    yourUrl: 'URL ของคุณ',
    bio: 'ไบโอ',
    bioPlaceholder: 'บอกว่าคุณเป็นใครและสมาชิกของคุณจะได้อะไร...',
    saveProfile: 'บันทึกโปรไฟล์',
    saving: 'กำลังบันทึก...',
    saved: 'บันทึกแล้ว!',
    yourPage: 'หน้าของคุณ',
    viewPage: 'ดูหน้าของฉัน',
    logout: 'ออกจากระบบ',
    loading: 'กำลังโหลด...',
    aiHelper: 'AI ช่วยคุณ',
    aiTitle: 'ผู้ช่วย AI สร้างไบโอ',
    startAi: 'เริ่มผู้ช่วย AI',
    aiGenerating: 'กำลังสร้างไบโอของคุณ...',
    aiNext: 'ถัดไป',
    aiChooseTone: 'เลือกโทนสำหรับไบโอของคุณ:',
    aiPreview: 'ไบโอที่สร้างให้คุณ:',
    aiUseThis: 'ใช้อันนี้',
    aiRegenerate: 'สร้างใหม่',
    aiStartOver: 'เริ่มใหม่',
    aiOtherLangs: 'ดูในภาษาอื่น',
    aiStepOf: 'จาก',
    fillAll: 'กรุณากรอกข้อมูลทุกช่อง',
    referralRequired: 'ต้องกรอกช่องนี้',
    slugTaken: 'URL นี้ถูกใช้แล้ว กรุณาเลือกอันอื่น',
    socialMedia: 'โซเชียลมีเดีย',
    metricsTab: 'สถิติ',
    daily: 'รายวัน',
    weekly: 'รายสัปดาห์',
    monthly: 'รายเดือน',
    allTime: 'ทั้งหมด',
    pageViews: 'ยอดเข้าชม',
    uniqueVisitors: 'ผู้เยี่ยมชมที่ไม่ซ้ำ',
    conversions: 'การแปลง',
    rate: 'อัตรา',
    conversionRate: 'อัตราการแปลง',
    regToApproved: 'ลงทะเบียน → อนุมัติ',
    profileStrength: 'ความแข็งแกร่งของโปรไฟล์',
    customUrl: 'URL กำหนดเอง',
    referralLink: 'ลิงก์แนะนำ',
    approvalRate: 'อัตราการอนุมัติ',
    xOfYVerified: '{0} จาก {1} ยืนยันแล้ว',
    pageViewsOverTime: 'ยอดเข้าชมตามช่วงเวลา',
    leadBreakdown: 'รายละเอียดลีด',
    registeredLeads: 'ลีดที่ลงทะเบียน',
    pendingVerification: 'รอการยืนยัน',
    conversionRateLower: 'อัตราการแปลง',
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    ibResourcesTab: 'ทรัพยากร IB',
    ibResourcesSubtitle: 'เครื่องมือและการฝึกอบรมเพื่อช่วยให้คุณประสบความสำเร็จ',
    ibTraining: 'การฝึกอบรม IB',
    ibTrainingDesc: 'เข้าถึงสื่อการฝึกอบรมและคู่มือเพื่อเริ่มต้น',
    contentLibrary: 'คลังเนื้อหา',
    contentLibraryDesc: 'เรียกดูเนื้อหาการตลาด เทมเพลต และแรงบันดาลใจสำหรับโซเชียลมีเดียของคุณ',
    comingSoon: 'เร็วๆ นี้',
    vipSupport: 'ซัพพอร์ต VIP',
    vipSupportDesc: 'เข้าถึงซัพพอร์ต VIP โดยตรงสำหรับพาร์ทเนอร์ IB',
    pvPresentation: 'งานนำเสนอ PV',
    pvPresentationDesc: 'ดูงานนำเสนออย่างเป็นทางการของ PrimeVerse',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'URL อื่น',
    updateInfo: 'อัปเดตข้อมูลของฉัน',
    updating: 'กำลังอัปเดต...',
    updated: 'อัปเดตแล้ว!',
    generatePage: 'สร้าง landing page ของฉัน',
    generatingPage: 'กำลังสร้างหน้าของคุณ...',
    pageIsLive: 'หน้าของคุณพร้อมใช้แล้ว!',
    dragToReposition: 'ลากเพื่อปรับตำแหน่ง',
    rememberToSave: 'อย่าลืมบันทึกหลังจากปรับตำแหน่ง',
    pageLiveAt: 'Landing page ของคุณพร้อมแล้วที่:',
    viewLandingPage: 'ดู landing page ของคุณ',
    yourPageAt: 'หน้าของคุณ:',
    aiDescription: 'ตอบ 5 คำถาม เลือกโทน แล้ว AI จะสร้างไบโอมืออาชีพให้คุณ — ในทุกภาษา',
    somethingWentWrong: 'เกิดข้อผิดพลาด',
    noDataYet: 'ยังไม่มีข้อมูล',
    errorPrefix: 'ข้อผิดพลาด: ',
    uploadErrorPrefix: 'ข้อผิดพลาดในการอัปโหลด: ',
    reportBug: 'รายงานบัก',
    bugModalTitle: 'รายงานบัก',
    bugModalInstructions: 'ช่วยเราปรับปรุง SYSTM8! กรุณาแนบภาพหน้าจอของปัญหา — รายงานที่ไม่มีภาพหน้าจอจะไม่ได้รับการดำเนินการ',
    bugWhatHappened: 'เกิดอะไรขึ้น?',
    bugWhatExpected: 'คุณคาดหวังว่าจะเกิดอะไรขึ้น?',
    bugWhichPage: 'คุณอยู่หน้าไหน?',
    bugPageDashboard: 'แดชบอร์ด',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'เข้าสู่ระบบ',
    bugPageOther: 'อื่นๆ',
    bugScreenshot: 'ภาพหน้าจอ',
    bugScreenshotHint: 'PNG หรือ JPG · สูงสุด 5MB',
    bugScreenshotRequired: 'จำเป็นต้องแนบภาพหน้าจอ',
    bugSeverity: 'ความรุนแรง',
    bugSeverityCritical: 'วิกฤต',
    bugSeverityHigh: 'สูง',
    bugSeverityMedium: 'ปานกลาง',
    bugSeverityLow: 'ต่ำ',
    bugSend: 'ส่งรายงาน',
    bugCancel: 'ยกเลิก',
    bugSending: 'กำลังส่ง...',
    bugSuccess: 'ขอบคุณ! รายงานของคุณถูกส่งแล้ว',
    bugFillRequired: 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมดและแนบภาพหน้าจอ',
  },
}

const languageLabels: Record<string, string> = {
  en: 'English',
  no: 'Norsk',
  sv: 'Svenska',
  es: 'Español',
  ru: 'Русский',
  ar: 'العربية',
  tl: 'Tagalog',
  pt: 'Português',
  th: 'ไทย',
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --gold-deep: #7a5c12;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --text-dim: #5a5347;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --success-bg: rgba(74, 157, 90, 0.1);
    --success-border: rgba(74, 157, 90, 0.25);
    --success-text: #6dc07f;
    --warning-bg: rgba(212, 165, 55, 0.08);
    --warning-border: rgba(212, 165, 55, 0.2);
    --warning-text: var(--gold-light);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
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
      linear-gradient(78deg, transparent 20%, rgba(160,120,24,0.025) 22%, transparent 24%),
      linear-gradient(195deg, transparent 65%, rgba(212,165,55,0.03) 66.5%, transparent 68%),
      linear-gradient(142deg, transparent 40%, rgba(255,255,255,0.012) 40.2%, transparent 40.4%),
      linear-gradient(320deg, transparent 25%, rgba(255,255,255,0.01) 25.15%, transparent 25.3%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }
  .marble-bg::before {
    content: ''; position: absolute; inset: 0;
    background:
      linear-gradient(165deg, transparent 28%, rgba(212,165,55,0.02) 28.5%, transparent 29%),
      linear-gradient(245deg, transparent 52%, rgba(200,155,50,0.025) 52.8%, transparent 53.5%),
      linear-gradient(10deg, transparent 70%, rgba(180,135,40,0.02) 70.3%, transparent 70.6%);
    opacity: 0.8;
  }
  .marble-bg::after {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px; opacity: 0.5;
  }

  .dash-wrap {
    position: relative; z-index: 1;
    max-width: 960px; margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  /* Header */
  .dash-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2rem; padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--card-border);
  }
  .dash-header-left { display: flex; align-items: center; gap: 14px; }
  /* SYSTM8 Logo */
  .systm8-logo {
    width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid var(--gold-dark);
    box-shadow: 0 2px 16px rgba(212,165,55,0.25), 0 0 24px rgba(212,165,55,0.08);
    flex-shrink: 0;
    transition: box-shadow 0.3s ease;
  }
  .systm8-logo:hover {
    box-shadow: 0 2px 20px rgba(212,165,55,0.4), 0 0 32px rgba(212,165,55,0.15);
  }
  .header-divider {
    width: 1px; height: 32px;
    background: linear-gradient(to bottom, transparent, var(--card-border), transparent);
    flex-shrink: 0;
  }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 2px 12px rgba(212,165,55,0.15);
  }
  .avatar-placeholder {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(212,165,55,0.1); border: 2px solid var(--gold-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: var(--gold);
  }
  .dash-username {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem; font-weight: 600;
    color: var(--text-primary); letter-spacing: 0.02em;
  }
  .dash-email { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .header-actions { display: flex; gap: 10px; align-items: center; }

  /* Language selector */
  .lang-selector { position: relative; }
  .lang-btn {
    background: rgba(10,10,10,0.7); border: 1px solid rgba(212,165,55,0.2);
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.78rem; padding: 0.4rem 0.7rem; border-radius: 6px;
    cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px);
    display: flex; align-items: center; gap: 0.35rem;
  }
  .lang-btn:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }
  .lang-btn svg { width: 13px; height: 13px; opacity: 0.6; }
  .lang-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    background: rgba(15,13,10,0.95); border: 1px solid rgba(212,165,55,0.2);
    border-radius: 8px; overflow: hidden; min-width: 130px;
    backdrop-filter: blur(20px); box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    z-index: 50; animation: dropIn 0.2s ease;
  }
  @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  .lang-option {
    display: block; width: 100%; background: none; border: none;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.8rem; padding: 0.5rem 0.9rem; text-align: left;
    cursor: pointer; transition: all 0.2s;
  }
  .lang-option:hover { background: rgba(212,165,55,0.08); color: var(--gold-light); }
  .lang-option-active { color: var(--gold); background: rgba(212,165,55,0.06); }

  /* Brushed Gold Buttons */
  .gold-btn {
    position: relative; padding: 0.7rem 1.4rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer;
    overflow: hidden; color: #0a0804; text-decoration: none;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
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
  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3);
  }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .gold-btn:disabled::after { display: none; }
  .gold-btn-sm { padding: 0.5rem 1rem; font-size: 0.78rem; }

  .btn-outline {
    padding: 0.55rem 1.1rem; background: transparent;
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; cursor: pointer; transition: all 0.3s;
  }
  .btn-outline:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }

  .btn-success {
    padding: 0.6rem 1.2rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #fff;
    background: linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #2e7d32 100%);
    box-shadow: 0 2px 10px rgba(46,125,50,0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46,125,50,0.4); }
  .btn-success:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Tabs */
  .tabs { display: flex; margin-bottom: 2rem; border-bottom: 1px solid var(--card-border); }
  .tab-btn {
    padding: 0.75rem 1.5rem; background: none; border: none;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 400;
    color: var(--text-secondary); cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.3s;
  }
  .tab-btn:hover { color: var(--gold-light); }
  .tab-btn-active { color: var(--gold); border-bottom-color: var(--gold); font-weight: 600; }

  /* IB Resources */
  .ib-resources-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 640px) { .ib-resources-grid { grid-template-columns: 1fr; } }
  .ib-resource-card {
    position: relative; display: flex; align-items: flex-start; gap: 1rem;
    background: #141414; border: 1px solid rgba(212,165,55,0.25); border-radius: 12px;
    padding: 1.5rem; text-decoration: none; color: inherit;
    transition: box-shadow 0.3s, border-color 0.3s; cursor: pointer;
  }
  .ib-resource-card:hover {
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(212,165,55,0.15), 0 0 40px rgba(212,165,55,0.06);
  }
  .ib-resource-card-disabled {
    opacity: 0.55; cursor: default; pointer-events: none;
  }
  .ib-resource-badge {
    position: absolute; top: 12px; right: 12px;
    background: rgba(212,165,55,0.15); color: var(--gold); border: 1px solid rgba(212,165,55,0.3);
    border-radius: 6px; padding: 2px 8px; font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.03em;
  }
  .ib-resource-icon {
    flex-shrink: 0; width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212,165,55,0.1); border-radius: 10px; color: var(--gold);
  }
  .ib-resource-text { flex: 1; min-width: 0; }
  .ib-resource-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.3rem; }
  .ib-resource-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; }
  .ib-resource-arrow {
    flex-shrink: 0; color: var(--gold); font-size: 1.1rem; margin-top: 0.15rem;
    transition: transform 0.2s;
  }
  .ib-resource-card:hover .ib-resource-arrow { transform: translateX(3px); }

  /* Cards */
  .card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 12px; padding: 1.75rem; backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.25);
    margin-bottom: 1.5rem;
  }
  .card-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
    font-weight: 600; color: var(--text-primary);
    margin-bottom: 1.25rem; letter-spacing: 0.03em;
  }

  /* Inputs */
  .field-input {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .field-textarea {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; resize: vertical; line-height: 1.65;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-textarea::placeholder { color: var(--text-dim); }
  .field-textarea:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .field-label {
    display: block; font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.4rem;
  }
  .field-group { margin-bottom: 1rem; }

  /* Lead items */
  .lead-item {
    background: rgba(15,13,10,0.5); border: 1px solid var(--card-border);
    border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 0.6rem;
    display: flex; justify-content: space-between; align-items: center;
    transition: border-color 0.3s;
  }
  .lead-item:hover { border-color: rgba(212,165,55,0.25); }
  .lead-item-pending { border-left: 3px solid var(--gold); }
  .lead-item-approved { border-left: 3px solid var(--success-text); }
  .lead-name { font-weight: 600; font-size: 0.92rem; color: var(--text-primary); }
  .lead-detail { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .lead-uid { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }
  .lead-uid strong { color: var(--text-secondary); }
  .lead-date { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

  .section-header {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;
    display: flex; align-items: center; gap: 10px;
  }
  .badge {
    font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600;
    padding: 2px 10px; border-radius: 10px;
  }
  .badge-warning { background: var(--warning-bg); color: var(--warning-text); border: 1px solid var(--warning-border); }
  .badge-success { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-border); }
  .empty-text { color: var(--text-dim); font-size: 0.85rem; }

  /* Profile */
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }

  .upload-area {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(212,165,55,0.06); border: 2px dashed rgba(212,165,55,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; overflow: hidden; flex-shrink: 0; transition: border-color 0.3s;
  }
  .upload-area:hover { border-color: var(--gold); }
  .upload-area img { width: 100%; height: 100%; object-fit: cover; }

  .url-input-wrap {
    display: flex; align-items: center;
    border: 1px solid var(--input-border); border-radius: 8px;
    overflow: hidden; background: var(--input-bg);
  }
  .url-prefix {
    padding: 0.7rem; background: rgba(212,165,55,0.06);
    color: var(--text-dim); font-size: 0.75rem;
    border-right: 1px solid var(--input-border); white-space: nowrap;
  }
  .url-input-wrap input {
    flex: 1; padding: 0.7rem 0.75rem; background: transparent;
    border: none; outline: none; color: var(--text-primary);
    font-family: 'Outfit', sans-serif; font-size: 0.9rem;
  }
  .url-input-wrap:focus-within { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }

  /* AI Chat */
  .ai-panel {
    border: 1px solid var(--card-border); border-radius: 12px;
    overflow: hidden; display: flex; flex-direction: column;
    backdrop-filter: blur(24px);
  }
  .ai-header {
    padding: 0.85rem 1.1rem; background: rgba(15,12,8,0.9);
    border-bottom: 1px solid var(--card-border);
    font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
    display: flex; align-items: center; gap: 8px;
  }
  .ai-header .sparkle { color: var(--gold); font-size: 1rem; }
  .ai-header .powered { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); font-weight: 400; }
  .ai-body {
    padding: 1.25rem; background: rgba(8,8,6,0.5);
  }
  .ai-step-indicator {
    display: flex; gap: 6px; margin-bottom: 1.2rem;
  }
  .ai-step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--card-border); transition: background 0.3s;
  }
  .ai-step-dot.active { background: var(--gold); }
  .ai-step-dot.done { background: rgba(212,165,55,0.4); }
  .ai-question {
    font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;
    margin-bottom: 1rem; font-weight: 500;
  }
  .ai-question-count {
    font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.5rem;
  }
  .ai-textarea {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 10px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.84rem; outline: none; resize: vertical; min-height: 70px;
    line-height: 1.6; box-sizing: border-box;
  }
  .ai-textarea:focus { border-color: var(--input-focus); }
  .ai-next-btn {
    margin-top: 0.8rem; padding: 0.6rem 1.6rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-next-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .ai-tone-grid {
    display: flex; gap: 0.6rem; flex-wrap: wrap;
  }
  .ai-tone-btn {
    flex: 1; min-width: 100px; padding: 0.9rem 0.6rem; border-radius: 10px;
    border: 1px solid var(--card-border); background: rgba(15,13,10,0.6);
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.84rem; font-weight: 500; cursor: pointer;
    text-align: center; transition: all 0.3s;
  }
  .ai-tone-btn:hover { border-color: var(--gold); background: rgba(212,165,55,0.08); }
  .ai-tone-emoji { font-size: 1.4rem; display: block; margin-bottom: 0.4rem; }
  .ai-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 2.5rem 1rem; text-align: center;
  }
  .ai-spinner {
    width: 36px; height: 36px; border: 3px solid var(--card-border);
    border-top-color: var(--gold); border-radius: 50%;
    animation: spin 0.8s linear infinite; margin-bottom: 1rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ai-preview-bio {
    background: rgba(15,13,10,0.6); border: 1px solid var(--card-border);
    border-radius: 10px; padding: 1rem 1.1rem; font-size: 0.86rem;
    line-height: 1.7; color: var(--text-primary); margin-bottom: 1rem;
    white-space: pre-wrap;
  }
  .ai-btn-row {
    display: flex; gap: 0.6rem; flex-wrap: wrap;
  }
  .ai-btn-primary {
    padding: 0.6rem 1.4rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-btn-secondary {
    padding: 0.6rem 1.4rem; border: 1px solid var(--card-border); border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; color: var(--text-secondary); background: transparent;
    transition: all 0.2s;
  }
  .ai-btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
  .ai-lang-toggle {
    margin-top: 0.8rem; padding: 0; border: none; background: none;
    color: var(--text-dim); font-size: 0.78rem; cursor: pointer;
    font-family: 'Outfit', sans-serif; text-decoration: underline;
    text-underline-offset: 2px;
  }
  .ai-lang-toggle:hover { color: var(--gold); }
  .ai-lang-list {
    margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem;
  }
  .ai-lang-item {
    background: rgba(15,13,10,0.4); border: 1px solid var(--card-border);
    border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.8rem;
    color: var(--text-secondary); line-height: 1.6;
  }
  .ai-lang-item strong {
    color: var(--gold); font-weight: 600; display: block;
    margin-bottom: 0.25rem; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ai-placeholder {
    background: rgba(15,13,10,0.4); border: 1px dashed var(--card-border);
    border-radius: 12px; padding: 2.5rem; text-align: center;
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .ai-placeholder .sparkle-big { font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--gold); }
  .ai-placeholder h3 {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 0.6rem;
  }
  .ai-placeholder p {
    font-size: 0.82rem; color: var(--text-secondary);
    line-height: 1.7; margin-bottom: 1.25rem; max-width: 260px;
  }

  .gold-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
  .gold-link:hover { color: var(--gold-light); text-decoration: underline; }

  .profile-saved-text { text-align: center; margin-top: 0.75rem; font-size: 0.82rem; color: var(--text-secondary); }

  .loading-screen { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; gap: 16px; }
  .loading-logo {
    width: 64px; height: 64px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 4px 24px rgba(212,165,55,0.3);
    animation: logoPulse 2s ease infinite;
  }
  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 4px 24px rgba(212,165,55,0.2); transform: scale(1); }
    50% { box-shadow: 0 4px 36px rgba(212,165,55,0.45); transform: scale(1.03); }
  }
  .loading-text {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem;
    color: var(--gold); letter-spacing: 0.1em; animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

  /* ── Metrics Redesign ───────────────────────────────────────────────── */
  .metric-cards-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 2rem;
  }
  .metric-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(24px); position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .metric-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .metric-card-label {
    font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.75rem; font-weight: 500;
  }
  .metric-card-value {
    font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 600;
    color: var(--text-primary); line-height: 1;
  }
  .metric-card-change {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 0.7rem; font-weight: 600; margin-top: 0.5rem;
    padding: 2px 8px; border-radius: 12px;
  }
  .metric-card-change.up { color: #6dc07f; background: rgba(109,192,127,0.1); }
  .metric-card-change.down { color: #e85555; background: rgba(232,85,85,0.1); }
  .metric-card-change.neutral { color: var(--text-dim); background: rgba(255,255,255,0.05); }
  .metric-card-sub { font-size: 0.68rem; color: var(--text-dim); margin-top: 0.25rem; }

  /* Rolex-inspired gauges */
  .gauges-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 2rem;
  }
  .rolex-gauge-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem 1rem 1.25rem;
    backdrop-filter: blur(24px); display: flex; flex-direction: column;
    align-items: center; text-align: center; position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .rolex-gauge-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .rolex-gauge-wrap {
    position: relative; width: 220px; height: 220px;
  }
  .rolex-gauge-bezel {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    border-radius: 50%;
    background: #141414;
    border: 4px solid transparent;
    background-clip: padding-box;
    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.5),
      0 0 15px rgba(212,165,55,0.15);
  }
  .rolex-gauge-bezel::before {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8B6914, #d4a537, #F5D77A, #d4a537, #8B6914);
    z-index: -1;
  }
  .rolex-gauge-overlay {
    position: absolute; inset: 0;
  }
  .rolex-gauge-number {
    position: absolute;
    font-family: Georgia, serif; font-size: 11px; font-weight: 700;
    color: #d4a537; text-shadow: 0 0 6px rgba(212,165,55,0.3);
    pointer-events: none;
    line-height: 1; text-align: center; white-space: nowrap;
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 16px;
    margin-left: -12px; margin-top: -8px;
  }
  .rolex-gauge-inner-ring {
    position: absolute; top: 7.5%; left: 7.5%; width: 85%; height: 85%;
    border-radius: 50%; border: 1px solid rgba(212,165,55,0.3);
    pointer-events: none;
  }
  .rolex-gauge-center {
    position: absolute; top: 50%; left: 50%;
    width: 16px; height: 16px; transform: translate(-50%, -50%);
    border-radius: 50%; z-index: 3;
    background: radial-gradient(circle at 35% 35%, #f5d77a, #d4a537 50%, #8b6914);
    box-shadow: 0 0 8px rgba(212,165,55,0.5);
  }
  .rolex-gauge-needle-g {
    transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: 50% 50%;
  }
  .rolex-gauge-title-text {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: #888; margin-top: 0.6rem; font-weight: 500;
  }
  .rolex-gauge-value {
    font-family: Georgia, serif; font-size: 28px; font-weight: 700;
    color: #d4a537; line-height: 1; margin-top: 0.25rem;
    text-shadow: 0 0 10px rgba(212,165,55,0.2);
  }
  .rolex-gauge-sub { font-size: 11px; color: #555; margin-top: 4px; }

  /* Chart section */
  .chart-section {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(24px); position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .chart-section::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .chart-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .chart-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600;
    color: var(--text-primary);
  }
  .chart-tabs { display: flex; gap: 4px; }
  .chart-tab {
    padding: 4px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--card-border); background: transparent;
    color: var(--text-dim); font-family: 'Outfit', sans-serif; transition: all 0.2s;
  }
  .chart-tab:hover { color: var(--text-secondary); border-color: rgba(212,165,55,0.3); }
  .chart-tab-active {
    background: rgba(212,165,55,0.1); border-color: rgba(212,165,55,0.4);
    color: var(--gold);
  }
  .chart-svg { width: 100%; height: 200px; }
  .chart-grid-line { stroke: rgba(212,165,55,0.06); stroke-width: 1; }
  .chart-line { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .chart-area { fill: url(#chartGradient); }
  .chart-dot { fill: var(--gold); filter: drop-shadow(0 0 3px rgba(212,165,55,0.5)); }
  .chart-x-label { font-size: 9px; fill: var(--text-dim); font-family: 'Outfit', sans-serif; }
  .chart-y-label { font-size: 9px; fill: var(--text-dim); font-family: 'Outfit', sans-serif; }

  /* Period selector */
  .period-row {
    display: flex; gap: 6px; justify-content: center;
    margin-top: 1rem; flex-wrap: wrap;
  }
  .period-btn {
    padding: 4px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--card-border); background: transparent;
    color: var(--text-dim); font-family: 'Outfit', sans-serif; transition: all 0.2s;
  }
  .period-btn:hover { color: var(--text-secondary); border-color: rgba(212,165,55,0.3); }
  .period-btn-active {
    background: rgba(212,165,55,0.1); border-color: rgba(212,165,55,0.4);
    color: var(--gold);
  }
  .period-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  .metrics-summary {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 12px; backdrop-filter: blur(24px); overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.25); margin-top: 2rem;
  }
  .metrics-summary-title {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--card-border);
    font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600;
    color: var(--text-primary);
  }
  .metrics-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 1.5rem; border-bottom: 1px solid rgba(212,165,55,0.05);
    transition: background 0.2s;
  }
  .metrics-row:last-child { border-bottom: none; }
  .metrics-row:hover { background: rgba(212,165,55,0.03); }
  .metrics-row-label { font-size: 0.82rem; color: var(--text-secondary); }
  .metrics-row-value { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
  .metrics-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* Profile strength progress */
  .strength-items { margin-top: 0.5rem; }
  .strength-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.72rem; color: var(--text-dim); padding: 2px 0;
  }
  .strength-check { color: #6dc07f; }
  .strength-miss { color: rgba(255,255,255,0.2); }

  @media (max-width: 900px) {
    .metric-cards-row, .gauges-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .metric-cards-row, .gauges-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .dash-wrap { padding: 1.5rem 1rem 3rem; }
    .dash-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .header-actions { width: 100%; flex-wrap: wrap; }
    .systm8-logo { width: 36px; height: 36px; }
  }

  /* Accessibility: visually hidden but available to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Focus indicators */
  .gold-btn:focus-visible,
  .btn-outline:focus-visible,
  .tab-btn:focus-visible,
  .lang-btn:focus-visible,
  .lang-option:focus-visible,
  .btn-success:focus-visible,
  .gold-link:focus-visible,
  .ai-next-btn:focus-visible,
  .ai-btn-primary:focus-visible,
  .ai-btn-secondary:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .field-input:focus,
  .field-textarea:focus,
  .ai-textarea:focus {
    outline: 2px solid var(--gold);
    outline-offset: 1px;
  }

  /* Bug Report Floating Button */
  .bug-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 100;
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(15,13,10,0.9); border: 1px solid rgba(212,165,55,0.3);
    color: var(--gold); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    transition: all 0.3s; backdrop-filter: blur(10px);
  }
  .bug-fab:hover {
    border-color: var(--gold); box-shadow: 0 4px 24px rgba(212,165,55,0.2);
    transform: translateY(-2px);
  }

  /* Bug Report Modal */
  .bug-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: dropIn 0.25s ease;
  }
  .bug-modal {
    background: #111; border: 1px solid rgba(212,165,55,0.25);
    border-radius: 14px; width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto; padding: 2rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .bug-modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    font-weight: 600; color: var(--gold); margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .bug-modal-instructions {
    font-size: 0.82rem; color: var(--text-secondary);
    line-height: 1.55; margin-bottom: 1.5rem;
    padding: 0.75rem; background: rgba(212,165,55,0.06);
    border: 1px solid rgba(212,165,55,0.12); border-radius: 8px;
  }
  .bug-field { margin-bottom: 1rem; }
  .bug-field label { display: block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem; }
  .bug-field textarea { width: 100%; min-height: 80px; padding: 0.7rem 0.9rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.88rem; resize: vertical; outline: none; transition: border-color 0.3s; }
  .bug-field textarea:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .bug-field select { width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.88rem; outline: none; appearance: none; cursor: pointer; }
  .bug-field select:focus { border-color: var(--input-focus); }
  .bug-file-zone {
    border: 2px dashed rgba(212,165,55,0.25); border-radius: 10px;
    padding: 1.25rem; text-align: center; cursor: pointer;
    transition: border-color 0.3s, background 0.3s;
  }
  .bug-file-zone:hover { border-color: rgba(212,165,55,0.5); background: rgba(212,165,55,0.03); }
  .bug-file-zone-active { border-color: var(--gold); background: rgba(212,165,55,0.06); }
  .bug-file-hint { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.3rem; }
  .bug-file-name { font-size: 0.82rem; color: var(--gold-light); margin-top: 0.4rem; }
  .bug-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  .bug-actions .gold-btn { flex: 1; }
  .bug-actions .btn-outline { flex: 0 0 auto; }
  .bug-error { font-size: 0.8rem; color: #e57373; margin-top: 0.5rem; }

  /* Toast notifications */
  .toast-container {
    position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
    z-index: 10000; max-width: 420px; width: calc(100% - 2rem);
    animation: toastSlideIn 0.3s ease-out;
  }
  .toast-inner {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem;
    border-radius: 12px; backdrop-filter: blur(24px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    font-size: 0.85rem; line-height: 1.4;
  }
  .toast-error {
    background: rgba(40, 10, 10, 0.95); border: 1px solid rgba(229,115,115,0.3);
    color: #e57373;
  }
  .toast-info {
    background: rgba(10, 25, 40, 0.95); border: 1px solid rgba(100,180,255,0.3);
    color: #90caf9;
  }
  .toast-close {
    background: none; border: none; color: inherit; cursor: pointer;
    opacity: 0.6; font-size: 1.1rem; padding: 0; margin-left: auto; flex-shrink: 0;
  }
  .toast-close:hover { opacity: 1; }
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-1rem); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .bug-success-msg {
    text-align: center; padding: 2rem 1rem;
    font-size: 1rem; color: var(--success-text);
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  }
`;

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [distributor, setDistributor] = useState<any>(null)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadUid, setLeadUid] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'leads' | 'profile' | 'metrics' | 'resources'>('metrics')
  const [metricPeriod, setMetricPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week')
  const [pageViews, setPageViews] = useState(0)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  const [pageViewHistory, setPageViewHistory] = useState<{ date: string; count: number }[]>([])

  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSlug, setProfileSlug] = useState('')
  const [slugError, setSlugError] = useState(false)
  const [profileReferralLink, setProfileReferralLink] = useState('')
  const [profileDirection, setProfileDirection] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imgX, setImgX] = useState(50)
  const [imgY, setImgY] = useState(50)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updateSaved, setUpdateSaved] = useState(false)
  const [referralError, setReferralError] = useState(false)
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialFacebook, setSocialFacebook] = useState('')
  const [socialSnapchat, setSocialSnapchat] = useState('')
  const [socialLinkedin, setSocialLinkedin] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [socialOther, setSocialOther] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ clientX: 0, clientY: 0, imgX: 50, imgY: 50 })

  const [showAI, setShowAI] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [bioStep, setBioStep] = useState(0)
  const [bioAnswers, setBioAnswers] = useState<Record<string, string>>({})
  const [bioCurrentAnswer, setBioCurrentAnswer] = useState('')
  const [bioTone, setBioTone] = useState<string | null>(null)
  const [generatedBios, setGeneratedBios] = useState<Record<string, string> | null>(null)
  const [bioLangOpen, setBioLangOpen] = useState(false)
  const [bioError, setBioError] = useState<string | null>(null)
  const [bioTranslations, setBioTranslations] = useState<Record<string, string> | null>(null)

  // Bug report
  const [bugOpen, setBugOpen] = useState(false)
  const [bugWhat, setBugWhat] = useState('')
  const [bugExpected, setBugExpected] = useState('')
  const [bugPage, setBugPage] = useState('Dashboard')
  const [bugFile, setBugFile] = useState<File | null>(null)
  const [bugSeverity, setBugSeverity] = useState('Medium')
  const [bugSending, setBugSending] = useState(false)
  const [bugSent, setBugSent] = useState(false)
  const [bugError, setBugError] = useState('')
  const bugFileRef = useRef<HTMLInputElement>(null)

  // Toast notifications
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'error' | 'info'>('error')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = useCallback((msg: string, type: 'error' | 'info' = 'error') => {
    setToastMsg(msg); setToastType(type)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 5000)
  }, [])

  // Language
  const [lang, setLang] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const t = translations[lang] || translations.en

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/login'); return }
      const userId = userData.user.id
      const email = userData.user.email!
      const { data: existing } = await supabase.from('distributors').select('*').eq('user_id', userId).single()
      let dist = existing
      if (!existing) {
        const { data: newDist, error } = await supabase.from('distributors').insert({ name: email.split('@')[0], email, user_id: userId }).select().single()
        if (error) { showToast(t.errorPrefix + error.message); return }
        dist = newDist
      }
      setDistributor(dist)
      setProfileName(dist.name || '')
      setProfileBio(dist.bio || '')
      setBioTranslations(dist.bio_translations || null)
      setProfileSlug(dist.slug || '')
      setProfileReferralLink(dist.referral_link || '')
      setProfileDirection(dist.direction || '')
      setSocialTiktok(dist.social_tiktok || '')
      setSocialInstagram(dist.social_instagram || '')
      setSocialFacebook(dist.social_facebook || '')
      setSocialSnapchat(dist.social_snapchat || '')
      setSocialLinkedin(dist.social_linkedin || '')
      setSocialYoutube(dist.social_youtube || '')
      setSocialOther(dist.social_other || '')
      const pi = parseProfileImage(dist.profile_image)
      setProfileImage(pi.url || null)
      setImgX(pi.x)
      setImgY(pi.y)
      await fetchLeads(dist.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchLeads = async (distributorId: string) => {
    const { data } = await supabase.from('leads').select('*').eq('distributor_id', distributorId).order('created_at', { ascending: false })
    setLeads(data || [])
  }

  const fetchPageViews = async (distributorId: string, period: 'day' | 'week' | 'month' | 'all') => {
    setMetricsLoading(true)
    const now = new Date()
    let from: string | null = null
    if (period === 'day') { const d = new Date(now); d.setHours(0,0,0,0); from = d.toISOString() }
    else if (period === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); from = d.toISOString() }
    else if (period === 'month') { const d = new Date(now); d.setMonth(d.getMonth() - 1); from = d.toISOString() }

    let q = supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('distributor_id', distributorId)
    if (from) q = q.gte('created_at', from)
    const { count } = await q
    setPageViews(count || 0)
    setMetricsLoading(false)
  }

  const fetchPageViewHistory = async (distributorId: string, period: '7d' | '30d' | '90d') => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const from = new Date(); from.setDate(from.getDate() - days)
    const { data } = await supabase.from('page_views').select('created_at').eq('distributor_id', distributorId).gte('created_at', from.toISOString()).order('created_at', { ascending: true })
    if (!data) { setPageViewHistory([]); return }
    const grouped: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
      grouped[d.toISOString().slice(0, 10)] = 0
    }
    data.forEach(r => { const d = r.created_at.slice(0, 10); if (grouped[d] !== undefined) grouped[d]++ })
    setPageViewHistory(Object.entries(grouped).map(([date, count]) => ({ date, count })))
  }

  useEffect(() => {
    if (distributor?.id && activeTab === 'metrics') fetchPageViews(distributor.id, metricPeriod)
  }, [distributor?.id, activeTab, metricPeriod])

  useEffect(() => {
    if (distributor?.id && activeTab === 'metrics') fetchPageViewHistory(distributor.id, chartPeriod)
  }, [distributor?.id, activeTab, chartPeriod])

  const addLead = async () => {
    if (!distributor || !leadName || !leadEmail || !leadUid) { showToast(t.fillAll); return }
    setSubmitting(true)
    const { error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: leadName, email: leadEmail, uid: leadUid, uid_verified: false })
    if (error) { showToast(t.errorPrefix + error.message); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName, leadEmail, leadUid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setLeadName(''); setLeadEmail(''); setLeadUid('')
    setSubmitting(false)
    await fetchLeads(distributor.id)
  }

  const approveLead = async (lead: any) => {
    setApprovingId(lead.id)
    const { error } = await supabase.from('leads').update({ uid_verified: true, uid_verified_at: new Date().toISOString() }).eq('id', lead.id)
    if (error) { showToast(t.errorPrefix + error.message); setApprovingId(null); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'approved', leadName: lead.name, leadEmail: lead.email, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setApprovingId(null)
    await fetchLeads(distributor.id)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !distributor?.id) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `${distributor.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { showToast(t.uploadErrorPrefix + uploadError.message); setUploadingImage(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const newUrl = data.publicUrl
    const newX = 50
    const newY = 30
    setProfileImage(newUrl)
    setImgX(newX)
    setImgY(newY)
    // Auto-save image immediately to database
    await supabase.from('distributors').update({ profile_image: serializeProfileImage(newUrl, newX, newY) }).eq('id', distributor.id)
    setUploadingImage(false)
  }

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true
    dragStart.current = { clientX, clientY, imgX, imgY }
  }, [imgX, imgY])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return
    const dx = clientX - dragStart.current.clientX
    const dy = clientY - dragStart.current.clientY
    setImgX(Math.max(0, Math.min(100, dragStart.current.imgX - dx * 0.4)))
    setImgY(Math.max(0, Math.min(100, dragStart.current.imgY - dy * 0.4)))
  }, [])

  const endDrag = useCallback(() => { isDragging.current = false }, [])

  const saveProfile = async () => {
    if (!profileReferralLink.trim()) {
      setReferralError(true)
      return
    }
    setReferralError(false)
    setSlugError(false)
    setSavingProfile(true)
    const isFirstSave = !distributor.slug
    const profileImageValue = profileImage ? serializeProfileImage(profileImage, imgX, imgY) : null
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: profileReferralLink, direction: profileDirection, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null }).eq('id', distributor.id)
    if (error) {
      if (error.message?.includes('distributors_slug_key') || error.code === '23505') {
        setSlugError(true)
      } else {
        showToast(t.errorPrefix + error.message)
      }
      setSavingProfile(false)
      return
    }
    if (isFirstSave && profileSlug) {
      fetch('/api/welcome-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: profileName, email: distributor.email, slug: profileSlug, lang }) }).catch(() => {})
    }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: profileReferralLink, direction: profileDirection, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const updateProfile = async () => {
    if (!profileReferralLink.trim()) {
      setReferralError(true)
      return
    }
    setReferralError(false)
    setSlugError(false)
    setUpdatingProfile(true)
    const profileImageValue = profileImage ? serializeProfileImage(profileImage, imgX, imgY) : null
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: profileReferralLink, direction: profileDirection, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null }).eq('id', distributor.id)
    if (error) {
      if (error.message?.includes('distributors_slug_key') || error.code === '23505') {
        setSlugError(true)
      } else {
        showToast(t.errorPrefix + error.message)
      }
      setUpdatingProfile(false)
      return
    }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: profileReferralLink, direction: profileDirection, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null })
    setUpdatingProfile(false)
    setUpdateSaved(true)
    setTimeout(() => setUpdateSaved(false), 3000)
  }

  const bioQuestionKeys = ['background', 'motivation', 'unique', 'ideal_client', 'expectations'] as const

  const bioQuestionTexts: Record<string, Record<string, string>> = {
    background: { en: 'What is your background in trading/finance?', no: 'Hva er din bakgrunn innen trading/finans?', sv: 'Vad är din bakgrund inom trading/finans?', es: '¿Cuál es tu experiencia en trading/finanzas?', ru: 'Какой у вас опыт в трейдинге/финансах?', ar: 'ما خلفيتك في التداول/المالية؟', tl: 'Ano ang background mo sa trading/finance?', pt: 'Qual é sua experiência em trading/finanças?', th: 'พื้นฐานของคุณในการเทรด/การเงินคืออะไร?' },
    motivation: { en: 'What motivates you to help others with trading?', no: 'Hva motiverer deg til å hjelpe andre med trading?', sv: 'Vad motiverar dig att hjälpa andra med trading?', es: '¿Qué te motiva a ayudar a otros con el trading?', ru: 'Что мотивирует вас помогать другим с трейдингом?', ar: 'ما الذي يحفزك لمساعدة الآخرين في التداول؟', tl: 'Ano ang motivation mo na tulungan ang iba sa trading?', pt: 'O que te motiva a ajudar outros com trading?', th: 'อะไรเป็นแรงจูงใจให้คุณช่วยคนอื่นด้านการเทรด?' },
    unique: { en: 'What makes you unique as a partner/mentor?', no: 'Hva gjør deg unik som partner/mentor?', sv: 'Vad gör dig unik som partner/mentor?', es: '¿Qué te hace único como socio/mentor?', ru: 'Что делает вас уникальным как партнёра/ментора?', ar: 'ما الذي يجعلك فريداً كشريك/مرشد؟', tl: 'Ano ang natatangi sa iyo bilang partner/mentor?', pt: 'O que te torna único como parceiro/mentor?', th: 'อะไรทำให้คุณเป็นพาร์ทเนอร์/ที่ปรึกษาที่ไม่เหมือนใคร?' },
    ideal_client: { en: 'Who is your ideal client?', no: 'Hvem er din ideelle klient?', sv: 'Vem är din ideala klient?', es: '¿Quién es tu cliente ideal?', ru: 'Кто ваш идеальный клиент?', ar: 'من هو عميلك المثالي؟', tl: 'Sino ang ideal mong kliyente?', pt: 'Quem é seu cliente ideal?', th: 'ลูกค้าในอุดมคติของคุณคือใคร?' },
    expectations: { en: 'What can people expect when working with you?', no: 'Hva kan folk forvente når de jobber med deg?', sv: 'Vad kan folk förvänta sig när de jobbar med dig?', es: '¿Qué pueden esperar las personas al trabajar contigo?', ru: 'Что люди могут ожидать от работы с вами?', ar: 'ماذا يمكن للناس توقعه عند العمل معك؟', tl: 'Ano ang maaasahan ng mga tao kapag nakipagtulungan sa iyo?', pt: 'O que as pessoas podem esperar ao trabalhar com você?', th: 'ผู้คนจะได้อะไรเมื่อทำงานกับคุณ?' },
  }

  const toneLabels: Record<string, Record<string, string>> = {
    professional: { en: 'Professional', no: 'Profesjonell', sv: 'Professionell', es: 'Profesional', ru: 'Профессиональный', ar: 'احترافي', tl: 'Professional', pt: 'Profissional', th: 'มืออาชีพ' },
    casual: { en: 'Casual', no: 'Avslappet', sv: 'Avslappnad', es: 'Casual', ru: 'Непринуждённый', ar: 'عادي', tl: 'Casual', pt: 'Casual', th: 'เป็นกันเอง' },
    motivational: { en: 'Motivational', no: 'Motiverende', sv: 'Motiverande', es: 'Motivacional', ru: 'Мотивирующий', ar: 'تحفيزي', tl: 'Motivational', pt: 'Motivacional', th: 'สร้างแรงบันดาลใจ' },
  }

  const langLabels: Record<string, string> = { en: 'English', no: 'Norsk', sv: 'Svenska', es: 'Español', ru: 'Русский', ar: 'العربية', tl: 'Filipino', pt: 'Português', th: 'ไทย' }

  const startAI = () => {
    setShowAI(true)
    setBioStep(0)
    setBioAnswers({})
    setBioCurrentAnswer('')
    setBioTone(null)
    setGeneratedBios(null)
    setBioLangOpen(false)
    setBioError(null)
  }

  const bioNextQuestion = () => {
    if (!bioCurrentAnswer.trim()) return
    const key = bioQuestionKeys[bioStep]
    const newAnswers = { ...bioAnswers, [key]: bioCurrentAnswer.trim() }
    setBioAnswers(newAnswers)
    setBioCurrentAnswer('')
    setBioStep(bioStep + 1)
  }

  const bioSelectTone = async (tone: string) => {
    setBioTone(tone)
    setBioStep(bioQuestionKeys.length + 1)
    setAiLoading(true)
    setBioError(null)
    try {
      const res = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bioAnswers, language: lang, tone }),
      })
      const data = await res.json()
      if (data.bios) {
        setGeneratedBios(data.bios)
        setProfileBio(data.bios[lang] || Object.values(data.bios)[0] || '')
      } else {
        setGeneratedBios(null)
        setBioError(data.error || 'Unknown error from API')
      }
    } catch (e) {
      setGeneratedBios(null)
      setBioError('Network error: ' + String(e))
    }
    setAiLoading(false)
  }

  const bioRegenerate = async () => {
    if (!bioTone) return
    setBioStep(bioQuestionKeys.length + 1)
    setAiLoading(true)
    setGeneratedBios(null)
    setBioError(null)
    try {
      const res = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bioAnswers, language: lang, tone: bioTone }),
      })
      const data = await res.json()
      if (data.bios) {
        setGeneratedBios(data.bios)
        setProfileBio(data.bios[lang] || Object.values(data.bios)[0] || '')
      } else {
        setBioError(data.error || 'Unknown error from API')
      }
    } catch (e) {
      setBioError('Network error: ' + String(e))
    }
    setAiLoading(false)
  }

  const bioUseCurrent = () => {
    if (generatedBios) {
      setProfileBio(generatedBios[lang] || Object.values(generatedBios)[0] || '')
      setBioTranslations(generatedBios)
    }
    setShowAI(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const submitBugReport = async () => {
    if (!bugWhat.trim() || !bugExpected.trim() || !bugFile) {
      setBugError(t.bugFillRequired)
      return
    }
    setBugSending(true)
    setBugError('')
    try {
      const reader = new FileReader()
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(bugFile)
      })
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatHappened: bugWhat,
          whatExpected: bugExpected,
          page: bugPage,
          severity: bugSeverity,
          screenshot: fileData,
          fileName: bugFile.name,
          userEmail: distributor?.email || '',
          userName: distributor?.name || '',
          userSlug: distributor?.slug || '',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          language: lang,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setBugSent(true)
      setTimeout(() => {
        setBugOpen(false)
        setBugSent(false)
        setBugWhat('')
        setBugExpected('')
        setBugPage('Dashboard')
        setBugFile(null)
        setBugSeverity('Medium')
      }, 2500)
    } catch {
      setBugError(t.somethingWentWrong)
    } finally {
      setBugSending(false)
    }
  }

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />
      <div className="loading-screen">
        <img src={SYSTM8_LOGO} className="loading-logo" alt="SYSTM8" />
        <span className="loading-text">{t.loading}</span>
      </div>
    </>
  )

  const pending = leads.filter(l => !l.uid_verified)
  const approved = leads.filter(l => l.uid_verified)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      {/* Toast notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className={`toast-inner ${toastType === 'error' ? 'toast-error' : 'toast-info'}`}>
            <span>{toastMsg}</span>
            <button className="toast-close" onClick={() => setToastMsg('')}>✕</button>
          </div>
        </div>
      )}

      <div className="dash-wrap" id="main-content">

        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-header-left">
            {/* SYSTM8 Logo */}
            <img src={SYSTM8_LOGO} className="systm8-logo" alt="SYSTM8" />
            <div className="header-divider" aria-hidden="true" />
            {distributor?.profile_image ? (
              <img src={parseProfileImage(distributor.profile_image).url} className="avatar"
                style={{ objectPosition: `${parseProfileImage(distributor.profile_image).x}% ${parseProfileImage(distributor.profile_image).y}%` }}
                alt={distributor.name ? `Profile picture of ${distributor.name}` : 'Profile picture'} />
            ) : (
              <div className="avatar-placeholder" aria-hidden="true">👤</div>
            )}
            <div>
              <div className="dash-username">{distributor?.name || 'Dashboard'}</div>
              <div className="dash-email">{distributor?.email}</div>
            </div>
          </div>
          <div className="header-actions">
            {distributor?.slug && (
              <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-btn gold-btn-sm">
                {t.viewPage} <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            )}

            {/* Language selector */}
            <div className="lang-selector" ref={langRef}>
              <button
                className="lang-btn"
                onClick={() => setLangOpen(!langOpen)}
                aria-label={`Select language, current: ${languageLabels[lang]}`}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/>
                </svg>
                {languageLabels[lang]}
              </button>
              {langOpen && (
                <div className="lang-dropdown" role="listbox" aria-label="Select language">
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <button
                      key={code}
                      role="option"
                      aria-selected={code === lang}
                      className={`lang-option${code === lang ? ' lang-option-active' : ''}`}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="btn-outline">{t.logout}</button>
          </div>
        </header>

        {/* TABS */}
        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          <button
            role="tab"
            aria-selected={activeTab === 'metrics'}
            aria-controls="tab-panel-metrics"
            id="tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`tab-btn${activeTab === 'metrics' ? ' tab-btn-active' : ''}`}
          >
            {t.metricsTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'profile'}
            aria-controls="tab-panel-profile"
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`tab-btn${activeTab === 'profile' ? ' tab-btn-active' : ''}`}
          >
            {t.profileTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'leads'}
            aria-controls="tab-panel-leads"
            id="tab-leads"
            onClick={() => setActiveTab('leads')}
            className={`tab-btn${activeTab === 'leads' ? ' tab-btn-active' : ''}`}
          >
            {t.leadsTab} ({leads.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'resources'}
            aria-controls="tab-panel-resources"
            id="tab-resources"
            onClick={() => setActiveTab('resources')}
            className={`tab-btn${activeTab === 'resources' ? ' tab-btn-active' : ''}`}
          >
            {t.ibResourcesTab}
          </button>
        </div>

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div role="tabpanel" id="tab-panel-leads" aria-labelledby="tab-leads">
            <div className="card">
              <h2 className="card-title">{t.registerLead}</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <label className="sr-only" htmlFor="lead-name">{t.fullName}</label>
                <input id="lead-name" className="field-input" placeholder={t.fullName} value={leadName} onChange={e => setLeadName(e.target.value)} aria-required="true" />
                <label className="sr-only" htmlFor="lead-email">{t.emailAddress}</label>
                <input id="lead-email" className="field-input" placeholder={t.emailAddress} type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} aria-required="true" />
                <label className="sr-only" htmlFor="lead-uid">{t.uidPlaceholder}</label>
                <input id="lead-uid" className="field-input" placeholder={t.uidPlaceholder} value={leadUid} onChange={e => setLeadUid(e.target.value)} />
                <button onClick={addLead} disabled={submitting} className="gold-btn" style={{ marginTop: 4 }} aria-busy={submitting}>
                  {submitting ? t.sending : t.addLead}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-header">
                <span aria-hidden="true">⏳</span> {t.pendingHeader}
                <span className="badge badge-warning" aria-label={`${pending.length} pending`}>{pending.length}</span>
              </h3>
              {pending.length === 0 && <p className="empty-text">{t.noPending}</p>}
              <ul aria-label={t.pendingHeader} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pending.map(lead => (
                  <li key={lead.id} className="lead-item lead-item-pending">
                    <div>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-detail">{lead.email}</div>
                      <div className="lead-uid">UID: <strong>{lead.uid || t.notProvided}</strong></div>
                      <div className="lead-date">
                        <time dateTime={new Date(lead.created_at).toISOString()}>
                          {new Date(lead.created_at).toLocaleDateString('no-NO')}
                        </time>
                      </div>
                    </div>
                    <button
                      onClick={() => approveLead(lead)}
                      disabled={approvingId === lead.id}
                      className="btn-success"
                      aria-label={`${t.approve} ${lead.name}`}
                      aria-busy={approvingId === lead.id}
                    >
                      {approvingId === lead.id ? t.sending : <><span aria-hidden="true">✓ </span>{t.approve}</>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="section-header">
                <span aria-hidden="true">✅</span> {t.approvedHeader}
                <span className="badge badge-success" aria-label={`${approved.length} approved`}>{approved.length}</span>
              </h3>
              {approved.length === 0 && <p className="empty-text">{t.noApproved}</p>}
              <ul aria-label={t.approvedHeader} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {approved.map(lead => (
                  <li key={lead.id} className="lead-item lead-item-approved">
                    <div>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-detail">{lead.email}</div>
                      <div className="lead-uid">UID: <strong>{lead.uid}</strong></div>
                      <div className="lead-date">
                        {t.approvedDate}:{' '}
                        {lead.uid_verified_at ? (
                          <time dateTime={new Date(lead.uid_verified_at).toISOString()}>
                            {new Date(lead.uid_verified_at).toLocaleDateString('no-NO')}
                          </time>
                        ) : '-'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-grid" role="tabpanel" id="tab-panel-profile" aria-labelledby="tab-profile">
            <div>
              <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>{t.editProfile}</h2>

              <div className="field-group" style={{ marginBottom: '1.5rem' }}>
                <label className="field-label" htmlFor="profile-image-upload">{t.profileImage}</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 6 }}>
                  {profileImage ? (
                    <div>
                      <div
                        className="upload-area"
                        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
                        onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY) }}
                        onMouseMove={e => moveDrag(e.clientX, e.clientY)}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY) }}
                        onTouchEnd={endDrag}
                        role="img"
                        aria-label={`${profileName ? `Profile picture of ${profileName}` : 'Profile picture'}. Drag to reposition.`}
                      >
                        <img src={profileImage} alt=""
                          style={{ objectPosition: `${imgX}% ${imgY}%` }} />
                      </div>
                      <p style={{ margin: '5px 0 0', fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span aria-hidden="true">↔</span> {t.dragToReposition}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="upload-area"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label={t.uploadImage}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                    >
                      <span style={{ fontSize: 24, color: 'var(--gold)' }} aria-hidden="true">{uploadingImage ? '⏳' : '📷'}</span>
                    </div>
                  )}
                  <div style={{ paddingTop: 4 }}>
                    <button
                      id="profile-image-upload"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="gold-btn gold-btn-sm"
                      aria-busy={uploadingImage}
                    >
                      {uploadingImage ? t.uploading : profileImage ? t.changeImage : t.uploadImage}
                    </button>
                    <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.imageHint}</p>
                    {profileImage && <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'var(--text-dim)' }}>{t.rememberToSave}</p>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-name">{t.fullName}</label>
                <input id="profile-name" className="field-input" value={profileName} onChange={e => setProfileName(e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-slug">{t.yourUrl}</label>
                <div className="url-input-wrap" style={slugError ? { borderColor: '#d44a37' } : undefined}>
                  <span className="url-prefix" aria-hidden="true">primeverseaccess.com/</span>
                  <input id="profile-slug" value={profileSlug} onChange={e => { setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugError(false) }} placeholder="ditt-navn" aria-label={`${t.yourUrl}: primeverseaccess.com/`} aria-invalid={slugError} />
                </div>
                {slugError && <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#d44a37' }}>{t.slugTaken}</p>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-referral">IB / Referral-link</label>
                <input id="profile-referral" type="url" className="field-input" value={profileReferralLink} onChange={e => { setProfileReferralLink(e.target.value); setReferralError(false) }} placeholder="https://puvip.co/la-partners/..." style={referralError ? { borderColor: '#d44a37' } : undefined} aria-invalid={referralError} />
                {referralError && <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#d44a37' }}>{t.referralRequired}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">{t.socialMedia || 'Social media'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input className="field-input" value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} placeholder="TikTok URL" />
                  <input className="field-input" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="Instagram URL" />
                  <input className="field-input" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="Facebook URL" />
                  <input className="field-input" value={socialSnapchat} onChange={e => setSocialSnapchat(e.target.value)} placeholder="Snapchat URL" />
                  <input className="field-input" value={socialLinkedin} onChange={e => setSocialLinkedin(e.target.value)} placeholder="LinkedIn URL" />
                  <input className="field-input" value={socialYoutube} onChange={e => setSocialYoutube(e.target.value)} placeholder={t.youtubeUrl || 'YouTube URL'} />
                  <input className="field-input" value={socialOther} onChange={e => setSocialOther(e.target.value)} placeholder={t.otherUrl || 'Other URL'} />
                </div>
              </div>

              <div className="field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="field-label" htmlFor="profile-bio" style={{ marginBottom: 0 }}>{t.bio}</label>
                  <button
                    onClick={() => { if (!showAI) startAI(); else setShowAI(false); }}
                    aria-expanded={showAI}
                    aria-controls="ai-panel"
                    style={{
                      fontSize: '0.72rem', padding: '4px 12px',
                      background: showAI ? 'rgba(212,165,55,0.15)' : 'transparent',
                      color: showAI ? 'var(--gold)' : 'var(--text-secondary)',
                      border: '1px solid var(--card-border)', borderRadius: 20,
                      cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <span aria-hidden="true">✦ </span>{t.aiHelper}
                  </button>
                </div>
                <textarea id="profile-bio" className="field-textarea" value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder={t.bioPlaceholder} rows={6} />
              </div>

              {distributor?.slug ? (
                <button onClick={updateProfile} disabled={updatingProfile} className="btn-outline" style={{ width: '100%', fontSize: '1rem', padding: '14px', letterSpacing: '0.05em' }} aria-busy={updatingProfile}>
                  {updatingProfile ? t.updating : updateSaved ? `✓ ${t.updated}` : t.updateInfo}
                </button>
              ) : (
                <button onClick={saveProfile} disabled={savingProfile} className="gold-btn" style={{ width: '100%', fontSize: '1rem', padding: '14px', letterSpacing: '0.05em' }} aria-busy={savingProfile}>
                  {savingProfile ? `⏳ ${t.generatingPage}` : profileSaved ? `✓ ${t.pageIsLive}` : `🚀 ${t.generatePage}`}
                </button>
              )}

              {profileSaved && distributor?.slug && (
                <div style={{
                  marginTop: '1rem', padding: '1.25rem 1.5rem',
                  background: 'rgba(212,165,55,0.08)', border: '1px solid var(--gold)',
                  borderRadius: 12, textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.pageLiveAt}</p>
                  <a
                    href={`/${distributor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--gold)', fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none',
                      display: 'block', marginBottom: '0.75rem'
                    }}
                  >
                    primeverseaccess.com/{distributor.slug}
                    <span className="sr-only"> (åpner i ny fane)</span>
                  </a>
                  <a
                    href={`/${distributor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-btn"
                    style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 24px', fontSize: '0.85rem' }}
                  >
                    {t.viewLandingPage} →
                  </a>
                </div>
              )}

              {!profileSaved && distributor?.slug && (
                <p style={{ margin: '0.75rem 0 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {t.yourPageAt} <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-link">primeverseaccess.com/{distributor.slug}</a>
                </p>
              )}
            </div>

            <div id="ai-panel">
              {showAI ? (
                <div className="ai-panel">
                  <div className="ai-header">
                    <span className="sparkle" aria-hidden="true">✦</span> {t.aiTitle}
                    <span className="powered">AI</span>
                  </div>
                  <div className="ai-body">
                    {/* Step indicator dots */}
                    <div className="ai-step-indicator">
                      {bioQuestionKeys.map((_, i) => (
                        <div key={i} className={`ai-step-dot${i === bioStep ? ' active' : i < bioStep ? ' done' : ''}`} />
                      ))}
                      <div className={`ai-step-dot${bioStep === bioQuestionKeys.length ? ' active' : bioStep > bioQuestionKeys.length ? ' done' : ''}`} />
                      <div className={`ai-step-dot${bioStep > bioQuestionKeys.length ? ' active' : ''}`} />
                    </div>

                    {/* Step 1: Questions (one at a time) */}
                    {bioStep < bioQuestionKeys.length && (
                      <div>
                        <div className="ai-question-count">{bioStep + 1} {t.aiStepOf} {bioQuestionKeys.length}</div>
                        <div className="ai-question">{bioQuestionTexts[bioQuestionKeys[bioStep]][lang] || bioQuestionTexts[bioQuestionKeys[bioStep]].en}</div>
                        <textarea className="ai-textarea" value={bioCurrentAnswer} onChange={e => setBioCurrentAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && bioCurrentAnswer.trim()) { e.preventDefault(); bioNextQuestion() } }} rows={3} autoFocus />
                        <button className="ai-next-btn" onClick={bioNextQuestion} disabled={!bioCurrentAnswer.trim()}>{t.aiNext} →</button>
                      </div>
                    )}

                    {/* Step 2: Choose tone */}
                    {bioStep === bioQuestionKeys.length && (
                      <div>
                        <div className="ai-question">{t.aiChooseTone}</div>
                        <div className="ai-tone-grid">
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('professional')}>
                            <span className="ai-tone-emoji">💼</span>
                            {toneLabels.professional[lang] || toneLabels.professional.en}
                          </button>
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('casual')}>
                            <span className="ai-tone-emoji">😊</span>
                            {toneLabels.casual[lang] || toneLabels.casual.en}
                          </button>
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('motivational')}>
                            <span className="ai-tone-emoji">🔥</span>
                            {toneLabels.motivational[lang] || toneLabels.motivational.en}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Loading */}
                    {bioStep > bioQuestionKeys.length && aiLoading && (
                      <div className="ai-loading">
                        <div className="ai-spinner" />
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{t.aiGenerating}</div>
                      </div>
                    )}

                    {/* Step 4: Preview */}
                    {bioStep > bioQuestionKeys.length && !aiLoading && generatedBios && (
                      <div>
                        <div className="ai-question">{t.aiPreview}</div>
                        <div className="ai-preview-bio">{generatedBios[lang] || Object.values(generatedBios)[0]}</div>
                        <div className="ai-btn-row">
                          <button className="ai-btn-primary" onClick={bioUseCurrent}>{t.aiUseThis}</button>
                          <button className="ai-btn-secondary" onClick={bioRegenerate}>{t.aiRegenerate}</button>
                          <button className="ai-btn-secondary" onClick={startAI}>{t.aiStartOver}</button>
                        </div>
                        <button className="ai-lang-toggle" onClick={() => setBioLangOpen(!bioLangOpen)}>
                          {bioLangOpen ? '▾' : '▸'} {t.aiOtherLangs}
                        </button>
                        {bioLangOpen && (
                          <div className="ai-lang-list">
                            {Object.entries(generatedBios).filter(([code]) => code !== lang).map(([code, bio]) => (
                              <div key={code} className="ai-lang-item">
                                <strong>{langLabels[code] || code}</strong>
                                {bio}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error state */}
                    {bioStep > bioQuestionKeys.length && !aiLoading && !generatedBios && (
                      <div className="ai-loading">
                        <div style={{ color: '#d44a37', fontSize: '0.84rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                          {t.somethingWentWrong}
                        </div>
                        {bioError && (
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem', marginBottom: '1rem', maxWidth: '340px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {bioError}
                          </div>
                        )}
                        <div className="ai-btn-row" style={{ justifyContent: 'center' }}>
                          <button className="ai-btn-secondary" onClick={bioRegenerate}>{t.aiRegenerate}</button>
                          <button className="ai-btn-secondary" onClick={startAI}>{t.aiStartOver}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <div className="sparkle-big" aria-hidden="true">✦</div>
                  <h3>{t.aiTitle}</h3>
                  <p>{t.aiDescription}</p>
                  <button onClick={startAI} className="gold-btn">{t.startAi}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* IB RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div role="tabpanel" id="tab-panel-resources" aria-labelledby="tab-resources">
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)', margin: '0 0 0.35rem' }}>{t.ibResourcesTab}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>{t.ibResourcesSubtitle}</p>
            </div>
            <div className="ib-resources-grid">
              <a
                href="https://seed-timpani-7f1.notion.site/29eb91acac5281c589cee5eb17a53522?v=29eb91acac5281c18d3a000ca39a21d0&source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.ibTraining}</div>
                  <div className="ib-resource-desc">{t.ibTrainingDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
              <div className="ib-resource-card ib-resource-card-disabled">
                <div className="ib-resource-badge">{t.comingSoon}</div>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.contentLibrary}</div>
                  <div className="ib-resource-desc">{t.contentLibraryDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
              <a
                href="https://puprimelive.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.vipSupport}</div>
                  <div className="ib-resource-desc">{t.vipSupportDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
              <a
                href="https://www.canva.com/design/DAHCjaOppW8/yeLC5W-gz6d_F6hjfkfOqQ/view"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <polygon points="10,8 10,12 14,10" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.pvPresentation}</div>
                  <div className="ib-resource-desc">{t.pvPresentationDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <MetricsTab
            leads={leads}
            pageViews={pageViews}
            period={metricPeriod}
            setPeriod={setMetricPeriod}
            loading={metricsLoading}
            distributor={distributor}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            pageViewHistory={pageViewHistory}
            t={t}
          />
        )}

      </div>

      {/* ── Bug Report FAB ── */}
      <button className="bug-fab" onClick={() => { setBugOpen(true); setBugSent(false); setBugError('') }} aria-label={t.reportBug} title={t.reportBug}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
          <path d="M12 20v2M6 13H2M6 17H3M18 13h4M18 17h3" />
        </svg>
      </button>

      {/* ── Bug Report Modal ── */}
      {bugOpen && (
        <div className="bug-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBugOpen(false) }}>
          <div className="bug-modal">
            {bugSent ? (
              <div className="bug-success-msg">
                <span style={{ fontSize: '2.5rem' }}>✓</span>
                <span>{t.bugSuccess}</span>
              </div>
            ) : (
              <>
                <div className="bug-modal-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
                    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
                    <path d="M12 20v2M6 13H2M6 17H3M18 13h4M18 17h3" />
                  </svg>
                  {t.bugModalTitle}
                </div>
                <div className="bug-modal-instructions">{t.bugModalInstructions}</div>

                <div className="bug-field">
                  <label>{t.bugWhatHappened} *</label>
                  <textarea value={bugWhat} onChange={e => setBugWhat(e.target.value)} />
                </div>

                <div className="bug-field">
                  <label>{t.bugWhatExpected} *</label>
                  <textarea value={bugExpected} onChange={e => setBugExpected(e.target.value)} />
                </div>

                <div className="bug-field">
                  <label>{t.bugWhichPage}</label>
                  <select value={bugPage} onChange={e => setBugPage(e.target.value)}>
                    <option value="Dashboard">{t.bugPageDashboard}</option>
                    <option value="Landing page">{t.bugPageLanding}</option>
                    <option value="Login">{t.bugPageLogin}</option>
                    <option value="Other">{t.bugPageOther}</option>
                  </select>
                </div>

                <div className="bug-field">
                  <label>{t.bugScreenshot} *</label>
                  <input
                    ref={bugFileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f && f.size <= 5 * 1024 * 1024) setBugFile(f)
                      else if (f) setBugError('Max 5MB')
                    }}
                  />
                  <div
                    className={`bug-file-zone${bugFile ? ' bug-file-zone-active' : ''}`}
                    onClick={() => bugFileRef.current?.click()}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 4 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {bugFile ? '' : t.bugScreenshot}
                    </div>
                    {bugFile && <div className="bug-file-name">{bugFile.name}</div>}
                    <div className="bug-file-hint">{t.bugScreenshotHint}</div>
                  </div>
                </div>

                <div className="bug-field">
                  <label>{t.bugSeverity}</label>
                  <select value={bugSeverity} onChange={e => setBugSeverity(e.target.value)}>
                    <option value="Critical">{t.bugSeverityCritical}</option>
                    <option value="High">{t.bugSeverityHigh}</option>
                    <option value="Medium">{t.bugSeverityMedium}</option>
                    <option value="Low">{t.bugSeverityLow}</option>
                  </select>
                </div>

                {bugError && <div className="bug-error">{bugError}</div>}

                <div className="bug-actions">
                  <button onClick={submitBugReport} disabled={bugSending} className="gold-btn">
                    {bugSending ? t.bugSending : t.bugSend}
                  </button>
                  <button onClick={() => setBugOpen(false)} className="btn-outline">{t.bugCancel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Rolex Gauge component ────────────────────────────────────────────────── */
function RolexGauge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  // Needle rotates from 220° (0%) to 500° (100%) — full sweep through top
  const needleAngle = 220 + pct * 280

  // Gold number labels positioned absolutely around the edge
  const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const centerX = 110, centerY = 110, numRadius = 65

  const numberPositions = numbers.map((n, i) => {
    const angleDeg = 220 + (i / (numbers.length - 1)) * 280
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      n,
      left: centerX + Math.cos(angleRad) * numRadius,
      top: centerY + Math.sin(angleRad) * numRadius,
    }
  })

  return (
    <div className="rolex-gauge-wrap">
      {/* CSS bezel */}
      <div className="rolex-gauge-bezel" />
      {/* Inner ring for depth */}
      <div className="rolex-gauge-inner-ring" />
      {/* Number labels */}
      {numberPositions.map(p => (
        <span key={p.n} className="rolex-gauge-number"
          style={{ left: p.left, top: p.top }}>
          {p.n}
        </span>
      ))}
      {/* SVG tick marks + needle */}
      <svg className="rolex-gauge-overlay" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b6914" />
            <stop offset="50%" stopColor="#d4a537" />
            <stop offset="100%" stopColor="#f5d77a" />
          </linearGradient>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Tick marks */}
        {Array.from({ length: 51 }, (_, i) => {
          const angleDeg = 220 + (i / 50) * 280
          const angleRad = (angleDeg * Math.PI) / 180
          const isMajor = i % 5 === 0
          const outerR = 100
          const innerR = isMajor ? 88 : 93
          const x1 = 110 + Math.cos(angleRad) * outerR
          const y1 = 110 + Math.sin(angleRad) * outerR
          const x2 = 110 + Math.cos(angleRad) * innerR
          const y2 = 110 + Math.sin(angleRad) * innerR
          return (
            <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? '#d4a537' : 'rgba(212,165,55,0.4)'}
              strokeWidth={isMajor ? 2 : 0.8}
            />
          )
        })}
        <g className="rolex-gauge-needle-g" style={{ transform: `rotate(${needleAngle}deg)` }}
          filter="url(#needleGlow)">
          <polygon
            points="110,108 110,112 172,110"
            fill="url(#needleGrad)"
          />
        </g>
      </svg>
      {/* Center dot */}
      <div className="rolex-gauge-center" />
    </div>
  )
}

/* ─── Mini Line Chart ──────────────────────────────────────────────────────── */
function ViewsChart({ data, noDataLabel }: { data: { date: string; count: number }[]; noDataLabel?: string }) {
  if (!data.length) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{noDataLabel || 'No data yet'}</div>

  const maxVal = Math.max(...data.map(d => d.count), 1)
  const padL = 36, padR = 16, padT = 12, padB = 28
  const w = 600, h = 200
  const chartW = w - padL - padR
  const chartH = h - padT - padB

  const points = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + chartH - (d.count / maxVal) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`

  // Y-axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((maxVal / ySteps) * i))

  // X-axis labels (show ~6 evenly spaced)
  const xLabelCount = Math.min(data.length, 6)
  const xIndices = Array.from({ length: xLabelCount }, (_, i) => Math.round((i / (xLabelCount - 1)) * (data.length - 1)))

  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,165,55,0.25)" />
          <stop offset="100%" stopColor="rgba(212,165,55,0)" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = padT + chartH - (v / maxVal) * chartH
        return <line key={i} x1={padL} y1={y} x2={w - padR} y2={y} className="chart-grid-line" />
      })}
      {/* Y labels */}
      {yLabels.map((v, i) => {
        const y = padT + chartH - (v / maxVal) * chartH
        return <text key={i} x={padL - 6} y={y + 3} className="chart-y-label" textAnchor="end">{v}</text>
      })}
      {/* Area */}
      <path d={areaPath} className="chart-area" />
      {/* Line */}
      <path d={linePath} className="chart-line" />
      {/* Dots on last 3 points */}
      {points.slice(-3).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="chart-dot" />
      ))}
      {/* X labels */}
      {xIndices.map(idx => {
        const p = points[idx]
        const label = p.date.slice(5) // MM-DD
        return <text key={idx} x={p.x} y={h - 6} className="chart-x-label" textAnchor="middle">{label}</text>
      })}
    </svg>
  )
}

/* ─── Metrics tab ──────────────────────────────────────────────────────────── */
function MetricsTab({ leads, pageViews, period, setPeriod, loading, distributor, chartPeriod, setChartPeriod, pageViewHistory, t }: {
  leads: any[]; pageViews: number; period: string;
  setPeriod: (p: 'day' | 'week' | 'month' | 'all') => void; loading: boolean;
  distributor: any; chartPeriod: '7d' | '30d' | '90d';
  setChartPeriod: (p: '7d' | '30d' | '90d') => void;
  pageViewHistory: { date: string; count: number }[];
  t: Record<string, string>;
}) {
  const now = new Date()
  const cutoff = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d }
  const startOf = (unit: 'day' | 'week' | 'month' | 'all'): Date | null => {
    if (unit === 'all') return null
    if (unit === 'day') { const d = new Date(now); d.setHours(0,0,0,0); return d }
    if (unit === 'week') return cutoff(7)
    return cutoff(30)
  }
  const start = startOf(period as 'day' | 'week' | 'month' | 'all')
  const filtered = start ? leads.filter(l => new Date(l.created_at) >= start) : leads
  const registered = filtered.length
  const approved = filtered.filter(l => l.uid_verified).length
  const pending = filtered.filter(l => !l.uid_verified).length
  const convRate = registered > 0 ? Math.round((approved / registered) * 100) : 0

  // Profile strength
  const hasImage = !!distributor?.profile_image
  const hasBio = !!distributor?.bio
  const hasSlug = !!distributor?.slug
  const hasReferral = !!distributor?.referral_link
  const hasSocial = !!(distributor?.social_tiktok || distributor?.social_instagram || distributor?.social_facebook || distributor?.social_snapchat || distributor?.social_linkedin || distributor?.social_youtube || distributor?.social_other)
  const strengthParts = [hasImage, hasBio, hasSlug, hasReferral, hasSocial]
  const profileStrength = strengthParts.filter(Boolean).length * 20

  // Approval rate
  const totalLeads = leads.length
  const totalApproved = leads.filter(l => l.uid_verified).length
  const approvalRate = totalLeads > 0 ? Math.round((totalApproved / totalLeads) * 100) : 0

  const periods: { key: 'day' | 'week' | 'month' | 'all'; label: string }[] = [
    { key: 'day', label: t.daily }, { key: 'week', label: t.weekly },
    { key: 'month', label: t.monthly }, { key: 'all', label: t.allTime },
  ]

  return (
    <div role="tabpanel" id="tab-panel-metrics" aria-labelledby="tab-metrics">

      {/* Period selector */}
      <div className="period-row" style={{ marginBottom: '1.75rem' }}>
        {periods.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`period-btn${period === p.key ? ' period-btn-active' : ''}`}
            aria-pressed={period === p.key}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Metric Cards ── */}
      <div className="metric-cards-row">
        <div className="metric-card">
          <div className="metric-card-label">{t.pageViews}</div>
          <div className="metric-card-value">{loading ? '—' : pageViews.toLocaleString()}</div>
          <div className="metric-card-sub">{t.uniqueVisitors}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">{t.leadsTab}</div>
          <div className="metric-card-value">{registered}</div>
          <div className="metric-card-sub">{pending} {t.pending} · {approved} {t.approved}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">{t.conversions}</div>
          <div className="metric-card-value">{approved}</div>
          <div className="metric-card-change neutral">{convRate}% {t.rate}</div>
        </div>
      </div>

      {/* ── Rolex Gauge Instruments ── */}
      <div className="gauges-row">
        <div className="rolex-gauge-card">
          <RolexGauge value={convRate} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.conversionRate}</div>
          <div className="rolex-gauge-value">{convRate}%</div>
          <div className="rolex-gauge-sub">{t.regToApproved}</div>
        </div>
        <div className="rolex-gauge-card">
          <RolexGauge value={profileStrength} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.profileStrength}</div>
          <div className="rolex-gauge-value">{profileStrength}%</div>
          <div className="strength-items">
            {[
              { ok: hasImage, text: t.profileImage },
              { ok: hasBio, text: t.bio },
              { ok: hasSlug, text: t.customUrl },
              { ok: hasReferral, text: t.referralLink },
              { ok: hasSocial, text: t.socialMedia },
            ].map(s => (
              <div key={s.text} className="strength-item">
                <span className={s.ok ? 'strength-check' : 'strength-miss'}>{s.ok ? '✓' : '○'}</span>
                <span style={s.ok ? { color: 'var(--text-secondary)' } : {}}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rolex-gauge-card">
          <RolexGauge value={approvalRate} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.approvalRate}</div>
          <div className="rolex-gauge-value">{approvalRate}%</div>
          <div className="rolex-gauge-sub">{t.xOfYVerified.replace('{0}', String(totalApproved)).replace('{1}', String(totalLeads))}</div>
        </div>
      </div>

      {/* ── Line Chart ── */}
      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-title">{t.pageViewsOverTime}</div>
          <div className="chart-tabs">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setChartPeriod(p)}
                className={`chart-tab${chartPeriod === p ? ' chart-tab-active' : ''}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ViewsChart data={pageViewHistory} noDataLabel={t.noDataYet} />
      </div>

      {/* ── Lead Breakdown ── */}
      <div className="metrics-summary">
        <div className="metrics-summary-title">{t.leadBreakdown}</div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#d4a537' }} />
            <span className="metrics-row-label">{t.pageViews}</span>
          </div>
          <span className="metrics-row-value">{loading ? '—' : pageViews.toLocaleString()}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#c9a84c' }} />
            <span className="metrics-row-label">{t.registeredLeads}</span>
          </div>
          <span className="metrics-row-value">{registered}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#f4a742' }} />
            <span className="metrics-row-label">{t.pendingVerification}</span>
          </div>
          <span className="metrics-row-value">{pending}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#6dc07f' }} />
            <span className="metrics-row-label">{t.approvedHeader}</span>
          </div>
          <span className="metrics-row-value">{approved}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#e8c975' }} />
            <span className="metrics-row-label">{t.conversionRateLower}</span>
          </div>
          <span className="metrics-row-value">{convRate}%</span>
        </div>
      </div>

    </div>
  )
}
