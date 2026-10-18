import { afterEach, describe, expect, it } from "vitest";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";
import { ClaimError, createClaims, readClaimsConfig, type ClaimsConfig } from "../claims/service";
import { REQUIRED_DECISIONS, type FeeRefundPolicy } from "../claims/policy";
import { issueSession, readSession } from "../claims/session";
import { verifyWalletSignature } from "../claims/siws";
import { createPgliteDb } from "../db/pglite";
import { migrate } from "../db/schema";
import type { Db } from "../db/types";
import { keypairFromSeed } from "../fixtures/keys";
import { encodeBase58 } from "../solana/base58";

const LAUNCH = Date.parse("2026-11-01T12:00:00Z");
const HOUR = 3_600_000;
const SECRET = "x".repeat(40);
const open: Db[] = [];
afterEach(async () => {
  while (open.length) await open.pop()!.close();
});

/** A stand-in policy for tests only: 1 unit per whole token held. Not a real refund rule. */
const TEST_POLICY: FeeRefundPolicy = {
  periodId: "launch",
  payoutAsset: "TEST",
  payoutDecimals: 0,
  closesAtMs: null,
  budgetBase: 10_000_000n,
  quote: (ctx) =>
    ctx.verifiedBalance.amountBase > 0n
      ? { eligible: true, amountBase: ctx.verifiedBalance.amountBase / 10n ** BigInt(ctx.verifiedBalance.decimals), lines: [{ label: "Test rule", value: "1 per token" }] }
      : { eligible: false, reason: "No balance." },
};

async function setup(over: { config?: Partial<ClaimsConfig>; policy?: FeeRefundPolicy | null } = {}) {
  const db = await createPgliteDb();
  open.push(db);
  await migrate(db);
  const clock = { t: LAUNCH, now: () => clock.t };
  const balances = new Map<string, bigint>();
  const claims = createClaims({
    db,
    config: { launchAtMs: LAUNCH, openAfterMs: CLAIMS_OPEN_AFTER_MS, domain: "solanites.test", sessionSecret: SECRET, ...over.config },
    policy: over.policy === undefined ? TEST_POLICY : over.policy,
    verifiedBalance: async (a) => ({ amountBase: balances.get(a) ?? 0n, decimals: 6, slot: 42 }),
    now: clock.now,
  });
  return { db, clock, claims, balances };
}

async function signIn(claims: Awaited<ReturnType<typeof setup>>["claims"], seed: number) {
  const kp = keypairFromSeed(seed);
  const { message, nonce } = await claims.issueNonce(kp.address);
  const sig = encodeBase58(kp.sign(new TextEncoder().encode(message)));
  return { kp, ...(await claims.signIn(kp.address, nonce, sig)) };
}

describe("Workflow B: claim window (tests 11, 12)", () => {
  it("is closed for the first six hours after launch", async () => {
    const { claims, clock } = await setup();
    for (const offset of [-HOUR, 0, 3 * HOUR, 6 * HOUR - 1]) {
      clock.t = LAUNCH + offset;
      expect(claims.status().open).toBe(false);
      await expect(claims.issueNonce(keypairFromSeed(1).address)).rejects.toMatchObject({ code: "NOT_OPEN" });
    }
  });

  it("opens at launch + 6h, by the server clock", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 6 * HOUR;
    expect(claims.status()).toMatchObject({ open: true, opensAt: LAUNCH + 6 * HOUR, signInReady: true, policyConfigured: true });
    await expect(claims.issueNonce(keypairFromSeed(1).address)).resolves.toBeTruthy();
  });

  it("stays unscheduled without a configured launch time", async () => {
    const { claims } = await setup({ config: { launchAtMs: null } });
    expect(claims.status()).toMatchObject({ launchAt: null, opensAt: null, open: false });
    expect(readClaimsConfig({}).launchAtMs).toBeNull();
    expect(readClaimsConfig({ SOLANITES_LAUNCH_AT: "2026-11-01T12:00:00Z", SOLANITES_SESSION_SECRET: "short" })).toMatchObject({ launchAtMs: LAUNCH, sessionSecret: null });
  });

  it("without a refund policy, shows the decisions still needed and never quotes an amount", async () => {
    const { claims, clock } = await setup({ policy: null });
    clock.t = LAUNCH + 7 * HOUR;
    expect(claims.status()).toMatchObject({ open: true, policyConfigured: false, requiredDecisions: [...REQUIRED_DECISIONS] });
    const { token } = await signIn(claims, 2);
    await expect(claims.quote(token)).rejects.toMatchObject({ code: "NOT_CONFIGURED" });
    await expect(claims.submit(token)).rejects.toMatchObject({ code: "NOT_CONFIGURED" });
  });
});

