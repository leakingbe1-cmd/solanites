#!/usr/bin/env node
/**
 * Solanites hero artwork pipeline (the Eclipse Phoenix).
 *
 *   node scripts/hero-art.mjs check    # validate the masters, no writes; exits 1 if any is rejected
 *   node scripts/hero-art.mjs build    # validate + encode into public/hero/eclipse, write src/data/heroAssets.json
 *
 * Masters:
 *   art/intro/phoenix-still-2752.png       the current phoenix still at its native 2752 × 1536
 *                                          (Runway task 47944db5), served until a replacement is approved
 *   art/hero/eclipse-phoenix-desktop.png   an approved replacement, landscape, ≥ 2560 × 1440 (3840 × 2160 preferred)
 *   art/hero/eclipse-phoenix-mobile.png    its own portrait composition, ≥ 1080 × 1920 (1440 × 2560 preferred)
 * (art/hero/ is git-ignored, like art/creatures.)
 *
 * Rules (docs/design: resolution and quality standard):
 * - Nothing is ever enlarged: each width is only produced when the master is at least that wide,
 *   and every width keeps the short edge at 1080 px or more.
 * - A master that measures as upscaled is rejected; one that measures soft is flagged for a
 *   100% review (scripts/lib/image-quality.mjs).
 * - The mobile composition is a separate file, never a crop of the desktop one.
 * The replacement (desktop + mobile) takes over only when its desktop master is accepted.
 * - Exception (owner, 22 Oct): until then, phones get a lighter centre crop of the current still
 *   (same art, cropped and compressed only), so the first screen loads faster on mobile data.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { detailCheck } from "./lib/image-quality.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "src/data/heroAssets.json");
const REPLACEMENT = { dir: path.join(ROOT, "art/hero"), out: "hero/eclipse" };

const VARIANTS = {
  // the current still, at its native resolution (never enlarged); every width keeps the short edge ≥ 1080
  current: { dir: path.join(ROOT, "art/intro"), out: "hero/current", file: "phoenix-still-2752", orientation: "landscape", min: [1920, 1080], widths: [2000, 2752], budget1920: 380 * 1024 },
  // the phone box shows the still's full height and its centre (≤ 1.3 wide per 1 high in portrait), so only that is sent
  phone: { dir: path.join(ROOT, "art/intro"), out: "hero/current", file: "phoenix-still-2752", name: "phoenix-still-2752-phone", orientation: "landscape", min: [1920, 1080], crop: 1.3, widths: [1404, 1997], budget1920: 120 * 1024, lighter: true },
  desktop: { ...REPLACEMENT, file: "eclipse-phoenix-desktop", orientation: "landscape", min: [2560, 1440], widths: [1920, 2560, 3840], budget1920: 380 * 1024 },
  mobile: { ...REPLACEMENT, file: "eclipse-phoenix-mobile", orientation: "portrait", min: [1080, 1920], widths: [1080, 1440], budget1920: 260 * 1024 },
};
// phones see the still behind a dark shade at a smaller size: stronger compression is not visible there
const PHONE_FORMATS = [
  ["avif", (s) => s.avif({ quality: 45, effort: 6, chromaSubsampling: "4:2:0" })],
  ["webp", (s) => s.webp({ quality: 76, effort: 6, smartSubsample: true })],
  ["jpg", (s) => s.jpeg({ quality: 80, mozjpeg: true })],
];
const FORMATS = [
  ["avif", (s) => s.avif({ quality: 58, effort: 6, chromaSubsampling: "4:4:4" })],
  ["webp", (s) => s.webp({ quality: 84, effort: 6, smartSubsample: true })],
  ["jpg", (s) => s.jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })],
];

function findMaster(dir, base) {
  for (const ext of [".png", ".webp", ".tif", ".tiff"]) {
    const f = path.join(dir, base + ext);
    if (existsSync(f)) return f;
  }
  return null;
}

async function validate(name, v) {
  const file = findMaster(v.dir, v.file);
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
  const { width: W, height: H } = result.meta;
  const cw = v.crop ? Math.min(W, Math.round(H * v.crop)) : W;
  const region = { left: Math.round((W - cw) / 2), top: 0, width: cw, height: H };
  const widths = v.widths.filter((w) => w <= cw);
  const out = { width: cw, height: H, sources: {} };
  for (const [fmt, enc] of v.lighter ? PHONE_FORMATS : FORMATS) {
    out.sources[fmt] = [];
    for (const w of widths) {
      const name = `${v.name ?? v.file}-${w}.${fmt}`;
      const buf = await enc(sharp(result.file).extract(region).resize({ width: w, kernel: "lanczos3" })).toBuffer();
      writeFileSync(path.join(ROOT, "public", v.out, name), buf);
      out.sources[fmt].push({ src: `/${v.out}/${name}`, w, bytes: buf.length });
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
  const ok = (name) => results.find((r) => r.name === name).status === "ok";
  // the replacement's mobile composition only ships with its desktop one
  const build = results.filter((r) => r.status === "ok" && (r.name !== "mobile" || ok("desktop")));
  const manifest = {};
  for (const out of new Set(Object.values(VARIANTS).map((v) => v.out))) rmSync(path.join(ROOT, "public", out), { recursive: true, force: true });
  for (const r of build) {
    mkdirSync(path.join(ROOT, "public", VARIANTS[r.name].out), { recursive: true });
    manifest[r.name] = await encode(r, VARIANTS[r.name]);
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${path.relative(ROOT, MANIFEST)}: ${build.map((r) => r.name).join(", ") || "nothing"}${ok("desktop") ? "" : " (no approved replacement yet)"}`);
}
process.exit(results.some((r) => r.status === "rejected") ? 1 : 0);
