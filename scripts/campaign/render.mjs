// Renders the Solanites Phoenix campaign from the Runway source clip:
//   public/campaign/ads/*.mp4      16:9, 9:16, 1:1 and 4:5 adverts (with the source audio)
//   public/campaign/stills/*.jpg   X post images, end cards, poster and static variants
//   public/campaign/manifest.json  what was rendered, as verified by ffprobe
//   docs/campaign/x-content-pack.md
//
// It runs the Content Studio's own canvas renderer (src/studio/render/draw.ts)
// in headless Chromium, one source frame at a time, and pipes the frames to
// ffmpeg. Needs ffmpeg/ffprobe on PATH and Playwright's Chromium
// (`npx playwright install chromium` if it isn't installed).
//
//   npm run campaign:render                      everything
//   npm run campaign:render -- --only stills     just the stills (also: videos, pack)
//   npm run campaign:render -- --source my.mp4   a different source clip
import { build } from "esbuild";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(root, "public/campaign");
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const only = arg("only");
const source = path.resolve(arg("source") ?? path.join(outDir, "phoenix-source.mp4"));

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr || r.error}`);
  return r.stdout;
}
function probe(file) {
  const j = JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height,nb_frames:format=duration", "-of", "json", file]));
  const v = j.streams.find((s) => s.codec_type === "video");
  return { width: v?.width, height: v?.height, frames: Number(v?.nb_frames) || undefined, audio: j.streams.some((s) => s.codec_type === "audio"), duration: Number(j.format?.duration) || undefined };
}

// 1. bundle the renderer with the site's fonts embedded (file:// pages can't fetch fonts reliably)
const font = async (rel) => (await readFile(path.join(root, "node_modules", rel))).toString("base64");
const faces = [
  ["Unbounded Variable", "@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2", "200 900"],
  ["Inter Variable", "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "100 900"],
  ["JetBrains Mono", "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", "400"],
];
const css = (await Promise.all(faces.map(async ([family, file, weight]) => `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${await font(file)}) format("woff2")}`))).join("\n");
const js = await build({
  entryPoints: [path.join(here, "entry.ts")],
  bundle: true,
  write: false,
  format: "iife",
  target: "es2022",
  jsx: "automatic",
  logLevel: "warning",
  alias: { "@": path.join(root, "src") },
  define: { "process.env.NODE_ENV": '"production"' },
});
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><body><script>${js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script>`;

// 2. source frames
const tmp = await mkdtemp(path.join(os.tmpdir(), "solanites-campaign-"));
console.log(`source: ${path.relative(root, source)}`, probe(source));
run("ffmpeg", ["-v", "error", "-i", source, "-vsync", "0", "-q:v", "1", path.join(tmp, "f%04d.jpg")]);
const files = (await readdir(tmp)).filter((f) => f.endsWith(".jpg")).sort();
const frames = await Promise.all(files.map(async (f) => `data:image/jpeg;base64,${(await readFile(path.join(tmp, f))).toString("base64")}`));
console.log(`${frames.length} source frames`);

// 3. headless Chromium
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  throw new Error("Playwright is missing: npm install (it is a devDependency)");
}
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.setContent(html);
const missing = await page.evaluate(() => window.SL.ready());
if (missing.length) throw new Error(`fonts failed to load: ${missing.join(", ")}`);
const plan = await page.evaluate(() => window.SL.plan());
const frameAt = (t) => frames[Math.min(frames.length - 1, Math.round(t * plan.fps))];
const decode = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
const manifest = { generatedAt: new Date().toISOString(), source: "phoenix-source.mp4", videos: [], stills: [] };
const previous = await readFile(path.join(outDir, "manifest.json"), "utf8").then(JSON.parse).catch(() => null);

