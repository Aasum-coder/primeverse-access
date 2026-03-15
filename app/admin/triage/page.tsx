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
    const { data } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })
    setBugs(data || [])
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
    await supabase.from('bug_reports').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setBugs(prev => prev.map(b => b.id === id ? { ...b, status } : b))
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
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: '#D4A843', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Bug Triage Dashboard</h1>
          <p style={{ color: '#888', fontSize: '0.88rem', margin: 0 }}>SYSTM8 Admin — Review, triage, and track bug reports</p>
        </div>

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
      </div>
    </div>
  )
}
