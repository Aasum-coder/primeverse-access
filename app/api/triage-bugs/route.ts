import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

interface BugReport {
  id: string
  email: string
  description: string
  severity: string
  status: string
  screenshot_url: string | null
  expected: string | null
  user_id: string | null
}

interface FailedTest {
  id: string
  tester_email: string
  tester_name: string
  section: string
  test_item: string
  comment: string | null
  screenshot_url: string | null
}

interface GroupedBug {
  title: string
  descriptions: string[]
  reporters: string[]
  severity: string
  screenshots: string[]
  steps: string[]
  section: string | null
  bugReportIds: string[]
  testResultIds: string[]
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, major: 1, minor: 2, cosmetic: 3 }

function higherSeverity(a: string, b: string): string {
  return (SEVERITY_RANK[a] ?? 99) <= (SEVERITY_RANK[b] ?? 99) ? a : b
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function isSimilar(a: string, b: string): boolean {
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  // Word overlap: if ≥60% of words match
  const wa = new Set(na.split(' '))
  const wb = new Set(nb.split(' '))
  const overlap = [...wa].filter(w => wb.has(w)).length
  const minLen = Math.min(wa.size, wb.size)
  return minLen > 0 && overlap / minLen >= 0.6
}

function guessFile(title: string, description: string, section: string | null): string {
  const combined = `${title} ${description} ${section || ''}`.toLowerCase()
  if (combined.includes('landing page') || combined.includes('slug') || combined.includes('hero') || combined.includes('social media icon')) {
    return 'app/[slug]/page.tsx'
  }
  if (combined.includes('email') || combined.includes('verification') || combined.includes('branding')) {
    return 'lib/email-templates/ or app/api/ (email-related)'
  }
  if (combined.includes('login') || combined.includes('registration') || combined.includes('sign up')) {
    return 'app/login/page.tsx or app/page.tsx'
  }
  return 'app/page.tsx'
}

function buildPrompt(bug: GroupedBug): string {
  const likelyFile = guessFile(bug.title, bug.descriptions.join(' '), bug.section)
  const lines = [
    `BUG FIX: ${bug.title}`,
    `SEVERITY: ${bug.severity}`,
    `REPORTED BY: ${bug.reporters.length} tester${bug.reporters.length !== 1 ? 's' : ''}`,
    `DESCRIPTION: ${bug.descriptions.join(' | ')}`,
  ]
  if (bug.steps.length > 0) {
    lines.push(`STEPS TO REPRODUCE: ${bug.steps.join(' | ')}`)
  }
  if (bug.screenshots.length > 0) {
    lines.push(`SCREENSHOTS: ${bug.screenshots.join(' , ')}`)
  }
  lines.push(`LIKELY FILE: ${likelyFile}`)

  // Generate fix instruction based on section/title
  const fixHints: string[] = []
  const lower = bug.title.toLowerCase()
  if (lower.includes('display') || lower.includes('visible') || lower.includes('show')) {
    fixHints.push('Check the rendering/conditional logic to ensure the element is visible.')
  }
  if (lower.includes('save') || lower.includes('update')) {
    fixHints.push('Check the Supabase update query and ensure the field is included.')
  }
  if (lower.includes('error') || lower.includes('fail') || lower.includes('broken')) {
    fixHints.push('Investigate the error handling and fix the underlying logic.')
  }
  if (lower.includes('email')) {
    fixHints.push('Check the email template and sending logic in the API route.')
  }
  if (fixHints.length === 0) {
    fixHints.push(`Investigate and fix the issue described above in ${likelyFile}.`)
  }
  lines.push(`FIX: ${fixHints.join(' ')}`)

  return lines.join('\n')
}

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

export async function POST(request: Request) {
  // Verify admin via Supabase auth token
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  )
  const { data: userData } = await anonClient.auth.getUser(token)
  if (!userData.user || !ADMIN_EMAILS.includes(userData.user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Read all new bug reports
  const { data: newBugs, error: bugsError } = await supabaseAdmin
    .from('bug_reports')
    .select('id, email, description, severity, screenshot_url, expected, user_id')
    .eq('status', 'new')

  if (bugsError) {
    return NextResponse.json({ error: bugsError.message }, { status: 500 })
  }

  // 2. Read all failed test results that don't have a matching bug report
  const { data: failedTests, error: testsError } = await supabaseAdmin
    .from('test_results')
    .select('id, tester_email, tester_name, section, test_item, comment, screenshot_url')
    .eq('status', 'fail')

  if (testsError) {
    return NextResponse.json({ error: testsError.message }, { status: 500 })
  }

  // Find failed tests that don't have matching bug reports (by description similarity)
  const bugDescriptions = (newBugs || []).map(b => normalize(b.description))
  const unmatchedTests = (failedTests || []).filter(t => {
    const nt = normalize(t.test_item)
    return !bugDescriptions.some(bd => isSimilar(nt, bd))
  })

  // 3. Group similar reports
  const groups: GroupedBug[] = []

  const findGroup = (title: string): GroupedBug | undefined => {
    return groups.find(g => isSimilar(g.title, title))
  }

  // Process bug reports
  for (const bug of (newBugs || []) as BugReport[]) {
    const existing = findGroup(bug.description)
    if (existing) {
      existing.descriptions.push(bug.description)
      existing.reporters.push(bug.email)
      existing.severity = higherSeverity(existing.severity, bug.severity)
      if (bug.screenshot_url) existing.screenshots.push(bug.screenshot_url)
      if (bug.expected) existing.steps.push(bug.expected)
      existing.bugReportIds.push(bug.id)
    } else {
      groups.push({
        title: bug.description,
        descriptions: [bug.description],
        reporters: [bug.email],
        severity: bug.severity || 'major',
        screenshots: bug.screenshot_url ? [bug.screenshot_url] : [],
        steps: bug.expected ? [bug.expected] : [],
        section: null,
        bugReportIds: [bug.id],
        testResultIds: [],
      })
    }
  }

  // Process unmatched failed tests
  for (const test of unmatchedTests as FailedTest[]) {
    const existing = findGroup(test.test_item)
    if (existing) {
      if (test.comment) existing.descriptions.push(test.comment)
      existing.reporters.push(test.tester_name || test.tester_email)
      if (test.screenshot_url) existing.screenshots.push(test.screenshot_url)
      existing.testResultIds.push(test.id)
    } else {
      groups.push({
        title: test.test_item,
        descriptions: test.comment ? [test.comment] : [`Test item "${test.test_item}" in section "${test.section}" marked as failed.`],
        reporters: [test.tester_name || test.tester_email],
        severity: 'major',
        screenshots: test.screenshot_url ? [test.screenshot_url] : [],
        steps: [],
        section: test.section,
        bugReportIds: [],
        testResultIds: [test.id],
      })
    }
  }

  // 4. Generate prompts and sort by severity
  groups.sort((a, b) => (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99))

  const prompts: { prompt: string; bugReportIds: string[]; severity: string; title: string }[] = []

  for (const group of groups) {
    const prompt = buildPrompt(group)
    prompts.push({
      prompt,
      bugReportIds: group.bugReportIds,
      severity: group.severity,
      title: group.title,
    })

    // 5. Update bug reports to 'triaging' and store the prompt
    if (group.bugReportIds.length > 0) {
      await supabaseAdmin
        .from('bug_reports')
        .update({ status: 'triaging' })
        .in('id', group.bugReportIds)
    }
  }

  return NextResponse.json({
    total_groups: groups.length,
    total_bug_reports_triaged: (newBugs || []).length,
    total_unmatched_failed_tests: unmatchedTests.length,
    prompts,
  })
}