// 4. videos
const RATIO = { landscape: "16x9", vertical: "9x16", square: "1x1", portrait: "4x5" };
if (!only || only === "videos") {
  await mkdir(path.join(outDir, "ads"), { recursive: true });
  const total = Math.round(plan.duration * plan.fps);
  for (const format of plan.videoFormats) {
    const rel = `ads/solanites-phoenix-${RATIO[format]}.mp4`;
    const out = path.join(outDir, rel);
    const ff = spawn("ffmpeg", [
      "-v", "error", "-y",
      "-f", "image2pipe", "-framerate", String(plan.fps), "-c:v", "png", "-i", "-",
      "-i", source,
      "-map", "0:v", "-map", "1:a?",
      "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(plan.fps),
      "-c:a", "aac", "-b:a", "160k", "-af", `apad,afade=t=out:st=${(plan.sourceDuration - 0.6).toFixed(2)}:d=${(plan.duration - plan.sourceDuration + 0.6).toFixed(2)}`,
      "-t", plan.duration.toFixed(3), "-movflags", "+faststart", out,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c} for ${rel}`)))));
    const started = Date.now();
    for (let i = 0; i < total; i++) {
      const t = i / plan.fps;
      const png = await page.evaluate(([f, tt, src]) => window.SL.ad(f, tt, src), [format, t, frameAt(Math.min(t, plan.sourceDuration))]);
      if (!ff.stdin.write(decode(png))) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 48 === 0) process.stdout.write(`\r${rel} ${i}/${total}`);
    }
    ff.stdin.end();
    await done;
    const info = probe(out);
    const want = plan.formats[format];
    if (info.width !== want.w || info.height !== want.h || Math.abs(info.duration - plan.duration) > 0.1) throw new Error(`${rel} failed verification: ${JSON.stringify(info)}`);
    manifest.videos.push({ file: rel, format, ...info, bytes: (await stat(out)).size });
    console.log(`\r${rel} ✓ ${info.width}×${info.height} ${info.duration.toFixed(2)}s audio:${info.audio} ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
} else if (previous) manifest.videos = previous.videos;

// 5. stills
if (!only || only === "stills") {
  await mkdir(path.join(outDir, "stills"), { recursive: true });
  for (const [i, job] of plan.stills.entries()) {
    const out = path.join(outDir, job.file);
    await writeFile(out, decode(await page.evaluate(([n, src]) => window.SL.still(n, src), [i, frameAt(job.still)])));
    const info = probe(out);
    const want = plan.formats[job.format];
    if (info.width !== want.w || info.height !== want.h) throw new Error(`${job.file} failed verification: ${JSON.stringify(info)}`);
    manifest.stills.push({ file: job.file, format: job.format, kind: job.kind, graphic: job.graphic, width: info.width, height: info.height, bytes: (await stat(out)).size });
    console.log(`${job.file} ✓ ${info.width}×${info.height}`);
  }
} else if (previous) manifest.stills = previous.stills;

// 6. content pack
if (!only || only === "pack") {
  await mkdir(path.join(root, "docs/campaign"), { recursive: true });
  await writeFile(path.join(root, "docs/campaign/x-content-pack.md"), await page.evaluate(() => window.SL.packMarkdown()));
  console.log("docs/campaign/x-content-pack.md ✓");
}

await browser.close();
await rm(tmp, { recursive: true, force: true });
if (only !== "pack") await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// 7. prelaunch leak scan of what was just written (OCR; skipped with a warning if tesseract is missing)
if (only !== "pack" && !process.argv.includes("--no-scan")) {
  const targets = [...(!only || only === "videos" ? ["public/campaign/ads"] : []), ...(!only || only === "stills" ? ["public/campaign/stills"] : [])];
  const scan = spawnSync("node", [path.join(here, "scan-urls.mjs"), ...targets], { cwd: root, stdio: "inherit" });
  if (scan.status === 1) throw new Error("leak scan found a URL, domain or address in an export: see above");
  if (scan.status !== 0) console.warn("leak scan skipped (tesseract missing); the render-time guard still ran");
}
console.log("done");
