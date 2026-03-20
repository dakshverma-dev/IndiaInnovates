import { Pool } from "pg";
import { config } from "../config";

export const pool = config.databaseUrl
  ? new Pool({ connectionString: config.databaseUrl })
  : null;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  if (!pool) {
    throw new Error("No database configured — use in-memory store instead");
  }
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
