#!/usr/bin/env node
/**
 * Creature scene assets: biome plates and glow maps (src/lib/creatureScenes.ts).
 *
 *   node scripts/creature-scenes.mjs build   # encode plates + derive glow maps → public/scenes, write the manifest
 *   node scripts/creature-scenes.mjs check   # validate only; exits 1 on any problem
 *   node scripts/creature-scenes.mjs rigs F  # write the idle part rigs as JSON (for scripts/qa/scene-parts.py)
 *   node scripts/creature-scenes.mjs framing F  # write plates + stage framing as JSON (for scripts/qa/scene-readability.py)
 *
 * Plates: art/scenes/<species-id>/plate.(png|webp|jpg), one painted biome per public species,
 * at least 1024 px. They are encoded to public/scenes/<id>/plate.webp (1024, used at every size, like the
 * creature paintings).
 * The masters stay out of git; a checkout without them keeps the encoded plates already in
 * public/scenes, so `build` can re-derive glow maps anywhere. A species with neither keeps the
 * CSS gradient of its biome tones; nothing is invented.
 *
 * Glow maps: for each stage whose idle profile pulses (`glow: true`), the creature's own
 * emissive pixels (close to its palette's glow colours and bright) are lifted from its
 * shipped artwork into public/scenes/<id>/glow-<n>.webp. The art itself is never changed.
 *
 * Classified species never get files here: their scenes arrive with their server bundle.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "art/scenes");
const OUT = path.join(ROOT, "public/scenes");
const MANIFEST = path.join(ROOT, "src/data/creatureScenes.json");
const STAGES = ["1-eggling", "2-hatchling", "3-evolved", "4-ascended"];
const PLATE = 1024;
const GLOW = 512;
const MAX_PLATE_BYTES = 240_000;
const EXTS = [".png", ".webp", ".jpg", ".jpeg"];
/** `check`: a committed glow map is stale when more than this share of its light differs from a fresh derivation. */
const GLOW_DRIFT = 0.02;
/** Canon C5: emission as a share of the silhouette, by rarity. A pulse may only brighten light within it. */
const EMISSION_LIMIT = { common: 0.03, rare: 0.05, epic: 0.1, legendary: 0.1 };

