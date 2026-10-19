// Builds docs/creature-studio/asset-map.json from the live repository data:
// species metadata (src/lib/species.ts), renderers, stage designs, reference
// strips and raster slots. Re-run after any catalogue change; never hand-edit.
//   node docs/creature-studio/tools/build-asset-map.mjs
import { build } from "esbuild";
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const res = await build({
  stdin: { contents: `export { SPECIES } from "@/lib/species"; export { RARITIES } from "@/lib/rarity"; export { CLASSIFIED_RARITIES } from "@/lib/discovery";`, loader: "ts", resolveDir: root },
  bundle: true, write: false, format: "cjs", platform: "node", alias: { "@": path.join(root, "src") }, logLevel: "warning",
});
const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), "slmap-")), "m.cjs");
writeFileSync(tmp, res.outputFiles[0].text);
const { SPECIES, RARITIES, CLASSIFIED_RARITIES } = createRequire(import.meta.url)(tmp);

const designs = JSON.parse(readFileSync(path.join(root, "src/data/creatureDesigns.json"), "utf8"));
const assets = JSON.parse(readFileSync(path.join(root, "src/data/creatureAssets.json"), "utf8"));
const index = readFileSync(path.join(root, "src/components/creature/species/index.ts"), "utf8");
const stages = designs.stageNames;
const rel = (p) => (existsSync(path.join(root, p)) ? p : null);

const species = SPECIES.map((s) => {
  const exportName = (index.match(new RegExp(`"${s.id}":\\s*(\\w+)`)) ?? [])[1] ?? s.id.replace(/-/g, "");
  const renderer = `src/components/creature/species/${exportName}.tsx`;
  const src = readFileSync(path.join(root, renderer), "utf8");
  return {
    id: s.id,
    dex: s.dex,
    name: s.name,
    epithet: s.epithet,
    rarity: s.rarity,
    rarityLabel: RARITIES[s.rarity].label,
    element: s.element,
    classifiedUntilDiscovered: CLASSIFIED_RARITIES.includes(s.rarity),
    personality: s.personality,
    palette: s.palette,
    original: {
      renderer,
      floating: /floating:\s*true/.test(src),
      designBible: `src/data/creatureDesigns.json#species.${s.id}`,
      referenceStrip: rel(designs.species[s.id]?.reference ?? `docs/creature-art/reference/species/${s.id}.webp`),
      extraReference: s.id === "velynx" ? rel("docs/creature-art/reference/velynx-inspiration.png") : null,
    },
    stages: stages.map((name, n) => ({
      n,
      name,
      originalVector: `${renderer} (stage ${n}, rendered by CreatureArt)`,
      rasterSlot: {
        master: `art/creatures/${s.id}/${n + 1}-${name.toLowerCase()}.png`,
        public: `public/creatures/${s.id}/${n + 1}-${name.toLowerCase()}.webp`,
        supplied: Boolean(assets.species[s.id]?.[n]),
      },
      redesign: {
        candidate: `art/creature-studio/${s.id}/${n + 1}-${name.toLowerCase()}.png`,
        status: "not-started",
      },
    })),
  };
});

const out = {
  generatedBy: "docs/creature-studio/tools/build-asset-map.mjs",
  stageNames: stages,
  counts: {
    species: species.length,
    stageSlots: species.length * stages.length,
    byRarity: Object.fromEntries(Object.keys(RARITIES).map((r) => [r, species.filter((s) => s.rarity === r).length])),
  },
  sharedReferences: ["docs/creature-art/reference/overview-sheet.webp", "docs/creature-art/reference/mossling-detail.webp", "docs/creature-art/reference/species/mythic-unknown.webp"].filter(rel),
  species,
};
writeFileSync(path.join(root, "docs/creature-studio/asset-map.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.counts);
