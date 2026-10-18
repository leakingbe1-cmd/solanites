/**
 * Minimal database interface shared by the Postgres adapter (production) and
 * PGlite (tests and local fixtures). Both run the same SQL, so constraints,
 * transactions and row locks behave the same in tests as in production.
 */
export interface Sql {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface Db extends Sql {
  /** Runs `fn` in one transaction: everything commits together or rolls back together. */
  tx<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
