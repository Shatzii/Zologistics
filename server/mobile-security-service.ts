// Mobile Security Service
// Device-scoped authentication, certificate pinning, and mobile-specific security controls

export interface DeviceInfo {
  deviceId: string;
  deviceType: string; // 'ios', 'android', 'web'
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  ipAddress: string;
  userAgent: string;
  fingerprint: string;
  lastLogin: Date;
  trustLevel: 'high' | 'medium' | 'low';
  isJailbroken?: boolean;
  isEmulator?: boolean;
}

export interface DeviceRegistrationData {
  deviceType: string;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  ipAddress: string;
  userAgent: string;
  fingerprint: string;
  isJailbroken?: boolean;
  isEmulator?: boolean;
}

export interface MobileSession {
  sessionId: string;
  deviceId: string;
  userId: number;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
  ipAddress: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface CertificatePin {
  host: string;
  certificateHash: string;
  algorithm: 'sha256' | 'sha1';
  expiresAt: Date;
}

export class MobileSecurityService {
  private static instance: MobileSecurityService;
  private deviceRegistry: Map<string, DeviceInfo> = new Map();
  private activeSessions: Map<string, MobileSession> = new Map();
  private certificatePins: Map<string, CertificatePin> = new Map();
  private readonly maxSessionsPerDevice = 5;
  private readonly sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeCertificatePins();
    this.startSessionCleanup();
  }

  static getInstance(): MobileSecurityService {
    if (!MobileSecurityService.instance) {
      MobileSecurityService.instance = new MobileSecurityService();
    }
    return MobileSecurityService.instance;
  }

  // Device Registration and Management
  async registerDevice(deviceInfo: DeviceRegistrationData): Promise<string> {
    const deviceId = this.generateDeviceId();

    const device: DeviceInfo = {
      ...deviceInfo,
      deviceId,
      lastLogin: new Date(),
      trustLevel: this.calculateTrustLevel(deviceInfo)
    };

    this.deviceRegistry.set(deviceId, device);

    console.log(`Device registered: ${deviceId} (${deviceInfo.deviceType})`);
    return deviceId;
  }

  async authenticateDevice(deviceId: string, userId: number, ipAddress: string, location?: MobileSession['location']): Promise<MobileSession> {
    const device = this.deviceRegistry.get(deviceId);
    if (!device) {
      throw new Error('Device not registered');
    }

    // Check device trust level
    if (device.trustLevel === 'low') {
      throw new Error('Device trust level too low for authentication');
    }

    // Check for suspicious activity
    if (await this.detectSuspiciousActivity(deviceId, ipAddress, location)) {
      throw new Error('Suspicious activity detected');
    }

    // Create new session
    const sessionId = this.generateSessionId();
    const session: MobileSession = {
      sessionId,
      deviceId,
      userId,
      token: this.generateToken(),
      refreshToken: this.generateRefreshToken(),
      expiresAt: new Date(Date.now() + this.sessionTimeout),
      createdAt: new Date(),
      isActive: true,
      ipAddress,
      location
    };

    // Limit sessions per device
    await this.limitDeviceSessions(deviceId);

    this.activeSessions.set(sessionId, session);
    device.lastLogin = new Date();

    console.log(`Device authenticated: ${deviceId} for user ${userId}`);
    return session;
  }

