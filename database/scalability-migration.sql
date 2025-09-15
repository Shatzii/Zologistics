-- Scalability & Performance Database Schema
-- Job queues, caching, and performance optimization tables

-- Job queue table for background processing
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  job_type TEXT NOT NULL,
  job_data JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  result JSONB,
  worker_id TEXT,
  timeout_seconds INTEGER DEFAULT 3600, -- 1 hour default timeout
  scheduled_at TIMESTAMP WITH TIME ZONE, -- For delayed jobs
  expires_at TIMESTAMP WITH TIME ZONE -- For job expiration
);

-- Cache entries table for distributed caching
CREATE TABLE IF NOT EXISTS cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  cache_key TEXT NOT NULL,
  cache_value JSONB NOT NULL,
  ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 0,
  compressed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(tenant_id, cache_key)
);

-- Worker nodes table for distributed processing
CREATE TABLE IF NOT EXISTS worker_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT NOT NULL UNIQUE,
  hostname TEXT NOT NULL,
  ip_address INET NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  max_concurrent_jobs INTEGER NOT NULL DEFAULT 10,
  current_jobs INTEGER NOT NULL DEFAULT 0,
  total_jobs_processed INTEGER NOT NULL DEFAULT 0,
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Job history table for analytics and debugging
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_queue(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  worker_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Auto-scaling configuration table
CREATE TABLE IF NOT EXISTS scaling_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  service_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  threshold_operator TEXT NOT NULL CHECK (threshold_operator IN ('>', '<', '>=', '<=', '=')),
  scale_up_factor NUMERIC NOT NULL DEFAULT 1.5,
  scale_down_factor NUMERIC NOT NULL DEFAULT 0.7,
  min_instances INTEGER NOT NULL DEFAULT 1,
  max_instances INTEGER NOT NULL DEFAULT 10,
  cooldown_seconds INTEGER NOT NULL DEFAULT 300,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, service_name, metric_name)
);

-- Performance baselines table
CREATE TABLE IF NOT EXISTS performance_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  metric_name TEXT NOT NULL,
  baseline_value NUMERIC NOT NULL,
  standard_deviation NUMERIC NOT NULL,
  sample_size INTEGER NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(tenant_id, metric_name)
);

-- Insert default scaling configurations
INSERT INTO scaling_configs (service_name, metric_name, threshold_value, threshold_operator, min_instances, max_instances) VALUES
  ('api-gateway', 'cpu_usage', 80, '>', 2, 20),
  ('api-gateway', 'memory_usage', 85, '>', 2, 20),
  ('api-gateway', 'response_time', 1000, '>', 2, 20),
  ('job-worker', 'queue_length', 100, '>', 1, 10),
  ('cache-service', 'hit_rate', 80, '<', 1, 5)
ON CONFLICT (tenant_id, service_name, metric_name) WHERE tenant_id IS NULL DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_queue_tenant_id ON job_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON job_queue(priority);
CREATE INDEX IF NOT EXISTS idx_job_queue_created_at ON job_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled_at ON job_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_expires_at ON job_queue(expires_at);

