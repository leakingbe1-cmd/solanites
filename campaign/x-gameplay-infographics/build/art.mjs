// Exports genuine Solanites artwork (the site's own CreatureArt / EggArt
// components) as transparent PNGs into ../source/art for the infographics.
//   node campaign/x-gameplay-infographics/build/art.mjs
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { loadPlaywright } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../..");
const OUT = join(HERE, "..", "source", "art");
const TMP = join(HERE, ".harness");

// Everything the five graphics use. Mythic and Secret species are only ever exported as silhouettes.
export const ITEMS = [...new Set([
  // evolution: all four forms
  ...[0, 1, 2, 3].map(s => `c:pyraurum:${s}`),
  ...[0, 1, 2, 3].map(s => `c:neonyx:${s}`),
  ...[0, 1, 2, 3].map(s => `c:frostkit:${s}`),
  // rarity ladder representatives
  "c:mossling:2", "c:duskwing:2", "c:neonyx:2", "c:aurelion:2", "c:astravex:2:sil", "c:genesis:2:sil",
  // choose-your-creature and the "inside" hero
  "c:zephrax:3", "c:cryovant:3", "c:velynx:3",
  // eggs: dormant, cracking, stirring (with silhouette), ready
  "e:1:3", "e:2:3", "e:3:3:pyraurum", "e:4:3:pyraurum",
])];

const js = await build({
  entryPoints: [join(HERE, "harness.tsx")], bundle: true, write: false, format: "iife", target: "es2020", jsx: "automatic", logLevel: "warning",
  alias: { "@": join(ROOT, "src") },
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_SOLANITES_MINT": '""', "process.env.NEXT_PUBLIC_SOLANA_RPC_URL": '""' },
});
const cssPath = join(HERE, "harness.css");
const css = await postcss([tailwind({ base: ROOT })]).process(readFileSync(cssPath, "utf8"), { from: cssPath });
mkdirSync(TMP, { recursive: true });
writeFileSync(join(TMP, "harness.html"), `<!doctype html><meta charset="utf-8"><style>${css.css}</style><div id="root"></div><script>${js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script>`);

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, deviceScaleFactor: 1.25 }); // 1000 px tiles: the largest use is ~640 px
await page.goto(pathToFileURL(join(TMP, "harness.html")).href + "?items=" + ITEMS.join(","));
await page.waitForSelector("body[data-ready='1']");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const item of ITEMS) {
  const file = join(OUT, item.replace(/:/g, "-") + ".png");
  await page.locator(`[data-item="${item}"]`).screenshot({ path: file, omitBackground: true });
  // WebP keeps the alpha channel at a fraction of the PNG size
  execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).save(sys.argv[2],'WEBP',quality=92,method=6)", file, file.replace(/\.png$/, ".webp")]);
  rmSync(file);
  console.log("art", file.slice(ROOT.length + 1).replace(/\.png$/, ".webp"));
}
await browser.close();
