import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eggProgression } from "@/config/eggProgression";
import { createClaims } from "../claims/service";
import { createPostgresDb } from "../db/postgres";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import { encodeBase58 } from "../solana/base58";
import { createTracker } from "../tracker/service";

/**
 * Runs against a real PostgreSQL server through the production adapter.
 * Opt-in: TEST_DATABASE_URL=postgres://… npm test (use an empty, disposable database).
 */
const url = process.env.TEST_DATABASE_URL;
const W = (n: number) => keypairFromSeed(n).address;

describe.skipIf(!url)("real PostgreSQL (production adapter)", () => {
  let db: Db;
  beforeAll(async () => {
    db = createPostgresDb(url!);
    for (const t of ["fee_claims", "claim_periods", "claim_nonces", "audit_log", "rate_limits", "sync_runs", "eggs", "holder_changes", "processed_transactions", "token_accounts", "holders", "tracker_state", "schema_migrations"]) {
      await db.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
    }
  });
  afterAll(async () => db?.close());

  it("migrates a clean database, and migrating again is a no-op", async () => {
    await migrate(db);
    await migrate(db);
    const tables = await db.query<{ table_name: string }>(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    expect(tables.rows.map((r) => r.table_name)).toEqual([
      "audit_log", "claim_nonces", "claim_periods", "eggs", "fee_claims", "holder_changes", "holders", "processed_transactions", "rate_limits", "schema_migrations", "sync_runs", "token_accounts", "tracker_state",
    ]);
  });

  it("tracks holders, and concurrent syncs and hatches never duplicate anything", async () => {
    const clock = { t: 1_900_000_000_000 };
    const chain = createLedgerChain({ now: () => clock.t });
    const pool = programAddress("pool");
    chain.mintTo(pool, chain.tokens(900_000_000));
    const make = () => createTracker({ db, rpc: chain.rpc, config: { mint: chain.mint, excludedOwners: new Set(), excludeOffCurveOwners: true, source: "fixture", maxSignaturesPerAccount: 500, progression: eggProgression }, now: () => clock.t });
    chain.transfer(pool, W(1), chain.tokens(3_000_000));
    chain.transfer(pool, W(2), chain.tokens(1_000_000));
    chain.transfer(W(2), W(3), chain.tokens(1_000_000));
    await make().runSync({ force: true });
    await Promise.all([make().syncOwner(W(1)), make().syncOwner(W(1)), make().syncOwner(W(1)), make().syncOwner(W(3))]);
    const t = make();
    expect((await t.holderView(W(1))).counts.earned).toBe(3);
    // Wallet 2 passed its tokens on before the tracker ever saw them, so they had not earned an egg yet: wallet 3 earns it.
    expect((await t.holderView(W(2))).counts.earned).toBe(0);
    expect((await t.holderView(W(3))).counts.earned).toBe(1);
    clock.t += 5 * 60_000;
    const id = (await t.holderView(W(1))).eggs[0].id;
    const hatches = await Promise.all(Array.from({ length: 6 }, () => make().hatch(id)));
    expect(hatches.every((h) => h.ok)).toBe(true);
    expect(hatches.filter((h) => h.ok && !h.result.alreadyHatched)).toHaveLength(1);
  });

  it("concurrent claims cannot exceed the period budget", async () => {
    const LAUNCH = Date.parse("2026-11-01T12:00:00Z");
    const claims = createClaims({
      db,
      config: { launchAtMs: LAUNCH, openAfterMs: 6 * 3_600_000, domain: "solanites.test", sessionSecret: "x".repeat(40) },
      policy: { periodId: "pg-launch", payoutAsset: "TEST", payoutDecimals: 0, closesAtMs: null, budgetBase: 10n, quote: () => ({ eligible: true, amountBase: 3n, lines: [] }) },
      verifiedBalance: async () => ({ amountBase: 1n, decimals: 0, slot: 1 }),
      now: () => LAUNCH + 7 * 3_600_000,
    });
    const tokens = [];
    for (let i = 0; i < 6; i++) {
      const kp = keypairFromSeed(500 + i);
      const n = await claims.issueNonce(kp.address);
      tokens.push((await claims.signIn(kp.address, n.nonce, encodeBase58(kp.sign(new TextEncoder().encode(n.message))))).token);
    }
    const results = await Promise.allSettled(tokens.map((tk) => claims.submit(tk)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3); // 3 × 3 = 9 ≤ 10; a 4th would be 12
    const p = await db.query<{ claimed_base: string }>(`SELECT claimed_base FROM claim_periods WHERE period_id = 'pg-launch'`);
    expect(p.rows[0].claimed_base).toBe("9");
  });
});
