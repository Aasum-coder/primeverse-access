import crypto from 'crypto'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const UNSUBSCRIBE_FOOTER = `<p style="text-align:center;font-size:10px;color:#3a3630;margin-top:16px;line-height:1.5;">You received this email because you registered on primeverseaccess.com.<br/>To unsubscribe, reply with 'unsubscribe' in the subject line.</p>`

function generateToken(leadId: string): string {
  return crypto.createHash('sha256')
    .update(leadId + (process.env.TRIAGE_SECRET || ''))
    .digest('hex')
}

export async function POST(request: Request) {
  try {
    const { leadId, leadName, leadEmail, leadUid, distributorId } = await request.json()

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

    // Generate secure token for disapprove link
    const token = leadId ? generateToken(leadId) : ''
    const disapproveUrl = leadId
      ? `https://www.primeverseaccess.com/api/disapprove-lead?lead_id=${leadId}&token=${token}`
      : ''

    // Run all notifications in parallel
    console.log('[uid-submitted-notification] Sending notifications for lead:', { leadId, leadName, leadEmail, distributorId, distributorEmail: distributor.email })
    const results = await Promise.allSettled([
      // A — Email to IB via Resend
      sendIBEmail(distributor.email, distributor.name, leadName, leadEmail || '', leadUid, disapproveUrl),
      // B — Telegram message to IB (if chat_id available)
      sendTelegramMessage(distributor, leadName, leadUid),
      // C — In-app notification via Supabase
      createInAppNotification(distributor.user_id, leadName, leadUid),
    ])

    // Log results for debugging
    results.forEach((r, i) => {
      const label = ['email', 'telegram', 'notification'][i]
      if (r.status === 'rejected') {
        console.error(`[uid-submitted-notification] ${label} FAILED:`, r.reason)
      } else {
        console.log(`[uid-submitted-notification] ${label} OK:`, JSON.stringify(r.value).slice(0, 200))
      }
    })

    return NextResponse.json({
      success: true,
      email: results[0].status,
      telegram: results[1].status,
      notification: results[2].status,
    })
  } catch (err: any) {
    console.error('[uid-submitted-notification] Unhandled error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

async function sendIBEmail(email: string, ibName: string, leadName: string, leadEmail: string, uid: string, disapproveUrl: string) {
  const submittedDate = new Date().toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
  })

  const disapproveButton = disapproveUrl
    ? `<a href="${disapproveUrl}" style="display:inline-block;padding:12px 28px;background:#8b2020;color:#f0e6d0;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;letter-spacing:0.03em;">✗ Disapprove</a>`
    : ''

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">New UID Verification Request</h1>
      <div style="height:2px;width:60px;margin:0 auto 24px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>

      <div style="background:rgba(20,18,14,0.8);border:1px solid rgba(212,165,55,0.25);border-radius:10px;padding:24px 20px;text-align:left;margin:0 0 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;width:36px;vertical-align:top;">👤</td>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;vertical-align:top;">Name:</td>
            <td style="padding:8px 0;font-size:14px;color:#f0e6d0;font-weight:600;text-align:right;vertical-align:top;">${leadName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;vertical-align:top;">📧</td>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;vertical-align:top;">Email:</td>
            <td style="padding:8px 0;font-size:14px;color:#f0e6d0;text-align:right;vertical-align:top;">${leadEmail || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 8px;font-size:14px;color:#9a917e;vertical-align:top;">🔑</td>
            <td style="padding:12px 0 8px;font-size:14px;color:#9a917e;vertical-align:top;">UID:</td>
            <td style="padding:12px 0 8px;font-size:22px;color:#d4a537;font-weight:700;letter-spacing:0.06em;text-align:right;vertical-align:top;">${uid}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;vertical-align:top;">📅</td>
            <td style="padding:8px 0;font-size:14px;color:#9a917e;vertical-align:top;">Submitted:</td>
            <td style="padding:8px 0;font-size:13px;color:#9a917e;text-align:right;vertical-align:top;">${submittedDate} CET</td>
          </tr>
        </table>
      </div>

      <div style="margin:0 0 24px;">
        <a href="https://www.primeverseaccess.com/admin/console" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2d7a3a,#3d9e4e);color:#f0e6d0;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;letter-spacing:0.03em;margin:0 6px;">✓ Approve</a>
        ${disapproveButton}
      </div>

      <p style="font-size:13px;color:#5a5347;line-height:1.6;margin:0;">
        Login to your dashboard to manage all leads → <a href="https://www.primeverseaccess.com" style="color:#d4a537;text-decoration:none;">primeverseaccess.com</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#5a5347;text-decoration:none;">primeverseaccess.com</a>
    </p>
    ${UNSUBSCRIBE_FOOTER}
  </div>
</body></html>`

  const text = `New UID Verification Request

Name: ${leadName}
Email: ${leadEmail || 'N/A'}
UID: ${uid}
Submitted: ${submittedDate} CET

Approve: https://www.primeverseaccess.com/admin/console
${disapproveUrl ? `Disapprove: ${disapproveUrl}` : ''}

Login to your dashboard to manage all leads: https://www.primeverseaccess.com

You received this email because you registered on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`

  return resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [email],
    subject: `🔔 New UID submitted by ${leadName}`,
    html,
    text,
    headers: {
      'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
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
