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

-- Disable RLS on drivers table for development
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;

-- Insert sample drivers
INSERT INTO drivers (employee_id, full_name, email, phone, license_number, license_expiry, experience_years, status) VALUES
('EMP001', 'John Smith', 'john.smith@smartbus.com', '+1-555-0101', 'DL123456789', '2025-12-31', 5, 'active'),
('EMP002', 'Maria Garcia', 'maria.garcia@smartbus.com', '+1-555-0102', 'DL987654321', '2026-06-15', 8, 'active'),
('EMP003', 'David Johnson', 'david.johnson@smartbus.com', '+1-555-0103', 'DL456789123', '2025-09-30', 3, 'active'),
('EMP004', 'Sarah Wilson', 'sarah.wilson@smartbus.com', '+1-555-0104', 'DL789123456', '2026-03-20', 12, 'on_leave'),
('EMP005', 'Michael Brown', 'michael.brown@smartbus.com', '+1-555-0105', 'DL321654987', '2025-11-10', 7, 'active'),
('EMP006', 'Lisa Davis', 'lisa.davis@smartbus.com', '+1-555-0106', 'DL654987321', '2026-08-05', 4, 'inactive');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX IF NOT EXISTS idx_drivers_current_bus_id ON drivers(current_bus_id);
