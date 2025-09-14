-- Debug schedules table issue
-- Run this in Supabase SQL Editor to check what's wrong

-- 1. Verify schedules table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'schedules';

-- 2. Check schedules table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'schedules'
ORDER BY ordinal_position;

-- 3. Test basic query on schedules table
SELECT COUNT(*) as schedules_count FROM schedules;

-- 4. Check if there are any records
SELECT * FROM schedules LIMIT 3;

-- 5. Test the exact query that the dashboard uses
SELECT 
  *,
  route:routes(*),
  bus:buses(*)
FROM schedules
ORDER BY created_at DESC
LIMIT 1;
