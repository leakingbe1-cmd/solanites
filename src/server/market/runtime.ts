import "server-only";
import { ConfigError } from "../config";
import { createPostgresDb } from "../db/postgres";
import type { Db } from "../db/types";
import { createSharedRateLimiter } from "../rateLimitShared";
import { getRuntime } from "../runtime";
import { createFixtureProvider, createMassiveProvider, type MarketProvider, type ProviderPlan } from "./provider";
import { createMarketService, type MarketService } from "./service";
import { createLiveMarket, type LiveMarket } from "./live";
import { migrateMarket } from "./store";
import { createTwelveDataClient } from "./twelvedata";

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
 * or RPC, so stock data can run before launch). This stored-closes path predates the approved
 * architecture (TradingView widget publicly, Twelve Data Basic in Developer Mode only); it is
 * reached only when MARKET_PUBLIC_DISPLAY is on, and its removal is pending an owner decision.
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

const liveHolder = globalThis as typeof globalThis & { __solanitesLiveMarket?: { key: string; live: LiveMarket } };

/**
 * Live quotes and history from Twelve Data (no database), when TWELVE_DATA_API_KEY is set.
 * Having a key does not make anything public: public routes also need marketPublicDisplay().
 */
export function getLiveMarket(env: Record<string, string | undefined> = process.env): LiveMarket | null {
  const key = env.TWELVE_DATA_API_KEY?.trim();
  if (!key) return null;
  if (liveHolder.__solanitesLiveMarket?.key !== key) {
    // An alternative base URL (for a proxy or mock) is accepted only over https.
    const base = env.TWELVE_DATA_API_BASE?.trim();
    const client = createTwelveDataClient({ apiKey: key, baseUrl: base && /^https:\/\//i.test(base) ? base : undefined });
    const live = createLiveMarket({
      client,
      creditsPerMinute: Number(env.TWELVE_DATA_CREDITS_PER_MINUTE) || 8,
      creditsPerDay: Number(env.TWELVE_DATA_CREDITS_PER_DAY) || 800,
      planLabel: env.TWELVE_DATA_PLAN_LABEL?.trim() || "Basic (free) plan",
    });
    liveHolder.__solanitesLiveMarket = { key, live };
  }
  return liveHolder.__solanitesLiveMarket.live;
}

/**
 * Whether genuine provider prices may be shown to public visitors. Off unless
 * MARKET_PUBLIC_DISPLAY=1, which should only be set once the provider plan's display rights are
 * confirmed (Twelve Data's free Basic plan is for internal, non-display use).
 */
export function marketPublicDisplay(env: Record<string, string | undefined> = process.env): boolean {
  return env.MARKET_PUBLIC_DISPLAY?.trim() === "1";
}

/**
 * The embeddable chart public pages may show when no displayable prices exist on the server.
 * Off unless MARKET_WIDGET=tradingview, which the owner sets for the Vercel Preview scope; an
 * unset environment (production included) shows no third-party chart. Read only by the public
 * /api/market route, which never offers it for classified species.
 */
export function publicMarketWidget(env: Record<string, string | undefined> = process.env): "tradingview" | null {
  return env.MARKET_WIDGET?.trim().toLowerCase() === "tradingview" ? "tradingview" : null;
}
