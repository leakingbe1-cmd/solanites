// Safety and spec checks for the finished teaser videos.
//   node campaign/hatchery-awakening/build/check.mjs
// - every composition and build file is free of links, addresses, dates, token or financial wording
//   (the same patterns as the X teaser guardrails);
// - every string drawn on screen is on the composition's approved list (render.mjs records them);
// - the six source teasers are untouched (identical to the committed files);
// - each MP4 has the expected size, length, frame rate and an AAC audio track.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanText } from "../../x-teasers/build/check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "export");
const problems = [];

for (const f of ["teaser.js", "engine.js", "engine.html"]) problems.push(...scanText(f, readFileSync(join(HERE, f), "utf8"), ["link"]));
problems.push(...scanText("teaser.js (copy)", JSON.stringify((await import("./teaser.js")).APPROVED_TEXT)));
if (existsSync(join(HERE, "..", "README.md"))) problems.push(...scanText("README.md", readFileSync(join(HERE, "..", "README.md"), "utf8")));

try { execFileSync("git", ["diff", "--quiet", "HEAD", "--", join(HERE, "../../x-teasers/export")]); }
catch { problems.push("the six source teasers in campaign/x-teasers/export have been modified"); }

const EXPECT = {
  "solanites-hatchery-awakening-9x16.mp4": [1080, 1920],
  "solanites-hatchery-awakening-16x9.mp4": [1920, 1080],
};
for (const [file, [w, h]] of Object.entries(EXPECT)) {
  const p = join(OUT, file);
  if (!existsSync(p)) { problems.push(`${file}: missing`); continue; }
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", p], { encoding: "utf8" }));
  const v = probe.streams.find(s => s.codec_type === "video"), a = probe.streams.find(s => s.codec_type === "audio");
  const dur = +probe.format.duration;
  if (v.codec_name !== "h264" || v.width !== w || v.height !== h || v.pix_fmt !== "yuv420p") problems.push(`${file}: video is ${v.codec_name} ${v.width}x${v.height} ${v.pix_fmt}`);
  if (v.r_frame_rate !== "30/1") problems.push(`${file}: frame rate ${v.r_frame_rate}`);
  if (!a || a.codec_name !== "aac" || +a.channels !== 2) problems.push(`${file}: no stereo AAC audio`);
  if (dur < 15 || dur > 20) problems.push(`${file}: duration ${dur}s outside 15–20 s`);
  // decode the whole file to prove it plays end to end
  // the decoded audio must not clip (AAC can overshoot the mastered peak)
  const peak = +(/Peak level dB:\s*(-?[\d.]+|-inf)/.exec(execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${p}" -vn -af astats=metadata=0 -f null - 2>&1 | grep "Peak level dB" | tail -1`], { encoding: "utf8" }))?.[1] ?? 0);
  if (!(peak < -0.5)) problems.push(`${file}: decoded audio peaks at ${peak} dBFS`);
  else console.log(`  decoded audio peak ${peak} dBFS`);
  try { execFileSync("ffmpeg", ["-v", "error", "-xerror", "-i", p, "-f", "null", "-"]); } catch (e) { problems.push(`${file}: decode error`); }
  const textLog = p.replace(/\.mp4$/, ".text.json");
  const { drawn, approved } = JSON.parse(readFileSync(textLog, "utf8"));
  for (const s of drawn) if (!approved.includes(s)) problems.push(`${file}: unapproved on-screen text "${s}"`);
  console.log(`${file}: ${v.width}x${v.height} h264 30fps, ${dur.toFixed(2)} s, audio ${a?.codec_name} ${a?.sample_rate} Hz ${a?.channels}ch`);
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("hatchery-awakening checks passed");
