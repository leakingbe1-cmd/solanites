// Renders the existing code-drawn creatures (CreatureArt, default "vigil" ornament:
// no aura, ground shadow or halo) at high resolution with a TRANSPARENT background,
// one PNG per species x stage. Read-only: it imports the given checkout's components.
//
//   NODE_PATH=$(npm root -g) node docs/creature-studio/tools/render-vector-hires.mjs <checkout> <outDir> [size=2048] [id,id,...]
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const size = Number(process.argv[4] ?? 2048);
const only = process.argv[5] ? process.argv[5].split(",") : null;
await mkdir(out, { recursive: true });

const entry = `
import { renderToStaticMarkup } from "react-dom/server";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { SPECIES } from "@/lib/species";
export const IDS = SPECIES.map((s) => s.id);
export function svg(id, stage) {
  const s = SPECIES.find((x) => x.id === id);
  return renderToStaticMarkup(<CreatureArt species={s} stage={stage} animated={false} showAura={false} vector />);
}`;
const res = await build({
  stdin: { contents: entry, loader: "tsx", resolveDir: root },
  bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  alias: { "@": path.join(root, "src") }, logLevel: "warning",
});
const bundle = path.join(out, ".bundle.cjs");
await writeFile(bundle, res.outputFiles[0].text);
const mod = createRequire(import.meta.url)(bundle);

const { chromium } = await import(path.join(process.env.NODE_PATH, "playwright/index.mjs"));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: size, height: size } });
let n = 0;
for (const id of mod.IDS) {
  if (only && !only.includes(id)) continue;
  for (let st = 0; st < 4; st++) {
    const html = `<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${mod.svg(id, st).replace("<svg", `<svg width="${size}" height="${size}"`)}</div></body></html>`;
    await page.setContent(html);
    await page.screenshot({ path: path.join(out, `${id}-${st + 1}.png`), omitBackground: true });
    n++;
  }
}
await browser.close();
console.log(`rendered ${n} stages at ${size}px to ${out}`);
