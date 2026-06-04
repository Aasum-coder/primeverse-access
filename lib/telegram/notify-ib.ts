import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const BOT_TOKEN = process.env.SYSTM8_TELEGRAM_BOT_TOKEN || ''
const DASHBOARD_URL = 'https://www.primeverseaccess.com'

export type IBLang = 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

const SUPPORTED: IBLang[] = ['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl', 'pt', 'th']

export function normalizeLang(lang?: string | null): IBLang {
  const l = (lang || 'en').toLowerCase()
  return SUPPORTED.includes(l as IBLang) ? (l as IBLang) : 'en'
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildNewLeadMessage(
  lang: IBLang,
  p: { leadName: string | null; leadCount: number },
): string {
  const name = p.leadName ? `👤 ${escapeHtml(p.leadName)}\n` : ''
  const n = p.leadCount
  const M: Record<IBLang, string> = {
    en: `🔔 <b>New lead!</b>\n${name}A new signup just landed on your page.\nTotal leads: ${n}\n👉 ${DASHBOARD_URL}`,
    no: `🔔 <b>Nytt lead!</b>\n${name}En ny registrering kom nettopp inn på siden din.\nTotalt: ${n} leads\n👉 ${DASHBOARD_URL}`,
    sv: `🔔 <b>Nytt lead!</b>\n${name}En ny registrering kom precis in på din sida.\nTotalt: ${n} leads\n👉 ${DASHBOARD_URL}`,
    es: `🔔 <b>¡Nuevo lead!</b>\n${name}Un nuevo registro acaba de llegar a tu página.\nTotal: ${n} leads\n👉 ${DASHBOARD_URL}`,
    ru: `🔔 <b>Новый лид!</b>\n${name}На вашей странице только что зарегистрировался новый лид.\nВсего лидов: ${n}\n👉 ${DASHBOARD_URL}`,
    ar: `🔔 <b>عميل محتمل جديد!</b>\n${name}تم تسجيل جديد للتو على صفحتك.\nالإجمالي: ${n}\n👉 ${DASHBOARD_URL}`,
    tl: `🔔 <b>Bagong lead!</b>\n${name}May bagong nag-sign up sa page mo.\nKabuuan: ${n} leads\n👉 ${DASHBOARD_URL}`,
    pt: `🔔 <b>Novo lead!</b>\n${name}Um novo cadastro acabou de chegar na sua página.\nTotal: ${n} leads\n👉 ${DASHBOARD_URL}`,
    th: `🔔 <b>มีลีดใหม่!</b>\n${name}มีการสมัครใหม่บนเพจของคุณ\nรวม: ${n} ลีด\n👉 ${DASHBOARD_URL}`,
  }
  return M[lang]
}

export function buildVerifiedLeadMessage(
  lang: IBLang,
  p: { leadName: string | null; uid: string | number },
): string {
  const name = p.leadName ? `👤 ${escapeHtml(p.leadName)}\n` : ''
  const uid = escapeHtml(String(p.uid))
  const M: Record<IBLang, string> = {
    en: `✅ <b>Lead verified!</b>\n${name}🆔 UID: ${uid}\nThey now have Primeverse access.\n👉 ${DASHBOARD_URL}`,
    no: `✅ <b>Lead verifisert!</b>\n${name}🆔 UID: ${uid}\nDe har nå tilgang til Primeverse.\n👉 ${DASHBOARD_URL}`,
    sv: `✅ <b>Lead verifierad!</b>\n${name}🆔 UID: ${uid}\nDe har nu tillgång till Primeverse.\n👉 ${DASHBOARD_URL}`,
    es: `✅ <b>¡Lead verificado!</b>\n${name}🆔 UID: ${uid}\nYa tiene acceso a Primeverse.\n👉 ${DASHBOARD_URL}`,
    ru: `✅ <b>Лид подтверждён!</b>\n${name}🆔 UID: ${uid}\nТеперь у него есть доступ к Primeverse.\n👉 ${DASHBOARD_URL}`,
    ar: `✅ <b>تم التحقق من العميل!</b>\n${name}🆔 UID: ${uid}\nأصبح لديه الآن وصول إلى Primeverse.\n👉 ${DASHBOARD_URL}`,
    tl: `✅ <b>Verified na ang lead!</b>\n${name}🆔 UID: ${uid}\nMay access na siya sa Primeverse.\n👉 ${DASHBOARD_URL}`,
    pt: `✅ <b>Lead verificado!</b>\n${name}🆔 UID: ${uid}\nAgora tem acesso ao Primeverse.\n👉 ${DASHBOARD_URL}`,
    th: `✅ <b>ยืนยันลีดแล้ว!</b>\n${name}🆔 UID: ${uid}\nตอนนี้เข้าถึง Primeverse ได้แล้ว\n👉 ${DASHBOARD_URL}`,
  }
  return M[lang]
}

export async function sendTelegramToChat(
  chatId: string | number,
  text: string,
): Promise<{ sent: boolean; reason?: string }> {
  try {
    if (!BOT_TOKEN) return { sent: false, reason: 'no_bot_token' }
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[telegram-notify] sendMessage failed chatId=${chatId} status=${res.status} body=${body.slice(0, 200)}`)
      return { sent: false, reason: `telegram_${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[telegram-notify] sendMessage error:', err instanceof Error ? err.message : err)
    return { sent: false, reason: 'exception' }
  }
}

export async function notifyIBTelegram(
  distributorId: string,
  buildText: (lang: IBLang) => string,
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { data: dist, error } = await supabaseAdmin
      .from('distributors')
      .select('telegram_chat_id, telegram_status, language')
      .eq('id', distributorId)
      .maybeSingle()
    if (error || !dist) return { sent: false, reason: 'distributor_not_found' }
    if (dist.telegram_status !== 'linked' || !dist.telegram_chat_id) {
      return { sent: false, reason: 'not_linked' }
    }
    return sendTelegramToChat(dist.telegram_chat_id, buildText(normalizeLang(dist.language)))
  } catch (err) {
    console.error('[telegram-notify] notifyIBTelegram error:', err instanceof Error ? err.message : err)
    return { sent: false, reason: 'exception' }
  }
}
