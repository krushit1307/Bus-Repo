-- Create only the schedules table to fix "Schedules table not found" error
-- Run this in Supabase SQL Editor

CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  bus_id UUID NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  frequency_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_bus_id ON schedules(bus_id);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON schedules(is_active);

-- Insert sample data for testing
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), '08:00:00', '08:25:00', ARRAY[1,2,3,4,5], 20, true),
  (gen_random_uuid(), gen_random_uuid(), '09:00:00', '09:30:00', ARRAY[1,2,3,4,5,6], 30, true),
  (gen_random_uuid(), gen_random_uuid(), '10:15:00', '10:45:00', ARRAY[1,2,3,4,5], 25, true);
