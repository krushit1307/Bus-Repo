-- Deploy missing tables for smart-bus-dashboard
-- Run this script in Supabase SQL Editor

-- First drop schedules table if it exists to start fresh
DROP TABLE IF EXISTS schedules CASCADE;

-- Create schedules table for admin-controlled bus scheduling
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- Array of day numbers (0=Sunday, 1=Monday, etc.)
  frequency_minutes INTEGER DEFAULT 30, -- How often this schedule repeats
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedule_stops table for detailed stop timings
CREATE TABLE IF NOT EXISTS schedule_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL,
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(schedule_id, stop_order)
);

-- Create maintenance_records table for vehicle maintenance tracking
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'emergency')),
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  cost DECIMAL(10,2),
  mechanic_name TEXT,
  parts_used TEXT[],
  mileage_at_service INTEGER,
  next_service_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_performance_records table for driver ratings and performance tracking
CREATE TABLE IF NOT EXISTS driver_performance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5) NOT NULL,
  safety_rating DECIMAL(3,2) CHECK (safety_rating >= 0 AND safety_rating <= 5),
  punctuality_rating DECIMAL(3,2) CHECK (punctuality_rating >= 0 AND punctuality_rating <= 5),
  fuel_efficiency_rating DECIMAL(3,2) CHECK (fuel_efficiency_rating >= 0 AND fuel_efficiency_rating <= 5),
  customer_service_rating DECIMAL(3,2) CHECK (customer_service_rating >= 0 AND customer_service_rating <= 5),
  trips_completed INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2),
  fuel_efficiency_kmpl DECIMAL(5,2),
  incidents_count INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  commendations_count INTEGER DEFAULT 0,
  evaluator_name TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on all new tables for development
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_stops DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE driver_performance_records DISABLE ROW LEVEL SECURITY;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_bus_id ON schedules(bus_id);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_bus_id ON maintenance_records(bus_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_scheduled_date ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_driver_performance_records_driver_id ON driver_performance_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_performance_records_evaluation_date ON driver_performance_records(evaluation_date);

-- Insert sample schedule data using real route and bus IDs
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '08:00:00' as departure_time,
  '08:25:00' as arrival_time,
  ARRAY[1,2,3,4,5] as days_of_week, -- Monday to Friday
  20 as frequency_minutes,
  true as is_active
FROM routes r
CROSS JOIN buses b
LIMIT 3;

-- Add more sample schedules
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '09:00:00' as departure_time,
  '09:30:00' as arrival_time,
  ARRAY[1,2,3,4,5,6] as days_of_week, -- Monday to Saturday
  30 as frequency_minutes,
  true as is_active
FROM routes r
CROSS JOIN buses b
LIMIT 2 OFFSET 1;

-- Insert sample maintenance records (with conflict handling)
INSERT INTO maintenance_records (bus_id, maintenance_type, description, scheduled_date, status, priority, cost, mechanic_name, mileage_at_service, next_service_date)
SELECT 
  b.id,
  'routine',
  'Regular maintenance check and oil change',
  CURRENT_DATE + INTERVAL '7 days',
  'scheduled',
  'medium',
  250.00,
  'Mike Johnson',
  45000,
  CURRENT_DATE + INTERVAL '90 days'
FROM buses b 
WHERE NOT EXISTS (
  SELECT 1 FROM maintenance_records mr WHERE mr.bus_id = b.id AND mr.description = 'Regular maintenance check and oil change'
)
LIMIT 1;

INSERT INTO maintenance_records (bus_id, maintenance_type, description, scheduled_date, completed_date, status, priority, cost, mechanic_name, mileage_at_service)
SELECT 
  b.id,
  'repair',
  'Brake system repair and replacement',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '3 days',
  'completed',
  'high',
  850.00,
  'Sarah Wilson',
  52000
FROM buses b 
WHERE NOT EXISTS (
  SELECT 1 FROM maintenance_records mr WHERE mr.bus_id = b.id AND mr.description = 'Brake system repair and replacement'
)
LIMIT 1 OFFSET 1;

-- Insert sample driver performance records (with conflict handling)
INSERT INTO driver_performance_records (driver_id, overall_rating, safety_rating, punctuality_rating, fuel_efficiency_rating, customer_service_rating, trips_completed, on_time_percentage, fuel_efficiency_kmpl, incidents_count, evaluator_name, comments)
SELECT 
  d.id,
  4.8,
  4.9,
  4.7,
  4.6,
  4.8,
  156,
  94.5,
  8.2,
  0,
  'Transport Manager',
  'Excellent performance, very reliable driver'
FROM drivers d 
WHERE d.employee_id = 'EMP001'
AND NOT EXISTS (
  SELECT 1 FROM driver_performance_records dpr WHERE dpr.driver_id = d.id AND dpr.evaluator_name = 'Transport Manager'
);

INSERT INTO driver_performance_records (driver_id, overall_rating, safety_rating, punctuality_rating, fuel_efficiency_rating, customer_service_rating, trips_completed, on_time_percentage, fuel_efficiency_kmpl, incidents_count, evaluator_name, comments)
SELECT 
  d.id,
  4.9,
  5.0,
  4.8,
  4.7,
  4.9,
  142,
  97.2,
  8.5,
  0,
  'Transport Manager',
  'Outstanding driver with perfect safety record'
FROM drivers d 
WHERE d.employee_id = 'EMP002'
AND NOT EXISTS (
  SELECT 1 FROM driver_performance_records dpr WHERE dpr.driver_id = d.id AND dpr.evaluator_name = 'Transport Manager'
);
