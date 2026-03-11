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

export default function FactoryPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const [distributor, setDistributor] = useState<any>(null)

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
      } else {
        // Fallback: hvis en rad ikke finnes av en eller annen grunn
        const { data: created } = await supabase
          .from('distributors')
          .insert({ name: authEmail.split('@')[0], email: authEmail })
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
    () =>
      buildClaudePrompt({
        name,
        email,
        referralLink,
        bio,
        direction,
        profileImage,
      }),
    [name, email, referralLink, bio, direction, profileImage]
  )

  const saveProfile = async () => {
    if (!distributor?.id) return
    if (!name.trim() || !email.trim() || !referralLink.trim()) {
      setMessage('Please fill in Name, Email, and IB Link.')
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
      setMessage('Saved. Your Claude prompt is ready to copy.')
      setIsError(false)
    }
  }

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setMessage('Prompt copied.')
    setIsError(false)
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <main id="main-content" style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Landing Factory — Step 1</h1>
      <p style={{ marginTop: 0 }}>
        Fill in your details → Save → Copy the Claude prompt.
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label htmlFor="factory-name" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Full Name <span aria-hidden="true">*</span></label>
          <input
            id="factory-name"
            style={{ padding: 12, width: '100%' }}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
            aria-invalid={isError && !name.trim() ? 'true' : 'false'}
          />
        </div>
        <div>
          <label htmlFor="factory-email" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email <span aria-hidden="true">*</span></label>
          <input
            id="factory-email"
            type="email"
            style={{ padding: 12, width: '100%' }}
            placeholder="Email (must match broker email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={isError && !email.trim() ? 'true' : 'false'}
          />
        </div>
        <div>
          <label htmlFor="factory-referral" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Broker IB / Referral Link <span aria-hidden="true">*</span></label>
          <input
            id="factory-referral"
            type="url"
            style={{ padding: 12, width: '100%' }}
            placeholder="Broker IB / Referral Link"
            value={referralLink}
            onChange={(e) => setReferralLink(e.target.value)}
            aria-required="true"
            aria-invalid={isError && !referralLink.trim() ? 'true' : 'false'}
          />
        </div>
        <div>
          <label htmlFor="factory-direction" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Direction / Angle</label>
          <input
            id="factory-direction"
            style={{ padding: 12, width: '100%' }}
            placeholder="Direction / angle (e.g., beginners, passive income, community, etc.)"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="factory-profile-image" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Profile Image URL</label>
          <input
            id="factory-profile-image"
            type="url"
            style={{ padding: 12, width: '100%' }}
            placeholder="Profile image URL (optional)"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="factory-bio" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Short Personal Bio</label>
          <textarea
            id="factory-bio"
            style={{ padding: 12, minHeight: 120, width: '100%' }}
            placeholder="Short personal bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{ padding: '12px 16px' }}
            aria-busy={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button onClick={copyPrompt} style={{ padding: '12px 16px' }} aria-label="Copy Claude prompt to clipboard">
            Copy Claude Prompt
          </button>
        </div>

        {message && isError && <p role="alert" aria-live="assertive">{message}</p>}
        {message && !isError && <p role="status" aria-live="polite">{message}</p>}

        <h2 style={{ marginTop: 24 }}>Claude Prompt</h2>
        <textarea
          id="factory-prompt"
          aria-label="Generated Claude prompt (read-only)"
          style={{ width: '100%', minHeight: 320, padding: 12 }}
          value={prompt}
          readOnly
        />
      </div>
    </main>
  )
}