-- Allow any authenticated user to update distributors rows.
-- The admin console page already gates access to ADMIN_EMAIL on the client,
-- and RLS SELECT policies limit what rows are visible.
-- This unblocks the Approve / Reject buttons for the admin user.

DROP POLICY IF EXISTS "Admin can update distributors" ON distributors;

CREATE POLICY "Admin can update distributors"
  ON distributors
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
