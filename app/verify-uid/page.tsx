'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface LookupData {
  firstName: string
  alreadyVerified: boolean
  existingClientFlag?: boolean
  ib?: { name: string | null; slug: string | null }
  lang?: string
}

interface Copy {
  loading: string
  expiredTitle: string
  expiredBody: string
  invalidTitle: string
  invalidBody: string
  greeting: string
  heading: string
  subheading: string
  uidLabel: string
  uidPlaceholder: string
  submit: string
  submitting: string
  findUidLabel: string
  findUidLink: string
  alreadyVerifiedTitle: string
  alreadyVerifiedBody: string
  rateLimitedTitle: string
  rateLimitedBody: string
  genericError: string
}

const COPY: Record<string, Copy> = {
  en: {
    loading: 'Loading…',
    expiredTitle: 'This link has expired',
    expiredBody: 'Your verification link is no longer valid. Please contact your IB so they can send you a fresh link.',
    invalidTitle: 'Link not recognised',
    invalidBody: 'We couldn’t find this verification request. Please use the most recent link from your welcome email.',
    greeting: 'Welcome back',
    heading: 'Enter your PU Prime UID',
    subheading: 'Drop in the account number from your PU Prime registration. We’ll verify it instantly.',
    uidLabel: 'PU Prime UID',
    uidPlaceholder: 'e.g. 667950',
    submit: 'Verify & continue',
    submitting: 'Verifying…',
    findUidLabel: 'Don’t have your UID yet?',
    findUidLink: 'Find it on PU Prime',
    alreadyVerifiedTitle: 'You’re already verified ✓',
    alreadyVerifiedBody: 'Your IB has access to your details — they’ll be in touch shortly.',
    rateLimitedTitle: 'Too many attempts',
    rateLimitedBody: 'Please wait a few minutes and try again, or contact your IB if you need a hand.',
    genericError: 'Something went wrong. Please try again.',
  },
  no: {
    loading: 'Laster…',
    expiredTitle: 'Denne lenken har utløpt',
    expiredBody: 'Verifiseringslenken din er ikke gyldig lenger. Kontakt IB-en din for en ny lenke.',
    invalidTitle: 'Lenken kjennes ikke igjen',
    invalidBody: 'Vi fant ikke denne forespørselen. Bruk den nyeste lenken fra velkomst-e-posten din.',
    greeting: 'Velkommen tilbake',
    heading: 'Legg inn PU Prime-UID',
    subheading: 'Skriv inn kontonummeret fra PU Prime-registreringen. Vi verifiserer det umiddelbart.',
    uidLabel: 'PU Prime-UID',
    uidPlaceholder: 'f.eks. 667950',
    submit: 'Verifiser og fortsett',
    submitting: 'Verifiserer…',
    findUidLabel: 'Har du ikke UID-en ennå?',
    findUidLink: 'Finn den på PU Prime',
    alreadyVerifiedTitle: 'Du er allerede verifisert ✓',
    alreadyVerifiedBody: 'IB-en din har detaljene dine — de tar kontakt snart.',
    rateLimitedTitle: 'For mange forsøk',
    rateLimitedBody: 'Vent noen minutter og prøv igjen, eller kontakt IB-en din.',
    genericError: 'Noe gikk galt. Prøv igjen.',
  },
  es: {
    loading: 'Cargando…',
    expiredTitle: 'Este enlace ha caducado',
    expiredBody: 'Tu enlace de verificación ya no es válido. Contacta a tu IB para obtener uno nuevo.',
    invalidTitle: 'Enlace no reconocido',
    invalidBody: 'No encontramos esta solicitud. Usa el enlace más reciente del correo de bienvenida.',
    greeting: 'Bienvenido de nuevo',
    heading: 'Introduce tu UID de PU Prime',
    subheading: 'Pega el número de cuenta de tu registro en PU Prime. Lo verificaremos al instante.',
    uidLabel: 'UID de PU Prime',
    uidPlaceholder: 'p.ej. 667950',
    submit: 'Verificar y continuar',
    submitting: 'Verificando…',
    findUidLabel: '¿Aún no tienes tu UID?',
    findUidLink: 'Encuéntralo en PU Prime',
    alreadyVerifiedTitle: 'Ya estás verificado ✓',
    alreadyVerifiedBody: 'Tu IB ya tiene tus datos — te contactará pronto.',
    rateLimitedTitle: 'Demasiados intentos',
    rateLimitedBody: 'Espera unos minutos y vuelve a intentar, o contacta a tu IB.',
    genericError: 'Algo salió mal. Inténtalo de nuevo.',
  },
}

function copyFor(lang: string | undefined): Copy {
  if (!lang) return COPY.en
  return COPY[lang] || COPY.en
}

const PU_PRIME_ACCOUNT_URL = 'https://my.puprime.com/account'