/** Loads the TypeScript scene config and species list (with the @/ alias) without a TS toolchain. */
async function loadTs(file) {
  const res = await esbuild.build({
    entryPoints: [path.join(ROOT, file)],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    loader: { ".json": "json" },
    plugins: [{ name: "alias", setup: (b) => b.onResolve({ filter: /^@\// }, (a) => ({ path: resolveAlias(a.path) })) }],
  });
  const tmp = path.join(ROOT, "node_modules/.cache", `scenes-${path.basename(file)}.mjs`);
  mkdirSync(path.dirname(tmp), { recursive: true });
  writeFileSync(tmp, res.outputFiles[0].text);
  return import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
}
function resolveAlias(p) {
  const base = path.join(ROOT, "src", p.slice(2));
  for (const ext of ["", ".ts", ".tsx", ".json"]) if (existsSync(base + ext)) return base + ext;
  return base;
}

function findPlate(id) {
  const dir = path.join(SRC, id);
  if (!existsSync(dir)) return null;
  const hit = readdirSync(dir).find((f) => EXTS.includes(path.extname(f).toLowerCase()) && path.basename(f, path.extname(f)) === "plate");
  return hit ? path.join(dir, hit) : null;
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/**
 * The creature's own light: pixels near one of its glow colours, and bright. Returns an RGBA
 * buffer (the pixel's colour, alpha = emission strength) and the emissive share of the body.
 */
async function glowMap(file, colours, level = 0.5) {
  const { data, info } = await sharp(file).resize(GLOW, GLOW).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  const targets = colours.map(hex);
  let body = 0;
  let lit = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    if (a < 0.12) continue;
    body++;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const v = Math.max(r, g, b) / 255;
    const sat = v > 0 ? (v - Math.min(r, g, b) / 255) / v : 0;
    let near = 0;
    for (const [tr, tg, tb] of targets) {
      const d = Math.hypot(r - tr, g - tg, b - tb) / 441;
      // as saturated as the glow colour: pale highlights and membranes are not light sources
      const ts = (Math.max(tr, tg, tb) - Math.min(tr, tg, tb)) / Math.max(tr, tg, tb, 1);
      near = Math.max(near, (1 - d / 0.3) * smooth(ts * 0.45, ts * 0.8, sat));
    }
    const e = Math.max(0, Math.min(1, near)) * smooth(level, Math.min(1, level + 0.3), v) * a;
    if (e <= 0.02) continue;
    if (e > 0.25) lit++;
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.round(e * 255);
  }
  return { out, share: body ? lit / body : 0 };
}
/** Share of glow pixels that differ clearly between the committed map and one derived from the art now. */
async function glowDrift(file, fresh) {
  const alpha = async (src) => (await sharp(src).ensureAlpha().extractChannel(3).raw().toBuffer());
  const [a, b] = await Promise.all([alpha(file), alpha(fresh)]);
  let lit = 0;
  let off = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 24 || b[i] > 24) lit++;
    if (Math.abs(a[i] - b[i]) > 40) off++;
  }
  return lit ? off / lit : 0;
}

const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function main() {
  const mode = process.argv[2] ?? "check";
  const write = mode === "build";
  const { SCENES } = await loadTs("src/lib/creatureScenes.ts");
  if (mode === "framing") {
    // plates, focus and stage framing for scripts/qa/scene-readability.py
    const { STAGE_FRAMING } = await loadTs("src/lib/creatureScenes.ts");
    const manifestNow = JSON.parse(readFileSync(MANIFEST, "utf8"));
    const species = Object.fromEntries(Object.entries(SCENES).map(([id, sc]) => [id, { plate: manifestNow.species[id]?.plate ?? null, focus: sc.biome.focus ?? [50, 48], lift: sc.biome.lift ?? 0, calm: sc.biome.calm ?? 1, floor: sc.biome.floor ?? 0, soften: sc.biome.soften ?? 0, deep: sc.biome.tones[2] }]));
    writeFileSync(process.argv[3] ?? "/dev/stdout", JSON.stringify({ framing: STAGE_FRAMING, species }));
    return;
  }
  if (mode === "rigs") {
    // part rigs for scripts/qa/scene-parts.py
    const rigs = Object.fromEntries(Object.entries(SCENES).map(([id, sc]) => [id, Object.fromEntries(sc.idle.stages.map((st, n) => [n, st.parts ?? []]))]));
    writeFileSync(process.argv[3] ?? "/dev/stdout", JSON.stringify(rigs));
    return;
  }
  const { SPECIES } = await loadTs("src/lib/species.ts");
  const problems = [];
  const report = [];
  const manifest = { generated: "scripts/creature-scenes.mjs", spec: { plate: PLATE, glow: GLOW, format: "webp" }, species: {} };

  for (const s of SPECIES) {
    const scene = SCENES[s.id];
    if (!scene) {
      problems.push(`${s.id}: no scene in src/lib/creatureScenes.ts`);
      continue;
    }
    const entry = { plate: null, glow: [null, null, null, null] };
    const dir = path.join(OUT, s.id);
    const src = findPlate(s.id);
    if (src) {
      const meta = await sharp(src).metadata();
      const opaque = (await sharp(src).stats()).isOpaque;
      if (Math.min(meta.width, meta.height) < PLATE) problems.push(`${s.id}: plate is ${meta.width}×${meta.height}, needs at least ${PLATE}`);
      if (!opaque) problems.push(`${s.id}: plate has transparency; biome plates are opaque`);
      if (write) {
        mkdirSync(dir, { recursive: true });
        const big = await sharp(src).resize(PLATE, PLATE, { fit: "cover" }).webp({ quality: 72, effort: 6 }).toBuffer();
        if (big.length > MAX_PLATE_BYTES) problems.push(`${s.id}: plate.webp is ${big.length} bytes (max ${MAX_PLATE_BYTES})`);
        writeFileSync(path.join(dir, "plate.webp"), big);
        report.push(`${s.id}: plate ${(big.length / 1024).toFixed(0)} KB`);
      }
      entry.plate = `/scenes/${s.id}/plate.webp`;
    } else if (existsSync(path.join(dir, "plate.webp"))) {
      // masters are not committed (art/scenes is ignored): a checkout without them keeps the encoded plate
      const meta = await sharp(path.join(dir, "plate.webp")).metadata();
      if (meta.width !== PLATE || meta.height !== PLATE) problems.push(`${s.id}: public plate.webp is ${meta.width}×${meta.height}, expected ${PLATE}`);
      entry.plate = `/scenes/${s.id}/plate.webp`;
    }

    const glowFrom = scene.idle.glowFrom ?? ["accent"];
    for (let n = 0; n < 4; n++) {
      if (!scene.idle.stages[n].glow) continue;
      if (!scene.anatomy.emissive) problems.push(`${s.id} stage ${n + 1}: glow pulse on a species without anatomical light`);
      const art = path.join(ROOT, "public/creatures", s.id, `${STAGES[n]}.webp`);
      if (!existsSync(art)) {
        problems.push(`${s.id} stage ${n + 1}: no artwork to derive a glow map from`);
        continue;
      }
      const { out, share } = await glowMap(art, glowFrom.map((k) => s.palette[k]), scene.idle.glowLevel);
      if (share > EMISSION_LIMIT[s.rarity]) problems.push(`${s.id} stage ${n + 1}: glow map covers ${(share * 100).toFixed(1)}% of the body, over the ${s.rarity} limit of ${EMISSION_LIMIT[s.rarity] * 100}% (canon C5)`);
      if (share < 0.002) problems.push(`${s.id} stage ${n + 1}: glow map is empty (${(share * 100).toFixed(2)}% lit); pick other glowFrom colours`);
      const buf = await sharp(out, { raw: { width: GLOW, height: GLOW, channels: 4 } }).blur(0.8).webp({ quality: 70, alphaQuality: 80, effort: 6 }).toBuffer();
      const file = path.join(dir, `glow-${n + 1}.webp`);
      if (write) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(file, buf);
        report.push(`${s.id} stage ${n + 1}: glow ${(share * 100).toFixed(1)}% of body, ${(buf.length / 1024).toFixed(0)} KB`);
      } else if (!existsSync(file)) problems.push(`${s.id} stage ${n + 1}: ${path.relative(ROOT, file)} is missing: run \`node scripts/creature-scenes.mjs build\``);
      else if ((await glowDrift(file, buf)) > GLOW_DRIFT) problems.push(`${s.id} stage ${n + 1}: ${path.relative(ROOT, file)} was derived from other artwork: run \`node scripts/creature-scenes.mjs build\``);
      entry.glow[n] = `/scenes/${s.id}/glow-${n + 1}.webp`;
    }
    manifest.species[s.id] = entry;
  }

  for (const line of report) console.log(line);
  if (write) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  else {
    const current = JSON.parse(readFileSync(MANIFEST, "utf8"));
    if (JSON.stringify(current.species) !== JSON.stringify(manifest.species)) problems.push("src/data/creatureScenes.json is stale: run `node scripts/creature-scenes.mjs build`");
  }
  const plates = Object.values(manifest.species).filter((e) => e.plate).length;
  console.log(`${plates}/${SPECIES.length} biome plates, ${Object.values(manifest.species).reduce((n, e) => n + e.glow.filter(Boolean).length, 0)} glow maps`);
  if (problems.length) {
    for (const p of problems) console.error("✗ " + p);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
