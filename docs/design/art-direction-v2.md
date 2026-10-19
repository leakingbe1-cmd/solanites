# Solanites Art Direction v2: The Celestial Atlas

This document builds on `creative-direction.md` (v1). v1's palette, type scale, motion tokens, sigil and page structure stay. v2 adds four things:

1. an audit of the phoenix hero asset and a plan to replace it;
2. a more distinctive identity layer, the Celestial Atlas;
3. a creature redesign programme with three prototypes;
4. a labelling rule for the preview, so placeholders are never mistaken for finished work.

Nothing here has been generated with paid tools. Every generation step below is a proposal waiting for approval.

---

## 1. Phoenix hero audit

### 1.1 What exists

| File | Pixels | Format | Notes |
|---|---|---|---|
| `art/intro/phoenix-still.png` | **2000 × 1116** | PNG, 2.4 MB | Highest-resolution copy in the repo. The source for the hero |
| `public/hero/phoenix-2000.jpg` | 2000 × 1116 | JPEG, 353 KB | Re-encode of the PNG (RMS difference ≈ 2.8/255) |
| `public/hero/phoenix-2000.webp` | 2000 × 1116 | WebP, 228 KB | |
| `public/hero/phoenix-1200.webp` | 1200 × 670 | WebP, 96 KB | |
| `public/intro/phoenix-16x9.{mp4,webm}` | 1280 × 720, 24 fps | H.264 / VP9 | The intro video. `art/intro/clip-*.mp4` are also 720p |
| `public/intro/phoenix-*-poster.jpg` | 1280 × 720 / 720 × 1280 | JPEG | |
| Runway task `47944db5…` (not in repo) | very likely **2752 × 1536** | PNG | See 1.2 |

### 1.2 Where the 2000px file came from
`docs/phoenix-intro.md` records the reference still as a Runway "Nano Banana Pro, 16:9, 2K" generation. That model's 2K 16:9 output is 2752 × 1536, an aspect ratio of 1.7917. The repo file's ratio is 2000/1116 = 1.7921. That is the same ratio, not a true 16:9 (which would be 1125 tall). **So the repo copy is almost certainly a downscale of a 2752 × 1536 original that is still in the Runway library.** Runway's task record confirms the 16:9 and 2K settings. I could not download the original to verify its pixels, because this session's network policy blocks Runway's CDN (`dnznrvs05pmza.cloudfront.net`).

The file is **not** an upscale. A detail test (downscale, re-upscale, measure the loss) shows the loss rising steadily from 1.9 at 90% to 5.2 at 50%, so it has real detail at its full size.

### 1.3 What limits its quality

| Limit | Evidence | Impact |
|---|---|---|
| **Barely above the minimum** | A 16:9 crop of 2000 × 1116 is 1984 × 1116, which meets 1920 × 1080 by only 3%. *(Corrected: an earlier version of this table said it fell short; it does not.)* | No headroom: any enlargement drops below native resolution |
| **The site enlarges it** | The hero renders the image at 130% of viewport width on desktop and 230% on phones | The browser upscales it **1.25×** at 1920px, **1.66×** at 2560px, **1.87×** on a 1440px Retina laptop and **1.35×** on a 390px phone at 3× |
| **Soft face** | At 100% the head is a smeared, low-frequency texture. There is no defined feather structure around the eyes or beak | The focal point is the weakest area of the image |
| **Blown eyes and highlights** | 2.3% of pixels are clipped in at least one channel, concentrated in the eyes, crest and wing edges | The eyes read as two white blobs. There is no gaze and no character |
| **Generic flame texture** | The tail and crest are AI "fire noise" (edge energy in the tail is half that of the wings) | Reads as a stock fire effect, not a designed creature |
| **Composition fights the layout** | Symmetrical, centred, wings to both frame edges, subject covers the full width (x 44–1947) | The headline has to sit on a darkened wing. That is why the site scales it to 130% and pushes it right, which costs resolution |
| **Violet lightning** | Thin purple bolts on the left | Reads as an "energy effect" cliché; v1 reserves violet for rim light |

The intro video has the same ceiling (720p). The 1080p masters referenced in `docs/phoenix-intro.md` are not committed.

