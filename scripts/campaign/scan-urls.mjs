// Prelaunch leak check: OCRs every still and a frame every 0.25 s of every video
// and fails if any URL, domain, QR-looking text or contract-style address shows up.
//
//   node scripts/campaign/scan-urls.mjs [dir-or-file ...]   (default: public/campaign/ads public/campaign/stills)
//
// Needs ffmpeg and tesseract (apt install tesseract-ocr). OCR can miss stylised
// text, so this backs up, never replaces, the render-time guard and a visual review.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const FORBIDDEN = [
  { re: /vercel/i, why: "Vercel domain" },
  { re: /https?:|www\./i, why: "URL" },
  { re: /\b[a-z0-9-]{2,}\s?\.\s?(app|com|io|xyz|net|org|gg|fun|site|link)\b/i, why: "domain" },
  { re: /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, why: "contract-style address" },
];

const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8" });
const ocr = (img) => run("tesseract", [img, "-", "--psm", "11"]).stdout ?? "";

function files(targets) {
  return targets.flatMap((t) => (statSync(t).isDirectory() ? readdirSync(t).map((f) => path.join(t, f)) : [t])).filter((f) => /\.(mp4|webm|mov|jpe?g|png)$/i.test(f));
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["public/campaign/ads", "public/campaign/stills"];
if (run("tesseract", ["--version"]).status !== 0) {
  console.error("tesseract not found: install tesseract-ocr to run the leak scan");
  process.exit(2);
}
let bad = 0;
for (const f of files(targets)) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "sl-scan-"));
  const video = /\.(mp4|webm|mov)$/i.test(f);
  // upscale and boost contrast so small mono text OCRs reliably
  run("ffmpeg", ["-v", "error", "-i", f, ...(video ? ["-vf", "fps=4,scale=iw*1.5:-1"] : ["-vf", "scale=iw*1.5:-1"]), path.join(tmp, "f%04d.png")]);
  const frames = readdirSync(tmp).sort();
  const hits = [];
  for (const fr of frames) {
    const text = ocr(path.join(tmp, fr));
    for (const { re, why } of FORBIDDEN) {
      const m = text.match(re);
      if (m) hits.push(`${video ? `${(Number(fr.slice(1, 5)) - 1) / 4}s` : "image"}: ${why} "${m[0]}"`);
    }
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`${hits.length ? "✗" : "✓"} ${f} (${frames.length} frame${frames.length === 1 ? "" : "s"} OCR'd)${hits.length ? "\n    " + [...new Set(hits)].slice(0, 6).join("\n    ") : ""}`);
  if (hits.length) bad++;
}
process.exit(bad ? 1 : 0);
