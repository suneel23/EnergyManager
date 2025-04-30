import { pgTable, text, serial, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // Admin, Operator, Technician, Viewer
  department: text("department"),
  status: text("status").notNull().default("active"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

// Equipment schema
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().unique(), // Custom ID format for equipment
  name: text("name").notNull(),
  type: text("type").notNull(), // Transformer, Circuit Breaker, Disconnector, etc.
  voltageLevel: text("voltage_level").notNull(), // 110kV, 35kV, 10kV, 6kV
  location: text("location").notNull(),
  status: text("status").notNull().default("operational"), // Operational, Maintenance, Fault
  lastMaintenance: timestamp("last_maintenance"),
  specifications: text("specifications"), // JSON string for technical specs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Work Permit schema
export const workPermits = pgTable("work_permits", {
  id: serial("id").primaryKey(),
  permitId: text("permit_id").notNull().unique(), // Custom ID format for permits
  title: text("title").notNull(),
  description: text("description").notNull(),
  affectedEquipment: text("affected_equipment").notNull(), // Comma-separated equipment IDs
  requestor: integer("requestor").notNull(), // User ID
  approver: integer("approver"), // User ID
  status: text("status").notNull().default("pending"), // Pending, Approved, Completed, Rejected
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkPermitSchema = createInsertSchema(workPermits).omit({
  id: true,
  approver: true,
  createdAt: true,
  updatedAt: true,
});

// Energy Measurement schema
export const energyMeasurements = pgTable("energy_measurements", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull(), // References equipment.equipmentId
  timestamp: timestamp("timestamp").notNull(),
  voltage: real("voltage"), // kV
  current: real("current"), // A
  activePower: real("active_power"), // MW
  reactivePower: real("reactive_power"), // MVAr
  frequency: real("frequency"), // Hz
  temperature: real("temperature"), // Celsius
});

export const insertEnergyMeasurementSchema = createInsertSchema(energyMeasurements).omit({
  id: true,
});

// Alert schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull(), // References equipment.equipmentId
  type: text("type").notNull(), // Warning, Critical, Information
  message: text("message").notNull(),
  value: real("value"),
  threshold: real("threshold"),
  unit: text("unit"),
  status: text("status").notNull().default("active"), // Active, Acknowledged, Resolved
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledgedBy: integer("acknowledged_by"), // User ID
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  acknowledgedBy: true,
  resolvedAt: true,
});

// Network Node schema (for single line diagram)
export const networkNodes = pgTable("network_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  type: text("type").notNull(), // Bus, Junction, Connection Point
  x: real("x").notNull(),
  y: real("y").notNull(),
  label: text("label"),
  voltageLevel: text("voltage_level"),
  status: text("status").notNull().default("energized"), // Energized, De-energized
});

export const insertNetworkNodeSchema = createInsertSchema(networkNodes).omit({
  id: true,
});

// Network Connection schema (for single line diagram)
export const networkConnections = pgTable("network_connections", {
  id: serial("id").primaryKey(),
  sourceNodeId: text("source_node_id").notNull(), // References networkNodes.nodeId
  targetNodeId: text("target_node_id").notNull(), // References networkNodes.nodeId
  type: text("type").notNull(), // Line, Transformer, Circuit Breaker, Disconnector
  equipmentId: text("equipment_id"), // References equipment.equipmentId if applicable
  status: text("status").notNull().default("closed"), // Closed, Open, Fault
});

export const insertNetworkConnectionSchema = createInsertSchema(networkConnections).omit({
  id: true,
});

// Network meters for energy balance verification
export const networkMeters = pgTable("network_meters", {
  id: serial("id").primaryKey(),
  meterId: text("meter_id").notNull().unique(),
  connectionId: integer("connection_id").notNull(),  // Reference to the connection this meter is attached to
  nodeId: text("node_id").notNull(),                 // Reference to the node this meter is attached to
  direction: text("direction").notNull(),            // 'in' or 'out' - direction of power flow 
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull().default("power"),     // power, voltage, current
  unit: text("unit").notNull().default("kW"),        // kW, MW, kV, V, A
  value: real("value").notNull().default(0),         // Default numeric value
  lastUpdated: timestamp("last_updated").defaultNow(),
  status: text("status").notNull().default("active"), // active, inactive, fault
  x: integer("x").notNull(),                         // Position for rendering on diagram
  y: integer("y").notNull(),                         // Position for rendering on diagram
});

