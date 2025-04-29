import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeSystemLogs, generateEnergyRecommendations } from './ai-utils';
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
  
  // System logs routes
  app.get("/api/logs", async (req: Request, res: Response) => {
    try {
      // In a real system, these would come from a database or log files
      // For now, we'll generate mock logs
      const { timeRange, component, severity } = req.query;
      
      // Mock log data generation
      const now = new Date();
      const daysBack = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      
      const components = ["network", "equipment", "auth", "database", "api", "scheduler"];
      const sources = ["server", "client", "database", "external-api"];
      const severities = ["info", "warning", "error", "critical"];
      const messages = [
        "System started successfully",
        "Connection established",
        "User login attempt",
        "Authentication failed",
        "Database connection timeout",
        "API rate limit exceeded",
        "Equipment status changed",
        "Measurement value out of range",
        "Node communication lost",
        "Backup completed",
        "Configuration updated",
        "Scheduled maintenance started",
        "Memory usage high"
      ];
      
      const logs = Array.from({ length: 200 }, (_, i) => {
        const randomDate = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        
        return {
          id: i + 1,
          timestamp: randomDate.toISOString(),
          component: components[Math.floor(Math.random() * components.length)],
          severity: randomSeverity,
          message: messages[Math.floor(Math.random() * messages.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          details: randomSeverity === "error" || randomSeverity === "critical" 
            ? "Error stack trace or additional diagnostic information would appear here."
            : undefined
        };
      });
      
      // Sort by timestamp (newest first)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply filters if provided
      let filteredLogs = logs;
      if (component && component !== "all") {
        filteredLogs = filteredLogs.filter(log => log.component === component);
      }
      if (severity && severity !== "all") {
        filteredLogs = filteredLogs.filter(log => log.severity === severity);
      }
      
      res.json(filteredLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch system logs" });
    }
  });
  
  // AI-powered predictive log analysis
  
  app.get("/api/logs/analysis", async (req: Request, res: Response) => {
    try {
      // Get logs first
      const { timeRange } = req.query;
      const now = new Date();
      const daysBack = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      
      const components = ["network", "equipment", "auth", "database", "api", "scheduler"];
      const sources = ["server", "client", "database", "external-api"];
      const severities = ["info", "warning", "error", "critical"];
      const messages = [
        "System started successfully",
        "Connection established",
        "User login attempt",
        "Authentication failed",
        "Database connection timeout",
        "API rate limit exceeded",
        "Equipment status changed",
        "Measurement value out of range",
        "Node communication lost",
        "Backup completed",
        "Configuration updated",
        "Scheduled maintenance started",
        "Memory usage high",
        "CPU usage spike detected",
        "Network packet loss detected",
        "Transformer temperature above threshold",
        "Voltage fluctuation detected",
        "Circuit breaker tripped"
      ];
      
      // Generate more detailed logs for AI analysis
      const logs = Array.from({ length: 150 }, (_, i) => {
        const randomDate = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
        const randomComponent = components[Math.floor(Math.random() * components.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        
        // Create patterns in the logs for the AI to detect
        let message = messages[Math.floor(Math.random() * messages.length)];
        
        // Add some specific patterns for equipment components
        if (randomComponent === "equipment" && Math.random() > 0.7) {
          const equipmentTypes = ["Transformer", "Generator", "Circuit Breaker", "Switchgear", "Battery Storage"];
          const equipmentId = `EQ-${1000 + Math.floor(Math.random() * 100)}`;
          const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
          
          if (Math.random() > 0.8) {
            message = `${equipmentType} ${equipmentId} temperature rising steadily, now at ${Math.floor(60 + Math.random() * 40)}°C`;
          } else if (Math.random() > 0.6) {
            message = `${equipmentType} ${equipmentId} performance below expected parameters`;
          } else if (Math.random() > 0.4) {
            message = `Scheduled maintenance for ${equipmentType} ${equipmentId} is overdue by ${Math.floor(Math.random() * 60)} days`;
          }
        }
        
        // Add some specific patterns for network components
        if (randomComponent === "network" && Math.random() > 0.7) {
          const networkParts = ["substation", "feeder", "distribution line", "meter", "controller"];
          const nodeId = `NODE-${100 + Math.floor(Math.random() * 50)}`;
          const networkPart = networkParts[Math.floor(Math.random() * networkParts.length)];
          
          if (Math.random() > 0.7) {
            message = `Communication with ${networkPart} ${nodeId} interrupted for ${Math.floor(Math.random() * 30)} seconds`;
          } else if (Math.random() > 0.5) {
            message = `Power quality issue detected at ${networkPart} ${nodeId}`;
          } else {
            message = `Network topology change detected, ${networkPart} ${nodeId} reconfigured`;
          }
        }
        
        return {
          id: i + 1,
          timestamp: randomDate.toISOString(),
          component: randomComponent,
          severity: randomSeverity,
          message: message,
          source: sources[Math.floor(Math.random() * sources.length)],
          details: randomSeverity === "error" || randomSeverity === "critical" 
            ? "Error stack trace or additional diagnostic information would appear here."
            : undefined
        };
      });
      
      // Sort by timestamp (newest first)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Analyze logs with AI
      const analysis = await analyzeSystemLogs(logs);
      
      res.json({
        logs: logs.slice(0, 50), // Send a subset of logs for context
        analysis
      });
    } catch (error) {
      console.error("Error analyzing logs:", error);
      res.status(500).json({ error: "Failed to analyze system logs" });
    }
  });
  
  // AI-powered energy optimization recommendations
  app.get("/api/recommendations/energy", async (req: Request, res: Response) => {
    try {
      // Get energy data and equipment data for analysis
      const now = new Date();
      
      // Create mock energy measurement data
      const energyData = [];
      
      // Generate data for the past 30 days
      for (let day = 29; day >= 0; day--) {
        const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        
        // Generate hourly measurements for this day
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0);
          
          // Create a consumption pattern with morning and evening peaks
          let baseConsumption = 500; // Base load in kW
          
          // Add time-of-day pattern
          if (hour >= 7 && hour <= 10) {
            // Morning peak
            baseConsumption += 200 + Math.random() * 300;
          } else if (hour >= 17 && hour <= 21) {
            // Evening peak
            baseConsumption += 300 + Math.random() * 400;
          } else if (hour >= 23 || hour <= 5) {
            // Night time low
            baseConsumption = 300 + Math.random() * 100;
          }
          
          // Add weekday/weekend pattern
          const isWeekend = [0, 6].includes(date.getDay());
          if (isWeekend) {
            baseConsumption = baseConsumption * 0.8; // Less consumption on weekends
          }
          
          // Add some randomness
          const consumption = baseConsumption * (0.9 + Math.random() * 0.2);
          
          // Add some inefficiency patterns
          let efficiency = 0.85 + Math.random() * 0.1; // 85-95% efficiency
          
          // Gradually introduce an efficiency problem in one area
          if (day < 10 && hour >= 12 && hour <= 15) {
            efficiency -= (10 - day) * 0.01; // Gradually decreasing efficiency over the last 10 days
          }
          
          energyData.push({
            timestamp: timestamp.toISOString(),
            totalConsumptionKW: consumption,
            efficiency: efficiency,
            powerFactor: 0.92 + Math.random() * 0.08,
            areaBreakdown: {
              industrial: consumption * (0.4 + Math.random() * 0.1),
              commercial: consumption * (0.3 + Math.random() * 0.05),
              residential: consumption * (0.2 + Math.random() * 0.05),
              other: consumption * (0.1 + Math.random() * 0.03)
            },
            peakDemand: hour >= 17 && hour <= 19 ? consumption * 1.2 : consumption,
            temperature: 20 + Math.random() * 15 // External temperature affects energy consumption
          });
        }
      }
      
      // Create mock equipment data
      const equipmentTypes = [
        "Transformer", "Switchgear", "Generator", "Battery Storage",
        "Solar Inverter", "Distribution Panel", "Circuit Breaker"
      ];
      
      const equipmentData = Array.from({ length: 20 }, (_, i) => {
        const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        const installDate = new Date(now.getFullYear() - Math.floor(Math.random() * 8), 
                                    Math.floor(Math.random() * 12), 
                                    Math.floor(Math.random() * 28));
        
        // Calculate age in years
        const ageInYears = (now.getTime() - installDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        
        // Efficiency decreases with age
        let efficiency = 0.95 - (ageInYears * 0.01);
        efficiency = Math.max(0.75, efficiency); // Set minimum efficiency to 75%
        
        // Last maintenance date
        const lastMaintenance = new Date(now.getTime() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000);
        
        // Days since last maintenance
        const daysSinceLastMaintenance = Math.floor((now.getTime() - lastMaintenance.getTime()) / (24 * 60 * 60 * 1000));
        
        // Maintenance status
        let maintenanceStatus = "Good";
        if (daysSinceLastMaintenance > 365) {
          maintenanceStatus = "Overdue";
        } else if (daysSinceLastMaintenance > 300) {
          maintenanceStatus = "Due Soon";
        }
        
        // Load factor (ratio of average load to peak load)
        const loadFactor = 0.6 + Math.random() * 0.3;
        
        return {
          id: i + 1,
          equipmentId: `EQ-${1000 + i}`,
          name: `${equipmentType} ${1000 + i}`,
          type: equipmentType,
          location: ["Substation A", "Substation B", "Main Plant", "Distribution Center", "Control Room"][Math.floor(Math.random() * 5)],
          installationDate: installDate.toISOString(),
          lastMaintenanceDate: lastMaintenance.toISOString(),
          maintenanceStatus: maintenanceStatus,
          operatingHours: Math.floor(ageInYears * 8760 * (0.7 + Math.random() * 0.3)),
          efficiency: efficiency,
          loadFactor: loadFactor,
          nominalPowerKW: [50, 100, 250, 500, 1000][Math.floor(Math.random() * 5)],
          voltageLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          condition: efficiency > 0.9 ? "Excellent" : efficiency > 0.85 ? "Good" : efficiency > 0.8 ? "Fair" : "Poor"
        };
      });
      
      // Get AI-powered recommendations
      const recommendations = await generateEnergyRecommendations(energyData, equipmentData);
      
      res.json({
        recommendations,
        energyDataSample: energyData.filter((_, i) => i % 24 === 0).slice(0, 10), // Just send daily samples for context
        equipmentDataSample: equipmentData.slice(0, 5) // Send a subset of equipment data for context
      });
    } catch (error) {
      console.error("Error generating energy recommendations:", error);
      res.status(500).json({ error: "Failed to generate energy recommendations" });
    }
  });
  
  // Energy reports routes
  app.get("/api/reports/energy", async (req: Request, res: Response) => {
    try {
      const { type, timeRange } = req.query;
      
      // In a real system, these would come from measurements and calculations
      // For now, we'll generate mock data
      const now = new Date();
      const report = {
        id: "report-1",
        name: "Energy Consumption Report",
        description: "Detailed energy consumption and generation data",
        generatedAt: now.toISOString(),
        timeRange: {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: now.toISOString()
        },
        totalConsumption: 12450.75,
        totalGeneration: 4250.30,
        peakDemand: 875.25,
        equipmentData: []
      };
      
      // Mock equipment data
      const equipmentList = [
        { id: "EQ-1023", name: "Transformer TR-101" },
        { id: "EQ-1024", name: "Main Switchgear" },
        { id: "EQ-1025", name: "Solar Array" },
        { id: "EQ-1026", name: "Battery Storage" },
        { id: "EQ-1027", name: "Distribution Panel DP-01" }
      ];
      
      // Generate data for each equipment
      equipmentList.forEach(eq => {
        const dataPoints = [];
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(now.getFullYear(), now.getMonth(), day);
          
          // Skip future dates
          if (date > now) continue;
          
          // Add consumption data
          dataPoints.push({
            timestamp: new Date(date.getFullYear(), date.getMonth(), day, 12, 0, 0).toISOString(),
            value: eq.id === "EQ-1025" ? 0 : Math.random() * 100 + 50,
            type: "consumption",
            unit: "kWh"
          });
          
          // Add generation data only for the solar array
          if (eq.id === "EQ-1025") {
            dataPoints.push({
              timestamp: new Date(date.getFullYear(), date.getMonth(), day, 12, 0, 0).toISOString(),
              value: Math.random() * 200 + 100,
              type: "generation",
              unit: "kWh"
            });
          }
        }
        
        report.equipmentData.push({
          equipmentId: eq.id,
          name: eq.name,
          data: dataPoints
        });
      });
      
      res.json([report]);
    } catch (error) {
      console.error("Error generating energy report:", error);
      res.status(500).json({ error: "Failed to generate energy report" });
    }
  });

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
