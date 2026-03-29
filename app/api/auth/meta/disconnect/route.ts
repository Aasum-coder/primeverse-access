import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { distributor_id, platform } = await request.json()

    if (!distributor_id || !platform) {
      return NextResponse.json({ error: 'Missing distributor_id or platform' }, { status: 400 })
    }

    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('distributor_id', distributor_id)
      .eq('platform', platform)

    if (error) {
      console.error('Disconnect error:', error)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
