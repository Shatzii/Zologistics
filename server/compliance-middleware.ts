import { Request, Response, NextFunction } from "express";
import { complianceService } from "./compliance-service";

// Compliance middleware for GDPR, CCPA, and data protection
export const complianceMiddleware = {
  // Log all API requests for audit compliance
  auditLogger: (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log the request
    complianceService.logComplianceEvent({
      userId: req.user?.id,
      tenantId: req.tenant?.id,
      action: 'api_request',
      resource: req.path,
      dataClassification: getDataClassification(req.path),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: {
        method: req.method,
        query: req.query,
        body: req.method !== 'GET' ? scrubRequestBody(req.body) : undefined
      }
    }).catch(error => {
      console.error('Failed to log audit event:', error);
    });

    // Log the response
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      complianceService.logComplianceEvent({
        userId: req.user?.id,
        tenantId: req.tenant?.id,
        action: 'api_response',
        resource: req.path,
        dataClassification: getDataClassification(req.path),
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        details: {
          method: req.method,
          statusCode: res.statusCode,
          duration
        }
      }).catch(error => {
        console.error('Failed to log response audit event:', error);
      });
    });

    next();
  },

  // PII detection and scrubbing middleware
  piiProtection: (req: Request, res: Response, next: NextFunction) => {
    // Check request body for PII
    if (req.body && typeof req.body === 'object') {
      const bodyString = JSON.stringify(req.body);
      const piiCheck = complianceService.detectPII(bodyString);

      if (piiCheck.hasPII) {
        // Log PII detection
        complianceService.logComplianceEvent({
          userId: req.user?.id,
          tenantId: req.tenant?.id,
          action: 'pii_detected',
          resource: req.path,
          dataClassification: 'restricted',
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: {
            piiTypes: piiCheck.piiTypes,
            method: req.method
          }
        }).catch(error => {
          console.error('Failed to log PII detection:', error);
        });

        // Scrub PII from logs
        req.body = JSON.parse(complianceService.scrubPII(bodyString));
      }
    }

    next();
  },

  // Consent validation middleware
  requireConsent: (consentType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user?.id) {
        return next();
      }

      const hasConsent = await complianceService.checkConsent(req.user.id, consentType);

      if (!hasConsent) {
        return res.status(403).json({
          error: 'Consent required',
          consentType,
          message: `User consent required for ${consentType}`
        });
      }

      next();
    };
  },

  // Data retention enforcement
  dataRetention: (req: Request, res: Response, next: NextFunction) => {
    // This would be called periodically, not on every request
    // For now, just pass through
    next();
  },

  // GDPR compliance headers
  gdprHeaders: (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Compliance-GDPR', 'enabled');
    res.setHeader('X-Compliance-CCPA', 'enabled');
    res.setHeader('X-Data-Retention', '7-years');
    next();
  }
};

// Helper functions
function getDataClassification(path: string): 'public' | 'internal' | 'confidential' | 'restricted' {
  // Classify endpoints by data sensitivity
  if (path.includes('/admin/') || path.includes('/rbac/')) {
    return 'restricted';
  }
  if (path.includes('/users/') || path.includes('/profile/')) {
    return 'confidential';
  }
  if (path.includes('/loads/') || path.includes('/drivers/')) {
    return 'internal';
  }
  return 'public';
}

function scrubRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const scrubbed = { ...body };

  // Scrub sensitive fields
  const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount'];

  for (const field of sensitiveFields) {
    if (scrubbed[field]) {
      scrubbed[field] = '[REDACTED]';
    }
  }

  return scrubbed;
}

// Rate limiting for compliance endpoints
export const complianceRateLimit = {
  gdpr: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: 'Too many GDPR requests, please try again later'
  },
  ccpa: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: 'Too many CCPA requests, please try again later'
  }
};