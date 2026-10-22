# Launch day: what to paste, in order

Steps 1–5 are one-line edits in three config files. Do them in one commit (GitHub web editor is
fine), then steps 6–8. Copy every address from the chain (the deploy transaction or Solscan), never
type it. `npm test` (and CI) fails on a malformed address, proof link or signature, so a bad paste
can't ship. Budget: about 5 minutes for steps 1–8.

Server tracking (holders, eggs, live numbers) is separate and already listed in
`docs/holder-tracking.md` §3 ("Configuration needed to go live": `SOLANITES_MINT`,
`SOLANA_RPC_URL`, `DATABASE_URL`, `SOLANITES_LAUNCH_AT`). Set `SOLANITES_MINT` to the same address as
step 1.

## 1. Contract address

- **File:** `src/config/social.ts` · `CONTRACT_ADDRESS`
- **Format:** `export const CONTRACT_ADDRESS: string | null = "<mint address>";` (base58, 32–44 characters)
- **Lights up:** the contract line in the hero, footer, nav (wide screens) and phone menu, and the
  Verify $SLNT panel: full address, Copy button, Solscan link, "Only trust this address".
- **Verify:** the homepage shows the address instead of "Contract: coming soon"; Copy pastes the
  exact address; the Solscan link opens the token page with the right name and supply.
- **Not in this release:** an env-var override, a CA bar on every page, Dexscreener and pump.fun
  links, a live market-cap strip and a CA on the X preview card. They were approved but this
  session's safety check refused to build them; they need a separate change.

## 2. Wallet addresses

- **File:** `src/config/tokenomics.ts` · `TOKENOMICS`
- **Format:**
  - allocations: add `address: "<wallet>"` to `Dev holding` and to `Holder rewards (locked 2 h, then distributed)`;
  - project wallets: `teamWallets: [{ label: "Dev", address: "<wallet>" }, { label: "Distribution", address: "<wallet>" }, { label: "Creator fees", address: "<wallet>" }]`.
  A wallet with an empty address stays hidden.
- **Verify:** How It Works → Verify $SLNT shows each wallet with a Copy button; each opens on Solscan
  with the expected balance.

## 3. Lock proof links

- **Files:**
  - `src/config/tokenomics.ts`: `proofUrl: "https://…"` on each locked allocation (and on a locked team wallet);
  - `src/config/holderDistribution.ts`: `lockProofUrl: "https://…"` (the holder-rewards lock).
- **Format:** `https://` links only (e.g. a Streamflow lock page).
- **Verify:** the panel shows "Lock proof ↗" on those rows, and /rewards heads "Locked developer
  supply" and links the proof. Nothing says "locked" without a proof link, except the allocation
  label you wrote yourself.

## 4. Authorities

- **File:** `src/config/tokenomics.ts` · `mintAuthority`, `freezeAuthority`
- **Format:** `"revoked"`. Set it only after checking the token on Solscan: both authorities empty
  (pump.fun revokes them at creation).
- **Verify:** the panel shows "Mint authority: Revoked" and "Freeze authority: Revoked".

## 5. Rewards page on

- **File:** `src/config/holderDistribution.ts` · `export const REWARDS_PAGE_LIVE = true;`
- Optional, same commit: `src/config/share.ts` · `SHARE_TOP_TIERS = true` (Mythic and Secret share cards).
- **Verify:** /rewards answers 200 and shows the published terms (1% of total supply,
  proportional); "Rewards" appears in the nav and footer; /claims redirects to /rewards.

## 6. Search indexing

- **Env var:** Vercel → Project → Settings → Environment Variables → `SOLANITES_INDEXING` = `1`,
  scope **Production** only.
- **Verify (after step 7):** `/robots.txt` allows `/`, and the page source has no
  `<meta name="robots" content="noindex…">`.

## 7. Redeploy

- Commit steps 1–5 to `main` (that commit is a production deploy, so it needs your "ship it").
  If only env vars changed, use Vercel → Deployments → latest Production → Redeploy.
- **Verify:** the new Production deployment is **Ready** and its commit is the one you just made.
  Note the previous Production deployment ID; "Instant Rollback" on it is the undo.

## 8. Live check (2 minutes, phone and desktop)

- Homepage: contract line shows the address; Copy works; Solscan opens the right token; "Hatch it"
  plays the demo hatch.
- How It Works → Verify $SLNT: allocations, wallets, proofs and authorities as set.
- /rewards: terms, "Scheduled after launch", no claim or connect button.
- /robots.txt and a link preview on X (paste the site URL in a draft) look right.
- `/api/health` reports `mint: true` once server tracking is configured.

## 9. At launch + 2 hours: snapshot hash, then transfers

- **File:** `src/config/holderDistribution.ts` · `DISTRIBUTION_PROOF`
- **Snapshot hash first:** `snapshotHash: "<64 hex characters>"`, the SHA-256 of the published
  snapshot list (`sha256sum snapshot.csv`). Publish the list itself next to it.
- **Then each transfer, after you send it yourself:**
  `payouts: [{ wallet: "<recipient>", amount: "12,345.67 $SLNT", signature: "<tx signature>", time: "2026-…T…Z" }, …]`.
  The site never sends anything; it only lists what you paste.
- **Verify:** /rewards shows "Distribution proof" with the hash and one row per transfer; each
  transaction link opens on Solscan and shows the matching amount and recipient. `npm test` checks
  the format of every row.
