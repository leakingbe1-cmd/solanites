// Free, reproducible layout test of the homepage hero using the EXISTING phoenix image.
// Loads the running site, optionally injects a CSS-only variant (nothing in the app is
// edited), screenshots each viewport, and measures what the visitor actually sees.
//
//   SOLANITES_FIXTURES=1 npx next dev -p 3100        # in another shell
//   NODE_PATH=$(npm root -g) node docs/canon/phoenix-layout/phoenix-layout-test.mjs http://localhost:3100 <outDir>
//
// Measurements (all from pixels, not assumptions):
// - text zones: for the headline, lede and CTA row, the page is screenshotted with the
//   hero copy hidden, and the background under each element's box is measured:
//   p95 relative luminance, WCAG contrast of white text against that p95, and the share
//   of pixels brighter than relative luminance 0.18 ("bright feathers").
// - bird: known landmarks of the source image (eye, wingtips, tail, halo) are mapped
//   through the img element's object-fit: cover geometry to viewport coordinates, which
//   gives the focal point, the bird's on-screen box and which parts are clipped.
// - resolution: device pixels per source pixel (> 1 means the browser upscales).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3100";
const out = path.resolve(process.argv[3] ?? "phoenix-layout-out");
await mkdir(out, { recursive: true });
const { chromium } = await import(path.join(process.env.NODE_PATH, "playwright/index.mjs"));

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900, dpr: 1 },
  { name: "desktop-1920", width: 1920, height: 1080, dpr: 1 },
  { name: "mobile-390", width: 390, height: 844, dpr: 3 },
  { name: "mobile-430", width: 430, height: 932, dpr: 3 },
];

// Landmarks in the 2000 × 1116 source (public/hero/phoenix-2000.*), read off a gridded copy.
const SRC = { w: 2000, h: 1116 };
const LANDMARKS = {
  eyes: [1020, 373],
  halo: [1013, 187],
  leftWingtip: [60, 107],
  rightWingtip: [1940, 107],
  tailTip: [933, 1040],
  chest: [1013, 520],
};

// CSS-only variants. "current" injects nothing. Selectors are the live ones in globals.css.
const VARIANTS = {
  current: "",
  // Desktop: confine the art to the right 60% so the copy column sits on plain darkness;
  // the outer wings are cropped. Phones: shorter art band, bird pushed up so copy starts below it.
  "proposal-a": `
    @media (min-width: 1024px) {
      .sl-phx-art { inset: 0 0 0 auto !important; width: 60% !important; height: 100% !important; }
      .sl-phx-art img { object-position: 50% 32% !important; }
      .sl-phx-shade { background:
        linear-gradient(90deg, rgba(5,5,10,1) 0%, rgba(5,5,10,.96) 40%, rgba(5,5,10,.55) 46%, rgba(5,5,10,0) 58%),
        linear-gradient(180deg, rgba(5,5,10,.55) 0%, rgba(5,5,10,0) 16%, rgba(5,5,10,0) 70%, var(--color-void) 100%) !important; }
    }
    @media (max-width: 1023px) {
      .sl-phx-art { height: 46svh !important; }
      .sl-phx-art img { object-position: 50% 22% !important; }
      .sl-phx-shade { background:
        linear-gradient(180deg, rgba(5,5,10,.45) 0%, rgba(5,5,10,0) 14%),
        linear-gradient(180deg, rgba(5,5,10,0) 30svh, rgba(5,5,10,.9) 42svh, var(--color-void) 46svh) !important; }
    }`,
};

const HIDE_COPY = `.max-w-xl.text-center { visibility: hidden !important; }`;

