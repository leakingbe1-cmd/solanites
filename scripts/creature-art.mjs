#!/usr/bin/env node
/**
 * Solanites creature artwork pipeline.
 *
 *   node scripts/creature-art.mjs build    # validate + optimise art/creatures → public/creatures, write manifest + checklist
 *   node scripts/creature-art.mjs check    # same validation, no writes; exits 1 if any supplied file is invalid
 *   node scripts/creature-art.mjs prompts  # regenerate docs/creature-art/prompts.md from the design bible
 *
 * Source masters go in art/creatures/<species-id>/<n>-<stage>.(png|webp|jpg)
 * e.g. art/creatures/mossling/1-eggling.png … 4-ascended.png
 * Nothing is ever invented: a stage without a source file stays "missing"
 * and the site keeps showing the four-stage vector drawing for it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { detailCheck } from "./lib/image-quality.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "art/creatures");
const OUT = path.join(ROOT, "public/creatures");
const MANIFEST = path.join(ROOT, "src/data/creatureAssets.json");
const CHECKLIST = path.join(ROOT, "docs/creature-art/checklist.md");
const PROMPTS = path.join(ROOT, "docs/creature-art/prompts.md");

const designs = JSON.parse(readFileSync(path.join(ROOT, "src/data/creatureDesigns.json"), "utf8"));
// Classified (Mythic/Secret) design text is server only. It feeds the prompt sheet, but those
// species never get public asset files or manifest entries: their art is served by the server.
const classifiedDesigns = JSON.parse(readFileSync(path.join(ROOT, "src/server/classified/designs.json"), "utf8"));
const STAGES = designs.stageNames.map((s) => s.toLowerCase()); // eggling, hatchling, evolved, ascended
const { size: SIZE, thumbSize: THUMB, maxBytes: MAX_BYTES } = designs.style.spec;
/**
 * Delivery is SIZE × SIZE (1024, docs/canon/solanites-art-canon.md C12). Larger working
 * masters (e.g. 2048) are accepted and reduced; nothing smaller is ever enlarged.
 */
const MIN_INPUT = SIZE;
/** Canon C13 framing tool, run on the delivered canvas. */
const FRAMING_TOOL = path.join(ROOT, "docs/canon/measure-framing.py");
/** Classified until discovered — they also get a silhouette asset so the full art is never needed to show "???". */
const CLASSIFIED = new Set(["astravex", "orbelith", "eventide", "helivane", "genesis", "nullborn"]);
const EXTS = [".png", ".webp", ".jpg", ".jpeg"];

function findSource(id, n) {
  const dir = path.join(SRC, id);
  if (!existsSync(dir)) return null;
  const base = `${n + 1}-${STAGES[n]}`;
  const hit = readdirSync(dir).find((f) => EXTS.includes(path.extname(f).toLowerCase()) && path.basename(f, path.extname(f)).toLowerCase() === base);
  return hit ? path.join(dir, hit) : null;
}

async function inspect(file, n) {
  const meta = await sharp(file).metadata();
  // An alpha channel is not enough: many exporters add one to fully opaque images.
  const transparent = !!meta.hasAlpha && !(await sharp(file).stats()).isOpaque;
  const problems = [];
  const warnings = [];
  if (!meta.width || !meta.height) problems.push("unreadable image");
  else {
    if (Math.min(meta.width, meta.height) < MIN_INPUT) problems.push(`too small (${meta.width}×${meta.height}, need ≥ ${MIN_INPUT}px)`);
    const ratio = meta.width / meta.height;
    if (ratio < 0.8 || ratio > 1.25) warnings.push(`not square (${meta.width}×${meta.height}); it will be letterboxed`);
  }
  if (!transparent) warnings.push("no transparency; it will be shown with a soft vignette on the dark card");
  if (meta.width && meta.height) {
    const detail = await detailCheck(file);
    if (detail.verdict === "upscaled") problems.push(`measures as upscaled (high-frequency ratio ${detail.ratio}): supply the native output`);
    else if (detail.verdict === "low-detail") warnings.push(`little fine detail (ratio ${detail.ratio}): check face, edges and material at 100%`);
  }
  if (!problems.length) {
    const framing = measureFraming(await deliveredCanvas(file, transparent), n + 1);
    if (framing.error) problems.push(`framing not measured: ${framing.error}`);
    else {
      const where = `occupancy ${framing.occupancy}% (target ${framing.target} ± 3), centre ${framing.centre.join("% / ")}%`;
      if (!framing.occupancyPass || !framing.centrePass) problems.push(`framing outside canon C13: ${where}`);
    }
  }
  return { meta, transparent, problems, warnings };
}

