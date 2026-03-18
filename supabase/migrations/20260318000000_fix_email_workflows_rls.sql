-- Fix RLS policies for email_workflows and workflow_steps tables
-- Users must be able to CRUD their own workflows and read global templates

-- ── email_workflows ──────────────────────────────────────────────────────────

-- Enable RLS (idempotent)
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so we can recreate cleanly
DROP POLICY IF EXISTS "Users can read own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can read global templates" ON email_workflows;
DROP POLICY IF EXISTS "Users can insert own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON email_workflows;
DROP POLICY IF EXISTS "Users can delete own workflows" ON email_workflows;

-- SELECT: own rows + global templates
CREATE POLICY "Users can read own workflows"
  ON email_workflows FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can read global templates"
  ON email_workflows FOR SELECT
  USING (is_template = true AND is_global = true);

-- INSERT: owner_id must match the authenticated user
CREATE POLICY "Users can insert own workflows"
  ON email_workflows FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: can only update own rows
CREATE POLICY "Users can update own workflows"
  ON email_workflows FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: can only delete own rows
CREATE POLICY "Users can delete own workflows"
  ON email_workflows FOR DELETE
  USING (owner_id = auth.uid());


-- ── workflow_steps ───────────────────────────────────────────────────────────

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read steps of own workflows" ON workflow_steps;
DROP POLICY IF EXISTS "Users can read steps of global templates" ON workflow_steps;
DROP POLICY IF EXISTS "Users can insert steps for own workflows" ON workflow_steps;
DROP POLICY IF EXISTS "Users can update steps for own workflows" ON workflow_steps;
DROP POLICY IF EXISTS "Users can delete steps for own workflows" ON workflow_steps;

-- SELECT: steps belonging to user's workflows or global templates
CREATE POLICY "Users can read steps of own workflows"
  ON workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM email_workflows
      WHERE email_workflows.id = workflow_steps.workflow_id
        AND email_workflows.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can read steps of global templates"
  ON workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM email_workflows
      WHERE email_workflows.id = workflow_steps.workflow_id
        AND email_workflows.is_template = true
        AND email_workflows.is_global = true
    )
  );

-- INSERT
CREATE POLICY "Users can insert steps for own workflows"
  ON workflow_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_workflows
      WHERE email_workflows.id = workflow_steps.workflow_id
        AND email_workflows.owner_id = auth.uid()
    )
  );

-- UPDATE
CREATE POLICY "Users can update steps for own workflows"
  ON workflow_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM email_workflows
      WHERE email_workflows.id = workflow_steps.workflow_id
        AND email_workflows.owner_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY "Users can delete steps for own workflows"
  ON workflow_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM email_workflows
      WHERE email_workflows.id = workflow_steps.workflow_id
        AND email_workflows.owner_id = auth.uid()
    )
  );
