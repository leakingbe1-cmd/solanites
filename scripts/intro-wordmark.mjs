// Renders the SOLANITES wordmark reveal for the website intro as transparent PNG frames,
// in the site's own fonts: letters rise out of a blur one by one, a gold sheen sweeps
// across, the rule draws outwards and the tagline settles in, over a soft dark fade.
//
//   node scripts/intro-wordmark.mjs <out-dir> [fps]
//
// Writes <out-dir>/16x9/%03d.png (1920x1080) and <out-dir>/9x16/%03d.png (1080x1920).
// Used by scripts/phoenix-intro.sh. Needs Playwright with Chromium.
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2];
const fps = Number(process.argv[3] ?? 24);
if (!out) throw new Error("usage: node scripts/intro-wordmark.mjs <out-dir> [fps]");
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

const DURATION_MS = 2600;
const font = (pkg, file) => readFileSync(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).toString("base64");
const css = `@font-face{font-family:U;src:url(data:font/woff2;base64,${font("unbounded", "unbounded-latin-wght-normal.woff2")}) format("woff2");font-weight:200 900}
@font-face{font-family:I;src:url(data:font/woff2;base64,${font("inter", "inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
html,body{margin:0;background:transparent;overflow:hidden}
.stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;text-align:center}
.dim{position:absolute;inset:0;animation:fade 1.4s ease-out both}
.mark{display:flex;font-family:U;font-weight:600;line-height:1;filter:drop-shadow(0 0 .2em rgba(255,190,90,.45)) drop-shadow(0 0 .6em rgba(153,69,255,.3))}
.mark span{display:inline-block;padding:0 .15em;background:linear-gradient(100deg,#e9a63a 0%,#ffd77a 30%,#fff7e0 45%,#ffd77a 60%,#e9a63a 100%);background-size:300% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:rise .9s cubic-bezier(.2,.7,.2,1) both,sheen 1.6s ease-in-out 1s both}
.rule{height:2px;background:linear-gradient(90deg,transparent,#9945ff 30%,#14f195 50%,#9945ff 70%,transparent);animation:draw .9s cubic-bezier(.3,.7,.2,1) 1.1s both}
.tag{font-family:I;font-weight:400;color:#e4e1f2;letter-spacing:.04em;text-shadow:0 1px 14px rgba(0,0,0,.9);animation:fade .8s ease-out 1.5s both}
@keyframes rise{from{opacity:0;transform:translateY(.35em);filter:blur(12px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes sheen{from{background-position:100% 0}to{background-position:0 0}}
@keyframes draw{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:.9}}
@keyframes fade{from{opacity:0}to{opacity:1}}`;

// Wide: below the phoenix's chest, above the site's buttons. Tall: under the footage, narrow
// enough to survive phones that crop the sides of the 9:16 frame.
const formats = {
  "16x9": { w: 1920, h: 1080, top: 640, mark: 96, tag: 30, dim: "linear-gradient(180deg,rgba(5,4,10,0) 40%,rgba(5,4,10,.6) 62%,rgba(5,4,10,.9) 100%)" },
  "9x16": { w: 1080, h: 1920, top: 1190, mark: 62, tag: 30, dim: "linear-gradient(180deg,rgba(5,4,10,0) 55%,rgba(5,4,10,.55) 100%)" },
};
const html = (f) => `<div class="dim" style="background:${f.dim}"></div>
<div class="stage" style="padding-top:${f.top}px">
  <div class="mark" style="font-size:${f.mark}px;letter-spacing:.12em" aria-label="SOLANITES">${[..."SOLANITES"].map((c, i) => `<span style="animation-delay:${i * 70}ms,${1000 + i * 40}ms">${c}</span>`).join("")}</div>
  <div class="rule" style="margin-top:${f.mark * 0.42}px;width:${f.mark * 3.4}px"></div>
  <div class="tag" style="margin-top:${f.mark * 0.5}px;font-size:${f.tag}px">A new world is waiting to hatch.</div>
</div>`;

const browser = await chromium.launch();
for (const [name, f] of Object.entries(formats)) {
  const dir = join(out, name);
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${html(f)}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const frames = Math.round((DURATION_MS / 1000) * fps) + 1;
  for (let i = 0; i < frames; i++) {
    // Drive every CSS animation to this exact time, so frames are deterministic.
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), (i * 1000) / fps);
    await page.screenshot({ path: join(dir, `${String(i).padStart(3, "0")}.png`), omitBackground: true });
  }
  await page.close();
}
await browser.close();
console.log(`Rendered wordmark reveal (${DURATION_MS / 1000}s at ${fps} fps) to ${out}`);
