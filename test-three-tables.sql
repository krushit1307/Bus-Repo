-- Test the three existing tables in your database
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Test buses table
SELECT 'buses' as table_name, COUNT(*) as record_count FROM buses;
SELECT * FROM buses LIMIT 3;

-- 3. Test routes table  
SELECT 'routes' as table_name, COUNT(*) as record_count FROM routes;
SELECT * FROM routes LIMIT 3;

-- 4. Test drivers table
SELECT 'drivers' as table_name, COUNT(*) as record_count FROM drivers;
SELECT * FROM drivers LIMIT 3;

-- 5. Check foreign key relationships
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
