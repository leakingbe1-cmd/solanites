> **OUTDATED ODDS (21 Oct):** the odds in this file (60/25/10/3.8/1/0.2) are old. The live odds are 40/30/17/8/3.5/1.5. Do not post them; replace before use.

# Solanites campaign library

This folder holds every Solanites promotional asset found across the repository's campaign branches. Each file is a byte-identical copy of its original. [`MANIFEST.md`](MANIFEST.md) lists every file with its source branch and path, format, status and restrictions.

> **Prelaunch rules apply to everything here.** No website or preview URL, contract address, launch date, token amounts or holder-reward terms. Present no feature as live until it has been verified in production. Full rules: [`plans/prelaunch-rules.md`](plans/prelaunch-rules.md).

**Status key:** ✅ **approved**: passed the prelaunch checks; still needs your final sign-off before posting · ⚠️ **needs review**: kept in a `needs-review/` subfolder; do not post until the issue in the manifest is resolved · ⛔ **do not publish**: not copied here.

## 1. Directory

| Folder | What's inside |
|---|---|
| [`ads/`](ads/) | Finished video adverts. All current cuts are in [`ads/needs-review/`](ads/needs-review/) |
| [`posters/`](posters/) | Posters and static promotional artwork |
| [`social/x/graphics/`](social/x/graphics/) | X teasers, X post 01, gameplay infographics |
| [`social/x/copy/`](social/x/copy/) | Captions, replies, alt text, posting orders, content packs |
| [`end-cards/`](end-cards/) | Video end cards and calls to action |
| [`videos/source/`](videos/source/) | Original Runway source footage (internal) |
| [`brand/`](brand/) | Logo mark, wordmark, Phoenix key art, brand fonts |
| [`plans/`](plans/) | Prelaunch rules, campaign brief, footage production notes |
| [`tooling/`](tooling/) | How to regenerate assets (Content Studio and render scripts, documented, not copied) |
| [`archive/`](archive/) | Superseded assets (reference only) |
| [`MANIFEST.md`](MANIFEST.md) | Master list: every file, source, format, status, restrictions |

## 2. Best ready-to-review creatives

1. **X teasers, 4:5 set:** [`social/x/graphics/teasers/4x5/`](social/x/graphics/teasers/4x5/). Six mood teasers with no claims at all. These are the safest first posts.
2. **X post 01, "Which creature would you hatch?":** [`social/x/graphics/x-post-01/solanites-x-post-01-4x5.jpg`](social/x/graphics/x-post-01/solanites-x-post-01-4x5.jpg). Caption, alt text and reply are ready.
3. **Gameplay infographics:** [`x-04-rarity-16x9.jpg`](social/x/graphics/infographics/x-04-rarity-16x9.jpg) and [`x-03-collection-16x9.jpg`](social/x/graphics/infographics/x-03-collection-16x9.jpg). All figures are checked against the game config.
4. **Video advert (after review):** [`ads/needs-review/phoenix-studio-cut/`](ads/needs-review/phoenix-studio-cut/). The strongest edit, in four ratios. Only its closing "ENTER THE HATCHERY" button needs your decision.

## 3. Approved assets (exact paths)

**X teasers** (1440×1800 4:5 and 1440×1440 1:1, JPEG)

| # | Teaser | 4:5 (use on X) | 1:1 (square placements) |
|---|---|---|---|
| 1 | The Awakening | `campaigns/social/x/graphics/teasers/4x5/01-awakening.jpg` | `campaigns/social/x/graphics/teasers/1x1/01-awakening.jpg` |
| 2 | Which creature would you hatch? | `campaigns/social/x/graphics/teasers/4x5/02-which-creature.jpg` | `campaigns/social/x/graphics/teasers/1x1/02-which-creature.jpg` |
| 3 | Something is stirring | `campaigns/social/x/graphics/teasers/4x5/03-stirring.jpg` | `campaigns/social/x/graphics/teasers/1x1/03-stirring.jpg` |
| 4 | Fire is only the beginning | `campaigns/social/x/graphics/teasers/4x5/04-fire-beginning.jpg` | `campaigns/social/x/graphics/teasers/1x1/04-fire-beginning.jpg` |
| 5 | What makes a creature legendary? | `campaigns/social/x/graphics/teasers/4x5/05-legendary.jpg` | `campaigns/social/x/graphics/teasers/1x1/05-legendary.jpg` |
| 6 | The story is taking shape | `campaigns/social/x/graphics/teasers/4x5/06-taking-shape.jpg` | `campaigns/social/x/graphics/teasers/1x1/06-taking-shape.jpg` |

