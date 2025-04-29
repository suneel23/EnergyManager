import { 
  users, equipment, workPermits, energyMeasurements, alerts, networkNodes, networkConnections,
  type User, type Equipment, type WorkPermit, type EnergyMeasurement, type Alert, 
  type NetworkNode, type NetworkConnection,
  type InsertUser, type InsertEquipment, type InsertWorkPermit, type InsertEnergyMeasurement,
  type InsertAlert, type InsertNetworkNode, type InsertNetworkConnection
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Equipment management
  getEquipment(id: number): Promise<Equipment | undefined>;
  getEquipmentByEquipmentId(equipmentId: string): Promise<Equipment | undefined>;
  getAllEquipment(): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<Equipment>): Promise<Equipment | undefined>;
  
  // Work permit management
  getWorkPermit(id: number): Promise<WorkPermit | undefined>;
  getWorkPermitByPermitId(permitId: string): Promise<WorkPermit | undefined>;
  getAllWorkPermits(): Promise<WorkPermit[]>;
  getWorkPermitsByStatus(status: string): Promise<WorkPermit[]>;
  createWorkPermit(workPermit: InsertWorkPermit): Promise<WorkPermit>;
  updateWorkPermit(id: number, workPermit: Partial<WorkPermit>): Promise<WorkPermit | undefined>;
  
  // Energy measurements
  getEnergyMeasurements(equipmentId: string, limit?: number): Promise<EnergyMeasurement[]>;
  createEnergyMeasurement(measurement: InsertEnergyMeasurement): Promise<EnergyMeasurement>;
  
  // Alerts
  getAlerts(status?: string, limit?: number): Promise<Alert[]>;
  getAlertsByEquipmentId(equipmentId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined>;
  
  // Network visualization
  getNetworkNodes(): Promise<NetworkNode[]>;
  getNetworkConnections(): Promise<NetworkConnection[]>;
  createNetworkNode(node: InsertNetworkNode): Promise<NetworkNode>;
  createNetworkConnection(connection: InsertNetworkConnection): Promise<NetworkConnection>;
  updateNetworkNode(id: number, node: Partial<NetworkNode>): Promise<NetworkNode | undefined>;
  updateNetworkConnection(id: number, connection: Partial<NetworkConnection>): Promise<NetworkConnection | undefined>;
  
  // Session management
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private equipmentMap: Map<number, Equipment>;
  private workPermitsMap: Map<number, WorkPermit>;
  private energyMeasurementsMap: Map<number, EnergyMeasurement>;
  private alertsMap: Map<number, Alert>;
  private networkNodesMap: Map<number, NetworkNode>;
  private networkConnectionsMap: Map<number, NetworkConnection>;
  
  private userIdCounter: number = 1;
  private equipmentIdCounter: number = 1;
  private workPermitIdCounter: number = 1;
  private energyMeasurementIdCounter: number = 1;
  private alertIdCounter: number = 1;
  private networkNodeIdCounter: number = 1;
  private networkConnectionIdCounter: number = 1;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.equipmentMap = new Map();
    this.workPermitsMap = new Map();
    this.energyMeasurementsMap = new Map();
    this.alertsMap = new Map();
    this.networkNodesMap = new Map();
    this.networkConnectionsMap = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      lastLogin: null,
      createdAt: now 
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    return this.equipmentMap.get(id);
  }

  async getEquipmentByEquipmentId(equipmentId: string): Promise<Equipment | undefined> {
    return Array.from(this.equipmentMap.values()).find(
      (equipment) => equipment.equipmentId === equipmentId
    );
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipmentMap.values());
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentIdCounter++;
    const now = new Date();
    const equipment: Equipment = {
      ...insertEquipment,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.equipmentMap.set(id, equipment);
    return equipment;
  }

  async updateEquipment(id: number, equipmentData: Partial<Equipment>): Promise<Equipment | undefined> {
    const equipment = this.equipmentMap.get(id);
    if (!equipment) return undefined;
    
    const updatedEquipment = { 
      ...equipment, 
      ...equipmentData,
      updatedAt: new Date()
    };
    this.equipmentMap.set(id, updatedEquipment);
    return updatedEquipment;
  }

  // Work Permit methods
  async getWorkPermit(id: number): Promise<WorkPermit | undefined> {
    return this.workPermitsMap.get(id);
  }

  async getWorkPermitByPermitId(permitId: string): Promise<WorkPermit | undefined> {
    return Array.from(this.workPermitsMap.values()).find(
      (permit) => permit.permitId === permitId
    );
  }

  async getAllWorkPermits(): Promise<WorkPermit[]> {
    return Array.from(this.workPermitsMap.values());
  }

  async getWorkPermitsByStatus(status: string): Promise<WorkPermit[]> {
    return Array.from(this.workPermitsMap.values()).filter(
      (permit) => permit.status === status
    );
  }

  async createWorkPermit(insertWorkPermit: InsertWorkPermit): Promise<WorkPermit> {
    const id = this.workPermitIdCounter++;
    const now = new Date();
    const workPermit: WorkPermit = {
      ...insertWorkPermit,
      id,
      approver: null,
      createdAt: now,
      updatedAt: now
    };
    this.workPermitsMap.set(id, workPermit);
    return workPermit;
  }

  async updateWorkPermit(id: number, permitData: Partial<WorkPermit>): Promise<WorkPermit | undefined> {
    const permit = this.workPermitsMap.get(id);
    if (!permit) return undefined;
    
    const updatedPermit = { 
      ...permit, 
      ...permitData,
      updatedAt: new Date()
    };
    this.workPermitsMap.set(id, updatedPermit);
    return updatedPermit;
  }

  // Energy Measurement methods
  async getEnergyMeasurements(equipmentId: string, limit?: number): Promise<EnergyMeasurement[]> {
    const measurements = Array.from(this.energyMeasurementsMap.values())
      .filter(m => m.equipmentId === equipmentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? measurements.slice(0, limit) : measurements;
  }

  async createEnergyMeasurement(insertMeasurement: InsertEnergyMeasurement): Promise<EnergyMeasurement> {
    const id = this.energyMeasurementIdCounter++;
    const measurement: EnergyMeasurement = {
      ...insertMeasurement,
      id
    };
    this.energyMeasurementsMap.set(id, measurement);
    return measurement;
  }

  // Alert methods
  async getAlerts(status?: string, limit?: number): Promise<Alert[]> {
    let alerts = Array.from(this.alertsMap.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    
    return limit ? alerts.slice(0, limit) : alerts;
  }

  async getAlertsByEquipmentId(equipmentId: string): Promise<Alert[]> {
    return Array.from(this.alertsMap.values())
      .filter(a => a.equipmentId === equipmentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const alert: Alert = {
      ...insertAlert,
      id,
      acknowledgedBy: null,
      resolvedAt: null
    };
    this.alertsMap.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, alertData: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alertsMap.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...alertData };
    this.alertsMap.set(id, updatedAlert);
    return updatedAlert;
  }

  // Network visualization methods
  async getNetworkNodes(): Promise<NetworkNode[]> {
    return Array.from(this.networkNodesMap.values());
  }

  async getNetworkConnections(): Promise<NetworkConnection[]> {
    return Array.from(this.networkConnectionsMap.values());
  }

  async createNetworkNode(insertNode: InsertNetworkNode): Promise<NetworkNode> {
    const id = this.networkNodeIdCounter++;
    const node: NetworkNode = {
      ...insertNode,
      id
    };
    this.networkNodesMap.set(id, node);
    return node;
  }

  async createNetworkConnection(insertConnection: InsertNetworkConnection): Promise<NetworkConnection> {
    const id = this.networkConnectionIdCounter++;
    const connection: NetworkConnection = {
      ...insertConnection,
      id
    };
    this.networkConnectionsMap.set(id, connection);
    return connection;
  }

  async updateNetworkNode(id: number, nodeData: Partial<NetworkNode>): Promise<NetworkNode | undefined> {
    const node = this.networkNodesMap.get(id);
    if (!node) return undefined;
    
    const updatedNode = { ...node, ...nodeData };
    this.networkNodesMap.set(id, updatedNode);
    return updatedNode;
  }

  async updateNetworkConnection(id: number, connectionData: Partial<NetworkConnection>): Promise<NetworkConnection | undefined> {
    const connection = this.networkConnectionsMap.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...connectionData };
    this.networkConnectionsMap.set(id, updatedConnection);
    return updatedConnection;
  }

  // Initialize demo data
  private async initializeDemoData() {
    // Create admin user with pre-hashed password
    // The hash below is for "admin123" using the same algorithm as in auth.ts
    await this.createUser({
      username: "admin",
      password: "5dca0b845c9fc4273a334208785347c554d8604ff7127d65fc9f5356176fe1c28d6239c53062af4713a649c476c62c77c30dfed15ab3ec97e78e4b82ee3e13cd.2dcd649c1e96a968ba6ad9e21bd011c6",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      department: "IT",
      status: "active"
    });

    // Create sample equipment
    const equipment1 = await this.createEquipment({
      equipmentId: "EQ-1023",
      name: "Transformer T-103",
      type: "Power Transformer",
      voltageLevel: "110/35 kV",
      location: "North Substation",
      status: "operational",
      lastMaintenance: new Date("2023-03-15"),
      specifications: JSON.stringify({
        capacity: "50 MVA",
        cooling: "ONAN/ONAF",
        year: 2018
      })
    });

    const equipment2 = await this.createEquipment({
      equipmentId: "EQ-1024",
      name: "Circuit Breaker CB-35",
      type: "Circuit Breaker",
      voltageLevel: "35 kV",
      location: "North Substation",
      status: "maintenance",
      lastMaintenance: new Date("2023-04-22"),
      specifications: JSON.stringify({
        type: "SF6",
        interruptingCapacity: "40 kA",
        year: 2019
      })
    });

    // Add more equipment
    await this.createEquipment({
      equipmentId: "EQ-1025",
      name: "Disconnector D-12",
      type: "Disconnector",
      voltageLevel: "10 kV",
      location: "East Substation",
      status: "operational",
      lastMaintenance: new Date("2023-02-08"),
      specifications: JSON.stringify({
        type: "Horizontal",
        year: 2020
      })
    });

    await this.createEquipment({
      equipmentId: "EQ-1026",
      name: "Feeder F-12",
      type: "Feeder",
      voltageLevel: "10 kV",
      location: "East Substation",
      status: "operational",
      lastMaintenance: new Date("2023-03-30"),
      specifications: JSON.stringify({
        capacity: "5 MVA",
        cableType: "XLPE",
        year: 2019
      })
    });

    await this.createEquipment({
      equipmentId: "EQ-1027",
      name: "Transformer T-104",
      type: "Power Transformer",
      voltageLevel: "35/10 kV",
      location: "West Substation",
      status: "fault",
      lastMaintenance: new Date("2023-01-20"),
      specifications: JSON.stringify({
        capacity: "25 MVA",
        cooling: "ONAN",
        year: 2017
      })
    });

    // Create alerts
    await this.createAlert({
      equipmentId: "EQ-1023",
      type: "Critical",
      message: "High Voltage on Transformer T-103",
      value: 118.3,
      threshold: 110,
      unit: "kV",
      status: "active",
      timestamp: new Date(Date.now() - 23 * 60 * 1000), // 23 minutes ago
    });

    await this.createAlert({
      equipmentId: "EQ-1024",
      type: "Warning",
      message: "Elevated Temperature on Circuit Breaker CB-35",
      value: 72,
      threshold: 75,
      unit: "°C",
      status: "active",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    });

    await this.createAlert({
      equipmentId: "EQ-1026",
      type: "Information",
      message: "Voltage Stabilized on Feeder F-12",
      value: 10.05,
      threshold: 10.1,
      unit: "kV",
      status: "resolved",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    });

    // Create work permits
    await this.createWorkPermit({
      permitId: "PTW-2023-045",
      title: "Maintenance of Transformer T-103",
      description: "Routine maintenance and oil sampling",
      affectedEquipment: "EQ-1023,EQ-1024",
      requestor: 1, // Admin user
      status: "approved",
      startDate: new Date("2023-05-10T08:00:00"),
      endDate: new Date("2023-05-11T16:00:00")
    });

    await this.createWorkPermit({
      permitId: "PTW-2023-046",
      title: "Cable replacement on Feeder F-12",
      description: "Replace damaged underground cable section",
      affectedEquipment: "EQ-1026,EQ-1025",
      requestor: 1, // Admin user
      status: "approved",
      startDate: new Date("2023-05-12T09:00:00"),
      endDate: new Date("2023-05-12T15:00:00")
    });

    await this.createWorkPermit({
      permitId: "PTW-2023-047",
      title: "Inspection of Circuit Breaker CB-35",
      description: "Regular inspection due to temperature alarm",
      affectedEquipment: "EQ-1024",
      requestor: 1, // Admin user
      status: "pending",
      startDate: new Date("2023-05-15T10:00:00"),
      endDate: new Date("2023-05-15T12:00:00")
    });

    await this.createWorkPermit({
      permitId: "PTW-2023-048",
      title: "Emergency repair of Transformer T-104",
      description: "Fix oil leak and replace gasket",
      affectedEquipment: "EQ-1027",
      requestor: 1, // Admin user
      status: "critical",
      startDate: new Date("2023-05-09T13:00:00"),
      endDate: new Date("2023-05-10T18:00:00")
    });

    // Create energy measurements for demo equipment
    const now = new Date();
    
    // Create measurements for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Transformer T-103 measurements
      await this.createEnergyMeasurement({
        equipmentId: "EQ-1023",
        timestamp,
        voltage: 110 + Math.random() * 8, // 110-118 kV
        current: 250 + Math.random() * 50, // 250-300 A
        activePower: 45 + Math.random() * 5, // 45-50 MW
        reactivePower: 15 + Math.random() * 3, // 15-18 MVAr
        frequency: 49.9 + Math.random() * 0.2, // 49.9-50.1 Hz
        temperature: 60 + Math.random() * 10 // 60-70 °C
      });
      
      // Circuit Breaker CB-35 measurements
      await this.createEnergyMeasurement({
        equipmentId: "EQ-1024",
        timestamp,
        voltage: 35 + Math.random() * 1, // 35-36 kV
        current: 500 + Math.random() * 100, // 500-600 A
        temperature: 65 + Math.random() * 7 // 65-72 °C
      });
    }

    // Create sample network nodes for single line diagram
    await this.createNetworkNode({
      nodeId: "BUS-110-1",
      type: "Bus",
      x: 100,
      y: 100,
      label: "110kV Bus 1",
      voltageLevel: "110kV",
      status: "energized"
    });

    await this.createNetworkNode({
      nodeId: "BUS-35-1",
      type: "Bus",
      x: 100,
      y: 300,
      label: "35kV Bus 1",
      voltageLevel: "35kV",
      status: "energized"
    });

    await this.createNetworkNode({
      nodeId: "BUS-10-1",
      type: "Bus",
      x: 300,
      y: 500,
      label: "10kV Bus 1",
      voltageLevel: "10kV",
      status: "energized"
    });

    // Create connections between nodes
    await this.createNetworkConnection({
      sourceNodeId: "BUS-110-1",
      targetNodeId: "BUS-35-1",
      type: "Transformer",
      equipmentId: "EQ-1023", // Transformer T-103
      status: "closed"
    });

    await this.createNetworkConnection({
      sourceNodeId: "BUS-35-1",
      targetNodeId: "BUS-10-1",
      type: "Transformer", 
      equipmentId: "EQ-1027", // Transformer T-104
      status: "fault"
    });
  }
}

export const storage = new MemStorage();
