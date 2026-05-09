import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectLeadLanguage, parseAcceptLanguage } from './language'

test('parseAcceptLanguage: picks the first supported tag', () => {
  assert.equal(parseAcceptLanguage('no-NO,no;q=0.9,en;q=0.8'), 'no')
  assert.equal(parseAcceptLanguage('en-US,en;q=0.9'), 'en')
  assert.equal(parseAcceptLanguage('es-ES,es;q=0.9'), 'es')
})

test('parseAcceptLanguage: skips unsupported languages', () => {
  // Klingon comes first, English wins
  assert.equal(parseAcceptLanguage('tlh,en;q=0.5'), 'en')
})

test('parseAcceptLanguage: returns null on empty / unsupported header', () => {
  assert.equal(parseAcceptLanguage(null), null)
  assert.equal(parseAcceptLanguage(''), null)
  assert.equal(parseAcceptLanguage('tlh,kli'), null)
})

test('detectLeadLanguage: browser_locale wins when supported', () => {
  assert.equal(detectLeadLanguage('no-NO', 'US'), 'no')
  assert.equal(detectLeadLanguage('es', null), 'es')
})

test('detectLeadLanguage: falls back to ipCountry when browser_locale is null', () => {
  assert.equal(detectLeadLanguage(null, 'NO'), 'no')
  assert.equal(detectLeadLanguage(null, 'BR'), 'pt')
  assert.equal(detectLeadLanguage(null, 'AR'), 'es')
})

test('detectLeadLanguage: unknown country falls back to en', () => {
  assert.equal(detectLeadLanguage(null, 'ZZ'), 'en')
})

test('detectLeadLanguage: unknown browser_locale defers to ipCountry', () => {
  assert.equal(detectLeadLanguage('tlh-Latn', 'NO'), 'no')
})

test('detectLeadLanguage: defaults to en when nothing matches', () => {
  assert.equal(detectLeadLanguage(null, null), 'en')
  assert.equal(detectLeadLanguage('', ''), 'en')
})

test('detectLeadLanguage: ipCountry is case-insensitive', () => {
  assert.equal(detectLeadLanguage(null, 'no'), 'no')
  assert.equal(detectLeadLanguage(null, 'No'), 'no')
})
