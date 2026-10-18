import { randomBytes } from "node:crypto";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";
import type { ClaimQuote, ClaimsStatus, FeeClaimRecord } from "@/shared/claims";
import { formatBaseUnits } from "../amounts";
import type { Db } from "../db/types";
import { encodeBase58 } from "../solana/base58";
import { checkSolanaAddress } from "../solana/address";
import { REQUIRED_DECISIONS, type ClaimContext, type FeeRefundPolicy } from "./policy";
import { issueSession, readSession } from "./session";
import { buildSignInMessage, verifyWalletSignature } from "./siws";

export interface ClaimsConfig {
  launchAtMs: number | null;
  openAfterMs: number;
  /** Domain bound into the sign-in message, e.g. "solanites.vercel.app". */
  domain: string | null;
  /** HMAC secret for claim sessions (32+ characters). */
  sessionSecret: string | null;
}

export class ClaimError extends Error {
  constructor(
    readonly code: "NOT_OPEN" | "NOT_CONFIGURED" | "INVALID_ADDRESS" | "INVALID_SIGNATURE" | "NONCE_INVALID" | "UNAUTHORIZED" | "NOT_ELIGIBLE" | "BUDGET_EXHAUSTED",
    message: string,
  ) {
    super(message);
  }
}

export interface ClaimsDeps {
  db: Db;
  config: ClaimsConfig;
  policy: FeeRefundPolicy | null;
  /** Live balance on the server at finalized commitment. */
  verifiedBalance(address: string): Promise<{ amountBase: bigint; decimals: number; slot: number }>;
  now?: () => number;
}

const NONCE_TTL_MS = 5 * 60_000;

export function readClaimsConfig(env: Record<string, string | undefined> = process.env): ClaimsConfig {
  const launch = env.SOLANITES_LAUNCH_AT?.trim();
  const launchAtMs = launch ? Date.parse(launch) : NaN;
  const secret = env.SOLANITES_SESSION_SECRET?.trim() ?? "";
  return {
    launchAtMs: Number.isFinite(launchAtMs) ? launchAtMs : null,
    openAfterMs: CLAIMS_OPEN_AFTER_MS,
    domain: env.SIWS_DOMAIN?.trim() || null,
    sessionSecret: secret.length >= 32 ? secret : null,
  };
}

