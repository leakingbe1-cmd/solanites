let chromium; for (const m of ["playwright", "/opt/node22/lib/node_modules/playwright/index.mjs"]) { try { ({ chromium } = await import(m)); break; } catch {} }
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
// Re-records the site captures used by the video. Run the site first (next build && next start -p 3400).
//   node marketing/x-campaign/video/build/record.mjs [baseUrl]
import { fileURLToPath } from "node:url";
const out = new URL("./captures", import.meta.url).pathname, B = process.argv[2] ?? "http://localhost:3400";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.addInitScript(() => { for (const k of ["solanites:intro:v1", "solanites:intro:v2"]) localStorage.setItem(k, JSON.stringify({ seen: true, at: Date.now() })); });
const p = await c.newPage(); const cdp = await c.newCDPSession(p);
let cur = null;
cdp.on("Page.screencastFrame", async (f) => { if (cur) { const i = cur.frames.length; const fn = `${cur.dir}/${String(i).padStart(5, "0")}.jpg`; writeFileSync(fn, Buffer.from(f.data, "base64")); cur.frames.push([fn.split("/").pop(), f.metadata.timestamp]); } await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
async function rec(name, fn) {
  const dir = `${out}/${name}`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  cur = { dir, frames: [], marks: {} }; const t0 = Date.now() / 1000;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
  await fn((k) => (cur.marks[k] = Date.now() / 1000 - t0));
  await cdp.send("Page.stopScreencast"); await p.waitForTimeout(200);
  const base = cur.frames[0][1]; writeFileSync(`${dir}/index.json`, JSON.stringify({ frames: cur.frames.map(([f, ts]) => [f, +(ts - base).toFixed(4)]), marks: cur.marks }));
  console.log(name, cur.frames.length, "frames over", (cur.frames.at(-1)[1] - base).toFixed(1), "s", JSON.stringify(cur.marks)); cur = null;
}
// hatchery demo: eggs, hatch now, hatch your solanite, reveal
await p.goto(B + "/hatchery", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.getByRole("button", { name: /EXPLORE THE DEMO/i }).click(); await p.waitForTimeout(2200);
const hatch = p.getByRole("button", { name: /hatch now/i }).first(); await hatch.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -120)); await p.waitForTimeout(800);
await rec("hatch", async (mark) => {
  await p.waitForTimeout(1800); mark("click_hatch_now"); await hatch.click(); await p.waitForTimeout(1600);
  mark("click_hatch_yours"); await p.getByRole("button", { name: /HATCH YOUR SOLANITE/i }).click(); await p.waitForTimeout(8000); mark("end");
});
// collection: smooth scroll through the real grid
await p.goto(B + "/collection", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
await rec("collection", async () => {
  await p.waitForTimeout(700);
  await p.evaluate(() => new Promise((res) => { const y0 = window.scrollY, d = 1500, T = 5200, s = performance.now(); const step = (n) => { const k = Math.min(1, (n - s) / T), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo(0, y0 + d * e); k < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); }));
  await p.waitForTimeout(600);
});
await b.close();
