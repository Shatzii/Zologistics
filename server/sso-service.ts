import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

export interface SSOConfig {
  provider: 'azure' | 'okta' | 'google' | 'saml';
  clientId: string;
  clientSecret: string;
  tenantId?: string; // For Azure
  domain?: string; // For Okta
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  groups?: string[];
}

export class SSOService {
  private configs = new Map<string, SSOConfig>();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Azure AD configuration
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      this.configs.set('azure', {
        provider: 'azure',
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        tenantId: process.env.AZURE_TENANT_ID,
        authorizationUrl: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
        scopes: ['openid', 'profile', 'email', 'User.Read']
      });
    }

    // Okta configuration
    if (process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET && process.env.OKTA_DOMAIN) {
      this.configs.set('okta', {
        provider: 'okta',
        clientId: process.env.OKTA_CLIENT_ID,
        clientSecret: process.env.OKTA_CLIENT_SECRET,
        domain: process.env.OKTA_DOMAIN,
        authorizationUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/authorize`,
        tokenUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/token`,
        userInfoUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/userinfo`,
        scopes: ['openid', 'profile', 'email']
      });
    }

    // Google OAuth configuration
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.configs.set('google', {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scopes: ['openid', 'profile', 'email']
      });
    }
  }

  getAuthorizationUrl(provider: string, state: string): string | null {
    const config = this.configs.get(provider);
    if (!config) return null;

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: config.scopes.join(' '),
      redirect_uri: `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/${provider}/callback`,
      state: state
    });

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(provider: string, code: string): Promise<any> {
    const config = this.configs.get(provider);
    if (!config) throw new Error('SSO provider not configured');

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/${provider}/callback`
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  }

  async getUserInfo(provider: string, accessToken: string): Promise<SSOUser> {
    const config = this.configs.get(provider);
    if (!config) throw new Error('SSO provider not configured');

    const response = await fetch(config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();

    // Normalize user data across providers
    return this.normalizeUserData(provider, userData);
  }

  private normalizeUserData(provider: string, data: any): SSOUser {
    switch (provider) {
      case 'azure':
        return {
          id: data.id,
          email: data.mail || data.userPrincipalName,
          name: data.displayName,
          roles: data.jobTitle ? [data.jobTitle] : [],
          groups: []
        };

      case 'okta':
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          roles: data.groups || [],
          groups: data.groups || []
        };

      case 'google':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          roles: [],
          groups: []
        };

      default:
        return {
          id: data.sub || data.id,
          email: data.email,
          name: data.name || `${data.given_name} ${data.family_name}`,
          roles: [],
          groups: []
        };
    }
  }

  async authenticateWithSSO(provider: string, ssoUser: SSOUser): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user exists in our database
    let user = await storage.getUserByEmail(ssoUser.email);

    if (!user) {
      // Create new user from SSO data
      user = await storage.createUser({
        username: ssoUser.email.split('@')[0] + '_' + provider,
        email: ssoUser.email,
        password: crypto.randomBytes(32).toString('hex'), // Random password for SSO users
        name: ssoUser.name,
        role: this.determineRoleFromSSO(ssoUser),
        companyId: undefined // TODO: Determine company from SSO groups
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        type: 'access',
        provider: provider
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    return { user, accessToken, refreshToken };
  }

  private determineRoleFromSSO(ssoUser: SSOUser): string {
    // Check for admin roles in SSO data
    const adminRoles = ['admin', 'administrator', 'superuser', 'owner'];
    const adminGroups = ['admins', 'administrators', 'it-admin', 'system-admin'];

    if (ssoUser.roles?.some(role => adminRoles.includes(role.toLowerCase()))) {
      return 'admin';
    }

    if (ssoUser.groups?.some(group => adminGroups.includes(group.toLowerCase()))) {
      return 'admin';
    }

    return 'dispatcher'; // Default role
  }

  isProviderConfigured(provider: string): boolean {
    return this.configs.has(provider);
  }

  getConfiguredProviders(): string[] {
    return Array.from(this.configs.keys());
  }
}

export const ssoService = new SSOService();