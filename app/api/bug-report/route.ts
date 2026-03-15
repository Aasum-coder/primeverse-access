import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

export async function POST(request: Request) {
  const body = await request.json()
  const {
    whatHappened,
    whatExpected,
    page,
    severity,
    screenshot,
    fileName,
    userEmail,
    userName,
    userSlug,
    userAgent,
    timestamp,
    language,
  } = body

  if (!whatHappened || !whatExpected || !screenshot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Parse base64 data URL
  const match = screenshot.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) {
    return NextResponse.json({ error: 'Invalid screenshot format' }, { status: 400 })
  }

  const contentType = match[1]
  const base64Data = match[2]

  const severityColors: Record<string, string> = {
    Critical: '#e53935',
    High: '#f4511e',
    Medium: '#fb8c00',
    Low: '#43a047',
  }
  const sevColor = severityColors[severity] || '#fb8c00'

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#1a1a1a;padding:40px 24px">
  <h1 style="color:#d4a537;font-size:22px;margin:0 0 24px;display:flex;align-items:center;gap:8px">
    SYSTM8 Bug Report
  </h1>

  <div style="background:#222;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Severity</div>
    <div style="display:inline-block;background:${sevColor};color:#fff;padding:4px 12px;border-radius:4px;font-size:14px;font-weight:600">${severity}</div>
  </div>

  <div style="background:#222;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">What happened?</div>
    <div style="color:#e0e0e0;font-size:14px;line-height:1.6;white-space:pre-wrap">${whatHappened}</div>
  </div>

  <div style="background:#222;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">What was expected?</div>
    <div style="color:#e0e0e0;font-size:14px;line-height:1.6;white-space:pre-wrap">${whatExpected}</div>
  </div>

  <div style="background:#222;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Page</div>
    <div style="color:#e0e0e0;font-size:14px">${page}</div>
  </div>

  <div style="background:#222;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:16px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Reporter Info</div>
    <div style="color:#e0e0e0;font-size:13px;line-height:1.8">
      <strong style="color:#d4a537">Name:</strong> ${userName}<br/>
      <strong style="color:#d4a537">Email:</strong> ${userEmail}<br/>
      <strong style="color:#d4a537">Slug:</strong> ${userSlug || 'N/A'}<br/>
      <strong style="color:#d4a537">Language:</strong> ${language}<br/>
      <strong style="color:#d4a537">Time:</strong> ${timestamp}<br/>
      <strong style="color:#d4a537">Browser:</strong> <span style="font-size:12px;word-break:break-all">${userAgent}</span>
    </div>
  </div>

  <div style="color:#888;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #333;padding-top:16px">
    SYSTM8 Bug Report System
  </div>
</div>
</body></html>`

  const shortDesc = whatHappened.slice(0, 60).replace(/\n/g, ' ')

  const { error } = await resend.emails.send({
    from: 'SYSTM8 Bug Report <noreply@primeverseaccess.com>',
    to: ['aasum85@gmail.com'],
    subject: `[SYSTM8 Bug] [${severity}] - ${shortDesc}`,
    html,
    attachments: [
      {
        filename: fileName || 'screenshot.png',
        content: Buffer.from(base64Data, 'base64'),
      },
    ],
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