**X post 01** (the first launch-teaser creative)
- `campaigns/social/x/graphics/x-post-01/solanites-x-post-01-4x5.jpg` (1440×1800, recommended)
- `campaigns/social/x/graphics/x-post-01/solanites-x-post-01-1x1.jpg` (1440×1440)

**Gameplay infographics** (1600×900, 16:9)
- `campaigns/social/x/graphics/infographics/x-01-phoenix-reveal-16x9.jpg`
- `campaigns/social/x/graphics/infographics/x-02-hatchery-16x9.jpg` (image approved; its original caption needs review)
- `campaigns/social/x/graphics/infographics/x-03-collection-16x9.jpg`
- `campaigns/social/x/graphics/infographics/x-04-rarity-16x9.jpg`
- `campaigns/social/x/graphics/infographics/x-07-community-16x9.jpg`

**Static artwork**
- `campaigns/posters/solanites-still-six-bloodlines-4x5.jpg` (1080×1350)
- `campaigns/posters/solanites-still-incubation-9x16.jpg` (1080×1920, story format)

**End cards** (transparent PNG layers for video edits: "THE HATCHING BEGINS SOON · FOLLOW FOR LAUNCH UPDATES")
- `campaigns/end-cards/prelaunch/endcard-hatching-begins-soon-16x9.png` (1920×1080)
- `campaigns/end-cards/prelaunch/endcard-hatching-begins-soon-9x16.png` (1080×1920)
- `campaigns/end-cards/prelaunch/endcard-hatching-begins-soon-1x1.png` (1080×1080)

