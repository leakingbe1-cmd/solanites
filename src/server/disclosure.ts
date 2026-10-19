import "server-only";

import type { ClaimsStatus } from "@/shared/claims";
import type { WalletLookupResult } from "@/shared/walletLookup";

/**
 * Prelaunch disclosure: what public API responses may reveal about the launch.
 *
 * The launch time (SOLANITES_LAUNCH_AT) and the token mint stay out of every public
 * response until the launch is public: SOLANITES_LAUNCH_PUBLIC=1 is set, or the
 * configured launch time has passed. Setting them early on the server (for testing or
 * to prepare) therefore never leaks them. Internal logic still uses the real values.
 */
export function launchIsPublic(env: Record<string, string | undefined> = process.env, now = Date.now()): boolean {
  if (env.SOLANITES_LAUNCH_PUBLIC?.trim() === "1") return true;
  const at = Date.parse(env.SOLANITES_LAUNCH_AT?.trim() ?? "");
  return Number.isFinite(at) && now >= at;
}

/** The claim schedule as the public may see it: no launch or opening time before launch is public. */
export function publicClaimsStatus(status: ClaimsStatus, isPublic: boolean): ClaimsStatus {
  return isPublic ? status : { ...status, launchAt: null, opensAt: null };
}

/**
 * A wallet lookup as the public may see it: before launch is public, the mint and the token
 * account addresses (which name the mint on-chain) are withheld. Balances and eggs remain.
 */
export function publicWalletLookup(result: WalletLookupResult, isPublic: boolean): WalletLookupResult {
  if (isPublic) return result;
  return {
    ...result,
    token: { ...result.token, mint: null },
    balance: { ...result.balance, tokenAccounts: [] },
  };
}
