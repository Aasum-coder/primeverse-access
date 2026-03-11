'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    aiDescription: 'Claude asks you some questions and writes a bio that is personal and optimized for conversion.',
    startAi: 'Start AI assistant',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Write here... (Enter to send)',
    aiTyping: 'Writing...',
    fillAll: 'Fill in all fields',
    aiGreeting: "Hi! I'm here to help you write a bio that converts. Tell me a little about yourself — where are you from, what is your background, and why did you join 1Move Academy?",
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
    aiDescription: 'Claude stiller deg noen spørsmål og skriver en bio som er personlig og optimert for konvertering.',
    startAi: 'Start AI-assistenten',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Skriv her... (Enter for å sende)',
    aiTyping: 'Skriver...',
    fillAll: 'Fyll inn alle feltene',
    aiGreeting: "Hei! Jeg er her for å hjelpe deg med å skrive en bio som konverterer. Fortell litt om deg selv — hvor er du fra, hva er bakgrunnen din, og hvorfor ble du med i 1Move Academy?",
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
    aiDescription: 'Claude ställer dig några frågor och skriver en bio som är personlig och optimerad för konvertering.',
    startAi: 'Starta AI-assistenten',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Skriv här... (Enter för att skicka)',
    aiTyping: 'Skriver...',
    fillAll: 'Fyll i alla fält',
    aiGreeting: "Hej! Jag är här för att hjälpa dig skriva en bio som konverterar. Berätta lite om dig själv — var kommer du ifrån, vad är din bakgrund, och varför gick du med i 1Move Academy?",
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
    aiDescription: 'Claude te hace preguntas y escribe una bio personal y optimizada para conversión.',
    startAi: 'Iniciar asistente AI',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Escribe aquí... (Enter para enviar)',
    aiTyping: 'Escribiendo...',
    fillAll: 'Completa todos los campos',
    aiGreeting: "¡Hola! Estoy aquí para ayudarte a escribir una bio que convierte. Cuéntame un poco sobre ti — ¿de dónde eres, cuál es tu experiencia, y por qué te uniste a 1Move Academy?",
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
    aiDescription: 'Claude задаёт вам вопросы и пишет биографию, оптимизированную для конверсии.',
    startAi: 'Запустить AI-ассистента',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Напишите здесь... (Enter для отправки)',
    aiTyping: 'Пишет...',
    fillAll: 'Заполните все поля',
    aiGreeting: "Привет! Я здесь, чтобы помочь вам написать биографию, которая конвертирует. Расскажите немного о себе — откуда вы, какой у вас опыт, и почему вы присоединились к 1Move Academy?",
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
    aiDescription: 'يسألك Claude بعض الأسئلة ويكتب نبذة شخصية محسّنة للتحويل.',
    startAi: 'بدء مساعد AI',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'اكتب هنا... (Enter للإرسال)',
    aiTyping: 'يكتب...',
    fillAll: 'املأ جميع الحقول',
    aiGreeting: "مرحباً! أنا هنا لمساعدتك في كتابة نبذة تحقق التحويل. أخبرني قليلاً عن نفسك — من أين أنت، ما خلفيتك، ولماذا انضممت إلى 1Move Academy؟",
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
    aiDescription: 'Magtatanong si Claude at susulat ng bio na personal at optimized para sa conversion.',
    startAi: 'Simulan ang AI assistant',
    aiPowered: 'Powered by Claude',
    aiPlaceholder: 'Sumulat dito... (Enter para mag-send)',
    aiTyping: 'Nagsusulat...',
    fillAll: 'Punan lahat ng fields',
    aiGreeting: "Hi! Nandito ako para tulungan kang sumulat ng bio na nagko-convert. Kwento mo naman tungkol sa sarili mo — saan ka galing, ano ang background mo, at bakit ka sumali sa 1Move Academy?",
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
    height: 500px; backdrop-filter: blur(24px);
  }
  .ai-header {
    padding: 0.85rem 1.1rem; background: rgba(15,12,8,0.9);
    border-bottom: 1px solid var(--card-border);
    font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
    display: flex; align-items: center; gap: 8px;
  }
  .ai-header .sparkle { color: var(--gold); font-size: 1rem; }
  .ai-header .powered { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); font-weight: 400; }
  .ai-messages {
    flex: 1; overflow-y: auto; padding: 1rem;
    display: flex; flex-direction: column; gap: 0.6rem;
    background: rgba(8,8,6,0.5);
  }
  .ai-bubble { max-width: 88%; padding: 0.65rem 0.9rem; font-size: 0.82rem; line-height: 1.65; white-space: pre-wrap; }
  .ai-bubble-user {
    align-self: flex-end; background: rgba(212,165,55,0.15);
    color: var(--text-primary); border-radius: 14px 14px 4px 14px;
    border: 1px solid rgba(212,165,55,0.2);
  }
  .ai-bubble-ai {
    align-self: flex-start; background: rgba(20,18,14,0.8);
    color: var(--text-primary); border-radius: 14px 14px 14px 4px;
    border: 1px solid var(--card-border);
  }
  .ai-input-row {
    padding: 0.65rem 0.75rem; border-top: 1px solid var(--card-border);
    display: flex; gap: 8px; background: rgba(10,10,8,0.8);
  }
  .ai-input {
    flex: 1; padding: 0.55rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 20px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; outline: none;
  }
  .ai-input:focus { border-color: var(--input-focus); }
  .ai-send-btn {
    padding: 0.55rem 1.1rem; border: none; border-radius: 20px;
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 700;
    cursor: pointer; color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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

  .loading-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10; }
  .loading-text {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem;
    color: var(--gold); letter-spacing: 0.1em; animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

  @media (max-width: 640px) {
    .dash-wrap { padding: 1.5rem 1rem 3rem; }
    .dash-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .header-actions { width: 100%; flex-wrap: wrap; }
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
  .ai-send-btn:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .field-input:focus,
  .field-textarea:focus,
  .ai-input:focus {
    outline: 2px solid var(--gold);
    outline-offset: 1px;
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
  const [activeTab, setActiveTab] = useState<'leads' | 'profile'>('leads')

  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSlug, setProfileSlug] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showAI, setShowAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<{role: string, content: string}[]>([])
  const [bioStep, setBioStep] = useState(0)
  const [bioAnswers, setBioAnswers] = useState<Record<string, string>>({})

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
        if (error) { alert(error.message); return }
        dist = newDist
      }
      setDistributor(dist)
      setProfileName(dist.name || '')
      setProfileBio(dist.bio || '')
      setProfileSlug(dist.slug || '')
      setProfileImage(dist.profile_image || null)
      await fetchLeads(dist.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchLeads = async (distributorId: string) => {
    const { data } = await supabase.from('leads').select('*').eq('distributor_id', distributorId).order('created_at', { ascending: false })
    setLeads(data || [])
  }

  const addLead = async () => {
    if (!distributor || !leadName || !leadEmail || !leadUid) { alert(t.fillAll); return }
    setSubmitting(true)
    const { error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: leadName, email: leadEmail, uid: leadUid, uid_verified: false })
    if (error) { alert('Feil: ' + error.message); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName, leadEmail, leadUid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setLeadName(''); setLeadEmail(''); setLeadUid('')
    setSubmitting(false)
    await fetchLeads(distributor.id)
  }

  const approveLead = async (lead: any) => {
    setApprovingId(lead.id)
    const { error } = await supabase.from('leads').update({ uid_verified: true, uid_verified_at: new Date().toISOString() }).eq('id', lead.id)
    if (error) { alert('Feil: ' + error.message); setApprovingId(null); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'approved', leadName: lead.name, leadEmail: lead.email, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setApprovingId(null)
    await fetchLeads(distributor.id)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `${distributor.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { alert('Feil ved opplasting: ' + uploadError.message); setUploadingImage(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setProfileImage(data.publicUrl)
    setUploadingImage(false)
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, slug: profileSlug, profile_image: profileImage }).eq('id', distributor.id)
    if (error) { alert('Feil: ' + error.message); setSavingProfile(false); return }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, slug: profileSlug, profile_image: profileImage })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const bioQuestions = [
    { key: 'name', q: lang === 'no' ? 'Hva heter du? (Fullt navn)' : lang === 'sv' ? 'Vad heter du? (Fullständigt namn)' : lang === 'es' ? '¿Cómo te llamas? (Nombre completo)' : lang === 'ru' ? 'Как вас зовут? (Полное имя)' : lang === 'ar' ? 'ما اسمك؟ (الاسم الكامل)' : lang === 'tl' ? 'Ano ang pangalan mo? (Buong pangalan)' : 'What is your name? (Full name)' },
    { key: 'origin', q: lang === 'no' ? 'Hvor er du fra? (By/land)' : lang === 'sv' ? 'Var kommer du ifrån? (Stad/land)' : lang === 'es' ? '¿De dónde eres? (Ciudad/país)' : lang === 'ru' ? 'Откуда вы? (Город/страна)' : lang === 'ar' ? 'من أين أنت؟ (المدينة/البلد)' : lang === 'tl' ? 'Saan ka galing? (Lungsod/bansa)' : 'Where are you from? (City/country)' },
    { key: 'background', q: lang === 'no' ? 'Hva er din bakgrunn? (Yrke, erfaring, utdanning)' : lang === 'sv' ? 'Vad är din bakgrund? (Yrke, erfarenhet)' : lang === 'es' ? '¿Cuál es tu experiencia? (Profesión, experiencia)' : lang === 'ru' ? 'Какой у вас опыт? (Профессия, опыт)' : lang === 'ar' ? 'ما خلفيتك؟ (المهنة، الخبرة)' : lang === 'tl' ? 'Ano ang background mo? (Trabaho, karanasan)' : 'What is your background? (Profession, experience)' },
    { key: 'why', q: lang === 'no' ? 'Hvorfor ble du med i 1Move Academy? Hva motiverer deg?' : lang === 'sv' ? 'Varför gick du med i 1Move Academy? Vad motiverar dig?' : lang === 'es' ? '¿Por qué te uniste a 1Move Academy? ¿Qué te motiva?' : lang === 'ru' ? 'Почему вы присоединились к 1Move Academy? Что вас мотивирует?' : lang === 'ar' ? 'لماذا انضممت إلى 1Move Academy؟ ما الذي يحفزك؟' : lang === 'tl' ? 'Bakit ka sumali sa 1Move Academy? Ano ang motivation mo?' : 'Why did you join 1Move Academy? What motivates you?' },
    { key: 'promise', q: lang === 'no' ? 'Hva kan dine members forvente av deg?' : lang === 'sv' ? 'Vad kan dina members förvänta sig av dig?' : lang === 'es' ? '¿Qué pueden esperar tus miembros de ti?' : lang === 'ru' ? 'Что могут ожидать от вас ваши участники?' : lang === 'ar' ? 'ماذا يمكن لأعضائك توقعه منك؟' : lang === 'tl' ? 'Ano ang maaasahan ng iyong members sa iyo?' : 'What can your members expect from you?' },
  ]

  const generateBio = (answers: Record<string, string>): string => {
    const { name, origin, background, why, promise } = answers
    const bios = [
      `${name} fra ${origin} er en dedikert 1Move Academy-representant med bakgrunn innen ${background}. ${why} Med lidenskap og erfaring er målet klart: ${promise} Bli med på reisen mot finansiell frihet — med ${name.split(' ')[0]} som din guide.`,
      `Møt ${name}, din personlige partner fra ${origin} i 1Move Academy. Med erfaring fra ${background}, brenner ${name.split(' ')[0]} for å gjøre en forskjell. ${why} Som din representant lover ${name.split(' ')[0]} én ting: ${promise}`,
      `${name} fra ${origin} har funnet sin lidenskap gjennom 1Move Academy. Med bakgrunn innen ${background} og en sterk motivasjon — ${why.toLowerCase()} — er ${name.split(' ')[0]} klar til å hjelpe deg. ${promise}`,
    ]
    return bios[Math.floor(Math.random() * bios.length)]
  }

  const startAI = () => {
    setShowAI(true)
    setBioStep(0)
    setBioAnswers({})
    setAiMessages([{ role: 'assistant', content: lang === 'no' ? 'Hei! Jeg hjelper deg med å lage en profesjonell bio. La oss starte!' : lang === 'sv' ? 'Hej! Jag hjälper dig skapa en professionell bio. Låt oss börja!' : lang === 'es' ? '¡Hola! Te ayudo a crear una bio profesional. ¡Empecemos!' : lang === 'ru' ? 'Привет! Помогу вам создать профессиональную биографию. Начнём!' : lang === 'ar' ? 'مرحباً! سأساعدك في إنشاء نبذة احترافية. لنبدأ!' : lang === 'tl' ? 'Hi! Tutulungan kita gumawa ng professional bio. Magsimula tayo!' : 'Hi! I\'ll help you create a professional bio. Let\'s get started!' }, { role: 'assistant', content: bioQuestions[0].q }])
  }

  const askAI = async () => {
    if (!aiInput.trim()) return
    const userMsg = aiInput.trim()
    setAiInput('')

    const currentKey = bioQuestions[bioStep]?.key
    const newAnswers = { ...bioAnswers, [currentKey]: userMsg }
    setBioAnswers(newAnswers)

    const newMessages = [...aiMessages, { role: 'user', content: userMsg }]
    const nextStep = bioStep + 1

    if (nextStep < bioQuestions.length) {
      setBioStep(nextStep)
      setAiMessages([...newMessages, { role: 'assistant', content: bioQuestions[nextStep].q }])
    } else {
      setAiLoading(true)
      setBioStep(nextStep)
      // Small delay to feel natural
      await new Promise(r => setTimeout(r, 800))
      const bio = generateBio(newAnswers)
      setProfileBio(bio)
      const doneMsg = lang === 'no' ? '✓ Her er din bio! Den er satt inn i bio-feltet. Du kan redigere den fritt før du lagrer.' : lang === 'sv' ? '✓ Här är din bio! Den är insatt i bio-fältet. Du kan redigera den fritt.' : lang === 'es' ? '✓ ¡Aquí está tu bio! Se ha insertado en el campo. Puedes editarla libremente.' : lang === 'ru' ? '✓ Вот ваша биография! Она вставлена в поле. Можете отредактировать.' : lang === 'ar' ? '✓ ها هي نبذتك! تم إدراجها في الحقل. يمكنك تعديلها بحرية.' : lang === 'tl' ? '✓ Heto ang bio mo! Nailagay na sa field. Pwede mo i-edit.' : '✓ Here is your bio! It\'s been inserted into the bio field. Feel free to edit it before saving.'
      setAiMessages([...newMessages, { role: 'assistant', content: `${doneMsg}\n\n"${bio}"` }])
      setAiLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />
      <div className="loading-screen"><span className="loading-text">{t.loading}</span></div>
    </>
  )

  const pending = leads.filter(l => !l.uid_verified)
  const approved = leads.filter(l => l.uid_verified)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      <div className="dash-wrap" id="main-content">

        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-header-left">
            {distributor?.profile_image ? (
              <img src={distributor.profile_image} className="avatar" alt={distributor.name ? `Profile picture of ${distributor.name}` : 'Profile picture'} />
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
            aria-selected={activeTab === 'profile'}
            aria-controls="tab-panel-profile"
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`tab-btn${activeTab === 'profile' ? ' tab-btn-active' : ''}`}
          >
            {t.profileTab}
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
              <div className="section-header">
                <span aria-hidden="true">⏳</span> {t.pendingHeader}
                <span className="badge badge-warning" aria-label={`${pending.length} pending`}>{pending.length}</span>
              </div>
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
              <div className="section-header">
                <span aria-hidden="true">✅</span> {t.approvedHeader}
                <span className="badge badge-success" aria-label={`${approved.length} approved`}>{approved.length}</span>
              </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                  <div
                    className="upload-area"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label={profileImage ? t.changeImage : t.uploadImage}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt={profileName ? `Profile picture of ${profileName}` : 'Profile picture'} />
                    ) : (
                      <span style={{ fontSize: 24, color: 'var(--gold)' }} aria-hidden="true">{uploadingImage ? '⏳' : '📷'}</span>
                    )}
                  </div>
                  <div>
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
                <div className="url-input-wrap">
                  <span className="url-prefix" aria-hidden="true">primeverseaccess.com/</span>
                  <input id="profile-slug" value={profileSlug} onChange={e => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="ditt-navn" aria-label={`${t.yourUrl}: primeverseaccess.com/`} />
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

              <button onClick={saveProfile} disabled={savingProfile} className="gold-btn" style={{ width: '100%' }} aria-busy={savingProfile}>
                {savingProfile ? t.saving : profileSaved ? <><span aria-hidden="true">✓ </span>{t.saved}</> : t.saveProfile}
              </button>

              {distributor?.slug && (
                <p className="profile-saved-text">
                  {t.yourPage}: <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                    primeverseaccess.com/{distributor.slug}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </p>
              )}
            </div>

            <div id="ai-panel">
              {showAI ? (
                <div className="ai-panel">
                  <div className="ai-header">
                    <span className="sparkle" aria-hidden="true">✦</span> {t.aiTitle}
                    <span className="powered">Smart Bio Generator</span>
                  </div>
                  <div className="ai-messages" role="log" aria-live="polite" aria-label={t.aiTitle}>
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`ai-bubble ${msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-ai'}`} aria-label={msg.role === 'user' ? 'You' : 'AI'}>
                        {msg.content}
                      </div>
                    ))}
                    {aiLoading && <div className="ai-bubble ai-bubble-ai" style={{ color: 'var(--text-dim)' }} aria-live="polite">{t.aiTyping}</div>}
                  </div>
                  <div className="ai-input-row">
                    <label className="sr-only" htmlFor="ai-input">{t.aiPlaceholder}</label>
                    <input id="ai-input" className="ai-input" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI() } }} placeholder={t.aiPlaceholder} />
                    <button onClick={askAI} disabled={aiLoading || !aiInput.trim()} className="ai-send-btn">Send</button>
                  </div>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <div className="sparkle-big" aria-hidden="true">✦</div>
                  <h3>{t.aiTitle}</h3>
                  <p>{lang === 'no' ? 'Svar på 5 enkle spørsmål, og vi lager en profesjonell bio for deg.' : lang === 'sv' ? 'Svara på 5 enkla frågor, så skapar vi en professionell bio åt dig.' : lang === 'es' ? 'Responde 5 preguntas simples y crearemos una bio profesional para ti.' : 'Answer 5 simple questions and we\'ll create a professional bio for you.'}</p>
                  <button onClick={startAI} className="gold-btn">{t.startAi}</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
