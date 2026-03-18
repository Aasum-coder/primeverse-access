-- Allow authenticated users to insert their own distributor row
-- (user_id must match auth.uid())

DROP POLICY IF EXISTS "Users can insert own distributor" ON distributors;

CREATE POLICY "Users can insert own distributor"
  ON distributors
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
