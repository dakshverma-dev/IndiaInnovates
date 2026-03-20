import { randomUUID } from "crypto";

export type UserRole = "citizen" | "worker" | "admin";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  ward?: string;
  wardNumber?: number;
  createdAt: string;
}

export type Priority = "P1" | "P2" | "P3" | "P4";
export type ComplaintStatus = "pending" | "in_progress" | "resolved" | "closed";
export type ComplaintCategory =
  | "pothole" | "garbage" | "streetlight" | "water"
  | "drain" | "electricity" | "tree" | "other";
export type SOSCategory =
  | "gas_leak" | "water_burst" | "electric_hazard"
  | "fire_risk" | "road_accident" | "infrastructure";

export interface Complaint {
  id: string;
  ticketId: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  ward: string;
  wardNumber: number;
  priority: Priority;
  status: ComplaintStatus;
  submittedAt: string;
  resolvedAt?: string;
  submittedBy?: string;
  workerName?: string;
  upvotes: number;
  isCluster: boolean;
  clusterSize?: number;
  aiScore: number;
  rating?: number;
}

export interface SOSAlert {
  id: string;
  category: SOSCategory;
  description: string;
  location: string;
  ward: string;
  wardNumber: number;
  triggeredAt: string;
  status: "active" | "responding" | "resolved";
  respondingWorker?: string;
  triggeredBy?: string;
}

export interface Ward {
  id: string;
  name: string;
  number: number;
  healthScore: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionHours: number;
  population: number;
  area: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  ward: string;
  wardNumber: number;
  score: number;
  resolvedToday: number;
  totalResolved: number;
  avgRating: number;
  status: "active" | "idle" | "on_leave";
  currentTask?: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: number;
}

const WARDS_DATA = [
  { name: "Chandni Chowk", number: 1, area: "Central Delhi" },
  { name: "Karol Bagh", number: 2, area: "West Delhi" },
  { name: "Connaught Place", number: 3, area: "New Delhi" },
  { name: "Saket", number: 4, area: "South Delhi" },
  { name: "Rohini", number: 5, area: "North West Delhi" },
  { name: "Dwarka", number: 6, area: "South West Delhi" },
  { name: "Laxmi Nagar", number: 7, area: "East Delhi" },
  { name: "Janakpuri", number: 8, area: "West Delhi" },
  { name: "Shahdara", number: 9, area: "East Delhi" },
  { name: "Vasant Kunj", number: 10, area: "South Delhi" },
];

const WORKER_NAMES = [
  "Rajesh Kumar","Amit Singh","Priya Sharma","Suresh Gupta","Neha Verma",
  "Vikram Rao","Anita Devi","Mohan Lal","Kavita Singh","Deepak Nair",
  "Sunita Yadav","Ravi Chandra","Pooja Mehta","Arun Kumar","Meena Kumari",
  "Sanjay Tiwari","Rekha Sharma","Lokesh Bajaj","Geeta Singh","Prakash Rao",
];

const COMPLAINT_DESCRIPTIONS: Record<ComplaintCategory, string[]> = {
  pothole: ["Large pothole causing accidents near main road","Deep crater on residential street damaged my vehicle","Multiple potholes on school route, children at risk"],
  garbage: ["Garbage not collected for 5 days, strong smell","Overflowing dustbin near market area","Illegal dumping near colony boundary"],
  streetlight: ["Street lights not working for 2 weeks, safety concern","Lights flickering all night","3 consecutive lights broken in dark lane"],
  water: ["No water supply for 3 days in summer heat","Water coming dirty brown, undrinkable","Pipeline leakage wasting thousands of liters"],
  drain: ["Drain blocked causing waterlogging on road","Sewer overflow entering homes after rain","Open drain near school, mosquito breeding"],
  electricity: ["Power cuts 6-8 hours daily","Transformer sparking visible","Exposed wires on footpath, dangerous"],
  tree: ["Large tree fell on road blocking traffic","Dead branch hanging over power lines","Tree roots damaging water pipes"],
  other: ["Stray dogs attacking residents","Broken footpath tiles causing injuries","Encroachment on public land"],
};

const LOCATIONS = ["Near Metro Station","Main Market","Residential Colony","Hospital Road","School Road","Park Area","Bus Stand","Junction"];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function hoursAgo(h: number): string { return new Date(Date.now() - h * 3600000).toISOString(); }
function genId(): string { return randomUUID(); }
function genTicketId(): string { return `SAI-${rndInt(10000, 99999)}`; }

