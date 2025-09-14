-- Fix drivers and buses relationship error
-- Run this in Supabase SQL Editor to add the missing foreign key constraint

-- Add current_bus_id column to drivers table if it doesn't exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_bus_id UUID;

-- Add foreign key constraint between drivers and buses
ALTER TABLE drivers 
ADD CONSTRAINT fk_drivers_current_bus 
FOREIGN KEY (current_bus_id) REFERENCES buses(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_current_bus_id ON drivers(current_bus_id);

-- Update some drivers to have bus assignments (sample data)
UPDATE drivers 
SET current_bus_id = (
  SELECT id FROM buses 
  WHERE buses.route_number = 'R01' 
  LIMIT 1
)
WHERE employee_id = 'EMP001';

UPDATE drivers 
SET current_bus_id = (
  SELECT id FROM buses 
  WHERE buses.route_number = 'R02' 
  LIMIT 1
)
WHERE employee_id = 'EMP002';

-- Verify the relationship works
SELECT 
  d.full_name,
  d.employee_id,
  b.bus_number,
  b.route_number
FROM drivers d
LEFT JOIN buses b ON d.current_bus_id = b.id
LIMIT 5;
