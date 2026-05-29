// Reach-out message templates used by the Pipeline "Reach Out" modal.
// Two styles per language: EMAIL (longer, formal, with subject line) and
// CHAT (shorter, casual, for WhatsApp / Telegram).
//
// Placeholders {leadName} and {ibName} are substituted by the caller.
// Keep these as plain template strings so the modal can do a fast
// string-replace and let the IB further edit before sending.

export type ReachOutLang =
  | 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

export interface ReachOutTemplate {
  email: { subject: string; body: string }
  chat: string
}

export const REACH_OUT_TEMPLATES: Record<ReachOutLang, ReachOutTemplate> = {
  en: {
    email: {
      subject: 'Welcome to 1Move, {leadName}!',
      body: `Hi {leadName}!

Thank you for registering through 1Move. I'm your personal IB and I'm here to help you on your trading journey.

If you have any questions about the platform, your account, or just want some tips to get started, simply reply to this email — I respond quickly.

Good luck!
{ibName}`,
    },
    chat: `Hi {leadName}! 👋 I'm your IB at 1Move. Thanks for registering! Let me know if you have any questions or need help with your account. Good luck! — {ibName}`,
  },
  no: {
    email: {
      subject: 'Velkommen til 1Move, {leadName}!',
      body: `Hei {leadName}!

Tusen takk for at du registrerte deg via 1Move. Jeg er din personlige IB og er her for å hjelpe deg på trading-reisen.

Hvis du har spørsmål om plattformen, kontoen, eller bare vil ha noen tips for å komme i gang, så bare svar på denne mailen — jeg svarer raskt.

Lykke til!
{ibName}`,
    },
    chat: `Hei {leadName}! 👋 Jeg er din IB på 1Move. Takk for at du registrerte deg! Si fra hvis du har spørsmål eller trenger hjelp med kontoen. Lykke til! — {ibName}`,
  },
  sv: {
    email: {
      subject: 'Välkommen till 1Move, {leadName}!',
      body: `Hej {leadName}!

Tack så mycket för att du registrerat dig via 1Move. Jag är din personliga IB och finns här för att hjälpa dig på din trading-resa.

Om du har frågor om plattformen, kontot, eller bara vill ha lite tips för att komma igång — svara bara på det här mejlet, jag svarar snabbt.

Lycka till!
{ibName}`,
    },
    chat: `Hej {leadName}! 👋 Jag är din IB på 1Move. Tack för att du registrerade dig! Hör av dig om du har frågor eller behöver hjälp med kontot. Lycka till! — {ibName}`,
  },
  es: {
    email: {
      subject: '¡Bienvenido a 1Move, {leadName}!',
      body: `¡Hola {leadName}!

Muchas gracias por registrarte a través de 1Move. Soy tu IB personal y estoy aquí para ayudarte en tu viaje de trading.

Si tienes preguntas sobre la plataforma, tu cuenta, o simplemente quieres algunos consejos para empezar, responde a este correo — te contestaré rápidamente.

¡Mucha suerte!
{ibName}`,
    },
    chat: `¡Hola {leadName}! 👋 Soy tu IB en 1Move. ¡Gracias por registrarte! Avísame si tienes preguntas o necesitas ayuda con tu cuenta. ¡Mucha suerte! — {ibName}`,
  },
  ru: {
    email: {
      subject: 'Добро пожаловать в 1Move, {leadName}!',
      body: `Привет, {leadName}!

Большое спасибо за регистрацию через 1Move. Я ваш персональный IB и здесь, чтобы помочь вам на пути в трейдинге.

Если у вас есть вопросы о платформе, аккаунте или вам нужны советы, чтобы начать, — просто ответьте на это письмо, я отвечу быстро.

Удачи!
{ibName}`,
    },
    chat: `Привет, {leadName}! 👋 Я ваш IB в 1Move. Спасибо за регистрацию! Дайте знать, если есть вопросы или нужна помощь с аккаунтом. Удачи! — {ibName}`,
  },
  ar: {
    email: {
      subject: 'مرحبًا بك في 1Move يا {leadName}!',
      body: `مرحبًا {leadName}!

شكرًا جزيلاً على التسجيل عبر 1Move. أنا الـ IB الشخصي الخاص بك وأنا هنا لمساعدتك في رحلتك في التداول.

إذا كانت لديك أي أسئلة عن المنصة، حسابك، أو فقط تريد بعض النصائح للبدء، فقط رد على هذا البريد — سأرد عليك بسرعة.

بالتوفيق!
{ibName}`,
    },
    chat: `مرحبًا {leadName}! 👋 أنا الـ IB الخاص بك في 1Move. شكرًا على التسجيل! أخبرني إذا كانت لديك أسئلة أو تحتاج مساعدة مع حسابك. بالتوفيق! — {ibName}`,
  },
  tl: {
    email: {
      subject: 'Maligayang pagdating sa 1Move, {leadName}!',
      body: `Kumusta {leadName}!

Maraming salamat sa pagrehistro sa pamamagitan ng 1Move. Ako ang iyong personal na IB at narito para tulungan ka sa iyong paglalakbay sa trading.

Kung may tanong ka tungkol sa platform, account, o gusto mo lang ng ilang tip para magsimula, sumagot lang sa email na ito — mabilis akong sumasagot.

Goodluck!
{ibName}`,
    },
    chat: `Kumusta {leadName}! 👋 Ako ang IB mo sa 1Move. Salamat sa pagrehistro! Sabihin mo lang kung may tanong ka o kailangan mo ng tulong sa account. Goodluck! — {ibName}`,
  },
  pt: {
    email: {
      subject: 'Bem-vindo ao 1Move, {leadName}!',
      body: `Olá {leadName}!

Muito obrigado por se registrar através do 1Move. Sou seu IB pessoal e estou aqui para ajudá-lo em sua jornada de trading.

Se tiver dúvidas sobre a plataforma, sua conta, ou só quiser algumas dicas para começar, responda a este email — respondo rapidamente.

Boa sorte!
{ibName}`,
    },
    chat: `Olá {leadName}! 👋 Sou seu IB no 1Move. Obrigado por se registrar! Me avise se tiver dúvidas ou precisar de ajuda com sua conta. Boa sorte! — {ibName}`,
  },
  th: {
    email: {
      subject: 'ยินดีต้อนรับสู่ 1Move คุณ {leadName}!',
      body: `สวัสดีครับ/ค่ะ {leadName}!

ขอบคุณมากที่ลงทะเบียนผ่าน 1Move ฉันคือ IB ส่วนตัวของคุณ และพร้อมที่จะช่วยเหลือคุณในการเทรด

หากคุณมีคำถามเกี่ยวกับแพลตฟอร์ม บัญชี หรือเพียงต้องการเคล็ดลับเพื่อเริ่มต้น สามารถตอบกลับอีเมลนี้ได้เลย — ฉันจะตอบกลับอย่างรวดเร็ว

ขอให้โชคดี!
{ibName}`,
    },
    chat: `สวัสดี {leadName}! 👋 ฉันคือ IB ของคุณที่ 1Move ขอบคุณที่ลงทะเบียน! บอกได้เลยถ้ามีคำถามหรือต้องการความช่วยเหลือกับบัญชี ขอให้โชคดี! — {ibName}`,
  },
}

const SUPPORTED_LANGS: ReachOutLang[] = ['en','no','sv','es','ru','ar','tl','pt','th']

export function resolveReachOutLang(input: string | null | undefined): ReachOutLang {
  if (!input) return 'en'
  const lower = input.toLowerCase().slice(0, 2)
  return (SUPPORTED_LANGS as readonly string[]).includes(lower) ? (lower as ReachOutLang) : 'en'
}

export function renderReachOutTemplate(
  tpl: string,
  vars: { leadName: string; ibName: string },
): string {
  return tpl
    .replaceAll('{leadName}', vars.leadName || '')
    .replaceAll('{ibName}', vars.ibName || '')
}
