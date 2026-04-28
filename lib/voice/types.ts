// Shared types for the My Voice V1 API. Mirrors the voice_profiles table
// shape created in PR A (supabase/migrations/20260419000000_create_voice_profiles.sql).

export type Formality = 'formal' | 'casual' | 'mixed'
export type EmojiUsage = 'none' | 'light' | 'heavy'

export const TONE_OPTIONS = [
  'educational',
  'motivational',
  'technical',
  'casual',
  'bold',
  'empathetic',
  'direct',
  'story-driven',
] as const
export type Tone = (typeof TONE_OPTIONS)[number]

export const TARGET_BIO_LANGS = ['no', 'sv', 'es', 'ar', 'ru', 'tl', 'br', 'th'] as const
export type TargetLang = (typeof TARGET_BIO_LANGS)[number]

export interface VoiceProfile {
  id: string
  user_id: string

  identity_one_liner: string | null
  audience: string | null
  topics: string[]
  tone: string[]
  formality: Formality | null
  emoji_usage: EmojiUsage | null
  dos: string[]
  donts: string[]
  signature_phrases: string[]

  visual_preferences: Record<string, unknown>

  generated_bio_en: string | null
  generated_bio_translations: Record<string, string>
  generated_system_prompt: string | null

  is_complete: boolean
  last_regenerated_at: string | null
  created_at: string
  updated_at: string
}

export type StepKey =
  | 'identity'
  | 'audience'
  | 'topics'
  | 'tone'
  | 'language'
  | 'dos_donts'
  | 'signature'
  | 'visual'

export interface CompletionStatus {
  completed: number
  total: 8
  nextStep: StepKey | null
  isComplete: boolean
}

// API envelope per spec: { data, error: null } on success, { data: null, error } on failure.
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string; details?: unknown } }
