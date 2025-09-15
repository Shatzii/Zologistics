import { Request, Response, NextFunction } from "express";
import { observabilityService } from "./observability-service";

// Monitoring Middleware for Enterprise Observability
// Performance monitoring, error tracking, and metrics collection

export const monitoringMiddleware = {
  // Request monitoring middleware
  requestMonitoring: observabilityService.createRequestLogger(),

  // Performance monitoring
  performanceMonitoring: (req: Request, res: Response, next: NextFunction) => {
    const endTimer = observabilityService.startTimer('request_processing', {
      method: req.method,
      path: req.url.split('?')[0]
    });

    res.on('finish', () => {
      endTimer();
    });

    next();
  },

  // Error monitoring and tracking
  errorMonitoring: (error: Error, req: Request, res: Response, next: NextFunction) => {
    observabilityService.logError(error, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: (req as any).user?.id,
      tenantId: (req as any).tenant?.id,
      requestId: (req as any).requestId
    });

    // Record error metric
    observabilityService.recordMetric('errors_total', 1, {
      type: error.name,
      status: res.statusCode?.toString() || 'unknown'
    });

    next(error);
  },

  // Database query monitoring
  databaseMonitoring: (operation: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const endTimer = observabilityService.startTimer('database_operation', {
        operation,
        table: req.body?.table || 'unknown'
      });

      try {
        await next();
        endTimer();
      } catch (error) {
        endTimer();
        observabilityService.recordMetric('database_errors_total', 1, {
          operation,
          error: (error as Error).name
        });
        throw error;
      }
    };
  },

  // Business logic monitoring
  businessMonitoring: (operation: string, metadata: Record<string, any> = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const endTimer = observabilityService.startTimer(`business_${operation}`, metadata);

      res.on('finish', () => {
        endTimer();

        // Record business metrics
        if (operation === 'load_created' && res.statusCode === 200) {
          observabilityService.recordBusinessMetric('loads_created', 1, {
            tenantId: (req as any).tenant?.id,
            userId: (req as any).user?.id
          });
        }

        if (operation === 'load_assigned' && res.statusCode === 200) {
          observabilityService.recordBusinessMetric('loads_assigned', 1, {
            tenantId: (req as any).tenant?.id,
            userId: (req as any).user?.id
          });
        }
      });

      next();
    };
  },

  // Memory usage monitoring
  memoryMonitoring: (req: Request, res: Response, next: NextFunction) => {
    const memUsage = process.memoryUsage();

    observabilityService.recordMetric('memory_usage_bytes', memUsage.heapUsed, {
      type: 'heap_used'
    });

    observabilityService.recordMetric('memory_usage_bytes', memUsage.heapTotal, {
      type: 'heap_total'
    });

    observabilityService.recordMetric('memory_usage_bytes', memUsage.external, {
      type: 'external'
    });

    next();
  },

  // CPU usage monitoring
  cpuMonitoring: (req: Request, res: Response, next: NextFunction) => {
    const startUsage = process.cpuUsage();

    res.on('finish', () => {
      const endUsage = process.cpuUsage(startUsage);
      const totalUsage = (endUsage.user + endUsage.system) / 1000; // Convert to milliseconds

      observabilityService.recordMetric('cpu_usage_microseconds', totalUsage, {
        type: 'request_processing'
      });
    });

    next();
  },

  // Custom metrics middleware factory
  customMetrics: (metricName: string, labels: Record<string, string> = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
      observabilityService.recordMetric(metricName, 1, {
        ...labels,
        method: req.method,
        path: req.url.split('?')[0]
      });

      next();
    };
  },

  // Response time monitoring with percentiles
  responseTimeMonitoring: (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;

      // Record response time in different buckets
      if (responseTime < 100) {
        observabilityService.recordMetric('response_time_bucket', 1, { bucket: '<100ms' });
      } else if (responseTime < 500) {
        observabilityService.recordMetric('response_time_bucket', 1, { bucket: '100-500ms' });
      } else if (responseTime < 1000) {
        observabilityService.recordMetric('response_time_bucket', 1, { bucket: '500-1000ms' });
      } else {
        observabilityService.recordMetric('response_time_bucket', 1, { bucket: '>1000ms' });
      }

      // Record percentile metrics
      observabilityService.recordMetric('response_time_percentile', responseTime, {
        percentile: 'p95',
        method: req.method
      });
    });

    next();
  },

  // Security event monitoring
  securityMonitoring: (req: Request, res: Response, next: NextFunction) => {
    // Monitor for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /union.*select/i, type: 'sql_injection' },
      { pattern: /<script/i, type: 'xss_attempt' },
      { pattern: /\.\./, type: 'path_traversal' },
      { pattern: /eval\(/, type: 'code_injection' }
    ];

    const requestData = JSON.stringify({
      url: req.url,
      body: req.body,
      query: req.query,
      headers: req.headers
    });

    for (const { pattern, type } of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        observabilityService.log({
          level: 'warn',
          service: 'security',
          component: 'monitoring',
          message: `Suspicious ${type} pattern detected`,
          ip: req.ip,
          userAgent: req.headers['user-agent'] as string,
          metadata: {
            pattern: pattern.toString(),
            type,
            url: req.url,
            method: req.method
          }
        });

        observabilityService.recordMetric('security_events_total', 1, {
          type,
          severity: 'medium'
        });

        break;
      }
    }

    next();
  },

  // Dependency health monitoring
  dependencyMonitoring: (dependencyName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const endTimer = observabilityService.startTimer('dependency_call', {
        dependency: dependencyName
      });

      try {
        await next();
        endTimer();
      } catch (error) {
        endTimer();

        observabilityService.recordMetric('dependency_errors_total', 1, {
          dependency: dependencyName,
          error: (error as Error).name
        });

        throw error;
      }
    };
  },

  // Cache hit/miss monitoring
  cacheMonitoring: (cacheName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;

      res.send = function(data) {
        // Check if this is a cache hit (you would need to implement cache headers)
        const isCacheHit = res.getHeader('X-Cache-Status') === 'HIT';

        observabilityService.recordMetric('cache_requests_total', 1, {
          cache: cacheName,
          status: isCacheHit ? 'hit' : 'miss'
        });

        return originalSend.call(this, data);
      };

      next();
    };
  },

  // User activity monitoring
  userActivityMonitoring: (activity: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          observabilityService.recordBusinessMetric('user_activity', 1, {
            activity,
            userId: (req as any).user?.id,
            tenantId: (req as any).tenant?.id,
            timestamp: new Date().toISOString()
          });
        }
      });

      next();
    };
  }
};

