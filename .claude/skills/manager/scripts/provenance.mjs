#!/usr/bin/env node
// Provenance and paid-spend check for the manager.
//   node provenance.mjs <repo-folder> [--brain path/to/HOW-BILLY-THINKS.md] [--out folder] [--json]
//
// 1. Finds every line in the repo's docs that puts words in the owner's mouth ("owner rule", "owner decision",
//    "Billy said", "Billy's call", "owner approved" ...) and matches it against the [said] lines of
//    brain/HOW-BILLY-THINKS.md. Lines with no [said] backing are flagged: they must be relabelled "proposed (not
//    approved)" or backed by a quote. The match is a word-overlap score, so the eye confirms each flag.
// 2. Finds every mention of money or paid tools (Runway, credits, licences, subscriptions, £/$ amounts) in STATUS.md
//    and docs, and whether a recorded owner yes sits next to it. Spend without a yes is flagged for the owner.
// Writes provenance.md (and provenance.json) into --out (default: the repo's qa-out/manager/).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const REPO = resolve(argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--brain' && argv[argv.indexOf(a) - 1] !== '--out') || '.');
const OUT = resolve(arg('out', join(REPO, 'qa-out', 'manager')));
const here = dirname(fileURLToPath(import.meta.url));

// ---- the brain file -------------------------------------------------------------------------------------------
function findBrain() {
  const given = arg('brain', '');
  const candidates = [given, join(REPO, 'brain/HOW-BILLY-THINKS.md'), resolve(here, '../../../../brain/HOW-BILLY-THINKS.md'),
    'C:/Users/billb/Documents/northcut-hq/brain/HOW-BILLY-THINKS.md', 'C:/Users/billb/Documents/launch-kit/brain/HOW-BILLY-THINKS.md', process.env.MANAGER_BRAIN || ''].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return { path: c, text: readFileSync(c, 'utf8') };
  try { // read-only fetch from GitHub main
    const out = execFileSync('gh', ['api', 'repos/leakingbe1-cmd/northcut-hq/contents/brain/HOW-BILLY-THINKS.md?ref=main', '-q', '.content'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return { path: 'github:leakingbe1-cmd/northcut-hq/brain/HOW-BILLY-THINKS.md', text: Buffer.from(out.replace(/\s/g, ''), 'base64').toString('utf8') };
  } catch { return null; }
}
const brain = findBrain();
if (!brain) { console.error('HOW-BILLY-THINKS.md not found: pass --brain <path> (northcut-hq brain/HOW-BILLY-THINKS.md)'); process.exit(2); }
const STOP = new Set('the a an and or of to in on for with is are was were be been it its this that these those he his him him billy owner said says say rule rules decision call wants want asked ask not no yes as at by from into than then so if but we you they them their our your i me my do does did done has have had will would can could should may might one two three per not nothing anything everything something only also just very more most much any all every each own same other such'.split(' '));
const words = (s) => [...new Set(s.toLowerCase().replace(/[`*_"'“”‘’()[\]{}<>:;,.!?/\\|#£$]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)))];
const said = brain.text.split(/\r?\n/).map((l, i) => ({ n: i + 1, text: l.trim() })).filter((l) => /^-\s*`\[said\]`/.test(l.text) || /^\s*-\s*\[said\]/.test(l.text)).map((l) => ({ ...l, w: words(l.text) }));
if (!said.length) { console.error(`no [said] lines found in ${brain.path}`); process.exit(2); }

// ---- the repo's docs ------------------------------------------------------------------------------------------
const SKIP_DIR = /^(node_modules|\.git|dist|build|qa-out|site-qa-out|\.next|out|vendor|\.claude|snapshots)$/;
const files = [];
(function walk(dir, depth) {
  if (depth > 4) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { if (!SKIP_DIR.test(name)) walk(p, depth + 1); continue; }
    if (/\.(md|txt)$/i.test(name) && st.size < 400000 && !/HOW-BILLY-THINKS/.test(name)) files.push(p);
  }
})(REPO, 0);

const CLAIM = /\b(owner(?:'s)?\s+(?:rule|decision|call|approved|approval|said|says|asked|wants|wanted|confirmed|chose|picked|preference)|owner-approved|billy(?:'s)?\s+(?:said|says|asked|wants|wanted|call|decision|rule|approved|confirmed|chose|picked|preference|verdict)|\(owner,|\(billy,|per (?:the )?owner|as (?:the )?owner (?:said|asked)|verified as billy's own words)\b/i;
const ALREADY = /proposed\s*\(not approved\)|\[proposed\]|\[inferred\]|not approved|only billy'?s words are owner rules|nothing goes into any doc as|unless he said it|is labelled "proposed/i;
// asks and placeholders are not attributions: "needs owner approval", "owner to decide", "<Owner's call, in their words>"
const ASK = /needs? (?:an |the )?owner(?:'s)? (?:approval|decision|yes|go-ahead)|without (?:the )?owner(?:'s)? (?:approval|yes|go-ahead)|owner to (?:decide|confirm|pick)|ask the owner|owner's call, in their words|for the owner to|marked \*\*\[owner\]\*\*|waiting (?:for|on) (?:the )?owner|if the owner wants|owner wants it|labelled .owner rule.|"billy said"|"owner rule"|'owner rule'/i;
const flagged = [], matched = [];
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!CLAIM.test(line) || ALREADY.test(line) || ASK.test(line)) return;
    const w = words(line);
    let best = { score: 0, said: null };
    for (const s of said) {
      const shared = w.filter((x) => s.w.includes(x)).length;
      const score = shared / Math.max(4, Math.min(w.length, s.w.length));
      if (shared >= 4 && score > best.score) best = { score: +score.toFixed(2), said: s.text.slice(0, 160), shared };
    }
    const rec = { file: relative(REPO, f).replace(/\\/g, '/'), line: i + 1, text: line.trim().slice(0, 220), best };
    (best.score >= 0.35 ? matched : flagged).push(rec);
  });
}

// ---- money ----------------------------------------------------------------------------------------------------
const SPEND = /\b(runway|kling|midjourney|elevenlabs|sora|veo|luma|pika|credits?\b|paid (?:tool|service|plan|tier|tools|services)|subscription|licen[cs]e(?:d)?|purchased?|bought|spent|invoice|api (?:cost|spend|bill)|per month|\/month|\/yr|\/year|upgrade (?:to|the) (?:max|pro|plus)|\$\s?\d|£\s?\d)/i;
const YES = /(owner|billy)(?:'s)?\s+(?:yes|approved|ok'?d|said yes|go-ahead|agreed)|approved by (?:billy|the owner)|\(owner(?:'s)? yes|with (?:his|the owner's|billy's) yes|owner-approved/i;
const FREE = /\bfree\b(?! trial)|no cost|£0\b|\$0\b|cc0|mit\b|apache|open source|without (?:paying|spending)|didn'?t (?:spend|pay)|not (?:spent|paid|bought)/i;
const spend = [];
for (const f of files) {
  if (!/STATUS|LOG|DECISION|CLAUDE|README|SPEND|COST|BUDGET|decisions\//i.test(f) && !/\.md$/.test(f)) continue;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!SPEND.test(line) || FREE.test(line) && !/runway|credits? (?:spent|used)|spent/i.test(line)) return;
    const near = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
    spend.push({ file: relative(REPO, f).replace(/\\/g, '/'), line: i + 1, text: line.trim().slice(0, 220), yes: YES.test(near), free: FREE.test(line) });
  });
}
const spendFlag = spend.filter((s) => !s.yes && !s.free).slice(0, 40);

// ---- output ---------------------------------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const md = [`# Provenance and spend: ${REPO}`, '', `Brain: ${brain.path} (${said.length} [said] lines). Docs scanned: ${files.length}.`, '',
  `## Owner-attributed lines with no [said] backing (${flagged.length})`, '', flagged.length ? 'Each of these says the owner ruled, decided or said something, and no [said] line in HOW-BILLY-THINKS.md matches it (the match is word overlap, so a "backed" line below can be a false match too: read the pair). Relabel "proposed (not approved)", or quote him (date and words) and add the quote to the brain file as [said].' : 'None.', ''];
for (const r of flagged) md.push(`- \`${r.file}:${r.line}\` ${r.text}${r.best.said ? `\n  - nearest [said] (${r.best.score}): ${r.best.said}` : ''}`);
md.push('', `## Backed by a [said] line (${matched.length}, for the record)`, '');
for (const r of matched.slice(0, 60)) md.push(`- \`${r.file}:${r.line}\` ${r.text.slice(0, 120)}\n  - ${r.best.said}`);
if (matched.length > 60) md.push(`- … ${matched.length - 60} more`);
md.push('', `## Money mentioned without a recorded owner yes (${spendFlag.length})`, '', spendFlag.length ? 'The manager never approves spend. Each line below mentions a paid tool, credits, a licence or an amount with no "owner yes" within two lines. Put it under "Waiting for owner" unless the yes is recorded elsewhere.' : 'None found.', '');
for (const s of spendFlag) md.push(`- \`${s.file}:${s.line}\` ${s.text}`);
md.push('', `(${spend.filter((s) => s.yes).length} spend lines carry a recorded yes; ${spend.filter((s) => s.free && !s.yes).length} are explicitly free.)`);
writeFileSync(join(OUT, 'provenance.md'), md.join('\n'));
writeFileSync(join(OUT, 'provenance.json'), JSON.stringify({ brain: brain.path, saidCount: said.length, files: files.length, flagged, matched, spend: spendFlag, spendAll: spend.length }, null, 2));
console.log(`${flagged.length} unbacked owner-attributed lines, ${matched.length} backed, ${spendFlag.length} spend lines without a yes. -> ${join(OUT, 'provenance.md')}`);
if (argv.includes('--json')) console.log(JSON.stringify({ flagged: flagged.length, matched: matched.length, spend: spendFlag.length }));
