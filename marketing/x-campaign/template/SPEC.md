# Solanites X master template

Every X graphic in this campaign is built from `template.html` and follows this spec. `master-template-1600x900.png` shows the zones.

## Canvas

| Asset | Size | File |
|---|---|---|
| Post (every post, no exceptions) | **1600 × 900** (16:9) | `posts/NN-slug.jpg` |
| X header | 1500 × 500 | `profile/x-header-1500x500.png` |
| Avatar | 400 × 400, shown as a circle | `profile/x-avatar-400x400.png` |

## Layout (post)

| Zone | Position | Contents |
|---|---|---|
| Safe margin | 72 px on every side | Nothing important outside it |
| **Brand lockup** | left 72, top 60. Same place, same size, every post | Sigil emblem (`assets/sigil-emblem.svg`, 52 × 45) + gap 14 + `SOLANITES` in Cormorant 600, 25 px, letter-spacing 0.32em, bone |
| Copy column | x 72 → 712, vertically centred | kicker → headline → support line (→ optional pill) |
| Hero | x 772 → 1528, y 72 → 828 (creature rows may start at x 770) | **One** dominant visual: a painted creature, a creature on its biome plate, the key art, or one real site capture |
| Footer | 52 px from the bottom, left and right margins 72 | Left: `NN / 10`. Right: what the hero is (`In-game art · Pyraurum`, `Real site capture · …`, `Key art`) |

Hatchery demo captures always carry the gold outlined label `Hatchery demo · simulated data` in the footer.

## Type

| Role | Font | Size / weight | Colour |
|---|---|---|---|
| Kicker | JetBrains Mono, uppercase, 0.3em tracking, 28 px gilt rule before it | 17 px | gilt `#e8b75c` |
| Headline | **Cormorant** (the site's display serif) | 118 px, 600, line-height 0.98, at most 2 lines | bone `#efe8da`; **one** word in italic 500 with the gilt gradient (`#fff1c9 → #e8b75c → #a8692a`) |
| Support line | Inter | 27 px, line-height 1.42, max 560 px wide | vellum `#bdb3a3` |
| Pill (status, e.g. "Live soon") | JetBrains Mono, uppercase | 17 px | void text on gilt gradient |
| Hero captions / footer | JetBrains Mono, uppercase, 0.22–0.24em | 15 px | vellum / dust `#8c8374`; names in gilt |

Fonts are in `fonts/` (SIL Open Font License), the same Fontsource files the site ships.

## Colour

Background: void `#07060a` with a soft eclipse-violet glow (`#7d5cf0` at 20%) behind the hero, a faint gilt glow, a deep `#241a4d` corner and a sparse star field (bone, flare `#fff1c9`, eclipse-soft `#a48cff`). Accents are **gilt only**. Aurora `#46c9b0` and the Solana chain colours are not used in campaign graphics.

## Content rules

- Real assets only: `public/creatures/<id>/<n>-<stage>.webp`, `public/scenes/<id>/plate.webp`, `public/hero/current/` key art, and real captures of the site in `build/captures/`.
- No URL, address, QR code, date, price, token amount or test-token metric anywhere. Holder and market figures on the preview come from a test token and are never shown.
- Features not live in production are shown as "Live soon" (leaderboard) or not at all (fast track, new odds).
- Headlines: sentence case, short, one gilt italic word.

## Header and avatar

- **Header:** wordmark (sigil emblem 84 px + `SOLANITES` Cormorant 64 px) and one line of italic Cormorant on the left, phoenix key art on the right. The lower-left 420 × 200 stays empty because X places the avatar there.
- **Avatar:** the full sigil (`assets/sigil-full.svg`, ring and all) centred at 268 / 400 px on void, inside the circle crop.

## Video (for the Promo Ads session)

Use the same lockup position scaled to the frame (1920 × 1080: left 86, top 72, emblem 62 px, wordmark 30 px), the same Cormorant headline style and gilt accent word, and the 72 px safe margin scaled by frame width / 1600 (86 px at 1080p). End card: full sigil, `SOLANITES`, and "The hatching begins soon" in the kicker style. No URL.
