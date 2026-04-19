import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyRows, type ExcelRow } from '@/lib/verify-rows'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

async function getDistributor(token: string) {
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: userData, error } = await authClient.auth.getUser(token)
  if (error || !userData?.user) return null

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id, slug, name, email, referral_link')
    .eq('user_id', userData.user.id)
    .single()

  return dist || null
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const distributor = await getDistributor(token)
  if (!distributor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const timestamp = Date.now()
  const testUid = `TEST_${distributor.slug}_${timestamp}`

  // Fake PU Prime row — same shape as parseExcelRows output so the shared
  // verifier runs the identical code path as production.
  const fakeRows: ExcelRow[] = [
    {
      userId: testUid,
      userName: 'TEST SETUP',
      accountNumber: '',
      openingTime: new Date().toISOString(),
    },
  ]

  try {
    const { verified, results } = await verifyRows(
      fakeRows,
      { supabaseAdmin, resend, distributor },
      { isTest: true, logPrefix: '[auto-verify-test]' }
    )

    // Inline cleanup: remove the test lead before returning so we never
    // leave orphans. Scope strictly by distributor + TEST_ prefix so we
    // only ever touch rows we just inserted for this IB.
    const { error: cleanupErr } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('distributor_id', distributor.id)
      .like('uid', `TEST_${distributor.slug}_%`)

    if (cleanupErr) {
      console.error('[auto-verify-test] Cleanup failed:', cleanupErr)
    }

    const created = results.find(r => r.status === 'created' || r.status === 'verified')

    if (verified === 0 || !created) {
      console.error('[auto-verify-test] Test run did not verify any row:', results)
      return NextResponse.json(
        { success: false, error: 'Test row did not verify', results },
        { status: 500 }
      )
    }

    console.info(`[AutoVerify] Test setup OK for distributor ${distributor.slug}`)

    return NextResponse.json({
      success: true,
      testLeadId: created.leadId || null,
      testUid,
    })
  } catch (err) {
    console.error('[auto-verify-test] Unexpected error:', err)

    // Best-effort cleanup on failure
    await supabaseAdmin
      .from('leads')
      .delete()
      .eq('distributor_id', distributor.id)
      .like('uid', `TEST_${distributor.slug}_%`)

    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
