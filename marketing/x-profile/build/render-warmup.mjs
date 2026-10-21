// Render the warm-up profile kit and teaser media from ../../x-campaign/template/template.html.
//   node marketing/x-profile/build/render-warmup.mjs
// Banner (1500×500) and avatar (400×400) PNGs in ../, teaser posts W01–W14 as 1600×900 JPGs in ../media/.
// Fails if an image is missing or text is drawn outside the frame.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TPL = pathToFileURL(join(ROOT, "..", "x-campaign", "template", "template.html")).href;
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright")); }

const browser = await pw.chromium.launch({ args: ["--allow-file-access-from-files"] });
const problems = [];
async function shoot(query, w, h, out, kind) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`${TPL}?${query}`);
  await page.waitForSelector("body[data-ready='1']", { timeout: 60000 });
  const broken = await page.evaluate(() => document.body.dataset.broken);
  if (broken) problems.push(`${out}: missing images:${broken}`);
  const outside = await page.evaluate(([W, H]) => [...document.querySelectorAll(".copy, .copy *, .lockup, .lockup *, .foot, .foot *")]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1); })
    .map(e => `outside frame: "${e.textContent.trim().slice(0, 30)}"`), [w, h]);
  problems.push(...outside.map(l => `${out}: ${l}`));
  const png = join(ROOT, out.replace(/\.jpg$/, ".png"));
  mkdirSync(dirname(png), { recursive: true });
  await page.locator("#frame").screenshot({ path: png });
  if (kind === "jpg") { execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=93,subsampling=0,optimize=True)", png, join(ROOT, out)]); rmSync(png); }
  console.log("rendered", out);
  await page.close();
}

const warm = await (async () => { const p = await browser.newPage(); await p.goto(`${TPL}?warm=W01`); await p.waitForSelector("body[data-ready='1']"); const r = await p.evaluate(() => Object.entries(window.WARM).map(([id, v]) => [id, v.slug])); await p.close(); return r; })();
for (const [id, slug] of warm) await shoot(`warm=${id}`, 1600, 900, `media/${id}-${slug}.jpg`, "jpg");
await shoot("warmbanner", 1500, 500, "banner-1500x500.png", "png");
await shoot("avatar", 400, 400, "avatar-400x400.png", "png");
await shoot("og", 1200, 630, "og-1200x630.png", "png");
await browser.close();
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("ok: all images loaded, nothing outside its frame");
