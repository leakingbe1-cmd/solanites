# Handoff: Promo Ads → Marketing lane

## Scope
Phoenix advert campaign, the internal Content Studio (`/studio`), the prelaunch teaser rules, X copy, the 26.5 s teaser and the 42 s campaign video. Nothing was ever posted or scheduled.

## Done (with SHAs)
- `campaign/phoenix-content-studio` @ `0e850e8`: Content Studio, the shared canvas renderer (`src/studio/render/draw.ts`), `npm run campaign:render`, first adverts.
- `x-campaign` @ `c78f89e` (fast-forward of the above): `PHASE = "prelaunch"` in `src/studio/facts.ts` (no URL, address, date or token detail; held claims struck out), OCR leak scan `scripts/campaign/scan-urls.mjs`, 4 adverts (16:9, 9:16, 1:1, 4:5), 4:5 poster, first X post "Which creature would you hatch?", 9-post pack (5 approved in principle, 4 held), `docs/campaign/MANIFEST.md`. 205 tests passed.
- `promo/video-42s` @ `54279ff` (on `marketing/x-campaign` @ `37760ef`): the 42 s campaign video plus its build and sources, in `marketing/x-campaign/video/`.
- 26.5 s teaser (16:9, 9:16, 1:1, 4:5 poster, caption): delivered as chat attachments only, not in the repo.

## The promo video
- Files: `marketing/x-campaign/video/final.mp4` and `final-captions.mp4` (burned-in captions for muted viewing), each 42 s, 1920×1080, 30 fps, H.264 + AAC, about 10 MB.
- Built to `marketing/x-campaign/template/SPEC.md`: sigil lockup at 86/72, Cormorant headlines with one gilt italic word, end card "The hatching begins soon", no URL.
- Real sources only: Hatchery demo hatch and Collection scroll recorded from the local site (`build/record.mjs`, Chrome screencast), `public/creatures` and `public/scenes` art, the Runway awakening clip, `build/captures/rarity-cards.jpg`.
- Checks: 0 decode errors; −18.9 LUFS; OCR of 336 frames, 0 URL/domain/address; 0 QR codes.
- **Odds mismatch:** the rarity cards show the site's rates (Legendary 4%); `gameConfig.rarityWeights` says 3.8%. Post 04 has the same issue.
- Rebuild: `node marketing/x-campaign/video/build/render.mjs` (about 9 min); notes in `VIDEO-NOTES.md`.

## Open bugs/risks
- The repo is public; its GitHub homepage field shows the production URL; internal comments on `main` (`.env.example`, `tracker-sync.yml`, `src/server/claims/service.ts`) contain it too.
- Every push creates a Vercel preview; preview protection is unverified.
- `/api/claims/status` returned `launchAt` publicly on the old `main`; `prelaunch-phoenix` withholds it. Not re-checked after `main` @ `03084fb`.
- The GitHub "Tracker sync" job skips (`SOLANITES_SYNC_URL` / `CRON_SECRET` unset), so live egg tracking is unverified.
- `x-campaign` post 3 says Mythic and Secret stay classified "until someone hatches one"; discovery is per viewer ("until you hatch one").
- Teaser CTA text is about 4–9 px on phones; enlarge it before posting the `x-campaign` adverts.

## Pending owner decisions
1. Rarity odds: 4% (site) or 3.8% (config); then re-render the video and post 04.
2. Opening shot: Runway motion footage, or the still in `public/hero/current`.
3. Which teaser set is official: `x-campaign`, `marketing/x-campaign`, `campaign/x-teasers` or `prelaunch-phoenix`.
4. Repo visibility, homepage field and Vercel deployment protection before the reveal.
5. Sign-off on every post; when to lift `PHASE` to "launch".

## Gotchas
- Playwright's bundled Chromium can't play H.264: the Studio ships a WebM fallback; render from extracted frames.
- Use the CDP screencast (`record.mjs`), not Playwright `recordVideo`, which is soft (about 0.8 Mbps).
- The Runway awakening clip is letterboxed for its first 3.3 s; `render.mjs` crops and zooms.
- Crop the Hatchery demo below the mock balance; never show the homepage live-stats strip.
- Fresh clones track only `main`; add a fetch refspec before setting an upstream.

## Next steps
- Resolve the odds and re-render (`render.mjs`, then `scripts/campaign/scan-urls.mjs` on the outputs).
- Merge the teaser sets into one official pack; fix post 3 wording and the CTA size.
- Recheck the privacy risks against production `main`.
