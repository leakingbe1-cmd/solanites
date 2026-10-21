# Handoff: X infographics, promo video and X campaign (session_015BaveZH8mricA2oRqLrohK)

## Scope
X marketing assets for Solanites: gameplay infographics, a website promo video, and the X campaign package
(master template, 10 posts, header, avatar), plus the copy delivered by Creative Direction.

## Done
- **marketing/x-campaign @ 37760ef** (pushed; based on design/eclipse-vigil-code 42d39c4): template, 10 posts at
  1600×900, header 1500×500, avatar 400×400, contact sheet, copy (4 files, sha256 verified), render + validate scripts.
- **campaign/x-gameplay-infographics @ 553fb13**: LOCAL ONLY, not pushed. 5 infographics (4:5 + 1:1), content pack, validator.
- **campaign/website-promo-video @ fd37c13**: LOCAL ONLY, not pushed. 27 s promo at 16:9, 9:16 and 1:1, a 4:5 poster, a caption pack.
- The owner has the infographic and video files as chat attachments. The local branches live only in the session
  container and are lost when it is reclaimed, unless the owner approves pushing them.

## Assets and where they live
- `marketing/x-campaign/`: `template/` (template.html, SPEC.md, fonts, sigil SVGs), `posts/`, `profile/`, `copy/`,
  `contact-sheet.png`, `build/` (render.mjs, validate.mjs, captures/ with CAPTURES.md).
- The promo video was built from the Runway clips on `phoenix-intro` (`art/intro/clip-*.mp4`), with no new generation.

## Posts on hold, and why
- **03**: the fast-track version is not made, because `feature/fast-track` is not merged. The graphic uses the non-fast-track wording.
- **04**: the image is the site's rarity cards (60/25/10/4/1/0.2). Re-capture it if the fast-track odds ship.
- **07**: was held until "all 28 public" reached production. `main` 03084fb now includes it, so verify on the live
  site and then clear the gate in copy/captions.md.
- **08**: say "Live soon" until `feature/live-leaderboard` shows real holders. Never show the simulated board.

## Open bugs/risks
- The posts were rendered from design 42d39c4; the site has moved on since. Re-render if the UI or art changed (`node marketing/x-campaign/build/render.mjs`).
- The site rounds Legendary 3.8% to 4%. The earlier infographic (553fb13) says 3.8%. Pick one public figure.
- The local branches 553fb13 and fd37c13 still name Mythic/Secret species in their source files (fine now that they are public).
- Holder, egg and market-cap figures on the preview come from a TEST token. Never show them.

## Pending owner decisions
- Whether to push campaign/x-gameplay-infographics (553fb13) and campaign/website-promo-video (fd37c13).
- Sign-off for each post on the day (copy/schedule.md). The video for the pinned post is still owed by Promo Ads.

## Gotchas
- Headless captures: the full-page screenshots leave lazy art blank, so capture by viewport. Hero crops are at device scale 2.
- validate.mjs OCR misreads tiny UI numbers ("0.2%" → "8.2%"). Its patterns use digit boundaries; check the hits by hand.
- Pushing triggers a Vercel preview build (tight limit): push once per package.
- Prelaunch rules: no URL, address, date, price or token figure. `scripts/check-prelaunch-urls.sh` must pass.

## Next steps
1. Re-render the posts from current `main` and run validate.mjs.
2. Clear the post 7 gate once it is confirmed live in production.
3. Add the Promo Ads video to `marketing/x-campaign/video/` when it is delivered.
4. Ask the owner about pushing the two local branches.