// ZONOS Meter Integration
export const zonosMeterDetails = pgTable("zonos_meter_details", {
  id: serial("id").primaryKey(),
  meterId: text("meter_id").notNull().unique(),      // References networkMeters.meterId
  deviceId: text("device_id").notNull().unique(),    // ZONOS device identifier
  serialNumber: text("serial_number").notNull(),     // Meter serial number
  manufacturer: text("manufacturer").notNull(),      // Manufacturer name (e.g., "ZONOS")
  model: text("model").notNull(),                    // Model name (e.g., "ZFA200")
  firmwareVersion: text("firmware_version"),         // Current firmware version
  protocol: text("protocol"),                        // Communication protocol
  communicationStatus: text("communication_status").notNull().default("online"), // online, offline
  lastCommunication: timestamp("last_communication"),// Last successful data exchange
  parameters: text("parameters"),                    // JSON string for technical parameters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ZONOS Meter Readings
export const zonosMeterReadings = pgTable("zonos_meter_readings", {
  id: serial("id").primaryKey(),
  meterId: text("meter_id").notNull(),               // References networkMeters.meterId
  timestamp: timestamp("timestamp").notNull(),
  activePowerImport: real("active_power_import"),    // kW (consumption)
  activePowerExport: real("active_power_export"),    // kW (generation)
  reactivePowerImport: real("reactive_power_import"),// kVAr
  reactivePowerExport: real("reactive_power_export"),// kVAr
  voltageL1: real("voltage_l1"),                     // V
  voltageL2: real("voltage_l2"),                     // V
  voltageL3: real("voltage_l3"),                     // V
  currentL1: real("current_l1"),                     // A
  currentL2: real("current_l2"),                     // A
  currentL3: real("current_l3"),                     // A
  frequency: real("frequency"),                      // Hz
  powerFactor: real("power_factor"),                 // PF
  totalActiveEnergy: real("total_active_energy"),    // kWh
  totalReactiveEnergy: real("total_reactive_energy"),// kVArh
  qualityIndicator: text("quality_indicator"),       // Data quality (valid, estimated, missing)
});

export const insertNetworkMeterSchema = createInsertSchema(networkMeters, {
  value: z.number(),
  x: z.number(),
  y: z.number(),
}).omit({
  id: true,
  lastUpdated: true,
});

export const insertZonosMeterDetailsSchema = createInsertSchema(zonosMeterDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertZonosMeterReadingsSchema = createInsertSchema(zonosMeterReadings).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type WorkPermit = typeof workPermits.$inferSelect;
export type InsertWorkPermit = z.infer<typeof insertWorkPermitSchema>;

export type EnergyMeasurement = typeof energyMeasurements.$inferSelect;
export type InsertEnergyMeasurement = z.infer<typeof insertEnergyMeasurementSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type NetworkNode = typeof networkNodes.$inferSelect;
export type InsertNetworkNode = z.infer<typeof insertNetworkNodeSchema>;

export type NetworkConnection = typeof networkConnections.$inferSelect;
export type InsertNetworkConnection = z.infer<typeof insertNetworkConnectionSchema>;

export type NetworkMeter = typeof networkMeters.$inferSelect;
export type InsertNetworkMeter = z.infer<typeof insertNetworkMeterSchema>;

export type ZonosMeterDetails = typeof zonosMeterDetails.$inferSelect;
export type InsertZonosMeterDetails = z.infer<typeof insertZonosMeterDetailsSchema>;

export type ZonosMeterReading = typeof zonosMeterReadings.$inferSelect;
export type InsertZonosMeterReading = z.infer<typeof insertZonosMeterReadingsSchema>;
