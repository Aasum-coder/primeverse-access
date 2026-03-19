# Handoff — 19. mars 2026

## Session: Event System Fixes (Timezone, Delete, Registration Counts)

Branch: `claude/systm8-status-check-6UhnT`
Repo: `Aasum-coder/primeverse-access`

---

## Hva ble bygget / fikset

### 1. Timezone Offset Fix
**Filer:** `app/event/[slug]/page.tsx`, `app/admin/console/page.tsx`
- Endret `timeZone: 'Europe/Oslo'` → `timeZone: 'UTC'` i alle event date displays
- Lagt til "UTC" label slik at brukere vet at tiden er i UTC
- **Problem:** Admin setter 20:00, men det vistes som 21:00 pga Oslo timezone-konvertering

### 2. Delete-knapp for Events
**Fil:** `app/admin/console/page.tsx`
- Lagt til `handleDeleteEvent()` med `window.confirm()` bekreftelse
- Sletter via `supabase.from('events').delete().eq('id', evt.id)`
- Registreringer cascade-slettes automatisk (foreign key ON DELETE CASCADE)
- Rod `btn-reject`-stylet knapp ved siden av Edit i Upcoming Events-tabellen
- Viser spinner under sletting, oppdaterer listen og nullstiller valg etterpaa

### 3. Event Registration Counts — Flere iterasjoner
**Problem:** Dropdown viste "(0 registrations, 0 pending)" selv om registreringer fantes i databasen.

**Iterasjonshistorikk:**
1. Forste forsok: `head: true, count: 'exact'` per-event queries via Supabase JS i `/api/events` — counts returnerte 0
2. La til debug logging for aa diagnostisere — fortsatt 0
3. Provde Supabase foreign key join `select(*, event_registrations(count))` — fortsatt 0
4. Erstattet Supabase JS med direkte PostgREST REST API `fetch`-kall — fortsatt 0
5. **Endelig losning:** Fjernet `/api/events`-ruten helt. Flyttet queries client-side med den eksisterende autentiserte `supabase`-klienten i `app/admin/console/page.tsx`

**Rotaarsak:** Supabase JS-klienten i API-ruten (server-side) returnerte ikke counts korrekt, sannsynligvis pga service role key eller server-side klient-initialiseringsproblemer.

### 4. Null Guards
**Fil:** `app/admin/console/page.tsx`
- La til `?? 0` fallbacks paa `total_registrations`, `pending_count`
- La til `?? ''` paa `slug`, `zoom_link`
- Endret "Not set" til "No date set" for manglende event-datoer
- Fjernet utdatert `registration_counts`-type — erstattet med valgfri `total_registrations?` og `pending_count?`
- Forsterket `fetchEvents` response-parsing med `.filter(Boolean)`

### 5. Refresh-knapp
**Fil:** `app/admin/console/page.tsx`
- Lagt til "Refresh"-knapp (stylet `btn-outline`) ved siden av Select Event dropdown
- Kaller `fetchEvents()` ved klikk

### 6. RLS Policy Rename
**Fil:** `supabase/migrations/20260319300000_rename_registrations_rls_policy.sql`
- Omdopt policy `"Admin can read all registrations"` → `"Authenticated can read all registrations"` paa `event_registrations`

---

## Filer endret

| Fil | Handling |
|-----|---------|
| `app/event/[slug]/page.tsx` | **Oppdatert** — Timezone fikset til UTC |
| `app/admin/console/page.tsx` | **Oppdatert** — Delete-knapp, null guards, Refresh-knapp, direkte Supabase queries for counts |
| `app/api/events/route.ts` | **Slettet** — Ikke lenger nodvendig, erstattet av client-side queries |
| `supabase/migrations/20260319300000_rename_registrations_rls_policy.sql` | **Opprettet** — RLS policy rename |

---

## Commits (kronologisk)

1. `1d19abe` — Fix event date timezone offset and add Delete button for events
2. `743f599` — Fix event registration counts and add Refresh button to dropdown
3. `532ced3` — Simplify /api/events route to fix registration count returning 0
4. `381ad49` — Add null guards to prevent crash on undefined event properties
5. `92055ef` — Add debug logging to diagnose event registration count showing 0
6. `60d86ed` — Replace events API with SQL join approach for registration counts
7. `26774d6` — Replace Supabase JS client with direct REST API fetch calls
8. `2c9fcf3` — Replace API route with direct Supabase queries for event counts

---

## Kjente problemer / oppfolging

1. **RLS-migrering maa kjores:** `20260319300000_rename_registrations_rls_policy.sql` maa applies via `supabase db push` eller dashboard
2. **Verifiser counts i produksjon:** Client-side Supabase queries avhenger av at RLS tillater authenticated users aa SELECT fra `event_registrations`
3. **Skalerbarhet:** Naavaerende losning gjor N+2 queries (1 for events + 2 per event for counts). Med mange events kan dette bli tregt — vurder aa optimalisere med en RPC-funksjon eller view i fremtiden

---

## Neste prioritet

1. Kjor RLS-migreringen i Supabase
2. Test at registration counts vises korrekt i admin-panelet
3. Verifiser at Delete-knappen fungerer og cascade-sletter registreringer
4. Verifiser at event-datoer vises korrekt i UTC
