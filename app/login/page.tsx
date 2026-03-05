"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   TRANSLATIONS
   ───────────────────────────────────────────── */
const translations: Record<string, Record<string, string>> = {
  en: {
    title: "1Move Academy Access Portal",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    login: "Sign In",
    signup: "Create Account",
    reset: "Reset Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    hasAccount: "Already have a member account?",
    signUpLink: "Create one here",
    signInLink: "Sign in here",
    backToLogin: "Back to sign in",
    resetInfo: "Enter your email and we'll send a reset link.",
    emailSent: "Check your inbox for the reset link.",
    signupSuccess: "Account created! Check your email to confirm.",
    errorInvalid: "Invalid email or password.",
    errorMismatch: "Passwords do not match.",
    errorGeneric: "Something went wrong. Please try again.",
    loading: "Please wait...",
  },
  no: {
    title: "1Move Academy Tilgangsportal",
    email: "E-postadresse",
    password: "Passord",
    confirmPassword: "Bekreft passord",
    login: "Logg inn",
    signup: "Opprett konto",
    reset: "Tilbakestill passord",
    forgotPassword: "Glemt passord?",
    noAccount: "Har du ikke en konto?",
    hasAccount: "Har du allerede en medlemskonto?",
    signUpLink: "Opprett en her",
    signInLink: "Logg inn her",
    backToLogin: "Tilbake til innlogging",
    resetInfo: "Skriv inn e-posten din, så sender vi en tilbakestillingslenke.",
    emailSent: "Sjekk innboksen din for tilbakestillingslenken.",
    signupSuccess: "Konto opprettet! Sjekk e-posten din for å bekrefte.",
    errorInvalid: "Ugyldig e-post eller passord.",
    errorMismatch: "Passordene stemmer ikke overens.",
    errorGeneric: "Noe gikk galt. Vennligst prøv igjen.",
    loading: "Vennligst vent...",
  },
  sv: {
    title: "1Move Academy Åtkomstportal",
    email: "E-postadress",
    password: "Lösenord",
    confirmPassword: "Bekräfta lösenord",
    login: "Logga in",
    signup: "Skapa konto",
    reset: "Återställ lösenord",
    forgotPassword: "Glömt lösenord?",
    noAccount: "Har du inget konto?",
    hasAccount: "Har du redan ett medlemskonto?",
    signUpLink: "Skapa ett här",
    signInLink: "Logga in här",
    backToLogin: "Tillbaka till inloggning",
    resetInfo: "Ange din e-post så skickar vi en återställningslänk.",
    emailSent: "Kolla din inkorg för återställningslänken.",
    signupSuccess: "Konto skapat! Kolla din e-post för att bekräfta.",
    errorInvalid: "Ogiltig e-post eller lösenord.",
    errorMismatch: "Lösenorden matchar inte.",
    errorGeneric: "Något gick fel. Försök igen.",
    loading: "Vänta...",
  },
  es: {
    title: "Portal de Acceso 1Move Academy",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    login: "Iniciar sesión",
    signup: "Crear cuenta",
    reset: "Restablecer contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes una cuenta?",
    signUpLink: "Crea una aquí",
    signInLink: "Inicia sesión aquí",
    backToLogin: "Volver al inicio de sesión",
    resetInfo: "Ingresa tu correo y te enviaremos un enlace.",
    emailSent: "Revisa tu bandeja para el enlace de restablecimiento.",
    signupSuccess: "¡Cuenta creada! Revisa tu correo para confirmar.",
    errorInvalid: "Correo o contraseña inválidos.",
    errorMismatch: "Las contraseñas no coinciden.",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    loading: "Espera...",
  },
  ru: {
    title: "Портал доступа 1Move Academy",
    email: "Электронная почта",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    login: "Войти",
    signup: "Создать аккаунт",
    reset: "Сбросить пароль",
    forgotPassword: "Забыли пароль?",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    signUpLink: "Создайте здесь",
    signInLink: "Войдите здесь",
    backToLogin: "Назад ко входу",
    resetInfo: "Введите email, и мы отправим ссылку для сброса.",
    emailSent: "Проверьте почту для ссылки сброса.",
    signupSuccess: "Аккаунт создан! Проверьте почту для подтверждения.",
    errorInvalid: "Неверный email или пароль.",
    errorMismatch: "Пароли не совпадают.",
    errorGeneric: "Что-то пошло не так. Попробуйте снова.",
    loading: "Подождите...",
  },
  ar: {
    title: "بوابة الوصول 1Move Academy",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    reset: "إعادة تعيين كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    signUpLink: "أنشئ واحدًا هنا",
    signInLink: "سجّل الدخول هنا",
    backToLogin: "العودة لتسجيل الدخول",
    resetInfo: "أدخل بريدك وسنرسل لك رابط إعادة التعيين.",
    emailSent: "تحقق من بريدك الوارد لرابط إعادة التعيين.",
    signupSuccess: "تم إنشاء الحساب! تحقق من بريدك للتأكيد.",
    errorInvalid: "بريد إلكتروني أو كلمة مرور غير صالحة.",
    errorMismatch: "كلمتا المرور غير متطابقتين.",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    loading: "يرجى الانتظار...",
  },
  tl: {
    title: "1Move Academy Access Portal",
    email: "Email address",
    password: "Password",
    confirmPassword: "Kumpirmahin ang password",
    login: "Mag-sign in",
    signup: "Gumawa ng account",
    reset: "I-reset ang password",
    forgotPassword: "Nakalimutan ang password?",
    noAccount: "Wala ka pang account?",
    hasAccount: "May account ka na?",
    signUpLink: "Gumawa dito",
    signInLink: "Mag-sign in dito",
    backToLogin: "Bumalik sa sign in",
    resetInfo: "Ilagay ang iyong email at magpapadala kami ng reset link.",
    emailSent: "Tingnan ang iyong inbox para sa reset link.",
    signupSuccess: "Nagawa na ang account! Tingnan ang email mo para kumpirmahin.",
    errorInvalid: "Hindi wastong email o password.",
    errorMismatch: "Hindi magkatugma ang mga password.",
    errorGeneric: "May nangyaring mali. Subukan muli.",
    loading: "Sandali lang...",
  },
};

