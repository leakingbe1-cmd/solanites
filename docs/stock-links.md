# Creature → stock links

Each of the 28 Solanite species has one permanent link to a real, publicly traded US stock. The stock's daily move drives a cosmetic indicator called **Market Vigour**. It is game flavour only.

Market data never changes:

- ownership, rarity or hatch odds
- evolution or base stats
- rewards

Nothing here is investment advice, and owning a Solanite has nothing to do with owning shares.

- **Source of truth:** `src/server/market/stockLinks.ts`, which is server-only. To remap a species, edit that file. No UI component holds a ticker.
- **Verification:** tickers, exchanges and legal names were checked against public listings on 19 Oct 2026, using web search because the container's network policy blocks the exchange and data-provider hosts. Re-verify against live data once those hosts are allowed (see *Network* below).
- **Classified species:** Mythic and Secret links are never sent to the browser bundle. `/api/market/:id` returns the same 404 as an unknown species unless `?owner=` names an address with a verified hatch of that species in the `eggs` table.
  - **⚠ Limitation:** this is not proof of ownership. Wallet addresses are public, so anyone who knows the address of someone who hatched a Mythic or Secret species can see that species' stock link. Making it owner-only needs proof of wallet control (a signed message or a signed-in session), which is not built.

## Mapping

Every row shows the ticker chip ringed in the species' palette accent and the chart area tinted with it. The creature art is never recoloured, and the price line and up/down signal stay neutral.

| # | Creature | Rarity | Ticker | Company | Exchange | Sector | Connection |
|---|---|---|---|---|---|---|---|
| 1 | Mossling | Common | DE | Deere & Company | NYSE | Industrials · agricultural machinery | Carries a garden on its back; Deere tends the world's fields |
| 2 | Driftfin | Common | RCL | Royal Caribbean Cruises Ltd. | NYSE | Consumer discretionary · cruise lines | Calm, playful wanderer of open water |
| 3 | Pallow | Common | SNAP | Snap Inc. | NYSE | Communication services · social media | The Pearl Herald carries messages; white-ghost messenger |
| 4 | Glimmeray | Common | SBUX | Starbucks Corporation | Nasdaq | Consumer discretionary · restaurants | Serene sea creature for the siren emblem |
| 5 | Sproutwyrm | Common | CMG | Chipotle Mexican Grill, Inc. | NYSE | Consumer discretionary · restaurants | Hungry caterpillar always after fresh greens |
| 6 | Frostkit | Common | YETI | YETI Holdings, Inc. | NYSE | Consumer discretionary · outdoor equipment | The Little Glacier keeps the cold; YETI is named for the snow creature |
| 7 | Abyssal Vael | Rare | RIG ⚑ | Transocean Ltd. | NYSE | Energy · offshore drilling | Watches the deep water where Transocean drills |
| 8 | Stormquill | Rare | FDX | FedEx Corporation | NYSE | Industrials · logistics | Thunder's Courier, always delivering |
| 9 | Duskwing | Rare | CRWD | CrowdStrike Holdings, Inc. | Nasdaq | Information technology · cybersecurity | Winged Twilight Sentinel for the falcon guardian |
| 10 | Cryovant | Rare | GLW | Corning Incorporated | NYSE | Information technology · glass and optical materials | Precise, cold crystal; Corning makes the glass |
| 11 | Emberlisk | Rare | XOM | ExxonMobil Holdings Corporation | NYSE | Energy · integrated oil and gas | Kiln-Hearted, runs on fire |
| 12 | Neonyx | Epic | NFLX | Netflix, Inc. | Nasdaq | Communication services · streaming | Lantern Wyrm glowing in the dark like a screen at night |
| 13 | Aurorath | Epic | DIS | The Walt Disney Company | NYSE | Communication services · entertainment | Paints the sky with wonder |
| 14 | Zephrax | Epic | TSLA | Tesla, Inc. | Nasdaq | Consumer discretionary · electric vehicles | Coil of Living Current |
| 15 | Prismara | Epic | CMCSA ⚑ | Comcast Corporation | Nasdaq | Communication services · media and broadband | Prism peacock for NBC's peacock and Peacock |
| 16 | Nyxara | Epic | PLTR | Palantir Technologies Inc. | Nasdaq | Information technology · data analytics software | Elusive seeing stone in the dark |
| 17 | Aurelion | Legendary | NVDA | NVIDIA Corporation | Nasdaq | Information technology · semiconductors | Sovereign of the Gilded Slot; sovereign of AI computing |
| 18 | Solvanth | Legendary | NEE | NextEra Energy, Inc. | NYSE | Utilities · renewable power | Coils around a captive sun; largest wind and solar generator |
| 19 | Pyraurum | Legendary | AMD | Advanced Micro Devices, Inc. | Nasdaq | Information technology · semiconductors | The phoenix that falls and rises again |
| 20 | Aurelith | Legendary | NEM | Newmont Corporation | NYSE | Materials · gold mining | Shell of gold; largest gold miner |
| 21 | Velynx | Legendary | ADBE | Adobe Inc. | Nasdaq | Information technology · creative software | The Glyphwalker; tools of type and image |
| 22 | Thalor | Legendary | JPM | JPMorgan Chase & Co. | NYSE | Financials · banking | Steadfast fortress in the deep |
| 23–28 | *Six Mythic and Secret species* | | | | | | Classified: listed only in `src/server/market/stockLinks.ts`, never in public docs, bundles or responses |

