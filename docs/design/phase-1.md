# Phase 1: Phoenix key art, unified direction, Mossling studies

Status: **network blocker resolved and downloads verified (§1.3). Phoenix generation not started; 0 of 180 credits spent. Waiting for explicit approval of the single 20-credit 16:9 test.**

---

## 1. Phoenix key art

### 1.1 Cost and availability (checked before any generation)
| Question | Answer | Source |
|---|---|---|
| Credit balance | 1,935 (1,635 plan + 300 purchased) | Runway account, checked today |
| Model | Nano Banana Pro (the model that made the current phoenix, so the gold material stays consistent) | Available in this workspace; no deprecation notice |
| Cost of one 2K still | **20 credits** | This account's recorded charge for the same model and size (`docs/phoenix-intro.md`, "from this account's actual charges"). Runway's tools do not publish a price list, so the first generation will be verified by reading the balance before and after |
| Native 2K output | 2752 × 1536 (16:9), 1536 × 2752 (9:16) | Model output sizes; consistent with the existing 2000 × 1116 file (same 1.792 ratio) |
| Native 4K | **Offered** by Runway for this model (`imageSize: 4K`), but **its price is not confirmed**. Under your rule (no single image over 20 credits) **4K is excluded from this phase** until its price is confirmed |
| Native 9:16 | Supported by the model. If Runway rejects the ratio, the request fails before any charge |

### 1.2 Planned batch (ceiling 180 credits)
| # | Output | Credits | Runs |
|---|---|---|---|
| 1 | 16:9 test, 2K, one image | 20 | **Only this one, then stop and report** |
| 2 | 9:16 native mobile, 2K, same design | 20 | Only after you approve #1 |
| 3–4 | Up to two 16:9 revisions if #1 misses a check | 40 | Only after you approve |
| | **Worst case for the phase** | **80** | Leaves 100 in reserve under the 180 ceiling |

No reference image is passed, so the price stays the plain text-to-image rate. Continuity with the intro video comes from the prompt's material description. If you want the new key art to match the intro video's bird exactly, the intro would be re-cut later; that is not part of this phase.

### 1.3 Network: resolved and verified
**History.** This session's network policy blocked Runway's file hosts, so generated images could not be downloaded or inspected. No generation was attempted while blocked.

