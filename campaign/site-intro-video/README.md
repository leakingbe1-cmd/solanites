# Site intro video (42.8 s)

Walkthrough of the live site for the pinned X post. Captions burned in, soft generated drone + bell sound (no external audio).

| File | Size |
|---|---|
| `site-intro-1920x1080.mp4` | 1920×1080, H.264 + AAC, 5.3 MB |
| `site-intro-1080x1350.mp4` | 1080×1350 (4:5), 3.1 MB |

Scenes: hero · bloodline odds card (40/30/17/8/3.5/1.5, art-free) · Collection filtered to Legendary · market chart (price header cropped out) · Hatchery demo labelled "simulated data" · evolution timeline · leaderboard ("live soon") · end card "Follow @Solanites_ · Contract: coming soon".

Safety: Mythic and Secret creatures are never navigated to; `record.mjs` rejects any demo hatch that reveals one and retries. No URL, address bar, contract address, date or price claim appears.

Rebuild: `node build/record.mjs` (records the live site), then `node build/compose.mjs`. Needs ffmpeg and Playwright's Chromium.
