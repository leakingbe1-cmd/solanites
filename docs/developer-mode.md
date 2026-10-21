# Developer Mode

Owner-only tools at `/studio/dev`: previews of all 28 species and 4 stages (Mythic and Secret included), and simulated hatches with developer odds. Nothing in it changes eggs, creatures, discoveries, rewards or the public site. Mythic and Secret species are public like every other (see `docs/mythic-secret-species.md`).

## Turning it on

In Vercel → Project → Settings → Environment Variables, for the environment you want (Preview, for testing):

| Variable | Value |
|---|---|
| `STUDIO_BASIC_AUTH` | `username:passphrase`, 24 characters or more in total, e.g. a username and four random words |
| `DEVELOPER_MODE` | leave unset (or anything other than `off`) |

Redeploy, then open `/studio/dev`; the browser asks for the username and passphrase.

**The repository is public.** Set the real value only in Vercel. Never put it in code, docs, tests, `.env` files, commit messages, chats or tickets.

## Going live: switch it off

Either of these makes every `/studio` route a 404 on that deployment, with or without credentials:

1. **Hard off switch (recommended):** set `DEVELOPER_MODE` to `off` for Production, then redeploy. This wins even if `STUDIO_BASIC_AUTH` is still set.
2. Delete `STUDIO_BASIC_AUTH` for Production, then redeploy.

Doing both is safest. To check: open `/studio/dev` on the live site; it should show "not found" and never ask for a password.

## How access is protected

- HTTP Basic sign-in checked on the server, first by the middleware and again by the Developer Mode page and its simulation endpoint (`src/server/studioAuth.ts`).
- No link to it anywhere on the site. A URL parameter, cookie or browser flag grants nothing.
- Responses are `no-store` and `noindex`.
- Passwords shorter than 24 characters in total (`username:passphrase`) are refused, which leaves Developer Mode switched off.
