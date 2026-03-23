import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ward {
  id: number;
  name: string;
  health_score: number;
  complaint_count: number;
  resolved_count: number;
}

export interface Officer {
  id: number;
  name: string;
  phone: string;
  gps_lat: number;
  gps_lng: number;
  ward_id: number;
  karma_score: number;
}

export interface Complaint {
  id: string;
  phone: string;
  message: string;
  category: string;
  priority: "P1" | "P2" | "P3" | "P4";
  ward_id: number;
  status: "pending" | "assigned" | "in_progress" | "resolved" | "closed";
  assigned_officer_id: number | null;
  created_at: string;
  resolved_at: string | null;
  duplicate_of: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  photo_path: string | null;
  ai_summary: string | null;
  // community features
  upvotes: number;
  upvoted_by: string[];
  satisfaction: "satisfied" | "unsatisfied" | null;
  feedback_note: string | null;
  feedback_at: string | null;
  // joined fields
  ward_name?: string;
  officer_name?: string;
}

export interface AuditEntry {
  id: number;
  ticket_id: string;
  action: string;
  officer_id: number | null;
  timestamp: string;
  prev_hash: string | null;
  curr_hash: string;
  officer_name?: string;
}

export interface Prediction {
  id: number;
  ward_id: number;
  category: string;
  predicted_date: string;
  confidence: number;
  created_at: string;
  ward_name?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: "admin" | "citizen" | "officer";
  created_at: string;
}

// ─── Ward data ────────────────────────────────────────────────────────────────

const NAMED_WARDS: { id: number; name: string }[] = [
  { id: 1, name: "Adarsh Nagar" },
  { id: 2, name: "Alipur" },
  { id: 3, name: "Ambedkar Nagar" },
  { id: 4, name: "Anand Vihar" },
  { id: 5, name: "Ashok Vihar" },
  { id: 6, name: "Badarpur" },
  { id: 7, name: "Bawana" },
  { id: 8, name: "Bijwasan" },
  { id: 9, name: "Burari" },
  { id: 10, name: "Chandni Chowk" },
  { id: 11, name: "Chhatarpur" },
  { id: 12, name: "Civil Lines" },
  { id: 13, name: "Connaught Place" },
  { id: 14, name: "Karol Bagh" },
  { id: 15, name: "Keshav Puram" },
  { id: 16, name: "Krishna Nagar" },
  { id: 17, name: "Laxmi Nagar" },
  { id: 18, name: "Madipur" },
  { id: 19, name: "Malviya Nagar" },
  { id: 20, name: "Mangolpuri" },
  { id: 21, name: "Mayur Vihar" },
  { id: 22, name: "Model Town" },
  { id: 23, name: "Rohini" },
  { id: 24, name: "Saket" },
  { id: 25, name: "Sarita Vihar" },
  { id: 26, name: "Seelampur" },
  { id: 27, name: "Shahdara" },
  { id: 28, name: "Shakur Basti" },
  { id: 29, name: "Tilak Nagar" },
  { id: 30, name: "Trinagar" },
  { id: 31, name: "Uttam Nagar" },
  { id: 32, name: "Vasant Kunj" },
  { id: 33, name: "Vikaspuri" },
  { id: 34, name: "Wazirpur" },
  { id: 35, name: "Narela" },
  { id: 36, name: "Palam" },
  { id: 37, name: "Patparganj" },
  { id: 38, name: "Preet Vihar" },
  { id: 39, name: "Rithala" },
  { id: 40, name: "Sadar Bazar" },
  { id: 41, name: "Shastri Park" },
  { id: 42, name: "Lajpat Nagar" },
  { id: 43, name: "Dwarka" },
  { id: 44, name: "Janakpuri" },
  { id: 45, name: "Govindpuri" },
  { id: 46, name: "Okhla" },
  { id: 47, name: "Rajouri Garden" },
  { id: 48, name: "Pitampura" },
  { id: 49, name: "Hari Nagar" },
  { id: 50, name: "Mustafabad" },
];

