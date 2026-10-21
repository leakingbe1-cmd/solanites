// Records the site-walkthrough scenes from the live site (CDP screencast, 1920x1080) into ./captures/<scene>/.
//   node campaign/site-intro-video/build/record.mjs [baseUrl]
// Mythic and Secret creatures are never navigated to: the Collection is filtered to Legendary first, and the
// home page "bloodlines" cards (which show Mythic/Secret art) are not recorded.
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs"; import { fileURLToPath } from "node:url"; import path from "node:path";
const require = createRequire(import.meta.url);
const pw = require(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim() + "/playwright");
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "captures"), B = process.argv[2] ?? "https://solanites.vercel.app";
const b = await pw.chromium.launch(); const c = await b.newContext({ viewport: { width: 1920, height: 1080 } });
await c.addInitScript(() => { for (const k of ["solanites:intro:v1", "solanites:intro:v2"]) localStorage.setItem(k, JSON.stringify({ seen: true, at: Date.now() })); });
const p = await c.newPage(); const cdp = await c.newCDPSession(p); let cur = null;
cdp.on("Page.screencastFrame", async (f) => { if (cur) { const fn = `${cur.dir}/${String(cur.frames.length).padStart(5, "0")}.jpg`; writeFileSync(fn, Buffer.from(f.data, "base64")); cur.frames.push([fn.split("/").pop(), f.metadata.timestamp]); } await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
async function rec(name, fn) {
  const dir = `${OUT}/${name}`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  cur = { dir, frames: [], marks: {} }; const t0 = Date.now() / 1000;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await fn((k) => (cur.marks[k] = Date.now() / 1000 - t0));
  await cdp.send("Page.stopScreencast"); await p.waitForTimeout(200);
  const base = cur.frames[0][1]; writeFileSync(`${dir}/index.json`, JSON.stringify({ frames: cur.frames.map(([f, ts]) => [f, +(ts - base).toFixed(4)]), marks: cur.marks }));
  console.log(name, cur.frames.length, "frames over", (cur.frames.at(-1)[1] - base).toFixed(1), "s"); cur = null;
}
const smooth = (dy, T) => p.evaluate(([dy, T]) => new Promise((res) => { const y0 = window.scrollY, s = performance.now(); const st = (n) => { const k = Math.min(1, (n - s) / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo(0, y0 + dy * e); k < 1 ? requestAnimationFrame(st) : res(); }; requestAnimationFrame(st); }), [dy, T]);

// 1 hero
await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
await rec("hero", async () => { await p.waitForTimeout(5500); });
// 2 collection: Legendary filter, open Pyraurum, show its four forms
await p.goto(B + "/collection", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
await rec("collection", async (mark) => {
  await p.waitForTimeout(600); await p.getByRole("button", { name: /^Legendary$/ }).click(); await p.waitForTimeout(1600);
  mark("open"); await p.locator("a,button,[role=button]").filter({ hasText: /Pyraurum/ }).first().click(); await p.waitForTimeout(3600);
  mark("stage3"); const st = p.locator("button").filter({ hasText: /Ascended/ }).first(); if (await st.count()) await st.click().catch(() => {}); await p.waitForTimeout(2200);
});
// 3 market chart region: scroll inside the open creature modal (cropped later to hide the price header)
await p.goto(B + "/collection", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.getByRole("button", { name: /^Legendary$/ }).click(); await p.waitForTimeout(1200);
await p.locator("a,button,[role=button]").filter({ hasText: /Pyraurum/ }).first().click(); await p.waitForTimeout(2000);
await p.mouse.move(960, 600);
await rec("market", async (mark) => {
  for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, 90); await p.waitForTimeout(70); }
  await p.waitForTimeout(7200); mark("end");
});
// 4 hatchery demo. The demo rolls its rarity in the browser, so retry in a fresh context until the reveal is
// Common to Legendary: a Mythic or Secret reveal must never be recorded.
const BANNED = /NULLBORN|GENESIS|ASTRAVEX|ORBELITH|EVENTIDE|HELIVANE|MYTHIC|SECRET/i;
for (let attempt = 1; attempt <= 12; attempt++) {
  const c2 = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  await c2.addInitScript(() => { for (const k of ["solanites:intro:v1", "solanites:intro:v2"]) localStorage.setItem(k, JSON.stringify({ seen: true, at: Date.now() })); });
  const p2 = await c2.newPage(); await p2.goto(B + "/hatchery", { waitUntil: "networkidle" }); await p2.waitForTimeout(800);
  await p2.getByRole("button", { name: /EXPLORE THE DEMO/i }).click(); await p2.waitForTimeout(2200);
  const hatch = p2.getByRole("button", { name: /hatch now/i }).first(); await hatch.scrollIntoViewIfNeeded(); await p2.waitForTimeout(600);
  const cdp2 = await c2.newCDPSession(p2); const dir = `${OUT}/hatch`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const frames = []; const marks = {}; let on = true; const t0 = Date.now() / 1000;
  cdp2.on("Page.screencastFrame", async (f) => { if (on) { const fn = `${String(frames.length).padStart(5, "0")}.jpg`; writeFileSync(`${dir}/${fn}`, Buffer.from(f.data, "base64")); frames.push([fn, f.metadata.timestamp]); } await cdp2.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await cdp2.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await p2.waitForTimeout(1800); marks.click = Date.now() / 1000 - t0; await hatch.click(); await p2.waitForTimeout(1800);
  marks.hatch = Date.now() / 1000 - t0; await p2.getByRole("button", { name: /HATCH YOUR SOLANITE/i }).click(); await p2.waitForTimeout(7000); marks.end = Date.now() / 1000 - t0;
  const txt = await p2.locator("body").innerText(); on = false; await cdp2.send("Page.stopScreencast").catch(() => {});
  const name = (await p2.locator("h1,h2,h3").allInnerTexts()).join(" | ");
  const bad = BANNED.test(txt);
  console.log("hatch attempt", attempt, bad ? "REJECTED (Mythic/Secret)" : "ok", name.slice(0, 80));
  const base = frames[0][1]; writeFileSync(`${dir}/index.json`, JSON.stringify({ frames: frames.map(([f, ts]) => [f, +(ts - base).toFixed(4)]), marks }));
  await c2.close(); if (!bad) break; if (attempt === 12) throw new Error("no clean hatch in 12 attempts");
}
// 5 evolution tour on the home page, anchored on its pause button so the Mythic/Secret bloodline cards stay out of frame
await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
const heading = p.getByText("One creature.", { exact: false }).first(); await heading.scrollIntoViewIfNeeded();
await p.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((e) => /One creature/.test(e.textContent)); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY + 90); }); await p.waitForTimeout(600);
await rec("evolution", async () => {
  await p.waitForTimeout(1200);
  for (const n of ["Hatchling", "Evolved", "Ascended"]) { const t = p.locator("button").filter({ hasText: new RegExp(n) }).last(); await t.click({ timeout: 4000 }).catch((e) => console.log("click", n, e.message.slice(0, 50))); await p.waitForTimeout(2300); }
  await p.waitForTimeout(800);
});
// 6 leaderboard
await p.goto(B + "/leaderboard", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await rec("leaderboard", async () => { await p.waitForTimeout(3200); });
await b.close();
