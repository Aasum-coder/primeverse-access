import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const TRIAGE_SECRET = 'systm8-triage-2026'

export async function POST(req: NextRequest) {
  // ─── Auth check ──────────────────────────────────────────────────────
  const secret = req.headers.get('x-triage-secret')
  if (secret !== TRIAGE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ─── Step 1: Check if templates already exist (idempotent) ──────────
    const { data: existingTemplates } = await supabaseAdmin
      .from('email_workflows')
      .select('id')
      .eq('is_global', true)
      .eq('is_template', true)
      .is('owner_id', null)

    if (existingTemplates && existingTemplates.length > 0) {
      return NextResponse.json({ message: `Templates already exist (${existingTemplates.length} found). No action taken.`, count: existingTemplates.length })
    }

    // ─── Step 2: Insert workflow templates ────────────────────────────────
    const { data: workflows, error: workflowError } = await supabaseAdmin
      .from('email_workflows')
      .insert([
        {
          name: 'Welcome Series',
          description: '3-email welcome sequence for new leads',
          trigger_type: 'lead_signup',
          trigger_config: {},
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'UID Reminder Sequence',
          description: 'Remind leads to submit their trading UID after 48h inactivity',
          trigger_type: 'lead_inactive',
          trigger_config: { days: 2 },
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'Weekly Nurture',
          description: 'Weekly educational email to keep leads engaged',
          trigger_type: 'schedule',
          trigger_config: {},
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'Stage Promotion',
          description: 'Congratulate lead on moving to a new pipeline stage',
          trigger_type: 'stage_change',
          trigger_config: {},
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'Re-engagement',
          description: 'Win back leads who have been inactive for 7+ days',
          trigger_type: 'lead_inactive',
          trigger_config: { days: 7 },
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
      ])
      .select()

    if (workflowError || !workflows) {
      return NextResponse.json({ error: 'Failed to insert workflows', details: workflowError }, { status: 500 })
    }

    const welcomeId = workflows[0].id
    const uidReminderId = workflows[1].id
    const weeklyNurtureId = workflows[2].id
    const stagePromotionId = workflows[3].id
    const reEngagementId = workflows[4].id

    // ─── Step 3: Insert workflow steps ────────────────────────────────────
    const steps = [
      // ── Welcome Series ─────────────────────────────────────────────────
      {
        workflow_id: welcomeId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'Welcome to the community, {first_name}!',
          body: "Welcome! We're excited to have you join our trading community.\n\nHere's what you can expect:\n• Access to professional trading education\n• A supportive community of traders\n• Tools and resources to help you succeed\n\nGet started by exploring our platform: {landing_page_url}",
        },
      },
      {
        workflow_id: welcomeId,
        step_order: 2,
        step_type: 'email',
        config: {
          subject: 'Your next steps',
          body: "Hey {first_name},\n\nNow that you've joined, here are your next steps:\n1. Complete your profile setup\n2. Explore the educational resources\n3. Set up your trading account: {referral_link}\n\nEvery successful trader started exactly where you are now.",
        },
      },

      // ── UID Reminder Sequence ──────────────────────────────────────────
      {
        workflow_id: uidReminderId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'Don\'t forget to submit your UID, {first_name}',
          body: "Hey {first_name},\n\nWe noticed you haven't submitted your trading UID yet.\n\nSubmitting your UID unlocks full access to our community features and allows us to track your progress.\n\nIt only takes a minute — visit your dashboard to submit it now: {landing_page_url}",
        },
      },
      {
        workflow_id: uidReminderId,
        step_order: 2,
        step_type: 'email',
        config: {
          subject: 'Final reminder: Submit your UID',
          body: "Hi {first_name},\n\nThis is a friendly reminder to submit your trading UID so we can fully activate your account.\n\nOnce submitted, you'll get access to:\n• Personalized trading insights\n• Community leaderboards\n• Direct mentor support\n\nSubmit your UID here: {landing_page_url}",
        },
      },

      // ── Weekly Nurture ─────────────────────────────────────────────────
      {
        workflow_id: weeklyNurtureId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'Weekly insight: Trading tip of the week',
          body: "Hey {first_name},\n\nHere's this week's trading insight:\n\nSuccessful traders focus on risk management above all else. Never risk more than 1-2% of your capital on a single trade.\n\nKey principles:\n• Set stop-losses on every trade\n• Diversify your positions\n• Keep emotions out of decisions\n\nExplore more resources: {landing_page_url}",
        },
      },

      // ── Stage Promotion ────────────────────────────────────────────────
      {
        workflow_id: stagePromotionId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'Congratulations on your progress, {first_name}!',
          body: "Hey {first_name},\n\nGreat news — you've just moved to a new stage in your trading journey!\n\nThis is a testament to your dedication and hard work. Keep up the momentum.\n\nHere's what's available to you now:\n• New educational content unlocked\n• Advanced trading resources\n• Community recognition\n\nKeep pushing forward: {landing_page_url}",
        },
      },

      // ── Re-engagement ──────────────────────────────────────────────────
      {
        workflow_id: reEngagementId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'We miss you, {first_name}!',
          body: "Hey {first_name},\n\nWe noticed you haven't been around lately.\n\nSince you've been away, we've added:\n• New educational content\n• Updated trading resources\n• Community events and discussions\n\nCome back and see what's new: {landing_page_url}",
        },
      },
      {
        workflow_id: reEngagementId,
        step_order: 2,
        step_type: 'email',
        config: {
          subject: 'Last chance: We\'d love to have you back',
          body: "Hi {first_name},\n\nWe don't want you to miss out on what our community has to offer.\n\nHere's what's waiting for you:\n• A supportive trading community\n• Professional education resources\n• Direct access to experienced traders\n\nTake action now: {landing_page_url}\n\nWe hope to see you back soon!",
        },
      },
    ]

    const { error: stepsError } = await supabaseAdmin
      .from('workflow_steps')
      .insert(steps)

    if (stepsError) {
      return NextResponse.json({ error: 'Failed to insert steps', details: stepsError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      templates: workflows.map((w) => ({ id: w.id, name: w.name })),
      total_steps: steps.length,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
