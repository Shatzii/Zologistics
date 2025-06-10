// Centralized route configuration to prevent dead links and ensure consistency

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  icon?: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  parent?: string;
  hidden?: boolean;
}

export const ROUTES: Record<string, RouteConfig> = {
  // Main Dashboard
  HOME: {
    path: '/',
    name: 'Dashboard',
    component: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Main dashboard overview'
  },

  // Load Management
  LOADS: {
    path: '/loads',
    name: 'Load Board',
    component: 'LoadBoard',
    icon: 'Truck',
    description: 'Manage and view all loads'
  },
  LOAD_DETAILS: {
    path: '/loads/:id',
    name: 'Load Details',
    component: 'LoadDetails',
    parent: 'LOADS',
    hidden: true
  },
  CREATE_LOAD: {
    path: '/loads/create',
    name: 'Create Load',
    component: 'CreateLoad',
    parent: 'LOADS'
  },

  // Driver Management
  DRIVERS: {
    path: '/drivers',
    name: 'Drivers',
    component: 'Drivers',
    icon: 'Users',
    description: 'Manage driver fleet'
  },
  DRIVER_DETAILS: {
    path: '/drivers/:id',
    name: 'Driver Details',
    component: 'DriverDetails',
    parent: 'DRIVERS',
    hidden: true
  },
  CREATE_DRIVER: {
    path: '/drivers/create',
    name: 'Add Driver',
    component: 'CreateDriver',
    parent: 'DRIVERS'
  },

  // Negotiations
  NEGOTIATIONS: {
    path: '/negotiations',
    name: 'Negotiations',
    component: 'Negotiations',
    icon: 'MessageSquare',
    description: 'AI-powered rate negotiations'
  },
  NEGOTIATION_DETAILS: {
    path: '/negotiations/:id',
    name: 'Negotiation Details',
    component: 'NegotiationDetails',
    parent: 'NEGOTIATIONS',
    hidden: true
  },

  // Analytics & Reports
  ANALYTICS: {
    path: '/analytics',
    name: 'Analytics',
    component: 'Analytics',
    icon: 'BarChart3',
    description: 'Performance analytics and reports'
  },
  REPORTS: {
    path: '/reports',
    name: 'Reports',
    component: 'Reports',
    icon: 'FileText',
    description: 'Generate and view reports'
  },

  // Settings & Configuration
  SETTINGS: {
    path: '/settings',
    name: 'Settings',
    component: 'Settings',
    icon: 'Settings',
    description: 'Application settings'
  },
  COMPANY_PROFILE: {
    path: '/settings/company',
    name: 'Company Profile',
    component: 'CompanyProfile',
    parent: 'SETTINGS'
  },
  USER_PREFERENCES: {
    path: '/settings/preferences',
    name: 'User Preferences',
    component: 'UserPreferences',
    parent: 'SETTINGS'
  },
  API_SETTINGS: {
    path: '/settings/api',
    name: 'API Configuration',
    component: 'APISettings',
    parent: 'SETTINGS'
  },

  // Mobile Routes
  MOBILE_DASHBOARD: {
    path: '/mobile',
    name: 'Mobile Dashboard',
    component: 'MobileDashboard',
    hidden: true
  },
  MOBILE_LOADS: {
    path: '/mobile/loads',
    name: 'Mobile Loads',
    component: 'MobileLoads',
    hidden: true
  },

  // Error Pages
  NOT_FOUND: {
    path: '/404',
    name: 'Page Not Found',
    component: 'NotFound',
    hidden: true
  },
  UNAUTHORIZED: {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: 'Unauthorized',
    hidden: true
  }
};

// Helper functions for route management
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find(route => route.path === path);
};

export const getMainRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => !route.parent && !route.hidden);
};

export const getChildRoutes = (parentKey: string): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => route.parent === parentKey);
};

export const buildPath = (routeKey: string, params?: Record<string, string>): string => {
  const route = ROUTES[routeKey];
  if (!route) return '/404';
  
  let path = route.path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  return path;
};

export const isValidRoute = (path: string): boolean => {
  const routePaths = Object.values(ROUTES).map(route => route.path);
  return routePaths.some(routePath => {
    const regex = new RegExp('^' + routePath.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(path);
  });
};