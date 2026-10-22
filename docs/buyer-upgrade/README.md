# Buyer upgrade (O-004): screenshots and visual QA

Branch `site/buyer-upgrade`, cut from `main` 03084fb. Screenshots are at 390 px and 1440 px, named
`<item>-<page>-<width>.png`, taken from a local production build in the pre-launch state (no mint,
RPC or database), so the metrics, leaderboard and proof show their pre-launch designs. Files with
`fixture` in the name come from local fixture mode (test holders, labelled on screen). No page has
horizontal scroll at either width.

## Visual QA (item 0)

Before = `main`; after = this branch. Pairs are in `screens/qa/`.

| # | Page, width | Bug | Fix |
|---|---|---|---|
| 1 | Home, both | Hero metrics "Unavailable" ×3 | Pre-launch panel (O-004a) |
| 3 | Home 1440 | Market Bond chip "Pallow" alone on a second row | Even 3×2 grid (layout only) |
| 4 | Collection 390 | "Ø NULLB…" truncated | Names wrap |
| 6 | Collection 1440 | Last card alone in its row | 4 columns from xl |
| 8 | Home | Evolution player said 1 min / +30 min / +2 h under a +1 min timeline | Player follows the fast track |
| 9 | Hatchery demo 390 | Status dot alone on its own line | Dot kept with its text (tracked Hatchery too) |
| 11 | Hatchery gate 1440 | "Your eggs find / you." | Balanced heading wrap, site-wide |
| 12 | Hatchery gate | Tour link looked like plain text; disabled button unreadable | Underlined link; legible disabled state |
| 14 | Leaderboard | Dead-end empty panel | Pre-launch leaderboard (O-004j) |
| 15 | Leaderboard 390 | Tab labels wrap to two lines | Short labels on phones |
| 16 | Rewards | Grey "PENDING" pills | Unset terms hidden (O-004e); the whole page is now hidden until launch |
| 17 | How It Works | Repo file paths in visitor copy | "Rules are fixed in code…" (O-004o) |
| 18 | How It Works | Mythic 4 % / Secret 2 % vs 3.5 % / 1.5 % on Home | One decimal, matches Home |
| 20 | Creature detail 1440 | Stage cards stretched with empty space | Sized to content |
| 21 | Footer | Copyright line nearly invisible | Brighter |
| — | Header 390 | Menu button clipped at the right edge | Narrower "Find my eggs" pill on phones |
| — | Home 1440 | Scroll cue against the metrics panel | Hidden on wide screens |

Not changed: #2 the stock card's "Unavailable" pill (local only: Preview and Production set
`MARKET_WIDGET=tradingview` and show the chart); #5, #7, #10, #13, #19 were low-severity or capture
artefacts (lazy images, hover lift, intentional scroll peek).

## Held until launch (owner, 21 Oct)

Two flags, both off; turn them on at launch.

- `REWARDS_PAGE_LIVE` (`src/config/holderDistribution.ts`): `/rewards` (and `/claims`, which
  redirects there) answers 404 and nothing links to it. Screens: `e2-*`.
- `SHARE_TOP_TIERS` (`src/config/share.ts`): Mythic and Secret hatches get no share button, card or
  share page. Screens: `g2-*`.

## Live-demo hero (owner, top priority)

The first screen is now the demo: a simulated egg labelled "Demo · simulated", the $SLNT pitch and one
"Hatch it". The result is rolled with the real odds before the tap. The tap plays the hatch: the
owner's clip for that rarity once it's in `src/config/hatchClips.ts`, otherwise the built-in hatch.
Then the creature, a DEMO share card (Common to Legendary) and "Keep going in the Hatchery". The proof
strip under the hero shows what is real today; after launch it switches to live numbers and a
read-only wallet lookup.

Screens in `screens/hero/` (before = preview of b5933e2, after = preview of 2bfe1ad).
Recording: `hero-landing-to-hatch-390.webm` (Playwright, 390×844, throttled, landing → hatched creature).

Timings, throttled phone (Playwright, 4× CPU, Slow 4G: 1.6 Mbps / 150 ms), median of 3:

| | Target | Before (local) | After, local build | After, preview |
|---|---|---|---|---|
| LCP | < 2.5 s | 5.5 s | 2.65 s | 2.84 s |
| Usable ("Hatch it" works) | < 3.5 s | 5.7 s | 3.0 s | 3.3 s |
| Tap → reveal starts | < 0.5 s | 0.94 s | 0.30 s | 0.34 s |
| Landing → hatched creature | < 10 s | 10.4 s | 7.0–8.1 s | 7.4 s |

Preview runs go through Vercel's login protection and this session's proxy, so they include extra
latency. LCP is still just over target: it's the 129 kB Phoenix still a 2× phone needs, sharing
Slow 4G with the page. A lighter phone crop of the still would close it (an art decision).
