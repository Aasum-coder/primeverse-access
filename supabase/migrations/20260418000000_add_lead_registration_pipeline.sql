-- Add registration/verification pipeline to leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS registration_status TEXT
    CHECK (registration_status IN ('pending', 'registered', 'verified', 'rejected'))
    DEFAULT 'pending';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Backfill existing verified leads to the new status system
UPDATE leads
  SET registration_status = 'verified', verified_at = created_at
  WHERE uid_verified = true AND registration_status = 'pending';

-- Index for pipeline queries
CREATE INDEX IF NOT EXISTS idx_leads_registration_status
  ON leads(distributor_id, registration_status);
