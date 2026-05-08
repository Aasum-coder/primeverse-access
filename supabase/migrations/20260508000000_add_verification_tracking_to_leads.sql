-- Add real-time verification tracking columns to leads.
--
-- Phase 1 of the PU Prime Identity Gateway integration. The existing
-- columns leads.uid_verified (boolean) and leads.uid_verified_at (timestamptz)
-- continue to drive the green "Verified" pill in the pipeline. The new
-- columns track HOW that verification happened so we can show an "⚡ API"
-- badge for gateway-verified leads vs. legacy mail-forwarded ones, and so
-- denial reasons surface back into the dashboard.
--
-- Idempotent — safe to re-run.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS verification_source text,
  ADD COLUMN IF NOT EXISTS verification_reason text;

-- Note: leads.uid_verified_at already exists (set by the manual approve
-- flow + the auto-verify pipeline). We reuse it instead of adding a
-- duplicate `verified_at` column — same semantic, single source of truth.

COMMENT ON COLUMN leads.verification_source IS
'How the lead was verified. Known values: ''puprime_api'' (Identity Gateway),
NULL (legacy / manual / not yet attempted).';

COMMENT ON COLUMN leads.verification_reason IS
'Free-text reason returned by the verifier on a denial — e.g. "PU Prime UID is required",
"Account not found", "Inactive". NULL on success or when verification has not been attempted.';

CREATE INDEX IF NOT EXISTS leads_verification_source_idx
  ON leads(verification_source)
  WHERE verification_source IS NOT NULL;
