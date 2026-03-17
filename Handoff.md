# Handoff — 17. mars 2026

## Session: SYSTM8 Visual Workflow Builder + Bug Fixes + Launch Readiness

---

## Hva ble bygget

### 1. Visual Workflow Canvas Builder (HOVEDFEATURE)
En fullverdig visuell drag-and-drop workflow-bygger som erstatter den lineære steg-for-steg-builderen i Marketing > Workflows-fanen. Inspirert av GoHighLevel (GHL).

- **React Flow canvas** (@xyflow/react v12) med mørkt/gull SYSTM8-tema
- **4 egendefinerte node-typer:**
  - **Trigger** (9 typer): lead_signup, lead_inactive, stage_change, manual, scheduled, form_submitted, email_verified, uid_submitted, uid_verified
  - **Action** (9 typer): email, whatsapp, telegram, wait, update_field, move_stage, add_tag, notify_admin, in_app_notification
  - **Condition** (6 typer): opened, clicked, not_opened, field_equals, days_since, stage_is
  - **Flow Control** (3 typer): switch_workflow, stop, goto
- **Venstre sidebar** med draggable komponenter organisert i kategorier
- **Høyre konfigurasjonspanel** som åpnes ved klikk på en node (email subject/body, wait duration, condition-type, merge tags osv.)
- **Topplinje** med workflow-navn, status-badge (Draft/Active/Paused), Templates-knapp, Save/Activate-knapper
- **Auto-save** hvert 30. sekund når det er ulagrede endringer
- **Template-bibliotek** som modal med 5 forhåndslagde maler
- **Tidy Up** auto-arrange-funksjon for å rydde node-layout
- **MiniMap** og kontroller (zoom, fit) i canvas
- **Mobile fallback** — enkel listevisning på skjermer under 768px bredde
- **Dynamisk import** med SSR disabled (`next/dynamic`)

### 2. Beta Test System
- **Test result persistence** via upsert til Supabase med unik constraint `(tester_id, test_item)`
- **Re-fetch** av testresultater ved tab-bytte til Beta-fanen
- **Admin Test Results dashboard** i triage-siden med:
  - Oversikt: totalt antall testere, gjennomsnittlig fullføring, mest feilede items
  - Per-tester tabell med expanderbar detaljvisning (pass/fail/skip-telling)

### 3. Admin Triage Dashboard
- **To-fane grensesnitt**: Bugs | Test Results
- **Bugs-fane**: Henter alle bug_reports via service role API (bypass RLS), severitetsgruppering, AI-triage, statusoppdatering
- **Test Results-fane**: Samler og viser all beta-test data med statistikk

### 4. Broadcasting System
Bygget i denne sesjonen som Marketing Module 1.
- Email/WhatsApp/Telegram broadcast til leads
- Audience targeting: all leads, specific stages, tags
- Merge tags: `{first_name}`, `{landing_page_url}`, `{referral_link}`
- Scheduling og preview
- WhatsApp-lenke generering for manuell sending
- **Filer**: broadcast UI i `app/page.tsx`, `lib/email-templates/broadcast.ts`, `app/api/send-broadcast/route.ts`

### 5. Marketing Resources Tab Redesign
- Omdøpt fra "IB Resources" til "Marketing Resources" i alle 9 språk
- Lagt til **AI Marketing Tools** seksjon med 4 kort:
  - Post Writer (funksjonell, kaller AI API)
  - Caption Generator (funksjonell)
  - Hashtag Research (funksjonell)
  - Content Calendar (coming soon)
- **Fil**: `app/api/ai-marketing/route.ts` — AI-drevet innholdsgenerering

### 6. Workflow Engine (Backend)
- **`app/api/process-workflows/route.ts`** — Cron job som prosesserer aktive workflow-enrollments
  - Sender emails via Resend med merge tag-substitusjon
  - Evaluerer wait-delays
  - Håndterer condition branching (opened/clicked/not_opened)
  - Avanserer steg i sekvens
- **`app/api/auto-enroll-workflow/route.ts`** — Auto-enrolls leads basert på trigger-type (lead_signup osv.)
- Vercel cron: `*/15 * * * *` (hvert 15. minutt)

### 7. Pipeline Stages
- API-rute for å opprette 6 standard pipeline-stadier: New, Contacted, Interested, Signed Up, Active, VIP
- Idempotent — sjekker om stadier allerede eksisterer

