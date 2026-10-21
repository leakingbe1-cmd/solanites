// Renders the 42 s campaign video (final.mp4 + final-captions.mp4) to ../ from the sources in this folder.
//
//   node marketing/x-campaign/video/build/render.mjs              both exports (about 9 min)
//   node marketing/x-campaign/video/build/render.mjs preview 2.6,12.6,38   single frames to the OS temp dir
//
// Needs ffmpeg and Playwright's Chromium. Sources: captures/ (screencasts of the local site, see record.mjs),
// source/clip-1-awakening.mp4 (Runway Phoenix), soundtrack.m4a (see soundtrack.sh), the template fonts and
// sigil, and the real art in public/creatures and public/scenes.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const B = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(B, "../../../..");
const T = path.join(ROOT, "marketing/x-campaign/template");
const OUT = path.resolve(B, "..");
const [mode = "video", list = ""] = process.argv.slice(2);
const FPS = 30, DUR = 42;

let chromium;
for (const m of ["playwright", "/opt/node22/lib/node_modules/playwright/index.mjs"]) { try { ({ chromium } = await import(m)); break; } catch {} }
if (!chromium) throw new Error("Playwright not found: npm i -D playwright, or install it globally");

// awakening clip → frames (the clip has a 16 px black strip at each side; crop and rescale)
const AWD = mkdtempSync(path.join(os.tmpdir(), "sol-aw-"));
execFileSync("ffmpeg", ["-v", "error", "-i", path.join(B, "source/clip-1-awakening.mp4"), "-vf", "crop=1248:702:16:9,scale=1280:720", "-q:v", "2", `${AWD}/%04d.jpg`]);
const AW = readdirSync(AWD).filter((f) => f.endsWith(".jpg")).sort();
const rec = (n) => { const d = JSON.parse(readFileSync(path.join(B, "captures", n, "index.json"), "utf8")); return { dir: path.join(B, "captures", n), frames: d.frames }; };
const HATCH = rec("hatch"), COLL = rec("collection");
const atTime = (r, s) => { let best = r.frames[0]; for (const f of r.frames) { if (f[1] <= s) best = f; else break; } return path.join(r.dir, best[0]); };
function clipFor(t) {
  if (t < 3.75) return path.join(AWD, AW[Math.min(AW.length - 1, Math.floor((1.6 + t) * 24))]);
  if (t >= 3.25 && t < 10.75) return atTime(HATCH, t < 5.0 ? 0.2 + (t - 3.25) : t < 6.3 ? 2.4 + (t - 5.0) : 3.75 + (t - 6.3));
  if (t >= 18.25 && t < 22.75) return atTime(COLL, Math.max(0, (t - 18.25) * 1.25));
  return null;
}
const uri = (f, type) => `data:${type};base64,${readFileSync(f).toString("base64")}`;
const ext = (f) => (f.endsWith(".webp") ? "image/webp" : f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : "image/jpeg");
const fonts = [["Cormorant Variable", "cormorant-latin-wght-normal.woff2", "normal", "300 700"], ["Cormorant Variable", "cormorant-latin-wght-italic.woff2", "italic", "300 700"], ["Inter Variable", "inter-latin-wght-normal.woff2", "normal", "100 900"], ["JetBrains Mono", "jetbrains-mono-latin-400-normal.woff2", "normal", "100 900"]]
  .map(([f, file, st, w]) => `@font-face{font-family:"${f}";font-style:${st};font-weight:${w};src:url(${uri(path.join(T, "fonts", file), "font/woff2")}) format("woff2")}`).join("");
