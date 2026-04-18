import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Webhook } from 'svix'
import * as XLSX from 'xlsx'
import { Resend } from 'resend'
import { buildVerifiedAccessEmail } from '@/lib/email-templates/verified-access'
import {
  detectProvider,
  extractCode,
  extractLink,
  isForwardingVerification,
  type ForwardingVerification,
} from '@/lib/forwarding-verification'

// ─────────────────────────────────────────────────────────────────────────────
// Required Supabase schema (run once in SQL editor if not already applied):
//
//   ALTER TABLE leads
//     ADD COLUMN IF NOT EXISTS registration_status TEXT
//       CHECK (registration_status IN ('pending','registered','verified','rejected'))
//       DEFAULT 'pending';
//   ALTER TABLE leads ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ;
//   ALTER TABLE leads ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
//   ALTER TABLE leads ADD COLUMN IF NOT EXISTS account_number TEXT;
//
//   UPDATE leads
//     SET registration_status = 'verified', verified_at = created_at
//     WHERE uid_verified = true AND registration_status = 'pending';
//
//   CREATE INDEX IF NOT EXISTS idx_leads_registration_status
//     ON leads(distributor_id, registration_status);
// ─────────────────────────────────────────────────────────────────────────────

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

type MailType = 'registration' | 'account_opening'

interface RegistrationRow {
  userId: string
  userName: string
  registrationTime: string
}

interface AccountOpeningRow {
  userId: string
  userName: string
  accountNumber: string
  openingTime: string
}

function parseRegistrationRows(jsonData: any[]): RegistrationRow[] {
  return jsonData
    .map(row => ({
      userId: String(row['User ID'] || row['user_id'] || row['UserID'] || '').trim(),
      userName: String(row['User Name'] || row['user_name'] || row['UserName'] || row['Name'] || '').trim(),
      registrationTime: String(row['Client Registration Time'] || row['Registration Time'] || row['registration_time'] || '').trim(),
    }))
    .filter(r => r.userId || r.userName)
}

function parseAccountOpeningRows(jsonData: any[]): AccountOpeningRow[] {
  return jsonData
    .map(row => ({
      userId: String(row['User ID'] || row['user_id'] || row['UserID'] || '').trim(),
      userName: String(row['User Name'] || row['user_name'] || row['UserName'] || row['Name'] || '').trim(),
      accountNumber: String(row['Account'] || row['account'] || row['Account Number'] || row['account_number'] || '').trim(),
      openingTime: String(row['Account Opening Time'] || row['Opening Time'] || row['opening_time'] || '').trim(),
    }))
    .filter(r => r.userId || r.userName)
}