### 6. Seed Templates
- 5 workflow-maler med totalt 35 steg:
  - Welcome Sequence (8 steg, trigger: lead_signup)
  - Re-engagement Campaign (5 steg, trigger: lead_inactive 14 dager)
  - New Member Onboarding (7 steg, trigger: stage_change → Signed Up)
  - Member Value Drip (7 steg, trigger: manual)
  - VIP Upgrade Path (5 steg, trigger: stage_change → Active)

### 9. CLAUDE.md
- Auto-merge regel: Push → PR → Merge
- Repo-identitet: Aasum-coder/primeverse-access, IKKE Get-access-to-primverse eller 1move-academy
- Produksjons-URL: www.primeverseaccess.com

### 10. 9-språklig oversettelse
- Alle nye workflow- og broadcast-oversettelsesnøkler lagt til i alle 9 språk: en, no, sv, es, ru, ar, tl, pt, th
- Alle oversettelser samlet i én translations-objekt i `app/page.tsx`

---

## Filer som ble endret eller opprettet

### Nye filer

| Fil | Beskrivelse |
|-----|-------------|
| `components/WorkflowCanvas.tsx` | ~950 linjer. Komplett visuell workflow canvas med React Flow, 4 node-typer, drag-and-drop, konfigurasjonspanel, auto-save, template-modal, mobile fallback |
| `app/api/admin/bugs/route.ts` | GET: henter alle bug_reports med service role key. PATCH: oppdaterer bugstatus. Admin-verifisering via cookie auth |
| `app/api/admin/test-results/route.ts` | GET: henter alle test_results, grupperer per tester, beregner statistikk (passCount, failCount, skipCount, completionPct, mostFailed) |
| `app/api/create-default-stages/route.ts` | POST: oppretter 6 standard pipeline-stadier for en bruker, idempotent |
| `app/api/seed-templates/route.ts` | GET: seeder 5 workflow-maler med 35 steg, idempotent (sjekker om de allerede finnes) |
| `app/api/send-broadcast/route.ts` | POST: sender broadcast via Resend (email), genererer WhatsApp-lenker, oppdaterer broadcast-status |
| `app/api/process-workflows/route.ts` | Cron-rute: prosesserer aktive workflow-enrollments, sender emails, evaluerer conditions, avanserer steg |
| `app/api/auto-enroll-workflow/route.ts` | Auto-enrolls leads i workflows basert på trigger-events |
| `app/api/ai-marketing/route.ts` | AI-drevet innholdsgenerering for sosiale medier (posts, captions, hashtags) |
| `lib/email-templates/broadcast.ts` | Broadcast email-template med SYSTM8-branding, merge tags, dark/gold design |
| `supabase/migrations/20260314000000_create_email_sends.sql` | Oppretter email_sends-tabell for deduplisering av sendte emails |
| `supabase/migrations/20260315000000_beta_testing_infrastructure.sql` | Oppretter test_results og bug_reports tabeller, RLS-policies, indexes |
| `supabase/migrations/20260315000001_beta_screenshots_bucket.sql` | Storage-bucket for beta-test skjermbilder |
| `supabase/migrations/20260316000000_test_results_upsert_constraint.sql` | UNIQUE constraint `(tester_id, test_item)` for upsert-støtte |
| `CLAUDE.md` | Auto-merge regel og repo-identitet |
| `Handoff.md` | Dette dokumentet |

### Modifiserte filer

| Fil | Hva ble gjort |
|-----|---------------|
| `app/page.tsx` | **Massivt modifisert.** Lagt til: dynamic import for WorkflowCanvas, erstattet lineær workflow-builder (180 linjer) med `<WorkflowCanvas>` komponent, forenklet `wfOpenBuilder`, fjernet template-modal (nå i canvas), fikset `owner_id` fra `distributor.id` til `distributor.user_id` i saveWorkflow/fetchWorkflows/wfUseTemplate, lagt til social URL `onBlur`-handlers med auto-prepend `https://`, fjernet lead registration form (HTML fjernet, handler/translations beholdt), lagt til `white-space: nowrap` på tabs, lagt til auto-create pipeline stages kall |
| `app/[slug]/page.tsx` | Fikset alle sosiale lenker med protokoll-sjekk: `!/^https?:\/\//i.test(url) ? 'https://' + url : url`. Fjernet console.log. Oppdatert not-found-melding |
| `app/admin/triage/page.tsx` | Komplett rewrite. Bruker nå `/api/admin/bugs` (GET/PATCH) istedenfor direkte Supabase anon client. Lagt til Bugs/Test Results tab-switcher. Test Results-fane med oversikt og per-tester detaljer |
| `app/api/generate-bio/route.ts` | Fjernet sensitive console.log (API-nøkkel, request body, response content) |
| `app/api/ai-bio/route.ts` | Fjernet console.log for Anthropic response |
| `app/login/page.tsx` | Merget accessibility-endringer: bedre feilhåndtering for nettverk/disabled/eksisterer-allerede |
| `package.json` | Lagt til `"@xyflow/react": "^12"` dependency |
| `vercel.json` | Lagt til cron-entry for `/api/process-workflows` |

