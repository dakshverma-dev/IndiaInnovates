import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";
import { emitSlaAlert } from "../sockets/events";
import { appendAuditEntry } from "../services/auditLog";

export interface SlaJobData {
  ticketId: string;
  priority: string;
}

export async function processEscalation(data: SlaJobData): Promise<void> {
  try {
    if (useInMemory) {
      const complaint = store.complaints.find((c) => c.id === data.ticketId);
      if (!complaint || complaint.status === "resolved" || complaint.status === "closed") return;

      // Find highest-karma officer in same ward
      const supervisor = store.officers
        .filter((o) => o.ward_id === complaint.ward_id)
        .sort((a, b) => b.karma_score - a.karma_score)[0];

      if (supervisor) {
        complaint.assigned_officer_id = supervisor.id;
        await appendAuditEntry(
          data.ticketId,
          `SLA_ESCALATED_TO_OFFICER_${supervisor.id}`,
          supervisor.id
        );
      }
    } else {
      const rows = await query<{ id: string; status: string; ward_id: number }>(
        `SELECT id, status, ward_id FROM complaints WHERE id = $1`,
        [data.ticketId]
      );
      const ticket = rows[0];
      if (!ticket || ticket.status === "resolved" || ticket.status === "closed") return;

      const supervisorRows = await query<{ id: number }>(
        `SELECT id FROM officers WHERE ward_id = $1 ORDER BY karma_score DESC LIMIT 1`,
        [ticket.ward_id]
      );
      const supervisorId = supervisorRows[0]?.id;
      if (supervisorId) {
        await query(
          `UPDATE complaints SET assigned_officer_id = $1 WHERE id = $2`,
          [supervisorId, data.ticketId]
        );
        await appendAuditEntry(
          data.ticketId,
          `SLA_ESCALATED_TO_OFFICER_${supervisorId}`,
          supervisorId
        );
      }
    }

    emitSlaAlert(data.ticketId, data.priority, "SLA_BREACH");
    console.log(`[SLA] Escalated ticket ${data.ticketId} (${data.priority})`);
  } catch (err) {
    console.error("[SLA] Escalation error:", err);
  }
}
