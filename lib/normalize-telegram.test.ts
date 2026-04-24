// Run with: npx tsx --test lib/normalize-telegram.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTelegramHandle, telegramHandleForDisplay } from './normalize-telegram'

test('accepts @handle with preserved casing', () => {
  assert.equal(normalizeTelegramHandle('@CEO_1Move'), 'https://t.me/CEO_1Move')
})

test('accepts bare handle', () => {
  assert.equal(normalizeTelegramHandle('bitaasum'), 'https://t.me/bitaasum')
})

test('accepts t.me/handle without protocol', () => {
  assert.equal(normalizeTelegramHandle('t.me/CEO_1Move'), 'https://t.me/CEO_1Move')
})

test('accepts full https URL', () => {
  assert.equal(normalizeTelegramHandle('https://t.me/CEO_1Move'), 'https://t.me/CEO_1Move')
})

test('accepts https with @ in path', () => {
  assert.equal(normalizeTelegramHandle('https://t.me/@CEO_1Move'), 'https://t.me/CEO_1Move')
})

test('accepts legacy telegram.me domain', () => {
  assert.equal(normalizeTelegramHandle('https://telegram.me/CEO_1Move'), 'https://t.me/CEO_1Move')
})

test('strips trailing slash', () => {
  assert.equal(normalizeTelegramHandle('https://t.me/CEO_1Move/'), 'https://t.me/CEO_1Move')
})

test('strips query params', () => {
  assert.equal(normalizeTelegramHandle('https://t.me/CEO_1Move?start=abc'), 'https://t.me/CEO_1Move')
})

test('preserves mixed casing exactly', () => {
  assert.equal(normalizeTelegramHandle('@Anette_Trading'), 'https://t.me/Anette_Trading')
  assert.equal(normalizeTelegramHandle('BitAasum'), 'https://t.me/BitAasum')
})

test('rejects too short', () => {
  assert.equal(normalizeTelegramHandle('@abc'), null)
})

test('rejects numeric-only (no letter start)', () => {
  assert.equal(normalizeTelegramHandle('@12345'), null)
})

test('rejects special chars', () => {
  assert.equal(normalizeTelegramHandle('@user-name'), null)
  assert.equal(normalizeTelegramHandle('@user.name'), null)
  assert.equal(normalizeTelegramHandle('@user!name'), null)
})

test('rejects invite link', () => {
  assert.equal(normalizeTelegramHandle('https://t.me/+8iNaN3wJdQwzMDU0'), null)
  assert.equal(normalizeTelegramHandle('https://t.me/joinchat/xyz'), null)
})

test('rejects empty and whitespace', () => {
  assert.equal(normalizeTelegramHandle(''), null)
  assert.equal(normalizeTelegramHandle('   '), null)
})

test('rejects just @', () => {
  assert.equal(normalizeTelegramHandle('@'), null)
})

test('display extracts @handle with casing preserved', () => {
  assert.equal(telegramHandleForDisplay('https://t.me/CEO_1Move'), '@CEO_1Move')
  assert.equal(telegramHandleForDisplay('https://t.me/bitaasum'), '@bitaasum')
})

test('display returns empty for null', () => {
  assert.equal(telegramHandleForDisplay(null), '')
  assert.equal(telegramHandleForDisplay(''), '')
})

test('display returns non-canonical value unchanged', () => {
  assert.equal(
    telegramHandleForDisplay('https://t.me/+8iNaN3wJdQwzMDU0'),
    'https://t.me/+8iNaN3wJdQwzMDU0'
  )
})