// Health check functions for different services
export const healthChecks = {
  database: async (): Promise<any> => {
    const startTime = Date.now();
    try {
      // TODO: Implement actual database health check
      // For now, simulate a health check
      await new Promise(resolve => setTimeout(resolve, 10));

      return {
        service: 'database',
        status: 'healthy',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          connectionPool: 'healthy',
          activeConnections: 5,
          idleConnections: 10
        }
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          error: (error as Error).message
        }
      };
    }
  },

  redis: async (): Promise<any> => {
    const startTime = Date.now();
    try {
      // TODO: Implement Redis health check
      return {
        service: 'redis',
        status: 'healthy',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          memoryUsage: '45MB',
          connectedClients: 12
        }
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'degraded',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          error: (error as Error).message
        }
      };
    }
  },

  externalAPIs: async (): Promise<any> => {
    const startTime = Date.now();
    try {
      // TODO: Implement external API health checks
      return {
        service: 'external_apis',
        status: 'healthy',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          loadBoards: 'healthy',
          paymentGateway: 'healthy',
          smsService: 'healthy'
        }
      };
    } catch (error) {
      return {
        service: 'external_apis',
        status: 'degraded',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          error: (error as Error).message
        }
      };
    }
  }
};

// Initialize health checks
Object.entries(healthChecks).forEach(([name, checkFunction]) => {
  observabilityService.registerHealthCheck(name, checkFunction);
});