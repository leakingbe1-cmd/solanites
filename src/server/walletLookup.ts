import "server-only";

import { gameConfig } from "@/config/gameConfig";
import type { WalletLookupResult } from "@/shared/walletLookup";
import { formatBaseUnits } from "./amounts";
import type { ServerConfig } from "./config";
import { computeEggEligibility } from "./eligibility";
import type { RpcClient } from "./solana/rpc";
import { fetchMintInfo, fetchOwnerBalance, TOKEN_2022_PROGRAM_ID, type MintInfo } from "./solana/token";

const MINT_TTL_MS = 10 * 60_000;

export interface LookupDeps {
  rpc: RpcClient;
  config: ServerConfig;
  now?: () => number;
}

/**
 * Read-only wallet lookup against live chain state.
 *
 * Results are cached briefly per address to absorb repeated lookups; the
 * response says whether it was served from cache and at which slot it was
 * observed. Errors propagate — an RPC outage never turns into a zero balance.
 */
export function createWalletLookup({ rpc, config, now = Date.now }: LookupDeps) {
  let mintCache: { info: MintInfo; at: number } | null = null;
  const cache = new Map<string, { result: WalletLookupResult; at: number }>();

  async function mint(): Promise<MintInfo> {
    if (mintCache && now() - mintCache.at < MINT_TTL_MS) return mintCache.info;
    const info = await fetchMintInfo(rpc, config.mint, config.commitment);
    mintCache = { info, at: now() };
    return info;
  }

  return async function lookup(address: string): Promise<WalletLookupResult> {
    const hit = cache.get(address);
    if (hit && now() - hit.at < config.lookupCacheMs) return { ...hit.result, source: { ...hit.result.source, cached: true } };

    const m = await mint();
    const bal = await fetchOwnerBalance(rpc, address, m, config.commitment);
    const excluded = config.excludedOwners.has(address);
    const elig = computeEggEligibility(excluded ? 0n : bal.usable, m.decimals, {
      tokensPerEgg: gameConfig.token.tokensPerEgg,
      maxEggsPerWallet: gameConfig.eggs.maxEggsPerWallet,
    });

    const result: WalletLookupResult = {
      address,
      token: { mint: m.mint, tokenProgram: m.tokenProgram === TOKEN_2022_PROGRAM_ID ? "spl-token-2022" : "spl-token", decimals: m.decimals },
      balance: {
        amountBase: bal.usable.toString(),
        amount: formatBaseUnits(bal.usable, m.decimals),
        frozenAmount: formatBaseUnits(bal.frozen, m.decimals),
        tokenAccounts: bal.accounts.map((a) => ({ address: a.address, amount: formatBaseUnits(a.amount, m.decimals), state: a.state })),
      },
      eggs: {
        tokensPerEgg: gameConfig.token.tokensPerEgg,
        maxEggsPerWallet: gameConfig.eggs.maxEggsPerWallet,
        meetsThreshold: elig.meetsThreshold,
        eligibleEggs: elig.eggs,
        toNextEgg: formatBaseUnits(elig.toNextEggBase, m.decimals),
        excluded,
      },
      holding: {
        status: "not_tracked",
        note: "Holding duration is not tracked yet. A current balance does not show how long it has been held.",
      },
      rewards: { status: "not_available", note: "Reward calculations are not live yet." },
      source: { kind: "live-rpc", commitment: config.commitment, slot: bal.slot, observedAt: new Date(now()).toISOString(), cached: false },
    };
    cache.set(address, { result, at: now() });
    if (cache.size > 5000) cache.delete(cache.keys().next().value as string);
    return result;
  };
}
