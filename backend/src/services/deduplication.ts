import { useInMemory } from "../config";
import { store } from "../db/inMemory";
import { query } from "../db/client";

export async function findDuplicate(
  wardId: number,
  category: string,
  windowHours: number = 24
): Promise<string | null> {
  if (useInMemory) {
    return store.findDuplicate(wardId, category);
  }

  const rows = await query<{ id: string }>(
    `SELECT id FROM complaints
     WHERE ward_id = $1
       AND category = $2
       AND status NOT IN ('resolved', 'closed')
       AND created_at > NOW() - INTERVAL '${windowHours} hours'
     ORDER BY created_at DESC
     LIMIT 1`,
    [wardId, category]
  );
  return rows[0]?.id || null;
}
