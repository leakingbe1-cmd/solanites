# Claude Code tooling for Solanites

What is set up, what was evaluated and rejected, and what needs the owner's approval. Evaluated 2026-10-18.

## In the repo

| Item | Where | State |
|---|---|---|
| Project instructions (incl. Karpathy principles) | `CLAUDE.md` | Loaded automatically by Claude Code |
| Design system | `DESIGN.md` | Read by the design skills |
| Secret read-deny rules | `.claude/settings.json` | Applies to Claude Code sessions in this repo |
| `web-design-guidelines` skill | `.claude/skills/web-design-guidelines/` | Vercel rules pinned to commit `434b7f9` |
| `image-to-code` skill | `.claude/skills/image-to-code/` | Adapted from taste-skill; no image generation |
| `playwright-cli` skill | `.claude/skills/playwright-cli/` | From `playwright-cli install --skills` (v0.1.22), `allowed-tools` pre-approval removed |
| Browser tests | `playwright.config.ts`, `e2e/` | `@playwright/test` 1.64.1, desktop + Pixel 7 |
| CI | `.github/workflows/ci.yml` | Typecheck, build, preview build, browser tests; no deploy, read-only token |
| Graphify ignore list | `.graphifyignore` | Excludes secrets, build output, `.claude/` |

## Per-machine tools (not in the repo)

Cloud containers are ephemeral, so reinstall these per session when needed:

```bash
npm i -g @playwright/cli@0.1.22          # interactive browser for Claude
uv tool install graphifyy==0.9.92        # optional code graph (PyPI name has two y's)
```

Playwright CLI needs a config pointing at the preinstalled Chromium in cloud sessions:

```json
{"browser":{"browserName":"chromium","launchOptions":{"executablePath":"/opt/pw-browsers/chromium-1194/chrome-linux/chrome","headless":true}}}
```

Save it outside the repo and pass `--config=<path>` to `playwright-cli open`.

### Graphify: always run with LLM backends off

```bash
export GRAPHIFY_BACKEND=none GRAPHIFY_QUERY_LOG_DISABLE=1
graphify update .                 # code-only graph, local tree-sitter, no network
graphify explain "advance"
graphify path "HatcheryPage" "advance"
```

Graphify auto-detects an LLM backend from environment credentials (Gemini, Anthropic, OpenAI, AWS
Bedrock, the `claude` CLI, …) for non-code files. Claude Code cloud containers carry AWS credentials,
so without `GRAPHIFY_BACKEND=none` docs could be sent to a model provider. Do not run `graphify install`
or `graphify hook install`; they register global skills and git hooks. At the current size (about 60
source files) the graph answers the same questions as `grep`; revisit when a backend or indexer exists.

## Evaluated and not installed

- **claude-mem**: hooks every tool call, defaults to a hosted observer (cmem.ai) that receives session
  content, auto-installs Bun and uv, runs a background worker, and its local database is lost when a cloud
  container is reclaimed. `CLAUDE.md`, `DESIGN.md` and this file cover the persistent knowledge.
- **Taste Skill v2** (`design-taste-frontend`): deals new art directions and pulls stock imagery from
  public APIs. Good for a new launch site from scratch; for Solanites it pushes toward a redesign.
  Reconsider for the next memecoin site.
- **Awesome DESIGN.md**: design systems of other brands. Only the DESIGN.md format was reused.
- **image-to-code (upstream, verbatim)**: Codex-specific, requires generating images first, and steers
  away from dark centred heroes. Adapted instead.

## Needs owner approval before setup

### Sentry (error monitoring)

- Value today: low. The site is a static prototype with mock data and no backend. Becomes useful once real
  wallets, RPC calls or a registry API are live.
- Needs: a Sentry account and project, a DSN (`NEXT_PUBLIC_SENTRY_DSN`, public by design), and for
  readable stack traces a `SENTRY_AUTH_TOKEN` as a GitHub Actions secret to upload source maps.
- Install path: `npx @sentry/wizard@latest -i nextjs` (adds `@sentry/nextjs`, instrumentation files and
  wraps `next.config.ts`). Review its diff before committing.
- Data: browser errors, URLs, user agent, and by default IP address go to Sentry. Set `sendDefaultPii:
  false`, scrub wallet addresses from breadcrumbs, disable Session Replay, and choose the EU region if
  needed. Check current plan limits before signing up; stay on the free tier until approved.

### Helius (Solana RPC, webhooks, indexed data)

- Today the only chain access is the experimental SPL balance read in `src/services/token/rpcBalance.ts`
  against the public mainnet RPC, which is rate-limited and not meant for production.
- Recommend when the live token launches: a dedicated RPC for balance reads, and webhooks or an
  indexer for the production registry's balance snapshots (see README "Production security requirements").
- Caveat: a key in `NEXT_PUBLIC_SOLANA_RPC_URL` is visible to every visitor. Use a server-side proxy or a
  domain/IP-restricted key. Do not change the current RPC setting without approval.

### PostHog (product analytics)

- Useful for launch funnels (landing → hatchery → demo wallet → hatch) once there is real traffic.
- Privacy setup: cookieless/memory persistence, EU cloud if required, autocapture off, an explicit list
  of events with no wallet addresses or balances in properties, session replay off, respect Do Not Track.
- Needs a project API key (public) and owner approval before any production tracking.

## Deferred (no current requirement)

OmniRoute, Supabase, Midjourney, Canva, Figma, Solscan / Solscan API, Jupiter / token verification,
RugCheck. Reconsider when a launch needs them (for example Jupiter verification and RugCheck when the
token is live). Verify the official source and current docs before relying on any of them.
