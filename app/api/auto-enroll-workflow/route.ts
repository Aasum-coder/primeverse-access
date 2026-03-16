import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

// Auto-enroll a new lead into active workflows with trigger_type='lead_signup'
export async function POST(request: Request) {
  const { leadId, distributorId } = await request.json() as {
    leadId: string
    distributorId: string
  }

  if (!leadId || !distributorId) {
    return NextResponse.json({ error: 'Missing leadId or distributorId' }, { status: 400 })
  }

  // Find active workflows for this distributor with lead_signup trigger
  const { data: workflows, error: wfError } = await supabaseAdmin
    .from('email_workflows')
    .select('id, name')
    .eq('owner_id', distributorId)
    .eq('trigger_type', 'lead_signup')
    .eq('status', 'active')

  if (wfError || !workflows || workflows.length === 0) {
    return NextResponse.json({ enrolled: 0 })
  }

  let enrolled = 0

  for (const wf of workflows) {
    // Check if already enrolled
    const { data: existing } = await supabaseAdmin
      .from('workflow_enrollments')
      .select('id')
      .eq('workflow_id', wf.id)
      .eq('lead_id', leadId)
      .in('status', ['active', 'completed'])
      .limit(1)

    if (existing && existing.length > 0) continue

    const now = new Date().toISOString()

    const { error: enrollError } = await supabaseAdmin
      .from('workflow_enrollments')
      .insert({
        workflow_id: wf.id,
        lead_id: leadId,
        distributor_id: distributorId,
        current_step_order: 1,
        status: 'active',
        last_step_at: now,
        enrolled_at: now,
      })

    if (!enrollError) {
      enrolled++
      // Log activity
      await supabaseAdmin.from('lead_activities').insert({
        lead_id: leadId,
        distributor_id: distributorId,
        activity_type: 'workflow_enrolled',
        metadata: { workflow_id: wf.id, workflow_name: wf.name },
      })
    }
  }

  return NextResponse.json({ enrolled })
}
