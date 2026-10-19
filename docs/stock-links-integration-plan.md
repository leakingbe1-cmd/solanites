# Integration plan: mounting the stock panel (for the website session)

The stock-link backend, API routes, panel components and owner test view are on branch `feature/creature-stock-link`, based on `design/eclipse-vigil-code` at 3f7ddb6. All of those files are new; no existing file was edited.

The steps below edit files owned by the active website session (`CreatureDetail`, Hatchery, Collection, Developer Mode, `vercel.json`). That session should apply them after merging or rebasing this branch.

## 1. Creature detail (Collection and Hatchery clicks)

Edit `src/components/creature/CreatureDetail.tsx`.

```tsx
import { CreatureMarketPanel } from "@/components/market/CreatureMarketPanel";

interface CreatureDetailProps {
  // …existing props
  /** Public address of the viewer when they own this creature; unlocks classified market links. */
  ownerAddress?: string | null;
}
```

1. Place the panel after the "featured stage" grid (around line 165) and before the "Related creatures" section, at full width.
2. Render it only when `!hidden`. For a classified species the API also returns 404 and the panel shows its own "Classified" state, but skipping it saves a request.
3. Use this markup:

```tsx
{!hidden && (
  <CreatureMarketPanel
    key={species.id}
    speciesId={species.id}
    accent={species.palette.accent}
    owner={record ? ownerAddress : null}
    className="mt-6"
  />
)}
```

4. Don't pass the accent anywhere near `CreatureArt`. The panel only rings the ticker chip and tints the chart area; the creature art must stay untouched.
5. The panel already handles its own loading, error, stale and unavailable states and is responsive (checked at 390 px).

Callers:

| File | Call |
|---|---|
| `src/app/hatchery/page.tsx:175` | `<CreatureDetail … ownerAddress={walletAddress} />`, using whatever address the page tracks. Only verified hatches in the `eggs` table unlock Mythic and Secret links. |
| `src/components/hatchery/TrackedHatchery.tsx:281` | `ownerAddress={address}` |
| `src/app/collection/page.tsx:148` | No owner, because catalogue browsing shows public species only. |
| `src/components/landing/RarityShowcase.tsx:83` | No owner. |

## 2. Developer Mode

`src/components/market/MarketInspector.tsx` is self-contained. To merge it into Developer Mode:

- **Mount it there:** render `<MarketInspector />` as a "Market links" tab or section, and remove `src/app/dev/market/page.tsx` if a single entry point is preferred.
- **Or link to it:** keep the page and link to `/dev/market` from Developer Mode.

Either way, security rests on the server: `/api/dev/market` answers only in non-production fixture mode or with `Authorization: Bearer $SOLANITES_DEV_TOKEN`, and returns 404 otherwise. The endpoint is read-only: it can't write market rows, ownership, odds or rewards. The inspector covers:

- all 28 species × 4 stages, including Mythic and Secret
- diagnostics and ticker review flags
- the full panel through the dev fetcher
- the growth calculator (never stored)

## 3. Schedule (needs approval: production config)

Add this to `vercel.json` next to the existing `/api/cron/sync`:

```json
{ "path": "/api/cron/market", "schedule": "40 22 * * 1-5" }
```

22:40 UTC on weekdays is after the 16:00 ET close plus the provider's publish lag, in both EST and EDT. A second run is cheap and idempotent, so `"40 22,23 * * 1-5"` is also fine. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically.

## 4. Production environment (needs approval)

| Step | Action |
|---|---|
| 1 | Create a free Massive Basic account and set `MASSIVE_API_KEY` in the production environment. Leave `MARKET_DATA_PLAN` unset, which defaults to `eod`. |
| 2 | Confirm Massive's licence covers public display in a commercial product (see `docs/stock-links.md`). |
| 3 | Optionally set `SOLANITES_DEV_TOKEN`, a long random value, to use the owner view in production. |

## 5. First run and backfill

- Tables are created automatically on the first call (`migrateMarket`).
- The first scheduled run records the latest session from one grouped request.
- With the remaining budget (4 calls/min), each run backfills one year of history for about three tickers. All 28 take about 10 runs. To finish faster, call the cron route by hand a few times, a minute apart:

```
curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/market
```

- Until a ticker has two sessions recorded, its panel shows Vigour "No sessions recorded yet", and the longer chart ranges say there aren't enough sessions yet. Nothing is fabricated in the meantime.

## 6. Checks after integrating

```
npx tsc --noEmit
npx vitest run
npx next build
grep -rE "GOOGL|RKLB|COIN|GME|MASSIVE_API_KEY" .next/static   # must print nothing
```
