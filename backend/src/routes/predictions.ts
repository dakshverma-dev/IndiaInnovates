import { Router, Request, Response } from "express";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

// GET /api/predictions — top 5 upcoming issues by confidence
router.get("/api/predictions", async (_req: Request, res: Response) => {
  try {
    if (useInMemory) {
      return res.json(store.predictions);
    }
    const rows = await query(
      `SELECT p.*, w.name as ward_name
       FROM predictions p
       JOIN wards w ON p.ward_id = w.id
       ORDER BY p.confidence DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/predictions]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
