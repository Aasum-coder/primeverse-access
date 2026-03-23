# CLAUDE.md — SYSTM8 (primeverse-access)

> Sist oppdatert: 13. mars 2026

## Prosjektoversikt

SYSTM8 er en intern plattform bygget av **1Move** for IB-partnere (Introducing Brokers).

### Forretningsstruktur

- **1Move** — Selskapet. Driver IB-nettverket og bygger denne plattformen.
- **SYSTM8** — Plattformen (dette repoet, kalles også `primeverse-access`).
- **Primeverse** — Produktet som selges. Fullstack trading-akademi med verktøy, kurs, signaler.
- **PuPrime** — Brokeren som sponser 1Move. Referrallenker peker hit → inntektskilde for IB-partnere.

### Brukerreise

1. IB registrerer seg og verifiserer e-post
2. Logger inn og fyller ut profil (navn, bio, bilde, slug, referrallenke, sosiale medier)
3. Bruker AI Bio-assistent til å generere profesjonell bio på 9 språk
4. Klikker "Generate my landing page" → landingsside live på `primeverseaccess.com/[slug]`
5. Mottar velkomstmail med instruksjoner
6. Sosiale medier-logoer i bunnen av landingssiden lenker til IBens kontoer
7. IB bruker landingssiden som "link i bio" på sosiale medier
8. Besøkende → ser tilbudet → registrerer seg via PuPrime → IB tjener provisjon

---

## Tech Stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage) |
| AI Bio | Groq API (Llama 3.3 70B) — gratis |
| E-post | Resend (SMTP via Supabase + API for velkomstmail) |
| Hosting | Vercel |
| Domene | primeverseaccess.com |
| Versjonskontroll | GitHub |

---

## Hva som er bygget og fungerer

### Auth (`/login`)
- Innlogging med e-post + passord
- Signup med e-postverifisering (Supabase Auth)
- Spesifikke feilmeldinger for ulike Supabase-feil
- Glemt passord / reset-flow
- Passordkrav-tekst ("Må inneholde minst 6 tegn")
- Verifiseringsmail fra `noreply@primeverseaccess.com` (1Move Academy)
- 9 språk i login-side

### Dashboard (`/`) — koden er i `app/page.tsx`
- **Tabs:** Metrics → My Profile → Leads → IB Resources
- **Metrics (default tab):**
  - 3 metric cards (Page Views, Leads, Conversions)
  - 3 Rolex-inspirerte gauge-instrumenter (Conversion Rate, Profile Strength, Approval Rate)
  - Gauge har fotorealistisk bakgrunn, gull-tall, gradient-nål med glow, animasjon
  - Page views over time linjediagram
  - Alt er flerspråklig
- **My Profile:**
  - Profilbilde med drag-to-reposition
  - Fullt navn, slug/URL, referrallenke
  - Sosiale medier: TikTok, Instagram, Facebook, Snapchat, LinkedIn, YouTube, Other
  - Bio-felt + AI Bio-assistent
  - "Generate my landing page" for nye brukere
  - "Oppdater mine opplysninger" for eksisterende brukere
  - Referral-link validering (obligatorisk)
  - Duplicate slug håndtering med inline feilmelding
- **AI Bio-assistent:**
  - Stepper-flow: 5 spørsmål → tone-valg → forhåndsvisning
  - Toner: Profesjonell, Casual, Motiverende
  - Genererer bio på alle 9 språk via Groq API
  - Lagrer i `bio` (hovedspråk) + `bio_translations` (JSONB, alle språk)
  - "Bruk denne" / "Generer ny" / "Start på nytt"
- **Leads:**
  - Registrer leads manuelt
  - Godkjenn leads / UID-verifisering
- **IB Resources:**
  - 4 kort i 2x2 grid:
    - IB Training → Notion
    - Content Library → Coming soon
    - IB VIP Support → puprimelive.com
    - PV Presentation → Canva

