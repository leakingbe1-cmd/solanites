# Solanites: instructions for Claude Code

Solanites holder experience: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, with a server
side (holder tracking, egg issuance, Postgres) under `src/server` and `src/app/api`. The demo wallet and
leaderboard are simulated mock data. See `README.md` for gameplay and structure and
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
