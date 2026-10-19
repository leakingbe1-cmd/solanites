# Solanites teaser video · "The Hatchery is awakening"

An 18-second cinematic teaser for X, built from the six finished teaser images in `campaign/x-teasers/export/` (read only, never modified) and the existing Runway Phoenix footage. Draft for review: nothing has been posted, scheduled or uploaded.

## Exports

| File | Size | Length | Video | Audio |
|---|---|---|---|---|
| `export/solanites-hatchery-awakening-9x16.mp4` | 1080×1920 | 18.0 s | H.264 High, 30 fps, yuv420p | AAC stereo 48 kHz, −14 LUFS |
| `export/solanites-hatchery-awakening-16x9.mp4` | 1920×1080 | 18.0 s | H.264 High, 30 fps, yuv420p | AAC stereo 48 kHz, −14 LUFS |

`export/*.text.json` records every string the renderer drew on top of the artwork, for the safety check.

## Structure

| Time | Shot | Source |
|---|---|---|
| 0.0–3.4 s | Hook: "Something is stirring in the darkness." Slow push toward the eyes, which flare on two heartbeats. Smoke and embers drift. | Teaser 3 |
| 3.0–7.9 s | Phoenix reveal: the eyes ignite, the Phoenix forms out of the dark and raises its wings. | Existing Runway footage: the awakening clip from 2.0 s, joined seamlessly into the rebirth clip |
| 7.75 s | A warm flash on the wing beat. | |
| 7.75–14.75 s | Montage, 1.4 s each with quick dip-through-dark crossfades and parallax (the poster zooms one way, its blurred extension drifts the other, embers move fastest): Awakening, Fire is only the beginning, Which creature would you hatch?, What makes a creature legendary?, The story is taking shape. | Teasers 1, 4, 2, 5, 6 |
| 14.6–18.0 s | End card: the Phoenix settles in the dark behind the SOLANITES mark and wordmark, then **THE HATCHERY IS AWAKENING.** Fade to black. | Rebirth clip (final pose), official logo mark |

The 9:16 cut uses the 4:5 teasers over a blurred extension of themselves, with the footage framed as a tall centre crop. The 16:9 cut uses the 1:1 teasers, with the footage full-bleed. Each layout is composed for its ratio, not cropped from the other.

## Sound

Original and synthesised from scratch in `build/audio.py` (numpy, no samples, no licensed music). It's a D-minor drone and pad moving i–VI–VII–i with the edit: heartbeats on the eyes, a riser into the reveal, a low impact as the Phoenix appears, a wing whoosh, a bell on the flash, a whoosh and soft hit on every montage cut, a riser and impact into the end card, a bell under the tagline, and faint ember crackle throughout. It's mixed to −14 LUFS integrated with a −1.5 dBTP ceiling (two-pass linear loudnorm, so the hits keep their dynamics), and it's readable with the sound off.

## Runway

No new generations and no credits used. The workspace had 2,035 credits available. The Phoenix motion is the footage already generated for the site intro (awakening task `afb503f1…`, rebirth task `2095f8b0…`, both in the Runway library and on the `phoenix-intro` branch). All other motion (push-ins, parallax, crossfades, flash, smoke, embers, grain, typography) is rendered locally.

If you want extra Runway motion later, these are the stills I'd animate first: teaser 3 (a slow breath of the wings in the dark) and teaser 4 (the fire vortex turning). Each would be a 5 s image-to-video generation, and nothing is started without your approval.

## Safety checks (`build/check.mjs`)

- The composition, engine and this README pass the same guardrail patterns as the X teasers: no links, domains, deployment references, scannable codes, addresses, dates, token details, financial claims or urgency wording.
- Every string drawn on screen is on the approved list: `SOLANITES`, `THE HATCHERY`, `IS AWAKENING.`, `THE HATCHERY IS AWAKENING.`. The posters carry their own copy, which was already checked when they were made.
- The six source teasers are byte-identical to the committed files.
- Each MP4 is the expected size, 30 fps, 15–20 s long, has stereo AAC, and decodes end to end without errors.

## Rebuild

```bash
campaign/hatchery-awakening/build/build.sh
```

This needs ffmpeg, python3 with numpy and Pillow, and Playwright's Chromium. `prep.sh` extracts the footage to 30 fps frames (2× upscaled) into `.cache/`. `audio.py` writes the soundtrack from the cues in `teaser.js`. `render.mjs` renders each frame in headless Chromium (`engine.js`) and pipes it to x264. `check.mjs` verifies the result. A full build takes a few minutes per ratio.

Sources: `source/clip-1-awakening.mp4` and `source/clip-2-rebirth.mp4` (copies of `art/intro/` on `phoenix-intro`), the six images in `campaign/x-teasers/export/`, the site's fonts (Unbounded, JetBrains Mono, Inter; SIL OFL) and the logo mark from `src/components/layout/Logo.tsx`.
