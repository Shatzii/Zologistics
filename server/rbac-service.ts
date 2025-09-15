import { storage } from './storage';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystemRole?: boolean;
}

export interface RoleAssignment {
  userId: number;
  roleId: string;
  assignedBy: number;
  assignedAt: Date;
  expiresAt?: Date;
}

export class RBACService {
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<number, RoleAssignment[]> = new Map();

  constructor() {
    this.initializePermissions();
    this.initializeRoles();
  }

  private initializePermissions() {
    // Define all permissions
    const permissions: Permission[] = [
      // User management
      { id: 'users.view', name: 'View Users', description: 'Can view user list', resource: 'users', action: 'view' },
      { id: 'users.create', name: 'Create Users', description: 'Can create new users', resource: 'users', action: 'create' },
      { id: 'users.edit', name: 'Edit Users', description: 'Can edit user details', resource: 'users', action: 'edit' },
      { id: 'users.delete', name: 'Delete Users', description: 'Can delete users', resource: 'users', action: 'delete' },

      // Load management
      { id: 'loads.view', name: 'View Loads', description: 'Can view load list', resource: 'loads', action: 'view' },
      { id: 'loads.create', name: 'Create Loads', description: 'Can create new loads', resource: 'loads', action: 'create' },
      { id: 'loads.edit', name: 'Edit Loads', description: 'Can edit load details', resource: 'loads', action: 'edit' },
      { id: 'loads.delete', name: 'Delete Loads', description: 'Can delete loads', resource: 'loads', action: 'delete' },
      { id: 'loads.assign', name: 'Assign Loads', description: 'Can assign loads to drivers', resource: 'loads', action: 'assign' },

      // Driver management
      { id: 'drivers.view', name: 'View Drivers', description: 'Can view driver list', resource: 'drivers', action: 'view' },
      { id: 'drivers.create', name: 'Create Drivers', description: 'Can create new drivers', resource: 'drivers', action: 'create' },
      { id: 'drivers.edit', name: 'Edit Drivers', description: 'Can edit driver details', resource: 'drivers', action: 'edit' },
      { id: 'drivers.delete', name: 'Delete Drivers', description: 'Can delete drivers', resource: 'drivers', action: 'delete' },

      // Analytics and reporting
      { id: 'analytics.view', name: 'View Analytics', description: 'Can view analytics dashboard', resource: 'analytics', action: 'view' },
      { id: 'reports.view', name: 'View Reports', description: 'Can view reports', resource: 'reports', action: 'view' },
      { id: 'reports.create', name: 'Create Reports', description: 'Can create custom reports', resource: 'reports', action: 'create' },

      // System administration
      { id: 'system.admin', name: 'System Admin', description: 'Full system administration access', resource: 'system', action: 'admin' },
      { id: 'system.settings', name: 'System Settings', description: 'Can modify system settings', resource: 'system', action: 'settings' },
      { id: 'system.backup', name: 'System Backup', description: 'Can perform system backups', resource: 'system', action: 'backup' },

      // Company management
      { id: 'company.view', name: 'View Company', description: 'Can view company details', resource: 'company', action: 'view' },
      { id: 'company.edit', name: 'Edit Company', description: 'Can edit company details', resource: 'company', action: 'edit' },

      // Billing and payments
      { id: 'billing.view', name: 'View Billing', description: 'Can view billing information', resource: 'billing', action: 'view' },
      { id: 'billing.edit', name: 'Edit Billing', description: 'Can edit billing settings', resource: 'billing', action: 'edit' },
      { id: 'payments.process', name: 'Process Payments', description: 'Can process payments', resource: 'payments', action: 'process' }
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  private initializeRoles() {
    // Define system roles
    const roles: Role[] = [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: Array.from(this.permissions.keys()),
        isSystemRole: true
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access to most system functions',
        permissions: [
          'users.view', 'users.create', 'users.edit',
          'loads.view', 'loads.create', 'loads.edit', 'loads.assign',
          'drivers.view', 'drivers.create', 'drivers.edit',
          'analytics.view', 'reports.view', 'reports.create',
          'system.settings', 'company.view', 'company.edit',
          'billing.view', 'billing.edit'
        ],
        isSystemRole: true
      },
      {
        id: 'dispatcher',
        name: 'Dispatcher',
        description: 'Can manage loads and drivers',
        permissions: [
          'loads.view', 'loads.create', 'loads.edit', 'loads.assign',
          'drivers.view', 'drivers.edit',
          'analytics.view', 'reports.view'
        ],
        isSystemRole: true
      },
      {
        id: 'driver',
        name: 'Driver',
        description: 'Limited access for drivers',
        permissions: [
          'loads.view' // Can only view assigned loads
        ],
        isSystemRole: true
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to system data',
        permissions: [
          'loads.view', 'drivers.view', 'analytics.view', 'reports.view'
        ],
        isSystemRole: true
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // Check if user has permission
  async hasPermission(userId: number, permissionId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);

    for (const roleAssignment of userRoles) {
      const role = this.roles.get(roleAssignment.roleId);
      if (role && role.permissions.includes(permissionId)) {
        // Check if role assignment is still valid
        if (roleAssignment.expiresAt && roleAssignment.expiresAt < new Date()) {
          continue; // Expired role
        }
        return true;
      }
    }

    return false;
  }

  // Check if user has any of the permissions
  async hasAnyPermission(userId: number, permissionIds: string[]): Promise<boolean> {
    for (const permissionId of permissionIds) {
      if (await this.hasPermission(userId, permissionId)) {
        return true;
      }
    }
    return false;
  }

  // Get all permissions for a user
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissionIds = new Set<string>();

    for (const roleAssignment of userRoles) {
      const role = this.roles.get(roleAssignment.roleId);
      if (role) {
        // Check if role assignment is still valid
        if (roleAssignment.expiresAt && roleAssignment.expiresAt < new Date()) {
          continue; // Expired role
        }
        role.permissions.forEach(permissionId => permissionIds.add(permissionId));
      }
    }

    return Array.from(permissionIds).map(id => this.permissions.get(id)!).filter(Boolean);
  }

  // Assign role to user
  async assignRole(userId: number, roleId: string, assignedBy: number, expiresAt?: Date): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const assignment: RoleAssignment = {
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt
    };

    // In a real implementation, this would be stored in the database
    // For now, we'll store in memory
    const userAssignments = this.userRoles.get(userId) || [];
    userAssignments.push(assignment);
    this.userRoles.set(userId, userAssignments);
  }

  // Remove role from user
  async removeRole(userId: number, roleId: string): Promise<void> {
    const userAssignments = this.userRoles.get(userId) || [];
    const filteredAssignments = userAssignments.filter(assignment => assignment.roleId !== roleId);
    this.userRoles.set(userId, filteredAssignments);
  }

  // Get user's roles
  async getUserRoles(userId: number): Promise<RoleAssignment[]> {
    // In a real implementation, this would query the database
    return this.userRoles.get(userId) || [];
  }

  // Get all available roles
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // Get role by ID
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  // Get permission by ID
  getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  // Create custom role
  createRole(role: Omit<Role, 'isSystemRole'>): Role {
    const newRole: Role = {
      ...role,
      isSystemRole: false
    };

    this.roles.set(role.id, newRole);
    return newRole;
  }

  // Middleware for permission checking
  createPermissionMiddleware(permissionId: string) {
    return async (req: any, res: any, next: any) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasPermission = await this.hasPermission(req.user.id, permissionId);
        if (!hasPermission) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }
}

export const rbacService = new RBACService();