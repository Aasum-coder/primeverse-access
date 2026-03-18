'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { min-height: 100vh; font-family: 'Outfit', sans-serif; background: #0a0a0a; color: #f0e6d0; }
  .imp-loading {
    position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px; z-index: 9999;
  }
  .imp-spinner {
    width: 32px; height: 32px; border: 2px solid #d4a537; border-top-color: transparent;
    border-radius: 50%; animation: impSpin 0.8s linear infinite;
  }
  @keyframes impSpin { to { transform: rotate(360deg); } }
  .imp-error {
    position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    font-size: 0.92rem; color: #9a917e;
  }
  .imp-error a {
    color: #d4a537; text-decoration: none; font-size: 0.85rem;
    padding: 8px 16px; border: 1px solid rgba(212,165,55,0.3); border-radius: 8px;
  }
`

function ImpersonateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')
  const [error, setError] = useState('')

  useEffect(() => {
    async function startImpersonation() {
      if (!userId) {
        setError('No user ID provided')
        return
      }

      // Verify the user exists in distributors
      const { data, error: fetchErr } = await supabase
        .from('distributors')
        .select('id, name')
        .eq('user_id', userId)
        .single()

      if (fetchErr || !data) {
        console.error('Failed to fetch distributor for impersonation:', fetchErr)
        setError('User not found')
        return
      }

      // Set the impersonation cookie
      document.cookie = `impersonate_user_id=${userId}; path=/; max-age=3600; SameSite=Lax`

      // Redirect to main dashboard
      router.push('/')
    }

    startImpersonation()
  }, [userId, router])

  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="imp-error">
          <p>{error}</p>
          <a href="/admin/console">← Back to Admin Console</a>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="imp-loading">
        <div className="imp-spinner" />
        <p style={{ color: '#9a917e', fontSize: '0.85rem' }}>Loading dashboard...</p>
      </div>
    </>
  )
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="imp-loading">
          <div className="imp-spinner" />
        </div>
      </>
    }>
      <ImpersonateContent />
    </Suspense>
  )
}
