import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthPayload {
  userId: string;
  phone: string;
  role: "admin" | "citizen";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) { next(); return; }
  try {
    const token = header.slice(7);
    if (token === "demo-token-offline") {
      req.user = { userId: "admin-001", phone: "9999999999", role: "admin" };
    } else {
      req.user = jwt.verify(token, config.jwtSecret) as AuthPayload;
    }
  } catch { /* ignore invalid tokens in optional mode */ }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const token = header.slice(7);
    // Allow offline demo token for hackathon demo
    if (token === "demo-token-offline") {
      req.user = { userId: "admin-001", phone: "9999999999", role: "admin" };
      next();
      return;
    }
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
