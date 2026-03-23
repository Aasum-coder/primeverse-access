import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

export async function POST(request: Request) {
  try {
    const { leadName, leadUid, distributorId } = await request.json()

    if (!leadName || !leadUid || !distributorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch the IB (distributor) details
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, user_id, email, name, social_telegram')
      .eq('id', distributorId)
      .single()

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    // Run all notifications in parallel
    const results = await Promise.allSettled([
      // A — Email to IB via Resend
      sendIBEmail(distributor.email, distributor.name, leadName, leadUid),
      // B — Telegram message to IB (if chat_id available)
      sendTelegramMessage(distributor, leadName, leadUid),
      // C — In-app notification via Supabase
      createInAppNotification(distributor.user_id, leadName, leadUid),
    ])

    return NextResponse.json({
      success: true,
      email: results[0].status,
      telegram: results[1].status,
      notification: results[2].status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

async function sendIBEmail(email: string, ibName: string, leadName: string, uid: string) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">New UID Submitted</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
        Hey ${ibName || 'there'},
      </p>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 8px;">
        Your lead <strong style="color:#d4a537;">${leadName}</strong> has submitted their trading account UID:
      </p>
      <p style="font-size:20px;color:#f0e6d0;font-weight:700;margin:0 0 24px;letter-spacing:0.05em;">
        ${uid}
      </p>
      <p style="font-size:14px;color:#9a917e;line-height:1.7;margin:0 0 24px;">
        Please verify this UID in your PuPrime back office and approve or reject it in your dashboard.
      </p>
      <p style="margin:0 0 16px;">
        <a href="https://www.primeverseaccess.com" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;margin:8px 0;">Go to Dashboard</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
  </div>
</body></html>`

  return resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [email],
    subject: '🔔 New UID submitted — action required',
    html,
  })
}

async function sendTelegramMessage(distributor: any, leadName: string, uid: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return { skipped: true, reason: 'No TELEGRAM_BOT_TOKEN configured' }

  // TODO: Telegram Bot API requires a numeric chat_id to send messages.
  // We cannot send to a @username directly. If the distributors table gets a
  // telegram_chat_id column in the future, use it here. For now, we skip
  // Telegram if no chat_id is available.
  // To collect chat_ids: have IBs message the bot first, then store the chat_id
  // from the incoming update via a webhook.

  // Check if distributor has a telegram_chat_id (column may not exist yet)
  const { data: distRow } = await supabase
    .from('distributors')
    .select('telegram_chat_id')
    .eq('id', distributor.id)
    .single()

  const chatId = (distRow as any)?.telegram_chat_id
  if (!chatId) return { skipped: true, reason: 'No telegram_chat_id for this distributor' }

  const message = `🔔 New UID from ${leadName}: ${uid}. Log in to verify: https://www.primeverseaccess.com`

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  })

  return res.json()
}

async function createInAppNotification(userId: string, leadName: string, uid: string) {
  if (!userId) return { skipped: true, reason: 'No user_id for distributor' }

  // Insert into notifications table — adapt columns to what actually exists.
  // Expected columns: user_id, type, title, message, read, created_at
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: 'uid_submitted',
    title: 'New UID submitted',
    message: `${leadName} submitted UID ${uid} — please verify in PuPrime`,
    read: false,
  })

  if (error) {
    // If notifications table doesn't exist or has different columns, log but don't fail
    console.error('Failed to insert notification:', error.message)
    return { skipped: true, reason: error.message }
  }

  return { success: true }
}
