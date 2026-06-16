import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Per-IB CSV export of leads. Returns the caller's own leads only —
// the distributor lookup is keyed off the authenticated user, no IB
// can pull another's data.
//
// Auth: Bearer token in Authorization header (same pattern as
// /api/leads/reach-out, /api/admin/analytics/visitors, /api/content-calendar/posts,
// /api/page-views-breakdown). The frontend reads
// session.access_token via supabase.auth.getSession() and attaches it.
//
// CSV shape — exact column order, RFC 4180 escaping, UTF-8 BOM,
// CRLF line endings so Excel opens it cleanly with æøå preserved:
//   Name, Email, UID, Verified, Contact Method, Contact Address,
//   Language, Signed Up, Verified On, Source
//
// Source column status:
//   The leads table has no utm_source / referrer / source column.
//   landing_visits doesn't capture either; page_views does, but joining
//   page_views to leads is heuristic (closest visit by distributor +
//   slug + created_at) and would mis-attribute multi-visit conversions.
//   TODO follow-up PR: add lead_source_utm + lead_source_referrer
//   columns to leads, capture them at signup time in app/[slug]/page.tsx
//   (and the 1moveacademy.com marketing site), backfill if desired. For
//   now this column is emitted as an empty string so downstream tooling
//   can keep the header position stable.
//
// No row limit. IBs have <500 leads each in production (top IB is far
// below this); the response fits in one HTTP body without paging.

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

const CSV_HEADERS = [
  'Name',
  'Email',
  'UID',
  'Verified',
  'Contact Method',
  'Contact Address',
  'Language',
  'Signed Up',
  'Verified On',
  'Source',
] as const

// RFC 4180: quote any field that contains a comma, double-quote, CR or
// LF; double-quotes inside the field are escaped by doubling.
function csvCell(value: string | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (s === '') return ''
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function isoDate(value: string | null | undefined): string {
  if (!value) return ''
  // leads.created_at is `timestamp without time zone` in the live DB;
  // slicing the first 10 chars yields YYYY-MM-DD without forcing a tz
  // assumption. Falls back to '' on any unexpected shape.
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return m ? m[1] : ''
}

function contactAddress(lead: {
  preferred_contact_channel: string | null
  email: string | null
  whatsapp_number: string | null
  telegram_handle: string | null
}): string {
  switch (lead.preferred_contact_channel) {
    case 'whatsapp':
      return lead.whatsapp_number || ''
    case 'telegram':
      return lead.telegram_handle || ''
    case 'email':
    default:
      return lead.email || ''
  }
}

interface LeadRow {
  name: string | null
  email: string | null
  uid: string | null
  uid_verified: boolean | null
  preferred_contact_channel: string | null
  whatsapp_number: string | null
  telegram_handle: string | null
  browser_locale: string | null
  created_at: string | null
  uid_verified_at: string | null
}

export async function GET(request: Request) {
  // 1. Bearer auth
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 })
  }
  const { data: userData, error: authErr } = await supabaseAnon.auth.getUser(token)
  if (authErr || !userData?.user) {
    return NextResponse.json({ error: 'Invalid bearer token' }, { status: 401 })
  }

  // 2. Resolve caller's distributor (loud 403 if none, 500 on db error).
  const { data: dist, error: distErr } = await supabaseAdmin
    .from('distributors')
    .select('id, slug')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (distErr) {
    console.error('[leads/export-csv] distributor lookup failed:', distErr.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  if (!dist?.id) {
    return NextResponse.json({ error: 'No distributor for this user' }, { status: 403 })
  }

  // 3. Fetch leads — caller's only, newest first.
  const { data: leads, error: leadsErr } = await supabaseAdmin
    .from('leads')
    .select(
      'name, email, uid, uid_verified, preferred_contact_channel, whatsapp_number, telegram_handle, browser_locale, created_at, uid_verified_at',
    )
    .eq('distributor_id', dist.id)
    .order('created_at', { ascending: false })

  if (leadsErr) {
    console.error('[leads/export-csv] leads fetch failed:', leadsErr.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  // 4. Build CSV body.
  const lines: string[] = []
  lines.push(CSV_HEADERS.join(','))

  for (const raw of (leads || []) as LeadRow[]) {
    const verified = raw.uid_verified === true
    const cells = [
      csvCell(raw.name),
      csvCell(raw.email),
      csvCell(verified ? raw.uid : ''), // UID hidden until uid_verified
      verified ? 'Yes' : 'No',
      csvCell(raw.preferred_contact_channel),
      csvCell(contactAddress(raw)),
      csvCell(raw.browser_locale),
      isoDate(raw.created_at),
      isoDate(raw.uid_verified_at),
      '', // Source — TODO: follow-up PR persists utm_source + referrer at signup
    ]
    lines.push(cells.join(','))
  }

  // RFC 4180 prefers CRLF; UTF-8 BOM keeps Excel from mis-detecting
  // the encoding when the file has Norwegian / Swedish characters.
  const body = '﻿' + lines.join('\r\n') + '\r\n'

  const filenameDate = new Date().toISOString().slice(0, 10)
  const filename = `leads-${dist.slug || 'export'}-${filenameDate}.csv`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
