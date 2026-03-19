import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

export async function GET() {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, slug, title, description, event_date, zoom_link, max_attendees, is_active, created_by, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Use head:true with count:'exact' to get accurate counts without row limits
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (e) => {
        const [totalRes, pendingRes] = await Promise.all([
          supabaseAdmin
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', e.id),
          supabaseAdmin
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', e.id)
            .eq('status', 'pending'),
        ])

        const total_registrations = totalRes.count ?? 0
        const pending_count = pendingRes.count ?? 0

        return {
          ...e,
          total_registrations,
          pending_count,
          registration_counts: {
            total: total_registrations,
            pending: pending_count,
            approved: 0,
            rejected: 0,
          },
        }
      })
    )

    return NextResponse.json({ events: eventsWithCounts })
  } catch (err: any) {
    console.error('[events] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch events' }, { status: 500 })
  }
}
