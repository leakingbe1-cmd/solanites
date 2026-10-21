# Handoff: live market data → SITE lane (2026-10-21)

## Scope
Creature-to-stock links (28 species), the public TradingView chart, Twelve Data (Developer Mode
only) and the homepage token market cap provider. Not art, holders, hatch or homepage UI.

## Done (all in main, released at 03084fb)
- c3a1847 TradingView free widget is the only public price display; attribution kept.
- 91c7e87 Twelve Data Basic for Developer Mode, behind `MARKET_PUBLIC_DISPLAY` (off).
- bea4b5a Conflicting duplicate dates dropped from Twelve Data series (never order-dependent).
- aad1413 Review fixes: no "realtime" label, 429 back-off, key redaction, `/studio` CSP.
- 8a79fde `docs/market-v1-acceptance.md` checklist (P1–P10, D1–D8).
- 76f2e66 (landed as 30f8725) Widget fix: full-height chart, dark background, no loader errors.
- b2ddffa Docs: Mythic and Secret pairings public (follows 7a0a315 reveal).
- 6cf2b4f `fetchTokenMarket`: DexScreener first, pump.fun coins-v2 fallback; circulating vs FDV.
- All 28 mappings checked 2026-10-20 (exchange and legal name correct; search-sourced, not primary).

## In progress
Nothing. Twelve Data in Developer Mode was skipped by the owner (key added to Preview, unverified).

## Open bugs / risks
- Licensing: Twelve Data Basic is personal/internal use only; never show its data publicly.
  TradingView free widget needs its attribution; commercial or token-project use of the widget
  has no written confirmation from TradingView. TradingView receives each viewer's page URL.
- Widget prices are delayed (TradingView shows a "D" marker); no minute figure is documented.
- DexScreener response handling is tested with mocks only (host blocked in the old container).
  pump.fun fallback verified live. Its `/coins/<mint>` route is gone; use `/coins-v2/<mint>`.
- Old Massive stored-closes path (runtime.ts, service.ts) still has "delayed 15 minutes" copy;
  dormant (needs MARKET_PUBLIC_DISPLAY plus a paid plan).
- Watch list for remapping: RIG (Valaris merger), TSLA, GME, CMCSA corporate actions.

## Pending owner decisions
- Remove the Massive path and the `MARKET_PUBLIC_DISPLAY` branch entirely.
- Whether to verify Twelve Data in Developer Mode (needs `STUDIO_BASIC_AUTH` sign-in).
- Written TradingView confirmation for commercial use; privacy notice mentioning TradingView.

## Key files / env vars / branches
- Files: `src/server/market/{stockLinks,live,twelvedata,runtime,service,tokenMarket}.ts`,
  `src/app/api/market/[speciesId]/route.ts`, `src/app/studio/dev/market/route.ts`,
  `src/components/market/{TradingViewOverview,CreatureMarketPanel,MarketInspector,panelMode}.tsx`,
  `src/lib/market/tradingview.ts`, `docs/stock-links.md`, `docs/market-v1-acceptance.md`.
- Env (names only): `MARKET_WIDGET`, `TWELVE_DATA_API_KEY`, `MARKET_PUBLIC_DISPLAY`,
  `TWELVE_DATA_API_BASE`, `STUDIO_BASIC_AUTH`, `DEVELOPER_MODE`, `SOLANITES_MINT`,
  legacy `MASSIVE_API_KEY`, `MARKET_DATA_ENABLED`.
- Branches (all merged): stock/widget-fix, stock/reveal-docs, feature/home-metrics-market,
  backup/stock-review-fixes.
- Tests: `marketLive`, `marketReview`, `tokenMarket` (server), `marketPanel` (lib);
  QA: `scripts/qa/live-market.mjs`.

## Gotchas
- TradingView's script replaces the container's children: keep size/overlay on the outer box,
  never remove the script on cleanup (its loader throws), key the container by symbol.
- `MARKET_WIDGET` value must be exactly `tradingview`; env changes need a redeploy.
- Container: Node fetch ignores HTTPS_PROXY; run with `NODE_USE_ENV_PROXY=1`.
- `phoenix-site.mjs` args are `<shotsDir> <baseUrl>` (not the URL first).
- `stale-while-revalidate` on public market responses stalls Playwright networkidle.

## Next steps
1. Owner check of a few creature charts on phone. 2. Decide Massive removal, then delete it.
3. Optionally verify Twelve Data in Developer Mode. 4. Recheck watch-list tickers monthly.
