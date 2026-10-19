// Prepublication validator for the gameplay infographics. Reusable for any campaign folder:
//   node campaign/x-gameplay-infographics/build/validate.mjs [campaignDir]
//
// Checks, and exits non-zero on any failure:
//   1. Privacy: no links, domains, deployment references, QR codes, wallet or contract addresses,
//      dates or launch details in the captions, the content pack, the template, the rendered
//      text (DOM) or the OCR'd pixels of every export.
//   2. Claims: no unverified mechanics (token thresholds, timers, automatic tracking, wallet
//      requirements, rewards) or financial / urgency wording in captions or rendered text.
//   3. Facts: every percentage, species name, rarity, element and species count shown is
//      cross-checked against src/config/gameConfig.ts and src/lib/species.ts.
//   4. X limits: every caption and reply fits X's weighted 280-character limit.
//   5. Exports: ten images at the right sizes, each with no QR code, each OCR-readable with its
//      headline present. OCR text is written to build/.cache/ocr/ for manual review.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(process.argv[2] ?? join(HERE, ".."));
const ROOT = resolve(HERE, "../../..");
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

// ── patterns ──────────────────────────────────────────────────────────────
const PRIVACY = [
  [/https?:\/\/|\bwww\./i, "link"],
  [/\b[a-z0-9-]+\.(com|app|io|xyz|fun|net|org|gg|so|sol|ai|co|dev|site|link|me|tv)\b/i, "domain"],
  [/vercel|netlify|localhost|preview (url|deploy)|solanites\.vercel/i, "deployment reference"],
  [/\bqr\b|qr ?code/i, "QR code"],
  [/\b0x[0-9a-f]{16,}\b/i, "hex address"],
  [/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, "Solana address"],
  [/\bCA\s*[:=]|contract address|mint address|\bpump\.fun\b/i, "contract address"],
  [/\b(20\d\d|jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|june?|july?|aug(ust)?|sept?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b\s+\d{1,2}\b/i, "date"],
  [/\blaunch(es|ing|ed)?\b|go(es)? live|\bmint(s|ing)? (on|at|date)|\btge\b/i, "launch detail"],
];
// OCR misreads short words ("STEP 06" → "SEP 06"), so pixels get a stricter date rule.
const OCR_PRIVACY = PRIVACY.map(([re, w]) => w === "date"
  ? [/\b20[2-3]\d\b|\b(january|february|march|april|june|july|august|september|october|november|december)\b\s+\d{1,2}|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i, "date"]
  : [re, w]);
const CLAIMS = [
  [/\$SLNT|\bSLNT\b|\$[A-Z]{2,6}\b|\bticker\b|tokenomics|supply/i, "token detail"],
  [/\b\d{1,3}(,\d{3})+\b|\b\d+(\.\d+)?\s?(m|million|k)\b(?!\w)/i, "token threshold or large number"],
  [/tokens? (per|for each|for an?) egg|per egg.*token|eggs? per .*token|hold(ing)? \d/i, "egg earning threshold"],
  [/\b\d+\s?(s|sec|secs|seconds|m|min|mins|minutes|h|hr|hrs|hours|d|days?|weeks?)\b/i, "timer or duration"],
  [/automatic(ally)?|tracked|on-?chain tracking|from solana|no wallet|connect (your )?wallet|wallet (connection|required)|sign(-| )?up/i, "tracking or wallet claim"],
  [/\brewards?\b|\bearn(s|ed|ing)?\b|airdrop|whitelist|presale|holder benefits?|\bclaims?\b|refund/i, "reward or benefit claim"],
  [/\b\d+x\b|profit|\breturns?\b|yield|\bAPY\b|passive income|guarantee|to the moon|\bpump\b|\bprice\b|\bbuy\b|\bsell\b|invest/i, "financial claim"],
  [/last chance|only \d+ left|hurry|don.t miss|before it.s too late|\bFOMO\b|act now|limited time/i, "urgency"],
  [/#\w+/, "hashtag"],
];
const scan = (where, text, sets) => {
  for (const set of sets) for (const [re, what] of set) {
    const m = text.match(re);
    if (m) fail(where, `${what}: "${m[0]}"`);
  }
};

// ── facts from the code ───────────────────────────────────────────────────
const gameConfig = readFileSync(join(ROOT, "src/config/gameConfig.ts"), "utf8");
const weightsSrc = gameConfig.match(/rarityWeights:\s*{([^}]*)}/)[1];
const weights = Object.fromEntries([...weightsSrc.matchAll(/(\w+):\s*([\d.]+)/g)].map(([, k, v]) => [k, Number(v)]));
const total = Object.values(weights).reduce((a, b) => a + b, 0);
const pct = v => `${+(v * 100).toFixed(2)}%`;
const ODDS = Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, pct(v / total)]));
const stageAt = k => pct(Number(gameConfig.match(new RegExp(`${k}:\\s*([\\d.]+)`))[1]));
const ALLOWED_PCT = new Set([...Object.values(ODDS), stageAt("crackingAt"), stageAt("stirringAt")]);

