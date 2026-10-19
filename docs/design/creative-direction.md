# Solanites — Creative Direction & Design System

**Concept: THE WORLD BETWEEN WORLDS.** An ancient cosmic world is waking. The Phoenix is its first light, the Hatchery is its nest, the Collection is its bestiary.

Status: direction for the `release-cinematic-overhaul` implementation. Written against commit `f6d6ed5` plus the in-progress `src/components/brand/Sigil.tsx`. Reference files sit next to this document: `sigil-full.svg`, `sigil-emblem.svg`, `sigil-glyph.svg`, `sigil-mono-bone.svg`, and `sigil-specimen.png` (the sigil rendered at 320–16px).

---

## 0. Diagnosis: why it does not feel premium yet

I rendered every route at 1440px and 390px wide. The site currently speaks three visual languages at once:

| Layer | Current look | Problem |
|---|---|---|
| Hero phoenix (`public/hero/phoenix-*`) | Photoreal gold fire, violet lightning, teal nebula, a halo | This is the only part that feels cinematic. Everything else ignores it. |
| UI chrome (`globals.css`) | Solana purple→cyan→green gradients, Unbounded wide-geometric display font, mono green eyebrows, glass panels, 24px radii | This reads as a generic Solana token landing page. It is the opposite of "ancient". |
| Creatures (`CreatureArt` SVG, `EggArt`) | Bright, flat, cartoon vector creatures on glow blobs | Charming, but lit differently from the phoenix, so they look like they come from another game. |

Specific tells to remove: `.sl-gradient-text` on headlines, the purple-gradient `sl-btn-primary` ("Find my eggs"), `sl-grid`, `ParticleField` on the Hatchery and the CTA, site-wide gold embers drifting over every page, `rounded-3xl` cards with colour blobs behind them, `animate-ping` status dots, and mono text in sol-green on every eyebrow.

**The fix is not more effects.** One light source, one material palette, one type voice and one recurring shape language should run through every route.

---

## 1. Visual direction

### 1.1 The idea in one sentence
*Gold firelight falling on obsidian in the dark between stars.* Everything precious is lit warm from above. Everything unknown recedes into violet shadow.

### 1.2 Four signature devices (these make it recognisably Solanites)

