# Mythic and Secret species

Owner decision, 20 Oct 2026: the six Mythic and Secret species (Astravex, Orbelith, Eventide, Helivane, GENESIS, Ø NULLBORN) are shown fully, like every other rarity. Until then they were kept server-side and shown publicly only as sealed stand-ins; that system has been removed.

## Where they live

| What | Where |
|---|---|
| Species data | `src/lib/species.ts` (`SPECIES`), after the 22 Common–Legendary species |
| Drawing code | `src/components/creature/species/*.tsx` |
| Design bible text | `src/data/creatureDesigns.json` |
| Painted stages | `public/creatures/<id>/`, built by `npm run art:build` from Creature Studio's finals (`creature-studio/art-direction` `ca84448`) |
| Stock pairings | `src/server/market/stockLinks.ts`, served by `/api/market/:speciesId` like every other species |

Eventide's Hatchling was never painted, so that one stage shows its vector drawing. The six have no painted biome yet, so their scenes use the neutral vault.

## What stayed the same

- **Rolls.** `SPECIES` keeps the catalogue order production eggs were issued with (22 Common–Legendary species, then these six), so every seed lands on the same species. `src/lib/__tests__/hatching.test.ts` pins the order.
- **Developer Mode** still requires the owner's credentials.
- **Old demo saves** holding a retired stand-in id (`sealed-mythic`, `classified-20`) are re-rolled from their own seed on load, which lands on a real species of the same tier (`src/state/HatcheryProvider.tsx`).

## Checks

- `npx vitest run src/lib/__tests__/mythicSecret.test.ts`: all 28 species are public with real names, lore, renderers and designs; none is ever "classified"; painted stages are public files (only Eventide's Hatchling missing); catalogue cards use the final evolution stage.
- `STUDIO_QA_CREDENTIALS=… node scripts/qa/mythic-secret.mjs`: against a running build. The Collection shows 28 plates at Ascended, the six by name with painted art; each detail view has name, lore, element, four stages and its stock panel; each market answer carries its approved ticker; no page says "Classified" or "???"; Developer Mode refuses anyone without credentials.
