# Solanites product reveal · Phoenix meets the real website

The second campaign: the cinematic Phoenix opens, then the audience sees genuine screen recordings of the current Solanites website. It is a product reveal rather than a set of posters. Drafts for review: nothing has been posted, scheduled, deployed or pushed.

## Deliverables

| File | Size | Length | Use |
|---|---|---|---|
| `export/solanites-product-reveal-16x9.mp4` | 1920×1080 | 17.5 s | Main X video |
| `export/solanites-product-reveal-9x16.mp4` | 1080×1920 | 17.5 s | Vertical cut, built from the phone layout |
| `export/solanites-product-reveal-4x5.jpg` | 1440×1800 | still | Promotional still |
| `export/clips/solanites-clip-collection-4x5.mp4` | 1080×1350 | 9.0 s | Teaser: the Collection |
| `export/clips/solanites-clip-hatch-4x5.mp4` | 1080×1350 | 11.5 s | Teaser: watch it hatch |
| `export/clips/solanites-clip-rarity-4x5.mp4` | 1080×1350 | 10.5 s | Teaser: rarity tiers and Pyraurum's four forms |

All videos are H.264 High at 30 fps (yuv420p, faststart) with stereo AAC at 48 kHz, mixed to −14 LUFS. `export/**/*.text.json` lists every caption the renderer drew, for the safety check.

## Structure of the main video

| Time | Shot |
|---|---|
| 0–2.35 s | Phoenix hook: the existing Runway rebirth footage, wings rising, ending in a warm flash. |
| 2.2–5.5 s | **Website:** the homepage hero animation, where an egg cracks and hatches into Pyraurum's Eggling form. Caption: *Watch it hatch.* |
| 5.4–8.7 s | **Website:** scrolling the Collection grid. Caption: *28 species to discover.* |
| 8.6–11.3 s | **Website:** Pyraurum's entry in the Collection, showing its four real forms (Eggling, Hatchling, Evolved, Ascended). Caption: *One creature. Four forms.* |
| 11.2–13.9 s | **Website:** the homepage rarity cards, one per tier from Common to Secret. Caption: *Six tiers of rarity.* |
| 13.8–17.5 s | The Phoenix settles behind the SOLANITES mark and wordmark, then *Your Solanite is waiting.* (the site's own headline). |

The 9:16 cut tells the same story with recordings of the phone layout. The three clips each open with a one-second Phoenix sting, show one feature, and close on the same end card.

## Website features actually shown

All recorded from a production build (`next build && next start`) of the current release branch, `main` at `49176a7`, in headless Chromium. Nothing on the pages was edited; the recordings were only cropped, scaled and framed.

1. **Homepage hero animation** (`HeroLifecycle`): the egg cracks, hatches and grows through its forms into Pyraurum, with the lifecycle labels.
2. **Collection page** (`/collection`): the catalogue grid with species cards, rarity badges, elements, filters, the 0/28 discovery counter and classified Mythic/Secret entries.
3. **Species detail** (Pyraurum, opened from the Collection): its four stage cards and the Ascended form panel with its stats.
4. **Rarity showcase** (homepage "Six tiers of rarity" section): one card per tier with the site's displayed hatch rates.

The Hatchery page, wallet lookup, demo session, Leaderboard and Claims page are **not** shown. Live egg tracking, wallet features and holder distribution can't be verified from a local build, and the Leaderboard uses simulated data.

## Kept out of frame on purpose

- Token amounts and the token name. The homepage hero's "per egg" stat sits below the animation, so the crop stops above it, on desktop and on phones.
- Wallet and tracking copy ("No wallet needed…", "Connect your wallet…").
- Holding language: the rarity section's subtitle and Pyraurum's lore line. On phones the Pyraurum recording is only used from 2.8 s, once that line has scrolled away.
- The site address, the browser chrome and the Next.js developer badge. The recordings are of page content only, from a production build.

## Claims

Captions state only facts verified in the release code:

| Caption | Source |
|---|---|
| 28 species | `SPECIES.length` in `src/lib/species.ts` (6 Common, 5 Rare, 5 Epic, 6 Legendary, 4 Mythic, 2 Secret) |
| Six tiers of rarity | `RARITY_ORDER` in `src/lib/rarity.ts` |
| Four forms | `gameConfig.evolution.names`; Pyraurum's detail panel shows "Evolution stages 4" |
| Pyraurum · Legendary | `src/lib/species.ts` |
| Watch it hatch | the homepage animation shown underneath it |
| Your Solanite is waiting. | the site's own homepage headline |

No odds are written in captions. The rarity cards show the site's own rounded hatch rates, which match the published weights (60 / 25 / 10 / 3.8 / 1 / 0.2) apart from the site rounding Legendary to 4%.

## Recording method

`build/capture.mjs` drives the site with Playwright. The page's clock is paused, and each frame advances timers, `requestAnimationFrame` and every CSS animation by exactly 1/30 s before a screenshot, so the recordings play at true speed and stay smooth. That's 1.5× density on desktop (1440×900 CSS px) and 2× on a 430×932 phone viewport. Each recording is kept as an MP4 in `captures/`, and the frame folders it renders from are rebuilt from those MP4s when missing.

## Runway and audio

No new Runway generations and no credits used. The Phoenix motion is the existing awakening and rebirth footage (`source/`, copies of `art/intro/` on `phoenix-intro`). The soundtrack is original, synthesised in `build/audio.py` (numpy, no samples or licensed music) and cut to each video's shot changes.

## Rebuild

```bash
campaign/product-reveal/build/build.sh              # from the committed recordings
CAPTURE=1 campaign/product-reveal/build/build.sh    # re-record first (site running on :3100)
```

This needs ffmpeg, python3 with numpy and Pillow, and Playwright's Chromium. `build/check.mjs` verifies every export: size, frame rate, duration, stereo AAC, full decode, approved captions only, and the guardrail patterns from the X teasers. Those patterns reject links, domains, deployment references, scannable codes, addresses, dates, token details, financial claims and urgency wording.
