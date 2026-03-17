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
    // ─── Step 1: Delete existing global templates ───────────────────────
    const { error: delStepsError } = await supabaseAdmin
      .from('workflow_steps')
      .delete()
      .in('workflow_id',
        (await supabaseAdmin
          .from('email_workflows')
          .select('id')
          .eq('is_template', true)
          .eq('is_global', true)
        ).data?.map((w: any) => w.id) || []
      )
    if (delStepsError) console.error('Failed to delete old template steps:', delStepsError)

    const { error: delWfError } = await supabaseAdmin
      .from('email_workflows')
      .delete()
      .eq('is_template', true)
      .eq('is_global', true)
    if (delWfError) console.error('Failed to delete old templates:', delWfError)

    // ─── Step 2: Insert 15 workflow templates ───────────────────────────
    const templateDefs = [
      { name: '\u{1F389} Welcome Series', trigger_type: 'lead_signup', description: 'Warm welcome email + follow-up on day 2 and day 5', trigger_config: {} },
      { name: '\u{1FAAA} UID Submission Reminder', trigger_type: 'lead_inactive', description: 'Remind leads to submit their PU Prime UID after 48h', trigger_config: { hours: 48 } },
      { name: '\u2705 UID Approved Celebration', trigger_type: 'stage_change', description: "Celebrate when a lead's UID gets verified and approved", trigger_config: {} },
      { name: '\u{1F4C8} Weekly Market Insights', trigger_type: 'schedule', description: 'Weekly educational email every Monday morning', trigger_config: {} },
      { name: '\u{1F4A4} Re-engagement (7 days)', trigger_type: 'lead_inactive', description: 'Win back leads inactive for 7 days', trigger_config: { days: 7 } },
      { name: '\u{1F680} Fast Track to IB', trigger_type: 'lead_signup', description: 'Convert active leads into IB partners fast', trigger_config: {} },
      { name: '\u{1F393} Trading Basics Course', trigger_type: 'lead_signup', description: '5-part educational email series for new traders', trigger_config: {} },
      { name: '\u{1F4B0} First Deposit Nudge', trigger_type: 'lead_inactive', description: 'Encourage leads to make their first deposit', trigger_config: { days: 5 } },
      { name: '\u{1F3C6} Milestone Celebration', trigger_type: 'stage_change', description: 'Celebrate lead reaching a new milestone stage', trigger_config: {} },
      { name: '\u{1F4E3} Referral Program Invite', trigger_type: 'stage_change', description: 'Invite verified leads to refer friends and earn', trigger_config: {} },
      { name: '\u{1F514} New Feature Announcement', trigger_type: 'manual', description: 'Announce a new platform feature to all leads', trigger_config: {} },
      { name: '\u{1F4C5} Webinar Invitation', trigger_type: 'manual', description: 'Invite leads to an upcoming webinar or live session', trigger_config: {} },
      { name: '\u{1F634} Long-term Inactive (30d)', trigger_type: 'lead_inactive', description: 'Final attempt to re-engage leads gone cold for 30 days', trigger_config: { days: 30 } },
      { name: '\u2B50 VIP Upgrade Path', trigger_type: 'stage_change', description: 'Guide high-potential leads toward VIP status', trigger_config: {} },
      { name: '\u{1F91D} IB Onboarding Flow', trigger_type: 'lead_signup', description: 'Dedicated onboarding sequence for new IB partners', trigger_config: {} },
    ]

    const { data: workflows, error: workflowError } = await supabaseAdmin
      .from('email_workflows')
      .insert(templateDefs.map(t => ({
        name: t.name,
        description: t.description,
        trigger_type: t.trigger_type,
        trigger_config: t.trigger_config,
        status: 'draft',
        is_template: true,
        is_global: true,
        owner_id: null,
      })))
      .select()

    if (workflowError || !workflows) {
      return NextResponse.json({ error: 'Failed to insert workflows', details: workflowError }, { status: 500 })
    }

    // Map workflow IDs by index
    const id = (i: number) => workflows[i].id

    // ─── Step 3: Insert workflow steps ──────────────────────────────────
    const steps = [
      // 1. Welcome Series: Email → Wait 2d → Email → Wait 3d → Email
      { workflow_id: id(0), step_order: 1, step_type: 'email', config: { subject: 'Welcome to the community, {first_name}!', body: "We're thrilled to have you! Here's what to expect:\n\n• Professional trading education\n• A supportive community of traders\n• Tools and resources for your journey\n\nExplore now: {landing_page_url}" } },
      { workflow_id: id(0), step_order: 2, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(0), step_order: 3, step_type: 'email', config: { subject: 'Your Day 2 quick-start guide', body: "Hey {first_name},\n\nHere are 3 things to do today:\n1. Complete your profile\n2. Browse the education library\n3. Set up your trading account: {referral_link}\n\nYou've got this!" } },
      { workflow_id: id(0), step_order: 4, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(0), step_order: 5, step_type: 'email', config: { subject: '3 habits of successful traders', body: "Hi {first_name},\n\nAfter working with hundreds of traders, we see 3 key habits:\n\n1. They invest in education before capital\n2. They follow a plan, not emotions\n3. They surround themselves with serious traders\n\nYou're already on the right track!" } },

      // 2. UID Submission Reminder: Wait 48h → Email → Wait 3d → Email
      { workflow_id: id(1), step_order: 1, step_type: 'wait', config: { hours: 48 } },
      { workflow_id: id(1), step_order: 2, step_type: 'email', config: { subject: "Don't forget your UID, {first_name}", body: "Hey {first_name},\n\nYou haven't submitted your PU Prime UID yet. It only takes a minute and unlocks full community access.\n\nSubmit here: {landing_page_url}" } },
      { workflow_id: id(1), step_order: 3, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(1), step_order: 4, step_type: 'email', config: { subject: 'Final reminder: Submit your trading UID', body: "Hi {first_name},\n\nThis is your last reminder to submit your UID. Once verified you'll get:\n• Personalized insights\n• Community leaderboards\n• Direct mentor support\n\nSubmit now: {landing_page_url}" } },

      // 3. UID Approved Celebration: Email
      { workflow_id: id(2), step_order: 1, step_type: 'email', config: { subject: 'Your UID is verified — congrats, {first_name}!', body: "Great news, {first_name}!\n\nYour trading UID has been verified and approved. You now have full access to:\n\n• Live trading signals\n• Advanced analytics\n• VIP community channels\n\nStart exploring: {landing_page_url}" } },

      // 4. Weekly Market Insights: Email
      { workflow_id: id(3), step_order: 1, step_type: 'email', config: { subject: 'Weekly Market Insights', body: "Hey {first_name},\n\nHere's this week's market outlook:\n\n• Key levels to watch\n• Upcoming economic events\n• Trading opportunities\n\nStay sharp and trade smart.\n\nRead more: {landing_page_url}" } },

      // 5. Re-engagement (7 days): Wait 7d → Email → Wait 3d → Email
      { workflow_id: id(4), step_order: 1, step_type: 'wait', config: { days: 7 } },
      { workflow_id: id(4), step_order: 2, step_type: 'email', config: { subject: 'We miss you, {first_name}!', body: "Hey {first_name},\n\nIt's been a week since we've seen you. Since you've been away we've added:\n\n• New educational content\n• Updated trading resources\n• Community events\n\nCome back: {landing_page_url}" } },
      { workflow_id: id(4), step_order: 3, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(4), step_order: 4, step_type: 'email', config: { subject: 'Final check-in — we want you back', body: "Hi {first_name},\n\nJust checking in one last time. Your spot in the community is waiting.\n\nCome see what's new: {landing_page_url}\n\nWe hope to see you soon!" } },

      // 6. Fast Track to IB: Wait 3d → Email → Wait 4d → Email → Wait 3d → Email
      { workflow_id: id(5), step_order: 1, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(5), step_order: 2, step_type: 'email', config: { subject: 'Have you considered becoming an IB partner?', body: "Hey {first_name},\n\nYou've been active in our community and we think you'd make a great Introducing Broker (IB).\n\nAs an IB you can:\n• Earn commissions on referrals\n• Access exclusive IB tools\n• Build your own trading network\n\nLearn more: {landing_page_url}" } },
      { workflow_id: id(5), step_order: 3, step_type: 'wait', config: { days: 4 } },
      { workflow_id: id(5), step_order: 4, step_type: 'email', config: { subject: 'IB benefits you don\'t want to miss', body: "Hi {first_name},\n\nHere's what our top IBs earn:\n• Competitive commission structure\n• Real-time tracking dashboard\n• Marketing materials & support\n• Priority customer service\n\nJoin the program: {landing_page_url}" } },
      { workflow_id: id(5), step_order: 5, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(5), step_order: 6, step_type: 'email', config: { subject: 'Ready to start earning as an IB?', body: "Hey {first_name},\n\nThis is your chance to turn your network into income. Apply to become an IB partner today.\n\nApply now: {referral_link}" } },

      // 7. Trading Basics Course: 5 emails with 2d waits
      { workflow_id: id(6), step_order: 1, step_type: 'email', config: { subject: 'Lesson 1: What is Forex Trading?', body: "Welcome to Trading Basics, {first_name}!\n\nLesson 1: Forex (foreign exchange) is the world's largest financial market. You're trading one currency against another.\n\nKey concepts:\n• Currency pairs (EUR/USD, GBP/JPY)\n• Bid/Ask spread\n• Pips and lots\n\nNext lesson in 2 days!" } },
      { workflow_id: id(6), step_order: 2, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(6), step_order: 3, step_type: 'email', config: { subject: 'Lesson 2: Understanding Charts', body: "Hey {first_name},\n\nLesson 2: Reading charts is fundamental.\n\n• Candlestick charts show open, high, low, close\n• Timeframes: 1m, 5m, 1h, 4h, daily\n• Support & resistance levels\n\nPractice on your demo account: {landing_page_url}" } },
      { workflow_id: id(6), step_order: 4, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(6), step_order: 5, step_type: 'email', config: { subject: 'Lesson 3: Risk Management 101', body: "Hi {first_name},\n\nLesson 3: The #1 rule — protect your capital.\n\n• Never risk more than 1-2% per trade\n• Always use stop-losses\n• Position sizing matters\n• Risk-to-reward ratio of at least 1:2\n\nThis is what separates pros from amateurs." } },
      { workflow_id: id(6), step_order: 6, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(6), step_order: 7, step_type: 'email', config: { subject: 'Lesson 4: Technical Analysis Basics', body: "Hey {first_name},\n\nLesson 4: Key technical indicators:\n\n• Moving Averages (MA) — trend direction\n• RSI — overbought/oversold\n• MACD — momentum shifts\n• Bollinger Bands — volatility\n\nStart with 1-2 indicators, don't overload your charts!" } },
      { workflow_id: id(6), step_order: 8, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(6), step_order: 9, step_type: 'email', config: { subject: 'Lesson 5: Building Your Trading Plan', body: "Hi {first_name},\n\nFinal lesson! Every trader needs a plan:\n\n1. Define your trading style (scalping, swing, position)\n2. Set daily/weekly goals\n3. Document entry/exit rules\n4. Keep a trading journal\n5. Review and improve weekly\n\nCongrats on completing the course! Open your live account: {referral_link}" } },

      // 8. First Deposit Nudge: Wait 5d → Email → Wait 3d → Email
      { workflow_id: id(7), step_order: 1, step_type: 'wait', config: { days: 5 } },
      { workflow_id: id(7), step_order: 2, step_type: 'email', config: { subject: 'Ready to start trading for real, {first_name}?', body: "Hey {first_name},\n\nYou've been learning and exploring — great work!\n\nNow it's time to put knowledge into action. Make your first deposit and start trading live.\n\nWhy start now:\n• Apply what you've learned\n• Build real trading experience\n• Access live market conditions\n\nGet started: {referral_link}" } },
      { workflow_id: id(7), step_order: 3, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(7), step_order: 4, step_type: 'email', config: { subject: 'Don\'t miss out — deposit reminder', body: "Hi {first_name},\n\nJust a friendly reminder — your account is set up and ready.\n\nMake your first deposit today and take advantage of current market opportunities.\n\nDeposit now: {referral_link}" } },

      // 9. Milestone Celebration: Email → Wait 1d → Email
      { workflow_id: id(8), step_order: 1, step_type: 'email', config: { subject: 'Congrats on reaching a new milestone, {first_name}!', body: "Amazing work, {first_name}!\n\nYou've just reached a new stage in your trading journey. This is a real achievement!\n\nKeep up the momentum — great things are ahead.\n\nSee what's next: {landing_page_url}" } },
      { workflow_id: id(8), step_order: 2, step_type: 'wait', config: { days: 1 } },
      { workflow_id: id(8), step_order: 3, step_type: 'email', config: { subject: 'What\'s next on your journey', body: "Hey {first_name},\n\nNow that you've leveled up, here's what to focus on:\n\n• Explore advanced resources unlocked at your new stage\n• Connect with traders at your level\n• Set your next milestone goal\n\nKeep pushing: {landing_page_url}" } },

      // 10. Referral Program Invite: Email → Wait 3d → Email
      { workflow_id: id(9), step_order: 1, step_type: 'email', config: { subject: 'Earn by sharing — join our referral program!', body: "Hey {first_name},\n\nLove what we do? Share it and earn!\n\nOur referral program lets you:\n• Earn rewards for every friend who joins\n• Track your referrals in real-time\n• Unlock bonus tiers as you refer more\n\nYour referral link: {referral_link}" } },
      { workflow_id: id(9), step_order: 2, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(9), step_order: 3, step_type: 'email', config: { subject: 'Referral reminder — share your link', body: "Hi {first_name},\n\nJust a reminder that your referral link is active and ready to share.\n\nEvery friend who signs up through your link earns you rewards.\n\nShare now: {referral_link}" } },

      // 11. New Feature Announcement: Email
      { workflow_id: id(10), step_order: 1, step_type: 'email', config: { subject: 'New feature alert!', body: "Hey {first_name},\n\nWe've just launched something exciting on the platform!\n\nCheck out the latest feature and let us know what you think.\n\nExplore now: {landing_page_url}" } },

      // 12. Webinar Invitation: Email → Wait 2d → Email
      { workflow_id: id(11), step_order: 1, step_type: 'email', config: { subject: 'You\'re invited: Live trading webinar', body: "Hey {first_name},\n\nJoin us for a live webinar where we'll cover:\n\n• Market analysis techniques\n• Live Q&A with experienced traders\n• Actionable trading strategies\n\nReserve your spot: {landing_page_url}" } },
      { workflow_id: id(11), step_order: 2, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(11), step_order: 3, step_type: 'email', config: { subject: 'Reminder: Webinar is tomorrow!', body: "Hi {first_name},\n\nJust a reminder — our live webinar is tomorrow!\n\nDon't miss this opportunity to learn from the pros.\n\nJoin here: {landing_page_url}" } },

      // 13. Long-term Inactive (30d): Wait 30d → Email → Wait 7d → Email
      { workflow_id: id(12), step_order: 1, step_type: 'wait', config: { days: 30 } },
      { workflow_id: id(12), step_order: 2, step_type: 'email', config: { subject: 'It\'s been a while, {first_name}', body: "Hey {first_name},\n\nWe haven't seen you in a month and we miss you!\n\nA lot has changed since you were last here:\n• New educational content\n• Platform improvements\n• Fresh community discussions\n\nCome back: {landing_page_url}" } },
      { workflow_id: id(12), step_order: 3, step_type: 'wait', config: { days: 7 } },
      { workflow_id: id(12), step_order: 4, step_type: 'email', config: { subject: 'Last chance — we\'d love to have you back', body: "Hi {first_name},\n\nThis is our final outreach. Your account and community access are still active.\n\nIf there's anything we can do to help, just reply to this email.\n\nWe hope to see you again: {landing_page_url}" } },

      // 14. VIP Upgrade Path: Email → Wait 2d → Email → Wait 3d → Email
      { workflow_id: id(13), step_order: 1, step_type: 'email', config: { subject: 'You\'ve been selected for VIP consideration', body: "Hey {first_name},\n\nYour activity and dedication have caught our attention. We'd like to invite you to explore our VIP program.\n\nVIP members get:\n• Priority support\n• Exclusive trading sessions\n• Advanced market analysis\n\nStay tuned for more details!" } },
      { workflow_id: id(13), step_order: 2, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(13), step_order: 3, step_type: 'email', config: { subject: 'VIP benefits breakdown', body: "Hi {first_name},\n\nHere's exactly what VIP membership includes:\n\n• Private Telegram group with pro traders\n• Weekly VIP-only market analysis\n• One-on-one mentoring sessions\n• Early access to new features\n\nThis is where serious traders level up." } },
      { workflow_id: id(13), step_order: 4, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(13), step_order: 5, step_type: 'email', config: { subject: 'Ready to go VIP, {first_name}?', body: "Hey {first_name},\n\nYour VIP invitation is still open. Join the inner circle and take your trading to the next level.\n\nUpgrade now: {landing_page_url}" } },

      // 15. IB Onboarding Flow: Email → Wait 1d → Email → Wait 2d → Email → Wait 3d → Email
      { workflow_id: id(14), step_order: 1, step_type: 'email', config: { subject: 'Welcome aboard, IB Partner {first_name}!', body: "Congratulations {first_name}!\n\nYou're now an official Introducing Broker partner. Here's what's next:\n\n• Access your IB dashboard\n• Get your unique referral links\n• Download marketing materials\n\nLet's build something great together!" } },
      { workflow_id: id(14), step_order: 2, step_type: 'wait', config: { days: 1 } },
      { workflow_id: id(14), step_order: 3, step_type: 'email', config: { subject: 'IB Setup Guide — get started in 10 minutes', body: "Hey {first_name},\n\nHere's your quick-start setup guide:\n\n1. Customize your referral landing page\n2. Set up tracking for your campaigns\n3. Connect your payment method\n4. Share your first referral link\n\nSetup guide: {landing_page_url}" } },
      { workflow_id: id(14), step_order: 4, step_type: 'wait', config: { days: 2 } },
      { workflow_id: id(14), step_order: 5, step_type: 'email', config: { subject: 'Tips for your first IB campaign', body: "Hi {first_name},\n\nReady to get your first referrals? Try these proven strategies:\n\n• Share educational content on social media\n• Host a small trading workshop\n• Reach out to your existing network\n• Use our pre-made marketing templates\n\nYour referral link: {referral_link}" } },
      { workflow_id: id(14), step_order: 6, step_type: 'wait', config: { days: 3 } },
      { workflow_id: id(14), step_order: 7, step_type: 'email', config: { subject: '30-day IB check-in — how are you doing?', body: "Hey {first_name},\n\nIt's been about a month since you joined as an IB. How's it going?\n\nCheck your stats:\n• Referrals sent\n• Conversions\n• Commissions earned\n\nIf you need help, reply to this email or visit: {landing_page_url}" } },
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
