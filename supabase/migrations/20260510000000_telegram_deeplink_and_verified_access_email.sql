-- Telegram deep-link integration with @OneMoveAccessBot.
-- The bot (Railway, long-polling) reads these columns directly. SYSTM8
-- only writes them — it does NOT host any Telegram webhook.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS telegram_link_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_link_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_access_email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_telegram_chat_id
  ON leads(telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_telegram_link_token
  ON leads(telegram_link_token)
  WHERE telegram_link_token IS NOT NULL;

-- Conditionally add UNIQUE constraint to bot_verified_users.uid only if
-- it doesn't already exist. Required for the ON CONFLICT (uid) UPSERT
-- in /api/leads/verify-uid.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'bot_verified_users'::regclass
      AND contype IN ('p', 'u')
      AND conkey = ARRAY[(
        SELECT attnum
        FROM pg_attribute
        WHERE attrelid = 'bot_verified_users'::regclass
          AND attname = 'uid'
      )]::smallint[]
  ) THEN
    ALTER TABLE bot_verified_users ADD CONSTRAINT bot_verified_users_uid_key UNIQUE (uid);
  END IF;
END $$;

COMMENT ON COLUMN leads.telegram_link_token IS
'Single-use 48-char hex token included in the verified-access email''s deep-link to @OneMoveAccessBot. Cleared by the bot after it links the chat_id.';
COMMENT ON COLUMN leads.telegram_chat_id IS
'Set by @OneMoveAccessBot once the lead opens the deep-link or enters their UID directly in the bot.';
COMMENT ON COLUMN leads.verified_access_email_sent_at IS
'Set when the post-verification "you''re in" email goes out. Drives idempotency in /api/leads/verify-uid.';
