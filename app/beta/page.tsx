'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/* ─────────────────────────────────────────────
   SYSTM8 Beta Signup Funnel
   Flow: Personlig melding → /beta → Registrer (30s) → Call → SYSTM8
   ───────────────────────────────────────────── */

const LOGO_URL = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

type Step = 'register' | 'call' | 'systm8'

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
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --success-color: #4a9d5a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    height: 100%;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
    overflow-x: hidden;
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
      linear-gradient(142deg, transparent 40%, rgba(255, 255, 255, 0.012) 40.2%, transparent 40.4%),
      linear-gradient(320deg, transparent 25%, rgba(255, 255, 255, 0.01) 25.15%, transparent 25.3%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
    background-size: cover;
  }

  .marble-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.5;
  }

  .beta-page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    gap: 1.5rem;
  }

  /* ── Logo ── */
  .beta-logo {
    width: 100px;
    height: auto;
    filter: drop-shadow(0 4px 24px rgba(212, 165, 55, 0.2));
  }

  .beta-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, var(--gold-dark) 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }

  .beta-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
    max-width: 420px;
    line-height: 1.6;
  }

  /* ── Progress Stepper ── */
  .stepper {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 0.5rem;
  }

  .step-dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    border: 2px solid rgba(212, 165, 55, 0.2);
    color: var(--text-secondary);
    background: rgba(10, 10, 10, 0.6);
    transition: all 0.4s ease;
    flex-shrink: 0;
  }

  .step-dot.active {
    border-color: var(--gold);
    color: #0a0804;
    background: linear-gradient(135deg, var(--gold-light), var(--gold));
    box-shadow: 0 0 20px rgba(212, 165, 55, 0.3);
  }

  .step-dot.done {
    border-color: var(--success-color);
    color: #fff;
    background: rgba(74, 157, 90, 0.3);
    border-width: 2px;
  }

  .step-line {
    width: 48px;
    height: 2px;
    background: rgba(212, 165, 55, 0.15);
    transition: background 0.4s ease;
  }

  .step-line.done {
    background: var(--success-color);
  }

  .step-labels {
    display: flex;
    gap: 24px;
    margin-top: 0.5rem;
  }

  .step-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: center;
    width: 64px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .step-label.active {
    color: var(--gold);
  }

  /* ── Card ── */
  .beta-card {
    width: 100%;
    max-width: 440px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    backdrop-filter: blur(24px);
    box-shadow:
      0 1px 0 rgba(212, 165, 55, 0.05) inset,
      0 24px 80px rgba(0, 0, 0, 0.4);
    animation: cardIn 0.5s ease;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-h {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.4rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    text-align: center;
    letter-spacing: 0.04em;
  }

  .card-p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  /* ── Fields ── */
  .field {
    margin-bottom: 1rem;
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

  .field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .field-input::placeholder {
    color: rgba(154, 145, 126, 0.5);
  }

  .field-input:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(212, 165, 55, 0.08);
    outline: 2px solid var(--gold);
    outline-offset: 1px;
  }

  /* ── Gold Button ── */
  .gold-btn {
    position: relative;
    width: 100%;
    padding: 0.85rem 1.5rem;
    margin-top: 0.75rem;
    border: none;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    color: #0a0804;
    background:
      linear-gradient(135deg,
        #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%,
        #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%
      );
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
    background:
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255, 255, 255, 0.03) 1px, rgba(255, 255, 255, 0.03) 2px);
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
  .gold-btn:hover { transform: translateY(-1px); box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3); }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .gold-btn:disabled::after { display: none; }
  .gold-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* ── Outline Button ── */
  .outline-btn {
    width: 100%;
    padding: 0.8rem 1.5rem;
    margin-top: 0.5rem;
    border: 1px solid rgba(212, 165, 55, 0.3);
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    color: var(--gold-light);
    background: rgba(212, 165, 55, 0.06);
    transition: all 0.3s ease;
  }

  .outline-btn:hover {
    background: rgba(212, 165, 55, 0.12);
    border-color: rgba(212, 165, 55, 0.5);
  }

  .outline-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* ── Timer Badge ── */
  .timer-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(212, 165, 55, 0.08);
    border: 1px solid rgba(212, 165, 55, 0.15);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
    color: var(--gold-light);
    letter-spacing: 0.04em;
  }

  .timer-badge svg {
    width: 14px;
    height: 14px;
  }

  /* ── Messages ── */
  .msg {
    font-size: 0.82rem;
    padding: 0.6rem 0.9rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .msg-error {
    background: rgba(212, 74, 55, 0.1);
    border: 1px solid rgba(212, 74, 55, 0.2);
    color: #e8755e;
  }

  .msg-success {
    background: rgba(74, 157, 90, 0.1);
    border: 1px solid rgba(74, 157, 90, 0.2);
    color: #6dc07f;
  }

  /* ── Call Step ── */
  .call-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .call-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.2rem;
    border: 1px solid rgba(212, 165, 55, 0.12);
    border-radius: 12px;
    background: rgba(20, 18, 14, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
  }

  .call-option:hover {
    border-color: rgba(212, 165, 55, 0.35);
    background: rgba(212, 165, 55, 0.06);
    transform: translateY(-1px);
  }

  .call-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.3rem;
  }

  .call-icon.phone { background: rgba(74, 157, 90, 0.15); }
  .call-icon.video { background: rgba(66, 133, 244, 0.15); }
  .call-icon.chat  { background: rgba(212, 165, 55, 0.12); }

  .call-text h4 {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.15rem;
  }

  .call-text p {
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .call-arrow {
    margin-left: auto;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  /* ── SYSTM8 Step ── */
  .systm8-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(212, 165, 55, 0.12), rgba(212, 165, 55, 0.04));
    border: 1px solid rgba(212, 165, 55, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.8rem;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem;
  }

  .feature-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .feature-list li .check {
    color: var(--gold);
    font-size: 0.9rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  /* ── Skip link ── */
  .skip-text {
    font-size: 0.78rem;
    color: var(--text-secondary);
    text-align: center;
    margin-top: 1rem;
  }

  .skip-link {
    background: none;
    border: none;
    color: var(--gold);
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    transition: color 0.2s;
  }

  .skip-link:hover { color: var(--gold-light); }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .beta-card { padding: 2rem 1.5rem 1.5rem; border-radius: 12px; }
    .beta-title { font-size: 1.3rem; }
    .beta-logo { width: 80px; }
    .step-line { width: 32px; }
  }
`

export default function BetaPage() {
  const [step, setStep] = useState<Step>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const stepIndex = step === 'register' ? 0 : step === 'call' ? 1 : 2

  /* ── Step 1: Register ── */
  const handleRegister = async () => {
    setError('')
    if (!name.trim() || !email.trim()) {
      setError('Vennligst fyll inn navn og e-post.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ugyldig e-postadresse.')
      return
    }

    setLoading(true)
    try {
      // Save lead to Supabase
      const { error: dbError } = await supabase.from('leads').insert({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        source: 'beta',
        status: 'new',
      })

      if (dbError && !dbError.message.includes('duplicate')) {
        throw dbError
      }

      // Send welcome notification
      fetch('/api/new-lead-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), source: 'beta' }),
      }).catch(() => {})

      setStep('call')
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: Call Booking ── */
  const handleCallBooked = () => {
    setStep('systm8')
  }

  /* ── Step 3: SYSTM8 Signup ── */
  const handleSystm8Signup = () => {
    // Redirect to 1Move Academy signup with pre-filled email
    const params = new URLSearchParams({ email, name, source: 'beta' })
    window.location.href = `https://1move-academy.vercel.app/signup?${params.toString()}`
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      <main className="beta-page" id="main-content">
        {/* Logo */}
        <img src={LOGO_URL} alt="1Move Academy" className="beta-logo" width={100} height={100} />

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="beta-title">SYSTM8 Beta Access</h1>
          <p className="beta-subtitle">
            Eksklusiv tilgang til SYSTM8 — IB-dashboardet som gir deg full oversikt over teamet ditt, leads og provisjoner.
          </p>
        </div>

        {/* Timer Badge */}
        <div className="timer-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Registrering tar 30 sekunder
        </div>

        {/* Progress Stepper */}
        <div>
          <div className="stepper">
            <div className={`step-dot ${stepIndex === 0 ? 'active' : stepIndex > 0 ? 'done' : ''}`}>
              {stepIndex > 0 ? '\u2713' : '1'}
            </div>
            <div className={`step-line ${stepIndex > 0 ? 'done' : ''}`} />
            <div className={`step-dot ${stepIndex === 1 ? 'active' : stepIndex > 1 ? 'done' : ''}`}>
              {stepIndex > 1 ? '\u2713' : '2'}
            </div>
            <div className={`step-line ${stepIndex > 1 ? 'done' : ''}`} />
            <div className={`step-dot ${stepIndex === 2 ? 'active' : ''}`}>3</div>
          </div>
          <div className="step-labels">
            <span className={`step-label ${stepIndex === 0 ? 'active' : ''}`}>Registrer</span>
            <span className={`step-label ${stepIndex === 1 ? 'active' : ''}`}>Book call</span>
            <span className={`step-label ${stepIndex === 2 ? 'active' : ''}`}>SYSTM8</span>
          </div>
        </div>

        {/* ── Step 1: Register ── */}
        {step === 'register' && (
          <div className="beta-card" key="register">
            <h2 className="card-h">Kom i gang</h2>
            <p className="card-p">Fyll inn under for å sikre din beta-plass.</p>

            {error && <div className="msg msg-error" role="alert">{error}</div>}

            <div className="field">
              <label className="field-label" htmlFor="beta-name">Fullt navn</label>
              <input
                ref={nameRef}
                id="beta-name"
                className="field-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ditt fulle navn"
                autoComplete="name"
                aria-required="true"
                onKeyDown={e => e.key === 'Enter' && document.getElementById('beta-email')?.focus()}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="beta-email">E-post</label>
              <input
                id="beta-email"
                className="field-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="din@epost.com"
                autoComplete="email"
                aria-required="true"
                onKeyDown={e => e.key === 'Enter' && document.getElementById('beta-phone')?.focus()}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="beta-phone">
                Telefon <span style={{ opacity: 0.5 }}>(valgfritt)</span>
              </label>
              <input
                id="beta-phone"
                className="field-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+47 XXX XX XXX"
                autoComplete="tel"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <button
              className="gold-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Registrerer...' : 'Sikre min plass'}
            </button>
          </div>
        )}

        {/* ── Step 2: Book a Call ── */}
        {step === 'call' && (
          <div className="beta-card" key="call">
            <div className="msg msg-success" role="status">
              Registrering fullført! Velkommen, {name.split(' ')[0]}.
            </div>

            <h2 className="card-h">Book en samtale</h2>
            <p className="card-p">
              Neste steg er en kort introduksjonssamtale der vi forklarer SYSTM8 og hjelper deg i gang.
            </p>

            <div className="call-options">
              <button className="call-option" onClick={handleCallBooked}>
                <div className="call-icon phone" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a9d5a" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div className="call-text">
                  <h4>Telefonsamtale</h4>
                  <p>15 min intro — vi ringer deg</p>
                </div>
                <span className="call-arrow" aria-hidden="true">&rarr;</span>
              </button>

              <button className="call-option" onClick={handleCallBooked}>
                <div className="call-icon video" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <div className="call-text">
                  <h4>Videomøte</h4>
                  <p>20 min — Google Meet / Zoom</p>
                </div>
                <span className="call-arrow" aria-hidden="true">&rarr;</span>
              </button>

              <button className="call-option" onClick={handleCallBooked}>
                <div className="call-icon chat" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4a537" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <div className="call-text">
                  <h4>Chat / Melding</h4>
                  <p>Send meg en melding direkte</p>
                </div>
                <span className="call-arrow" aria-hidden="true">&rarr;</span>
              </button>
            </div>

            <p className="skip-text">
              Foretrekker å starte direkte?{' '}
              <button className="skip-link" onClick={() => setStep('systm8')}>
                Hopp til SYSTM8-registrering
              </button>
            </p>
          </div>
        )}

        {/* ── Step 3: SYSTM8 Signup ── */}
        {step === 'systm8' && (
          <div className="beta-card" key="systm8">
            <div className="systm8-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--gold)' }}>
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>

            <h2 className="card-h">Aktiver SYSTM8</h2>
            <p className="card-p">
              Ditt personlige IB-dashboard er klart. Opprett kontoen din i 1Move Academy for å få tilgang.
            </p>

            <ul className="feature-list">
              <li>
                <span className="check" aria-hidden="true">&#10003;</span>
                Full oversikt over leads og konverteringer
              </li>
              <li>
                <span className="check" aria-hidden="true">&#10003;</span>
                Sanntids provisjons-tracking
              </li>
              <li>
                <span className="check" aria-hidden="true">&#10003;</span>
                Team-performance og vekstanalyse
              </li>
              <li>
                <span className="check" aria-hidden="true">&#10003;</span>
                AI-drevne markedsføringsverktøy
              </li>
              <li>
                <span className="check" aria-hidden="true">&#10003;</span>
                Automatiserte e-postkampanjer
              </li>
            </ul>

            <button className="gold-btn" onClick={handleSystm8Signup}>
              Opprett SYSTM8-konto
            </button>

            <button
              className="outline-btn"
              onClick={() => {
                window.location.href = '/login'
              }}
              style={{ marginTop: '0.75rem' }}
            >
              Har allerede en konto — Logg inn
            </button>
          </div>
        )}
      </main>
    </>
  )
}
