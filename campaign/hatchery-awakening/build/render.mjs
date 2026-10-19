// Render a composition to MP4 (H.264 + AAC) through headless Chromium and ffmpeg.
//   node render.mjs <comp.js> <WxH> <out.mp4> [--audio file.wav] [--stills t1,t2,...] [--preview]
// --stills writes JPEG frames at those times next to the output instead of a video.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { dirname, join, resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", ".."); // the campaign/ directory, so comps can reach sibling campaigns' exports
const FPS = 30;

const args = process.argv.slice(2);
const [compPath, size, out] = args;
const opt = k => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : undefined; };
const [W, H] = size.split("x").map(Number);

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {
    return require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright"));
  }
}
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const p = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { const b = await readFile(p); res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" }).end(b); }
  catch { res.writeHead(404).end(); }
}).listen(0, "127.0.0.1");
await new Promise(r => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", e => { console.error("page error:", e.message); process.exit(1); });
const engineUrl = `${base}/${relative(ROOT, join(HERE, "engine.html"))}`;
const compUrl = `${base}/${relative(ROOT, resolve(compPath))}`;
await page.goto(`${engineUrl}?w=${W}&h=${H}&comp=${encodeURIComponent(compUrl)}`);
await page.waitForSelector("body[data-ready='1']", { timeout: 60000 });
const info = await page.evaluate(() => window.compInfo);
const total = Math.round(info.duration * FPS);

const stills = opt("--stills");
if (stills) {
  for (const t of stills.split(",").map(Number)) {
    const b64 = await page.evaluate(([t, f]) => window.renderFrame(t, f), [t, Math.round(t * FPS)]);
    const p = out.replace(/\.(mp4|jpg)$/, "") + `-t${t.toFixed(2)}.jpg`;
    writeFileSync(p, Buffer.from(b64, "base64")); console.log("still", p);
  }
} else {
  const audio = opt("--audio");
  const ff = spawn("ffmpeg", [
    "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-",
    ...(audio ? ["-i", audio] : []),
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
    "-r", String(FPS), "-g", String(FPS * 2), "-movflags", "+faststart",
    ...(audio ? ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest"] : []),
    out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    const b64 = await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / FPS, f]);
    if (!ff.stdin.write(Buffer.from(b64, "base64"))) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 60 === 0) process.stdout.write(`\r${out}: ${f}/${total} frames (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", c => (c ? j(new Error("ffmpeg " + c)) : r())));
  console.log(`\rrendered ${out}: ${total} frames`);
}

// Every string the composition drew must be on its approved list.
const drawn = await page.evaluate(() => window.drawnText());
const bad = drawn.filter(s => !info.approved.includes(s));
writeFileSync(out.replace(/\.(mp4|jpg)$/, "") + ".text.json", JSON.stringify({ drawn, approved: info.approved }, null, 2));
await browser.close(); server.close();
if (bad.length) { console.error("unapproved on-screen text:", bad); process.exit(1); }
