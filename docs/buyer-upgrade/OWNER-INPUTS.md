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
**amount, eligibility and process** are all set (they are). Enabling any payout needs separate
approval; the site has no payout code. The rule: 1% of total supply, shared among eligible holders
in proportion to their holdings at the snapshot.

| Key | Controls | Set to (owner, 22 Oct) |
|---|---|---|
| `terms.amount` | "Amount" row | `"1% of total supply"` |
| `terms.eligibility` | "Eligibility" row | `"Every wallet holding $SLNT at the snapshot, excluding the liquidity pool, project and exchange wallets"` |
| `terms.antiSybil` | "Wallet splitting" row | `"Shares are proportional to each wallet's balance, so splitting a holding across wallets gains nothing"` |
| `terms.snapshot` | "Snapshot" row | `"Finalized balances exactly 2 hours after launch; the snapshot list and its hash are published on /rewards"` |
| `terms.process` | "Process" row | `"Sent from the published distribution wallet in batches; every transaction is linked on /rewards"` |
| `lockProofUrl` | Calls the supply "locked" and links the proof | Empty until launch day; until then the page never says "locked" |

Proportional shares remove the reason to split a holding across wallets: ten wallets holding a
tenth each receive exactly what one wallet holding it all would. Exclusions (pool, project and
exchange wallets) are still needed so the pool and the team don't take a share.

## Tokenomics (`src/config/tokenomics.ts` · `TOKENOMICS`)

Shown in the "Verify $SLNT" panel on How It Works (`#tokenomics`) and, compact, on the homepage.
Each fact appears only once set; an empty wallet, proof or authority is hidden.

| Key | Controls | Set to (owner, 22 Oct) | Launch day |
|---|---|---|---|
| `allocations[]` | One row per allocation with % of supply, the wallet (copy button) and a lock proof link | `Dev holding` 0.5%; `Holder rewards (locked 2 h, then distributed)` 1% | Add each `address` and, if locked, its `proofUrl` |
| `fees` | "Fees" row | `"No transfer tax. Creator fees fund the next version of Solanites: a living world where your creatures have a purpose."` | |
| `liquidity` | "Liquidity" row | Not set (hidden) | Optional: `"pump.fun bonding curve, then PumpSwap"` |
| `mintAuthority` / `freezeAuthority` | "Mint/Freeze authority: Revoked" | Not set (hidden) | `"revoked"`, only after checking on Solscan |
| `teamWallets[]` | One row per published wallet, with copy button | Empty (hidden) | `{ label: "Dev", address }`, `{ label: "Distribution", address }`, `{ label: "Creator fees", address }` |

Rules the tests enforce: allocations add up to 100 % or less, every percent is above 0, addresses are
valid Solana addresses, proof links are `https://`.

Note: the second allocation's label says "locked" as the owner wrote it; the lock proof link is
added on launch day (`proofUrl`). Until then the label is the only place that word appears.
