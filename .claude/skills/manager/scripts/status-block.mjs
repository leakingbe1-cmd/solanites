#!/usr/bin/env node
// Writes the manager's verdict into a repo's STATUS.md as a ```manager fenced block, right after the ```status block
// (so the Core's status parser, which reads only the first ```status block, is untouched). Re-running replaces the
// block. Optionally appends lines to the Inbox (for `redo`: the fixes the next session must make).
//
//   node status-block.mjs <STATUS.md> --verdict redo --score 6 --reason "Hero doesn't wow: ..." \
//        --round 1 --reviewer "manager skill (session)" --preview https://... --report qa-out/manager/2026-11-06-2300/report.md \
//        [--inbox "manager redo 2026-11-06: fix X" --inbox "..."] [--reviewed "2026-11-06 23:10"] [--dry-run]
//        [--fix-branch manager/fix-2026-11-10] [--remove-inbox "<exact Inbox line>"]... //        [--owner-todo "<one owner action>"]... [--waiting "<one line for Waiting for owner>"]...
//   node status-block.mjs <STATUS.md> --read        (prints the current manager block as JSON, or null)
//
// Keys written: verdict (pass|redo|stuck), score (0-10), reason (one sentence), reviewed (YYYY-MM-DD HH:MM UK),
// round (1-13: which review of the run: 1 = the first look, then one per fix round), reviewer, preview, branch, fix_branch (the branch holding a
// fixer's commits, when there is one), report. Format: northcut-hq templates/STATUS-FORMAT.md, "The manager block".
// --remove-inbox drops Inbox lines whose text equals the given text (a fault that was fixed). --owner-todo adds a line
// to the ```status block's owner_todo list and --waiting a line under "Waiting for owner" (things only the owner can
// supply: a photo, a fact, a direction pick); both skip lines that are already there.
import { readFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--') && (argv.indexOf(a) === 0 || !argv[argv.indexOf(a) - 1].startsWith('--') || ['--dry-run', '--read'].includes(argv[argv.indexOf(a) - 1])));
if (!file) { console.error('usage: status-block.mjs <STATUS.md> --verdict pass|redo|stuck --score N --reason "..." [--round N] [--reviewer x] [--preview url] [--branch name] [--fix-branch name] [--report path] [--inbox "line"]... [--remove-inbox "line"]... [--owner-todo "line"]... [--waiting "line"]... [--dry-run] | --read'); process.exit(2); }
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const all = (n) => argv.map((a, i) => (a === `--${n}` ? argv[i + 1] : null)).filter(Boolean);
const md = readFileSync(file, 'utf8');
const BLOCK = /```manager[ \t]*\r?\n([\s\S]*?)```\r?\n?/;

export function parseManager(text) {
  const m = BLOCK.exec(text || '');
  if (!m) return null;
  const out = {};
  for (const raw of m[1].split(/\r?\n/)) { const kv = /^([a-z_]+):\s*(.*)$/i.exec(raw.trim()); if (kv) out[kv[1].toLowerCase()] = kv[2].trim(); }
  return out;
}

if (argv.includes('--read')) { console.log(JSON.stringify(parseManager(md), null, 2)); process.exit(0); }

const verdict = arg('verdict');
if (!['pass', 'redo', 'stuck'].includes(verdict)) { console.error('--verdict must be pass, redo or stuck'); process.exit(2); }
const score = arg('score', '');
if (score === '' || isNaN(+score) || +score < 0 || +score > 10) { console.error('--score must be 0-10'); process.exit(2); }
const reason = (arg('reason', '') || '').replace(/\s+/g, ' ').trim();
if (!reason) { console.error('--reason is required (one sentence the owner can read on his phone)'); process.exit(2); }
const uk = () => { const d = new Date(); const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d); const g = (t) => p.find((x) => x.type === t).value; return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}`; };
const prev = parseManager(md);
const lines = [
  `verdict: ${verdict}`,
  `score: ${Math.round(+score * 10) / 10}`,
  `reason: ${reason}`,
  `reviewed: ${arg('reviewed', uk())}`,
  `round: ${arg('round', prev && prev.verdict === 'redo' && verdict !== 'pass' ? String((+prev.round || 0) + 1) : '1')}`,
  `reviewer: ${arg('reviewer', 'manager skill')}`,
];
if (arg('preview', '')) lines.push(`preview: ${arg('preview')}`);
if (arg('branch', '')) lines.push(`branch: ${arg('branch')}`);
if (arg('fix-branch', '')) lines.push(`fix_branch: ${arg('fix-branch')}`);
if (arg('report', '')) lines.push(`report: ${arg('report').replace(/\\/g, '/')}`);
const block = '```manager\n' + lines.join('\n') + '\n```\n';

let out;
if (BLOCK.test(md)) out = md.replace(BLOCK, block);
else {
  const status = /```status[ \t]*\r?\n[\s\S]*?```\r?\n?/.exec(md);
  if (status) out = md.slice(0, status.index + status[0].length) + '\n' + block + md.slice(status.index + status[0].length);
  else { const h1 = /^# .*\r?\n/.exec(md); out = h1 ? md.slice(0, h1[0].length) + '\n' + block + md.slice(h1[0].length) : block + '\n' + md; }
}

// Inbox lines (requests for the next session in this repo)
const inbox = all('inbox');
if (inbox.length) {
  const m = /(\*\*Inbox\*\*[^\n]*\n|## Inbox[^\n]*\n|^Inbox:?[^\n]*\n)/m.exec(out);
  if (m) {
    const at = m.index + m[0].length;
    let rest = out.slice(at).replace(/^- \(empty\)\r?\n/, '');
    const add = inbox.filter((l) => !rest.split(/\r?\n/).some((x) => x.trim() === `- ${l}`.trim())).map((l) => `- ${l}`).join('\n');
    out = out.slice(0, at) + (add ? add + '\n' : '') + rest;
  } else {
    out = out.replace(/\n## Log/, `\n**Inbox** (requests from other chats; delete a line once done):\n${inbox.map((l) => `- ${l}`).join('\n')}\n\n## Log`);
    if (!/\*\*Inbox\*\*/.test(out)) out += `\n\n**Inbox** (requests from other chats; delete a line once done):\n${inbox.map((l) => `- ${l}`).join('\n')}\n`;
  }
}

