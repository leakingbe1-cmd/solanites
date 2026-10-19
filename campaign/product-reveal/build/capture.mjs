// Records genuine screen captures of the Solanites website, frame by frame.
//   node campaign/product-reveal/build/capture.mjs [shot ...]
// Needs the site running locally (production build of the release branch):
//   next build && next start -p 3100     (CAPTURE_ORIGIN overrides the address)
// Each frame advances the page's clock (timers, requestAnimationFrame) and every
// CSS animation/transition by exactly 1/30 s, so recordings are smooth and real.
// Nothing on the page is altered except hiding the first-visit intro.
import { createRequire } from "node:module";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "captures");
// the local production build being recorded; never drawn on any creative
const LOCAL_BUILD = "http://localhost:3100";
const SITE = process.env.CAPTURE_ORIGIN || LOCAL_BUILD;
const FPS = 30;

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return require(join(root, "playwright"));
  }
}

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
const MOBILE = { viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
async function topOf(page, text, offset) {
  return page.evaluate(([t, o]) => {
    const el = [...document.querySelectorAll("h1,h2,h3")].find(e => e.textContent.replace(/\s+/g, " ").includes(t));
    return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - o) : 0;
  }, [text, offset]);
}

// Each shot: where to go, what to do first, how long to record, and how to scroll.
const SHOTS = {
  "hero-desktop": { device: DESKTOP, path: "/", seconds: 5 },
  // on phones the hatching egg sits below the headline; frame it under the fixed header
  "hero-mobile": { device: MOBILE, path: "/", seconds: 15, scroll: async p => [600, 600] },
  "collection-desktop": { device: DESKTOP, path: "/collection", seconds: 7, scroll: async p => [0, 2150] },
  "collection-mobile": { device: MOBILE, path: "/collection", seconds: 7, scroll: async p => [0, 3600] },
  "rarity-desktop": { device: DESKTOP, path: "/", seconds: 4, scroll: async p => { const y = await topOf(p, "Six tiers of rarity", 90); return [y, y + 60]; } },
  "rarity-mobile": { device: MOBILE, path: "/", seconds: 4, scroll: async p => { const y = await topOf(p, "Six tiers of rarity", 40); return [y, y + 700]; } },
  "pyraurum-desktop": {
    device: DESKTOP, path: "/collection", seconds: 4,
    setup: async p => { await p.getByText("Pyraurum", { exact: true }).first().click(); },
  },
  "pyraurum-mobile": {
    device: MOBILE, path: "/collection", seconds: 6,
    setup: async p => { await p.getByText("Pyraurum", { exact: true }).first().click(); },
    // the detail sheet scrolls inside its own panel
    innerScroll: [0, 900],
  },
};

const only = process.argv.slice(2);
const { chromium } = loadPlaywright();
const browser = await chromium.launch();

for (const [name, shot] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(name)) continue;
  const ctx = await browser.newContext({ ...shot.device, reducedMotion: "no-preference" });
  await ctx.addInitScript(() => { try { localStorage.setItem("solanites:intro:v1", JSON.stringify({ seen: true, at: 1 })); } catch {} });
  const page = await ctx.newPage();
  // the page's clock only moves when we step it, so timers and CSS stay in lockstep
  await page.clock.install({ time: new Date("2026-10-19T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-19T12:00:01Z"));
  await page.goto(SITE + shot.path + "?intro=0", { waitUntil: "networkidle" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  const [y0, y1] = shot.scroll ? await shot.scroll(page) : [0, 0];
  await page.evaluate(y => window.scrollTo(0, y), y0);
  await page.clock.runFor(800);
  if (shot.setup) { await shot.setup(page); }
  await page.clock.runFor(1200);
  await page.waitForTimeout(400); // let images decode

  const frames = Math.round(shot.seconds * FPS);
  const dir = join(OUT, ".frames", name);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  for (let f = 0; f < frames; f++) {
    const k = ease(frames > 1 ? f / (frames - 1) : 0);
    await page.evaluate(([y, inner]) => {
      window.scrollTo(0, y);
      if (inner != null) {
        const panel = [...document.querySelectorAll("[role=dialog] *, [aria-modal] *")].find(e => e.scrollHeight > e.clientHeight + 20 && getComputedStyle(e).overflowY !== "visible");
        if (panel) panel.scrollTop = inner;
      }
    }, [y0 + (y1 - y0) * k, shot.innerScroll ? shot.innerScroll[0] + (shot.innerScroll[1] - shot.innerScroll[0]) * k : null]);
    await page.clock.runFor(1000 / FPS);
    await page.evaluate(dt => {
      const t = (window.__slT ||= new WeakMap());
      for (const a of document.getAnimations()) {
        try { const now = (t.get(a) ?? (a.currentTime || 0)) + dt; a.pause(); a.currentTime = now; t.set(a, now); } catch {}
      }
    }, 1000 / FPS);
    await page.screenshot({ path: join(dir, `${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 93 });
  }
  await ctx.close();
  // keep a faithful, compact master of every recording next to the campaign
  const mp4 = join(OUT, `${name}.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "%04d.jpg"),
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", mp4]);
  console.log("captured", name, frames, "frames");
}
await browser.close();
