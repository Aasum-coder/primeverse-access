-- Anonymous landing-page visit tracking. Country derived from Vercel's
-- x-vercel-ip-country header at request time; no IPs ever stored.
-- 90-day retention enforced by /api/cron/cleanup-landing-visits.
-- Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS landing_visits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL,
  country       text,                          -- ISO-3166-1 alpha-2; null if header missing, 'XX' for unknown
  user_agent    text,                          -- truncated to 200 chars at insert site
  is_bot        boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_visits_slug_idx       ON landing_visits(slug);
CREATE INDEX IF NOT EXISTS landing_visits_created_at_idx ON landing_visits(created_at);
CREATE INDEX IF NOT EXISTS landing_visits_country_idx    ON landing_visits(country);
CREATE INDEX IF NOT EXISTS landing_visits_is_bot_idx     ON landing_visits(is_bot);

COMMENT ON TABLE landing_visits IS
'Anonymous visit tracking for IB landing pages. Country derived from
Vercel x-vercel-ip-country header. No IPs stored. 90-day retention
via /api/cron/cleanup-landing-visits.';

-- ────────────────────────────────────────────────────────────────────
-- RLS — admin sees all; IB sees only their own slug.
-- Inserts run via service-role from /[slug]/layout.tsx and bypass RLS,
-- so no INSERT policy is needed.
--
-- Admin check matches the existing repo pattern from
-- app/api/admin/terminate-ib/route.ts: caller's distributors.is_admin
-- column OR caller's auth.users.email = 'bitaasum@gmail.com'.
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE landing_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_visits_admin_read ON landing_visits;
CREATE POLICY landing_visits_admin_read
  ON landing_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors d
      WHERE d.user_id = auth.uid() AND d.is_admin = true
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid() AND u.email = 'bitaasum@gmail.com'
    )
  );

DROP POLICY IF EXISTS landing_visits_ib_read_own ON landing_visits;
CREATE POLICY landing_visits_ib_read_own
  ON landing_visits FOR SELECT
  USING (
    slug IN (SELECT slug FROM distributors WHERE user_id = auth.uid())
  );
