import "server-only";
import type { Db, Sql } from "../db/types";
import type { DailyBar, IntradayBar } from "./provider";
import type { GrowthEntry } from "@/lib/market/growth";

/**
 * Market tables, kept apart from the holder-tracking schema so the two can change
 * independently. Dates are exchange-local session dates (YYYY-MM-DD); times are epoch ms.
 *
 * Duplicate protection is in the constraints:
 *   market_daily_bars    PK (ticker, session_date)      one close per stock per session
 *   market_growth_ledger PK (species_id, session_date)  a session's move is recorded once per species
 *                                                         and never rewritten (INSERT … DO NOTHING)
 */
export const MARKET_SCHEMA_VERSION = 1;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS market_daily_bars (
    ticker text NOT NULL,
    session_date text NOT NULL CHECK (session_date ~ '^\\d{4}-\\d{2}-\\d{2}$'),
    open double precision NOT NULL,
    high double precision NOT NULL,
    low double precision NOT NULL,
    close double precision NOT NULL CHECK (close > 0),
    volume double precision NOT NULL DEFAULT 0,
    source text NOT NULL,
    fetched_ms bigint NOT NULL,
    PRIMARY KEY (ticker, session_date)
  )`,
  `CREATE TABLE IF NOT EXISTS market_growth_ledger (
    species_id text NOT NULL,
    session_date text NOT NULL,
    ticker text NOT NULL,
    previous_session_date text NOT NULL,
    previous_close double precision NOT NULL CHECK (previous_close > 0),
    close double precision NOT NULL CHECK (close > 0),
    change_pct double precision NOT NULL,
    points double precision NOT NULL,
    rules_version int NOT NULL,
    source text NOT NULL,
    recorded_ms bigint NOT NULL,
    PRIMARY KEY (species_id, session_date)
  )`,
  `CREATE TABLE IF NOT EXISTS market_intraday (
    ticker text NOT NULL,
    session_date text NOT NULL,
    points text NOT NULL,
    source text NOT NULL,
    fetched_ms bigint NOT NULL,
    PRIMARY KEY (ticker, session_date)
  )`,
  // Per-ticker bookkeeping: when history was last refreshed, and the last provider error.
  `CREATE TABLE IF NOT EXISTS market_ticker_state (
    ticker text PRIMARY KEY,
    needs_history boolean NOT NULL DEFAULT true,
    history_fetched_ms bigint,
    intraday_forbidden_ms bigint,
    last_error_code text,
    last_error_ms bigint
  )`,
  `CREATE TABLE IF NOT EXISTS market_schema (version int PRIMARY KEY, applied_ms bigint NOT NULL)`,
];

/** Creates or upgrades the market tables. Safe to run repeatedly. */
export async function migrateMarket(db: Db, now: () => number = Date.now): Promise<void> {
  await db.tx(async (sql) => {
    for (const s of STATEMENTS) await sql.query(s);
    await sql.query(`INSERT INTO market_schema (version, applied_ms) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING`, [MARKET_SCHEMA_VERSION, now()]);
  });
}

interface BarRow {
  ticker: string;
  session_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
  fetched_ms: string | number;
}

export interface StoredBar extends DailyBar {
  source: string;
  fetchedMs: number;
}

const toBar = (r: BarRow): StoredBar => ({
  date: r.session_date, open: Number(r.open), high: Number(r.high), low: Number(r.low), close: Number(r.close), volume: Number(r.volume), source: r.source, fetchedMs: Number(r.fetched_ms),
});

/** Stores bars; a newer provider value for the same session replaces the old one (e.g. after a split adjustment). */
export async function upsertBars(sql: Sql, ticker: string, bars: DailyBar[], source: string, fetchedMs: number): Promise<void> {
  for (const b of bars) {
    await sql.query(
      `INSERT INTO market_daily_bars (ticker, session_date, open, high, low, close, volume, source, fetched_ms) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (ticker, session_date) DO UPDATE SET open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low, close = EXCLUDED.close,
         volume = EXCLUDED.volume, source = EXCLUDED.source, fetched_ms = EXCLUDED.fetched_ms`,
      [ticker, b.date, b.open, b.high, b.low, b.close, b.volume, source, fetchedMs],
    );
  }
}

/** The newest `limit` bars for a ticker, oldest first. */
export async function readBars(sql: Sql, ticker: string, limit = 270): Promise<StoredBar[]> {
  const r = await sql.query<BarRow>(`SELECT * FROM market_daily_bars WHERE ticker = $1 ORDER BY session_date DESC LIMIT $2`, [ticker, limit]);
  return r.rows.map(toBar).reverse();
}

export async function readBar(sql: Sql, ticker: string, date: string): Promise<StoredBar | null> {
  const r = await sql.query<BarRow>(`SELECT * FROM market_daily_bars WHERE ticker = $1 AND session_date = $2`, [ticker, date]);
  return r.rows[0] ? toBar(r.rows[0]) : null;
}

/** Records growth entries. Existing (species, session) rows are left exactly as they were. Returns how many were new. */
export async function recordGrowth(sql: Sql, speciesId: string, ticker: string, entries: GrowthEntry[], rulesVersion: number, source: string, recordedMs: number): Promise<number> {
  let inserted = 0;
  for (const e of entries) {
    const r = await sql.query(
      `INSERT INTO market_growth_ledger (species_id, session_date, ticker, previous_session_date, previous_close, close, change_pct, points, rules_version, source, recorded_ms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (species_id, session_date) DO NOTHING RETURNING species_id`,
      [speciesId, e.date, ticker, e.previousDate, e.previousClose, e.close, e.changePct, e.points, rulesVersion, source, recordedMs],
    );
    inserted += r.rows.length;
  }
  return inserted;
}

interface LedgerRow {
  session_date: string;
  previous_session_date: string;
  previous_close: number;
  close: number;
  change_pct: number;
  points: number;
}

/** The newest `limit` growth entries for a species, newest first. */
export async function readLedger(sql: Sql, speciesId: string, limit = 20): Promise<GrowthEntry[]> {
  const r = await sql.query<LedgerRow>(`SELECT * FROM market_growth_ledger WHERE species_id = $1 ORDER BY session_date DESC LIMIT $2`, [speciesId, limit]);
  return r.rows.map((x) => ({ date: x.session_date, previousDate: x.previous_session_date, previousClose: Number(x.previous_close), close: Number(x.close), changePct: Number(x.change_pct), points: Number(x.points) }));
}

export async function ledgerCount(sql: Sql, sessionDate: string): Promise<number> {
  const r = await sql.query<{ n: string | number }>(`SELECT count(*) AS n FROM market_growth_ledger WHERE session_date = $1`, [sessionDate]);
  return Number(r.rows[0]?.n ?? 0);
}

export async function readIntraday(sql: Sql, ticker: string, date: string): Promise<{ points: IntradayBar[]; source: string; fetchedMs: number } | null> {
  const r = await sql.query<{ points: string; source: string; fetched_ms: string | number }>(`SELECT points, source, fetched_ms FROM market_intraday WHERE ticker = $1 AND session_date = $2`, [ticker, date]);
  const row = r.rows[0];
  return row ? { points: JSON.parse(row.points) as IntradayBar[], source: row.source, fetchedMs: Number(row.fetched_ms) } : null;
}

export async function writeIntraday(sql: Sql, ticker: string, date: string, points: IntradayBar[], source: string, fetchedMs: number): Promise<void> {
  await sql.query(
    `INSERT INTO market_intraday (ticker, session_date, points, source, fetched_ms) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (ticker, session_date) DO UPDATE SET points = EXCLUDED.points, source = EXCLUDED.source, fetched_ms = EXCLUDED.fetched_ms`,
    [ticker, date, JSON.stringify(points), source, fetchedMs],
  );
}

export interface TickerState {
  ticker: string;
  needsHistory: boolean;
  historyFetchedMs: number | null;
  intradayForbiddenMs: number | null;
  lastErrorCode: string | null;
  lastErrorMs: number | null;
}

export async function readTickerState(sql: Sql, ticker: string): Promise<TickerState> {
  const r = await sql.query<Record<string, unknown>>(`SELECT * FROM market_ticker_state WHERE ticker = $1`, [ticker]);
  const x = r.rows[0];
  const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return x
    ? { ticker, needsHistory: Boolean(x.needs_history), historyFetchedMs: n(x.history_fetched_ms), intradayForbiddenMs: n(x.intraday_forbidden_ms), lastErrorCode: (x.last_error_code as string) ?? null, lastErrorMs: n(x.last_error_ms) }
    : { ticker, needsHistory: true, historyFetchedMs: null, intradayForbiddenMs: null, lastErrorCode: null, lastErrorMs: null };
}

export async function updateTickerState(sql: Sql, ticker: string, patch: Partial<Omit<TickerState, "ticker">>): Promise<void> {
  const cur = await readTickerState(sql, ticker);
  const next = { ...cur, ...patch };
  await sql.query(
    `INSERT INTO market_ticker_state (ticker, needs_history, history_fetched_ms, intraday_forbidden_ms, last_error_code, last_error_ms) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (ticker) DO UPDATE SET needs_history = EXCLUDED.needs_history, history_fetched_ms = EXCLUDED.history_fetched_ms,
       intraday_forbidden_ms = EXCLUDED.intraday_forbidden_ms, last_error_code = EXCLUDED.last_error_code, last_error_ms = EXCLUDED.last_error_ms`,
    [ticker, next.needsHistory, next.historyFetchedMs, next.intradayForbiddenMs, next.lastErrorCode, next.lastErrorMs],
  );
}
