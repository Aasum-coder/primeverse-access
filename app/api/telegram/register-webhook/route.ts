import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BOT_TOKEN = process.env.SYSTM8_TELEGRAM_BOT_TOKEN || ''
const TRIAGE_SECRET = process.env.TRIAGE_SECRET || ''
const WEBHOOK_URL = 'https://www.primeverseaccess.com/api/telegram/webhook'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token || token !== TRIAGE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'SYSTM8_TELEGRAM_BOT_TOKEN not configured' }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: WEBHOOK_URL }),
  })

  const data = await res.json()
  console.log('[telegram-register-webhook] Response:', JSON.stringify(data))

  return NextResponse.json(data)
}
