-- Create beta-screenshots storage bucket
-- Run this via Supabase Dashboard > Storage or SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('beta-screenshots', 'beta-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload beta screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'beta-screenshots');

-- Allow public read access for screenshots
CREATE POLICY "Public can read beta screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'beta-screenshots');
