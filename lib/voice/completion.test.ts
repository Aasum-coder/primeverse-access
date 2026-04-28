// Run with: npx tsx --test lib/voice/completion.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeCompletionStatus, regenerateMissingSteps } from './completion'

test('empty profile → 2/8 (signature + visual are always complete), nextStep=identity', () => {
  const s = computeCompletionStatus({})
  assert.equal(s.completed, 2)
  assert.equal(s.total, 8)
  assert.equal(s.nextStep, 'identity')
  assert.equal(s.isComplete, false)
})

test('identity too short does not count', () => {
  const s = computeCompletionStatus({ identity_one_liner: 'short' })
  assert.equal(s.nextStep, 'identity')
  assert.equal(s.completed, 2)
})

test('identity at 20 chars counts; nextStep advances', () => {
  const s = computeCompletionStatus({ identity_one_liner: 'a'.repeat(20) })
  assert.equal(s.nextStep, 'audience')
  assert.equal(s.completed, 3)
})

test('all 6 user-input steps complete → 8/8 + isComplete=true', () => {
  const profile = {
    identity_one_liner: 'I am a trader who teaches risk-first crypto strategies.',
    audience: 'Mid-career professionals in the Nordics who want side income from trading.',
    topics: ['crypto trading', 'risk management', 'macro analysis'],
    tone: ['educational', 'direct'] as string[],
    formality: 'casual' as const,
    emoji_usage: 'light' as const,
    dos: ['Show real losses', 'Cite sources'],
    donts: ['Hype gains', 'Promise returns'],
  }
  const s = computeCompletionStatus(profile)
  assert.equal(s.completed, 8)
  assert.equal(s.nextStep, null)
  assert.equal(s.isComplete, true)
})

test('regenerateMissingSteps returns ordered missing steps (1-6 only)', () => {
  const missing = regenerateMissingSteps({})
  assert.deepEqual(missing, ['identity', 'audience', 'topics', 'tone', 'language', 'dos_donts'])
})

test('regenerateMissingSteps ignores signature/visual', () => {
  const missing = regenerateMissingSteps({
    identity_one_liner: 'a'.repeat(25),
    audience: 'b'.repeat(40),
    topics: ['t1', 't2', 't3'],
    tone: ['casual'],
    formality: 'casual',
    emoji_usage: 'none',
    dos: ['x', 'y'],
    donts: ['x', 'y'],
    // signature_phrases + visual_preferences omitted on purpose
  })
  assert.deepEqual(missing, [])
})

test('topics needs 3, tone needs 1, dos+donts each need 2', () => {
  const just = computeCompletionStatus({
    identity_one_liner: 'a'.repeat(25),
    audience: 'b'.repeat(40),
    topics: ['t1', 't2'], // only 2
    tone: [],
    formality: 'casual',
    emoji_usage: 'light',
    dos: ['only one'],
    donts: ['only one'],
  })
  // identity ✓, audience ✓, topics ✗ (only 2), tone ✗ (none), language ✓,
  // dos_donts ✗, signature ✓, visual ✓ → 5 complete
  assert.equal(just.completed, 5)
  assert.equal(just.nextStep, 'topics')
})
