# Campaign tooling (source files and render scripts)

These are kept apart from the finished assets. The tools depend on code and paths on their own branches, so they are **documented here, not copied**. To use one, check out its branch (`git switch <branch>`) and run the command from the repository root.

| Tool | Branch | Files | Produces | Run |
|---|---|---|---|---|
| **Content Studio** (in-browser campaign editor at `/studio`) | `campaign/phoenix-content-studio` | `src/app/studio/page.tsx`, `src/components/studio/*`, `src/studio/*` (copy, facts, content pack, X text checks, canvas renderer `render/draw.ts`, tests) | Custom creatives, PNG exports, recorded adverts, copy | `npm run dev`, then open `/studio` locally |
| **Studio batch renderer** | `campaign/phoenix-content-studio` | `scripts/campaign/render.mjs`, `scripts/campaign/entry.ts` | `public/campaign/ads/*.mp4`, `public/campaign/stills/*.jpg`, `docs/campaign/x-content-pack.md` | `npm run campaign:render` (all, about 6–8 min) · `-- --only stills\|videos\|pack` · `-- --source new.mp4` |
| **X teaser builder** | `campaign/x-teasers` | `campaign/x-teasers/build/{teasers.html,render.mjs,check.mjs,prep.py,fonts/}` | `campaign/x-teasers/export/{4x5,1x1}/*.jpg` | `node campaign/x-teasers/build/render.mjs` · one image: `… render.mjs 4 4x5` · guardrails only: `node campaign/x-teasers/build/check.mjs` |
| **X post 01 builder** | `prelaunch-phoenix` | `scripts/x-post-01.mjs` | `art/campaign/x-post-01/*.jpg` | `node scripts/x-post-01.mjs` |
| **Promo video builder** | `prelaunch-phoenix` | `scripts/promo-assets.sh`, `scripts/promo-overlays.mjs` | `art/promo/*.mp4`, `art/promo/solanites-poster-4x5.jpg`, `art/promo/overlays/*.png` | `scripts/promo-assets.sh` (runs the URL check first) |
| **Prelaunch URL guard** | `prelaunch-phoenix` | `scripts/check-prelaunch-urls.sh` | Pass/fail | `scripts/check-prelaunch-urls.sh` |
| **Website intro video** | `prelaunch-phoenix` | `scripts/phoenix-intro.sh`, `scripts/intro-wordmark.mjs` | `public/intro/phoenix-*` (site files) | `scripts/phoenix-intro.sh art/intro/clip-1-awakening.mp4 art/intro/clip-2-rebirth.mp4` |

**Requirements:** `ffmpeg`/`ffprobe` on PATH, Playwright's Chromium, and `python3` with Pillow for the teaser builder. Node packages from `npm install` on that branch.

## Notes and cautions

- **Use `prelaunch-phoenix`, not `phoenix-intro`, for the promo builder.** The `phoenix-intro` version of `promo-overlays.mjs` puts the private website URL on the end card and poster, and has no URL guard.
- **`/studio` is an internal tool.** On its branch it returns 404 in production unless `SOLANITES_STUDIO=1` is set. That is an on/off switch, not authentication, so do not enable it on a public deployment. Anything in that branch's `public/campaign/` is publicly downloadable on any deployment of that branch.
- The Studio's copy generator takes an optional URL field. Leave it empty until the official launch URL is approved (see [`../plans/prelaunch-rules.md`](../plans/prelaunch-rules.md)).
- The teaser builder fails the render if any image shows text other than its approved copy (`APPROVED` in `check.mjs`). To change wording, edit `teasers.html` and `APPROVED` together.
- After re-rendering, copy the new outputs into `campaigns/` and update [`../MANIFEST.md`](../MANIFEST.md). Give the new file a different name (or move the old one to `archive/`) rather than overwriting it.
