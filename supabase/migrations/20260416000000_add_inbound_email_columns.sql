-- Add columns to distributors for inbound email auto-verification feature
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS inbound_email TEXT GENERATED ALWAYS AS ('verify+' || slug || '@zapraxi.resend.app') STORED;
