// Renders the CURRENT shipped vector artwork (src/components/creature) for every
// species × stage to PNG, so redesigns can be compared against the originals.
// Read-only with respect to the app: it imports components, never edits them.
//   node docs/creature-studio/tools/render-baseline.mjs <outDir>
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const out = path.resolve(process.argv[2] ?? "baseline");
await mkdir(out, { recursive: true });

const entry = `
import { renderToStaticMarkup } from "react-dom/server";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { SPECIES } from "@/lib/species";
export const SPECIES_LIST = SPECIES.map(({ id, dex, name, rarity, element }) => ({ id, dex, name, rarity, element }));
export function svg(id, stage) {
  const s = SPECIES.find((x) => x.id === id);
  return renderToStaticMarkup(<CreatureArt species={s} stage={stage} animated={false} vector />);
}`;
const res = await build({
  stdin: { contents: entry, loader: "tsx", resolveDir: root },
  bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  alias: { "@": path.join(root, "src") }, logLevel: "warning",
});
const bundle = path.join(out, ".baseline-bundle.cjs");
await writeFile(bundle, res.outputFiles[0].text);
const require = createRequire(import.meta.url);
const mod = require(bundle);

let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = await import(path.join(process.env.NODE_PATH ?? "/opt/node-tools/node_modules", "playwright/index.mjs"))); }
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
const manifest = [];
for (const sp of mod.SPECIES_LIST) {
  for (let st = 0; st < 4; st++) {
    const html = `<html><body style="margin:0;background:#07060d"><div style="width:400px;height:400px">${mod.svg(sp.id, st)}</div></body></html>`;
    await page.setContent(html.replace("<svg", '<svg width="400" height="400"'));
    const file = `${sp.id}-${st + 1}.png`;
    await page.screenshot({ path: path.join(out, file) });
    manifest.push({ ...sp, stage: st, file });
  }
}
await browser.close();
await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(`rendered ${manifest.length} stages to ${out}`);
