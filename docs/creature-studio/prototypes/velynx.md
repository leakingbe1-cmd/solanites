# Prototype 1: Velynx, The Glyphwalker

Legendary · Shadow · dex 25 · catalogued (not classified) · renderer `src/components/creature/species/velynx.tsx` · personality: Confident, Mysterious, Mischievous.

> *"Velynx walks between blocks the way a cat walks along a fence, leaving glowing glyphs where its paws have been. It always knows where it is going. It rarely tells you."*

Original references: [`../baseline/legendary.webp`](../baseline/legendary.webp) (Velynx row), `docs/creature-art/reference/velynx-inspiration.png`, `creatureDesigns.json → species.velynx`.

## 1. What must remain recognisable

- Upright, slender black feline with **very long swept-back ears** with deep-teal inner ears.
- **Matte charcoal-to-obsidian** body; **teal paw pads**.
- **Cyan glyph circuitry** tracing chest, limbs and tail; violet appears only at Ascended.
- **Violet eyes ringed in turquoise**, knowing half-smile.
- Long **S-curved tail** with a teal leaf-shaped tip.
- Solgem on the **chest**.
- No logo or emblem on the tail (design bible rule; the inspiration image's Solana mark is not carried over).

## 2. What changes, and why

The current vector Velynx is a stack of tubes; from Hatchling to Ascended it mostly gets taller. The inspiration image also sits close to a very famous slender psychic cat creature (upright, big head, long tail with an orb). Velynx needs its own anatomy so it reads as *ours* at a glance.

**New anatomy.** A **fence-walker**: built like a lean caracal or serval crossed with a lemur, not a humanoid cat.
- **Digitigrade hind legs** with a clear reverse ankle and long feet, so it stands on its toes like a cat on a rail.
- **Longer forearms than a cat**, held close and slightly forward, with long fingers (it "writes" glyphs with them).
- Small head relative to the body (Evolved head : body ≈ 1 : 3.6). Narrow waist, deep chest.
- Ears: very long, swept back, with a **notched second point** two-thirds up (an owned shape, like a quill nib). This replaces the plain triangle ears.
- **Cheek tufts** sweep backward, echoing the ears.
- Tail: thicker at the base, tapering to the leaf tip; held in a high S over the back, the tip pointing forward like a question mark.

**Silhouette read:** ears + S-tail make a tall zig-zag. Black-fill test: notched ears and question-mark tail.

## 3. Face and personality

- **Default expression: amused secret.** One brow slightly raised, eyes half-lidded, small closed-mouth smile pulled to one side.
- Slit pupils that widen at Eggling and narrow with age.
- Head tilted 10–15°, eyes on the viewer, body turned three-quarters left. It is looking at you and deciding whether to tell you something.

## 4. Signature details

- **Glyph set.** Velynx's markings are an owned alphabet of 6 glyphs built from right angles, short arcs and dots (like circuit traces bent into runes). The same set appears on every stage, never pseudo-letters. The glyphs follow anatomy: along the sternum, around the shoulders, down the outer forearm and shin, and in rings around the tail.
- **Glyph pawprints.** From Evolved on, one paw rests on a small floating glyph tile, the "fence between blocks". This is the species' story told in one prop.
- Teal leaf tail tip with a single vein.

## 5. Materials, texture, light and colour

- Fur: matte, short; satin sheen only on the key-light side of shoulders and thighs. Painted as dark navy-charcoal (`#14141f` – `#26263a`), never pure black, so the rim light can model the form.
- Rim light: cool teal on the right edge; this is what separates a black creature from a black card.
- Glyphs: cyan `#2ee8d8` emission with a 1–2 px soft core, no bloom beyond 4 px at 1024. Glow budget ≤ 10% of the silhouette.
- Eyes: violet `#9d7bff` iris with turquoise outer ring, one catchlight upper left.
- Palette split: 60% charcoal, 30% deep teal (inner ears, pads, tail tip), 10% cyan glyph light.

## 6. Elemental identity (Shadow)

Shadow in Solanites is **slender, matte and secretive**, lit only by its own markings. Velynx shares this with Duskwing and Nyxara but is the only upright one, the only one with circuitry, and the only teal-cyan Shadow (Duskwing and Nyxara are violet-led).

## 7. Idle animation concept

Tier C (flagship, image-to-video after approval), with a tier A/B fallback.
- **Loop (4 s):** weight shifts from one foot to the other, tail tip curls and uncurls, ears flick independently, slow blink with the half-smile, and the glyphs light up in sequence from chest to tail as if a message runs through them.
- **Browser fallback:** separated layers for ears, tail and glyph mask: ear flick (rotate), tail sway (rotate around the base), glyph sweep (animated gradient mask), blink (eyelid layer).

## 8. Velynx evolution design sheet

The one rule: **each stage gains one structural idea, and Ascended changes how Velynx relates to the world, not just how much it glows.**

| | Eggling | Hatchling | Evolved | Ascended |
|---|---|---|---|---|
| Stance | sits upright on its haunches like a kitten, torso vertical, tail wrapped round its feet | stands upright on its hind legs, forepaws raised in curiosity (never on all fours) | fully upright, digitigrade, weight on one leg | upright, **mid-step on a line of glyph tiles**, one foot raised: the Glyphwalker walking between blocks |
| Head : body | 1 : 1.7 | 1 : 2.5 | 1 : 3.6 | 1 : 4 |
| Ears | short, round, folded; notch only a bump | pointed, the notch appears | long, swept back, notched | longer; the notched second point becomes a **separate thin fin of light-catching membrane** along the ear's back edge |
| Eyes | huge, round pupils, wide-eyed curiosity | large, pupils start to slit | almond, slit pupils, half-lidded | same eyes, turquoise ring now faintly emissive |
| Glyphs | 3 dots on the chest only | dots join into first lines on chest and forearms | full 6-glyph circuit on chest, limbs and tail rings | glyphs **lift off the body**: a few float as a loose collar around the shoulders and along the tail; violet traces join the cyan |
| Tail | short, chubby, teal tip as a bud | longer, curls, tip a small leaf | high S-curve, leaf tip | S-curve with **two fin-like vanes** near the tip; floating glyph rings around it |
| Prop | none | none | one glyph tile under one paw | a short path of three glyph tiles |
| Personality beat | curious | eager show-off | confident | composed, knows something you don't |

**Continuity anchors (unchanged across all four):** charcoal body, teal pads and inner ears, violet-and-turquoise eyes, chest Solgem, teal leaf tail tip, the same glyph alphabet.

The sheet itself is assembled from the four approved stage images as a single board (stages in a row, silhouettes beneath, anchor callouts), saved as `docs/creature-studio/prototypes/velynx-evolution-sheet.webp`.

## 9. Generation prompts

> **Canon (2026-10-19):** Velynx is always upright and bipedal. V-A (`art/creature-studio/round-1/velynx-A-fence-walker.png`) is a **rendering reference only** (paint handling, face, leaf tail), never an anatomy or posture template. Two generations that said only "upright digitigrade" came out on all fours (V-A and `fb118638`), so prompts must use the explicit two-legged wording below. References for any approved generation: the shipped Evolved render tagged `@pose` ("match the upright two-legged stance of @pose") and V-A tagged `@finish` ("paint handling only, not pose or anatomy").

Shared style block (all three prototypes; from art bible §2, §5–§7, §10):

> Hand-painted 2D creature illustration for a premium creature-collecting game. Clean, graphic silhouette; coloured linework (darkest local colour, never black) that thins where the light hits; soft painted volume in three values with subtle controlled brush texture. Warm gold key light (#FFE2A8) from the upper left; a restrained violet rim light from behind that clearly outlines the back and outer edges against the dark background. Three-quarter view facing left, camera at the creature's eye level. Full body centred in the frame at the stage's framing target (canon C13: 45% / 60% / 78% / 88%). Transparent background (flat #07060d for review). No ground, no shadow, no horizon, no halo, no light rays, no sparkles, no particles, no lightning, no text, no logo, no frame.

Negative: not 3D render, not anime, not chibi mascot, no extra limbs, no pseudo-text, no jewellery or armour, no resemblance to existing franchise creatures.

Per stage (append to the style block; reference images: Velynx baseline row + inspiration):

1. **Eggling.** A small charcoal kitten-like creature sitting on its haunches with its short tail wrapped around its teal-padded feet. Short round folded ears with deep-teal insides, oversized violet eyes ringed in turquoise with round pupils, wide-eyed and curious. Three tiny cyan dots glow on its chest above a small diamond chest gem. Soft short fur.
2. **Hatchling.** A lean young charcoal feline rearing up on its hind legs out of curiosity, forepaws held up, long fingers. Pointed ears with a small notch two-thirds up, deep-teal inner ears. Large violet eyes with turquoise rings and narrowing slit pupils, eager grin. First thin cyan glyph lines on chest and forearms. Longer curling tail with a small teal leaf tip. Diamond gem on the chest.
3. **Evolved.** A slender feline creature. It stands upright on its two hind legs only: torso vertical, both forelimbs held off the ground, only the hind feet touching anything. Its weight is on one hind leg, its slender hands with four long, articulated fingers are held near the chest, head tilted, half-lidded violet eyes with turquoise rings, amused one-sided smile. Very long swept-back ears with a notched second point and deep-teal insides, pronounced backward-sweeping cheek tufts, and each ear has a clearly visible notch two-thirds of the way up. Charcoal fur painted mid-grey-violet where the warm gold key light hits, never pure black, with a strong violet rim light along its back, ears and tail. Cyan circuit-like glyph markings follow the sternum, shoulders, forearms, shins and ring the tail. High S-curved tail ending in a teal leaf-shaped tip. One hind foot rests on a small floating square cyan glyph tile; the other foot is on nothing. Diamond gem on the chest.
4. **Ascended.** The same slender feline creature. It stands upright on its two hind legs only: torso vertical, both forelimbs held off the ground, only the hind feet touching anything. It is mid-step along a short path of three floating glyph tiles, one foot raised. Extra-long notched ears with a thin translucent fin along the back edge. Composed, knowing expression. Cyan and violet glyphs partly lift off the body and float as a loose collar at the shoulders and as rings around the tail; the tail has two fin-like vanes near its teal leaf tip. Controlled, small glow only on the glyphs. Diamond gem on the chest.
