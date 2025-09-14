-- Test the exact query that your dashboard is trying to run
-- Run this in Supabase SQL Editor to see what's failing

-- 1. First check if schedules table exists and has data
SELECT COUNT(*) as schedules_count FROM schedules;

-- 2. Test the basic schedules query
SELECT * FROM schedules LIMIT 3;

-- 3. Test the exact query from your database service (this might be failing)
-- This is what db.getSchedules() is trying to do:
SELECT 
  schedules.*,
  routes.id as route_id,
  routes.name as route_name,
  buses.id as bus_id,
  buses.bus_number as bus_number
FROM schedules
LEFT JOIN routes ON schedules.route_id = routes.id
LEFT JOIN buses ON schedules.bus_id = buses.id
ORDER BY schedules.created_at DESC
LIMIT 5;

-- 4. Check if routes and buses tables have the data that schedules is referencing
SELECT 'routes' as table_name, COUNT(*) as count FROM routes
UNION ALL
SELECT 'buses' as table_name, COUNT(*) as count FROM buses
UNION ALL  
SELECT 'schedules' as table_name, COUNT(*) as count FROM schedules;
