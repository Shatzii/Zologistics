import { Request, Response, NextFunction } from "express";
import { apiSecurityService } from "./api-security-service";

// API Security Middleware
// Comprehensive security controls for enterprise APIs

export const securityMiddleware = {
  // Input validation middleware factory
  validateInput: (rules: any[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body) {
          req.body = apiSecurityService.sanitizeInput(req.body, rules);
        }
        if (req.query) {
          req.query = apiSecurityService.sanitizeInput(req.query, rules);
        }
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Input validation failed',
          message: error instanceof Error ? error.message : 'Invalid input'
        });
      }
    };
  },

  // Rate limiting middleware
  rateLimit: apiSecurityService.createTenantRateLimit(),

  // Strict rate limiting for sensitive operations
  strictRateLimit: apiSecurityService.createTenantRateLimit(60 * 1000, 10), // 10 per minute

  // Security headers middleware
  securityHeaders: apiSecurityService.createSecurityHeaders(),

  // Request size limiting
  requestSizeLimit: apiSecurityService.createRequestSizeLimit(),

  // Security logging
  securityLogger: apiSecurityService.createSecurityLogger(),

  // API key authentication
  apiKeyAuth: (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    if (!apiSecurityService.validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
  },

  // IP filtering
  ipFilter: (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    if (!apiSecurityService.isAllowedIP(clientIP as string)) {
      return res.status(403).json({ error: 'IP address not allowed' });
    }

    next();
  },

  // CSRF protection for state-changing operations
  csrfProtection: (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = (req as any).session?.csrfToken;

    if (!token || !sessionToken) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }

    if (!apiSecurityService.validateCsrfToken(token, sessionToken)) {
      return res.status(403).json({ error: 'CSRF token invalid' });
    }

    next();
  },

  // SQL injection detection
  sqlInjectionProtection: (req: Request, res: Response, next: NextFunction) => {
    const checkData = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    const dataString = JSON.stringify(checkData);

    if (!apiSecurityService.validateSqlInput(dataString)) {
      return res.status(400).json({
        error: 'Potential SQL injection detected',
        message: 'Request contains suspicious SQL patterns'
      });
    }

    next();
  },

  // XSS protection
  xssProtection: (req: Request, res: Response, next: NextFunction) => {
    const checkData = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    const dataString = JSON.stringify(checkData);

    if (!apiSecurityService.validateXssInput(dataString)) {
      return res.status(400).json({
        error: 'Potential XSS attack detected',
        message: 'Request contains suspicious XSS patterns'
      });
    }

    next();
  },

  // Request sanitization
  sanitizeRequest: (req: Request, res: Response, next: NextFunction) => {
    // Sanitize headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-client-ip'];
    suspiciousHeaders.forEach(header => {
      if (req.headers[header]) {
        delete req.headers[header];
      }
    });

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          (req.query as any)[key] = (req.query[key] as string).replace(/[<>'"&]/g, '');
        }
      });
    }

    next();
  },

  // CORS with security
  corsWithSecurity: (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Tenant-ID, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  },

  // Compression with security considerations
  compressionSafe: (req: Request, res: Response, next: NextFunction) => {
    // Only compress safe content types
    const contentType = res.getHeader('content-type') as string;

    if (contentType && (
      contentType.includes('text/') ||
      contentType.includes('application/json') ||
      contentType.includes('application/javascript')
    )) {
      // Enable compression
      res.setHeader('Content-Encoding', 'gzip');
    }

    next();
  },

  // Request timeout with security
  requestTimeout: (timeoutMs: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const timeout = setTimeout(() => {
        res.status(408).json({
          error: 'Request timeout',
          message: 'Request took too long to process'
        });
      }, timeoutMs);

      res.on('finish', () => {
        clearTimeout(timeout);
      });

      next();
    };
  },

  // Health check endpoint protection
  healthCheckProtection: (req: Request, res: Response, next: NextFunction) => {
    // Allow health checks from monitoring systems
    const userAgent = req.headers['user-agent'] || '';
    const allowedUserAgents = [
      'kube-probe',
      'Prometheus',
      'DataDog',
      'New Relic',
      'Pingdom'
    ];

    const isAllowed = allowedUserAgents.some(agent =>
      userAgent.includes(agent) ||
      req.ip === '127.0.0.1' ||
      req.ip === '::1'
    );

    if (!isAllowed && req.path === '/health') {
      return res.status(404).end();
    }

    next();
  }
};

// Input validation schemas using Zod
export const validationSchemas = {
  userRegistration: {
    field: 'body',
    rules: [
      { field: 'username', type: 'string' as const, required: true, minLength: 3, maxLength: 50, sanitize: true },
      { field: 'email', type: 'email' as const, required: true, sanitize: true },
      { field: 'password', type: 'string' as const, required: true, minLength: 8, maxLength: 128 },
      { field: 'firstName', type: 'string' as const, required: true, minLength: 1, maxLength: 50, sanitize: true },
      { field: 'lastName', type: 'string' as const, required: true, minLength: 1, maxLength: 50, sanitize: true }
    ]
  },

  loadCreation: {
    field: 'body',
    rules: [
      { field: 'origin', type: 'string' as const, required: true, minLength: 5, maxLength: 200, sanitize: true },
      { field: 'destination', type: 'string' as const, required: true, minLength: 5, maxLength: 200, sanitize: true },
      { field: 'weight', type: 'number' as const, required: true },
      { field: 'value', type: 'number' as const, required: false },
      { field: 'specialInstructions', type: 'string' as const, required: false, maxLength: 1000, sanitize: true }
    ]
  },

  driverUpdate: {
    field: 'body',
    rules: [
      { field: 'name', type: 'string' as const, required: true, minLength: 2, maxLength: 100, sanitize: true },
      { field: 'licenseNumber', type: 'string' as const, required: true, minLength: 5, maxLength: 20 },
      { field: 'phone', type: 'phone' as const, required: true },
      { field: 'email', type: 'email' as const, required: false, sanitize: true }
    ]
  },

  paymentProcessing: {
    field: 'body',
    rules: [
      { field: 'amount', type: 'number' as const, required: true },
      { field: 'currency', type: 'string' as const, required: true, pattern: /^[A-Z]{3}$/ },
      { field: 'cardNumber', type: 'credit_card' as const, required: true },
      { field: 'expiryMonth', type: 'number' as const, required: true },
      { field: 'expiryYear', type: 'number' as const, required: true },
      { field: 'cvv', type: 'string' as const, required: true, pattern: /^\d{3,4}$/ }
    ]
  }
};