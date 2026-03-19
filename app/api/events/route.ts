import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/events?select=*,event_registrations(count)&order=created_at.desc`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const events = await res.json()
  if (!Array.isArray(events)) return NextResponse.json([])

  const pendingRes = await fetch(
    `${supabaseUrl}/rest/v1/event_registrations?select=event_id&status=eq.pending`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  )

  const pendingRows = await pendingRes.json()
  const pendingMap: Record<string, number> = {}
  if (Array.isArray(pendingRows)) {
    pendingRows.forEach((r: { event_id: string }) => {
      pendingMap[r.event_id] = (pendingMap[r.event_id] ?? 0) + 1
    })
  }

  const result = events.map((event: any) => ({
    ...event,
    total_registrations: event.event_registrations?.[0]?.count ?? 0,
    pending_count: pendingMap[event.id] ?? 0
  }))

  return NextResponse.json(result)
}
