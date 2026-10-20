// Live market acceptance test, against a deployed preview (or any running build):
//
//   [STUDIO_QA_CREDENTIALS=user:pass] node scripts/qa/live-market.mjs <baseUrl> [screenshotDir]
//
// For each species below it opens the Collection detail and checks that the stock panel shows
// that creature's own company and ticker, that TradingView's widget really loads (its iframe
// appears) configured for exactly that exchange:ticker, that the attribution link is present,
// and that nothing is labelled as sample data or "unavailable". It also checks the public
// market API's identity for each, that classified ids answer 404, and that no provider key or
// classified company name appears in any served JavaScript. With owner credentials it checks
// that signed-in Developer Mode makes no third-party requests. Prints a timestamped record.
// Classified ids and companies are read from the server-only source at run time, never written
// into this public file.
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const B = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const SHOTS = process.argv[3] ?? null;
const CHECK = [
  { name: "Mossling", id: "mossling" },
  { name: "Pyraurum", id: "pyraurum" },
  { name: "Velynx", id: "velynx" },
  { name: "Thalor", id: "thalor" },
  { name: "Zephrax", id: "zephrax" },
];
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const CLASSIFIED = [...readFileSync(path.join(ROOT, "src/server/classified/species.ts"), "utf8").matchAll(/^    id: "([^"]+)"/gm)].map((m) => m[1]);
if (CLASSIFIED.length !== 6) throw new Error("Could not read the classified species ids.");
const links = readFileSync(path.join(ROOT, "src/server/market/stockLinks.ts"), "utf8");
const CLASSIFIED_COMPANIES = CLASSIFIED.map((id) => new RegExp(`speciesId: "${id}", ticker: "[^"]+", company: "([^"(]+)`).exec(links)?.[1]?.trim()).filter(Boolean);
const SECRET_STRINGS = [...CLASSIFIED_COMPANIES, "TWELVE_DATA_API_KEY", "MASSIVE_API_KEY", "apikey="];
const CREDS = process.env.STUDIO_QA_CREDENTIALS ?? null;
const PREFIX = { NYSE: "NYSE", Nasdaq: "NASDAQ" };

