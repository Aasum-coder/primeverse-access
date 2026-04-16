import { baseEmailTemplate } from './base'

interface VerifiedAccessOptions {
  name: string
  referralLink: string
}

export function buildVerifiedAccessEmail({ name, referralLink }: VerifiedAccessOptions) {
  const firstName = name.split(' ')[0] || name || 'there'

  const content = `
    <h1 style="color:#D4A843;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;">
      Your account has been verified ✓
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName},
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Your trading account is now active and verified. You have full access to the platform and all the tools available to you.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#D4A843;">
          <a href="${referralLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#1A1A2E;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            Access Your Dashboard &rarr;
          </a>
        </td>
      </tr>
    </table>

    <div style="border-top:1px solid rgba(212,168,67,0.2);padding-top:20px;margin-top:24px;">
      <p style="color:#888;font-size:13px;line-height:1.5;margin:0;text-align:center;font-style:italic;">
        People Before Profit.
      </p>
    </div>
  `

  return {
    subject: 'Your account has been verified ✓',
    html: baseEmailTemplate({
      content,
      previewText: 'Your trading account is now active and verified.',
    }),
  }
}
