'use client'

/**
 * Header utility for admin button visibility check.
 * The main SYSTM8 dashboard (app/page.tsx) has its header inline.
 * This component provides the admin button logic for any future pages
 * that need a standalone header with admin access.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

const ADMIN_EMAIL = 'bitaasum@gmail.com'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email === ADMIN_EMAIL) setIsAdmin(true)
      } catch { /* ignore */ }
    }
    check()
  }, [])

  return isAdmin
}

export default function AdminButton() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) return null

  return (
    <a
      href="/admin/console"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
        background: 'rgba(212,165,55,0.08)', border: '1px solid rgba(212,165,55,0.25)',
        color: '#d4a537', fontFamily: "'Outfit', sans-serif",
        fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
        transition: 'all 0.2s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      Admin Console
    </a>
  )
}
