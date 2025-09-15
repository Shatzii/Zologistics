import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { complianceService } from "./compliance-service";

// API Security Hardening Service
// Comprehensive input validation, rate limiting, and security controls

export interface SecurityConfig {
  maxRequestSize: string;
  rateLimitWindow: number;
  rateLimitMax: number;
  enableCors: boolean;
  allowedOrigins: string[];
  enableHelmet: boolean;
  enableHsts: boolean;
  enableNoSniff: boolean;
  enableXFrameOptions: boolean;
  enableCsrfProtection: boolean;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'ssn' | 'credit_card' | 'address';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
}

export class APISecurityService {
  private static instance: APISecurityService;
  private securityConfig: SecurityConfig;

  constructor() {
    this.securityConfig = {
      maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      enableCors: true,
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
      enableHelmet: true,
      enableHsts: true,
      enableNoSniff: true,
      enableXFrameOptions: true,
      enableCsrfProtection: true
    };
  }

  static getInstance(): APISecurityService {
    if (!APISecurityService.instance) {
      APISecurityService.instance = new APISecurityService();
    }
    return APISecurityService.instance;
  }

  // Input Validation Methods
  createValidationMiddleware(schema: z.ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        next(error);
      }
    };
  }

  // Comprehensive input sanitization
  sanitizeInput(input: any, rules: ValidationRule[]): any {
    if (!input || typeof input !== 'object') {
      return input;
    }

    const sanitized = { ...input };

    for (const rule of rules) {
      if (sanitized[rule.field] !== undefined) {
        sanitized[rule.field] = this.sanitizeField(sanitized[rule.field], rule);
      } else if (rule.required) {
        throw new Error(`Required field '${rule.field}' is missing`);
      }
    }

    return sanitized;
  }

  private sanitizeField(value: any, rule: ValidationRule): any {
    if (value === null || value === undefined) {
      return rule.required ? null : value;
    }

    let sanitized = value;

    // Type validation and conversion
    switch (rule.type) {
      case 'string':
        sanitized = String(sanitized).trim();
        if (rule.minLength && sanitized.length < rule.minLength) {
          throw new Error(`Field '${rule.field}' must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && sanitized.length > rule.maxLength) {
          throw new Error(`Field '${rule.field}' must be at most ${rule.maxLength} characters`);
        }
        break;

      case 'number':
        sanitized = Number(sanitized);
        if (isNaN(sanitized)) {
          throw new Error(`Field '${rule.field}' must be a valid number`);
        }
        break;

      case 'email':
        sanitized = String(sanitized).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
          throw new Error(`Field '${rule.field}' must be a valid email address`);
        }
        break;

      case 'phone':
        sanitized = String(sanitized).replace(/\D/g, '');
        if (sanitized.length < 10 || sanitized.length > 15) {
          throw new Error(`Field '${rule.field}' must be a valid phone number`);
        }
        break;

      case 'ssn':
        sanitized = String(sanitized).replace(/\D/g, '');
        if (sanitized.length !== 9) {
          throw new Error(`Field '${rule.field}' must be a valid SSN`);
        }
        sanitized = `${sanitized.slice(0, 3)}-${sanitized.slice(3, 5)}-${sanitized.slice(5)}`;
        break;

      case 'credit_card':
        sanitized = String(sanitized).replace(/\D/g, '');
        if (sanitized.length < 13 || sanitized.length > 19) {
          throw new Error(`Field '${rule.field}' must be a valid credit card number`);
        }
        break;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(sanitized))) {
      throw new Error(`Field '${rule.field}' does not match required pattern`);
    }

    // Additional sanitization
    if (rule.sanitize) {
      sanitized = this.sanitizeString(String(sanitized));
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    // Remove potentially dangerous characters and scripts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/style\s*=\s*["'][^"']*["']/gi, '');
  }

  // Rate Limiting with tenant isolation
  createTenantRateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      const key = `${req.tenant?.id || 'default'}:${req.ip}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up expired entries
      for (const [k, v] of requests.entries()) {
        if (v.resetTime < now) {
          requests.delete(k);
        }
      }

      const current = requests.get(key);
      if (!current || current.resetTime < now) {
        requests.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.count >= max) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        });
      } else {
        current.count++;
      }

      // Set rate limit headers
      const remaining = Math.max(0, max - (current?.count || 0));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((current?.resetTime || now + windowMs) / 1000));

      next();
    };
  }

  // SQL Injection Prevention
  validateSqlInput(input: string): boolean {
    const dangerousPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(-{2}|\/\*|\*\/)/,
      /('|(\\x27)|(\\x2D))/,
      /(<script|javascript:|vbscript:|onload=|onerror=)/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  // XSS Protection
  validateXssInput(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    return !xssPatterns.some(pattern => pattern.test(input));
  }

  // CSRF Protection
  generateCsrfToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  validateCsrfToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return require('crypto').timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  // Content Security Policy
  generateCSPHeader(): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    return policies.join('; ');
  }

  // Security Headers Middleware
  createSecurityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Remove sensitive headers
      res.removeHeader('X-Powered-By');

      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // Content Security Policy
      res.setHeader('Content-Security-Policy', this.generateCSPHeader());

      // HSTS (HTTP Strict Transport Security)
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      next();
    };
  }

  // Request Size Limiting
  createRequestSizeLimit(maxSize: string = '10mb') {
    return (req: Request, res: Response, next: NextFunction) => {
      const contentLength = parseInt(req.headers['content-length'] || '0');

      if (contentLength > this.parseSize(maxSize)) {
        return res.status(413).json({
          error: 'Request entity too large',
          maxSize
        });
      }

      next();
    };
  }

  private parseSize(size: string): number {
    const units = {
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';

    return Math.floor(value * (units[unit as keyof typeof units] || 1));
  }

  // API Key Validation
  validateApiKey(apiKey: string): boolean {
    if (!apiKey || apiKey.length < 32) {
      return false;
    }

    // Check against stored API keys (would be implemented with database lookup)
    const validKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
    return validKeys.includes(apiKey);
  }

  // IP Whitelisting/Blacklisting
  isAllowedIP(ip: string): boolean {
    const whitelist = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [];
    const blacklist = process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [];

    if (blacklist.includes(ip)) {
      return false;
    }

    if (whitelist.length === 0) {
      return true; // No whitelist means allow all
    }

    return whitelist.includes(ip);
  }

  // Request Logging with Security Context
  createSecurityLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logEntry = {
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          userId: req.user?.id,
          tenantId: req.tenant?.id,
          statusCode: res.statusCode,
          duration,
          contentLength: res.getHeader('content-length'),
          security: {
            hasSuspiciousInput: this.detectSuspiciousInput(req),
            rateLimited: res.statusCode === 429,
            authenticated: !!req.user,
            tenantIsolated: !!req.tenant
          }
        };

        console.log('SECURITY:', JSON.stringify(logEntry));
      });

      next();
    };
  }

  private detectSuspiciousInput(req: Request): boolean {
    const checkString = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    return !this.validateXssInput(checkString) || !this.validateSqlInput(checkString);
  }

  // Get security configuration
  getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }

  // Update security configuration
  updateSecurityConfig(config: Partial<SecurityConfig>): void {
    this.securityConfig = { ...this.securityConfig, ...config };
  }
}

export const apiSecurityService = APISecurityService.getInstance();