import { users, drivers, loads, negotiations, alerts, type User, type Driver, type Load, type Negotiation, type Alert, type InsertUser, type InsertDriver, type InsertLoad, type InsertNegotiation, type InsertAlert } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverStatus(id: number, status: string, location?: string): Promise<Driver | undefined>;

  // Loads
  getLoads(): Promise<Load[]>;
  getLoad(id: number): Promise<Load | undefined>;
  createLoad(load: InsertLoad): Promise<Load>;
  updateLoadStatus(id: number, status: string): Promise<Load | undefined>;
  assignLoadToDriver(loadId: number, driverId: number): Promise<Load | undefined>;

  // Negotiations
  getNegotiations(): Promise<Negotiation[]>;
  getNegotiation(id: number): Promise<Negotiation | undefined>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiationStatus(id: number, status: string, finalRate?: string): Promise<Negotiation | undefined>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeLoads: number;
    availableDrivers: number;
    avgRate: number;
    aiMatches: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drivers: Map<number, Driver>;
  private loads: Map<number, Load>;
  private negotiations: Map<number, Negotiation>;
  private alerts: Map<number, Alert>;
  private currentUserId: number;
  private currentDriverId: number;
  private currentLoadId: number;
  private currentNegotiationId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.drivers = new Map();
    this.loads = new Map();
    this.negotiations = new Map();
    this.alerts = new Map();
    this.currentUserId = 1;
    this.currentDriverId = 1;
    this.currentLoadId = 1;
    this.currentNegotiationId = 1;
    this.currentAlertId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample drivers
    this.createDriver({
      name: "Mike Johnson",
      initials: "MJ",
      currentLocation: "Nashville, TN",
      status: "available",
      phoneNumber: "555-0101",
      preferences: JSON.stringify({ preferredRoutes: ["southeast"], maxMiles: 1000 })
    });

    this.createDriver({
      name: "Tom Rivera",
      initials: "TR",
      currentLocation: "Oklahoma City, OK", 
      status: "en_route",
      phoneNumber: "555-0102",
      preferences: JSON.stringify({ preferredRoutes: ["southwest"], maxMiles: 800 })
    });

    this.createDriver({
      name: "Sarah Chen",
      initials: "SC",
      currentLocation: "Denver, CO",
      status: "available",
      phoneNumber: "555-0103",
      preferences: JSON.stringify({ preferredRoutes: ["west"], maxMiles: 1200 })
    });

    this.createDriver({
      name: "Robert Wilson",
      initials: "RW",
      currentLocation: "Las Vegas, NV",
      status: "off_duty",
      phoneNumber: "555-0104",
      preferences: JSON.stringify({ preferredRoutes: ["west"], maxMiles: 900 })
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.currentDriverId++;
    const driver: Driver = { 
      ...insertDriver, 
      id,
      phoneNumber: insertDriver.phoneNumber ?? null,
      preferences: insertDriver.preferences ?? null
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriverStatus(id: number, status: string, location?: string): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (driver) {
      driver.status = status;
      if (location) {
        driver.currentLocation = location;
      }
      this.drivers.set(id, driver);
      return driver;
    }
    return undefined;
  }

  // Loads
  async getLoads(): Promise<Load[]> {
    return Array.from(this.loads.values());
  }

  async getLoad(id: number): Promise<Load | undefined> {
    return this.loads.get(id);
  }

  async createLoad(insertLoad: InsertLoad): Promise<Load> {
    const id = this.currentLoadId++;
    const load: Load = { 
      ...insertLoad, 
      id,
      matchScore: insertLoad.matchScore ?? null,
      assignedDriverId: insertLoad.assignedDriverId ?? null,
      createdAt: new Date()
    };
    this.loads.set(id, load);
    return load;
  }

  async updateLoadStatus(id: number, status: string): Promise<Load | undefined> {
    const load = this.loads.get(id);
    if (load) {
      load.status = status;
      this.loads.set(id, load);
      return load;
    }
    return undefined;
  }

  async assignLoadToDriver(loadId: number, driverId: number): Promise<Load | undefined> {
    const load = this.loads.get(loadId);
    if (load) {
      load.assignedDriverId = driverId;
      load.status = "assigned";
      this.loads.set(loadId, load);
      return load;
    }
    return undefined;
  }

  // Negotiations
  async getNegotiations(): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values());
  }

  async getNegotiation(id: number): Promise<Negotiation | undefined> {
    return this.negotiations.get(id);
  }

  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = this.currentNegotiationId++;
    const negotiation: Negotiation = { 
      ...insertNegotiation, 
      id,
      finalRate: insertNegotiation.finalRate ?? null,
      aiAnalysis: insertNegotiation.aiAnalysis ?? null,
      confidenceScore: insertNegotiation.confidenceScore ?? null,
      createdAt: new Date()
    };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async updateNegotiationStatus(id: number, status: string, finalRate?: string): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (negotiation) {
      negotiation.status = status;
      if (finalRate) {
        negotiation.finalRate = finalRate;
      }
      this.negotiations.set(id, negotiation);
      return negotiation;
    }
    return undefined;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = { 
      ...insertAlert, 
      id,
      isRead: insertAlert.isRead ?? false,
      createdAt: new Date()
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    activeLoads: number;
    availableDrivers: number;
    avgRate: number;
    aiMatches: number;
  }> {
    const loads = Array.from(this.loads.values());
    const drivers = Array.from(this.drivers.values());
    
    const activeLoads = loads.filter(load => load.status === 'available' || load.status === 'assigned').length;
    const availableDrivers = drivers.filter(driver => driver.status === 'available').length;
    const avgRate = loads.length > 0 
      ? loads.reduce((sum, load) => sum + parseFloat(load.ratePerMile), 0) / loads.length 
      : 0;
    const aiMatches = loads.filter(load => load.matchScore && load.matchScore > 85).length;

    return {
      activeLoads,
      availableDrivers,
      avgRate: Math.round(avgRate * 100) / 100,
      aiMatches
    };
  }
}

export const storage = new MemStorage();
