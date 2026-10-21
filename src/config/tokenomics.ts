/**
 * $SLNT tokenomics and trust facts, set by the owner. Every field starts empty and stays hidden on
 * the site until it has a value: nothing is ever shown as "pending" or "TBD", and no number here is
 * invented. Addresses are public data, copied from the chain, never typed from memory.
 * Shown on How It Works ("Tokenomics") and in the "Verify $SLNT" panel; see src/lib/tokenomics.ts.
 */
export interface Allocation {
  label: string;
  /** Share of total supply, in percent. */
  percent: number;
  /** Wallet holding it, when there is one. */
  address?: string;
  /** Public lock or vesting proof (e.g. a Streamflow link). */
  proofUrl?: string;
}

export interface Tokenomics {
  /** Supply split. The percentages must add up to 100 or less. */
  allocations: Allocation[];
  /** Liquidity, in a sentence (e.g. where it sits and whether LP tokens are burned). */
  liquidity: string | null;
  /** On-chain mint and freeze authority status, as verified on the chain. */
  mintAuthority: "revoked" | "active" | null;
  freezeAuthority: "revoked" | "active" | null;
  /** Trading fees or taxes, in a sentence. */
  fees: string | null;
  /** Team and project wallets, published so buyers can recognise them. */
  teamWallets: { label: string; address: string }[];
}

export const TOKENOMICS: Tokenomics = {
  allocations: [],
  liquidity: null,
  mintAuthority: null,
  freezeAuthority: null,
  fees: null,
  teamWallets: [],
};
