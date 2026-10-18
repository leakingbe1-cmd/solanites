import type { Db, Sql } from "./types";

/**
 * In-process Postgres (PGlite) for tests and local fixture mode only. Never
 * used for real holders: production requires DATABASE_URL.
 */
export async function createPgliteDb(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = new PGlite();
  const wrap = (c: { query: (q: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }): Sql => ({
    async query<T>(text: string, params?: unknown[]) {
      const r = await c.query(text, params);
      return { rows: r.rows as T[] };
    },
  });
  return {
    ...wrap(pg),
    tx: <T>(fn: (sql: Sql) => Promise<T>) => pg.transaction((t) => fn(wrap(t))),
    close: () => pg.close(),
  };
}