### 1.4 Recommendation

**A. Free, now (needs your hands, not credits):** download the original of Runway task `47944db5-4b5d-42d2-8db2-44d486b9fc69` from the Runway library and add it to the design branch as `art/key-art/phoenix-2752.png`. Alternatively, allow `dnznrvs05pmza.cloudfront.net` in this environment's network policy and I will fetch it. That gives a genuine 2752 × 1536 master, 1.9× the pixels of what we use now, with no upscaling. It fixes the pixel count but **not** the soft face, the blown eyes or the composition.

**B. Recommended: regenerate the key art for the layout (needs approval for credits).** One new still, composed for the headline, at the highest native resolution Runway offers for the model. Prefer 4K (5504 × 3072) if available; 2K (2752 × 1536) is the floor. A separate native 9:16 still for phones (1536 × 2752 or larger) is generated from the same prompt and reference. It should not be a crop.

Composition brief:
- Three-quarter view, **facing left toward the headline**. The head sits on the upper-right third intersection (x ≈ 66%, y ≈ 30%).
- The near wing rises high and right, out of frame at the top. The far wing sweeps down and left *behind* the copy area and dissolves into darkness, so the copy sits on near-black, not on a darkened wing.
- The left 40% of the frame is clean, deep darkness, with only faint smoke and two or three out-of-focus embers.
- Hammered gold feathers with readable vane and rachis structure on the face and shoulders. Fire happens at the feather *edges*, not as a fill.
- Eyes intensely bright but **defined**: a visible iris shape and a pupil slit, highlights below clipping.
- One warm key light from upper left, a thin violet rim light from behind. No lightning. The thin halo stays, because the sigil quotes it.
- The tail is a few long, deliberate plumes curving down-right. It is not a mass of flame.

Draft prompt (for approval, not run):
> Premium fantasy game key art. A colossal phoenix of hammered molten gold in a three-quarter view, turning its head toward the left of frame, its head at the upper right third. The near wing rises high and to the right, cropped by the top edge. The far wing sweeps down and left into darkness. Each feather is a distinct hammered-gold blade with a visible shaft and vanes; flame licks only at the feather edges. The eyes are white-gold with a defined iris and a narrow pupil, fierce and intelligent, not blown out. A thin glowing gold halo ring above the head. Three long tail plumes curve down to the right. Warm key light from the upper left, a thin violet rim light behind, deep black void, the left 40% of the frame almost empty with soft smoke and a few out-of-focus embers. Controlled highlights, no clipping, filmic contrast, extreme detail, 16:9. No lightning, no text, no logo.

**Approval gate before the hero changes:** a 100% crop of the face must show individual feather structure and a readable eye, highlight clipping must be under 0.5% of pixels, and the left 40% of the frame must keep luminance under 8% (for headline contrast).

**C. Upscaling:** only as a delivery step *from* a native ≥ 2752px master, for example to 3840px for 4K screens. Never as the route to the 1920 × 1080 minimum.

**D. Site change once the new art exists:** render the hero at 100% of viewport width (not 130%), with `srcset` widths of 1280, 1920, 2752 and 3840 (the last only if the master allows it).

---

## 2. The Celestial Atlas (identity layer, v2)

v1 made the site coherent. v2 makes it unmistakable. The reference is no longer "fantasy game" in general. It is a specific object: **a 17th-century celestial atlas (Cellarius, *Harmonia Macrocosmica*) engraved in gold leaf on black lacquer.** Nobody in crypto or creature-collecting looks like this, and it fits "ancient cosmic world" exactly.

The palette, the phoenix and the darkness stay. Four devices are added. Each one does a job.

