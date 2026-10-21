# Solanites X campaign

Ten 1600×900 X posts, a profile header and avatar, all built from one master template, plus the copy.
Nothing here is posted or scheduled; every post needs the owner's sign-off on the day.

| Path | What |
|---|---|
| `template/` | `template.html` (the master; every graphic renders from it), `SPEC.md` (colours, type, logo position, safe margins), `master-template-1600x900.png` (zones), fonts, sigil |
| `posts/` | `01-intro` … `10-cta`, 1600×900 JPG |
| `profile/` | `x-header-1500x500.png`, `x-avatar-400x400.png` |
| `copy/` | captions, profile/bio, schedule and profile audit (from the Creative Direction session) |
| `video/` | campaign video (from the Promo Ads session) |
| `contact-sheet.png` | everything on one page |
| `build/` | `render.mjs` (renders all, checks layout), `validate.mjs` (sizes, QR, OCR, wording, caption length), captures |

## Posts

| # | Headline | Hero | Gate |
|---|---|---|---|
| 01 | 28 creatures. Sealed in *eggs.* | phoenix key art (site hero) | none |
| 02 | Where every egg *waits.* | Hatchery demo capture, labelled simulated | none |
| 03 | It doesn't just *sit there.* | hatch reveal capture, labelled simulated | the fast-track version is not made: `feature/fast-track` is not merged |
| 04 | Six *bloodlines.* | the site's six-tier cards (odds as the site shows them) | redo if the odds change |
| 05 | One creature. Four *forms.* | Pyraurum, four painted stages | none |
| 06 | 28 species. No two *alike.* | Mossling, Velynx, Cryovant | none |
| 07 | The rarest of *all.* | GENESIS on its biome | none (all 28 species are public since 20 Oct) |
| 08 | The Keepers' *board.* + LIVE SOON | Aurelion on its biome | keep "Live soon" until `feature/live-leaderboard` is live with real holders |
| 09 | It grows *with you.* | Collection capture | none |
| 10 | The hatching begins *soon.* | the Hatchery egg | none |

## Rebuild

```bash
npm ci
node marketing/x-campaign/build/render.mjs     # all graphics + contact sheet; fails on clipping or overlapping text
node marketing/x-campaign/build/validate.mjs   # needs tesseract and python3 with Pillow + opencv-python-headless
```
