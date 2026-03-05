'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ─────────────────────────────────────────────
   STYLES
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
    --input-focus: rgba(212, 165, 55, 0.5);
    --success-bg: rgba(74, 157, 90, 0.1);
    --success-border: rgba(74, 157, 90, 0.25);
    --success-text: #6dc07f;
    --warning-bg: rgba(212, 165, 55, 0.08);
    --warning-border: rgba(212, 165, 55, 0.2);
    --warning-text: var(--gold-light);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
  }

  .marble-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35, 28, 18, 0.5) 0%, transparent 50%),
      linear-gradient(137deg, transparent 30%, rgba(212, 165, 55, 0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212, 165, 55, 0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180, 140, 45, 0.03) 57%, transparent 59%),
      linear-gradient(78deg, transparent 20%, rgba(160, 120, 24, 0.025) 22%, transparent 24%),
      linear-gradient(195deg, transparent 65%, rgba(212, 165, 55, 0.03) 66.5%, transparent 68%),
      linear-gradient(142deg, transparent 40%, rgba(255, 255, 255, 0.012) 40.2%, transparent 40.4%),
      linear-gradient(320deg, transparent 25%, rgba(255, 255, 255, 0.01) 25.15%, transparent 25.3%),
      linear-gradient(85deg, transparent 60%, rgba(255, 255, 255, 0.008) 60.1%, transparent 60.2%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }
  .marble-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(165deg, transparent 28%, rgba(212, 165, 55, 0.02) 28.5%, transparent 29%),
      linear-gradient(245deg, transparent 52%, rgba(200, 155, 50, 0.025) 52.8%, transparent 53.5%),
      linear-gradient(10deg, transparent 70%, rgba(180, 135, 40, 0.02) 70.3%, transparent 70.6%),
      linear-gradient(290deg, transparent 35%, rgba(212, 165, 55, 0.015) 35.5%, transparent 36%);
    opacity: 0.8;
  }
  .marble-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.5;
  }

  .dash-wrap {
    position: relative;
    z-index: 1;
    max-width: 960px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--card-border);
  }
  .dash-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 2px 12px rgba(212, 165, 55, 0.15);
  }
  .avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(212, 165, 55, 0.1);
    border: 2px solid var(--gold-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--gold);
  }
  .dash-username {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }
  .dash-email {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  /* ── Brushed Gold Buttons ── */
  .gold-btn {
    position: relative;
    padding: 0.7rem 1.4rem;
    border: none;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    color: #0a0804;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: linear-gradient(135deg,
      #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%,
      #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%);
    background-size: 200% 200%;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.15) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset,
      0 4px 16px rgba(160, 120, 24, 0.25),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .gold-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px);
    border-radius: inherit;
    pointer-events: none;
  }
  .gold-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -75%;
    width: 50%;
    height: 200%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 58%, transparent 70%);
    transform: skewX(-20deg);
    transition: left 0.7s ease;
    pointer-events: none;
  }
  .gold-btn:hover::after { left: 125%; }
  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset,
      0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3);
  }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .gold-btn:disabled::after { display: none; }
  .gold-btn-sm { padding: 0.5rem 1rem; font-size: 0.78rem; }

  .btn-outline {
    padding: 0.55rem 1.1rem;
    background: transparent;
    border: 1px solid var(--card-border);
    border-radius: 8px;
    color: var(--text-secondary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.3s;
  }
  .btn-outline:hover {
    border-color: rgba(212, 165, 55, 0.4);
    color: var(--gold-light);
  }

  .btn-success {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    color: #fff;
    background: linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #2e7d32 100%);
    box-shadow: 0 2px 10px rgba(46, 125, 50, 0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46, 125, 50, 0.4); }
  .btn-success:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--card-border);
  }
  .tab-btn {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 0.88rem;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.3s;
  }
  .tab-btn:hover { color: var(--gold-light); }
  .tab-btn.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
    font-weight: 600;
  }

  /* ── Cards ── */
  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 1.75rem;
    backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(212, 165, 55, 0.04) inset, 0 12px 40px rgba(0, 0, 0, 0.25);
    margin-bottom: 1.5rem;
  }
  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.25rem;
    letter-spacing: 0.03em;
  }

  /* ── Inputs ── */
  .field-input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
  }
  .field-textarea {
    width: 100%;
    padding: 0.7rem 0.9rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    outline: none;
    resize: vertical;
    line-height: 1.65;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-textarea::placeholder { color: var(--text-dim); }
  .field-textarea:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
  }
  .field-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.4rem;
  }
  .field-group { margin-bottom: 1rem; }

  /* ── Lead items ── */
  .lead-item {
    background: rgba(15, 13, 10, 0.5);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 0.6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color 0.3s;
  }
  .lead-item:hover { border-color: rgba(212, 165, 55, 0.25); }
  .lead-item-pending { border-left: 3px solid var(--gold); }
  .lead-item-approved { border-left: 3px solid var(--success-text); }
  .lead-name { font-weight: 600; font-size: 0.92rem; color: var(--text-primary); }
  .lead-detail { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .lead-uid { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }
  .lead-uid strong { color: var(--text-secondary); }
  .lead-date { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

  .section-header {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .badge {
    font-family: 'Outfit', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 10px;
  }
  .badge-warning { background: var(--warning-bg); color: var(--warning-text); border: 1px solid var(--warning-border); }
  .badge-success { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-border); }
  .empty-text { color: var(--text-dim); font-size: 0.85rem; }

  /* ── Profile ── */
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }

  .upload-area {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(212, 165, 55, 0.06);
    border: 2px dashed rgba(212, 165, 55, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    transition: border-color 0.3s;
  }
  .upload-area:hover { border-color: var(--gold); }
  .upload-area img { width: 100%; height: 100%; object-fit: cover; }

  .url-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--input-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--input-bg);
  }
  .url-prefix {
    padding: 0.7rem 0.7rem;
    background: rgba(212, 165, 55, 0.06);
    color: var(--text-dim);
    font-size: 0.75rem;
    border-right: 1px solid var(--input-border);
    white-space: nowrap;
  }
  .url-input-wrap input {
    flex: 1;
    padding: 0.7rem 0.75rem;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
  }
  .url-input-wrap:focus-within {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
  }

  /* ── AI Chat ── */
  .ai-panel {
    border: 1px solid var(--card-border);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 500px;
    backdrop-filter: blur(24px);
  }
  .ai-header {
    padding: 0.85rem 1.1rem;
    background: rgba(15, 12, 8, 0.9);
    border-bottom: 1px solid var(--card-border);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-header .sparkle { color: var(--gold); font-size: 1rem; }
  .ai-header .powered { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); font-weight: 400; }
  .ai-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background: rgba(8, 8, 6, 0.5);
  }
  .ai-bubble {
    max-width: 88%;
    padding: 0.65rem 0.9rem;
    font-size: 0.82rem;
    line-height: 1.65;
    white-space: pre-wrap;
  }
  .ai-bubble-user {
    align-self: flex-end;
    background: rgba(212, 165, 55, 0.15);
    color: var(--text-primary);
    border-radius: 14px 14px 4px 14px;
    border: 1px solid rgba(212, 165, 55, 0.2);
  }
  .ai-bubble-ai {
    align-self: flex-start;
    background: rgba(20, 18, 14, 0.8);
    color: var(--text-primary);
    border-radius: 14px 14px 14px 4px;
    border: 1px solid var(--card-border);
  }
  .ai-input-row {
    padding: 0.65rem 0.75rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    gap: 8px;
    background: rgba(10, 10, 8, 0.8);
  }
  .ai-input {
    flex: 1;
    padding: 0.55rem 0.9rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 20px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    outline: none;
  }
  .ai-input:focus { border-color: var(--input-focus); }
  .ai-send-btn {
    padding: 0.55rem 1.1rem;
    border: none;
    border-radius: 20px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .ai-placeholder {
    background: rgba(15, 13, 10, 0.4);
    border: 1px dashed var(--card-border);
    border-radius: 12px;
    padding: 2.5rem;
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .ai-placeholder .sparkle-big { font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--gold); }
  .ai-placeholder h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.6rem;
  }
  .ai-placeholder p {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 1.25rem;
    max-width: 260px;
  }

  .gold-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
  .gold-link:hover { color: var(--gold-light); text-decoration: underline; }

  .profile-saved-text {
    text-align: center;
    margin-top: 0.75rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .loading-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .loading-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    color: var(--gold);
    letter-spacing: 0.1em;
    animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @media (max-width: 640px) {
    .dash-wrap { padding: 1.5rem 1rem 3rem; }
    .dash-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .header-actions { width: 100%; }
  }
`;

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [distributor, setDistributor] = useState<any>(null)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadUid, setLeadUid] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'leads' | 'profile'>('leads')

  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSlug, setProfileSlug] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showAI, setShowAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<{role: string, content: string}[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/login'); return }
      const userId = userData.user.id
      const email = userData.user.email!
      const { data: existing } = await supabase.from('distributors').select('*').eq('user_id', userId).single()
      let dist = existing
      if (!existing) {
        const { data: newDist, error } = await supabase.from('distributors').insert({ name: email.split('@')[0], email, user_id: userId }).select().single()
        if (error) { alert(error.message); return }
        dist = newDist
      }
      setDistributor(dist)
      setProfileName(dist.name || '')
      setProfileBio(dist.bio || '')
      setProfileSlug(dist.slug || '')
      setProfileImage(dist.profile_image || null)
      await fetchLeads(dist.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchLeads = async (distributorId: string) => {
    const { data } = await supabase.from('leads').select('*').eq('distributor_id', distributorId).order('created_at', { ascending: false })
    setLeads(data || [])
  }

  const addLead = async () => {
    if (!distributor || !leadName || !leadEmail || !leadUid) { alert('Fyll inn alle feltene'); return }
    setSubmitting(true)
    const { error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: leadName, email: leadEmail, uid: leadUid, uid_verified: false })
    if (error) { alert('Feil: ' + error.message); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName, leadEmail, leadUid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setLeadName(''); setLeadEmail(''); setLeadUid('')
    setSubmitting(false)
    await fetchLeads(distributor.id)
  }

  const approveLead = async (lead: any) => {
    setApprovingId(lead.id)
    const { error } = await supabase.from('leads').update({ uid_verified: true, uid_verified_at: new Date().toISOString() }).eq('id', lead.id)
    if (error) { alert('Feil: ' + error.message); setApprovingId(null); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'approved', leadName: lead.name, leadEmail: lead.email, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setApprovingId(null)
    await fetchLeads(distributor.id)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `${distributor.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { alert('Feil ved opplasting: ' + uploadError.message); setUploadingImage(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setProfileImage(data.publicUrl)
    setUploadingImage(false)
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, slug: profileSlug, profile_image: profileImage }).eq('id', distributor.id)
    if (error) { alert('Feil: ' + error.message); setSavingProfile(false); return }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, slug: profileSlug, profile_image: profileImage })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const startAI = () => {
    setShowAI(true)
    if (aiMessages.length === 0) {
      setAiMessages([{ role: 'assistant', content: "Hi! I'm here to help you write a bio that converts. Tell me a little about yourself \u2014 where are you from, what is your background, and why did you join 1Move Academy?" }])
    }
  }

  const askAI = async () => {
    if (!aiInput.trim()) return
    const userMsg = aiInput.trim()
    setAiInput('')
    setAiLoading(true)
    const newMessages = [...aiMessages, { role: 'user', content: userMsg }]
    setAiMessages(newMessages)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are a conversion copywriter helping a 1Move Academy representative write their personal bio for a landing page. The bio will appear where people sign up for PrimeVerse, a premium trading education ecosystem. Help them write a bio that is authentic, inspiring, and optimized for conversion. It should feel personal, warm, and credible. 3-5 sentences. Ask follow-up questions to make it personal. When ready, write the bio and prefix it with exactly: "Here is your bio:" followed by the bio in quotes.',
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Something went wrong, try again.'
      const updated = [...newMessages, { role: 'assistant', content: reply }]
      setAiMessages(updated)
      const match = reply.match(/Here is your bio:\s*"([\s\S]+?)"/)
      if (match) setProfileBio(match[1].trim())
    } catch {
      setAiMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    }
    setAiLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />
      <div className="loading-screen">
        <span className="loading-text">Laster...</span>
      </div>
    </>
  )

  const pending = leads.filter(l => !l.uid_verified)
  const approved = leads.filter(l => l.uid_verified)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      <div className="dash-wrap">

        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-header-left">
            {distributor?.profile_image ? (
              <img src={distributor.profile_image} className="avatar" alt="" />
            ) : (
              <div className="avatar-placeholder">{'\u{1F464}'}</div>
            )}
            <div>
              <div className="dash-username">{distributor?.name || 'Dashboard'}</div>
              <div className="dash-email">{distributor?.email}</div>
            </div>
          </div>
          <div className="header-actions">
            {distributor?.slug && (
              <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-btn gold-btn-sm">
                Se min side {'\u2197'}
              </a>
            )}
            <button onClick={handleLogout} className="btn-outline">Logg ut</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {(['leads', 'profile'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            >
              {tab === 'leads' ? `Leads (${leads.length})` : 'Min profil'}
            </button>
          ))}
        </div>

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <>
            <div className="card">
              <div className="card-title">Registrer nytt lead manuelt</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <input className="field-input" placeholder="Fullt navn" value={leadName} onChange={e => setLeadName(e.target.value)} />
                <input className="field-input" placeholder="Epostadresse" type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
                <input className="field-input" placeholder="UID fra PuPrime broker" value={leadUid} onChange={e => setLeadUid(e.target.value)} />
                <button onClick={addLead} disabled={submitting} className="gold-btn" style={{ marginTop: 4 }}>
                  {submitting ? 'Sender...' : 'Legg til lead'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                {'\u23F3'} Venter p\u00e5 verifisering
                <span className="badge badge-warning">{pending.length}</span>
              </div>
              {pending.length === 0 && <p className="empty-text">Ingen leads venter.</p>}
              {pending.map(lead => (
                <div key={lead.id} className="lead-item lead-item-pending">
                  <div>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-detail">{lead.email}</div>
                    <div className="lead-uid">UID: <strong>{lead.uid || 'Ikke oppgitt'}</strong></div>
                    <div className="lead-date">{new Date(lead.created_at).toLocaleDateString('no-NO')}</div>
                  </div>
                  <button onClick={() => approveLead(lead)} disabled={approvingId === lead.id} className="btn-success">
                    {approvingId === lead.id ? 'Sender...' : '\u2713 Godkjenn'}
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="section-header">
                {'\u2705'} Godkjente members
                <span className="badge badge-success">{approved.length}</span>
              </div>
              {approved.length === 0 && <p className="empty-text">Ingen godkjente enn\u00e5.</p>}
              {approved.map(lead => (
                <div key={lead.id} className="lead-item lead-item-approved">
                  <div>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-detail">{lead.email}</div>
                    <div className="lead-uid">UID: <strong>{lead.uid}</strong></div>
                    <div className="lead-date">Godkjent: {lead.uid_verified_at ? new Date(lead.uid_verified_at).toLocaleDateString('no-NO') : '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-grid">
            <div>
              <div className="card-title" style={{ marginBottom: '1.25rem' }}>Rediger profil</div>

              <div className="field-group" style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">Profilbilde</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                  <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    {profileImage ? (
                      <img src={profileImage} alt="" />
                    ) : (
                      <span style={{ fontSize: 24, color: 'var(--gold)' }}>{uploadingImage ? '\u23F3' : '\u{1F4F7}'}</span>
                    )}
                  </div>
                  <div>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="gold-btn gold-btn-sm">
                      {uploadingImage ? 'Laster opp...' : profileImage ? 'Bytt bilde' : 'Last opp bilde'}
                    </button>
                    <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>JPG eller PNG {'\u00B7'} Maks 5MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Fullt navn</label>
                <input className="field-input" value={profileName} onChange={e => setProfileName(e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label">Din URL</label>
                <div className="url-input-wrap">
                  <span className="url-prefix">primeverseaccess.com/</span>
                  <input value={profileSlug} onChange={e => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="ditt-navn" />
                </div>
              </div>

              <div className="field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="field-label" style={{ marginBottom: 0 }}>Bio</label>
                  <button
                    onClick={() => { if (!showAI) startAI(); else setShowAI(false); }}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 12px',
                      background: showAI ? 'rgba(212, 165, 55, 0.15)' : 'transparent',
                      color: showAI ? 'var(--gold)' : 'var(--text-secondary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 20,
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500,
                      transition: 'all 0.3s'
                    }}
                  >
                    {'\u2726'} AI hjelper deg
                  </button>
                </div>
                <textarea
                  className="field-textarea"
                  value={profileBio}
                  onChange={e => setProfileBio(e.target.value)}
                  placeholder={'Fortell hvem du er og hva dine members kan forvente av deg...'}
                  rows={6}
                />
              </div>

              <button onClick={saveProfile} disabled={savingProfile} className="gold-btn" style={{ width: '100%' }}>
                {savingProfile ? 'Lagrer...' : profileSaved ? '\u2713 Lagret!' : 'Lagre profil'}
              </button>

              {distributor?.slug && (
                <p className="profile-saved-text">
                  Din side: <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-link">primeverseaccess.com/{distributor.slug}</a>
                </p>
              )}
            </div>

            <div>
              {showAI ? (
                <div className="ai-panel">
                  <div className="ai-header">
                    <span className="sparkle">{'\u2726'}</span> Bio-assistent
                    <span className="powered">Powered by Claude</span>
                  </div>
                  <div className="ai-messages">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`ai-bubble ${msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-ai'}`}>
                        {msg.content}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="ai-bubble ai-bubble-ai" style={{ color: 'var(--text-dim)' }}>Skriver...</div>
                    )}
                  </div>
                  <div className="ai-input-row">
                    <input
                      className="ai-input"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI() } }}
                      placeholder="Skriv her... (Enter for \u00e5 sende)"
                    />
                    <button onClick={askAI} disabled={aiLoading || !aiInput.trim()} className="ai-send-btn">
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <div className="sparkle-big">{'\u2726'}</div>
                  <h3>AI Bio-assistent</h3>
                  <p>Claude stiller deg noen sp\u00f8rsm\u00e5l og skriver en bio som er personlig og optimert for konvertering.</p>
                  <button onClick={startAI} className="gold-btn">
                    Start AI-assistenten
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
