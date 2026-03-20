import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config, useInMemory } from "../config";
import { store } from "../db/inMemory";

const router = Router();

router.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { phone, pin } = req.body as { phone?: string; pin?: string };

    if (!phone || !pin) {
      return res.status(400).json({ error: "phone and pin are required" });
    }

    const user = useInMemory
      ? store.validateCredentials(phone, pin)
      : null; // PostgreSQL path would go here

    if (!user) {
      return res.status(401).json({ error: "Invalid phone or PIN" });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, phone, pin } = req.body as { name?: string; phone?: string; pin?: string };

    if (!name || !phone || !pin) {
      return res.status(400).json({ error: "name, phone, and pin are required" });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "phone must be a 10-digit number" });
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: "pin must be 4-6 digits" });
    }

    if (useInMemory) {
      const existing = store.findUserByPhone(phone);
      if (existing) {
        return res.status(409).json({ error: "Phone number already registered" });
      }

      const user = store.createUser({ name, phone, pin });
      const token = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        config.jwtSecret,
        { expiresIn: "24h" }
      );

      return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      });
    }

    res.status(501).json({ error: "PostgreSQL auth not implemented" });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
