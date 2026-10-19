// Safety and spec checks for the product-reveal exports.
//   node campaign/product-reveal/build/check.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanText } from "../../x-teasers/build/check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "export");
const problems = [];

// capture.mjs records a local production build; that one origin is allowed there and nowhere else
const LOCAL_BUILD = "http://localhost:3100";
for (const f of ["reveal.js", "still.js", "capture.mjs", "engine.js", "engine.html"]) {
  const src = readFileSync(join(HERE, f), "utf8");
  problems.push(...scanText(f, f === "capture.mjs" ? src.split(LOCAL_BUILD).join("") : src, ["link"]));
}
for (const f of ["reveal.js", "still.js"]) problems.push(...scanText(`${f} (copy)`, JSON.stringify((await import(`./${f}`)).APPROVED_TEXT)));
if (existsSync(join(HERE, "..", "README.md"))) problems.push(...scanText("README.md", readFileSync(join(HERE, "..", "README.md"), "utf8")));

const VIDEOS = {
  "solanites-product-reveal-16x9.mp4": [1920, 1080, 15, 20],
  "solanites-product-reveal-9x16.mp4": [1080, 1920, 15, 20],
  "clips/solanites-clip-collection-4x5.mp4": [1080, 1350, 5, 15],
  "clips/solanites-clip-hatch-4x5.mp4": [1080, 1350, 5, 15],
  "clips/solanites-clip-rarity-4x5.mp4": [1080, 1350, 5, 15],
};
const textOk = file => {
  const log = join(OUT, file.replace(/\.(mp4|jpg)$/, ".text.json"));
  const { drawn, approved } = JSON.parse(readFileSync(log, "utf8"));
  for (const s of drawn) if (!approved.includes(s)) problems.push(`${file}: unapproved on-screen text "${s}"`);
  return drawn;
};
for (const [file, [w, h, min, max]] of Object.entries(VIDEOS)) {
  const p = join(OUT, file);
  if (!existsSync(p)) { problems.push(`${file}: missing`); continue; }
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", p], { encoding: "utf8" }));
  const v = probe.streams.find(s => s.codec_type === "video"), a = probe.streams.find(s => s.codec_type === "audio");
  const dur = +probe.format.duration;
  if (v.codec_name !== "h264" || v.width !== w || v.height !== h || v.pix_fmt !== "yuv420p" || v.r_frame_rate !== "30/1") problems.push(`${file}: video ${v.codec_name} ${v.width}x${v.height} ${v.pix_fmt} ${v.r_frame_rate}`);
  if (!a || a.codec_name !== "aac" || +a.channels !== 2) problems.push(`${file}: no stereo AAC audio`);
  if (dur < min || dur > max) problems.push(`${file}: duration ${dur}s outside ${min}–${max} s`);
  // the decoded audio must not clip (AAC can overshoot the mastered peak)
  const peak = +(/Peak level dB:\s*(-?[\d.]+|-inf)/.exec(execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${p}" -vn -af astats=metadata=0 -f null - 2>&1 | grep "Peak level dB" | tail -1`], { encoding: "utf8" }))?.[1] ?? 0);
  if (!(peak < -0.5)) problems.push(`${file}: decoded audio peaks at ${peak} dBFS`);
  else console.log(`  decoded audio peak ${peak} dBFS`);
  try { execFileSync("ffmpeg", ["-v", "error", "-xerror", "-i", p, "-f", "null", "-"]); } catch { problems.push(`${file}: decode error`); }
  textOk(file);
  console.log(`${file}: ${v.width}x${v.height} h264 30fps, ${dur.toFixed(2)} s, audio ${a?.codec_name} ${a?.sample_rate} Hz ${a?.channels}ch`);
}
const still = "solanites-product-reveal-4x5.jpg";
if (!existsSync(join(OUT, still))) problems.push(`${still}: missing`);
else {
  const dims = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", join(OUT, still)], { encoding: "utf8" }).trim();
  if (dims !== "1440,1800") problems.push(`${still}: ${dims}`);
  textOk(still); console.log(`${still}: ${dims.replace(",", "x")}`);
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("product-reveal checks passed");
