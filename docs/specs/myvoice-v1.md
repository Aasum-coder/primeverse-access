# My Voice V1 — Architecture spec

## Overview

My Voice is the central IB-defined "voice profile" that powers landing-page
bios, the Post Writer / Reply Assistant prompts, and (later) auto-posting
and AI-avatar video. V1 replaces the ad-hoc `distributors.bio` +
`distributors.voice_profile` JSONB pair with a dedicated `voice_profiles`
table keyed on `auth.users.id`. The IB completes a short 8-step wizard
once; downstream features pull from that single source.

## Schema (V1)

```
voice_profiles
├── id                 uuid (pk)
├── user_id            uuid (fk → auth.users, unique)
│
│   Step 1-7 — user input
├── identity_one_liner text
├── audience           text
├── topics             text[]
├── tone               text[]
├── formality          'formal' | 'casual' | 'mixed'
├── emoji_usage        'none' | 'light' | 'heavy'
├── dos                text[]
├── donts              text[]
├── signature_phrases  text[]
│
│   Step 8 — V3-prep
├── visual_preferences jsonb
│
│   Generated / cached (cleared by trigger on user-input change)
├── generated_bio_en              text
├── generated_bio_translations    jsonb
├── generated_system_prompt       text
│
│   Meta
├── is_complete         boolean
├── last_regenerated_at timestamptz
├── created_at          timestamptz
└── updated_at          timestamptz
```

A single `BEFORE UPDATE` trigger always bumps `updated_at` and clears the
cached `generated_*` outputs when any of the 9 user-input fields change,
forcing a regeneration on the next read.

## RLS

| Policy | Effect |
|---|---|
| `voice_profiles_select_own` | IB reads their own profile |
| `voice_profiles_insert_own` | IB creates their own profile |
| `voice_profiles_update_own` | IB updates their own profile |
| `voice_profiles_public_landing` | Public reads for landings, but only when `distributors.landing_active = true` |

## Roadmap

| PR | Scope |
|---|---|
| **A** (this PR) | Migration: `voice_profiles` table, RLS, backfill from `distributors.bio` |
| **B** | API endpoints — read/write profile, generate bio, regenerate system prompt |
| **C** | 8-step wizard UI in dashboard |
| **D** | Post Writer / Reply Assistant switch from `distributors.voice_profile` JSONB → new prompt source |
| **E** | Landing page reads `generated_bio_*` from `voice_profiles`; remove `distributors.bio` reads |
| **F** | Optional: V2/V3 features (auto-posting, AI-avatar video) layered on top |

`distributors.bio` and `distributors.bio_translations` are **kept** through
PR D so live landing pages never break during the rollout.
