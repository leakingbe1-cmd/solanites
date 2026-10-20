// Mythic and Secret species, shown fully like every other rarity (owner decision, 20 Oct),
// against a running production build.
//
//   STUDIO_QA_CREDENTIALS="user:passphrase" node scripts/qa/mythic-secret.mjs [baseUrl] [screenshotDir]
//
// Public visitors see all six by name, with their painted art (vector where a stage has no
// painting), lore, element, every stage and their approved stock pairing; nothing reads
// "Classified" or "???". Developer Mode still refuses anyone without the owner credentials.
// The credentials come from the environment and are never printed.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const B = process.argv[2] ?? "http://localhost:3100";
const SHOTS = process.argv[3] ?? null;
const CREDS = process.env.STUDIO_QA_CREDENTIALS;
if (!CREDS) throw new Error("Set STUDIO_QA_CREDENTIALS to the Developer Mode username:passphrase.");
const AUTH = "Basic " + Buffer.from(CREDS).toString("base64");

// The six, with their approved stock pairings (src/server/market/stockLinks.ts).
const SIX = [
  { id: "astravex", name: "Astravex", rarity: "Mythic", ticker: "GOOGL" },
  { id: "orbelith", name: "Orbelith", rarity: "Mythic", ticker: "RKLB" },
  { id: "eventide", name: "Eventide", rarity: "Mythic", ticker: "LLY" },
  { id: "helivane", name: "Helivane", rarity: "Mythic", ticker: "LMT" },
  { id: "genesis", name: "GENESIS", rarity: "Secret", ticker: "COIN" },
  { id: "nullborn", name: "NULLBORN", rarity: "Secret", ticker: "GME" },
];

