import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEquipmentSchema, 
  insertWorkPermitSchema, 
  insertAlertSchema, 
  insertActivityLogSchema, 
  insertEnergyReadingSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Equipment routes
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/:id", async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const equipment = await storage.getEquipment(equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        action: "CREATE_EQUIPMENT",
        description: `Equipment ${equipment.name} created`,
        userId: req.user?.id,
        entityType: "equipment",
        entityId: equipment.id,
        severity: "info"
      });
      
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.put("/api/equipment/:id", async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.updateEquipment(equipmentId, validatedData);
      
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        action: "UPDATE_EQUIPMENT",
        description: `Equipment ${equipment.name} updated`,
        userId: req.user?.id,
        entityType: "equipment",
        entityId: equipment.id,
        severity: "info"
      });
      
      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update equipment" });
    }
  });

  // Work Permit routes
  app.get("/api/work-permits", async (req, res) => {
    try {
      const workPermits = await storage.getAllWorkPermits();
      res.json(workPermits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work permits" });
    }
  });

  app.get("/api/work-permits/:id", async (req, res) => {
    try {
      const permitId = parseInt(req.params.id);
      const workPermit = await storage.getWorkPermit(permitId);
      if (!workPermit) {
        return res.status(404).json({ message: "Work permit not found" });
      }
      res.json(workPermit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work permit" });
    }
  });

  app.post("/api/work-permits", async (req, res) => {
    try {
      const validatedData = insertWorkPermitSchema.parse(req.body);
      const workPermit = await storage.createWorkPermit(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        action: "CREATE_WORK_PERMIT",
        description: `Work permit ${workPermit.permitNumber} created`,
        userId: req.user?.id,
        entityType: "work_permit",
        entityId: workPermit.id,
        severity: "info"
      });
      
      res.status(201).json(workPermit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid work permit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create work permit" });
    }
  });

  app.put("/api/work-permits/:id", async (req, res) => {
    try {
      const permitId = parseInt(req.params.id);
      const validatedData = insertWorkPermitSchema.parse(req.body);
      const workPermit = await storage.updateWorkPermit(permitId, validatedData);
      
      if (!workPermit) {
        return res.status(404).json({ message: "Work permit not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        action: "UPDATE_WORK_PERMIT",
        description: `Work permit ${workPermit.permitNumber} updated`,
        userId: req.user?.id,
        entityType: "work_permit",
        entityId: workPermit.id,
        severity: "info"
      });
      
      res.json(workPermit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid work permit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update work permit" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const alerts = await storage.getAllAlerts(statusFilter);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        action: "CREATE_ALERT",
        description: `Alert "${alert.title}" created`,
        userId: req.user?.id,
        entityType: "alert",
        entityId: alert.id,
        severity: alert.severity
      });
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.put("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const alert = await storage.resolveAlert(alertId, req.user.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        action: "RESOLVE_ALERT",
        description: `Alert "${alert.title}" resolved`,
        userId: req.user.id,
        entityType: "alert",
        entityId: alert.id,
        severity: "info"
      });
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Activity logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "50");
      const activityLogs = await storage.getActivityLogs(limit);
      res.json(activityLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Energy readings
  app.get("/api/energy-readings", async (req, res) => {
    try {
      const equipmentId = req.query.equipmentId ? parseInt(req.query.equipmentId as string) : undefined;
      const energyReadings = await storage.getEnergyReadings(equipmentId);
      res.json(energyReadings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch energy readings" });
    }
  });

  app.post("/api/energy-readings", async (req, res) => {
    try {
      const validatedData = insertEnergyReadingSchema.parse(req.body);
      const energyReading = await storage.createEnergyReading(validatedData);
      res.status(201).json(energyReading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid energy reading data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create energy reading" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const activeAlerts = await storage.getAllAlerts("active");
      const activeWorkPermits = await storage.getWorkPermitsByStatus("in_progress");
      const recentActivity = await storage.getActivityLogs(5);
      const equipmentSummary = await storage.getEquipmentSummary();
      
      res.json({
        activeAlerts,
        activeWorkPermits,
        recentActivity,
        equipmentSummary
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Users management (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
