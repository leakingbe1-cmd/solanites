# Solanites X teasers · prelaunch warm-up

Six teaser images for @solanites_, made to post before the official reveal. They are drafts for review: nothing here is posted or scheduled automatically.

**Teaser rules:** each image shows only its approved copy. `build/check.mjs` runs on every render and blocks links, deployment references, scannable codes, addresses, dates, token details, financial claims and pressure wording, in the images and in this pack.

## Files

| # | Teaser | 4:5 (1440×1800) | 1:1 (1440×1440) |
|---|---|---|---|
| 1 | The Awakening | `export/4x5/01-awakening.jpg` | `export/1x1/01-awakening.jpg` |
| 2 | Which creature would you hatch? | `export/4x5/02-which-creature.jpg` | `export/1x1/02-which-creature.jpg` |
| 3 | Something is stirring | `export/4x5/03-stirring.jpg` | `export/1x1/03-stirring.jpg` |
| 4 | Fire is only the beginning | `export/4x5/04-fire-beginning.jpg` | `export/1x1/04-fire-beginning.jpg` |
| 5 | What makes a creature legendary? | `export/4x5/05-legendary.jpg` | `export/1x1/05-legendary.jpg` |
| 6 | The story is taking shape | `export/4x5/06-taking-shape.jpg` | `export/1x1/06-taking-shape.jpg` |
| 7 | Holder distribution | `export/4x5/07-holder-distribution.jpg` | `export/1x1/07-holder-distribution.jpg` |

Paths are relative to `campaign/x-teasers/`. Use the 4:5 versions on X; the 1:1 versions are for anywhere a square crop is forced.

## Recommended posting order

One post a day, or every other day if replies are still coming in. Pin the last one.

1. **Image 3, Something is stirring.** Cold open. Pure mystery, nothing explained.
2. **Image 1, The Awakening.** The Phoenix steps out of the dark: the brand introduction.
3. **Image 4, Fire is only the beginning.** Peak spectacle, while attention is building.
4. **Image 2, Which creature would you hatch?** The first reply prompt, once people care.
5. **Image 5, What makes a creature legendary?** The discussion post.
6. **Image 6, The story is taking shape.** The follow call. Pin it until the reveal.

If you would rather lead with the brand, swap the first two.

## Posts

### Post 1 · Image 3 · Something is stirring

**Image:** `export/4x5/03-stirring.jpg`

```text
Look closer.

Not everything that sleeps stays asleep.
```

**Follow-up reply:**

```text
What do you see in there? Wrong answers welcome.
```

### Post 2 · Image 1 · The Awakening

**Image:** `export/4x5/01-awakening.jpg`

```text
It was never gone. Only sleeping.

Solanites.
```

**Follow-up reply:**

```text
First word that comes to mind when you see it?
```

### Post 3 · Image 4 · Fire is only the beginning

**Image:** `export/4x5/04-fire-beginning.jpg`

```text
Burn. Fall. Rise again.

Brighter every time.
```

**Follow-up reply:**

```text
Gold feathers, the halo, or the violet lightning: what caught your eye first?
```

### Post 4 · Image 2 · Which creature would you hatch?

**Image:** `export/4x5/02-which-creature.jpg`

```text
Be honest. Which one are you hatching?

🔥 Phoenix
⚡ Something rare
👁️ The unknown
```

**Follow-up reply:**

```text
Drop 1, 2 or 3 below. Bonus points if you tell us why.
```

### Post 5 · Image 5 · What makes a creature legendary?

**Image:** `export/4x5/05-legendary.jpg`

```text
Some creatures get remembered. Most don't.

What makes the difference?
```

**Follow-up reply:**

```text
Design, rarity, power or mystery. Pick one and defend it.
```

### Post 6 · Image 6 · The story is taking shape

**Image:** `export/4x5/06-taking-shape.jpg`

```text
The pieces are coming together.

Stay close. The reveal is coming.
```

**Follow-up reply:**

```text
Before we show you anything: what do you think Solanites is? Best guesses get a reply.
```

### Post 7 · Image 7 · Holder distribution

**Image:** `export/4x5/07-holder-distribution.jpg`

Post it only while the site's holder distribution page still says the same thing. Every line on the image is taken from that page (`src/app/claims/page.tsx` on `main`, `5e9952a`). It doesn't state an amount, a launch time or eligibility rules, because the page marks all three as pending.

```text
The locked developer supply goes back to holders.

Split equally, two hours after launch. Who's eligible and how much will be published on the site.
```

**Follow-up reply:**

```text
Questions about how it'll work? Drop them below.
```

## Claims check

The captions contain no numbers, odds, prices, dates or features. The few facts they lean on are in the current code:

- The Phoenix is a real species in the catalogue (`src/lib/species.ts`, "Phoenix of the Golden Pyre").
- Creatures hatch from eggs (`src/components/hatchery/`, `src/app/api/eggs/[id]/hatch/route.ts`).
- Legendary is a real rarity tier, and rarer, classified tiers exist above it (`src/lib/rarity.ts`), so "Something rare" and "The unknown" are honest without naming them.

## Sources

- `source/phoenix-still.png`: the Runway reference still the Phoenix intro and the earlier campaign were built from (originally on the `phoenix-intro` branch as `art/intro/phoenix-still.png`). Used by images 1, 2, 3, 5 and 6.
- `source/rebirth-frame.png`: the frame at 6.0 s of the existing rebirth clip (`art/intro/clip-2-rebirth.mp4` on `phoenix-intro`), extracted with `ffmpeg -ss 6.0 -i clip-2-rebirth.mp4 -frames:v 1`. Used by image 4.
- Logo mark: same paths and gradient as `src/components/layout/Logo.tsx`.
- Fonts: Unbounded, Inter and JetBrains Mono, the site's own fonts (the same Fontsource packages in `package.json`, SIL Open Font License).

No new footage or images were generated and no Runway credits were used.

## Re-rendering

```bash
node campaign/x-teasers/build/render.mjs           # all six, both ratios
node campaign/x-teasers/build/render.mjs 4 4x5     # one teaser, one ratio
node campaign/x-teasers/build/check.mjs            # guardrails only
```

Needs `python3` with Pillow and Playwright's Chromium. `render.mjs` refuses to render if the template or this pack contains a link, address, date, or token or financial wording, and fails if any rendered image shows text other than its approved copy (`APPROVED` in `build/check.mjs`). To change an image's words, edit `teasers.html` and `APPROVED` together.
