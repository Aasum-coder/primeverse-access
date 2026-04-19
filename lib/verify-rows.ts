// Shared row verification logic used by both the inbound email webhook
// (app/api/inbound/email/route.ts) and the "Test my setup" endpoint
// (app/api/auto-verify/test/route.ts). Keep parsing/matching logic here so
// both paths behave identically.

import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildVerifiedAccessEmail } from '@/lib/email-templates/verified-access'

export interface ExcelRow {
  userId: string
  userName: string
  accountNumber: string
  openingTime: string
}

export interface VerifyRowResult {
  userId: string
  userName: string
  status: 'created' | 'verified' | 'already_verified' | 'create_failed' | 'update_failed'
  leadId?: string
}

export interface VerifyRowsOptions {
  // When true the inserted/updated leads will be test leads.
  // The uid will be prefixed like TEST_{slug}_{timestamp} and we skip
  // sending the verified-access email to the lead.
  isTest?: boolean
  // Log prefix so both routes can grep logs easily
  logPrefix?: string
}

export interface VerifyRowsDeps {
  supabaseAdmin: SupabaseClient
  resend: Resend
  distributor: {
    id: string
    slug: string
    name: string | null
    email: string | null
    referral_link: string | null
  }
}

export function parseExcelRows(jsonData: any[]): ExcelRow[] {
  return jsonData
    .map(row => ({
      userId: String(row['User ID'] || row['user_id'] || row['UserID'] || '').trim(),
      userName: String(
        row['User Name'] || row['user_name'] || row['UserName'] || row['Name'] || ''
      ).trim(),
      accountNumber: String(
        row['Account'] || row['account'] || row['Account Number'] || ''
      ).trim(),
      openingTime: String(
        row['Account Opening Time'] || row['Opening Time'] || row['opening_time'] || ''
      ).trim(),
    }))
    .filter(r => r.userId || r.userName)
}

export async function verifyRows(
  rows: ExcelRow[],
  deps: VerifyRowsDeps,
  opts: VerifyRowsOptions = {}
): Promise<{ verified: number; results: VerifyRowResult[] }> {
  const { supabaseAdmin, resend, distributor } = deps
  const logPrefix = opts.logPrefix || '[verify-rows]'
  let verified = 0
  const results: VerifyRowResult[] = []

  for (const row of rows) {
    let lead: any = null

    if (row.userId) {
      const { data: uidMatch } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, uid, uid_verified')
        .eq('distributor_id', distributor.id)
        .eq('uid', row.userId)
        .maybeSingle()
      if (uidMatch) lead = uidMatch
    }

    if (!lead && row.userName) {
      const { data: nameMatch } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, uid, uid_verified')
        .eq('distributor_id', distributor.id)
        .ilike('name', `%${row.userName}%`)
        .maybeSingle()
      if (nameMatch) lead = nameMatch
    }

    if (!lead) {
      // leads.email is NOT NULL in prod. When the xlsx doesn't carry an
      // email (PuPrime exports usually don't), synthesize a non-colliding
      // placeholder so the insert lands. IBs can edit the lead later.
      const syntheticEmail = row.userId
        ? `puprime+${row.userId}@auto.primeverseaccess.com`
        : `puprime+${Date.now()}@auto.primeverseaccess.com`
      const insertPayload: Record<string, any> = {
        distributor_id: distributor.id,
        name: row.userName || `UID ${row.userId}`,
        email: syntheticEmail,
        uid: row.userId || null,
        uid_verified: true,
      }

      const { data: newLead, error: createErr } = await supabaseAdmin
        .from('leads')
        .insert(insertPayload)
        .select('id, name, email')
        .single()

      if (createErr || !newLead) {
        console.error(`${logPrefix} Failed to create lead:`, createErr)
        results.push({ userId: row.userId, userName: row.userName, status: 'create_failed' })
        continue
      }

      verified++
      results.push({ userId: row.userId, userName: row.userName, status: 'created', leadId: newLead.id })

      await supabaseAdmin
        .from('email_sends')
        .insert({ user_id: distributor.id, email_type: 'auto_verified' })
        .then(() => {}, () => {})

      console.log(`${logPrefix} Created new lead:`, newLead.id, row.userName)
      continue
    }

    if (lead.uid_verified) {
      results.push({
        userId: row.userId,
        userName: row.userName,
        status: 'already_verified',
        leadId: lead.id,
      })
      continue
    }

    const { error: updateErr } = await supabaseAdmin
      .from('leads')
      .update({ uid_verified: true, uid: row.userId || lead.uid })
      .eq('id', lead.id)

    if (updateErr) {
      console.error(`${logPrefix} Failed to update lead:`, lead.id, updateErr)
      results.push({
        userId: row.userId,
        userName: row.userName,
        status: 'update_failed',
        leadId: lead.id,
      })
      continue
    }

    verified++
    results.push({
      userId: row.userId,
      userName: row.userName,
      status: 'verified',
      leadId: lead.id,
    })

    if (!opts.isTest && lead.email) {
      try {
        const { html, subject } = buildVerifiedAccessEmail({
          name: lead.name || '',
          referralLink: distributor.referral_link || 'https://www.primeverseaccess.com',
        })
        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject,
          html,
        })
      } catch (emailErr) {
        console.error(`${logPrefix} Failed to send verification email to lead:`, lead.email, emailErr)
      }
    }

    await supabaseAdmin
      .from('email_sends')
      .insert({ user_id: distributor.id, email_type: 'auto_verified' })
      .then(() => {}, () => {})
  }

  return { verified, results }
}