const speciesSrc = readFileSync(join(ROOT, "src/lib/species.ts"), "utf8");
const SPECIES = [...speciesSrc.matchAll(/name: "([^"]+)",\s*epithet: "([^"]+)",\s*rarity: "(\w+)",\s*element: "(\w+)"/g)]
  .map(([, name, epithet, rarity, element]) => ({ name, epithet, rarity, element }));
if (SPECIES.length < 20) fail("facts", `could only read ${SPECIES.length} species from species.ts`);
const PER_TIER = SPECIES.reduce((m, s) => ((m[s.rarity] = (m[s.rarity] ?? 0) + 1), m), {});
const cap = s => s[0].toUpperCase() + s.slice(1);
const CLASSIFIED = new Set(["mythic", "secret"]);

function checkFacts(where, text) {
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s?%/g)) if (!ALLOWED_PCT.has(`${+m[1]}%`)) fail(where, `percentage ${m[0]} is not in the game config (allowed: ${[...ALLOWED_PCT].join(", ")})`);
  for (const [tier, odds] of Object.entries(ODDS)) {
    const m = text.match(new RegExp(`\\b${tier}\\b[^%\\d]{0,60}?(\\d+(?:\\.\\d+)?)\\s?%`, "i"));
    if (m && `${+m[1]}%` !== odds) fail(where, `${cap(tier)} shown as ${m[1]}% but configured as ${odds}`);
  }
  for (const m of text.matchAll(/(\d+) species/gi)) {
    const n = Number(m[1]);
    if (n !== SPECIES.length && !Object.values(PER_TIER).includes(n)) fail(where, `"${m[0]}" matches neither the catalogue (${SPECIES.length}) nor any tier count`);
  }
  for (const s of SPECIES) {
    const re = new RegExp(`(?<![\\w-])${s.name.replace(/[^\w ]/g, ".")}(?![\\w-])`, "g");
    for (const m of text.matchAll(re)) {
      if (CLASSIFIED.has(s.rarity)) fail(where, `names classified ${s.rarity} species ${s.name}`);
      const label = text.slice(m.index + s.name.length, m.index + s.name.length + 40).match(new RegExp(`\\b(${Object.keys(ODDS).join("|")})\\b`, "i"));
      if (label && label[1].toLowerCase() !== s.rarity) fail(where, `${s.name} labelled ${label[1]}, configured as ${s.rarity}`);
    }
  }
  // species-like capitalised names next to a rarity label must exist
  for (const m of text.matchAll(/\b([A-Z][a-z]{3,})\b[^.\n]{0,30}\b(Common|Rare|Epic|Legendary)\s+·\s+(\w+)/g)) {
    const s = SPECIES.find(x => x.name.toLowerCase() === m[1].toLowerCase());
    if (s && (s.rarity !== m[2].toLowerCase() || s.element !== m[3])) fail(where, `${m[0]}: configured as ${s.rarity} · ${s.element}`);
  }
}

// ── X weighted length (twitter-text v3 config) ────────────────────────────
function xLength(t) {
  let n = 0;
  const text = t.replace(/https?:\/\/\S+/g, "x".repeat(23));
  for (const ch of text.normalize("NFC")) {
    const c = ch.codePointAt(0);
    const light = (c <= 0x10ff) || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037);
    n += light ? 1 : 2;
  }
  return n;
}

// ── 1. content pack + captions ────────────────────────────────────────────
const packPath = join(DIR, "CONTENT-PACK.md");
if (!existsSync(packPath)) fail("CONTENT-PACK.md", "missing");
const pack = existsSync(packPath) ? readFileSync(packPath, "utf8") : "";
scan("CONTENT-PACK.md", pack, [PRIVACY.filter(([, w]) => w !== "launch detail" && w !== "date")]);
const blocks = [...pack.matchAll(/```text\n([\s\S]*?)```/g)].map(m => m[1].trim());
const captionReport = [];
blocks.forEach((b, i) => {
  const where = `caption block ${i + 1}`;
  const len = xLength(b);
  captionReport.push({ block: i + 1, chars: len, first: b.split("\n")[0] });
  if (len > 280) fail(where, `${len} weighted characters (limit 280)`);
  scan(where, b, [PRIVACY, CLAIMS]);
  checkFacts(where, b);
});
if (blocks.length < 10) fail("CONTENT-PACK.md", `expected a caption and a reply for each of five posts, found ${blocks.length} text blocks`);
for (const f of pack.matchAll(/`(export\/(?:4x5|1x1)\/[\w.-]+\.jpg)`/g)) if (!existsSync(join(DIR, f[1]))) fail("CONTENT-PACK.md", `references missing ${f[1]}`);

