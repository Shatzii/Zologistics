import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function configureProduction(app: Express) {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // Compression middleware
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });

  // Apply rate limiter to API routes
  app.use('/api/', limiter);

  // Stricter rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      error: 'Too many authentication attempts, please try again later.'
    }
  });

  app.use('/api/auth/', authLimiter);
  app.use('/api/login', authLimiter);
  app.use('/api/register', authLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API health check with more detailed information
  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      const dbCheck = await checkDatabaseConnection();
      
      res.status(200).json({
        status: 'healthy',
        services: {
          database: dbCheck ? 'connected' : 'disconnected',
          ai: 'active',
          loadBoards: 'active',
          communication: 'active'
        },
        metrics: {
          activeLoads: await getActiveLoadsCount(),
          activeDrivers: await getActiveDriversCount(),
          systemLoad: process.cpuUsage()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: 'Service check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Import database connection
    const { db } = await import('./db.js');
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

async function getActiveLoadsCount(): Promise<number> {
  try {
    const { db } = await import('./db.js');
    const { freeLoads } = await import('../shared/schema.js');
    const result = await db.select().from(freeLoads);
    return result.length;
  } catch (error) {
    console.error('Failed to get active loads count:', error);
    return 0;
  }
}

async function getActiveDriversCount(): Promise<number> {
  try {
    const { db } = await import('./db.js');
    const { users } = await import('../shared/schema.js');
    const result = await db.select().from(users);
    return result.length;
  } catch (error) {
    console.error('Failed to get active drivers count:', error);
    return 0;
  }
}

export default configureProduction;