describe("ownership verification (test 13)", () => {
  it("accepts a real wallet signature over the server's message", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const s = await signIn(claims, 3);
    expect(claims.sessionAddress(s.token)).toBe(s.kp.address);
  });

  it("rejects a signature from a different wallet", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const victim = keypairFromSeed(4);
    const attacker = keypairFromSeed(5);
    const { message, nonce } = await claims.issueNonce(victim.address);
    const forged = encodeBase58(attacker.sign(new TextEncoder().encode(message)));
    await expect(claims.signIn(victim.address, nonce, forged)).rejects.toMatchObject({ code: "INVALID_SIGNATURE" });
  });

  it("rejects a reused, expired or mismatched nonce", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const kp = keypairFromSeed(6);
    const { message, nonce } = await claims.issueNonce(kp.address);
    const sig = encodeBase58(kp.sign(new TextEncoder().encode(message)));
    await claims.signIn(kp.address, nonce, sig);
    await expect(claims.signIn(kp.address, nonce, sig)).rejects.toMatchObject({ code: "NONCE_INVALID" }); // replay

    const n2 = await claims.issueNonce(kp.address);
    clock.t += 6 * 60_000;
    await expect(claims.signIn(kp.address, n2.nonce, encodeBase58(kp.sign(new TextEncoder().encode(n2.message))))).rejects.toMatchObject({ code: "NONCE_INVALID" });

    const n3 = await claims.issueNonce(kp.address);
    const other = keypairFromSeed(7);
    await expect(claims.signIn(other.address, n3.nonce, encodeBase58(other.sign(new TextEncoder().encode(n3.message))))).rejects.toMatchObject({ code: "NONCE_INVALID" });
  });

  it("sessions can't be forged, altered or used after expiry", () => {
    const a = keypairFromSeed(8).address;
    const { token } = issueSession(SECRET, a, 1000);
    expect(readSession(SECRET, token, 1000)).toBe(a);
    expect(readSession("y".repeat(40), token, 1000)).toBeNull();
    expect(readSession(SECRET, token.replace(a, keypairFromSeed(9).address), 1000)).toBeNull();
    expect(readSession(SECRET, token, 1000 + 16 * 60_000)).toBeNull();
    expect(readSession(SECRET, undefined, 1000)).toBeNull();
  });

  it("verifies ed25519 signatures in base58 or base64 and rejects junk", () => {
    const kp = keypairFromSeed(10);
    const sig = kp.sign(new TextEncoder().encode("hello"));
    expect(verifyWalletSignature("hello", encodeBase58(sig), kp.address)).toBe(true);
    expect(verifyWalletSignature("hello", Buffer.from(sig).toString("base64"), kp.address)).toBe(true);
    expect(verifyWalletSignature("hello!", encodeBase58(sig), kp.address)).toBe(false);
    expect(verifyWalletSignature("hello", "not-a-signature", kp.address)).toBe(false);
  });
});

