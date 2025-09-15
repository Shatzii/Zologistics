import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { storage } from "./storage";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  companyId?: number;
}

export interface LoginAttempt {
  ip: string;
  username: string;
  timestamp: Date;
  success: boolean;
}

export interface TwoFactorData {
  secret: string;
  backupCodes: string[];
  verified: boolean;
}

class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly BCRYPT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private readonly REFRESH_TOKEN_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  private loginAttempts = new Map<string, LoginAttempt[]>();
  private accountLocks = new Map<string, Date>();

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

    // Clean up old login attempts periodically
    setInterval(() => this.cleanupOldAttempts(), 60 * 60 * 1000); // Every hour
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: string;
    companyId?: number;
  }): Promise<AuthUser> {
    const hashedPassword = await this.hashPassword(userData.password);

    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'dispatcher'
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };
  }

  async authenticateUser(username: string, password: string, ip: string): Promise<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  } | null> {
    // Check if account is locked
    if (this.isAccountLocked(username)) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      await this.recordLoginAttempt(username, ip, false);
      return null;
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      await this.recordLoginAttempt(username, ip, false);
      return null;
    }

    // Clear login attempts on successful login
    this.clearLoginAttempts(username);
    await storage.updateUserLastLogin(user.id);

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = this.generateAccessToken(authUser);
    const refreshToken = this.generateRefreshToken(authUser);

    return { user: authUser, accessToken, refreshToken };
  }

  private generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        type: 'access'
      },
      this.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );
  }

  private generateRefreshToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    user: AuthUser;
  } | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;

      if (decoded.type !== 'refresh') {
        return null;
      }

      const user = await storage.getUserById(decoded.userId);
      if (!user) {
        return null;
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId
      };

      const accessToken = this.generateAccessToken(authUser);
      return { accessToken, user: authUser };
    } catch (error) {
      return null;
    }
  }

  async verifyAccessToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      if (decoded.type !== 'access') {
        return null;
      }

      const user = await storage.getUserById(decoded.userId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId
      };
    } catch (error) {
      return null;
    }
  }

  private async recordLoginAttempt(username: string, ip: string, success: boolean): Promise<void> {
    const attempts = this.loginAttempts.get(username) || [];
    attempts.push({ ip, username, timestamp: new Date(), success });

    // Keep only recent attempts (last 24 hours)
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    this.loginAttempts.set(username, recentAttempts);

    // Check for lockout condition
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    if (failedAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      this.accountLocks.set(username, new Date(Date.now() + this.LOCKOUT_DURATION));
    }
  }

  private clearLoginAttempts(username: string): void {
    this.loginAttempts.delete(username);
    this.accountLocks.delete(username);
  }

  private isAccountLocked(username: string): boolean {
    const lockTime = this.accountLocks.get(username);
    if (!lockTime) return false;

    if (Date.now() > lockTime.getTime()) {
      this.accountLocks.delete(username);
      return false;
    }

    return true;
  }

  private cleanupOldAttempts(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const [username, attempts] of this.loginAttempts.entries()) {
      const recentAttempts = attempts.filter(
        attempt => attempt.timestamp.getTime() > cutoff
      );

      if (recentAttempts.length === 0) {
        this.loginAttempts.delete(username);
      } else {
        this.loginAttempts.set(username, recentAttempts);
      }
    }

    // Clean up expired locks
    for (const [username, lockTime] of this.accountLocks.entries()) {
      if (Date.now() > lockTime.getTime()) {
        this.accountLocks.delete(username);
      }
    }
  }

  // Two-factor authentication methods
  generateTOTPSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  async setupTwoFactor(userId: number, method: 'totp' | 'sms' | 'email', contact?: string): Promise<TwoFactorData> {
    const secret = this.generateTOTPSecret();
    const backupCodes = this.generateBackupCodes();

    // Store 2FA data (in production, this should be encrypted)
    const twoFactorData: TwoFactorData = {
      secret,
      backupCodes,
      verified: false
    };

    // TODO: Store in database
    // await storage.updateUserTwoFactor(userId, twoFactorData);

    return twoFactorData;
  }

  async verifyTwoFactor(userId: number, code: string): Promise<boolean> {
    // TODO: Implement TOTP verification
    // For now, accept any 6-digit code
    return /^\d{6}$/.test(code);
  }

  async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    // TODO: Verify and consume backup code
    return true;
  }
}

export const authService = new AuthService();