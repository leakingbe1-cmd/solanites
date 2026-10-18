import "server-only";

import { checkSolanaAddress } from "./solana/address";
import type { Commitment } from "./solana/rpc";

/**
 * Server-only configuration. Nothing here is exposed to the browser: these
 * variables deliberately have no NEXT_PUBLIC_ prefix.
 */
export interface ServerConfig {
  /** The official token mint — the only thing that identifies the token. */
  mint: string;
  rpcUrl: string;
  commitment: Extract<Commitment, "confirmed" | "finalized">;
  /** Treasury, liquidity pool, burn and other project addresses that never earn eggs or rewards. */
  excludedOwners: Set<string>;
  lookupRateLimit: { max: number; windowMs: number };
  lookupCacheMs: number;
}

export class ConfigError extends Error {
  readonly code = "NOT_CONFIGURED";
  constructor(readonly missing: string[]) {
    super(`Holder tracking is not configured: missing or invalid ${missing.join(", ")}.`);
  }
}

export function readServerConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  const missing: string[] = [];
  const mint = env.SOLANITES_MINT?.trim() ?? "";
  if (!mint || !checkSolanaAddress(mint).ok) missing.push("SOLANITES_MINT");
  const rpcUrl = env.SOLANA_RPC_URL?.trim() ?? "";
  // HTTPS only; plain http is allowed for a local test validator / fake RPC.
  if (!/^https:\/\//.test(rpcUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(rpcUrl)) missing.push("SOLANA_RPC_URL");
  const commitment = (env.SOLANA_COMMITMENT?.trim() || "confirmed") as ServerConfig["commitment"];
  if (!["confirmed", "finalized"].includes(commitment)) missing.push("SOLANA_COMMITMENT");
  const excludedOwners = new Set<string>();
  for (const a of (env.SOLANITES_EXCLUDED_OWNERS ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    if (checkSolanaAddress(a).ok) excludedOwners.add(a);
    else missing.push(`SOLANITES_EXCLUDED_OWNERS (invalid entry)`);
  }
  if (missing.length) throw new ConfigError(missing);
  return {
    mint,
    rpcUrl,
    commitment,
    excludedOwners,
    lookupRateLimit: { max: Number(env.LOOKUP_RATE_LIMIT_MAX) || 20, windowMs: Number(env.LOOKUP_RATE_LIMIT_WINDOW_MS) || 60_000 },
    lookupCacheMs: Number(env.LOOKUP_CACHE_MS) || 15_000,
  };
}
