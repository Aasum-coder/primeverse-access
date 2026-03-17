# Handoff — 17. mars 2026

## Session: SYSTM8 Beta Signup Flow

Bygget en komplett beta-signup-funnel for SYSTM8 Beta Program, med eksklusiv invitasjons-tone, PU Prime UID-verifisering, flerspråklig støtte (9 språk), og Zoom-call booking som kjerne i flyten. Endringer på tvers av to repositories.

---

## Hva ble bygget

### 1. `/beta` Landing Page — SYSTM8 Beta Program (primeverse-access)
- **Komplett flerspråklig side** med 9 språk: Norsk, Engelsk, Svensk, Spansk, Russisk, Arabisk, Filipino, Portugisisk, Thai
- **Språkvelger** (dropdown) med RTL-støtte for arabisk
- **Eksklusiv invitasjons-tone** rettet mot 1Move Academy Marketing Team:
  - "Du er invitert til noe som aldri har eksistert i IB-industrien"
  - "Kun med invitasjon" badge
  - "1Move Academy Marketing Team" badge
  - "Begrenset antall plasser" badge
  - "Hvorfor du er valgt"-seksjon
- **Registreringsskjema** med feltene:
  - Fullt navn (påkrevd)
  - E-post (påkrevd, valideres)
  - PU Prime UID (påkrevd, valideres som 4-10 siffer) — for IB-verifisering
  - Telefon (valgfritt)
- **3-stegs progresjon** med visuell stepper:
  - Steg 1: Verifiser (fylle ut skjema med UID)
  - Steg 2: Zoom-call (teamet sender invitasjon)
  - Steg 3: Beta-tilgang (bli med i beta-gruppen)
- **Suksess-side** etter innsending:
  - Grønt suksess-ikon
  - Viser innsendt UID i gullboks
  - Verifiseringsstatus: "Venter på verifisering"
  - 4-stegs "Hva skjer videre"-liste:
    1. Vi verifiserer din PU Prime IB-status
    2. Du mottar en personlig Zoom-invitasjon
    3. Gjennomgang av SYSTM8 — én-til-én med teamet
    4. Du blir med i den eksklusive beta-gruppen
- **"Hvorfor du er valgt"-seksjon** under skjemaet med feature-liste:
  - Sanntids IB-dashboard med AI-innsikt
  - Automatisert lead-tracking og konvertering
  - Provisjonsanalyse og team-performance
  - AI-drevne markedsføringsverktøy
  - Direkte innflytelse på produktutviklingen
- **Footer** med disclaimer: "Kun verifiserte IB-partnere fra Marketing Team kan delta"
- **Design**: Marble/gold tema konsistent med resten av plattformen (Cormorant Garamond + Outfit fonts, brushed gold-knapp med shine-animasjon)
- **Data**: Lagrer til Supabase `leads`-tabell med `source: 'beta-program'` og `status: 'pending_verification'`
- **Varsling**: Sender alert til teamet via `/api/new-lead-alert` med type `beta_application`

### 2. Pre-fill Signup fra Beta Funnel (1move-academy)
- Signup-siden i 1Move Academy aksepterer nå query-parametere: `?name=...&email=...&source=beta`
- Navn og e-post pre-fylles automatisk i registreringsskjemaet
- Bruker `useSearchParams()` fra Next.js for å lese parameterne

---

## Filer som ble endret eller opprettet

### primeverse-access (2 commits)

| Fil | Status | Beskrivelse |
|-----|--------|-------------|
| `app/beta/page.tsx` | **Opprettet** → **Fullstendig omskrevet** | Første versjon var en enkel 3-stegs norsk funnel (registrer → book call → SYSTM8). Andre versjon er den endelige: 9-språklig, eksklusiv beta-program side med PU Prime UID, Zoom-call flow, og "invite only"-tone. ~900 linjer. |

### 1move-academy (1 commit)

| Fil | Status | Beskrivelse |
|-----|--------|-------------|
| `app/(auth)/signup/page.tsx` | **Endret** | Lagt til `useEffect` + `useSearchParams` for å pre-fylle navn og e-post fra query params. Import endret fra `useState` til `useState, useEffect`, og `useRouter` til `useRouter, useSearchParams`. |

---

## Nye DB tabeller / kolonner

### Ingen nye migrasjoner opprettet

Koden skriver til eksisterende `leads`-tabell med følgende felter:
- `full_name` — Fullt navn
- `email` — E-postadresse
- `phone` — Telefonnummer (valgfritt, null hvis tomt)
- `broker_uid` — **Nytt felt brukt** — PU Prime UID for IB-verifisering
- `source` — Satt til `'beta-program'`
- `status` — Satt til `'pending_verification'`

> **VIKTIG**: Kolonnen `broker_uid` må eksistere i `leads`-tabellen i Supabase. Hvis den ikke finnes allerede, må den opprettes:
> ```sql
> ALTER TABLE leads ADD COLUMN IF NOT EXISTS broker_uid TEXT;
> ```
> Alternativt kan det brukes en annen eksisterende kolonne. Sjekk tabellskjemaet.

---

## Bugs som ble fikset

Ingen eksisterende bugs ble fikset i denne sesjonen. Sesjonen handlet om ny funksjonalitet.

---

## Konfigurasjon og oppsett

