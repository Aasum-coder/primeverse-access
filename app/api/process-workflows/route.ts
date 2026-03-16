import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildBroadcastEmail } from '@/lib/email-templates/broadcast'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  let processed = 0
  let advanced = 0
  let emailsSent = 0
  const errors: string[] = []

  // Fetch all active workflow enrollments
  const { data: enrollments, error: enrollError } = await supabaseAdmin
    .from('workflow_enrollments')
    .select('*')
    .eq('status', 'active')

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 })
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ processed: 0, advanced: 0, emails_sent: 0, errors: [] })
  }

  for (const enrollment of enrollments) {
    try {
      processed++

      // Get the workflow
      const { data: workflow } = await supabaseAdmin
        .from('email_workflows')
        .select('*')
        .eq('id', enrollment.workflow_id)
        .single()

      if (!workflow || workflow.status !== 'active') continue

      // Get all steps for this workflow
      const { data: steps } = await supabaseAdmin
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('step_order', { ascending: true })

      if (!steps || steps.length === 0) continue

      // Check if enrollment has exceeded total steps
      if (enrollment.current_step_order > steps.length) {
        await supabaseAdmin
          .from('workflow_enrollments')
          .update({ status: 'completed', completed_at: now.toISOString() })
          .eq('id', enrollment.id)
        continue
      }

      // Get the current step
      const currentStep = steps.find((s: any) => s.step_order === enrollment.current_step_order)
      if (!currentStep) {
        // No step found at this order — mark completed
        await supabaseAdmin
          .from('workflow_enrollments')
          .update({ status: 'completed', completed_at: now.toISOString() })
          .eq('id', enrollment.id)
        continue
      }

      const config = currentStep.config || {}

      // ─── EMAIL step ────────────────────────────────────────────
      if (currentStep.step_type === 'email') {
        // Get lead info
        const { data: lead } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('id', enrollment.lead_id)
          .single()

        if (!lead) {
          errors.push(`enrollment ${enrollment.id}: lead ${enrollment.lead_id} not found`)
          continue
        }

        // Get distributor info
        const { data: distributor } = await supabaseAdmin
          .from('distributors')
          .select('*')
          .eq('id', enrollment.distributor_id)
          .single()

        if (!distributor) {
          errors.push(`enrollment ${enrollment.id}: distributor ${enrollment.distributor_id} not found`)
          continue
        }

        // Resolve merge tags
        const landingPageUrl = distributor.slug
          ? `https://primeverseaccess.com/${distributor.slug}`
          : ''
        const referralLink = distributor.referral_link || ''
        const firstName = lead.first_name || lead.name?.split(' ')[0] || ''

        const resolvedSubject = (config.subject || '')
          .replace(/\{first_name\}/g, firstName)
          .replace(/\{landing_page_url\}/g, landingPageUrl)
          .replace(/\{referral_link\}/g, referralLink)

        const resolvedBody = (config.body || '')
          .replace(/\{first_name\}/g, firstName)
          .replace(/\{landing_page_url\}/g, landingPageUrl)
          .replace(/\{referral_link\}/g, referralLink)

        // Build HTML using broadcast email template
        const { html } = buildBroadcastEmail({
          title: resolvedSubject,
          message: resolvedBody,
          distributorName: distributor.name || '1Move Academy',
        })

        // Send via Resend
        const { error: sendError } = await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [lead.email],
          subject: resolvedSubject,
          html,
        })

        if (sendError) {
          errors.push(`enrollment ${enrollment.id}: send failed — ${sendError.message}`)
          continue
        }

        emailsSent++

        // Log activity
        await supabaseAdmin.from('lead_activities').insert({
          lead_id: enrollment.lead_id,
          distributor_id: enrollment.distributor_id,
          activity_type: 'workflow_email_sent',
          metadata: {
            workflow_id: enrollment.workflow_id,
            step_order: currentStep.step_order,
            subject: resolvedSubject,
          },
        })

        // Advance to next step
        const nextStepOrder = enrollment.current_step_order + 1
        if (nextStepOrder > steps.length) {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextStepOrder,
              last_step_at: now.toISOString(),
              status: 'completed',
              completed_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        } else {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextStepOrder,
              last_step_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        }

        advanced++
      }

      // ─── WAIT step ─────────────────────────────────────────────
      else if (currentStep.step_type === 'wait') {
        const delayMs =
          (config.value || 0) * (config.unit === 'days' ? 86400000 : 3600000)
        const lastStepAt = new Date(enrollment.last_step_at).getTime()

        if (now.getTime() >= lastStepAt + delayMs) {
          // Enough time has passed — advance
          const nextStepOrder = enrollment.current_step_order + 1
          if (nextStepOrder > steps.length) {
            await supabaseAdmin
              .from('workflow_enrollments')
              .update({
                current_step_order: nextStepOrder,
                last_step_at: now.toISOString(),
                status: 'completed',
                completed_at: now.toISOString(),
              })
              .eq('id', enrollment.id)
          } else {
            await supabaseAdmin
              .from('workflow_enrollments')
              .update({
                current_step_order: nextStepOrder,
                last_step_at: now.toISOString(),
              })
              .eq('id', enrollment.id)
          }
          advanced++
        }
        // If not enough time, skip — will be processed next run
      }

      // ─── CONDITION step ────────────────────────────────────────
      else if (currentStep.step_type === 'condition') {
        const conditionType = config.condition_type
        const targetStepOrder = config.target_step_order
        let conditionMet = false

        if (conditionType === 'opened') {
          const { data: activities } = await supabaseAdmin
            .from('lead_activities')
            .select('id')
            .eq('lead_id', enrollment.lead_id)
            .eq('activity_type', 'email_opened')
            .eq('metadata->>step_order', String(targetStepOrder))
            .limit(1)

          conditionMet = !!(activities && activities.length > 0)
        } else if (conditionType === 'clicked') {
          const { data: activities } = await supabaseAdmin
            .from('lead_activities')
            .select('id')
            .eq('lead_id', enrollment.lead_id)
            .eq('activity_type', 'email_clicked')
            .limit(1)

          conditionMet = !!(activities && activities.length > 0)
        } else if (conditionType === 'not_opened') {
          const { data: activities } = await supabaseAdmin
            .from('lead_activities')
            .select('id')
            .eq('lead_id', enrollment.lead_id)
            .eq('activity_type', 'email_opened')
            .limit(1)

          conditionMet = !activities || activities.length === 0
        }

        const nextOrder = conditionMet ? config.then_step_order : config.else_step_order

        if (nextOrder > steps.length) {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextOrder,
              last_step_at: now.toISOString(),
              status: 'completed',
              completed_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        } else {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextOrder,
              last_step_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        }

        advanced++
      }

      // ─── SWITCH_WORKFLOW step ──────────────────────────────────
      else if (currentStep.step_type === 'switch_workflow') {
        const targetWorkflowId = config.target_workflow_id

        // Mark current enrollment as switched
        await supabaseAdmin
          .from('workflow_enrollments')
          .update({
            status: 'switched',
            switched_to: targetWorkflowId,
            completed_at: now.toISOString(),
          })
          .eq('id', enrollment.id)

        // Create new enrollment in target workflow
        await supabaseAdmin.from('workflow_enrollments').insert({
          workflow_id: targetWorkflowId,
          lead_id: enrollment.lead_id,
          distributor_id: enrollment.distributor_id,
          current_step_order: 1,
          status: 'active',
          last_step_at: now.toISOString(),
          enrolled_at: now.toISOString(),
        })

        // Log activity
        await supabaseAdmin.from('lead_activities').insert({
          lead_id: enrollment.lead_id,
          distributor_id: enrollment.distributor_id,
          activity_type: 'workflow_switched',
          metadata: {
            from_workflow_id: enrollment.workflow_id,
            to_workflow_id: targetWorkflowId,
          },
        })

        advanced++
      }

      // ─── WHATSAPP / TELEGRAM (unsupported) ─────────────────────
      else if (currentStep.step_type === 'whatsapp' || currentStep.step_type === 'telegram') {
        errors.push(
          `enrollment ${enrollment.id}: unsupported channel ${currentStep.step_type} at step ${currentStep.step_order}`,
        )

        // Advance past unsupported step
        const nextStepOrder = enrollment.current_step_order + 1
        if (nextStepOrder > steps.length) {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextStepOrder,
              last_step_at: now.toISOString(),
              status: 'completed',
              completed_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        } else {
          await supabaseAdmin
            .from('workflow_enrollments')
            .update({
              current_step_order: nextStepOrder,
              last_step_at: now.toISOString(),
            })
            .eq('id', enrollment.id)
        }

        advanced++
      }
    } catch (err: any) {
      errors.push(`enrollment ${enrollment.id}: ${err?.message || 'unknown error'}`)
    }
  }

  return NextResponse.json({
    processed,
    advanced,
    emails_sent: emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