**Current state (checked after the environment update):**
| Check | Result |
|---|---|
| Environment this session uses | `env_01Aq4r7HxjuNMJZ2xaVKohrb`, named **Default** (the only environment on the account) |
| Updated network policy applied to this session? | **Yes.** `dnznrvs05pmza.cloudfront.net` and `d2jqrm6oza8nb6.cloudfront.net` now reach CloudFront (unsigned requests get CloudFront's own 401; before the change the proxy refused the connection with 403). No new proxy denials since the change |
| Fresh session needed? | **No.** This session is already on the updated Default environment |
| Existing V-A concept (Runway task `d966d96d…`) retrievable? | **Yes.** Downloaded and inspected: 1024 × 1024 PNG, 993 KB, renders correctly |
| Phoenix output path retrievable? | **Yes.** The original phoenix still (task `47944db5…`, same model and same host a new phoenix would use) downloaded: **2752 × 1536** PNG, 6.2 MB. It is the same image as the repo's 2000 × 1116 copy (downscaled) |
| Credit balance before any phoenix test | 1,935 |

**The original at full size still fails the composition checks** (QA script): 3.0% clipped highlights and 16.1% mean luminance in the headline zone. Recovering it fixes resolution only, which supports regenerating rather than just swapping in the larger file.

**Price evidence for one image.** Two records from this account: `docs/phoenix-intro.md` records Nano Banana Pro **2K** stills at 20 credits each, and the creature-studio branch (`docs/creature-studio/decisions.md`) measured a Nano Banana Pro **1K** image at 20 credits by balance difference. Both are consistent with a flat 20 credits for 1K and 2K. The 2K price has not been confirmed by a balance difference in this session; the test will record one (balance before: 1,935).

### 1.4 Prompts (final drafts, not run)

> **Superseded (2026-10-19).** Both prompts below are replaced by the hand-painted 2D prompt in `alignment.md` §3. See `alignment.md`.
**16:9 desktop (test #1):**
> Premium fantasy game key art, 16:9. A colossal phoenix of hammered molten gold in a three-quarter view, its body on the right third of the frame, turning its head to look toward the left of frame. Its head sits at the upper right third. The near wing rises high and to the right, cropped by the top edge. The far wing sweeps down and left and dissolves into darkness before the middle of the frame. Each feather is a distinct hammered-gold blade with a visible shaft and vanes; flame licks only along the feather edges. The eyes are white-gold with a defined iris and a narrow dark pupil, fierce and intelligent, not blown out. A thin glowing gold halo ring floats above the head. Three long tail plumes curve down to the right. One warm key light from the upper left, a thin violet rim light behind the silhouette, a deep black void. The left 40% of the frame is almost empty: near-black, a faint wisp of smoke, two or three small out-of-focus embers. Controlled highlights with no clipped areas, filmic contrast, extreme fine detail. No lightning, no lens flare, no glow haze, no text, no logo.

**9:16 mobile (#2, only after approval):**
> Premium fantasy game key art, vertical 9:16. The same colossal phoenix of hammered molten gold, seen from slightly below, filling the upper 55% of the frame: head at the upper third, facing slightly left, wings raised in a tall V and cropped by the top corners, tail plumes curving down to a faint horizon line at 55% of the frame height. Below the horizon the lower 45% is dark obsidian ground with only a soft warm reflection, left clean for a headline. Hammered-gold feathers with visible shafts and vanes, flame only at the feather edges, defined white-gold eyes with narrow pupils, a thin gold halo. Warm key light from the upper left, thin violet rim light, deep black void. Controlled highlights, no clipping, extreme fine detail. No lightning, no lens flare, no glow haze, no text, no logo.

### 1.5 How each image will be judged (free, automatic)
`docs/design/tools/phoenix_qa.py` measures and renders, with no browser and no credits:

| Check | Pass | Current still (baseline) |
|---|---|---|
| Native size (16:9) | ≥ 1920 × 1080 | 2000 × 1116 ✔ (16:9 crop 1984 × 1116; 3% headroom) |
| Clipped highlights | < 0.5% of pixels | **2.28% ✘** |
| Headline zone, mean luminance | < 8% (left 40%, or lower 45% on 9:16) | **15.7% ✘** (95th percentile 61%) |
| Face detail | readable feathers and eye at 100% (crop saved for review) | soft, eyes clipped ✘ |
| Mobile crops | 390 × 844 and 360 × 780 at two focus points | saved as images |
| Desktop crops | 1440 × 900 and 1920 × 1080 with the headline zone outlined | saved as images |

The 48px silhouette test does not apply to the phoenix photograph. It applies to the sigil (already passing) and to creature stages (§3).

Note: an earlier version of `art-direction-v2.md` said the current still fell short of 1920 × 1080. That was wrong; it meets it with 3% to spare. Its problems are the site's 1.25–1.87× enlargement, clipping, the busy headline zone and the soft face.

---

## 2. One direction: The Celestial Atlas

> **Superseded (2026-10-19).** "The Eclipse Vigil" turned out to be the website session's unified-direction page, not v1. It stays an informal description; the working name is The Celestial Atlas. Creature style rules come from the Creature Studio art bible. See `alignment.md`.
"The Eclipse Vigil" does not appear in the repository or in either of my documents. I have taken it to mean the v1 direction (its eclipse lighting and its Vigil ring and loader). The two now merge into one system with **one name, The Celestial Atlas**, and three rules:

| Rule | What it governs | Comes from |
|---|---|---|
| **Eclipse light** | Every lit subject has a warm gold key light from the upper left and a thin violet corona behind it. No other glow. | v1 lighting + eclipse palette |
| **The Vigil** | Time and progress are drawn as the 12-tick celestial ring: incubation progress, loaders, the hatch charge. | v1 Vigil loader + sigil ring |
| **The Atlas** | All ornament is restrained gold engraving; every species has a constellation; the world sits on the Threshold horizon. | v2 |

**Kept:** obsidian/firelight palette, Cormorant/Inter type, sigil, plates with the engraved double rule, constellations (including classified = stars only), the Threshold, the hatch reveal "stars first", embers only from real fire (phoenix, Pyraurum, hatch).

**Cut, to avoid competing systems:**
- *The Aperture* (egg-shaped vignette) as a separate device. The hero uses an ordinary soft vignette; the egg shape lives only in the sigil.
- *Pedestals* under eggs. Eggs stand on the Threshold with a contact shadow; one ground system, not two.
- *Light cones* as a separate effect. They are the eclipse key light, drawn once.
- *The lantern* everywhere. It stays only on the hero and the Atlas (Collection) header, desktop only.
- *Rarity glow.* Rarity is shown by badge colour and the plate's hairline only.

---

## 3. Mossling studies (Common · Verdant)

> **Superseded (2026-10-19).** These studies conflict with the agreed Mossling identity (they drop the antlers and turn the moss bed into a stone shell). Use `docs/creature-studio/prototypes/mossling.md` instead. The SVG files are kept only as a record. See `alignment.md`.
**Concept studies only. No final renders are commissioned; the ~200-credit prototype needs a separate review and approval.** Duskwing and Pyraurum are later candidates and have not been started.

Files: `docs/design/mossling/stage-{1..4}.svg` (silhouettes) and `docs/design/mossling/expression-{1..4}.svg`.

**Idea:** a mossy boulder that learns to walk. **Personality:** patient, sleepy, quietly protective. It never hurries; its expressions move from asleep to ancient calm, never to excitement.

| Stage | Height in frame | Silhouette | Pose and anatomy | Expression | Signature trait (sprout) |
|---|---|---|---|---|---|
| I Eggling | 38% | low dome | curled asleep, head tucked, tail wrapped round | asleep | two leaves |
| II Hatchling | 55% | big head on small body | toddler proportions (head ≈ body), stubby legs | one eye half-open | three leaves, taller |
| III Evolved | 75% | long low rectangle | boulder body, columnar legs, moss mane, head carried low and forward | steady, heavy lids, brow ridge | a sapling |
| IV Ascended | 92% | T: wide shell + tree | ancient grove-tortoise; plated stone shell, roots over the shell, hanging moss | ancient calm, moss brows | a full canopy tree |

**48px test:** each stage is identifiable in solid black at 48px. Each changes at least two of proportion, primary shape, pose and limb count. The current Mossling fails this: stages I–III are one shape.

**Next, only with approval:** a single 2K evolution sheet from these studies (about 20 credits) to check the style on one image, before any per-stage renders.
