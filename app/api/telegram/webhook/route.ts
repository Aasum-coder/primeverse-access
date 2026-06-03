import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const BOT_TOKEN = process.env.SYSTM8_TELEGRAM_BOT_TOKEN || ''

async function reply(chatId: number, text: string) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body?.message
    if (!message?.text || !message?.from?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.from.id
    const username = message.from.username || null
    const text = message.text.trim()

    if (!text.startsWith('/start')) {
      await reply(chatId, '❌ Invalid command. Please use the link from your SYSTM8 dashboard.')
      return NextResponse.json({ ok: true })
    }

    const payload = text.replace('/start', '').trim()
    if (!payload) {
      await reply(chatId, '❌ Invalid link. Please use the link from your SYSTM8 dashboard.')
      return NextResponse.json({ ok: true })
    }

    // Look up distributor by id (the deep-link payload)
    const { data: dist, error } = await supabase
      .from('distributors')
      .select('id, name')
      .eq('id', payload)
      .maybeSingle()

    if (error || !dist) {
      console.log('[telegram-webhook] Distributor not found for payload:', payload)
      await reply(chatId, '❌ Invalid link. Please use the link from your SYSTM8 dashboard.')
      return NextResponse.json({ ok: true })
    }

    // One Telegram account links to ONE IB.
    // Clear this chat_id from any OTHER distributor first (fixes duplicates).
    await supabase
      .from('distributors')
      .update({
        telegram_chat_id: null,
        telegram_user_id: null,
        telegram_username: null,
        telegram_status: 'none',
        telegram_joined_at: null,
      })
      .eq('telegram_chat_id', String(chatId))
      .neq('id', dist.id)

    // Link this distributor.
    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        telegram_chat_id: String(chatId),
        telegram_user_id: chatId,
        telegram_username: username,
        telegram_status: 'linked',
        telegram_joined_at: new Date().toISOString(),
      })
      .eq('id', dist.id)

    if (updateError) {
      console.error('[telegram-webhook] Failed to save chat_id:', updateError.message)
      await reply(chatId, '❌ Something went wrong. Please try again later.')
      return NextResponse.json({ ok: true })
    }

    console.log('[telegram-webhook] Linked chat_id', chatId, 'to distributor', dist.id, dist.name)
    await reply(
      chatId,
      `✅ <b>Connected!</b>\n\nHi ${dist.name || 'there'} — your SYSTM8 notifications are now active. You'll get a message here when a new lead signs up or gets verified.`
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[telegram-webhook] Error:', err?.message)
    return NextResponse.json({ ok: true })
  }
}
