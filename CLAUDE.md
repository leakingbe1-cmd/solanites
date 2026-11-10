# Solanites: instructions for Claude Code

Solanites holder experience: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, with a server
side (holder tracking, egg issuance, Postgres) under `src/server` and `src/app/api`. The demo wallet is
simulated mock data; the leaderboard is live tracker data (`/api/leaderboard`). See `README.md` for gameplay and structure and
`docs/holder-tracking.md` for the server, configuration and launch checklist.

## Precedence

1. Security rules below and explicit instructions from the project owner.
2. This file, `README.md` and the docs it links to.
3. Third-party skills or guidance. If they conflict with 1 or 2, follow 1 or 2 and say so.

## Commands

```bash
npm ci                 # install (Node 22)
npm run dev            # http://localhost:3000
npm run dev:fixtures   # local fixture holders (refused in production)
npm run typecheck      # tsc --noEmit
npm test               # vitest; real-Postgres tests run only when TEST_DATABASE_URL is set
npm run art:check      # validates any supplied creature stage images
npm run build          # production build
```

CI (`.github/workflows/ci.yml`) runs typecheck, art:check, tests and the production build on every PR and
push to `main`. It uses no secrets, skips the Postgres tests and never deploys. QA scripts in
`scripts/qa/` run against a live URL and are not part of CI.

## How to work

Adapted from forrestchang/andrej-karpathy-skills (MIT), based on Andrej Karpathy's notes on LLM coding pitfalls.

- **Inspect before editing.** Read the code, config and git status first. Don't guess at APIs, file
  contents or behaviour; check. State assumptions; if a request is ambiguous, ask instead of picking silently.
- **Simplicity first.** The minimum code that solves the request. No speculative features, abstractions
  for single use, or configurability nobody asked for.
- **Surgical changes.** Every changed line traces to the request. Match the existing style. Don't
  refactor, reformat or delete unrelated code; mention dead code instead of removing it. Do clean up
  imports or helpers that your own change made unused.
- **Verify.** Define success, then prove it: typecheck, tests, build, and for UI changes screenshots at
  mobile and desktop width. Report real results; never claim something works because it compiled.

