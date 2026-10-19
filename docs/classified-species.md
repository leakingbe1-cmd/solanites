# Classified species (Mythic and Secret)

The six Mythic and Secret species are kept on the server: their details (names, epithets, palettes, lore, stats, design text and drawing code) are not part of any public JavaScript bundle, page, API response or asset path.

## Where they live

| What | Where | Ships to browsers? |
|---|---|---|
| Species data | `src/server/classified/species.ts` | No (`server-only`) |
| Drawing code | `src/server/classified/renderers/*.tsx` | No (`server-only`) |
| Design bible text | `src/server/classified/designs.json` | No |
| Public stand-ins | `src/lib/species.ts` (`CLASSIFIED_SLOTS`, `SEALED`) | Yes: catalogue numbers and tiers only, drawn as a generic sealed form |

## How a viewer can see one

The server sends a classified species as a finished bundle (data, design text, and art rendered to SVG markup on the server by `src/server/classified/markup.ts`) in exactly two cases:

1. **Developer Mode** (`/studio/dev`), after the owner's server-side sign-in. Its simulations use the full catalogue.
2. **A holder's own hatched egg.** `GET /api/holders/:address` and `POST /api/eggs/:id/hatch` name a classified species only once its egg has hatched, and include its bundle. Before that the egg reads as `sealed-mythic` or `sealed-secret`.

Everywhere else (the Collection, the homepage rarity cards, the leaderboard's simulated entries, and demo-mode hatches) a classified tier shows the sealed stand-in. Demo hatches keep the published odds: a demo egg that rolls Mythic hatches as "Sealed Mythic".

The production roll on the server is unchanged: `rollSpecies(seed, gameConfig, ALL_SPECIES)` uses the same catalogue order as before, so every seed gives the same species.

## Checks

- `npx vitest run src/server/__tests__/classified.test.ts`: no client source names a classified species. The server-rendered art matches React's own output, and the API discloses as described above.
- `STUDIO_QA_CREDENTIALS=… node scripts/qa/classified-privacy.mjs`: checks a running build. Signed out, it scans every page, every built JS/CSS file (Developer Mode's chunk included), the APIs and the public asset paths. Signed in, it checks Developer Mode. It then repeats the public sweep after the owner's visit.

## What this does not cover

- **The GitHub repository is public**, so this source, and the docs and art briefs under `docs/`, are readable there. Keeping the designs confidential before launch also needs the repository made private, or the classified files moved to a private store. That is the owner's decision.
- The holder and hatch APIs need no signature, by design. Once any holder hatches a classified species, anyone who knows that holder's address can fetch it.
