import { Router, Request, Response } from "express";
import { recalculateWardHealth } from "../services/healthScore";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

// GET /api/wards — list all wards with health scores
router.get("/api/wards", async (_req: Request, res: Response) => {
  try {
    if (useInMemory) {
      return res.json(store.wards);
    }
    const rows = await query(`SELECT * FROM wards ORDER BY id`);
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/wards]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/wards/:wardId/health-score — recalculate + return score
router.get("/api/wards/:wardId/health-score", async (req: Request, res: Response) => {
  try {
    const wardId = parseInt(req.params.wardId);
    if (isNaN(wardId) || wardId < 1 || wardId > 272) {
      return res.status(400).json({ error: "Invalid ward ID (must be 1–272)" });
    }
    const score = await recalculateWardHealth(wardId);
    const ward = useInMemory
      ? store.wards.find((w) => w.id === wardId)
      : (await query(`SELECT * FROM wards WHERE id = $1`, [wardId]))[0];
    res.json({ wardId, score, ward });
  } catch (err) {
    console.error("[GET /api/wards/:wardId/health-score]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
