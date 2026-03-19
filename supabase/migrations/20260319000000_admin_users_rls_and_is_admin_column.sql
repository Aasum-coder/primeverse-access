-- Add is_admin column to distributors if not exists
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  granted_by TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read admin_users (needed for admin check)
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow the primary admin (bitaasum) to insert into admin_users
-- This uses a subquery to check if the current user's email matches ADMIN_EMAIL
DROP POLICY IF EXISTS "Admin can insert admin_users" ON admin_users;
CREATE POLICY "Admin can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.user_id = auth.uid()
        AND distributors.email = 'bitaasum@gmail.com'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
