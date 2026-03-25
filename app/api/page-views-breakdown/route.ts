import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

function cleanReferrer(raw: string | null | undefined): string {
  if (!raw || raw === 'direct' || raw.trim() === '') return 'Direct'
  const lower = raw.toLowerCase()
  if (lower.includes('facebook')) return 'Facebook'
  if (lower.includes('instagram')) return 'Instagram'
  if (lower.includes('tiktok')) return 'TikTok'
  if (lower.includes('whatsapp')) return 'WhatsApp'
  if (lower.includes('t.me') || lower.includes('telegram')) return 'Telegram'
  if (lower.includes('linkedin')) return 'LinkedIn'
  if (lower.includes('google')) return 'Google'
  if (lower.includes('twitter') || lower.includes('x.com')) return 'X / Twitter'
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return raw
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: userData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !userData?.user) {
    console.log('[page-views-breakdown] auth failed:', authError?.message)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  }

  console.log('[page-views-breakdown] auth user.id:', userData.user.id, 'email:', userData.user.email)

  const { data: dist, error: distError } = await supabase
    .from('distributors')
    .select('id, user_id, name, slug')
    .eq('user_id', userData.user.id)
    .single()

  console.log('[page-views-breakdown] distributor lookup result:', JSON.stringify({ dist, distError: distError?.message }))

  if (!dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  }

  console.log('[page-views-breakdown] using distributor_id:', dist.id, 'user_id:', dist.user_id, 'name:', dist.name, 'slug:', dist.slug)

  // Determine date range from period query param
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'
  let fromDate: Date | null = null
  const now = new Date()
  if (period === 'day') {
    fromDate = new Date(now)
    fromDate.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 7)
  } else if (period === 'month') {
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 30)
  }
  // period === 'all' → fromDate stays null → no date filter

  let query = supabase
    .from('page_views')
    .select('id, created_at, referrer, utm_source, device')
    .eq('distributor_id', dist.id)
  if (fromDate) {
    query = query.gte('created_at', fromDate.toISOString())
  }
  const { data: views, error: viewsError } = await query.order('created_at', { ascending: true })

  console.log('[page-views-breakdown] page_views query for distributor_id:', dist.id, 'period:', period, 'fromDate:', fromDate?.toISOString() || 'none', 'rows returned:', views?.length ?? 0, 'error:', viewsError?.message || 'none')

  const rows = views || []
  const total = rows.length

  // Group by source (referrer cleaned)
  const sourceCounts: Record<string, number> = {}
  const deviceCounts: Record<string, number> = {}
  const dayCounts: Record<string, number> = {}

  for (const row of rows) {
    const source = cleanReferrer(row.referrer)
    sourceCounts[source] = (sourceCounts[source] || 0) + 1

    const device = row.device || 'desktop'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1

    const day = (row.created_at || '').slice(0, 10)
    if (day) dayCounts[day] = (dayCounts[day] || 0) + 1
  }

  const bySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  const byDevice = Object.entries(deviceCounts)
    .map(([device, count]) => ({ device, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  // Fill days based on period
  const daysToFill = period === 'day' ? 1 : period === 'week' ? 7 : period === 'all' ? 90 : 30
  const byDay: { date: string; count: number }[] = []
  for (let i = daysToFill - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    byDay.push({ date: key, count: dayCounts[key] || 0 })
  }

  const topReferrers = bySource.map(s => ({ referrer: s.source, count: s.count }))

  return NextResponse.json(
    { total, bySource, byDevice, byDay, topReferrers },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
