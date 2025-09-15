-- Observability & Monitoring Database Schema
-- Metrics, logs, health checks, and performance monitoring

-- Metrics table for storing time-series data
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  labels JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Logs table for structured logging
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  service TEXT NOT NULL,
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  user_id INTEGER,
  request_id TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Health checks table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time INTEGER, -- in milliseconds
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  metric_type TEXT NOT NULL, -- 'response_time', 'throughput', 'memory', 'cpu', etc.
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'ms', 'req/s', 'MB', '%', etc.
  labels JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  alert_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  condition TEXT NOT NULL, -- JavaScript expression to evaluate
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  details JSONB
);

-- Service dependencies table
CREATE TABLE IF NOT EXISTS service_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  dependency_name TEXT NOT NULL,
  dependency_type TEXT NOT NULL, -- 'database', 'api', 'cache', 'queue', etc.
  endpoint TEXT,
  health_check_url TEXT,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  retry_count INTEGER NOT NULL DEFAULT 3,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(service_name, dependency_name)
);

-- Monitoring configurations table
CREATE TABLE IF NOT EXISTS monitoring_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

-- Insert default monitoring configurations
INSERT INTO monitoring_configs (config_key, config_value) VALUES
  ('health_check_interval', '{"enabled": true, "interval_seconds": 30}'),
  ('metrics_retention', '{"enabled": true, "retention_days": 90}'),
  ('log_retention', '{"enabled": true, "retention_days": 30}'),
  ('alerting', '{
    "enabled": true,
    "email_notifications": true,
    "webhook_notifications": false,
    "slack_notifications": false
  }'),
  ('performance_monitoring', '{
    "enabled": true,
    "response_time_threshold_ms": 1000,
    "memory_threshold_percent": 85,
    "cpu_threshold_percent": 80,
    "error_rate_threshold_percent": 5
  }')
ON CONFLICT (tenant_id, config_key) WHERE tenant_id IS NULL DO NOTHING;

-- Insert default alerts
INSERT INTO alerts (alert_name, severity, condition, message) VALUES
  ('High Response Time', 'medium', 'metrics.response_time > 1000', 'API response time is above 1000ms'),
  ('High Memory Usage', 'high', 'metrics.memory_usage > 85', 'Memory usage is above 85%'),
  ('High CPU Usage', 'high', 'metrics.cpu_usage > 80', 'CPU usage is above 80%'),
  ('High Error Rate', 'critical', 'metrics.error_rate > 5', 'Error rate is above 5%'),
  ('Service Down', 'critical', 'health_checks.status === "unhealthy"', 'Critical service is down'),
  ('Database Connection Issues', 'high', 'health_checks.database_connections < 5', 'Database connection pool is low')
ON CONFLICT (tenant_id, alert_name) WHERE tenant_id IS NULL DO NOTHING;

-- Insert default service dependencies
INSERT INTO service_dependencies (service_name, dependency_name, dependency_type, endpoint, health_check_url) VALUES
  ('api-gateway', 'postgresql', 'database', 'postgresql://localhost:5432/truckflow_db', 'postgresql://localhost:5432/truckflow_db'),
  ('api-gateway', 'redis', 'cache', 'redis://localhost:6379', 'redis://localhost:6379'),
  ('api-gateway', 'rabbitmq', 'queue', 'amqp://localhost:5672', 'amqp://localhost:5672'),
  ('load-balancer', 'api-gateway', 'api', 'http://localhost:5000', 'http://localhost:5000/health'),
  ('web-app', 'api-gateway', 'api', 'http://localhost:5000', 'http://localhost:5000/health')
ON CONFLICT (service_name, dependency_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_id ON metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_logs_tenant_id ON logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_service ON logs(service);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_health_checks_service_name ON health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_component ON health_checks(component);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant_id ON performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant_id ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_tenant_id ON alert_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_at ON alert_history(triggered_at);

-- Enable Row-Level Security
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY metrics_tenant_policy ON metrics
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY logs_tenant_policy ON logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY health_checks_policy ON health_checks
  USING (true); -- Health checks are typically public

CREATE POLICY performance_metrics_tenant_policy ON performance_metrics
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY alerts_tenant_policy ON alerts
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY alert_history_tenant_policy ON alert_history
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY monitoring_configs_tenant_policy ON monitoring_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

-- Function to record metrics
CREATE OR REPLACE FUNCTION record_metric(
  p_tenant_id UUID,
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_labels JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO metrics (tenant_id, metric_name, metric_value, labels)
  VALUES (p_tenant_id, p_metric_name, p_metric_value, p_labels)
  RETURNING id INTO metric_id;

  RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log structured events
CREATE OR REPLACE FUNCTION log_event(
  p_tenant_id UUID,
  p_level TEXT,
  p_service TEXT,
  p_component TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_user_id INTEGER DEFAULT NULL,
  p_request_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO logs (
    tenant_id, level, service, component, message, data,
    user_id, request_id, ip_address, user_agent
  ) VALUES (
    p_tenant_id, p_level, p_service, p_component, p_message, p_data,
    p_user_id, p_request_id, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record health check
CREATE OR REPLACE FUNCTION record_health_check(
  p_service_name TEXT,
  p_component TEXT,
  p_status TEXT,
  p_response_time INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  health_id UUID;
BEGIN
  INSERT INTO health_checks (service_name, component, status, response_time, details)
  VALUES (p_service_name, p_component, p_status, p_response_time, p_details)
  RETURNING id INTO health_id;

  RETURN health_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get overall system health
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE (
  service_name TEXT,
  component TEXT,
  status TEXT,
  response_time INTEGER,
  last_checked TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hc.service_name,
    hc.component,
    hc.status,
    hc.response_time,
    hc.checked_at as last_checked
  FROM health_checks hc
  WHERE hc.checked_at >= NOW() - INTERVAL '5 minutes'
  ORDER BY hc.service_name, hc.component;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Delete old metrics (keep 90 days)
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Delete old logs (keep 30 days)
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';

  -- Delete old health checks (keep 7 days)
  DELETE FROM health_checks WHERE checked_at < NOW() - INTERVAL '7 days';

  -- Delete old performance metrics (keep 90 days)
  DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Delete old alert history (keep 90 days)
  DELETE FROM alert_history WHERE triggered_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create views for monitoring dashboards
CREATE OR REPLACE VIEW system_health_summary AS
SELECT
  service_name,
  COUNT(*) as total_checks,
  COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_checks,
  COUNT(CASE WHEN status = 'degraded' THEN 1 END) as degraded_checks,
  COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_checks,
  AVG(response_time) as avg_response_time,
  MAX(checked_at) as last_check
FROM health_checks
WHERE checked_at >= NOW() - INTERVAL '1 hour'
GROUP BY service_name;

CREATE OR REPLACE VIEW recent_alerts AS
SELECT
  a.alert_name,
  a.severity,
  ah.triggered_at,
  ah.resolved_at,
  ah.details
FROM alerts a
LEFT JOIN alert_history ah ON a.id = ah.alert_id
WHERE ah.triggered_at >= NOW() - INTERVAL '24 hours'
ORDER BY ah.triggered_at DESC;

CREATE OR REPLACE VIEW performance_summary AS
SELECT
  metric_type,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as sample_count,
  DATE_TRUNC('hour', timestamp) as hour
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY metric_type, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC, metric_type;