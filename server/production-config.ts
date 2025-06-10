import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';

export const productionMiddleware = {
  // API Rate Limiting
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limiting for sensitive endpoints
  strictRateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Rate limit exceeded for sensitive operation.',
  }),

  // Security headers
  security: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // Response compression
  compression: compression({
    level: 6,
    threshold: 1024,
  }),
};

export const productionValidation = {
  validateApiKey: (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    next();
  },

  validateCompanyAccess: (req: any, res: any, next: any) => {
    const { companyId } = req.params;
    const userCompanyId = req.user?.companyId;
    
    if (companyId && userCompanyId && parseInt(companyId) !== userCompanyId) {
      return res.status(403).json({ error: 'Access denied to company data' });
    }
    next();
  },

  sanitizeInput: (req: any, res: any, next: any) => {
    // Basic input sanitization
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    next();
  },
};

function isValidApiKey(apiKey: string): boolean {
  // In production, validate against database or secure store
  return apiKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(apiKey);
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const monitoringConfig = {
  healthCheck: {
    database: async () => {
      try {
        // Check database connection
        const { db } = await import('./db');
        await db.execute('SELECT 1');
        return { status: 'healthy', timestamp: new Date() };
      } catch (error) {
        return { status: 'unhealthy', error: error.message, timestamp: new Date() };
      }
    },

    externalServices: async () => {
      const services = {
        openai: await checkOpenAI(),
        weather: await checkWeatherAPI(),
        maps: await checkMapsAPI(),
      };
      return services;
    },
  },

  metrics: {
    requestCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    peakMemoryUsage: 0,
  },
};

async function checkOpenAI(): Promise<{ status: string; latency?: number }> {
  try {
    const start = Date.now();
    // Simple API check without actual usage
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    const latency = Date.now() - start;
    return { status: response.ok ? 'healthy' : 'degraded', latency };
  } catch (error) {
    return { status: 'unhealthy' };
  }
}

async function checkWeatherAPI(): Promise<{ status: string }> {
  // Weather API health check implementation
  return { status: 'not_configured' };
}

async function checkMapsAPI(): Promise<{ status: string }> {
  // Maps API health check implementation
  return { status: 'not_configured' };
}