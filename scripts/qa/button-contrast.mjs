#!/usr/bin/env node
/**
 * Hero button contrast, measured on the rendered page (not computed from CSS alone):
 * for each call to action, the text colour is compared with the actual pixels behind
 * the label (captured with the label hidden, sampled inside the button, away from its
 * rounded corners), using the 5th or 95th-percentile background luminance, whichever is
 * closer to the text, as the worst case. WCAG AA for this text size needs 4.5:1.
 *
 *   node scripts/qa/button-contrast.mjs [base-url]
 * Exits 1 if any button at any viewport is below 4.5:1.
 */
import sharp from "sharp";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));
const B = process.argv[2] ?? "http://localhost:3100";
const SEEN = `try{localStorage.setItem("solanites:intro:v1",JSON.stringify({seen:true,at:0}))}catch(e){}`;
const VIEWPORTS = [
  [390, 844, true],
  [768, 1024, true],
  [1024, 768, false],
  [1024, 1366, true],
  [1280, 800, false],
  [1440, 900, false],
  [1920, 1080, false],
  [2560, 1440, false],
];

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (r, g, b) => 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const browser = await chromium.launch();
const rows = [];
for (const [w, h, mobile] of VIEWPORTS) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  await c.addInitScript(SEEN);
  const p = await c.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForSelector("section[data-awake]", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(3800); // the awakening settles into its resting frame
  const buttons = await p.$$("section[data-awake] a.sl-btn-outline, section[data-awake] a.sl-btn-gold");
  for (const el of buttons) {
    const label = (await el.innerText()).replace(/\s+/g, " ").trim();
    const text = await el.evaluate((e) => getComputedStyle(e).color);
    const [tr, tg, tb] = text.match(/\d+(\.\d+)?/g).map(Number);
    await el.evaluate((e) => e.style.setProperty("color", "transparent", "important"));
    await el.scrollIntoViewIfNeeded();
    const { data, info } = await sharp(await el.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    await el.evaluate((e) => e.style.removeProperty("color"));
    // The label area only: the box's rounded corners show the page behind the button.
    const L = [];
    const [x0, x1, y0, y1] = [Math.floor(info.width * 0.12), Math.ceil(info.width * 0.88), Math.floor(info.height * 0.25), Math.ceil(info.height * 0.75)];
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * info.width + x) * info.channels;
        L.push(lum(data[i], data[i + 1], data[i + 2]));
      }
    }
    L.sort((a, b) => a - b);
    const lt = lum(tr, tg, tb);
    const p05 = L[Math.floor(L.length * 0.05)];
    const p95 = L[Math.floor(L.length * 0.95)];
    const worst = Math.min(ratio(lt, p05), ratio(lt, p95));
    rows.push({ viewport: `${w}×${h}`, label, ratio: Math.round(worst * 100) / 100, pass: worst >= 4.5 });
  }
  await c.close();
}
await browser.close();
for (const r of rows) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.viewport.padEnd(10)} ${r.label.padEnd(22)} ${r.ratio.toFixed(2)}:1`);
const fails = rows.filter((r) => !r.pass).length;
console.log(`${rows.length - fails}/${rows.length} buttons at or above 4.5:1`);
process.exit(fails ? 1 : 0);
