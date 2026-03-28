import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { distributor_id, slug, referrer, utm_source, utm_medium } = body

    if (!distributor_id || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Country from edge headers
    const country = request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? null

    // Device from User-Agent
    const ua = request.headers.get('user-agent') ?? ''
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

    // Normalize case
    const normalizedReferrer = referrer?.toLowerCase().trim() ?? null
    const normalizedUtmSource = utm_source?.toLowerCase().trim() ?? null
    const normalizedUtmMedium = utm_medium?.toLowerCase().trim() ?? null

    await supabase.from('page_views').insert({
      distributor_id,
      slug,
      created_at: new Date().toISOString(),
      referrer: normalizedReferrer,
      utm_source: normalizedUtmSource,
      utm_medium: normalizedUtmMedium,
      device,
      country,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