let pass = 0;
let fail = 0;
const ok = (label, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${!cond && detail ? `  — ${detail}` : ""}`);
};
console.log(`live-market acceptance · ${B} · ${new Date().toISOString()}`);

// 1. Public API: identity per species, classified ids sealed.
const identity = {};
const chartFlag = {};
for (const c of CHECK) {
  const r = await fetch(`${B}/api/market/${c.id}?range=1M`);
  const j = await r.json().catch(() => null);
  identity[c.id] = j?.stock;
  chartFlag[c.id] = j?.externalChart ?? null;
  ok(`api ${c.id}: 200 with a ticker and exchange`, r.status === 200 && !!j?.stock?.ticker && !!PREFIX[j?.stock?.exchange], `${r.status}`);
  ok(`api ${c.id}: never labelled sample`, j?.status !== "sample", j?.status);
  ok(`api ${c.id}: no server prices or Vigour in public responses`, j?.quote === null && j?.growth === null && (j?.chart?.points ?? []).length === 0);
  console.log(`      ${c.id} externalChart: ${j?.externalChart ?? "none"}`);
  console.log(`      ${c.id} → ${j?.stock?.exchange}:${j?.stock?.ticker} (${j?.stock?.company}) · server status ${j?.status} · ${j?.statusDetail ?? ""}`);
}
const unknown = await fetch(`${B}/api/market/no-such-species`);
const unknownBody = await unknown.text();
for (const id of CLASSIFIED) {
  const r = await fetch(`${B}/api/market/${id}`);
  ok(`api ${id}: same 404 as an unknown id`, r.status === 404 && (await r.text()) === unknownBody);
}

// 2. Browser: the panel, the widget and its symbol.
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem("solanites:intro:v1", JSON.stringify({ seen: true, at: 1 })); } catch {} });
const page = await ctx.newPage();
const scripts = new Set();
page.on("response", (res) => { if (res.request().resourceType() === "script" && res.url().startsWith(B)) scripts.add(res.url()); });
for (const c of CHECK) {
  const id = identity[c.id];
  const want = id ? `${PREFIX[id.exchange]}:${id.ticker}` : "?";
  await page.goto(`${B}/collection`, { waitUntil: "networkidle" });
  await page.getByText(c.name, { exact: true }).first().click();
  const panel = page.locator("section[aria-label*='stock linked']").first();
  await panel.waitFor({ timeout: 20000 });
  await panel.scrollIntoViewIfNeeded();
  const text = await panel.innerText();
  ok(`${c.id}: panel names ${id?.company} and ${id?.ticker}`, !!id && text.includes(id.company) && text.includes(id.ticker));
  ok(`${c.id}: no sample or unavailable wording`, !/sample data|not real market prices|isn.t connected on this server/i.test(text));
  const tv = panel.locator("[data-tv-symbol]");
  const hasTv = (await tv.count()) > 0;
  ok(`${c.id}: widget shown exactly when the server enables it (${chartFlag[c.id] ?? "off"})`, hasTv === (chartFlag[c.id] === "tradingview"));
  if (hasTv) {
    ok(`${c.id}: widget is for ${want}`, (await tv.getAttribute("data-tv-symbol")) === want, await tv.getAttribute("data-tv-symbol"));
    const frame = tv.locator("iframe");
    const loaded = await frame.first().waitFor({ timeout: 20000 }).then(() => true).catch(() => false);
    ok(`${c.id}: TradingView iframe loaded`, loaded);
    if (loaded) {
      const src = decodeURIComponent((await frame.first().getAttribute("src")) ?? "");
      ok(`${c.id}: iframe configured for ${want} only`, src.includes(want) && !CHECK.filter((o) => o.id !== c.id).some((o) => identity[o.id] && src.includes(`${PREFIX[identity[o.id].exchange]}:${identity[o.id].ticker}"`)), src.slice(0, 160));
      await page.waitForTimeout(4000);
    }
    ok(`${c.id}: TradingView's own attribution present, unaltered`, (await tv.locator('.tradingview-widget-copyright a[href="https://www.tradingview.com/"]', { hasText: "Track all markets on TradingView" }).count()) >= 1);
  } else {
    ok(`${c.id}: without the widget, the panel says there's no price (nothing invented)`, /No price to show/.test(text) && !/\$\d/.test(text));
  }
  if (SHOTS) await panel.screenshot({ path: `${SHOTS}/live-${c.id}.png` });
  console.log(`      ${c.id}: checked at ${new Date().toISOString()}`);
  await page.keyboard.press("Escape");
}

// 3. No key or classified company in any served script.
let leaked = [];
for (const url of scripts) {
  const body = await (await fetch(url)).text();
  for (const s of SECRET_STRINGS) if (body.includes(s)) leaked.push(`${url.split("/").pop()}: ${s}`);
}
ok(`no provider key or classified company in ${scripts.size} served scripts`, scripts.size > 0 && leaked.length === 0, leaked.join("; "));

// 4. Owner tools load nothing third-party (classified data and credentials live there).
if (CREDS) {
  const [username, ...rest] = CREDS.split(":");
  const owner = await browser.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: { username, password: rest.join(":") } });
  const op = await owner.newPage();
  const foreign = new Set();
  op.on("request", (r) => { if (!r.url().startsWith(B) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) foreign.add(new URL(r.url()).host); });
  const res = await op.goto(`${B}/studio/dev`, { waitUntil: "networkidle" });
  await op.waitForTimeout(3000);
  ok("owner: /studio/dev sends a strict CSP (no third-party frames)", (res?.headers()["content-security-policy"] ?? "").includes("frame-src 'none'"));
  ok("owner: signed-in Developer Mode makes no third-party requests", foreign.size === 0, [...foreign].join(", "));
  await owner.close();
} else console.log("      (owner checks skipped: set STUDIO_QA_CREDENTIALS)");
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