**Brand**
- `campaigns/brand/logo/solanites-logo-mark.svg` (vector, from the site's `Logo.tsx`)
- `campaigns/brand/wordmark/solanites-wordmark-16x9.png`, `campaigns/brand/wordmark/solanites-wordmark-9x16.png` (transparent)
- `campaigns/brand/phoenix-key-art-16x9.png` (2000×1116, Runway Phoenix reference still)
- `campaigns/brand/fonts/` (Unbounded, Inter, JetBrains Mono, with `LICENSE-OFL.txt`)

**Copy:** [`social/x/copy/x-teasers-content-pack.md`](social/x/copy/x-teasers-content-pack.md) and [`social/x/copy/x-post-01.md`](social/x/copy/x-post-01.md). Paths inside those packs refer to their original branches; use the paths on this page.

## 4. Captions and alt text for each social graphic

Captions are verbatim from the source packs. Alt text marked *draft* is new: the source packs had none, so I wrote a plain description of each image. Approve it along with the post.

### X post 01: Which creature would you hatch?
**Caption:**
```text
Every legend starts somewhere. 🐦‍🔥

28 creatures. One world. Your story hasn't begun yet.

When your egg hatches, what are you hoping for?

🔥 A Phoenix
⚡ Something rare
👁️ The unknown

Reply with your pick 👇

SOLANITES. The beginning is near.
```
**Reply:** `Be honest: are you chasing rarity, or picking the creature that looks the coolest?`
**Alt text:** SOLANITES. Which creature would you hatch? Three choices: Phoenix, a golden fire bird with a halo; Something rare, violet lightning over flame; The unknown, a dark silhouette with a question mark. Reply with your pick.

### Teaser 1: The Awakening
**Caption:**
```text
It was never gone. Only sleeping.

Solanites.
```
**Reply:** `First word that comes to mind when you see it?`
**Alt text (draft):** A golden phoenix made of fire with a glowing halo spreads its wings against a dark starry sky. Text: Every legend starts with an awakening. Solanites.

### Teaser 2: Which creature would you hatch?
**Caption:**
```text
Be honest. Which one are you hatching?

🔥 Phoenix
⚡ Something rare
👁️ The unknown
```
**Reply:** `Drop 1, 2 or 3 below. Bonus points if you tell us why.`
**Alt text (draft):** A fiery golden phoenix above three dark cards labelled Phoenix, Something rare and The unknown. Text: Which creature would you hatch? Solanites.

### Teaser 3: Something is stirring
**Caption:**
```text
Look closer.

Not everything that sleeps stays asleep.
```
**Reply:** `What do you see in there? Wrong answers welcome.`
**Alt text (draft):** Near-total darkness with the faint outline of a winged creature and two glowing eyes. Text: Something is stirring in the darkness. Solanites.

### Teaser 4: Fire is only the beginning
**Caption:**
```text
Burn. Fall. Rise again.

Brighter every time.
```
**Reply:** `Gold feathers, the halo, or the violet lightning: what caught your eye first?`
**Alt text (draft):** A golden phoenix bursting through a blazing ring of fire with flickers of violet lightning. Text: Fire is only the beginning. Solanites.

### Teaser 5: What makes a creature legendary?
**Caption:**
```text
Some creatures get remembered. Most don't.

What makes the difference?
```
**Reply:** `Design, rarity, power or mystery. Pick one and defend it.`
**Alt text (draft):** A haloed fire phoenix above four tiles labelled Design, Rarity, Power and Mystery. Text: What makes a creature legendary? Solanites.

### Teaser 6: The story is taking shape
**Caption:**
```text
The pieces are coming together.

Stay close. The reveal is coming.
```
**Reply:** `Before we show you anything: what do you think Solanites is? Best guesses get a reply.`
**Alt text (draft):** A phoenix half-hidden in drifting smoke above the Solanites logo. Text: Solanites. The story is taking shape. Follow for the reveal.

### Infographic x-01: The Phoenix rises
**Caption** (studio pack post 1):
```text
This is the face of Solanites.

Pyraurum, Phoenix of the Golden Pyre. One of 6 Legendary species waiting inside the eggs.

It burns, falls, and rises again. Brighter every time.
```
**Alt text (draft):** A golden fire phoenix with a halo and raised wings. Text: Pyraurum, Legendary, Ember. The Phoenix rises. Phoenix of the Golden Pyre, one of 6 Legendary species. Solanites.

### Infographic x-02: Watch it come alive
**Caption:** ⚠️ needs a new caption. The original (studio pack post 2) says "Every 1,000,000 $SLNT you hold backs one egg" and "No wallet connection needed", which depend on egg tracking being live in production.
**Alt text (draft):** A fire phoenix beside a four-step egg timeline: Dormant, Awakening, Stirring, Ready to hatch, then Eggling, Hatchling, Evolved, Ascended. Text: Watch it come alive. Solanites.

### Infographic x-03: 28 species to discover
**Caption** (studio pack post 3):
```text
28 species. 13 elements. 4 forms each.

From Mossling to Pyraurum, every Solanite has its own body plan and original art.

4 Mythic and 2 Secret species stay classified until someone hatches one.

How many can you find?
```
**Alt text (draft):** A fire phoenix beside 13 element tags: Verdant, Tidal, Lumen, Frost, Storm, Shadow, Crystal, Ember, Aether, Solar, Nebula, Void, Prism. Text: 28 species to discover. 4 forms each. Some still classified. Solanites.

### Infographic x-04: 6 rarity tiers
**Caption** (studio pack post 4):
```text
6 bloodlines:

Common 60%
Rare 25%
Epic 10%
Legendary 3.8%
Mythic 1%
Secret 0.2%

Each egg's rarity is sealed when it's earned and revealed when it hatches. Those are the published odds, and no outcome is guaranteed.
```
**Alt text (draft):** A fire phoenix beside a list of six rarity tiers and their odds: Common 60%, Rare 25%, Epic 10%, Legendary 3.8%, Mythic 1%, Secret 0.2%. Mythic and Secret are marked classified. Solanites.

### Infographic x-07: What will you name it?
**Caption** (studio pack post 7):
```text
You can name every Solanite you hatch.

What's the first name going on yours?
```
**Optional poll reply:** Legendary / Mythic / Secret / Whatever hatches
**Alt text (draft):** A fire phoenix with a halo and open wings. Text: Community. What will you name it? Every creature you hatch can carry its own name. Reply with yours. Solanites.

## 5. Video formats and resolutions

| Advert | 16:9 | 9:16 | 1:1 | 4:5 | Length | Status |
|---|---|---|---|---|---|---|
| Phoenix, Content Studio cut ([folder](ads/needs-review/phoenix-studio-cut/)) | 1920×1080 | 1080×1920 | 1080×1080 | 1080×1350 | 11.6 s | ⚠️ "ENTER THE HATCHERY" CTA |
| Phoenix, prelaunch promo ([folder](ads/needs-review/phoenix-prelaunch-promo/)) | 1920×1080 | 1080×1920 | 1080×1080 | not made | 17.75 s | ⚠️ "1 egg per 1,000,000 $SLNT, earned by holding" claim; weak 9:16 framing |

All adverts are H.264 + AAC MP4 at 24 fps and read with the sound off. Source footage: [`videos/source/`](videos/source/), with clip 1 (5.1 s) and clip 2 (10.1 s), both 1280×720.

## 6. Recommended posting sequence

All of phase 1 is approved. Post one a day, or every other day while replies are still coming in.

| Day | Post | Image |
|---|---|---|
| 1 | Teaser 3, Something is stirring | `teasers/4x5/03-stirring.jpg` |
| 2 | Teaser 1, The Awakening | `teasers/4x5/01-awakening.jpg` |
| 3 | Teaser 4, Fire is only the beginning | `teasers/4x5/04-fire-beginning.jpg` |
| 4 | X post 01, Which creature would you hatch? | `x-post-01/solanites-x-post-01-4x5.jpg` |
| 5 | Teaser 5, What makes a creature legendary? | `teasers/4x5/05-legendary.jpg` |
| 6 | Teaser 6, The story is taking shape (pin it) | `teasers/4x5/06-taking-shape.jpg` |

X post 01 and teaser 2 ask the same question, so **post only one of them**. X post 01 is used above because it comes with finished alt text. To swap, use teaser 2 on day 4.

**Phase 2, the explainers** (approved images, for when you are ready to reveal gameplay): x-01 Phoenix reveal → x-03 Collection → x-04 Rarity → x-07 Community. Hold the video adverts, x-02, x-08 and the posters until their review items are cleared.

## 7. Campaign status

| Campaign | Source branch | Status |
|---|---|---|
| X teasers (six images, two ratios) | `campaign/x-teasers` | ✅ Approved, ready for your sign-off |
| X post 01 | `prelaunch-phoenix` | ✅ Approved, ready for your sign-off |
| Phoenix Content Studio campaign | `campaign/phoenix-content-studio` | ◑ Partly approved: 5 infographics and 2 statics approved; 4 adverts, 4 end cards, 2 stills, x-08 and the content pack need review |
| Phoenix prelaunch promo (videos and poster) | `prelaunch-phoenix` | ⚠️ Needs review (egg-holding claim, 9:16 framing) |
| X starter pack (10 posts) | `prelaunch-phoenix` | ⚠️ Needs review: posts 2, 3 and 10 must wait for live tracking or published terms |
| Original Phoenix promo | `phoenix-intro` | ⛔ Do not publish (shows the private URL; superseded by the prelaunch promo) |
| `x-campaign` | not on GitHub | ❓ Not inspected. The branch is not on the remote and no Git bundle was available |

## 8. Regenerating assets

Scripts stay on their source branches. [`tooling/README.md`](tooling/README.md) has every command, with its branch and requirements. The short version:

```bash
git switch campaign/phoenix-content-studio && npm run campaign:render   # adverts, stills, content pack
git switch campaign/x-teasers && node campaign/x-teasers/build/render.mjs  # six teasers, both ratios
git switch prelaunch-phoenix && node scripts/x-post-01.mjs               # X post 01
git switch prelaunch-phoenix && scripts/promo-assets.sh                  # prelaunch promo videos and poster
```

Copy new renders here under new filenames, update `MANIFEST.md`, and move replaced files to `archive/`.

## 9. Missing assets and items awaiting approval

**Waiting for your decision**
- The "ENTER THE HATCHERY" CTA on the Content Studio adverts, end cards and x-08. Approve it, or re-render with "THE HATCHING BEGINS SOON".
- Egg-holding claims ("Hold $SLNT", "1 egg per 1,000,000 $SLNT, earned by holding", "eggs arrive on their own") on both posters, the square still and the prelaunch promo videos. They match the game config but are not verified as live in production.
- "Genesis Hatchery · Season 0" on the new-world poster: confirm it doesn't imply a launch event you haven't announced.
- The studio content pack (posts 2, 5, 6, 8) and the starter pack (posts 1, 2, 3, 10).
- The *draft* alt text in section 4.
- Final sign-off on every ✅ asset before posting.

**Missing**
- Everything on the `x-campaign` branch, which was not accessible.
- Final creature artwork. The masters are git-ignored and none is in the repository; only design references exist, in [`docs/creature-art/`](../docs/creature-art/) on `main`.
- A 4:5 cut of the prelaunch promo video, and a better-framed 9:16 cut.
- A caption for infographic x-02 that makes no live-tracking claims.
- The 1080p intro masters (`art/intro/master-*.mp4`), which were never committed.
- Infographics x-05 and x-06 don't exist: the studio pack uses the end card and the video for those posts.
