import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('[events] Fetch events error:', eventsError)
  console.log('[events] Events count:', events?.length ?? 0)

  if (!events) return NextResponse.json([])

  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const { count: total, error: totalErr } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)

      const { count: pending, error: pendingErr } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'pending')

      console.log(`[events] Event "${event.title}" (${event.id}): total=${total}, pending=${pending}, totalErr=${totalErr?.message}, pendingErr=${pendingErr?.message}`)

      return {
        ...event,
        total_registrations: total ?? 0,
        pending_count: pending ?? 0
      }
    })
  )

  console.log('[events] First event with counts:', JSON.stringify(eventsWithCounts[0], null, 2))

  return NextResponse.json(eventsWithCounts)
}
