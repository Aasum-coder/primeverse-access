import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Daily cron — deletes landing_visits rows older than 90 days.
// Auth: matches the existing repo pattern from
// app/api/cron/nudge-emails/route.ts (Bearer ${CRON_SECRET}).
// Schedule registered in vercel.json: 0 3 * * * (03:00 UTC daily).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - NINETY_DAYS_MS).toISOString()

  const { error, count } = await supabaseAdmin
    .from('landing_visits')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff)

  if (error) {
    console.error('[cleanup-landing-visits] delete failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.info(`[cleanup-landing-visits] deleted ${count ?? 0} rows older than ${cutoff}`)
  return NextResponse.json({ deleted: count ?? 0, cutoff })
}
