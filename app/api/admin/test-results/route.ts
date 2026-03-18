import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

// Total test items count (hardcoded to match the beta test sections in page.tsx)
const TOTAL_TEST_ITEMS = 38

export async function GET(request: Request) {
  // Verify admin via auth token
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  )
  const { data: userData } = await anonClient.auth.getUser(token)
  if (!userData.user || !ADMIN_EMAILS.includes(userData.user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all test results using service role (bypasses RLS)
  const { data: results, error } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by user
  const testerMap = new Map<string, {
    user_id: string
    results: typeof results
    passCount: number
    failCount: number
    skipCount: number
  }>()

  for (const r of results || []) {
    const key = r.user_id
    if (!testerMap.has(key)) {
      testerMap.set(key, {
        user_id: r.user_id,
        results: [],
        passCount: 0,
        failCount: 0,
        skipCount: 0,
      })
    }
    const t = testerMap.get(key)!
    t.results!.push(r)
    if (r.status === 'pass') t.passCount++
    else if (r.status === 'fail') t.failCount++
    else if (r.status === 'skip') t.skipCount++
  }

  const testers = Array.from(testerMap.values()).map(t => ({
    user_id: t.user_id,
    passCount: t.passCount,
    failCount: t.failCount,
    skipCount: t.skipCount,
    totalCompleted: t.passCount + t.failCount + t.skipCount,
    completionPct: Math.round(((t.passCount + t.failCount + t.skipCount) / TOTAL_TEST_ITEMS) * 100),
    results: t.results,
  }))

  // Most-failed test items
  const failCountMap = new Map<string, { test_item_id: string; count: number }>()
  for (const r of results || []) {
    if (r.status === 'fail') {
      const key = r.test_item_id
      if (!failCountMap.has(key)) {
        failCountMap.set(key, { test_item_id: r.test_item_id, count: 0 })
      }
      failCountMap.get(key)!.count++
    }
  }
  const mostFailed = Array.from(failCountMap.values()).sort((a, b) => b.count - a.count)

  // Overview stats
  const totalTesters = testers.length
  const avgCompletion = totalTesters > 0 ? Math.round(testers.reduce((s, t) => s + t.completionPct, 0) / totalTesters) : 0

  return NextResponse.json({
    overview: {
      totalTesters,
      avgCompletion,
      totalTestItems: TOTAL_TEST_ITEMS,
      mostFailed: mostFailed.slice(0, 10),
    },
    testers,
  })
}