**Data source (all rows):** Massive (formerly Polygon.io) stock aggregates, US consolidated tape.

### Verification notes

- **Frostkit:** originally Canada Goose (GOOS). Changed to **YETI** because of pending take-private bids that could delist GOOS.
- **⚑ RIG:** Transocean agreed in Feb 2026 to acquire Valaris, with closing expected in H2 2026. RIG is the acquirer and should keep its listing; re-check after the deal closes.
- **⚑ CMCSA:** Comcast announced a separation into two companies (Q2 2026 results). Re-check which company keeps CMCSA and Peacock when the split completes.
- **XOM:** the legal name is now ExxonMobil Holdings Corporation (holding-company reorganisation, July 2026). Ticker and exchange are unchanged.
- **PLTR:** listed on Nasdaq since November 2024.

The Market links section of Developer Mode (`/studio/dev`) shows ⚑ next to flagged rows.

## Market Vigour formula (rules v1)

Rules are defined in `src/lib/market/growth.ts` (`GROWTH_RULES`):

```
dailyChange%  = (close_t − close_{t−1}) / close_{t−1} × 100      consecutive trading sessions only
points_t      = clamp(round1(dailyChange% × 4), −10, +10)        round half away from zero, 1 dp
vigour        = clamp(50 + Σ points over the last 20 recorded sessions, 0, 100)
```

Bands:

| Vigour | Band |
|---|---|
| < 30 | Dormant |
| 30–44.9 | Subdued |
| 45–55.9 | Steady |
| 56–69.9 | Stirring |
| ≥ 70 | Surging |

**Idempotency:** each `(species, session)` is written once to `market_growth_ledger` with `ON CONFLICT DO NOTHING` and is never updated. Vigour is always recomputed from stored rows, so cron retries, overlapping runs and restarts cannot double-apply a day.

**Missing sessions:** a gap (missing previous close, a split, or bad data) gives no entry for that day. It never produces a guessed or fabricated value.

**Separation of concerns:**

| Layer | What it holds |
|---|---|
| Base stats | Species config; never touched |
| Permanent progression | Evolution from hold time; never touched |
| Market Vigour | This rolling, bounded, cosmetic value |

### Examples

| Daily moves | Points | Vigour |
|---|---|---|
| +2.5% | +10.0 (hits the cap) | 60.0 Stirring |
| −1.8% | −7.2 | 42.8 Subdued |
| +4.0% | +16 → capped at +10 | 60.0 |
| +0.6, −0.4, +1.1 | +2.4, −1.6, +4.4 | 55.2 Steady |
| Week: +2.5, −1.8, +0.6, −0.4, +1.1 | +10, −7.2, +2.4, −1.6, +4.4 = +8.0 | **58.0 Stirring** |
| 20 sessions of +3% | 20 × +10 = +200 | clamped at **100** |
| 0.0% | 0 | 50.0 Steady |

## Data provider

### Audit of existing integrations

Before this branch, the repo had no market-data integration. The existing external services are:

- Solana RPC / Helius, for holder tracking
- Postgres
- the existing `/api/cron/sync` job

The new code reuses the existing patterns rather than adding new infrastructure:

- the shared database-backed rate limiter
- `CRON_SECRET`
- `ConfigError` → `NOT_CONFIGURED`
- fixture mode

### Provider comparison (prices as published, checked 19 Oct 2026)

