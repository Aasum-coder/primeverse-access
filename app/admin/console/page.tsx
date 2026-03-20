'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const ADMIN_EMAIL = 'bitaasum@gmail.com'
const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

type Distributor = {
  id: string
  user_id: string
  name: string | null
  full_name: string | null
  email: string
  referral_link: string | null
  slug: string | null
  ib_status: string
  ib_approved_at: string | null
  created_at: string
}

type AdminUser = {
  id: string
  user_id: string
  email: string
  granted_at: string
}

type EventRecord = {
  id: string
  slug: string
  title: string
  description: string | null
  event_date: string | null
  zoom_link: string | null
  max_attendees: number | null
  is_active: boolean
  created_at: string
  total_registrations?: number
  pending_count?: number
}

type EventRegistration = {
  id: string
  event_id: string
  full_name: string
  email: string
  uid: string | null
  status: string
  status_note: string | null
  approved_at: string | null
  created_at: string
}

type Tab = 'overview' | 'pending' | 'upgrade' | 'events'

function buildApprovalEmail(name: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">Welcome to SYSTM8</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 20px;">
        Hey ${name || 'there'},<br/><br/>
        Great news — your IB application has been <strong style="color:#d4a537;">approved</strong>! You now have full access to SYSTM8 and the 1Move Academy dashboard.
      </p>
      <a href="https://primeverseaccess.com" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#c9a227,#e8c975,#d4a537,#c9a227);color:#0a0804;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;">
        LOG IN NOW
      </a>
      <p style="font-size:12px;color:#5a5347;margin-top:24px;">
        You're officially part of the team. Let's build.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move — Trade. Build. Perform.
    </p>
  </div>
</body></html>`
}

function buildRejectionEmail(name: string, reason: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${SYSTM8_LOGO}" alt="1Move" width="80" height="80" style="border-radius:50%;border:2px solid #d4a537;" />
    </div>
    <div style="background:rgba(8,8,8,0.9);border:1px solid rgba(212,165,55,0.2);border-radius:14px;padding:32px 24px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#f0e6d0;margin:0 0 8px;">Your SYSTM8 Application</h1>
      <div style="height:2px;width:60px;margin:0 auto 20px;background:linear-gradient(90deg,#a07818,#e8c975,#a07818);"></div>
      <p style="font-size:15px;color:#9a917e;line-height:1.7;margin:0 0 16px;">
        Hey ${name || 'there'},<br/><br/>
        We've reviewed your application and unfortunately your access was <strong style="color:#d4a537;">not approved</strong> at this time.
      </p>
      <div style="background:rgba(212,165,55,0.06);border:1px solid rgba(212,165,55,0.15);border-radius:8px;padding:16px;margin:16px 0;">
        <p style="font-size:13px;color:#9a917e;margin:0;"><strong style="color:#d4a537;">Reason:</strong> ${reason}</p>
      </div>
      <p style="font-size:14px;color:#9a917e;line-height:1.7;margin:16px 0 0;">
        Contact your team leader if you have questions.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5347;margin-top:24px;">
      &copy; 1Move — Trade. Build. Perform.
    </p>
  </div>
</body></html>`
}

