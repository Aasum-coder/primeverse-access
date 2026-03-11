'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function buildClaudePrompt(input: {
  name: string
  email: string
  referralLink: string
  bio: string
  direction: string
  profileImage: string
}) {
  const { name, email, referralLink, bio, direction, profileImage } = input

  return `You are a professional conversion-focused landing page developer.

Create ONE complete, production-ready, mobile-responsive landing page.

Goal:
- Explain who we are and what the visitor can expect.
- Collect name + email + consent
- Then redirect to broker registration via the distributor IB link.
- After registration, the user returns to the same landing page to submit UID (a simple UID form section, not the verification workflow).

Brand & Style:
- Premium, minimal, modern
- Black / Gold / White palette
- Clean typography, lots of spacing
- Mobile-first, fast, clear CTA

Distributor details (must be used):
- Name: ${name}
- Contact Email: ${email}
- IB Link (broker registration): ${referralLink}
- Profile Image URL: ${profileImage || '(none provided)'}
- Personal Direction/Angle: ${direction || '(not provided)'}
- Short Bio: ${bio || '(not provided)'}

Page requirements:
1) Hero
- Headline: "Get Access to PrimeVerse"
- Subheadline mentioning distributor name
- Show profile image if provided
- Primary CTA button: "Get Access Now"

2) Get Access Flow (must be included)
- Clicking "Get Access Now" opens an on-page form (modal or section).
- Form fields:
  - Full name
  - Email
  - Checkbox: "I accept the Terms & Conditions"
  - Checkbox: "I have read and understand the risk disclaimer"
  - Checkbox: "I consent to receiving community updates by email (no data sharing outside our ecosystem)"
- On submit:
  - Show a short confirmation message
  - Immediately redirect to: ${referralLink}

3) Instructions section (must be clear & step-by-step)
- After broker registration:
  - Complete KYC
  - Save your UID
  - Return to this page to submit UID for verification

4) UID Submit Section (simple)
- A section titled "Submit Your UID"
- Fields:
  - UID
  - Email (prefill if possible)
- Button: "Request Verification"
- On submit:
  - Show message: "Request received. If not found, wait 24 hours. If still not found, contact support via puprimelive.com."

5) Footer (compliance)
- Risk disclaimer (short)
- Cookie notice (short)
- IP logging disclosure (short)
- Contact email: ${email}
- A "Data Deletion Request" mailto link: mailto:${email}?subject=Data%20Deletion%20Request

Technical requirements:
- Output must be a single, standalone HTML file.
- Include CSS inside <style>.
- Include JavaScript inside <script>.
- No external frameworks, no React, no Tailwind, no CDNs.
- Must be fully responsive and look great on mobile.
- No explanations. Return ONLY the final HTML.`
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8,8,8,0.75);
    --card-border: rgba(212,165,55,0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --text-dim: #5a5347;
    --input-bg: rgba(20,18,14,0.8);
    --input-border: rgba(212,165,55,0.2);
    --input-focus: rgba(212,165,55,0.5);
    --success-bg: rgba(74,157,90,0.1);
    --success-border: rgba(74,157,90,0.25);
    --success-text: #6dc07f;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
  }

  .marble-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30,25,18,0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25,20,14,0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35,28,18,0.5) 0%, transparent 50%),
      linear-gradient(137deg, transparent 30%, rgba(212,165,55,0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212,165,55,0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180,140,45,0.03) 57%, transparent 59%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }
  .marble-bg::after {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px; opacity: 0.5;
  }

  .factory-wrap {
    position: relative; z-index: 1;
    max-width: 860px; margin: 0 auto;
    padding: 2.5rem 1.5rem 5rem;
  }

  /* Header */
  .factory-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2.5rem; padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--card-border);
    flex-wrap: wrap; gap: 12px;
  }
  .factory-header-left { display: flex; align-items: center; gap: 14px; }
  .factory-avatar {
    width: 46px; height: 46px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 2px 12px rgba(212,165,55,0.15);
  }
  .factory-avatar-placeholder {
    width: 46px; height: 46px; border-radius: 50%;
    background: rgba(212,165,55,0.08); border: 2px solid var(--gold-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .factory-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem; font-weight: 600;
    color: var(--text-primary); letter-spacing: 0.02em;
  }
  .factory-subtitle { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }

  .url-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(212,165,55,0.06); border: 1px solid var(--card-border);
    border-radius: 8px; padding: 7px 14px;
    font-size: 0.78rem; color: var(--gold);
    text-decoration: none; transition: border-color 0.3s;
  }
  .url-badge:hover { border-color: rgba(212,165,55,0.35); }

  /* Cards */
  .card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 14px; padding: 2rem; backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.25);
    margin-bottom: 1.5rem;
  }
  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.15rem; font-weight: 600;
    color: var(--text-primary); margin-bottom: 1.5rem; letter-spacing: 0.03em;
  }
  .card-label {
    display: block; font-size: 0.7rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.4rem;
  }
  .field-group { margin-bottom: 1rem; }

  .grid2 {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  /* Inputs */
  .field-input {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212,165,55,0.08);
    outline: 2px solid var(--gold); outline-offset: 1px;
  }
  .field-input[readonly] { color: var(--text-dim); cursor: default; }

  .field-textarea {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; resize: vertical; line-height: 1.65;
    transition: border-color 0.3s, box-shadow 0.3s; min-height: 110px;
  }
  .field-textarea::placeholder { color: var(--text-dim); }
  .field-textarea:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212,165,55,0.08);
    outline: 2px solid var(--gold); outline-offset: 1px;
  }

  .prompt-area {
    width: 100%; padding: 1rem; background: rgba(5,5,4,0.8);
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-family: 'Courier New', monospace;
    font-size: 0.78rem; outline: none; resize: vertical; line-height: 1.7;
    min-height: 220px;
  }

  /* Upload area */
  .upload-area {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(212,165,55,0.06); border: 2px dashed rgba(212,165,55,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; overflow: hidden; flex-shrink: 0; transition: border-color 0.3s;
  }
  .upload-area:hover { border-color: var(--gold); }
  .upload-area img { width: 100%; height: 100%; object-fit: cover; }

  /* Buttons */
  .gold-btn {
    position: relative; padding: 0.75rem 1.6rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer;
    overflow: hidden; color: #0a0804; text-decoration: none;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: linear-gradient(135deg, #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%, #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%);
    background-size: 200% 200%;
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset,
      0 4px 16px rgba(160,120,24,0.25), 0 1px 3px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .gold-btn::after {
    content: ''; position: absolute; top: -50%; left: -75%; width: 50%; height: 200%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 58%, transparent 70%);
    transform: skewX(-20deg); transition: left 0.7s ease; pointer-events: none;
  }
  .gold-btn:hover::after { left: 125%; }
  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset,
      0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3);
  }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .gold-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .gold-btn-sm { padding: 0.5rem 1.1rem; font-size: 0.78rem; }

  .btn-outline {
    padding: 0.7rem 1.4rem; background: transparent;
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.3s;
    display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
  }
  .btn-outline:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }
  .btn-outline:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost {
    padding: 0.7rem 1.2rem; background: transparent;
    border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
    color: var(--text-dim); font-family: 'Outfit', sans-serif;
    font-size: 0.83rem; cursor: pointer; transition: all 0.3s;
    display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
  }
  .btn-ghost:hover { border-color: rgba(212,165,55,0.2); color: var(--text-secondary); }
  .btn-ghost:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* Actions row */
  .actions-row {
    display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
    margin-bottom: 1.5rem;
  }

  /* Messages */
  .msg-ok {
    background: var(--success-bg); border: 1px solid var(--success-border);
    color: var(--success-text); border-radius: 8px; padding: 12px 16px; font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  .msg-err {
    background: rgba(180,50,50,0.1); border: 1px solid rgba(180,50,50,0.25);
    color: #f47c7c; border-radius: 8px; padding: 12px 16px; font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .hint { font-size: 0.72rem; color: var(--text-dim); margin-top: 5px; }

  /* Loading */
  .loading-screen {
    position: fixed; inset: 0; display: flex; align-items: center;
    justify-content: center; z-index: 10;
  }
  .loading-text {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem;
    color: var(--gold); letter-spacing: 0.1em; animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0;
    margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border-width: 0;
  }

  @media (max-width: 640px) {
    .factory-wrap { padding: 1.5rem 1rem 3rem; }
    .factory-header { flex-direction: column; align-items: flex-start; }
    .card { padding: 1.25rem; }
  }
`

export default function FactoryPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied, setCopied] = useState(false)

  const [distributor, setDistributor] = useState<any>(null)
  const [slug, setSlug] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [direction, setDirection] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      const authEmail = userData.user.email || ''
      setEmail(authEmail)

      const { data: existing } = await supabase
        .from('distributors')
        .select('*')
        .eq('email', authEmail)
        .single()

      if (existing) {
        setDistributor(existing)
        setName(existing.name || '')
        setReferralLink(existing.referral_link || '')
        setDirection(existing.direction || '')
        setBio(existing.bio || '')
        setProfileImage(existing.profile_image || '')
        const existingSlug = existing.slug || authEmail.split('@')[0].toLowerCase()
        setSlug(existingSlug)
        if (!existing.slug) {
          await supabase
            .from('distributors')
            .update({ slug: existingSlug })
            .eq('id', existing.id)
        }
      } else {
        const autoSlug = authEmail.split('@')[0].toLowerCase()
        setSlug(autoSlug)
        const { data: created } = await supabase
          .from('distributors')
          .insert({ name: authEmail.split('@')[0], email: authEmail, slug: autoSlug })
          .select()
          .single()

        setDistributor(created)
        setName(created?.name || '')
      }

      setLoading(false)
    }

    init()
  }, [router])

  const prompt = useMemo(
    () => buildClaudePrompt({ name, email, referralLink, bio, direction, profileImage }),
    [name, email, referralLink, bio, direction, profileImage]
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !distributor?.id) return
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
    if (!distributor?.id) return
    if (!name.trim() || !email.trim() || !referralLink.trim()) {
      setMessage('Fyll inn Navn, E-post og IB-link før du lagrer.')
      setIsError(true)
      return
    }

    setSaving(true)
    setMessage('')
    setIsError(false)

    const { error } = await supabase
      .from('distributors')
      .update({
        name: name.trim(),
        email: email.trim(),
        referral_link: referralLink.trim(),
        direction: direction.trim(),
        bio: bio.trim(),
        profile_image: profileImage.trim(),
      })
      .eq('id', distributor.id)

    setSaving(false)

    if (error) {
      setMessage(error.message)
      setIsError(true)
    } else {
      setMessage('Profil lagret!')
      setIsError(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const landingUrl = slug ? `primeverseaccess.com/${slug}` : ''

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="marble-bg" />
        <div className="loading-screen">
          <span className="loading-text">Laster...</span>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="marble-bg" />

      <div className="factory-wrap" id="main-content">

        {/* HEADER */}
        <header className="factory-header">
          <div className="factory-header-left">
            {profileImage ? (
              <img src={profileImage} className="factory-avatar" alt={name ? `Profilbilde av ${name}` : 'Profilbilde'} />
            ) : (
              <div className="factory-avatar-placeholder" aria-hidden="true">👤</div>
            )}
            <div>
              <div className="factory-title">Landing Factory</div>
              <div className="factory-subtitle">{name || email}</div>
            </div>
          </div>
          {landingUrl && (
            <a
              href={`https://${landingUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="url-badge"
              aria-label={`Se din landingsside: ${landingUrl}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              {landingUrl}
            </a>
          )}
        </header>

        {/* PROFILE CARD */}
        <section className="card" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="card-title">Din profil</h2>

          <div className="grid2">
            <div className="field-group">
              <label htmlFor="factory-name" className="card-label">Fullt navn *</label>
              <input
                id="factory-name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Richard Aasum"
                aria-required="true"
              />
            </div>
            <div className="field-group">
              <label htmlFor="factory-email" className="card-label">E-post</label>
              <input
                id="factory-email"
                type="email"
                className="field-input"
                value={email}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="field-group">
              <label htmlFor="factory-referral" className="card-label">IB / Referral-link *</label>
              <input
                id="factory-referral"
                type="url"
                className="field-input"
                value={referralLink}
                onChange={(e) => setReferralLink(e.target.value)}
                placeholder="https://puvip.co/la-partners/..."
                aria-required="true"
              />
            </div>
            <div className="field-group">
              <label htmlFor="factory-direction" className="card-label">Vinkel / Målgruppe</label>
              <input
                id="factory-direction"
                className="field-input"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="f.eks. nybegynnere, passiv inntekt, trading-community"
              />
            </div>
          </div>

          {/* Profile image upload */}
          <div className="field-group" style={{ marginTop: '1.25rem' }}>
            <span className="card-label">Profilbilde</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <div
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label={profileImage ? 'Bytt profilbilde' : 'Last opp profilbilde'}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
              >
                {profileImage ? (
                  <img src={profileImage} alt={name ? `Profilbilde av ${name}` : 'Profilbilde'} />
                ) : (
                  <span style={{ fontSize: 22, color: 'var(--gold)' }} aria-hidden="true">
                    {uploadingImage ? '⏳' : '📷'}
                  </span>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="gold-btn gold-btn-sm"
                  aria-busy={uploadingImage}
                >
                  {uploadingImage ? 'Laster opp...' : profileImage ? 'Bytt bilde' : 'Last opp bilde'}
                </button>
                <p className="hint">JPG, PNG eller WebP · Maks 5 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="field-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="factory-bio" className="card-label">Kort personlig bio</label>
            <textarea
              id="factory-bio"
              className="field-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Beskriv deg selv og hva du tilbyr..."
            />
          </div>
        </section>

        {/* ACTIONS */}
        <div className="actions-row">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="gold-btn"
            aria-busy={saving}
          >
            {saving ? 'Lagrer...' : 'Lagre profil'}
          </button>

          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="btn-outline"
            aria-expanded={showPrompt}
          >
            {showPrompt ? 'Skjul Claude-prompt' : 'Vis Claude-prompt'}
          </button>

          {landingUrl && (
            <a
              href={`https://${landingUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Se landingsside <span aria-hidden="true">↗</span>
              <span className="sr-only">(åpnes i ny fane)</span>
            </a>
          )}
        </div>

        {message && (
          <p role={isError ? 'alert' : 'status'} aria-live="polite" className={isError ? 'msg-err' : 'msg-ok'}>
            {isError ? message : `✓ ${message}`}
          </p>
        )}

        {/* CLAUDE PROMPT CARD */}
        {showPrompt && (
          <section className="card" aria-labelledby="prompt-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 id="prompt-heading" className="card-title" style={{ marginBottom: 0 }}>Claude-prompt</h2>
              <button onClick={copyPrompt} className="gold-btn gold-btn-sm" aria-label="Kopier Claude-prompt">
                {copied ? '✓ Kopiert!' : 'Kopier prompt'}
              </button>
            </div>
            <p className="hint" style={{ marginBottom: '0.75rem' }}>
              Kopier denne prompten og lim inn i Claude for å generere landingssiden din.
            </p>
            <textarea
              aria-label="Generert Claude-prompt (kun lesing)"
              className="prompt-area"
              value={prompt}
              readOnly
            />
          </section>
        )}

      </div>
    </>
  )
}
