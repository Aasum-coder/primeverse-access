import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Webhook } from 'svix'
import * as XLSX from 'xlsx'
import { Resend } from 'resend'
import { buildVerifiedAccessEmail } from '@/lib/email-templates/verified-access'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

function parseExcelRows(jsonData: any[]): Array<{ userId: string; userName: string; accountNumber: string; openingTime: string }> {
  return jsonData.map(row => ({
    userId: String(row['User ID'] || row['user_id'] || row['UserID'] || '').trim(),
    userName: String(row['User Name'] || row['user_name'] || row['UserName'] || row['Name'] || '').trim(),
    accountNumber: String(row['Account'] || row['account'] || row['Account Number'] || '').trim(),
    openingTime: String(row['Account Opening Time'] || row['Opening Time'] || row['opening_time'] || '').trim(),
  })).filter(r => r.userId || r.userName)
}

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
    .select('id, slug, name, email, referral_link')
    .eq('slug', slug)
    .maybeSingle()

  if (distErr || !dist) {
    console.error('[inbound-email] Distributor not found for slug:', slug, distErr)
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  console.log('[inbound-email] Matched distributor:', dist.id, dist.name)

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

  let rows: Array<{ userId: string; userName: string; accountNumber: string; openingTime: string }> = []
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

  // STEP 5 — Match and verify each row
  let verified = 0
  const results: Array<{ userId: string; userName: string; status: string; leadId?: string }> = []

  for (const row of rows) {
    let lead: any = null

    // Try match by UID first
    if (row.userId) {
      const { data: uidMatch } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, uid, uid_verified')
        .eq('distributor_id', dist.id)
        .eq('uid', row.userId)
        .maybeSingle()
      if (uidMatch) lead = uidMatch
    }

    // Fallback: try name match
    if (!lead && row.userName) {
      const { data: nameMatch } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, uid, uid_verified')
        .eq('distributor_id', dist.id)
        .ilike('name', `%${row.userName}%`)
        .maybeSingle()
      if (nameMatch) lead = nameMatch
    }

    if (!lead) {
      results.push({ userId: row.userId, userName: row.userName, status: 'no_match' })
      continue
    }

    if (lead.uid_verified) {
      results.push({ userId: row.userId, userName: row.userName, status: 'already_verified', leadId: lead.id })
      continue
    }

    // Verify the lead
    const { error: updateErr } = await supabaseAdmin
      .from('leads')
      .update({ uid_verified: true, uid: row.userId || lead.uid })
      .eq('id', lead.id)

    if (updateErr) {
      console.error('[inbound-email] Failed to update lead:', lead.id, updateErr)
      results.push({ userId: row.userId, userName: row.userName, status: 'update_failed', leadId: lead.id })
      continue
    }

    verified++
    results.push({ userId: row.userId, userName: row.userName, status: 'verified', leadId: lead.id })

    // Send verification email to the lead
    if (lead.email) {
      try {
        const { html, subject } = buildVerifiedAccessEmail({
          name: lead.name || '',
          referralLink: dist.referral_link || 'https://www.primeverseaccess.com',
        })
        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject,
          html,
        })
      } catch (emailErr) {
        console.error('[inbound-email] Failed to send verification email to lead:', lead.email, emailErr)
      }
    }

    // Log to email_sends
    await supabaseAdmin.from('email_sends').insert({
      user_id: dist.id,
      email_type: 'auto_verified',
    }).then(() => {}, () => {})
  }

  // Update distributor last_inbound_at
  await supabaseAdmin
    .from('distributors')
    .update({ last_inbound_at: new Date().toISOString() })
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
