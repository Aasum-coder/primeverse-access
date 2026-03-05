'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')
  const [loading, setLoading] = useState(false)

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessage(text)
    setMessageType(type)
  }

  const handleLogin = async () => {
    if (!email || !password) { showMessage('Fyll inn e-post og passord'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      showMessage(error.message === 'Invalid login credentials' ? 'Feil e-post eller passord' : error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) { showMessage('Fyll inn e-post og passord'); return }
    if (password.length < 6) { showMessage('Passordet må være minst 6 tegn'); return }
    if (password !== confirmPassword) { showMessage('Passordene er ikke like'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    })
    if (error) {
      showMessage(error.message)
    } else {
      showMessage('Sjekk e-posten din for bekreftelseslenke!', 'success')
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) { showMessage('Skriv inn e-postadressen din'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) {
      showMessage(error.message)
    } else {
      showMessage('Sjekk e-posten din for nullstillingslenke!', 'success')
    }
    setLoading(false)
  }

  const handleSubmit = () => {
    if (mode === 'login') handleLogin()
    else if (mode === 'signup') handleSignUp()
    else handleForgotPassword()
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setMessage('')
  }

  const titles: Record<Mode, string> = {
    login: 'Logg inn',
    signup: 'Opprett konto',
    forgot: 'Nullstill passord'
  }

  const subtitles: Record<Mode, string> = {
    login: 'Velkommen tilbake til PrimeVerse Access',
    signup: 'Kom i gang som distributor',
    forgot: 'Vi sender deg en lenke for å nullstille passordet'
  }

  const buttonTexts: Record<Mode, string> = {
    login: 'Logg inn',
    signup: 'Opprett konto',
    forgot: 'Send nullstillingslenke'
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#111',
        borderRadius: 12,
        border: '1px solid #222',
        padding: '48px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 28, color: '#c9a84c', marginBottom: 8, letterSpacing: 1 }}>✦</div>
          <h1 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            {titles[mode]}
          </h1>
          <p style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: '#666',
            lineHeight: 1.5
          }}>
            {subtitles[mode]}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.5,
            background: messageType === 'success' ? 'rgba(46,125,50,0.15)' : 'rgba(211,47,47,0.15)',
            color: messageType === 'success' ? '#66bb6a' : '#ef5350',
            border: `1px solid ${messageType === 'success' ? 'rgba(46,125,50,0.3)' : 'rgba(211,47,47,0.3)'}`
          }}>
            {message}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 11,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
              fontWeight: 600
            }}>E-post</label>
            <input
              type="email"
              placeholder="din@epost.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
                fontWeight: 600
              }}>Passord</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && mode === 'login') handleSubmit() }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
                fontWeight: 600
              }}>Bekreft passord</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          )}

          {/* Forgot password link (only on login) */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button
                onClick={() => switchMode('forgot')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c9a84c',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 500
                }}
              >
                Glemt passord?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              background: loading ? '#333' : '#c9a84c',
              color: loading ? '#666' : '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: 4,
              letterSpacing: '0.02em'
            }}
          >
            {loading ? 'Vennligst vent...' : buttonTexts[mode]}
          </button>
        </div>

        {/* Mode switch */}
        <div style={{
          textAlign: 'center',
          marginTop: 28,
          paddingTop: 24,
          borderTop: '1px solid #1a1a1a'
        }}>
          {mode === 'login' && (
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              Har du ikke konto?{' '}
              <button
                onClick={() => switchMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c9a84c',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                Opprett konto
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              Har du allerede konto?{' '}
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c9a84c',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                Logg inn
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              Husker du passordet?{' '}
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c9a84c',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                Tilbake til innlogging
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
