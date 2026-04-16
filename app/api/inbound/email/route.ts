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
  const attachments: Array<{ filename: string; content: string }> = data.attachments || []

  console.log('[inbound-email] Received email to:', toAddresses, 'from:', data.from, 'subject:', data.subject)

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

  // STEP 4 — Parse Excel attachment
  const xlsxAttachment = attachments.find(
    a => a.filename && (a.filename.endsWith('.xlsx') || a.filename.endsWith('.xls'))
  )

  if (!xlsxAttachment) {
    console.warn('[inbound-email] No xlsx attachment found. Attachments:', attachments.map(a => a.filename))
    return NextResponse.json({ error: 'No Excel attachment found' }, { status: 400 })
  }

  let rows: Array<{ userId: string; userName: string; accountNumber: string; openingTime: string }> = []
  try {
    const buffer = Buffer.from(xlsxAttachment.content, 'base64')
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet)

    rows = jsonData.map(row => ({
      userId: String(row['User ID'] || row['user_id'] || row['UserID'] || '').trim(),
      userName: String(row['User Name'] || row['user_name'] || row['UserName'] || row['Name'] || '').trim(),
      accountNumber: String(row['Account'] || row['account'] || row['Account Number'] || '').trim(),
      openingTime: String(row['Account Opening Time'] || row['Opening Time'] || row['opening_time'] || '').trim(),
    })).filter(r => r.userId || r.userName)

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
