'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

interface BugReport {
  id: string
  title: string
  description: string
  severity: string
  status: string
  reporter_email: string
  reporter_name: string
  screenshot_url: string | null
  steps_to_reproduce: string | null
  agent_prompt: string | null
  created_at: string
  updated_at: string
}

interface TestResult {
  id: string
  tester_id: string
  tester_email: string
  tester_name: string
  section: string
  test_item: string
  status: string
  comment: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
}

interface TesterSummary {
  tester_id: string
  tester_email: string
  tester_name: string
  passCount: number
  failCount: number
  skipCount: number
  totalCompleted: number
  completionPct: number
  results: TestResult[]
}

interface TestResultsData {
  overview: {
    totalTesters: number
    avgCompletion: number
    totalTestItems: number
    mostFailed: { test_item: string; section: string; count: number }[]
  }
  testers: TesterSummary[]
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  major: '#f97316',
  minor: '#eab308',
  cosmetic: '#8b5cf6',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#6b7280',
  triaging: '#3b82f6',
  fixing: '#f97316',
  deployed: '#22c55e',
  verified: '#10b981',
  wont_fix: '#6b7280',
}

export default function TriagePage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [triaging, setTriaging] = useState(false)
  const [triageResult, setTriageResult] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [mainTab, setMainTab] = useState<'bugs' | 'test-results'>('bugs')
  const [testData, setTestData] = useState<TestResultsData | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [expandedTester, setExpandedTester] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user || !ADMIN_EMAILS.includes(userData.user.email || '')) {
        setLoading(false)
        return
      }
      setAuthorized(true)
      await fetchBugs()
      setLoading(false)
    }
    init()
  }, [])

  const fetchBugs = async () => {
    try {
      const res = await fetch('/api/admin/bugs')
      if (res.ok) {
        const { bugs: data } = await res.json()
        setBugs(data || [])
      }
    } catch { /* ignore */ }
  }

  const fetchTestResults = async () => {
    setTestLoading(true)
    try {
      const res = await fetch('/api/admin/test-results')
      if (res.ok) {
        const data = await res.json()
        setTestData(data)
      }
    } catch { /* ignore */ }
    setTestLoading(false)
  }

  const runTriage = async () => {
    setTriaging(true)
    setTriageResult(null)
    try {
      const res = await fetch('/api/triage-bugs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${prompt('Enter TRIAGE_SECRET:')}` },
      })
      const data = await res.json()
      if (res.ok) {
        setTriageResult(`Triaged ${data.total_groups} bug groups (${data.total_bug_reports_triaged} reports, ${data.total_unmatched_failed_tests} unmatched failed tests)`)
        await fetchBugs()
      } else {
        setTriageResult(`Error: ${data.error}`)
      }
    } catch {
      setTriageResult('Network error')
    }
    setTriaging(false)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setBugs(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    } catch { /* ignore */ }
  }

  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div style={{ background: '#1A1A2E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontFamily: 'Arial, sans-serif' }}>Loading...</div>
  if (!authorized) return <div style={{ background: '#1A1A2E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontFamily: 'Arial, sans-serif' }}>Unauthorized</div>

  const severityOrder = ['critical', 'major', 'minor', 'cosmetic']
  const filteredBugs = filter === 'all' ? bugs : bugs.filter(b => b.status === filter)
  const grouped = severityOrder.map(sev => ({
    severity: sev,
    bugs: filteredBugs.filter(b => b.severity === sev),
  })).filter(g => g.bugs.length > 0)

  const counts = {
    all: bugs.length,
    new: bugs.filter(b => b.status === 'new').length,
    triaging: bugs.filter(b => b.status === 'triaging').length,
    fixing: bugs.filter(b => b.status === 'fixing').length,
    deployed: bugs.filter(b => b.status === 'deployed').length,
  }

  return (
    <div style={{ background: '#1A1A2E', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#E0E0E0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#D4A843', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Admin Dashboard</h1>
          <p style={{ color: '#888', fontSize: '0.88rem', margin: 0 }}>SYSTM8 Admin — Bug triage &amp; beta test results</p>
        </div>

        {/* Main tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #2a2a4a', paddingBottom: 0 }}>
          <button
            onClick={() => setMainTab('bugs')}
            style={{
              background: mainTab === 'bugs' ? '#D4A843' : 'transparent',
              color: mainTab === 'bugs' ? '#1A1A2E' : '#888',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
          >
            Bugs ({bugs.length})
          </button>
          <button
            onClick={() => { setMainTab('test-results'); if (!testData) fetchTestResults() }}
            style={{
              background: mainTab === 'test-results' ? '#D4A843' : 'transparent',
              color: mainTab === 'test-results' ? '#1A1A2E' : '#888',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
          >
            Test Results
          </button>
        </div>

        {/* ═══ BUGS TAB ═══ */}
        {mainTab === 'bugs' && (
          <>
            {/* Actions bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={runTriage}
                disabled={triaging}
                style={{ background: '#D4A843', color: '#1A1A2E', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, cursor: triaging ? 'wait' : 'pointer', fontSize: '0.88rem' }}
              >
                {triaging ? 'Triaging...' : 'Run Triage'}
              </button>
              <button
                onClick={fetchBugs}
                style={{ background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Refresh
              </button>
              {triageResult && <span style={{ color: '#D4A843', fontSize: '0.82rem' }}>{triageResult}</span>}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {(['all', 'new', 'triaging', 'fixing', 'deployed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? '#D4A843' : '#16213E',
                    color: filter === f ? '#1A1A2E' : '#888',
                    border: `1px solid ${filter === f ? '#D4A843' : '#2a2a4a'}`,
                    borderRadius: 20,
                    padding: '5px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </button>
              ))}
            </div>

            {/* Bug groups by severity */}
            {grouped.length === 0 && (
              <div style={{ textAlign: 'center', color: '#555', padding: '48px 0', fontSize: '0.92rem' }}>
                No bugs found {filter !== 'all' ? `with status "${filter}"` : ''}
              </div>
            )}

            {grouped.map(group => (
              <div key={group.severity} style={{ marginBottom: 32 }}>
                <h2 style={{ color: SEVERITY_COLORS[group.severity], fontSize: '0.92rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: SEVERITY_COLORS[group.severity], display: 'inline-block' }} />
                  {group.severity} ({group.bugs.length})
                </h2>

                {group.bugs.map(bug => (
                  <div key={bug.id} style={{ background: '#16213E', border: '1px solid #2a2a4a', borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
                    {/* Bug header */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#E0E0E0' }}>{bug.title}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: STATUS_COLORS[bug.status] + '22', color: STATUS_COLORS[bug.status], fontWeight: 600 }}>
                            {bug.status}
                          </span>
                        </div>
                        <p style={{ color: '#999', fontSize: '0.82rem', margin: '0 0 6px', lineHeight: 1.5 }}>{bug.description}</p>
                        <div style={{ fontSize: '0.72rem', color: '#666' }}>
                          {bug.reporter_name || bug.reporter_email} · {new Date(bug.created_at).toLocaleDateString()}
                          {bug.screenshot_url && <> · <a href={bug.screenshot_url} target="_blank" rel="noopener noreferrer" style={{ color: '#D4A843' }}>Screenshot</a></>}
                        </div>
                      </div>

                      {/* Status actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {bug.status !== 'fixing' && (
                          <button onClick={() => updateStatus(bug.id, 'fixing')} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Fixing
                          </button>
                        )}
                        {bug.status !== 'deployed' && (
                          <button onClick={() => updateStatus(bug.id, 'deployed')} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Deployed
                          </button>
                        )}
                        {bug.status !== 'wont_fix' && (
                          <button onClick={() => updateStatus(bug.id, 'wont_fix')} style={{ background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Won&apos;t Fix
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Agent prompt */}
                    {bug.agent_prompt && (
                      <div style={{ borderTop: '1px solid #2a2a4a', padding: '10px 16px', background: '#0f0f23' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ color: '#D4A843', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>AGENT PROMPT</span>
                          <button
                            onClick={() => copyPrompt(bug.id, bug.agent_prompt!)}
                            style={{ background: copied === bug.id ? '#22c55e' : '#D4A843', color: '#1A1A2E', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {copied === bug.id ? 'Copied!' : 'Copy Prompt'}
                          </button>
                        </div>
                        <pre style={{ color: '#ccc', fontSize: '0.75rem', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                          {bug.agent_prompt}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* ═══ TEST RESULTS TAB ═══ */}
        {mainTab === 'test-results' && (
          <>
            {/* Refresh button */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
              <button
                onClick={fetchTestResults}
                disabled={testLoading}
                style={{ background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '10px 20px', cursor: testLoading ? 'wait' : 'pointer', fontSize: '0.88rem' }}
              >
                {testLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {testLoading && !testData && (
              <div style={{ textAlign: 'center', color: '#D4A843', padding: '48px 0' }}>Loading test results...</div>
            )}

            {testData && (
              <>
                {/* ── Beta Test Overview ── */}
                <div style={{ background: '#16213E', border: '1px solid #2a2a4a', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
                  <h2 style={{ color: '#D4A843', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', letterSpacing: '0.5px' }}>Beta Test Overview</h2>

                  {/* Stats cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '16px', textAlign: 'center', border: '1px solid #2a2a4a' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D4A843' }}>{testData.overview.totalTesters}</div>
                      <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>Total Testers</div>
                    </div>
                    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '16px', textAlign: 'center', border: '1px solid #2a2a4a' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4ade80' }}>{testData.overview.avgCompletion}%</div>
                      <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>Avg Completion</div>
                    </div>
                    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '16px', textAlign: 'center', border: '1px solid #2a2a4a' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E0E0E0' }}>{testData.overview.totalTestItems}</div>
                      <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>Test Items</div>
                    </div>
                  </div>

                  {/* Most-failed test items */}
                  {testData.overview.mostFailed.length > 0 && (
                    <div>
                      <h3 style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px' }}>Most-Failed Test Items</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {testData.overview.mostFailed.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#1A1A2E', borderRadius: 6, border: '1px solid #2a2a4a' }}>
                            <span style={{ background: '#f87171', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                              {item.count}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', color: '#E0E0E0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.test_item}</div>
                              <div style={{ fontSize: '0.7rem', color: '#666' }}>{item.section}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Tester Summary Table ── */}
                <h2 style={{ color: '#D4A843', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>Testers Summary</h2>
                <div style={{ background: '#16213E', border: '1px solid #2a2a4a', borderRadius: 10, overflow: 'hidden', marginBottom: 28 }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 70px 70px', gap: 8, padding: '12px 16px', background: '#0f0f23', borderBottom: '1px solid #2a2a4a', fontSize: '0.72rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span>Name</span>
                    <span>Email</span>
                    <span style={{ textAlign: 'center' }}>Progress</span>
                    <span style={{ textAlign: 'center', color: '#4ade80' }}>Pass</span>
                    <span style={{ textAlign: 'center', color: '#f87171' }}>Fail</span>
                  </div>

                  {testData.testers.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#555', padding: '32px 0', fontSize: '0.88rem' }}>No test results yet</div>
                  )}

                  {testData.testers.map(tester => (
                    <div key={tester.tester_id}>
                      {/* Tester row */}
                      <button
                        onClick={() => setExpandedTester(expandedTester === tester.tester_id ? null : tester.tester_id)}
                        style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 80px 70px 70px', gap: 8, padding: '12px 16px', background: expandedTester === tester.tester_id ? '#1a1a3a' : 'transparent', border: 'none', borderBottom: '1px solid #1a1a2e', cursor: 'pointer', textAlign: 'left', color: '#E0E0E0', fontSize: '0.84rem' }}
                      >
                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tester.tester_name}</span>
                        <span style={{ color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tester.tester_email}</span>
                        <span style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', background: '#2a2a4a', borderRadius: 10, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: tester.completionPct >= 80 ? '#4ade80' : tester.completionPct >= 40 ? '#D4A843' : '#f87171' }}>
                            {tester.completionPct}%
                          </span>
                        </span>
                        <span style={{ textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>{tester.passCount}</span>
                        <span style={{ textAlign: 'center', color: '#f87171', fontWeight: 700 }}>{tester.failCount}</span>
                      </button>

                      {/* Expanded: per-tester detailed results */}
                      {expandedTester === tester.tester_id && (
                        <div style={{ padding: '12px 16px 16px', background: '#0f0f23', borderBottom: '1px solid #2a2a4a' }}>
                          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 10 }}>
                            {tester.totalCompleted} of {testData.overview.totalTestItems} items completed · {tester.passCount} passed · {tester.failCount} failed{tester.skipCount > 0 ? ` · ${tester.skipCount} skipped` : ''}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {tester.results.map((r: TestResult) => (
                              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#16213E', borderRadius: 6, border: '1px solid #1a1a2e' }}>
                                <span style={{
                                  width: 20, height: 20, minWidth: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.72rem', fontWeight: 700,
                                  color: r.status === 'pass' ? '#4ade80' : r.status === 'fail' ? '#f87171' : '#888',
                                  border: `2px solid ${r.status === 'pass' ? '#4ade80' : r.status === 'fail' ? '#f87171' : '#555'}`,
                                  background: r.status === 'pass' ? 'rgba(74,222,128,0.1)' : r.status === 'fail' ? 'rgba(248,113,113,0.1)' : 'transparent',
                                }}>
                                  {r.status === 'pass' ? '✓' : r.status === 'fail' ? '✕' : '—'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.8rem', color: '#E0E0E0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.test_item}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#666' }}>
                                    {r.section}
                                    {r.comment && <span style={{ color: '#999' }}> — {r.comment}</span>}
                                  </div>
                                </div>
                                {r.screenshot_url && (
                                  <a href={r.screenshot_url} target="_blank" rel="noopener noreferrer" style={{ color: '#D4A843', fontSize: '0.7rem', flexShrink: 0 }}>
                                    Screenshot
                                  </a>
                                )}
                                <span style={{ fontSize: '0.68rem', color: '#555', flexShrink: 0 }}>
                                  {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
