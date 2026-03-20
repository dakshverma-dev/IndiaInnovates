import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Priority = "P1" | "P2" | "P3" | "P4";
export type ComplaintStatus = "pending" | "in_progress" | "resolved" | "closed";
export type ComplaintCategory =
  | "pothole"
  | "garbage"
  | "streetlight"
  | "water"
  | "drain"
  | "electricity"
  | "tree"
  | "other";

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
  citizenPhone?: string;
  workerName?: string;
  upvotes: number;
  isCluster?: boolean;
  clusterSize?: number;
  aiScore: number;
  rating?: number;
}

export type SOSCategory =
  | "gas_leak"
  | "water_burst"
  | "electric_hazard"
  | "fire_risk"
  | "road_accident"
  | "infrastructure";

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

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "pothole",
  "garbage",
  "streetlight",
  "water",
  "drain",
  "electricity",
  "tree",
  "other",
];

const WARDS = [
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

const LOCATIONS = [
  "Near Metro Station",
  "Main Market",
  "Residential Colony",
  "Hospital Road",
  "School Road",
  "Park Area",
  "Bus Stand",
  "Junction",
  "Colony Gate",
  "Sector Road",
];

const WORKER_NAMES = [
  "Rajesh Kumar",
  "Amit Singh",
  "Priya Sharma",
  "Suresh Gupta",
  "Neha Verma",
  "Vikram Rao",
  "Anita Devi",
  "Mohan Lal",
  "Kavita Singh",
  "Deepak Nair",
  "Sunita Yadav",
  "Ravi Chandra",
  "Pooja Mehta",
  "Arun Kumar",
  "Meena Kumari",
  "Sanjay Tiwari",
  "Rekha Sharma",
  "Lokesh Bajaj",
  "Geeta Singh",
  "Prakash Rao",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateTicketId(): string {
  const prefix = "SAI";
  const num = randomInt(10000, 99999);
  return `${prefix}-${num}`;
}

function generateDemoComplaints(): Complaint[] {
  const complaints: Complaint[] = [];
  const descriptions: Record<ComplaintCategory, string[]> = {
    pothole: [
      "Large pothole causing accidents near main road",
      "Deep crater on residential street damaged my vehicle",
      "Multiple potholes on school route, children at risk",
      "Road completely broken, flooding during rain",
    ],
    garbage: [
      "Garbage not collected for 5 days, strong smell",
      "Overflowing dustbin near market area",
      "Illegal dumping near colony boundary",
      "Garbage collector skipping our lane daily",
    ],
    streetlight: [
      "Street lights not working for 2 weeks, safety concern",
      "Lights flickering all night, causing nuisance",
      "3 consecutive lights broken in dark lane",
      "New lights installed but not functional yet",
    ],
    water: [
      "No water supply for 3 days in summer heat",
      "Water coming dirty brown, undrinkable",
      "Pipeline leakage wasting thousands of liters",
      "Water pressure extremely low in entire block",
    ],
    drain: [
      "Drain blocked causing waterlogging on road",
      "Sewer overflow entering homes after rain",
      "Open drain near school, mosquito breeding",
      "Drain cleaning not done in months",
    ],
    electricity: [
      "Power cuts 6-8 hours daily, unbearable heat",
      "Transformer making loud noise, sparking visible",
      "Exposed wires on footpath, dangerous for walkers",
      "Electricity bill wrong for 3 months",
    ],
    tree: [
      "Large tree fell on road blocking traffic",
      "Dead tree branch hanging dangerously over power lines",
      "Tree roots damaging underground water pipes",
      "Overgrown branches blocking streetlights",
    ],
    other: [
      "Stray dogs attacking residents near park",
      "Broken footpath tiles causing injuries to elderly",
      "Encroachment on public land near school",
      "Noise pollution from construction at night",
    ],
  };

  for (let i = 0; i < 120; i++) {
    const ward = randomFrom(WARDS);
    const category = randomFrom(COMPLAINT_CATEGORIES);
    const hoursBack = randomInt(1, 720);
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

    complaints.push({
      id: generateId() + i,
      ticketId: generateTicketId(),
      category,
      description: randomFrom(descriptions[category]),
      location: `${randomFrom(LOCATIONS)}, ${ward.name}`,
      ward: ward.name,
      wardNumber: ward.number,
      priority,
      status,
      submittedAt: hoursAgo(hoursBack),
      resolvedAt:
        status === "resolved" || status === "closed"
          ? hoursAgo(Math.max(1, hoursBack - randomInt(2, 48)))
          : undefined,
      workerName:
        status !== "pending" ? randomFrom(WORKER_NAMES) : undefined,
      upvotes: randomInt(0, 150),
      isCluster,
      clusterSize: isCluster ? randomInt(5, 85) : undefined,
      aiScore: randomInt(60, 99),
      rating:
        status === "resolved" || status === "closed"
          ? randomInt(1, 5)
          : undefined,
    });
  }

  return complaints.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

function generateDemoWorkers(): Worker[] {
  return WORKER_NAMES.slice(0, 20).map((name, i) => {
    const ward = WARDS[i % WARDS.length];
    const score = randomInt(55, 98);
    return {
      id: `w${i}`,
      name,
      phone: `98${randomInt(10000000, 99999999)}`,
      ward: ward.name,
      wardNumber: ward.number,
      score,
      resolvedToday: randomInt(0, 8),
      totalResolved: randomInt(50, 500),
      avgRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
      status:
        Math.random() < 0.7
          ? "active"
          : Math.random() < 0.5
          ? "idle"
          : "on_leave",
      currentTask:
        Math.random() < 0.6
          ? randomFrom(["Inspecting pothole", "Collecting garbage", "Fixing streetlight", "Repairing pipeline", "Clearing drain"])
          : undefined,
    };
  });
}

function generateDemoWards(complaints: Complaint[]): Ward[] {
  return WARDS.map((w) => {
    const wardComplaints = complaints.filter((c) => c.wardNumber === w.number);
    const resolved = wardComplaints.filter(
      (c) => c.status === "resolved" || c.status === "closed"
    ).length;
    const pending = wardComplaints.filter((c) => c.status === "pending").length;
    const healthScore = Math.min(
      100,
      Math.max(
        20,
        Math.round(
          (resolved / Math.max(wardComplaints.length, 1)) * 70 +
            (1 - pending / Math.max(wardComplaints.length, 1)) * 30
        )
      )
    );
    return {
      id: `ward${w.number}`,
      name: w.name,
      number: w.number,
      healthScore,
      totalComplaints: wardComplaints.length,
      resolvedComplaints: resolved,
      pendingComplaints: pending,
      avgResolutionHours: randomInt(4, 72),
      population: randomInt(80000, 350000),
      area: w.area,
    };
  });
}

const SOS_CATEGORIES: SOSCategory[] = [
  "gas_leak",
  "water_burst",
  "electric_hazard",
  "fire_risk",
  "road_accident",
  "infrastructure",
];

function generateDemoSOS(): SOSAlert[] {
  const alerts: SOSAlert[] = [];
  const descriptions: Record<SOSCategory, string> = {
    gas_leak: "Strong gas smell detected in residential block",
    water_burst: "Major pipeline burst, water flooding street",
    electric_hazard: "High-tension wire fallen on road",
    fire_risk: "Smoke visible from building, fire suspected",
    road_accident: "Major accident blocking main arterial road",
    infrastructure: "Building wall collapsed, debris on road",
  };

  for (let i = 0; i < 4; i++) {
    const ward = randomFrom(WARDS);
    const cat = randomFrom(SOS_CATEGORIES);
    const status: SOSAlert["status"] = i === 0 ? "active" : i === 1 ? "responding" : "resolved";
    alerts.push({
      id: `sos${i}`,
      category: cat,
      description: descriptions[cat],
      location: `${randomFrom(LOCATIONS)}, ${ward.name}`,
      ward: ward.name,
      wardNumber: ward.number,
      triggeredAt: hoursAgo(randomInt(0, 12)),
      status,
      respondingWorker: status !== "active" ? randomFrom(WORKER_NAMES) : undefined,
    });
  }
  return alerts;
}

interface AppContextType {
  complaints: Complaint[];
  workers: Worker[];
  wards: Ward[];
  sosAlerts: SOSAlert[];
  isLoading: boolean;
  submitComplaint: (data: Omit<Complaint, "id" | "ticketId" | "submittedAt" | "upvotes" | "aiScore">) => Promise<Complaint>;
  triggerSOS: (category: SOSCategory, description: string, location: string) => Promise<SOSAlert>;
  resolveComplaint: (id: string, rating?: number) => void;
  upvoteComplaint: (id: string) => void;
  resolveSOS: (id: string) => void;
  getStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    sos: number;
    avgHealthScore: number;
    todayComplaints: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("@sankalp_data");
        if (stored) {
          const data = JSON.parse(stored);
          setComplaints(data.complaints || []);
          setWorkers(data.workers || []);
          setWards(data.wards || []);
          setSosAlerts(data.sosAlerts || []);
        } else {
          const demoComplaints = generateDemoComplaints();
          const demoWorkers = generateDemoWorkers();
          const demoWards = generateDemoWards(demoComplaints);
          const demoSOS = generateDemoSOS();
          setComplaints(demoComplaints);
          setWorkers(demoWorkers);
          setWards(demoWards);
          setSosAlerts(demoSOS);
          await AsyncStorage.setItem(
            "@sankalp_data",
            JSON.stringify({
              complaints: demoComplaints,
              workers: demoWorkers,
              wards: demoWards,
              sosAlerts: demoSOS,
            })
          );
        }
      } catch (e) {
        const demoComplaints = generateDemoComplaints();
        const demoWorkers = generateDemoWorkers();
        const demoWards = generateDemoWards(demoComplaints);
        const demoSOS = generateDemoSOS();
        setComplaints(demoComplaints);
        setWorkers(demoWorkers);
        setWards(demoWards);
        setSosAlerts(demoSOS);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveData = useCallback(
    async (
      c: Complaint[],
      w: Worker[],
      wd: Ward[],
      s: SOSAlert[]
    ) => {
      try {
        await AsyncStorage.setItem(
          "@sankalp_data",
          JSON.stringify({ complaints: c, workers: w, wards: wd, sosAlerts: s })
        );
      } catch {}
    },
    []
  );

  const submitComplaint = useCallback(
    async (data: Omit<Complaint, "id" | "ticketId" | "submittedAt" | "upvotes" | "aiScore">): Promise<Complaint> => {
      const newComplaint: Complaint = {
        ...data,
        id: generateId(),
        ticketId: generateTicketId(),
        submittedAt: new Date().toISOString(),
        upvotes: 0,
        aiScore: randomInt(70, 95),
      };
      const updated = [newComplaint, ...complaints];
      setComplaints(updated);
      const newWards = generateDemoWards(updated);
      setWards(newWards);
      await saveData(updated, workers, newWards, sosAlerts);
      return newComplaint;
    },
    [complaints, workers, sosAlerts, saveData]
  );

  const triggerSOS = useCallback(
    async (category: SOSCategory, description: string, location: string): Promise<SOSAlert> => {
      const ward = randomFrom(WARDS);
      const newSOS: SOSAlert = {
        id: generateId(),
        category,
        description,
        location,
        ward: ward.name,
        wardNumber: ward.number,
        triggeredAt: new Date().toISOString(),
        status: "active",
      };
      const updated = [newSOS, ...sosAlerts];
      setSosAlerts(updated);
      await saveData(complaints, workers, wards, updated);
      return newSOS;
    },
    [complaints, workers, wards, sosAlerts, saveData]
  );

  const resolveComplaint = useCallback(
    (id: string, rating?: number) => {
      const updated = complaints.map((c) =>
        c.id === id
          ? { ...c, status: "resolved" as ComplaintStatus, resolvedAt: new Date().toISOString(), rating }
          : c
      );
      setComplaints(updated);
      const newWards = generateDemoWards(updated);
      setWards(newWards);
      saveData(updated, workers, newWards, sosAlerts);
    },
    [complaints, workers, sosAlerts, saveData]
  );

  const upvoteComplaint = useCallback(
    (id: string) => {
      const updated = complaints.map((c) =>
        c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c
      );
      setComplaints(updated);
      saveData(updated, workers, wards, sosAlerts);
    },
    [complaints, workers, wards, sosAlerts, saveData]
  );

  const resolveSOS = useCallback(
    (id: string) => {
      const updated = sosAlerts.map((s) =>
        s.id === id ? { ...s, status: "resolved" as const } : s
      );
      setSosAlerts(updated);
      saveData(complaints, workers, wards, updated);
    },
    [complaints, workers, wards, sosAlerts, saveData]
  );

  const getStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inProgress: complaints.filter((c) => c.status === "in_progress").length,
      resolved: complaints.filter(
        (c) => c.status === "resolved" || c.status === "closed"
      ).length,
      sos: sosAlerts.filter((s) => s.status === "active").length,
      avgHealthScore:
        wards.length > 0
          ? Math.round(
              wards.reduce((sum, w) => sum + w.healthScore, 0) / wards.length
            )
          : 0,
      todayComplaints: complaints.filter(
        (c) => new Date(c.submittedAt) >= today
      ).length,
    };
  }, [complaints, sosAlerts, wards]);

  return (
    <AppContext.Provider
      value={{
        complaints,
        workers,
        wards,
        sosAlerts,
        isLoading,
        submitComplaint,
        triggerSOS,
        resolveComplaint,
        upvoteComplaint,
        resolveSOS,
        getStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const CATEGORY_META: Record<
  ComplaintCategory,
  { label: string; icon: string; color: string }
> = {
  pothole: { label: "Pothole", icon: "alert-triangle", color: "#F59E0B" },
  garbage: { label: "Garbage", icon: "trash-2", color: "#22C55E" },
  streetlight: { label: "Streetlight", icon: "zap", color: "#F59E0B" },
  water: { label: "Water", icon: "droplet", color: "#3B82F6" },
  drain: { label: "Drain", icon: "wind", color: "#06B6D4" },
  electricity: { label: "Electricity", icon: "zap-off", color: "#EF4444" },
  tree: { label: "Tree/Road", icon: "git-branch", color: "#22C55E" },
  other: { label: "Other", icon: "help-circle", color: "#8B5CF6" },
};

export const SOS_META: Record<
  SOSCategory,
  { label: string; icon: string; color: string }
> = {
  gas_leak: { label: "Gas Leak", icon: "wind", color: "#F59E0B" },
  water_burst: { label: "Water Burst", icon: "droplet", color: "#3B82F6" },
  electric_hazard: { label: "Electric Hazard", icon: "zap", color: "#F59E0B" },
  fire_risk: { label: "Fire Risk", icon: "alert-octagon", color: "#EF4444" },
  road_accident: { label: "Road Accident", icon: "truck", color: "#EF4444" },
  infrastructure: {
    label: "Infrastructure",
    icon: "alert-triangle",
    color: "#8B5CF6",
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  P1: { label: "P1 Critical", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  P2: { label: "P2 High", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  P3: { label: "P3 Medium", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  P4: { label: "P4 Low", color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

export const STATUS_META: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  in_progress: {
    label: "In Progress",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.15)",
  },
  resolved: {
    label: "Resolved",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.15)",
  },
  closed: {
    label: "Closed",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.15)",
  },
};
