import { afterEach, describe, expect, it } from "vitest";
import { ConfigError, isProductionDeployment, readServerConfig } from "../config";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { bindDatabaseToMint } from "../runtime";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../solana/token";

// Any two valid 32-byte addresses stand in for a test mint and a production mint.
const TEST_MINT = TOKEN_PROGRAM_ID;
const PROD_MINT = TOKEN_2022_PROGRAM_ID;
const base = { SOLANA_RPC_URL: "https://rpc.example", SOLANITES_TEST_MINTS: ` ${TEST_MINT} ,other` };

function missingOf(env: Record<string, string>): string[] {
  try {
    readServerConfig(env);
    return [];
  } catch (e) {
    expect(e).toBeInstanceOf(ConfigError);
    return (e as ConfigError).missing;
  }
}

describe("production mint separation", () => {
  it("only Vercel Production counts as production, not NODE_ENV", () => {
    expect(isProductionDeployment({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionDeployment({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(false);
    expect(isProductionDeployment({ NODE_ENV: "production" })).toBe(false);
  });

  it("refuses a listed test mint on Production and allows it on Preview", () => {
    expect(missingOf({ ...base, SOLANITES_MINT: TEST_MINT, VERCEL_ENV: "production" })).toEqual(["SOLANITES_MINT (a test mint is configured in production)"]);
    expect(missingOf({ ...base, SOLANITES_MINT: TEST_MINT, VERCEL_ENV: "preview" })).toEqual([]);
    expect(missingOf({ ...base, SOLANITES_MINT: PROD_MINT, VERCEL_ENV: "production" })).toEqual([]);
  });

  it("still fails closed on a missing or malformed mint", () => {
    expect(missingOf({ ...base, VERCEL_ENV: "production" })).toEqual(["SOLANITES_MINT"]);
    expect(missingOf({ ...base, SOLANITES_MINT: "not-a-mint", VERCEL_ENV: "production" })).toEqual(["SOLANITES_MINT"]);
  });
});

describe("one database per mint", () => {
  let db: Db | undefined;
  afterEach(async () => {
    await db?.close();
    db = undefined;
  });

  async function freshDb(withHolder = false): Promise<Db> {
    db = await createPgliteDb();
    await migrate(db);
    if (withHolder) await db.query(`INSERT INTO holders (owner, source, first_seen_ms) VALUES ($1, 'chain', 0)`, [TEST_MINT]);
    return db;
  }

  it("binds a database to its first mint and keeps accepting that mint", async () => {
    const d = await freshDb();
    await bindDatabaseToMint(d, TEST_MINT, false);
    await bindDatabaseToMint(d, TEST_MINT, false);
    const r = await d.query<{ value: string }>(`SELECT value FROM tracker_state WHERE key = 'bound_mint'`);
    expect(r.rows[0].value).toBe(TEST_MINT);
  });

  it("refuses a test-mint database once the production mint is configured", async () => {
    const d = await freshDb();
    await bindDatabaseToMint(d, TEST_MINT, false);
    await expect(bindDatabaseToMint(d, PROD_MINT, true)).rejects.toBeInstanceOf(ConfigError);
    await expect(bindDatabaseToMint(d, PROD_MINT, false)).rejects.toBeInstanceOf(ConfigError);
  });

  it("production refuses an unbound database that already has holders; other deployments adopt it", async () => {
    await expect(bindDatabaseToMint(await freshDb(true), PROD_MINT, true)).rejects.toBeInstanceOf(ConfigError);
    await db!.close();
    const d = await freshDb(true);
    await bindDatabaseToMint(d, TEST_MINT, false);
    await expect(bindDatabaseToMint(d, PROD_MINT, true)).rejects.toBeInstanceOf(ConfigError);
  });

  it("production accepts a fresh, empty database", async () => {
    await expect(bindDatabaseToMint(await freshDb(), PROD_MINT, true)).resolves.toBeUndefined();
  });
});

describe("GET /api/health when tracking is not configured", () => {
  it("names the failing settings only for the scheduler secret, never values", async () => {
    process.env.CRON_SECRET = "cron-secret-for-tests";
    delete process.env.SOLANITES_FIXTURES;
    delete process.env.DATABASE_URL;
    const { GET } = await import("@/app/api/health/route");
    const pub = await (await GET(new Request("http://localhost/api/health"))).json();
    expect(pub).toEqual({ status: "not_configured", lastSuccessfulSyncAt: null });
    const detailed = await (await GET(new Request("http://localhost/api/health", { headers: { authorization: "Bearer cron-secret-for-tests" } }))).json();
    expect(detailed.status).toBe("not_configured");
    expect(detailed.notConfigured).toEqual(["DATABASE_URL"]);
  });
});
