import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEquipmentSchema, 
  insertWorkPermitSchema, 
  insertEnergyMeasurementSchema, 
  insertAlertSchema,
  insertNetworkNodeSchema,
  insertNetworkConnectionSchema,
  insertNetworkMeterSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Equipment Management
  app.get("/api/equipment", async (req: Request, res: Response) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/:id", async (req: Request, res: Response) => {
    try {
      const equipment = await storage.getEquipmentByEquipmentId(req.params.id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data", error });
    }
  });

  app.put("/api/equipment/:id", async (req: Request, res: Response) => {
    try {
      const equipment = await storage.getEquipment(parseInt(req.params.id));
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      const updatedEquipment = await storage.updateEquipment(equipment.id, req.body);
      res.json(updatedEquipment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update equipment", error });
    }
  });

  // Work Permits
  app.get("/api/permits", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      let permits;
      
      if (status) {
        permits = await storage.getWorkPermitsByStatus(status);
      } else {
        permits = await storage.getAllWorkPermits();
      }
      
      res.json(permits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work permits" });
    }
  });

  app.get("/api/permits/:id", async (req: Request, res: Response) => {
    try {
      const permit = await storage.getWorkPermitByPermitId(req.params.id);
      if (!permit) {
        return res.status(404).json({ message: "Work permit not found" });
      }
      res.json(permit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work permit" });
    }
  });

  app.post("/api/permits", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWorkPermitSchema.parse(req.body);
      const permit = await storage.createWorkPermit(validatedData);
      res.status(201).json(permit);
    } catch (error) {
      res.status(400).json({ message: "Invalid work permit data", error });
    }
  });

  app.put("/api/permits/:id", async (req: Request, res: Response) => {
    try {
      const permit = await storage.getWorkPermit(parseInt(req.params.id));
      if (!permit) {
        return res.status(404).json({ message: "Work permit not found" });
      }

      const updatedPermit = await storage.updateWorkPermit(permit.id, req.body);
      res.json(updatedPermit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update work permit", error });
    }
  });

  // Energy Measurements
  app.get("/api/measurements/:equipmentId", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const measurements = await storage.getEnergyMeasurements(req.params.equipmentId, limit);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post("/api/measurements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEnergyMeasurementSchema.parse(req.body);
      const measurement = await storage.createEnergyMeasurement(validatedData);
      res.status(201).json(measurement);
    } catch (error) {
      res.status(400).json({ message: "Invalid measurement data", error });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const alerts = await storage.getAlerts(status, limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/equipment/:equipmentId", async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getAlertsByEquipmentId(req.params.equipmentId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts for equipment" });
    }
  });

  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data", error });
    }
  });

  app.put("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      const updatedAlert = await storage.updateAlert(alertId, req.body);
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(updatedAlert);
    } catch (error) {
      res.status(400).json({ message: "Failed to update alert", error });
    }
  });

  // Network Visualization
  app.get("/api/network", async (req: Request, res: Response) => {
    try {
      const nodes = await storage.getNetworkNodes();
      const connections = await storage.getNetworkConnections();
      res.json({ nodes, connections });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network data" });
    }
  });
  
  // Network Node Management
  app.post("/api/network/nodes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNetworkNodeSchema.parse(req.body);
      const node = await storage.createNetworkNode(validatedData);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ message: "Invalid network node data", error });
    }
  });
  
  app.put("/api/network/nodes/:id", async (req: Request, res: Response) => {
    try {
      const nodeId = parseInt(req.params.id);
      const updatedNode = await storage.updateNetworkNode(nodeId, req.body);
      if (!updatedNode) {
        return res.status(404).json({ message: "Network node not found" });
      }
      res.json(updatedNode);
    } catch (error) {
      res.status(400).json({ message: "Failed to update network node", error });
    }
  });
  
  // Network Connection Management
  app.post("/api/network/connections", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNetworkConnectionSchema.parse(req.body);
      const connection = await storage.createNetworkConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      res.status(400).json({ message: "Invalid network connection data", error });
    }
  });
  
  app.put("/api/network/connections/:id", async (req: Request, res: Response) => {
    try {
      const connectionId = parseInt(req.params.id);
      const updatedConnection = await storage.updateNetworkConnection(connectionId, req.body);
      if (!updatedConnection) {
        return res.status(404).json({ message: "Network connection not found" });
      }
      res.json(updatedConnection);
    } catch (error) {
      res.status(400).json({ message: "Failed to update network connection", error });
    }
  });
  
  // Delete network node (and all its connections)
  app.delete("/api/network/nodes/:id", async (req: Request, res: Response) => {
    try {
      const nodeId = parseInt(req.params.id);
      const success = await storage.deleteNetworkNode(nodeId);
      if (!success) {
        return res.status(404).json({ message: "Network node not found" });
      }
      res.status(200).json({ success: true, message: "Network node and associated connections deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete network node", error });
    }
  });
  
  // Delete network connection
  app.delete("/api/network/connections/:id", async (req: Request, res: Response) => {
    try {
      const connectionId = parseInt(req.params.id);
      const success = await storage.deleteNetworkConnection(connectionId);
      if (!success) {
        return res.status(404).json({ message: "Network connection not found" });
      }
      res.status(200).json({ success: true, message: "Network connection deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete network connection", error });
    }
  });

  // Network Meters for Energy Balancing
  app.get("/api/network/meters", async (req: Request, res: Response) => {
    try {
      const meters = await storage.getNetworkMeters();
      res.json(meters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network meters", error });
    }
  });
  
  app.get("/api/network/meters/node/:nodeId", async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;
      const meters = await storage.getNetworkMetersByNodeId(nodeId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meters for node", error });
    }
  });
  
  app.get("/api/network/meters/connection/:connectionId", async (req: Request, res: Response) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      const meters = await storage.getNetworkMetersByConnectionId(connectionId);
      res.json(meters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meters for connection", error });
    }
  });
  
  app.post("/api/network/meters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNetworkMeterSchema.parse(req.body);
      const meter = await storage.createNetworkMeter(validatedData);
      res.status(201).json(meter);
    } catch (error) {
      res.status(400).json({ message: "Invalid network meter data", error });
    }
  });
  
  app.put("/api/network/meters/:id", async (req: Request, res: Response) => {
    try {
      const meterId = parseInt(req.params.id);
      const updatedMeter = await storage.updateNetworkMeter(meterId, req.body);
      if (!updatedMeter) {
        return res.status(404).json({ message: "Network meter not found" });
      }
      res.json(updatedMeter);
    } catch (error) {
      res.status(400).json({ message: "Failed to update network meter", error });
    }
  });
  
  app.delete("/api/network/meters/:id", async (req: Request, res: Response) => {
    try {
      const meterId = parseInt(req.params.id);
      const success = await storage.deleteNetworkMeter(meterId);
      if (!success) {
        return res.status(404).json({ message: "Network meter not found" });
      }
      res.status(200).json({ success: true, message: "Network meter deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete network meter", error });
    }
  });

  // User Management
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Exclude password from response
      const safeUsers = users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create HTTP Server
  const httpServer = createServer(app);

  return httpServer;
}
