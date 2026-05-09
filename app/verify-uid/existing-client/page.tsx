'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Landing page after the lead clicks "Already a PU Prime client?" in
// Email #1. /api/leads/existing-client redirects here with ?status=...

interface Copy {
  ok_title: string
  ok_body: string
  expired_title: string
  expired_body: string
  missing_title: string
  missing_body: string
  generic_title: string
  generic_body: string
}

const COPY_EN: Copy = {
  ok_title: 'Got it — your IB will reach out',
  ok_body: 'Thanks for letting us know. Your IB has been notified and will contact you personally to get you set up.',
  expired_title: 'This link has expired',
  expired_body: 'Please contact your IB so they can send you a fresh link.',
  missing_title: 'Link not found',
  missing_body: 'We couldn’t find this request. Please use the most recent link from your welcome email.',
  generic_title: 'Something went wrong',
  generic_body: 'Please try again, or contact your IB directly.',
}

function pickCopy(status: string | null): { title: string; body: string; ok: boolean } {
  switch (status) {
    case 'ok': return { title: COPY_EN.ok_title, body: COPY_EN.ok_body, ok: true }
    case 'token_expired': return { title: COPY_EN.expired_title, body: COPY_EN.expired_body, ok: false }
    case 'token_not_found':
    case 'missing': return { title: COPY_EN.missing_title, body: COPY_EN.missing_body, ok: false }
    default: return { title: COPY_EN.generic_title, body: COPY_EN.generic_body, ok: false }
  }
}

function ExistingClientView() {
  const params = useSearchParams()
  const { title, body, ok } = pickCopy(params.get('status'))
  const accent = ok ? '#4ccf7a' : '#d44a37'

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
        padding: '40px 28px',
        textAlign: 'center',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: ok ? 'rgba(76,207,122,0.12)' : 'rgba(212,74,55,0.12)',
          border: `1px solid ${accent}`,
          color: accent,
          fontSize: '2rem',
          marginBottom: 22,
        }}>
          {ok ? '✓' : '!'}
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c9a84c', fontSize: '1.6rem', margin: '0 0 12px', fontWeight: 600 }}>
          {title}
        </h1>
        <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          {body}
        </p>
      </div>
    </main>
  )
}

export default function ExistingClientPage() {
  return (
    <Suspense fallback={null}>
      <ExistingClientView />
    </Suspense>
  )
}
