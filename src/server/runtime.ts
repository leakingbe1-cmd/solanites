import "server-only";

import { eggProgression } from "@/config/eggProgression";
import { createClaims, readClaimsConfig, type Claims } from "./claims/service";
import { ACTIVE_FEE_POLICY } from "./claims/policy";
import { ConfigError, isProductionDeployment, readServerConfig } from "./config";
import { createPgliteDb } from "./db/pglite";
import { createPostgresDb } from "./db/postgres";
import { migrate } from "./db/schema";
import type { Db } from "./db/types";
import { createLedgerChain } from "./fixtures/ledgerChain";
import { fixtureTransfer, seedFixtureChain } from "./fixtures/seed";
import { createRpcClient, type RpcClient } from "./solana/rpc";
import { fetchMintInfo, fetchOwnerBalance } from "./solana/token";
import { createTracker, type Tracker } from "./tracker/service";

export interface Runtime {
  source: "chain" | "fixture";
  db: Db;
  rpc: RpcClient;
  tracker: Tracker;
  claims: Claims;
  fixtureWallets?: { label: string; address: string }[];
  /** Fixture mode only: the in-memory chain (tests and local development). */
  fixtureChain?: ReturnType<typeof createLedgerChain>;
}

// One runtime per process. Kept on globalThis because route handlers can be bundled
// separately (notably in `next dev`), each with its own copy of this module; in fixture
// mode that would otherwise give every route its own in-memory database.
const holder = globalThis as typeof globalThis & { __solanitesRuntime?: Promise<Runtime> | null };

/**
 * Server runtime for holder tracking and claims, created once per process.
 *
 * Production needs DATABASE_URL, SOLANITES_MINT and SOLANA_RPC_URL; without
 * them the endpoints answer NOT_CONFIGURED. SOLANITES_FIXTURES=1 runs an
 * in-memory database and fixture chain for local development and is refused
 * in production builds.
 */
export function getRuntime(env: Record<string, string | undefined> = process.env): Promise<Runtime> {
  if (!holder.__solanitesRuntime) {
    holder.__solanitesRuntime = buildRuntime(env).catch((e) => {
      holder.__solanitesRuntime = null;
      throw e;
    });
  }
  return holder.__solanitesRuntime;
}

/**
 * Holders, eggs and sync cursors are not stored per mint, so one database must only
 * ever serve one token. The first mint to use a database is recorded and any other
 * mint is refused, so a test-mint database can't carry its holders and eggs into
 * production. Production also refuses an unbound database that already has holders
 * (one used before this check existed): give production a fresh database.
 */
export async function bindDatabaseToMint(db: Db, mint: string, production: boolean): Promise<void> {
  const bound = await db.query<{ value: string }>(`SELECT value FROM tracker_state WHERE key = 'bound_mint'`);
  if (!bound.rows.length) {
    if (production) {
      const used = await db.query(`SELECT 1 FROM holders LIMIT 1`);
      if (used.rows.length) throw new ConfigError(["DATABASE_URL (already holds data for an unrecorded mint; use a fresh database)"]);
    }
    await db.query(`INSERT INTO tracker_state (key, value) VALUES ('bound_mint', $1) ON CONFLICT (key) DO NOTHING`, [mint]);
  }
  const now = await db.query<{ value: string }>(`SELECT value FROM tracker_state WHERE key = 'bound_mint'`);
  if (now.rows[0]?.value !== mint) throw new ConfigError(["DATABASE_URL (belongs to a different SOLANITES_MINT; use a separate database per mint)"]);
}

/** Builds a runtime without caching (used by getRuntime and tests). */
export async function buildRuntime(env: Record<string, string | undefined>): Promise<Runtime> {
  const claimsConfig = readClaimsConfig(env);
  const excludeOffCurveOwners = env.SOLANITES_EXCLUDE_PROGRAM_OWNERS !== "false";

  if (env.SOLANITES_FIXTURES === "1") {
    if (env.NODE_ENV === "production") throw new ConfigError(["SOLANITES_FIXTURES must not be enabled in production"]);
    const db = await createPgliteDb();
    await migrate(db);
    const chain = createLedgerChain({ now: Date.now });
    const { wallets } = seedFixtureChain(chain);
    const tracker = createTracker({
      db,
      rpc: chain.rpc,
      config: { mint: chain.mint, excludedOwners: new Set(), excludeOffCurveOwners, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression },
    });
    await tracker.runSync({ force: true });
    fixtureTransfer(chain);
    await tracker.runSync({ force: true });
    const claims = createClaims({
      db,
      config: { ...claimsConfig, domain: claimsConfig.domain ?? "localhost:3000", sessionSecret: claimsConfig.sessionSecret ?? "fixture-only-session-secret-not-for-production" },
      policy: ACTIVE_FEE_POLICY,
      verifiedBalance: async (a) => ({ amountBase: chain.balanceOf(a), decimals: chain.decimals, slot: chain.state.slot }),
    });
    return { source: "fixture", db, rpc: chain.rpc, tracker, claims, fixtureWallets: wallets.map((w) => ({ label: w.label, address: w.address })), fixtureChain: chain };
  }

  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new ConfigError(["DATABASE_URL"]);
  const config = readServerConfig(env);
  const db = createPostgresDb(databaseUrl);
  await migrate(db);
  await bindDatabaseToMint(db, config.mint, isProductionDeployment(env)).catch(async (e) => {
    await db.close();
    throw e;
  });
  const rpc = createRpcClient({ url: config.rpcUrl });
  const tracker = createTracker({
    db,
    rpc,
    config: { mint: config.mint, excludedOwners: config.excludedOwners, excludeOffCurveOwners, source: "chain", maxSignaturesPerAccount: 500, progression: eggProgression },
  });
  const claims = createClaims({
    db,
    config: claimsConfig,
    policy: ACTIVE_FEE_POLICY,
    verifiedBalance: async (address) => {
      const mint = await fetchMintInfo(rpc, config.mint, "finalized");
      const bal = await fetchOwnerBalance(rpc, address, mint, "finalized");
      return { amountBase: bal.usable, decimals: mint.decimals, slot: bal.slot };
    },
  });
  return { source: "chain", db, rpc, tracker, claims };
}