### Offentlig landingsside (`/[slug]`)
- Dynamisk side basert på slug fra `distributors`-tabellen
- Distributor-bilde, navn, flerspråklig bio
- "Get Access Now" → PuPrime referrallenke
- "How it works" — 5 steg med oppdaterte tekster
- Lead-registrering / UID-innsending
- Sidevisningssporing
- Sosiale medier-ikoner i gull med glow hover-effekt
- 9 språk i språkvelger

### E-post
- **Verifiseringsmail:** Designet HTML med 1Move-logo, mørkt tema, gull aksenter
- **Velkomstmail:** Sendes ved første "Generate my landing page", inneholder instruksjoner om profilbilde, bio, sosiale medier. Oversatt til 9 språk.

### Favicon og Open Graph
- 1Move-logo som favicon
- Open Graph meta for link-previews (WhatsApp, Facebook, osv.)
- Dynamisk OG per landingsside (IBs navn og bilde)

---

## Språkstøtte — 9 språk

| Kode | Språk | Flagg |
|------|-------|-------|
| en | English | 🇬🇧 |
| no | Norsk | 🇳🇴 |
| sv | Svenska | 🇸🇪 |
| es | Español | 🇪🇸 |
| ru | Русский | 🇷🇺 |
| ar | العربية | 🇸🇦 |
| tl | Filipino | 🇵🇭 |
| pt | Português | 🇧🇷 |
| th | ไทย | 🇹🇭 |

Alle tre hovedfiler (dashboard, landingsside, login) har oversettelser for alle 9 språk.

---

## Mappestruktur

