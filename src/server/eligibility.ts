import { wholeTokensToBase } from "./amounts";

export interface EggRules {
  /** Whole tokens required per egg (UI units, e.g. 10_000). */
  tokensPerEgg: number;
  maxEggsPerWallet: number;
}

export interface EggEligibility {
  thresholdBase: bigint;
  meetsThreshold: boolean;
  eggs: number;
  /** Base units still needed for the next egg; 0 when at the cap. */
  toNextEggBase: bigint;
}

/** Integer-only egg eligibility: eggs = min(max, floor(balance / threshold)). */
export function computeEggEligibility(balanceBase: bigint, decimals: number, rules: EggRules): EggEligibility {
  const thresholdBase = wholeTokensToBase(rules.tokensPerEgg, decimals);
  if (thresholdBase <= 0n) throw new Error("tokensPerEgg must be positive");
  const raw = balanceBase / thresholdBase;
  const cap = BigInt(rules.maxEggsPerWallet);
  const eggs = raw > cap ? cap : raw;
  const toNextEggBase = eggs >= cap ? 0n : (eggs + 1n) * thresholdBase - balanceBase;
  return { thresholdBase, meetsThreshold: balanceBase >= thresholdBase, eggs: Number(eggs), toNextEggBase };
}
