'use client'

// Success page reached after /api/leads/verify-uid returns granted:true.
// Phase A keeps the copy generic — Email #2 (PR B) will pick up where this
// leaves off and ask the lead for a contact preference.

export default function VerifyUidSuccessPage() {
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
          background: 'rgba(76,207,122,0.12)',
          border: '1px solid #4ccf7a',
          color: '#4ccf7a',
          fontSize: '2rem',
          marginBottom: 22,
        }}>
          ✓
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c9a84c', fontSize: '1.75rem', margin: '0 0 12px', fontWeight: 600 }}>
          You’re in.
        </h1>
        <p style={{ color: '#bbb', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 22px' }}>
          Your PU Prime account is verified. Check your email for next steps — your IB will reach out shortly with access details.
        </p>
        <p style={{ color: '#888', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
          People Before Profit.
        </p>
      </div>
    </main>
  )
}
