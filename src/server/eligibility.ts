import { wholeTokensToBase } from "./amounts";

export interface EggRules {
  /** Whole tokens required per egg (UI units, e.g. 1_000_000). */
  tokensPerEgg: number;
  /** Upper bound on eggs, or null for no cap. */
  maxEggsPerWallet: number | null;
}

export interface EggEligibility {
  thresholdBase: bigint;
  meetsThreshold: boolean;
  eggs: number;
  /** Base units still needed for the next egg; 0 when at the cap. */
  toNextEggBase: bigint;
}

/** Integer-only egg eligibility: eggs = floor(balance / threshold), capped when a cap is set. */
export function computeEggEligibility(balanceBase: bigint, decimals: number, rules: EggRules): EggEligibility {
  const thresholdBase = wholeTokensToBase(rules.tokensPerEgg, decimals);
  if (thresholdBase <= 0n) throw new Error("tokensPerEgg must be positive");
  const raw = balanceBase / thresholdBase;
  const cap = rules.maxEggsPerWallet === null ? null : BigInt(rules.maxEggsPerWallet);
  const eggs = cap !== null && raw > cap ? cap : raw;
  const toNextEggBase = cap !== null && eggs >= cap ? 0n : (eggs + 1n) * thresholdBase - balanceBase;
  return { thresholdBase, meetsThreshold: balanceBase >= thresholdBase, eggs: Number(eggs), toNextEggBase };
}
