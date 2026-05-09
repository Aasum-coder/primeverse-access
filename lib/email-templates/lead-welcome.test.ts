import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLeadWelcomeEmail } from './lead-welcome'

const baseProps = {
  leadName: 'Anette Solberg',
  ibName: 'Richard Aasum',
  ibEmail: 'richard@example.com',
  puPrimeAffiliateUrl: 'https://pu.example.com/?ref=123',
  uidVerifyUrl: 'https://www.primeverseaccess.com/verify-uid?token=abc123',
  existingClientUrl: 'https://www.primeverseaccess.com/api/leads/existing-client?token=abc123',
  lang: 'en',
}

test('renders English subject + html with both CTAs', () => {
  const { subject, html } = buildLeadWelcomeEmail(baseProps)
  assert.match(subject, /Welcome Anette/)
  assert.ok(html.includes('Register on PU Prime'))
  assert.ok(html.includes('Enter my UID'))
  assert.ok(html.includes('Already a PU Prime client?'))
})

test('renders Norwegian subject + new copy', () => {
  const { subject, html } = buildLeadWelcomeEmail({ ...baseProps, lang: 'no' })
  assert.match(subject, /Velkommen Anette/)
  assert.ok(html.includes('Registrer deg hos PU Prime'))
  assert.ok(html.includes('Legg inn UID'))
  assert.ok(html.includes('Allerede PU Prime-kunde'))
})

test('renders Spanish subject + new copy', () => {
  const { subject, html } = buildLeadWelcomeEmail({ ...baseProps, lang: 'es' })
  assert.match(subject, /Bienvenido Anette/)
  assert.ok(html.includes('Registrarme en PU Prime'))
  assert.ok(html.includes('Introducir mi UID'))
  assert.ok(html.includes('cliente de PU Prime'))
})

test('falls back to English copy when language is unsupported', () => {
  const { subject, html } = buildLeadWelcomeEmail({ ...baseProps, lang: 'sv' })
  // Phase A: sv falls back to en for the new shape (existing translations
  // were tied to the old 3-step layout).
  assert.match(subject, /Welcome Anette/)
  assert.ok(html.includes('Register on PU Prime'))
})

test('embeds the affiliate URL on the primary CTA', () => {
  const { html } = buildLeadWelcomeEmail(baseProps)
  assert.ok(html.includes('href="https://pu.example.com/?ref=123"'))
})

test('embeds the verify-uid URL on the secondary CTA', () => {
  const { html } = buildLeadWelcomeEmail(baseProps)
  assert.ok(html.includes('href="https://www.primeverseaccess.com/verify-uid?token=abc123"'))
})

test('embeds the existing-client URL on the footer link', () => {
  const { html } = buildLeadWelcomeEmail(baseProps)
  assert.ok(html.includes('href="https://www.primeverseaccess.com/api/leads/existing-client?token=abc123"'))
})

test('omits Step 2 (UID) when uidVerifyUrl is missing — manual-add path', () => {
  const { html } = buildLeadWelcomeEmail({ ...baseProps, uidVerifyUrl: undefined })
  assert.ok(html.includes('Register on PU Prime'))
  assert.ok(!html.includes('Enter my UID'))
  assert.ok(!html.includes('STEP 2'))
})

test('omits the existing-client block when existingClientUrl is missing', () => {
  const { html } = buildLeadWelcomeEmail({ ...baseProps, existingClientUrl: undefined })
  assert.ok(!html.includes('Already a PU Prime client?'))
})

test('falls back to a sensible affiliate URL when none provided', () => {
  const { html } = buildLeadWelcomeEmail({
    leadName: 'Test',
    ibName: 'IB',
    lang: 'en',
  })
  // Default affiliate present (primary CTA still renders)
  assert.ok(html.includes('Register on PU Prime'))
  assert.ok(html.includes('puvip.co'))
})

test('back-compat: older callers passing distributorName + referralLink still work', () => {
  const { subject, html } = buildLeadWelcomeEmail({
    leadName: 'Test',
    distributorName: 'Legacy IB',
    referralLink: 'https://legacy.example.com',
    lang: 'en',
  })
  assert.match(subject, /Welcome Test/)
  assert.ok(html.includes('Legacy IB'))
  assert.ok(html.includes('href="https://legacy.example.com"'))
})

test('escapes html in the lead name to avoid template injection', () => {
  const { html } = buildLeadWelcomeEmail({
    ...baseProps,
    leadName: '<script>alert(1)</script>',
  })
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(html.includes('&lt;script&gt;'))
})

test('escapes html in URLs to avoid attribute injection', () => {
  const { html } = buildLeadWelcomeEmail({
    ...baseProps,
    uidVerifyUrl: 'javascript:alert(1)" data-foo="',
  })
  assert.ok(!html.includes('data-foo=""'), 'attribute injection must not be possible')
})

test('returns a non-empty html string regardless of language', () => {
  for (const lang of ['en', 'no', 'sv', 'es', 'ru', 'ar', 'tl', 'pt', 'th']) {
    const { html, subject } = buildLeadWelcomeEmail({ ...baseProps, lang })
    assert.ok(html.length > 200, `lang ${lang} produced suspiciously short html`)
    assert.ok(subject.length > 5, `lang ${lang} subject too short`)
  }
})
