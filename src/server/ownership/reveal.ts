import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { verifyWalletSignature } from "@/server/claims/siws";
import type { Sql } from "@/server/db/types";
import { checkSolanaAddress } from "@/server/solana/address";
import { encodeBase58 } from "@/server/solana/base58";

/**
 * Proof that a visitor controls a wallet, for revealing that wallet's own hatched Mythic and
 * Secret creatures. A public address alone proves nothing: the wallet must sign a single-use,
 * short-lived challenge (plain text; no transaction, no fee, no key or seed phrase), and the
 * server checks the ed25519 signature before issuing a session.
 *
 * Separate from the claims sign-in on purpose: a different message action, a different scope
 * inside the session MAC, and a different cookie, so a claims session can never reveal a
 * classified creature and this session can never submit a claim.
 */

export const REVEAL_COOKIE = "sl_reveal";
export const REVEAL_TTL_MS = 30 * 60_000;
const NONCE_TTL_MS = 5 * 60_000;
const SCOPE = "reveal-hatched-solanites";

export interface RevealConfig {
  /** SIWS_DOMAIN: the site's host, written into the message the wallet signs. */
  domain: string | null;
  /** SOLANITES_SESSION_SECRET (32+ characters). */
  secret: string | null;
}

export function readRevealConfig(env: Record<string, string | undefined> = process.env): RevealConfig {
  const secret = env.SOLANITES_SESSION_SECRET?.trim() ?? "";
  return { domain: env.SIWS_DOMAIN?.trim() || null, secret: secret.length >= 32 ? secret : null };
}

export function buildRevealMessage(p: { domain: string; address: string; nonce: string; issuedAt: number; expiresAt: number }): string {
  return [
    `${p.domain} wants you to sign in with your Solana account:`,
    p.address,
    "",
    "Sign in to reveal the Mythic and Secret Solanites hatched by this wallet. This does not send a transaction, cost a fee or give access to your funds.",
    "",
    `Action: ${SCOPE}`,
    `URI: https://${p.domain}`,
    "Version: 1",
    "Chain ID: mainnet",
    `Nonce: ${p.nonce}`,
    `Issued At: ${new Date(p.issuedAt).toISOString()}`,
    `Expiration Time: ${new Date(p.expiresAt).toISOString()}`,
  ].join("\n");
}

const mac = (secret: string, body: string) => createHmac("sha256", secret).update(`${SCOPE}|${body}`).digest("base64url");

export function issueRevealSession(secret: string, address: string, now: number): { token: string; expiresAt: number } {
  const expiresAt = now + REVEAL_TTL_MS;
  const body = `${address}.${expiresAt}`;
  return { token: `${body}.${mac(secret, body)}`, expiresAt };
}