/** The canvas exactly as `processOne` delivers it, as a PNG for measuring. */
async function deliveredCanvas(file, transparent) {
  const bg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 7, g: 6, b: 13, alpha: 1 };
  const dir = mkdtempSync(path.join(os.tmpdir(), "solanites-framing-"));
  const out = path.join(dir, "delivered.png");
  await sharp(file).rotate().resize(SIZE, SIZE, { fit: "contain", background: bg }).png().toFile(out);
  return out;
}

/** Runs the canon's own measure() so the pipeline and the canon can never disagree. */
function measureFraming(file, stage) {
  const code = "import json,runpy,sys; m=runpy.run_path(sys.argv[1]); print(json.dumps(m['measure'](sys.argv[2], int(sys.argv[3]))))";
  try {
    return JSON.parse(execFileSync("python3", ["-I", "-c", code, FRAMING_TOOL, file, String(stage)], { encoding: "utf8" }));
  } catch (e) {
    return { error: `python3 with Pillow is required (${String(e.message).split("\n")[0]})` };
  } finally {
    rmSync(path.dirname(file), { recursive: true, force: true });
  }
}

/** Bits that may differ between two 16×16 average hashes before they count as the same picture. */
const DUPLICATE_DISTANCE = 20;

/** 256-bit average hash of the image composited on black (so transparent art compares by its shape too). */
async function perceptualHash(file) {
  const { data } = await sharp(file).flatten({ background: "#000" }).greyscale().resize(16, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const mean = data.reduce((a, v) => a + v, 0) / data.length;
  return Array.from(data, (v) => (v > mean ? "1" : "0")).join("");
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

async function processOne(id, n, file, info) {
  const dir = path.join(OUT, id);
  mkdirSync(dir, { recursive: true });
  const base = `${n + 1}-${STAGES[n]}`;
  const bg = info.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 5, g: 5, b: 10, alpha: 1 };
  const square = sharp(file).rotate().resize(SIZE, SIZE, { fit: "contain", background: bg });
  const full = await square.clone().webp({ quality: 86, alphaQuality: 90, effort: 5 }).toBuffer();
  const thumb = await sharp(full).resize(THUMB, THUMB).webp({ quality: 82, effort: 5 }).toBuffer();
  writeFileSync(path.join(dir, `${base}.webp`), full);
  writeFileSync(path.join(dir, `${base}-${THUMB}.webp`), thumb);
  const entry = { src: `/creatures/${id}/${base}.webp`, thumb: `/creatures/${id}/${base}-${THUMB}.webp`, alpha: info.transparent, bytes: full.length };
  if (full.length > MAX_BYTES) info.warnings.push(`optimised file is ${Math.round(full.length / 1024)} KB (budget ${Math.round(MAX_BYTES / 1024)} KB)`);
  if (CLASSIFIED.has(id) && info.transparent) {
    // Shape only: every visible pixel becomes the same dark tone.
    const { data, info: raw } = await sharp(full).resize(THUMB, THUMB).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 8;
      data[i + 1] = 6;
      data[i + 2] = 20;
    }
    const sil = await sharp(data, { raw }).webp({ quality: 80 }).toBuffer();
    writeFileSync(path.join(dir, `${base}-silhouette.webp`), sil);
    entry.silhouette = `/creatures/${id}/${base}-silhouette.webp`;
  }
  return entry;
}

