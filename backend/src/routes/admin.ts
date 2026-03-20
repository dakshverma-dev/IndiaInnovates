import { Router, Request, Response } from "express";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

// GET /api/admin/stats — overall statistics
router.get("/api/admin/stats", async (_req: Request, res: Response) => {
  try {
    if (useInMemory) {
      return res.json(store.getAdminStats());
    }
    const [stats] = await query<Record<string, unknown>>(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
         COUNT(*) FILTER (WHERE status = 'in_progress')::int as in_progress,
         COUNT(*) FILTER (WHERE status IN ('resolved','closed'))::int as resolved,
         ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
           FILTER (WHERE resolved_at IS NOT NULL)::numeric, 1) as avg_resolution_hours
       FROM complaints`
    );
    const [wardStats] = await query<{ avg_health: number }>(
      `SELECT ROUND(AVG(health_score)) as avg_health FROM wards`
    );
    res.json({ ...stats, avg_health: wardStats?.avg_health ?? 70 });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/complaints — filterable list for dashboard
router.get("/api/admin/complaints", async (req: Request, res: Response) => {
  try {
    const { status, priority, ward_id, limit = "50" } = req.query as {
      status?: string;
      priority?: string;
      ward_id?: string;
      limit?: string;
    };

    if (useInMemory) {
      let result = store.getComplaints({
        status,
        priority,
        ward_id: ward_id ? parseInt(ward_id) : undefined,
      });
      result = result.slice(0, parseInt(limit));
      return res.json(result);
    }

    const conditions: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    if (status) { conditions.push(`c.status = $${p++}`); params.push(status); }
    if (priority) { conditions.push(`c.priority = $${p++}`); params.push(priority); }
    if (ward_id) { conditions.push(`c.ward_id = $${p++}`); params.push(parseInt(ward_id)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(parseInt(limit));

    const rows = await query(
      `SELECT c.*, w.name as ward_name, o.name as officer_name
       FROM complaints c
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN officers o ON c.assigned_officer_id = o.id
       ${where}
       ORDER BY
         CASE c.priority WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 WHEN 'P3' THEN 3 ELSE 4 END,
         c.created_at DESC
       LIMIT $${p}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/admin/complaints]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
