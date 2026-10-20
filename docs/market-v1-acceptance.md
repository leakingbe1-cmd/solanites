# Market data: V1 acceptance checklist

What must be true before the stock panels count as accepted for V1. Each item says how it is
checked and its state on the branch it was last run against. "BLOCKED" means it could not be
checked in that environment; it is never counted as passed.

Approved architecture: the public site shows prices only through TradingView's free Symbol
Overview widget (delayed where applicable, with attribution). Twelve Data Basic is used only in
Developer Mode, behind owner authentication. No public Market Vigour score. No paid plans.

## Public display (TradingView widget)

| # | Check | How | State |
|---|---|---|---|
| P1 | Widget appears only when the server sets `externalChart: "tradingview"` (`MARKET_WIDGET=tradingview`) | `marketReview.test.ts`, `scripts/qa/live-market.mjs` | Passed locally |
| P2 | Mythic and Secret species answer like every other species (owner decision 20 Oct; previously 404) | `marketReview.test.ts`, `mythic-secret.mjs` | Passed locally |
| P3 | Public API responses carry no quote, growth, chart points, mapping notes or provider name | `marketReview.test.ts`, `live-market.mjs` | Passed locally |
| P4 | TradingView attribution present (`Track all markets on TradingView`) | `live-market.mjs` | VERIFIED 2026-10-20 (headless Chromium, local build): TradingView's script rewrites the attribution itself, same text, link to tradingview.com with tracking parameters |
| P5 | Delay wording: "timing per TradingView, may be delayed"; no minutes figure, no "real-time" anywhere | code search, `live-market.mjs` | Passed locally |
| P6 | Disclaimer: "For game flavour only, not investment advice. Owning a Solanite has nothing to do with owning {ticker} shares." | panel source | Passed locally |
| P7 | Widget actually loads and renders prices (all 28 symbols) | `live-market.mjs` iframe checks, manual check on the Preview | VERIFIED 2026-10-20 for the 5 sampled public symbols in headless Chromium against a local production build (iframe loads, configured for exactly that EXCHANGE:TICKER, chart draws, TradingView shows its own "D" delayed marker). Remaining public symbols and the owner's check on the Preview: pending |
| P8 | Blocked or slow script: loading notice, then "couldn't load here" after 15 s; a late iframe still becomes ready; overlay never blocks clicks | `marketPanel.test.ts` (state machine); container blocked earlier today showed the failure notice | State machine passed; blocked-host path seen in QA runs before the allowlist change; manual check on the Preview pending |
| P9 | Widget box 300 px tall below `sm`, 340 px above, chart at least 240 px; no horizontal scroll at 390 px | `live-market.mjs` (height), headless screenshots at 1440 and 390 px | VERIFIED locally (iframe 308 px at 1440, 268 px at 390, page width unchanged). Manual check on the Preview pending |
| P10 | Public CSP (if set) allows TradingView's script and frames on public pages | Preview response headers | Website session to confirm |

## Developer Mode (Twelve Data Basic)

| # | Check | How | State |
|---|---|---|---|
| D1 | All `/studio` routes 404 without `STUDIO_BASIC_AUTH`, 401 with wrong credentials, 404 when `DEVELOPER_MODE=off` | `mythic-secret.mjs`, `developer-mode.mjs` | Passed locally |
| D2 | Strict CSP on `/studio`; zero third-party requests from owner pages | `live-market.mjs` (owner) | Passed locally |
| D3 | API key never in static files, page HTML, logs or any response | dummy-key sweep after a full QA run | Passed locally (0 hits) |
| D4 | Budget: 8/min and 800/day per instance; provider 429 backs off globally (60 s, doubling, max 1 h); refusals cached 15 min | `marketLive.test.ts` | Passed (mocked provider) |
| D5 | Status labels: open market "delayed" with as-of time; older than 60 min "stale"; never "realtime" | `marketLive.test.ts` | Passed (mocked provider) |
| D6 | Duplicate dates: identical closes collapse, conflicting closes drop the date, output sorted | `marketLive.test.ts` | Passed (mocked provider) |
| D7 | Coverage per symbol shown as "unverified" until a live answer | `marketLive.test.ts`, inspector | Passed (mocked provider) |
| D8 | Real Twelve Data responses for all 28 symbols (coverage, timing of `last_quote_at`, credits per call) | Developer Mode on the Preview with the key set | BLOCKED: api.twelvedata.com is reachable from the container, but no key reaches the app here. The app sends `Authorization: apikey <key>` (confirmed accepted with Twelve Data's public demo key); a proxy-injected `Bearer` header is rejected (401) |

## Caching

| # | Check | State |
|---|---|---|
| C1 | Public identity responses are `no-store` | Passed locally |
| C2 | Gated live path (display switch on) caches public answers 60 s / stored closes 120 s | Code review only; path is off by default |
| C3 | Shared caching of public identity responses | Deferred: `stale-while-revalidate` makes Chromium's background revalidation stall network-idle checks |

## Mappings

All 28 creature-to-stock mappings checked on 2026-10-20 against dated filings and news (search
summaries; primary pages not fetched). Exchange and legal name correct for all 28. Mythic and Secret pairings
are public since 20 Oct (see `docs/stock-links.md`); the dated source table is kept outside the repository. Recheck before V1 after: RIG
(Valaris merger), TSLA, GME, CMCSA corporate actions.

## Vercel setup (owner, Preview scope only)

Set in the Vercel project, Settings → Environment Variables, scope **Preview** only (not
Production until V1 sign-off), then redeploy the Preview:

| Variable | Value | Why |
|---|---|---|
| `MARKET_WIDGET` | `tradingview` | Turns on the public TradingView widget. Any other value, or unset, means no widget. |
| `TWELVE_DATA_API_KEY` | your Twelve Data Basic key (mark it Sensitive) | Developer Mode diagnostics only. Read on the server, sent to Twelve Data as `Authorization: apikey <key>`, never in a URL, page, log or response. |
| `MARKET_PUBLIC_DISPLAY` | leave **unset** | Must stay off: Basic data is for internal use and never reaches public pages. |
| `STUDIO_BASIC_AUTH` | already set (`user:password`, 24+ characters) | Gate for Developer Mode, where Twelve Data is shown. |
| `TWELVE_DATA_API_BASE` | leave unset | Testing override only (https only). |

Never paste the key into chat, an issue, a commit or a URL. After the redeploy: open a public
creature panel (widget, attribution and "D" marker visible; no server prices), then Developer
Mode → Market links, select a species (one live fetch per selection) and note its coverage.

## Sign-off

- Website session re-verifies the exact commits and integrates; owner checks the Preview in a real browser (P7, P8, P9); headless runs here do not replace that.
- D8 stays BLOCKED until a key is set in Vercel Preview by the owner; nothing claims live coverage until then.