// ── 2. template + rendered text ───────────────────────────────────────────
const tpl = readFileSync(join(HERE, "infographics.html"), "utf8").split("http://www.w3.org/2000/svg").join("");
scan("infographics.html", tpl, [PRIVACY.filter(([, w]) => ["link", "domain", "deployment reference", "Solana address", "hex address", "contract address"].includes(w))]);
const domPath = join(HERE, ".cache", "dom-text.json");
if (!existsSync(domPath)) fail("rendered text", "run render.mjs first");
const dom = existsSync(domPath) ? JSON.parse(readFileSync(domPath, "utf8")) : {};
for (const [k, t] of Object.entries(dom)) { scan(`${k} (rendered)`, t, [PRIVACY, CLAIMS]); checkFacts(`${k} (rendered)`, t); }

// ── 3. exports: sizes, QR codes, OCR ──────────────────────────────────────
const HEADLINES = { "01": ["EGG", "SOLANITE"], "02": ["SIX", "TIERS"], "03": ["LEGEND", "BEGINNING"], "04": ["WHICH", "HATCHING"], "05": ["CREATURE", "COLLECTION"] };
const SIZES = { "4x5": [1440, 1800], "1x1": [1440, 1440] };
mkdirSync(join(HERE, ".cache", "ocr"), { recursive: true });
const py = `
import sys, json, cv2
from PIL import Image
out = {}
for p in sys.argv[1:]:
    im = Image.open(p); img = cv2.imread(p)
    found, decoded = False, []
    try:
        ok, info, pts, _ = cv2.QRCodeDetector().detectAndDecodeMulti(img)
        found = bool(ok); decoded = [s for s in (info or []) if s]
    except Exception as e:
        decoded = ["detector error: " + str(e)]
    out[p] = {"size": im.size, "qr": found, "qrText": decoded}
print(json.dumps(out))`;
let exportsSeen = 0;
for (const ratio of Object.keys(SIZES)) {
  const dir = join(DIR, "export", ratio);
  const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".jpg")).map(f => join(dir, f)) : [];
  exportsSeen += files.length;
  if (files.length !== 5) fail(`export/${ratio}`, `expected 5 images, found ${files.length}`);
  if (!files.length) continue;
  const info = JSON.parse(execFileSync("python3", ["-c", py, ...files], { encoding: "utf8" }));
  for (const f of files) {
    const name = `export/${ratio}/${f.split("/").pop()}`;
    const [w, h] = info[f].size;
    if (w !== SIZES[ratio][0] || h !== SIZES[ratio][1]) fail(name, `is ${w}×${h}, expected ${SIZES[ratio].join("×")}`);
    if (info[f].qr || info[f].qrText.length) fail(name, `QR code detected ${JSON.stringify(info[f].qrText)}`);
    // OCR at 2x with sparse-text segmentation, which finds text inside screenshots and panels
    const tmp = join(HERE, ".cache", "ocr", "_ocr-input.png");
    let ocr = "";
    for (const mode of ["luma", "maxchannel"]) {
      execFileSync("python3", ["-c", "import sys;from PIL import Image,ImageChops;im=Image.open(sys.argv[1]).convert('RGB');r,g,b=im.split();g2=im.convert('L') if sys.argv[3]=='luma' else ImageChops.lighter(ImageChops.lighter(r,g),b);g2.resize((im.width*2,im.height*2)).save(sys.argv[2])", f, tmp, mode]);
      ocr += `--- ${mode} ---\n` + execFileSync("tesseract", [tmp, "stdout", "--psm", "11"], { encoding: "utf8", maxBuffer: 1 << 24, stdio: ["ignore", "pipe", "ignore"] });
    }
    const flat = ocr.replace(/\s+/g, " ");
    writeFileSync(join(HERE, ".cache", "ocr", `${ratio}-${f.split("/").pop()}.txt`), ocr);
    scan(`${name} (OCR)`, flat, [OCR_PRIVACY]);
    // Claims on pixels: words only (OCR digits are too noisy for duration checks)
    scan(`${name} (OCR)`, flat, [CLAIMS.filter(([, w]) => !["timer or duration", "token threshold or large number", "hashtag"].includes(w))]);
    const words = HEADLINES[f.split("/").pop().slice(0, 2)] ?? [];
    for (const word of words) if (!flat.toUpperCase().includes(word)) fail(name, `OCR could not find headline word "${word}" (check readability)`);
  }
}

// ── report ────────────────────────────────────────────────────────────────
console.log(`facts: odds ${Object.entries(ODDS).map(([k, v]) => `${k} ${v}`).join(", ")}; ${SPECIES.length} species (${Object.entries(PER_TIER).map(([k, v]) => `${k} ${v}`).join(", ")})`);
console.log(`captions: ${captionReport.map(c => `#${c.block} ${c.chars}`).join(" · ")} (weighted chars, limit 280)`);
console.log(`exports checked: ${exportsSeen}; OCR text in build/.cache/ocr/`);
if (problems.length) { console.error(`\n${problems.length} problem(s):\n` + problems.join("\n")); process.exit(1); }
console.log("prepublication validation passed");