```
primeverse-access/
├── app/
│   ├── api/
│   │   ├── generate-bio/
│   │   │   └── route.ts      # Groq AI bio-generering
│   │   └── welcome-email/
│   │       └── route.ts      # Resend velkomstmail
│   ├── factory/
│   │   └── page.tsx           # Redirect til /
│   ├── login/
│   │   └── page.tsx           # Innlogging og registrering
│   ├── [slug]/
│   │   └── page.tsx           # Offentlig landingsside per IB
│   ├── layout.tsx             # Root layout med metadata, favicon, OG
│   └── page.tsx               # ← HOVEDFIL: Dashboard (all kode her)
├── lib/
│   └── supabase.ts            # Supabase-klient
├── public/
│   └── (favicon, ikoner)
├── Claude.md                  # ← Denne filen
├── .env.local                 # API-nøkler (ikke i git)
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

**VIKTIG:** `app/page.tsx` er hovedfilen med ALL dashboard-kode. `app/factory/page.tsx` er bare en redirect.

---

## Databasetabell: distributors

| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| id | uuid (PK, FK → auth.users) | Bruker-ID fra Supabase Auth |
| slug | text (UNIQUE) | URL-slug → `primeverseaccess.com/[slug]` |
| full_name | text | Fullt navn |
| email | text | E-post |
| language | text | Foretrukket språk |
| region | text | Region/land |
| niche | text | Nisje |
| bio | text | Bio for landingsside (hovedspråk) |
| bio_translations | jsonb | Bio på alle språk: {"en": "...", "no": "...", ...} |
| avatar_url | text | Profilbilde (Supabase Storage) |
| referral_link | text | PuPrime referrallenke |
| social_tiktok | text | TikTok URL |
| social_instagram | text | Instagram URL |
| social_facebook | text | Facebook URL |
| social_snapchat | text | Snapchat URL |
| social_linkedin | text | LinkedIn URL |
| social_youtube | text | YouTube URL |
| social_other | text | Annen sosial media URL |
| landing_page_published | boolean | Er landingssiden publisert? |
| created_at | timestamptz | Opprettet |
| updated_at | timestamptz | Sist oppdatert |

### RLS-policyer (aktive)
- Public SELECT for publiserte profiler (landingssider)
- Authenticated SELECT for egen profil
- Authenticated UPDATE for egen profil
- Authenticated INSERT for ny profil

---

## Environment Variables

```
# .env.local (og Vercel Environment Variables)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=re_...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk_...  # finnes men brukes ikke lenger (erstattet av Groq)
```

---

## Utviklingsfaser

### Fase 1 — MVP ✅ (ferdig, i produksjon)
1. ✅ Auth med e-postverifisering
2. ✅ Dashboard med profilhåndtering
3. ✅ AI Bio-assistent (Groq, 9 språk)
4. ✅ Landingsside-generator med flerspråklig bio
5. ✅ Sosiale medier-felter og ikoner
6. ✅ Lead-registrering og UID-innsending
7. ✅ Metrics med Rolex gauge-instrumenter
8. ✅ IB Resources (Training, VIP Support, Presentation)
9. ✅ Velkomstmail
10. ✅ Favicon og Open Graph
11. ✅ 9 språk

### Fase 2 — Neste (ikke startet)
12. 🔲 PWA (Progressive Web App) — "Add to Home Screen"
13. 🔲 Notifikasjonssystem — In-app, Push, Email, Telegram
14. 🔲 Content Library — Notion + Google Drive, senere integrert
15. 🔲 AI Marketing Agent — Automatisert innhold og publisering

---

## Git

- Hovedbranch: `main`
- Claude Code lager branches som `claude/[beskrivelse]-[session-id]`
- Branchen `main` er beskyttet — endringer merges via Pull Request
- Vercel deployer automatisk ved merge til `main`

---

## Kodekonvensjoner

- **Språk:** TypeScript
- **Komponenter:** Funksjonelle React-komponenter med hooks
- **Navngivning:** camelCase for variabler/funksjoner, PascalCase for komponenter
- **Filer:** kebab-case (f.eks. `profile-form.tsx`)
- **Imports:** Absolutte paths via `@/` alias
- **API:** Supabase client direkte (fra `lib/supabase.ts`)
- **Auth:** Supabase Auth med e-postverifisering
- **Styling:** Tailwind utility classes + inline styles for komplekse gauge-komponenter
- **i18n:** Inline translations-objekt per fil (ikke eksternt i18n-bibliotek)
- **Ingen `src/`-mappe** — `app/` og `lib/` ligger i prosjektroten

---

## Regler for Claude Code

1. **Ikke bygg noe som allerede finnes** — Les denne filen og eksisterende kode først.
2. **Små oppgaver** — Gjør én ting om gangen. Ikke refaktorer hele prosjektet.
3. **Behold eksisterende mønstre** — Følg kodekonvensjoner og mappestruktur som allerede er i bruk.
4. **Test at det fungerer** — Kjør `npm run build` etter endringer.
5. **Ikke endre databaseskjema uten beskjed** — RLS og migrasjoner håndteres manuelt i Supabase.
6. **Behold flerspråklig støtte** — Alle nye tekster må ha oversettelser for ALLE 9 språk.
7. **Slug-sider er offentlige** — Ingen auth-krav på `/[slug]`-ruter.
8. **Dashboard er privat** — Alle dashboard-ruter krever innlogging.
9. **Ingen `src/`-mappe** — Ikke opprett `src/`. Alt ligger i roten.
10. **Supabase-klient** — Bruk `lib/supabase.ts`, ikke opprett nye klient-filer.
11. **Dashboard-kode er i `app/page.tsx`** — IKKE i `app/factory/page.tsx` (som bare er redirect).
12. **AI bruker Groq** — IKKE OpenAI. Modell: `llama-3.3-70b-versatile`.
13. **E-post bruker Resend** — Både via Supabase SMTP og direkte API.

---

## Kommandoer

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg for produksjon
npm run lint         # Kjør ESLint
```

---

## Oppgavefordeling

| Oppgave | Verktøy |
|---------|---------|
| Arkitektur og planlegging | Claude.ai |
| Database-design og RLS | Claude.ai → manuelt i Supabase SQL Editor |
| Implementering av kode | Claude Code |
| Debugging og feilretting | Claude Code |
| UI/UX-design og prototyping | Claude.ai |
| SMTP, URL config, Auth settings | Manuelt i Supabase Dashboard |
| Environment variables | Manuelt i Vercel Dashboard |
| Merge til main | Manuelt via GitHub Pull Request |