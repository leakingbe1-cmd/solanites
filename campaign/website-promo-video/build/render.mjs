// Render the Solanites website promo frame by frame from promo.html and encode it with FFmpeg.
//   bash   campaign/website-promo-video/build/footage.sh        # once: footage frames + clip audio
//   python3 campaign/website-promo-video/build/audio.py         # soundtrack-raw.wav
//   node   campaign/website-promo-video/build/render.mjs        # all three ratios → export/
//   node   …/render.mjs 9x16                                    # one ratio
//   node   …/render.mjs 16x9 --stills 0.5,2,5,9,12,18,21,24,26.9  # preview frames → build/.cache/stills/
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "export");
const CACHE = join(HERE, ".cache");
const NAMES = { "16x9": "solanites-promo-16x9-1920x1080.mp4", "9x16": "solanites-promo-9x16-1080x1920.mp4", "1x1": "solanites-promo-1x1-1080x1080.mp4" };

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {
    return require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright"));
  }
}

const args = process.argv.slice(2);
const stillsArg = args.includes("--stills") ? args[args.indexOf("--stills") + 1] : null;
const ratios = args.filter(a => NAMES[a]);
if (!existsSync(join(CACHE, "frames"))) throw new Error("run build/footage.sh first");

// loudness-normalise the soundtrack once (X plays around -14 LUFS)
const raw = join(CACHE, "soundtrack-raw.wav"), wav = join(CACHE, "soundtrack.wav");
if (!stillsArg) {
  if (!existsSync(raw)) throw new Error("run build/audio.py first");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", wav]);
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--disable-web-security"] });
for (const ratio of ratios.length ? ratios : Object.keys(NAMES)) {
  const [w, h] = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080] }[ratio];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(HERE, "promo.html")).href + `?ratio=${ratio}`);
  await page.waitForSelector("body[data-ready='1']", { timeout: 60000 });
  const broken = await page.evaluate(() => document.body.dataset.broken);
  if (broken) throw new Error(`missing images:${broken}`);
  const { FPS, DUR } = await page.evaluate(() => window.META);

  if (stillsArg) {
    mkdirSync(join(CACHE, "stills"), { recursive: true });
    for (const t of stillsArg.split(",").map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: join(CACHE, "stills", `${ratio}-${t.toFixed(2)}.jpg`), type: "jpeg", quality: 90 });
    }
    console.log(`stills for ${ratio} in build/.cache/stills/`);
    await page.close();
    continue;
  }

  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, NAMES[ratio]);
  const ff = spawn("ffmpeg", ["-v", "error", "-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", wav,
    "-map", "0:v", "-map", "1:a", "-shortest",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-g", String(FPS * 2), "-bf", "2", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
    "-metadata", "title=Solanites", file], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", c => (c ? rej(new Error(`ffmpeg exited ${c}`)) : res())));
  const frames = Math.round(DUR * FPS);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 90 === 0) console.log(`${ratio} frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await done;
  console.log("wrote", file);
  await page.close();
}
await browser.close();
