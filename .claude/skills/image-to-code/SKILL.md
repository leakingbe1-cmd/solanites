---
name: image-to-code
description: Implement a screenshot, mockup or design reference as Solanites frontend code, matching layout, type, spacing and color faithfully while staying inside the established Solanites identity. Use when the user shares an image of a page, section or component and asks to build, match, recreate or "make it look like this".
---

# Image to Code (Solanites)

The user supplies the reference image. Do not generate design images. Do not redesign beyond the reference.

## 1. Read the house style first

Read `DESIGN.md` (repo root) and the relevant existing components before looking at code changes. Reuse
existing tokens (`--color-*` in `src/app/globals.css`), utility classes (`sl-glass`, `sl-btn-primary`,
`sl-gradient-text`, …) and components (`src/components/ui/*`) instead of inventing new ones.

## 2. Analyse the reference like a spec

Before writing code, write down what you see:

- **Text**: headline, subheadline, CTA labels, section titles, nav and footer labels, exactly as shown.
- **Typography**: size and weight relationships, line count and wrapping, tracking, display vs body vs mono.
- **Spacing**: headline→subhead→CTA gaps, section top/bottom padding, gutters, card padding, gaps between cards.
- **Components**: button shape, radius, fill vs outline, primary vs secondary hierarchy; card structure,
  borders, dividers, badges, shadows and glows.
- **Color**: background, panels, accents, text hierarchy, border logic, gradient intensity.
- **Layout**: grid, alignment, section order, what is visible in the first viewport on mobile and desktop.

If a detail is unreadable or ambiguous, say so and ask, or pick the closest existing Solanites pattern and
state the assumption. Do not fill gaps with generic template defaults.

## 3. Map the reference onto the identity

When the reference conflicts with `DESIGN.md` (a light background, a different brand palette or font, stock
photography in place of creature art), keep the Solanites token and tell the user what you changed and why.
Only depart from the identity when the user explicitly asks.

## 4. Implement faithfully

- Preserve layout logic, spacing rhythm, section order, text/image balance and component style.
- Do not "improve" the reference into a generic layout, and do not add sections that are not in it.
- Responsive: decide the mobile layout explicitly (the reference is usually one width). Keep the 16px side
  gutter (`px-4`) and avoid horizontal scroll.
- Keep animations behind the existing `prefers-reduced-motion` handling.
- Keep accessibility: semantic elements, labelled icon buttons, visible focus, alt text.

## 5. Verify by looking

1. `npm run typecheck`
2. `npm run build && npm run test:e2e`
3. Screenshot the result at mobile and desktop widths with `playwright-cli` (see the `playwright-cli` skill),
   compare it against the reference side by side, list the remaining differences, fix, and repeat.

Report remaining differences honestly instead of claiming a pixel match.

## Source

Analysis and anti-drift rules adapted from `Leonxlnx/taste-skill` (skills/image-to-code-skill, MIT,
© 2026 Leonxlnx). The upstream skill targets OpenAI Codex, requires generating design images before coding,
and pushes away from dark centred heroes; those parts were dropped because they conflict with this project.
