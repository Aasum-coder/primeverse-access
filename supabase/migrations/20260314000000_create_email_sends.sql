-- Create email_sends table for tracking sent emails and preventing duplicates
CREATE TABLE email_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups: "has this user already received this email type?"
CREATE INDEX idx_email_sends_user_type ON email_sends (user_id, email_type);

-- Enable RLS
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Users can only read their own email send records
CREATE POLICY "Users can view own email sends"
  ON email_sends
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM distributors WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert (server-side cron/API)
-- No INSERT policy for authenticated users = server-only writes via service role key
