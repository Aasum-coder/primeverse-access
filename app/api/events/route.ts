import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select(`
      *,
      event_registrations(count)
    `)
    .order('created_at', { ascending: false })

  if (error || !events) {
    return NextResponse.json([])
  }

  const { data: pendingCounts } = await supabaseAdmin
    .from('event_registrations')
    .select('event_id')
    .eq('status', 'pending')

  const pendingMap: Record<string, number> = {}
  pendingCounts?.forEach(r => {
    pendingMap[r.event_id] = (pendingMap[r.event_id] ?? 0) + 1
  })

  const result = events.map(event => ({
    ...event,
    total_registrations: event.event_registrations?.[0]?.count ?? 0,
    pending_count: pendingMap[event.id] ?? 0
  }))

  return NextResponse.json(result)
}
