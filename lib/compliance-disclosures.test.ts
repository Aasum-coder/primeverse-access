// Run with: npx tsx --test lib/compliance-disclosures.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  shouldShowDisclosures,
  getDisclosures,
  applyDisclosures,
  hasExistingTopDisclosure,
  hasExistingBottomDisclosure,
  DISCLOSURES,
} from './compliance-disclosures'

// — keyword detection per language —————————————————————————————

test('English trading keyword triggers', () => {
  const r = shouldShowDisclosures('Just started trading forex this week!', 'en')
  assert.equal(r.triggered, true)
  assert.ok(r.matchedKeywords.includes('trading'))
  assert.equal(r.language, 'en')
})

test('Norwegian trading keyword triggers', () => {
  const r = shouldShowDisclosures('Aksjer på Oslo børs i dag', 'no')
  assert.equal(r.triggered, true)
  assert.ok(r.matchedKeywords.length > 0)
})

test('Swedish trading keyword triggers', () => {
  const r = shouldShowDisclosures('Aktier på börsen', 'sv')
  assert.equal(r.triggered, true)
})

test('Spanish trading keyword triggers', () => {
  const r = shouldShowDisclosures('Mi inversión en acciones este año', 'es')
  assert.equal(r.triggered, true)
})

test('Russian (substring) trading keyword triggers', () => {
  const r = shouldShowDisclosures('Сегодня хороший день для трейдинг', 'ru')
  assert.equal(r.triggered, true)
})

test('Thai (substring) trading keyword triggers', () => {
  const r = shouldShowDisclosures('วันนี้เริ่มเทรดแล้ว', 'th')
  assert.equal(r.triggered, true)
})

// — brand keywords always trigger —————————————————————————————

test('PU Prime always triggers regardless of post topic', () => {
  const r = shouldShowDisclosures('Loving my morning coffee at PU Prime HQ ☕', 'en')
  assert.equal(r.triggered, true)
})

test('1Move Academy triggers as a phrase', () => {
  const r = shouldShowDisclosures('Just joined 1Move Academy and feeling great', 'en')
  assert.equal(r.triggered, true)
})

test('PrimeVerse triggers', () => {
  const r = shouldShowDisclosures('Welcome to PrimeVerse', 'en')
  assert.equal(r.triggered, true)
})

// — false positive guards ——————————————————————————————————————

test('"EUROIRA" does NOT match the ROI keyword (mid-word)', () => {
  const r = shouldShowDisclosures('I work at EUROIRA Solutions', 'en')
  assert.equal(r.triggered, false)
})

test('"investorist" matches investor (start-of-word — accepted false positive bias)', () => {
  // We deliberately match start-of-word so Nordic compounds like
  // "tradinglinje" still trigger. Documented expected behavior.
  const r = shouldShowDisclosures('Some made-up word: investorist', 'en')
  assert.equal(r.triggered, true)
})

test('Compound word "tradinglinje" still triggers (Nordic compound)', () => {
  const r = shouldShowDisclosures('Vi laget en ny tradinglinje for kunder', 'no')
  assert.equal(r.triggered, true)
})

// — empty / non-trigger content ——————————————————————————————————

test('Empty content does not trigger', () => {
  const r = shouldShowDisclosures('', 'en')
  assert.equal(r.triggered, false)
  assert.equal(r.matchedKeywords.length, 0)
})

test('Birthday post does not trigger', () => {
  const r = shouldShowDisclosures('Happy birthday team! 🎂', 'en')
  assert.equal(r.triggered, false)
})

// — already-present detection ———————————————————————————————————

test('Detects existing top disclosure (exact)', () => {
  assert.equal(hasExistingTopDisclosure('Reklame.\n\nResten av posten', 'no'), true)
})

test('Detects existing top disclosure (no period)', () => {
  assert.equal(hasExistingTopDisclosure('Reklame\n\nResten av posten', 'no'), true)
})

test('Detects existing top disclosure (different case)', () => {
  assert.equal(hasExistingTopDisclosure('REKLAME.\n\nResten', 'no'), true)
})

test('Does not falsely detect existing top disclosure', () => {
  assert.equal(hasExistingTopDisclosure('Reklamefilm starter', 'no'), false)
})

test('Detects existing bottom disclosure', () => {
  assert.equal(hasExistingBottomDisclosure('Some content\n\nTrading innebærer risiko.', 'no'), true)
  assert.equal(hasExistingBottomDisclosure('Some content\n\ntrading innebærer risiko', 'no'), true)
})

test('shouldShowDisclosures surfaces alreadyPresent flags', () => {
  const text = 'Reklame.\n\nProfitt fra crypto trading.\n\nTrading innebærer risiko.'
  const r = shouldShowDisclosures(text, 'no')
  assert.equal(r.triggered, true)
  assert.equal(r.alreadyPresent.top, true)
  assert.equal(r.alreadyPresent.bottom, true)
})

// — applyDisclosures formatting —————————————————————————————————

test('applyDisclosures wraps content with blank-line spacing', () => {
  const out = applyDisclosures('Min nye trading-strategi.', 'no')
  assert.equal(out, 'Reklame.\n\nMin nye trading-strategi.\n\nTrading innebærer risiko.')
})

test('applyDisclosures skips top when already present', () => {
  const out = applyDisclosures('Reklame.\n\nTrading idag', 'no')
  assert.ok(!out.startsWith('Reklame.\n\nReklame'))
  assert.ok(out.endsWith('Trading innebærer risiko.'))
})

test('applyDisclosures skips bottom when already present', () => {
  const out = applyDisclosures('Trading idag\n\nTrading innebærer risiko.', 'no')
  assert.ok(out.startsWith('Reklame.'))
  // Should not double-add the bottom
  const matches = out.match(/Trading innebærer risiko\./g) || []
  assert.equal(matches.length, 1)
})

test('applyDisclosures returns empty for empty content', () => {
  assert.equal(applyDisclosures('', 'no'), '')
  assert.equal(applyDisclosures('   ', 'no'), '   ')
})

test('applyDisclosures localizes per language', () => {
  assert.ok(applyDisclosures('Stocks today', 'en').startsWith('Ad.'))
  assert.ok(applyDisclosures('Stocks today', 'es').startsWith('Publicidad.'))
  assert.ok(applyDisclosures('Stocks today', 'pt').startsWith('Publicidade.'))
})

// — language fallback ——————————————————————————————————————————

test('Unsupported language falls back to en', () => {
  const r = shouldShowDisclosures('Trading today', 'klingon')
  assert.equal(r.language, 'en')
  assert.equal(getDisclosures('klingon').top, DISCLOSURES.en.top)
})

test('Empty/null language falls back to en', () => {
  assert.equal(getDisclosures(null).top, DISCLOSURES.en.top)
  assert.equal(getDisclosures('').top, DISCLOSURES.en.top)
})
