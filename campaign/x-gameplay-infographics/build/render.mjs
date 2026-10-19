// Render the five Solanites gameplay infographics (4:5 and 1:1) from infographics.html,
// then run the prepublication validator over the results.
//   node campaign/x-gameplay-infographics/build/render.mjs            # all
//   node campaign/x-gameplay-infographics/build/render.mjs 3 4x5      # one graphic / one ratio
// Needs python3 + Pillow and Playwright's Chromium. Artwork in ../source/art comes from art.mjs.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadPlaywright } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "export");
export const NAMES = { 1: "01-from-egg-to-solanite", 2: "02-six-tiers", 3: "03-every-legend", 4: "04-which-one", 5: "05-inside-solanites" };
const SIZES = { "4x5": [1440, 1800], "1x1": [1440, 1440] };

const [onlyId, onlyRatio] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const domText = {};
const layoutProblems = [];
for (const id of Object.keys(NAMES)) {
  if (onlyId && onlyId !== id) continue;
  for (const [ratio, [w, h]] of Object.entries(SIZES)) {
    if (onlyRatio && onlyRatio !== ratio) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(join(HERE, "infographics.html")).href + `?id=${id}&ratio=${ratio}`);
    await page.waitForSelector("body[data-ready='1']", { timeout: 30000 });
    const broken = await page.evaluate(() => document.body.dataset.broken);
    if (broken) throw new Error(`missing images in ${id} ${ratio}:${broken}`);
    // Anything drawn outside the canvas would be clipped: refuse it.
    const overflow = await page.evaluate(([W, H]) => [...document.querySelectorAll("#content > *")]
      .map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => !e.classList.contains("halo") && !e.classList.contains("art") && (r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1))
      .map(([e]) => e.textContent.trim().slice(0, 40) || e.className), [w, h]);
    if (overflow.length) throw new Error(`elements outside the ${ratio} canvas in ${id}: ${overflow.join(" | ")}`);
    // Cards must fit their content, and no two runs of text may overlap
    // (lines of one tightly set headline are allowed to share their line boxes).
    const layout = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll(".card").forEach(c => { if (c.scrollHeight > c.clientHeight + 1) out.push(`card overflows by ${c.scrollHeight - c.clientHeight}px: "${c.innerText.slice(0, 40)}"`); });
      const runs = [];
      const walker = document.createTreeWalker(document.getElementById("content"), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode; if (!n.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) runs.push({ t: n.textContent.trim().slice(0, 30), b, h: n.parentElement.closest('.h1') });
      }
      for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
        const a = runs[i].b, b = runs[j].b, pad = 2;
        if (a.left < b.right - pad && b.left < a.right - pad && a.top < b.bottom - pad && b.top < a.bottom - pad && runs[i].t !== runs[j].t && !(runs[i].h && runs[i].h === runs[j].h))
          out.push(`text overlap: "${runs[i].t}" / "${runs[j].t}"`);
      }
      return out;
    });
    if (layout.length) layoutProblems.push(...layout.map(l => `${NAMES[id]} ${ratio}: ${l}`));
    domText[`${NAMES[id]}@${ratio}`] = await page.evaluate(() => document.getElementById("content").innerText.replace(/\s+/g, " ").trim());
    mkdirSync(join(OUT, ratio), { recursive: true });
    const png = join(OUT, ratio, `${NAMES[id]}.png`);
    await page.locator("#stage").screenshot({ path: png });
    const jpg = png.replace(/\.png$/, ".jpg");
    execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=93,subsampling=0,optimize=True)", png, jpg]);
    rmSync(png);
    console.log("rendered", jpg.slice(join(HERE, "..").length + 1));
    await page.close();
  }
}
await browser.close();
mkdirSync(join(HERE, ".cache"), { recursive: true });
writeFileSync(join(HERE, ".cache", "dom-text.json"), JSON.stringify(domText, null, 2));
if (layoutProblems.length) { console.error(layoutProblems.join("\n")); process.exit(1); }
console.log("layout: no clipped cards, no overlapping text");
