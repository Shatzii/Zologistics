import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function configureProduction(app: Express) {
  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        workerSrc: ["'self'", "blob:"]
      }
    }
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

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });

  // Stricter rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });

  // AI processing rate limiting
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit AI calls to 30 per minute per IP
    message: 'AI processing rate limit exceeded, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });

  // Apply rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/dispatch/', aiLimiter);
  app.use('/api/rates/', aiLimiter);
  app.use('/api/optimization/', aiLimiter);

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

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    // Give existing requests time to complete
    setTimeout(() => {
      console.log('Graceful shutdown completed');
      process.exit(0);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    
    if (res.headersSent) {
      return next(err);
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
      error: isDevelopment ? err.message : 'Internal server error',
      stack: isDevelopment ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  console.log('Production configuration applied');
}

export function optimizeForRailway() {
  // Environment-specific optimizations
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || process.env.RAILWAY_STATIC_PORT || 3000;

  if (isProduction) {
    // Optimize garbage collection for Railway's memory limits
    process.env.NODE_OPTIONS = '--max-old-space-size=1024 --optimize-for-size';
    
    // Configure logging for Railway
    console.log('🚄 Railway optimization enabled');
    console.log(`📍 Port: ${port}`);
    console.log(`🔧 Node Environment: ${process.env.NODE_ENV}`);
    console.log(`💾 Memory limit: 1GB`);
  }

  return { port: parseInt(port.toString()) };
}