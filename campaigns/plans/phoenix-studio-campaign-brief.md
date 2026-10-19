# Phoenix campaign

The first Solanites campaign: a teaser for X built around the Runway Phoenix clip. The site URL is deliberately left off every creative and draft because the domain is going to change; add it in the Studio's URL field (or in a reply) once it is final.

## What's here

| Output | File | Size |
|---|---|---|
| X video advert | `public/campaign/ads/solanites-phoenix-16x9.mp4` | 1920×1080, 11.6 s, H.264 + AAC |
| Vertical video | `public/campaign/ads/solanites-phoenix-9x16.mp4` | 1080×1920 |
| Square video | `public/campaign/ads/solanites-phoenix-1x1.mp4` | 1080×1080 |
| Portrait video | `public/campaign/ads/solanites-phoenix-4x5.mp4` | 1080×1350 |
| Poster | `public/campaign/stills/poster.jpg` | 1200×1800 |
| End cards | `public/campaign/stills/endcard-{16x9,9x16,1x1,4x5}.jpg` | per ratio |
| X post images | `public/campaign/stills/x-0*.jpg` | 1600×900 |
| Static variants | `public/campaign/stills/{square-1x1,portrait-4x5,vertical-9x16}.jpg` | per ratio |
| X drafts | `docs/campaign/x-content-pack.md` | eight posts |

`public/campaign/manifest.json` lists what the last render produced; every file in it was checked with ffprobe for size and duration.

## The advert

| Time | What happens |
|---|---|
| 0–0.9 s | The Phoenix emerges from black. |
| 0.35–2.2 s | Hook: **NOT JUST ANOTHER EGG.** A small brand lockup appears in the corner and stays until the end screen, so muted autoplay always shows whose ad it is. |
| 2.35–6.4 s | Three callouts, one at a time: **28 species to discover · 6 rarity tiers · Hatch. Collect. Evolve.** |
| 6.5 s | A soft flash into the full wingspan. |
| 6.7 s to end | Logo, **YOUR SOLANITE IS WAITING.**, then **ENTER THE HATCHERY**. The last source frame is held for 1.5 s, so the end screen reads for about 4.5 s. |

The source audio is kept and fades out over the hold. Everything reads with the sound off.

**Layouts are composed per ratio, not cropped.** The Phoenix's wings reach the edges of the 16:9 source, so a centre crop would cut them off. The 16:9 cut uses the footage full-bleed with copy in the lower third (over the tail, never the head, halo or wings). The taller cuts show the whole frame in a feathered band over a blurred extension of itself, with copy above and below and clear of the platform UI zones.

## Claims

Every figure comes from `src/studio/facts.ts`, which reads the game config and catalogue (`gameConfig`, `eggProgression`, `species`, `rarity`), so creatives follow the rules if they change. Left out on purpose: the leaderboard (simulated), fee claims and payouts (not implemented), prices, partnerships, holder counts and launch dates. `src/studio/xText.ts` flags financial, guaranteed-outcome and unverifiable wording in generated and hand-typed copy alike.

## Re-rendering

```bash
npm run campaign:render                     # adverts, stills, content pack (about 6–8 min)
npm run campaign:render -- --only stills    # or: videos, pack
npm run campaign:render -- --source new.mp4 # a different source clip (any 16:9)
```

Needs `ffmpeg`/`ffprobe` on PATH and Playwright's Chromium (`npx playwright install chromium` if missing). The script runs the Studio's own canvas renderer (`src/studio/render/draw.ts`) in headless Chromium, one source frame at a time, and pipes the frames to x264. To change the master copy, edit `MASTER_INPUT` in `src/studio/copy.ts`. The content pack lives in `src/studio/contentPack.ts`.

## Content Studio (`/studio`)

`npm run dev`, then open `http://localhost:3000/studio`. In production it 404s unless `SOLANITES_STUDIO=1` is set on the deployment. It is never linked from the site and always sends `noindex`. Note that the files in `public/campaign/` are public static assets on any deployment.

- **Create**: campaign type, platform and size, main message, audience, verified features, CTA, optional URL and details. **Generate** builds headline, supporting copy, callouts, X caption (with X's character count), thread, CTA and hashtags; **Other wording** cycles variants. The preview is the real creative; edit its text directly (`*word*` renders gold). Export a PNG, or record the advert with your copy in real time (MP4 where the browser records H.264, otherwise WebM, which you can convert with `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`). Download all copy as Markdown.
- **X content pack**: the eight drafts with their creative, objective and CTA, each copyable, plus the asset downloads.
- **Campaign assets**: every rendered file, playable and downloadable.

Copy generation is template-based and runs in the browser: no API, no cost. AI drafting (for example the Claude API) could be added later behind a server-side key, billed per token; it is intentionally not enabled.

`public/campaign/phoenix-source.webm` is a VP9 copy of the clip for browsers without H.264 playback.
