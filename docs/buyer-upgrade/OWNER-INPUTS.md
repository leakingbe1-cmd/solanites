# Owner inputs: what to fill in, and where

Everything below is empty today and **hidden on the site until it has a value**. Nothing shows as
"pending" or "TBD". Copy addresses from the chain (deploy transaction, explorer), never type them
from memory. Each value is a one-line code change; tests fail if a value is malformed.

## Launch switches

| File · key | Controls | Set to | Until then |
|---|---|---|---|
| `src/config/social.ts` · `CONTRACT_ADDRESS` | The contract line in hero, nav and footer, and the Verify $SLNT panel: full address, copy button, Solscan link, "only trust this address" | `"<mint address>"` | "Contract: coming soon" everywhere |
| `src/config/holderDistribution.ts` · `REWARDS_PAGE_LIVE` | The whole `/rewards` page and every link to it (nav, footer, Hatchery guide, How It Works) | `true` | `/rewards` and `/claims` answer 404; nothing mentions it |
| `src/config/share.ts` · `SHARE_TOP_TIERS` | Share cards for Mythic and Secret hatches | `true` | Those tiers get no share button, card or share page |
| `src/config/social.ts` · `COMMUNITY` | A community link in the phone menu and footer | `{ label: "Telegram", url: "https://t.me/…" }` | Only X (@Solanites_) is linked |
| Env `SOLANITES_INDEXING` (Vercel, Production) | Search indexing (robots.txt and the noindex tag) | `1` | Crawlers asked to stay out (X's preview bot is let through) |

## Holder distribution (`src/config/holderDistribution.ts` · `HOLDER_DISTRIBUTION`)

Shown on `/rewards` once `REWARDS_PAGE_LIVE` is on. Rewards joins the main nav only when
**amount, eligibility and process** are all set. Enabling any payout needs separate approval.

| Key | Controls | Example format | Until set |
|---|---|---|---|
| `terms.amount` | "Amount" row | `"10,000,000 $SLNT (1% of supply)"` | Row hidden |
| `terms.eligibility` | "Eligibility" row | `"Wallets holding at least 1,000,000 $SLNT at the snapshot, excluding project, pool and exchange wallets"` | Row hidden |
| `terms.antiSybil` | "One share per holder" row | `"Wallets funded from the same source are counted once"` (see options below) | Row hidden |
| `terms.snapshot` | "Snapshot" row | `"Finalized balances at launch + 2 h; the list and its hash are published on /proof"` | Row hidden |
| `terms.process` | "Process" row | `"Sent from the distribution wallet in batches; transaction links published"` | Row hidden |
| `lockProofUrl` | Calls the supply "locked" and links the proof | `"https://app.streamflow.finance/…"` | Never says "locked" |

### Anti-sybil options (advice; choose one or combine)

An equal share per wallet rewards splitting a bag across many wallets. Options, from simplest:

1. **Minimum hold:** only wallets at or above a set balance at the snapshot (for example one egg's
   worth, 1,000,000 $SLNT). Splitting below it earns nothing.
2. **Hold duration:** only wallets that held that minimum continuously for a set time before the
   snapshot (the tracker already measures verified continuous holding for the leaderboard).
3. **Snapshot plus exclusions:** exclude project, pool, exchange and top-N wallets, and publish the
   snapshot list with a hash so anyone can check it.
4. **Proportional instead of equal:** share by balance (capped), so splitting gains nothing. This
   changes the published rule, so it would need new copy.

None of these changes wallet logic or thresholds in the code today; they are choices for the terms.

## Tokenomics (`src/config/tokenomics.ts` · `TOKENOMICS`)

Shown in the "Verify $SLNT" panel on How It Works (`#tokenomics`) and, compact, on the homepage.
Each fact appears only once set.

| Key | Controls | Example format | Until set |
|---|---|---|---|
| `mintAuthority` | "Mint authority: Revoked/Active" | `"revoked"` | Hidden |
| `freezeAuthority` | "Freeze authority: Revoked/Active" | `"revoked"` | Hidden |
| `allocations[]` | One row per allocation with % of supply, the wallet (copy button) and a lock proof link | `{ label: "Team", percent: 2.5, address: "<wallet>", proofUrl: "https://…" }` | No rows |
| `liquidity` | "Liquidity" row | `"PumpSwap pool; LP tokens burned"` | Hidden |
| `fees` | "Fees" row | `"No transfer tax"` | Hidden |
| `teamWallets[]` | One row per published team or project wallet, with copy button | `{ label: "Treasury", address: "<wallet>" }` | No rows |

Rules the tests enforce: allocations add up to 100 % or less, every percent is above 0, addresses are
valid Solana addresses, proof links are `https://`.
