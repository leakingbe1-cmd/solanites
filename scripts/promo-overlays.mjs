// Renders the promo text layers (feature captions, end cards, poster type) as transparent PNGs
// in the site's own fonts, into art/promo/overlays/. Used by scripts/promo-assets.sh.
//
//   node scripts/promo-overlays.mjs
//
// Needs Playwright with Chromium (PLAYWRIGHT_MODULE can point at its index.mjs).
// Every caption is a feature that exists in the code: keep it that way when editing.
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "art/promo/overlays");
mkdirSync(out, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

// Anything that looks like a web address: a scheme, a "www" prefix, or a common domain ending.
const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:vercel\.app|app|com|io|xyz|net|org|fun|gg|so|dev|site|link)\b/i;
const font = (pkg, file) => readFileSync(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).toString("base64");
const css = `@font-face{font-family:U;src:url(data:font/woff2;base64,${font("unbounded", "unbounded-latin-wght-normal.woff2")}) format("woff2");font-weight:200 900}
@font-face{font-family:I;src:url(data:font/woff2;base64,${font("inter", "inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
html,body{margin:0;background:transparent}
.f{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;text-align:center;box-sizing:border-box}
.gold{background:linear-gradient(180deg,#fff7e0 0%,#ffd77a 38%,#e9a63a 62%,#fff1c4 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.mark{font-family:U;font-weight:600;letter-spacing:.3em;padding-left:.3em;line-height:1}
.rule{height:2px;background:linear-gradient(90deg,transparent,#9945ff 30%,#14f195 50%,#9945ff 70%,transparent);opacity:.85}
.tag{font-family:I;font-weight:400;color:#d6d3e6;letter-spacing:.02em}
.eyebrow{font-family:U;font-weight:500;color:#14f195;letter-spacing:.4em;padding-left:.4em}
.head{font-family:U;font-weight:700;color:#fff;letter-spacing:.04em;line-height:1.1;text-transform:uppercase;text-shadow:0 2px 18px rgba(0,0,0,.85)}
.sub{font-family:I;font-weight:400;color:#e4e1f2;letter-spacing:.03em;text-shadow:0 1px 12px rgba(0,0,0,.9)}
.cta{font-family:U;font-weight:600;color:#ffd77a;border:1.5px solid rgba(255,215,122,.65);border-radius:999px;letter-spacing:.24em;padding-left:.24em;background:rgba(5,4,10,.55);box-shadow:0 0 36px rgba(255,190,90,.22),inset 0 0 18px rgba(255,190,90,.12)}
.head .gold{text-shadow:none;filter:drop-shadow(0 0 24px rgba(255,190,90,.35))}
.follow{font-family:U;font-weight:500;color:#d6d3e6;letter-spacing:.3em;padding-left:.3em;opacity:.85}`;

// Feature captions (timed in promo-assets.sh). Sources: creatureDesigns.json (28 species),
// eggProgression.ts (1,000,000 per egg), gameConfig.ts (stage names, six rarities).
const captions = [
  { eyebrow: "◇ Genesis Hatchery · Season 0", head: "Some creatures are worth the wait" },
  { head: "28 creatures", sub: "Sealed in eggs. Each one waiting to be hatched." },
  { head: "1 egg per 1,000,000 $SLNT", sub: "Earned by holding." },
  { head: "Hatch · Grow · Evolve · Ascend", sub: "Six rarities, from Common to Secret." },
];

// Layouts per format. Wide: the caption sits in the bottom cinema bar. Tall/square: the footage
// is fitted in the middle, so captions and the end card sit in the dark space beneath it.
const formats = {
  "16x9": { w: 1920, h: 1080, capBottom: 34, head: 40, sub: 22, mark: 96, tag: 30, cta: 22, endBottom: 168, dim: "linear-gradient(180deg,rgba(5,4,10,0) 30%,rgba(5,4,10,.55) 62%,rgba(5,4,10,.92) 100%)", top: false },
  "9x16": { w: 1080, h: 1920, capTop: 1236, head: 44, sub: 26, mark: 74, tag: 32, cta: 24, endTop: 1236, dim: "linear-gradient(180deg,rgba(5,4,10,0) 40%,rgba(5,4,10,.5) 100%)", top: 300 },
  "1x1": { w: 1080, h: 1080, capTop: 798, head: 34, sub: 21, mark: 60, tag: 24, cta: 18, endTop: 640, dim: "linear-gradient(180deg,rgba(5,4,10,0) 25%,rgba(5,4,10,.8) 62%,rgba(5,4,10,.96) 100%)", top: 104 },
};

