/**
 * Image quality checks shared by the art pipelines (hero, creatures).
 *
 * Pixel dimensions say nothing about sharpness: an upscaled or soft image has the
 * pixels but not the detail. The check shrinks the image to 75% and scales it back,
 * then measures how much changed (PSNR on luminance). A sharp image loses real detail
 * in that round trip; a soft or upscaled one barely changes.
 *
 * Measured on the most detailed 1024 px region (ffmpeg lanczos, 0.75 round trip):
 *   sharp vector sheet, UI screenshot            34–35 dB
 *   the retired phoenix still (visibly soft)       37.9 dB
 *   flat-colour test card (little fine detail)     39.7 dB
 *   the still upscaled from 75% / from 50%         48.3 / 53.2 dB
 *
 * Only "upscaled" is a hard verdict: enlargement leaves a wide, content-independent gap.
 * "low-detail" is advisory, because flat graphic shapes score like a soft painting; it
 * asks for the 100% review that every approved image gets anyway.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const SOFT_DB = 38;
export const UPSCALED_DB = 44;

/** Round-trip PSNR (dB) after scaling to `factor` and back. Needs ffmpeg on PATH. */
export function roundTripPsnr(file, factor = 0.75) {
  const size = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", file], { encoding: "utf8" }).trim();
  const [w, h] = size.split("x");
  const graph = `[0]format=gray,split[a][b];[b]scale=trunc(iw*${factor}/2)*2:-2:flags=lanczos,scale=${w}:${h}:flags=lanczos[c];[a][c]psnr`;
  const run = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-filter_complex", graph, "-f", "null", "-"], { encoding: "utf8" });
  const out = run.stderr ?? "";
  const m = out.match(/average:([0-9.]+|inf)/);
  if (!m) throw new Error(`could not measure ${file}`);
  return m[1] === "inf" ? Infinity : Number(m[1]);
}

/**
 * The most detailed square region (by luminance spread), written to a temporary PNG.
 * Dark compositions are mostly empty space, which never changes in the round trip and
 * would make every image read as soft; the verdict is about where the detail should be.
 */
async function busiestRegion(file, tmpDir, size = 1024) {
  const { default: sharp } = await import("sharp");
  const meta = await sharp(file).metadata();
  const s = Math.min(size, meta.width, meta.height);
  let best = null;
  const step = Math.max(64, Math.floor(s / 2));
  for (let top = 0; top + s <= meta.height; top += step) {
    for (let left = 0; left + s <= meta.width; left += step) {
      const { channels } = await sharp(file).extract({ left, top, width: s, height: s }).flatten({ background: "#07060a" }).greyscale().stats();
      if (!best || channels[0].stdev > best.stdev) best = { left, top, stdev: channels[0].stdev };
    }
  }
  mkdirSync(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `${path.basename(file, path.extname(file))}-region.png`);
  await sharp(file).extract({ left: best.left, top: best.top, width: s, height: s }).flatten({ background: "#07060a" }).png().toFile(out);
  return out;
}

/** "native" | "low-detail" (advisory: review at 100%) | "upscaled" (reject), on the most detailed region. */
export async function detailCheck(file, tmpDir = path.join(os.tmpdir(), "solanites-quality")) {
  const psnr = roundTripPsnr(await busiestRegion(file, tmpDir));
  const verdict = psnr >= UPSCALED_DB ? "upscaled" : psnr >= SOFT_DB ? "low-detail" : "native";
  return { psnr: Math.round(psnr * 10) / 10, verdict };
}
