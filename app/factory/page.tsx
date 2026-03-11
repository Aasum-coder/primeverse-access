'use client'

import { useEffect, useMemo, useState } from 'react'
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

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#ededed',
    fontFamily: 'Arial, Helvetica, sans-serif',
    padding: '0 0 60px',
  } as React.CSSProperties,
  header: {
    background: '#111',
    borderBottom: '1px solid #2a2a2a',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 12,
  } as React.CSSProperties,
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#d4a537',
    margin: 0,
  } as React.CSSProperties,
  urlBadge: {
    background: '#1a1a1a',
    border: '1px solid #d4a537',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    color: '#d4a537',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,
  body: {
    maxWidth: 820,
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  } as React.CSSProperties,
  card: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 12,
    padding: '28px 28px',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#d4a537',
    marginBottom: 20,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  } as React.CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  } as React.CSSProperties,
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as React.CSSProperties,
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#aaa',
  } as React.CSSProperties,
  input: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#ededed',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#ededed',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    minHeight: 100,
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid #d4a537',
    marginTop: 8,
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  } as React.CSSProperties,
  btnPrimary: {
    background: '#d4a537',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '13px 28px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSecondary: {
    background: 'transparent',
    color: '#d4a537',
    border: '1px solid #d4a537',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnGhost: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 13,
    cursor: 'pointer',
  } as React.CSSProperties,
  msgOk: {
    background: '#0d2b1d',
    border: '1px solid #1a5c36',
    color: '#4caf80',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
  } as React.CSSProperties,
  msgErr: {
    background: '#2b0d0d',
    border: '1px solid #5c1a1a',
    color: '#f47c7c',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
  } as React.CSSProperties,
  promptArea: {
    background: '#0d0d0d',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '16px',
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'monospace',
    width: '100%',
    minHeight: 220,
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  hint: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  } as React.CSSProperties,
}

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
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#d4a537' }}>Laster...</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.headerTitle}>Landing Factory</h1>
        {landingUrl && (
          <a
            href={`https://${landingUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...S.urlBadge, textDecoration: 'none' }}
            aria-label={`Se din landingsside: ${landingUrl}`}
          >
            <span>🔗</span>
            <span>{landingUrl}</span>
          </a>
        )}
      </header>

      <main id="main-content" style={S.body}>

        {/* Profil */}
        <section style={S.card} aria-labelledby="profile-heading">
          <h2 id="profile-heading" style={S.cardTitle}>Din profil</h2>
          <div style={S.grid2}>
            <div style={S.fieldGroup}>
              <label htmlFor="factory-name" style={S.label}>Fullt navn *</label>
              <input
                id="factory-name"
                style={S.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Richard Aasum"
                aria-required="true"
              />
            </div>
            <div style={S.fieldGroup}>
              <label htmlFor="factory-email" style={S.label}>E-post *</label>
              <input
                id="factory-email"
                type="email"
                style={{ ...S.input, color: '#666' }}
                value={email}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div style={S.fieldGroup}>
              <label htmlFor="factory-referral" style={S.label}>IB / Referral-link *</label>
              <input
                id="factory-referral"
                type="url"
                style={S.input}
                value={referralLink}
                onChange={(e) => setReferralLink(e.target.value)}
                placeholder="https://puvip.co/la-partners/..."
                aria-required="true"
              />
            </div>
            <div style={S.fieldGroup}>
              <label htmlFor="factory-direction" style={S.label}>Vinkel / Målgruppe</label>
              <input
                id="factory-direction"
                style={S.input}
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="f.eks. nybegynnere, passiv inntekt, trading-community"
              />
            </div>
          </div>

          <div style={{ ...S.fieldGroup, marginTop: 16 }}>
            <label htmlFor="factory-profile-image" style={S.label}>Profilbilde-URL</label>
            <input
              id="factory-profile-image"
              type="url"
              style={S.input}
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://..."
            />
            {profileImage && (
              <img
                src={profileImage}
                alt="Forhåndsvisning av profilbilde"
                style={S.imagePreview}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>

          <div style={{ ...S.fieldGroup, marginTop: 16 }}>
            <label htmlFor="factory-bio" style={S.label}>Kort personlig bio</label>
            <textarea
              id="factory-bio"
              style={S.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Beskriv deg selv og hva du tilbyr..."
            />
          </div>
        </section>

        {/* Actions */}
        <div style={S.actions}>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}
            aria-busy={saving}
          >
            {saving ? 'Lagrer...' : 'Lagre profil'}
          </button>

          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={S.btnSecondary}
            aria-expanded={showPrompt}
          >
            {showPrompt ? 'Skjul Claude-prompt' : 'Vis Claude-prompt'}
          </button>

          {landingUrl && (
            <a
              href={`https://${landingUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...S.btnGhost, textDecoration: 'none' }}
            >
              Se landingsside →
            </a>
          )}
        </div>

        {message && (
          <p role={isError ? 'alert' : 'status'} aria-live="polite" style={isError ? S.msgErr : S.msgOk}>
            {message}
          </p>
        )}

        {/* Claude-prompt */}
        {showPrompt && (
          <section style={S.card} aria-labelledby="prompt-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 id="prompt-heading" style={S.cardTitle}>Claude-prompt</h2>
              <button onClick={copyPrompt} style={S.btnPrimary} aria-label="Kopier Claude-prompt">
                {copied ? '✓ Kopiert!' : 'Kopier prompt'}
              </button>
            </div>
            <p style={S.hint}>Kopier denne prompten og lim den inn i Claude for å generere landingssiden din.</p>
            <textarea
              aria-label="Generert Claude-prompt (kun lesing)"
              style={S.promptArea}
              value={prompt}
              readOnly
            />
          </section>
        )}

      </main>
    </div>
  )
}
