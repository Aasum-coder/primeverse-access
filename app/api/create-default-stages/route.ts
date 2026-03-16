import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const DEFAULT_STAGES = [
  { name: 'New', color: '#3b82f6', position: 0 },
  { name: 'Contacted', color: '#f97316', position: 1 },
  { name: 'Interested', color: '#8b5cf6', position: 2 },
  { name: 'Signed Up', color: '#22c55e', position: 3 },
  { name: 'Active', color: '#14b8a6', position: 4 },
  { name: 'VIP', color: '#D4A843', position: 5 },
]

export async function POST(request: Request) {
  // Get user from auth cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    { global: { headers: { cookie: cookieHeader } } }
  )
  const { data: userData } = await anonClient.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = userData.user.id

  // Check if user already has pipeline stages
  const { data: existing } = await supabaseAdmin
    .from('pipeline_stages')
    .select('id')
    .eq('owner_id', userId)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Pipeline stages already exist', count: existing.length })
  }

  // Create default stages
  const stages = DEFAULT_STAGES.map(s => ({
    ...s,
    owner_id: userId,
  }))

  const { error } = await supabaseAdmin
    .from('pipeline_stages')
    .insert(stages)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Default pipeline stages created', stages: DEFAULT_STAGES.map(s => s.name) })
}
