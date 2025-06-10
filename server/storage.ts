import { 
  users, drivers, loads, negotiations, alerts, companies, scrapingSessions, analytics, notifications,
  wellnessProfiles, mentalHealthAssessments, wellnessResources, wellnessEngagement, 
  crisisSupport, wellnessPlans, wellnessAnalytics,
  type User, type Driver, type Load, type Negotiation, type Alert, type Company, 
  type ScrapingSession, type Analytics, type Notification,
  type WellnessProfile, type MentalHealthAssessment, type WellnessResource,
  type WellnessEngagement, type CrisisSupport, type WellnessPlan, type WellnessAnalytics,
  type InsertUser, type InsertDriver, type InsertLoad, type InsertNegotiation, 
  type InsertAlert, type InsertCompany, type InsertScrapingSession, 
  type InsertAnalytics, type InsertNotification, type InsertWellnessProfile,
  type InsertMentalHealthAssessment, type InsertWellnessResource,
  type InsertWellnessEngagement, type InsertCrisisSupport, type InsertWellnessPlan,
  type InsertWellnessAnalytics
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

  // Wellness and Mental Health Support
  getWellnessProfile(driverId: number): Promise<WellnessProfile | undefined>;
  createWellnessProfile(profile: InsertWellnessProfile): Promise<WellnessProfile>;
  updateWellnessProfile(driverId: number, profile: Partial<InsertWellnessProfile>): Promise<WellnessProfile | undefined>;
  
  createMentalHealthAssessment(assessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment>;
  getDriverAssessments(driverId: number): Promise<MentalHealthAssessment[]>;
  getAssessment(id: number): Promise<MentalHealthAssessment | undefined>;
  
  getWellnessResources(category?: string): Promise<WellnessResource[]>;
  createWellnessResource(resource: InsertWellnessResource): Promise<WellnessResource>;
  
  createWellnessEngagement(engagement: InsertWellnessEngagement): Promise<WellnessEngagement>;
  getDriverEngagement(driverId: number): Promise<WellnessEngagement[]>;
  
  createCrisisSupport(crisis: InsertCrisisSupport): Promise<CrisisSupport>;
  getDriverCrisisHistory(driverId: number): Promise<CrisisSupport[]>;
  updateCrisisSupport(id: number, updates: Partial<InsertCrisisSupport>): Promise<CrisisSupport | undefined>;
  
  createWellnessPlan(plan: InsertWellnessPlan): Promise<WellnessPlan>;
  getDriverWellnessPlans(driverId: number): Promise<WellnessPlan[]>;
  updateWellnessPlan(id: number, plan: Partial<InsertWellnessPlan>): Promise<WellnessPlan | undefined>;
  
  createWellnessAnalytics(analytics: InsertWellnessAnalytics): Promise<WellnessAnalytics>;
  getDriverWellnessAnalytics(driverId: number): Promise<WellnessAnalytics[]>;
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

  // Wellness and Mental Health Support Implementation
  async getWellnessProfile(driverId: number): Promise<WellnessProfile | undefined> {
    const [profile] = await db
      .select()
      .from(wellnessProfiles)
      .where(eq(wellnessProfiles.driverId, driverId));
    return profile;
  }

  async createWellnessProfile(insertProfile: InsertWellnessProfile): Promise<WellnessProfile> {
    const [profile] = await db
      .insert(wellnessProfiles)
      .values({
        ...insertProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return profile;
  }

  async updateWellnessProfile(driverId: number, updates: Partial<InsertWellnessProfile>): Promise<WellnessProfile | undefined> {
    const [profile] = await db
      .update(wellnessProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(wellnessProfiles.driverId, driverId))
      .returning();
    return profile;
  }

  async createMentalHealthAssessment(insertAssessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment> {
    const [assessment] = await db
      .insert(mentalHealthAssessments)
      .values({
        ...insertAssessment,
        completedAt: new Date()
      })
      .returning();
    return assessment;
  }

  async getDriverAssessments(driverId: number): Promise<MentalHealthAssessment[]> {
    return await db
      .select()
      .from(mentalHealthAssessments)
      .where(eq(mentalHealthAssessments.driverId, driverId))
      .orderBy(desc(mentalHealthAssessments.completedAt));
  }

  async getAssessment(id: number): Promise<MentalHealthAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(mentalHealthAssessments)
      .where(eq(mentalHealthAssessments.id, id));
    return assessment;
  }

  async getWellnessResources(category?: string): Promise<WellnessResource[]> {
    const query = db
      .select()
      .from(wellnessResources)
      .where(eq(wellnessResources.isActive, true));

    if (category) {
      return await query.where(eq(wellnessResources.category, category));
    }
    
    return await query;
  }

  async createWellnessResource(insertResource: InsertWellnessResource): Promise<WellnessResource> {
    const [resource] = await db
      .insert(wellnessResources)
      .values({
        ...insertResource,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return resource;
  }

  async createWellnessEngagement(insertEngagement: InsertWellnessEngagement): Promise<WellnessEngagement> {
    const [engagement] = await db
      .insert(wellnessEngagement)
      .values({
        ...insertEngagement,
        startedAt: new Date()
      })
      .returning();
    return engagement;
  }

  async getDriverEngagement(driverId: number): Promise<WellnessEngagement[]> {
    return await db
      .select()
      .from(wellnessEngagement)
      .where(eq(wellnessEngagement.driverId, driverId))
      .orderBy(desc(wellnessEngagement.startedAt));
  }

  async createCrisisSupport(insertCrisis: InsertCrisisSupport): Promise<CrisisSupport> {
    const [crisis] = await db
      .insert(crisisSupport)
      .values({
        ...insertCrisis,
        createdAt: new Date()
      })
      .returning();
    return crisis;
  }

  async getDriverCrisisHistory(driverId: number): Promise<CrisisSupport[]> {
    return await db
      .select()
      .from(crisisSupport)
      .where(eq(crisisSupport.driverId, driverId))
      .orderBy(desc(crisisSupport.createdAt));
  }

  async updateCrisisSupport(id: number, updates: Partial<InsertCrisisSupport>): Promise<CrisisSupport | undefined> {
    const [crisis] = await db
      .update(crisisSupport)
      .set(updates)
      .where(eq(crisisSupport.id, id))
      .returning();
    return crisis;
  }

  async createWellnessPlan(insertPlan: InsertWellnessPlan): Promise<WellnessPlan> {
    const [plan] = await db
      .insert(wellnessPlans)
      .values({
        ...insertPlan,
        startDate: new Date(),
        lastUpdated: new Date()
      })
      .returning();
    return plan;
  }

  async getDriverWellnessPlans(driverId: number): Promise<WellnessPlan[]> {
    return await db
      .select()
      .from(wellnessPlans)
      .where(and(
        eq(wellnessPlans.driverId, driverId),
        eq(wellnessPlans.isActive, true)
      ))
      .orderBy(desc(wellnessPlans.startDate));
  }

  async updateWellnessPlan(id: number, updates: Partial<InsertWellnessPlan>): Promise<WellnessPlan | undefined> {
    const [plan] = await db
      .update(wellnessPlans)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(wellnessPlans.id, id))
      .returning();
    return plan;
  }

  async createWellnessAnalytics(insertAnalytics: InsertWellnessAnalytics): Promise<WellnessAnalytics> {
    const [analytics] = await db
      .insert(wellnessAnalytics)
      .values({
        ...insertAnalytics,
        generatedAt: new Date()
      })
      .returning();
    return analytics;
  }

  async getDriverWellnessAnalytics(driverId: number): Promise<WellnessAnalytics[]> {
    return await db
      .select()
      .from(wellnessAnalytics)
      .where(eq(wellnessAnalytics.driverId, driverId))
      .orderBy(desc(wellnessAnalytics.generatedAt));
  }
}

export const storage = new DatabaseStorage();