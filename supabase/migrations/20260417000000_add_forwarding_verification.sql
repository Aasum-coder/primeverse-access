-- Add forwarding verification tracking
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS forwarding_verification JSONB;

COMMENT ON COLUMN distributors.forwarding_verification IS
'Stores latest forwarding verification from email provider. Shape:
{
  provider: "gmail" | "outlook" | "yahoo" | "icloud" | "protonmail" | "unknown",
  code: string | null,
  link: string | null,
  received_at: ISO timestamp,
  expires_at: ISO timestamp (received_at + 7 days),
  from_address: string,
  subject: string
}';

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_distributors_forwarding_verification
ON distributors USING GIN (forwarding_verification);
