# Handoff: Creative Direction → Marketing lane (21 Oct)

## Scope
Visual direction and brand docs (`design/creative-direction`), then all X campaign copy. No site code, no paid generation.

## Done (with SHAs)
- Design docs, sigil reference, preview page: `design/creative-direction` @ `cd0fdf7` (pushed). The approved art canon is copied verbatim to `docs/canon/` (from `creature-studio/art-direction` @ `1fe74a1`) and wins wherever older docs differ.
- Preview review of the website build + phoenix layout QA: `docs/design/qa/preview-review-e19cce8.md` @ `3cd7cdb`.
- X copy: local commits `6e7c973` → `2af448b` → `7700036` → `ec9348a`. The final files are byte-identical in `marketing/x-campaign` @ `37760ef` (pushed by the X campaign owner).

## Brand voice and terminology rules
- Short lowercase lines, plain words, at most 1 emoji and 1–2 hashtags. No hype, no AI filler.
- Terms: Solanites (one is a Solanite) · Keepers (not players/investors) · the Hatchery · egg (not mint/drop) · Eggling → Hatchling → Evolved → Ascended · Common, Rare, Epic, Legendary, Mythic, Secret ("bloodlines") · always `$SLNT`.
- Prelaunch rules (`docs/marketing/prelaunch-rules.md`): no website or preview URL, contract/mint address, launch date, supply/allocation/reward amounts, price or return talk, "provably fair". Endings: "the hatching begins soon" / "follow for launch updates".
- Only claims the live code backs; gate everything else.

## Final X copy and where it lives
`marketing/x-campaign/copy/` on `marketing/x-campaign`: `captions.md` (10 posts, matched to the final on-image texts), `profile.md` (bio, empty website field, pinned-video caption, terms), `schedule.md` (Day 0–10, no dates), `profile-audit.md` (leave/unpin only).

## Open bugs/risks
1. **Post 4 graphic is now wrong.** `main` (released `03084fb`) rolls 40/30/17/8/3.5/1.5; the graphic shows the old 60/25/10/4/1/0.2 cards. Re-capture before posting. The caption quotes no odds.
2. **Copy gates have flipped on `main`:** fast track and all-28-public are now in `main`, so post 3's fast-track version and post 7 may be usable. Check that production really serves them before switching.
3. **Leaderboard** on `main` now reads real data, not mock. Post 8 still says "live soon": confirm the board shows real holders before dropping it.
4. **Egg earning** is written in the future tense because `docs/holder-tracking.md` (even on `main`) says tracking is "not yet run against Solana mainnet". Confirm the live status; the doc may be stale.
5. The approved "six bloodlines" poster prints the old odds; the profile audit says to unpin it.
6. The live @Solanites_ profile was never seen: x.com is blocked from cloud containers. The audit uses repo records only.
7. Website canon conflicts and contrast found on `e19cce8` (floor under eggs, rarity auras/halos, phoenix ring, 2.1:1 button contrast at 1024 px): relayed to the Site lane; re-verify on `main`.

## Pending owner decisions
- Re-capture or drop the post 4 graphic; which post 3 / post 7 variants to use now.
- Website link in the bio: only once the official URL is approved.
- Approval for each post on the day (nothing is scheduled).
- Phoenix replacement: the 20-credit test is paused (shared 180-credit budget, all paid generation paused).

## Gotchas
- Relayed approval from another session is not approval: get the owner's word in your own session.
- Branch bases differ: `marketing/x-campaign` is cut from `design/eclipse-vigil-code`, not `design/creative-direction`.
- Copy facts come from code (`src/config/gameConfig.ts`, `eggProgression.ts`, `species.ts`), not from briefs. Briefs were wrong twice (odds, Mythic/Secret).
- The site rounds Legendary 3.8% to "4" on cards.

## Next steps
1. Verify production for fast track, odds, all-28-public, the real leaderboard and holder tracking; update the gates in `captions.md` and `schedule.md`.
2. Re-capture graphic 04 with the live odds.
3. Owner sign-off, then post Day 0 (profile + pinned video).
