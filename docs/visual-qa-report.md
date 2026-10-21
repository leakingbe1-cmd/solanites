# Visual QA: premium overhaul + creative-direction design system

Branch `release-cinematic-overhaul`, local production build (`next build && next start`).
Before set: the live `main` build (f6d6ed5). After set: this branch. Viewports: 1440 × 900 desktop,
390 × 844 phone (plus 320, 360, 768, 1024, 1280, 1920 in the automated suites).

## Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | pass |
| Unit tests (vitest) | 192 passed, 3 skipped |
| Production build | pass |
| Site suite (`scripts/qa/phoenix-site.mjs`) | 150 / 150 |
| Hatchery flows (gate, demo, hatch, 360-1440) | 46 / 46 (2 console `ERR_FAILED` lines are blocked external RPC in the sandbox, same as on `main`) |
| Layout regression (overflow, stats, statuses) | no issues (after fixing the stats strip at 360/390, see below) |
| Evolution / autoplay / reduced motion | clean, no console errors or overflow |
| Prelaunch URL check | pass |
| `/studio` without credentials | 404 |
| Claims status before launch | launch time redacted (`launchAt: null`) |
| Security headers, `poweredBy`, robots | unchanged: CSP frame-ancestors, DENY, nosniff, referrer, permissions; `noindex`, `Disallow: /` |
| Media rule (≥ 1080 short edge, native) | only raster is the 2000 × 1116 hero still; no `<video>` on any route |

## What changed visually

- Homepage: "A world waiting to awaken." in Cormorant, sigil emblem over the eyebrow, Explore Solanites
  (gilded) + Enter the Hatchery (outline), Phoenix awakening (eclipse ring, dawn, embers) over the still.
  Stats moved below the fold into a borderless strip.
- Header: sigil emblem + spaced Cormorant wordmark; Find My Eggs is an outline button (no purple);
  the current-page marker is a small gilt diamond.
- Collection: plates with a 6 px frame, dex number and rarity pips; interim lighting wrapper around the
  existing creature art (aura only at Legendary and above). No hover lift.
- Hatchery: chamber (arch, light shaft, engraved floor) instead of the particle field; gilt progress bars.
- Every route: gilt eyebrows, display serif headings, 6 px radii, gilt focus ring, the horizon line and a
  280 ms brightness unveil on navigation.

## Issues found and fixed during QA

- Stats strip "1,000,000" overflowed its column at 360 and 390 px: smaller numerals below 400 px.
- Reduced-motion test referenced the removed backdrop embers: now asserts they are gone.

## Known, deferred

- Egg art is still purple/violet (palette belongs to the creature/egg art workstream).
- Amber notice boxes in the Hatchery are not yet the gilt strip from the spec.
