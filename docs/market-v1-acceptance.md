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
| P2 | Never for a classified species: same 404 as an unknown id | `marketReview.test.ts`, `classified-privacy.mjs` | Passed locally |
| P3 | Public API responses carry no quote, growth, chart points, mapping notes or provider name | `marketReview.test.ts`, `live-market.mjs` | Passed locally |
| P4 | TradingView attribution link present, unaltered (`Track all markets on TradingView`) | `live-market.mjs` | Passed locally; exact wording against TradingView's current builder output UNVERIFIED |
| P5 | Delay wording: "timing per TradingView, may be delayed"; no minutes figure, no "real-time" anywhere | code search, `live-market.mjs` | Passed locally |
| P6 | Disclaimer: "For game flavour only, not investment advice. Owning a Solanite has nothing to do with owning {ticker} shares." | panel source | Passed locally |
| P7 | Widget actually loads and renders prices in a real browser (all 28 symbols) | `live-market.mjs` iframe checks, manual check on the Preview | BLOCKED here (s3.tradingview.com unreachable from the container) |
| P8 | Blocked or slow script: loading notice, then "couldn't load here" after 15 s; a late iframe still becomes ready; overlay never blocks clicks | `marketPanel.test.ts` (state machine); manual check with the script blocked | State machine passed; browser check BLOCKED |
| P9 | Mobile layout: panel 300 px tall below `sm`, 340 px above; no horizontal scroll at 320 and 390 px | `phoenix-site.mjs` screenshots; manual check on the Preview | Site layout passed locally; widget at mobile width BLOCKED |
| P10 | Public CSP (if set) allows TradingView's script and frames on public pages | Preview response headers | Website session to confirm |

## Developer Mode (Twelve Data Basic)

| # | Check | How | State |
|---|---|---|---|
| D1 | All `/studio` routes 404 without `STUDIO_BASIC_AUTH`, 401 with wrong credentials, 404 when `DEVELOPER_MODE=off` | `classified-privacy.mjs`, `developer-mode.mjs` | Passed locally |
| D2 | Strict CSP on `/studio`; zero third-party requests from owner pages | `live-market.mjs` (owner) | Passed locally |
| D3 | API key never in static files, page HTML, logs or any response | dummy-key sweep after a full QA run | Passed locally (0 hits) |
| D4 | Budget: 8/min and 800/day per instance; provider 429 backs off globally (60 s, doubling, max 1 h); refusals cached 15 min | `marketLive.test.ts` | Passed (mocked provider) |
| D5 | Status labels: open market "delayed" with as-of time; older than 60 min "stale"; never "realtime" | `marketLive.test.ts` | Passed (mocked provider) |
| D6 | Duplicate dates: identical closes collapse, conflicting closes drop the date, output sorted | `marketLive.test.ts` | Passed (mocked provider) |
| D7 | Coverage per symbol shown as "unverified" until a live answer | `marketLive.test.ts`, inspector | Passed (mocked provider) |
| D8 | Real Twelve Data responses for all 28 symbols (coverage, timing of `last_quote_at`, credits per call) | live call with a key in Preview only | BLOCKED (no key; host not reachable from here) |

## Caching

| # | Check | State |
|---|---|---|
| C1 | Public identity responses and every classified response are `no-store` | Passed locally |
| C2 | Gated live path (display switch on) caches public answers 60 s / stored closes 120 s; never classified | Code review only; path is off by default |
| C3 | Shared caching of public identity responses | Deferred: `stale-while-revalidate` makes Chromium's background revalidation stall network-idle checks |

## Mappings

All 28 creature-to-stock mappings checked on 2026-10-20 against dated filings and news (search
summaries; primary pages not fetched). Exchange and legal name correct for all 28. The private
table, with classified rows, is kept outside the repository. Recheck before V1 after: RIG
(Valaris merger), TSLA, GME, CMCSA corporate actions.

## Sign-off

- Website session re-verifies the exact commits and integrates; owner checks the Preview in a real browser (P7, P8, P9).
- D8 stays BLOCKED until a key is set in Vercel Preview by the owner; nothing claims live coverage until then.
