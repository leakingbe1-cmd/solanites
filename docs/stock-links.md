# Creature → stock links

Each of the 28 Solanite species has one permanent link to a real, publicly traded US stock. The stock's daily move drives a cosmetic indicator called **Market Vigour**. It is game flavour only.

Market data never changes:

- ownership, rarity or hatch odds
- evolution or base stats
- rewards

Nothing here is investment advice, and owning a Solanite has nothing to do with owning shares.

- **Source of truth:** `src/server/market/stockLinks.ts`, which is server-only. To remap a species, edit that file. No UI component holds a ticker.
- **Verification:** tickers, exchanges and legal names were checked against public listings on 19 Oct 2026, using web search because the container's network policy blocks the exchange and data-provider hosts. Re-verify against live data once those hosts are allowed (see *Network* below).
- **Mythic and Secret species:** public like every other rarity (owner decision, 20 Oct 2026). `/api/market/:id` answers for all 28 species the same way, and the TradingView widget shows their charts. They are no longer classified, and there is no `?owner=` parameter.

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
| 23 | Astravex | Mythic | GOOGL | Alphabet Inc. (Class A) | Nasdaq | Communication services · search and AI | Omniscient and calm: a stag whose antlers map every star |
| 24 | Orbelith | Mythic | RKLB | Rocket Lab Corporation | Nasdaq | Industrials · space launch and spacecraft | The Celestine Coil circles a world in orbit; Rocket Lab puts things there |
| 25 | Eventide | Mythic | LLY | Eli Lilly and Company | NYSE | Health care · pharmaceuticals | The Wing of the Last Light is silent, vast and merciful: medicine |
| 26 | Helivane | Mythic | LMT | Lockheed Martin Corporation | NYSE | Industrials · aerospace and defence | The Sunpiercer: a fierce, unyielding raptor of the high sky |
| 27 | GENESIS | Secret | COIN | Coinbase Global, Inc. | Nasdaq | Financials · digital asset exchange | Slot Zero, the genesis of the chain, for the exchange that brought crypto to public markets |
| 28 | Ø NULLBORN | Secret | GME | GameStop Corp. | NYSE | Consumer discretionary · specialty retail | The Unindexed: glitched, curious, inverted; the market's most famous anomaly |

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

## Owner decision and what visitors see (20 Oct 2026)

Decision: **keep TradingView, no paid plan.** No paid market data of any kind.

| Path | Who sees it | Data | Licence and status |
|---|---|---|---|
| **TradingView Symbol Overview widget** (`TradingViewOverview`) | Public visitors on deployments where `MARKET_WIDGET=tradingview` (set for the Vercel Preview scope only); off when unset, including production | Prices and history served by TradingView in the visitor's browser. **Timing per TradingView; may be delayed.** TradingView's widget FAQ says stock data in widgets is delayed; it gives no number of minutes, so none is claimed | Free widgets are offered "with default TradingView branding"; the attribution block is TradingView's own builder markup, unaltered. Shown for all 28 species; never in `/studio` (owner tools). TradingView receives the page address of every page showing a chart |
| **Twelve Data, Basic (free)** (`twelvedata.ts`, `live.ts`) | Developer Mode only (`/studio/dev/market`, owner sign-in) | Quote, daily closes, 5-minute bars. Labelled "delayed" with the provider's own time, "stale" or "previous close"; **never "real-time"**, because the Basic feed's venues and `last_quote_at` semantics are unverified | Basic is for personal/internal, non-display use: **never public** while `MARKET_PUBLIC_DISPLAY` is off. Coverage per ticker shows "unverified" until a live answer is seen |
| Massive (stored closes, cron) | Off | End-of-day | Individual plans don't permit public display |

**Market Vigour is not shown publicly.** It is computed on the server from daily closes, and no displayable daily closes exist on the server under this decision (TradingView's data never reaches our server). Public panels say it is not shown; no public copy may say that stock moves drive it.

**Budget caveat:** the Twelve Data budget (8 credits/minute, 800/day) is enforced **per server instance**. On Vercel several instances can run at once, so it cannot by itself enforce the account-wide limit. Caching, shared in-flight calls, 15-minute memory of "not found"/"forbidden" answers, and an instance-wide back-off on any provider 429 (60 s, doubling to an hour) keep usage low.

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

Page views never call the provider, so traffic cannot exhaust the provider quota. The API key exists only in server environment variables. It is never placed in URLs, logs or error messages, and the built client bundle was checked to contain no environment variable names.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `TWELVE_DATA_API_KEY` | Server env (secret) | Twelve Data key. Enables live data in Developer Mode. Sent only in the `Authorization` header; never in URLs, logs, responses or the bundle. |
| `MARKET_PUBLIC_DISPLAY` | Server env | `1` lets public routes serve the provider's numbers. Off by default and independent of the key. Leave off on the free Basic plan. |
| `TWELVE_DATA_CREDITS_PER_MINUTE` / `TWELVE_DATA_CREDITS_PER_DAY` | Server env | Budget enforced per server instance before calling (defaults 8 and 800, the Basic limits). |
| `MARKET_WIDGET` | Server env | `tradingview` lets public routes mark snapshots for TradingView's widget. Unset (default, including production) shows no third-party chart. Set it for the Vercel **Preview** scope only. |
| `TWELVE_DATA_API_BASE` | Server env | Optional proxy or mock base URL; honoured only over `https://`. |
| `TWELVE_DATA_PLAN_LABEL` | Server env | Shown in the source line (default "Basic (free) plan"). |
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
