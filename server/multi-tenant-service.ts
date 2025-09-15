import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { db } from "./db";

// Multi-tenant architecture for enterprise deployments
// Implements Row-Level Security (RLS) and company data isolation

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  maxLoads: number;
  features: string[];
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  id: number;
  tenantId: string;
  userId: number;
  role: string;
  permissions: string[];
  joinedAt: Date;
  lastActiveAt?: Date;
}

// Tenant table schema
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain"),
  subscriptionTier: text("subscription_tier").notNull().default('free'),
  maxUsers: integer("max_users").notNull().default(10),
  maxLoads: integer("max_loads").notNull().default(100),
  features: text("features").array().notNull().default([]),
  settings: text("settings").notNull().default('{}'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tenant-user relationship table
export const tenantUsers = pgTable("tenant_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default('user'),
  permissions: text("permissions").array().notNull().default([]),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

export class MultiTenantService {
  private static instance: MultiTenantService;

  static getInstance(): MultiTenantService {
    if (!MultiTenantService.instance) {
      MultiTenantService.instance = new MultiTenantService();
    }
    return MultiTenantService.instance;
  }

  // Create a new tenant (company)
  async createTenant(tenantData: {
    name: string;
    domain?: string;
    subscriptionTier?: 'free' | 'starter' | 'professional' | 'enterprise';
    maxUsers?: number;
    maxLoads?: number;
    features?: string[];
    settings?: Record<string, any>;
  }): Promise<Tenant> {
    const tenant = await db.insert(tenants).values({
      name: tenantData.name,
      domain: tenantData.domain,
      subscriptionTier: tenantData.subscriptionTier || 'free',
      maxUsers: tenantData.maxUsers || 10,
      maxLoads: tenantData.maxLoads || 100,
      features: tenantData.features || [],
      settings: JSON.stringify(tenantData.settings || {}),
    }).returning();

    return tenant[0];
  }

  // Get tenant by ID
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const result = await db.select().from(tenants).where(sql`${tenants.id} = ${tenantId}`);
    return result[0] || null;
  }

  // Get tenant by domain
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const result = await db.select().from(tenants).where(sql`${tenants.domain} = ${domain}`);
    return result[0] || null;
  }

  // Add user to tenant
  async addUserToTenant(tenantId: string, userId: number, role: string = 'user'): Promise<void> {
    // Check if user is already in tenant
    const existing = await db.select()
      .from(tenantUsers)
      .where(sql`${tenantUsers.tenantId} = ${tenantId} AND ${tenantUsers.userId} = ${userId}`);

    if (existing.length > 0) {
      throw new Error('User is already a member of this tenant');
    }

    // Check tenant user limit
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const userCount = await db.select({ count: sql<number>`count(*)` })
      .from(tenantUsers)
      .where(sql`${tenantUsers.tenantId} = ${tenantId}`);

    if (userCount[0].count >= tenant.maxUsers) {
      throw new Error('Tenant has reached maximum user limit');
    }

    await db.insert(tenantUsers).values({
      tenantId,
      userId,
      role,
      permissions: this.getDefaultPermissionsForRole(role),
    });
  }

  // Remove user from tenant
  async removeUserFromTenant(tenantId: string, userId: number): Promise<void> {
    await db.delete(tenantUsers)
      .where(sql`${tenantUsers.tenantId} = ${tenantId} AND ${tenantUsers.userId} = ${userId}`);
  }

  // Get user's tenant membership
  async getUserTenants(userId: number): Promise<TenantUser[]> {
    const result = await db.select()
      .from(tenantUsers)
      .where(sql`${tenantUsers.userId} = ${userId}`);

    return result;
  }

  // Get tenant users
  async getTenantUsers(tenantId: string): Promise<any[]> {
    const result = await db.select({
      userId: tenantUsers.userId,
      role: tenantUsers.role,
      permissions: tenantUsers.permissions,
      joinedAt: tenantUsers.joinedAt,
      lastActiveAt: tenantUsers.lastActiveAt,
    })
    .from(tenantUsers)
    .where(sql`${tenantUsers.tenantId} = ${tenantId}`);

    return result;
  }

  // Update user role in tenant
  async updateUserRole(tenantId: string, userId: number, role: string): Promise<void> {
    await db.update(tenantUsers)
      .set({
        role,
        permissions: this.getDefaultPermissionsForRole(role),
      })
      .where(sql`${tenantUsers.tenantId} = ${tenantId} AND ${tenantUsers.userId} = ${userId}`);
  }

  // Check if user has permission in tenant
  async hasPermission(tenantId: string, userId: number, permission: string): Promise<boolean> {
    const result = await db.select()
      .from(tenantUsers)
      .where(sql`${tenantUsers.tenantId} = ${tenantId} AND ${tenantUsers.userId} = ${userId}`);

    if (result.length === 0) {
      return false;
    }

    return result[0].permissions.includes(permission);
  }

  // Get default permissions for a role
  private getDefaultPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'owner': [
        'tenant.admin',
        'tenant.billing',
        'users.manage',
        'loads.manage',
        'drivers.manage',
        'reports.view',
        'settings.manage'
      ],
      'admin': [
        'users.manage',
        'loads.manage',
        'drivers.manage',
        'reports.view',
        'settings.view'
      ],
      'dispatcher': [
        'loads.manage',
        'drivers.view',
        'reports.view'
      ],
      'driver': [
        'loads.view',
        'profile.manage'
      ],
      'user': [
        'loads.view',
        'profile.view'
      ]
    };

    return rolePermissions[role] || [];
  }

  // Update tenant settings
  async updateTenantSettings(tenantId: string, settings: Record<string, any>): Promise<void> {
    const currentTenant = await this.getTenant(tenantId);
    if (!currentTenant) {
      throw new Error('Tenant not found');
    }

    const updatedSettings = { ...JSON.parse(currentTenant.settings), ...settings };

    await db.update(tenants)
      .set({
        settings: JSON.stringify(updatedSettings),
        updatedAt: new Date(),
      })
      .where(sql`${tenants.id} = ${tenantId}`);
  }

  // Enable Row-Level Security for tenant data isolation
  async enableRLS(): Promise<void> {
    // This would be run as database migrations
    // Enable RLS on relevant tables and create policies

    const rlsQueries = [
      // Enable RLS on users table
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,

      // Create policy for users to only see their own tenant's data
      `CREATE POLICY tenant_isolation ON users
       USING (tenant_id = current_setting('app.tenant_id')::uuid);`,

      // Similar policies for other tables (loads, drivers, etc.)
      `ALTER TABLE loads ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY tenant_loads ON loads
       USING (tenant_id = current_setting('app.tenant_id')::uuid);`,

      `ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY tenant_drivers ON drivers
       USING (tenant_id = current_setting('app.tenant_id')::uuid);`,
    ];

    // Execute RLS setup queries
    for (const query of rlsQueries) {
      try {
        await db.execute(sql.raw(query));
      } catch (error) {
        console.warn('RLS setup warning:', error);
        // Continue with other queries
      }
    }
  }

  // Set tenant context for the current session
  async setTenantContext(tenantId: string): Promise<void> {
    // This sets a session variable that RLS policies can use
    await db.execute(sql.raw(`SET app.tenant_id = '${tenantId}'`));
  }

  // Validate tenant subscription limits
  async validateTenantLimits(tenantId: string): Promise<{
    users: { current: number; max: number };
    loads: { current: number; max: number };
    valid: boolean;
  }> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const [userCount, loadCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(tenantUsers)
        .where(sql`${tenantUsers.tenantId} = ${tenantId}`),

      // This would need to be implemented based on your loads table structure
      // For now, return placeholder
      Promise.resolve([{ count: 0 }])
    ]);

    const result = {
      users: {
        current: userCount[0].count,
        max: tenant.maxUsers
      },
      loads: {
        current: loadCount[0].count,
        max: tenant.maxLoads
      },
      valid: userCount[0].count <= tenant.maxUsers && loadCount[0].count <= tenant.maxLoads
    };

    return result;
  }
}

export const multiTenantService = MultiTenantService.getInstance();