---

## Nye DB-tabeller / kolonner

### Tabeller

| Tabell | Kolonner | Beskrivelse |
|--------|----------|-------------|
| `test_results` | id (UUID PK), tester_id (FK → auth.users), tester_email, tester_name, section, test_item, status (pass/fail/skip), comment, screenshot_url, platform (systm8/1moveacademy), created_at, updated_at | Beta test resultater |
| `bug_reports` | id (UUID PK), reporter_id (FK → auth.users), reporter_email, reporter_name, platform, severity (critical/major/minor/cosmetic), title, description, screenshot_url, steps_to_reproduce, device_info, language, status (new/triaging/fixing/deployed/verified/wont_fix), agent_prompt, fix_pr_url, created_at, updated_at | Bug tracking |
| `email_sends` | id (UUID PK), user_id (FK → distributors), email_type, sent_at | Email deduplisering |

### Kolonner lagt til eksisterende tabeller

| Tabell | Kolonne | Type |
|--------|---------|------|
| `distributors` | `is_beta_tester` | BOOLEAN DEFAULT false |

### Constraints

| Tabell | Constraint | Beskrivelse |
|--------|-----------|-------------|
| `test_results` | `test_results_tester_item_unique UNIQUE (tester_id, test_item)` | Sikrer kun ett resultat per tester per test-item, muliggjør upsert |

### RLS Policies

| Tabell | Policy | Regel |
|--------|--------|-------|
| `test_results` | INSERT | `auth.uid() = tester_id` |
| `test_results` | SELECT | `auth.uid() = tester_id` |
| `test_results` | UPDATE | `auth.uid() = tester_id` |
| `bug_reports` | INSERT | `true` (alle kan rapportere) |
| `bug_reports` | SELECT | `auth.uid() = reporter_id` |
| `bug_reports` | UPDATE | `auth.uid() = reporter_id` |
| `email_sends` | SELECT | `user_id IN (SELECT id FROM distributors WHERE user_id = auth.uid())` |

### Eksisterende tabeller som brukes (ikke opprettet i denne sesjonen)

- `email_workflows` — workflow-definisjoner (name, trigger_type, trigger_config, status, owner_id, is_template, is_global, description)
- `workflow_steps` — steg i workflows (workflow_id, step_order, step_type, config). **NB: step_type har CHECK constraint som kun tillater: email, wait, condition, switch_workflow, whatsapp, telegram**
- `workflow_enrollments` — brukere enrollet i workflows (workflow_id, lead_id, status, current_step)
- `pipeline_stages` — pipeline-stadier per bruker (name, color, position, owner_id)
- `distributors` — bruker/distributør-profiler (id, user_id, full_name, slug, social_* felter, is_beta_tester)
- `leads` — lead-data (distributor_id, name, email, status)
- `broadcasts` — broadcast-tracking
- `broadcast_recipients` — mottakere per broadcast (broadcast_id, lead_id, channel, status)
- `message_templates` — email meldingsmaler

---

## Bugs som ble fikset

### BUG: Beta test resultater forsvinner ved tab-bytte
- **Problem**: Resultater ble lagret lokalt men ikke persistert til Supabase
- **Løsning**: Lagt til upsert til Supabase med `onConflict: 'tester_id,test_item'`. Lagt til re-fetch av resultater ved bytte til Beta-fanen. Opprettet unik constraint migration

### BUG: Admin triage "Refresh" gir Unauthorized
- **Problem**: `fetchBugs` brukte anon Supabase client som er blokkert av RLS (`SELECT policy: auth.uid() = reporter_id`)
- **Løsning**: Opprettet `/api/admin/bugs` API-rute som bruker service role key (bypasser RLS). Admin-verifisering via cookie-basert auth-sjekk mot ADMIN_EMAILS-liste

