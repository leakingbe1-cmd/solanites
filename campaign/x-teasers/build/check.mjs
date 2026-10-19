// Teaser guardrails. Imported by render.mjs and runnable on its own:
//   node campaign/x-teasers/build/check.mjs
// Fails if a template or the content pack could put a link, address, QR code, date,
// price or token detail into a teaser, and pins every creative to its approved copy.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// The only words allowed on each creative (rendered visible text, whitespace collapsed).
export const APPROVED = {
  1: "EVERY LEGEND STARTS WITH AN AWAKENING. SOLANITES",
  2: "WHICH CREATURE WOULD YOU HATCH? 01 PHOENIX 02 SOMETHING RARE 03 THE UNKNOWN SOLANITES",
  3: "SOMETHING IS STIRRING IN THE DARKNESS. SOLANITES",
  4: "FIRE IS ONLY THE BEGINNING. SOLANITES",
  5: "WHAT MAKES A CREATURE LEGENDARY? DESIGN RARITY POWER MYSTERY SOLANITES",
  6: "SOLANITES THE STORY IS TAKING SHAPE. FOLLOW FOR THE REVEAL.",
  7: "HOLDER REWARDS LOCKED DEVELOPER SUPPLY RETURNS TO HOLDERS. LAUNCH +2H DISTRIBUTION SPLIT EQUALLY AMONG ELIGIBLE HOLDERS. PLANNED · ELIGIBILITY AND AMOUNT TO BE PUBLISHED SOLANITES",
};

// Owner-approved exception (teaser 7 only): two phrases quoted verbatim from the site's
// published Rewards page (src/app/claims/page.tsx on main, 5e9952a). Only these exact
// phrases are exempt; any other rewards/returns wording, anywhere, still fails.
const SITE_PHRASES = { 7: ["HOLDER REWARDS", "RETURNS TO HOLDERS."] };
const PACK_PHRASES = ["returns to holders"];
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const strip = (text, phrases) => phrases.reduce((t, p) => t.replace(new RegExp(escape(p), "gi"), ""), text);

// "link" patterns are never allowed anywhere, including template code. "copy" patterns
// apply to words people read: the rendered creatives and the content pack.
const FORBIDDEN = [
  [/https?:\/\//i, "URL", "link"],
  [/\bwww\./i, "URL", "link"],
  [/\b[a-z0-9-]+\.(com|app|io|xyz|fun|net|org|gg|so|sol|ai|co|dev|site|vercel\.app)\b/i, "domain", "link"],
  [/vercel|netlify|localhost|preview\s*url/i, "deployment reference", "link"],
  [/\bqr\b|qrcode/i, "QR code", "link"],
  [/\b0x[0-9a-f]{16,}\b/i, "hex address", "link"],
  [/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, "Solana address", "link"],
  [/\bCA\s*[:=]|contract address|mint address/i, "contract address", "link"],
  [/\$[A-Z]{2,6}\b|\bticker\b|tokenomics|presale|airdrop|whitelist/i, "token detail", "copy"],
  [/\b(20\d\d|jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|june?|july?|aug(ust)?|sept?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b\s*\d{0,2}/i, "date", "copy"],
  [/launch(es|ing)? (on|in|at|date)|go(es)? live|mint(s|ing)? (on|in|at)/i, "launch disclosure", "copy"],
  [/\b\d+x\b|\bprofit|\breturns?\b|\byield|\bAPY\b|\bearn(ing|s)?\b|\brewards?\b|\bpassive income|guarantee|to the moon|\bpump\b|\bprice\b|\bbuy\b/i, "financial claim", "copy"],
  [/\blast chance|only \d+ left|hurry|don.t miss|before it.s too late|\bFOMO\b/i, "fake urgency", "copy"],
];

// The SVG namespace is the one URL the template needs; it never renders.
const SVG_NS = "http://www.w3.org/2000/svg";

export function scanText(label, text, kinds = ["link", "copy"]) {
  const problems = [];
  text.split(SVG_NS).join("").split("\n").forEach((line, i) => {
    for (const [re, what, kind] of FORBIDDEN) {
      if (!kinds.includes(kind)) continue;
      const m = line.match(re);
      if (m) problems.push(`${label}:${i + 1}: ${what}: "${m[0]}"`);
    }
  });
  return problems;
}

export function checkRenderedText(id, ratio, text) {
  const raw = text.replace(/\s+/g, " ").trim();
  const got = raw.toUpperCase();
  const want = APPROVED[id];
  const problems = scanText(`teaser ${id} ${ratio} (rendered)`, strip(raw, SITE_PHRASES[id] || []));
  if (got !== want) problems.push(`teaser ${id} ${ratio}: rendered copy "${got}" is not the approved "${want}"`);
  return problems;
}

export function checkSources() {
  const read = f => readFileSync(join(HERE, f), "utf8");
  return [
    ...scanText("teasers.html", read("teasers.html"), ["link"]),
    ...scanText("CONTENT-PACK.md", strip(read("../CONTENT-PACK.md"), PACK_PHRASES)),
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkSources();
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  console.log("teaser guardrails: templates and content pack are clean");
}