function buildWards(): Ward[] {
  const wards: Ward[] = [];
  for (let i = 1; i <= 272; i++) {
    const named = NAMED_WARDS.find((w) => w.id === i);
    wards.push({
      id: i,
      name: named ? named.name : `Ward ${i}`,
      health_score: 55 + Math.floor(Math.random() * 40),
      complaint_count: 0,
      resolved_count: 0,
    });
  }
  return wards;
}

function buildOfficers(wards: Ward[]): Officer[] {
  const names = [
    "Rajan Sharma", "Priya Singh", "Amit Kumar", "Sunita Verma", "Deepak Gupta",
    "Kavita Rao", "Suresh Patel", "Anita Joshi", "Rahul Mehta", "Neha Agarwal",
    "Vikram Nair", "Pooja Chauhan", "Arun Tiwari", "Meena Pandey", "Sanjay Malhotra",
    "Ritu Dubey", "Manoj Srivastava", "Anjali Mishra", "Vinod Yadav", "Shruti Kapoor",
  ];
  const wardSubset = [1, 2, 3, 4, 5, 10, 14, 21, 23, 24, 27, 32, 33, 42, 43, 44, 45, 46, 47, 48];
  return names.map((name, i) => ({
    id: i + 1,
    name,
    phone: `98${String(10000000 + i).padStart(8, "0")}`,
    gps_lat: 28.4 + Math.random() * 0.7,
    gps_lng: 76.9 + Math.random() * 0.8,
    ward_id: wardSubset[i % wardSubset.length],
    karma_score: 50 + Math.floor(Math.random() * 45),
  }));
}

const CATEGORIES = ["Sanitation", "Roads", "Streetlight", "Water Supply", "Drainage", "Electricity", "Tree", "General Grievance"];
const PRIORITIES: Complaint["priority"][] = ["P1", "P2", "P3", "P4"];
const STATUSES: Complaint["status"][] = ["pending", "assigned", "in_progress", "resolved"];

