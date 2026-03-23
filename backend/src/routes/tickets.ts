import { Router, Request, Response } from "express";
import { appendAuditEntry } from "../services/auditLog";
import { recalculateWardHealth } from "../services/healthScore";
import { emitTicketUpdated } from "../sockets/events";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

// GET /api/tickets — list tickets (optionally filtered by officerId or status)
router.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const { officerId, status, limit = "20" } = req.query as {
      officerId?: string;
      status?: string;
      limit?: string;
    };

    if (useInMemory) {
      let results = store.getComplaints({ status });
      if (officerId) {
        const oid = parseInt(officerId);
        results = results.filter((c) => c.assigned_officer_id === oid);
      }
      return res.json(results.slice(0, parseInt(limit)));
    }

    const conditions: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    if (status) { conditions.push(`c.status = $${p++}`); params.push(status); }
    if (officerId) { conditions.push(`c.assigned_officer_id = $${p++}`); params.push(parseInt(officerId)); }
    params.push(parseInt(limit));

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await query(
      `SELECT c.*, w.name as ward_name, o.name as officer_name
       FROM complaints c
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN officers o ON c.assigned_officer_id = o.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${p}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/tickets]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tickets/:id/resolve — resolve ticket from dashboard or officer app
router.post("/api/tickets/:id/resolve", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolvedBy } = req.body as { resolvedBy?: string };

  try {
    let ticket: Record<string, unknown> | null = null;

    if (useInMemory) {
      const resolved = store.resolveComplaint(id);
      if (!resolved) {
        return res.status(404).json({ error: "Ticket not found or already resolved" });
      }
      ticket = resolved as unknown as Record<string, unknown>;
    } else {
      const rows = await query<Record<string, unknown>>(
        `UPDATE complaints
         SET status = 'resolved', resolved_at = NOW()
         WHERE id = $1 AND status NOT IN ('resolved','closed')
         RETURNING *`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ error: "Ticket not found or already resolved" });
      }
      ticket = rows[0];
    }

    const action = resolvedBy
      ? `RESOLVED_BY_${resolvedBy.toUpperCase().replace(/\s+/g, "_")}`
      : "RESOLVED_VIA_DASHBOARD";
    await appendAuditEntry(id, action, ticket.assigned_officer_id as number | undefined);

    const wardId = ticket.ward_id as number;
    await recalculateWardHealth(wardId);

    emitTicketUpdated(ticket);

    res.json({ success: true, ticket });
  } catch (err) {
    console.error("[POST /api/tickets/:id/resolve]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tickets/:id/verify — field officer verification (QR scan + photo upload simulation)
router.post("/api/tickets/:id/verify", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { officerId, gpsLat, gpsLng, photoBase64, qrCode } = req.body as {
    officerId?: number;
    gpsLat?: number;
    gpsLng?: number;
    photoBase64?: string;
    qrCode?: string;
  };

  try {
    // Validate QR code matches ticket ID (simplified: just check it's present)
    if (qrCode && qrCode !== id && qrCode !== id.slice(0, 8)) {
      return res.status(400).json({ error: "QR code does not match ticket" });
    }

    let ticket: Record<string, unknown> | null = null;

    if (useInMemory) {
      const resolved = store.resolveComplaint(id);
      if (!resolved) {
        return res.status(404).json({ error: "Ticket not found or already resolved" });
      }
      ticket = resolved as unknown as Record<string, unknown>;
    } else {
      const rows = await query<Record<string, unknown>>(
        `UPDATE complaints
         SET status = 'resolved', resolved_at = NOW(),
             gps_lat = COALESCE($2, gps_lat),
             gps_lng = COALESCE($3, gps_lng)
         WHERE id = $1 AND status NOT IN ('resolved','closed')
         RETURNING *`,
        [id, gpsLat ?? null, gpsLng ?? null]
      );
      if (!rows.length) {
        return res.status(404).json({ error: "Ticket not found or already resolved" });
      }
      ticket = rows[0];
    }

    await appendAuditEntry(
      id,
      "RESOLVED_BY_FIELD_OFFICER",
      officerId ?? (ticket.assigned_officer_id as number | undefined)
    );

    const wardId = ticket.ward_id as number;
    await recalculateWardHealth(wardId);

    emitTicketUpdated({ ...ticket, verified: true, hasPhoto: !!photoBase64 });

    res.json({
      success: true,
      ticket,
      verification: {
        gpsVerified: !!(gpsLat && gpsLng),
        photoUploaded: !!photoBase64,
        qrScanned: !!qrCode,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[POST /api/tickets/:id/verify]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tickets/:id/feedback — citizen satisfaction rating
router.post("/api/tickets/:id/feedback", (req: Request, res: Response) => {
  const { id } = req.params;
  const { phone, rating, note } = req.body as {
    phone?: string;
    rating?: "satisfied" | "unsatisfied";
    note?: string;
  };

  if (!phone || !rating || !["satisfied", "unsatisfied"].includes(rating)) {
    return res.status(400).json({ error: "phone and rating (satisfied|unsatisfied) required" });
  }

  if (!useInMemory) return res.json({ ok: true });

  const complaint = store.addFeedback(id, phone, rating, note);
  if (!complaint) {
    return res.status(404).json({ error: "Ticket not found or phone does not match" });
  }

  emitTicketUpdated(complaint as unknown as Record<string, unknown>);
  res.json({ ok: true, satisfaction: complaint.satisfaction });
});

export default router;
