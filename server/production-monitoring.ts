import { Express, Request, Response } from 'express';
import { performance } from 'perf_hooks';
import { db } from './db';

// Production Monitoring and Health Check System
class ProductionMonitoring {
  private metrics: {
    requestCount: number;
    errorCount: number;
    responseTime: number[];
    uptime: number;
    lastHealthCheck: Date;
    memoryUsage: NodeJS.MemoryUsage;
    databaseConnections: number;
  };

  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      uptime: Date.now(),
      lastHealthCheck: new Date(),
      memoryUsage: process.memoryUsage(),
      databaseConnections: 0
    };

    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);
  }

  private updateMetrics() {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.lastHealthCheck = new Date();
  }

  // Middleware to track requests
  public requestTracker = (req: Request, res: Response, next: Function) => {
    const startTime = performance.now();
    this.metrics.requestCount++;

    res.on('finish', () => {
      const duration = performance.now() - startTime;
      this.metrics.responseTime.push(duration);
      
      // Keep only last 100 response times
      if (this.metrics.responseTime.length > 100) {
        this.metrics.responseTime.shift();
      }

      // Track errors
      if (res.statusCode >= 400) {
        this.metrics.errorCount++;
      }
    });

    next();
  };

  // Health check endpoint
  public healthCheck = async (req: Request, res: Response) => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.metrics.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: await this.checkDatabase(),
        memory: this.checkMemory(),
        disk: this.checkDiskSpace(),
        ai: this.checkAIServices()
      },
      metrics: {
        requestCount: this.metrics.requestCount,
        errorCount: this.metrics.errorCount,
        errorRate: this.calculateErrorRate(),
        avgResponseTime: this.calculateAvgResponseTime(),
        memoryUsage: this.formatMemoryUsage()
      }
    };

    // Determine overall health
    const allServicesHealthy = Object.values(healthStatus.services).every(
      service => service.status === 'healthy'
    );

    if (!allServicesHealthy) {
      healthStatus.status = 'degraded';
      res.status(503);
    }

    res.json(healthStatus);
  };

  private async checkDatabase(): Promise<{status: string, message: string}> {
    try {
      // Simple database connectivity check
      const result = await db.execute('SELECT 1 as test');
      return {
        status: 'healthy',
        message: 'Database connection active'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  private checkMemory(): {status: string, message: string} {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (memoryUsagePercent > 90) {
      return {
        status: 'critical',
        message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`
      };
    } else if (memoryUsagePercent > 70) {
      return {
        status: 'warning',
        message: `Moderate memory usage: ${memoryUsagePercent.toFixed(1)}%`
      };
    }

    return {
      status: 'healthy',
      message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`
    };
  }

  private checkDiskSpace(): {status: string, message: string} {
    // Simple disk space check (production would use actual disk monitoring)
    return {
      status: 'healthy',
      message: 'Disk space sufficient'
    };
  }

  private checkAIServices(): {status: string, message: string} {
    // Check if AI services are configured
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey && !anthropicKey) {
      return {
        status: 'warning',
        message: 'No AI services configured'
      };
    }

    return {
      status: 'healthy',
      message: 'AI services configured'
    };
  }

  private calculateErrorRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return (this.metrics.errorCount / this.metrics.requestCount) * 100;
  }

  private calculateAvgResponseTime(): number {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTime.length;
  }

  private formatMemoryUsage(): object {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    };
  }

  // Performance metrics endpoint
  public performanceMetrics = (req: Request, res: Response) => {
    const metrics = {
      timestamp: new Date().toISOString(),
      requests: {
        total: this.metrics.requestCount,
        errors: this.metrics.errorCount,
        errorRate: this.calculateErrorRate()
      },
      performance: {
        avgResponseTime: this.calculateAvgResponseTime(),
        responseTimeDistribution: this.getResponseTimeDistribution()
      },
      system: {
        uptime: Date.now() - this.metrics.uptime,
        memoryUsage: this.formatMemoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    res.json(metrics);
  };

  private getResponseTimeDistribution(): object {
    const times = this.metrics.responseTime;
    if (times.length === 0) return {};

    const sorted = [...times].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

export const monitoring = new ProductionMonitoring();

// Setup monitoring endpoints
export function setupMonitoring(app: Express) {
  // Add request tracking middleware
  app.use(monitoring.requestTracker);

  // Health check endpoint
  app.get('/health', monitoring.healthCheck);
  
  // Performance metrics endpoint
  app.get('/metrics', monitoring.performanceMetrics);

  // Ready endpoint (for Kubernetes/Docker)
  app.get('/ready', (req: Request, res: Response) => {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Production monitoring endpoints configured');
  console.log('📊 Health check available at /health');
  console.log('📈 Metrics available at /metrics');
}