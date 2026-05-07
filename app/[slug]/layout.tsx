import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isBot } from '@/lib/analytics/bot-detection'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

// Service-role client for fire-and-forget tracking inserts. Bypasses RLS
// so the visitor doesn't need to be authenticated, and shields the table
// from drive-by writes via the anon role. Only ever writes — never reads.
const tracking = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

const logoUrl = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png'

function parseProfileImageUrl(value: string | null): string {
  if (!value) return ''
  try {
    const p = JSON.parse(value)
    if (p && typeof p.url === 'string') return p.url
  } catch {}
  return value
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('distributors')
    .select('name, bio, profile_image')
    .eq('slug', slug)
    .limit(1)

  const dist = data?.[0]
  if (!dist) {
    return {
      title: '1Move Academy Access Portal',
      description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
    }
  }

  const name = dist.name || slug
  const title = `${name} — 1Move Academy Partner`
  const description = dist.bio
    ? dist.bio.length > 160 ? dist.bio.slice(0, 157) + '...' : dist.bio
    : "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse"
  const imageUrl = parseProfileImageUrl(dist.profile_image) || logoUrl

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: '1Move Academy',
      images: [{ url: imageUrl, alt: name }],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  // Anonymous visitor tracking — country only, no IP storage.
  // Fires once per render of the IB landing page. Fire-and-forget:
  // never await, never block the page, never throw to the renderer.
  try {
    const { slug } = await params
    const hdrs = await headers()
    const country = hdrs.get('x-vercel-ip-country') || null
    const userAgent = hdrs.get('user-agent') || null
    const bot = isBot(userAgent)

    void tracking
      .from('landing_visits')
      .insert({
        slug,
        country,
        user_agent: userAgent ? userAgent.slice(0, 200) : null,
        is_bot: bot,
      })
      .then(({ error }) => {
        if (error) console.error('[landing-visits] insert failed:', error.message)
      })
  } catch (err) {
    console.error('[landing-visits] tracking skipped:', err)
  }

  return <>{children}</>
}
