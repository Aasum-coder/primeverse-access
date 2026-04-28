import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import {
  errorResponse,
  getUserIdFromRequest,
  successResponse,
  supabaseAdmin,
  unauthorizedResponse,
} from '@/lib/voice/auth'
import { computeCompletionStatus } from '@/lib/voice/completion'
import { fieldSchemas, updateRequestSchema, type UpdatableField } from '@/lib/voice/validation'
import type { VoiceProfile } from '@/lib/voice/types'

// PATCH /api/voice/update — auto-save individual fields from the wizard.
// The DB trigger from PR A clears generated_* outputs whenever any of the
// 9 user-input fields change, so callers don't need to manage cache state.

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return unauthorizedResponse()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('validation_failed', 'Body must be JSON', 400)
  }

  let parsedEnvelope: { field: UpdatableField; value: unknown }
  try {
    parsedEnvelope = updateRequestSchema.parse(body) as { field: UpdatableField; value: unknown }
  } catch (err) {
    const details = err instanceof ZodError ? err.issues : undefined
    return errorResponse('validation_failed', 'Invalid request shape', 400, details)
  }

  const { field, value } = parsedEnvelope
  const schema = fieldSchemas[field]

  let parsedValue: unknown
  try {
    parsedValue = schema.parse(value)
  } catch (err) {
    const details = err instanceof ZodError ? err.issues : undefined
    return errorResponse('validation_failed', `Invalid value for ${field}`, 400, details)
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('voice_profiles')
    .update({ [field]: parsedValue })
    .eq('user_id', userId)
    .select('*')
    .maybeSingle()

  if (updateErr) {
    console.error(`[voice/update] update failed for user ${userId} field ${field}:`, updateErr)
    return errorResponse('db_error', 'Failed to save field', 500)
  }
  if (!updated) {
    return errorResponse('not_found', 'Voice profile not found — call /api/voice/get first', 404)
  }

  const profile = updated as VoiceProfile
  const status = computeCompletionStatus(profile)

  if (status.isComplete !== profile.is_complete) {
    await supabaseAdmin
      .from('voice_profiles')
      .update({ is_complete: status.isComplete })
      .eq('user_id', userId)
  }

  return successResponse({ success: true, completionStatus: status })
}
