// Renders the first X engagement post, "Which creature would you hatch?", from the Runway
// phoenix footage and still, in the site's fonts.
//
//   node scripts/x-post-01.mjs
//
// Writes art/campaign/x-post-01/solanites-x-post-01-4x5.jpg (1440x1800) and -1x1.jpg (1440x1440).
// Needs ffmpeg and Playwright. Follows docs/marketing/prelaunch-rules.md: no web address,
// no contract, no dates, only facts the code backs (28 species; Mythic and Secret stay classified).
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "art/campaign/x-post-01");
mkdirSync(out, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

// Source crops: [file, seek seconds or null for a still, ffmpeg crop w:h:x:y].
const work = mkdtempSync(join(tmpdir(), "xpost-"));
const crop = (name, src, seek, box) => {
  const file = join(work, `${name}.png`);
  execFileSync("ffmpeg", ["-v", "error", "-y", ...(seek == null ? [] : ["-ss", String(seek)]), "-i", join(root, src), "-frames:v", "1", "-vf", `crop=${box}`, file]);
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
};
const img = {
  bg: crop("bg", "art/intro/phoenix-still.png", null, "2000:1116:0:0"),
  phoenix: crop("phoenix", "art/intro/phoenix-still.png", null, "640:820:680:110"),
  rare: crop("rare", "art/intro/clip-2-rebirth.mp4", 2.5, "330:440:330:0"),
  unknown: crop("unknown", "art/intro/clip-1-awakening.mp4", 1.8, "360:480:450:110"),
};
rmSync(work, { recursive: true, force: true });

const font = (pkg, file) => readFileSync(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).toString("base64");
const icons = {
  flame: `<path d="M12 2c1 3.5 4.5 5.5 4.5 10a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2-4.5.3 1.6 1.2 2.6 2.2 3 .2-3.2-1.2-5.6.3-8.5z"/>`,
  bolt: `<path d="M13.5 2 5 13.2h5.6L9.5 22 19 10.3h-5.7z"/>`,
  eye: `<path d="M12 5C6.5 5 2.6 9.3 1.5 12c1.1 2.7 5 7 10.5 7s9.4-4.3 10.5-7C21.4 9.3 17.5 5 12 5zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4zm0-2.3a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z"/>`,
};
const choices = [
  { label: "PHOENIX", sub: "Born from fire", icon: "flame", art: img.phoenix, accent: "#ffb547", glow: "255,170,60", pos: "50% 30%" },
  { label: "SOMETHING RARE", sub: "Six rarities. Chase the top.", icon: "bolt", art: img.rare, accent: "#b98bff", glow: "153,69,255", pos: "50% 40%", filter: "saturate(1.15) hue-rotate(-8deg)" },
  { label: "THE UNKNOWN", sub: "Classified until hatched", icon: "eye", art: img.unknown, accent: "#5fe3ff", glow: "0,194,255", pos: "50% 50%", filter: "brightness(1.35) contrast(1.1)", unknown: true },
];

const css = `@font-face{font-family:U;src:url(data:font/woff2;base64,${font("unbounded", "unbounded-latin-wght-normal.woff2")}) format("woff2");font-weight:200 900}
@font-face{font-family:I;src:url(data:font/woff2;base64,${font("inter", "inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
*{box-sizing:border-box}html,body{margin:0;background:#05040a}
.c{position:relative;overflow:hidden;background:#05040a;color:#fff;display:flex;flex-direction:column;align-items:center;text-align:center}
.bg{position:absolute;inset:-4%;background:url(${img.bg}) center 30%/cover;filter:blur(26px) brightness(.32) saturate(1.2)}
.haze{position:absolute;inset:0;background:radial-gradient(60% 40% at 18% 70%,rgba(153,69,255,.22),transparent 70%),radial-gradient(50% 35% at 85% 78%,rgba(0,194,255,.16),transparent 70%),radial-gradient(70% 45% at 50% 22%,rgba(255,150,40,.14),transparent 70%),linear-gradient(180deg,rgba(5,4,10,.2),rgba(5,4,10,.7))}
.ember{position:absolute;border-radius:50%;background:#ffb54a;box-shadow:0 0 10px 3px rgba(255,150,40,.6)}
.mark{font-family:U;font-weight:600;letter-spacing:.34em;padding-left:.34em;background:linear-gradient(180deg,#fff3cf,#ffd77a 45%,#e9a63a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(255,170,60,.4))}
.rule{height:2px;background:linear-gradient(90deg,transparent,#9945ff 30%,#14f195 50%,#9945ff 70%,transparent);opacity:.9}
h1{margin:0;font-family:U;font-weight:800;line-height:1.02;letter-spacing:-.01em;text-shadow:0 4px 30px rgba(0,0,0,.6)}
.gold{text-shadow:none;background:linear-gradient(180deg,#fff3cf 0%,#ffd77a 40%,#e9a63a 78%,#ffcf6b 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(255,170,60,.45))}
.cards{display:flex;width:100%}
.card{position:relative;flex:1;border-radius:30px;overflow:hidden;background:#07060d;display:flex;flex-direction:column}
.card .art{position:relative;flex:1;background-size:cover}
.card .art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,6,13,0) 50%,rgba(7,6,13,.8) 80%,#07060d 100%)}
.card .q{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:U;font-weight:800;color:rgba(160,235,255,.22);z-index:1}
.card .foot{position:relative;display:flex;flex-direction:column;align-items:center}
.ico{display:flex;align-items:center;justify-content:center;border-radius:50%}
.lab{font-family:U;font-weight:700;letter-spacing:.06em;line-height:1.1}
.sub{font-family:I;color:#c9c5dc}
.reply{font-family:U;font-weight:600;letter-spacing:.22em;padding-left:.22em;color:#fff}
.small{font-family:I;color:#a6a3c4;letter-spacing:.02em}`;

const EMBERS = [[6, 62, 4], [12, 30, 3], [22, 80, 5], [31, 12, 3], [44, 70, 4], [57, 18, 3], [66, 88, 5], [74, 40, 3], [83, 66, 4], [91, 22, 3], [95, 84, 4], [3, 90, 3], [50, 95, 3], [38, 50, 2], [88, 50, 2]];

const page = ({ w, h, s, headSize, cardsH }) => `<div class="c" style="width:${w}px;height:${h}px;padding:${s * 70}px ${s * 64}px ${s * 62}px">
  <div class="bg"></div><div class="haze"></div>
  ${EMBERS.map(([x, y, r]) => `<span class="ember" style="left:${x}%;top:${y}%;width:${r * s}px;height:${r * s}px;opacity:${0.35 + (r - 2) * 0.15}"></span>`).join("")}
  <div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div class="mark" style="font-size:${s * 30}px">SOLANITES</div>
    <div class="rule" style="width:${s * 150}px;margin-top:${s * 16}px"></div>
    <h1 style="font-size:${headSize}px;margin-top:${s * 40}px">WHICH CREATURE<br>WOULD YOU <span class="gold">HATCH?</span></h1>
  </div>
  <div class="cards" style="position:relative;gap:${s * 26}px;height:${cardsH}px;margin-top:${s * 48}px">
    ${choices.map((c) => `<div class="card" style="border:2px solid ${c.accent}88;box-shadow:0 0 ${s * 50}px -${s * 10}px rgba(${c.glow},.55),inset 0 0 ${s * 40}px rgba(${c.glow},.12)">
      <div class="art" style="background-image:url(${c.art});background-position:${c.pos};${c.filter ? `filter:${c.filter}` : ""}"></div>
      ${c.unknown ? `<div class="q" style="font-size:${s * 220}px;bottom:${s * 150}px">?</div>` : ""}
      <div class="foot" style="padding:0 ${s * 14}px ${s * 30}px;margin-top:-${s * 46}px">
        <div class="ico" style="width:${s * 74}px;height:${s * 74}px;background:radial-gradient(circle,rgba(${c.glow},.35),rgba(11,9,18,.95) 70%);border:2px solid ${c.accent};box-shadow:0 0 ${s * 26}px rgba(${c.glow},.6)">
          <svg viewBox="0 0 24 24" width="${s * 36}" height="${s * 36}" fill="${c.accent}">${icons[c.icon]}</svg>
        </div>
        <div class="lab" style="font-size:${s * 25}px;margin-top:${s * 18}px;color:${c.accent}">${c.label}</div>
        <div class="sub" style="font-size:${s * 17}px;margin-top:${s * 10}px">${c.sub}</div>
      </div>
    </div>`).join("")}
  </div>
  <div style="position:relative;margin-top:auto;padding-top:${s * 28}px;display:flex;flex-direction:column;align-items:center">
    <div class="reply" style="font-size:${s * 22}px">REPLY WITH YOUR PICK</div>
    <div class="small" style="font-size:${s * 18}px;margin-top:${s * 12}px">28 creatures. One world. The hatching begins soon.</div>
  </div>
</div>`;

const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:vercel\.app|app|com|io|xyz|net|org|fun|gg|so|dev|site|link)\b/i;
const jobs = [
  ["solanites-x-post-01-4x5", 1440, 1800, page({ w: 1440, h: 1800, s: 1.5, headSize: 104, cardsH: 930 })],
  ["solanites-x-post-01-1x1", 1440, 1440, page({ w: 1440, h: 1440, s: 1.2, headSize: 84, cardsH: 800 })],
];
for (const [name, , , html] of jobs) {
  if (URL_PATTERN.test(html.replace(/<style>[\s\S]*?<\/style>|data:[^)"]+/g, ""))) throw new Error(`${name} contains a web address (prelaunch rule).`);
}

const browser = await chromium.launch();
for (const [name, w, h, html] of jobs) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: join(out, `${name}.png`) });
  await p.close();
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", join(out, `${name}.png`), "-q:v", "2", join(out, `${name}.jpg`)]);
  rmSync(join(out, `${name}.png`));
}
await browser.close();
console.log("Rendered art/campaign/x-post-01/ (4:5 and 1:1)");
