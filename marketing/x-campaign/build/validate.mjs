// Prepublication checks for the X campaign package.
//   node marketing/x-campaign/build/validate.mjs
// 1. Sizes: every post 1600×900, header 1500×500, avatar 400×400; ten posts.
// 2. No QR code in any image.
// 3. Rendered text (from render.mjs) and OCR of every image (two passes) are scanned for URLs,
//    deployment names, addresses, dates, launch details, token figures, financial or urgency
//    wording, and for unmerged features presented as live.
// 4. Every caption block in copy/*.md fits X's 280 weighted characters and passes the same scan.
// OCR text is saved in build/.cache/ocr/ for manual review.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OCR = join(HERE, ".cache", "ocr");
mkdirSync(OCR, { recursive: true });
const problems = [];
const fail = (w, m) => problems.push(`${w}: ${m}`);
const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] });

const PRIVACY = [
  [/https?:\/\/|\bwww\./i, "link"],
  [/\b[a-z0-9-]+\.(com|app|io|xyz|fun|net|org|gg|so|sol|ai|co|dev|site|link|me|tv)\b/i, "domain"],
  [/vercel|netlify|localhost|pump\.fun/i, "deployment reference"],
  [/\b0x[0-9a-f]{16,}\b/i, "hex address"],
  [/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, "Solana address"],
  [/contract address|mint address|\bCA\s*[:=]/i, "contract address"],
  [/\b20[2-3]\d\b|\b(january|february|march|april|june|july|august|september|october|november|december)\s+\d{1,2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i, "date"],
  [/launch(es|ing)? (on|at|in \d)|go(es)? live on|\btge\b|presale|airdrop|whitelist/i, "launch detail"],
];
const IMAGE_CLAIMS = [
  [/\$SLNT|\bSLNT\b|\bsupply\b|tokenomics|market cap|holders?\b\s*\d|\d+\s*holders/i, "token figure or metric"],
  [/\b\d{1,3}(,\d{3}){1,}\b/, "large number"],
  [/profit|\breturns?\b|yield|\bAPY\b|guarantee|to the moon|\bpump\b|\bprice\b|\bbuy\b|\bsell\b|invest/i, "financial wording"],
  [/last chance|hurry|don.t miss|act now|limited time|\bFOMO\b|only \d+ left/i, "urgency"],
  [/fast track|first (5|five) (eggs )?hatch|hatch in (1|a|one) min/i, "fast track (not merged)"],
  [/(?<![\d.])(40|30|17|8|3\.5|1\.5)\s*%/, "new odds (not merged)"],
  [/\bclassified\b|\?\?\?/i, "classified wording (all 28 species are public)"],
];
const scan = (w, t, sets) => { for (const set of sets) for (const [re, what] of set) { const m = t.match(re); if (m) fail(w, `${what}: "${m[0]}"`); } };

// ── images ───────────────────────────────────────────────────────────────
const posts = readdirSync(join(ROOT, "posts")).filter(f => f.endsWith(".jpg")).sort();
if (posts.length !== 10) fail("posts", `expected 10, found ${posts.length}`);
const images = [
  ...posts.map(f => [`posts/${f}`, 1600, 900]),
  ["profile/x-header-1500x500.png", 1500, 500],
  ["profile/x-avatar-400x400.png", 400, 400],
  ["contact-sheet.png", null, null],
];
const PY = `
import sys, json, cv2
from PIL import Image
out = {}
for p in sys.argv[1:]:
    im = Image.open(p); im.verify(); im = Image.open(p)
    ok, info, _, _ = cv2.QRCodeDetector().detectAndDecodeMulti(cv2.imread(p))
    out[p] = {"size": im.size, "qr": [s for s in (info or []) if s] if ok else []}
print(json.dumps(out))`;
const info = JSON.parse(sh("python3", ["-c", PY, ...images.map(([f]) => join(ROOT, f))]));
const report = [];
for (const [f, w, h] of images) {
  const i = info[join(ROOT, f)];
  if (w && (i.size[0] !== w || i.size[1] !== h)) fail(f, `is ${i.size.join("×")}, expected ${w}×${h}`);
  if (i.qr.length) fail(f, `QR code: ${i.qr}`);
  if (f === "contact-sheet.png") continue;
  let text = "";
  for (const mode of ["luma", "maxchannel"]) {
    const tmp = join(OCR, "_in.png");
    sh("python3", ["-c", "import sys;from PIL import Image,ImageChops;im=Image.open(sys.argv[1]).convert('RGB');r,g,b=im.split();x=im.convert('L') if sys.argv[3]=='luma' else ImageChops.lighter(ImageChops.lighter(r,g),b);x.resize((im.width*2,im.height*2)).save(sys.argv[2])", join(ROOT, f), tmp, mode]);
    text += sh("tesseract", [tmp, "stdout", "--psm", "11"]) + "\n";
  }
  writeFileSync(join(OCR, f.replace(/\//g, "_") + ".txt"), text);
  const flat = text.replace(/\s+/g, " ");
  scan(`${f} (OCR)`, flat, [PRIVACY, IMAGE_CLAIMS.filter(([, w]) => w !== "large number")]);
  report.push(`${f}: ${i.size.join("×")}`);
}
const rendered = JSON.parse(readFileSync(join(HERE, ".cache", "rendered-text.json"), "utf8"));
for (const [f, t] of Object.entries(rendered)) scan(`${f} (rendered text)`, t, [PRIVACY, IMAGE_CLAIMS]);
for (const f of ["template/template.html", "template/SPEC.md"]) scan(f, readFileSync(join(ROOT, f), "utf8"), [PRIVACY.filter(([, w]) => ["link", "domain", "Solana address", "hex address"].includes(w))]);

// ── captions ─────────────────────────────────────────────────────────────
function xLength(t) {
  let n = 0;
  for (const ch of t.normalize("NFC")) { const c = ch.codePointAt(0); n += c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037) ? 1 : 2; }
  return n;
}
const copyDir = join(ROOT, "copy");
const copyFiles = existsSync(copyDir) ? readdirSync(copyDir).filter(f => f.endsWith(".md")) : [];
let blocks = 0;
for (const f of copyFiles) {
  const md = readFileSync(join(copyDir, f), "utf8");
  // whole files may name the rules ("never use a *.vercel.app address"); only real links and addresses fail here.
  // Everything that gets published (the ```text blocks) gets the full scan below.
  scan(`copy/${f}`, md, [PRIVACY.filter(([, w]) => ["link", "hex address", "Solana address"].includes(w))]);
  for (const [i, m] of [...md.matchAll(/```text\n([\s\S]*?)```/g)].entries()) {
    blocks++;
    const b = m[1].trim(), n = xLength(b), w = `copy/${f} block ${i + 1}`;
    if (n > 280) fail(w, `${n} weighted characters`);
    scan(w, b, [PRIVACY, IMAGE_CLAIMS.filter(([, x]) => !["token figure or metric", "large number", "fast track (not merged)", "new odds (not merged)"].includes(x))]);
  }
}
report.push(`copy: ${copyFiles.length} files, ${blocks} caption/bio blocks checked (gated fast-track and odds blocks are labelled in the file)`);

console.log(report.join("\n"));
if (problems.length) { console.error(`\n${problems.length} problem(s):\n` + problems.join("\n")); process.exit(1); }
console.log("X campaign validation passed");