// Inbox lines that are done (a fixer fixed that fault): the exact line is removed, wherever it sits
const norm = (t) => String(t || '').replace(/\s+/g, ' ').trim().toLowerCase();
const removeInbox = all('remove-inbox').map(norm);
let removed = 0;
if (removeInbox.length) {
  out = out.split('\n').filter((l) => { const m = /^- (.*?)\r?$/.exec(l); if (m && removeInbox.includes(norm(m[1]))) { removed++; return false; } return true; }).join('\n');
}

// owner_todo in the ```status block: only things the owner alone can supply; never duplicated
const todo = all('owner-todo').map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
let todoAdded = 0;
if (todo.length) {
  const st = /```status[ \t]*\r?\n([\s\S]*?)```/.exec(out);
  if (st) {
    const body = st[1].replace(/\r/g, '').split('\n');
    if (body[body.length - 1] === '') body.pop();
    let k = body.findIndex((l) => /^owner_todo:/i.test(l));
    if (k < 0) { const at = body.findIndex((l) => /^preview:/i.test(l)); k = at < 0 ? body.length : at; body.splice(k, 0, 'owner_todo:'); }
    else {
      const v = body[k].replace(/^owner_todo:\s*/i, '').trim();
      body[k] = 'owner_todo:';
      if (v && !/^(\[\s*\]|none|-)$/i.test(v)) body.splice(k + 1, 0, `  - ${v}`);
    }
    let end = k + 1; while (end < body.length && /^\s+-\s/.test(body[end])) end++;
    const have = body.slice(k + 1, end).map((l) => norm(l.replace(/^\s+-\s*/, '')));
    const add = todo.filter((t) => !have.includes(norm(t)));
    body.splice(end, 0, ...add.map((t) => `  - ${t}`)); todoAdded = add.length;
    out = out.slice(0, st.index) + '```status\n' + body.join('\n') + '\n```' + out.slice(st.index + st[0].length);
  }
}

// "Waiting for owner" (for people): the same kind of items, one line each, never duplicated
const waiting = all('waiting').map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
let waitAdded = 0;
if (waiting.length) {
  const add = waiting.filter((w) => !out.split('\n').some((l) => norm(l.replace(/^- /, '')) === norm(w)));
  waitAdded = add.length;
  if (add.length) {
    const text = add.map((w) => `- ${w}`).join('\n') + '\n';
    const h = /^(## Waiting for owner[^\n]*|\*\*Waiting for owner[^\n]*)\n/m.exec(out);
    if (h) { const at = h.index + h[0].length; out = out.slice(0, at) + text + out.slice(at).replace(/^- \(empty\)\r?\n/, ''); }
    else {
      const anchor = /^\*\*Inbox\*\*|^## Inbox|^## Log/m.exec(out);
      const sec = `**Waiting for owner:**\n${text}\n`;
      out = anchor ? out.slice(0, anchor.index) + sec + out.slice(anchor.index) : out + `\n${sec}`;
    }
  }
}

const extra = [inbox.length ? `Inbox +${inbox.length}` : '', removeInbox.length ? `Inbox -${removed}` : '', todo.length ? `owner_todo +${todoAdded}` : '', waiting.length ? `Waiting for owner +${waitAdded}` : ''].filter(Boolean).join(', ');
if (argv.includes('--dry-run')) { console.log(block + (inbox.length ? `\nInbox +${inbox.length}:\n${inbox.map((l) => `- ${l}`).join('\n')}` : '') + (extra ? `\n(${extra})` : '')); process.exit(0); }
writeFileSync(file, out);
console.log(`wrote manager block (${verdict}, ${score}) to ${file}${extra ? ` (${extra})` : ''}`);
