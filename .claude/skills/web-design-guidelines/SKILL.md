---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance (accessibility, focus, forms, animation, typography, performance, responsive layout). Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with the Vercel Web Interface Guidelines.

## How it works

1. Read `rules.md` in this skill directory. It holds every rule and the output format.
2. Read the files the user named (or ask which files or pattern to review).
3. Check them against all rules in `rules.md`.
4. Output findings in the terse `file:line` format that `rules.md` specifies.

## Solanites notes

- `DESIGN.md` at the repo root is the source of truth for the visual identity. A guideline never justifies
  changing the palette, fonts, dark theme or creature art; report the conflict instead.
- Motion is part of the brand. Check that it honours `prefers-reduced-motion` (see `src/app/globals.css`)
  rather than proposing to remove it.
- Report findings; only edit code when the user asks for fixes.

## Source

Adapted from `vercel-labs/agent-skills` (skills/web-design-guidelines, commit `063bee9`, MIT).
Upstream fetches the rules live on every run; here they are pinned in `rules.md` from
`vercel-labs/web-interface-guidelines` commit `434b7f91364665f2f733b310ec54809bf8f37937` (MIT,
© 2025 Vercel Labs) so the instructions cannot change without a reviewed commit. To update, re-download
`command.md` from that repo, diff it, and commit the new SHA here.