CREATE INDEX IF NOT EXISTS idx_cache_entries_tenant_id ON cache_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cache_entries_key ON cache_entries(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_entries_tags ON cache_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_cache_entries_accessed_at ON cache_entries(accessed_at);
CREATE INDEX IF NOT EXISTS idx_cache_entries_ttl ON cache_entries(ttl_seconds);

CREATE INDEX IF NOT EXISTS idx_worker_nodes_status ON worker_nodes(status);
CREATE INDEX IF NOT EXISTS idx_worker_nodes_last_heartbeat ON worker_nodes(last_heartbeat);

CREATE INDEX IF NOT EXISTS idx_job_history_job_id ON job_history(job_id);
CREATE INDEX IF NOT EXISTS idx_job_history_tenant_id ON job_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_history_completed_at ON job_history(completed_at);

CREATE INDEX IF NOT EXISTS idx_scaling_configs_tenant_id ON scaling_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scaling_configs_service_name ON scaling_configs(service_name);
CREATE INDEX IF NOT EXISTS idx_scaling_configs_active ON scaling_configs(active);

CREATE INDEX IF NOT EXISTS idx_performance_baselines_tenant_id ON performance_baselines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_baselines_metric_name ON performance_baselines(metric_name);

-- Enable Row-Level Security
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scaling_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_baselines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY job_queue_tenant_policy ON job_queue
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY cache_entries_tenant_policy ON cache_entries
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY worker_nodes_policy ON worker_nodes
  USING (true); -- Worker nodes are typically managed globally

CREATE POLICY job_history_tenant_policy ON job_history
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY scaling_configs_tenant_policy ON scaling_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

CREATE POLICY performance_baselines_tenant_policy ON performance_baselines
  USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

-- Function to enqueue a job
CREATE OR REPLACE FUNCTION enqueue_job(
  p_tenant_id UUID,
  p_job_type TEXT,
  p_job_data JSONB,
  p_priority TEXT DEFAULT 'normal',
  p_max_retries INTEGER DEFAULT 3,
  p_timeout_seconds INTEGER DEFAULT 3600,
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO job_queue (
    tenant_id, job_type, job_data, priority, max_retries,
    timeout_seconds, scheduled_at
  ) VALUES (
    p_tenant_id, p_job_type, p_job_data, p_priority, p_max_retries,
    p_timeout_seconds, p_scheduled_at
  ) RETURNING id INTO job_id;

  RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get next pending job
CREATE OR REPLACE FUNCTION get_next_pending_job(p_worker_capabilities TEXT[])
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  job_data JSONB,
  priority TEXT,
  retry_count INTEGER,
  max_retries INTEGER,
  timeout_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  UPDATE job_queue
  SET
    status = 'processing',
    started_at = NOW(),
    worker_id = pg_backend_pid()::TEXT
  WHERE id = (
    SELECT jq.id
    FROM job_queue jq
    WHERE jq.status = 'pending'
      AND (jq.scheduled_at IS NULL OR jq.scheduled_at <= NOW())
      AND (jq.expires_at IS NULL OR jq.expires_at > NOW())
      AND jq.retry_count < jq.max_retries
    ORDER BY
      CASE jq.priority
        WHEN 'critical' THEN 4
        WHEN 'high' THEN 3
        WHEN 'normal' THEN 2
        WHEN 'low' THEN 1
        ELSE 0
      END DESC,
      jq.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    job_queue.id,
    job_queue.job_type,
    job_queue.job_data,
    job_queue.priority,
    job_queue.retry_count,
    job_queue.max_retries,
    job_queue.timeout_seconds;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a job
CREATE OR REPLACE FUNCTION complete_job(
  p_job_id UUID,
  p_result JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM job_queue WHERE id = p_job_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update job status
  UPDATE job_queue
  SET
    status = 'completed',
    completed_at = NOW(),
    result = p_result
  WHERE id = p_job_id;

  -- Record job history
  INSERT INTO job_history (
    job_id, tenant_id, job_type, status, duration_ms,
    retry_count, worker_id
  ) VALUES (
    p_job_id,
    job_record.tenant_id,
    job_record.job_type,
    'completed',
    EXTRACT(EPOCH FROM (NOW() - job_record.started_at)) * 1000,
    job_record.retry_count,
    job_record.worker_id
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to fail a job
CREATE OR REPLACE FUNCTION fail_job(
  p_job_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM job_queue WHERE id = p_job_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if job should be retried
  IF job_record.retry_count < job_record.max_retries THEN
    -- Retry the job
    UPDATE job_queue
    SET
      status = 'pending',
      retry_count = retry_count + 1,
      error_message = p_error_message,
      started_at = NULL,
      worker_id = NULL
    WHERE id = p_job_id;
  ELSE
    -- Mark as failed
    UPDATE job_queue
    SET
      status = 'failed',
      failed_at = NOW(),
      error_message = p_error_message
    WHERE id = p_job_id;

    -- Record job history
    INSERT INTO job_history (
      job_id, tenant_id, job_type, status, duration_ms,
      retry_count, error_message, worker_id
    ) VALUES (
      p_job_id,
      job_record.tenant_id,
      job_record.job_type,
      'failed',
      CASE WHEN job_record.started_at IS NOT NULL
           THEN EXTRACT(EPOCH FROM (NOW() - job_record.started_at)) * 1000
           ELSE NULL END,
      job_record.retry_count,
      p_error_message,
      job_record.worker_id
    );
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache entry
CREATE OR REPLACE FUNCTION get_cache_entry(
  p_tenant_id UUID,
  p_cache_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  cache_value JSONB;
BEGIN
  UPDATE cache_entries
  SET
    accessed_at = NOW(),
    access_count = access_count + 1
  WHERE tenant_id = p_tenant_id
    AND cache_key = p_cache_key
    AND (created_at + INTERVAL '1 second' * ttl_seconds) > NOW()
  RETURNING cache_value INTO cache_value;

  RETURN cache_value;
END;
$$ LANGUAGE plpgsql;

-- Function to set cache entry
CREATE OR REPLACE FUNCTION set_cache_entry(
  p_tenant_id UUID,
  p_cache_key TEXT,
  p_cache_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600,
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  cache_id UUID;
BEGIN
  INSERT INTO cache_entries (
    tenant_id, cache_key, cache_value, ttl_seconds, tags
  ) VALUES (
    p_tenant_id, p_cache_key, p_cache_value, p_ttl_seconds, p_tags
  )
  ON CONFLICT (tenant_id, cache_key)
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    ttl_seconds = EXCLUDED.ttl_seconds,
    tags = EXCLUDED.tags,
    created_at = NOW(),
    accessed_at = NOW(),
    access_count = 0
  RETURNING id INTO cache_id;

  RETURN cache_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache_entries
  WHERE (created_at + INTERVAL '1 second' * ttl_seconds) <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired jobs
CREATE OR REPLACE FUNCTION cleanup_expired_jobs()
RETURNS void AS $$
BEGIN
  -- Mark expired jobs as failed
  UPDATE job_queue
  SET
    status = 'failed',
    error_message = 'Job expired',
    failed_at = NOW()
  WHERE status IN ('pending', 'processing')
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  -- Delete old completed jobs (keep 30 days)
  DELETE FROM job_queue
  WHERE status IN ('completed', 'failed', 'cancelled')
    AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get job queue statistics
CREATE OR REPLACE FUNCTION get_job_queue_stats(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    jq.status,
    COUNT(*) as count
  FROM job_queue jq
  WHERE (p_tenant_id IS NULL OR jq.tenant_id = p_tenant_id)
  GROUP BY jq.status
  ORDER BY jq.status;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_stats(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_entries BIGINT,
  expired_entries BIGINT,
  hit_rate NUMERIC,
  avg_access_count NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_entries,
    COUNT(CASE WHEN (created_at + INTERVAL '1 second' * ttl_seconds) <= NOW() THEN 1 END) as expired_entries,
    CASE
      WHEN SUM(access_count) > 0 THEN (SUM(access_count)::NUMERIC / COUNT(*)) * 100
      ELSE 0
    END as hit_rate,
    AVG(access_count) as avg_access_count
  FROM cache_entries
  WHERE (p_tenant_id IS NULL OR tenant_id = p_tenant_id);
END;
$$ LANGUAGE plpgsql;

-- Create views for monitoring
CREATE OR REPLACE VIEW job_queue_summary AS
SELECT
  tenant_id,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) * 1000 as avg_duration_ms,
  MAX(created_at) as latest_job
FROM job_queue
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY tenant_id, status;

CREATE OR REPLACE VIEW cache_performance AS
SELECT
  tenant_id,
  COUNT(*) as total_entries,
  AVG(access_count) as avg_accesses,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds,
  COUNT(CASE WHEN access_count > 0 THEN 1 END)::NUMERIC / COUNT(*) * 100 as hit_percentage
FROM cache_entries
WHERE (created_at + INTERVAL '1 second' * ttl_seconds) > NOW()
GROUP BY tenant_id;

CREATE OR REPLACE VIEW worker_performance AS
SELECT
  worker_id,
  status,
  current_jobs,
  total_jobs_processed,
  EXTRACT(EPOCH FROM (NOW() - last_heartbeat)) as seconds_since_heartbeat,
  max_concurrent_jobs - current_jobs as available_slots
FROM worker_nodes
WHERE status = 'active';