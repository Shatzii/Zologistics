import { Request, Response, NextFunction } from "express";
import { multiTenantService } from "./multi-tenant-service";

// Extend Express Request to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        subscriptionTier: string;
        settings: Record<string, any>;
      };
      tenantUser?: {
        role: string;
        permissions: string[];
      };
    }
  }
}

// Tenant context middleware
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract tenant ID from various sources
    let tenantId: string | undefined;

    // 1. Check subdomain (e.g., company.zologistics.com)
    const host = req.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain !== 'www' && subdomain !== host.split(':')[0]) {
        // Look up tenant by domain
        const tenant = await multiTenantService.getTenantByDomain(subdomain);
        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }

    // 2. Check custom header (for API calls)
    if (!tenantId) {
      tenantId = req.headers['x-tenant-id'] as string;
    }

    // 3. Check query parameter (for development/testing)
    if (!tenantId) {
      tenantId = req.query.tenantId as string;
    }

    // 4. Check JWT token claims (if user is authenticated)
    if (!tenantId && req.user) {
      // This would require updating the auth service to include tenant info in tokens
      // For now, we'll handle this in the auth middleware
    }

    // If no tenant found and this is a multi-tenant deployment, return error
    if (!tenantId) {
      // In single-tenant mode, you might want to use a default tenant
      // For now, we'll proceed without tenant context
      return next();
    }

    // Get tenant information
    const tenant = await multiTenantService.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Attach tenant to request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      subscriptionTier: tenant.subscriptionTier,
      settings: JSON.parse(tenant.settings),
    };

    // Set tenant context in database session for RLS
    await multiTenantService.setTenantContext(tenantId);

    // If user is authenticated, get their tenant-specific role and permissions
    if (req.user) {
      try {
        const tenantUsers = await multiTenantService.getUserTenants(req.user.id);
        const tenantUser = tenantUsers.find(tu => tu.tenantId === tenantId);

        if (tenantUser) {
          req.tenantUser = {
            role: tenantUser.role,
            permissions: tenantUser.permissions,
          };
        } else {
          // User is not a member of this tenant
          return res.status(403).json({ error: 'User is not a member of this tenant' });
        }
      } catch (error) {
        console.error('Error fetching tenant user:', error);
        return res.status(500).json({ error: 'Failed to verify tenant membership' });
      }
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ error: 'Tenant context error' });
  }
};

// Middleware to require tenant context
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(400).json({ error: 'Tenant context required' });
  }
  next();
};

// Middleware to check tenant permissions
export const requireTenantPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantUser) {
      return res.status(403).json({ error: 'Tenant membership required' });
    }

    if (!req.tenantUser.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient tenant permissions' });
    }

    next();
  };
};

// Middleware to validate tenant subscription limits
export const validateTenantLimits = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return next();
  }

  try {
    const limits = await multiTenantService.validateTenantLimits(req.tenant.id);

    if (!limits.valid) {
      return res.status(402).json({
        error: 'Tenant subscription limits exceeded',
        limits
      });
    }

    next();
  } catch (error) {
    console.error('Error validating tenant limits:', error);
    res.status(500).json({ error: 'Failed to validate tenant limits' });
  }
};

// Tenant isolation middleware for data access
export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  if (req.tenant) {
    // Ensure all database queries in this request are scoped to the tenant
    // This is handled by RLS policies, but we can add additional checks here
    res.locals.tenantId = req.tenant.id;
  }
  next();
};