/* ─────────────────────────────────────────────
   STYLES — matches SYSTM8 dark theme
   ───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --gold-deep: #7a5c12;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --text-dim: #5a5347;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { min-height: 100vh; font-family: 'Outfit', sans-serif; background: var(--marble-dark); color: var(--text-primary); }

  .marble-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 80%, rgba(212,165,55,0.04) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212,165,55,0.03) 0%, transparent 50%),
      var(--marble-dark);
  }

  .admin-wrap {
    position: relative; z-index: 1; min-height: 100vh;
  }

  .admin-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid var(--card-border);
    background: rgba(0,0,0,0.6); backdrop-filter: blur(20px);
  }
  .admin-header-left { display: flex; align-items: center; gap: 12px; }
  .admin-logo {
    width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid var(--gold-dark);
    box-shadow: 0 2px 12px rgba(212,165,55,0.2);
  }
  .admin-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem; font-weight: 600; color: var(--gold);
    letter-spacing: 0.02em;
  }
  .admin-subtitle { font-size: 0.7rem; color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; }

  .back-btn {
    background: none; border: 1px solid var(--card-border); color: var(--text-secondary);
    padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.82rem;
    font-family: 'Outfit', sans-serif; transition: all 0.2s;
  }
  .back-btn:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }

  .admin-tabs {
    display: flex; border-bottom: 1px solid var(--card-border);
    background: rgba(0,0,0,0.3);
  }
  .admin-tab {
    flex: 1; padding: 14px 0; text-align: center;
    font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-dim); cursor: pointer; border: none; background: none;
    font-family: 'Outfit', sans-serif; transition: color 0.2s; position: relative;
  }
  .admin-tab:hover { color: var(--text-secondary); }
  .admin-tab-active { color: var(--gold); }
  .admin-tab-active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 2px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
  }

  .admin-content { max-width: 960px; margin: 0 auto; padding: 20px 16px; }

  .stat-card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
    padding: 20px; margin-bottom: 16px; backdrop-filter: blur(10px);
  }
  .stat-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.4rem; font-weight: 700; color: var(--gold);
  }
  .stat-label { font-size: 0.85rem; color: var(--text-secondary); margin-left: 12px; }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    text-align: left; padding: 10px 14px; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim);
    border-bottom: 1px solid var(--card-border);
  }
  .data-table td {
    padding: 12px 14px; font-size: 0.85rem; border-bottom: 1px solid var(--card-border);
    color: var(--text-primary);
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: rgba(212,165,55,0.02); }
  .td-secondary { color: var(--text-secondary) !important; font-size: 0.78rem !important; }
  .td-mono { font-family: monospace; font-size: 0.75rem !important; color: var(--text-secondary) !important; }
  .td-link { color: var(--gold) !important; text-decoration: none; }
  .td-link:hover { color: var(--gold-light) !important; }

  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .badge-approved { background: rgba(74,157,90,0.12); color: #6dc07f; border: 1px solid rgba(74,157,90,0.25); }
  .badge-pending { background: rgba(212,165,55,0.08); color: var(--gold-light); border: 1px solid rgba(212,165,55,0.2); }
  .badge-rejected { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

  .evt-form { display: grid; gap: 14px; margin-bottom: 24px; }
  .evt-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .evt-label {
    display: block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-dim); margin-bottom: 4px;
  }
  .evt-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--input-border);
    border-radius: 8px; padding: 9px 12px; color: var(--text-primary); font-size: 0.85rem;
    font-family: 'Outfit', sans-serif; outline: none;
  }
  .evt-input:focus { border-color: rgba(212,165,55,0.5); }
  .evt-input::placeholder { color: var(--text-dim); }
  .evt-select {
    width: 100%; background: var(--input-bg); border: 1px solid var(--input-border);
    border-radius: 8px; padding: 9px 12px; color: var(--text-primary); font-size: 0.85rem;
    font-family: 'Outfit', sans-serif; outline: none; cursor: pointer;
  }
  .evt-select option { background: #0a0a0a; color: var(--text-primary); }

  @media (max-width: 768px) {
    .evt-form-row { grid-template-columns: 1fr; }
  }

  .card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
    padding: 18px; margin-bottom: 12px; backdrop-filter: blur(10px);
  }
  .card-name { font-size: 0.92rem; color: var(--text-primary); font-weight: 500; }
  .card-email { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .card-meta { display: flex; gap: 16px; margin-top: 8px; font-size: 0.75rem; color: var(--text-dim); }
  .card-meta span { color: var(--text-secondary); }

  .card-actions { display: flex; gap: 8px; margin-top: 12px; }

  .btn-approve {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(74,157,90,0.3);
    background: rgba(74,157,90,0.1); color: #6dc07f;
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
  }
  .btn-approve:hover { background: rgba(74,157,90,0.2); }
  .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-reject {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08); color: #f87171;
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
  }
  .btn-reject:hover { background: rgba(239,68,68,0.18); }
  .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-outline {
    padding: 8px 16px; background: transparent;
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.78rem; cursor: pointer; transition: all 0.2s;
  }
  .btn-outline:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }

  .btn-gold {
    padding: 8px 20px; border: none; border-radius: 8px;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537, #c9a227);
    color: #0a0804; font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    letter-spacing: 0.04em; transition: all 0.2s;
  }
  .btn-gold:hover { box-shadow: 0 4px 16px rgba(212,165,55,0.3); }
  .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-upgrade {
    padding: 8px 16px; border: 1px solid var(--card-border); border-radius: 8px;
    background: rgba(212,165,55,0.06); color: var(--gold);
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
  }
  .btn-upgrade:hover { background: rgba(212,165,55,0.14); border-color: rgba(212,165,55,0.4); }

  .btn-admin-label {
    display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 8px;
    border: 1px solid var(--card-border); background: rgba(212,165,55,0.06);
    color: var(--gold); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.05em;
  }

  .reject-area { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--card-border); }
  .reject-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; }
  .reject-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--input-border);
    border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 0.85rem;
    font-family: 'Outfit', sans-serif; resize: none; outline: none;
  }
  .reject-input:focus { border-color: rgba(212,165,55,0.5); }
  .reject-input::placeholder { color: var(--text-dim); }
  .reject-actions { display: flex; gap: 8px; margin-top: 10px; }

  .empty-state { text-align: center; padding: 48px 20px; color: var(--text-dim); font-size: 0.88rem; }

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .modal-card {
    background: rgba(12,12,12,0.98); border: 1px solid var(--card-border); border-radius: 16px;
    padding: 32px; max-width: 400px; width: 100%; text-align: center;
  }
  .modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600;
    color: var(--text-primary); margin-bottom: 12px;
  }
  .modal-text { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
  .modal-text strong { color: var(--text-primary); }
  .modal-actions { display: flex; gap: 10px; justify-content: center; }

  .toast-float {
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 14px 20px; border-radius: 12px;
    background: rgba(8,8,8,0.95); border: 1px solid rgba(74,157,90,0.3);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5); font-size: 0.85rem; color: #6dc07f;
    animation: toastSlideIn 0.3s ease-out;
  }
  .toast-float-error { border-color: rgba(239,68,68,0.3); color: #f87171; }

  @keyframes toastSlideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .spinner {
    width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent;
    border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .denied-screen {
    position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; z-index: 9999;
  }
  .denied-card {
    background: rgba(12,12,12,0.95); border: 1px solid rgba(239,68,68,0.2); border-radius: 16px;
    padding: 48px 40px; max-width: 420px; width: 90%; text-align: center;
  }

  .loading-screen {
    position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px; z-index: 9999;
  }
  .loading-spinner {
    width: 32px; height: 32px; border: 2px solid var(--gold); border-top-color: transparent;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  @media (max-width: 768px) {
    .admin-header { padding: 12px 16px; }
    .admin-content { padding: 16px 12px; }
    .data-table { font-size: 0.78rem; }
    .hide-mobile { display: none; }
    .card-actions { flex-wrap: wrap; }
  }
`

export default function AdminConsolePage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [denied, setDenied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [userEmail, setUserEmail] = useState('')

  // Data
  const [approvedIBs, setApprovedIBs] = useState<Distributor[]>([])
  const [pendingIBs, setPendingIBs] = useState<Distributor[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])

  // UI state
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [upgradeModal, setUpgradeModal] = useState<Distributor | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Events state
  const [events, setEvents] = useState<EventRecord[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventRegs, setEventRegs] = useState<EventRegistration[]>([])
  const [eventRegsLoading, setEventRegsLoading] = useState(false)
  const [evtRejectingId, setEvtRejectingId] = useState<string | null>(null)
  const [evtRejectReason, setEvtRejectReason] = useState('')
  // Create event form
  const [evtTitle, setEvtTitle] = useState('')
  const [evtSlug, setEvtSlug] = useState('')
  const [evtDesc, setEvtDesc] = useState('')
  const [evtDate, setEvtDate] = useState('')
  const [evtZoom, setEvtZoom] = useState('')
  const [evtMax, setEvtMax] = useState('')
  const [evtCreating, setEvtCreating] = useState(false)
  // Inline event editing
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editZoom, setEditZoom] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((prev: { visible: boolean; message: string; type: 'success' | 'error' }) => ({ ...prev, visible: false })), 3500)
  }, [])

  const fetchData = useCallback(async () => {
    const { data: approved } = await supabase
      .from('distributors')
      .select('*')
      .eq('ib_status', 'approved')
      .order('ib_approved_at', { ascending: false })
    setApprovedIBs(approved || [])

    const { data: pending } = await supabase
      .from('distributors')
      .select('*')
      .eq('ib_status', 'pending')
      .order('created_at', { ascending: false })
    setPendingIBs(pending || [])

    const { data: admins } = await supabase
      .from('admin_users')
      .select('*')
      .order('granted_at', { ascending: false })
    setAdminUsers(admins || [])
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        console.log('Events API response:', JSON.stringify(data, null, 2))
        const eventsArray = Array.isArray(data) ? data : (data?.events ?? [])
        console.log('First event:', JSON.stringify(eventsArray[0], null, 2))
        setEvents(eventsArray.filter(Boolean))
      }
    } catch (_err) { /* ignore */ }
  }, [])

  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser()
      const user = data?.user
      if (error || !user) {
        router.push('/login')
        return
      }

      // Allow access if primary admin email OR distributor.is_admin === true
      let isAllowed = user.email === ADMIN_EMAIL

      if (!isAllowed) {
        const { data: dist } = await supabase
          .from('distributors')
          .select('is_admin')
          .eq('user_id', user.id)
          .single()
        if (dist?.is_admin === true) {
          isAllowed = true
        }
      }

      if (!isAllowed) {
        setDenied(true)
        setLoading(false)
        return
      }

      setUserEmail(user.email || '')
      setAuthorized(true)
      setLoading(false)
      try {
        await Promise.all([fetchData(), fetchEvents()])
      } catch (_err) {
        console.error('Failed to load initial data:', _err)
      }
    }
    checkAuth()
  }, [router, fetchData, fetchEvents])

  async function handleApprove(distributor: Distributor) {
    setActionLoading(distributor.id)
    try {
      const { error } = await supabase
        .from('distributors')
        .update({ ib_status: 'approved', ib_approved_at: new Date().toISOString() })
        .eq('id', distributor.id)

      if (error) {
        console.error('Approve update error:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint)
        throw error
      }

      // Send approval email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: distributor.email,
          subject: "Welcome to SYSTM8 — You're Approved!",
          html: buildApprovalEmail(distributor.name || distributor.full_name || ''),
          caller_email: userEmail,
        }),
      })

      // Optimistic update
      setPendingIBs((prev: Distributor[]) => prev.filter((d: Distributor) => d.id !== distributor.id))
      setApprovedIBs((prev: Distributor[]) => [{ ...distributor, ib_status: 'approved', ib_approved_at: new Date().toISOString() }, ...prev])
      showToast(`${distributor.name || distributor.email} approved successfully`)
    } catch (err: any) {
      console.error('handleApprove failed:', err)
      showToast(`Failed to approve: ${err?.message || 'Unknown error'}`, 'error')
    }
    setActionLoading(null)
  }

  async function handleReject(distributor: Distributor) {
    if (!rejectReason.trim()) return
    setActionLoading(distributor.id)
    try {
      const { error } = await supabase
        .from('distributors')
        .update({ ib_status: 'rejected' })
        .eq('id', distributor.id)

      if (error) {
        console.error('Reject update error:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint)
        throw error
      }

      // Send rejection email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: distributor.email,
          subject: 'Your SYSTM8 Application',
          html: buildRejectionEmail(distributor.name || distributor.full_name || '', rejectReason),
          caller_email: userEmail,
        }),
      })

      // Optimistic update
      setPendingIBs((prev: Distributor[]) => prev.filter((d: Distributor) => d.id !== distributor.id))
      setRejectingId(null)
      setRejectReason('')
      showToast(`${distributor.name || distributor.email} rejected`)
    } catch (err: any) {
      console.error('handleReject failed:', err)
      showToast(`Failed to reject: ${err?.message || 'Unknown error'}`, 'error')
    }
    setActionLoading(null)
  }

  async function handleUpgrade(distributor: Distributor) {
    setActionLoading(distributor.id)
    try {
      // First get the correct user_id from the distributors table
      const { data: distRecord, error: fetchError } = await supabase
        .from('distributors')
        .select('user_id, email')
        .eq('id', distributor.id)
        .single()

      if (fetchError || !distRecord) {
        const msg = fetchError?.message || 'Distributor not found'
        showToast(`Upgrade failed: ${msg}`, 'error')
        setActionLoading(null)
        return
      }

      const userId = distRecord.user_id
      if (!userId) {
        showToast('Upgrade failed: user has no auth user_id linked', 'error')
        setActionLoading(null)
        return
      }
      const email = distRecord.email

      // Insert into admin_users with the correct user_id (from distributors.user_id, NOT distributors.id)
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email: email,
          granted_by: ADMIN_EMAIL,
        })

      if (insertError) {
        showToast(`Upgrade failed (admin_users insert): ${insertError.message}`, 'error')
        setActionLoading(null)
        return
      }

      // Also mark the distributor as admin
      const { error: updateError } = await supabase
        .from('distributors')
        .update({ is_admin: true })
        .eq('id', distributor.id)

      if (updateError) {
        console.error('is_admin update failed (non-blocking):', updateError.message)
        // Non-blocking: admin_users insert succeeded, so the user IS an admin
      }

      setAdminUsers((prev: AdminUser[]) => [
        { id: crypto.randomUUID(), user_id: userId, email: email, granted_at: new Date().toISOString() },
        ...prev,
      ])
      setUpgradeModal(null)
      showToast(`✅ ${distributor.name || distributor.email} upgraded to admin`)
    } catch (err: any) {
      console.error('Upgrade to admin failed:', err)
      showToast(`Upgrade failed: ${err?.message || 'Unknown error'}`, 'error')
    }
    setActionLoading(null)
  }

  // ─── Events functions ───

  const fetchEventRegs = useCallback(async (eventId: string) => {
    setEventRegsLoading(true)
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (!error) setEventRegs(data || [])
    setEventRegsLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'events' && authorized) fetchEvents()
  }, [activeTab, authorized, fetchEvents])

  useEffect(() => {
    if (selectedEventId) fetchEventRegs(selectedEventId)
  }, [selectedEventId, fetchEventRegs])

  async function handleCreateEvent() {
    if (!evtTitle.trim() || !evtSlug.trim()) {
      showToast('Title and slug are required', 'error')
      return
    }
    setEvtCreating(true)
    const { error } = await supabase.from('events').insert({
      title: evtTitle.trim(),
      slug: evtSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
      description: evtDesc.trim() || null,
      event_date: evtDate || null,
      zoom_link: evtZoom.trim() || null,
      max_attendees: evtMax ? parseInt(evtMax) : null,
      is_active: true,
      created_by: userEmail,
    })
    if (error) {
      if (error.code === '23505') showToast('An event with this slug already exists', 'error')
      else showToast(`Failed to create event: ${error.message}`, 'error')
    } else {
      showToast('✅ Event created')
      setEvtTitle(''); setEvtSlug(''); setEvtDesc(''); setEvtDate(''); setEvtZoom(''); setEvtMax('')
      fetchEvents()
    }
    setEvtCreating(false)
  }

  async function handleDeleteEvent(evt: EventRecord) {
    const confirmed = window.confirm('Are you sure you want to delete this event? This cannot be undone.')
    if (!confirmed) return
    setActionLoading(evt.id)
    const { error } = await supabase.from('events').delete().eq('id', evt.id)
    if (error) {
      showToast(`Failed to delete event: ${error.message}`, 'error')
    } else {
      showToast(`✅ "${evt.title}" deleted`)
      if (selectedEventId === evt.id) setSelectedEventId(null)
      fetchEvents()
    }
    setActionLoading(null)
  }

  function startEditEvent(evt: EventRecord) {
    setEditingEventId(evt.id)
    setEditZoom(evt.zoom_link || '')
    // Convert ISO date to datetime-local format
    setEditDate(evt.event_date ? new Date(evt.event_date).toISOString().slice(0, 16) : '')
  }

  async function saveEditEvent() {
    if (!editingEventId) return
    setEditSaving(true)
    const { error } = await supabase
      .from('events')
      .update({
        zoom_link: editZoom.trim() || null,
        event_date: editDate || null,
      })
      .eq('id', editingEventId)
    if (error) {
      showToast(`Failed to update event: ${error.message}`, 'error')
    } else {
      showToast('✅ Event updated')
      setEditingEventId(null)
      fetchEvents()
    }
    setEditSaving(false)
  }

  async function handleEventRegAction(reg: EventRegistration, status: 'approved' | 'rejected', note?: string) {
    setActionLoading(reg.id)

    const updateData: Record<string, unknown> = { status }
    if (status === 'approved') updateData.approved_at = new Date().toISOString()
    if (note) updateData.status_note = note

    const { error } = await supabase
      .from('event_registrations')
      .update(updateData)
      .eq('id', reg.id)

    if (error) {
      showToast(`Failed to update: ${error.message}`, 'error')
      setActionLoading(null)
      return
    }

    // Re-fetch the event to get the latest zoom_link (may have been updated via inline edit)
    const { data: freshEvent } = await supabase
      .from('events')
      .select('title, zoom_link')
      .eq('id', reg.event_id)
      .single()

    // Send email
    fetch('/api/send-event-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: reg.email,
        full_name: reg.full_name,
        event_title: freshEvent?.title || 'Event',
        zoom_link: freshEvent?.zoom_link || null,
        status,
        status_note: note || null,
      }),
    }).catch(() => {})

    // Optimistic update
    setEventRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status, status_note: note || r.status_note, approved_at: status === 'approved' ? new Date().toISOString() : r.approved_at } : r))
    setEvtRejectingId(null)
    setEvtRejectReason('')
    showToast(status === 'approved' ? `✅ ${reg.full_name} approved` : `${reg.full_name} rejected`)
    setActionLoading(null)
    fetchEvents() // refresh counts
  }

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="marble-bg" />
        <div className="loading-screen">
          <div className="loading-spinner" />
        </div>
      </>
    )
  }

  if (denied) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="marble-bg" />
        <div className="denied-screen">
          <div className="denied-card">
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⛔</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: '#f0e6d0', margin: '0 0 8px' }}>
              Access Denied
            </h1>
            <p style={{ color: '#9a917e', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>
              You do not have permission to view this page.
            </p>
            <button onClick={() => router.push('/')} className="btn-outline">
              Go Back
            </button>
          </div>
        </div>
      </>
    )
  }

  if (!authorized) return null

  const adminUserIds = new Set(adminUsers.map(a => a.user_id))

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'IB Overview' },
    { key: 'pending', label: `Pending (${pendingIBs.length})` },
    { key: 'upgrade', label: 'Upgrade to Admin' },
    { key: 'events', label: 'Events' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      {/* Toast */}
      {toast.visible && (
        <div className={`toast-float ${toast.type === 'error' ? 'toast-float-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-wrap">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <img src={SYSTM8_LOGO} className="admin-logo" alt="SYSTM8" />
            <div>
              <div className="admin-title">Admin Console</div>
              <div className="admin-subtitle">SYSTM8</div>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="back-btn">
            ✕ Close
          </button>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`admin-tab ${activeTab === tab.key ? 'admin-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="admin-content">
          {/* ─── IB Overview ─── */}
          {activeTab === 'overview' && (
            <>
              <div className="stat-card">
                <span className="stat-number">{approvedIBs.length}</span>
                <span className="stat-label">Approved IBs</span>
              </div>

              <div className="stat-card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th className="hide-mobile">UID</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedIBs.map(ib => (
                      <tr key={ib.id}>
                        <td>{ib.name || ib.full_name || '—'}</td>
                        <td className="td-secondary">{ib.email}</td>
                        <td className="td-mono hide-mobile">{ib.referral_link || '—'}</td>
                        <td><span className="badge badge-approved">Approved</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {ib.slug ? (
                              <button onClick={() => window.open(`https://primeverseaccess.com/${ib.slug}`, '_blank')} className="btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'rgba(212,165,55,0.3)', color: '#d4a537' }}>
                                View Page
                              </button>
                            ) : (
                              <span className="btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem', opacity: 0.4, cursor: 'default' }}>
                                No Page
                              </span>
                            )}
                            <button onClick={() => router.push(`/admin/impersonate?userId=${ib.user_id}`)} className="btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'rgba(212,165,55,0.3)', color: '#d4a537' }}>
                              View Dashboard
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {approvedIBs.length === 0 && (
                      <tr><td colSpan={5} className="empty-state">No approved IBs yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── Pending Approvals ─── */}
          {activeTab === 'pending' && (
            <>
              {pendingIBs.length === 0 && (
                <div className="card empty-state">No pending applications</div>
              )}
              {pendingIBs.map(ib => (
                <div key={ib.id} className="card">
                  <div className="card-name">{ib.name || ib.full_name || 'Unnamed'}</div>
                  <div className="card-email">{ib.email}</div>
                  <div className="card-meta">
                    <div>Referral: <span>{ib.referral_link || '—'}</span></div>
                    <div>Applied: <span>{new Date(ib.created_at).toLocaleDateString()}</span></div>
                  </div>

                  {rejectingId !== ib.id && (
                    <div className="card-actions">
                      <button
                        onClick={() => handleApprove(ib)}
                        disabled={actionLoading === ib.id}
                        className="btn-approve"
                      >
                        {actionLoading === ib.id ? <span className="spinner" /> : '✅'} Approve
                      </button>
                      <button
                        onClick={() => { setRejectingId(ib.id); setRejectReason('') }}
                        className="btn-reject"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {rejectingId === ib.id && (
                    <div className="reject-area">
                      <div className="reject-label">Rejection Reason</div>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                        className="reject-input"
                        rows={2}
                      />
                      <div className="reject-actions">
                        <button
                          onClick={() => handleReject(ib)}
                          disabled={!rejectReason.trim() || actionLoading === ib.id}
                          className="btn-reject"
                        >
                          {actionLoading === ib.id ? <span className="spinner" /> : null} Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason('') }}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ─── Upgrade to Admin ─── */}
          {activeTab === 'upgrade' && (
            <>
              {approvedIBs.length === 0 && (
                <div className="card empty-state">No approved IBs to upgrade</div>
              )}
              {approvedIBs.map(ib => {
                const isAlreadyAdmin = adminUserIds.has(ib.user_id)
                return (
                  <div key={ib.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div className="card-name">{ib.name || ib.full_name || 'Unnamed'}</div>
                      <div className="card-email">{ib.email}</div>
                    </div>
                    {isAlreadyAdmin ? (
                      <span className="btn-admin-label">Already Admin</span>
                    ) : (
                      <button onClick={() => setUpgradeModal(ib)} className="btn-upgrade">
                        Upgrade to Admin
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ─── Events ─── */}
          {activeTab === 'events' && (
            <>
              {/* Upcoming Events Overview */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#d4a537', marginBottom: 16 }}>
                  Upcoming Events
                </div>
                {events.length === 0 ? (
                  <div className="empty-state">No events created yet</div>
                ) : (
                  <div style={{ overflow: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Slug</th>
                          <th className="hide-mobile">Date</th>
                          <th className="hide-mobile">Zoom Link</th>
                          <th>Registrations</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(evt => (
                          <tr key={evt.id}>
                            <td style={{ fontWeight: 500 }}>{evt.title}</td>
                            <td>
                              <a href={`https://www.primeverseaccess.com/event/${evt.slug ?? ''}`} target="_blank" rel="noopener noreferrer" className="td-link">
                                /event/{evt.slug ?? ''}
                              </a>
                            </td>
                            <td className="td-secondary hide-mobile">
                              {evt.event_date
                                ? new Date(evt.event_date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC'
                                : <span style={{ color: '#f87171' }}>No date set</span>
                              }
                            </td>
                            <td className="td-secondary hide-mobile" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {(evt.zoom_link ?? '')
                                ? <a href={evt.zoom_link!} target="_blank" rel="noopener noreferrer" className="td-link" title={evt.zoom_link!}>{evt.zoom_link!.replace(/^https?:\/\//, '').slice(0, 30)}</a>
                                : <span style={{ color: '#f87171', fontWeight: 500 }}>Not set</span>
                              }
                            </td>
                            <td>
                              <span style={{ color: 'var(--text-primary)' }}>
                                {evt.total_registrations ?? 0}{evt.max_attendees ? ` / ${evt.max_attendees}` : ''}
                              </span>
                              {(evt.pending_count ?? 0) > 0 && (
                                <span style={{ color: 'var(--gold)', fontSize: '0.75rem', marginLeft: 4 }}>({evt.pending_count ?? 0} pending)</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${evt.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                                {evt.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => editingEventId === evt.id ? setEditingEventId(null) : startEditEvent(evt)}
                                  className="btn-outline"
                                  style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                                >
                                  {editingEventId === evt.id ? 'Cancel' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt)}
                                  disabled={actionLoading === evt.id}
                                  className="btn-reject"
                                  style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                                >
                                  {actionLoading === evt.id ? <span className="spinner" /> : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Inline edit form */}
                    {editingEventId && (() => {
                      const evt = events.find(e => e.id === editingEventId)
                      if (!evt) return null
                      return (
                        <div className="reject-area">
                          <div className="reject-label">Editing: {evt.title}</div>
                          <div className="evt-form-row" style={{ marginTop: 8 }}>
                            <div>
                              <label className="evt-label">Zoom Link</label>
                              <input
                                className="evt-input"
                                placeholder="https://zoom.us/j/..."
                                value={editZoom}
                                onChange={e => setEditZoom(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="evt-label">Event Date</label>
                              <input
                                className="evt-input"
                                type="datetime-local"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="reject-actions">
                            <button onClick={saveEditEvent} disabled={editSaving} className="btn-gold" style={{ padding: '6px 16px', fontSize: '0.78rem' }}>
                              {editSaving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
                            </button>
                            <button onClick={() => setEditingEventId(null)} className="btn-outline">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Create Event Form */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#d4a537', marginBottom: 16 }}>
                  Create New Event
                </div>
                <div className="evt-form">
                  <div className="evt-form-row">
                    <div>
                      <label className="evt-label">Title *</label>
                      <input
                        className="evt-input"
                        placeholder="e.g. SYSTM8 Launch Call"
                        value={evtTitle}
                        onChange={e => {
                          setEvtTitle(e.target.value)
                          if (!evtSlug || evtSlug === evtTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
                            setEvtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="evt-label">Slug *</label>
                      <input
                        className="evt-input"
                        placeholder="launch-call"
                        value={evtSlug}
                        onChange={e => setEvtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="evt-label">Description</label>
                    <textarea
                      className="evt-input"
                      placeholder="What is this event about?"
                      value={evtDesc}
                      onChange={e => setEvtDesc(e.target.value)}
                      rows={2}
                      style={{ resize: 'none' }}
                    />
                  </div>
                  <div className="evt-form-row">
                    <div>
                      <label className="evt-label">Event Date</label>
                      <input
                        className="evt-input"
                        type="datetime-local"
                        value={evtDate}
                        onChange={e => setEvtDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="evt-label">Zoom Link</label>
                      <input
                        className="evt-input"
                        placeholder="https://zoom.us/j/..."
                        value={evtZoom}
                        onChange={e => setEvtZoom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ maxWidth: 200 }}>
                    <label className="evt-label">Max Attendees</label>
                    <input
                      className="evt-input"
                      type="number"
                      placeholder="Optional"
                      value={evtMax}
                      onChange={e => setEvtMax(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      className="btn-gold"
                      onClick={handleCreateEvent}
                      disabled={evtCreating || !evtTitle.trim() || !evtSlug.trim()}
                    >
                      {evtCreating ? <><span className="spinner" /> Creating...</> : 'Create Event'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Registrations */}
              <div className="card">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#d4a537', marginBottom: 16 }}>
                  Event Registrations
                </div>

                {/* Event selector dropdown */}
                <div style={{ marginBottom: 16 }}>
                  <label className="evt-label">Select Event</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      className="evt-select"
                      style={{ flex: 1 }}
                      value={selectedEventId || ''}
                      onChange={e => setSelectedEventId(e.target.value || null)}
                    >
                      <option value="">— Choose an event —</option>
                      {events.map(evt => (
                        <option key={evt.id} value={evt.id}>
                          {evt.title} ({evt.total_registrations ?? 0}{evt.max_attendees ? ` / ${evt.max_attendees}` : ''} registered, {evt.pending_count ?? 0} pending)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => fetchEvents()}
                      className="btn-outline"
                      style={{ padding: '7px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {selectedEventId && (
                  <>
                    {eventRegsLoading ? (
                      <div className="empty-state"><span className="spinner" /></div>
                    ) : eventRegs.length === 0 ? (
                      <div className="empty-state">No registrations yet</div>
                    ) : (
                      <div style={{ overflow: 'auto' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Full Name</th>
                              <th>Email</th>
                              <th className="hide-mobile">UID</th>
                              <th>Registered</th>
                              <th>Status</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventRegs.map(reg => (
                              <tr key={reg.id}>
                                <td>{reg.full_name}</td>
                                <td className="td-secondary">{reg.email}</td>
                                <td className="td-mono hide-mobile">{reg.uid || '—'}</td>
                                <td className="td-secondary">{new Date(reg.created_at).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${reg.status === 'approved' ? 'badge-approved' : reg.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                                    {reg.status}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {reg.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => handleEventRegAction(reg, 'approved')}
                                        disabled={actionLoading === reg.id}
                                        className="btn-approve"
                                        style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                                      >
                                        {actionLoading === reg.id ? <span className="spinner" /> : null} Approve
                                      </button>
                                      <button
                                        onClick={() => { setEvtRejectingId(reg.id); setEvtRejectReason('') }}
                                        className="btn-reject"
                                        style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Inline reject reason */}
                        {evtRejectingId && (() => {
                          const reg = eventRegs.find(r => r.id === evtRejectingId)
                          if (!reg) return null
                          return (
                            <div className="reject-area">
                              <div className="reject-label">Rejection reason for {reg.full_name}</div>
                              <textarea
                                value={evtRejectReason}
                                onChange={e => setEvtRejectReason(e.target.value)}
                                placeholder="Enter the reason for rejection..."
                                className="reject-input"
                                rows={2}
                              />
                              <div className="reject-actions">
                                <button
                                  onClick={() => handleEventRegAction(reg, 'rejected', evtRejectReason)}
                                  disabled={actionLoading === reg.id}
                                  className="btn-reject"
                                >
                                  {actionLoading === reg.id ? <span className="spinner" /> : null} Confirm Reject
                                </button>
                                <button
                                  onClick={() => { setEvtRejectingId(null); setEvtRejectReason('') }}
                                  className="btn-outline"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upgrade confirmation modal */}
      {upgradeModal && (
        <div className="modal-backdrop" onClick={() => setUpgradeModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Confirm Admin Upgrade</div>
            <p className="modal-text">
              Are you sure you want to give <strong>{upgradeModal.name || upgradeModal.full_name || upgradeModal.email}</strong> admin access?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => handleUpgrade(upgradeModal)}
                disabled={actionLoading === upgradeModal.id}
                className="btn-gold"
              >
                {actionLoading === upgradeModal.id ? <span className="spinner" /> : 'Confirm'}
              </button>
              <button onClick={() => setUpgradeModal(null)} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
