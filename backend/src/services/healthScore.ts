import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";
import { emitHealthScoreUpdated } from "../sockets/events";

export async function recalculateWardHealth(wardId: number): Promise<number> {
  let score: number;

  if (useInMemory) {
    score = store.recalculateWardHealth(wardId);
  } else {
    const rows = await query<{
      total: string;
      resolved: string;
      avg_hours: string | null;
    }>(
      `SELECT
         COUNT(*)::text as total,
         COUNT(*) FILTER (WHERE status IN ('resolved','closed'))::text as resolved,
         AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
           FILTER (WHERE resolved_at IS NOT NULL)::text as avg_hours
       FROM complaints WHERE ward_id = $1`,
      [wardId]
    );
    const { total, resolved, avg_hours } = rows[0] ?? { total: "0", resolved: "0", avg_hours: null };
    const totalN = parseInt(total) || 0;
    const resolvedN = parseInt(resolved) || 0;
    const resolutionRate = totalN > 0 ? resolvedN / totalN : 0;
    const slaHours = 48;
    const avgHoursN = avg_hours ? parseFloat(avg_hours) : null;
    const withinSla =
      avgHoursN !== null ? Math.min(1, slaHours / Math.max(avgHoursN, 1)) : 0.5;
    const satisfactionProxy = 0.75;
    score = Math.round(resolutionRate * 40 + withinSla * 30 + satisfactionProxy * 30);
    score = Math.min(100, Math.max(0, score));
    await query(`UPDATE wards SET health_score = $1 WHERE id = $2`, [score, wardId]);
  }

  emitHealthScoreUpdated(wardId, score);
  return score;
}
