'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// TODO(design): the brand team has a unlock_landing.html artifact with
// the final cream/black markup. When that lands, replace the JSX below
// with that markup (state + handlers stay the same). The current layout
// matches the unlock-flow visual direction — light marble palette, gold
// accent, single CTA — but isn't pixel-final.

interface Props {
  email: string
  token: string
}

export function UnlockForm({ email, token }: Props) {
  const router = useRouter()
  const [uid, setUid] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!/^\d{4,12}$/.test(uid)) {
      setStatus('error')
      setErrorMsg('UID must be 4–12 digits.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/welcome/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: parseInt(uid, 10), token }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean }
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "We couldn't verify your account. Please double-check your UID.",
        )
      }

      router.push('/unlock/success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #faf6ef; color: #1a1a1a; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .unlock-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.25rem; }
        .unlock-mark { font-family: 'Cormorant Garamond', serif; font-size: 0.85rem; letter-spacing: 0.4em; text-transform: uppercase; color: #a98a3b; margin-bottom: 2.5rem; }
        .unlock-card { width: 100%; max-width: 460px; background: #ffffff; border: 1px solid #e8dcb8; border-radius: 14px; padding: 2.5rem 2rem 2rem; box-shadow: 0 8px 32px rgba(20, 14, 0, 0.06); }
        .unlock-headline { font-family: 'Cormorant Garamond', serif; font-size: 1.85rem; line-height: 1.2; color: #1a1a1a; text-align: center; margin-bottom: 0.5rem; }
        .unlock-sub { font-size: 0.95rem; line-height: 1.55; color: #555; text-align: center; margin-bottom: 2rem; }
        .unlock-chip { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.65rem 0.85rem; background: rgba(201, 168, 76, 0.08); border: 1px solid rgba(201, 168, 76, 0.25); border-radius: 999px; font-size: 0.85rem; color: #555; margin-bottom: 1.5rem; }
        .unlock-chip-tick { color: #2d7a3a; font-weight: 700; }
        .unlock-field { margin-bottom: 1rem; }
        .unlock-field-label { display: block; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6a6a6a; margin-bottom: 0.5rem; }
        .unlock-input { width: 100%; padding: 0.85rem 1rem; background: #ffffff; border: 1px solid #d8c898; border-radius: 8px; color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: 1.05rem; letter-spacing: 0.04em; outline: none; transition: border-color 0.2s; }
        .unlock-input:focus { border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15); }
        .unlock-input-error { border-color: #b94a37; }
        .unlock-btn { width: 100%; padding: 0.95rem 1rem; background: #c9a84c; border: none; border-radius: 8px; color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, transform 0.15s; margin-top: 0.5rem; }
        .unlock-btn:hover { background: #d4b65e; transform: translateY(-1px); }
        .unlock-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .unlock-error { margin-top: 0.85rem; padding: 0.65rem 0.85rem; background: rgba(185, 74, 55, 0.08); border: 1px solid rgba(185, 74, 55, 0.25); border-radius: 8px; font-size: 0.85rem; color: #8b2020; text-align: center; }
        .unlock-footnote { font-size: 0.78rem; color: #8a8a8a; text-align: center; margin-top: 1.5rem; }
      `}</style>

      <div className="unlock-wrap">
        <div className="unlock-mark">1Move</div>
        <div className="unlock-card">
          <h1 className="unlock-headline">Enter the kingdom</h1>
          <p className="unlock-sub">
            Paste the PU Prime UID from your new broker account. We&apos;ll match it to your email,
            and you&apos;ll be in.
          </p>

          <div className="unlock-chip" aria-label="Signed in as">
            <span className="unlock-chip-tick" aria-hidden="true">✓</span>
            <span>{email}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="unlock-field">
              <label htmlFor="unlock-uid" className="unlock-field-label">PU Prime UID</label>
              <input
                id="unlock-uid"
                className={`unlock-input${status === 'error' ? ' unlock-input-error' : ''}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="one-time-code"
                maxLength={12}
                value={uid}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 12)
                  setUid(v)
                  if (status === 'error') {
                    setStatus('idle')
                    setErrorMsg('')
                  }
                }}
                placeholder="e.g. 1234567"
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'unlock-err' : undefined}
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              className="unlock-btn"
              disabled={status === 'loading' || !uid}
              aria-busy={status === 'loading'}
            >
              {status === 'loading' ? 'Verifying…' : 'Unlock Access'}
            </button>

            {status === 'error' && errorMsg && (
              <p id="unlock-err" role="alert" className="unlock-error">{errorMsg}</p>
            )}

            <p className="unlock-footnote">
              UID is the 6–9 digit number on your PU Prime profile.
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
