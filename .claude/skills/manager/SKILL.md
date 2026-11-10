---
name: manager
description: The reviewer that thinks like Billy. Use BEFORE moving anything to "Waiting for owner", before sharing a preview, before saying "done" or "ready to show", and whenever a session says "the owner can look now" - it looks at the actual output (every page, state and image at 390 and 1440, the first ten seconds on a phone), scores it 0-10 against brain/HOW-BILLY-THINKS.md, sends weak work back as `redo` with crops and fixes (retried until it passes), checks provenance ("owner rule" / "Billy said" without a [said] quote) and paid spend, and writes the ```manager block into STATUS.md. Also for "run the manager", "review this like Billy would", "is this at his level".
---

# The manager

Billy, 6 Nov 2026: "the reviewer that thinks like me, so weak work gets sent back before it reaches me… The manager
does that checking, again and again, until it's right; I only see work that already passes." Sessions handed him work
below his level and he repeated himself (Surge: five rounds on the pictures, still visual bugs). This skill is the gate
between a session and "Waiting for owner".

**Who judges.** The agent running this skill judges, by opening the pictures. The scripts only collect and crop. A
review that did not open every screenshot and every image is not a review; say so and do it.

**Read first (every round):** `brain/HOW-BILLY-THINKS.md` sections 1 to 3 and 8 (northcut-hq; fetch it read-only from
GitHub main if this repo has no copy), then `references/rubric.md` here. Only `[said]` lines are his bar; `[inferred]`
and `[proposed]` are weighted lower and never quoted as his.

## When it runs

- Before any session moves work to "Waiting for owner", posts a preview link for him, or claims "done" on something he
  or a client will look at. Run it on the thing he will see: the preview URL, or the built static folder.
- **Straight after the work, every time (Billy, 10 Nov 2026: "Run the review straight after any chat finishes. That's
  how it should have been... It should be done afterwards, checked by a manager, retried, checked, until it gets done to
  the standard that we want."; how it runs is Claude's wording, proposed (not approved)).** When you finish work Billy
  or a client will see, push it, then run the manager on it there and then, in the same chat, with one command:
  ```
  node C:\Users\billb\Documents\northcut-hq\tools\manager\review-now.mjs <repo> [--branch <branch>]
  ```
  (from any folder on the owner's PC; a cloud chat without the PC leaves "review-now <repo> <branch>" in northcut-hq
  STATUS.md Inbox for the PC). It reviews the branch's pushed tip as an independent reviewer (the preview, or a local
  build made the way the host builds it), and on `redo` it fixes on a new branch `manager/fix-<date>-<time>` and reviews
  again until `pass`: three rounds that don't lift the score move the fixer up a model (sonnet, opus, fable), and each
  fixer first sees screenshots of its own last build. It stops only on `pass`, when every fault left is one only Billy
  can fix (a photo, a fact, a pick: they go on his list, never invented), or when Fable's rounds stop improving, and
  says exactly why. Caps: 12 fix rounds, $40, 4 hours (`--max-rounds`, `--max-usd`, `--max-minutes`). It writes the
  `manager` block to STATUS.md on main and files the reviews in northcut-hq `brain/reviews/`. Paste its summary into
  your report; exit 0 = pass, 1 = not passed, 3 = NOT TESTED. Only `pass` goes to "Waiting for owner"; a fix branch is
  Billy's to merge, so say so.
- The steps below are what that reviewer does; a session can also run them by hand (as before) when the PC script
  cannot reach the work.
- The 02:00 nightly (northcut-hq `tools/manager/nightly.mjs`) is only the backstop for anything a chat missed; it uses
  the same reviewer and, for the sites with fixing switched on, the same fix loop.

## The round, step by step

1. **Capture** (from the repo root; Playwright must be installed once: `npm i -D playwright` in the repo's `qa/` or
   repo, or `npm install --prefix tools/manager` in northcut-hq; then `npx playwright install chromium webkit firefox`).
   ```
   node .claude/skills/manager/scripts/capture.mjs --url <preview>   --out qa-out/manager/<YYYY-MM-DD-HHMM>
   node .claude/skills/manager/scripts/capture.mjs --dir dist        --out qa-out/manager/<stamp>     # static build
   options: --browsers chromium,webkit,firefox   --pages /,/menu/   --max-pages 12   --max-images 80
   ```
   It writes `pages/` (first screen + full page at 390 and 1440, phone menu open), `images/` (every `<img>` and
   background image one by one at phone width), `wow/` (frames 0-10 s + a video of the first ten seconds on a phone),
   `contact-sheet.png`, `index.html`, `findings.md` (console errors, sideways scroll, broken, upscaled or stretched
   images, text overlaps, small tap targets, placeholders, default fonts) and `capture.json`. Exit 3 = login wall:
   the preview is private. Then review a static build (`--dir dist|proto|public`) or mark the review NOT TESTED; never
   score a login page. Add `qa-out/` to `.gitignore` if it is not there.
2. **Provenance and spend:** `node .claude/skills/manager/scripts/provenance.mjs . --out qa-out/manager/<stamp>`.
   Flags every "owner rule / owner decision / Billy said / owner approved" line with no `[said]` backing, and every
   money line (Runway, credits, licence, subscription, £/$) with no recorded owner yes. Open `provenance.md`.
3. **Look.** With the Read tool, open, in this order, and write one line of critique per file as you go:
   `wow/frame-00..10.png` (what would he feel at 3 s and at 10 s?), every `pages/*-390-view.png`, every
   `pages/*-390-full.png`, the 1440 pair, `*-menu.png`, then **every file in `images/`** (edges, sharpness, crop,
   wrong photo, badges, stretch, background), then `contact-sheet.png` (does any section read as a different site?).
   Skipping a file because "the others were fine" is the Surge failure. If `images/` has 80 files, open 80.
4. **Crop every fault:** `node .claude/skills/manager/scripts/crop.mjs <png> <x> <y> <w> <h> faults/NN-<slug>.png --zoom 2 --label "<fault>"`
   (coordinates in the source image's pixels; full-page phone shots are 390 wide at CSS scale, `-view` shots are
   780 wide at 2x). A fault without a crop is a claim, not a finding.
5. **Score** with `references/rubric.md`. Wow first: "would the first ten seconds on a phone make him say 'fucking
   hell, yeah'?" If not, the ceiling is 7. Then faults, then the instant rejects (any one = `redo`). Below 8 = `redo`.
6. **Write `review.md`** in the review folder in the shape of `references/review-format.md` (verdict, wow test,
   faults table with crops, every image accounted for, checklist, provenance and spend, fixes, waiting on Billy,
   VERIFIED / NOT TESTED).
7. **Write the block** into STATUS.md on `main` (a small commit straight to main, as Working together says):
   ```
   node .claude/skills/manager/scripts/status-block.mjs STATUS.md --verdict redo --score 6 \
     --reason "<one plain sentence>" --round 1 --reviewer "manager skill (build session)" \
     --preview <url> --report qa-out/manager/<stamp>/review.md [--inbox "manager redo <date>: <fix>"]...
   ```
   It upserts a ```manager fenced block right after the ```status block (the Core reads both; format in northcut-hq
   `templates/STATUS-FORMAT.md`). For `redo` from the nightly, each fix also goes into the Inbox; in a build session the
   fixes go into the session's own task list instead and the Inbox stays clean.
8. **Then act on the verdict.** `redo`: fix every listed item, retake the pictures, run the round again (round +1).
   `pass`: now, and only now, the work can go to "Waiting for owner" with the review folder linked. `stuck` (only when
   every fault left needs Billy: a missing asset, a fact, a direction only he can pick; or when Fable's rounds stop
   improving; or a safety cap was hit): say exactly why in `reason`, put the question under "Waiting for owner" as a
   three-word choice. A redo is no longer "stuck after 3 rounds": the fixer moves up a model instead (review-now does
   this for you).

## Rules the manager keeps

- **It never approves spend.** Any paid tool, credits, licence or subscription found in STATUS.md, logs or docs
  without a recorded yes from Billy on that specific spend is flagged in the review and in `reason`; it is never
  "fine because it was small". (Billy, 6 Nov: the 150 Runway credits "without asking".)
- **It never invents his rules.** A rule the manager thinks he would want is written `[proposed]` in the review,
  not applied as a fault. Section 7 of the brain file lists rules Claude invented that he never approved; a doc
  stating one of those as an owner rule is a provenance flag.
- **It never softens.** "Nothing wrong with the site" was still a fail for him (correct-but-sloppy). A 7 is a `redo`.
- **It never scores a login page, a stale build, or a thumbnail.** If the capture could not reach the real thing, the
  verdict is `stuck` with `reason: NOT TESTED: <why>`.
- **It says what it did not do.** Real phones, Safari and Firefox (unless `--browsers` ran them), GPUs, and anything
  behind a sign-in are NOT TESTED in `review.md`.
- **It is a different pair of eyes when it can be.** In a build session, run the capture and judging in a fresh
  subagent (Fable or the default model) that has not seen the build; the nightly already does this.

## The block (what the Core shows)

```manager
verdict: redo            # pass | redo | stuck
score: 6                 # 0-10, 8 passes
reason: Hero doesn't wow on a phone; two product images soft; "owner rule" in DESIGN.md §4 has no quote.
reviewed: 2026-11-06 23:10
round: 1                 # 1 = the first look, then one per fix round
reviewer: manager skill (build session)   # or: nightly independent (opus)
preview: https://...
report: qa-out/manager/2026-11-06-2300/review.md
```

## Files

| File | What |
|---|---|
| `scripts/capture.mjs` | Playwright capture: pages, states, every image, wow strip + video, automated findings, contact sheet |
| `scripts/crop.mjs` | crop (and zoom, label) a region of any screenshot into `faults/` |
| `scripts/provenance.mjs` | owner-attribution lines vs the brain file's `[said]` lines; money without a yes |
| `scripts/status-block.mjs` | upsert the ```manager block in STATUS.md; add Inbox lines; `--read` |
| `scripts/pw.mjs` | finds a Playwright install (repo, `qa/`, this folder, northcut-hq `tools/manager`) |
| `references/rubric.md` | the 0-10 scale, instant rejects, the 22 checks with their provenance tags |
| `references/review-format.md` | the shape of `review.md` |

Learning loop (Working together rule): when Billy gives a verdict on anything ("nah, because…", "that's it"), the
session that heard it appends it to northcut-hq `brain/HOW-BILLY-THINKS.md` as `[said]` with the date and his words,
so the next review judges by it.
