import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Visitor analytics endpoint.
//
// Auth: Bearer token in Authorization header → supabase.auth.getUser(token).
// Same shape as every other authenticated endpoint in this repo
// (e.g. app/api/admin/terminate-ib, app/api/content-calendar/posts).
// The frontend reads session.access_token via supabase.auth.getSession()
// and attaches it on the fetch.
//
// Scope: admin sees all rows, IB sees only their own slug. Admin check
// matches the canonical pattern from app/api/admin/terminate-ib:
//   distributors.is_admin = true  OR  auth.users.email = 'bitaasum@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

interface VisitRow {
  slug: string
  country: string | null
  created_at: string
}

export async function GET(request: Request) {
  // 1. Bearer auth (matches existing repo pattern)
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json(
      { data: null, error: { code: 'unauthorized', message: 'Missing bearer token' } },
      { status: 401 }
    )
  }
  const { data: userData, error: authErr } = await supabaseAnon.auth.getUser(token)
  if (authErr || !userData?.user) {
    return NextResponse.json(
      { data: null, error: { code: 'unauthorized', message: 'Invalid bearer token' } },
      { status: 401 }
    )
  }
  const callerId = userData.user.id
  const callerEmail = userData.user.email || ''

  // 2. Admin check (same pattern as app/api/admin/terminate-ib)
  let isAdmin = callerEmail === 'bitaasum@gmail.com'
  let callerSlug: string | null = null
  const { data: callerDist } = await supabaseAdmin
    .from('distributors')
    .select('slug, is_admin')
    .eq('user_id', callerId)
    .maybeSingle()
  if (callerDist?.is_admin === true) isAdmin = true
  if (callerDist?.slug) callerSlug = callerDist.slug

  // 3. Build base query — last 90 days, exclude bots
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS).toISOString()
  let query = supabaseAdmin
    .from('landing_visits')
    .select('slug, country, created_at')
    .eq('is_bot', false)
    .gte('created_at', ninetyDaysAgo)

  if (!isAdmin) {
    if (!callerSlug) {
      // IB without a slug has no visits to see; return empty shape rather than 403
      return NextResponse.json({
        data: {
          totalVisits: 0,
          uniqueCountries: 0,
          topCountries: [],
          timeSeries: [],
          perIB: null,
          scope: 'ib' as const,
        },
        error: null,
      })
    }
    query = query.eq('slug', callerSlug)
  }

  const { data: visits, error: queryErr } = await query
  if (queryErr) {
    console.error('[analytics/visitors] query failed:', queryErr.message)
    return NextResponse.json(
      { data: null, error: { code: 'db_error', message: queryErr.message } },
      { status: 500 }
    )
  }

  const rows: VisitRow[] = visits || []

  // 4. Aggregations
  const totalVisits = rows.length
  const uniqueCountries = new Set(rows.map(r => r.country).filter(Boolean)).size

  const countryCounts: Record<string, number> = {}
  for (const r of rows) {
    const c = r.country ?? 'XX'
    countryCounts[c] = (countryCounts[c] ?? 0) + 1
  }
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }))

  // 5. Per-IB breakdown (admin only)
  let perIB: Array<{ slug: string; visits: number; topCountry: string }> | null = null
  if (isAdmin) {
    const slugStats: Record<string, { total: number; countries: Record<string, number> }> = {}
    for (const r of rows) {
      if (!slugStats[r.slug]) slugStats[r.slug] = { total: 0, countries: {} }
      slugStats[r.slug].total++
      const c = r.country ?? 'XX'
      slugStats[r.slug].countries[c] = (slugStats[r.slug].countries[c] ?? 0) + 1
    }
    perIB = Object.entries(slugStats)
      .map(([slug, { total, countries }]) => ({
        slug,
        visits: total,
        topCountry: Object.entries(countries).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'XX',
      }))
      .sort((a, b) => b.visits - a.visits)
  }

  // 6. Daily time series — last 30 days, gap-filled so missing days show 0
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS)
  const dailyCounts: Record<string, number> = {}
  for (const r of rows) {
    const day = r.created_at.slice(0, 10)
    if (new Date(day) >= thirtyDaysAgo) {
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1
    }
  }
  // Gap-fill: 30 days of zeroes, overlay actual counts
  const timeSeries: Array<{ date: string; count: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    timeSeries.push({ date: key, count: dailyCounts[key] ?? 0 })
  }

  return NextResponse.json({
    data: {
      totalVisits,
      uniqueCountries,
      topCountries,
      timeSeries,
      perIB,
      scope: isAdmin ? ('admin' as const) : ('ib' as const),
    },
    error: null,
  })
}
