// Live market acceptance test, against a deployed preview (or any running build):
//
//   [STUDIO_QA_CREDENTIALS=user:pass] node scripts/qa/live-market.mjs <baseUrl> [screenshotDir]
//
// For each species below it opens the Collection detail and checks that the stock panel shows
// that creature's own company and ticker, that TradingView's widget really loads (its iframe
// appears) configured for exactly that exchange:ticker, that the attribution link is present,
// and that nothing is labelled as sample data or "unavailable". It also checks the public
// market API's identity for each, that the Mythic and Secret species answer like every other
// (owner decision 20 Oct), and that no provider key appears in any served JavaScript. With owner
// credentials it checks that signed-in Developer Mode makes no third-party requests. Prints a
// timestamped record.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const B = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const SHOTS = process.argv[3] ?? null;
const CHECK = [
  { name: "Mossling", id: "mossling" },
  { name: "Pyraurum", id: "pyraurum" },
  { name: "Velynx", id: "velynx" },
  { name: "Thalor", id: "thalor" },
  { name: "Zephrax", id: "zephrax" },
  { name: "Astravex", id: "astravex" },
  { name: "GENESIS", id: "genesis" },
];
/** Mythic and Secret species, public with their approved pairings (src/server/market/stockLinks.ts). */
const MYTHIC_SECRET = { astravex: "GOOGL", orbelith: "RKLB", eventide: "LLY", helivane: "LMT", genesis: "COIN", nullborn: "GME" };
const SECRET_STRINGS = ["TWELVE_DATA_API_KEY", "MASSIVE_API_KEY", "apikey="];
const CREDS = process.env.STUDIO_QA_CREDENTIALS ?? null;
const PREFIX = { NYSE: "NYSE", Nasdaq: "NASDAQ" };

let pass = 0;
let fail = 0;
const ok = (label, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${!cond && detail ? `  — ${detail}` : ""}`);
};
console.log(`live-market acceptance · ${B} · ${new Date().toISOString()}`);

// 1. Public API: identity per species, Mythic and Secret included.
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
ok("api: an unknown id is 404", (await fetch(`${B}/api/market/no-such-species`)).status === 404);
for (const [id, ticker] of Object.entries(MYTHIC_SECRET)) {
  const r = await fetch(`${B}/api/market/${id}`);
  const j = await r.json().catch(() => null);
  ok(`api ${id}: 200 with its approved pairing ${ticker}, no server prices`, r.status === 200 && j?.stock?.ticker === ticker && j?.quote === null, `${r.status} ${j?.stock?.ticker}`);
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
      const box = await frame.first().boundingBox();
      ok(`${c.id}: chart has room to draw (iframe at least 240 px tall)`, (box?.height ?? 0) >= 240, `${Math.round(box?.height ?? 0)} px`);
    }
    // TradingView's script rewrites the attribution itself and adds tracking parameters to the link.
    ok(`${c.id}: TradingView's own attribution present, unaltered`, (await tv.locator('.tradingview-widget-copyright a[href^="https://www.tradingview.com/"]', { hasText: "Track all markets on TradingView" }).count()) >= 1);
  } else {
    ok(`${c.id}: without the widget, the panel says there's no price (nothing invented)`, /No price to show/.test(text) && !/\$\d/.test(text));
  }
  if (SHOTS) await panel.screenshot({ path: `${SHOTS}/live-${c.id}.png` });
  console.log(`      ${c.id}: checked at ${new Date().toISOString()}`);
  await page.keyboard.press("Escape");
}

// 3. No provider key in any served script.
let leaked = [];
for (const url of scripts) {
  const body = await (await fetch(url)).text();
  for (const s of SECRET_STRINGS) if (body.includes(s)) leaked.push(`${url.split("/").pop()}: ${s}`);
}
ok(`no provider key in ${scripts.size} served scripts`, scripts.size > 0 && leaked.length === 0, leaked.join("; "));

// 4. Owner tools load nothing third-party (owner credentials live there).
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
