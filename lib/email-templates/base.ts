/**
 * Shared base email template for all 1Move / PrimeVerse transactional emails.
 * Table-based layout, all inline CSS, dark theme with gold accents.
 */

const LOGO_URL =
  'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png'

interface BaseEmailOptions {
  content: string
  previewText: string
  dir?: 'ltr' | 'rtl'
}

export function baseEmailTemplate({ content, previewText, dir = 'ltr' }: BaseEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="en" dir="${dir}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>1Move</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#1A1A2E;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#1A1A2E;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1A1A2E;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Inner card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#16213E;border-radius:8px;overflow:hidden;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding:32px 24px 24px;">
              <img src="${LOGO_URL}" alt="1Move Academy" width="120" style="display:block;border:0;outline:none;"/>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td style="padding:0 32px 32px;">
              ${content}
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
                    <a href="{{unsubscribe_url}}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Inner card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->
</body>
</html>`
}
