# Preview review: `release-cinematic-overhaul` @ `e19cce8`

Reviewed 2026-10-19 against `main` @ `f6d6ed5`. Read-only: no code changed, nothing pushed to that branch, no credits spent.

## Diff (62 files, +1362 / −1474, two commits: `3c73f9a`, `e19cce8`)
- **Untouched:** `src/server`, `src/app/api`, `src/middleware.ts`, `next.config.ts` (security headers), `src/lib`, `src/data`, `src/state`, `src/services`, `src/shared`, `vercel.json`, all tests.
- **Rewards (`/claims`):** styling only; visible text identical to `main`.
- **Fonts:** Unbounded replaced by Cormorant (`package.json`, lock file). Next.js unchanged at 15.5.28.
- **Removed:** the first-visit video intro (`FirstVisitIntro`, `PhoenixVideo`, `ReplayIntroButton`, `introState`, `config/intro.ts`), `CreatureMarquee`, `HeroLifecycle`, `ParticleField`.
- **Deleted from `public/`:** `hero/phoenix-1200.webp`, `intro/phoenix-{16x9,9x16}.{mp4,webm}` and both posters. The source clips remain in `art/intro/`; the web encodes and posters exist only in git history. The reason given in `docs/phoenix-intro.md` is that the 720p footage falls below a 1080p rule from the website session's own audit. **No owner approval for retiring the intro was found.**
- **Hero:** still the current phoenix (`public/hero/phoenix-2000.{webp,jpg}`), with a CSS/SVG awakening on top.

## Checks
| Check | Result |
|---|---|
| `npm ci` | pass |
| `npm run typecheck` | pass |
| `npm test` | 192 passed, 3 skipped, 0 failed (15 files + 1 skipped) |
| `npm run build` | pass, no warnings; all routes present |
| Security headers (served) | CSP `frame-ancestors 'none'…`, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; config identical to `main` |
| Prelaunch | `robots.txt` Disallow /; `<meta name="robots" content="noindex, nofollow">` |
| `/studio` gate | 404 without access |
| `/api/dev/fixtures` in production | 404 |
| Routes `/`, `/hatchery`, `/collection`, `/how-it-works`, `/leaderboard`, `/claims`, `/api/health` | 200 |
| `npm audit --omit=dev` | 1 high + 1 moderate, both `postcss` inside `next@15.5.28`; same version as `main`, so not introduced here; the fix needs Next 16 (a major upgrade) |
| Site QA (`scripts/qa/phoenix-site.mjs`) | 150/150 passed, no console errors |
| Functional (own script) | 18/18: demo Hatchery; ready egg → inspector → hatch reveal (Common Glimmeray); Collection 28 cards; rarity filter 28 → 6; detail view with four stages; Rewards copy; no claim/sign/connect buttons; nav links; no errors |

## Phoenix layout (current artwork, unmodified)
Enlargement = device pixels per source pixel of the 2000 × 1116 still (above 1× means the browser upscales it).

| Viewport | Enlargement | Head and halo | Wings | Headline background (p95 luminance) | Headline worst contrast | "Enter the Hatchery" worst contrast |
|---|---|---|---|---|---|---|
| 360 × 780 @3x | 1.17× | in view, above the copy | cropped | 0.4% | 16.0:1 | not measured |
| 390 × 844 @3x | 1.27× | in view, above the copy | cropped | 0.5% | 15.8:1 | 16.1:1 |
| 768 × 1024 @2x | 1.03× | in view | cropped | 0.3% | 16.2:1 | not measured |
| 1024 × 768 @1x | 0.69× | in view, right of the copy | **left wing behind headline, copy and button** | 17.0% | 3.9:1 (large text; passes 3:1) | **2.1:1, fails AA** |
| 1280 × 800 @1x | 0.83× | in view | left wing behind the headline | 7.2% | 7.0:1 | 9.6:1 |
| 1440 × 900 @1x | 0.94× | in view | left wing behind the headline | 8.2% | 6.5:1 | 9.8:1 |
| 1440 × 900 @2x | **1.87×** | same | same | 8.2% | 6.5:1 | 9.8:1 |
| 1920 × 1080 @1x | **1.25×** | in view | left wing behind the headline | 11.0% | 5.4:1 | 12.9:1 |
| 2560 × 1440 @1x | **1.66×** | in view | left wing behind the headline | 14.1% | 4.5:1 | 4.5:1 (on the limit) |

Findings:
1. **Contrast defect at 1024 px:** the secondary button's text sits on the bright left wing (2.1:1). The body text there passes (5.8:1). 2560 px is borderline.
2. **Wing placement:** at every desktop width the left wing runs behind the headline; the composition was not planned around the copy.
3. **Focal point:** the head and halo stay in view at every size; on phones they sit above the copy as intended.
4. **Sharpness:** the browser upscales the image on phones (1.17–1.27×), at 1920 (1.25×), at 2560 (1.66×) and on Retina laptops (1.87×). Only a new native master fixes this.
5. **Canon:** the current still has a halo and violet lightning, both outside the approved canon. It stays in place until a replacement is approved.

Screenshot: `phoenix-layout-1024-1920-390.jpg` (left to right: 1024, 1920 and 390 px wide).
