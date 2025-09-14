-- Test drivers CRUD operations in Supabase
-- Run these queries one by one to test Create, Update, Delete functionality

-- 1. Test CREATE (Insert) operation
INSERT INTO drivers (
  employee_id, 
  full_name, 
  email, 
  phone, 
  license_number, 
  license_expiry, 
  hire_date, 
  status, 
  experience_years, 
  emergency_contact_name, 
  emergency_contact_phone, 
  address
) VALUES (
  'TEST001',
  'Test Driver',
  'test@smartbus.com',
  '+1-555-TEST',
  'DL-TEST-123',
  '2026-12-31',
  CURRENT_DATE,
  'active',
  5,
  'Test Emergency Contact',
  '+1-555-EMRG',
  '123 Test Street, Test City'
);

-- 2. Verify the driver was created
SELECT * FROM drivers WHERE employee_id = 'TEST001';

-- 3. Test UPDATE operation
UPDATE drivers 
SET 
  full_name = 'Updated Test Driver',
  experience_years = 6,
  status = 'inactive'
WHERE employee_id = 'TEST001';

-- 4. Verify the update worked
SELECT * FROM drivers WHERE employee_id = 'TEST001';

-- 5. Test assigning a bus to the driver (relationship test)
UPDATE drivers 
SET current_bus_id = (SELECT id FROM buses LIMIT 1)
WHERE employee_id = 'TEST001';

-- 6. Test the relationship query (what the dashboard uses)
SELECT 
  d.*,
  b.bus_number,
  b.route_number
FROM drivers d
LEFT JOIN buses b ON d.current_bus_id = b.id
WHERE d.employee_id = 'TEST001';

-- 7. Test DELETE operation
DELETE FROM drivers WHERE employee_id = 'TEST001';

-- 8. Verify the driver was deleted
SELECT * FROM drivers WHERE employee_id = 'TEST001';

-- 9. Check all existing drivers to ensure CRUD operations work
SELECT 
  employee_id,
  full_name,
  status,
  experience_years,
  CASE 
    WHEN current_bus_id IS NOT NULL THEN 'Has Bus Assignment'
    ELSE 'No Bus Assignment'
  END as bus_status
FROM drivers
ORDER BY created_at DESC;
