// Render the six Solanites X teasers (4:5 and 1:1) from teasers.html.
//   node campaign/x-teasers/build/render.mjs            # all
//   node campaign/x-teasers/build/render.mjs 3 4x5      # one teaser / one ratio
// Needs python3 + Pillow (prep.py) and Playwright's Chromium.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkSources, checkRenderedText } from "./check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "export");

const NAMES = { 1: "01-awakening", 2: "02-which-creature", 3: "03-stirring", 4: "04-fire-beginning", 5: "05-legendary", 6: "06-taking-shape" };
const SIZES = { "4x5": [1440, 1800], "1x1": [1440, 1440] };

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return require(join(root, "playwright"));
  }
}

const [onlyId, onlyRatio] = process.argv.slice(2);
const problems = checkSources();
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }

execFileSync("python3", [join(HERE, "prep.py")], { stdio: "inherit" });

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const failures = [];
for (const id of Object.keys(NAMES)) {
  if (onlyId && onlyId !== id) continue;
  for (const [ratio, [w, h]] of Object.entries(SIZES)) {
    if (onlyRatio && onlyRatio !== ratio) continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(join(HERE, "teasers.html")).href + `?id=${id}&ratio=${ratio}`);
    await page.waitForSelector("body[data-ready='1']", { timeout: 30000 });
    const visible = await page.evaluate(() => document.getElementById("stage").innerText);
    failures.push(...checkRenderedText(id, ratio, visible));
    mkdirSync(join(OUT, ratio), { recursive: true });
    const png = join(OUT, ratio, `${NAMES[id]}.png`);
    await page.locator("#stage").screenshot({ path: png });
    const jpg = png.replace(/\.png$/, ".jpg");
    execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=94,subsampling=0,optimize=True)", png, jpg]);
    execFileSync("rm", [png]);
    console.log("rendered", jpg);
    await page.close();
  }
}
await browser.close();
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("all teasers match their approved copy");
