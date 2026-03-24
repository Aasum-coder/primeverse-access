import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

function buildAnnouncementHtml(name: string): string {
  const displayName = name || 'Partner'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>New in SYSTM8</title>
</head>
<body style="margin:0;padding:0;background-color:#1A1A2E;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;color:#1A1A2E;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Your dashboard just got smarter — meet the AI Reply Assistant.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1A1A2E;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#16213E;border-radius:8px;overflow:hidden;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 24px 24px;">
              <img src="https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png" alt="1Move Academy" width="120" style="display:block;border:0;outline:none;"/>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:0 32px 32px;">

              <!-- Heading -->
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#D4A843;text-align:center;line-height:1.3;">
                Your dashboard just got smarter.
              </h1>

              <!-- Greeting -->
              <p style="margin:0 0 16px;font-size:15px;color:#E0E0E0;line-height:1.7;">
                Hey ${displayName},
              </p>

              <!-- Intro -->
              <p style="margin:0 0 12px;font-size:15px;color:#E0E0E0;line-height:1.7;">
                We&rsquo;ve been building while you&rsquo;ve been sleeping.
              </p>
              <p style="margin:0 0 12px;font-size:15px;color:#E0E0E0;line-height:1.7;">
                SYSTM8 just launched a powerful new tool inside your dashboard &mdash; and it&rsquo;s going to change how you handle conversations with your leads.
              </p>
              <p style="margin:0 0 28px;font-size:17px;font-weight:700;color:#D4A843;line-height:1.7;">
                Meet the Reply Assistant.
              </p>

              <!-- Feature highlight box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#0E1628;border:1px solid #D4A843;border-radius:10px;padding:24px 24px 20px;">
                    <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#D4A843;">
                      &#x1F4AC; AI Reply Assistant
                    </p>
                    <p style="margin:0 0 18px;font-size:14px;color:#ccc;line-height:1.7;">
                      Paste any conversation, objection, or question from a lead. The AI analyzes the situation and writes you a ready-to-send reply &mdash; tailored, empathetic, and built to convert.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#E0E0E0;line-height:1.6;">
                          &#x2713;&nbsp; Works in all 9 languages
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#E0E0E0;line-height:1.6;">
                          &#x2713;&nbsp; Understands trading objections
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#E0E0E0;line-height:1.6;">
                          &#x2713;&nbsp; Copy and paste straight into your chat
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#E0E0E0;line-height:1.6;">
                          &#x2713;&nbsp; Attach screenshots for better context
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 28px;">
                    <a href="https://www.primeverseaccess.com" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;">
                      Try Reply Assistant Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Where to find it -->
              <p style="margin:0 0 12px;font-size:14px;color:#9a917e;line-height:1.7;text-align:center;">
                Find it under <strong style="color:#E0E0E0;">Marketing Resources &rarr; Reply Assistant</strong> in your dashboard.
              </p>
              <p style="margin:0 0 4px;font-size:14px;color:#9a917e;line-height:1.7;text-align:center;">
                This is just the beginning. More AI tools are on the way.
              </p>
              <p style="margin:24px 0 0;font-size:14px;color:#9a917e;line-height:1.7;">
                &mdash; The 1Move Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #2A2A4A;padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="color:#666;font-size:12px;line-height:1.5;">
                    1Move &times; PrimeVerse &nbsp;|&nbsp; primeverseaccess.com
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;color:#555;font-size:11px;">
                    You received this email because you are a registered IB on primeverseaccess.com.<br/>
                    To unsubscribe, reply with &lsquo;unsubscribe&rsquo; in the subject line.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildAnnouncementText(name: string): string {
  const displayName = name || 'Partner'
  return `Hey ${displayName},

Your dashboard just got smarter.

We've been building while you've been sleeping.

SYSTM8 just launched a powerful new tool inside your dashboard — and it's going to change how you handle conversations with your leads.

Meet the Reply Assistant.

---

💬 AI Reply Assistant

Paste any conversation, objection, or question from a lead. The AI analyzes the situation and writes you a ready-to-send reply — tailored, empathetic, and built to convert.

✓ Works in all 9 languages
✓ Understands trading objections
✓ Copy and paste straight into your chat
✓ Attach screenshots for better context

---

Try it now → https://www.primeverseaccess.com

Find it under Marketing Resources → Reply Assistant in your dashboard.

This is just the beginning. More AI tools are on the way.

— The 1Move Team

---
1Move × PrimeVerse | primeverseaccess.com
You received this email because you are a registered IB on primeverseaccess.com.
To unsubscribe, reply with 'unsubscribe' in the subject line.`
}

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (token !== 'systm8-triage-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all approved IBs
  const { data: distributors, error: dbError } = await supabaseAdmin
    .from('distributors')
    .select('id, email, full_name')
    .eq('ib_status', 'approved')

  if (dbError) {
    console.error('[send-feature-announcement] DB error:', dbError.message)
    return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 })
  }

  if (!distributors || distributors.length === 0) {
    return NextResponse.json({ sent: 0, errors: [], message: 'No approved distributors found.' })
  }

  let sent = 0
  const errors: { email: string; error: string }[] = []

  for (const dist of distributors) {
    if (!dist.email) continue

    try {
      const { error: sendError } = await resend.emails.send({
        from: '1Move Academy <noreply@primeverseaccess.com>',
        to: [dist.email],
        subject: 'New in SYSTM8 — Your AI Reply Assistant is live 🤖',
        html: buildAnnouncementHtml(dist.full_name || ''),
        text: buildAnnouncementText(dist.full_name || ''),
        headers: {
          'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      })

      if (sendError) {
        errors.push({ email: dist.email, error: sendError.message })
      } else {
        sent++
      }
    } catch (e) {
      errors.push({ email: dist.email, error: String(e) })
    }

    // Rate limit: 300ms between sends
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`[send-feature-announcement] Sent: ${sent}, Errors: ${errors.length}`)
  return NextResponse.json({ sent, errors })
}