const caption = (f, c) => {
  const place = f.capTop != null ? `justify-content:flex-start;padding-top:${f.capTop}px` : `justify-content:flex-end;padding-bottom:${f.capBottom}px`;
  return `<div class="f" style="width:${f.w}px;height:${f.h}px;${place};padding-left:60px;padding-right:60px">
  ${c.eyebrow ? `<div class="eyebrow" style="font-size:${f.sub * 0.8}px;margin-bottom:${f.sub * 0.7}px">${c.eyebrow.toUpperCase()}</div>` : ""}
  <div class="head" style="font-size:${f.head}px">${c.head}</div>
  ${c.sub ? `<div class="sub" style="font-size:${f.sub}px;margin-top:${f.sub * 0.45}px">${c.sub}</div>` : ""}</div>`;
};

// Small persistent wordmark above the footage on the tall and square cuts.
const brand = (f) => `<div class="f" style="width:${f.w}px;height:${f.h}px;padding-top:${f.top}px">
  <div class="mark gold" style="font-size:${f.mark * 0.5}px">SOLANITES</div>
  <div class="rule" style="margin-top:${f.mark * 0.3}px;width:${f.mark * 2}px"></div></div>`;

const endcard = (f) => {
  const place = f.endTop != null ? `justify-content:flex-start;padding-top:${f.endTop}px` : `justify-content:flex-end;padding-bottom:${f.endBottom}px`;
  return `<div class="f" style="width:${f.w}px;height:${f.h}px;background:${f.dim}"></div>
  <div class="f" style="width:${f.w}px;height:${f.h}px;${place}">
  <div class="mark gold" style="font-size:${f.mark}px;filter:drop-shadow(0 0 ${f.mark * 0.18}px rgba(255,190,90,.45)) drop-shadow(0 0 ${f.mark * 0.5}px rgba(153,69,255,.35))">SOLANITES</div>
  <div class="rule" style="margin-top:${f.mark * 0.42}px;width:${f.mark * 3.2}px"></div>
  <div class="tag" style="margin-top:${f.mark * 0.5}px;font-size:${f.tag}px">A new world is waiting to hatch.</div>
  <div class="cta" style="margin-top:${f.tag * 1.1}px;font-size:${f.cta}px;padding:${f.cta * 0.85}px ${f.cta * 1.6}px">THE HATCHING BEGINS SOON</div>
  <div class="follow" style="margin-top:${f.cta * 1.05}px;font-size:${f.cta * 0.72}px">FOLLOW FOR LAUNCH UPDATES</div></div>`;
};

const poster = (w, h) => `<div class="f" style="width:${w}px;height:${h}px;justify-content:space-between;padding:${h * 0.07}px ${w * 0.07}px ${h * 0.06}px">
  <div><div class="eyebrow" style="font-size:${w * 0.018}px;opacity:.9">◇ GENESIS HATCHERY · SEASON 0</div>
  <div class="head" style="margin-top:${w * 0.03}px;font-size:${w * 0.072}px;letter-spacing:-.01em;line-height:1.02">A new world is<br>waiting to <span class="gold">hatch.</span></div></div>
  <div style="display:flex;flex-direction:column;align-items:center"><div class="mark gold" style="font-size:${w * 0.062}px;filter:drop-shadow(0 0 ${w * 0.012}px rgba(255,190,90,.45)) drop-shadow(0 0 ${w * 0.03}px rgba(153,69,255,.35))">SOLANITES</div>
  <div class="rule" style="margin-top:${w * 0.026}px;width:${w * 0.2}px"></div>
  <div class="tag" style="margin-top:${w * 0.028}px;font-size:${w * 0.022}px">28 creatures · Hold $SLNT · Hatch · Grow · Evolve · Ascend</div>
  <div class="cta" style="margin-top:${w * 0.03}px;font-size:${w * 0.02}px;padding:${w * 0.017}px ${w * 0.032}px">THE HATCHING BEGINS SOON</div>
  <div class="follow" style="margin-top:${w * 0.024}px;font-size:${w * 0.015}px">FOLLOW FOR LAUNCH UPDATES</div></div></div>`;

const jobs = [["poster-4x5", 2160, 2700, poster(2160, 2700)]];
for (const [name, f] of Object.entries(formats)) {
  captions.forEach((c, i) => jobs.push([`caption-${i + 1}-${name}`, f.w, f.h, caption(f, c)]));
  jobs.push([`endcard-${name}`, f.w, f.h, endcard(f)]);
  if (f.top) jobs.push([`brand-${name}`, f.w, f.h, brand(f)]);
}

// PRELAUNCH URL RULE (docs/marketing/prelaunch-rules.md): no website or preview address in any overlay.
const leak = jobs.find(([, , , html]) => URL_PATTERN.test(html.replace(/<style>[\s\S]*?<\/style>|data:[^)"]+/g, "")));
if (leak) throw new Error(`Overlay ${leak[0]} contains a web address. Prelaunch assets must not show any URL.`);

const browser = await chromium.launch();
for (const [name, w, h, html] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, `${name}.png`), omitBackground: true });
  await page.close();
}
await browser.close();
console.log(`Rendered ${jobs.length} overlays to art/promo/overlays/`);
