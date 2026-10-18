# Solanites Design System

The visual identity of Solanites, extracted from the code. Design work (new pages, screenshot
implementation, UI reviews) must stay inside it unless the owner explicitly asks for a change.
Tokens live in `src/app/globals.css`; rarity colours in `src/lib/rarity.ts`.

## 1. Atmosphere

Dark fantasy on-chain bestiary: a near-black void lit by Solana-coloured nebula glows, faint grid lines,
film-grain noise, glass panels and living creatures. Mysterious and premium, never corporate, never light.

- `sl-atmosphere`: three soft radial glows (purple top-left, blue top-right, green bottom).
- `sl-grid`: 64px hairline grid, masked to fade out from the centre.
- `sl-noise`: fixed 4% fractal noise over everything.
- `ParticleField`: drifting particles behind heroes.

## 2. Colour

| Token | Value | Role |
|---|---|---|
| `void` | `#05050a` | Page background, theme colour |
| `abyss` | `#0a0a14` | Inputs, recessed surfaces |
| `panel` | `#0e0d1a` | Solid panels |
| body text | `#ecebf7` | Default text |
| `mist` | `#a6a3c4` | Secondary text, inactive nav |
| `sol-purple` | `#9945ff` | Primary accent |
| `sol-blue` | `#00c2ff` | Secondary accent |
| `sol-green` | `#14f195` | Eyebrows, live/ready states |
| `sol-pink` | `#ff3df2` | Rare highlight (Secret) |

Signature gradient (purple → blue → green) is used for `sl-gradient-text`, `sl-gradient-border`,
`sl-btn-primary` and the active-nav underline. Borders are white at 5–15% opacity (`border-white/10`).
Selection is purple at 45%. Warnings about simulated data use `text-amber-200/70`.

### Rarity

| Rarity | Colour | Second | Effects |
|---|---|---|---|
| Common | `#9fe8c8` | `#7cc4ff` | none |
| Rare | `#5b8cff` | `#a26bff` | none |
| Epic | `#d64bff` | `#14f1d9` | glowing rings, runes |
| Legendary | `#ffc94a` | `#ff8a3d` | rotating golden rays, sparkles |
| Mythic | `#e6ecff` | `#8f7bff` | nebula, starfield, orbit rings |
| Secret | `#14f195` | `#ff3df2` | prism rays, glitch, scanlines |

## 3. Typography

| Family | Token | Use |
|---|---|---|
| Unbounded Variable | `font-display` | Headings, primary button labels, big numbers |
| Inter Variable | `font-sans` | Body copy |
| JetBrains Mono 400 | `font-mono` | Eyebrows, stats labels, timers, metadata |

- Fonts are self-hosted via `@fontsource`; no runtime font CDN in the Next.js app.
- Eyebrow: `font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80`.
- H1: `font-display text-4xl sm:text-5xl font-bold tracking-tight text-white` (hero goes to `xl:text-7xl`).
- H2: `SectionHeading` component, `text-3xl → md:text-5xl font-semibold leading-[1.1]`.
- Body: `text-base sm:text-lg leading-relaxed text-mist`.
- Uppercase labels and buttons use wide tracking (`0.2em`–`0.35em`).

## 4. Components

- **Primary button** (`sl-btn-primary`): pill (`rounded-full`), animated gradient fill, inner white ring,
  purple and green glow, lifts 1px on hover. Label in `font-display text-xs font-semibold tracking-[0.2em]`, uppercase.
- **Secondary button**: pill, `border-white/15`, `text-mist`, uppercase tracked text, white on hover.
- **Glass panel** (`sl-glass`): faint white gradient, `border-white/8`, 14px backdrop blur. Cards use
  `rounded-2xl`/`rounded-3xl`; small controls and chips use `rounded-full`.
- **Card hover** (`sl-card-hover`): rise 4px with an eased curve.
- **Modal**: blurred black backdrop, bottom sheet on mobile, centred on `sm+`, round close button, Escape closes.
- **Creatures and eggs**: original SVG art (`CreatureArt`, `EggArt`); never replace with stock images or emoji.

## 5. Layout

- Container `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`; text blocks cap at `max-w-2xl`.
- Fixed nav, `h-16` / `lg:h-20`; pages start with `pt-24 lg:pt-28`. Nav turns to blurred `bg-void/75` on scroll.
- Mobile first: hamburger menu below `md`, stacked sections, no horizontal scroll (checked by `e2e/smoke.spec.ts`).

## 6. Motion

Motion is part of the brand: creatures bob, flap, blink and glide; eggs float, wobble and shake by stage;
reveals use bursts, flashes, rays and letter animations. All animation must be disabled by the existing
`prefers-reduced-motion` rule in `globals.css`. Sound is off by default and synthesised with Web Audio.

## 7. Do and don't

Do:
- Reuse tokens, `sl-*` utilities and `src/components/ui/*` before creating anything new.
- Keep honest labelling of simulated data ("Demo session · simulated data").
- Keep contrast readable: white or `#ecebf7` for primary text on void; `mist` only for secondary text.

Don't:
- Introduce light themes, new brand colours, new font families or another brand's design system.
- Replace creature art with photography, stock illustration or AI-generated images without approval.
- Add trading, price tickers, "buy now" CTAs or financial promises.
- Remove motion instead of respecting reduced-motion.
