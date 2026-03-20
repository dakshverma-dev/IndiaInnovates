import { config, useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

export async function appendAuditEntry(
  ticketId: string,
  action: string,
  officerId?: number
): Promise<void> {
  if (useInMemory) {
    store.appendAudit(ticketId, action, officerId);
    return;
  }

  // PostgreSQL path
  const prev = await query<{ curr_hash: string }>(
    `SELECT curr_hash FROM audit_log WHERE ticket_id = $1 ORDER BY timestamp DESC LIMIT 1`,
    [ticketId]
  );
  const prevHash = prev[0]?.curr_hash || "GENESIS";
  const timestamp = new Date().toISOString();

  const { createHash } = await import("crypto");
  const currHash = createHash("sha256")
    .update(`${ticketId}:${action}:${officerId ?? ""}:${timestamp}:${prevHash}`)
    .digest("hex");

  await query(
    `INSERT INTO audit_log (ticket_id, action, officer_id, prev_hash, curr_hash)
     VALUES ($1, $2, $3, $4, $5)`,
    [ticketId, action, officerId || null, prevHash === "GENESIS" ? null : prevHash, currHash]
  );
}
