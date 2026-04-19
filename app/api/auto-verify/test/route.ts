import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyRows, type ExcelRow } from '@/lib/verify-rows'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

// Only delete leads whose uid STARTS WITH this prefix. Never touch real leads.
const TEST_UID_PREFIX = 'TEST_'

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

  const slug = distributor.slug
  const timestamp = Date.now()
  const testUid = `${TEST_UID_PREFIX}${slug}_${timestamp}`
  const thisRunUidPattern = `${TEST_UID_PREFIX}${slug}_%`

  // Belt-and-suspenders: remove any orphaned TEST_ leads older than 5 minutes
  // from previous failed runs. Always scoped to TEST_ prefix, never real leads.
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('leads')
      .delete()
      .like('uid', `${TEST_UID_PREFIX}%`)
      .lt('created_at', fiveMinutesAgo)
  } catch (cleanupErr) {
    console.warn('[auto-verify-test] Pre-run cleanup failed (non-fatal):', cleanupErr)
  }

  let insertedLeadId: string | null = null

  try {
    // STEP 1 — Insert a temporary test lead so verifyRows has something
    // concrete to match against. This mirrors the production flow where a
    // lead registers first and the PU Prime xlsx arrives later.
    const { data: insertedLead, error: insertErr } = await supabaseAdmin
      .from('leads')
      .insert({
        distributor_id: distributor.id,
        uid: testUid,
        email: 'test@systm8.local',
        name: 'TEST SETUP',
        registration_status: 'pending',
        uid_verified: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertErr || !insertedLead) {
      console.error('[auto-verify-test] Failed to insert test lead:', insertErr)
      return NextResponse.json(
        { success: false, error: 'Failed to create test lead' },
        { status: 500 }
      )
    }

    insertedLeadId = insertedLead.id

    // STEP 2 — Run the shared verifier against a synthetic xlsx row whose
    // userId matches the test lead's uid. This runs the identical code
    // path as production inbound PU Prime mail.
    const fakeRows: ExcelRow[] = [
      {
        userId: testUid,
        userName: 'TEST SETUP',
        accountNumber: '',
        openingTime: new Date().toISOString(),
      },
    ]

    const { verified, results } = await verifyRows(
      fakeRows,
      { supabaseAdmin, resend, distributor },
      { isTest: true, logPrefix: '[auto-verify-test]' }
    )

    // STEP 3 — Assert exactly 1 verified row.
    if (verified !== 1) {
      console.error('[auto-verify-test] Expected 1 verified row, got', verified, 'results:', results)
      return NextResponse.json(
        { success: false, error: 'Test row did not verify', results },
        { status: 500 }
      )
    }

    console.info(`[AutoVerify] Test setup OK for distributor ${slug}`)

    return NextResponse.json({
      success: true,
      testLeadId: insertedLeadId,
      testUid,
    })
  } catch (err) {
    console.error('[auto-verify-test] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  } finally {
    // STEP 4 — Guaranteed inline cleanup: delete every lead this run
    // touched. Guarded by TEST_ prefix + this-distributor scope so we can
    // never delete a real lead.
    try {
      await supabaseAdmin
        .from('leads')
        .delete()
        .eq('distributor_id', distributor.id)
        .like('uid', thisRunUidPattern)
    } catch (cleanupErr) {
      console.error('[auto-verify-test] Final cleanup failed:', cleanupErr)
    }
  }
}
