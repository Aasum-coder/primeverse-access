import type { NextRequest } from 'next/server'
import {
  errorResponse,
  getUserIdFromRequest,
  successResponse,
  supabaseAdmin,
  unauthorizedResponse,
} from '@/lib/voice/auth'
import { computeCompletionStatus } from '@/lib/voice/completion'
import type { VoiceProfile } from '@/lib/voice/types'

// GET /api/voice/get
// Auto-creates an empty profile if none exists. RLS isn't relied on here —
// we use service-role so the auto-create works even before the IB has any
// row, then scope every read/write by the authenticated user_id.

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return unauthorizedResponse()

  const { data: existing, error: selectErr } = await supabaseAdmin
    .from('voice_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (selectErr) {
    console.error('[voice/get] select failed for user', userId, selectErr)
    return errorResponse('db_error', 'Failed to load voice profile', 500)
  }

  let profile = existing as VoiceProfile | null

  if (!profile) {
    const { data: created, error: insertErr } = await supabaseAdmin
      .from('voice_profiles')
      .insert({ user_id: userId })
      .select('*')
      .single()

    if (insertErr || !created) {
      console.error('[voice/get] insert failed for user', userId, insertErr)
      return errorResponse('db_error', 'Failed to create voice profile', 500)
    }
    profile = created as VoiceProfile
  }

  const status = computeCompletionStatus(profile)

  // Persist the is_complete flip when the cached value disagrees with the
  // computed status. This keeps the DB column in sync with the user-input
  // gates without forcing an extra round trip from the client.
  if (status.isComplete !== profile.is_complete) {
    await supabaseAdmin
      .from('voice_profiles')
      .update({ is_complete: status.isComplete })
      .eq('user_id', userId)
    profile.is_complete = status.isComplete
  }

  return successResponse({ profile, completionStatus: status })
}
