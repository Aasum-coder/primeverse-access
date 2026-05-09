-- Lead Flow Phase A — schema additions for the new welcome flow.
--
-- Drives: Email #1 send tracking, the verify-uid token-based page, the
-- "already a PU Prime client" link in Email #1, browser-locale-aware
-- email language selection, and an optional structured contact preference
-- payload (filled in PR B).
--
-- Idempotent — safe to re-run.

ALTER TABLE leads
  -- Captured from Accept-Language at signup time. Drives Email #1 + the
  -- verify-uid page language. NULL on legacy rows; the dispatcher falls
  -- back to landing-page country / English.
  ADD COLUMN IF NOT EXISTS browser_locale text,

  -- Set to true when the lead clicks the "already a PU Prime client"
  -- link in Email #1. Surfaces the row in the "Existing client (manual)"
  -- pipeline column so the IB can reach out personally.
  ADD COLUMN IF NOT EXISTS existing_client_flag boolean DEFAULT false,

  -- Stamp once Email #1 has actually been delivered to Resend. NULL means
  -- the welcome email has not been sent yet — drives the partial index
  -- below for "needs welcome email" admin queries.
  ADD COLUMN IF NOT EXISTS email_1_sent_at timestamptz,

  -- Single-use random hex token included in the verify-uid + existing-
  -- client URLs in Email #1. Cleared once the lead verifies, so the link
  -- is one-shot.
  ADD COLUMN IF NOT EXISTS verify_token text,
  ADD COLUMN IF NOT EXISTS verify_token_expires_at timestamptz;

-- leads.uid already exists from earlier work (the manual-add path
-- `supabase.from('leads').insert({..., uid: leadUid, ...})` has been
-- shipping for months). Reusing that column rather than adding a
-- duplicate per spec ("don't duplicate").

CREATE UNIQUE INDEX IF NOT EXISTS leads_verify_token_idx
  ON leads(verify_token)
  WHERE verify_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_email_1_pending_idx
  ON leads(email_1_sent_at)
  WHERE email_1_sent_at IS NULL;

COMMENT ON COLUMN leads.browser_locale IS
'Accept-Language tag captured at signup (e.g. ''no-NO'', ''en-GB''). NULL pre-Phase-A.';
COMMENT ON COLUMN leads.existing_client_flag IS
'True when the lead clicked "already a PU Prime client" in Email #1.';
COMMENT ON COLUMN leads.email_1_sent_at IS
'Timestamp Email #1 (welcome) was successfully handed to Resend.';
COMMENT ON COLUMN leads.verify_token IS
'Single-use token gating the verify-uid page and the existing-client link.';
COMMENT ON COLUMN leads.verify_token_expires_at IS
'When verify_token stops being honoured. Default 30 days from issuance.';