### 2.1 Gold engraving as the illustration system
All ornament, diagrams and maps are drawn as **engraved line work**: thin gilt strokes (0.75–1px), hatching for shade, and orbit rings with degree marks. This replaces glow as the way the UI looks rich.
- Use it for: section ornaments, the progress ring, the How It Works diagrams, the Rewards timeline, hero overlays (orbit arcs around the phoenix's halo) and empty states.
- Stroke `#e8b75c` at 30–60% opacity. It never animates except when it "draws in" once.

### 2.2 Constellations: every species has a star sign
Each species gets a constellation of 6–8 stars whose outline traces its **Ascended silhouette** (the preview derives them automatically from the current art; final ones follow the redesigned art).
- On every plate, the constellation sits behind the creature at 18% opacity.
- **Classified species show only their constellation**, not a black silhouette with a "?". You see the stars of something you have not met. This turns the mystery into the most beautiful card in the grid.
- Hatch reveal: the constellation draws in star by star (phase 2 "Charge"), then the creature appears inside it.
- The Collection page header can show all 28 constellations as a sky map, lit as you discover each one.

### 2.3 The Threshold
"Between worlds" becomes a literal horizon. Hero, Hatchery and reveal compositions place a **horizon line at 62% of the frame**: cosmos above (cool, violet, stars), obsidian ground below (warm, gold-lit). Creatures and eggs stand *on* the line. The page transition's gold horizon line (v1 §4.3) is the same line, so navigating feels like crossing it.

### 2.4 The lantern (desktop only)
The pointer carries a faint warm light (a 260px radial, `rgba(255,214,140,.07)`) that brightens engraved details beneath it from 8% to 30% opacity. It turns exploring into the interaction: the dark hides things, and your light finds them.
- On touch devices and with reduced motion it is off and engravings sit at a fixed 14%.
- It never affects text contrast, and it is disabled over forms and controls.

### 2.5 Smaller changes
- **Labels:** eyebrows switch from Inter caps to **Cormorant SC** small caps with 0.18em tracking (inscriptional). Inter stays for body text and controls.
- **Atlas voice in metadata:** plates are "Plate XIV", stages are "I–IV", and the Collection is "The Atlas of Solanites", with "Bestiary" kept as the section name.
- **Remove** from v1: nothing structural. The Aperture, pedestals and plates stay. The plate frame gains a constellation watermark.

---

## 3. Creature redesign programme

### 3.1 What is wrong now (silhouette test of the current art)
Rendered in solid black at 150px and 48px (the preview shows the full sheet):
- **Growth by props, not anatomy.** Mossling stages I–III are the same blob; it only gains antlers and then trees. Neonyx I–II are the same.
- **One pose for everything.** Aurelion sits in the same frontal pose in all four stages; only the wing size changes. Most species are dead-centre, straight-on or flat profile.
- **One face for everything.** The shared kit's eye construction gives every species the same round mascot eyes. Consistency became sameness.
- **Symmetry reads as icon.** Duskwing III–IV is a front-view butterfly. At 48px it is an emoji, not a creature.
- **Best of the set:** Pyraurum's stages are distinct and readable, though its Ascended tail reads as roots or tentacles.

The SVG portrait wrapper (v1 §2.7) stays as a **temporary treatment** until replacements exist. It improves lighting, not design.

### 3.2 Rules for the redesign (all species)
1. **Silhouette first.** Every stage must be identifiable in solid black at 48px, and each stage must change at least **two** of: head-to-body proportion, primary shape, pose, appendage count.
2. **One signature trait** persists through all four stages and grows (Mossling's sprout becomes its tree; Duskwing's eyespots open; Pyraurum's ember becomes its halo).
3. **A line of action.** Three-quarter views with a readable gesture. Frontal symmetry only for Mythic "deity" forms.
4. **Species-specific eyes** (shape, lids, pupils). Personality is in the eyes and the posture, not in the accessories.
5. **Scale progression:** Eggling ≈ 40% of frame height, Hatchling 55%, Evolved 75%, Ascended 90%+ (Ascended may break the frame).
6. **Rendering target:** stylised realism, a "collectible sculpture under museum light". Same key light as the phoenix (warm, upper left), violet rim, a contact shadow on a matte obsidian ground. **Not** glowing chibi, **not** flat vector.
7. **Solgem:** one per creature, in a fixed anatomical place per species, growing with stage.
8. **Delivery:** 1024 × 1024 WebP with alpha per stage, ≤ 400 KB, through the existing pipeline (`scripts/creature-art.mjs`, `src/data/creatureAssets.json`). No code change is needed to swap them in.

### 3.3 The three prototypes
Chosen to cover ground, air and fire, and Common, Rare and Legendary. Once approved, these three set the style for the other 25.

**Mossling** (Common · Verdant) · *"A mossy boulder that learns to walk."*
- Personality: patient, sleepy, quietly protective. Heavy-lidded eyes, a slow smile, and it never hurries.
- Signature trait: one sprout on its back that becomes a tree by Ascended.
- Shape language: round → square. Growth is **horizontal and heavy**.
- I Eggling: curled, sleeping stone-ball with a two-leaf sprout; the head is tucked away.
- II Hatchling: toddler proportions (head ≈ body), stubby legs, one eye half-open.
- III Evolved: a low boulder body, columnar legs, a moss mane, the head carried low and forward, the sprout now a sapling.
- IV Ascended: an ancient grove-tortoise. A wide stone shell carries a full canopy tree (T-shaped silhouette); the eyes are calm and old.
- Fixes: drops the pig snout and antlers; growth is in anatomy, not props.

**Duskwing** (Rare · Shadow) · *"The twilight moth that keeps watch."*
- Personality: shy, watchful, nocturnal. Large dark eyes; its feathered antennae droop when it is wary.
- Signature trait: the eyespots on its wings, closed in the cocoon and fully open, glowing faintly, at Ascended.
- Shape language: vertical oval → crescent.
- I Eggling: a silk cocoon hanging from a thread, with eyespot markings closed.
- II Hatchling: a fluffy, round, fledgling moth with oversized eyes and small damp wings.
- III Evolved: in three-quarter flight, with asymmetric wings (near wing large, far wing foreshortened), and two eyespots open.
- IV Ascended: a great luna-moth whose long hind-wing tails curve under the body into a **crescent moon** silhouette, with four eyespots open.
- Fixes: breaks the front-view butterfly icon; gives it a recognisable crescent silhouette.

**Pyraurum** (Legendary · Ember) · *"The Phoenix's ember-child."*
- It must belong to the brand phoenix without copying it: the same hammered-gold feather language, but young, proud and impatient.
- Personality: brave, proud, a little reckless. Sharp brow and narrowed eyes.
- Signature trait: the ember at its tail tip, which becomes its halo at Ascended (consistent with the existing "Ascended gains a halo" rule).
- Shape language: teardrop → triangle → V.
- I Eggling: a teardrop ember-chick with a flame tuft, sitting.
- II Hatchling: an awkward fledgling with long legs, oversized feet, stubby smoking wings and a long neck.
- III Evolved: a sleek firebird in a diving diagonal, wings swept back.
- IV Ascended: wings raised in a V above the head, tail plumes curving into a ring, the halo appearing; a smaller echo of the hero phoenix.
- Fixes: replaces the root-like Ascended tail; aligns the material with the key art.

### 3.4 Production plan (needs approval)
| Step | Output | Estimated Runway credits* |
|---|---|---|
| Phoenix key art, 16:9 (2 variations) plus 9:16 (1) | 3 stills | 60 at 2K; 4K price to confirm first |
| Per prototype: a 4-stage evolution sheet to lock the design (2 variations) | 2 stills | 40 |
| Per prototype: each stage rendered alone on a plain dark ground (2 variations each) | 8 stills | 160 |
| **3 prototypes** | 30 stills | **≈ 600** |
| Background removal to alpha | 12 finals | check price; can be done locally with a free model as a fallback |
| **Total** | | **≈ 660 + any 4K premium** |

\*At the account's recorded rate of 20 credits per 2K still (`docs/phoenix-intro.md`). The plan has 2,250 a month; about 510 were spent on the intro.

Order: phoenix first, which is the highest impact. Then Mossling, to check the style holds on the simplest creature. Then Duskwing and Pyraurum. Stop and review after each.

---

## 4. Labelling rule (preview and any future review page)
Every visual in a review must carry one of these labels:

| Label | Meaning |
|---|---|
| **Existing asset** | Already in the repo, unchanged |
| **Temporary treatment** | Existing asset with a CSS or SVG treatment; not the final answer |
| **Proposed UI** | Built for real in the preview; ready to implement |
| **Concept study** | A shape, proportion or layout study. Not artwork, not final |
| **Not yet made** | Requires generation and approval |
