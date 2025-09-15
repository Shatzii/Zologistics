import { Request, Response } from "express";

// Observability Service for Enterprise Monitoring
// Structured logging, metrics collection, and health monitoring

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  service: string;
  component: string;
  message: string;
  userId?: number;
  tenantId?: string;
  requestId?: string;
  correlationId?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

export interface Metric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: Record<string, string>;
  timestamp: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  duration: number;
  details?: Record<string, any>;
  dependencies?: HealthCheck[];
}

export class ObservabilityService {
  private static instance: ObservabilityService;
  private metrics: Map<string, Metric[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  constructor() {
    // Initialize default metrics
    this.initializeDefaultMetrics();
  }

  static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  // Structured Logging
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }

    // Console output for development
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(logLevel);
    const entryLevelIndex = levels.indexOf(entry.level);

    if (entryLevelIndex >= currentLevelIndex) {
      console.log(`[${entry.level.toUpperCase()}] ${entry.service}:${entry.component} - ${entry.message}`, {
        ...entry,
        timestamp: logEntry.timestamp
      });
    }

    // TODO: Send to external logging service (DataDog, CloudWatch, etc.)
    // this.sendToExternalLogger(logEntry);
  }

  // Request logging middleware
  createRequestLogger() {
    return (req: Request, res: Response, next: any) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Add request ID to request object
      (req as any).requestId = requestId;

      // Log request start
      this.log({
        level: 'info',
        service: 'api',
        component: 'request',
        message: `Request started: ${req.method} ${req.url}`,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        userId: (req as any).user?.id,
        tenantId: (req as any).tenant?.id,
        metadata: {
          headers: this.sanitizeHeaders(req.headers),
          query: req.query
        }
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - startTime;

        this.log({
          level: res.statusCode >= 400 ? 'warn' : 'info',
          service: 'api',
          component: 'response',
          message: `Request completed: ${req.method} ${req.url} - ${res.statusCode}`,
          requestId,
          duration,
          statusCode: res.statusCode,
          method: req.method,
          url: req.url,
          userId: (req as any).user?.id,
          tenantId: (req as any).tenant?.id
        });

        // Record metrics
        this.recordMetric('http_requests_total', 1, {
          method: req.method,
          status: res.statusCode.toString(),
          path: this.getPathPattern(req.url)
        });

        this.recordMetric('http_request_duration_seconds', duration / 1000, {
          method: req.method,
          status: res.statusCode.toString(),
          path: this.getPathPattern(req.url)
        });
      });

      next();
    };
  }

  // Error logging
  logError(error: Error, context?: Record<string, any>): void {
    this.log({
      level: 'error',
      service: 'api',
      component: 'error',
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      },
      metadata: context
    });
  }

  // Metrics Collection
  recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric: Metric = {
      name,
      value,
      type: this.getMetricType(name),
      labels,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    // Keep only recent metrics (last 1000 per metric)
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 1000) {
      this.metrics.set(name, metrics.slice(-1000));
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Helper methods for dashboard calculations
  private calculateErrorRate(metrics: Record<string, Metric[]>): number {
    const totalRequests = this.getMetricValue('http_requests_total') || 0;
    const errorRequests = this.getMetricValue('http_requests_total', { status: '500' }) || 0;

    return totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
  }

  private getActiveAlerts(metrics: Record<string, Metric[]>): any[] {
    const alerts = [];

    // Check for high error rates
    const errorRate = this.calculateErrorRate(metrics);
    if (errorRate > 5) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `Error rate is ${errorRate.toFixed(2)}%`,
        value: errorRate
      });
    }

    // Check for high memory usage
    const memoryUsage = this.getMetricValue('memory_usage_bytes', { type: 'heap_used' }) || 0;
    const memoryThreshold = 500 * 1024 * 1024; // 500MB
    if (memoryUsage > memoryThreshold) {
      alerts.push({
        type: 'memory_usage',
        severity: 'medium',
        message: `Memory usage is ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        value: memoryUsage
      });
    }

    // Check for slow response times
    const avgResponseTime = this.getMetricValue('http_request_duration_seconds') || 0;
    if (avgResponseTime > 2) {
      alerts.push({
        type: 'response_time',
        severity: 'medium',
        message: `Average response time is ${avgResponseTime.toFixed(2)}s`,
        value: avgResponseTime
      });
    }

    return alerts;
  }

  getMetricValue(name: string, labels: Record<string, string> = {}): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics) return null;

    // Find most recent metric with matching labels
    for (let i = metrics.length - 1; i >= 0; i--) {
      const metric = metrics[i];
      if (this.labelsMatch(metric.labels, labels)) {
        return metric.value;
      }
    }

    return null;
  }

  // Health Checks
  registerHealthCheck(name: string, checkFunction: () => Promise<HealthCheck>): void {
    // This would be called periodically
    setInterval(async () => {
      try {
        const healthCheck = await checkFunction();
        this.healthChecks.set(name, healthCheck);
      } catch (error) {
        this.logError(error as Error, { healthCheck: name });
      }
    }, 30000); // Check every 30 seconds
  }

  getHealthStatus(): Record<string, HealthCheck> {
    return Object.fromEntries(this.healthChecks);
  }

  getOverallHealth(): HealthCheck {
    const checks = Array.from(this.healthChecks.values());
    const unhealthy = checks.filter(c => c.status === 'unhealthy');
    const degraded = checks.filter(c => c.status === 'degraded');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthy.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degraded.length > 0) {
      overallStatus = 'degraded';
    }

    return {
      service: 'zologistics',
      status: overallStatus,
      timestamp: Date.now(),
      duration: 0,
      dependencies: checks
    };
  }

  // Performance Monitoring
  startTimer(name: string, labels: Record<string, string> = {}): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(`${name}_duration_seconds`, duration / 1000, labels);
    };
  }

  // Business Metrics
  recordBusinessMetric(name: string, value: number, metadata: Record<string, any> = {}): void {
    this.log({
      level: 'info',
      service: 'business',
      component: 'metrics',
      message: `Business metric: ${name} = ${value}`,
      metadata: { ...metadata, metricName: name, metricValue: value }
    });

    this.recordMetric(`business_${name}`, value, metadata);
  }

  // Alerting
  createAlert(condition: () => boolean, message: string, severity: 'info' | 'warning' | 'error'): void {
    setInterval(() => {
      if (condition()) {
        this.log({
          level: severity === 'error' ? 'error' : 'warn',
          service: 'monitoring',
          component: 'alerts',
          message,
          metadata: { alertCondition: true, severity }
        });
      }
    }, 60000); // Check every minute
  }

  // Tracing
  createSpan(name: string, parentSpan?: string): string {
    const spanId = this.generateRequestId();

    this.log({
      level: 'debug',
      service: 'tracing',
      component: 'span',
      message: `Span started: ${name}`,
      correlationId: parentSpan,
      metadata: { spanId, spanName: name, operation: 'start' }
    });

    return spanId;
  }

  endSpan(spanId: string, name: string): void {
    this.log({
      level: 'debug',
      service: 'tracing',
      component: 'span',
      message: `Span ended: ${name}`,
      correlationId: spanId,
      metadata: { spanId, spanName: name, operation: 'end' }
    });
  }

  // Private helper methods
  private initializeDefaultMetrics(): void {
    // HTTP metrics
    this.recordMetric('http_requests_total', 0, { method: 'GET', status: '200', path: '/health' });
    this.recordMetric('http_request_duration_seconds', 0, { method: 'GET', status: '200', path: '/health' });

    // Business metrics
    this.recordMetric('loads_created_total', 0);
    this.recordMetric('loads_assigned_total', 0);
    this.recordMetric('drivers_active_total', 0);

    // System metrics
    this.recordMetric('memory_usage_bytes', 0);
    this.recordMetric('cpu_usage_percent', 0);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private getPathPattern(url: string): string {
    // Convert dynamic paths to patterns
    return url
      .replace(/\d+/g, '{id}')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '{uuid}');
  }

  private getMetricType(name: string): 'counter' | 'gauge' | 'histogram' | 'summary' {
    if (name.includes('_total') || name.includes('_count')) {
      return 'counter';
    }
    if (name.includes('_duration') || name.includes('_size') || name.includes('_usage')) {
      return 'gauge';
    }
    return 'histogram';
  }

  private labelsMatch(metricLabels: Record<string, string>, queryLabels: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(queryLabels)) {
      if (metricLabels[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

export const observabilityService = ObservabilityService.getInstance();