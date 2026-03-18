'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ImpersonateRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')

  useEffect(() => {
    if (!userId) {
      router.push('/admin/console')
      return
    }
    document.cookie = `impersonate_user_id=${userId}; path=/; max-age=3600; SameSite=Lax`
    setTimeout(() => router.push('/'), 500)
  }, [userId, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-amber-400 text-sm">Loading dashboard...</div>
    </div>
  )
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400 text-sm">Loading...</div>
      </div>
    }>
      <ImpersonateRedirect />
    </Suspense>
  )
}
