'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

type DistributorProfile = {
  id: string
  user_id: string
  name: string | null
  full_name: string | null
  email: string
  slug: string | null
  bio: string | null
  referral_link: string | null
  ib_status: string
  social_facebook: string | null
  social_instagram: string | null
  social_twitter: string | null
  social_telegram: string | null
  social_tiktok: string | null
  social_youtube: string | null
  landing_page_published: boolean | null
  created_at: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --text-dim: #5a5347;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { min-height: 100vh; font-family: 'Outfit', sans-serif; background: var(--marble-dark); color: var(--text-primary); }

  .imp-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 80%, rgba(212,165,55,0.04) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212,165,55,0.03) 0%, transparent 50%),
      var(--marble-dark);
  }

  .imp-wrap { position: relative; z-index: 1; min-height: 100vh; }

  .imp-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 12px 24px;
    background: rgba(212,165,55,0.08); border-bottom: 1px solid rgba(212,165,55,0.2);
    font-size: 0.85rem; color: var(--gold);
  }
  .imp-banner-back {
    color: var(--text-secondary); text-decoration: none; font-size: 0.8rem;
    padding: 6px 14px; border: 1px solid var(--card-border); border-radius: 8px;
    transition: all 0.2s;
  }
  .imp-banner-back:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }

  .imp-header {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 24px; border-bottom: 1px solid var(--card-border);
    background: rgba(0,0,0,0.6); backdrop-filter: blur(20px);
  }
  .imp-logo {
    width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid var(--gold-dark);
  }
  .imp-header-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem; font-weight: 600; color: var(--gold);
  }

  .imp-content { max-width: 720px; margin: 0 auto; padding: 24px 16px; }

  .imp-card {
    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
    padding: 24px; margin-bottom: 16px; backdrop-filter: blur(10px);
  }
  .imp-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 600; color: var(--gold); margin-bottom: 16px;
    padding-bottom: 10px; border-bottom: 1px solid var(--card-border);
  }

  .imp-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 8px 0; border-bottom: 1px solid rgba(212,165,55,0.06);
  }
  .imp-row:last-child { border-bottom: none; }
  .imp-label {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-dim); min-width: 120px;
  }
  .imp-value {
    font-size: 0.88rem; color: var(--text-primary); text-align: right;
    word-break: break-all;
  }
  .imp-value-dim { color: var(--text-secondary); }
  .imp-value-link { color: var(--gold); text-decoration: none; }
  .imp-value-link:hover { color: var(--gold-light); }

  .imp-badge {
    display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .imp-badge-approved { background: rgba(74,157,90,0.12); color: #6dc07f; border: 1px solid rgba(74,157,90,0.25); }
  .imp-badge-pending { background: rgba(212,165,55,0.08); color: var(--gold-light); border: 1px solid rgba(212,165,55,0.2); }
  .imp-badge-rejected { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

  .imp-loading {
    position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px; z-index: 9999;
  }
  .imp-spinner {
    width: 32px; height: 32px; border: 2px solid var(--gold); border-top-color: transparent;
    border-radius: 50%; animation: impSpin 0.8s linear infinite;
  }
  @keyframes impSpin { to { transform: rotate(360deg); } }

  .imp-error {
    text-align: center; padding: 60px 24px; color: var(--text-secondary); font-size: 0.92rem;
  }

  @media (max-width: 768px) {
    .imp-banner { flex-direction: column; align-items: flex-start; gap: 8px; }
    .imp-row { flex-direction: column; gap: 4px; }
    .imp-value { text-align: left; }
  }
`

function ImpersonateContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  const [profile, setProfile] = useState<DistributorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setError('No user ID provided')
        setLoading(false)
        return
      }

      const { data, error: fetchErr } = await supabase
        .from('distributors')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchErr || !data) {
        console.error('Failed to fetch distributor:', fetchErr)
        setError('User not found')
        setLoading(false)
        return
      }

      setProfile(data as DistributorProfile)
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="imp-bg" />
        <div className="imp-loading">
          <div className="imp-spinner" />
        </div>
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="imp-bg" />
        <div className="imp-wrap">
          <div className="imp-banner">
            <span>{error || 'User not found'}</span>
            <a href="/admin/console" className="imp-banner-back">← Back to Admin Console</a>
          </div>
          <div className="imp-error">
            <p>{error || 'Could not load user profile.'}</p>
          </div>
        </div>
      </>
    )
  }

  const displayName = profile.name || profile.full_name || 'Unnamed User'
  const statusClass = profile.ib_status === 'approved' ? 'imp-badge-approved' : profile.ib_status === 'rejected' ? 'imp-badge-rejected' : 'imp-badge-pending'

  const socials = [
    { label: 'Facebook', value: profile.social_facebook },
    { label: 'Instagram', value: profile.social_instagram },
    { label: 'Twitter / X', value: profile.social_twitter },
    { label: 'Telegram', value: profile.social_telegram },
    { label: 'TikTok', value: profile.social_tiktok },
    { label: 'YouTube', value: profile.social_youtube },
  ].filter(s => s.value)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="imp-bg" />

      <div className="imp-wrap">
        {/* Read-only banner */}
        <div className="imp-banner">
          <span>👁 Viewing dashboard as <strong>{displayName}</strong> — Read Only</span>
          <a href="/admin/console" className="imp-banner-back">← Back to Admin Console</a>
        </div>

        {/* Header */}
        <div className="imp-header">
          <img src={SYSTM8_LOGO} className="imp-logo" alt="SYSTM8" />
          <div className="imp-header-title">{displayName}</div>
        </div>

        {/* Content */}
        <div className="imp-content">
          {/* Profile Info */}
          <div className="imp-card">
            <div className="imp-card-title">Profile Information</div>
            <div className="imp-row">
              <span className="imp-label">Name</span>
              <span className="imp-value">{displayName}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Email</span>
              <span className="imp-value">{profile.email}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Slug</span>
              <span className="imp-value">
                {profile.slug ? (
                  <a href={`https://primeverseaccess.com/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="imp-value-link">
                    /{profile.slug}
                  </a>
                ) : (
                  <span className="imp-value-dim">Not set</span>
                )}
              </span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Bio</span>
              <span className="imp-value">{profile.bio || <span className="imp-value-dim">No bio</span>}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Page Live</span>
              <span className="imp-value">{profile.landing_page_published ? 'Yes' : 'No'}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Joined</span>
              <span className="imp-value imp-value-dim">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* IB Status */}
          <div className="imp-card">
            <div className="imp-card-title">IB Status</div>
            <div className="imp-row">
              <span className="imp-label">Status</span>
              <span className={`imp-badge ${statusClass}`}>{profile.ib_status}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">Referral Link</span>
              <span className="imp-value">{profile.referral_link || <span className="imp-value-dim">None</span>}</span>
            </div>
            <div className="imp-row">
              <span className="imp-label">User ID</span>
              <span className="imp-value imp-value-dim" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{profile.user_id}</span>
            </div>
          </div>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">Social Links</div>
              {socials.map(s => (
                <div key={s.label} className="imp-row">
                  <span className="imp-label">{s.label}</span>
                  <span className="imp-value">
                    <a href={s.value!} target="_blank" rel="noopener noreferrer" className="imp-value-link">
                      {s.value}
                    </a>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="imp-bg" />
        <div className="imp-loading">
          <div className="imp-spinner" />
        </div>
      </>
    }>
      <ImpersonateContent />
    </Suspense>
  )
}
