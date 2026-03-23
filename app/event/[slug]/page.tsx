'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

type Event = {
  id: string
  slug: string
  title: string
  description: string | null
  event_date: string | null
  zoom_link: string | null
  max_attendees: number | null
  is_active: boolean
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
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --error-color: #d44a37;
    --success-color: #4a9d5a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { min-height: 100vh; font-family: 'Outfit', sans-serif; background: var(--marble-dark); color: var(--text-primary); }

  .event-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      linear-gradient(137deg, transparent 30%, rgba(212, 165, 55, 0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212, 165, 55, 0.04) 47%, transparent 49%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }

  .event-page {
    position: relative; z-index: 1; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 3rem 1rem;
  }

  .event-logo {
    width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 4px 24px rgba(212,165,55,0.2);
    margin-bottom: 1.5rem;
  }

  .event-card {
    width: 100%; max-width: 520px;
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 2.5rem 2rem;
    backdrop-filter: blur(24px);
    box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    animation: cardReveal 0.6s ease;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .event-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 1.6rem;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, var(--gold-dark) 80%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; text-align: center; margin-bottom: 0.5rem;
  }

  .event-date {
    text-align: center; font-size: 0.88rem; color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .event-desc {
    font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7;
    text-align: center; margin-bottom: 2rem;
  }

  .event-divider {
    height: 2px; width: 60px; margin: 0 auto 2rem;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
  }

  .field { margin-bottom: 1.15rem; }

  .field-label {
    display: block; font-size: 0.75rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.45rem;
  }

  .field-input {
    width: 100%; padding: 0.75rem 1rem;
    background: var(--input-bg); border: 1px solid var(--input-border);
    border-radius: 8px; color: var(--text-primary);
    font-family: 'Outfit', sans-serif; font-size: 0.95rem; outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: rgba(154, 145, 126, 0.5); }
  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
  }
  .field-input-error { border-color: var(--error-color) !important; }

  .field-error {
    margin: 0.35rem 0 0; font-size: 0.75rem; color: var(--error-color);
  }

  .gold-btn {
    position: relative; width: 100%; padding: 0.85rem 1.5rem;
    margin-top: 0.5rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537, #c9a227);
    background-size: 200% 200%;
    box-shadow: 0 4px 16px rgba(160, 120, 24, 0.25);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .gold-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(160, 120, 24, 0.35); }
  .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .success-box {
    text-align: center; padding: 2rem;
  }
  .success-icon { font-size: 3rem; margin-bottom: 1rem; }
  .success-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    font-weight: 600; color: var(--gold); margin-bottom: 0.75rem;
  }
  .success-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

  .msg-error {
    font-size: 0.82rem; padding: 0.6rem 0.9rem; border-radius: 6px;
    margin-bottom: 1rem; text-align: center;
    background: rgba(212, 74, 55, 0.1); border: 1px solid rgba(212, 74, 55, 0.2);
    color: #e8755e;
  }

  .unavailable-card {
    text-align: center; padding: 3rem 2rem;
  }
  .unavailable-icon { font-size: 3rem; margin-bottom: 1rem; }
  .unavailable-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;
  }
  .unavailable-text { font-size: 0.88rem; color: var(--text-secondary); }

  .spinner {
    width: 18px; height: 18px; border: 2px solid currentColor; border-top-color: transparent;
    border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
    vertical-align: middle; margin-right: 6px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .event-card { padding: 2rem 1.5rem; border-radius: 12px; }
    .event-title { font-size: 1.3rem; }
  }
`

export default function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [event, setEvent] = useState<Event | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // Form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [uid, setUid] = useState('')
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [uidError, setUidError] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no')
    document.documentElement.setAttribute('lang', 'en')
  }, [])

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('id, slug, title, description, event_date, zoom_link, max_attendees, is_active')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setEvent(data)
      }
      setPageLoading(false)
    }
    loadEvent()
  }, [slug])

  const handleSubmit = async () => {
    setFormError('')
    setNameError(false)
    setEmailError(false)
    setUidError(false)

    let hasError = false
    if (!fullName.trim()) { setNameError(true); hasError = true }
    if (!email.trim()) { setEmailError(true); hasError = true }
    if (!uid.trim()) { setUidError(true); hasError = true }
    if (hasError) return

    if (!event) return
    setSubmitting(true)

    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: event.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        uid: uid.trim(),
        status: 'pending',
      })

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        setFormError('You are already registered for this event.')
      } else {
        setFormError(error.message || 'Something went wrong. Please try again.')
      }
      setSubmitting(false)
      return
    }

    // Send confirmation email (fire-and-forget)
    fetch('/api/event-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        event_title: event.title,
        zoom_link: event.zoom_link || '',
        event_date: event.event_date || '',
      }),
    }).catch(() => {})

    setSuccess(true)
    setSubmitting(false)
  }

  if (pageLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="event-bg" />
        <div className="event-page">
          <img src={SYSTM8_LOGO} className="event-logo" alt="1Move Academy" />
          <div className="event-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="event-bg" />

      <div className="event-page">
        <img src={SYSTM8_LOGO} className="event-logo" alt="1Move Academy" />

        <div className="event-card">
          {notFound ? (
            <div className="unavailable-card">
              <div className="unavailable-icon">🚫</div>
              <div className="unavailable-title">This event is not available</div>
              <div className="unavailable-text">The event you are looking for does not exist or is no longer active.</div>
            </div>
          ) : success ? (
            <div className="success-box">
              <div className="success-icon">✅</div>
              <div className="success-title">Registration Received!</div>
              <div className="success-text">
                You will receive an email once approved. Keep an eye on your inbox for further details about the event.
              </div>
            </div>
          ) : event && (
            <>
              <h1 className="event-title">{event.title}</h1>
              {event.event_date && (
                <div className="event-date">
                  {new Date(event.event_date).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })} CET
                </div>
              )}
              {event.description && <p className="event-desc">{event.description}</p>}
              <div className="event-divider" />

              {formError && <div className="msg-error">{formError}</div>}

              <div className="field">
                <label className="field-label" htmlFor="reg-name">Full Name *</label>
                <input
                  id="reg-name"
                  className={`field-input${nameError ? ' field-input-error' : ''}`}
                  type="text"
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setNameError(false) }}
                  placeholder="Your full name"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                />
                {nameError && <p className="field-error">This field is required</p>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="reg-email">Email *</label>
                <input
                  id="reg-email"
                  className={`field-input${emailError ? ' field-input-error' : ''}`}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(false) }}
                  placeholder="name@example.com"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                />
                {emailError && <p className="field-error">This field is required</p>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="reg-uid">PuPrime UID *</label>
                <input
                  id="reg-uid"
                  className={`field-input${uidError ? ' field-input-error' : ''}`}
                  type="text"
                  value={uid}
                  onChange={e => { setUid(e.target.value); setUidError(false) }}
                  placeholder="Your PuPrime UID"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                />
                {uidError && <p className="field-error">This field is required</p>}
              </div>

              <button
                className="gold-btn"
                onClick={handleSubmit}
                disabled={submitting || !uid.trim()}
              >
                {submitting ? <><span className="spinner" /> Registering...</> : 'Register Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
