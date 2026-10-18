import "server-only";

import { Pool, type PoolClient } from "pg";
import type { Db, Sql } from "./types";

/**
 * Postgres adapter for production (e.g. Neon or Supabase). Uses a small pool;
 * on serverless hosts point DATABASE_URL at the provider's pooled endpoint.
 */
export function createPostgresDb(connectionString: string): Db {
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 });
  const wrap = (c: Pool | PoolClient): Sql => ({
    async query<T>(text: string, params?: unknown[]) {
      const r = await c.query(text, params as unknown[]);
      return { rows: r.rows as T[] };
    },
  });
  return {
    ...wrap(pool),
    async tx<T>(fn: (sql: Sql) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const out = await fn(wrap(client));
        await client.query("COMMIT");
        return out;
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
