# Solanites website promo · caption pack

A 27-second cinematic teaser: phoenix awakening → in-game creatures → real website captures → phoenix rebirth and logo reveal. Drafts for review; nothing has been posted or scheduled.

## Files

| Use | File | Size |
|---|---|---|
| Primary X video | `export/solanites-promo-16x9-1920x1080.mp4` | 1920×1080, 30 fps, 27.0 s, H.264 + AAC |
| Vertical | `export/solanites-promo-9x16-1080x1920.mp4` | 1080×1920, 30 fps, 27.0 s |
| Square | `export/solanites-promo-1x1-1080x1080.mp4` | 1080×1080, 30 fps, 27.0 s |
| Thumbnail / poster | `export/solanites-promo-poster-4x5-1440x1800.jpg` | 1440×1800 |

On X, upload the 16:9 file and pick the poster as the thumbnail if the composer allows it. The final second holds the end card, so it loops cleanly.

## Caption

```text
Every legend starts somewhere.

28 species. Four forms each. Eggs that hatch into something you can't predict.

Here's a first look inside Solanites.

The beginning is near.
```

## Follow-up reply

```text
Phoenix, the hatch reveal, or the wall of 28 species: what made you stop scrolling?
```

## On-screen text and where it comes from

| On screen | Source |
|---|---|
| EVERY LEGEND STARTS SOMEWHERE. | Brief copy, no claim |
| IN-GAME ARTWORK · PYRAURUM, Eggling / Hatchling / Evolved / Ascended | `src/lib/species.ts` (Pyraurum), `gameConfig.evolution.names` |
| Zephrax · Epic · Storm, Velynx · Legendary · Shadow, Cryovant · Rare · Crystal | `src/lib/species.ts` |
| 28 SPECIES. ONE WORLD. (28 tiles: 22 species + 6 Mythic/Secret silhouettes) | `src/lib/species.ts` (28 entries); classified species shown only as silhouettes, as on the site |
| A LOOK INSIDE THE WEBSITE: Home, The Collection, Species detail, The Hatchery | Real captures of the current code (production build, no environment variables) |
| HATCHERY DEMO · SIMULATED DATA | The Hatchery shots are the built-in demo; the label is on screen for the whole shot |
| YOUR STORY HASN'T BEGUN YET. · SOLANITES · THE BEGINNING IS NEAR. | Brief copy, no claim |

Small corner labels say "Cinematic artwork" over the phoenix footage, "In-game artwork" over the creatures and "Real site captures" over the website, so the Runway phoenix is never presented as the in-game Pyraurum model.

## What is deliberately not in the video

- No URL, address bar, scannable code, token or wallet address, date or launch detail.
- No token figures: the homepage "1,000,000 $SLNT per egg" stat, the wallet line and the Hatchery balance panel are cropped out.
- No timers, odds, tracking or reward claims.
- Pyraurum's lore line ("…its keeper refuses to sell") is cropped out of the species-detail capture.

## Sources

- Phoenix footage: the two existing Runway clips on the `phoenix-intro` branch (`art/intro/clip-1-awakening.mp4`, `clip-2-rebirth.mp4`), upscaled locally from 720p. Poster: `campaign/x-teasers/source/phoenix-still.png`, the reference still those clips were animated from. No new generation and no credits used.
- Creature art: the site's own `CreatureArt` component, exported by `campaign/x-gameplay-infographics/build/art.mjs`.
- Website: screenshots of the running site (`source/site/`). The collection scroll is a pan over a real full-page capture; the reveal is eight real frames of the Neonyx (Epic) hatch animation.
- Audio: the clips' own Runway-generated audio in acts 1 and 4, plus a score synthesised locally by `build/audio.py` (drone, pads, pulse, risers, impacts). Loudness −14 LUFS target, −1.5 dBTP.

## Before posting

- Confirm you are happy showing the Hatchery demo and the site before the website URL is announced.
- The phoenix is promotional key art. The in-game phoenix is Pyraurum (shown in act 2), which looks different.

## Rebuilding

```bash
bash    campaign/website-promo-video/build/footage.sh   # footage frames + clip audio from phoenix-intro
python3 campaign/website-promo-video/build/audio.py     # soundtrack
node    campaign/website-promo-video/build/check-frame.mjs   # no text outside the frame or overlapping
node    campaign/website-promo-video/build/render.mjs   # all three videos (~4 min each)
node    campaign/website-promo-video/build/poster.mjs   # poster
node    campaign/website-promo-video/build/validate.mjs # decode, specs, audio, OCR, QR, caption checks
```
