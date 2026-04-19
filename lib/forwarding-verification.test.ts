// Minimal unit tests for forwarding-verification parsing.
// Run with: node --import tsx lib/forwarding-verification.test.ts
// (uses node:test — no external test runner required)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  detectLanguage,
  detectProvider,
  extractCode,
  extractLink,
} from './forwarding-verification'

const NORDIC_LINK =
  'https://mail-settings.google.com/mail/vf-%5BANGjdJ_exampleTokenWith-Chars%5D-abc123'

test('English Gmail: 9-digit code extracted', () => {
  const from = 'forwarding-noreply@google.com'
  const subject = 'Gmail Forwarding Confirmation - Receive Mail from ...'
  const text =
    'Please confirm by entering the confirmation code 123456789 on the forwarding settings page.'
  const html = `<p>${text}</p>`

  assert.equal(detectProvider(from, subject), 'gmail')
  assert.equal(extractCode(html, text, 'gmail'), '123456789')
  assert.equal(detectLanguage(html, text, subject), 'en')
})

test('Norwegian Gmail: link extracted, no code, language=no', () => {
  const from = 'forwarding-noreply@google.com'
  const subject = 'Bekreftelse av Gmail-videresending'
  const text = `For å bekrefte videresending, klikk på lenken: ${NORDIC_LINK}`
  const html = `<a href="${NORDIC_LINK}">Bekreft videresending</a>`

  assert.equal(detectProvider(from, subject), 'gmail')
  assert.equal(extractCode(html, text, 'gmail'), null)
  assert.equal(extractLink(html, text, 'gmail'), NORDIC_LINK)
  assert.equal(detectLanguage(html, text, subject), 'no')
})

test('Swedish Gmail: link extracted, no code, language=sv', () => {
  const from = 'forwarding-noreply@google.com'
  const subject = 'Bekräftelse av Gmail-vidarebefordran'
  const text = `Klicka för att bekräfta vidarebefordran: ${NORDIC_LINK}`
  const html = `<a href="${NORDIC_LINK}">Bekräfta vidarebefordran</a>`

  assert.equal(detectProvider(from, subject), 'gmail')
  assert.equal(extractCode(html, text, 'gmail'), null)
  assert.equal(extractLink(html, text, 'gmail'), NORDIC_LINK)
  assert.equal(detectLanguage(html, text, subject), 'sv')
})
