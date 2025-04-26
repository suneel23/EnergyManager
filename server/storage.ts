import { 
  users, type User, type InsertUser,
  equipment, type Equipment, type InsertEquipment,
  workPermits, type WorkPermit, type InsertWorkPermit,
  alerts, type Alert, type InsertAlert,
  activityLogs, type ActivityLog, type InsertActivityLog,
  energyReadings, type EnergyReading, type InsertEnergyReading
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: session.SessionStore;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Equipment management
  getEquipment(id: number): Promise<Equipment | undefined>;
  getAllEquipment(): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: InsertEquipment): Promise<Equipment | undefined>;
  getEquipmentSummary(): Promise<{
    transformers: { total: number, online: number, offline: number },
    circuitBreakers: { total: number, closed: number, open: number },
    feeders: { total: number, normal: number, warning: number, fault: number },
    maintenanceDue: number
  }>;
  
  // Work permit management
  getWorkPermit(id: number): Promise<WorkPermit | undefined>;
  getAllWorkPermits(): Promise<WorkPermit[]>;
  getWorkPermitsByStatus(status: string): Promise<WorkPermit[]>;
  createWorkPermit(workPermit: InsertWorkPermit): Promise<WorkPermit>;
  updateWorkPermit(id: number, workPermit: InsertWorkPermit): Promise<WorkPermit | undefined>;
  
  // Alert management
  getAllAlerts(status?: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number, resolvedById: number): Promise<Alert | undefined>;
  
  // Activity logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Energy readings
  getEnergyReadings(equipmentId?: number): Promise<EnergyReading[]>;
  createEnergyReading(reading: InsertEnergyReading): Promise<EnergyReading>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private equipmentData: Map<number, Equipment>;
  private workPermitsData: Map<number, WorkPermit>;
  private alertsData: Map<number, Alert>;
  private activityLogsData: Map<number, ActivityLog>;
  private energyReadingsData: Map<number, EnergyReading>;
  
  private userId: number;
  private equipmentId: number;
  private workPermitId: number;
  private alertId: number;
  private activityLogId: number;
  private energyReadingId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersData = new Map();
    this.equipmentData = new Map();
    this.workPermitsData = new Map();
    this.alertsData = new Map();
    this.activityLogsData = new Map();
    this.energyReadingsData = new Map();
    
    this.userId = 1;
    this.equipmentId = 1;
    this.workPermitId = 1;
    this.alertId = 1;
    this.activityLogId = 1;
    this.energyReadingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with sample data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.usersData.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    return this.equipmentData.get(id);
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipmentData.values());
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentId++;
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipmentData.set(id, equipment);
    return equipment;
  }

  async updateEquipment(id: number, updateData: InsertEquipment): Promise<Equipment | undefined> {
    const equipment = this.equipmentData.get(id);
    if (!equipment) return undefined;
    
    const updatedEquipment: Equipment = { ...equipment, ...updateData, id };
    this.equipmentData.set(id, updatedEquipment);
    return updatedEquipment;
  }

  async getEquipmentSummary(): Promise<{
    transformers: { total: number, online: number, offline: number },
    circuitBreakers: { total: number, closed: number, open: number },
    feeders: { total: number, normal: number, warning: number, fault: number },
    maintenanceDue: number
  }> {
    const allEquipment = Array.from(this.equipmentData.values());
    
    const transformers = allEquipment.filter(eq => eq.type === 'transformer');
    const transformersOnline = transformers.filter(t => t.status === 'operational');
    const transformersOffline = transformers.filter(t => t.status !== 'operational');
    
    const circuitBreakers = allEquipment.filter(eq => eq.type === 'circuit_breaker');
    const circuitBreakersClosed = circuitBreakers.filter(cb => cb.status === 'closed');
    const circuitBreakersOpen = circuitBreakers.filter(cb => cb.status === 'open');
    
    const feeders = allEquipment.filter(eq => eq.type === 'feeder');
    const feedersNormal = feeders.filter(f => f.status === 'operational');
    const feedersWarning = feeders.filter(f => f.status === 'warning');
    const feedersFault = feeders.filter(f => f.status === 'fault');
    
    // Count equipment due for maintenance in the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const maintenanceDue = allEquipment.filter(eq => {
      if (!eq.nextMaintenanceDate) return false;
      const nextMaintenance = new Date(eq.nextMaintenanceDate);
      return nextMaintenance <= thirtyDaysFromNow && nextMaintenance >= now;
    }).length;
    
    return {
      transformers: {
        total: transformers.length,
        online: transformersOnline.length,
        offline: transformersOffline.length
      },
      circuitBreakers: {
        total: circuitBreakers.length,
        closed: circuitBreakersClosed.length,
        open: circuitBreakersOpen.length
      },
      feeders: {
        total: feeders.length,
        normal: feedersNormal.length,
        warning: feedersWarning.length,
        fault: feedersFault.length
      },
      maintenanceDue
    };
  }

  // Work permit methods
  async getWorkPermit(id: number): Promise<WorkPermit | undefined> {
    return this.workPermitsData.get(id);
  }

  async getAllWorkPermits(): Promise<WorkPermit[]> {
    return Array.from(this.workPermitsData.values());
  }
  
  async getWorkPermitsByStatus(status: string): Promise<WorkPermit[]> {
    return Array.from(this.workPermitsData.values()).filter(
      permit => permit.status === status
    );
  }

  async createWorkPermit(insertWorkPermit: InsertWorkPermit): Promise<WorkPermit> {
    const id = this.workPermitId++;
    const createdAt = new Date();
    const workPermit: WorkPermit = { ...insertWorkPermit, id, createdAt };
    this.workPermitsData.set(id, workPermit);
    return workPermit;
  }

  async updateWorkPermit(id: number, updateData: InsertWorkPermit): Promise<WorkPermit | undefined> {
    const workPermit = this.workPermitsData.get(id);
    if (!workPermit) return undefined;
    
    const updatedWorkPermit: WorkPermit = { ...workPermit, ...updateData, id };
    this.workPermitsData.set(id, updatedWorkPermit);
    return updatedWorkPermit;
  }

  // Alert methods
  async getAllAlerts(status?: string): Promise<Alert[]> {
    let alerts = Array.from(this.alertsData.values());
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }
    // Sort by timestamp, most recent first
    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const timestamp = new Date();
    const alert: Alert = { ...insertAlert, id, timestamp };
    this.alertsData.set(id, alert);
    return alert;
  }

  async resolveAlert(id: number, resolvedById: number): Promise<Alert | undefined> {
    const alert = this.alertsData.get(id);
    if (!alert) return undefined;
    
    const resolvedAt = new Date();
    const updatedAlert: Alert = { 
      ...alert, 
      status: 'resolved', 
      resolvedById, 
      resolvedAt 
    };
    
    this.alertsData.set(id, updatedAlert);
    return updatedAlert;
  }

  // Activity log methods
  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    // Sort by timestamp, most recent first
    const logs = Array.from(this.activityLogsData.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return logs.slice(0, limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogId++;
    const timestamp = new Date();
    const log: ActivityLog = { ...insertLog, id, timestamp };
    this.activityLogsData.set(id, log);
    return log;
  }

  // Energy reading methods
  async getEnergyReadings(equipmentId?: number): Promise<EnergyReading[]> {
    let readings = Array.from(this.energyReadingsData.values());
    
    if (equipmentId) {
      readings = readings.filter(reading => reading.equipmentId === equipmentId);
    }
    
    // Sort by timestamp, most recent first
    return readings.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createEnergyReading(insertReading: InsertEnergyReading): Promise<EnergyReading> {
    const id = this.energyReadingId++;
    const timestamp = new Date();
    const reading: EnergyReading = { ...insertReading, id, timestamp };
    this.energyReadingsData.set(id, reading);
    return reading;
  }

  // Seed initial data for testing
  private seedData() {
    // Sample users
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$zDdj0G5oJwR1I5YP3r4DMuKEKdgkEw9x9vkY29QEX0T3ZLQ.RvIGG", // "admin123"
      fullName: "System Administrator",
      role: "admin",
      email: "admin@energyms.com",
      department: "IT",
      isActive: true
    };
    
    const operatorUser: InsertUser = {
      username: "operator",
      password: "$2b$10$7u4Z6GYD.mNxb0vZAIjqVeP9ArXpFcAFHWPaEvn9.xq1d7qGrBCRm", // "operator123"
      fullName: "Alex Johnson",
      role: "operator",
      email: "alex@energyms.com",
      department: "Operations",
      isActive: true
    };
    
    const engineerUser: InsertUser = {
      username: "engineer",
      password: "$2b$10$xJdT05Uw3TqVkSQBZqXMiuC.eJZBf/U9j2Z9lFJhYGN1GZ8mtOF7.", // "engineer123"
      fullName: "Elena Martinez",
      role: "engineer",
      email: "elena@energyms.com",
      department: "Maintenance",
      isActive: true
    };
    
    this.createUser(adminUser);
    this.createUser(operatorUser);
    this.createUser(engineerUser);
    
    // Sample equipment
    // Transformers
    for (let i = 1; i <= 6; i++) {
      const transformer: InsertEquipment = {
        name: `Transformer T${i}`,
        type: "transformer",
        location: i <= 2 ? "Substation A" : i <= 4 ? "Substation B" : "Substation C",
        voltage: i <= 2 ? 110 : i <= 4 ? 35 : 10,
        status: i !== 3 ? "operational" : "maintenance",
        specifications: {
          capacity: `${i * 25} MVA`,
          cooling: "ONAN/ONAF",
          impedance: "8%"
        },
        installationDate: new Date(`2020-0${i}-01`),
        lastMaintenanceDate: new Date(`2023-0${i}-15`),
        nextMaintenanceDate: new Date(`2024-0${i}-15`),
        manufacturerId: `MFG-T${i * 111}`,
        serialNumber: `SN-T${i * 1000}`,
        notes: i === 3 ? "Scheduled for maintenance due to oil leak" : ""
      };
      this.createEquipment(transformer);
    }
    
    // Circuit Breakers
    for (let i = 1; i <= 10; i++) {
      const circuitBreaker: InsertEquipment = {
        name: `Circuit Breaker CB${i}`,
        type: "circuit_breaker",
        location: i <= 4 ? "Substation A" : i <= 7 ? "Substation B" : "Substation C",
        voltage: i <= 4 ? 110 : i <= 7 ? 35 : 10,
        status: i !== 5 && i !== 8 ? "closed" : "open",
        specifications: {
          type: "SF6",
          ratedCurrent: "2000A",
          breakingCapacity: "40kA"
        },
        installationDate: new Date(`2020-0${i % 9 + 1}-15`),
        lastMaintenanceDate: new Date(`2023-0${i % 9 + 1}-01`),
        nextMaintenanceDate: new Date(`2024-0${i % 9 + 1}-01`),
        manufacturerId: `MFG-CB${i * 222}`,
        serialNumber: `SN-CB${i * 2000}`,
        notes: i === 5 ? "Open for maintenance" : i === 8 ? "Opened due to fault" : ""
      };
      this.createEquipment(circuitBreaker);
    }
    
    // Feeders
    for (let i = 1; i <= 12; i++) {
      const feeder: InsertEquipment = {
        name: `Feeder F${Math.ceil(i/3)}-${i % 3 + 1}`,
        type: "feeder",
        location: i <= 6 ? "Distribution Area North" : "Distribution Area South",
        voltage: i <= 3 ? 110 : i <= 6 ? 35 : i <= 9 ? 10 : 6,
        status: i === 7 ? "warning" : i === 11 ? "fault" : "operational",
        specifications: {
          cableType: "ACSR",
          length: `${i * 2.5} km`,
          rating: `${i * 50} A`
        },
        installationDate: new Date(`2021-0${i % 9 + 1}-10`),
        lastMaintenanceDate: new Date(`2023-0${i % 9 + 1}-10`),
        nextMaintenanceDate: new Date(`2024-0${i % 9 + 1}-10`),
        manufacturerId: `MFG-F${i * 333}`,
        serialNumber: `SN-F${i * 3000}`,
        notes: i === 7 ? "Voltage fluctuation detected" : i === 11 ? "Fault detected, crew dispatched" : ""
      };
      this.createEquipment(feeder);
    }
    
    // Sample work permits
    const now = new Date();
    const startTimeToday = new Date(now);
    startTimeToday.setHours(9, 0, 0, 0);
    
    const endTimeToday = new Date(now);
    endTimeToday.setHours(14, 0, 0, 0);
    
    const activeWorkPermit: InsertWorkPermit = {
      permitNumber: "WP-2023-089",
      title: "Maintenance: Feeder Line Repair",
      description: "Emergency repair of Feeder F3-1 due to detected fault. Requires isolation and bypass setup.",
      status: "in_progress",
      startTime: startTimeToday,
      endTime: endTimeToday,
      location: "Substation C - Feeder Group 3",
      requestedById: 3, // Elena
      approvedById: 1, // Admin
      equipmentIds: [11], // Feeder with fault
      safetyMeasures: "Circuit breakers locked out, area cordoned, PPE required"
    };
    
    const startTimeTomorrow = new Date(now);
    startTimeTomorrow.setDate(now.getDate() + 1);
    startTimeTomorrow.setHours(8, 0, 0, 0);
    
    const endTimeTomorrow = new Date(now);
    endTimeTomorrow.setDate(now.getDate() + 1);
    endTimeTomorrow.setHours(16, 0, 0, 0);
    
    const pendingWorkPermit: InsertWorkPermit = {
      permitNumber: "WP-2023-090",
      title: "Transformer Maintenance",
      description: "Scheduled maintenance for Transformer T3 to fix oil leak and perform routine tests.",
      status: "pending",
      startTime: startTimeTomorrow,
      endTime: endTimeTomorrow,
      location: "Substation A - Transformer Bay",
      requestedById: 3, // Elena
      equipmentIds: [3], // Transformer T3
      safetyMeasures: "Full isolation, oil containment equipment, fire safety measures in place"
    };
    
    const startTimeLastWeek = new Date(now);
    startTimeLastWeek.setDate(now.getDate() - 5);
    startTimeLastWeek.setHours(10, 0, 0, 0);
    
    const endTimeLastWeek = new Date(now);
    endTimeLastWeek.setDate(now.getDate() - 5);
    endTimeLastWeek.setHours(15, 0, 0, 0);
    
    const completedWorkPermit: InsertWorkPermit = {
      permitNumber: "WP-2023-088",
      title: "Circuit Breaker Replacement",
      description: "Replacement of aging circuit breaker CB4 with new model.",
      status: "completed",
      startTime: startTimeLastWeek,
      endTime: endTimeLastWeek,
      location: "Substation A - Bay 4",
      requestedById: 3, // Elena
      approvedById: 1, // Admin
      equipmentIds: [8], // Circuit breaker
      safetyMeasures: "Full isolation, lockout/tagout procedures followed"
    };
    
    this.createWorkPermit(activeWorkPermit);
    this.createWorkPermit(pendingWorkPermit);
    this.createWorkPermit(completedWorkPermit);
    
    // Sample alerts
    const feederFaultAlert: InsertAlert = {
      title: "Feeder Failure",
      description: "Feeder F3-1 in Substation C experiencing outage. Estimated repair time: 2 hours.",
      severity: "error",
      status: "active",
      equipmentId: 11,
      notes: "Maintenance team dispatched"
    };
    
    const voltageFluctuationAlert: InsertAlert = {
      title: "Voltage Fluctuation",
      description: "Feeder F2-1 showing voltage fluctuation outside normal parameters (±7%).",
      severity: "warning",
      status: "active",
      equipmentId: 7,
      notes: "Monitoring situation, may require intervention if continues"
    };
    
    const highLoadAlert: InsertAlert = {
      title: "High Load",
      description: "Transformer T2 in Substation B at 82% capacity, approaching threshold.",
      severity: "warning",
      status: "active",
      equipmentId: 2,
      notes: "Load balancing may be required if trend continues"
    };
    
    const resolvedAlert: InsertAlert = {
      title: "Communication Error",
      description: "Lost communication with RTU in Substation B.",
      severity: "warning",
      status: "resolved",
      resolvedById: 2,
      resolvedAt: new Date(now.getTime() - 5 * 3600 * 1000), // 5 hours ago
      notes: "Reset RTU and restored communication"
    };
    
    this.createAlert(feederFaultAlert);
    this.createAlert(voltageFluctuationAlert);
    this.createAlert(highLoadAlert);
    this.createAlert(resolvedAlert);
    
    // Sample activity logs
    this.createActivityLog({
      action: "APPROVE_WORK_PERMIT",
      description: "Work permit #WP-2023-089 approved by John Dawson",
      userId: 1,
      entityType: "work_permit",
      entityId: 1,
      severity: "info"
    });
    
    this.createActivityLog({
      action: "EQUIPMENT_FAULT",
      description: "Feeder F3-1 fault detected. Auto-recovery failed.",
      entityType: "equipment",
      entityId: 11,
      severity: "error"
    });
    
    this.createActivityLog({
      action: "EQUIPMENT_WARNING",
      description: "Voltage fluctuation on Feeder F2-1 exceeds threshold",
      entityType: "equipment",
      entityId: 7,
      severity: "warning"
    });
    
    this.createActivityLog({
      action: "ASSIGN_MAINTENANCE",
      description: "Maintenance team assigned to Substation C",
      userId: 2,
      severity: "info"
    });
    
    this.createActivityLog({
      action: "SYSTEM_BACKUP",
      description: "System backup completed successfully",
      severity: "info"
    });
    
    // Sample energy readings
    const createSampleReadings = (equipmentId: number, baseValue: number, count: number = 24) => {
      const now = new Date();
      for (let i = 0; i < count; i++) {
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - i);
        
        // Add some randomness to values
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const value = baseValue * randomFactor;
        
        const reading: InsertEnergyReading = {
          equipmentId,
          value,
          voltage: equipmentId <= 2 ? 110 : equipmentId <= 4 ? 35 : 10,
          current: baseValue * 10 * randomFactor,
          frequency: 49.9 + Math.random() * 0.3, // 49.9 to 50.2 Hz
          powerFactor: 0.85 + Math.random() * 0.1, // 0.85 to 0.95
          source: "zonus"
        };
        
        this.createEnergyReading(reading);
      }
    };
    
    // Create readings for transformers
    createSampleReadings(1, 40); // Transformer 1 - ~40 MW
    createSampleReadings(2, 45); // Transformer 2 - ~45 MW
    createSampleReadings(3, 20); // Transformer 3 - ~20 MW
    createSampleReadings(4, 22); // Transformer 4 - ~22 MW
    createSampleReadings(5, 8);  // Transformer 5 - ~8 MW
    createSampleReadings(6, 5);  // Transformer 6 - ~5 MW
    
    // Create readings for some feeders
    createSampleReadings(7, 12);  // Feeder - ~12 MW
    createSampleReadings(8, 10);  // Feeder - ~10 MW
    createSampleReadings(11, 8);  // Feeder - ~8 MW (the one with fault)
  }
}

export const storage = new MemStorage();
