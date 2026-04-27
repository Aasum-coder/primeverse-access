-- Create voice_profiles: central source of truth for IB Voice (V1).
-- Drives landing-page bios, Post Writer prompts, and (later) auto-posting +
-- AI-avatar video. Replaces the ad-hoc distributors.voice_profile JSONB.
-- Idempotent — safe to re-run.

-- ────────────────────────────────────────────────────────────────────────
-- 1. Table
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS voice_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Step 1-7: User input
  identity_one_liner    text,
  audience              text,
  topics                text[] DEFAULT ARRAY[]::text[],
  tone                  text[] DEFAULT ARRAY[]::text[],
  formality             text CHECK (formality IN ('formal', 'casual', 'mixed')),
  emoji_usage           text CHECK (emoji_usage IN ('none', 'light', 'heavy')),
  dos                   text[] DEFAULT ARRAY[]::text[],
  donts                 text[] DEFAULT ARRAY[]::text[],
  signature_phrases     text[] DEFAULT ARRAY[]::text[],

  -- Step 8: V3-prep (visual / avatar preferences)
  visual_preferences    jsonb DEFAULT '{}'::jsonb,

  -- Generated / cached outputs (cleared by trigger when user input changes)
  generated_bio_en              text,
  generated_bio_translations    jsonb DEFAULT '{}'::jsonb,
  generated_system_prompt       text,

  -- Meta
  is_complete           boolean DEFAULT false,
  last_regenerated_at   timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_profiles_user_id_idx     ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS voice_profiles_is_complete_idx ON voice_profiles(is_complete);

COMMENT ON TABLE voice_profiles IS
'Central IB Voice profile (My Voice V1). Drives bios, Post Writer prompts,
and future auto-posting / AI-avatar video. Cached generated_* fields are
auto-cleared by trigger whenever any of the 9 user-input fields change.';

-- ────────────────────────────────────────────────────────────────────────
-- 2. Row-level security
-- ────────────────────────────────────────────────────────────────────────
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;

-- IB can read their own
DROP POLICY IF EXISTS voice_profiles_select_own ON voice_profiles;
CREATE POLICY voice_profiles_select_own
  ON voice_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- IB can insert their own
DROP POLICY IF EXISTS voice_profiles_insert_own ON voice_profiles;
CREATE POLICY voice_profiles_insert_own
  ON voice_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- IB can update their own
DROP POLICY IF EXISTS voice_profiles_update_own ON voice_profiles;
CREATE POLICY voice_profiles_update_own
  ON voice_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public reads for landing pages — only when the owning distributor is published
DROP POLICY IF EXISTS voice_profiles_public_landing ON voice_profiles;
CREATE POLICY voice_profiles_public_landing
  ON voice_profiles FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM distributors WHERE landing_active = true
    )
  );

-- ────────────────────────────────────────────────────────────────────────
-- 3. Single BEFORE UPDATE trigger:
--      • always bump updated_at
--      • clear cached generated_* fields when ANY user-input field changes
--
--    Note on deviation from the spec: the spec proposed two triggers but
--    the second one only checked 3 of 9 user-input fields, so it fired
--    incorrectly when e.g. only `tone` changed. Consolidating into one
--    function gives the same intended behaviour with no edge case.
-- ────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION voice_profiles_before_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();

  IF (
    OLD.identity_one_liner IS DISTINCT FROM NEW.identity_one_liner
    OR OLD.audience          IS DISTINCT FROM NEW.audience
    OR OLD.topics            IS DISTINCT FROM NEW.topics
    OR OLD.tone              IS DISTINCT FROM NEW.tone
    OR OLD.formality         IS DISTINCT FROM NEW.formality
    OR OLD.emoji_usage       IS DISTINCT FROM NEW.emoji_usage
    OR OLD.dos               IS DISTINCT FROM NEW.dos
    OR OLD.donts             IS DISTINCT FROM NEW.donts
    OR OLD.signature_phrases IS DISTINCT FROM NEW.signature_phrases
  ) THEN
    NEW.generated_bio_en           := NULL;
    NEW.generated_bio_translations := '{}'::jsonb;
    NEW.generated_system_prompt    := NULL;
    NEW.last_regenerated_at        := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS voice_profiles_before_update_trigger ON voice_profiles;
CREATE TRIGGER voice_profiles_before_update_trigger
  BEFORE UPDATE ON voice_profiles
  FOR EACH ROW
  EXECUTE FUNCTION voice_profiles_before_update();

-- ────────────────────────────────────────────────────────────────────────
-- 4. Backfill from existing distributors.bio
--    • only rows with a real user_id present in auth.users
--    • is_complete stays false: the IB still needs to fill the other 7 steps
--    • runs on a fresh table, but ON CONFLICT keeps the migration re-runnable
-- ────────────────────────────────────────────────────────────────────────
INSERT INTO voice_profiles (
  user_id,
  identity_one_liner,
  generated_bio_en,
  generated_bio_translations,
  is_complete
)
SELECT
  d.user_id,
  CASE
    WHEN length(d.bio) > 180 THEN substring(d.bio FROM 1 FOR 177) || '...'
    ELSE d.bio
  END,
  d.bio,
  COALESCE(d.bio_translations, '{}'::jsonb),
  false
FROM distributors d
WHERE d.bio IS NOT NULL
  AND length(trim(d.bio)) > 0
  AND d.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = d.user_id)
ON CONFLICT (user_id) DO NOTHING;
