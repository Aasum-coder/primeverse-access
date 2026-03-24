import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const origin = request.nextUrl.origin

  // Handle PKCE code exchange
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Code exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
    }
    // Recovery flow: redirect to reset-password page so user can set new password
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password?code=${code}`)
    }
    return NextResponse.redirect(`${origin}/login?confirmed=true`)
  }

  // Handle token_hash (email verification / magic link)
  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    )
    // Recovery flow: redirect to reset-password page
    if (type === 'recovery') {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
      if (error) {
        console.error('Recovery OTP verification failed:', error.message)
        return NextResponse.redirect(`${origin}/reset-password#error=access_denied`)
      }
      return NextResponse.redirect(`${origin}/reset-password`)
    }
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (error) {
      console.error('OTP verification failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
    }
    return NextResponse.redirect(`${origin}/login?confirmed=true`)
  }

  // Fallback: redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
