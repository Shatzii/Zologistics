-- API Security Hardening Database Schema
-- Security configurations, threat detection, and audit enhancements

-- Security configuration table
CREATE TABLE IF NOT EXISTS security_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

-- Security events table for threat detection
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip INET NOT NULL,
  user_agent TEXT,
  user_id INTEGER,
  resource TEXT,
  details JSONB,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Rate limiting table for distributed rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  identifier TEXT NOT NULL, -- IP, user ID, API key, etc.
  limit_type TEXT NOT NULL, -- 'ip', 'user', 'api_key', 'endpoint'
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, identifier, limit_type, window_start)
);

-- API keys table for service authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT false
);

-- IP whitelist/blacklist table
CREATE TABLE IF NOT EXISTS ip_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  ip_address INET NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('whitelist', 'blacklist')),
  description TEXT,
  created_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Security policies table
CREATE TABLE IF NOT EXISTS security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL, -- 'rate_limit', 'ip_filter', 'content_filter', etc.
  rules JSONB NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default security configurations
INSERT INTO security_configs (config_key, config_value) VALUES
  ('rate_limiting', '{
    "enabled": true,
    "default_limit": 100,
    "default_window_ms": 900000,
    "strict_limit": 10,
    "strict_window_ms": 60000
  }'),
  ('input_validation', '{
    "enabled": true,
    "sanitize_html": true,
    "max_string_length": 10000,
    "max_array_length": 1000
  }'),
  ('cors', '{
    "enabled": true,
    "allowed_origins": ["*"],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowed_headers": ["Content-Type", "Authorization", "X-API-Key", "X-Tenant-ID"],
    "credentials": true
  }'),
  ('headers', '{
    "hsts": true,
    "csp": true,
    "x_frame_options": "DENY",
    "x_content_type_options": "nosniff",
    "referrer_policy": "strict-origin-when-cross-origin"
  }')
ON CONFLICT (tenant_id, config_key) WHERE tenant_id IS NULL DO NOTHING;

-- Insert default security policies
INSERT INTO security_policies (policy_name, policy_type, rules, priority) VALUES
  ('default_rate_limit', 'rate_limit', '{
    "requests_per_window": 100,
    "window_ms": 900000,
    "block_duration_ms": 3600000
  }', 0),
  ('strict_rate_limit', 'rate_limit', '{
    "requests_per_window": 10,
    "window_ms": 60000,
    "block_duration_ms": 3600000
  }', 100),
  ('sql_injection_protection', 'content_filter', '{
    "patterns": [
      "\\bUNION\\b.*\\bSELECT\\b",
      "\\bINSERT\\b.*\\bINTO\\b.*\\bSELECT\\b",
      "\\bUPDATE\\b.*\\bSET\\b.*=.*\\bSELECT\\b",
      "\\bDELETE\\b.*\\bFROM\\b.*\\bWHERE\\b.*=.*\\bSELECT\\b"
    ],
    "action": "block"
  }', 90),
  ('xss_protection', 'content_filter', '{
    "patterns": [
      "<script[^>]*>.*?</script>",
      "javascript:",
      "vbscript:",
      "on\\w+\\s*=",
      "<iframe[^>]*>.*?</iframe>",
      "<object[^>]*>.*?</object>"
    ],
    "action": "block"
  }', 90)
ON CONFLICT (tenant_id, policy_name) WHERE tenant_id IS NULL DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_rate_limits_tenant_id ON rate_limits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON rate_limits(window_end);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_ip_filters_tenant_id ON ip_filters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ip_filters_ip_address ON ip_filters(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_filters_filter_type ON ip_filters(filter_type);

CREATE INDEX IF NOT EXISTS idx_security_policies_tenant_id ON security_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_policy_type ON security_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_security_policies_active ON security_policies(active);

-- Enable Row-Level Security
ALTER TABLE security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY security_configs_tenant_policy ON security_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY security_events_tenant_policy ON security_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY rate_limits_tenant_policy ON rate_limits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY api_keys_tenant_policy ON api_keys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY ip_filters_tenant_policy ON ip_filters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY security_policies_tenant_policy ON security_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

-- Function to clean up expired rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_tenant_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_source_ip INET,
  p_user_agent TEXT DEFAULT NULL,
  p_user_id INTEGER DEFAULT NULL,
  p_resource TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_blocked BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO security_events (
    tenant_id, event_type, severity, source_ip, user_agent,
    user_id, resource, details, blocked
  ) VALUES (
    p_tenant_id, p_event_type, p_severity, p_source_ip, p_user_agent,
    p_user_id, p_resource, p_details, p_blocked
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_tenant_id UUID,
  p_identifier TEXT,
  p_limit_type TEXT,
  p_requests_per_window INTEGER,
  p_window_ms INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  window_start TIMESTAMP WITH TIME ZONE;
  current_count INTEGER;
BEGIN
  window_start := NOW() - INTERVAL '1 millisecond' * p_window_ms;

  -- Get current count
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM rate_limits
  WHERE tenant_id = p_tenant_id
    AND identifier = p_identifier
    AND limit_type = p_limit_type
    AND window_start >= window_start;

  -- Check if limit exceeded
  IF current_count >= p_requests_per_window THEN
    RETURN false;
  END IF;

  -- Update or insert rate limit record
  INSERT INTO rate_limits (
    tenant_id, identifier, limit_type, request_count, window_start, window_end
  ) VALUES (
    p_tenant_id, p_identifier, p_limit_type, 1, window_start, NOW() + INTERVAL '1 millisecond' * p_window_ms
  ) ON CONFLICT (tenant_id, identifier, limit_type, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;

  RETURN true;
END;
$$ LANGUAGE plpgsql;