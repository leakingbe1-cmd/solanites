// Art-free rarity odds card from src/config/gameConfig.ts rarityWeights (no creature art, no Mythic/Secret designs).
//   node marketing/x-campaign/build/render-odds.mjs  ->  posts/04-odds-card-1600x900.jpg, posts/04-odds-card-1080x1350.jpg
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"; import { fileURLToPath, pathToFileURL } from "node:url"; import path from "node:path";
const H = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(H, "../../.."), T = path.join(ROOT, "marketing/x-campaign/template");
const cfg = readFileSync(path.join(ROOT, "src/config/gameConfig.ts"), "utf8");
const w = Object.fromEntries([...cfg.match(/rarityWeights:\s*\{([^}]*)\}/g).at(-1).matchAll(/(\w+):\s*([\d.]+)/g)].map(([, k, v]) => [k, +v]));
const TIERS = [["common", "Common", "#8fb9a0"], ["rare", "Rare", "#6f8cff"], ["epic", "Epic", "#c47bff"], ["legendary", "Legendary", "#e8b75c"], ["mythic", "Mythic", "#ff7a8a"], ["secret", "Secret", "#eee6ff"]];
if (TIERS.some(([k]) => !(k in w)) || Math.abs(TIERS.reduce((a, [k]) => a + w[k], 0) - 100) > 1e-9) throw new Error("rarityWeights not found or not summing to 100: " + JSON.stringify(w));
const u = (f, t) => `data:${t};base64,${readFileSync(path.join(T, f)).toString("base64")}`;
const fonts = [["Cormorant", "normal", "300 700", "fonts/cormorant-latin-wght-normal.woff2"], ["Cormorant", "italic", "300 700", "fonts/cormorant-latin-wght-italic.woff2"], ["Inter", "normal", "100 900", "fonts/inter-latin-wght-normal.woff2"], ["JB", "normal", "400", "fonts/jetbrains-mono-latin-400-normal.woff2"]].map(([f, s, wt, file]) => `@font-face{font-family:${f};font-style:${s};font-weight:${wt};src:url(${u(file, "font/woff2")})}`).join("");
const emblem = u("assets/sigil-emblem.svg", "image/svg+xml");
const rows = (L) => TIERS.map(([k, n, c]) => `<div class=r><span style="color:${c}">${n}</span><div class=b><div style="width:${w[k] / 40 * 100}%;background:${c}"></div></div><em>${w[k]}%</em></div>`).join("");
const html = (L) => `<style>${fonts}*{margin:0;box-sizing:border-box}body{background:#07060a}#f{position:relative;width:${L ? 1600 : 1080}px;height:${L ? 900 : 1350}px;overflow:hidden;background:radial-gradient(60% 70% at 75% 30%,#7d5cf033,transparent 70%),radial-gradient(40% 40% at 15% 95%,#e8b75c14,transparent 70%),#07060a;color:#efe8da}
.lock{position:absolute;left:${L ? 72 : 60}px;top:60px;display:flex;align-items:center;gap:14px;font:600 25px Cormorant;letter-spacing:.32em}.lock img{height:45px}
.k{font:400 17px JB;letter-spacing:.3em;text-transform:uppercase;color:#e8b75c;display:flex;align-items:center;gap:14px}.k:before{content:"";width:28px;height:1px;background:#e8b75c}
h1{font:600 ${L ? 84 : 104}px/1 Cormorant}h1 i{font-style:italic;font-weight:500;background:linear-gradient(#fff1c9,#e8b75c 55%,#a8692a);-webkit-background-clip:text;color:transparent;padding-right:.06em}
p{font:400 27px/1.42 Inter;color:#bdb3a3;max-width:520px}.r{display:grid;grid-template-columns:${L ? 210 : 230}px 1fr 110px;gap:22px;align-items:center;margin:${L ? 20 : 26}px 0}.r span{font:600 38px Cormorant}.r em{font:400 32px JB;font-style:normal;text-align:right}.b{height:13px;border-radius:9px;background:#ffffff14}.b div{height:100%;border-radius:9px}
.n{font:400 15px/1.6 JB;letter-spacing:.16em;text-transform:uppercase;color:#8c8374}</style>
<div id=f><div class=lock><img src="${emblem}">SOLANITES</div>
${L ? `<div style="position:absolute;left:72px;top:250px"><div class=k>The bloodlines</div><h1 style="margin:24px 0">Six tiers.<br>One shared <i>origin.</i></h1><p>The published odds for every egg.</p></div>
<div style="position:absolute;left:860px;top:210px;width:668px">${rows(1)}<div class=n style="margin-top:36px">Rarity is sealed when the egg is earned.<br>No outcome is guaranteed.</div></div>`
 : `<div style="position:absolute;left:60px;right:60px;top:170px"><div class=k>The bloodlines</div><h1 style="margin:24px 0">Six tiers.<br>One shared <i>origin.</i></h1><p>The published odds for every egg.</p></div>
<div style="position:absolute;left:60px;right:60px;top:640px">${rows(0)}</div><div class=n style="position:absolute;left:60px;right:60px;bottom:70px">Rarity is sealed when the egg is earned. No outcome is guaranteed.</div>`}
</div>`;
const require = createRequire(import.meta.url);
const pw = require(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim() + "/playwright");
const b = await pw.chromium.launch(); mkdirSync(path.join(ROOT, "marketing/x-campaign/posts"), { recursive: true });
for (const [L, name, W, Hh] of [[1, "04-odds-card-1600x900.jpg", 1600, 900], [0, "04-odds-card-1080x1350.jpg", 1080, 1350]]) {
  const p = await b.newPage({ viewport: { width: W, height: Hh } }); writeFileSync("/tmp/odds.html", `<!doctype html><meta charset=utf-8>${html(L)}`);
  await p.goto(pathToFileURL("/tmp/odds.html").href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const png = path.join(ROOT, "marketing/x-campaign/posts", name.replace(".jpg", ".png")); await p.locator("#f").screenshot({ path: png });
  execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=93,subsampling=0)", png, png.replace(".png", ".jpg")]); execFileSync("rm", [png]); console.log(name, JSON.stringify(w));
}
await b.close();
