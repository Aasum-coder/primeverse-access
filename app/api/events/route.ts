import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/events?select=*&order=created_at.desc&is_active=eq.true`,
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

  const regRes = await fetch(
    `${supabaseUrl}/rest/v1/event_registrations?select=event_id,status`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  )

  const allRegs = await regRes.json()
  const regsMap: Record<string, number> = {}
  const pendingMap: Record<string, number> = {}

  if (Array.isArray(allRegs)) {
    allRegs.forEach((r: { event_id: string; status: string }) => {
      regsMap[r.event_id] = (regsMap[r.event_id] ?? 0) + 1
      if (r.status === 'pending') {
        pendingMap[r.event_id] = (pendingMap[r.event_id] ?? 0) + 1
      }
    })
  }

  const result = events.map((event: any) => ({
    ...event,
    total_registrations: regsMap[event.id] ?? 0,
    pending_count: pendingMap[event.id] ?? 0
  }))

  return NextResponse.json(result)
}
