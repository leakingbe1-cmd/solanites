> **RETIRED 21 Oct: do not post `final.mp4` or `final-captions.mp4`.** They show the old odds (60/25/10/4/1/0.2 rarity cards) and include GENESIS (Secret) frames, which breaks the owner's rules (live odds 40/30/17/8/3.5/1.5; no Mythic or Secret designs on X). The live pinned video is the site intro video on `campaign/site-intro-video` (posted 21 Oct). A rebuild of this 42 s cut would need new scenes without `rarity-cards.jpg` and the GENESIS/Aurelion plates in `build/render.mjs`; it is superseded unless the owner asks for it.

# Campaign video

Made by the Promo Ads session to `../template/SPEC.md` (same lockup, type and end card).

| File | What |
|---|---|
| `final.mp4` | 42 s, 1920×1080, 30 fps, H.264 + AAC |
| `final-captions.mp4` | the same edit with burned-in captions for muted viewing |
| `VIDEO-NOTES.md` | timeline, sources, captions, sound, rules followed, open questions |
| `build/` | `render.mjs` (renders both), `compositor.js` (the frames), `record.mjs` (re-records the site captures), `soundtrack.sh`, sources |

Not posted or scheduled anywhere. Rebuild: `node marketing/x-campaign/video/build/render.mjs` (needs ffmpeg and Playwright's Chromium).