describe("claims (test 14)", () => {
  it("quotes on the server from verified data and records one claim per wallet", async () => {
    const { claims, clock, balances, db } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const s = await signIn(claims, 11);
    balances.set(s.kp.address, 2_500_000n * 1_000_000n);
    const q = await claims.quote(s.token);
    expect(q).toMatchObject({ eligible: true, amount: "2500000", payoutAsset: "TEST", verifiedAt: { slot: 42, balance: "2500000" } });

    const first = await claims.submit(s.token);
    expect(first.duplicate).toBe(false);
    expect(first.claim).toMatchObject({ amount: "2500000", status: "pending_payout", payoutSignature: null });

    balances.set(s.kp.address, 9_000_000n * 1_000_000n); // balance changes don't create a second claim
    const again = await claims.submit(s.token);
    expect(again.duplicate).toBe(true);
    expect(again.claim.amount).toBe("2500000");

    const [x, y] = await Promise.all([claims.submit(s.token), claims.submit(s.token)]);
    expect([x.duplicate, y.duplicate]).toEqual([true, true]);
    const n = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM fee_claims WHERE claimant = $1`, [s.kp.address]);
    expect(n.rows[0].n).toBe(1);
    expect(await claims.myClaims(s.token)).toHaveLength(1);
  });

  it("refuses ineligible wallets and requests without a session", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const s = await signIn(claims, 12);
    await expect(claims.submit(s.token)).rejects.toMatchObject({ code: "NOT_ELIGIBLE" });
    await expect(claims.quote(undefined)).rejects.toBeInstanceOf(ClaimError);
    await expect(claims.quote("forged.token.value")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("the database refuses a second claim for the same period even if code is bypassed", async () => {
    const { db } = await setup();
    const insert = () => db.query(`INSERT INTO fee_claims (id, claimant, period_id, amount_base, payout_asset, calculation, status, created_ms, updated_ms) VALUES ($1, 'w', 'launch', 1, 'T', '{}', 'pending_payout', 0, 0)`, [`c${Math.random()}`]);
    await insert();
    await expect(insert()).rejects.toThrow();
  });
});

describe("claim budget, audit trail and message binding", () => {
  it("never records more than the period budget, even with concurrent claims", async () => {
    const { claims, clock, balances, db } = await setup({ policy: { ...TEST_POLICY, budgetBase: 5_000_000n } });
    clock.t = LAUNCH + 7 * HOUR;
    const a = await signIn(claims, 20);
    const b = await signIn(claims, 21);
    const c = await signIn(claims, 22);
    balances.set(a.kp.address, 3_000_000n * 1_000_000n);
    balances.set(b.kp.address, 2_000_000n * 1_000_000n);
    balances.set(c.kp.address, 1n * 1_000_000n);
    await claims.submit(a.token);
    const results = await Promise.allSettled([claims.submit(b.token), claims.submit(c.token)]);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(1); // 3M + 2M fills the 5M budget exactly; the 1-unit claim no longer fits
    const rejected = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(rejected.reason).toMatchObject({ code: "BUDGET_EXHAUSTED" });
    const total = await db.query<{ claimed: string; budget: string }>(`SELECT claimed_base AS claimed, budget_base AS budget FROM claim_periods WHERE period_id = 'launch'`);
    expect(total.rows[0]).toEqual({ claimed: "5000000", budget: "5000000" });
    const n = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM fee_claims`);
    expect(n.rows[0].n).toBe(2); // the over-budget claim was not recorded at all
  });

  it("writes every eligibility decision to the audit log", async () => {
    const { claims, clock, balances, db } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const s = await signIn(claims, 23);
    await claims.quote(s.token);
    balances.set(s.kp.address, 5n * 1_000_000n);
    await claims.quote(s.token);
    const rows = await db.query<{ action: string; details: string }>(`SELECT action, details FROM audit_log WHERE actor = $1 ORDER BY id`, [s.kp.address]);
    expect(rows.rows.map((r) => r.action)).toEqual(["claim_sign_in", "claim_quote", "claim_quote"]);
    expect(JSON.parse(rows.rows[1].details)).toMatchObject({ eligible: false });
    expect(JSON.parse(rows.rows[2].details)).toMatchObject({ eligible: true, amountBase: "5" });
  });

  it("binds the signed message to the domain, wallet, nonce, expiry and action", async () => {
    const { claims, clock } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const kp = keypairFromSeed(24);
    const { message, nonce, expiresAt } = await claims.issueNonce(kp.address);
    expect(message).toContain("solanites.test wants you to sign in");
    expect(message).toContain(kp.address);
    expect(message).toContain(`Nonce: ${nonce}`);
    expect(message).toContain(`Expiration Time: ${new Date(expiresAt).toISOString()}`);
    expect(message).toContain("Action: launch-fee-claim-sign-in");
    // A signature over a different message (e.g. another domain) is rejected.
    const forged = encodeBase58(kp.sign(new TextEncoder().encode(message.replace("solanites.test", "evil.test"))));
    await expect(claims.signIn(kp.address, nonce, forged)).rejects.toMatchObject({ code: "INVALID_SIGNATURE" });
  });

  it("recording a claim never marks it paid", async () => {
    const { claims, clock, balances } = await setup();
    clock.t = LAUNCH + 7 * HOUR;
    const s = await signIn(claims, 25);
    balances.set(s.kp.address, 3n * 1_000_000n);
    const { claim } = await claims.submit(s.token);
    expect(claim).toMatchObject({ status: "pending_payout", payoutSignature: null });
  });
});
