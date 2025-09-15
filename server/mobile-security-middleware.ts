// Mobile Security Middleware
// Device authentication, certificate pinning, and mobile-specific security controls

import { Request, Response, NextFunction } from 'express';
import { mobileSecurityService } from './mobile-security-service';

export interface MobileAuthRequest extends Request {
  deviceId?: string;
  sessionId?: string;
  mobileSession?: any;
}

// Device Registration Middleware
export const registerDevice = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      deviceType,
      osVersion,
      appVersion,
      deviceModel,
      ipAddress,
      userAgent,
      fingerprint,
      isJailbroken,
      isEmulator
    } = req.body;

    if (!deviceType || !osVersion || !appVersion) {
      return res.status(400).json({
        error: 'Missing required device information',
        required: ['deviceType', 'osVersion', 'appVersion']
      });
    }

    const deviceId = await mobileSecurityService.registerDevice({
      deviceType,
      osVersion,
      appVersion,
      deviceModel: deviceModel || 'Unknown',
      ipAddress: ipAddress || req.ip || '',
      userAgent: userAgent || req.get('User-Agent') || '',
      fingerprint: fingerprint || '',
      isJailbroken: isJailbroken || false,
      isEmulator: isEmulator || false
    });

    res.json({
      success: true,
      deviceId,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Device registration failed:', error);
    res.status(500).json({ error: 'Device registration failed' });
  }
};

// Device Authentication Middleware
export const authenticateDevice = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { deviceId, userId, location } = req.body;
    const ipAddress = req.ip;

    if (!deviceId || !userId) {
      return res.status(400).json({
        error: 'Missing required authentication data',
        required: ['deviceId', 'userId']
      });
    }

    const session = await mobileSecurityService.authenticateDevice(
      deviceId,
      userId,
      ipAddress || '',
      location
    );

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    console.error('Device authentication failed:', error);
    res.status(401).json({
      error: 'Device authentication failed',
      message: (error as Error).message
    });
  }
};

// Session Validation Middleware
export const validateMobileSession = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'] as string ||
                     req.query.sessionId as string;

    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const session = await mobileSecurityService.validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.deviceId = session.deviceId;
    req.sessionId = session.sessionId;
    req.mobileSession = session;
    req.user = { id: session.userId } as any; // Attach user for downstream middleware

    next();
  } catch (error) {
    console.error('Session validation failed:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

// Session Refresh Middleware
export const refreshMobileSession = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await mobileSecurityService.refreshSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    console.error('Session refresh failed:', error);
    res.status(500).json({ error: 'Session refresh failed' });
  }
};

// Certificate Pinning Validation Middleware
export const validateCertificatePin = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const certificateHash = req.headers['x-certificate-hash'] as string;
    const certificateAlgorithm = req.headers['x-certificate-algorithm'] as string;
    const host = req.hostname;

    if (!certificateHash || !certificateAlgorithm) {
      // Allow requests without certificate pinning for development
      // In production, this should be enforced
      console.warn('Certificate pinning headers missing');
      return next();
    }

    const isValid = await mobileSecurityService.validateCertificate(
      host,
      certificateHash,
      certificateAlgorithm as 'sha256' | 'sha1'
    );

    if (!isValid) {
      return res.status(403).json({
        error: 'Certificate validation failed',
        message: 'Invalid certificate for this host'
      });
    }

    next();
  } catch (error) {
    console.error('Certificate validation failed:', error);
    res.status(500).json({ error: 'Certificate validation failed' });
  }
};

// Biometric Authentication Middleware
export const validateBiometric = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { deviceId, biometricData } = req.body;

    if (!deviceId || !biometricData) {
      return res.status(400).json({
        error: 'Missing biometric data',
        required: ['deviceId', 'biometricData']
      });
    }

    const isValid = await mobileSecurityService.validateBiometric(deviceId, biometricData);

    if (!isValid) {
      return res.status(401).json({ error: 'Biometric authentication failed' });
    }

    next();
  } catch (error) {
    console.error('Biometric validation failed:', error);
    res.status(500).json({ error: 'Biometric validation failed' });
  }
};

// Device Trust Validation Middleware
export const validateDeviceTrust = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const deviceId = req.deviceId;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    // Additional device trust validation can be added here
    // For now, trust validation is handled in the authentication process

    next();
  } catch (error) {
    console.error('Device trust validation failed:', error);
    res.status(500).json({ error: 'Device trust validation failed' });
  }
};

// Mobile-specific Security Headers Middleware
export const mobileSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Security headers specific to mobile applications
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Mobile-specific headers
  res.setHeader('X-Mobile-Security', 'enabled');
  res.setHeader('X-Certificate-Pinning', 'required');

  next();
};

// Rate Limiting for Mobile Requests
export const mobileRateLimit = (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  // Mobile-specific rate limiting logic
  // This would integrate with a rate limiting service
  const deviceId = req.deviceId;
  const ipAddress = req.ip;

  // For now, just pass through
  // In production, implement proper rate limiting based on device and IP
  next();
};

// Suspicious Activity Detection Middleware
export const detectSuspiciousActivity = async (req: MobileAuthRequest, res: Response, next: NextFunction) => {
  try {
    const deviceId = req.deviceId;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || '';

    if (deviceId) {
      // Parse location from request if available
      let location;
      if (req.body.location) {
        location = {
          latitude: req.body.location.latitude,
          longitude: req.body.location.longitude,
          accuracy: req.body.location.accuracy || 0
        };
      }

      const isSuspicious = await mobileSecurityService.detectSuspiciousActivity(
        deviceId,
        ipAddress || '',
        location
      );

      if (isSuspicious) {
        console.warn(`Suspicious activity detected for device: ${deviceId}`);
        return res.status(403).json({
          error: 'Suspicious activity detected',
          message: 'Access temporarily blocked due to security concerns'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Suspicious activity detection failed:', error);
    // Don't block the request if detection fails, just log it
    next();
  }
};

// Mobile API Version Validation
export const validateApiVersion = (req: Request, res: Response, next: NextFunction) => {
  const apiVersion = req.headers['x-api-version'] as string;
  const supportedVersions = ['1.0', '1.1', '2.0'];

  if (!apiVersion) {
    return res.status(400).json({
      error: 'API version required',
      supportedVersions
    });
  }

  if (!supportedVersions.includes(apiVersion)) {
    return res.status(400).json({
      error: 'Unsupported API version',
      provided: apiVersion,
      supportedVersions
    });
  }

  next();
};