function VerifyUidView() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [phase, setPhase] = useState<'loading' | 'ready' | 'expired' | 'not_found' | 'already' | 'error'>('loading')
  const [data, setData] = useState<LookupData | null>(null)
  const [uid, setUid] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setPhase('not_found')
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/leads/lookup-by-token?token=${encodeURIComponent(token)}`)
        if (cancelled) return
        if (res.status === 404) { setPhase('not_found'); return }
        if (res.status === 410) { setPhase('expired'); return }
        if (!res.ok) { setPhase('error'); return }
        const body = await res.json()
        if (cancelled) return
        const d = body.data as LookupData
        setData(d)
        if (d.alreadyVerified) {
          setPhase('already')
        } else {
          setPhase('ready')
        }
      } catch {
        if (!cancelled) setPhase('error')
      }
    })()
    return () => { cancelled = true }
  }, [token])

  const c = copyFor(data?.lang)

  if (phase === 'loading') return <PageShell><LoadingState text={c.loading} /></PageShell>

  if (phase === 'not_found') {
    return (
      <PageShell>
        <Notice title={c.invalidTitle} body={c.invalidBody} variant="error" />
      </PageShell>
    )
  }

  if (phase === 'expired') {
    return (
      <PageShell>
        <Notice title={c.expiredTitle} body={c.expiredBody} variant="error" />
      </PageShell>
    )
  }

  if (phase === 'error') {
    return (
      <PageShell>
        <Notice title={c.genericError} body="" variant="error" />
      </PageShell>
    )
  }

  if (phase === 'already') {
    return (
      <PageShell>
        <Notice title={c.alreadyVerifiedTitle} body={c.alreadyVerifiedBody} variant="success" />
      </PageShell>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorReason(null)
    setRateLimited(false)
    const trimmed = uid.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads/verify-uid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, uid: Number(trimmed) }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.status === 429) {
        setRateLimited(true)
        setSubmitting(false)
        return
      }
      if (res.status === 410 || body?.error === 'token_expired') {
        setPhase('expired')
        return
      }
      if (res.status === 404 || body?.error === 'token_not_found') {
        setPhase('not_found')
        return
      }
      if (body?.granted === true) {
        router.push('/verify-uid/success')
        return
      }
      setSubmitting(false)
      setErrorReason(body?.reason || c.genericError)
    } catch {
      setSubmitting(false)
      setErrorReason(c.genericError)
    }
  }

  return (
    <PageShell>
      <div style={{ marginBottom: 24 }}>
        {data?.ib?.name && (
          <div style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            {data.ib.name}
          </div>
        )}
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 8 }}>
          {c.greeting}{data?.firstName ? `, ${data.firstName}` : ''}.
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c9a84c', fontSize: '1.85rem', margin: '0 0 10px', fontWeight: 600 }}>
          {c.heading}
        </h1>
        <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: 1.55, margin: 0 }}>{c.subheading}</p>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.uidLabel}</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={uid}
            onChange={e => setUid(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={c.uidPlaceholder}
            disabled={submitting}
            autoFocus
            style={{
              padding: '13px 14px',
              fontSize: '1.05rem',
              fontFamily: 'inherit',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: 8,
              background: '#0e0e0e',
              color: '#f0ede8',
              outline: 'none',
              letterSpacing: 1,
            }}
          />
        </label>

        {errorReason && (
          <div style={{
            color: '#d44a37',
            background: 'rgba(212,74,55,0.08)',
            border: '1px solid rgba(212,74,55,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}>
            {errorReason}
          </div>
        )}

        {rateLimited && (
          <div style={{
            color: '#d4a843',
            background: 'rgba(212,168,67,0.08)',
            border: '1px solid rgba(212,168,67,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}>
            <strong>{c.rateLimitedTitle}</strong>
            <div style={{ marginTop: 4 }}>{c.rateLimitedBody}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !uid.trim()}
          style={{
            background: '#c9a84c',
            color: '#080808',
            border: 'none',
            borderRadius: 8,
            padding: '14px 18px',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: 0.4,
            cursor: submitting || !uid.trim() ? 'not-allowed' : 'pointer',
            opacity: submitting || !uid.trim() ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {submitting ? c.submitting : `${c.submit} →`}
        </button>
      </form>

      <div style={{ marginTop: 28, fontSize: '0.85rem', color: '#888' }}>
        <div style={{ marginBottom: 4 }}>{c.findUidLabel}</div>
        <a
          href={PU_PRIME_ACCOUNT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#c9a84c', textDecoration: 'underline' }}
        >
          {c.findUidLink} →
        </a>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100dvh',
      background: '#080808',
      color: '#f0ede8',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#0d0d0d',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: 16,
        padding: '32px 28px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
      }}>
        {children}
      </div>
    </main>
  )
}

function LoadingState({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#888' }}>
      {text}
    </div>
  )
}

function Notice({ title, body, variant }: { title: string; body: string; variant: 'success' | 'error' }) {
  const accent = variant === 'success' ? '#4ccf7a' : '#d44a37'
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: variant === 'success' ? 'rgba(76,207,122,0.12)' : 'rgba(212,74,55,0.12)',
        border: `1px solid ${accent}`,
        color: accent,
        fontSize: '1.6rem',
        marginBottom: 18,
      }}>
        {variant === 'success' ? '✓' : '!'}
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c9a84c', fontSize: '1.55rem', margin: '0 0 10px', fontWeight: 600 }}>
        {title}
      </h1>
      {body && <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: 1.55, margin: 0 }}>{body}</p>}
    </div>
  )
}

export default function VerifyUidPage() {
  return (
    <Suspense fallback={<PageShell><LoadingState text="…" /></PageShell>}>
      <VerifyUidView />
    </Suspense>
  )
}
