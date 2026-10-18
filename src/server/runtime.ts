import "server-only";

import { eggProgression } from "@/config/eggProgression";
import { createClaims, readClaimsConfig, type Claims } from "./claims/service";
import { ACTIVE_FEE_POLICY } from "./claims/policy";
import { ConfigError, readServerConfig } from "./config";
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
}

let runtime: Promise<Runtime> | null = null;

/**
 * Server runtime for holder tracking and claims, created once per process.
 *
 * Production needs DATABASE_URL, SOLANITES_MINT and SOLANA_RPC_URL; without
 * them the endpoints answer NOT_CONFIGURED. SOLANITES_FIXTURES=1 runs an
 * in-memory database and fixture chain for local development and is refused
 * in production builds.
 */
export function getRuntime(env: Record<string, string | undefined> = process.env): Promise<Runtime> {
  if (!runtime) {
    runtime = buildRuntime(env).catch((e) => {
      runtime = null;
      throw e;
    });
  }
  return runtime;
}

/** Builds a runtime without caching (used by getRuntime and tests). */
export async function buildRuntime(env: Record<string, string | undefined>): Promise<Runtime> {
  const claimsConfig = readClaimsConfig(env);
  const excludeOffCurveOwners = env.SOLANITES_EXCLUDE_PROGRAM_OWNERS !== "false";

  if (env.SOLANITES_FIXTURES === "1") {
    if (env.NODE_ENV === "production") throw new ConfigError(["SOLANITES_FIXTURES must not be enabled in production"]);
    const db = await createPgliteDb();
    await migrate(db);
    const chain = createLedgerChain();
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
    return { source: "fixture", db, rpc: chain.rpc, tracker, claims, fixtureWallets: wallets.map((w) => ({ label: w.label, address: w.address })) };
  }

  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new ConfigError(["DATABASE_URL"]);
  const config = readServerConfig(env);
  const db = createPostgresDb(databaseUrl);
  await migrate(db);
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
