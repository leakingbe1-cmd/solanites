// Prepublication checks for the promo videos, poster and caption pack.
//   node campaign/website-promo-video/build/validate.mjs
// 1. Every MP4 decodes end to end, has the right size, 30 fps, ~27 s, and a non-silent stereo AAC track.
// 2. First, middle and last frames are extracted to build/.cache/check/ for manual review.
// 3. Frames sampled every 0.5 s (and the poster) are OCR'd and scanned for links, the deployment,
//    addresses, dates, launch details, token figures, timers, rewards and financial wording,
//    and checked for QR codes.
// 4. Captions fit X's 280 weighted characters and pass the same scans.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "..");
const EXPORT = join(DIR, "export");
const CHECK = join(HERE, ".cache", "check");
const problems = [];
const fail = (w, m) => problems.push(`${w}: ${m}`);
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts });

const PRIVACY = [
  [/https?:\/\/|\bwww\./i, "link"],
  [/\b[a-z0-9-]+\.(com|app|io|xyz|fun|net|org|gg|so|sol|ai|co|dev|site|link|me|tv)\b/i, "domain"],
  [/vercel|netlify|localhost/i, "deployment reference"],
  [/\b0x[0-9a-f]{16,}\b/i, "hex address"],
  [/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, "Solana address"],
  [/contract address|mint address|\bCA\s*[:=]/i, "contract address"],
  [/\b20[2-3]\d\b|\b(january|february|march|april|june|july|august|september|october|november|december)\b\s+\d{1,2}/i, "date"],
  [/\blaunch(es|ing|ed)?\b|go(es)? live|\btge\b|presale|airdrop|whitelist/i, "launch detail"],
];
const CLAIMS = [
  [/\$SLNT|\bSLNT\b|\$[A-Z]{2,6}\b|tokenomics|\bsupply\b|per egg/i, "token detail"],
  [/\b\d{1,3}(,\d{3})+\b/, "token figure"],
  [/automatic(ally)?|tracked|connect (your )?wallet|no wallet|wallet (connection|required)/i, "tracking or wallet claim"],
  [/\brewards?\b|\bearn(s|ed|ing)?\b|\bclaims?\b|refund|holder benefit/i, "reward claim"],
  [/profit|\breturns?\b|yield|\bAPY\b|guarantee|to the moon|\bpump\b|\bprice\b|\bbuy\b|\bsell\b|invest|\b\d+x\b/i, "financial wording"],
  // (on OCR'd frames the "Nx" pattern is skipped: fire and particles read as random "7x"-style noise)
  [/last chance|hurry|don.t miss|act now|limited time|\bFOMO\b/i, "urgency"],
  [/#\w+/, "hashtag"],
];
const scan = (w, text, sets) => { for (const set of sets) for (const [re, what] of set) { const m = text.match(re); if (m) fail(w, `${what}: "${m[0]}"`); } };

function xLength(t) {
  let n = 0;
  for (const ch of t.replace(/https?:\/\/\S+/g, "x".repeat(23)).normalize("NFC")) {
    const c = ch.codePointAt(0);
    n += c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037) ? 1 : 2;
  }
  return n;
}

const QR_PY = `
import sys, cv2, json
res = {}
for p in sys.argv[1:]:
    ok, info, pts, _ = cv2.QRCodeDetector().detectAndDecodeMulti(cv2.imread(p))
    res[p] = [s for s in (info or []) if s] if ok else []
print(json.dumps(res))`;
function ocr(file) {
  let text = "";
  for (const mode of ["luma", "maxchannel"]) {
    const tmp = join(CHECK, "_ocr.png");
    sh("python3", ["-c", "import sys;from PIL import Image,ImageChops;im=Image.open(sys.argv[1]).convert('RGB');r,g,b=im.split();g2=im.convert('L') if sys.argv[3]=='luma' else ImageChops.lighter(ImageChops.lighter(r,g),b);g2.resize((im.width*2,im.height*2)).save(sys.argv[2])", file, tmp, mode]);
    text += sh("tesseract", [tmp, "stdout", "--psm", "11"], { stdio: ["ignore", "pipe", "ignore"] });
  }
  return text.replace(/\s+/g, " ");
}

