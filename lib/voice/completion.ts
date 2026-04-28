import type { CompletionStatus, StepKey, VoiceProfile } from './types'

// Step gates per spec — first incomplete step in this order is `nextStep`.
// Steps 7 (signature) and 8 (visual) are optional and always count as complete.
const STEP_ORDER: StepKey[] = [
  'identity',
  'audience',
  'topics',
  'tone',
  'language',
  'dos_donts',
  'signature',
  'visual',
]

function isStepComplete(step: StepKey, p: Partial<VoiceProfile>): boolean {
  switch (step) {
    case 'identity':
      return (p.identity_one_liner?.trim().length ?? 0) >= 20
    case 'audience':
      return (p.audience?.trim().length ?? 0) >= 30
    case 'topics':
      return (p.topics?.length ?? 0) >= 3
    case 'tone':
      return (p.tone?.length ?? 0) >= 1
    case 'language':
      return Boolean(p.formality) && Boolean(p.emoji_usage)
    case 'dos_donts':
      return (p.dos?.length ?? 0) >= 2 && (p.donts?.length ?? 0) >= 2
    case 'signature':
      return true
    case 'visual':
      return true
  }
}

export function computeCompletionStatus(profile: Partial<VoiceProfile>): CompletionStatus {
  let completed = 0
  let nextStep: StepKey | null = null
  for (const step of STEP_ORDER) {
    if (isStepComplete(step, profile)) {
      completed++
    } else if (nextStep === null) {
      nextStep = step
    }
  }
  return {
    completed,
    total: 8,
    nextStep,
    isComplete: completed === 8,
  }
}

// Steps 1-6 are required for /regenerate (signature + visual are optional).
export function regenerateMissingSteps(profile: Partial<VoiceProfile>): StepKey[] {
  const required: StepKey[] = ['identity', 'audience', 'topics', 'tone', 'language', 'dos_donts']
  return required.filter(s => !isStepComplete(s, profile))
}
