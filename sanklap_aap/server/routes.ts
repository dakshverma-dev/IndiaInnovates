import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

function getToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const user = storage.validateToken(token);
  if (!user) return res.status(401).json({ message: "Invalid or expired token" });
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const user = storage.validateToken(token);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  (req as any).user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ── AUTH ──────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, phone, pin } = req.body;
      if (!name || !phone || !pin) return res.status(400).json({ message: "Name, phone, and PIN are required" });
      if (pin.length !== 6) return res.status(400).json({ message: "PIN must be 6 digits" });
      if (phone.length !== 10) return res.status(400).json({ message: "Phone must be 10 digits" });
      const existing = await storage.findUserByPhone(phone);
      if (existing) return res.status(400).json({ message: "Phone number already registered" });
      const user = await storage.createUser({ name, phone, pin, role: "citizen" });
      const token = storage.createToken(user.id);
      res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, token });
    } catch (e) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, pin } = req.body;
      if (!phone || !pin) return res.status(400).json({ message: "Phone and PIN are required" });
      const user = await storage.findUserByPhone(phone);
      if (!user || user.pin !== pin) return res.status(401).json({ message: "Invalid phone or PIN" });
      const token = storage.createToken(user.id);
      res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, token });
    } catch (e) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({ id: user.id, name: user.name, phone: user.phone, role: user.role });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const token = getToken(req);
    if (token) storage.revokeToken(token);
    res.json({ success: true });
  });

  // ── COMPLAINTS ────────────────────────────────────────────────────────
  app.get("/api/complaints", requireAuth, (req, res) => {
    const complaints = storage.getComplaints();
    res.json(complaints);
  });

  app.post("/api/complaints", requireAuth, (req, res) => {
    const user = (req as any).user;
    const { category, description, location, ward, wardNumber, priority, status } = req.body;
    if (!category || !description || !location) {
      return res.status(400).json({ message: "Category, description, and location are required" });
    }
    const complaint = storage.createComplaint({
      category, description, location,
      ward: ward || "Unknown Ward",
      wardNumber: wardNumber || 1,
      priority: priority || "P3",
      status: status || "pending",
      submittedBy: user.name,
      isCluster: false,
    });
    res.status(201).json(complaint);
  });

  app.put("/api/complaints/:id/resolve", requireAuth, (req, res) => {
    const { rating } = req.body;
    const complaint = storage.resolveComplaint(req.params.id, rating);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  });

  app.put("/api/complaints/:id/upvote", requireAuth, (req, res) => {
    const complaint = storage.upvoteComplaint(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  });

  // ── SOS ───────────────────────────────────────────────────────────────
  app.get("/api/sos", requireAuth, (req, res) => {
    res.json(storage.getSosAlerts());
  });

  app.post("/api/sos", requireAuth, (req, res) => {
    const user = (req as any).user;
    const { category, description, location, ward, wardNumber } = req.body;
    if (!category) return res.status(400).json({ message: "Category is required" });
    const alert = storage.createSos({
      category, description: description || "Emergency reported",
      location: location || "Location via GPS",
      ward: ward || "Unknown Ward",
      wardNumber: wardNumber || 1,
      status: "active",
      triggeredBy: user.name,
    });
    res.status(201).json(alert);
  });

  app.put("/api/sos/:id/resolve", requireAuth, (req, res) => {
    const alert = storage.resolveSos(req.params.id);
    if (!alert) return res.status(404).json({ message: "SOS alert not found" });
    res.json(alert);
  });

  // ── WARDS ─────────────────────────────────────────────────────────────
  app.get("/api/wards", requireAuth, (req, res) => {
    res.json(storage.getWards());
  });

  // ── WORKERS ───────────────────────────────────────────────────────────
  app.get("/api/workers", requireAuth, (req, res) => {
    res.json(storage.getWorkers());
  });

  // ── ADMIN ─────────────────────────────────────────────────────────────
  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    res.json(storage.getAdminStats());
  });

  app.get("/api/admin/reports", requireAdmin, (req, res) => {
    const complaints = storage.getComplaints();
    const sos = storage.getSosAlerts();
    const wards = storage.getWards();
    const workers = storage.getWorkers();
    res.json({ complaints, sos, wards, workers, stats: storage.getAdminStats() });
  });

  app.get("/api/admin/complaints", requireAdmin, (req, res) => {
    const { status, priority, ward } = req.query;
    let complaints = storage.getComplaints();
    if (status) complaints = complaints.filter(c => c.status === status);
    if (priority) complaints = complaints.filter(c => c.priority === priority);
    if (ward) complaints = complaints.filter(c => c.wardNumber === Number(ward));
    res.json(complaints);
  });

  app.get("/api/admin/alerts", requireAdmin, (req, res) => {
    res.json(storage.getSosAlerts());
  });

  app.get("/api/admin/workers", requireAdmin, (req, res) => {
    res.json(storage.getWorkers());
  });

  const httpServer = createServer(app);
  return httpServer;
}