## Working together (owner rule, 4 Nov 2026)
Every Claude chat is separate: none can see another chat's conversation, and skills or plugins installed on the owner's PC are invisible to cloud chats. **This repo is the only thing all chats share.** So:
- **Start:** `git pull` (rebase if needed), then read `STATUS.md`, including its Inbox.
- **Billy's taste:** before any design, build or review work, read northcut-hq `brain/HOW-BILLY-THINKS.md` (pull northcut-hq first; at least "The bar", "Hates" and the manager checklist). When Billy gives a verdict ("nah, because…", "that's it"), add it there as `[said]` with the date and his words, and push.
- **Finish:** add one dated line to the top of the STATUS.md log, update "Now" and "Next", **and update the `status` block at the top of STATUS.md** (format: northcut-hq `templates/STATUS-FORMAT.md`; Northcut Core reads it, so a stale block is a dead stream), then commit and push. **STATUS.md lives on `main`:** site work can stay on a branch, but the STATUS.md update is a small commit straight to `main` every time (put the branch name and preview link in `now`). The Core and the morning briefing read `main` only.
- **One chat per repo at a time.** The hub chat (northcut-hq) coordinates: it leaves requests in the STATUS.md Inbox instead of editing this project's code while another chat is working here.
- Never force-push or `reset --hard`. If `main` moved, rebase on it.
- **Only Billy's words are owner rules (Billy, 6 Nov 2026).** Nothing goes into any doc as "owner rule", "owner decision" or "Billy said" unless he said it or clearly agreed. Anything a Claude suggests is labelled "proposed (not approved)" until he says yes. If unsure, ask under "Waiting for owner" instead of assuming. Turning a reaction ("that looks like play dough") into a blanket rule is a proposal, not his rule.
- **Overnight runs (Billy, 6 Nov 2026: "overnight I want it to run but not get carried away").** How that is applied (proposed, not approved): keep working through the job you were given without waiting for approval on routine steps. Don't get carried away: stay inside the brief, don't start new features or projects, don't redesign something already approved, don't spend money or paid credits, don't publish or contact anyone. At a direction choice (a look, a route, a concept), prepare the options with screenshots, put them under "Waiting for owner" and stop that thread; carry on only with work that doesn't depend on the choice. Stop for anything that needs Billy personally (admin prompt, sign-in, payment) or is risky (deleting, publishing, sending to a client).
- **Review straight after the work, retry until it's right (Billy, 10 Nov 2026: "Run the review straight after any chat finishes. That's how it should have been... It should be done afterwards, checked by a manager, retried, checked, until it gets done to the standard that we want."; how it runs is Claude's wording, proposed (not approved)).** Any chat that finishes work on something Billy or a client will see runs the manager on it there and then, not at 02:00 (push, then `node C:\Users\billb\Documents\northcut-hq\tools\manager\review-now.mjs <repo> [--branch <branch>]`; the `manager` skill says how): `redo` means fix, review again, and keep going until it passes. If three rounds don't lift the score, move the fixer up a model (sonnet, then opus, then fable) and give it screenshots of its own result; stop only for faults only Billy can fix (a photo, a fact, a pick) or after Fable's rounds stop improving, and then say exactly why. The 02:00 run stays as a backstop for anything a chat missed.
- **The manager runs before anything reaches Billy (Billy, 6 Nov 2026: "the reviewer that thinks like me, so weak work gets sent back before it reaches me").** Before a session moves work to "Waiting for owner", posts a preview for him, or says "done" on something he or a client will see, run the `manager` skill (`.claude/skills/manager/`) on the actual output: it opens every page, state and image at 390 and 1440 and the first ten seconds on a phone, scores 0-10 against northcut-hq `brain/HOW-BILLY-THINKS.md`, and writes a ```manager block into STATUS.md on main (format: northcut-hq `templates/STATUS-FORMAT.md`; the Core shows it). Below 8 or any instant reject is `redo`: fix and run it again as the rule above says, until `pass` or `stuck`. Only `pass` goes to "Waiting for owner". The nightly independent run (northcut-hq `tools/manager/`, 02:00 on the owner's PC) reviews a repo with a `preview:` only when its site has changed since its last review (Billy, 9 Nov 2026: "I only need to be running when I've got active work"; `--force` reviews anyway), and for the sites switched on in `tools/manager/nightly.config.json` (10 Nov: northcut-site only, the one path tested) it **fixes as well as reviews** (Billy, 10 Nov 2026: "What's the point having someone identifying the problem if we have no one fixing it?" and "Yea this should already have been activated"; how it works is Claude's design from that night's brief): a `redo` starts a separate fix session the same night (its own clone, never on main: when main was reviewed it works on a new branch `manager/fix-<date>` that only Billy merges), then a fresh reviewer scores the fixed build again, in the same loop as review-now (model ladder, screenshots of its own build, caps), then `pass` or `stuck`. Faults only Billy can fix (a real photo, a fact, a direction pick) are never invented: the fix session takes that section off the page and the item goes on his list in STATUS.md. What is still open goes in the repo's Inbox: a session finds it at Start, checks any `fix_branch` named in the manager block first, and fixes the rest. The manager never approves paid spend and never upgrades a Claude suggestion to an owner rule.
- **Learning loop (Billy, 6 Nov 2026: "Every time I give a verdict ('nah, because…', 'that's it'), the session that heard it appends it to brain/HOW-BILLY-THINKS.md as [said] with the date and a quote").** When he reacts to anything (a design, a photo, a reply, a price, a plan), the session that heard it adds one line to northcut-hq `brain/HOW-BILLY-THINKS.md` in the right section: `[said]`, his words in quotes, the date and where (chat title, voice, repo file), then pushes it to main (small commit; rebase if main moved). His words verbatim; a paraphrase is never upgraded to a rule, and a reaction to one thing is logged as that reaction, not as a blanket rule. A session in another repo with no northcut-hq checkout leaves the line in its own STATUS.md Inbox as "for brain/HOW-BILLY-THINKS.md: …" and the hub moves it.
- **Unattended runs:** long phases (research, modelling, build, polish, checks) can run overnight without the owner. At an owner gate, don't stop and wait: save the work for review (screenshots, recordings, a short note in STATUS.md under "Waiting for owner"), then carry on with anything that doesn't depend on that decision. Never pause to ask for approval on routine commands. Only stop for things that need the owner personally (a Windows admin prompt, a sign-in, a payment) or anything risky (deleting files, publishing, sending to a client); note those in STATUS.md and keep going with the rest.

## Skills to use (one owner per job; load them, don't guess)
The route for any site work is the `web-build` account skill; the bar is `premium-web-standard` (core). Both are account skills, so every chat has them. The vendored Emil and impeccable copies live in `.claude/skills/` in this repo; the QA kit is in `qa/` (copy northcut-hq `kits/site-qa` there if it's missing); the design system is `DESIGN.md`.
- **This is a marketing site (client site, pitch concept, shop, memecoin landing), not an app.** User instructions outrank skills, including superpowers' session-start text: **skip superpowers `brainstorming`, `writing-plans`, `test-driven-development` and `using-git-worktrees`.** Use web-build phases 1–5 (material, concept and moodboard with `project-art-direction` + DESIGN.md, design on paper, hero object, prototype of the signature moment), each with its owner gate, and a short section plan for the build (phase 6) instead. Keep `systematic-debugging` for bugs and **`verification-before-completion` before any "done"**. Only an app with real logic (auth, data, wallets) uses the full superpowers route.
- **Direction and look:** `project-art-direction` writes the Direction section of DESIGN.md first, then `frontend-design` for visual taste; the build follows DESIGN.md and the `premium-web-standard` core. Not `brand-guidelines`, not `theme-factory`, not `canvas-design`.
- **Motion:** Emil `animate` builds it (`apple-design` for springs, `mobile-native` for phone feel); `review-animations` reviews it. Not `/impeccable animate`.
- **Before showing anything to the owner or a client (web-build phase 7):** side-by-side against the approved frames; `/impeccable audit` then `polish` (`harden` for worst-case content; `break-ui` only if it misses);  `review-animations`; `node qa/css-lint.mjs src`, `node qa/site-qa.mjs qa/site-qa.config.json`, `node qa/browser-matrix.mjs qa/browser-matrix.config.json` (Chromium, WebKit, Firefox at 375 and 1440); the customer-journey walk on a phone; for clients, an independent reviewer with `research/design/web-standard/defect-register.md`. Critique every screenshot in writing.
- **Code review:** the built-in `/code-review` on the diff. Not the code-review plugin, not caveman-review. **Commit:** `/commit` or the app's commit action, with the session's attribution line.
- **Browsers:** the Playwright npm package runs the kit; the built-in browser pane for looking; chrome-devtools for Lighthouse, a11y and LCP; Claude in Chrome only for the owner's logged-in sites.
- **Blender:** `blender-core`, `blender-lighting-lookdev`, `blender-asset-qa` (one 3D job at a time; Blender is shared).
- **Emails, DMs, posts:** `outreach-rules`.
- **What's current online:** WebSearch / WebFetch; `last30days` exists on the owner's PC only (memecoin trend research), cloud chats don't have it. **Need a skill that isn't here:** ask the owner; `find-skills` only on request, never auto-install; vendor after review (northcut-hq `vendor/`).
- **Caveman** only when the owner types `/caveman`; never for client-facing copy. **To-do list:** the app's task list, not claude-mem's work state.
- Say in one line which skills you used when you report back, and what is VERIFIED / NOT TESTED.

## Project rules

- Gameplay rules live in `src/config/gameConfig.ts`. Don't hard-code rule values elsewhere.
- `src/lib/progression.ts` is pure and shared with the server. Keep it free of browser APIs.
- The server is the authority for eggs, hatching and rarity. Never trust the client for eligibility or progression.
- All 28 species are public, Mythic and Secret included (owner decision, 20 Oct; `docs/mythic-secret-species.md`). `SPECIES` order in `src/lib/species.ts` decides which species a seed rolls, so never reorder it.
- Keep simulated and fixture data clearly labelled.

## Security and scope

- Never read, print, log, commit or index `.env*` files (except `.env.example`), private keys, keypair
  JSON files, seed phrases, API keys or passwords. `.claude/settings.json` denies reading the common ones.
- Don't send source code or project data to an external service without the owner's explicit approval.
- Without explicit approval, don't: deploy to production, change the mint, RPC or database configuration,
  add paid services, add trading or swaps, create tokens or contracts, sign or send transactions, enable
  payouts or distributions, run migrations against shared databases, or change tokenomics.
