// Render every Solanites X graphic from ../template/template.html.
//   node marketing/x-campaign/build/render.mjs          # 10 posts + banner + avatar + master + contact sheet
// Posts are 1600×900 JPGs in ../posts/, the banner (1500×500) and avatar (400×400) PNGs in ../profile/.
// (images inside a .shot frame are clipped by it on purpose and are not checked)
// Fails if an image is missing, anything is drawn outside the frame, or two runs of text overlap.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TPL = pathToFileURL(join(ROOT, "template", "template.html")).href;
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright")); }

const browser = await pw.chromium.launch({ args: ["--allow-file-access-from-files"] });
const problems = [], text = {};
async function shoot(query, w, h, out, kind) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`${TPL}?${query}`);
  await page.waitForSelector("body[data-ready='1']", { timeout: 60000 });
  const broken = await page.evaluate(() => document.body.dataset.broken);
  if (broken) problems.push(`${out}: missing images:${broken}`);
  const layout = await page.evaluate(([W, H]) => {
    const out = [];
    for (const e of document.querySelectorAll("#content *")) {
      if (e.closest(".glow") || (e.tagName === "IMG" && e.parentElement.classList.contains("shot")) || e.tagName === "IMG" && (e.closest(".hero")?.style.left === "640px" || !e.closest(".hero, .lockup, .copy"))) continue;
      const r = e.getBoundingClientRect(); if (!r.width) continue;
      if (e.matches(".hero, .hero *, .copy, .copy *, .lockup, .lockup *, .foot, .foot *") && (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1)) out.push(`outside frame: <${e.tagName.toLowerCase()} class="${e.className}"> "${(e.textContent || e.getAttribute("src") || "").trim().slice(0, 30)}"`);
    }
    const runs = []; const w = document.createTreeWalker(document.getElementById("content"), NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode; if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n);
      for (const b of rg.getClientRects()) if (b.width > 1) runs.push({ t: n.textContent.trim().slice(0, 24), b, h: n.parentElement.closest("h1") }); }
    for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) { const a = runs[i].b, b = runs[j].b;
      if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2 && !(runs[i].h && runs[i].h === runs[j].h)) out.push(`text overlap: "${runs[i].t}" / "${runs[j].t}"`); }
    return out;
  }, [w, h]);
  problems.push(...layout.map(l => `${out}: ${l}`));
  text[out] = await page.evaluate(() => document.getElementById("content").innerText.replace(/\s+/g, " ").trim());
  const png = join(ROOT, out.replace(/\.jpg$/, ".png"));
  mkdirSync(dirname(png), { recursive: true });
  await page.locator("#frame").screenshot({ path: png });
  if (kind === "jpg") { execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=93,subsampling=0,optimize=True)", png, join(ROOT, out)]); rmSync(png); }
  console.log("rendered", out);
  await page.close();
}

const posts = await (async () => { const p = await browser.newPage(); await p.goto(`${TPL}?post=01`); await p.waitForSelector("body[data-ready='1']"); const r = await p.evaluate(() => Object.entries(window.POSTS).map(([id, v]) => [id, v.slug])); await p.close(); return r; })();
for (const [id, slug] of posts) await shoot(`post=${id}`, 1600, 900, `posts/${id}-${slug}.jpg`, "jpg");
await shoot("banner", 1500, 500, "profile/x-header-1500x500.png", "png");
await shoot("avatar", 400, 400, "profile/x-avatar-400x400.png", "png");
await shoot("blank", 1600, 900, "template/master-template-1600x900.png", "png");
await browser.close();

mkdirSync(join(HERE, ".cache"), { recursive: true });
writeFileSync(join(HERE, ".cache", "rendered-text.json"), JSON.stringify(text, null, 2));
execFileSync("python3", [join(HERE, "contact_sheet.py")], { stdio: "inherit" });
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("layout: every element inside its frame, no overlapping text");