async function run(mode) {
  const write = mode === "build";
  if (write && existsSync(OUT)) rmSync(OUT, { recursive: true });
  const manifest = { generated: "scripts/creature-art.mjs", spec: designs.style.spec, species: {} };
  const rows = [];
  /** Perceptual hash → file: the same artwork may not stand in for two stages or species. */
  const seen = new Map();
  let supplied = 0;
  let ok = 0;
  let invalid = 0;
  for (const id of Object.keys(designs.species)) {
    const stages = [];
    const cells = [];
    for (let n = 0; n < 4; n++) {
      const file = findSource(id, n);
      if (!file) {
        stages.push(null);
        cells.push("— missing");
        continue;
      }
      supplied++;
      const info = await inspect(file, n);
      const rel = path.relative(ROOT, file);
      if (!info.problems.length) {
        const hash = await perceptualHash(file);
        for (const [other, otherFile] of seen) {
          if (hamming(hash, other) <= DUPLICATE_DISTANCE) info.problems.push(`same image as ${otherFile} (resized or re-encoded copy)`);
        }
        seen.set(hash, rel);
      }
      if (info.problems.length) {
        invalid++;
        stages.push(null);
        cells.push(`✗ ${info.problems.join("; ")}`);
        console.error(`✗ ${rel}: ${info.problems.join("; ")}`);
        continue;
      }
      const entry = write ? await processOne(id, n, file, info) : null;
      stages.push(entry);
      ok++;
      cells.push(info.warnings.length ? `✓ (${info.warnings.join("; ")})` : "✓");
      for (const w of info.warnings) console.warn(`! ${rel}: ${w}`);
    }
    manifest.species[id] = stages;
    rows.push(`| ${id} | ${cells.join(" | ")} |`);
  }
  const total = Object.keys(designs.species).length * 4;
  const summary = `${ok} of ${total} stage assets supplied and valid · ${total - supplied} missing · ${invalid} invalid`;
  console.log(summary);
  if (write) {
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
    writeFileSync(
      CHECKLIST,
      [
        "# Creature artwork checklist",
        "",
        "Generated by `npm run art:build`. A stage counts as done only when a real artwork file has been supplied and passed validation.",
        "Raster art is an optional painted upgrade; until a stage has one, the site shows its vector drawing.",
        "",
        `**${summary}**`,
        "",
        `| Species | ${designs.stageNames.join(" | ")} |`,
        "|---|---|---|---|---|",
        ...rows,
        "",
      ].join("\n"),
    );
  }
  if (mode === "check" && invalid) process.exit(1);
}

function prompts() {
  const { style } = designs;
  const out = [
    "# Creature artwork prompts",
    "",
    "Generated from `src/data/creatureDesigns.json` by `npm run art:prompts`. One prompt per species and stage; generate each image on its own (never a sheet to be cropped).",
    "",
    `**Output spec:** ${style.spec.size}×${style.spec.size} px, transparent background preferred (PNG or WebP), creature centred at about 80% of the frame height, same camera and lighting for every image.`,
    "",
    "**Save as:** `art/creatures/<species-id>/<n>-<stage>.png`, then run `npm run art:build`.",
    "",
    "**Shared style (included in every prompt):**",
    "",
    `> ${style.prompt}`,
    "",
    `**Avoid:** ${style.negative}`,
    "",
  ];
  for (const [id, s] of Object.entries({ ...designs.species, ...classifiedDesigns.species })) {
    out.push(`## ${id}`, "", `- **Silhouette:** ${s.silhouette}`, `- **Anatomy:** ${s.anatomy}`, `- **Face:** ${s.face}`, `- **Posture:** ${s.posture}`, `- **Materials:** ${s.materials}`, `- **Effects:** ${s.effects}`);
    if (s.reference) out.push(`- **Reference strip:** \`${s.reference}\``);
    out.push("");
    s.stages.forEach((st, n) => {
      const file = `art/creatures/${id}/${n + 1}-${STAGES[n]}.png`;
      out.push(
        `### ${n + 1}. ${designs.stageNames[n]} → \`${file}\``,
        "",
        "```text",
        `${style.prompt} Species "${id}", ${designs.stageNames[n]} stage (${n + 1} of 4). ${s.silhouette} ${s.anatomy} Face: ${s.face} Materials: ${s.materials} Effects: ${s.effects} This stage: ${st.brief} Posture: ${n === 0 ? "small, young and vulnerable" : s.posture} Avoid: ${style.negative}.`,
        "```",
        "",
      );
    });
  }
  writeFileSync(PROMPTS, out.join("\n"));
  console.log(`wrote ${path.relative(ROOT, PROMPTS)}`);
}

const mode = process.argv[2] ?? "check";
if (mode === "prompts") prompts();
else if (mode === "build" || mode === "check") await run(mode);
else {
  console.error("usage: creature-art.mjs build|check|prompts");
  process.exit(2);
}
