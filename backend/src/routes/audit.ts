import { Router, Request, Response } from "express";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

// GET /api/audit/:ticketId — full immutable audit trail
router.get("/api/audit/:ticketId", async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (useInMemory) {
      const trail = store.getAuditTrail(ticketId);
      return res.json(trail);
    }

    const rows = await query(
      `SELECT a.*, o.name as officer_name
       FROM audit_log a
       LEFT JOIN officers o ON a.officer_id = o.id
       WHERE a.ticket_id = $1
       ORDER BY a.timestamp ASC`,
      [ticketId]
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/audit/:ticketId]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
