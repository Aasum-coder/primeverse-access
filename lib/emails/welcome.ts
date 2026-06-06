// Welcome email for the new unlock flow. Sent from richard@send.1moveacademy.com
// after a lead submits the form on 1moveacademy.com and is auto-redirected to
// the PU Prime partner link.
//
// TODO(content): the brand team has a final HTML + plaintext pair
// (welcome_email.html / welcome_email_plaintext.txt). When that lands,
// replace WELCOME_HTML and WELCOME_TEXT constants below with the final
// content. Keep the {{KINGDOM_URL}} and {{UNSUBSCRIBE_URL}} placeholders
// so this template-replacement scaffold continues to work.

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Welcome to 1Move</title>
</head>
<body style="margin:0;padding:0;background:#faf6ef;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 32px;">
          <div style="font-family:Georgia,serif;font-size:14px;letter-spacing:0.4em;text-transform:uppercase;color:#a98a3b;">1Move</div>
        </td>
      </tr>
      <tr>
        <td>
          <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:30px;line-height:1.25;color:#1a1a1a;text-align:center;">
            Welcome — one step left.
          </h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#2a2a2a;">
            Thanks for stepping in. Your PU Prime registration is the gateway — once it's complete, drop your UID here and we'll unlock everything: Telegram, Primeverse, and the daily room.
          </p>
          <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#2a2a2a;">
            Tap the button below to enter the kingdom. The link is keyed to your email and stays good for 7 days.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 0 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="background:#c9a84c;border-radius:4px;">
                <a href="{{KINGDOM_URL}}" target="_blank" style="display:inline-block;padding:16px 36px;color:#1a1a1a;font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:0.05em;text-decoration:none;">
                  Enter the Kingdom &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#6a6a6a;text-align:center;">
            If the button doesn't render, paste this link into your browser:
          </p>
          <p style="margin:0 0 32px;font-size:13px;line-height:1.6;color:#6a6a6a;word-break:break-all;text-align:center;">
            <a href="{{KINGDOM_URL}}" style="color:#a98a3b;text-decoration:underline;">{{KINGDOM_URL}}</a>
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#2a2a2a;">
            Reply to this email if anything's off — I read every one.
          </p>
          <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#2a2a2a;">— Richard</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6a6a6a;">1Move Academy</p>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid rgba(0,0,0,0.08);padding:32px 0 0;margin-top:32px;">
          <p style="margin:24px 0 0;font-size:11px;line-height:1.6;color:#9a9a9a;text-align:center;">
            You're receiving this because you signed up at 1moveacademy.com.<br/>
            <a href="{{UNSUBSCRIBE_URL}}" style="color:#9a9a9a;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`

const WELCOME_TEXT = `Welcome — one step left.

Thanks for stepping in. Your PU Prime registration is the gateway —
once it's complete, drop your UID at the link below and we'll unlock
everything: Telegram, Primeverse, and the daily room.

Enter the kingdom (link keyed to your email, good for 7 days):
{{KINGDOM_URL}}

Reply to this email if anything's off — I read every one.

— Richard
1Move Academy

---
You're receiving this because you signed up at 1moveacademy.com.
Unsubscribe: {{UNSUBSCRIBE_URL}}
`

function applyReplacements(template: string, vars: Record<string, string>): string {
  let out = template
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(k).join(v)
  }
  return out
}

export function buildWelcomeEmail(opts: {
  kingdomUrl: string
  unsubscribeUrl: string
}): { html: string; text: string } {
  const replacements = {
    '{{KINGDOM_URL}}': opts.kingdomUrl,
    '{{UNSUBSCRIBE_URL}}': opts.unsubscribeUrl,
  }
  return {
    html: applyReplacements(WELCOME_HTML, replacements),
    text: applyReplacements(WELCOME_TEXT, replacements),
  }
}