async function downloadAttachment(emailId: string, attachmentId: string): Promise<Buffer | null> {
  try {
    const { data: attachmentData, error: getErr } = await resend.emails.receiving.attachments.get({
      emailId,
      id: attachmentId,
    })

    if (getErr || !attachmentData?.download_url) {
      console.error('[inbound-email] Failed to get attachment download URL:', getErr)
      return null
    }

    console.log('[inbound-email] Downloading from:', attachmentData.download_url.substring(0, 80) + '...')
    const fileRes = await fetch(attachmentData.download_url)
    if (!fileRes.ok) {
      console.error('[inbound-email] Download failed:', fileRes.status, fileRes.statusText)
      return null
    }

    return Buffer.from(await fileRes.arrayBuffer())
  } catch (err) {
    console.error('[inbound-email] Attachment download error:', err)
    return null
  }
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
  const subject: string = data.subject || ''

  // The email ID is at data.email_id (confirmed from live payload)
  const emailId: string | undefined = data.email_id
  if (!emailId) {
    console.error('[inbound-email] No email_id in data:', JSON.stringify(data))
    return NextResponse.json({ error: 'No email ID in webhook payload' }, { status: 400 })
  }

  console.log('[inbound-email] Received email to:', toAddresses, 'from:', data.from, 'subject:', subject, 'emailId:', emailId)

  // STEP 2 — Extract IB slug from the TO address
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

  // STEP 3 — Branch: forwarding-verification email from an email provider
  // (Gmail / Outlook / Yahoo / iCloud / ProtonMail). These are NOT Excel
  // notifications — they are the setup confirmations the IB needs to see.
  if (isForwardingVerification(data.from || '', subject)) {
    const provider = detectProvider(data.from || '', subject)
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
    console.log('[inbound-email] Extracted — code:', code ? `${code.slice(0, 2)}…` : null, 'link:', link ? 'yes' : 'no')

    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const verification: ForwardingVerification = {
      provider,
      code,
      link,
      received_at: now.toISOString(),
      expires_at: expires.toISOString(),
      from_address: data.from || '',
      subject,
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
      has_code: Boolean(code),
      has_link: Boolean(link),
    })
  }

  // STEP 4 — Detect PU Prime mail type from the subject
  let mailType: MailType | null = null
  if (subject.includes('Client Registration Notification')) {
    mailType = 'registration'
  } else if (subject.includes('Client Account Opening Notification')) {
    mailType = 'account_opening'
  }

  if (!mailType) {
    console.log('[inbound-email] Unrecognized subject, ignoring:', subject)
    return NextResponse.json({ ok: true, ignored: 'unknown subject', subject })
  }

  console.log('[inbound-email] Mail type detected:', mailType)

  // STEP 5 — Fetch Excel attachment via Resend receiving API
  const webhookAttachments: Array<{ id: string; filename: string; content_type: string }> = data.attachments || []
  const xlsxMeta = webhookAttachments.find(
    a => a.filename && (a.filename.endsWith('.xlsx') || a.filename.endsWith('.xls'))
  )

  if (!xlsxMeta) {
    console.warn('[inbound-email] No xlsx in webhook attachments:', webhookAttachments.map(a => a.filename))
    return NextResponse.json({ ok: true, ignored: 'no xlsx attachment', mailType })
  }

  console.log('[inbound-email] Found attachment:', xlsxMeta.filename, 'id:', xlsxMeta.id)

  const buffer = await downloadAttachment(emailId, xlsxMeta.id)
  if (!buffer) {
    return NextResponse.json({ error: 'Failed to download attachment' }, { status: 500 })
  }

  let jsonData: any[] = []
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    jsonData = XLSX.utils.sheet_to_json(sheet)
  } catch (err) {
    console.error('[inbound-email] Failed to parse Excel:', err)
    return NextResponse.json({ error: 'Failed to parse Excel attachment' }, { status: 400 })
  }

  // Update distributor.last_inbound_at regardless of row outcomes
  const touchInbound = supabaseAdmin
    .from('distributors')
    .update({ last_inbound_at: new Date().toISOString() })
    .eq('id', dist.id)
    .then(() => {}, (e: any) => console.error('[inbound-email] touch last_inbound_at failed:', e))

  // STEP 6 — Dispatch to the appropriate handler
  if (mailType === 'registration') {
    const rows = parseRegistrationRows(jsonData)
    console.log('[inbound-email] Registration: parsed', rows.length, 'rows')

    const seen = new Set<string>()
    const results: Array<{ userId: string; userName: string; status: string; leadId?: string }> = []
    let matched = 0

    for (const row of rows) {
      const dedupeKey = (row.userId || row.userName).toLowerCase()
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      if (!row.userId && !row.userName) continue

      let lead: any = null

      if (row.userId) {
        const { data: uidMatch } = await supabaseAdmin
          .from('leads')
          .select('id, name, email, uid, uid_verified, registration_status')
          .eq('distributor_id', dist.id)
          .eq('uid', row.userId)
          .maybeSingle()
        if (uidMatch) lead = uidMatch
      }

      if (!lead && row.userName) {
        const { data: nameMatch } = await supabaseAdmin
          .from('leads')
          .select('id, name, email, uid, uid_verified, registration_status')
          .eq('distributor_id', dist.id)
          .ilike('name', `%${row.userName}%`)
          .maybeSingle()
        if (nameMatch) lead = nameMatch
      }

      if (!lead) {
        results.push({ userId: row.userId, userName: row.userName, status: 'no_match' })
        continue
      }

      // Do NOT downgrade an already-verified lead
      if (lead.uid_verified || lead.registration_status === 'verified') {
        results.push({ userId: row.userId, userName: row.userName, status: 'already_verified', leadId: lead.id })
        continue
      }

      const { error: updateErr } = await supabaseAdmin
        .from('leads')
        .update({
          uid: row.userId || lead.uid,
          registration_status: 'registered',
          registered_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

      if (updateErr) {
        console.error('[inbound-email] Registration update failed:', lead.id, updateErr)
        results.push({ userId: row.userId, userName: row.userName, status: 'update_failed', leadId: lead.id })
        continue
      }

      matched++
      results.push({ userId: row.userId, userName: row.userName, status: 'registered', leadId: lead.id })

      // Log capture — no email sent yet (KYC not complete)
      await supabaseAdmin.from('email_sends').insert({
        user_id: dist.id,
        email_type: 'registration_captured',
      }).then(() => {}, () => {})
    }

    await touchInbound

    console.log('[inbound-email] Registration done. Matched:', matched, '/', rows.length)
    return NextResponse.json({
      ok: true,
      mailType,
      slug,
      distributorId: dist.id,
      totalRows: rows.length,
      matched,
      rows: results,
    })
  }

  // mailType === 'account_opening' — existing full-verify flow
  const rows = parseAccountOpeningRows(jsonData)
  console.log('[inbound-email] Account opening: parsed', rows.length, 'rows')

  const seen = new Set<string>()
  const results: Array<{ userId: string; userName: string; status: string; leadId?: string }> = []
  let verified = 0

  for (const row of rows) {
    const dedupeKey = (row.userId || row.userName).toLowerCase()
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    if (!row.userId && !row.userName) continue

    let lead: any = null

    if (row.userId) {
      const { data: uidMatch } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, uid, uid_verified')
        .eq('distributor_id', dist.id)
        .eq('uid', row.userId)
        .maybeSingle()
      if (uidMatch) lead = uidMatch
    }

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
      // No match — create a new verified lead (existing behavior)
      const { data: newLead, error: createErr } = await supabaseAdmin
        .from('leads')
        .insert({
          distributor_id: dist.id,
          name: row.userName || `UID ${row.userId}`,
          uid: row.userId || null,
          uid_verified: true,
          registration_status: 'verified',
          registered_at: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          account_number: row.accountNumber || null,
        })
        .select('id, name, email')
        .single()

      if (createErr || !newLead) {
        console.error('[inbound-email] Failed to create lead:', createErr)
        results.push({ userId: row.userId, userName: row.userName, status: 'create_failed' })
        continue
      }

      verified++
      results.push({ userId: row.userId, userName: row.userName, status: 'created', leadId: newLead.id })

      await supabaseAdmin.from('email_sends').insert({
        user_id: dist.id,
        email_type: 'auto_verified',
      }).then(() => {}, () => {})

      console.log('[inbound-email] Created new verified lead:', newLead.id, row.userName)
      continue
    }

    if (lead.uid_verified) {
      results.push({ userId: row.userId, userName: row.userName, status: 'already_verified', leadId: lead.id })
      continue
    }

    const { error: updateErr } = await supabaseAdmin
      .from('leads')
      .update({
        uid: row.userId || lead.uid,
        uid_verified: true,
        account_number: row.accountNumber || null,
        registration_status: 'verified',
        verified_at: new Date().toISOString(),
      })
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
        const { html, subject: emailSubject } = buildVerifiedAccessEmail({
          name: lead.name || '',
          referralLink: dist.referral_link || 'https://www.primeverseaccess.com',
        })
        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject: emailSubject,
          html,
        })
      } catch (emailErr) {
        console.error('[inbound-email] Failed to send verification email to lead:', lead.email, emailErr)
      }
    }

    await supabaseAdmin.from('email_sends').insert({
      user_id: dist.id,
      email_type: 'auto_verified',
    }).then(() => {}, () => {})
  }

  await touchInbound

  console.log('[inbound-email] Account opening done. Verified:', verified, '/', rows.length)
  return NextResponse.json({
    ok: true,
    mailType,
    slug,
    distributorId: dist.id,
    totalRows: rows.length,
    matched: verified,
    rows: results,
  })
}