const languageLabels: Record<string, string> = {
  en: "English",
  no: "Norsk",
  sv: "Svenska",
  es: "Español",
  ru: "Русский",
  ar: "العربية",
  tl: "Tagalog",
};

type AuthMode = "login" | "signup" | "reset";

/* ─────────────────────────────────────────────
   STYLES (inlined for single-file delivery)
   ───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --gold-deep: #7a5c12;
    --marble-dark: #0a0a0a;
    --marble-vein: #1a1a1a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --error-color: #d44a37;
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

  /* ── Marble Background ── */
  .marble-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      /* Deep marble veining layers */
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35, 28, 18, 0.5) 0%, transparent 50%),
      /* Gold vein accents */
      linear-gradient(137deg, transparent 30%, rgba(212, 165, 55, 0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212, 165, 55, 0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180, 140, 45, 0.03) 57%, transparent 59%),
      linear-gradient(78deg, transparent 20%, rgba(160, 120, 24, 0.025) 22%, transparent 24%),
      linear-gradient(195deg, transparent 65%, rgba(212, 165, 55, 0.03) 66.5%, transparent 68%),
      /* Subtle cracks */
      linear-gradient(142deg, transparent 40%, rgba(255, 255, 255, 0.012) 40.2%, transparent 40.4%),
      linear-gradient(320deg, transparent 25%, rgba(255, 255, 255, 0.01) 25.15%, transparent 25.3%),
      linear-gradient(85deg, transparent 60%, rgba(255, 255, 255, 0.008) 60.1%, transparent 60.2%),
      /* Base */
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
    background-size: cover;
  }

  .marble-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      /* Additional thin veins */
      linear-gradient(165deg, transparent 28%, rgba(212, 165, 55, 0.02) 28.5%, transparent 29%),
      linear-gradient(245deg, transparent 52%, rgba(200, 155, 50, 0.025) 52.8%, transparent 53.5%),
      linear-gradient(10deg, transparent 70%, rgba(180, 135, 40, 0.02) 70.3%, transparent 70.6%),
      linear-gradient(290deg, transparent 35%, rgba(212, 165, 55, 0.015) 35.5%, transparent 36%);
    opacity: 0.8;
  }

  .marble-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    /* Subtle noise texture via SVG */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.5;
  }

  /* ── Page Layout ── */
  .login-page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  /* ── Language Selector ── */
  .lang-selector {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 100;
  }

  .lang-btn {
    background: rgba(10, 10, 10, 0.7);
    border: 1px solid rgba(212, 165, 55, 0.2);
    color: var(--text-secondary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .lang-btn:hover {
    border-color: rgba(212, 165, 55, 0.4);
    color: var(--gold-light);
  }

  .lang-btn svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }

  .lang-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: rgba(15, 13, 10, 0.95);
    border: 1px solid rgba(212, 165, 55, 0.2);
    border-radius: 8px;
    overflow: hidden;
    min-width: 140px;
    backdrop-filter: blur(20px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    animation: dropIn 0.2s ease;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .lang-option {
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    padding: 0.55rem 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .lang-option:hover {
    background: rgba(212, 165, 55, 0.08);
    color: var(--gold-light);
  }

  .lang-option.active {
    color: var(--gold);
    background: rgba(212, 165, 55, 0.06);
  }

  /* ── Logo Area ── */
  .logo-container {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .logo-img {
    width: 180px;
    height: auto;
    filter: drop-shadow(0 4px 24px rgba(212, 165, 55, 0.2));
    transition: transform 0.5s ease;
  }

  .logo-img:hover {
    transform: scale(1.03);
  }

  .portal-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.35rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, var(--gold-dark) 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 0.75rem;
  }

  /* ── Card ── */
  .login-card {
    width: 100%;
    max-width: 420px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    backdrop-filter: blur(24px);
    box-shadow:
      0 1px 0 rgba(212, 165, 55, 0.05) inset,
      0 24px 80px rgba(0, 0, 0, 0.4),
      0 4px 20px rgba(0, 0, 0, 0.3);
    animation: cardReveal 0.6s ease;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-heading {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 1.75rem;
    text-align: center;
    letter-spacing: 0.04em;
  }

  /* ── Inputs ── */
  .field {
    margin-bottom: 1.15rem;
  }

  .field-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.45rem;
  }

  .field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .field-input::placeholder {
    color: rgba(154, 145, 126, 0.5);
  }

  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
  }

  /* ── Brushed Gold Button ── */
  .gold-btn {
    position: relative;
    width: 100%;
    padding: 0.85rem 1.5rem;
    margin-top: 0.5rem;
    border: none;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    color: #0a0804;
    /* Brushed gold base */
    background:
      linear-gradient(135deg,
        #c9a227 0%,
        #e8c975 15%,
        #d4a537 30%,
        #b8922a 45%,
        #e8c975 55%,
        #d4a537 70%,
        #c9a227 85%,
        #dbb84c 100%
      );
    background-size: 200% 200%;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.15) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset,
      0 4px 16px rgba(160, 120, 24, 0.25),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }

  /* Brushed metal texture overlay */
  .gold-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 1px,
        rgba(255, 255, 255, 0.03) 1px,
        rgba(255, 255, 255, 0.03) 2px
      );
    border-radius: inherit;
    pointer-events: none;
  }

  /* Moving shine / gleam on hover */
  .gold-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -75%;
    width: 50%;
    height: 200%;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255, 255, 255, 0.08) 42%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.08) 58%,
      transparent 70%
    );
    transform: skewX(-20deg);
    transition: left 0.7s ease;
    pointer-events: none;
  }

  .gold-btn:hover::after {
    left: 125%;
  }

  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.15) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset,
      0 8px 28px rgba(160, 120, 24, 0.35),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .gold-btn:active {
    transform: translateY(0.5px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.1) inset,
      0 -1px 0 rgba(0, 0, 0, 0.15) inset,
      0 2px 8px rgba(160, 120, 24, 0.2);
  }

  .gold-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .gold-btn:disabled::after {
    display: none;
  }

  /* ── Links / Text Buttons ── */
  .text-link {
    background: none;
    border: none;
    color: var(--gold);
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s;
    padding: 0;
  }

  .text-link:hover {
    color: var(--gold-light);
    text-decoration: underline;
  }

  .forgot-row {
    text-align: right;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  .switch-row {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .switch-row .text-link {
    margin-left: 0.3rem;
  }

  /* ── Messages ── */
  .msg {
    font-size: 0.82rem;
    padding: 0.6rem 0.9rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .msg-error {
    background: rgba(212, 74, 55, 0.1);
    border: 1px solid rgba(212, 74, 55, 0.2);
    color: #e8755e;
  }

  .msg-success {
    background: rgba(74, 157, 90, 0.1);
    border: 1px solid rgba(74, 157, 90, 0.2);
    color: #6dc07f;
  }

  .info-text {
    font-size: 0.82rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1.25rem;
    line-height: 1.5;
  }

  /* ── RTL ── */
  [dir="rtl"] .lang-dropdown {
    right: auto;
    left: 0;
  }

  [dir="rtl"] .lang-selector {
    right: auto;
    left: 1.5rem;
  }

  [dir="rtl"] .forgot-row {
    text-align: left;
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .login-card {
      padding: 2rem 1.5rem 1.5rem;
      border-radius: 12px;
    }
    .portal-title {
      font-size: 1.1rem;
    }
    .logo-img {
      width: 130px;
    }
  }
`;

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */
export default function LoginPage() {
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const langRef = useRef<HTMLDivElement>(null);

  const t = translations[lang] || translations.en;
  const isRTL = lang === "ar";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    clearMessages();
    setPassword("");
    setConfirmPw("");
  };

  /* ── Auth Handlers ── */
  const handleLogin = async () => {
    clearMessages();
    if (!email || !password) {
      setError(t.errorInvalid);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/")
    } catch {
      setError(t.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    clearMessages();
    if (password !== confirmPw) {
      setError(t.errorMismatch);
      return;
    }
    if (!email || !password) {
      setError(t.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(t.signupSuccess);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    clearMessages();
    if (!email) {
      setError(t.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(t.emailSent);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else handleReset();
  };

  const headingText =
    mode === "login" ? t.login : mode === "signup" ? t.signup : t.reset;

  const btnText = loading ? t.loading : headingText;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Marble Background */}
        <div className="marble-bg" />

        {/* Language Selector */}
        <div className="lang-selector" ref={langRef}>
          <button
            className="lang-btn"
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Select language"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
            </svg>
            {languageLabels[lang]}
          </button>

          {langOpen && (
            <div className="lang-dropdown">
              {Object.entries(languageLabels).map(([code, label]) => (
                <button
                  key={code}
                  className={`lang-option${code === lang ? " active" : ""}`}
                  onClick={() => {
                    setLang(code);
                    setLangOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div className="login-page">
          {/* Branding — logo kan legges til her senere */}
          <div className="logo-container">
            {/* <img className="logo-img" src="/images/1move-logo.png" alt="1Move Academy" width={180} /> */}
            <div className="portal-title">{t.title}</div>
          </div>

          {/* Login Card */}
          <div className="login-card" key={mode}>
            <h2 className="card-heading">{headingText}</h2>

            {/* Messages */}
            {error && <div className="msg msg-error">{error}</div>}
            {success && <div className="msg msg-success">{success}</div>}

            {/* Reset info */}
            {mode === "reset" && !success && (
              <p className="info-text">{t.resetInfo}</p>
            )}

            {/* Email */}
            <div className="field">
              <label className="field-label">{t.email}</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              />
            </div>

            {/* Password (login + signup) */}
            {mode !== "reset" && (
              <div className="field">
                <label className="field-label">{t.password}</label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                />
              </div>
            )}

            {/* Confirm Password (signup) */}
            {mode === "signup" && (
              <div className="field">
                <label className="field-label">{t.confirmPassword}</label>
                <input
                  className="field-input"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                />
              </div>
            )}

            {/* Forgot Password link */}
            {mode === "login" && (
              <div className="forgot-row">
                <button className="text-link" onClick={() => switchMode("reset")}>
                  {t.forgotPassword}
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              className="gold-btn"
              onClick={onSubmit}
              disabled={loading}
            >
              {btnText}
            </button>

            {/* Switch modes */}
            {mode === "login" && (
              <div className="switch-row">
                {t.noAccount}
                <button className="text-link" onClick={() => switchMode("signup")}>
                  {t.signUpLink}
                </button>
              </div>
            )}

            {mode === "signup" && (
              <div className="switch-row">
                {t.hasAccount}
                <button className="text-link" onClick={() => switchMode("login")}>
                  {t.signInLink}
                </button>
              </div>
            )}

            {mode === "reset" && (
              <div className="switch-row">
                <button className="text-link" onClick={() => switchMode("login")}>
                  {t.backToLogin}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