### BUG: Lead registration form re-lagt til under merge
- **Problem**: Under merge conflict resolution av accessibility-branchen ble lead registration-formen beholdt — den var bevisst slettet
- **Løsning**: Fjernet HTML-formkoden, beholdt translations og handler-funksjon for fremtidig bruk

### BUG: Workflow save feiler (owner_id feil)
- **Problem**: `owner_id` ble satt til `distributor.id` (distributors-tabell PK) men RLS-policy sjekker `auth.uid() = owner_id`. `distributor.user_id` er `auth.uid()`
- **Løsning**: Endret `owner_id: distributor.user_id` i `saveWorkflow`, `wfUseTemplate`, og `fetchWorkflows`

### BUG: Sosiale lenker mangler protokoll
- **Problem**: URLs som "instagram.com/user" ble renderet som relative lenker
- **Løsning**: Lagt til `onBlur`-handlers på alle 8 sosiale felt i dashboard som auto-prepender `https://`. Lagt til protokoll-sjekk i `[slug]/page.tsx` for alle sosiale lenker

### BUG: Seed templates fungerer ikke
- **Problem**: Endepunktet krevde POST med CRON_SECRET auth, og slettet/gjenopprettet alle templates ved hver kjøring
- **Løsning**: Endret til GET uten auth. Gjort idempotent: sjekker om templates finnes før innsetting. Lagt til `description` og `status: 'draft'` felt

### BUG: Workflow canvas — "Failed to save workflow" (stille feil)
- **Problem**: Save-funksjonen hadde tom catch-blokk, logget ikke Supabase-feil. Utvidede node-typer (move_stage, add_tag osv.) brøt DB CHECK constraint. `description`-feltet manglet
- **Løsning**: Lagt til `console.error`-logging for alle Supabase-operasjoner med `[WorkflowCanvas]`-prefix. Mapper utvidede node-typer til gyldige DB step_types og lagrer reell type i `config._nodeType`. Lagt til `description`-felt. Feilmeldinger vises til bruker via toast

### BUG: Workflow canvas — kan ikke slette noder
- **Problem**: Ingen keyboard handler for Delete/Backspace. React Flow's innebygde delete-håndtering manglet
- **Løsning**: Lagt til keyboard event listener for Delete/Backspace (hopper over input/textarea/select). Satt `deleteKeyCode={null}` på ReactFlow for å forhindre at trigger slettes. Lagt til guard i `deleteNode` som forhindrer sletting av trigger-noden med toast-melding

### BUG: Workflow canvas — tillater flere trigger-noder
- **Problem**: Brukere kunne dra flere triggers til canvasen, noe som skapte forvirring
- **Løsning**: Ved drop av trigger sjekkes det om en trigger allerede finnes. Hvis ja: oppdater eksisterende triggers `triggerType` i stedet for å legge til ny node. Viser toast: "Trigger updated to [type]"

### BUG: Console.log med sensitiv data
- **Problem**: API-nøkler og response-body ble logget i generate-bio og ai-bio routes
- **Løsning**: Fjernet sensitive console.log, beholdt console.error for faktiske feil

---

## Konfigurasjon og oppsett

### Vercel
- **vercel.json** med cron jobs:
  - `/api/cron/nudge-emails` kjører kl 09:00 UTC daglig
  - `/api/process-workflows` kjører kl 10:00 UTC daglig
- Cache-Control header for `/sw.js`: no-cache

### Supabase
- **Anon key** brukes i frontend (client-side)
- **Service role key** brukes i admin API-ruter (bypasser RLS)
- **Env vars som kreves**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **RLS aktivert** på alle nye tabeller
- Admin-tilgang styres av hardkodet email-liste: `aasum85@gmail.com`, `bitaasum@gmail.com`

### GitHub
- Repository: `Aasum-coder/primeverse-access`
- Feature branch: `claude/remove-lead-form-SZMk5`
- Direkte push til `main` er blokkert (403 Forbidden)
- `gh` CLI uten auth — PR-er må opprettes manuelt via GitHub UI

### Andre integrasjoner
- **Resend**: Email-levering (branded templates)
- **OpenAI / Groq**: AI-generert bio og marketing-innhold
- **PWA**: Service worker, manifest, install prompt

---

## Viktige tekniske beslutninger

