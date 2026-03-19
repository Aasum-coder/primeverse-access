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

    // Get registration counts per event
    const eventIds = (events || []).map(e => e.id)

    let regCounts: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {}

    if (eventIds.length > 0) {
      const { data: regs } = await supabaseAdmin
        .from('event_registrations')
        .select('event_id, status')
        .in('event_id', eventIds)

      for (const reg of (regs || [])) {
        if (!regCounts[reg.event_id]) {
          regCounts[reg.event_id] = { total: 0, pending: 0, approved: 0, rejected: 0 }
        }
        regCounts[reg.event_id].total++
        if (reg.status === 'pending') regCounts[reg.event_id].pending++
        else if (reg.status === 'approved') regCounts[reg.event_id].approved++
        else if (reg.status === 'rejected') regCounts[reg.event_id].rejected++
      }
    }

    const eventsWithCounts = (events || []).map(e => ({
      ...e,
      registration_counts: regCounts[e.id] || { total: 0, pending: 0, approved: 0, rejected: 0 },
    }))

    return NextResponse.json({ events: eventsWithCounts })
  } catch (err: any) {
    console.error('[events] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch events' }, { status: 500 })
  }
}
