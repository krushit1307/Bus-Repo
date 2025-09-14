-- Check current database status and verify the three existing tables
-- Run this in Supabase SQL Editor to see what you have

-- 1. List all tables in your database
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check table structures
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 3. Count records in each table
SELECT 
  (SELECT COUNT(*) FROM buses) as buses_count,
  (SELECT COUNT(*) FROM routes) as routes_count,
  (SELECT COUNT(*) FROM drivers) as drivers_count;

-- 4. Test basic queries for each table
SELECT 'buses' as table_name, COUNT(*) as record_count FROM buses
UNION ALL
SELECT 'routes' as table_name, COUNT(*) as record_count FROM routes  
UNION ALL
SELECT 'drivers' as table_name, COUNT(*) as record_count FROM drivers;
