-- Auto-poster columns on scheduled_posts.
--
-- Drives the /api/cron/publish-scheduled-posts cron: picks rows where
-- status='scheduled' AND scheduled_for <= now(), publishes via the Graph
-- API, and writes the outcome back to these columns.
--
-- Idempotent.

ALTER TABLE scheduled_posts
  -- Graph API post id returned on success — both /feed (FB) and
  -- /media_publish (IG) return ids; we store whichever one comes back.
  ADD COLUMN IF NOT EXISTS post_id text,

  -- Last failure reason. Cleared when a row transitions back to
  -- 'scheduled' (e.g. an IB edits and reschedules a failed post).
  ADD COLUMN IF NOT EXISTS error_message text,

  -- Timestamp the row reached terminal status='posted'.
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;

-- Partial index: the cron's hot path is "rows ready to publish". Postgres
-- will only index rows in the relevant states, keeping the index tiny.
CREATE INDEX IF NOT EXISTS scheduled_posts_due_idx
  ON scheduled_posts(scheduled_for)
  WHERE status = 'scheduled';

COMMENT ON COLUMN scheduled_posts.post_id IS
'Graph API post id (FB /feed → {pageId}_{postId}; IG /media_publish → numeric).';
COMMENT ON COLUMN scheduled_posts.error_message IS
'Latest publish failure reason. Set when status transitions to ''failed''.';
COMMENT ON COLUMN scheduled_posts.posted_at IS
'When the row reached status=''posted''.';
