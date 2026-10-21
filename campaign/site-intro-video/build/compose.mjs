// Builds the site intro video from captures/ (see record.mjs) and scenes.mjs.
//   node campaign/site-intro-video/build/compose.mjs           both cuts -> ../site-intro-1920x1080.mp4, ../site-intro-1080x1350.mp4
//   node campaign/site-intro-video/build/compose.mjs preview   one frame per scene to .tmp/preview
// Needs ffmpeg and Playwright's Chromium. Captions and cards are rendered as transparent PNGs from HTML.
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs"; import { fileURLToPath, pathToFileURL } from "node:url"; import path from "node:path";
import { SCENES, ODDS } from "./scenes.mjs";
const B = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(B, ".."), TMP = path.join(B, ".tmp"), FPS = 30, FADE = 0.3;
const require = createRequire(import.meta.url);
const pw = require(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim() + "/playwright");
const preview = process.argv[2] === "preview";
mkdirSync(TMP, { recursive: true });
const uri = (f, t) => `data:${t};base64,${readFileSync(path.join(B, f)).toString("base64")}`;
const FONTS = [["Cormorant", "normal", "300 700", "cormorant-latin-wght-normal.woff2"], ["Cormorant", "italic", "300 700", "cormorant-latin-wght-italic.woff2"], ["Inter", "normal", "100 900", "inter-latin-wght-normal.woff2"], ["JB", "normal", "400", "jetbrains-mono-latin-400-normal.woff2"]]
  .map(([f, s, w, file]) => `@font-face{font-family:${f};font-style:${s};font-weight:${w};src:url(${uri("fonts/" + file, "font/woff2")})}`).join("");
const CSS = `${FONTS}*{margin:0;box-sizing:border-box}html,body{background:transparent}
:root{--void:#07060a;--bone:#efe8da;--gilt:#e8b75c;--vellum:#bdb3a3}
#f{position:relative;overflow:hidden}
.k{font:400 20px/1 JB;letter-spacing:.3em;text-transform:uppercase;color:var(--gilt);display:flex;align-items:center;gap:14px}.k:before{content:"";width:28px;height:1px;background:var(--gilt)}
h1{font:600 76px/.98 Cormorant;color:var(--bone)}h1 i{font-style:italic;font-weight:500;background:linear-gradient(#fff1c9,#e8b75c 55%,#a8692a);-webkit-background-clip:text;color:transparent;padding-right:.06em}
.s{font:400 28px/1.4 Inter;color:var(--vellum)}
.tag{position:absolute;font:400 17px/1 JB;letter-spacing:.2em;text-transform:uppercase;color:var(--gilt);border:1px solid var(--gilt);border-radius:99px;padding:10px 18px;background:#07060acc}
.lock{position:absolute;display:flex;align-items:center;gap:14px;font:600 25px/1 Cormorant;letter-spacing:.32em;color:var(--bone)}.lock img{height:45px}
.bg{position:absolute;inset:0;background:radial-gradient(60% 70% at 70% 30%,#7d5cf033,transparent 70%),radial-gradient(40% 40% at 20% 90%,#e8b75c14,transparent 70%),var(--void)}`;
const sigil = uri("sigil-full.svg", "image/svg+xml"), emblem = uri("sigil-emblem.svg", "image/svg+xml");

