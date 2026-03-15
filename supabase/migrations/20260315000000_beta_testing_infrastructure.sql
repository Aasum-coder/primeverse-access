-- Beta testing infrastructure for SYSTM8
-- Adds beta tester flag, test_results table, bug_reports table, RLS policies, and indexes

-- 1. Add beta tester flag to distributors
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;

-- 2. Create test_results table
CREATE TABLE test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tester_email TEXT NOT NULL,
  tester_name TEXT,
  section TEXT NOT NULL,
  test_item TEXT NOT NULL,
  status TEXT CHECK (status IN ('pass', 'fail', 'skip')) NOT NULL,
  comment TEXT,
  screenshot_url TEXT,
  platform TEXT CHECK (platform IN ('systm8', '1moveacademy')) DEFAULT 'systm8',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create bug_reports table
CREATE TABLE bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email TEXT,
  reporter_name TEXT,
  platform TEXT CHECK (platform IN ('systm8', '1moveacademy')) NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor', 'cosmetic')) DEFAULT 'major',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  steps_to_reproduce TEXT,
  device_info TEXT,
  language TEXT,
  status TEXT CHECK (status IN ('new', 'triaging', 'fixing', 'deployed', 'verified', 'wont_fix')) DEFAULT 'new',
  agent_prompt TEXT,
  fix_pr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS policies for test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own test results" ON test_results FOR INSERT WITH CHECK (auth.uid() = tester_id);
CREATE POLICY "Users can read own test results" ON test_results FOR SELECT USING (auth.uid() = tester_id);
CREATE POLICY "Users can update own test results" ON test_results FOR UPDATE USING (auth.uid() = tester_id);

-- 4. RLS policies for bug_reports
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bug reports" ON bug_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own bug reports" ON bug_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can update own bug reports" ON bug_reports FOR UPDATE USING (auth.uid() = reporter_id);

-- 5. Indexes
CREATE INDEX idx_test_results_tester ON test_results(tester_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_platform ON bug_reports(platform);
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);