class AppStorage {
  private users: Map<string, AppUser> = new Map();
  private tokens: Map<string, AuthToken> = new Map();
  private complaints: Complaint[] = [];
  private sosAlerts: SOSAlert[] = [];
  private wards: Ward[] = [];
  private workers: Worker[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed admin user
    const adminId = genId();
    this.users.set(adminId, {
      id: adminId,
      name: "SANKALP Admin",
      phone: "9999999999",
      pin: "000000",
      role: "admin",
      createdAt: new Date().toISOString(),
    });

    // Seed demo citizen
    const citizenId = genId();
    this.users.set(citizenId, {
      id: citizenId,
      name: "Demo Citizen",
      phone: "9876543210",
      pin: "123456",
      role: "citizen",
      createdAt: new Date().toISOString(),
    });

    // Seed workers
    WORKER_NAMES.forEach((name, i) => {
      const ward = WARDS_DATA[i % WARDS_DATA.length];
      const score = rndInt(55, 98);
      this.workers.push({
        id: `w${i}`,
        name,
        phone: `98${rndInt(10000000, 99999999)}`,
        ward: ward.name,
        wardNumber: ward.number,
        score,
        resolvedToday: rndInt(0, 8),
        totalResolved: rndInt(50, 500),
        avgRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
        status: Math.random() < 0.7 ? "active" : Math.random() < 0.5 ? "idle" : "on_leave",
        currentTask: Math.random() < 0.6 ? rnd(["Inspecting pothole","Collecting garbage","Fixing streetlight","Repairing pipeline","Clearing drain"]) : undefined,
      });
    });

    // Seed complaints
    const cats: ComplaintCategory[] = ["pothole","garbage","streetlight","water","drain","electricity","tree","other"];
    for (let i = 0; i < 120; i++) {
      const ward = rnd(WARDS_DATA);
      const category = rnd(cats);
      const hoursBack = rndInt(1, 720);
      const statusRoll = Math.random();
      let status: ComplaintStatus;
      if (statusRoll < 0.25) status = "pending";
      else if (statusRoll < 0.45) status = "in_progress";
      else if (statusRoll < 0.85) status = "resolved";
      else status = "closed";
      const priorityRoll = Math.random();
      let priority: Priority;
      if (priorityRoll < 0.1) priority = "P1";
      else if (priorityRoll < 0.35) priority = "P2";
      else if (priorityRoll < 0.7) priority = "P3";
      else priority = "P4";
      const isCluster = Math.random() < 0.15;
      this.complaints.push({
        id: genId(),
        ticketId: genTicketId(),
        category,
        description: rnd(COMPLAINT_DESCRIPTIONS[category]),
        location: `${rnd(LOCATIONS)}, ${ward.name}`,
        ward: ward.name,
        wardNumber: ward.number,
        priority,
        status,
        submittedAt: hoursAgo(hoursBack),
        resolvedAt: status === "resolved" || status === "closed" ? hoursAgo(Math.max(1, hoursBack - rndInt(2, 48))) : undefined,
        workerName: status !== "pending" ? rnd(WORKER_NAMES) : undefined,
        upvotes: rndInt(0, 150),
        isCluster,
        clusterSize: isCluster ? rndInt(5, 85) : undefined,
        aiScore: rndInt(60, 99),
        rating: status === "resolved" || status === "closed" ? rndInt(1, 5) : undefined,
      });
    }
    this.complaints.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // Seed SOS alerts
    const sosCats: SOSCategory[] = ["gas_leak","water_burst","electric_hazard","fire_risk","road_accident","infrastructure"];
    const sosDescs: Record<SOSCategory, string> = {
      gas_leak: "Strong gas smell detected in residential block",
      water_burst: "Major pipeline burst, water flooding street",
      electric_hazard: "High-tension wire fallen on road",
      fire_risk: "Smoke visible from building, fire suspected",
      road_accident: "Major accident blocking main arterial road",
      infrastructure: "Building wall collapsed, debris on road",
    };
    for (let i = 0; i < 5; i++) {
      const ward = rnd(WARDS_DATA);
      const cat = rnd(sosCats);
      const status: SOSAlert["status"] = i === 0 ? "active" : i === 1 ? "responding" : "resolved";
      this.sosAlerts.push({
        id: genId(),
        category: cat,
        description: sosDescs[cat],
        location: `${rnd(LOCATIONS)}, ${ward.name}`,
        ward: ward.name,
        wardNumber: ward.number,
        triggeredAt: hoursAgo(rndInt(0, 12)),
        status,
        respondingWorker: status !== "active" ? rnd(WORKER_NAMES) : undefined,
      });
    }

    // Compute ward health
    this.recomputeWards();
  }

