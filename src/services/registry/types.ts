import type { SolaniteRecord } from "@/lib/progression";

/**
 * The authority that owns eggs/creatures and their progression.
 *
 * Prototype: `localRegistry` (browser storage + simulated clock).
 * Production: an HTTP client for a backend that
 *   1. authenticates the wallet with a signed nonce (Sign-In With Solana),
 *   2. snapshots on-chain balances on a fixed cadence / indexes transfers,
 *   3. runs `advance()` from lib/progression.ts server-side,
 *   4. rolls species with commit-reveal so results can't be predicted or rerolled,
 *   5. enforces maxEggsPerWallet and tokensPerEgg when claiming.
 */
export interface SolaniteRegistry {
  list(owner: string): Promise<SolaniteRecord[]>;
  claimEgg(owner: string): Promise<SolaniteRecord>;
  hatch(owner: string, id: string): Promise<SolaniteRecord>;
}