### Git
- **Branch**: `claude/systm8-signup-flow-k3bmm` (brukt i alle 3 repos)
- **primeverse-access**: 2 commits pushet
  - `5445dc0` — Add SYSTM8 beta signup funnel page (/beta) (første versjon)
  - `55e11b7` — Rewrite /beta as exclusive SYSTM8 Beta Program page (endelig versjon)
- **1move-academy**: 1 commit pushet
  - `4eef1b6` — Accept pre-filled name/email from beta funnel on signup
- **Get-access-to-primverse**: Ingen endringer nødvendig

### Vercel
- Ingen endringer i `vercel.json`
- `/beta` er en standard Next.js App Router-side, trenger ingen spesialkonfigurasjon

### Supabase
- Bruker eksisterende `leads`-tabell
- Trenger muligens `broker_uid`-kolonne (se over)

### Resend / E-post
- Ingen nye templates opprettet
- Bruker eksisterende `/api/new-lead-alert` for varsling

---

## Viktige tekniske beslutninger

### 1. Single-file page component
Hele `/beta`-siden er én fil (`app/beta/page.tsx`, ~900 linjer) med innebygde styles og oversettelser. Dette følger mønsteret fra eksisterende sider (`login/page.tsx`, `[slug]/page.tsx`) og gjør det enkelt å deploye og vedlikeholde som en selvstendig landing page.

### 2. PU Prime UID som påkrevd felt
UID valideres som 4-10 siffer (`/^\d{4,10}$/`). Dette er strengt nok til å fange opp de fleste feil, men fleksibelt nok til å håndtere ulike UID-formater fra PU Prime.

### 3. Forenklet flow (2 steg i praksis)
Selv om stepperen viser 3 steg (Verifiser → Zoom → Beta), har siden bare 2 faktiske sider (form → success). Steg 2 og 3 skjer utenfor appen (teamet verifiserer manuelt, sender Zoom-link, og inviterer til beta-gruppe). Dette er bevisst — det er en menneskedrevet prosess.

### 4. 9 språk inline i filen
Alle oversettelser er inline i filen som et `T`-objekt. Ingen ekstern i18n-bibliotek. Dette matcher mønsteret fra `[slug]/page.tsx` og `login/page.tsx`.

### 5. Lagring i `leads`-tabell (ikke ny tabell)
Bruker eksisterende `leads`-tabell med `source: 'beta-program'` for å skille beta-søknader fra vanlige leads. `status: 'pending_verification'` brukes for å markere at UID må verifiseres.

### 6. Norsk som default-språk
Siden default-er til norsk (`no`) i stedet for engelsk, siden målgruppen primært er nordisk.

---

## Kjente problemer som gjenstår

### Kritisk
1. **`broker_uid`-kolonne i `leads`-tabellen** — Må verifiseres at denne kolonnen eksisterer. Hvis ikke, vil INSERT feile. Opprett med: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS broker_uid TEXT;`

### Bør fikses
2. **Ingen Zoom-integrasjon** — Zoom-call booking er manuell (teamet sender invitasjon etter verifisering). En automatisert Calendly/Zoom-integrasjon kunne vært nyttig.
3. **Ingen e-postbekreftelse til søker** — Etter innsending sendes kun en intern alert til teamet. Søkeren mottar ingen bekreftelse per e-post. Bør legge til en `beta-confirmation`-e-posttemplate via Resend.
4. **Ingen admin-dashboard for beta-søknader** — Teamet kan se søknader i Supabase-dashboardet, men det finnes ikke en dedikert admin-visning for å filtrere og godkjenne beta-søknader.
5. **Duplikathåndtering** — Koden ignorerer duplikat-feil (`dbError.message.includes('duplicate')`), men gir ingen tilbakemelding til brukeren om at de allerede har søkt.
6. **1move-academy signup pre-fill** — Redirect-URL til `https://1move-academy.vercel.app/signup` er fjernet fra den endelige versjonen av `/beta`, men pre-fill-koden i 1move-academy er fortsatt nyttig for fremtidig bruk.

### Lavere prioritet
7. **Ingen analytics/tracking** — Ingen page view tracking eller konverteringssporing på beta-siden.
8. **Ingen rate limiting** — Skjemaet har ingen rate limiting for innsendelser.

---

## Neste prioritet

### 1. Verifiser `broker_uid`-kolonne i Supabase
Sjekk at `leads`-tabellen har `broker_uid`-kolonne. Opprett hvis den mangler.

### 2. Beta-bekreftelse e-post
Lag en ny e-posttemplate (`lib/email-templates/beta-confirmation.ts`) og API-rute som sender en bekreftelse til søkeren med:
- "Takk for at du søkte"
- Neste steg (venter på verifisering → Zoom-invitasjon)
- Forventet ventetid

### 3. Admin-visning for beta-søknader
Legg til en filtrert visning i admin-dashboardet (eller under `/admin`) som viser alle leads med `source: 'beta-program'`, med mulighet til å:
- Se alle søknader
- Markere som verifisert / avvist
- Sende Zoom-invitasjon direkte

### 4. Automatisk Zoom-integrasjon
Vurder å integrere med Calendly eller Zoom direkte slik at søkere kan booke en tid i stedet for å vente på manuell invitasjon.

### 5. Deploy og test
- Merge branch `claude/systm8-signup-flow-k3bmm` til main
- Verifiser at `/beta` fungerer i produksjon
- Test alle 9 språk
- Test skjemainnsending med reell PU Prime UID