let pass = 0;
let fail = 0;
function ok(name, cond, detail = "") {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && detail ? `  — ${detail}` : ""}`);
}

// ── API: each of the six answers with its approved pairing, like any species ──
for (const s of SIX) {
  const res = await fetch(`${B}/api/market/${s.id}?range=1M`);
  const body = res.ok ? await res.json() : null;
  ok(`api: /api/market/${s.id} answers with ${s.ticker}`, res.status === 200 && body?.stock?.ticker === s.ticker && body.quote === null, `${res.status} ${body?.stock?.ticker}`);
}
ok("api: an unknown id is still 404", (await fetch(`${B}/api/market/no-such-species`)).status === 404);

// ── Public pages: no Classified status or ??? names anywhere ──
for (const p of ["/", "/collection", "/how-it-works", "/leaderboard"]) {
  const html = await (await fetch(B + p)).text();
  ok(`html: ${p} has no "Classified" status, "???" name or sealed stand-in`, !/>Classified<|>\?\?\?<|sealed-(mythic|secret)|classified-\d+/.test(html));
}

// Developer Mode still refuses anyone without the owner credentials.
for (const [h, label] of [[{}, "no credentials"], [{ authorization: "Basic " + Buffer.from("owner:wrong-passphrase-wrong-wrong").toString("base64") }, "wrong credentials"]]) {
  ok(`studio: /studio/dev with ${label} is 401`, (await fetch(`${B}/studio/dev`, { headers: h })).status === 401);
  const sim = await fetch(`${B}/studio/dev/simulate`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ settings: { force: "secret" }, count: 5 }) });
  ok(`studio: simulate with ${label} is 401`, sim.status === 401);
}

const browser = await chromium.launch();
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem("solanites:intro:v1", "1"));
  const p = await ctx.newPage();
  const pageErrors = [];
  p.on("pageerror", (e) => pageErrors.push(e.message));

  // Collection: 28 plates, all at their final stage, the six by name with real art.
  await p.goto(`${B}/collection`, { waitUntil: "networkidle" });
  const plates = p.locator("button.sl-plate");
  ok("collection: 28 plates, none Classified", (await plates.count()) === 28 && (await p.locator("button.sl-plate", { hasText: "Classified" }).count()) === 0);
  const stages = await p.$$eval("button.sl-plate [data-stage]", (els) => [...new Set(els.map((e) => e.getAttribute("data-stage")))]);
  ok("collection: every plate shows the final (Ascended) stage", stages.length === 1 && stages[0] === "3", JSON.stringify(stages));
  for (const s of SIX) {
    const plate = p.locator("button.sl-plate", { hasText: s.name });
    await plate.first().scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    const st = await plate.first().evaluate((el) => ({ text: el.textContent, img: el.querySelector("img[src*='/creatures/']")?.getAttribute("src") ?? null, loaded: el.querySelector("img[src*='/creatures/']")?.naturalWidth ?? 0 }));
    ok(`collection: ${s.name} plate shows its name, ${s.rarity} badge and painted Ascended art`, st.text.includes(s.name) && st.text.toLowerCase().includes(s.rarity.toLowerCase()) && /\/creatures\/[a-z-]+\/4-ascended/.test(st.img ?? "") && st.loaded > 0, JSON.stringify({ img: st.img, loaded: st.loaded }));
  }

  // Detail: name, lore, element, four selectable stages, the stock panel.
  for (const s of SIX) {
    await p.goto(`${B}/collection?species=${s.id}`, { waitUntil: "networkidle" });
    const dlg = p.locator('[role="dialog"]');
    await dlg.waitFor({ timeout: 8000 });
    await p.waitForTimeout(600);
    const d = await dlg.evaluate((el) => ({ text: el.textContent, stageButtons: [...el.querySelectorAll("button")].filter((b) => /Eggling|Hatchling|Evolved|Ascended/.test(b.textContent ?? "")).length }));
    ok(`detail: ${s.name} shows its name, lore and element, with no ??? or Classified`, d.text.includes(s.name) && !/\?\?\?|Classified|Undiscovered/.test(d.text) && /Element/.test(d.text), d.text.slice(0, 160));
    ok(`detail: ${s.name} has all four stages to select`, d.stageButtons >= 4, String(d.stageButtons));
    const stock = await dlg.locator('section[aria-label*="stock linked"]').count();
    ok(`detail: ${s.name} shows its linked stock (${s.ticker})`, stock === 1 && d.text.includes(s.ticker), `${stock} panel(s)`);
    if (SHOTS && s.id === "astravex") await p.screenshot({ path: `${SHOTS}/mythic-detail-${s.id}.png` });
    await p.keyboard.press("Escape");
  }
  // Homepage tier cards name a real Mythic and Secret.
  await p.goto(`${B}/`, { waitUntil: "networkidle" });
  const cards = await p.$$eval('button[aria-label*="hatch rate"]', (els) => els.map((e) => e.getAttribute("aria-label")));
  ok("home: the Mythic and Secret tier cards name real species", cards.some((c) => /^Astravex, Mythic/.test(c ?? "")) && cards.some((c) => /NULLBORN, Secret/.test(c ?? "")), JSON.stringify(cards));
  ok("public browser: no page errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
  if (SHOTS) {
    await p.goto(`${B}/collection?rarity=mythic`, { waitUntil: "networkidle" });
    await p.locator("button.sl-plate", { hasText: "Astravex" }).scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${SHOTS}/mythic-collection.png` });
  }
  await ctx.close();
}

// ── Owner: Developer Mode lists all 28 ──
{
  const res = await fetch(`${B}/studio/dev`, { headers: { authorization: AUTH } });
  ok("owner: /studio/dev is 200, no-store and noindex", res.status === 200 && res.headers.get("cache-control")?.includes("no-store") && res.headers.get("x-robots-tag")?.includes("noindex"));
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: { username: CREDS.slice(0, CREDS.indexOf(":")), password: CREDS.slice(CREDS.indexOf(":") + 1) } });
  await ctx.addInitScript(() => localStorage.setItem("solanites:intro:v1", "1"));
  const p = await ctx.newPage();
  await p.goto(`${B}/studio/dev`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-species]");
  const ids = await p.$$eval("[data-species]", (els) => [...new Set(els.map((e) => e.getAttribute("data-species")))]);
  ok("owner browser: Developer Mode lists all 28 species, the six included", ids.length >= 28 && SIX.every((s) => ids.includes(s.id)), `${ids.length} species`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
