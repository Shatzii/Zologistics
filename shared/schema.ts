import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (dispatchers) - Enhanced for multi-user auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("dispatcher"), // 'admin', 'dispatcher', 'driver'
  companyId: integer("company_id"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table for multi-tenant support
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Drivers table - Enhanced for mobile integration
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Link to users table for driver login
  companyId: integer("company_id"),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  currentLocation: text("current_location").notNull(),
  status: text("status").notNull(), // 'available', 'en_route', 'off_duty', 'break'
  phoneNumber: text("phone_number"),
  email: text("email"),
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry"),
  preferences: jsonb("preferences"), // JSON for route preferences, equipment types
  gpsCoordinates: jsonb("gps_coordinates"), // { lat, lng, timestamp }
  deviceToken: text("device_token"), // For push notifications
  isActive: boolean("is_active").default(true),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loads table - Enhanced for real load board integration
export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  externalId: text("external_id").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originCoords: jsonb("origin_coords"), // { lat, lng }
  destinationCoords: jsonb("destination_coords"), // { lat, lng }
  miles: integer("miles").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  ratePerMile: decimal("rate_per_mile", { precision: 10, scale: 2 }).notNull(),
  marketRate: decimal("market_rate", { precision: 10, scale: 2 }), // AI calculated market rate
  pickupTime: timestamp("pickup_time").notNull(),
  deliveryTime: timestamp("delivery_time"),
  status: text("status").notNull(), // 'available', 'assigned', 'in_transit', 'delivered', 'cancelled'
  source: text("source").notNull(), // 'DAT', 'Truckstop', '123LoadBoard'
  sourceUrl: text("source_url"), // Original listing URL
  equipmentType: text("equipment_type"), // 'Van', 'Flatbed', 'Reefer', 'Tanker'
  weight: integer("weight"), // Load weight in pounds
  commodity: text("commodity"), // Type of goods
  specialRequirements: text("special_requirements"),
  matchScore: integer("match_score"), // AI match percentage
  negotiatedRate: decimal("negotiated_rate", { precision: 10, scale: 2 }),
  assignedDriverId: integer("assigned_driver_id"),
  dispatcherId: integer("dispatcher_id"),
  brokerInfo: jsonb("broker_info"), // Broker contact details
  isHotLoad: boolean("is_hot_load").default(false), // Urgent loads
  fuelSurcharge: decimal("fuel_surcharge", { precision: 5, scale: 2 }),
  lastScraped: timestamp("last_scraped"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate negotiations table - Enhanced for AI optimization
export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").notNull(),
  dispatcherId: integer("dispatcher_id"),
  originalRate: decimal("original_rate", { precision: 10, scale: 2 }).notNull(),
  suggestedRate: decimal("suggested_rate", { precision: 10, scale: 2 }).notNull(),
  finalRate: decimal("final_rate", { precision: 10, scale: 2 }),
  marketAnalysis: jsonb("market_analysis"), // AI market conditions analysis
  competitorRates: jsonb("competitor_rates"), // Similar loads pricing
  fuelCostAnalysis: jsonb("fuel_cost_analysis"), // Fuel cost calculations
  status: text("status").notNull(), // 'in_progress', 'accepted', 'rejected', 'counter_offered'
  aiAnalysis: text("ai_analysis"),
  confidenceScore: integer("confidence_score"),
  negotiationSteps: jsonb("negotiation_steps"), // History of back-and-forth
  brokerResponse: text("broker_response"),
  autoNegotiated: boolean("auto_negotiated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Load board scraping sessions for monitoring
export const scrapingSessions = pgTable("scraping_sessions", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // 'DAT', 'Truckstop', '123LoadBoard'
  status: text("status").notNull(), // 'running', 'completed', 'failed'
  loadsFound: integer("loads_found").default(0),
  loadsAdded: integer("loads_added").default(0),
  errors: jsonb("errors"),
  duration: integer("duration"), // in seconds
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Analytics tracking for business intelligence
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  metric: text("metric").notNull(), // 'load_acceptance_rate', 'avg_negotiation_success', etc.
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  metadata: jsonb("metadata"), // Additional context
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobile push notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'new_load', 'rate_update', 'assignment', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional payload
  isRead: boolean("is_read").default(false),
  isPushed: boolean("is_pushed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// System alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'success', 'warning', 'error', 'info'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertLoadSchema = createInsertSchema(loads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastScraped: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScrapingSessionSchema = createInsertSchema(scrapingSessions).omit({
  id: true,
  startedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Load = typeof loads.$inferSelect;
export type InsertLoad = z.infer<typeof insertLoadSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;

export type ScrapingSession = typeof scrapingSessions.$inferSelect;
export type InsertScrapingSession = z.infer<typeof insertScrapingSessionSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
