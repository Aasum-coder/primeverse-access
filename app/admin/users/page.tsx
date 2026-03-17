'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

interface UserRow {
  id: string
  name: string | null
  email: string | null
  slug: string | null
  landing_active: boolean | null
  referral_link: string | null
  profile_image: string | null
  created_at: string
  user_id: string
  lead_count: number
  ib_status: string | null
  ib_status_note: string | null
  ib_approved_at: string | null
}

export default function AdminUsersPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null)
  const [viewDistributor, setViewDistributor] = useState<any>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [actionModal, setActionModal] = useState<{ userId: string; action: 'approved' | 'rejected' | 'pending' } | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user || !ADMIN_EMAILS.includes(userData.user.email || '')) {
        window.location.href = '/'
        return
      }
      setAuthorized(true)
      await fetchUsers()
      setLoading(false)
    }
    init()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (res.ok) {
        const { users: data } = await res.json()
        setUsers(data || [])
      }
    } catch { /* ignore */ }
  }

  const startViewing = async (user: UserRow) => {
    setViewingUser(user)
    setViewLoading(true)
    try {
      const { data } = await supabase
        .from('distributors')
        .select('*')
        .eq('user_id', user.user_id)
        .single()
      setViewDistributor(data)
    } catch { /* ignore */ }
    setViewLoading(false)
  }

  const exitViewing = () => {
    setViewingUser(null)
    setViewDistributor(null)
  }

  const updateIbStatus = async () => {
    if (!actionModal) return
    setActionLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/admin/users/${actionModal.userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ib_status: actionModal.action, ib_status_note: actionNote || undefined }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === actionModal.userId
            ? { ...u, ib_status: actionModal.action, ib_status_note: actionNote || null, ib_approved_at: actionModal.action === 'approved' ? new Date().toISOString() : u.ib_approved_at }
            : u
        ))
        setActionModal(null)
        setActionNote('')
      }
    } catch { /* ignore */ }
    setActionLoading(false)
  }

  const getStatus = (u: UserRow): { label: string; color: string } => {
    if (u.landing_active) return { label: 'Active', color: '#22c55e' }
    if (u.slug) return { label: 'Setup', color: '#eab308' }
    return { label: 'Incomplete', color: '#ef4444' }
  }

  const getIbStatus = (u: UserRow): { label: string; color: string } => {
    const s = u.ib_status || 'pending'
    if (s === 'approved') return { label: 'Approved', color: '#22c55e' }
    if (s === 'rejected') return { label: 'Rejected', color: '#ef4444' }
    return { label: 'Pending', color: '#eab308' }
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      const parts = name.trim().split(/\s+/)
      return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
    }
    return (email || '?')[0].toUpperCase()
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return d }
  }

  const shortenUrl = (url: string | null) => {
    if (!url) return null
    try {
      const u = new URL(url)
      return u.hostname.replace('www.', '') + u.pathname
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  if (loading) return (
    <div style={{ background: '#1A1A2E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontFamily: 'Arial, sans-serif' }}>
      Loading...
    </div>
  )
  if (!authorized) return null

  const btnStyle = (bg: string, color: string, border: string) => ({
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: 4,
    padding: '3px 10px',
    fontSize: '0.72rem',
    fontWeight: 600 as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{ background: '#1A1A2E', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#E0E0E0' }}>
      {/* Action modal overlay */}
      {actionModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }} onClick={() => { setActionModal(null); setActionNote('') }}>
          <div style={{
            background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12,
            padding: '24px 28px', maxWidth: 400, width: '90%',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#D4A843', margin: '0 0 12px', fontSize: '1rem' }}>
              {actionModal.action === 'approved' ? 'Approve User' : actionModal.action === 'rejected' ? 'Reject User' : 'Set to Pending'}
            </h3>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 16px' }}>
              {actionModal.action === 'approved' ? 'This will grant full dashboard access and send a welcome email.' :
               actionModal.action === 'rejected' ? 'This will block the user from accessing the dashboard.' :
               'This will put the user back in pending review state.'}
            </p>
            <textarea
              placeholder="Optional note (visible to user if rejected)..."
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
              rows={3}
              style={{
                width: '100%', background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8,
                padding: '10px 12px', color: '#E0E0E0', fontSize: '0.85rem', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setActionModal(null); setActionNote('') }}
                style={btnStyle('transparent', '#888', '#2a2a4a')}
              >
                Cancel
              </button>
              <button
                onClick={updateIbStatus}
                disabled={actionLoading}
                style={btnStyle(
                  actionModal.action === 'approved' ? 'rgba(34,197,94,0.15)' : actionModal.action === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                  actionModal.action === 'approved' ? '#22c55e' : actionModal.action === 'rejected' ? '#f87171' : '#eab308',
                  actionModal.action === 'approved' ? 'rgba(34,197,94,0.3)' : actionModal.action === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)',
                )}
              >
                {actionLoading ? '...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impersonation banner */}
      {viewingUser && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
          borderBottom: '1px solid rgba(59,130,246,0.3)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.1rem' }}>👁</span>
            <div>
              <span style={{ fontWeight: 700, color: '#93c5fd' }}>Viewing as {viewingUser.name || 'Unknown'}</span>
              <span style={{ color: '#888', marginLeft: 8, fontSize: '0.85rem' }}>{viewingUser.email}</span>
            </div>
            <span style={{
              background: 'rgba(234,179,8,0.15)',
              color: '#eab308',
              padding: '2px 10px',
              borderRadius: 4,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginLeft: 8,
            }}>READ-ONLY</span>
          </div>
          <button
            onClick={exitViewing}
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              padding: '6px 16px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Exit
          </button>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        {/* Impersonation view */}
        {viewingUser && (
          <div style={{
            background: '#16162a',
            border: '1px solid #2a2a4a',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}>
            {viewLoading ? (
              <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Loading user data...</div>
            ) : viewDistributor ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  {viewDistributor.profile_image ? (
                    <img src={viewDistributor.profile_image} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: '1.2rem' }}>
                      {getInitials(viewDistributor.name, viewDistributor.email)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#D4A843' }}>{viewDistributor.name || 'Unnamed'}</div>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{viewDistributor.email}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Slug', value: viewDistributor.slug || '—' },
                    { label: 'Landing Active', value: viewDistributor.landing_active ? 'Yes' : 'No' },
                    { label: 'Referral Link', value: viewDistributor.referral_link ? shortenUrl(viewDistributor.referral_link) : '—' },
                    { label: 'User ID', value: viewDistributor.user_id?.slice(0, 8) + '...' },
                    { label: 'Joined', value: formatDate(viewDistributor.created_at) },
                    { label: 'Bio', value: viewDistributor.bio ? viewDistributor.bio.slice(0, 60) + '...' : '—' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '0.88rem', color: '#E0E0E0', wordBreak: 'break-all' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>No distributor data found</div>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ color: '#D4A843', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>SYSTM8 Users</h1>
            <span style={{
              background: 'rgba(212,168,67,0.15)',
              color: '#D4A843',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: '0.82rem',
              fontWeight: 700,
            }}>
              {users.length}
            </span>
          </div>
          <a href="/admin/triage" style={{ color: '#888', fontSize: '0.82rem', textDecoration: 'none' }}>← Triage</a>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#16162a',
              border: '1px solid #2a2a4a',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#E0E0E0',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2a2a4a' }}>
                {['', 'Name', 'Email', 'Landing Page', 'Leads', 'Referral', 'Joined', 'Status', 'IB Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const status = getStatus(u)
                const ibStatus = getIbStatus(u)
                const ibState = u.ib_status || 'pending'
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1e1e38' }}>
                    {/* Avatar */}
                    <td style={{ padding: '8px', width: 40 }}>
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: '0.72rem' }}>
                          {getInitials(u.name, u.email)}
                        </div>
                      )}
                    </td>
                    {/* Name */}
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => startViewing(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#D4A843',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.85rem',
                          textDecoration: 'underline',
                          textDecorationColor: 'rgba(212,168,67,0.3)',
                          textUnderlineOffset: 2,
                        }}
                      >
                        {u.name || 'Unnamed'}
                      </button>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '8px', color: '#aaa' }}>{u.email || '—'}</td>
                    {/* Landing Page */}
                    <td style={{ padding: '8px' }}>
                      {u.slug ? (
                        <a href={`https://www.primeverseaccess.com/${u.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.82rem' }}>
                          primeverseaccess.com/{u.slug}
                        </a>
                      ) : (
                        <span style={{ color: '#555' }}>—</span>
                      )}
                    </td>
                    {/* Leads */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        background: u.lead_count > 0 ? 'rgba(34,197,94,0.1)' : 'transparent',
                        color: u.lead_count > 0 ? '#22c55e' : '#555',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        {u.lead_count}
                      </span>
                    </td>
                    {/* Referral */}
                    <td style={{ padding: '8px', color: '#aaa', fontSize: '0.8rem' }}>
                      {u.referral_link ? (
                        <a href={u.referral_link} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>
                          {shortenUrl(u.referral_link)}
                        </a>
                      ) : (
                        <span style={{ color: '#555' }}>—</span>
                      )}
                    </td>
                    {/* Joined */}
                    <td style={{ padding: '8px', color: '#aaa', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatDate(u.created_at)}</td>
                    {/* Status */}
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        background: `${status.color}18`,
                        color: status.color,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {status.label}
                      </span>
                    </td>
                    {/* IB Status */}
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        background: `${ibStatus.color}18`,
                        color: ibStatus.color,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {ibStatus.label}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {ibState === 'pending' && (
                          <>
                            <button onClick={() => setActionModal({ userId: u.id, action: 'approved' })} style={btnStyle('rgba(34,197,94,0.12)', '#22c55e', 'rgba(34,197,94,0.3)')}>Approve</button>
                            <button onClick={() => setActionModal({ userId: u.id, action: 'rejected' })} style={btnStyle('rgba(239,68,68,0.12)', '#f87171', 'rgba(239,68,68,0.3)')}>Reject</button>
                          </>
                        )}
                        {ibState === 'approved' && (
                          <button onClick={() => setActionModal({ userId: u.id, action: 'rejected' })} style={btnStyle('rgba(239,68,68,0.12)', '#f87171', 'rgba(239,68,68,0.3)')}>Revoke</button>
                        )}
                        {ibState === 'rejected' && (
                          <button onClick={() => setActionModal({ userId: u.id, action: 'approved' })} style={btnStyle('rgba(34,197,94,0.12)', '#22c55e', 'rgba(34,197,94,0.3)')}>Re-approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#555' }}>
                    {search ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
