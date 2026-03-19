-- Events system tables for SYSTM8
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  event_date timestamptz,
  zoom_link text,
  max_attendees integer,
  is_active boolean DEFAULT true,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  uid text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  status_note text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can read active events (public registration page)
CREATE POLICY "Anyone can read active events" ON events
  FOR SELECT USING (is_active = true);

-- Authenticated admin can manage events
CREATE POLICY "Admin can manage events" ON events
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Anyone can insert registration (public form, no auth)
CREATE POLICY "Anyone can insert registration" ON event_registrations
  FOR INSERT WITH CHECK (true);

-- Authenticated users can read registrations (admin)
CREATE POLICY "Admin can read all registrations" ON event_registrations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can update registrations (admin approve/reject)
CREATE POLICY "Admin can update registrations" ON event_registrations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Unique constraint: one registration per email per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_reg_email_event ON event_registrations(event_id, email);

-- Seed the first event (launch call)
INSERT INTO events (slug, title, description, event_date, is_active, created_by)
VALUES (
  'launch',
  'SYSTM8 Launch Call',
  'Join us for the official SYSTM8 launch. Learn how to set up your IB business and start getting leads.',
  now() + interval '7 days',
  true,
  'bitaasum@gmail.com'
) ON CONFLICT (slug) DO NOTHING;
