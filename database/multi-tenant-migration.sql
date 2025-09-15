-- Multi-tenant database schema migration
-- Run this to set up tenant tables and Row-Level Security

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  max_users INTEGER NOT NULL DEFAULT 10,
  max_loads INTEGER NOT NULL DEFAULT 100,
  features TEXT[] NOT NULL DEFAULT '{}',
  settings TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tenant_users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, user_id)
);

-- Add tenant_id columns to existing tables (if they don't exist)
DO $$
BEGIN
  -- Add tenant_id to users table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to loads table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loads' AND column_name = 'tenant_id') THEN
    ALTER TABLE loads ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to drivers table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'tenant_id') THEN
    ALTER TABLE drivers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to companies table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'tenant_id') THEN
    ALTER TABLE companies ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

-- Enable Row-Level Security on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant data isolation
-- Users can only see data from their tenant
CREATE POLICY tenant_users_policy ON users
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_loads_policy ON loads
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_drivers_policy ON drivers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_companies_policy ON companies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Allow users to insert/update their own tenant's data
CREATE POLICY tenant_users_insert ON users
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_loads_insert ON loads
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_drivers_insert ON drivers
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_companies_insert ON companies
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loads_tenant_id ON loads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_id ON drivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);

-- Create a default tenant for existing data (if needed)
INSERT INTO tenants (name, subscription_tier, max_users, max_loads)
VALUES ('Default Tenant', 'enterprise', 1000, 10000)
ON CONFLICT DO NOTHING;

-- Update existing users to belong to default tenant (if they don't have one)
UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE name = 'Default Tenant' LIMIT 1)
WHERE tenant_id IS NULL;

-- Update existing data to belong to default tenant
UPDATE loads SET tenant_id = (SELECT id FROM tenants WHERE name = 'Default Tenant' LIMIT 1)
WHERE tenant_id IS NULL;

UPDATE drivers SET tenant_id = (SELECT id FROM tenants WHERE name = 'Default Tenant' LIMIT 1)
WHERE tenant_id IS NULL;

UPDATE companies SET tenant_id = (SELECT id FROM tenants WHERE name = 'Default Tenant' LIMIT 1)
WHERE tenant_id IS NULL;