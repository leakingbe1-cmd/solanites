#!/usr/bin/env node
/**
 * Solanites hero artwork pipeline (the Eclipse Phoenix).
 *
 *   node scripts/hero-art.mjs check    # validate the masters, no writes; exits 1 if any is rejected
 *   node scripts/hero-art.mjs build    # validate + encode into public/hero/eclipse, write src/data/heroAssets.json
 *
 * Masters go in art/hero/ (git-ignored, like art/creatures):
 *   art/hero/eclipse-phoenix-desktop.png   landscape composition, ≥ 2560 × 1440 (3840 × 2160 preferred)
 *   art/hero/eclipse-phoenix-mobile.png    its own portrait composition, ≥ 1080 × 1920 (1440 × 2560 preferred)
 *
 * Rules (docs/design: resolution and quality standard):
 * - Nothing is ever enlarged: each width is only produced when the master is at least that wide.
 * - A master that measures as upscaled is rejected; one that measures soft is flagged for a
 *   100% review (scripts/lib/image-quality.mjs).
 * - The mobile composition is a separate file, never a crop of the desktop one.
 * Without an accepted desktop master the manifest stays empty and the site keeps its current hero.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { detailCheck } from "./lib/image-quality.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "art/hero");
const OUT = path.join(ROOT, "public/hero/eclipse");
const MANIFEST = path.join(ROOT, "src/data/heroAssets.json");

const VARIANTS = {
  desktop: { file: "eclipse-phoenix-desktop", orientation: "landscape", min: [2560, 1440], widths: [1280, 1920, 2560, 3840], budget1920: 380 * 1024 },
  mobile: { file: "eclipse-phoenix-mobile", orientation: "portrait", min: [1080, 1920], widths: [720, 1080, 1440], budget1920: 260 * 1024 },
};
const FORMATS = [
  ["avif", (s) => s.avif({ quality: 58, effort: 6, chromaSubsampling: "4:4:4" })],
  ["webp", (s) => s.webp({ quality: 84, effort: 6, smartSubsample: true })],
  ["jpg", (s) => s.jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })],
];

function findMaster(base) {
  for (const ext of [".png", ".webp", ".tif", ".tiff"]) {
    const f = path.join(SRC, base + ext);
    if (existsSync(f)) return f;
  }
  return null;
}

async function validate(name, v) {
  const file = findMaster(v.file);
  if (!file) return { name, file: null, status: "missing", problems: [], warnings: [] };
  const meta = await sharp(file).metadata();
  const problems = [];
  const warnings = [];
  const landscape = meta.width > meta.height;
  if ((v.orientation === "landscape") !== landscape) problems.push(`wrong orientation (${meta.width}×${meta.height}, need ${v.orientation})`);
  const [mw, mh] = v.min;
  if (meta.width < mw || meta.height < mh) problems.push(`too small (${meta.width}×${meta.height}, need ≥ ${mw}×${mh})`);
  const detail = await detailCheck(file);
  if (detail.verdict === "upscaled") problems.push(`measures as upscaled (high-frequency ratio ${detail.ratio}): use the native output`);
  if (detail.verdict === "low-detail") warnings.push(`little fine detail (ratio ${detail.ratio}): review face, feathers and edges at 100% before approval`);
  return { name, file, meta, detail, status: problems.length ? "rejected" : "ok", problems, warnings };
}

async function encode(result, v) {
  const widths = v.widths.filter((w) => w <= result.meta.width);
  const out = { width: result.meta.width, height: result.meta.height, sources: {} };
  for (const [fmt, enc] of FORMATS) {
    out.sources[fmt] = [];
    for (const w of widths) {
      const name = `${v.file}-${w}.${fmt}`;
      const buf = await enc(sharp(result.file).resize({ width: w, kernel: "lanczos3" })).toBuffer();
      writeFileSync(path.join(OUT, name), buf);
      out.sources[fmt].push({ src: `/hero/eclipse/${name}`, w, bytes: buf.length });
      if (fmt === "avif" && w === Math.min(1920, widths.at(-1)) && buf.length > v.budget1920) result.warnings.push(`${name} is ${Math.round(buf.length / 1024)} KB (budget ${Math.round(v.budget1920 / 1024)} KB)`);
    }
  }
  return out;
}

const mode = process.argv[2] ?? "check";
const results = [];
for (const [name, v] of Object.entries(VARIANTS)) results.push(await validate(name, v));

for (const r of results) {
  const dims = r.meta ? ` ${r.meta.width}×${r.meta.height}` : "";
  const detail = r.detail ? ` detail ratio ${r.detail.ratio} (${r.detail.verdict})` : "";
  console.log(`${r.name.padEnd(8)} ${r.status.padEnd(9)}${dims}${detail}`);
  for (const p of r.problems) console.log(`         ✗ ${p}`);
  for (const w of r.warnings) console.log(`         ! ${w}`);
}

if (mode === "build") {
  const desktop = results.find((r) => r.name === "desktop");
  const manifest = {};
  if (desktop.status === "ok") {
    rmSync(OUT, { recursive: true, force: true });
    mkdirSync(OUT, { recursive: true });
    for (const r of results) if (r.status === "ok") manifest[r.name] = await encode(r, VARIANTS[r.name]);
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(desktop.status === "ok" ? `wrote ${path.relative(ROOT, MANIFEST)}` : "no accepted desktop master: manifest left empty, the site keeps its current hero");
}
process.exit(results.some((r) => r.status === "rejected") ? 1 : 0);
