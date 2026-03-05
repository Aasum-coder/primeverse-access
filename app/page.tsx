'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

  // Profile state
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSlug, setProfileSlug] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI bio assistant
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

  if (loading) return <p style={{ padding: 40 }}>Laster...</p>

  const pending = leads.filter(l => !l.uid_verified)
  const approved = leads.filter(l => l.uid_verified)

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {distributor?.profile_image ? (
            <img src={distributor.profile_image} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c' }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>{distributor?.name || 'Dashboard'}</h1>
            <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>{distributor?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {distributor?.slug && (
            <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: '#c9a84c', color: '#000', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Se min side ↗
            </a>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Logg ut</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: 32 }}>
        {(['leads', 'profile'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent', fontWeight: activeTab === tab ? 600 : 400, fontSize: 14, cursor: 'pointer', color: activeTab === tab ? '#111' : '#888', marginBottom: -1 }}>
            {tab === 'leads' ? `Leads (${leads.length})` : 'Min profil'}
          </button>
        ))}
      </div>

      {/* ── LEADS TAB ── */}
      {activeTab === 'leads' && (
        <>
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: 28, marginBottom: 40 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Registrer nytt lead manuelt</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <input placeholder="Fullt navn" value={leadName} onChange={e => setLeadName(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              <input placeholder="Epostadresse" type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              <input placeholder="UID fra PuPrime broker" value={leadUid} onChange={e => setLeadUid(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              <button onClick={addLead} disabled={submitting} style={{ padding: 12, background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Sender...' : 'Legg til lead'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              ⏳ Venter på verifisering
              <span style={{ marginLeft: 8, background: '#fff3cd', color: '#856404', fontSize: 12, padding: '2px 8px', borderRadius: 10 }}>{pending.length}</span>
            </h2>
            {pending.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Ingen leads venter.</p>}
            {pending.map(lead => (
              <div key={lead.id} style={{ background: '#fff', border: '1px solid #f0e68c', borderRadius: 8, padding: 20, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{lead.name}</strong>
                  <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{lead.email}</div>
                  <div style={{ color: '#555', fontSize: 13, marginTop: 2 }}>UID: <strong>{lead.uid || 'Ikke oppgitt'}</strong></div>
                  <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{new Date(lead.created_at).toLocaleDateString('no-NO')}</div>
                </div>
                <button onClick={() => approveLead(lead)} disabled={approvingId === lead.id} style={{ padding: '10px 20px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                  {approvingId === lead.id ? 'Sender...' : '✓ Godkjenn'}
                </button>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              ✅ Godkjente members
              <span style={{ marginLeft: 8, background: '#d4edda', color: '#155724', fontSize: 12, padding: '2px 8px', borderRadius: 10 }}>{approved.length}</span>
            </h2>
            {approved.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Ingen godkjente ennå.</p>}
            {approved.map(lead => (
              <div key={lead.id} style={{ background: '#fff', border: '1px solid #c3e6cb', borderRadius: 8, padding: 20, marginBottom: 10 }}>
                <strong style={{ fontSize: 15 }}>{lead.name}</strong>
                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{lead.email}</div>
                <div style={{ color: '#555', fontSize: 13, marginTop: 2 }}>UID: <strong>{lead.uid}</strong></div>
                <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Godkjent: {lead.uid_verified_at ? new Date(lead.uid_verified_at).toLocaleDateString('no-NO') : '-'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* LEFT — form */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Rediger profil</h2>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Profilbilde</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0f0f0', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}>
                  {profileImage ? (
                    <img src={profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{uploadingImage ? '⏳' : '📷'}</span>
                  )}
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                    {uploadingImage ? 'Laster opp...' : profileImage ? 'Bytt bilde' : 'Last opp bilde'}
                  </button>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#aaa' }}>JPG eller PNG · Maks 5MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Fullt navn</label>
              <input value={profileName} onChange={e => setProfileName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Din URL</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
                <span style={{ padding: '10px 10px', background: '#f5f5f5', color: '#888', fontSize: 12, borderRight: '1px solid #ddd', whiteSpace: 'nowrap' }}>primeverseaccess.com/</span>
                <input value={profileSlug} onChange={e => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="ditt-navn" style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: 14 }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Bio</label>
                <button onClick={() => { setShowAI(!showAI); if (!showAI && aiMessages.length === 0) setAiMessages([{ role: 'assistant', content: "Hi! I am here to help you write a bio that converts. Tell me a little about yourself — where are you from, what is your background, and why did you join 1Move Academy?" }]) }} style={{ fontSize: 12, padding: '4px 12px', background: showAI ? '#111' : '#f5f5f5', color: showAI ? '#fff' : '#555', border: '1px solid #ddd', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>
                  ✦ AI hjelper deg
                </button>
              </div>
              <textarea
                value={profileBio}
                onChange={e => setProfileBio(e.target.value)}
                placeholder={'Fortell hvem du er og hva dine members kan forvente av deg...\n\nEksempel: "Jeg er Richard Aasum, en lidenskapelig trader og mentor fra Norge. Mitt mål er å hjelpe 100 000 mennesker til finansiell frihet gjennom utdanning og de riktige verktøyene."'}
                rows={6}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, resize: 'vertical', lineHeight: 1.65, boxSizing: 'border-box', color: profileBio ? '#111' : '#aaa' }}
              />
            </div>

            <button onClick={saveProfile} disabled={savingProfile} style={{ width: '100%', padding: 13, background: profileSaved ? '#2e7d32' : '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s' }}>
              {savingProfile ? 'Lagrer...' : profileSaved ? '✓ Lagret!' : 'Lagre profil'}
            </button>

            {distributor?.slug && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#888', textAlign: 'center' }}>
                Din side: <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a84c' }}>primeverseaccess.com/{distributor.slug}</a>
              </p>
            )}
          </div>

          {/* RIGHT — AI assistant */}
          <div>
            {showAI ? (
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
                <div style={{ padding: '14px 18px', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#c9a84c', fontSize: 16 }}>✦</span> Bio-assistent
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555', fontWeight: 400 }}>Powered by Claude</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#fafafa' }}>
                  {aiMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? '#111' : '#fff', color: msg.role === 'user' ? '#fff' : '#111', fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: 'flex' }}>
                      <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#fff', fontSize: 13, color: '#aaa' }}>Skriver...</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #eee', display: 'flex', gap: 8, background: '#fff' }}>
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI() } }}
                    placeholder="Skriv her... (Enter for å sende)"
                    style={{ flex: 1, padding: '9px 14px', border: '1px solid #e8e8e8', borderRadius: 20, fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={askAI} disabled={aiLoading || !aiInput.trim()} style={{ padding: '9px 18px', background: '#c9a84c', color: '#000', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: aiLoading || !aiInput.trim() ? 0.5 : 1 }}>
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fafafa', border: '1px dashed #ddd', borderRadius: 10, padding: 36, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>✦</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>AI Bio-assistent</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: 20, maxWidth: 240 }}>Claude stiller deg noen spørsmål og skriver en bio som er personlig og optimert for konvertering.</p>
                <button onClick={() => { setShowAI(true); if (aiMessages.length === 0) setAiMessages([{ role: 'assistant', content: "Hi! I am here to help you write a bio that converts. Tell me a little about yourself — where are you from, what is your background, and why did you join 1Move Academy?" }]) }} style={{ padding: '11px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Start AI-assistenten
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  )
}
