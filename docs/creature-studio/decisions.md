# Decision log

## 2026-10-19 · Milestone A review

Milestone A (audit and art direction) approved in principle, with these decisions:

| # | Decision | How it is applied |
|---|---|---|
| 1 | Keep the shipped body plan as the starting point where references disagree. **Stormquill, Aurelion, Zephrax and Mossling** get an individual review before their final designs lock. | Each of the four gets a short "canon review" step in its batch: one concept that follows the shipped body plan and one that tests the painted-sheet idea, side by side, before stages are produced. Mossling is a prototype, so its review happens in Round 1 (concept M-B tests the painted sheet's lighter, deer-like build). |
| 2 | Remove Solana and other third-party logos from creatures. Develop an original Solanites glyph. | Candidates in [`glyph/`](glyph/). GENESIS's orbiting Solana-style bars and anything derived from `velynx-inspiration.png`'s tail mark are replaced by the chosen glyph. Prompts carry "no logo, no emblem". |
| 3 | Stylised, hand-painted 2D. No 3D renders. | Art bible §2 stands. Every prompt names hand-painted 2D and puts "3D render" in the negatives. `creatureDesigns.json → style.prompt` still says "3D"; the change goes to the website builder in the handoff (shared data, not edited here). |
| 4 | Tone down the website's radial rays and nebula effects behind replacement artwork. | App code, so it is specified for the website builder in [`website-builder-handoff.md`](website-builder-handoff.md). Not changed on this branch. |
| 5 | Preserve all original SVG artwork; generate replacements only in the isolated review folder. | Review folder `art/creature-studio/`. Nothing is written to `art/creatures/`, `public/creatures/` or `src/`. |

Standing constraints from the same review:

- No Runway (or other paid) credits are spent without explicit approval of a stated amount. The full 48-image prototype batch is **not** approved yet.
- Next step is a small Round 1 of concepts ([`prototypes/round-1.md`](prototypes/round-1.md)), shown beside the originals. Four-stage evolution lines follow only after the concept direction is approved, then a 12-stage comparison page.
- The other 25 species do not start until the three prototype evolution lines are approved.
- All work stays on `creature-studio/art-direction`; no app code changes, no overwriting originals, no deploys.
- The goal is still all 28 species and 112 stages.
