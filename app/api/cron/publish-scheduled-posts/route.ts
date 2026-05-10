import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { publishToFacebook, publishToInstagram, type PublishResult } from '@/lib/social/publishers'

// Vercel cron entrypoint. Picks scheduled_posts rows that have come due,
// CAS-locks each row to status='publishing' so a stuck or duplicated cron
// can't double-post, calls the platform publisher, and writes a terminal
// status back. Runs every 5 minutes per vercel.json.
//
// Auth: Bearer ${CRON_SECRET} (matches every other cron in this repo).
// Per-run cap of MAX_PER_RUN rows so a backlog can't blow the timeout.
//
// Failure modes:
//   • No social_connections row OR is_connected=false  → status='failed'
//     ('Account not connected'). IB has to re-OAuth.
//   • Graph API returns an error                        → status='failed'
//     with the Graph error in error_message (and code if numeric).
//   • Network throw                                     → status='failed'
//     too — we don't retry the same row automatically. The IB can edit
//     and re-schedule; the row transitions back through draft→scheduled.
//   • Unknown platform on the row                       → status='failed'
//     ('Unsupported platform: <name>'). Phase 1 publishes only FB + IG.
//   • Instagram row missing image_url                   → status='failed'
//     ('Instagram requires an image'). IG Graph rejects text-only posts.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const MAX_PER_RUN = 50

interface ScheduledPostRow {
  id: string
  distributor_id: string
  platform: string
  content: string
  image_url: string | null
  scheduled_for: string
  status: string
}

interface ConnectionRow {
  access_token: string | null
  platform_user_id: string
  is_connected: boolean
}

function shortId(id: string | null | undefined): string {
  if (!id) return '<none>'
  return id.length > 20 ? id.slice(0, 12) : id
}

async function loadConnection(distributorId: string, platform: string): Promise<ConnectionRow | null> {
  const { data } = await supabaseAdmin
    .from('social_connections')
    .select('access_token, platform_user_id, is_connected')
    .eq('distributor_id', distributorId)
    .eq('platform', platform)
    .maybeSingle()
  return data as ConnectionRow | null
}

async function tryClaim(rowId: string): Promise<boolean> {
  // CAS lock: only flip to 'publishing' if the row is still 'scheduled'.
  // Without this, two overlapping cron runs (e.g. delayed retry on top of
  // a cold one) could both see the same row and double-post.
  const { data, error } = await supabaseAdmin
    .from('scheduled_posts')
    .update({ status: 'publishing', updated_at: new Date().toISOString() })
    .eq('id', rowId)
    .eq('status', 'scheduled')
    .select('id')
  if (error || !data || data.length === 0) return false
  return true
}

async function recordSuccess(rowId: string, postId: string): Promise<void> {
  const nowIso = new Date().toISOString()
  await supabaseAdmin
    .from('scheduled_posts')
    .update({
      status: 'posted',
      post_id: postId,
      posted_at: nowIso,
      error_message: null,
      updated_at: nowIso,
    })
    .eq('id', rowId)
}

async function recordFailure(rowId: string, message: string): Promise<void> {
  const nowIso = new Date().toISOString()
  await supabaseAdmin
    .from('scheduled_posts')
    .update({
      status: 'failed',
      error_message: message.slice(0, 500),
      updated_at: nowIso,
    })
    .eq('id', rowId)
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const nowIso = new Date().toISOString()

  // 1. Pick due rows (newest scheduled time first to drain the queue
  //    deterministically; oldest-first would be equally valid).
  const { data: due, error: selectErr } = await supabaseAdmin
    .from('scheduled_posts')
    .select('id, distributor_id, platform, content, image_url, scheduled_for, status')
    .eq('status', 'scheduled')
    .lte('scheduled_for', nowIso)
    .order('scheduled_for', { ascending: true })
    .limit(MAX_PER_RUN)

  if (selectErr) {
    console.error(`[scheduled-publisher] select failed: ${selectErr.message}`)
    return NextResponse.json({ error: selectErr.message }, { status: 500 })
  }

  const rows = (due || []) as ScheduledPostRow[]
  console.info(`[scheduled-publisher] tick due=${rows.length}`)

  let posted = 0
  let failed = 0
  let skipped = 0

  for (const row of rows) {
    const claimed = await tryClaim(row.id)
    if (!claimed) {
      skipped++
      continue
    }

    const platform = row.platform
    if (platform !== 'facebook' && platform !== 'instagram') {
      await recordFailure(row.id, `Unsupported platform: ${platform}`)
      failed++
      console.warn(`[scheduled-publisher] row=${shortId(row.id)} unsupported_platform=${platform}`)
      continue
    }

    const conn = await loadConnection(row.distributor_id, platform)
    if (!conn || !conn.is_connected || !conn.access_token) {
      await recordFailure(row.id, `Account not connected: ${platform}`)
      failed++
      console.warn(`[scheduled-publisher] row=${shortId(row.id)} platform=${platform} not_connected`)
      continue
    }

    let result: PublishResult
    try {
      if (platform === 'facebook') {
        result = await publishToFacebook({
          pageId: conn.platform_user_id,
          accessToken: conn.access_token,
          message: row.content,
          imageUrl: row.image_url,
        })
      } else {
        if (!row.image_url) {
          await recordFailure(row.id, 'Instagram requires an image')
          failed++
          console.warn(`[scheduled-publisher] row=${shortId(row.id)} platform=instagram missing_image`)
          continue
        }
        result = await publishToInstagram({
          igUserId: conn.platform_user_id,
          accessToken: conn.access_token,
          message: row.content,
          imageUrl: row.image_url,
        })
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown'
      await recordFailure(row.id, reason)
      failed++
      console.error(`[scheduled-publisher] row=${shortId(row.id)} platform=${platform} threw: ${reason}`)
      continue
    }

    if (result.ok) {
      await recordSuccess(row.id, result.postId)
      posted++
      console.info(`[scheduled-publisher] row=${shortId(row.id)} platform=${platform} posted post_id=${shortId(result.postId)}`)
    } else {
      const codeSuffix = result.code ? ` (code ${result.code})` : ''
      await recordFailure(row.id, result.error + codeSuffix)
      failed++
      console.warn(`[scheduled-publisher] row=${shortId(row.id)} platform=${platform} failed: ${result.error}${codeSuffix}`)
    }
  }

  const durationMs = Date.now() - startedAt
  console.info(`[scheduled-publisher] done due=${rows.length} posted=${posted} failed=${failed} skipped=${skipped} durationMs=${durationMs}`)

  return NextResponse.json({
    due: rows.length,
    posted,
    failed,
    skipped,
    duration_ms: durationMs,
  })
}
