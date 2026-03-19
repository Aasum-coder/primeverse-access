import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (!events) return NextResponse.json([])

  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const { count: total } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)

      const { count: pending } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'pending')

      return {
        ...event,
        total_registrations: total ?? 0,
        pending_count: pending ?? 0
      }
    })
  )

  return NextResponse.json(eventsWithCounts)
}
