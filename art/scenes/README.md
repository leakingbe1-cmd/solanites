# Biome plate masters

One painted plate per public species: `art/scenes/<species-id>/plate.png` (1024² or larger, opaque). Masters are not committed (large); `node scripts/creature-scenes.mjs build` encodes them to `public/scenes/<id>/`. Prompts: `docs/creature-scenes/prompts.md`; every generation: `docs/creature-scenes/generation-ledger.md` (with its Runway task id, so a master can be re-downloaded).

Classified species have no masters here: their scenes are private.