### 1. @xyflow/react v12 for workflow canvas
- **Valgt fordi**: Industristandard for node-baserte editorer, støtter custom nodes, drag-and-drop, mini-map, og har React 19-kompatibilitet
- **Alternativ vurdert**: Bygge fra scratch — avvist pga. kompleksitet

### 2. Dynamic import med SSR disabled
- **Grunn**: React Flow krever browser APIs (DOM, window) som ikke er tilgjengelig under server-side rendering
- **Implementering**: `const WorkflowCanvas = dynamic(() => import('@/components/WorkflowCanvas'), { ssr: false })`

### 3. Service role API-ruter for admin
- **Grunn**: RLS-policies begrenser SELECT til `auth.uid() = reporter_id`, men admin trenger å se ALLE records
- **Implementering**: Egne API-ruter (`/api/admin/bugs`, `/api/admin/test-results`) med `SUPABASE_SERVICE_ROLE_KEY` og cookie-basert admin-verifisering

### 4. owner_id = distributor.user_id (IKKE distributor.id)
- **Kritisk**: `distributor.id` er PK i distributors-tabellen. `distributor.user_id` er `auth.uid()`. RLS-policies på workflows sjekker `auth.uid() = owner_id`, så `owner_id` MÅ være `user_id`
- **Konsekvens**: Alle steder som setter eller filtrerer på owner_id må bruke `distributor.user_id`

### 5. Node-type mapping for DB CHECK constraint
- **Problem**: Databasen har CHECK constraint på `step_type` i `workflow_steps` som kun tillater: email, wait, condition, switch_workflow, whatsapp, telegram
- **Løsning**: Utvidede typer (move_stage, add_tag, update_field, notify_admin, in_app_notification, stop, goto) mappes til 'email' som fallback. Den reelle typen lagres i `config._nodeType` og gjenopprettes ved lasting
- **TODO**: Helst bør CHECK constraint i DB utvides til å inkludere de nye typene

### 6. Upsert pattern for test results
- **Grunn**: Brukere kan re-teste items, og vi vil oppdatere eksisterende resultat i stedet for å duplisere
- **Implementering**: UNIQUE constraint på `(tester_id, test_item)` + `onConflict` i Supabase insert

### 7. Idempotent seed-templates
- **Grunn**: Endepunktet kan kalles flere ganger uten å duplisere data
- **Implementering**: Sjekker om globale templates eksisterer (`is_global=true, is_template=true, owner_id IS NULL`) før innsetting

---

## Kjente problemer som gjenstår

### Høy prioritet

1. **PR-er ikke merget**: Alle endringer er pushet til `claude/remove-lead-form-SZMk5` men ikke merget til `main`. Ingen GitHub API-token tilgjengelig. PR-er må opprettes og merges manuelt via GitHub UI

2. **DB CHECK constraint for workflow step_types**: Databasen tillater kun `email`, `wait`, `condition`, `switch_workflow`, `whatsapp`, `telegram`. Nye typer (`move_stage`, `add_tag`, `update_field`, `notify_admin`, `in_app_notification`, `stop`, `goto`) mappes midlertidig til `email` med reell type i `config._nodeType`. En migration bør lages:
   ```sql
   ALTER TABLE workflow_steps DROP CONSTRAINT IF EXISTS workflow_steps_step_type_check;
   ALTER TABLE workflow_steps ADD CONSTRAINT workflow_steps_step_type_check
   CHECK (step_type IN ('email','wait','condition','switch_workflow','whatsapp','telegram','move_stage','add_tag','update_field','notify_admin','in_app_notification','stop','goto'));
   ```

3. **Oversettelser for canvas UI**: WorkflowCanvas.tsx bruker hardkodede engelske strenger for mye av UI-teksten (node-labels, sidebar-titler, knappetekst). Disse bør legges til i translations-objektet i `app/page.tsx` for alle 9 språk

4. **React Flow CSS potensielt mangler i produksjon**: `@xyflow/react/dist/style.css` importeres i WorkflowCanvas.tsx — dette fungerer med dynamic import, men bør verifiseres i produksjonsbuild

### Middels prioritet

5. **Workflow canvas save uverifisert i produksjon**: Save-funksjonen er forbedret med feillogging men har ikke blitt testet mot produksjons-Supabase. Mulige RLS-problemer kan fortsatt oppstå

6. **Accessibility branch merge**: En merge ble gjort fra `claude/improve-accessibility-ITcd5` som førte til at lead registration form ble re-lagt til. Formen er fjernet igjen, men merge-historikken er rotete