function buildComplaints(wards: Ward[], officers: Officer[]): Complaint[] {
  const complaints: Complaint[] = [];
  const messages = [
    "Nali jamm gayi hai, paani bhar gaya sadak par",
    "Street light kharab hai raat ko andhera rehta hai",
    "Sadak par bada gaḍḍha hai, accident ho sakta hai",
    "Paani ki pipe phoot gayi hai",
    "Kachra uthane wale 3 din se nahi aaye",
    "Bijli ka wire neeche latkaa hua hai, bahut khatarnak hai",
    "Drainage system block ho gaya hai",
    "Pedo ki katai nahi hui, raagte mein aadat ho gayi",
    "Garbage not collected for 5 days, causing health hazard",
    "Pothole on main road causing accidents",
    "Water supply disrupted for 2 days",
    "Street light not working, dangerous at night",
    "Sewage water overflowing on road",
    "Fallen tree blocking road after storm",
    "Illegal parking causing traffic jam",
  ];

  for (let i = 0; i < 50; i++) {
    const ward = wards[Math.floor(Math.random() * 50)]; // use first 50 wards
    const officer = officers.find((o) => o.ward_id === ward.id) || officers[0];
    const category = CATEGORIES[i % CATEGORIES.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const statusIndex = i < 20 ? 0 : i < 35 ? 2 : 3; // 20 pending, 15 in_progress, 15 resolved
    const status = STATUSES[statusIndex];
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const createdAt = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    const resolvedAt = status === "resolved"
      ? new Date(Date.now() - Math.floor(Math.random() * 24) * 3600 * 1000).toISOString()
      : null;

    complaints.push({
      id: uuidv4(),
      phone: `98765${String(43210 + i).padStart(5, "0")}`,
      message: messages[i % messages.length],
      category,
      priority,
      ward_id: ward.id,
      status,
      assigned_officer_id: officer.id,
      created_at: createdAt,
      resolved_at: resolvedAt,
      duplicate_of: null,
      gps_lat: ward.id <= 50 ? (28.4 + Math.random() * 0.7) : null,
      gps_lng: ward.id <= 50 ? (76.9 + Math.random() * 0.8) : null,
      photo_path: null,
      ai_summary: `${category} issue reported in ${ward.name}`,
      upvotes: i < 5 ? Math.floor(Math.random() * 8) + 1 : 0,
      upvoted_by: [],
      satisfaction: status === "resolved" && i % 3 === 0 ? "satisfied" : status === "resolved" && i % 3 === 1 ? "unsatisfied" : null,
      feedback_note: null,
      feedback_at: null,
    });
  }
  return complaints;
}

// ─── Store ────────────────────────────────────────────────────────────────────

class InMemoryStore {
  wards: Ward[] = buildWards();
  officers: Officer[] = buildOfficers(this.wards);
  complaints: Complaint[] = [];
  auditLog: AuditEntry[] = [];
  auditIdCounter = 1;
  predictions: Prediction[] = [];
  users: User[] = [
    { id: "admin-001", name: "Admin", phone: "9999999999", pin: "000000", role: "admin", created_at: new Date().toISOString() },
    { id: "citizen-001", name: "Demo Citizen", phone: "9876543210", pin: "123456", role: "citizen", created_at: new Date().toISOString() },
    { id: "officer-001", name: "Amit Kumar", phone: "9876500001", pin: "111111", role: "officer", created_at: new Date().toISOString() },
  ];

  constructor() {
    this.complaints = buildComplaints(this.wards, this.officers);
    this.recalculateAllWardStats();
    this.buildPredictions();
    this.buildAuditTrailForExisting();
  }

  private recalculateAllWardStats() {
    for (const ward of this.wards) {
      const wardComplaints = this.complaints.filter((c) => c.ward_id === ward.id);
      ward.complaint_count = wardComplaints.length;
      ward.resolved_count = wardComplaints.filter((c) => c.status === "resolved").length;
    }
  }

  private buildPredictions() {
    const monsoon: Prediction[] = [
      { id: 1, ward_id: 42, category: "Drainage", predicted_date: "2026-07-15", confidence: 0.92, created_at: new Date().toISOString(), ward_name: "Lajpat Nagar" },
      { id: 2, ward_id: 23, category: "Roads", predicted_date: "2026-07-20", confidence: 0.87, created_at: new Date().toISOString(), ward_name: "Rohini" },
      { id: 3, ward_id: 14, category: "Sanitation", predicted_date: "2026-07-18", confidence: 0.85, created_at: new Date().toISOString(), ward_name: "Karol Bagh" },
      { id: 4, ward_id: 43, category: "Water Supply", predicted_date: "2026-07-22", confidence: 0.78, created_at: new Date().toISOString(), ward_name: "Dwarka" },
      { id: 5, ward_id: 45, category: "Streetlight", predicted_date: "2026-08-01", confidence: 0.71, created_at: new Date().toISOString(), ward_name: "Govindpuri" },
    ];
    this.predictions = monsoon;
  }

  private buildAuditTrailForExisting() {
    // Create minimal audit entries for a few resolved complaints so the audit page has data
    const resolved = this.complaints.filter((c) => c.status === "resolved").slice(0, 5);
    for (const c of resolved) {
      const genesisHash = crypto.createHash("sha256")
        .update(`${c.id}:CREATED:${c.assigned_officer_id}:${c.created_at}:GENESIS`)
        .digest("hex");
      this.auditLog.push({
        id: this.auditIdCounter++,
        ticket_id: c.id,
        action: "CREATED",
        officer_id: c.assigned_officer_id,
        timestamp: c.created_at,
        prev_hash: null,
        curr_hash: genesisHash,
      });
      if (c.resolved_at) {
        const resolveHash = crypto.createHash("sha256")
          .update(`${c.id}:RESOLVED_VIA_DASHBOARD:${c.assigned_officer_id}:${c.resolved_at}:${genesisHash}`)
          .digest("hex");
        this.auditLog.push({
          id: this.auditIdCounter++,
          ticket_id: c.id,
          action: "RESOLVED_VIA_DASHBOARD",
          officer_id: c.assigned_officer_id,
          timestamp: c.resolved_at,
          prev_hash: genesisHash,
          curr_hash: resolveHash,
        });
      }
    }
  }

  // ─── Complaints ──────────────────────────────────────────────────────────────

  getComplaints(filters: { status?: string; priority?: string; ward_id?: number } = {}): Complaint[] {
    let result = [...this.complaints];
    if (filters.status) result = result.filter((c) => c.status === filters.status);
    if (filters.priority) result = result.filter((c) => c.priority === filters.priority);
    if (filters.ward_id) result = result.filter((c) => c.ward_id === filters.ward_id);
    return result
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((c) => this.enrichComplaint(c));
  }

  private enrichComplaint(c: Complaint): Complaint {
    const ward = this.wards.find((w) => w.id === c.ward_id);
    const officer = c.assigned_officer_id
      ? this.officers.find((o) => o.id === c.assigned_officer_id)
      : null;
    return { ...c, ward_name: ward?.name, officer_name: officer?.name };
  }

  createComplaint(data: Omit<Complaint, "id" | "created_at" | "resolved_at" | "upvotes" | "upvoted_by" | "satisfaction" | "feedback_note" | "feedback_at">): Complaint {
    const complaint: Complaint = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      resolved_at: null,
      upvotes: 0,
      upvoted_by: [],
      satisfaction: null,
      feedback_note: null,
      feedback_at: null,
    };
    this.complaints.unshift(complaint);
    // update ward counts
    const ward = this.wards.find((w) => w.id === complaint.ward_id);
    if (ward) ward.complaint_count++;
    return this.enrichComplaint(complaint);
  }

  resolveComplaint(id: string): Complaint | null {
    const complaint = this.complaints.find((c) => c.id === id);
    if (!complaint || complaint.status === "resolved") return null;
    complaint.status = "resolved";
    complaint.resolved_at = new Date().toISOString();
    const ward = this.wards.find((w) => w.id === complaint.ward_id);
    if (ward) ward.resolved_count++;
    return this.enrichComplaint(complaint);
  }

  findById(ref: string): Complaint | null {
    // accepts full UUID or shortId (DL-XXXXXX)
    const normalized = ref.replace(/^DL-/i, "").toLowerCase();
    return this.complaints.find(
      (c) => c.id === ref || c.id.slice(0, 6).toLowerCase() === normalized
    ) ?? null;
  }

  upvoteComplaint(ref: string, phone: string): { complaint: Complaint | null; alreadyVoted: boolean } {
    const complaint = this.findById(ref);
    if (!complaint) return { complaint: null, alreadyVoted: false };
    if (complaint.upvoted_by.includes(phone)) return { complaint: this.enrichComplaint(complaint), alreadyVoted: true };
    complaint.upvotes++;
    complaint.upvoted_by.push(phone);
    return { complaint: this.enrichComplaint(complaint), alreadyVoted: false };
  }

  addFeedback(ref: string, phone: string, rating: "satisfied" | "unsatisfied", note?: string): Complaint | null {
    const complaint = this.findById(ref);
    if (!complaint || complaint.phone !== phone) return null;
    complaint.satisfaction = rating;
    complaint.feedback_note = note ?? null;
    complaint.feedback_at = new Date().toISOString();
    return this.enrichComplaint(complaint);
  }

  getSimilar(wardId: number, category: string, limit = 3): Complaint[] {
    return this.complaints
      .filter((c) => c.ward_id === wardId && c.category === category && !["resolved", "closed"].includes(c.status))
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit)
      .map((c) => this.enrichComplaint(c));
  }

  findDuplicate(wardId: number, category: string): string | null {
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const dup = this.complaints.find(
      (c) =>
        c.ward_id === wardId &&
        c.category === category &&
        !["resolved", "closed"].includes(c.status) &&
        c.created_at > cutoff
    );
    return dup?.id || null;
  }

  // ─── Audit ───────────────────────────────────────────────────────────────────

  appendAudit(ticketId: string, action: string, officerId?: number): AuditEntry {
    const prev = this.auditLog
      .filter((e) => e.ticket_id === ticketId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const prevHash = prev?.curr_hash || "GENESIS";
    const timestamp = new Date().toISOString();
    const currHash = crypto.createHash("sha256")
      .update(`${ticketId}:${action}:${officerId ?? ""}:${timestamp}:${prevHash}`)
      .digest("hex");
    const entry: AuditEntry = {
      id: this.auditIdCounter++,
      ticket_id: ticketId,
      action,
      officer_id: officerId ?? null,
      timestamp,
      prev_hash: prevHash === "GENESIS" ? null : prevHash,
      curr_hash: currHash,
    };
    this.auditLog.push(entry);
    return entry;
  }

  getAuditTrail(ticketId: string): AuditEntry[] {
    return this.auditLog
      .filter((e) => e.ticket_id === ticketId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((e) => {
        const officer = e.officer_id ? this.officers.find((o) => o.id === e.officer_id) : null;
        return { ...e, officer_name: officer?.name };
      });
  }

  // ─── Health score ─────────────────────────────────────────────────────────────

  recalculateWardHealth(wardId: number): number {
    const ward = this.wards.find((w) => w.id === wardId);
    if (!ward) return 0;
    const wardComplaints = this.complaints.filter((c) => c.ward_id === wardId);
    const total = wardComplaints.length;
    const resolved = wardComplaints.filter((c) => c.status === "resolved").length;
    if (total === 0) return ward.health_score;

    const resolutionRate = resolved / total;

    // Avg resolution hours for resolved tickets
    const resolvedWithTime = wardComplaints.filter(
      (c) => c.status === "resolved" && c.resolved_at
    );
    let withinSla = 0.5;
    if (resolvedWithTime.length > 0) {
      const avgHours =
        resolvedWithTime.reduce((sum, c) => {
          const hrs =
            (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) /
            3600000;
          return sum + hrs;
        }, 0) / resolvedWithTime.length;
      const slaHours = 48;
      withinSla = Math.min(1, slaHours / Math.max(avgHours, 1));
    }

    const satisfactionProxy = 0.75;
    const score = Math.round(resolutionRate * 40 + withinSla * 30 + satisfactionProxy * 30);
    ward.health_score = Math.min(100, Math.max(0, score));
    ward.complaint_count = total;
    ward.resolved_count = resolved;
    return ward.health_score;
  }

  // ─── Stats ────────────────────────────────────────────────────────────────────

  getAdminStats() {
    const total = this.complaints.length;
    const pending = this.complaints.filter((c) => c.status === "pending").length;
    const inProgress = this.complaints.filter((c) => c.status === "in_progress").length;
    const resolved = this.complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;

    const resolvedWithTime = this.complaints.filter((c) => c.resolved_at);
    const avgResolutionHours =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, c) => {
            const hrs =
              (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) /
              3600000;
            return sum + hrs;
          }, 0) / resolvedWithTime.length
        : 0;

    const avgHealth =
      this.wards.reduce((sum, w) => sum + w.health_score, 0) / this.wards.length;

    const satisfied = this.complaints.filter((c) => c.satisfaction === "satisfied").length;
    const unsatisfied = this.complaints.filter((c) => c.satisfaction === "unsatisfied").length;
    const totalFeedback = satisfied + unsatisfied;
    const satisfaction_pct = totalFeedback > 0 ? Math.round((satisfied / totalFeedback) * 100) : null;

    return {
      total,
      pending,
      in_progress: inProgress,
      resolved,
      avg_resolution_hours: Math.round(avgResolutionHours * 10) / 10,
      avg_health: Math.round(avgHealth),
      satisfaction_pct,
      satisfied,
      unsatisfied,
    };
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  findUserByPhone(phone: string): User | undefined {
    return this.users.find((u) => u.phone === phone);
  }

  createUser(data: { name: string; phone: string; pin: string }): User {
    const user: User = {
      id: uuidv4(),
      name: data.name,
      phone: data.phone,
      pin: data.pin,
      role: "citizen",
      created_at: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  validateCredentials(phone: string, pin: string): User | null {
    const user = this.users.find((u) => u.phone === phone && u.pin === pin);
    return user ?? null;
  }
}

export const store = new InMemoryStore();
