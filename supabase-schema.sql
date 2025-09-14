-- Drop existing buses table if it exists and recreate with correct schema
DROP TABLE IF EXISTS buses CASCADE;

-- Create buses table with bus_number column
CREATE TABLE buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_number TEXT NOT NULL,
  bus_number TEXT NOT NULL UNIQUE,
  current_location TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  stops TEXT[] NOT NULL DEFAULT '{}',
  distance_km DECIMAL(10,2) NOT NULL,
  estimated_duration INTEGER NOT NULL, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_route_number ON buses(route_number);
CREATE INDEX IF NOT EXISTS idx_buses_bus_number ON buses(bus_number);
CREATE INDEX IF NOT EXISTS idx_routes_name ON routes(name);

-- Insert sample data
INSERT INTO routes (name, start_point, end_point, stops, distance_km, estimated_duration) VALUES
('Route 1A', 'Central Station', 'Airport', ARRAY['Mall Plaza', 'University', 'Hospital'], 25.5, 45),
('Route 2B', 'Downtown', 'Suburbs', ARRAY['Park Avenue', 'Shopping Center', 'School District'], 18.2, 35),
('Route 3C', 'Industrial Area', 'Residential Zone', ARRAY['Factory Gate', 'Community Center'], 12.8, 25);

-- Create user profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'user', 'driver')) DEFAULT 'user',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT
);

-- Temporarily disable RLS on all tables to fix CRUD operations
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Disable RLS on all tables to fix CRUD operations
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view buses" ON buses;
DROP POLICY IF EXISTS "Authenticated users can manage buses" ON buses;
DROP POLICY IF EXISTS "Admins can manage buses" ON buses;
DROP POLICY IF EXISTS "Anyone can view routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can manage routes" ON routes;
DROP POLICY IF EXISTS "Admins can manage routes" ON routes;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;

-- Skip all policies to allow unrestricted access for development
-- RLS is disabled on all tables to fix CRUD operations

-- Create schedules table for admin-controlled bus scheduling
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- Array of day numbers (0=Sunday, 1=Monday, etc.)
  frequency_minutes INTEGER DEFAULT 30, -- How often this schedule repeats
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, bus_id, departure_time, days_of_week)
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

-- Disable RLS on new tables
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_stops DISABLE ROW LEVEL SECURITY;

-- Create drivers table for driver management
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')) DEFAULT 'active',
  experience_years INTEGER DEFAULT 0,
  current_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on drivers table
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;

-- Add indexes for better performance on drivers table
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX IF NOT EXISTS idx_drivers_current_bus_id ON drivers(current_bus_id);

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

-- Disable RLS on new tables
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE driver_performance_records DISABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_records_bus_id ON maintenance_records(bus_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_scheduled_date ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_driver_performance_records_driver_id ON driver_performance_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_performance_records_evaluation_date ON driver_performance_records(evaluation_date);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO routes (name, start_point, end_point, stops, distance_km, estimated_duration) VALUES
('Route 1A', 'Central Station', 'Airport', ARRAY['Mall Plaza', 'University', 'Hospital'], 25.5, 45),
('Route 2B', 'Downtown', 'Suburbs', ARRAY['Park Avenue', 'Shopping Center', 'School District'], 18.2, 35),
('Route 3C', 'Industrial Area', 'Residential Zone', ARRAY['Factory Gate', 'Community Center'], 12.8, 25);

INSERT INTO buses (route_number, bus_number, capacity, status, current_location) VALUES
('R01', 'City Express', 50, 'active', 'Central Station'),
('R01', 'Metro Rider', 50, 'active', 'Mall Junction'),
('R02', 'Airport Shuttle', 45, 'maintenance', 'Depot'),
('R02', 'Business Line', 50, 'active', 'Airport Terminal'),
('R03', 'University Special', 55, 'active', 'University Gate'),
('R03', 'Campus Connect', 48, 'active', 'Tech Park'),
('R04', 'Downtown Express', 52, 'active', 'City Center'),
('R04', 'Harbor View', 50, 'inactive', 'Port Authority');

-- Insert sample schedules
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '06:00:00' as departure_time,
  '06:45:00' as arrival_time,
  ARRAY[1,2,3,4,5] as days_of_week, -- Monday to Friday
  30 as frequency_minutes,
  true as is_active
FROM routes r, buses b 
WHERE r.name = 'Route 1A' AND b.route_number = 'R01'
LIMIT 1;

INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '07:30:00' as departure_time,
  '08:05:00' as arrival_time,
  ARRAY[1,2,3,4,5] as days_of_week, -- Monday to Friday
  45 as frequency_minutes,
  true as is_active
FROM routes r, buses b 
WHERE r.name = 'Route 2B' AND b.route_number = 'R02'
LIMIT 1;

INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, frequency_minutes, is_active)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '08:00:00' as departure_time,
  '08:25:00' as arrival_time,
  ARRAY[1,2,3,4,5,6] as days_of_week, -- Monday to Saturday
  20 as frequency_minutes,
  true as is_active
FROM routes r, buses b 
WHERE r.name = 'Route 3C' AND b.route_number = 'R03'
LIMIT 1;

-- Insert sample drivers (with conflict handling)
INSERT INTO drivers (employee_id, full_name, email, phone, license_number, license_expiry, experience_years, status) VALUES
('EMP001', 'John Smith', 'john.smith@smartbus.com', '+1-555-0101', 'DL123456789', '2025-12-31', 5, 'active'),
('EMP002', 'Maria Garcia', 'maria.garcia@smartbus.com', '+1-555-0102', 'DL987654321', '2026-06-15', 8, 'active'),
('EMP003', 'David Johnson', 'david.johnson@smartbus.com', '+1-555-0103', 'DL456789123', '2025-09-30', 3, 'active'),
('EMP004', 'Sarah Wilson', 'sarah.wilson@smartbus.com', '+1-555-0104', 'DL789123456', '2026-03-20', 12, 'on_leave'),
('EMP005', 'Michael Brown', 'michael.brown@smartbus.com', '+1-555-0105', 'DL321654987', '2025-11-10', 7, 'active'),
('EMP006', 'Lisa Davis', 'lisa.davis@smartbus.com', '+1-555-0106', 'DL654987321', '2026-08-05', 4, 'inactive')
ON CONFLICT (employee_id) DO NOTHING;

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