| Provider | Free tier | Paid | Notes |
|---|---|---|---|
| **Massive (formerly Polygon.io)**, chosen | Basic, $0: 5 calls/min, end-of-day aggregates, 2 years of history | Starter $29/mo (15-min delayed); Developer $79/mo; Advanced $199/mo (real-time) | A grouped-daily endpoint returns every US ticker for a day in one call. Plan terms cover individual, non-professional use. |
| Twelve Data | Free: 8/min, 800/day | From about $29/mo | Free tier is for personal use only. |
| Alpha Vantage | 25 calls/day | From about $50/mo | Too few calls for 28 tickers plus history. |
| Finnhub | 60/min | Paid for some endpoints | Free tier lacks full candle history for some symbols. |
| Yahoo / Stooq scraping | n/a | n/a | Rejected: no licence, unstable, against the brief. |

**Chosen:** the Massive free Basic plan.

- **Cost:** $0. No paid service is used or required.
- **Data type:** end-of-day data, labelled in the UI as **Previous close**.
- **Daily cost:** one grouped request covers all 28 stocks.
- **History backfill:** one range request per ticker, spread across cron runs within the 5/min budget. The default budget is 4/min, which leaves headroom.
- **Ranges:** the 1W, 1M, 3M and 1Y charts come from stored daily bars. The 1D chart needs intraday bars. The service tries one budgeted fetch per ticker and session and caches the result. If the plan forbids intraday data, as the free plan is expected to, it remembers that and the 1D chart shows "Intraday prices aren't included in the current market data plan" instead of invented points.

**⚠ Approval needed:**

- **Licensing:** the free and Starter plans are licensed for individual, non-professional use. Showing data publicly in a commercial product may need a business plan. Confirm with Massive before going live.
- **Paid upgrades:** 15-min delayed quotes and 1D intraday charts require Starter ($29/mo) or above. Do not upgrade without approval.

### Data states shown to users

| State | Meaning |
|---|---|
| Previous close | Latest completed session, end-of-day. |
| Delayed 15 min | Only on a paid delayed plan (`MARKET_DATA_PLAN=delayed`). |
| Stale data | The expected session hasn't been recorded (provider not yet published, error or rate limit). The last stored values are shown with their date. |
| Sample data | Fixture mode only (local or test); every price is labelled as not real. Refused in production. |
| Unavailable | Not configured, or no data for the ticker. No numbers are shown. |

Market status (open, pre-market, after hours, or closed with weekend or holiday reason, including early closes) comes from `src/lib/market/calendar.ts`. It covers the NYSE/Nasdaq calendar for **2025–2027 only**, and must be extended before 2028; `calendarKnown()` reports gaps.

## Architecture

```
Massive REST ──(server only, Bearer header, 8 s timeout)──► provider.ts
                                                           │  budgeted by the shared DB rate limiter
cron /api/cron/market (CRON_SECRET) ──► service.runScheduled ──► store.ts (Postgres)
                                                           │  market_daily_bars, market_growth_ledger (immutable),
                                                           │  market_intraday, market_ticker_state
browser ─► /api/market/:speciesId (60/min/IP, CDN cache 2 min) ─► service.snapshot (DB reads only)
owner   ─► /studio/dev/market (Developer Mode auth + DEVELOPER_MODE=off switch, read-only) ─► diagnostics / snapshot / simulate
```

Page views never call the provider, so traffic cannot exhaust the provider quota. The API key exists only in server environment variables. It is never placed in URLs, logs or error messages, and the built client bundle was checked to contain no tickers for classified species and no environment variable names.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `MARKET_DATA_ENABLED` | Server env | Must be `1` before the market feature opens or migrates any database. Unset (the default) means panels show **Unavailable** and nothing is written. Local sample mode (`SOLANITES_FIXTURES=1`) doesn't need it. |
| `MASSIVE_API_KEY` | Server env (secret) | Provider key. Unset means market data shows **Unavailable**. |
| `MARKET_DATA_PLAN` | Server env | `eod` (default) or `delayed` (paid plan only). |
| `MASSIVE_API_BASE` | Server env | Optional override; default `https://api.massive.com`. |
| `MARKET_CALLS_PER_MINUTE` | Server env | Provider budget; default 4. |
| `DATABASE_URL` | Server env | Postgres; the existing variable. |
| `CRON_SECRET` | Server env | The existing variable; protects `/api/cron/market`. |

No production environment variables were changed on this branch.

## Network

The cloud development container blocks `api.massive.com` (and the other providers), so this branch was tested against a fake provider and fixtures only. Live calls have **not** been verified. To test live data, add `api.massive.com` to the environment's network allow-list: https://code.claude.com/docs/en/cloud-environments#network-access
