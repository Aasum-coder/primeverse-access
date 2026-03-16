import { baseEmailTemplate } from './base'

interface BroadcastEmailOptions {
  title: string
  message: string
  distributorName: string
}

export function buildBroadcastEmail({ title, message, distributorName }: BroadcastEmailOptions) {
  // Convert newlines in message to <br/> for HTML rendering
  const htmlMessage = message
    .split('\n')
    .map((line) => line.trim())
    .join('<br/>')

  const content = `
<!-- Heading -->
<h1 style="color:#D4A843;font-size:24px;margin:0 0 20px;text-align:left;font-weight:700;">${title}</h1>

<!-- Message body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 28px;text-align:left;">${htmlMessage}</p>

<!-- Sign-off -->
<p style="color:#D4A843;font-size:15px;font-weight:700;margin:0 0 8px;text-align:left;">— ${distributorName}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:16px 0 0;text-align:center;">Contact your team leader or use the Report feature in your dashboard.</p>`

  const html = baseEmailTemplate({
    content,
    previewText: title,
  })

  return { html, subject: title }
}
