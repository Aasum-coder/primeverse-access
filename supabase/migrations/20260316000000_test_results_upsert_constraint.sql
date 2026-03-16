-- Add unique constraint on (tester_id, test_item) to support upsert
-- This ensures each tester can only have one result per test item
ALTER TABLE test_results ADD CONSTRAINT test_results_tester_item_unique UNIQUE (tester_id, test_item);

-- Add admin SELECT policies so admin API (service role) isn't needed for future direct queries
-- For now, the admin API route uses service role key which bypasses RLS
