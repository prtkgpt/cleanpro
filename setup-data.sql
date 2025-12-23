-- CleanPro CRM - Database Seed Data
-- Run this if: npm run db:seed fails
-- Command: psql -d cleanpro < setup-data.sql

-- Clear existing data
TRUNCATE "CleanerAssignment", "Booking", "Service", "Cleaner", "Address", "Customer", "User", "Workspace" CASCADE;

-- Create workspace
INSERT INTO "Workspace" (id, name, slug, timezone, currency, "createdAt", "updatedAt")
VALUES ('ws001', 'Clean Sweep Services', 'clean-sweep', 'America/New_York', 'USD', NOW(), NOW());

-- Create admin user (password: password123)
-- Hash generated with: bcrypt.hash('password123', 12)
INSERT INTO "User" (id, email, password, name, phone, role, "workspaceId", "createdAt", "updatedAt")
VALUES ('user001', 'admin@cleansweep.com', '$2a$12$Ek61I3YR4aOW5pZpCiu6Puq7XhnBiHCj8PMiiodmNHVB/ADJ4IpVy', 'Admin User', '+15551234567', 'ADMIN', 'ws001', NOW(), NOW());

-- Create customer users (password: password123)
INSERT INTO "User" (id, email, password, name, phone, role, "workspaceId", "createdAt", "updatedAt")
VALUES
('user002', 'jane@example.com', '$2a$12$Ek61I3YR4aOW5pZpCiu6Puq7XhnBiHCj8PMiiodmNHVB/ADJ4IpVy', 'Jane Doe', '+15559876543', 'CUSTOMER', 'ws001', NOW(), NOW()),
('user003', 'bob@example.com', '$2a$12$Ek61I3YR4aOW5pZpCiu6Puq7XhnBiHCj8PMiiodmNHVB/ADJ4IpVy', 'Bob Johnson', '+15559871234', 'CUSTOMER', 'ws001', NOW(), NOW());

-- Create customers
INSERT INTO "Customer" (id, "userId", "workspaceId", "firstName", "lastName", email, phone, tags, "createdAt", "updatedAt")
VALUES
('cust001', 'user002', 'ws001', 'Jane', 'Doe', 'jane@example.com', '+15559876543', ARRAY['vip']::text[], NOW(), NOW()),
('cust002', 'user003', 'ws001', 'Bob', 'Johnson', 'bob@example.com', '+15559871234', ARRAY['regular']::text[], NOW(), NOW());

-- Create addresses
INSERT INTO "Address" (id, "customerId", street, city, state, zip, country, "squareFeet", bedrooms, bathrooms, "isDefault", "createdAt", "updatedAt")
VALUES
('addr001', 'cust001', '123 Main St', 'New York', 'NY', '10001', 'US', 1500, 2, 2, true, NOW(), NOW()),
('addr002', 'cust002', '456 Oak Ave', 'Brooklyn', 'NY', '11201', 'US', 2000, 3, 2, true, NOW(), NOW());

-- Create cleaner users (password: password123)
INSERT INTO "User" (id, email, password, name, phone, role, "workspaceId", "createdAt", "updatedAt")
VALUES
('user004', 'maria@cleansweep.com', '$2a$12$Ek61I3YR4aOW5pZpCiu6Puq7XhnBiHCj8PMiiodmNHVB/ADJ4IpVy', 'Maria Garcia', '+15551112222', 'CLEANER', 'ws001', NOW(), NOW()),
('user005', 'john@cleansweep.com', '$2a$12$Ek61I3YR4aOW5pZpCiu6Puq7XhnBiHCj8PMiiodmNHVB/ADJ4IpVy', 'John Smith', '+15553334444', 'CLEANER', 'ws001', NOW(), NOW());

-- Create cleaners
INSERT INTO "Cleaner" (id, "userId", "workspaceId", "firstName", "lastName", email, phone, "hourlyRate", "hireDate", color, "isActive", "createdAt", "updatedAt")
VALUES
('clean001', 'user004', 'ws001', 'Maria', 'Garcia', 'maria@cleansweep.com', '+15551112222', 25.00, NOW() - INTERVAL '6 months', '#10b981', true, NOW(), NOW()),
('clean002', 'user005', 'ws001', 'John', 'Smith', 'john@cleansweep.com', '+15553334444', 22.00, NOW() - INTERVAL '3 months', '#3b82f6', true, NOW(), NOW());

-- Create services
INSERT INTO "Service" (id, "workspaceId", name, description, type, "basePrice", "estimatedMinutes", "pricingModel", "isActive", "createdAt", "updatedAt")
VALUES
('serv001', 'ws001', 'Standard Cleaning', 'Regular house cleaning service', 'STANDARD', 120.00, 120, 'FLAT', true, NOW(), NOW()),
('serv002', 'ws001', 'Deep Cleaning', 'Thorough deep cleaning service', 'DEEP', 250.00, 240, 'FLAT', true, NOW(), NOW()),
('serv003', 'ws001', 'Move-out Cleaning', 'Complete move-out cleaning', 'MOVE_OUT', 350.00, 300, 'FLAT', true, NOW(), NOW());

-- Create bookings (tomorrow and day after)
INSERT INTO "Booking" (id, "workspaceId", "customerId", "addressId", "serviceId", "scheduledDate", "scheduledTime", "durationMinutes", status, subtotal, tax, total, "createdAt", "updatedAt")
VALUES
('book001', 'ws001', 'cust001', 'addr001', 'serv001', CURRENT_DATE + INTERVAL '1 day', '09:00', 120, 'CONFIRMED', 120.00, 9.60, 129.60, NOW(), NOW()),
('book002', 'ws001', 'cust002', 'addr002', 'serv002', CURRENT_DATE + INTERVAL '2 days', '14:00', 240, 'CONFIRMED', 250.00, 20.00, 270.00, NOW(), NOW());

-- Create cleaner assignments
INSERT INTO "CleanerAssignment" (id, "bookingId", "cleanerId", "createdAt", "updatedAt")
VALUES
('assign001', 'book001', 'clean001', NOW(), NOW()),
('assign002', 'book002', 'clean002', NOW(), NOW());

-- Verify data was inserted
SELECT
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Customer") as customers,
  (SELECT COUNT(*) FROM "Cleaner") as cleaners,
  (SELECT COUNT(*) FROM "Service") as services,
  (SELECT COUNT(*) FROM "Booking") as bookings;
