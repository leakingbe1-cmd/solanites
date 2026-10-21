# Twelve Data check: handoff

Read-only check of Vercel team niga20, project solanites (prj_IrNa6cAPGVre99OIpudhAZIwHelU), 20 Oct 2026 at about 18:30 UTC.

## What I checked and found
- The project is visible to the Vercel connector (no 403).
- TWELVE_DATA_API_KEY was saved on Preview at 18:13:20 UTC.
- The newest READY preview on design/eclipse-vigil-code is dpl_5U8ajWR9MthpJrHbGFdc3LkheLHX
  (solanites-nhbi5d55s-niga20.vercel.app, SHA b2ddffa). It was created at 18:17:32, after the key was saved,
  so it should contain the key. I inferred this from the timestamps and did not inspect the build.
- Runtime logs: the Hobby plan keeps less than 1 hour of logs, so the 24h and 1h queries returned 400. The last
  30 minutes had no preview logs at all. There is no evidence of a successful call, a 401 or a missing-key error.
- Verdict: KEY PRESENT BUT UNTESTED.

## Env var names (no values)
- TWELVE_DATA_API_KEY: on Preview (sensitive) and on Production (sensitive, saved at 16:48:25 UTC)
- MARKET_WIDGET: Preview only (sensitive)
- Not set in any environment: MARKET_PUBLIC_DISPLAY, STUDIO_BASIC_AUTH, TWELVE_DATA_API_BASE

## Licensing limits
- The Preview key's own comment says "Twelve Data Basic – Developer Mode only". I did not check Twelve Data's
  terms myself. Confirm whether public or production display is allowed before using the key on Production.

## Anything unfinished
- No live call has been verified. Load a market page on the preview URL above, then read the runtime logs
  within the hour.
- Decide whether the three missing variables are needed.
- Nothing was changed, deployed or decrypted.
