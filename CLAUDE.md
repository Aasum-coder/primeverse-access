## AUTO-MERGE RULE
After pushing changes to a feature branch, ALWAYS create a Pull Request and merge it immediately using the GitHub API. Do not leave PRs open for manual review. Use this pattern:
1. Push to feature branch
2. Create PR via GitHub API: gh pr create --title "..." --body "..."
3. Merge PR via GitHub API: gh pr merge --merge --auto
If gh CLI is not available, use curl with the GitHub API directly.

## REPO IDENTITY
This repo is Aasum-coder/primeverse-access (SYSTM8).
DO NOT confuse with Get-access-to-primverse or 1move-academy.
The production URL is www.primeverseaccess.com
The Vercel URL is primeverse-access.vercel.app

## ARCHITECTURE OVERVIEW
- **Framework**: Next.js (App Router) on Vercel
- **Database**: Supabase (Postgres + Auth + Storage + RLS)
- **Email**: Resend (transactional emails)
- **AI**: Groq (llama-3.3-70b-versatile) for content generation
- **Languages**: 9 supported — en, no, sv, es, ru, ar, tl, pt, th
- **Translations**: Inline `const translations` object in app/page.tsx (not external files)
- **Auth**: Supabase Auth with JWT tokens; API routes use Bearer token pattern

## API ROUTES
### Core
- app/api/ai-bio/route.ts — AI bio generator (5-step wizard)
- app/api/ai-marketing/route.ts — Post Writer, Caption Generator, Hashtag Research (Groq)
- app/api/ai-reply-assistant/route.ts — AI objection handler tool
- app/api/generate-bio/route.ts — legacy bio generation

### Content Calendar
- app/api/content-calendar/posts/route.ts — CRUD for scheduled posts (GET/POST/PATCH/DELETE)
- app/api/content-calendar/ai-plan/route.ts — AI 7-day weekly plan generator (Groq)
- app/api/content-calendar/setup/route.ts — verify connection, return post count

### Leads & Notifications
- app/api/send-lead-email/route.ts — lead registration email
- app/api/new-lead-alert/route.ts — alert IB of new lead
- app/api/uid-submitted-notification/route.ts — notifies IB when lead submits UID (email + telegram + in-app)
- app/api/disapprove-lead-dashboard/route.ts — disapprove lead from dashboard
- app/api/disapprove-lead/route.ts — disapprove via email link (GET, token validated)
- app/api/nudge-email/route.ts — nudge unverified leads

### Email Flows
- app/api/welcome-email/route.ts — new IB welcome email
- app/api/verify-email/route.ts — email verification
- app/api/page-live-email/route.ts — notification when landing page goes live
- app/api/milestone-email/route.ts — achievement milestones
- app/api/event-confirmation/route.ts — sends confirmation email after event registration
- app/api/send-feature-announcement/route.ts — blast email to all IBs
- app/api/send-broadcast/route.ts — user broadcast campaigns
- app/api/send-event-approval/route.ts — event approval emails
- app/api/send-event-reminder/route.ts — event reminder emails

### Analytics
- app/api/page-views-breakdown/route.ts — traffic sources breakdown (by source, device, day)

### Other
- app/api/validate-referral/route.ts — PuPrime referral link validation
- app/api/process-workflows/route.ts — automated workflow processing
- app/api/auto-enroll-workflow/route.ts — auto-enroll leads in workflows
- app/api/bug-report/route.ts — beta bug reporting
- app/api/triage-bugs/route.ts — bug triage system
- app/api/admin/ — admin endpoints

## PAGES
- app/page.tsx — Main dashboard (leads, profile, metrics, resources, marketing, beta tabs)
- app/[slug]/page.tsx — Public landing pages for distributors
- app/reset-password/page.tsx — Full password reset flow
- app/beta/page.tsx — Beta program signup
- app/terms/page.tsx — Terms of Service
- app/privacy/page.tsx — Privacy Policy
- app/factory/page.tsx — Landing page factory/preview

## DATABASE TABLES
### distributors
- Column: `name` (NOT full_name — was fixed)
- user_id, email, slug, bio, bio_translations, referral_link, profile_image
- social_tiktok, social_instagram, social_facebook, social_linkedin, social_youtube, social_snapchat, social_other
- is_published, created_at

### leads
- distributor_id, name, email, phone, country
- uid_verified (boolean) — NO status column; use uid_verified for approval logic
- uid_screenshot, created_at

### page_views
- distributor_id, slug, created_at
- referrer (text) — cleaned source name like 'Direct', 'Facebook', 'Shared Link'
- utm_source, utm_medium (text, nullable)
- device (text) — 'mobile' or 'desktop'

### generated_posts
- distributor_id, platform, topic, tone, language, content, created_at
- Used for Post Writer anti-repetition (fetches last 5 posts before generating)

### scheduled_posts
- distributor_id, platform, content, scheduled_for (timestamptz)
- status: 'draft' | 'scheduled' | 'posted' | 'failed'
- post_type: 'post' | 'story' | 'reel'
- image_url, created_at, updated_at

### social_connections
- distributor_id, platform, access_token, refresh_token, token_expires_at
- platform_user_id, platform_username, is_connected, connected_at, created_at

## RESERVED SLUGS
RESERVED_SLUGS includes: reset-password, login, signup, admin, auth, api, beta, factory, event
These cannot be used as distributor landing page slugs.

## POST WRITER RULES
- First-person only (I, me, my) — NEVER mention author's name
- Max 80 words (not counting hashtags)
- 8 hook styles: question / bold claim / micro-story / surprising fact / unpopular opinion / before-and-after / one-liner / challenge to reader
- Banned words: journey, blessed, game-changer, amazing, incredible, excited, grateful
- 3-5 specific hashtags (not generic)
- Anti-repetition: fetches last 5 posts from generated_posts, injects as FORBIDDEN territory
- Caption: max 50 words, no "I just" or "Excited to" openers

## SHARE & TRAFFIC TRACKING
- Share button appends `?s=share` to shared URLs
- Source tags: ?s=share → "Shared Link", ?s=fb → "Facebook", ?s=ig → "Instagram", ?s=tt → "TikTok", ?s=wa → "WhatsApp", ?s=tg → "Telegram"
- Fallback: utm_source param → document.referrer detection → "Direct"
- Traffic modal shows source icons (📤 📘 📸 🎵 💬 ✈️ 💼 🔍 🐦 🔗 🌐)

## META DEVELOPER APP
- App ID: 884386381306039
- Use cases: Instagram API + Facebook Pages API
- OAuth Redirect URI: https://www.primeverseaccess.com/api/social/meta/callback
- Vercel env vars: META_APP_ID, META_APP_SECRET, META_REDIRECT_URI

## OPEN TASKS (next session)
1. Meta OAuth flow for IBs to connect FB/IG accounts
2. Auto-posting via Supabase Edge Functions + pg_cron
3. Telegram chat_id flow for IB notifications
4. Verify UID notification email sends correctly
5. Disapprove — lead should disappear from list (needs rejected boolean in leads)
6. Content Calendar — full test
