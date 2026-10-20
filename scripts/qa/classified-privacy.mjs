// Classified (Mythic/Secret) species privacy, against a running production build.
//
//   STUDIO_QA_CREDENTIALS="user:passphrase" node scripts/qa/classified-privacy.mjs [baseUrl] [screenshotDir]
//
// Public visitors (no credentials) must not receive a classified species' name, epithet,
// lore or id in any page, JavaScript file, API response or asset path. The owner, signed in
// to Developer Mode, must receive all of them. Both are checked separately, and the public
// pages are checked again after an owner visit (server-side state must not carry over).
// The credentials come from the environment and are never printed.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const B = process.argv[2] ?? "http://localhost:3100";
const SHOTS = process.argv[3] ?? null;
const CREDS = process.env.STUDIO_QA_CREDENTIALS;
if (!CREDS) throw new Error("Set STUDIO_QA_CREDENTIALS to the Developer Mode username:passphrase.");
const AUTH = "Basic " + Buffer.from(CREDS).toString("base64");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

// What identifies each classified species, read from the server-only source.
const src = readFileSync(path.join(ROOT, "src/server/classified/species.ts"), "utf8");
const field = (k) => [...src.matchAll(new RegExp(`^    ${k}: "([^"]+)"`, "gm"))].map((m) => m[1]);
const ids = field("id");
const names = field("name").map((n) => n.replace(/^Ø /, ""));
const epithets = field("epithet");
const lore = field("lore").map((l) => l.slice(0, 40));
if (ids.length !== 6 || names.length !== 6) throw new Error("Could not read the classified species list.");
// "genesis" is also an ordinary word in site copy, so only its quoted id counts.
const PATTERNS = [
  ...ids.map((id) => (id === "genesis" ? /["'`\\]genesis["'`\\]/ : new RegExp(`\\b${id}\\b`, "i"))),
  ...[...names, ...epithets, ...lore].map((s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
];
const leaks = (text) => PATTERNS.filter((p) => p.test(text)).map(String);

let pass = 0;
let fail = 0;
function ok(name, cond, detail = "") {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && detail ? `  — ${detail}` : ""}`);
}

const PAGES = ["/", "/collection", "/hatchery", "/leaderboard", "/how-it-works", "/claims", "/robots.txt", "/no-such-page"];

async function publicSweep(label) {
  for (const p of PAGES) {
    const res = await fetch(B + p);
    const html = await res.text();
    ok(`${label}: ${p} HTML (${res.status}) names no classified species`, leaks(html).length === 0, leaks(html).join(", "));
  }
}

// ── Public: pages, every built JavaScript/CSS file as served, APIs, asset paths ──
await publicSweep("public");

const staticDir = path.join(ROOT, ".next/static");
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
const assets = walk(staticDir).filter((f) => /\.(js|css)$/.test(f));
let served = 0;
const leaky = [];
for (const f of assets) {
  const url = `${B}/_next/static/${path.relative(staticDir, f).split(path.sep).join("/")}`;
  const res = await fetch(url);
  if (res.status === 200) served++;
  const l = leaks(await res.text());
  if (l.length) leaky.push(`${path.relative(staticDir, f)}: ${l.join(", ")}`);
}
ok(`public: all ${assets.length} built JS/CSS files are served without credentials`, served === assets.length, `${served} served`);
ok("public: no built JS/CSS file names a classified species (Developer Mode's own chunk included)", leaky.length === 0, leaky.slice(0, 5).join(" | "));
const devChunks = assets.filter((f) => f.includes(`${path.sep}studio${path.sep}`));
ok("public: Developer Mode's client chunk exists and is among those checked", devChunks.length > 0, String(devChunks.length));

const publicFiles = walk(path.join(ROOT, "public"));
ok(`public: none of ${publicFiles.length} public asset paths names a classified species`, publicFiles.every((f) => leaks(path.relative(ROOT, f)).length === 0));

const ADDR = "11111111111111111111111111111111";
for (const [method, p] of [["GET", `/api/holders/${ADDR}`], ["GET", "/api/health"], ["POST", `/api/eggs/egg_${ADDR}_1/hatch`], ["GET", `/api/wallet/${ADDR}`], ["GET", "/api/claims/status"], ["GET", "/api/market/mossling?range=1M"], ...ids.map((id) => ["GET", `/api/market/${id}?range=1M&owner=${ADDR}`])]) {
  const res = await fetch(B + p, { method });
  const body = await res.text();
  ok(`public: ${method} ${p} (${res.status}) names no classified species`, leaks(body).length === 0, leaks(body).join(", "));
}

// React Server Component payloads (client-side navigation) of every public page.
for (const p of PAGES.slice(0, 6)) {
  const res = await fetch(B + p, { headers: { RSC: "1" } });
  const body = await res.text();
  ok(`public: RSC payload of ${p} names no classified species`, leaks(body).length === 0, leaks(body).join(", "));
}
// A classified market id answers exactly like an unknown one.
{
  const a = await fetch(`${B}/api/market/${ids[0]}?range=1M`), b = await fetch(`${B}/api/market/no-such-species?range=1M`);
  ok("public: classified and unknown market ids answer identically", a.status === b.status && (await a.text()) === (await b.text()), `${a.status}/${b.status}`);
}

// Developer Mode refuses anyone without the owner credentials, and says nothing classified while refusing.
for (const [h, label] of [[{}, "no credentials"], [{ authorization: "Basic " + Buffer.from("owner:wrong-passphrase-wrong-wrong").toString("base64") }, "wrong credentials"]]) {
  const page = await fetch(`${B}/studio/dev`, { headers: h });
  const pageBody = await page.text();
  ok(`public: /studio/dev with ${label} is 401 and names nothing classified`, page.status === 401 && leaks(pageBody).length === 0, `${page.status}`);
  const sim = await fetch(`${B}/studio/dev/simulate`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ settings: { force: "secret" }, count: 5 }) });
  ok(`public: simulate with ${label} is 401`, sim.status === 401 && leaks(await sim.text()).length === 0, `${sim.status}`);
}

// The public Collection in a browser: 28 plates, the 6 classified ones sealed, nothing classified in the DOM.
const browser = await chromium.launch();
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem("solanites:intro:v1", "1"));
  const p = await ctx.newPage();
  await p.goto(`${B}/collection`, { waitUntil: "networkidle" });
  const plates = await p.locator("button.sl-plate").count();
  const classified = await p.locator("button.sl-plate", { hasText: "Classified" }).count();
  const dom = await p.content();
  ok("public browser: the Collection shows 28 plates, 6 of them classified", plates === 28 && classified === 6, `${plates} plates, ${classified} classified`);
  ok("public browser: the rendered Collection names no classified species", leaks(dom).length === 0, leaks(dom).join(", "));
  await p.locator("button.sl-plate", { hasText: "Classified" }).first().click();
  await p.waitForTimeout(400);
  const modal = await p.content();
  ok("public browser: a classified plate opens as ??? with nothing classified", /\?\?\?/.test(modal) && leaks(modal).length === 0, leaks(modal).join(", "));
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/privacy-public-classified-detail.png` });
  await p.keyboard.press("Escape");
  if (SHOTS) {
    await p.locator("button.sl-plate").nth(19).scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${SHOTS}/privacy-public-collection.png` });
  }
  await ctx.close();
}

// ── Owner: signed in, Developer Mode receives every classified species ──
{
  const res = await fetch(`${B}/studio/dev`, { headers: { authorization: AUTH } });
  const html = await res.text();
  const missing = names.filter((n) => !html.includes(n));
  ok("owner: /studio/dev (200) sends every classified species to the signed-in owner", res.status === 200 && missing.length === 0, `${res.status}; missing ${missing.join(", ")}`);
  ok("owner: /studio/dev is no-store and noindex", res.headers.get("cache-control")?.includes("no-store") && res.headers.get("x-robots-tag")?.includes("noindex"));
  const sim = await fetch(`${B}/studio/dev/simulate`, { method: "POST", headers: { authorization: AUTH, "content-type": "application/json" }, body: JSON.stringify({ settings: { force: "mythic" }, count: 200 }) });
  const data = await sim.json();
  const seen = new Set(data.results.map((r) => r.speciesId));
  ok("owner: simulated Mythic hatches land on real classified species", sim.status === 200 && [...seen].every((id) => ids.includes(id)), [...seen].join(","));

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: { username: CREDS.slice(0, CREDS.indexOf(":")), password: CREDS.slice(CREDS.indexOf(":") + 1) } });
  await ctx.addInitScript(() => localStorage.setItem("solanites:intro:v1", "1"));
  const p = await ctx.newPage();
  await p.goto(`${B}/studio/dev`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-species]");
  const species = await p.locator("[data-species]").count();
  const text = await p.locator("body").innerText();
  const shown = names.filter((n) => text.toLowerCase().includes(n.toLowerCase()));
  ok("owner browser: Developer Mode lists all 28 species, the 6 classified by name", species >= 28 && shown.length === 6, `${species} entries; named ${shown.length}`);
  // real art: painted art embedded by the server (a data URL, never a public file), or a vector
  // drawing with many shapes that isn't the generic sealed seal-stone (its outline starts "M200,82 L274,200")
  const drawn = await p.evaluate((ids) => ids.filter((id) => {
    const el = document.querySelector(`[data-species="${id}"]`);
    if (el?.querySelector('img[src^="data:image/webp;base64,"]')) return true;
    const svg = el?.querySelector("svg");
    return svg && svg.querySelectorAll("path,circle,ellipse,polygon,rect").length > 25 && !svg.innerHTML.includes("M200,82 L274,200");
  }), ids);
  ok("owner browser: every classified species is drawn with its real art", drawn.length === 6, drawn.join(","));
  if (SHOTS) {
    await p.locator(`[data-species="${ids[0]}"]`).scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${SHOTS}/privacy-owner-devmode.png` });
  }
  await ctx.close();
}

// ── Public again, after the owner's visit: nothing carried over on the server ──
await publicSweep("public after owner visit");

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
