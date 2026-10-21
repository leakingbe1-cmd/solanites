# Campaign video

Made by the Promo Ads session to `../template/SPEC.md` (same lockup, type and end card).

| File | What |
|---|---|
| `final.mp4` | 42 s, 1920×1080, 30 fps, H.264 + AAC |
| `final-captions.mp4` | the same edit with burned-in captions for muted viewing |
| `VIDEO-NOTES.md` | timeline, sources, captions, sound, rules followed, open questions |
| `build/` | `render.mjs` (renders both), `compositor.js` (the frames), `record.mjs` (re-records the site captures), `soundtrack.sh`, sources |

Not posted or scheduled anywhere. Rebuild: `node marketing/x-campaign/video/build/render.mjs` (needs ffmpeg and Playwright's Chromium).