const assets = {
  emblem: path.join(T, "assets/sigil-emblem.svg"), sigil: path.join(T, "assets/sigil-full.svg"),
  rarity: path.join(ROOT, "marketing/x-campaign/build/captures/rarity-cards.jpg"),
  "aurelion-plate": path.join(ROOT, "public/scenes/aurelion/plate.webp"), "aurelion-4": path.join(ROOT, "public/creatures/aurelion/4-ascended.webp"),
  "genesis-plate": path.join(ROOT, "public/scenes/genesis/plate.webp"), "genesis-4": path.join(ROOT, "public/creatures/genesis/4-ascended.webp"),
};
for (const g of [2, 3, 4]) assets[`genesis-glow-${g}`] = path.join(ROOT, `public/scenes/genesis/glow-${g}.webp`);
const ST = ["1-eggling", "2-hatchling", "3-evolved", "4-ascended"];
for (const c of ["pyraurum", "velynx"]) ST.forEach((s, i) => (assets[`${c}-${i + 1}`] = path.join(ROOT, `public/creatures/${c}/${s}.webp`)));
for (const f of Object.values(assets)) if (!existsSync(f)) throw new Error(`missing asset: ${path.relative(ROOT, f)}`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><meta charset="utf-8"><style>${fonts}</style><canvas id=c width=1920 height=1080></canvas><script>${readFileSync(path.join(B, "compositor.js"), "utf8")}</script>`);
await page.evaluate(async () => { for (const f of ['600 64px "Cormorant Variable"', 'italic 500 64px "Cormorant Variable"', '400 24px "Inter Variable"', '500 24px "Inter Variable"', '400 20px "JetBrains Mono"', '600 20px "JetBrains Mono"']) await document.fonts.load(f); });
const imgs = Object.fromEntries(Object.entries(assets).map(([k, f]) => [k, uri(f, ext(f))]));
await page.evaluate(async (imgs) => { for (const [k, s] of Object.entries(imgs)) { const im = new Image(); im.src = s; await im.decode(); window.IMG[k] = im; } window.FC = new Map(); window.ctx = document.getElementById("c").getContext("2d"); }, imgs);
async function draw(t, captions, type = "image/png") {
  const f = clipFor(t); const has = f && (await page.evaluate((k) => window.FC.has(k), f));
  return page.evaluate(async ([t, key, src, captions, type]) => {
    let img = null;
    if (key) { img = window.FC.get(key); if (!img) { img = new Image(); img.src = src; await img.decode(); window.FC.set(key, img); if (window.FC.size > 40) window.FC.delete(window.FC.keys().next().value); } }
    window.drawFrame(window.ctx, t, img, captions); return document.getElementById("c").toDataURL(type, 0.95);
  }, [t, f, f && !has ? uri(f, "image/jpeg") : null, captions, type]);
}
const dec = (d) => Buffer.from(d.slice(d.indexOf(",") + 1), "base64");

if (mode === "preview") {
  const dir = mkdtempSync(path.join(os.tmpdir(), "sol-preview-"));
  for (const t of list.split(",").filter(Boolean).map(Number)) { writeFileSync(path.join(dir, `pv-${t}.jpg`), dec(await draw(t, false, "image/jpeg"))); writeFileSync(path.join(dir, `pvc-${t}.jpg`), dec(await draw(t, true, "image/jpeg"))); }
  console.log(`previews in ${dir}`);
} else {
  mkdirSync(OUT, { recursive: true });
  const enc = (name) => {
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-i", path.join(B, "soundtrack.m4a"), "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS), "-c:a", "copy", "-t", String(DUR), "-movflags", "+faststart", path.join(OUT, name)], { stdio: ["pipe", "inherit", "inherit"] });
    return { ff, done: new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(name + " ffmpeg " + c))))) };
  };
  const a = enc("final.mp4"), b = enc("final-captions.mp4");
  const put = async (e, buf) => { if (!e.ff.stdin.write(buf)) await new Promise((r) => e.ff.stdin.once("drain", r)); };
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) { const t = i / FPS; await put(a, dec(await draw(t, false))); await put(b, dec(await draw(t, true))); if (i % 150 === 0) console.log(`${i}/${N}`); }
  a.ff.stdin.end(); b.ff.stdin.end(); await Promise.all([a.done, b.done]); console.log("done: final.mp4, final-captions.mp4");
}
await browser.close();
