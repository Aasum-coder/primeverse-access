import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Webhook } from 'svix'
import * as XLSX from 'xlsx'
import { Resend } from 'resend'
import {
  detectLanguage,
  detectProvider,
  extractCode,
  extractLink,
  isForwardingVerification,
  type ForwardingVerification,
} from '@/lib/forwarding-verification'
import { parseExcelRows, verifyRows } from '@/lib/verify-rows'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

export async function POST(request: Request) {
  // STEP 1 — Verify webhook signature
  const signingSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!signingSecret) {
    console.error('[inbound-email] RESEND_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn('[inbound-email] Missing svix headers')
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
  }

  let payload: any
  try {
    const wh = new Webhook(signingSecret)
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch (err) {
    console.error('[inbound-email] Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // Only process email.received events
  if (payload.type !== 'email.received') {
    return NextResponse.json({ ok: true, skipped: payload.type })
  }

  const data = payload.data
  const toAddresses: string[] = data.to || []

  // The email ID is at data.email_id (confirmed from live payload)
  const emailId: string | undefined = data.email_id
  if (!emailId) {
    console.error('[inbound-email] No email_id in data:', JSON.stringify(data))
    return NextResponse.json({ error: 'No email ID in webhook payload' }, { status: 400 })
  }

  console.log('[inbound-email] Received email to:', toAddresses, 'from:', data.from, 'subject:', data.subject, 'emailId:', emailId)

  // STEP 3 — Extract IB slug from the TO address
  // Format: verify+{slug}@zapraxi.resend.app
  let slug: string | null = null
  for (const addr of toAddresses) {
    const match = addr.match(/^verify\+([^@]+)@/i)
    if (match) {
      slug = match[1].toLowerCase()
      break
    }
  }

  if (!slug) {
    console.warn('[inbound-email] No slug found in TO addresses:', toAddresses)
    return NextResponse.json({ error: 'No slug found in TO address' }, { status: 400 })
  }

  // Find distributor by slug
  const { data: dist, error: distErr } = await supabaseAdmin
    .from('distributors')
    .select('id, slug, name, email, referral_link, first_puprime_mail_received_at')
    .eq('slug', slug)
    .maybeSingle()

  if (distErr || !dist) {
    console.error('[inbound-email] Distributor not found for slug:', slug, distErr)
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  console.log('[inbound-email] Matched distributor:', dist.id, dist.name)

  // STEP 3.5 — Branch: forwarding-verification email from an email provider
  // (Gmail / Outlook / Yahoo / iCloud / ProtonMail). These are NOT Excel
  // notifications — they are the setup confirmations the IB needs to see.
  if (isForwardingVerification(data.from || '', data.subject || '')) {
    const provider = detectProvider(data.from || '', data.subject || '')
    console.log('[inbound-email] Provider verification email detected. provider:', provider)

    let html = ''
    let text = ''
    try {
      const received: any = await (resend as any).emails.receiving.get({ id: emailId })
      const body = received?.data ?? received
      html = (body?.html as string) || ''
      text = (body?.text as string) || ''
      console.log('[inbound-email] Fetched received email body. htmlLen:', html.length, 'textLen:', text.length)
    } catch (fetchErr) {
      console.error('[inbound-email] Failed to fetch received email body:', fetchErr)
    }

    const code = extractCode(html, text, provider)
    const link = extractLink(html, text, provider)
    const language = detectLanguage(html, text, data.subject || '')
    console.log('[inbound-email] Extracted — code:', code ? `${code.slice(0, 2)}…` : null, 'link:', link ? 'yes' : 'no', 'language:', language)

    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const verification: ForwardingVerification = {
      provider,
      code,
      link,
      language,
      received_at: now.toISOString(),
      expires_at: expires.toISOString(),
      from_address: data.from || '',
      subject: data.subject || '',
    }

    const { error: updErr } = await supabaseAdmin
      .from('distributors')
      .update({ forwarding_verification: verification })
      .eq('id', dist.id)

    if (updErr) {
      console.error('[inbound-email] Failed to save forwarding_verification:', updErr)
      return NextResponse.json({ error: 'Failed to save verification' }, { status: 500 })
    }

    console.log('[inbound-email] Saved forwarding_verification for distributor:', dist.id)

    return NextResponse.json({
      ok: true,
      type: 'forwarding_verification',
      provider,
      language,
      has_code: Boolean(code),
      has_link: Boolean(link),
    })
  }

  // STEP 4 — Fetch Excel attachment via Resend receiving API
  // The webhook payload has attachment metadata (id, filename, content_type) but NOT the file content.
  // We use the attachment id from the payload + emailId to fetch the download URL from Resend.
  const webhookAttachments: Array<{ id: string; filename: string; content_type: string }> = data.attachments || []
  const xlsxMeta = webhookAttachments.find(
    a => a.filename && (a.filename.endsWith('.xlsx') || a.filename.endsWith('.xls'))
  )

  if (!xlsxMeta) {
    console.warn('[inbound-email] No xlsx in webhook attachments:', webhookAttachments.map(a => a.filename))
    return NextResponse.json({ error: 'No Excel attachment found' }, { status: 400 })
  }

  console.log('[inbound-email] Found attachment:', xlsxMeta.filename, 'id:', xlsxMeta.id)

  let rows: ReturnType<typeof parseExcelRows> = []
  try {
    // Fetch the signed download URL for this attachment
    const { data: attachmentData, error: getErr } = await resend.emails.receiving.attachments.get({
      emailId,
      id: xlsxMeta.id,
    })

    if (getErr || !attachmentData?.download_url) {
      console.error('[inbound-email] Failed to get attachment download URL:', getErr)
      return NextResponse.json({ error: 'Failed to retrieve attachment download URL' }, { status: 500 })
    }

    // Download the actual Excel binary from the signed URL
    console.log('[inbound-email] Downloading from:', attachmentData.download_url.substring(0, 80) + '...')
    const fileRes = await fetch(attachmentData.download_url)
    if (!fileRes.ok) {
      console.error('[inbound-email] Download failed:', fileRes.status, fileRes.statusText)
      return NextResponse.json({ error: 'Failed to download attachment' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet)
    rows = parseExcelRows(jsonData)

    console.log('[inbound-email] Parsed', rows.length, 'rows from Excel')
  } catch (err) {
    console.error('[inbound-email] Failed to parse Excel:', err)
    return NextResponse.json({ error: 'Failed to parse Excel attachment' }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows found in Excel' }, { status: 400 })
  }

  // STEP 5 — Match and verify each row (shared parser)
  const { verified, results } = await verifyRows(
    rows,
    {
      supabaseAdmin,
      resend,
      distributor: {
        id: dist.id,
        slug: dist.slug,
        name: dist.name,
        email: dist.email,
        referral_link: dist.referral_link,
      },
    },
    { logPrefix: '[inbound-email]' }
  )

  // Update distributor last_inbound_at and — on first successful mail —
  // first_puprime_mail_received_at. The latter drives the dashboard's
  // 🟢 "Active — auto-verification running" indicator.
  const now = new Date().toISOString()
  const updates: Record<string, any> = { last_inbound_at: now }
  if (!dist.first_puprime_mail_received_at) {
    updates.first_puprime_mail_received_at = now
    console.info(`[AutoVerify] First PU Prime mail received for distributor ${slug}`)
  }
  await supabaseAdmin
    .from('distributors')
    .update(updates)
    .eq('id', dist.id)

  console.log('[inbound-email] Done. Verified:', verified, '/', rows.length)

  // STEP 6 — Return 200 OK
  return NextResponse.json({
    ok: true,
    slug,
    distributorId: dist.id,
    totalRows: rows.length,
    verified,
    results,
  })
}
