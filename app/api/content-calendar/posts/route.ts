import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function getDistributorId(token: string): Promise<string | null> {
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: userData, error } = await authClient.auth.getUser(token)
  if (error || !userData?.user) return null

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('user_id', userData.user.id)
    .single()

  return dist?.id || null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const distributorId = await getDistributorId(token)
  if (!distributorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('scheduled_posts')
    .select('*')
    .eq('distributor_id', distributorId)
    .order('scheduled_for', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data || [] })
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const distributorId = await getDistributorId(token)
  if (!distributorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { platform, content, scheduled_for, post_type, image_url } = body
  if (!platform || !content || !scheduled_for) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('scheduled_posts')
    .insert({
      distributor_id: distributorId,
      platform,
      content,
      scheduled_for,
      post_type: post_type || 'post',
      image_url: image_url || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const distributorId = await getDistributorId(token)
  if (!distributorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Missing post id' }, { status: 400 })

  const allowed = ['content', 'scheduled_for', 'status', 'platform', 'post_type', 'image_url']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key]
  }

  const { data, error } = await supabaseAdmin
    .from('scheduled_posts')
    .update(updates)
    .eq('id', id)
    .eq('distributor_id', distributorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const distributorId = await getDistributorId(token)
  if (!distributorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing post id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
    .eq('distributor_id', distributorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
