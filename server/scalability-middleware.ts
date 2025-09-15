import { Request, Response, NextFunction } from "express";
import { scalabilityService } from "./scalability-service";

// Scalability & Performance Middleware
// Caching, job queuing, and performance optimization

export const scalabilityMiddleware = {
  // Response caching middleware
  cache: (ttl: number = 300, tags: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `response:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

      try {
        const cachedResponse = await scalabilityService.get(cacheKey);
        if (cachedResponse) {
          // Return cached response
          res.setHeader('X-Cache-Status', 'HIT');
          return res.json(cachedResponse);
        }

        // Cache the response
        const originalJson = res.json;
        res.json = function(data) {
          // Store in cache
          scalabilityService.set(cacheKey, data, ttl, tags);
          res.setHeader('X-Cache-Status', 'MISS');
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        // Continue without caching on error
        next();
      }
    };
  },

  // Job queuing middleware for heavy operations
  queueJob: (jobType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // For heavy operations, queue them and return immediately
        const jobId = await scalabilityService.enqueueJob({
          type: jobType,
          data: {
            ...req.body,
            ...req.query,
            originalUrl: req.originalUrl
          },
          tenantId: (req as any).tenant?.id,
          userId: (req as any).user?.id
        });

        // Return job ID immediately
        res.json({
          success: true,
          jobId,
          message: 'Operation queued for processing',
          status: 'processing'
        });
      } catch (error) {
        next(error);
      }
    };
  },

  // Rate limiting with burst handling
  adaptiveRateLimit: (baseLimit: number = 100, windowMs: number = 60000) => {
    const requests = new Map<string, { count: number; resetTime: number; burstTokens: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      const key = `${(req as any).tenant?.id || 'default'}:${req.ip}`;
      const now = Date.now();

      let userRequests = requests.get(key);
      if (!userRequests || userRequests.resetTime < now) {
        userRequests = {
          count: 0,
          resetTime: now + windowMs,
          burstTokens: baseLimit * 2 // Allow burst up to 2x base limit
        };
        requests.set(key, userRequests);
      }

      // Check if user has tokens
      if (userRequests.count >= baseLimit && userRequests.burstTokens <= 0) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
        });
      }

      // Consume tokens
      if (userRequests.count < baseLimit) {
        userRequests.count++;
      } else {
        userRequests.burstTokens--;
      }

      // Set headers
      res.setHeader('X-RateLimit-Limit', baseLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, baseLimit - userRequests.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(userRequests.resetTime / 1000));

      next();
    };
  },

  // Database connection pooling middleware
  connectionPool: (req: Request, res: Response, next: NextFunction) => {
    // This would integrate with your database connection pool
    // For now, just track connection usage
    res.on('finish', async () => {
      try {
        const poolStats = await scalabilityService.getConnectionPoolStats();
        if (poolStats.activeConnections > 15) { // 75% of max
          console.warn('High database connection usage detected');
        }
      } catch (error) {
        console.error('Failed to check connection pool stats:', error);
      }
    });

    next();
  },

  // Performance monitoring middleware
  performanceMonitor: (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    res.on('finish', async () => {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      // Record performance metrics
      await scalabilityService.recordPerformanceMetric('request_duration', duration, {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode.toString()
      });

      if (memoryDelta > 0) {
        await scalabilityService.recordPerformanceMetric('memory_delta', memoryDelta, {
          method: req.method,
          path: req.originalUrl.split('?')[0]
        });
      }

      // Log slow requests
      if (duration > 1000) { // Over 1 second
        console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
      }
    });

    next();
  },

  // Auto-scaling trigger middleware
  autoScaling: (req: Request, res: Response, next: NextFunction) => {
    // Check scaling conditions periodically
    if (Math.random() < 0.01) { // Check ~1% of requests
      scalabilityService.getPerformanceMetrics().then(metrics => {
        scalabilityService.scaleResources(metrics).then(scalingDecision => {
          if (scalingDecision.shouldScale) {
            console.log(`Auto-scaling triggered: ${scalingDecision.direction} - ${scalingDecision.reason}`);
            // In production, this would trigger actual scaling
          }
        }).catch(error => {
          console.error('Auto-scaling check failed:', error);
        });
      }).catch(error => {
        console.error('Performance metrics check failed:', error);
      });
    }

    next();
  },

  // Compression middleware for responses
  compression: (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Only compress large responses
      if (typeof data === 'string' && data.length > 1024) {
        res.setHeader('Content-Encoding', 'gzip');
        // In production, you'd use a proper compression library
      }

      return originalSend.call(this, data);
    };

    next();
  },

  // Circuit breaker for external services
  circuitBreaker: (serviceName: string, failureThreshold: number = 5, timeoutMs: number = 10000) => {
    const state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed' as 'closed' | 'open' | 'half-open'
    };

    return (req: Request, res: Response, next: NextFunction) => {
      if (state.state === 'open') {
        const now = Date.now();
        if (now - state.lastFailureTime > timeoutMs) {
          state.state = 'half-open';
        } else {
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            service: serviceName
          });
        }
      }

      // Add error tracking to response
      const originalJson = res.json;
      res.json = function(data) {
        if (res.statusCode >= 500) {
          state.failures++;
          state.lastFailureTime = Date.now();

          if (state.failures >= failureThreshold) {
            state.state = 'open';
            console.warn(`Circuit breaker opened for ${serviceName}`);
          }
        } else if (state.state === 'half-open') {
          state.failures = 0;
          state.state = 'closed';
          console.log(`Circuit breaker closed for ${serviceName}`);
        }

        return originalJson.call(this, data);
      };

      next();
    };
  },

  // Load balancer health check
  healthCheck: (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health' || req.path === '/lb-health') {
      // Quick health check for load balancers
      res.setHeader('Cache-Control', 'no-cache');
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
      return;
    }

    next();
  },

  // Graceful shutdown handling
  gracefulShutdown: (req: Request, res: Response, next: NextFunction) => {
    // Check if server is shutting down
    if (global.shuttingDown) {
      res.setHeader('Connection', 'close');
      return res.status(503).json({
        error: 'Server is shutting down',
        retryAfter: 30
      });
    }

    next();
  }
};

// Extend global object for graceful shutdown
declare global {
  var shuttingDown: boolean;
}

// Scalability & Performance Middleware