1. **The Phoenix Key Light.** Every scene has one warm light source, high and slightly left (≈ 11 o'clock), as if the Phoenix is above the frame. Creatures, eggs and plates are lit from there, with a cool violet rim light from behind and below. No other lighting is allowed. (Today the creature art glows from inside, the cards glow from behind, and the hero burns. Pick one.)
2. **The Aperture.** An egg-shaped ellipse (ratio 0.62 : 1, taken from the sigil egg) is the frame for anything sacred: the hero phoenix vignette, egg pedestals, creature portraits in the detail view and the hatch reveal. Rectangles are for information. The ovoid is for life.
3. **The Celestial Ring.** The sigil's 12-tick ring is reused as an instrument: it is the progress ring for incubation, the loader, the section divider ornament and the frame for the rarity reveal. Twelve ticks, with the four cardinal ones longer.
4. **The Solgem spark.** A small diamond (◆) is the only element allowed to carry the Solana gradient or rarity colour. It appears in the sigil, rarity badges, eyebrows and bullets. Colour is a spark inside a dark-and-gold world, not a wash over it.

### 1.3 Materials
- **Obsidian:** near-black with a faint warm bias. This is the ground of every page.
- **Gilt:** brushed gold for linework, rules, the sigil and the primary CTA. It is never a large fill except on the one primary button.
- **Bone/vellum:** warm off-white text, like aged paper, never cold blue-white.
- **Eclipse violet:** shadow colour and the rim light. It is atmosphere, not decoration.
- **Ember:** orange-red for heat and the hatch moment only.

### 1.4 Do / don't
| Do | Don't |
|---|---|
| Large areas of pure dark with one lit subject | Even, all-over glow; colour blobs behind every card |
| Hairline (1px) gilt rules and double-rule plate frames | Glass panels with backdrop blur on content cards |
| Serif display type, generous tracking on small caps | Wide geometric display fonts, gradient-filled headlines |
| Embers only where there is fire (phoenix, hatch, ignited egg) | Particles drifting across pages with no source |
| Motion that is light changing (dimming, igniting, unveiling) | Bouncing, scaling cards, ping dots, spinning gradients |
| One gold button per viewport | Several glowing buttons competing |

---

## 2. Design system

### 2.1 Colour tokens
Paste into `globals.css` `@theme` (Tailwind v4). **Keep the old `sol-*` tokens defined during migration** so nothing breaks, but stop using them in new or changed markup (see §8.3).

```css
@theme {
  /* ground */
  --color-void:   #07060a;  /* page background (was #05050a, now warmer) */
  --color-umbra:  #0f0d14;  /* raised surface: cards, plates, panels */
  --color-basalt: #17141d;  /* second raise: inputs, active chip, modal body */
  --color-rim:    rgba(239, 232, 218, 0.09);  /* default 1px border */
  --color-rim-strong: rgba(239, 232, 218, 0.18);

  /* text (contrast measured on --color-void) */
  --color-bone:   #efe8da;  /* primary text  16.6:1 */
  --color-vellum: #bdb3a3;  /* secondary     9.8:1 */
  --color-dust:   #8c8374;  /* tertiary/meta 5.4:1 (AA for body text; don't go dimmer) */

  /* gilt (the brand metal) */
  --color-flare:  #fff1c9;  /* highlight, top of gold gradients */
  --color-gilt:   #e8b75c;  /* brand gold: rules, sigil, links, focus ring  10.9:1 */
  --color-gilt-deep: #a8692a;  /* bottom of gold gradients, pressed state */
  --color-ember:  #f08a3c;  /* heat: hatch, ignited egg, error-adjacent warmth */
  --color-cinder: #9a2f1e;

  /* atmosphere */
  --color-eclipse: #7d5cf0;      /* violet rim light, shadows. NOT for text (4.5:1) */
  --color-eclipse-soft: #a48cff; /* violet when used as text/icon (7.5:1) */
  --color-eclipse-deep: #241a4d; /* nebula wash */
  --color-aurora: #46c9b0;       /* "alive / ok / eligible" state (replaces sol-green for UI) 9.9:1 */

  /* chain: Solana gradient, reserved for the Solgem spark and on-chain indicators only */
  --color-chain-1: #9945ff;
  --color-chain-2: #00c2ff;
  --color-chain-3: #14f195;
}
```

**Usage ratios per viewport (rough guide):** void/umbra ≥ 85%, bone/vellum text, gilt ≤ 5%, eclipse atmosphere ≤ 8%, ember ≤ 2% (except during the hatch), chain gradient ≤ 1%.

**Semantic mapping:**
| Role | Token |
|---|---|
| Body text / headings | `bone` |
| Secondary copy | `vellum` |
| Meta, captions, disabled | `dust` |
| Links, focus ring, active nav, eyebrows | `gilt` |
| Success / eligible / ready to hatch | `aurora` |
| Warning (demo, simulated data) | `gilt` on `rgba(232,183,92,.06)` with a `gilt/20` border (not amber-400) |
| Error | `#e06a4a` (6.1:1) |
| Unknown / classified | `eclipse-soft` silhouettes on `eclipse-deep` |

### 2.2 Rarity system: expressed as material, not glow
Keep `src/lib/rarity.ts` colours. The creature art depends on them. Change how the UI presents them: each rarity gets a **metal name and a single hairline**, not a coloured glow blob.

| Rarity | Material name (UI copy) | Badge text colour | Plate top hairline | Reveal light |
|---|---|---|---|---|
| Common | Bone | `#9fe8c8` | 1px, 40% opacity | soft white key light |
| Rare | Cobalt | `#8fb0ff` (lightened from `#5b8cff` for contrast) | 1px, 55% | cool key light plus a violet rim |
| Epic | Amethyst | `#e08cff` | 1px, 70% | violet light shafts |
| Legendary | Gilt | `#ffc94a` | 1px plus a gilt double rule | full Phoenix gold light shafts and embers |
| Mythic | Platinum | `#e6ecff` | double rule plus a celestial ring watermark | eclipse: light ring around a dark disc |
| Secret | Obsidian Prism | chain gradient (the only rarity allowed it) | prism hairline | inverted: the screen goes dark, the creature lights itself |

Badge spec: height 20px, `border: 1px solid <colour>/35%`, transparent background, Inter 600 10px uppercase with 0.2em tracking, and a 5px rotated-square Solgem at left in the rarity colour. **Remove the outer box-shadow glow** from `RarityBadge`.

### 2.3 Typography
Replace **Unbounded**. It is the single biggest "crypto template" signal.

| Role | Family | Package |
|---|---|---|
| Display (headlines, names, wordmark) | **Cormorant** (variable 300–700) | `@fontsource-variable/cormorant` |
| Text (UI, body) | **Inter** (keep) | already installed |
| Data (numbers, timers, dex numbers) | **JetBrains Mono** (keep, but only for numerals) | already installed |

Why Cormorant: it has high-contrast, inscriptional, old-world letterforms that become cinematic at large sizes. It contrasts cleanly with Inter, and it costs one package.

```css
@theme {
  --font-display: "Cormorant Variable", "Cormorant", ui-serif, Georgia, serif;
  --font-sans: "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

**Type scale** (fluid; use exactly these):

| Token | Family / weight | Size | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `display-xl` | Cormorant 500 | `clamp(3.25rem, 1.6rem + 6.4vw, 8rem)` | 0.9 | -0.015em | Home hero only |
| `display-l` | Cormorant 500 | `clamp(2.75rem, 1.8rem + 3.6vw, 5.25rem)` | 0.95 | -0.01em | Page titles (Hatchery, Collection…) |
| `display-m` | Cormorant 500 | `clamp(2.125rem, 1.6rem + 2vw, 3.5rem)` | 1.02 | -0.005em | Section headings |
| `title` | Cormorant 600 | 1.5rem (mobile 1.375rem) | 1.1 | 0 | Creature names, card titles |
| `epithet` | Cormorant 400 *italic* | 1.0625rem | 1.3 | 0.01em | "The Patient Sprout" under names |
| `body-l` | Inter 400 | 1.125rem | 1.6 | 0 | Lead paragraphs, max 34em wide |
| `body` | Inter 400 | 1rem | 1.6 | 0 | Default |
| `small` | Inter 400 | 0.875rem | 1.5 | 0 | Captions |
| `label` | Inter 600 | 0.6875rem | 1.2 | 0.22em, UPPERCASE | Eyebrows, nav, badges, buttons |
| `data` | JetBrains Mono 400, `tabular-nums` | 0.8125rem | 1.3 | 0.02em | Timers, balances, dex #, percentages |
| `data-l` | Cormorant 500, `lining-nums tabular-nums` | 2rem | 1 | 0 | Big stats (balance, 79.3%) |

Rules:
- Headlines are **sentence case in Cormorant**, never all-caps Unbounded. The hero may set one word in italic for emphasis (e.g. *waking*), never in gradient.
- The **eyebrow** pattern replaces the mono-green eyebrow: `◆ GENESIS HATCHERY · SEASON 0`. Use `label` style in `gilt` at 80% opacity, with a 5px gilt rotated square as the bullet.
- Big numbers use Cormorant lining numerals, not Unbounded. The mono face is for small data only.
- Wordmark: `SOLANITES` in Cormorant 600, uppercase, 0.32em tracking, `bone` colour, set beside the sigil emblem (see §5).

### 2.4 Spacing, grid, layout
- **Base unit 4px.** Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.
- **Page gutters:** 16px (<640), 24px (640–1023), 48px (1024–1439), 64px (≥1440).
- **Content width:** 1200px max (`max-w-[75rem]`); reading width 36rem; hero copy 34rem.
- **Grid:** 12 columns with 24px gaps on desktop; 6 columns on tablet; 4 columns with 16px gaps on mobile.
- **Section rhythm:** 160px between homepage sections on desktop, 96px on mobile. App pages (Hatchery, Collection) use 64/48px. Never let a section start without at least 96px of dark above it on desktop. Negative space is part of the cinema.
- **Header:** 72px desktop, 60px mobile.

### 2.5 Shape, borders, elevation
| Token | Value | Use |
|---|---|---|
| `--r-xs` | 2px | chips, badges, inputs (no pills for data) |
| `--r-sm` | 6px | cards, plates, panels |
| `--r-md` | 12px | modals, drawers |
| `--r-pill` | 9999px | **buttons only** |
| ovoid | `border-radius: 50% / 60% 60% 40% 40%` or SVG ellipse | the Aperture |

Today everything is `rounded-2xl`/`rounded-3xl`. Moving to 6px is the cheapest way to make it read as archival and premium rather than app-store.

**The plate frame** (the signature card treatment): a 1px `--color-rim` outer border, plus an inner 1px rule inset by 6px at `gilt/12%`. The inner rule turns `gilt/35%` on hover/focus. CSS:

```css
.sl-plate {
  position: relative;
  border-radius: var(--r-sm);
  background: linear-gradient(180deg, #120f17 0%, var(--color-umbra) 40%, #0b0a0f 100%);
  border: 1px solid var(--color-rim);
}
.sl-plate::after {
  content: ""; position: absolute; inset: 6px; border-radius: 3px; pointer-events: none;
  border: 1px solid rgba(232, 183, 92, 0.12);
  transition: border-color 320ms var(--ease-out);
}
.sl-plate:is(:hover, :focus-visible)::after { border-color: rgba(232, 183, 92, 0.35); }
```

**Elevation is light, not shadow.** Raised elements do not get bigger drop shadows. They get a top highlight (`inset 0 1px 0 rgba(255,241,201,.06)`) and a key-light gradient. Allowed shadows: `0 30px 60px -30px rgba(0,0,0,.9)` (modals) and the creature's floor contact shadow.

**Blur** is allowed in exactly two places: the scrolled header and the modal backdrop. Delete `sl-glass` from content cards, stat boxes and pills.

### 2.6 Components

**Buttons**
| Variant | Spec | Where |
|---|---|---|
| Gilded (primary) | Pill, height 52 (mobile 48), padding 0 28px, `label` type at 0.18em. Background `linear-gradient(180deg,#fff1c9 0%,#e8b75c 48%,#a8692a 100%)`, text `#140c03`, inset `0 1px 0 rgba(255,255,255,.5)`. Hover: brightness 1.06 plus a gilt key-light bloom `0 0 0 6px rgba(232,183,92,.08)`. **No translateY.** | **One per viewport.** "Enter the Hatchery", "Hatch now", "Begin" |
| Outline | Pill, 1px `rim-strong` border, `bone` text, transparent. Hover: border `gilt/50`, text `flare`. | Secondary actions |
| Quiet | Text only in `vellum`, a 1px gilt underline at 6px offset that grows from left on hover (`background-size` 0→100%, 320ms). | Tertiary links, "Read the full rules" |
| Icon | 40×40 circle, 1px `rim` border, no glass. | Sound, menu, close |

Delete `.sl-btn-primary` (the purple gradient) after migrating the nav CTA to Outline. The nav's "Find my eggs" should be **Outline**, not filled: the page's own Gilded CTA must win.

**Eyebrow + heading** (`SectionHeading`): eyebrow (gilt label with ◆), 16px gap, `display-m`, 20px gap, `body-l` in `vellum`. Left-aligned by default. Centre only for single-statement sections (Incubation, final CTA).

**Ornament divider:** a 1px gilt/25 line, 120px wide, with a 7px celestial-ring glyph (circle and four ticks) at the centre. Use it between homepage acts instead of `border-y` bands.

**Stat** (Hatchery, hero): no box. Use a `label` in `dust` above, then `data-l` in `bone`, with stats separated by 1px vertical `rim` rules. The hero stat strip loses its three bordered boxes.

**Chips/filters:** 32px high, `--r-xs`, 1px `rim`, `label` type. Active: `basalt` background, `gilt` text, `gilt/40` border. A rarity chip, when active, shows its Solgem in the rarity colour; the chip text stays gilt.

**Selects:** match chips. Style a custom chevron in gilt; never use the native grey arrow on `abyss`.

**Progress**
- *Linear:* 2px track `rim`, fill `gilt` → `flare` at the leading edge, with a 6px soft flare dot at the head. Use `aurora` only when complete.
- *Ring (incubation):* the Celestial Ring. Twelve ticks; ticks light in gilt as progress passes them, and the current one pulses (opacity .5→1, 1.6s). This replaces `ProgressRing`'s plain arc.

**Modal:** `--r-md`, `umbra` body, a 1px rim, the backdrop `rgba(7,6,10,.78)` with an 8px blur, and the close icon button top-right. Entry motion is in §4.

**Nav:** see §3.7.

### 2.7 Imagery and lighting rules (for all creature, egg and environment art)
1. **Key light:** warm (`#ffe2a8`), from 11 o'clock, above the subject.
2. **Rim light:** violet (`#7d5cf0` at 40–60%), from behind and lower right.
3. **Ground:** every creature and egg stands on something: a contact shadow (an ellipse of `rgba(0,0,0,.6)` blurred 12px, 70% of the subject's width) plus a faint gilt floor glint. Nothing floats in a void unless it is a flying or swimming species. Even those get a soft shadow 24px below.
4. **Background behind a subject:** a vertical light cone (a radial ellipse of `rgba(255,226,168,.10)` at 50% 0%) falling onto the subject. **No coloured glow blob behind the subject.** The rarity colour may appear only as a 20–30% tint in the rim light.
5. **Silhouettes (classified):** pure dark shape with an `eclipse-soft` 1px rim and *no* "?" glyph. The mystery is the rim, not a question mark. Small caption below reads `Classified · Sighted once`.

**Applying this to the existing SVG creatures without redrawing them** (one wrapper, `CreaturePortrait`):
```
<div class="sl-portrait">                 ← aspect-square, position relative
  <div class="sl-portrait-cone" />        ← radial-gradient(60% 55% at 42% 0%, rgba(255,226,168,.13), transparent 70%)
  <div class="sl-portrait-floor" />       ← contact shadow ellipse at bottom 10%
  <CreatureArt … showAura={rarity ≥ legendary} />
  <div class="sl-portrait-grade" />       ← mix-blend-mode: soft-light; linear-gradient(160deg, rgba(255,226,168,.18) 0%, transparent 45%, rgba(125,92,240,.22) 100%)
</div>
```
plus `filter: saturate(.86) contrast(1.06)` on the art. This one grade pulls the cartoon palette toward the phoenix's lighting. It is the highest-impact, lowest-cost change for the Collection. Turn `showAura` off for Common/Rare/Epic. The auras are what make the grid look like repeated glowing cards.

---

## 3. Page-by-page art direction

### 3.1 Homepage: "The Awakening" (a film in five acts)

**Act I, Hero (100svh).**
- *Desktop:* the phoenix image right of centre, as now, but seen **through the Aperture**: apply a mask of an ovoid vignette (`radial-gradient(ellipse 38% 52% at 62% 46%, #000 55%, transparent 100%)`) so the phoenix emerges from darkness rather than filling a rectangle. Copy sits left in a 34rem column, vertically centred slightly above middle (45%).
- Stack order: eyebrow → `display-xl` headline (2–3 lines) → `body-l` (max 2 lines) → Gilded CTA plus a Quiet link "Explore the Collection" → one small line of reassurance in `dust` ("No wallet needed to explore."). **Remove** the glass pill with the ping dot, the 2-line wallet paragraph and the three stat boxes from the hero; move the stats to Act II.
- Headline direction (the main session owns the copy, but this is the register): short, declarative, serif. For example "Something ancient is *waking*." or "Your Solanite is waiting." Never more than 6 words.
- The sigil (emblem variant) sits above the eyebrow at 56px on desktop, 44px on mobile, drawn in once (§4.5).
- Embers: keep `sl-phx-embers`, but limit to **8**, all originating from the phoenix's body region (left 45–75%), not across the full width.
- *Mobile:* the phoenix crops to head, halo and upper wings in the top 52svh. The copy starts at 46svh and overlaps the faded bottom of the image. The headline is `display-xl` at 3.25rem (2 lines max). The CTA is full-width minus gutters (48px tall). The Quiet link sits under it, centred.

**Act II, The Bloodlines (rarities).** Replace the six equal glowing cards with **a single horizontal "lineage" composition**: the six rarities as six plates on one baseline, increasing in height from Common (short) to Secret (tallest), like a staircase toward the light. Each plate shows one representative creature, its material name, and a data line `hatch rate 60%`. The Secret plate is pure obsidian with only its prism hairline. Below the row, the three stats (1,000,000 $SLNT per egg · 28 species · 6 bloodlines) appear as a centred stat strip.
*Mobile:* horizontal scroll-snap row, plate width 72vw, with the next plate peeking 12vw. Do not stack six cards vertically.

**Act III, Incubation ("Watch it come alive").** Keep the five-stage row, but put each egg on a **pedestal** (a low ellipse in `basalt` with a gilt rim highlight) under its own light cone. Light intensity increases left to right (cone opacity .05 → .16). The connecting line becomes a 1px gilt hairline with celestial-ring ticks at each stage. Stage labels: `label` "STAGE I" (roman numerals), then `title` "Acquired", then `small` copy. Remove the `bg-abyss/60` band and the `border-y`. Use the ornament divider instead.
*Mobile:* vertical timeline, with the eggs at 96px on the left and the text on the right.

**Act IV, Evolution ("One creature. Four forms.").** Keep `EvolutionShowcase`, but present the four forms as a **museum frieze**: one baseline, a shared floor shadow, the forms growing left to right, and roman numerals I–IV beneath in gilt. The unselected forms are not grey blobs. Show them at full colour with 0.55 brightness, so the active form is "lit" by the key light and the others stand in shadow. The species tabs become chips (§2.6).

**Act V, Call ("Something is stirring").** A single egg on a pedestal, centred in a large dark field, with one light cone from above. The headline is in `display-l`, with no gradient text. Below it sits the Gilded CTA. Remove `ParticleField` and the 42rem purple blur disc. Add 12 slow embers rising from the egg only.

Remove the `CreatureMarquee` strip, or restyle it as a quiet "frieze" (no names, no badges, 48px creature silhouettes in `dust` tone that light to full colour on hover). A scrolling strip of tiny icons cheapens the hero-to-content transition. My recommendation is to remove it.

### 3.2 Hatchery: "The Nest" (signature environment)
This is the place users return to daily. It should feel like entering a sanctum.

- **Header:** eyebrow `◆ YOUR HATCHERY` (or `◆ DEMO HATCHERY · SIMULATED` in demo), `display-l` "The Hatchery", and to the right a **status line** in `data` type: `● Eligible · 5,200,000 $SLNT · Next egg in 800,000`. The aurora dot is static, with no ping.
- **Demo notice:** a single 1px gilt/20 bordered strip, 44px tall, with gilt text. It is not an amber box. It can be dismissed per session (store the dismissal in `sessionStorage`, inside try/catch).
- **Stats row:** the four bordered boxes become the borderless Stat component, split by vertical rules, on one line. On mobile it becomes a 2×2 grid with hairlines between cells.
- **Egg grid → "The Nest row":** eggs are **not in cards**. Each egg stands on a pedestal under a light cone, with its label beneath:
  - `label` "EGG II" (roman numerals), status in `aurora` if ready, otherwise `dust`
  - The Celestial Ring progress (96px) wraps the pedestal base, *or*, if space is tight, a linear progress bar under the label
  - `data-l` percentage, then `data` "1h 14m left"
  - The ready egg's cone brightens to .22 and gains 6 rising embers. That is the only egg allowed embers, so readiness is legible from across the room.
  - Hatch button: Gilded, only on ready eggs, and only one visible at a time (if several are ready, the first gets Gilded and the others get Outline "Hatch").
- **Locked slot:** an empty pedestal with a dashed 1px `rim` ellipse where the egg would be, plus a `small` caption "Hold 6,000,000 to unlock". No padlock icon.
- **Creatures section ("Hatched"):** plates (§2.5) with `CreaturePortrait`, name in `title`, epithet in `epithet`, rarity badge, and an evolution progress line.
- **Background:** the nest has its own environment layer on top of the cosmic backdrop: a soft vertical shaft of warm light from the top centre of the page (`radial-gradient(40% 60% at 50% -10%, rgba(255,214,140,.10), transparent 70%)`) that the eggs stand in. Remove `ParticleField` and `sl-atmosphere` here.
- **Simulation panel:** collapsed by default into a single Quiet link "Simulation controls" at the bottom; when open, use `data` type throughout and a `basalt` panel. It is a developer surface and should look like one: quiet.
- **Mobile:** eggs in a 2-column grid (pedestals 40vw), the ready egg sorted first, and the Hatch button sticky at the bottom (`position: sticky; bottom: 16px`) while any egg is ready.

**Hatch reveal** (`HatchReveal`): see §4.6 for the timeline.

### 3.3 Collection: "The Bestiary"
- **Header:** eyebrow `◆ THE SOLANIDEX`, `display-l` "The Bestiary" (keep "Collection" in the nav and the route), and lead copy. The discoveries counter becomes a large `data-l` "0 / 28" with a Celestial Ring (28 ticks variant, or 12 ticks with a fractional fill) to its left. No glass box.
- **Filter bar:** sticky, a 1px `rim` bottom border only, a `void/85` background with blur (the third allowed blur; it is chrome). Rarity chips, then a separator, then Element and Status as custom selects. On mobile, show the rarity chips only, with Element and Status behind a single "Filter" outline button that opens a bottom sheet.
- **Grid of plates:** 4 columns desktop, 3 at tablet, 2 on mobile, 24/16px gaps.
  - Plate anatomy, top to bottom: a `data` row with `No. 001` left and the status right (`Discovered` in aurora / `Catalogued` in dust / `Classified` in eclipse-soft) → `CreaturePortrait` (aspect 1:1) → name `title` → epithet `epithet` in `vellum` → badge plus element in `small`.
  - **Remove** the colour blob (`absolute -top-16 … blur-3xl`) and the coloured top hairline; the plate frame does the work.
  - Hover: the inner rule turns gilt (§2.5), the key-light cone opacity goes .13 → .2, the creature lifts 4px, and its idle animation plays (already implemented). **No card translateY.**
- **Classified plates:** the portrait shows the silhouette with an eclipse rim, the name reads `Unknown`, the epithet reads `Sighted once in the deep slots`, and there is no "?" glyph.
- **Detail view (`CreatureDetail` modal):** a two-column spread on desktop. Left (55%): the creature in the Aperture (ovoid frame), large, with the four forms as a frieze beneath. Right (45%): `No. 014` → `display-m` name → `epithet` → rarity and element → the lore's first sentence as a pull-quote in Cormorant italic `title`, with the rest in Inter `body` `vellum` → stats as hairline-divided rows. Prev/next buttons are icon buttons at the vertical centre of the modal edges.
  *Mobile:* a full-screen sheet; the creature takes the top 50svh and the text scrolls beneath.

### 3.4 How It Works: "The Codex"
- Editorial, long-form, single column (36rem), on the left of a 12-col grid on desktop with a sticky table of contents in the right 3 columns (`small` links, gilt marker for the current section).
- Steps are numbered with roman numerals in `display-m` gilt, not icon cards.
- The rules table: `data` type, hairline rows, no zebra striping, and the header row in `label` `dust`.
- Probability table: each rarity row has a 2px horizontal bar in the rarity colour at 60% opacity, with the value in `data`.

### 3.5 Rewards (`/claims`): "The Return"
This page is about trust and money, so the tone is **calm, ledger-like, no spectacle**. Remove the gradient text from the headline.
- Title `display-l`: "Locked supply returns to holders." with no gradient. Optionally italicise the word *returns*.
- The Launch → +2h → Distribution timeline: two small celestial-ring glyphs (gilt outline) joined by a 1px gilt hairline, with "+2h" in `data-l` Cormorant on a `void` background over the line. Remove the purple and green glowing circles.
- Terms list: hairline rows. "Planned" is aurora text with no fill; "Pending" is dust text with a 1px rim border. Both badges are `--r-xs` rectangles, not pills.
- The disclaimer sits in a 1px rim box with `small` vellum text. The seed-phrase warning line is **bone**, not muted, because it is important.

### 3.6 Leaderboard: "The Annals"
- The podium becomes three pedestals of different heights (2nd, 1st, 3rd), with the top creature of each holder standing on it under a light cone. The ranks are roman numerals.
- The table below uses hairline rows, `data` for numbers, and the holder address in mono `dust` (truncated `7xQ4…9fA2`).
- Tabs (Most Evolved / Longest Holders / Rarest Discoveries) use the nav's indicator style (§3.7).

### 3.7 Navigation and footer
- **Header, top of page:** transparent. **Scrolled:** `void/80` with a 12px blur and a 1px `rim` bottom border. 72px high, dropping to 60px when scrolled (transition 320ms).
- **Left:** sigil emblem 28px plus the wordmark. **Centre:** links in `label` style, `vellum` colour, `bone` on hover, with a gap of 32px. **Right:** a sound icon button and the "Find my eggs" Outline button (not filled).
- **Active indicator:** replace the gradient bar with a **5px gilt Solgem (rotated square) centred 10px under the active label**, sliding between links with the existing transform logic (`sl-nav-indicator` keeps its JS; change its look only: `width: 5px; height: 5px; rotate: 45deg; background: var(--color-gilt); box-shadow: 0 0 8px rgba(232,183,92,.6)`, and centre it on the link instead of matching its width).
- **Mobile menu:** a full-screen overlay (`void/96` with a 16px blur), with links in `display-m` Cormorant stacked with 24px gaps, left-aligned at the 16px gutter, each prefixed by a roman numeral in `label` gilt. The sigil watermark sits at 30% opacity, 70vw wide, bottom-right, cropped. The sound toggle and "Find my eggs" sit at the bottom.
- **Footer:** the full sigil (64px) centred above a 3-column link grid on desktop. The legal and simulated-data notice becomes `small` `dust` text with no amber box. The bottom line `© Solanites · Built on conviction` is in `label` dust.

---

## 4. Motion language

**Principle: light moves, matter waits.** Motion in Solanites is mostly *light changing* (dimming, igniting, unveiling). Objects move slowly and little. Nothing bounces. Nothing scales above 1.04. Every animation has a cause (a hover, a navigation, a hatch, progress) except three ambient loops: phoenix breath, ember rise and egg heartbeat.

### 4.1 Tokens
```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);    /* default for entrances */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* state changes, light swells */
  --ease-in:     cubic-bezier(0.55, 0, 1, 0.45);    /* exits, charge-ups */
  --ease-unveil: cubic-bezier(0.16, 1, 0.3, 1);     /* long cinematic reveals */

  --dur-instant: 120ms;  /* press feedback, colour changes */
  --dur-quick:   240ms;  /* hover light, chips, nav indicator */
  --dur-base:    420ms;  /* page enter, modal, menu */
  --dur-slow:    900ms;  /* section unveils */
  --dur-epic:    1600ms; /* sigil draw, hatch phases */
}
```
Replace the ad-hoc `cubic-bezier(0.2, 0.8, 0.2, 1)` everywhere with `--ease-out`.

### 4.2 Hover and focus
| Element | Effect | Duration |
|---|---|---|
| Plate | Inner rule rim → gilt/35; light cone .13 → .20; creature `translateY(-4px)`; creature idle animation plays | 320ms `--ease-out` |
| Gilded button | brightness 1 → 1.06; outer ring `0 0 0 6px gilt/8%` fades in | 240ms |
| Outline button | border → gilt/50; text → flare | 240ms |
| Quiet link | underline grows left → right | 320ms |
| Nav link | colour vellum → bone | 120ms |
| Icon button | border → rim-strong | 120ms |
| Focus (all) | `outline: 1px solid var(--color-gilt); outline-offset: 3px;` plus the same visual as hover | — |
| Press (all buttons) | `scale(.98)`, brightness .95 | 120ms |

No card ever moves on hover. Only the creature inside it does.

### 4.3 Page transitions
Keep the `PageTransition` architecture (WAAPI on a persistent wrapper; never remount the backdrop). Change the keyframes to an **unveil**:
```js
el.animate(
  [
    { opacity: 0, transform: "translate3d(0, 14px, 0)", filter: "brightness(.6)" },
    { opacity: 1, transform: "none", filter: "brightness(1)" },
  ],
  { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
);
```
Plus, simultaneously, a **horizon line**: a 1px gilt line, full width, at the header's bottom edge, that scales X from 0 → 1 (origin centre) over 420ms and then fades out over 240ms. That is the signature: a line of light crossing the world as you move between pages. Implement it as a single fixed element in the layout, triggered by the same path change. Skip it under reduced motion.

### 4.4 Scroll reveals ("unveil")
- Apply only to section headings, plates' first appearance and homepage acts. **Never** to body paragraphs individually.
- Effect: `mask-image: linear-gradient(to top, #000 var(--p), transparent calc(var(--p) + 20%))`, animating `--p` from -20% → 100%, plus opacity 0 → 1, over 900ms `--ease-unveil`. It reads as light rising over the element. A cheaper fallback is opacity plus a 14px translate.
- Trigger: IntersectionObserver at `threshold: 0.2`; play once. Grid children are staggered by 60ms, max 8 staggered (the rest appear with the 8th).
- Above-the-fold content does not use scroll reveals. It uses the hero entrance (§4.5).

### 4.5 Hero entrance (after the intro, or on a return visit)
| t (ms) | Event |
|---|---|
| 0 | Page is dark; the phoenix is at brightness .2 |
| 0–1600 | Phoenix brightness .2 → 1 (`--ease-in-out`): the world ignites |
| 200–1800 | Sigil draws in: the ring traces (pathLength), then the ticks light clockwise 40ms apart, then the wings fan out, then the egg traces, and **the gem ignites last** with a 300ms flare |
| 900 | Eyebrow fades in |
| 1050 | Headline lines unveil (§4.4 mask), 120ms apart |
| 1400 | Body text, then the CTA (opacity plus 8px translate, 420ms) |
| 1800 | Embers begin |

Total under 2.2s; the CTA becomes interactive at 1400ms. On a reduced-motion visit, show the final frame immediately.

### 4.6 Hatch reveal timeline (`HatchReveal`)
Rarity changes the **duration of the charge and the kind of light**, never the basic structure.

| Phase | Common/Rare | Epic | Legendary | Mythic | Secret |
|---|---|---|---|---|---|
| 1. Hush (UI dims to 15%, egg centred in Aperture, ring appears) | 400ms | 400ms | 500ms | 600ms | 800ms (screen goes fully black) |
| 2. Charge (ring ticks light one by one, egg trembles, heartbeat quickens) | 1200ms | 1800ms | 2600ms | 3200ms | 3600ms |
| 3. Fracture (cracks spread as light lines, 3 sound hits) | 500ms | 500ms | 600ms | 700ms | 700ms |
| 4. Bloom (flash from egg centre; Aperture fills with light) | white, 600ms | violet shafts, 800ms | gold shafts and embers, 1000ms | eclipse ring, 1100ms | none: the creature emits its own prism light |
| 5. Reveal (creature unveils upward via mask, settles 4px; name, epithet, badge appear 150ms apart) | 900ms | 900ms | 1100ms | 1300ms | 1400ms with the existing glitch effect, *once* |

The "Skip" quiet link is visible from phase 1. Under reduced motion, show phase 5's final frame with a 300ms crossfade.

### 4.7 Loading states
- **The Vigil loader** (replaces `animate-pulse` blocks and the "Loading your Hatchery…" text): a 48px Celestial Ring whose 12 ticks light in sequence (80ms each, then a 400ms hold, then they fade together), looping. Centred in the area being loaded, with a `label` dust caption beneath ("Reading the chain…" or "Waking the Hatchery…").
- **Skeletons** (where layout must be held): `umbra` blocks with the plate frame, and a single warm light sweep (`linear-gradient(100deg, transparent 30%, rgba(255,226,168,.05) 50%, transparent 70%)`) crossing every 1.8s. Not a white shimmer.
- **Images:** creature and hero images fade in from brightness .4 → 1 over 600ms on `load` (never pop in).

### 4.8 Ambient loops (the only continuous motion allowed)
| Loop | Where | Spec |
|---|---|---|
| Phoenix breath | hero | existing `sl-phx-breathe` 14s, scale ≤1.035 ✔ keep |
| Embers | hero (8), ready egg (6), CTA egg (12), Legendary reveal | rise only from a heat source, 8–12s each, pause offscreen |
| Egg heartbeat | eggs | existing `sl-heartbeat`, keep; 3s normally, 1.4s from Stage III |
| Starfield drift | cosmic backdrop | keep the near and far star layers |

**Remove** from `CosmicBackdrop`: the 7 gold embers (no source) and the glints' 6s alternating twinkle (reduce to 1 glint, 14s). **Remove** `ParticleField` usage everywhere. Delete the component once it is unused.

### 4.9 Performance and accessibility rules
- Animate only `transform`, `opacity` and `filter: brightness()`. No animated `box-shadow` or blur.
- Pause every loop when offscreen (the existing `data-offscreen` / `.sl-paused` patterns) and when `document.hidden`.
- `prefers-reduced-motion: reduce`: there are no loops; entrances become 200ms opacity fades; the hatch skips to the final frame; the horizon line is skipped. The existing global override already covers most of this. Keep it.
- Focus is always visible (gilt outline). All text meets AA on `void` per the token table.

---

## 5. Sigil and brand assets

### 5.1 The Solanites Sigil: "The Ascending Egg"
Reference drawings are in this folder (rendered and checked at 320, 140, 64, 32, 24 and 16px).

**Construction** (120×120 grid, centre 60,60). This keeps the main session's ring and feather construction and refines it:

| Element | Geometry | Meaning |
|---|---|---|
| Celestial ring | circle r=55, stroke 1 | the world between worlds |
| 12 ticks | from r=55 inward 6 units (cardinal, stroke 1.4) or 3.5 units (others, 0.9) | the twelve watches of incubation; also the progress ring and loader |
| Halo | ellipse cx 60, cy 25, rx 10.5, ry 2.8, stroke 1.5 | **taken directly from the hero phoenix's halo**, which ties the mark to the key art |
| Egg | `M60,34 C71,34 78,52 78,68 C78,82 70,92 60,92 C50,92 42,82 42,68 C42,52 49,34 60,34Z`, stroke 1.8, filled with void | the egg; its 0.62 ratio is the Aperture |
| Wings | 4 asymmetric feathers per side rising from the egg's shoulders (y 52–67) to tips at (25,20) (15,31) (9.5,45) (10,59), mirrored | the Phoenix *emerging from* the egg, not sitting on it |
| Tail | 3 short feathers below the egg, the centre one to y=105 | flame and lineage; it completes the vertical axis halo → gem → tail |
| Solgem | diamond `M60,57 L65.5,66.5 L60,77 L54.5,66.5Z` | the one spark; the only element in colour |

**Differences from the in-progress `Sigil.tsx`** (recommendations for the main session):
1. **The egg outline is gilt, not the Solana gradient.** The whole mark is one metal. Only the gem carries colour (ember gradient by default; chain gradient allowed in on-chain contexts like the wallet button).
2. **Replace the flame crest with the halo ellipse.** The crest competes with the wings; the halo is a direct quote of the hero phoenix and reads at small sizes.
3. **Drop the old LogoMark's inner wing strokes** (`M9,24 L14,22…`). They turn into noise below 48px.
4. **Make the feathers asymmetric** (bowed leading edge, straighter trailing edge) and use 4 per side rather than 3, so they read as wings rather than sun rays. See the `feather()` construction in `sigil-full.svg`.
5. The eclipse arc can stay as an *animated* element (the ring trace), but should not be in the static mark.

**Variants and minimum sizes**
| Variant | Contents | Min size | Use |
|---|---|---|---|
| Full (`sigil-full.svg`) | ring, ticks, halo, wings, egg, gem, tail | 48px | footer, intro, loader frame, end cards, OG image |
| Emblem (`sigil-emblem.svg`) | halo, wings, egg, gem, tail (no ring) | 24px | nav, hero mark, mobile header |
| Glyph (`sigil-glyph.svg`) | egg and gem only, heavier stroke | 12px | favicon, app icon, inline bullets, tab icon |
| Mono | any of the above in one flat colour (`bone` on dark, `void` on light) | as above | watermarks, embossing, merch, single-colour print |

**Clear space:** the egg's width (36 units) on all sides of the Full mark, and half the egg's width around the Emblem.
**Colours:** gilt gradient `#fff1c9 → #e8b75c → #a8692a` top to bottom (vertical, user-space). Gem: `#fff1c9 → #f08a3c → #9a2f1e`. Never place the sigil on a busy part of an image. It sits on void or behind the Aperture vignette.
**Don'ts:** no outer glow (at most `drop-shadow(0 0 12px rgba(232,183,92,.25))` in the hero only), no rotation, no recolouring the gold per rarity, no placing the gem off-centre.

### 5.2 Wordmark and lockups
- Wordmark: `SOLANITES` in Cormorant 600 uppercase, 0.32em tracking, bone.
- **Horizontal lockup** (nav): Emblem at the cap height × 1.9, a gap equal to 0.5 × the emblem width, then the wordmark.
- **Stacked lockup** (footer, intro, social): Full sigil, then 0.35 × the sigil height below it, the wordmark centred, with the tagline `THE WORLD BETWEEN WORLDS` in `label` dust 16px beneath.

### 5.3 Brand assets to produce
| Asset | Spec |
|---|---|
| `src/app/icon.svg` | glyph, gilt on transparent |
| `src/app/apple-icon.png` | 180×180, glyph on `#07060a`, 18% padding |
| `src/app/opengraph-image.png` | 1200×630: the phoenix image through the Aperture vignette on the right; on the left, the stacked lockup and one line of copy |
| `public/brand/sigil-*.svg` | copy the four reference SVGs (after the main session's Sigil.tsx is final, export from it so there is one source) |
| Theme colour | `viewport.themeColor = "#07060a"` |

---

## 6. Asset reuse and replacement list

| Asset | Path | Verdict | Action |
|---|---|---|---|
| Phoenix hero still | `public/hero/phoenix-{1200,2000}.{webp,jpg}` | **Retain: it is the key art** | Add the Aperture vignette mask; reduce embers to 8 from the body only |
| Phoenix intro videos and posters | `public/intro/phoenix-{16x9,9x16}.*` | **Retain** | Ensure the intro ends on a frame that matches the hero (phoenix centred, halo visible) so the cut is seamless |
| Runway clips | `art/intro/clip-*.mp4`, `phoenix-still.png` | Retain (source masters) | No change |
| Creature SVGs | `src/components/creature/species/*`, `kit.tsx` | **Retain short-term, improve** | Wrap in `CreaturePortrait` (§2.7); turn auras off below Legendary. Do not redraw now |
| Creature raster pipeline | `scripts/creature-art.mjs`, `src/data/creatureAssets.json` (all null) | Retain the infrastructure | Long-term replacement for the SVGs. When masters are made, brief them with §2.7's lighting and "charm in Eggling/Hatchling, gravitas in Evolved/Ascended". The current reference sheet's look (glowing, toy-like) should **not** be the target |
| Creature reference sheet | `docs/creature-art/reference/*` | Retain as silhouette/anatomy reference only | Its lighting and glow style is superseded by this document |
| Egg art | `src/components/egg/EggArt.tsx` | **Improve** | Keep the shapes, cracks and heartbeat. Change the shell palettes from neon blue/magenta to obsidian/basalt shells with gilt or ember crack light; the rarity hue appears only as the inner glow seen through the cracks. Remove the floating orbit dots. Add the pedestal and contact shadow |
| Old logo mark | `src/components/layout/Logo.tsx` `LogoMark` | **Replace** | Use the Sigil emblem; keep the `Logo` component API (`narrowMarkOnly`) |
| In-progress sigil | `src/components/brand/Sigil.tsx` | **Refine** | Apply the 5 changes in §5.1 |
| Cosmic backdrop | `src/components/layout/CosmicBackdrop.tsx` | **Improve** | Keep the stars; remove the embers; one glint; nebula colours shift to eclipse-deep and a faint warm top wash (below) |
| Particle field | `src/components/ui/ParticleField.tsx` | **Remove** | Delete its usages on the Hatchery and the home CTA |
| Burst canvas | `src/components/ui/BurstCanvas.tsx` | Retain for the hatch only | Recolour per §4.6; embers rise, they do not explode radially, except at the Legendary bloom |
| Creature marquee | `src/components/landing/CreatureMarquee.tsx` | **Remove** (or the frieze restyle in §3.1) | — |
| Rarity showcase | `RarityShowcase.tsx` | **Rework** | Into the "lineage" staircase |
| Stage timeline | `StageTimeline.tsx` | Improve | Pedestals, cones, roman numerals |
| Promo overlays and posters | `art/promo/*`, `art/campaign/*` | Retain for the current campaign | Future creative should use the sigil, Cormorant and the void/gilt palette |
| `globals.css` utilities | `sl-gradient-text`, `sl-gradient-border`, `sl-btn-primary`, `sl-grid`, `sl-glass` (on content), `sl-atmosphere` | **Remove after migration** | Replacements in §8.3 |
| `globals.css` utilities | `sl-phx-*`, `sl-egg*`, creature animations, `sl-intro*`, `sl-cosmos-stars*`, `sl-btn-gold` | Retain | `sl-btn-gold` becomes the Gilded button (update the colours to the tokens) |
| Fonts | Unbounded | **Replace** with Cormorant | `npm i @fontsource-variable/cormorant`, then `npm uninstall @fontsource-variable/unbounded` once it is unused |

Nebula update for `.sl-cosmos-nebula`:
```css
background:
  radial-gradient(50% 40% at 50% -6%, rgba(255, 200, 120, 0.07), transparent 70%),   /* phoenix light from above */
  radial-gradient(42% 36% at 10% 12%, rgba(125, 92, 240, 0.14), transparent 70%),
  radial-gradient(36% 32% at 90% 30%, rgba(70, 201, 176, 0.06), transparent 70%),    /* the teal of the hero nebula */
  radial-gradient(48% 40% at 70% 90%, rgba(36, 26, 77, 0.45), transparent 70%);
```

---

## 7. Desktop and mobile principles

**Shared**
1. One lit subject per viewport. If two things are lit, one of them is wrong.
2. One Gilded button per viewport.
3. Text never sits directly on bright image areas: use the vignette or the 34rem column over the darkened wing.
4. The type hierarchy works in greyscale. Squint-test every page.

**Desktop (≥1024px)**
- Asymmetric compositions: copy left on a 5-column span, the subject right on a 7-column span. Centre only for single statements.
- Creatures are large: 280–360px in plates on the Collection, and ≥520px in the detail view.
- Hover reveals life (creature idle animation); the static state is calm.
- Use the full 160px section rhythm; do not fill dead space.

**Mobile (<640px)**
- Vertical cinema: image on top (≤52svh), copy below, overlapping via a fade. Never place copy over the middle of an image.
- Thumb zone: primary actions within the bottom 40% of the screen; sticky Hatch button when an egg is ready.
- Horizontal scroll-snap rows for sets of 4–6 (rarities, forms) instead of long vertical stacks. Always show a peek of the next item.
- Tap targets ≥44px. Chips are 36px high on mobile.
- Two-column grid for plates; names may wrap to 2 lines (no truncation of creature names).
- Hover-dependent life → on touch, creatures animate when ≥60% visible (IntersectionObserver), with at most 4 animating at once.
- Reduce ambient effects: embers halved, starfield near layer only.

---

## 8. Implementation handoff (for the main session)

This is ordered so each step ships on its own and the site never looks half-migrated for long. It does not touch gameplay, server or claims logic.

### 8.1 Steps
1. **Tokens and fonts.** Add the §2.1 colour tokens, §4.1 motion tokens and the Cormorant font. Point `--font-display` at Cormorant. *This alone changes every headline.* Check the hero and every `font-display` usage for size and weight (Cormorant needs `font-medium` and larger sizes than Unbounded; remove `font-bold` from display text, using 500/600).
2. **Text colours.** Body `#ecebf7` → `bone`; `text-mist` → `text-vellum`; `text-mist/50–70` → `text-dust`; `text-sol-green/80` eyebrows → the eyebrow component (gilt ◆).
3. **Sigil.** Apply the §5.1 refinements to `Sigil.tsx`; replace `LogoMark` in `Logo.tsx` with the Emblem; add `icon.svg`.
4. **Buttons and nav.** Gilded/Outline/Quiet classes; nav CTA → Outline; the nav indicator → gilt Solgem; the mobile menu overlay.
5. **Surfaces.** Add `.sl-plate`; change `rounded-2xl/3xl` → 6px on cards; remove `sl-glass` from content; remove the colour blobs behind cards.
6. **`CreaturePortrait`** wrapper (§2.7) and use it in the Collection, Hatchery creature cards, rarity showcase and detail view.
7. **Backdrop and particles.** Edit `CosmicBackdrop` (no embers, new nebula); remove `ParticleField` usages; reduce the hero embers to 8.
8. **Homepage acts** per §3.1 (hero simplification, lineage staircase, pedestals, frieze, final CTA).
9. **Hatchery** per §3.2 (Nest row, pedestals, Celestial Ring progress, sticky hatch on mobile).
10. **Collection** per §3.3 (plates, filters, the detail spread).
11. **Motion:** the page transition with the horizon line, scroll unveils, the Vigil loader, the hatch timeline.
12. **Supporting pages:** Codex, Return, Annals restyles.

### 8.2 New shared components
| Component | File | Notes |
|---|---|---|
| `Eyebrow` | `src/components/ui/Eyebrow.tsx` | `◆` + label; replaces the inline mono-green paragraphs |
| `SectionHeading` | existing | update to use `Eyebrow`, `display-m` and vellum copy |
| `CreaturePortrait` | `src/components/creature/CreaturePortrait.tsx` | cone, floor, grade (§2.7) |
| `Pedestal` | `src/components/ui/Pedestal.tsx` | ellipse, rim highlight, light cone; `intensity` prop 0–1 |
| `CelestialRing` | `src/components/ui/CelestialRing.tsx` | `progress` 0–1, `ticks` (12 default), `size`; also `mode="loader"` (the Vigil) |
| `Ornament` | `src/components/ui/Ornament.tsx` | the section divider |
| `HorizonLine` | `src/components/layout/HorizonLine.tsx` | page transition line, fixed under the header |

### 8.3 Class migration table
| Remove | Replace with |
|---|---|
| `sl-gradient-text` | plain `text-bone`; emphasis via Cormorant *italic*; at most one `sl-phx-gold` word in the hero |
| `sl-btn-primary` | `sl-btn-outline` (nav) or `sl-btn-gold` (page CTA) |
| `sl-glass` on cards and pills | `sl-plate` (cards) / nothing (pills) |
| `sl-atmosphere`, `sl-grid` | nothing (the backdrop and page light shafts do the work) |
| `rounded-3xl`, `rounded-2xl` on surfaces | `rounded-[6px]` |
| `animate-ping` status dots | static 6px dot |
| `bg-sol-*`, `text-sol-*`, `from-sol-*` | `gilt`, `aurora`, `eclipse` per §2.1 semantic table |
| `font-mono … tracking-[0.35em] text-sol-green/80` (eyebrows) | `<Eyebrow>` |
| amber-400 notice boxes | gilt/20 bordered strip |

### 8.4 Acceptance checklist
- [ ] No Unbounded anywhere; `display` text is Cormorant at weight 500/600.
- [ ] No gradient-filled text except at most one hero word.
- [ ] Solana gradient appears only in Solgem sparks and on-chain indicators.
- [ ] Every viewport has at most one Gilded button.
- [ ] No coloured blur blobs behind cards; no `backdrop-blur` on content surfaces.
- [ ] No particles without a fire source; `ParticleField` is unused.
- [ ] All creatures sit in `CreaturePortrait` with a floor shadow and a key-light cone.
- [ ] Sigil: one metal, gem-only colour; legible at 16px (glyph) and 24px (emblem).
- [ ] Hover never moves a card, only the creature inside it.
- [ ] Reduced motion: no loops, and the final frames are shown.
- [ ] Body and secondary text pass AA on `void` (token table).
- [ ] 390px: no horizontal scroll; the hero CTA is above the fold; the ready-egg Hatch button is reachable with a thumb.

### 8.5 Out of scope / guardrails
- No gameplay, rarity-odds, server, claims or security changes.
- No new paid generation (Runway etc.) is needed for any step above. The raster creature replacement is a later, separately approved project.
- Keep all existing `data-testid`s and test-relied-upon text unless the tests are updated in the same change.
