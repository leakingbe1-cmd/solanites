# Four-stage redesign: inventory and checklist

Every species is drawn as four separate vector forms (Eggling, Hatchling, Evolved, Ascended), using Velynx as the benchmark. The Evolved form is each species' existing mature drawing; the other three are new drawings with their own silhouette, pose and anatomy, not scaled or tweaked copies. Each drawing lives in `src/components/creature/species/<id>.tsx` and is selected per stage by `byStage()` in `kit.tsx`. A per-stage `stageFit` keeps each form framed.

This is procedural SVG art in the shared Solanites house style. It is not painted or rendered illustration. Raster assets can still replace any stage through `npm run art:build` (see `README.md`).

| # | Species | Id | Rarity | Element | Before | After | Batch |
|---|---|---|---|---|---|---|---|
| 1 | Mossling | mossling | Common | Verdant | 1 drawing, scaled | 4 drawings | 1 |
| 2 | Driftfin | driftfin | Common | Tidal | 1 drawing, scaled | 4 drawings | 1 |
| 3 | Pallow | pallow | Common | Lumen | 1 drawing, scaled | 4 drawings | 1 |
| 6 | Frostkit | frostkit | Common | Frost | 1 drawing, scaled | 4 drawings | 1 |
| 8 | Stormquill | stormquill | Rare | Storm | 1 drawing, scaled | 4 drawings | 1 |
| 11 | Emberlisk | emberlisk | Rare | Ember | 1 drawing, scaled | 4 drawings | 1 |
| 4 | Glimmeray | glimmeray | Common | Lumen | 1 drawing, scaled | 4 drawings | 2 |
| 5 | Sproutwyrm | sproutwyrm | Common | Verdant | 1 drawing, scaled | 4 drawings | 2 |
| 7 | Abyssal Vael | abyssal-vael | Rare | Tidal | 1 drawing, scaled | 4 drawings | 2 |
| 9 | Duskwing | duskwing | Rare | Shadow | 1 drawing, scaled | 4 drawings | 2 |
| 16 | Aurelion | aurelion | Legendary | Solar | 1 drawing, scaled | 4 drawings | 2 |
| 20 | Astravex | astravex | Mythic | Nebula | 1 drawing, scaled | 4 drawings (Evolved redrawn too) | 2 |
| 26 | Nyxara | nyxara | Epic | Shadow | new species | 4 drawings | new |
| 27 | Thalor | thalor | Legendary | Tidal | new species | 4 drawings | new |
| 28 | Helivane | helivane | Mythic | Solar | new species | 4 drawings | new |

## Batch 1: Mossling, Driftfin, Pallow, Frostkit, Stormquill, Emberlisk

![Batch 1](stages/batch1.webp)

- **Mossling:** moss-ball with one sprout → leafy calf with twig antlers → shingled forest beast → ancient guardian with a sapling on its back, root feet and a flowering antler crown.
- **Driftfin:** round tadpole → slim eel-fish with one fin → twin-sailed eel → sea dragon rising in an S-curl with crest, whiskers and fin veils.
- **Pallow:** down-fringed pearl with a sleepy eye → pearl ringed by seven first feathers → feather sunburst → seraph with tiered wing-fans, a plume crown and long glowing tassels.
- **Frostkit:** fluffy kit sitting facing forward → lean alert kit with first spines → crystal fox → regal ice fox with a crystal crown, mane, three crystal tails and frost breath.
- **Stormquill:** round chick with three quills → gangly juvenile on knobbly legs → stilt-legged crested heron → griffin-like storm bird with raised barred wings and a lightning crest.
- **Emberlisk:** chubby newt with ember spots → long salamander with its head raised → low armoured salamander → raised armoured titan with a molten crest, horned head and spiked tail club.

## Batch 2: Glimmeray, Sproutwyrm, Abyssal Vael, Duskwing, Aurelion, Astravex

![Batch 2](stages/batch2.webp)

- **Glimmeray:** round baby ray → banking juvenile → broad manta → gliding manta in an S-wave with light ribbons trailing from its wingtips.
- **Sproutwyrm:** plump grub with one sprout → low arching worm with buds → high-arched tulip-hooded inchworm → rearing leaf-winged wyrm with a blossom hood and a branching crown.
- **Abyssal Vael:** single coil with a big round head → low S-body with a half-grown crest → swan-necked coil → towering hooded serpent with a fanned crest crown and silk tail ribbons.
- **Duskwing:** fuzzy larva-moth → newly unfolded moth with soft wings → four-winged velvet moth → twilight sentinel with raised scalloped wings, eye-spots and trailing tails.
- **Aurelion:** plump baby dragon sitting up → young dragon with half-open wings → winged golden dragon → the Sovereign with a radiating mane, four wings and a five-horn crown.
- **Astravex:** folded fawn with star dapples → leggy fawn with first constellation antlers → proud stag mid-step with a nebula mane → rearing celestial stag with a starry veil and a full constellation crown.

## New species: Nyxara, Thalor, Helivane

![New species](stages/newspecies.webp)

- **Nyxara** (Epic, Shadow): curled indigo kit → gangly young fox → sleek fox mid-stride looking back with a looping ribbon tail → crescent-eared fox with twin ribbon tails in a figure-eight. A quadruped fox, deliberately unlike Velynx.
- **Thalor** (Legendary, Tidal): round armoured fry → sturdy juvenile with a helmet plate → broad-shielded guardian with layered fins → crowned Deepwarden surging upward with cathedral fins and a crescent tail. Heavy and armoured, unlike the slender Driftfin.
- **Helivane** (Mythic, Solar): amber eyas with an oversized beak → juvenile falcon with first flight feathers → perched raptor with a corona → wings raised around a blazing sun disc. Renamed from the requested "Solvane" because it was too close to the existing Solvanth. A raptor carrying a sun, not a phoenix. Classified until discovered, like the other Mythics.