7. **WhatsApp/Telegram i workflow**: Disse er markert som "Coming soon" i den lineære builderen. I canvasen kan man konfigurere dem (message-felt), men backend-prosessering mangler

8. **`switch_workflow` target_workflow_id**: I seed templates er denne satt til `null`. Brukere må velge target manuelt

9. **Mobile fallback for canvas**: Viser kun en forenklet listevisning uten redigeringsmuligheter. Brukere på mobil kan bare se — ikke endre — workflows

### Lav prioritet

10. **Pipeline sub-tab**: Viser fortsatt "coming soon" badge i Marketing-fanen. Kun Broadcasts og Workflows er funksjonelle

11. **Content Calendar AI-verktøy**: Viser "coming soon" i Marketing Resources. Post Writer, Caption Generator og Hashtag Research er funksjonelle

12. **Lead registration form handler/translations**: HTML er fjernet men `handleSubmitLead`-funksjonen og oversettelsesnøkler finnes fortsatt i koden. Kan ryddes opp om ikke brukt i fremtiden

13. **Workflow enrollment counts**: Hentes i `fetchWorkflows` men vises kun i listevisningen, ikke i canvas

14. **Auto-save indikator**: Canvas viser "Unsaved" tekst, men gir ikke feedback under auto-save (30s timer)

15. **Workflow condition evaluation**: Workflow engine (`/api/process-workflows`) har logikk for conditions, men full evaluering av alle condition-typer (field_equals, days_since, stage_is) er muligens ikke komplett

---

## Neste prioritet

### Må gjøres først (neste sesjon)

1. **Merge PR til main** — Gå til GitHub UI, opprett PR fra `claude/remove-lead-form-SZMk5` → `main`, og merge. Eller konfigurer GitHub token for gh CLI

2. **Utvid DB CHECK constraint** — Lag migration som legger til nye step_types til workflow_steps-tabellen, slik at `_nodeType` workaround kan fjernes

3. **Test workflow save i produksjon** — Verifiser at workflows faktisk lagres og lastes korrekt med React Flow canvas

4. **Legg til oversettelser for canvas** — Oversett alle hardkodede engelske strenger i WorkflowCanvas.tsx til alle 9 språk

### Bør gjøres snart

5. **Implementer workflow processing for nye step_types** — Backend i `/api/process-workflows` må håndtere move_stage, add_tag, update_field, notify_admin, in_app_notification

6. **WhatsApp/Telegram integration** — Koble opp faktisk sending for disse kanalene

7. **Edge validation** — Forhindre ugyldige koblinger (f.eks. condition → trigger, eller loops)

8. **Undo/redo for canvas** — React Flow støtter dette men det er ikke implementert

---

## Git-historikk (kronologisk, nyeste først)

```
702e842 Fix 3 workflow canvas bugs: save errors, node deletion, duplicate triggers
2183296 Add visual workflow canvas builder with React Flow
e8f972f Fix workflow save (wrong owner_id) and improve seed-templates
21d1e43 Merge remote-tracking branch 'origin/main' into claude/remove-lead-form-SZMk5
96b6e45 Add CLAUDE.md with auto-merge rule and repo identity
0398cf3 Merge pull request #50
acf59ab Launch-readiness cleanup: URL fixes, pipeline stages, template seeding, console.log removal
430a657 Merge pull request #49
7e5065e Remove lead registration form that was re-added during merge
f8eae16 Merge claude/improve-accessibility-ITcd5 into main
5c1ab35 Merge pull request #47
9f3337f Fix admin triage to use service role API for bugs (bypasses RLS)
9d97993 Fix beta test result persistence and add admin test results dashboard
5aaeb65 Add Email Workflow Builder (SYSTM8 Module 2)
07f13c6 Add Broadcasting system (Marketing tab, Module 1 of CRM)
3637aa8 Redesign IB Resources tab as Marketing Resources with AI tools
7764d86 Remove lead registration form and fix mobile tab scrolling
```

## Env-variabler som kreves

| Variabel | Brukes av | Beskrivelse |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + API | Supabase prosjekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon key (RLS-begrenset) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API-ruter | Bypasser RLS for admin-operasjoner |
| `OPENAI_API_KEY` | AI bio/marketing | OpenAI API-nøkkel |
| `GROQ_API_KEY` | AI bio (alternativ) | Groq API-nøkkel |
| `RESEND_API_KEY` | Email-ruter | Resend email-tjeneste |