const browser = await chromium.launch();
const results = [];
for (const [variant, css] of Object.entries(VARIANTS)) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`${base}/?intro=0`, { waitUntil: "networkidle" });
    if (css) await page.addStyleTag({ content: css });
    await page.addStyleTag({ content: `.sl-fade-up{animation:none!important;opacity:1!important;transform:none!important}` });
    await page.waitForFunction(() => { const i = document.querySelector(".sl-phx-art img"); return i && i.complete && i.naturalWidth > 0; });
    await page.waitForTimeout(400);

    const geo = await page.evaluate(() => {
      const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
      const img = document.querySelector(".sl-phx-art img");
      const cs = getComputedStyle(img);
      const copy = document.querySelector(".max-w-xl.text-center");
      return {
        img: r(img), objectPosition: cs.objectPosition, current: img.currentSrc.split("/").pop(), natural: [img.naturalWidth, img.naturalHeight],
        h1: r(copy?.querySelector("h1")), lede: r(copy?.querySelector("h1 + p")), cta: r(copy?.querySelector(".sl-btn-gold")?.parentElement),
      };
    });
    const shot = path.join(out, `${variant}-${vp.name}.png`);
    await page.screenshot({ path: shot });
    await page.addStyleTag({ content: HIDE_COPY });
    const bgShot = await page.screenshot();

    // Map landmarks through object-fit: cover.
    const { img } = geo;
    const scale = Math.max(img.w / SRC.w, img.h / SRC.h);
    const [px, py] = geo.objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const ox = img.x + (img.w - SRC.w * scale) * px;
    const oy = img.y + (img.h - SRC.h * scale) * py;
    const map = ([sx, sy]) => [Math.round(ox + sx * scale), Math.round(oy + sy * scale)];
    const lm = Object.fromEntries(Object.entries(LANDMARKS).map(([k, v]) => [k, map(v)]));
    const inView = ([x, y]) => x >= 0 && x <= vp.width && y >= 0 && y <= vp.height;

    // Background statistics under each text box, from the copy-hidden screenshot.
    const stats = await page.evaluate(async ({ b64, boxes, dpr }) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height); const g = c.getContext("2d"); g.drawImage(bmp, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const out = {};
      for (const [k, b] of Object.entries(boxes)) {
        if (!b) { out[k] = null; continue; }
        const x = Math.max(0, Math.round(b.x * dpr)), y = Math.max(0, Math.round(b.y * dpr));
        const w = Math.min(bmp.width - x, Math.round(b.w * dpr)), h = Math.min(bmp.height - y, Math.round(b.h * dpr));
        if (w <= 0 || h <= 0) { out[k] = null; continue; }
        const d = g.getImageData(x, y, w, h).data; const L = [];
        for (let i = 0; i < d.length; i += 4) L.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
        L.sort((a, b) => a - b);
        const p95 = L[Math.floor(L.length * 0.95)], mean = L.reduce((a, b) => a + b, 0) / L.length;
        out[k] = { meanL: +mean.toFixed(4), p95L: +p95.toFixed(4), whiteContrastAtP95: +(1.05 / (p95 + 0.05)).toFixed(2), brightShare: +(L.filter((v) => v > 0.18).length / L.length).toFixed(3) };
      }
      return out;
    }, { b64: bgShot.toString("base64"), boxes: { h1: geo.h1, lede: geo.lede, cta: geo.cta }, dpr: vp.dpr });

    results.push({
      variant, viewport: vp.name, size: `${vp.width}×${vp.height}@${vp.dpr}x`, screenshot: path.basename(shot),
      source: geo.current, renderedImagePx: [Math.round(SRC.w * scale), Math.round(SRC.h * scale)],
      // naturalWidth is density-adjusted under srcset w-descriptors, so use the file's real width.
      devicePxPerSourcePx: +((SRC.w * scale * vp.dpr) / (geo.current.includes("1200") ? 1200 : 2000)).toFixed(2),
      landmarks: lm,
      clipped: Object.entries(lm).filter(([, p]) => !inView(p)).map(([k]) => k),
      focalPointPct: [+(lm.eyes[0] / vp.width * 100).toFixed(1), +(lm.eyes[1] / vp.height * 100).toFixed(1)],
      text: stats,
    });
    await ctx.close();
  }
}
await browser.close();
await writeFile(path.join(out, "results.json"), JSON.stringify(results, null, 1));
for (const r of results) {
  const t = (k) => (r.text[k] ? `${k} p95L ${r.text[k].p95L} white ${r.text[k].whiteContrastAtP95}:1 bright ${(r.text[k].brightShare * 100).toFixed(0)}%` : `${k} n/a`);
  console.log(`${r.variant.padEnd(10)} ${r.viewport.padEnd(12)} src ${r.source} ×${r.devicePxPerSourcePx} eyes@${r.focalPointPct.join(",")}% clipped[${r.clipped.join(" ")}] | ${t("h1")} | ${t("lede")} | ${t("cta")}`);
}