/** The wallet address a reveal session proves, or null (missing, forged, other scope or expired). */
export function readRevealSession(secret: string | null, token: string | null | undefined, now: number): string | null {
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [address, exp, sig] = parts;
  const expected = Buffer.from(mac(secret, `${address}.${exp}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!/^\d+$/.test(exp) || Number(exp) < now) return null;
  return checkSolanaAddress(address).ok ? address : null;
}

export function revealCookie(token: string | null, secure: boolean): string {
  const flags = `Path=/api; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
  return token === null ? `${REVEAL_COOKIE}=; ${flags}; Max-Age=0` : `${REVEAL_COOKIE}=${encodeURIComponent(token)}; ${flags}; Max-Age=${REVEAL_TTL_MS / 1000}`;
}

export function revealTokenFrom(req: Request): string | null {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === REVEAL_COOKIE) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** The wallet the request has proven control of, or null. Fails closed when unconfigured. */
export function provenWallet(req: Request, config: RevealConfig = readRevealConfig(), now = Date.now()): string | null {
  return readRevealSession(config.secret, revealTokenFrom(req), now);
}

// ── challenge storage (single use) ─────────────────────────────────────────

let migrated: WeakSet<object> = new WeakSet();

async function migrate(sql: Sql) {
  if (migrated.has(sql)) return;
  await sql.query(`CREATE TABLE IF NOT EXISTS reveal_nonces (
    nonce text PRIMARY KEY,
    address text NOT NULL,
    message text NOT NULL,
    issued_ms bigint NOT NULL,
    expires_ms bigint NOT NULL,
    used_ms bigint
  )`);
  migrated.add(sql);
}

/** For tests that swap databases. */
export function resetRevealMigrations() {
  migrated = new WeakSet();
}

export type RevealErrorCode = "NOT_CONFIGURED" | "INVALID_ADDRESS" | "NONCE_INVALID" | "INVALID_SIGNATURE";
export class RevealError extends Error {
  constructor(readonly code: RevealErrorCode, message: string) {
    super(message);
  }
}

export async function issueRevealChallenge(sql: Sql, config: RevealConfig, rawAddress: unknown, now: number) {
  if (!config.domain || !config.secret) throw new RevealError("NOT_CONFIGURED", "Wallet sign-in isn't set up on this server.");
  const a = checkSolanaAddress(rawAddress);
  if (!a.ok) throw new RevealError("INVALID_ADDRESS", a.reason);
  await migrate(sql);
  const nonce = encodeBase58(new Uint8Array(randomBytes(16)));
  const message = buildRevealMessage({ domain: config.domain, address: a.address, nonce, issuedAt: now, expiresAt: now + NONCE_TTL_MS });
  await sql.query(`INSERT INTO reveal_nonces (nonce, address, message, issued_ms, expires_ms) VALUES ($1, $2, $3, $4, $5)`, [nonce, a.address, message, now, now + NONCE_TTL_MS]);
  return { message, nonce, expiresAt: now + NONCE_TTL_MS };
}

/** Spends the nonce (valid signature or not) and returns a session for the proven wallet. */
export async function openRevealSession(sql: Sql, config: RevealConfig, rawAddress: unknown, nonce: unknown, signature: unknown, now: number) {
  if (!config.domain || !config.secret) throw new RevealError("NOT_CONFIGURED", "Wallet sign-in isn't set up on this server.");
  const a = checkSolanaAddress(rawAddress);
  if (!a.ok) throw new RevealError("INVALID_ADDRESS", a.reason);
  if (typeof nonce !== "string" || typeof signature !== "string" || nonce.length > 64 || signature.length > 128) throw new RevealError("NONCE_INVALID", "This sign-in request is invalid. Start again.");
  await migrate(sql);
  // Atomic spend: only the first use of an unexpired nonce for this address gets its message back.
  const r = await sql.query<{ message: string }>(`UPDATE reveal_nonces SET used_ms = $3 WHERE nonce = $1 AND address = $2 AND used_ms IS NULL AND expires_ms >= $3 RETURNING message`, [nonce, a.address, now]);
  const row = r.rows[0];
  if (!row) throw new RevealError("NONCE_INVALID", "This sign-in request has expired or was already used. Start again.");
  if (!verifyWalletSignature(row.message, signature, a.address)) throw new RevealError("INVALID_SIGNATURE", "The signature doesn't match this wallet.");
  return { address: a.address, ...issueRevealSession(config.secret, a.address, now) };
}

/**
 * Whether `owner` owns a hatched creature of `speciesId`: an egg issued from on-chain holdings
 * (fixture eggs only in local sample mode), hatched, held by a wallet that isn't excluded.
 * Any database problem answers false: classified content fails closed.
 */
export async function ownsHatchedOnChain(sql: Sql, owner: string, speciesId: string, allowFixture = false): Promise<boolean> {
  try {
    const r = await sql.query(
      `SELECT 1 FROM eggs e JOIN holders h ON h.owner = e.owner
        WHERE e.owner = $1 AND e.species_id = $2 AND e.hatched_ms IS NOT NULL AND h.excluded = false
          AND (e.source = 'chain' OR ($3::boolean AND e.source = 'fixture'))
        LIMIT 1`,
      [owner, speciesId, allowFixture],
    );
    return r.rows.length > 0;
  } catch {
    return false;
  }
}
