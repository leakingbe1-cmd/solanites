import { keypairFromSeed } from "./keys";
import { programAddress, type LedgerChain } from "./ledgerChain";

/**
 * Local fixture holders for trying the Hatchery without a database or RPC.
 * These are NOT real wallets or balances. Every API response built on them
 * carries `source: "fixture"` and the UI shows a fixture banner.
 */
export const FIXTURE_WALLETS = [
  { label: "Exactly 1,000,000", seed: 1001, whole: 1_000_000 },
  { label: "3,500,000 (3 eggs)", seed: 1002, whole: 3_500_000 },
  { label: "10,000,000 (10 eggs)", seed: 1003, whole: 10_000_000 },
  { label: "999,999 (not yet)", seed: 1004, whole: 999_999 },
  { label: "Two token accounts", seed: 1005, whole: 0 },
  { label: "Received a transfer", seed: 1006, whole: 0 },
] as const;

export function seedFixtureChain(chain: LedgerChain) {
  const pool = programAddress("fixture-pool");
  chain.mintTo(pool, chain.tokens(900_000_000));
  const w = FIXTURE_WALLETS.map((f) => ({ ...f, address: keypairFromSeed(f.seed).address }));
  for (const f of w) if (f.whole) chain.transfer(pool, f.address, chain.tokens(f.whole));
  // Two token accounts: 700,000 + 600,000.
  const two = w[4].address;
  chain.transfer(pool, two, chain.tokens(700_000));
  chain.transfer(pool, two, chain.tokens(600_000), { toAccount: chain.openAccount(two) });
  return { pool, wallets: w };
}

/** After the first sync: wallet 1 passes its egg-backed million to wallet 6, which earns nothing for it. */
export function fixtureTransfer(chain: LedgerChain) {
  chain.transfer(keypairFromSeed(1001).address, keypairFromSeed(1006).address, chain.tokens(1_000_000));
}
