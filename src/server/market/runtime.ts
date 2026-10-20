import "server-only";
import { ConfigError } from "../config";
import { createPostgresDb } from "../db/postgres";
import type { Db } from "../db/types";
import { createSharedRateLimiter } from "../rateLimitShared";
import { getRuntime } from "../runtime";
import { createFixtureProvider, createMassiveProvider, type MarketProvider, type ProviderPlan } from "./provider";
import { createMarketService, type MarketService } from "./service";
import { migrateMarket } from "./store";

export interface MarketRuntime {
  db: Db;
  provider: MarketProvider | null;
  service: MarketService;
}

const holder = globalThis as typeof globalThis & { __solanitesMarket?: Promise<MarketRuntime> | null };

/**
 * Market runtime, created once per process.
 *
 * Off unless MARKET_DATA_ENABLED=1: until then no database is opened or migrated, and every
 * panel shows "not connected", so a deployment can't create market tables by accident.
 * When enabled it needs DATABASE_URL (the same database as holder tracking, but not the mint
 * or RPC, so stock data can run before launch). MASSIVE_API_KEY switches on fetching; without it, stored data is
 * still served and the panel says market data isn't connected. MARKET_DATA_PLAN=delayed labels
 * a paid plan's intraday data as delayed (default: eod).
 *
 * Local fixture mode (SOLANITES_FIXTURES=1, refused in production builds) shares the fixture
 * database and, without an API key, uses deterministic sample prices labelled as such.
 */
export function getMarketRuntime(env: Record<string, string | undefined> = process.env): Promise<MarketRuntime> {
  if (!holder.__solanitesMarket) {
    holder.__solanitesMarket = buildMarketRuntime(env).catch((e) => {
      holder.__solanitesMarket = null;
      throw e;
    });
  }
  return holder.__solanitesMarket;
}

export async function buildMarketRuntime(env: Record<string, string | undefined>): Promise<MarketRuntime> {
  const key = env.MASSIVE_API_KEY?.trim();
  const plan: ProviderPlan = env.MARKET_DATA_PLAN?.trim() === "delayed" ? "delayed" : "eod";
  const real = key ? createMassiveProvider({ apiKey: key, plan, baseUrl: env.MASSIVE_API_BASE?.trim() || undefined }) : null;

  let db: Db;
  let provider: MarketProvider | null = real;
  if (env.SOLANITES_FIXTURES === "1") {
    if (env.NODE_ENV === "production") throw new ConfigError(["SOLANITES_FIXTURES must not be enabled in production"]);
    db = (await getRuntime(env)).db;
    provider = real ?? createFixtureProvider();
  } else {
    if (env.MARKET_DATA_ENABLED?.trim() !== "1") throw new ConfigError(["MARKET_DATA_ENABLED"]);
    const url = env.DATABASE_URL?.trim();
    if (!url) throw new ConfigError(["DATABASE_URL"]);
    // Reuse holder tracking's pool when it's configured; otherwise open a small one of our own.
    db = await getRuntime(env).then((rt) => rt.db).catch(() => createPostgresDb(url));
  }
  await migrateMarket(db);
  const service = createMarketService({ db, provider, limiter: createSharedRateLimiter(db), callsPerMinute: Number(env.MARKET_CALLS_PER_MINUTE) || 4 });
  return { db, provider, service };
}
