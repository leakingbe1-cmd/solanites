# Solanites: instructions for Claude Code

Front-end prototype for the Solanites holder experience (Next.js 15 App Router, React 19, TypeScript,
Tailwind CSS v4). All wallet, balance, timer and leaderboard data is simulated unless
`NEXT_PUBLIC_SOLANITES_MINT` is set. See `README.md` for gameplay rules and structure.

## Precedence

1. Security rules below and explicit instructions from the project owner.
2. This file, `DESIGN.md` and `README.md`.
3. Skills in `.claude/skills/` (some are adapted from third parties). If a skill conflicts with 1 or 2, follow 1 or 2 and say so.

## Commands

```bash
npm ci                      # install (Node 22)
npm run dev                 # http://localhost:3000
npm run typecheck           # tsc --noEmit
npm run build               # production build (also type-checks)
npm run build:preview       # single-file HTML bundle in preview/dist/
npm run test:e2e            # Playwright, desktop + mobile; run `npm run build` first
```

In Claude Code cloud sessions Chromium is preinstalled; run browser tests with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run test:e2e`.
Elsewhere run `npx playwright install chromium` once. CI (`.github/workflows/ci.yml`) runs typecheck,
build, preview build and the browser tests on every PR and push to `main`. It never deploys.

## How to work

Adapted from forrestchang/andrej-karpathy-skills (MIT), based on Andrej Karpathy's notes on LLM coding pitfalls.

- **Inspect before editing.** Read the code, config and git status first. Don't guess at APIs, file
  contents or behaviour; check. State assumptions; if a request is ambiguous, ask instead of picking silently.
- **Simplicity first.** The minimum code that solves the request. No speculative features, abstractions
  for single use, or configurability nobody asked for. If 200 lines could be 50, write 50.
- **Surgical changes.** Every changed line traces to the request. Match the existing style. Don't
  refactor, reformat or delete unrelated code; mention dead code instead of removing it. Do clean up
  imports or helpers that your own change made unused.
- **Verify.** Define what success looks like, then prove it: typecheck, build, browser tests, and for UI
  changes a screenshot at mobile and desktop width. Report real results; never claim something works
  because it compiled or installed.

## Project rules

- Gameplay rules live only in `src/config/gameConfig.ts`; the How It Works page reads them. Don't hard-code rule values elsewhere.
- `src/lib/progression.ts` is a pure module meant to be reused on a server. Keep it free of browser APIs.
- The UI reads state through `useHatchery()`; chain, wallet and registry access go through the interfaces in `src/services/`.
- Visual identity: follow `DESIGN.md`. Preserve the dark fantasy aesthetic, layout, creature art and motion.
- Keep simulated data clearly labelled as simulated.

## Security and scope

- Never read, print, log, commit or index `.env*` files (except `.env.example`), private keys, keypair
  JSON files, seed phrases, API keys or passwords. `.claude/settings.json` denies reading the common ones.
- Don't send source code or project data to an external service (LLM backends, analytics, error
  reporting, hosted memory) without the owner's explicit approval.
- Without explicit approval, don't: deploy, change the RPC endpoint or mint, add paid services, add
  trading or swaps, create tokens or contracts, sign or send transactions, migrate data, or change tokenomics.
- The client must never be trusted for eligibility or progression (see "Production security requirements" in `README.md`).

## Skills in this repo

- `web-design-guidelines`: accessibility/UX/performance review against pinned Vercel rules.
- `image-to-code`: implement a screenshot or mockup faithfully within `DESIGN.md`.
- `playwright-cli`: drive a real browser interactively (`npm i -g @playwright/cli@0.1.22`).

Tool setup, rejected tools and approval-gated integrations (Sentry, Helius, PostHog): `docs/claude-tooling.md`.
