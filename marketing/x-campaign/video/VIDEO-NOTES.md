# Solanites X campaign video

Built locally to `marketing/x-campaign/template/SPEC.md` (1920×1080: lockup left 86 / top 72, emblem 62 px, wordmark 30 px; Cormorant headlines with one gilt italic word; kicker, support and footer styles; void + eclipse-violet palette; end card with the full sigil and "The hatching begins soon"). Nothing has been posted, scheduled, committed or pushed.

| File | What |
|---|---|
| `final.mp4` | 1920×1080, 30 fps, 42 s, H.264 + AAC |
| `final-captions.mp4` | the same edit with burned-in captions for muted viewing |

## Timeline

| Time | Kicker / headline | Hero (all real) | Footer label |
|---|---|---|---|
| 0–3.5 | GENESIS HATCHERY · 28 creatures. Sealed in *eggs.* | Runway Phoenix awakening footage (the same Phoenix as the site key art) | Key art |
| 3.5–6.3 | THE HATCHERY · Where every egg *waits.* | screencast of the local site's Hatchery demo: egg row, then "Ready to Hatch" | Hatchery demo · simulated data (outlined) |
| 6.3–10.5 | HATCHING · It doesn't just *sit there.* | the same demo hatch: crack, flash, reveal | Hatchery demo · simulated data (outlined) |
| 10.5–14.5 | EVOLUTION · One creature. Four *forms.* | `public/creatures/pyraurum` 1–4 | In-game art · Pyraurum |
| 14.5–18.5 | THE BLOODLINES · Six *bloodlines.* | `build/captures/rarity-cards.jpg` (site capture), panned | Real site capture · The bloodlines |
| 18.5–22.5 | THE COLLECTION · 28 species. No two *alike.* | screencast scroll of the local site's Collection | Real site capture · The Collection |
| 22.5–26 | YOUR COLLECTION · It grows *with you.* | `public/creatures/velynx` 1→4 | In-game art · Velynx |
| 26–30 | HALL OF KEEPERS · The Keepers' *board.* + LIVE SOON | `public/scenes/aurelion` + Aurelion ascended | In-game art · Aurelion |
| 30–34 | MYTHIC & SECRET · The rarest of *all.* | `public/scenes/genesis` + glow layers + GENESIS | In-game art · Genesis |
| 34–42 | Full sigil · SOLANITES · *28 creatures sleep in sealed eggs.* · THE HATCHING BEGINS SOON | sigil | none |

Site captures (`build/captures/`, with frame timestamps in `index.json`) were recorded by `build/record.mjs` from `marketing/x-campaign` @ 37760ef, run locally (production build, demo mode, no fixtures), through Chrome's screencast at 1440×900. The mock token balance and the homepage's live-stats strip are cropped out.

## Captions (muted version)

0–3.5 "28 creatures, sealed in eggs." · 3.5–6.3 "In the Hatchery, every egg waits to open." · 6.3–10.5 "It glows, it cracks, it hatches. Shown in demo mode." · 10.5–14.5 "Every creature grows through four forms." · 14.5–18.5 "Six rarity tiers, from Common to Secret." · 18.5–22.5 "28 species, each one different." · 22.5–26 "Your Solanites grow from Eggling to Ascended." · 26–30 "A leaderboard for keepers. Live soon." · 30–34 "Six of the 28 species are Mythic or Secret." · 34.6–42 "Solanites. The hatching begins soon."

## Sound

Restrained and generated locally with ffmpeg: a low drone, soft air, gilt bell tones at each scene change, light whooshes, one impact on the hatch flash (7.95 s) and a swell into the end card. The awakening clip's own audio sits under the first 3.5 s. Loudness −18.9 LUFS, true peak −2 dBFS. No music, no licensed audio, no paid generation.

## Rules followed

No URL, address, QR code, date, price, token amount or test-token figure. No "visit" CTA: the end card uses "The hatching begins soon", as the template requires. The leaderboard is shown as "Live soon" on Aurelion's biome, not the simulated board. The fast track isn't shown. Hatch footage is labelled "Hatchery demo · simulated data".

## Needs the owner's attention

- The rarity cards show the hatch rates as the site displays them (Legendary 4%); the game config says 3.8%. Same as post 04.
- The 0–3.5 s hero is the Runway Phoenix footage (motion), not the still key art in `public/hero/current`. Same Phoenix; swap to the still if the template must use only site files.
