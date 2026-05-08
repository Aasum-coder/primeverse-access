import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildForwardingVerificationForwardEmail } from './forwarding-verification-forward'

const baseArgs = {
  provider: 'gmail' as const,
  language: 'en' as const,
  link: 'https://mail-settings.google.com/mail/vf-abc123',
  code: '123456789',
  originalHtml: '<p>Original verification body from Google.</p>',
  originalText: 'Original verification body from Google.',
}

test('returns subject and html for English', () => {
  const { html, subject } = buildForwardingVerificationForwardEmail(baseArgs)
  assert.match(subject, /confirm forwarding/i)
  assert.match(html, /Confirm forwarding setup/i)
  assert.match(html, /CONFIRM FORWARDING/)
})

test('returns Norwegian subject and copy when language=no', () => {
  const { html, subject } = buildForwardingVerificationForwardEmail({ ...baseArgs, language: 'no' })
  assert.match(subject, /Bekreft videresending/)
  assert.match(html, /BEKREFT VIDERESENDING/)
})

test('returns Swedish subject and copy when language=sv', () => {
  const { html, subject } = buildForwardingVerificationForwardEmail({ ...baseArgs, language: 'sv' })
  assert.match(subject, /Bekräfta vidarebefordran/)
  assert.match(html, /BEKRÄFTA VIDAREBEFORDRAN/)
})

test('falls back to English for unknown language', () => {
  const { subject } = buildForwardingVerificationForwardEmail({ ...baseArgs, language: 'unknown' })
  assert.match(subject, /confirm forwarding/i)
})

test('renders the verification link as a clickable CTA', () => {
  const { html } = buildForwardingVerificationForwardEmail(baseArgs)
  assert.ok(html.includes('href="https://mail-settings.google.com/mail/vf-abc123"'))
})

test('shows a warning block when no link was extracted', () => {
  const { html } = buildForwardingVerificationForwardEmail({ ...baseArgs, link: null })
  assert.match(html, /no clickable link was detected/i)
  assert.ok(!html.includes('CONFIRM FORWARDING'))
})

test('includes the verification code when provided', () => {
  const { html } = buildForwardingVerificationForwardEmail(baseArgs)
  assert.ok(html.includes('123456789'))
})

test('omits the code section when code is null', () => {
  const { html } = buildForwardingVerificationForwardEmail({ ...baseArgs, code: null })
  assert.ok(!html.includes('123456789'))
})

test('humanises the provider name in the intro', () => {
  const { html } = buildForwardingVerificationForwardEmail({ ...baseArgs, provider: 'outlook' })
  assert.ok(html.includes('Outlook'))
})

test('embeds the original html body inside the wrapper', () => {
  const { html } = buildForwardingVerificationForwardEmail(baseArgs)
  assert.ok(html.includes('<p>Original verification body from Google.</p>'))
})

test('falls back to text body when original html is empty', () => {
  const { html } = buildForwardingVerificationForwardEmail({
    ...baseArgs,
    originalHtml: '',
    originalText: 'Plain text fallback content.',
  })
  assert.ok(html.includes('Plain text fallback content.'))
})

test('escapes html entities in fallback text body', () => {
  const { html } = buildForwardingVerificationForwardEmail({
    ...baseArgs,
    originalHtml: '',
    originalText: '<script>alert(1)</script>',
  })
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
})

test('handles unknown provider gracefully', () => {
  const { html } = buildForwardingVerificationForwardEmail({ ...baseArgs, provider: 'unknown' })
  // Still renders without crashing; provider label uses the fallback string
  assert.ok(html.length > 0)
})
