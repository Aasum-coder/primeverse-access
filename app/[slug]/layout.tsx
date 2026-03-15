import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
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

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
