import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: userData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('user_id', userData.user.id)
    .single()

  if (!dist) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
  }

  const { count } = await supabaseAdmin
    .from('scheduled_posts')
    .select('id', { count: 'exact', head: true })
    .eq('distributor_id', dist.id)

  const { data: connections } = await supabaseAdmin
    .from('social_connections')
    .select('platform')
    .eq('distributor_id', dist.id)
    .eq('is_connected', true)

  return NextResponse.json({
    posts: count || 0,
    connections: (connections || []).map(c => c.platform),
  })
}
