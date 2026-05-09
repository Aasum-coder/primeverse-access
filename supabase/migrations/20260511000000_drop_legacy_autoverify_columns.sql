-- Drop legacy mail-forwarding Auto-Verify columns from distributors.
-- The new PU Prime Identity Gateway API flow (PR #215+) replaces this
-- entirely — no code path reads or writes these columns after this PR.
--
-- If a view, function, trigger, or RLS policy still references either
-- column, this migration will fail. In that case, drop the dependent
-- object first (or use CASCADE manually) and re-run.
--
-- Idempotent — safe to re-run.

ALTER TABLE distributors
  DROP COLUMN IF EXISTS forwarding_verification,
  DROP COLUMN IF EXISTS first_puprime_mail_received_at;
