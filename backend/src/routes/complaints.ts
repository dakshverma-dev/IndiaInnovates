import { Router, Request, Response } from "express";
import { classifyComplaint } from "../services/gemini";
import { findDuplicate } from "../services/deduplication";
import { appendAuditEntry } from "../services/auditLog";
import { scheduleEscalation } from "../queues/slaQueue";
import { emitNewTicket } from "../sockets/events";
import { recalculateWardHealth } from "../services/healthScore";
import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

const router = Router();

router.post("/api/complaints", async (req: Request, res: Response) => {
  try {
    const { message, phone, language = "en", wardHint } = req.body as {
      message?: string;
      phone?: string;
      language?: string;
      wardHint?: number;
    };

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ error: "message must be at least 5 characters" });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "phone must be a 10-digit number" });
    }

    // 1. Classify via Gemini (or local fallback)
    const classification = await classifyComplaint(message.trim(), language, wardHint);

    // 2. Deduplication
    const duplicateId = await findDuplicate(classification.ward_id, classification.category);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ticket: any;

    if (useInMemory) {
      // ── In-memory path ──────────────────────────────────────────────────────
      const officer = store.officers.find((o) => o.ward_id === classification.ward_id)
        ?? store.officers[0];

      ticket = store.createComplaint({
        phone,
        message: message.trim(),
        category: classification.category,
        priority: classification.priority,
        ward_id: classification.ward_id,
        status: "assigned",
        assigned_officer_id: officer?.id ?? null,
        duplicate_of: duplicateId,
        gps_lat: null,
        gps_lng: null,
        photo_path: null,
        ai_summary: classification.summary,
      });

      await appendAuditEntry(ticket.id as string, "CREATED", officer?.id);
    } else {
      // ── PostgreSQL path ─────────────────────────────────────────────────────
      const officerRows = await query<{ id: number; name: string }>(
        `SELECT id, name FROM officers WHERE ward_id = $1 LIMIT 1`,
        [classification.ward_id]
      );
      const officer = officerRows[0];

      const rows = await query<Record<string, unknown>>(
        `INSERT INTO complaints
           (phone, message, category, priority, ward_id, status, assigned_officer_id, duplicate_of, ai_summary)
         VALUES ($1, $2, $3, $4, $5, 'assigned', $6, $7, $8)
         RETURNING *`,
        [
          phone,
          message.trim(),
          classification.category,
          classification.priority,
          classification.ward_id,
          officer?.id || null,
          duplicateId,
          classification.summary,
        ]
      );
      ticket = rows[0];
      if (officer) (ticket as Record<string, unknown>).officer_name = officer.name;

      await appendAuditEntry(ticket.id as string, "CREATED", officer?.id);
    }

    // 3. SLA escalation job
    await scheduleEscalation({
      ticketId: ticket.id as string,
      priority: classification.priority,
    });

    // 4. WebSocket broadcast
    const broadcastPayload = {
      ...ticket,
      classification,
      ward_name: useInMemory
        ? store.wards.find((w) => w.id === classification.ward_id)?.name
        : undefined,
    };
    emitNewTicket(broadcastPayload);

    // 5. Recalculate ward health
    await recalculateWardHealth(classification.ward_id);

    // 6. Response
    const idStr = ticket.id as string;
    res.status(201).json({
      ticketId: idStr,
      shortId: `DL-${idStr.slice(0, 6).toUpperCase()}`,
      category: classification.category,
      priority: classification.priority,
      department: classification.department,
      sla_hours: classification.sla_hours,
      summary: classification.summary,
      wardId: classification.ward_id,
      wardName: useInMemory
        ? store.wards.find((w) => w.id === classification.ward_id)?.name
        : `Ward ${classification.ward_id}`,
      officerName: (ticket.officer_name as string) || "Being assigned...",
      isDuplicate: !!duplicateId,
      duplicateOf: duplicateId,
    });
  } catch (err) {
    console.error("[POST /api/complaints]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
