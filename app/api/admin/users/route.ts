import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
)

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

export async function GET(req: Request) {
  // Auth check: verify caller is admin
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAnon.auth.getUser(token)
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all distributors with lead counts using service role
  const { data: distributors, error } = await supabaseAdmin
    .from('distributors')
    .select('id, name, email, slug, landing_active, referral_link, profile_image, created_at, user_id, ib_status, ib_status_note, ib_approved_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users', details: error }, { status: 500 })
  }

  // Fetch lead counts per distributor
  const { data: leadCounts } = await supabaseAdmin
    .from('leads')
    .select('distributor_id')

  const countMap: Record<string, number> = {}
  if (leadCounts) {
    for (const lead of leadCounts) {
      countMap[lead.distributor_id] = (countMap[lead.distributor_id] || 0) + 1
    }
  }

  const users = (distributors || []).map(d => ({
    ...d,
    lead_count: countMap[d.id] || 0,
  }))

  return NextResponse.json({ users })
}
