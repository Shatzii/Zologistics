import { 
  users, drivers, loads, negotiations, alerts, companies, scrapingSessions, analytics, notifications,
  type User, type Driver, type Load, type Negotiation, type Alert, type Company, 
  type ScrapingSession, type Analytics, type Notification,
  type InsertUser, type InsertDriver, type InsertLoad, type InsertNegotiation, 
  type InsertAlert, type InsertCompany, type InsertScrapingSession, 
  type InsertAnalytics, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface LoadFilters {
  status?: string;
  source?: string;
  minRate?: number;
  maxRate?: number;
  equipmentType?: string;
  assignedDriverId?: number;
}

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

export class DatabaseStorage implements IStorage {
  // Users
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date()
      })
      .returning();
    return company;
  }

  // Drivers
  async getDrivers(companyId?: number): Promise<Driver[]> {
    let query = db.select().from(drivers);
    if (companyId) {
      query = query.where(eq(drivers.companyId, companyId));
    }
    return await query.orderBy(drivers.name);
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
        lastActive: new Date()
      })
      .returning();
    return driver;
  }

  async updateDriver(id: number, driverData: Partial<InsertDriver>): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({
        ...driverData,
        lastActive: new Date()
      })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async deleteDriver(id: number): Promise<boolean> {
    const result = await db
      .delete(drivers)
      .where(eq(drivers.id, id));
    return (result.rowCount || 0) > 0;
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

  // Loads
  async getLoads(companyId?: number, filters?: LoadFilters): Promise<Load[]> {
    let query = db.select().from(loads);
    
    const conditions = [];
    
    if (companyId) {
      conditions.push(eq(loads.companyId, companyId));
    }
    
    if (filters?.status) {
      conditions.push(eq(loads.status, filters.status));
    }
    
    if (filters?.source) {
      conditions.push(eq(loads.source, filters.source));
    }
    
    if (filters?.assignedDriverId) {
      conditions.push(eq(loads.assignedDriverId, filters.assignedDriverId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
        lastScraped: new Date()
      })
      .returning();
    return load;
  }

  async updateLoadStatus(id: number, status: string): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(loads.id, id))
      .returning();
    return load;
  }

  async assignLoadToDriver(loadId: number, driverId: number): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ 
        assignedDriverId: driverId,
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(loads.id, loadId))
      .returning();
    return load;
  }

  async updateLoadMarketRate(id: number, marketRate: string): Promise<Load | undefined> {
    const [load] = await db
      .update(loads)
      .set({ 
        marketRate,
        updatedAt: new Date()
      })
      .where(eq(loads.id, id))
      .returning();
    return load;
  }

  // Negotiations
  async getNegotiations(loadId?: number): Promise<Negotiation[]> {
    let query = db.select().from(negotiations);
    if (loadId) {
      query = query.where(eq(negotiations.loadId, loadId));
    }
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
        updatedAt: new Date()
      })
      .returning();
    return negotiation;
  }

  async updateNegotiationStatus(id: number, status: string, finalRate?: string): Promise<Negotiation | undefined> {
    const updates: any = { 
      status, 
      updatedAt: new Date() 
    };
    if (finalRate) updates.finalRate = finalRate;
    
    const [negotiation] = await db
      .update(negotiations)
      .set(updates)
      .where(eq(negotiations.id, id))
      .returning();
    return negotiation;
  }

  async addNegotiationStep(id: number, step: any): Promise<Negotiation | undefined> {
    // This would require updating the steps JSONB field
    // For now, return the negotiation
    return await this.getNegotiation(id);
  }

  // Scraping Sessions
  async createScrapingSession(insertSession: InsertScrapingSession): Promise<ScrapingSession> {
    const [session] = await db
      .insert(scrapingSessions)
      .values(insertSession)
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
      .orderBy(desc(scrapingSessions.startTime))
      .limit(1);
    return session;
  }

  // Analytics
  async createAnalytic(insertAnalytic: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values(insertAnalytic)
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
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    }
    
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
    let query = db.select().from(alerts);
    
    if (companyId) {
      // Note: alerts table might not have companyId field
      // This would need to be added to the schema if needed
    }
    
    return await query.orderBy(desc(alerts.createdAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
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

  // Dashboard Metrics
  async getDashboardMetrics(companyId?: number): Promise<{
    activeLoads: number;
    availableDrivers: number;
    avgRate: number;
    aiMatches: number;
    totalRevenue: number;
    completedLoads: number;
    avgNegotiationSuccess: number;
  }> {
    // Get active loads
    const activeLoadsResult = await db
      .select()
      .from(loads)
      .where(eq(loads.status, 'active'));
    
    // Get available drivers
    const availableDriversResult = await db
      .select()
      .from(drivers)
      .where(eq(drivers.status, 'available'));
    
    // Calculate average rate
    const avgRateResult = await db
      .select()
      .from(loads)
      .where(eq(loads.status, 'completed'));
    
    const avgRate = avgRateResult.length > 0 
      ? avgRateResult.reduce((sum, load) => sum + parseFloat(load.rate || '0'), 0) / avgRateResult.length
      : 0;

    return {
      activeLoads: activeLoadsResult.length,
      availableDrivers: availableDriversResult.length,
      avgRate,
      aiMatches: 0, // Placeholder for AI matching metrics
      totalRevenue: 0, // Would calculate from completed loads
      completedLoads: avgRateResult.length,
      avgNegotiationSuccess: 0 // Would calculate from negotiations
    };
  }
}

export const storage = new DatabaseStorage();