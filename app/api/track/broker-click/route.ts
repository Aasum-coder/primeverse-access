import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Broker-click tracker. The lead-welcome email rewrites the affiliate URL
// to point here; this route stamps leads.broker_click_at on the first
// click and 302s onward to the original destination.
//
// Latency budget: the spec asks for sub-300ms perceived redirect time.
// We achieve that by issuing the redirect immediately and firing the
// DB write asynchronously — the browser hop happens in parallel with
// the update, so the user never waits for Postgres.
//
// Safe fallback: if the dest is missing or unparseable, we redirect
// to the homepage rather than 4xx so the user never sees a broken page.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const FALLBACK_DEST = 'https://www.primeverseaccess.com/'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function safeDest(raw: string | null): string {
  if (!raw) return FALLBACK_DEST
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return FALLBACK_DEST
    return u.toString()
  } catch {
    return FALLBACK_DEST
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const leadId = url.searchParams.get('lead_id')
  const destParam = url.searchParams.get('dest')
  const dest = safeDest(destParam)

  // Fire-and-forget the DB stamp — we do not await it. The redirect
  // response goes out immediately; the write completes in the
  // background. Errors are logged but never block the user.
  if (leadId && UUID_RE.test(leadId)) {
    void supabaseAdmin
      .from('leads')
      .update({ broker_click_at: new Date().toISOString() })
      .eq('id', leadId)
      .is('broker_click_at', null)
      .then(({ error }) => {
        if (error) console.error('[track/broker-click] update failed:', error.message)
      })
  }

  return NextResponse.redirect(dest, { status: 302 })
}
