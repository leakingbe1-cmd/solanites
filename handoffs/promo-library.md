# Handoff: promo library (Marketing lane)

## What it contains and where
- Branch `campaign/library` (commit `91e0f3c`, based on an older `main`, not merged): central folder `campaigns/`.
- 57 assets copied byte-for-byte from `campaign/phoenix-content-studio`, `campaign/x-teasers` and `prelaunch-phoenix`, plus `README.md` (index, captions, alt text, posting order) and `MANIFEST.md` (every file → source branch:path, format, status, restrictions).
- Approved (owner sign-off still needed): 6 X teasers (4:5 + 1:1), X post 01, 5 gameplay infographics (x-01, -02, -03, -04, -07), 2 stills, 3 "The hatching begins soon" end cards, logo/wordmark/key art/fonts.
- Needs review (in `needs-review/` subfolders): all 7 video ads, 3 posters/stills, infographic x-08, 4 studio end cards, both content packs.
- Tooling stays on source branches; commands are in `campaigns/tooling/README.md`.

## Unfinished
- Owner decisions: the "ENTER THE HATCHERY" CTA (studio ads, end cards, x-08), and the "Hold $SLNT / 1 egg per 1,000,000 $SLNT" claims, since egg tracking is not verified live in production.
- Draft alt text for 11 graphics awaits approval. x-02 needs a new caption.
- Missing: a 4:5 cut and a better-framed 9:16 cut of the prelaunch promo, final creature art (none in repo), and the 1080p intro masters.
- `x-campaign` was never inspected: it is not on GitHub and no Git bundle was found.

## Rules and gotchas
- Follow `campaigns/plans/prelaunch-rules.md`: no site or preview URL, contract address, launch date, token amounts or reward terms.
- `phoenix-intro` promo videos, poster, end cards and `docs/marketing/x-posts.md` show the private URL. Never use them, and never copy them into the library.
- Use `prelaunch-phoenix` (not `phoenix-intro`) for `scripts/promo-assets.sh`; it has the URL guard.
- The repo is public, and branch pushes trigger Vercel preview builds.
- `/studio` (content-studio branch) is gated only by an env var, not auth. Don't enable it on public deploys.
- New renders get new filenames and a MANIFEST update. Move replaced files to `campaigns/archive/`.