  private recomputeWards() {
    this.wards = WARDS_DATA.map(w => {
      const wardComplaints = this.complaints.filter(c => c.wardNumber === w.number);
      const resolved = wardComplaints.filter(c => c.status === "resolved" || c.status === "closed").length;
      const pending = wardComplaints.filter(c => c.status === "pending").length;
      const healthScore = Math.min(100, Math.max(20, Math.round(
        (resolved / Math.max(wardComplaints.length, 1)) * 70 +
        (1 - pending / Math.max(wardComplaints.length, 1)) * 30
      )));
      return {
        id: `ward${w.number}`,
        name: w.name,
        number: w.number,
        healthScore,
        totalComplaints: wardComplaints.length,
        resolvedComplaints: resolved,
        pendingComplaints: pending,
        avgResolutionHours: rndInt(4, 72),
        population: rndInt(80000, 350000),
        area: w.area,
      };
    });
  }

  // Auth
  async findUserByPhone(phone: string): Promise<AppUser | undefined> {
    return Array.from(this.users.values()).find(u => u.phone === phone);
  }

  async createUser(data: Omit<AppUser, "id" | "createdAt">): Promise<AppUser> {
    const id = genId();
    const user: AppUser = { ...data, id, createdAt: new Date().toISOString() };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<AppUser | undefined> {
    return this.users.get(id);
  }

  createToken(userId: string): string {
    const token = randomUUID();
    this.tokens.set(token, { token, userId, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 });
    return token;
  }

  validateToken(token: string): AppUser | null {
    const t = this.tokens.get(token);
    if (!t || t.expiresAt < Date.now()) return null;
    return this.users.get(t.userId) || null;
  }

  revokeToken(token: string) {
    this.tokens.delete(token);
  }

  // Complaints
  getComplaints(): Complaint[] { return this.complaints; }

  getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find(c => c.id === id);
  }

  createComplaint(data: Omit<Complaint, "id" | "ticketId" | "submittedAt" | "upvotes" | "aiScore">): Complaint {
    const c: Complaint = {
      ...data,
      id: genId(),
      ticketId: genTicketId(),
      submittedAt: new Date().toISOString(),
      upvotes: 0,
      aiScore: rndInt(70, 95),
    };
    this.complaints.unshift(c);
    this.recomputeWards();
    return c;
  }

  resolveComplaint(id: string, rating?: number): Complaint | null {
    const idx = this.complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.complaints[idx] = { ...this.complaints[idx], status: "resolved", resolvedAt: new Date().toISOString(), rating };
    this.recomputeWards();
    return this.complaints[idx];
  }

  upvoteComplaint(id: string): Complaint | null {
    const idx = this.complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.complaints[idx] = { ...this.complaints[idx], upvotes: this.complaints[idx].upvotes + 1 };
    return this.complaints[idx];
  }

  // SOS
  getSosAlerts(): SOSAlert[] { return this.sosAlerts; }

  createSos(data: Omit<SOSAlert, "id" | "triggeredAt">): SOSAlert {
    const s: SOSAlert = { ...data, id: genId(), triggeredAt: new Date().toISOString() };
    this.sosAlerts.unshift(s);
    return s;
  }

  resolveSos(id: string): SOSAlert | null {
    const idx = this.sosAlerts.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sosAlerts[idx] = { ...this.sosAlerts[idx], status: "resolved" };
    return this.sosAlerts[idx];
  }

  // Wards & Workers
  getWards(): Ward[] { return this.wards; }
  getWorkers(): Worker[] { return this.workers; }

  // Admin stats
  getAdminStats() {
    const total = this.complaints.length;
    const pending = this.complaints.filter(c => c.status === "pending").length;
    const inProgress = this.complaints.filter(c => c.status === "in_progress").length;
    const resolved = this.complaints.filter(c => c.status === "resolved" || c.status === "closed").length;
    const activeSos = this.sosAlerts.filter(s => s.status === "active").length;
    const avgHealth = this.wards.length ? Math.round(this.wards.reduce((s, w) => s + w.healthScore, 0) / this.wards.length) : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayComplaints = this.complaints.filter(c => new Date(c.submittedAt) >= today).length;
    const clusters = this.complaints.filter(c => c.isCluster).length;
    const p1Count = this.complaints.filter(c => c.priority === "P1").length;
    const avgAiScore = total ? Math.round(this.complaints.reduce((s, c) => s + c.aiScore, 0) / total) : 0;
    return { total, pending, inProgress, resolved, activeSos, avgHealth, todayComplaints, clusters, p1Count, avgAiScore, totalUsers: this.users.size, activeWorkers: this.workers.filter(w => w.status === "active").length };
  }
}

export const storage = new AppStorage();
