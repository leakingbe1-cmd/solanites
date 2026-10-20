# Live homepage metrics

`GET /api/home-stats` feeds the three metrics on the homepage hero. Shape: `src/shared/homeStats.ts`.

| Metric | Source | Refresh | Needs |
|---|---|---|---|
| Holders | `getProgramAccounts` snapshot of every token account for the mint (SPL Token or Token-2022, read from the mint's owner program) | 5 min | `SOLANITES_MINT`, `SOLANA_RPC_URL` |
| Eggs collected | Count of rows in the tracker's `eggs` table (unique per owner and sequence) | 1 min | `DATABASE_URL` and at least one completed tracker sync |
| Market cap | `fetchTokenMarket` (`src/server/market/tokenMarket.ts`) | 30 s | Provider host reachable; `kind` says circulating or FDV |

## Holder rules
- A holder is a unique wallet owner with a positive balance. Several token accounts of one owner count once; empty accounts don't count.
- Excluded: owners off the ed25519 curve (program-derived addresses such as AMM pools, bonding curves and vaults) and the addresses in `SOLANITES_EXCLUDED_OWNERS` (treasury, team, burn). Ordinary wallets are never excluded.
- Not `getTokenLargestAccounts` (top 20 only).

## Honesty rules
- A value is `live` within its refresh window, `stale` (last good value, with its time) for a bounded period after a failed refresh, and otherwise `unavailable` with a reason. Nothing is ever invented, and a missing value is never shown as 0.
- Eggs are `unavailable` until the tracker has completed a sync, because an unsynced egg table is incomplete.
- After a failure each source waits 30 s before being asked again, and the response is CDN-cached (`s-maxage=30`), so traffic can't hammer the RPC or the market provider.

## Test vs production mint
The mint is configuration only: `SOLANITES_MINT` per Vercel environment.
- Preview: the test mint `ESnW5ZbLmoEAg2QEMxnMsY9R3aS8Kw58HJacYURmpump` (pump.fun, Token-2022). It is never the Solanites mint.
- Production: the real Solanites mint, set in Vercel → Settings → Environment Variables → `SOLANITES_MINT` (Production only), then redeploy. No code change.