// ---- overlay / card HTML ----
function caption(sc, L) {
  const w = L ? 1920 : 1080, h = L ? 1080 : 1350, bar = sc.bar ?? 0;
  const tag = sc.tag ? `<div class="tag" style="${L ? "right:72px;top:96px" : "right:60px;top:300px"}">${sc.tag}</div>` : "";
  if (L) return `<div id=f style="width:${w}px;height:${h}px">
    <div style="position:absolute;left:0;right:0;bottom:0;height:430px;background:linear-gradient(0deg,rgba(7,6,10,${bar || 0.0}) 0,rgba(7,6,10,${bar || 0}) 52%,transparent 100%)"></div>
    <div style="position:absolute;left:86px;bottom:72px;max-width:1300px"><div class=k>${sc.kicker}</div><h1 style="margin:18px 0 14px">${sc.head}</h1><div class=s>${sc.sub}</div></div>${tag}</div>`;
  return `<div id=f style="width:${w}px;height:${h}px"><div class=lock style="left:60px;top:60px"><img src="${emblem}">SOLANITES</div>
    <div style="position:absolute;left:60px;top:150px;right:60px"><div class=k>${sc.kicker}</div><h1 style="margin-top:18px;font-size:82px">${sc.head}</h1></div>
    <div class=s style="position:absolute;left:60px;right:60px;bottom:90px;font-size:32px">${sc.sub}</div>${tag}</div>`;
}
function card(kind, L) {
  const w = L ? 1920 : 1080, h = L ? 1080 : 1350;
  if (kind === "odds") {
    const rows = ODDS.map(([n, p, c]) => `<div style="display:grid;grid-template-columns:${L ? 250 : 220}px 1fr ${L ? 110 : 100}px;align-items:center;gap:22px;margin:${L ? 16 : 20}px 0"><span style="font:600 ${L ? 36 : 36}px Cormorant;color:${c}">${n}</span><div style="height:12px;border-radius:9px;background:#ffffff14"><div style="width:${p / 40 * 100}%;height:100%;border-radius:9px;background:${c}"></div></div><span style="font:400 ${L ? 32 : 32}px JB;color:var(--bone);text-align:right">${p}%</span></div>`).join("");
    return L ? `<div id=f style="width:${w}px;height:${h}px"><div class=bg></div><div class=lock style="left:86px;top:72px"><img src="${emblem}">SOLANITES</div>
      <div style="position:absolute;left:86px;top:250px;width:640px"><div class=k>The bloodlines</div><h1 style="margin:22px 0 22px;font-size:96px">Six tiers.<br>One shared <i>origin.</i></h1><div class=s>The published odds for every egg.</div></div>
      <div style="position:absolute;left:880px;top:230px;width:900px">${rows}<div style="font:400 17px/1.5 JB;letter-spacing:.14em;color:#8c8374;margin-top:34px;text-transform:uppercase">Rarity is sealed when the egg is earned. No outcome is guaranteed.</div></div></div>`
      : `<div id=f style="width:${w}px;height:${h}px"><div class=bg></div><div class=lock style="left:60px;top:60px"><img src="${emblem}">SOLANITES</div>
      <div style="position:absolute;left:60px;top:170px;right:60px"><div class=k>The bloodlines</div><h1 style="margin:20px 0;font-size:96px">Six tiers.<br>One shared <i>origin.</i></h1></div>
      <div style="position:absolute;left:60px;right:60px;top:560px">${rows}</div>
      <div style="position:absolute;left:60px;right:60px;bottom:80px;font:400 17px/1.5 JB;letter-spacing:.14em;color:#8c8374;text-transform:uppercase">The published odds for every egg. Rarity is sealed when the egg is earned. No outcome is guaranteed.</div></div>`;
  }
  const big = L ? 96 : 84;
  return `<div id=f style="width:${w}px;height:${h}px"><div class=bg></div><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <img src="${sigil}" style="width:${L ? 300 : 340}px;margin-bottom:34px"><div style="font:600 ${L ? 46 : 46}px Cormorant;letter-spacing:.32em;color:var(--bone)">SOLANITES</div>
    <h1 style="font-size:${big}px;margin:36px 0 22px">Follow <i>@Solanites_</i></h1><div class=k style="font-size:22px;margin-bottom:34px">Contract: coming soon</div><div class=s>The hatching begins soon.</div></div></div>`;
}
async function shot(browser, html, w, h, out) {
  const f = path.join(TMP, "p.html"); writeFileSync(f, `<!doctype html><meta charset=utf-8><style>${CSS}</style>${html}`);
  const p = await browser.newPage({ viewport: { width: w, height: h } }); await p.goto(pathToFileURL(f).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  await p.locator("#f").screenshot({ path: out, omitBackground: true }); await p.close();
}
const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
function concatList(sc) {
  const d = JSON.parse(readFileSync(path.join(B, "captures", sc.src, "index.json"), "utf8")), dir = path.join(B, "captures", sc.src);
  const fr = d.frames.filter((f) => f[1] >= sc.t0 - 0.5); const lines = []; let prev = null;
  const at = (t) => { let b = d.frames[0]; for (const f of d.frames) { if (f[1] <= t) b = f; else break; } return b; };
  const pts = [[at(sc.t0)[0], sc.t0], ...d.frames.filter((f) => f[1] > sc.t0 && f[1] < sc.t1)];
  pts.forEach((f, i) => { const t = i === 0 ? sc.t0 : f[1], nx = i + 1 < pts.length ? pts[i + 1][1] : sc.t1; lines.push(`file '${path.join(dir, f[0])}'`, `duration ${Math.max(0.001, nx - t).toFixed(4)}`); });
  lines.push(`file '${path.join(dir, pts.at(-1)[0])}'`);
  const f = path.join(TMP, sc.id + ".txt"); writeFileSync(f, lines.join("\n")); return f;
}
const browser = await pw.chromium.launch();
const CUTS = [["L", 1920, 1080, "site-intro-1920x1080.mp4"], ["P", 1080, 1350, "site-intro-1080x1350.mp4"]];
const clipsDir = path.join(B, "clips"); mkdirSync(clipsDir, { recursive: true });
const made = { L: [], P: [] };
for (const sc of SCENES) for (const [k, W, H] of CUTS) {
  const L = k === "L", out = path.join(clipsDir, `${sc.id}-${k}.mp4`), dur = sc.card ? sc.dur : sc.t1 - sc.t0;
  const fade = `fade=t=in:d=${FADE},fade=t=out:st=${(dur - FADE).toFixed(3)}:d=${FADE}`;
  if (sc.card) {
    const png = path.join(TMP, `${sc.id}-${k}.png`); await shot(browser, card(sc.card, L), W, H, png);
    ff(["-loop", "1", "-framerate", String(FPS), "-t", String(dur), "-i", png, "-vf", `${fade},format=yuv420p`, "-c:v", "libx264", "-crf", "17", "-r", String(FPS), out]);
  } else {
    const cap = path.join(TMP, `${sc.id}-${k}-cap.png`); await shot(browser, caption(sc, L), W, H, cap);
    const list = concatList(sc), crop = sc.crop ? `crop=${sc.crop[2]}:${sc.crop[3]}:${sc.crop[0]}:${sc.crop[1]},` : "";
    let fc;
    if (L && !sc.crop) fc = `[0:v]scale=1920:1080,setsar=1[v];[v][1:v]overlay=0:0,${fade},format=yuv420p`;
    else if (L) { const fw = 1500; fc = `[0:v]${crop}scale=${fw}:-2,setsar=1[v];color=c=0x07060a:s=1920x1080:r=${FPS}[bg];[bg][v]overlay=(W-w)/2:(H-h)/2-70:shortest=1[a];[a][1:v]overlay=0:0,${fade},format=yuv420p`; }
    else fc = `[0:v]${crop}scale=1080:-2,setsar=1[v];color=c=0x07060a:s=1080x1350:r=${FPS}[bg];[bg][v]overlay=0:(H-h)/2+20:shortest=1[a];[a][1:v]overlay=0:0,${fade},format=yuv420p`;
    ff(["-f", "concat", "-safe", "0", "-i", list, "-i", cap, "-filter_complex", fc.replace(/^\[0:v\]/, "[0:v]fps=" + FPS + ","), "-t", String(dur), "-c:v", "libx264", "-crf", "17", "-r", String(FPS), out]);
  }
  made[k].push(out); console.log("scene", sc.id, k, dur.toFixed(1) + "s");
}
await browser.close();
if (preview) process.exit(0);
// soundtrack: local synthesis only (drone + air + soft bell at each scene start), no external audio
const total = SCENES.reduce((a, s) => a + (s.card ? s.dur : s.t1 - s.t0), 0);
let starts = [], acc = 0; for (const s of SCENES) { starts.push(acc); acc += s.card ? s.dur : s.t1 - s.t0; }
const inputs = [], filt = [];
const syn = (e, d) => ["-f", "lavfi", "-t", String(d), "-i", e];
inputs.push(...syn("aevalsrc='0.16*sin(2*PI*55*t)*(0.65+0.35*sin(2*PI*0.2*t))+0.09*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.27*t+1))|0.16*sin(2*PI*55.4*t)*(0.65+0.35*sin(2*PI*0.22*t))+0.09*sin(2*PI*82.9*t)*(0.6+0.4*sin(2*PI*0.25*t))':s=48000", total));
inputs.push(...syn("anoisesrc=c=pink:r=48000:a=0.03", total));
inputs.push(...syn("aevalsrc='(0.3*sin(2*PI*659.3*t)+0.15*sin(2*PI*1318.5*t))*exp(-2.6*t)|(0.3*sin(2*PI*660.1*t)+0.15*sin(2*PI*1319.6*t))*exp(-2.6*t)':s=48000", 2.5));
filt.push(`[0:a]afade=t=in:d=2,afade=t=out:st=${total - 2.5}:d=2.5,lowpass=f=800[d]`, `[1:a]lowpass=f=600,highpass=f=90,aformat=channel_layouts=stereo,afade=t=in:d=2,afade=t=out:st=${total - 2.5}:d=2.5[n]`, `[2:a]asplit=${starts.length}${starts.map((_, i) => `[b${i}]`).join("")}`);
starts.forEach((s, i) => filt.push(`[b${i}]adelay=${Math.round(s * 1000 + 250)}|${Math.round(s * 1000 + 250)},volume=0.55[bb${i}]`));
filt.push(`[d][n]${starts.map((_, i) => `[bb${i}]`).join("")}amix=inputs=${2 + starts.length}:normalize=0,loudnorm=I=-18:TP=-2:LRA=7[out]`);
ff([...inputs, "-filter_complex", filt.join(";"), "-map", "[out]", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", path.join(TMP, "audio.m4a")]);
for (const [k, , , name] of CUTS) {
  const list = path.join(TMP, `list-${k}.txt`); writeFileSync(list, made[k].map((f) => `file '${f}'`).join("\n"));
  ff(["-f", "concat", "-safe", "0", "-i", list, "-i", path.join(TMP, "audio.m4a"), "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "copy", "-t", total.toFixed(2), "-movflags", "+faststart", path.join(OUT, name)]);
  console.log("wrote", name);
}
