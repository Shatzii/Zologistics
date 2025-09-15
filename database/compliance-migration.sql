-- Compliance Framework Database Schema
-- GDPR, CCPA, and Audit Logging Tables

-- Audit logs table for compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER,
  tenant_id UUID REFERENCES tenants(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  data_classification TEXT NOT NULL CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  ip_address INET NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  details JSONB
);

-- Consent records table for GDPR/CCPA compliance
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'analytics', 'data_processing', 'cookies')),
  consented BOOLEAN NOT NULL,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB
);

-- Data subject request tracking
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('gdpr_access', 'gdpr_rectification', 'gdpr_erasure', 'gdpr_portability', 'ccpa_access', 'ccpa_delete', 'ccpa_opt_out')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB,
  response_data JSONB
);

-- Encrypted data storage for sensitive information
CREATE TABLE IF NOT EXISTS encrypted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER,
  tenant_id UUID REFERENCES tenants(id),
  data_type TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  encryption_required BOOLEAN NOT NULL DEFAULT false,
  gdpr_category TEXT NOT NULL CHECK (gdpr_category IN ('personal', 'sensitive', 'non-personal')),
  auto_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default retention policies
INSERT INTO data_retention_policies (data_type, retention_period_days, encryption_required, gdpr_category, auto_delete) VALUES
  ('user_profile', 2555, true, 'personal', false), -- 7 years
  ('load_history', 2555, false, 'non-personal', false),
  ('communication_logs', 2555, true, 'personal', true),
  ('audit_logs', 3650, true, 'personal', false), -- 10 years
  ('consent_records', 3650, true, 'personal', false),
  ('payment_data', 2555, true, 'sensitive', true)
ON CONFLICT (data_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_date ON consent_records(consent_date);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_id ON data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);

CREATE INDEX IF NOT EXISTS idx_encrypted_data_user_id ON encrypted_data(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_tenant_id ON encrypted_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_expires_at ON encrypted_data(expires_at);

-- Enable Row-Level Security for compliance tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant data isolation
CREATE POLICY audit_logs_tenant_policy ON audit_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY consent_records_tenant_policy ON consent_records
  USING (user_id IN (
    SELECT tu.user_id FROM tenant_users tu
    WHERE tu.tenant_id = current_setting('app.tenant_id')::uuid
  ));

CREATE POLICY data_subject_requests_tenant_policy ON data_subject_requests
  USING (user_id IN (
    SELECT tu.user_id FROM tenant_users tu
    WHERE tu.tenant_id = current_setting('app.tenant_id')::uuid
  ));

CREATE POLICY encrypted_data_tenant_policy ON encrypted_data
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Create views for compliance reporting
CREATE OR REPLACE VIEW compliance_dashboard AS
SELECT
  DATE_TRUNC('month', al.timestamp) as month,
  COUNT(*) as total_events,
  COUNT(CASE WHEN al.data_classification = 'restricted' THEN 1 END) as restricted_events,
  COUNT(CASE WHEN al.action LIKE 'gdpr_%' THEN 1 END) as gdpr_events,
  COUNT(CASE WHEN al.action LIKE 'ccpa_%' THEN 1 END) as ccpa_events
FROM audit_logs al
WHERE al.timestamp >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', al.timestamp)
ORDER BY month DESC;

-- Function to automatically delete expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired encrypted data
  DELETE FROM encrypted_data
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  -- Delete old audit logs based on retention policy
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '10 years';

  -- Delete old consent records based on retention policy
  DELETE FROM consent_records
  WHERE consent_date < NOW() - INTERVAL '10 years';

  -- Log the cleanup operation
  INSERT INTO audit_logs (action, resource, data_classification, ip_address, user_agent, details)
  VALUES ('data_cleanup', 'system', 'internal', '127.0.0.1', 'system', jsonb_build_object('cleanup_type', 'automated'));
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (would be handled by pg_cron in production)
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');