  async validateSession(sessionId: string): Promise<MobileSession | null> {
    const session = this.activeSessions.get(sessionId);

    if (!session || !session.isActive) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      console.log(`Session invalidated: ${sessionId}`);
    }
  }

  async refreshSession(sessionId: string): Promise<MobileSession | null> {
    const session = this.activeSessions.get(sessionId);

    if (!session || !session.isActive) {
      return null;
    }

    // Generate new tokens
    session.token = this.generateToken();
    session.refreshToken = this.generateRefreshToken();
    session.expiresAt = new Date(Date.now() + this.sessionTimeout);

    console.log(`Session refreshed: ${sessionId}`);
    return session;
  }

  // Certificate Pinning
  async validateCertificate(host: string, certificateHash: string, algorithm: string): Promise<boolean> {
    const pin = this.certificatePins.get(host);

    if (!pin) {
      console.warn(`No certificate pin found for host: ${host}`);
      return false;
    }

    if (pin.expiresAt < new Date()) {
      console.warn(`Certificate pin expired for host: ${host}`);
      return false;
    }

    const isValid = pin.certificateHash === certificateHash && pin.algorithm === algorithm;

    if (!isValid) {
      console.error(`Certificate validation failed for host: ${host}`);
    }

    return isValid;
  }

  // Security Monitoring
  async detectSuspiciousActivity(deviceId: string, ipAddress: string, location?: MobileSession['location']): Promise<boolean> {
    const device = this.deviceRegistry.get(deviceId);
    if (!device) return true; // Unknown device is suspicious

    // Check for rapid location changes (impossible travel)
    if (location && device.lastLogin) {
      const lastLocation = await this.getLastKnownLocation(deviceId);
      if (lastLocation && this.isImpossibleTravel(lastLocation, location, device.lastLogin)) {
        console.warn(`Impossible travel detected for device: ${deviceId}`);
        return true;
      }
    }

    // Check for unusual login patterns
    const recentLogins = await this.getRecentLogins(deviceId, 24 * 60 * 60 * 1000); // Last 24 hours
    if (recentLogins.length > 10) {
      console.warn(`Unusual login frequency for device: ${deviceId}`);
      return true;
    }

    return false;
  }

  // Biometric/PIN Authentication Support
  async validateBiometric(deviceId: string, biometricData: string): Promise<boolean> {
    // In a real implementation, this would validate against stored biometric data
    // For now, we'll do a simple hash comparison
    const device = this.deviceRegistry.get(deviceId);
    if (!device) return false;

    // Mock biometric validation
    const expectedHash = this.hashBiometricData(deviceId);
    return expectedHash === biometricData;
  }

  // Private methods
  private calculateTrustLevel(deviceInfo: DeviceRegistrationData): DeviceInfo['trustLevel'] {
    let trustLevel: DeviceInfo['trustLevel'] = 'high';

    // Reduce trust for jailbroken/rooted devices
    if (deviceInfo.isJailbroken) {
      trustLevel = 'low';
    }

    // Reduce trust for emulators
    if (deviceInfo.isEmulator) {
      trustLevel = 'low';
    }

    // Reduce trust for old OS versions
    if (this.isOldOSVersion(deviceInfo.osVersion)) {
      trustLevel = trustLevel === 'high' ? 'medium' : 'low';
    }

    return trustLevel;
  }

  private async limitDeviceSessions(deviceId: string): Promise<void> {
    const deviceSessions = Array.from(this.activeSessions.values())
      .filter(session => session.deviceId === deviceId && session.isActive);

    if (deviceSessions.length >= this.maxSessionsPerDevice) {
      // Invalidate oldest sessions
      const sessionsToInvalidate = deviceSessions
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, deviceSessions.length - this.maxSessionsPerDevice + 1);

      for (const session of sessionsToInvalidate) {
        await this.invalidateSession(session.sessionId);
      }
    }
  }

  private isImpossibleTravel(lastLocation: MobileSession['location'], currentLocation: MobileSession['location'], lastLogin: Date): boolean {
    if (!lastLocation || !currentLocation) return false;

    const distance = this.calculateDistance(lastLocation, currentLocation);
    const timeDiff = Date.now() - lastLogin.getTime();
    const maxSpeed = 500; // km/h (commercial flight speed)

    // Check if distance is physically possible
    const maxDistance = (maxSpeed * timeDiff) / (1000 * 60 * 60); // Convert to km
    return distance > maxDistance;
  }

  private calculateDistance(loc1: MobileSession['location'], loc2: MobileSession['location']): number {
    if (!loc1 || !loc2) return 0;

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private isOldOSVersion(osVersion: string): boolean {
    // Simple check for old versions
    const version = parseFloat(osVersion);
    return version < 10; // iOS or Android version check
  }

  private async getLastKnownLocation(deviceId: string): Promise<MobileSession['location'] | null> {
    // Get location from most recent active session
    const sessions = Array.from(this.activeSessions.values())
      .filter(session => session.deviceId === deviceId && session.isActive && session.location)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sessions[0]?.location || null;
  }

  private async getRecentLogins(deviceId: string, timeWindow: number): Promise<MobileSession[]> {
    const cutoff = new Date(Date.now() - timeWindow);

    return Array.from(this.activeSessions.values())
      .filter(session => session.deviceId === deviceId && session.createdAt > cutoff);
  }

  private initializeCertificatePins(): void {
    // Initialize with common certificate pins
    // In production, these would be loaded from secure configuration
    this.certificatePins.set('api.zologistics.com', {
      host: 'api.zologistics.com',
      certificateHash: 'sha256_hash_here',
      algorithm: 'sha256',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
  }

  private startSessionCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (!session.isActive || session.expiresAt < now) {
          this.activeSessions.delete(sessionId);
        }
      }
    }, 60 * 60 * 1000); // Clean up every hour
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRefreshToken(): string {
    return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashBiometricData(deviceId: string): string {
    // Mock biometric hash
    return `biometric_hash_${deviceId}`;
  }
}

export const mobileSecurityService = MobileSecurityService.getInstance();