// ── videos ───────────────────────────────────────────────────────────────
const SPECS = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080] };
rmSync(CHECK, { recursive: true, force: true });
mkdirSync(CHECK, { recursive: true });
const report = [];
for (const [ratio, [w, h]] of Object.entries(SPECS)) {
  const name = `solanites-promo-${ratio}-${w}x${h}.mp4`;
  const file = join(EXPORT, name);
  if (!existsSync(file)) { fail(name, "missing"); continue; }
  const probe = JSON.parse(sh("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]));
  const v = probe.streams.find(s => s.codec_type === "video"), a = probe.streams.find(s => s.codec_type === "audio");
  const dur = Number(probe.format.duration);
  if (!v || v.codec_name !== "h264" || v.width !== w || v.height !== h) fail(name, `video stream is ${v?.codec_name} ${v?.width}×${v?.height}`);
  if (v && v.r_frame_rate !== "30/1") fail(name, `frame rate ${v.r_frame_rate}`);
  if (v && v.pix_fmt !== "yuv420p") fail(name, `pixel format ${v.pix_fmt}`);
  if (v && (v.sample_aspect_ratio ?? "1:1") !== "1:1") fail(name, `non-square pixels ${v.sample_aspect_ratio}`);
  if (!a || a.codec_name !== "aac" || a.channels !== 2) fail(name, "missing stereo AAC audio");
  if (dur < 20 || dur > 30) fail(name, `duration ${dur}s outside 20–30 s`);
  // full decode: any error fails
  const errs = sh("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] });
  if (errs.trim()) fail(name, `decode errors: ${errs.trim().slice(0, 200)}`);
  const vol = sh("bash", ["-c", `ffmpeg -hide_banner -i "$1" -vn -af volumedetect,ebur128=peak=true -f null - 2>&1 | grep -E "mean_volume|max_volume|I:|Peak:" | tr -s ' '`, "_", file]);
  const mean = Number(vol.match(/mean_volume: (-?[\d.]+)/)?.[1]), lufs = Number([...vol.matchAll(/I: (-?[\d.]+) LUFS/g)].at(-1)?.[1]), peak = Number(vol.match(/max_volume: (-?[\d.]+)/)?.[1]);
  if (!(mean > -40)) fail(name, `audio looks silent (mean ${mean} dB)`);
  if (!(lufs > -18 && lufs < -10)) fail(name, `integrated loudness ${lufs} LUFS outside -18…-10`);
  if (peak > -0.5) fail(name, `audio peaks at ${peak} dB`);
  // key frames for manual review + OCR samples every 0.5 s
  for (const [label, t] of [["first", 0.05], ["middle", dur / 2], ["last", dur - 0.05]])
    sh("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", file, "-frames:v", "1", join(CHECK, `${ratio}-${label}.png`)]);
  const sdir = join(CHECK, `samples-${ratio}`); mkdirSync(sdir, { recursive: true });
  sh("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", "fps=2", join(sdir, "%03d.png")]);
  const samples = readdirSync(sdir).map(f => join(sdir, f));
  const qr = JSON.parse(sh("python3", ["-c", QR_PY, ...samples]));
  for (const [p, found] of Object.entries(qr)) if (found.length) fail(name, `QR code in frame ${p}: ${found}`);
  let words = "";
  for (const s of samples) { const t = ocr(s); words += ` ${t}`; scan(`${name} @${((Number(s.slice(-7, -4)) - 1) / 2).toFixed(1)}s (OCR)`, t, [PRIVACY, CLAIMS.filter(([, w]) => w !== "hashtag" && w !== "token figure").map(([re, w]) => w === "financial wording" ? [new RegExp(re.source.replace("|\\b\\d+x\\b", ""), "i"), w] : [re, w])]); }
  writeFileSync(join(CHECK, `ocr-${ratio}.txt`), words);
  for (const must of ["LEGEND", "SPECIES", "SOLANITES", "BEGINNING"]) if (!words.toUpperCase().includes(must)) fail(name, `OCR never found "${must}" (readability)`);
  report.push(`${name}: ${v.width}×${v.height} ${v.r_frame_rate} fps ${dur.toFixed(2)} s, ${(Number(probe.format.size) / 1e6).toFixed(1)} MB, audio ${a.codec_name} ${a.channels}ch ${a.sample_rate} Hz, ${lufs} LUFS, peak ${peak} dB, ${samples.length} frames OCR'd`);
}

// ── poster ───────────────────────────────────────────────────────────────
const poster = join(EXPORT, "solanites-promo-poster-4x5-1440x1800.jpg");
if (!existsSync(poster)) fail("poster", "missing");
else {
  const size = sh("python3", ["-c", "import sys;from PIL import Image;im=Image.open(sys.argv[1]);im.verify();print(*Image.open(sys.argv[1]).size)", poster]).trim();
  if (size !== "1440 1800") fail("poster", `is ${size}`);
  const qr = JSON.parse(sh("python3", ["-c", QR_PY, poster]));
  if (qr[poster].length) fail("poster", "QR code detected");
  const t = ocr(poster);
  scan("poster (OCR)", t, [PRIVACY, CLAIMS.filter(([, w]) => w !== "hashtag")]);
  if (!/SOLANITES/i.test(t)) fail("poster", "OCR could not read SOLANITES");
  report.push(`poster: ${size.replace(" ", "×")}, OCR: "${t.trim().slice(0, 90)}"`);
}

// ── captions ─────────────────────────────────────────────────────────────
const pack = readFileSync(join(DIR, "CAPTION-PACK.md"), "utf8");
const blocks = [...pack.matchAll(/```text\n([\s\S]*?)```/g)].map(m => m[1].trim());
if (blocks.length < 2) fail("CAPTION-PACK.md", "expected a caption and a reply");
blocks.forEach((b, i) => {
  const n = xLength(b);
  report.push(`caption block ${i + 1}: ${n}/280 weighted characters`);
  if (n > 280) fail(`caption block ${i + 1}`, `${n} characters`);
  scan(`caption block ${i + 1}`, b, [PRIVACY, CLAIMS]);
  for (const m of b.matchAll(/\b(\d+)\s+species\b/gi)) if (m[1] !== "28") fail(`caption block ${i + 1}`, `"${m[0]}" does not match the 28 species in src/lib/species.ts`);
});
scan("CAPTION-PACK.md", pack, [PRIVACY.filter(([, w]) => !["launch detail", "date"].includes(w))]);

console.log(report.join("\n"));
console.log(`key frames and OCR text: build/.cache/check/`);
if (problems.length) { console.error(`\n${problems.length} problem(s):\n` + problems.join("\n")); process.exit(1); }
console.log("promo validation passed");
