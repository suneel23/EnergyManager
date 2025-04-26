import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("operator"),
  email: text("email").notNull(),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Equipment model
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // transformer, circuit_breaker, feeder, etc.
  location: text("location").notNull(),
  voltage: real("voltage").notNull(), // kV
  status: text("status").notNull().default("operational"),
  specifications: jsonb("specifications"), // JSON with technical details
  installationDate: timestamp("installation_date"),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  manufacturerId: text("manufacturer_id"),
  serialNumber: text("serial_number"),
  notes: text("notes"),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// Work Permit model
export const workPermits = pgTable("work_permits", {
  id: serial("id").primaryKey(),
  permitNumber: text("permit_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, in_progress, completed, rejected
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location").notNull(),
  requestedById: integer("requested_by_id").notNull(),
  approvedById: integer("approved_by_id"),
  equipmentIds: jsonb("equipment_ids"), // Array of affected equipment IDs
  safetyMeasures: text("safety_measures"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkPermitSchema = createInsertSchema(workPermits).omit({ id: true, createdAt: true });
export type InsertWorkPermit = z.infer<typeof insertWorkPermitSchema>;
export type WorkPermit = typeof workPermits.$inferSelect;

// Alert/Issue model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // info, warning, error
  status: text("status").notNull().default("active"), // active, resolved, ignored
  equipmentId: integer("equipment_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  resolvedById: integer("resolved_by_id"),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, timestamp: true, resolvedAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Activity Log model
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  entityType: text("entity_type"), // user, equipment, work_permit, etc.
  entityId: integer("entity_id"), 
  severity: text("severity").default("info"), // info, warning, error
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, timestamp: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Energy Reading model
export const energyReadings = pgTable("energy_readings", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  value: real("value").notNull(), // MW
  voltage: real("voltage"), // kV
  current: real("current"), // A
  frequency: real("frequency"), // Hz
  powerFactor: real("power_factor"),
  source: text("source").default("zonus"), // Source of the reading (e.g., zonus)
});

export const insertEnergyReadingSchema = createInsertSchema(energyReadings).omit({ id: true, timestamp: true });
export type InsertEnergyReading = z.infer<typeof insertEnergyReadingSchema>;
export type EnergyReading = typeof energyReadings.$inferSelect;
