-- Fix email_workflows RLS: drop any stale "manage" policy, ensure correct per-operation policies
-- This resolves workflow save failing for non-admin IB users

-- Drop the old catch-all policy that may exist in the DB but not in migrations
DROP POLICY IF EXISTS "Users can manage own workflows" ON email_workflows;

-- Re-create per-operation policies (idempotent — drop first, then create)
DROP POLICY IF EXISTS "Users can insert own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can select own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can read own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can read global templates" ON email_workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can delete own workflows" ON email_workflows;

-- SELECT: own rows
CREATE POLICY "Users can select own workflows"
  ON email_workflows FOR SELECT
  USING (owner_id = auth.uid());

-- SELECT: global templates (visible to all authenticated users)
CREATE POLICY "Users can read global templates"
  ON email_workflows FOR SELECT
  USING (is_template = true AND is_global = true);

-- INSERT: owner_id must match the authenticated user
CREATE POLICY "Users can insert own workflows"
  ON email_workflows FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: can only update own rows, owner_id must stay as auth.uid()
CREATE POLICY "Users can update own workflows"
  ON email_workflows FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: can only delete own rows
CREATE POLICY "Users can delete own workflows"
  ON email_workflows FOR DELETE
  USING (owner_id = auth.uid());