export function createClaims({ db, config, policy, verifiedBalance, now = Date.now }: ClaimsDeps) {
  const opensAt = config.launchAtMs === null ? null : config.launchAtMs + config.openAfterMs;

  function status(): ClaimsStatus {
    const t = now();
    const closesAt = policy?.closesAtMs ?? null;
    return {
      serverNow: t,
      serviceReady: true,
      launchAt: config.launchAtMs,
      opensAt,
      open: opensAt !== null && t >= opensAt && (closesAt === null || t < closesAt),
      signInReady: !!config.domain && !!config.sessionSecret,
      policyConfigured: !!policy,
      requiredDecisions: policy ? [] : [...REQUIRED_DECISIONS],
      closesAt,
    };
  }

  function requireOpen() {
    const s = status();
    if (s.launchAt === null) throw new ClaimError("NOT_OPEN", "Fee claims are not scheduled: the launch time has not been configured.");
    if (!s.open) throw new ClaimError("NOT_OPEN", s.opensAt !== null && now() < s.opensAt ? "Fee claims open six hours after launch." : "The claim period has ended.");
    if (!s.signInReady) throw new ClaimError("NOT_CONFIGURED", "Wallet sign-in is not configured on the server.");
  }

  function checkAddress(raw: unknown): string {
    const c = checkSolanaAddress(raw);
    if (!c.ok) throw new ClaimError("INVALID_ADDRESS", c.reason);
    return c.address;
  }

  /** Step 1: a single-use message for the wallet to sign. */
  async function issueNonce(rawAddress: unknown): Promise<{ message: string; nonce: string; expiresAt: number }> {
    requireOpen();
    const address = checkAddress(rawAddress);
    const t = now();
    const nonce = encodeBase58(new Uint8Array(randomBytes(16)));
    const message = buildSignInMessage({ domain: config.domain!, address, nonce, issuedAt: t, expiresAt: t + NONCE_TTL_MS });
    await db.query(`INSERT INTO claim_nonces (nonce, address, message, issued_ms, expires_ms) VALUES ($1, $2, $3, $4, $5)`, [nonce, address, message, t, t + NONCE_TTL_MS]);
    return { message, nonce, expiresAt: t + NONCE_TTL_MS };
  }

  /** Step 2: proves the claimant controls the wallet. The nonce is spent whether or not the signature is valid. */
  async function signIn(rawAddress: unknown, nonce: string, signature: string): Promise<{ token: string; expiresAt: number; address: string }> {
    requireOpen();
    const address = checkAddress(rawAddress);
    const t = now();
    const row = await db.tx(async (sql) => {
      const r = (await sql.query<{ address: string; message: string; expires_ms: string; used_ms: string | null }>(`SELECT * FROM claim_nonces WHERE nonce = $1 FOR UPDATE`, [nonce])).rows[0];
      if (r && r.used_ms === null) await sql.query(`UPDATE claim_nonces SET used_ms = $2 WHERE nonce = $1`, [nonce, t]);
      return r;
    });
    if (!row || row.used_ms !== null || row.address !== address || Number(row.expires_ms) < t) throw new ClaimError("NONCE_INVALID", "This sign-in request has expired or was already used. Start again.");
    if (!verifyWalletSignature(row.message, signature, address)) throw new ClaimError("INVALID_SIGNATURE", "The signature does not match this wallet.");
    const s = issueSession(config.sessionSecret!, address, t);
    await db.query(`INSERT INTO audit_log (at_ms, actor, action, details) VALUES ($1, $2, 'claim_sign_in', '{}')`, [t, address]);
    return { ...s, address };
  }

  function sessionAddress(token: string | undefined | null): string {
    if (!config.sessionSecret) throw new ClaimError("NOT_CONFIGURED", "Wallet sign-in is not configured on the server.");
    const a = readSession(config.sessionSecret, token, now());
    if (!a) throw new ClaimError("UNAUTHORIZED", "Sign in with your wallet first.");
    return a;
  }

  async function context(address: string): Promise<ClaimContext> {
    const bal = await verifiedBalance(address);
    const holder = (await db.query<{ first_seen_ms: string; eggs_earned: number }>(`SELECT first_seen_ms, eggs_earned FROM holders WHERE owner = $1`, [address])).rows[0];
    const history = (await db.query<{ signature: string; slot: string; pre_base: string; post_base: string }>(`SELECT signature, slot, pre_base, post_base FROM holder_changes WHERE owner = $1 ORDER BY slot`, [address])).rows;
    return {
      claimant: address,
      nowMs: now(),
      launchAtMs: config.launchAtMs!,
      verifiedBalance: bal,
      history: history.map((h) => ({ signature: h.signature, slot: Number(h.slot), preBase: BigInt(h.pre_base), postBase: BigInt(h.post_base) })),
      tracked: holder ? { firstSeenMs: Number(holder.first_seen_ms), eggsEarned: holder.eggs_earned } : null,
    };
  }

  /** Step 3: the amount, worked out on the server from verified data. Nothing from the browser is trusted. */
  async function quote(token: string | undefined | null): Promise<ClaimQuote> {
    requireOpen();
    const address = sessionAddress(token);
    if (!policy) throw new ClaimError("NOT_CONFIGURED", "Claim amounts are not available: the refund rules have not been confirmed yet.");
    const ctx = await context(address);
    const q = await policy.quote(ctx);
    await audit(address, "claim_quote", q.eligible ? { eligible: true, amountBase: q.amountBase.toString(), slot: ctx.verifiedBalance.slot } : { eligible: false, reason: q.reason, slot: ctx.verifiedBalance.slot });
    const verifiedAt = { slot: ctx.verifiedBalance.slot, balance: formatBaseUnits(ctx.verifiedBalance.amountBase, ctx.verifiedBalance.decimals) };
    if (!q.eligible) return { address, eligible: false, reason: q.reason, lines: [], verifiedAt };
    return { address, eligible: true, amount: formatBaseUnits(q.amountBase, policy.payoutDecimals), payoutAsset: policy.payoutAsset, lines: q.lines, verifiedAt };
  }

  function toRecord(r: { id: string; period_id: string; amount_base: string; payout_asset: string; status: FeeClaimRecord["status"]; created_ms: string; payout_signature: string | null; calculation: string }): FeeClaimRecord {
    return {
      id: r.id,
      periodId: r.period_id,
      amount: formatBaseUnits(BigInt(r.amount_base), policy?.payoutDecimals ?? 0),
      payoutAsset: r.payout_asset,
      status: r.status,
      createdAt: Number(r.created_ms),
      payoutSignature: r.payout_signature,
      lines: JSON.parse(r.calculation).lines ?? [],
    };
  }

  /**
   * Step 4: records the claim. The amount is recalculated here; one claim per
   * wallet per period is enforced by a database constraint. Recording a
   * claim does not pay it.
   */
  async function submit(token: string | undefined | null): Promise<{ claim: FeeClaimRecord; duplicate: boolean }> {
    requireOpen();
    const address = sessionAddress(token);
    if (!policy) throw new ClaimError("NOT_CONFIGURED", "Claim amounts are not available: the refund rules have not been confirmed yet.");
    const existing = await db.query<Parameters<typeof toRecord>[0]>(`SELECT * FROM fee_claims WHERE claimant = $1 AND period_id = $2`, [address, policy.periodId]);
    if (existing.rows.length) return { claim: toRecord(existing.rows[0]), duplicate: true };
    const ctx = await context(address);
    const q = await policy.quote(ctx);
    if (!q.eligible) {
      await audit(address, "claim_rejected", { reason: q.reason, slot: ctx.verifiedBalance.slot });
      throw new ClaimError("NOT_ELIGIBLE", q.reason);
    }
    const t = now();
    const id = `claim_${policy.periodId}_${address}`;
    return db.tx(async (sql) => {
      const ins = await sql.query<Parameters<typeof toRecord>[0]>(
        `INSERT INTO fee_claims (id, claimant, period_id, amount_base, payout_asset, calculation, status, created_ms, updated_ms) VALUES ($1, $2, $3, $4, $5, $6, 'pending_payout', $7, $7)
         ON CONFLICT (claimant, period_id) DO NOTHING RETURNING *`,
        [id, address, policy.periodId, q.amountBase.toString(), policy.payoutAsset, JSON.stringify({ lines: q.lines, slot: ctx.verifiedBalance.slot, balanceBase: ctx.verifiedBalance.amountBase.toString() }), t],
      );
      if (!ins.rows.length) {
        const r = await sql.query<Parameters<typeof toRecord>[0]>(`SELECT * FROM fee_claims WHERE claimant = $1 AND period_id = $2`, [address, policy.periodId]);
        return { claim: toRecord(r.rows[0]), duplicate: true };
      }
      // Reserve the amount against the period budget in the same transaction; if it doesn't fit, nothing is recorded.
      await sql.query(
        `INSERT INTO claim_periods (period_id, budget_base) VALUES ($1, $2) ON CONFLICT (period_id) DO UPDATE SET budget_base = EXCLUDED.budget_base`,
        [policy.periodId, policy.budgetBase.toString()],
      );
      const reserved = await sql.query(
        `UPDATE claim_periods SET claimed_base = claimed_base + $2 WHERE period_id = $1 AND claimed_base + $2 <= budget_base RETURNING period_id`,
        [policy.periodId, q.amountBase.toString()],
      );
      if (!reserved.rows.length) throw new ClaimError("BUDGET_EXHAUSTED", "The claim budget for this period has been used up.");
      await sql.query(`INSERT INTO audit_log (at_ms, actor, action, details) VALUES ($1, $2, 'claim_recorded', $3)`, [t, address, JSON.stringify({ id, amountBase: q.amountBase.toString() })]);
      return { claim: toRecord(ins.rows[0]), duplicate: false };
    });
  }

  async function audit(actor: string, action: string, details: Record<string, unknown>) {
    await db.query(`INSERT INTO audit_log (at_ms, actor, action, details) VALUES ($1, $2, $3, $4)`, [now(), actor, action, JSON.stringify(details)]);
  }

  async function myClaims(token: string | undefined | null): Promise<FeeClaimRecord[]> {
    const address = sessionAddress(token);
    const r = await db.query<Parameters<typeof toRecord>[0]>(`SELECT * FROM fee_claims WHERE claimant = $1 ORDER BY created_ms`, [address]);
    return r.rows.map(toRecord);
  }

  return { status, issueNonce, signIn, quote, submit, myClaims, sessionAddress };
}

export type Claims = ReturnType<typeof createClaims>;
