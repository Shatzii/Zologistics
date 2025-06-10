import { users, drivers, loads, negotiations, alerts, companies, scrapingSessions, analytics, notifications, type User, type Driver, type Load, type Negotiation, type Alert, type Company, type ScrapingSession, type Analytics, type Notification, type InsertUser, type InsertDriver, type InsertLoad, type InsertNegotiation, type InsertAlert, type InsertCompany, type InsertScrapingSession, type InsertAnalytics, type InsertNotification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users & Authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Drivers - Enhanced for mobile
  getDrivers(companyId?: number): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: number): Promise<boolean>;
  updateDriverStatus(id: number, status: string, location?: string): Promise<Driver | undefined>;
  updateDriverLocation(id: number, coordinates: { lat: number; lng: number }): Promise<Driver | undefined>;
  updateDriverDeviceToken(id: number, deviceToken: string): Promise<Driver | undefined>;

  // Loads - Enhanced for real integration
  getLoads(companyId?: number, filters?: LoadFilters): Promise<Load[]>;
  getLoad(id: number): Promise<Load | undefined>;
  getLoadByExternalId(externalId: string): Promise<Load | undefined>;
  createLoad(load: InsertLoad): Promise<Load>;
  updateLoadStatus(id: number, status: string): Promise<Load | undefined>;
  assignLoadToDriver(loadId: number, driverId: number): Promise<Load | undefined>;
  updateLoadMarketRate(id: number, marketRate: string): Promise<Load | undefined>;
  
  // Negotiations - Enhanced AI features
  getNegotiations(loadId?: number): Promise<Negotiation[]>;
  getNegotiation(id: number): Promise<Negotiation | undefined>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiationStatus(id: number, status: string, finalRate?: string): Promise<Negotiation | undefined>;
  addNegotiationStep(id: number, step: any): Promise<Negotiation | undefined>;
  
  // Load Board Scraping
  createScrapingSession(session: InsertScrapingSession): Promise<ScrapingSession>;
  updateScrapingSession(id: number, updates: Partial<ScrapingSession>): Promise<ScrapingSession | undefined>;
  getLatestScrapingSession(source: string): Promise<ScrapingSession | undefined>;
  
  // Analytics
  createAnalytic(analytic: InsertAnalytics): Promise<Analytics>;
  getAnalytics(companyId: number, metric: string, period: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  
  // Alerts
  getAlerts(companyId?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;

  // Dashboard metrics
  getDashboardMetrics(companyId?: number): Promise<{
    activeLoads: number;
    availableDrivers: number;
    avgRate: number;
    aiMatches: number;
    totalRevenue: number;
    completedLoads: number;
    avgNegotiationSuccess: number;
  }>;
}

export interface LoadFilters {
  status?: string;
  source?: string;
  minRate?: number;
  maxRate?: number;
  equipmentType?: string;
  assignedDriverId?: number;
}

export class DatabaseStorage implements IStorage {
  // Users & Authentication
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "dispatcher",
        isActive: insertUser.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values({
        ...insertCompany,
        isActive: insertCompany.isActive ?? true,
        createdAt: new Date(),
      })
      .returning();
    return company;
  }

  // Drivers - Enhanced for mobile
  async getDrivers(companyId?: number): Promise<Driver[]> {
    const query = companyId 
      ? db.select().from(drivers).where(eq(drivers.companyId, companyId))
      : db.select().from(drivers);
    return await query;
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db
      .insert(drivers)
      .values({
        ...insertDriver,
        isActive: insertDriver.isActive ?? true,
        createdAt: new Date(),
      })
      .returning();
    return driver;
  }

  async updateDriverStatus(id: number, status: string, location?: string): Promise<Driver | undefined> {
    const updates: any = { status, lastActive: new Date() };
    if (location) updates.currentLocation = location;
    
    const [driver] = await db
      .update(drivers)
      .set(updates)
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async updateDriverLocation(id: number, coordinates: { lat: number; lng: number }): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ 
        gpsCoordinates: coordinates,
        lastActive: new Date()
      })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async updateDriverDeviceToken(id: number, deviceToken: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ deviceToken })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  // Loads - Enhanced for real integration
  async getLoads(companyId?: number, filters?: LoadFilters): Promise<Load[]> {
    let query = db.select().from(loads);
    
    if (companyId) {
      query = query.where(eq(loads.companyId, companyId));
    }
    
    if (filters) {
      // Add filtering logic here based on LoadFilters
      // This would be expanded with proper WHERE clauses
    }
    
    return await query.orderBy(desc(loads.createdAt));
  }

  async getLoad(id: number): Promise<Load | undefined> {
    const [load] = await db.select().from(loads).where(eq(loads.id, id));
    return load;
  }

  async getLoadByExternalId(externalId: string): Promise<Load | undefined> {
    const [load] = await db.select().from(loads).where(eq(loads.externalId, externalId));
    return load;
  }

  async createLoad(insertLoad: InsertLoad): Promise<Load> {
    const [load] = await db
      .insert(loads)
      .values({
        ...insertLoad,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return load;
  }

  async updateLoadStatus(id: number, status: string): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ status, updatedAt: new Date() })
      .where(eq(loads.id, id))
      .returning();
    return load;
  }

  async assignLoadToDriver(loadId: number, driverId: number): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ 
        assignedDriverId: driverId, 
        status: "assigned",
        updatedAt: new Date()
      })
      .where(eq(loads.id, loadId))
      .returning();
    return load;
  }

  async updateLoadMarketRate(id: number, marketRate: string): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ marketRate, updatedAt: new Date() })
      .where(eq(loads.id, id))
      .returning();
    return load;
  }

  // Negotiations - Enhanced AI features
  async getNegotiations(loadId?: number): Promise<Negotiation[]> {
    const query = loadId 
      ? db.select().from(negotiations).where(eq(negotiations.loadId, loadId))
      : db.select().from(negotiations);
    return await query.orderBy(desc(negotiations.createdAt));
  }

  async getNegotiation(id: number): Promise<Negotiation | undefined> {
    const [negotiation] = await db.select().from(negotiations).where(eq(negotiations.id, id));
    return negotiation;
  }

  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const [negotiation] = await db
      .insert(negotiations)
      .values({
        ...insertNegotiation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return negotiation;
  }

  async updateNegotiationStatus(id: number, status: string, finalRate?: string): Promise<Negotiation | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (finalRate) updates.finalRate = finalRate;
    
    const [negotiation] = await db
      .update(negotiations)
      .set(updates)
      .where(eq(negotiations.id, id))
      .returning();
    return negotiation;
  }

  async addNegotiationStep(id: number, step: any): Promise<Negotiation | undefined> {
    const [current] = await db.select().from(negotiations).where(eq(negotiations.id, id));
    if (!current) return undefined;
    
    const steps = current.negotiationSteps as any[] || [];
    steps.push({ ...step, timestamp: new Date() });
    
    const [negotiation] = await db
      .update(negotiations)
      .set({ 
        negotiationSteps: steps,
        updatedAt: new Date()
      })
      .where(eq(negotiations.id, id))
      .returning();
    return negotiation;
  }

  // Load Board Scraping
  async createScrapingSession(insertSession: InsertScrapingSession): Promise<ScrapingSession> {
    const [session] = await db
      .insert(scrapingSessions)
      .values({
        ...insertSession,
        startedAt: new Date(),
      })
      .returning();
    return session;
  }

  async updateScrapingSession(id: number, updates: Partial<ScrapingSession>): Promise<ScrapingSession | undefined> {
    const [session] = await db
      .update(scrapingSessions)
      .set(updates)
      .where(eq(scrapingSessions.id, id))
      .returning();
    return session;
  }

  async getLatestScrapingSession(source: string): Promise<ScrapingSession | undefined> {
    const [session] = await db
      .select()
      .from(scrapingSessions)
      .where(eq(scrapingSessions.source, source))
      .orderBy(desc(scrapingSessions.startedAt))
      .limit(1);
    return session;
  }

  // Analytics
  async createAnalytic(insertAnalytic: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values({
        ...insertAnalytic,
        createdAt: new Date(),
      })
      .returning();
    return analytic;
  }

  async getAnalytics(companyId: number, metric: string, period: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.companyId, companyId),
          eq(analytics.metric, metric),
          eq(analytics.period, period),
          gte(analytics.date, startDate),
          lte(analytics.date, endDate)
        )
      )
      .orderBy(analytics.date);
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        createdAt: new Date(),
      })
      .returning();
    return notification;
  }

  async getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]> {
    const query = unreadOnly 
      ? db.select().from(notifications).where(
          and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        )
      : db.select().from(notifications).where(eq(notifications.userId, userId));
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Alerts
  async getAlerts(companyId?: number): Promise<Alert[]> {
    const query = companyId 
      ? db.select().from(alerts).where(eq(alerts.companyId, companyId))
      : db.select().from(alerts);
    return await query.orderBy(desc(alerts.createdAt)).limit(10);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values({
        ...insertAlert,
        isRead: insertAlert.isRead ?? false,
        createdAt: new Date(),
      })
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  // Dashboard metrics
  async getDashboardMetrics(companyId?: number): Promise<{
    activeLoads: number;
    availableDrivers: number;
    avgRate: number;
    aiMatches: number;
    totalRevenue: number;
    completedLoads: number;
    avgNegotiationSuccess: number;
  }> {
    // Use SQL aggregations for better performance
    const activeLoadsQuery = companyId 
      ? db.select({ count: sql<number>`count(*)` }).from(loads).where(
          and(eq(loads.companyId, companyId), sql`status IN ('available', 'assigned')`)
        )
      : db.select({ count: sql<number>`count(*)` }).from(loads).where(sql`status IN ('available', 'assigned')`);

    const availableDriversQuery = companyId
      ? db.select({ count: sql<number>`count(*)` }).from(drivers).where(
          and(eq(drivers.companyId, companyId), eq(drivers.status, "available"))
        )
      : db.select({ count: sql<number>`count(*)` }).from(drivers).where(eq(drivers.status, "available"));

    const [activeLoadsResult] = await activeLoadsQuery;
    const [availableDriversResult] = await availableDriversQuery;

    // Calculate average rate and other metrics
    const avgRateQuery = companyId
      ? db.select({ avg: sql<number>`AVG(CAST(rate_per_mile AS DECIMAL))` }).from(loads).where(eq(loads.companyId, companyId))
      : db.select({ avg: sql<number>`AVG(CAST(rate_per_mile AS DECIMAL))` }).from(loads);

    const [avgRateResult] = await avgRateQuery;

    return {
      activeLoads: activeLoadsResult.count || 0,
      availableDrivers: availableDriversResult.count || 0,
      avgRate: Number(avgRateResult.avg) || 0,
      aiMatches: 0, // Calculate from loads with high match scores
      totalRevenue: 0, // Calculate from completed loads
      completedLoads: 0, // Count completed loads
      avgNegotiationSuccess: 0, // Calculate from negotiations
    };
  }
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

export const storage = new DatabaseStorage();
