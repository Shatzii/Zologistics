import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (dispatchers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

// Drivers table
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  currentLocation: text("current_location").notNull(),
  status: text("status").notNull(), // 'available', 'en_route', 'off_duty'
  phoneNumber: text("phone_number"),
  preferences: text("preferences"), // JSON string for route preferences
});

// Loads table
export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  miles: integer("miles").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  ratePerMile: decimal("rate_per_mile", { precision: 10, scale: 2 }).notNull(),
  pickupTime: timestamp("pickup_time").notNull(),
  status: text("status").notNull(), // 'available', 'assigned', 'in_transit', 'delivered'
  source: text("source").notNull(), // 'DAT', 'Truckstop', '123LoadBoard'
  matchScore: integer("match_score"), // AI match percentage
  assignedDriverId: integer("assigned_driver_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rate negotiations table
export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").notNull(),
  originalRate: decimal("original_rate", { precision: 10, scale: 2 }).notNull(),
  suggestedRate: decimal("suggested_rate", { precision: 10, scale: 2 }).notNull(),
  finalRate: decimal("final_rate", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // 'in_progress', 'accepted', 'rejected'
  aiAnalysis: text("ai_analysis"),
  confidenceScore: integer("confidence_score"),
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
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
});

export const insertLoadSchema = createInsertSchema(loads).omit({
  id: true,
  createdAt: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
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

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Load = typeof loads.$inferSelect;
export type InsertLoad = z.infer<typeof insertLoadSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
