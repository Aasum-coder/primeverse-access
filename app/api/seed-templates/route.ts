import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

export async function GET() {
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
          name: 'Welcome Sequence',
          description: 'Automated 8-step welcome series for new leads who sign up through your landing page.',
          trigger_type: 'lead_signup',
          trigger_config: {},
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'Re-engagement Campaign',
          description: 'Win back inactive leads with a 5-step re-engagement series after 14 days of inactivity.',
          trigger_type: 'lead_inactive',
          trigger_config: { days: 14 },
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'New Member Onboarding',
          description: '7-step onboarding flow for leads who have signed up and verified their account.',
          trigger_type: 'stage_change',
          trigger_config: { stage: 'Signed Up' },
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'Member Value Drip',
          description: 'Weekly educational drip with trading insights, tips, and resources over 7 steps.',
          trigger_type: 'manual',
          trigger_config: {},
          status: 'draft',
          is_template: true,
          is_global: true,
          owner_id: null,
        },
        {
          name: 'VIP Upgrade Path',
          description: '5-step VIP nurture sequence for active members ready for exclusive content.',
          trigger_type: 'stage_change',
          trigger_config: { stage: 'Active' },
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
    const reEngagementId = workflows[1].id
    const onboardingId = workflows[2].id
    const valueDripId = workflows[3].id
    const vipId = workflows[4].id

    // ─── Step 3: Insert workflow steps ────────────────────────────────────

    const steps = [
      // ── Welcome Sequence ──────────────────────────────────────────────
      {
        workflow_id: welcomeId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: "Welcome to {first_name}'s trading community!",
          body: "Welcome! We're excited to have you join our trading community. Here's what you can expect:\n\n\u2022 Access to professional trading education\n\u2022 A supportive community of traders\n\u2022 Tools and resources to help you succeed\n\nGet started by exploring our platform and discovering what's available to you.\n\nClick here to explore: {landing_page_url}",
        },
      },
      {
        workflow_id: welcomeId,
        step_order: 2,
        step_type: 'wait',
        config: { days: 2 },
      },
      {
        workflow_id: welcomeId,
        step_order: 3,
        step_type: 'email',
        config: {
          subject: 'Your first steps in trading',
          body: "Now that you've joined, let's get you started on the right foot.\n\nHere are your first steps:\n1. Complete your profile setup\n2. Explore the educational resources\n3. Connect with the community\n4. Set up your trading account: {referral_link}\n\nRemember, every successful trader started exactly where you are now.",
        },
      },
      {
        workflow_id: welcomeId,
        step_order: 4,
        step_type: 'wait',
        config: { days: 3 },
      },
      {
        workflow_id: welcomeId,
        step_order: 5,
        step_type: 'condition',
        config: {
          condition_type: 'opened',
          target_step_order: 1,
          then_step_order: 6,
          else_step_order: 8,
        },
      },
      {
        workflow_id: welcomeId,
        step_order: 6,
        step_type: 'email',
        config: {
          subject: '3 things successful traders do differently',
          body: "Hey {first_name},\n\nAfter working with hundreds of traders, we've noticed 3 key habits that separate the successful ones:\n\n1. They invest in education before investing money\n2. They follow a structured approach, not emotions\n3. They surround themselves with other serious traders\n\nYou're already doing #3 by being part of this community. Keep going!",
        },
      },
      {
        workflow_id: welcomeId,
        step_order: 7,
        step_type: 'wait',
        config: { days: 4 },
      },
      {
        workflow_id: welcomeId,
        step_order: 8,
        step_type: 'email',
        config: {
          subject: 'Ready to take the next step?',
          body: "Hi {first_name},\n\nYou've been part of our community for over a week now. If you haven't already, it's time to take the next step.\n\nOpen your trading account through our verified partner link and start your journey:\n{referral_link}\n\nThe setup takes less than 5 minutes, and our team is here to help if you need anything.",
        },
      },

      // ── Re-engagement Campaign ────────────────────────────────────────
      {
        workflow_id: reEngagementId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'We miss you, {first_name}!',
          body: "Hey {first_name},\n\nWe noticed you haven't been around lately, and we wanted to reach out.\n\nSince you've been away, we've added:\n\u2022 New educational content\n\u2022 Updated trading resources\n\u2022 Community events and discussions\n\nCome back and see what's new: {landing_page_url}",
        },
      },
      {
        workflow_id: reEngagementId,
        step_order: 2,
        step_type: 'wait',
        config: { days: 3 },
      },
      {
        workflow_id: reEngagementId,
        step_order: 3,
        step_type: 'email',
        config: {
          subject: 'A quick question...',
          body: "Hi {first_name},\n\nWe just wanted to check in \u2014 is there anything we can help you with?\n\nWhether you need:\n\u2022 Help getting started\n\u2022 Guidance on next steps\n\u2022 Technical support\n\nWe're here for you. Simply reply or reach out through the platform.\n\nYour success is our priority.",
        },
      },
      {
        workflow_id: reEngagementId,
        step_order: 4,
        step_type: 'wait',
        config: { days: 4 },
      },
      {
        workflow_id: reEngagementId,
        step_order: 5,
        step_type: 'email',
        config: {
          subject: 'Last chance: Special opportunity',
          body: "Hi {first_name},\n\nThis is our final reminder. We don't want you to miss out on what our community has to offer.\n\nHere's what's waiting for you:\n\u2022 A supportive trading community\n\u2022 Professional education resources\n\u2022 Direct access to experienced traders\n\nTake action now: {landing_page_url}\n\nWe hope to see you back soon!",
        },
      },

      // ── New Member Onboarding ─────────────────────────────────────────
      {
        workflow_id: onboardingId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: "You're in! Here's what happens next",
          body: "Congratulations {first_name}!\n\nYour account has been verified and you now have full access to our trading community.\n\nHere's what happens next:\n1. Explore the community dashboard\n2. Access the educational library\n3. Connect with your trading peers\n4. Join our live sessions\n\nWelcome aboard!",
        },
      },
      {
        workflow_id: onboardingId,
        step_order: 2,
        step_type: 'wait',
        config: { days: 1 },
      },
      {
        workflow_id: onboardingId,
        step_order: 3,
        step_type: 'email',
        config: {
          subject: 'Meet your trading community',
          body: "Hey {first_name},\n\nOne of the best parts of being in our community is the people.\n\nHere's how to connect:\n\u2022 Join the community discussions\n\u2022 Participate in live trading sessions\n\u2022 Share your progress and learn from others\n\nTrading doesn't have to be a solo journey. Let's grow together!",
        },
      },
      {
        workflow_id: onboardingId,
        step_order: 4,
        step_type: 'wait',
        config: { days: 3 },
      },
      {
        workflow_id: onboardingId,
        step_order: 5,
        step_type: 'email',
        config: {
          subject: 'Your first week: What to focus on',
          body: "Hi {first_name},\n\nYou've been with us for about a week now. Here's what to focus on:\n\nWeek 1 priorities:\n\u2022 Complete the beginner modules\n\u2022 Set up your demo trading account\n\u2022 Join at least one live session\n\u2022 Connect with 3 other community members\n\nRemember: consistency beats intensity. Small daily progress adds up.",
        },
      },
      {
        workflow_id: onboardingId,
        step_order: 6,
        step_type: 'wait',
        config: { days: 7 },
      },
      {
        workflow_id: onboardingId,
        step_order: 7,
        step_type: 'switch_workflow',
        config: { target_workflow_id: null },
      },

      // ── Member Value Drip ─────────────────────────────────────────────
      {
        workflow_id: valueDripId,
        step_order: 1,
        step_type: 'email',
        config: {
          subject: 'Weekly insight: Market analysis basics',
          body: "Hey {first_name},\n\nThis week's insight: Understanding Market Analysis\n\nThere are two main types of analysis:\n1. Technical Analysis \u2014 Reading charts and patterns\n2. Fundamental Analysis \u2014 Understanding economic factors\n\nBoth are essential tools in a trader's toolkit. Start with the basics and build from there.\n\nExplore our resources: {landing_page_url}",
        },
      },
      {
        workflow_id: valueDripId,
        step_order: 2,
        step_type: 'wait',
        config: { days: 7 },
      },
      {
        workflow_id: valueDripId,
        step_order: 3,
        step_type: 'email',
        config: {
          subject: 'Pro tip: Risk management essentials',
          body: "Hi {first_name},\n\nToday's topic: Risk Management\n\nThe #1 rule successful traders follow:\nNever risk more than you can afford to lose.\n\nKey principles:\n\u2022 Set stop-losses on every trade\n\u2022 Never risk more than 1-2% per trade\n\u2022 Diversify your positions\n\u2022 Keep emotions out of your decisions\n\nRisk management isn't just a skill \u2014 it's a mindset.",
        },
      },
      {
        workflow_id: valueDripId,
        step_order: 4,
        step_type: 'wait',
        config: { days: 7 },
      },
      {
        workflow_id: valueDripId,
        step_order: 5,
        step_type: 'email',
        config: {
          subject: 'Success story: How {first_name} can grow',
          body: "Hey {first_name},\n\nEvery expert was once a beginner.\n\nThe traders who succeed in our community share these traits:\n\u2022 They show up consistently\n\u2022 They follow their trading plan\n\u2022 They learn from losses instead of fearing them\n\u2022 They invest in their education\n\nYou have everything you need to succeed. Keep pushing forward!",
        },
      },
      {
        workflow_id: valueDripId,
        step_order: 6,
        step_type: 'wait',
        config: { days: 7 },
      },
      {
        workflow_id: valueDripId,
        step_order: 7,
        step_type: 'email',
        config: {
          subject: 'Advanced: Reading chart patterns',
          body: "Hi {first_name},\n\nReady to level up? Let's talk chart patterns.\n\nKey patterns every trader should know:\n1. Head and Shoulders \u2014 Trend reversal signal\n2. Double Top/Bottom \u2014 Support and resistance\n3. Triangle Patterns \u2014 Continuation signals\n4. Flag Patterns \u2014 Short-term consolidation\n\nMastering these patterns takes practice. Study the charts daily and you'll start seeing them everywhere.\n\nAccess our chart pattern guide: {landing_page_url}",
        },
      },

      // ── VIP Upgrade Path ──────────────────────────────────────────────
      {
        workflow_id: vipId,
        step_order: 1,
        step_type: 'wait',
        config: { days: 3 },
      },
      {
        workflow_id: vipId,
        step_order: 2,
        step_type: 'email',
        config: {
          subject: "You've earned something special",
          body: "Hey {first_name},\n\nYour dedication hasn't gone unnoticed.\n\nAs an active member of our trading community, you've unlocked access to exclusive VIP benefits:\n\n\u2022 Priority access to new content\n\u2022 VIP-only trading sessions\n\u2022 Advanced market analysis\n\u2022 Direct mentor access\n\nStay tuned \u2014 more details coming soon!",
        },
      },
      {
        workflow_id: vipId,
        step_order: 3,
        step_type: 'wait',
        config: { days: 5 },
      },
      {
        workflow_id: vipId,
        step_order: 4,
        step_type: 'email',
        config: {
          subject: 'Exclusive: VIP community access',
          body: "Hi {first_name},\n\nIt's time. You're officially invited to our VIP community.\n\nWhat's included:\n\u2022 Private Telegram group with experienced traders\n\u2022 Weekly VIP market analysis\n\u2022 Priority support\n\u2022 Exclusive educational content\n\nThis is where the serious traders connect and grow together.\n\nWelcome to the inner circle!",
        },
      },
      {
        workflow_id: vipId,
        step_order: 5,
        step_type: 'email',
        config: {
          subject: 'Your VIP journey starts now',
          body: "Hey {first_name},\n\nAs a VIP member, you now have access to our most powerful resources.\n\nYour next steps:\n1. Join the VIP Telegram group\n2. Book your first one-on-one session\n3. Access the advanced trading library\n4. Connect with other VIP members\n\nYou've put in the work to get here. Now let's take your trading to the next level.\n\nSee you inside: {landing_page_url}",
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
