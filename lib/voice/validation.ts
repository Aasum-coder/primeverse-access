import { z } from 'zod'
import { TONE_OPTIONS } from './types'

// Per-field validators for the PATCH /api/voice/update endpoint. The shape
// mirrors the table CHECK / array constraints from PR A's migration plus the
// explicit limits in the PR B spec.

export const ToneEnum = z.enum(TONE_OPTIONS)

export const fieldSchemas = {
  identity_one_liner: z.string().min(20).max(180),
  audience: z.string().min(30).max(300),
  topics: z.array(z.string().min(2).max(50)).max(7),
  tone: z.array(ToneEnum).max(3),
  formality: z.enum(['formal', 'casual', 'mixed']),
  emoji_usage: z.enum(['none', 'light', 'heavy']),
  dos: z.array(z.string().min(5).max(200)).max(10),
  donts: z.array(z.string().min(5).max(200)).max(10),
  signature_phrases: z.array(z.string().min(5).max(100)).max(5),
  visual_preferences: z.record(z.string(), z.unknown()),
} as const

export type UpdatableField = keyof typeof fieldSchemas

export const updateRequestSchema = z.object({
  field: z.enum(Object.keys(fieldSchemas) as [UpdatableField, ...UpdatableField[]]),
  value: z.unknown(),
})

// AI-suggest validator — body must include step + free-form context.
export const aiSuggestRequestSchema = z.object({
  step: z.enum(['topics', 'audience', 'tone', 'dos', 'donts', 'signature_phrases']),
  context: z.string().min(1).max(2000),
  currentValues: z.array(z.unknown()).optional(),
})

export type AiSuggestRequest = z.infer<typeof aiSuggestRequestSchema>
