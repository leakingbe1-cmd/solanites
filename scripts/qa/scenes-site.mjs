// Browser checks for creature scenes (biomes + idle), against a running production build:
//
//   npm run build && npx next start -p 3100 &
//   node scripts/qa/scenes-site.mjs <screenshot-dir> [base-url]
//
// Every public species shows its own biome at all four stages; classified slots show the
// sealed vault and no species asset is requested for them; plates load (no broken images);
// scenes off screen hold still; reduced motion stops all scene movement; the homepage Market
// Bond plate stays quiet; no horizontal overflow at 390 px; and frame timing on a Collection
// full of scenes, at desktop and at a throttled phone profile.
import { mkdirSync } from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

const out = process.argv[2] ?? "qa-shots";
const B = process.argv[3] ?? "http://localhost:3100";
mkdirSync(out, { recursive: true });
const res = [];
const errs = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
const browser = await chromium.launch();
const SEEN = `try{localStorage.setItem("solanites:intro:v1",JSON.stringify({seen:true,at:0}))}catch(e){}`;
const PUBLIC = ["mossling", "driftfin", "pallow", "glimmeray", "sproutwyrm", "frostkit", "abyssal-vael", "stormquill", "duskwing", "cryovant", "emberlisk", "neonyx", "aurorath", "zephrax", "prismara", "nyxara", "aurelion", "solvanth", "pyraurum", "aurelith", "velynx", "thalor"];

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await c.addInitScript(SEEN);
  const p = await c.newPage();
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !/503|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  return [c, p];
}

/** Scroll the whole page so every lazy plate loads, then come back to the top. */
async function scrollThrough(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(600);
}

// 1. Collection: every species' biome, sealed vaults, plates load, no stray scene assets.
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const [c, p] = await ctx({ viewport: vp });
  const scenes = [];
  p.on("request", (r) => r.url().includes("/scenes/") && scenes.push(new URL(r.url()).pathname));
  await p.goto(`${B}/collection`, { waitUntil: "networkidle" });
  await scrollThrough(p);
  const st = await p.evaluate(() => {
    const all = [...document.querySelectorAll(".sl-scene")];
    const imgs = [...document.querySelectorAll("img")].filter((i) => i.getAttribute("src"));
    return {
      scenes: all.length,
      biomes: [...new Set(all.map((e) => e.dataset.biome))],
      sealed: all.filter((e) => e.dataset.biome === "sealed-vault").length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")),
      plates: document.querySelectorAll(".sl-biome-plate").length,
      sw: document.documentElement.scrollWidth,
    };
  });
  const label = `collection ${vp.width}`;
  ok(`${label}: 28 creatures in scenes`, st.scenes >= 28, String(st.scenes));
  ok(`${label}: 22 distinct public biomes + the sealed vault`, st.biomes.length === 23 && st.biomes.includes("sealed-vault"), st.biomes.length + "");
  ok(`${label}: the 6 classified slots use the sealed vault`, st.sealed === 6, String(st.sealed));
  ok(`${label}: no broken images`, st.broken.length === 0, st.broken.slice(0, 3).join(", "));
  ok(`${label}: 22 plates`, st.plates === 22, String(st.plates));
  ok(`${label}: scene assets requested are public species only`, scenes.every((u) => PUBLIC.some((id) => u.startsWith(`/scenes/${id}/`))), scenes.filter((u) => !PUBLIC.some((id) => u.startsWith(`/scenes/${id}/`))).slice(0, 3).join(", "));
  ok(`${label}: no horizontal overflow`, st.sw <= vp.width, String(st.sw));
  await p.screenshot({ path: `${out}/collection-${vp.width}.png` });

  // off screen holds still: no running animation inside an inactive scene
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(800);
  const anim = await p.evaluate(() => {
    let runningOff = 0;
    let runningOn = 0;
    for (const a of document.getAnimations()) {
      const t = a.effect?.target;
      const host = t?.closest?.(".sl-scene");
      if (!host || a.playState !== "running") continue;
      if (host.hasAttribute("data-active")) runningOn++;
      else runningOff++;
    }
    const active = document.querySelectorAll(".sl-scene[data-active]").length;
    return { runningOff, runningOn, active, total: document.querySelectorAll(".sl-scene").length };
  });
  ok(`${label}: scenes off screen hold still`, anim.runningOff === 0, JSON.stringify(anim));
  ok(`${label}: scenes on screen idle`, anim.runningOn > 0 && anim.active < anim.total, JSON.stringify(anim));
  await c.close();
}

// 2. Performance: what the scenes cost. Frame rate on a screen of idling Collection scenes,
//    against the same page with scene animation switched off (so the test measures the scenes,
//    not the machine: a headless browser without a GPU is slow for the whole site alike).
const fpsOf = (p) =>
  p.evaluate(
    () =>
      new Promise((resolve) => {
        const f = [];
        let last = performance.now();
        const end = last + 3000;
        const tick = (n) => {
          f.push(n - last);
          last = n;
          if (n < end) requestAnimationFrame(tick);
          else resolve(f.length / 3);
        };
        requestAnimationFrame(tick);
      }),
  );
for (const [label, opts, cpu] of [
  ["desktop", { viewport: { width: 1440, height: 900 } }, 1],
  ["phone, 4× CPU throttle", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 4],
]) {
  const runs = { on: [], off: [] };
  for (let i = 0; i < 2; i++) {
    for (const mode of ["off", "on"]) {
      const [c, p] = await ctx(opts);
      const cdp = await c.newCDPSession(p);
      await p.goto(`${B}/collection`, { waitUntil: "networkidle" });
      if (mode === "off") await p.addStyleTag({ content: ".sl-scene, .sl-scene * { animation: none !important; }" });
      await p.evaluate(() => window.scrollTo(0, 600));
      await p.waitForTimeout(1200);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      runs[mode].push(await fpsOf(p));
      await c.close();
    }
  }
  const avg = (a) => a.reduce((x, y) => x + y) / a.length;
  const on = avg(runs.on);
  const off = avg(runs.off);
  ok(`perf ${label}: idling scenes cost under 15% of the frame rate`, on >= off * 0.85, `${on.toFixed(1)} fps with scenes moving, ${off.toFixed(1)} still`);
}

// 3. Reduced motion: nothing in a scene moves, no particles.
{
  const [c, p] = await ctx({ reducedMotion: "reduce" });
  await p.goto(`${B}/collection?species=velynx`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const st = await p.evaluate(() => ({
    running: document.getAnimations().filter((a) => a.playState === "running" && a.effect?.target?.closest?.(".sl-scene")).length,
    motes: document.querySelectorAll(".sl-mote").length,
    parts: document.querySelectorAll(".sl-scene [data-part]").length,
    plates: document.querySelectorAll(".sl-biome-plate").length,
  }));
  ok("reduced motion: scenes hold still (no running animation, particles or parts)", st.running === 0 && st.motes === 0 && st.parts === 0, JSON.stringify(st));
  ok("reduced motion: biomes still show", st.plates > 0, String(st.plates));
  await c.close();
}

// 4. Every species' profile: its biome and idle at all four stages.
{
  const [c, p] = await ctx();
  const misses = [];
  let partsSeen = 0;
  for (const id of PUBLIC) {
    await p.goto(`${B}/collection?species=${id}`, { waitUntil: "networkidle" });
    const stages = p.locator('ol[aria-label="Evolution stages"] button');
    for (let i = 0; i < 4; i++) {
      await stages.nth(i).click();
      await p.waitForTimeout(250);
      const st = await p.evaluate(() => {
        const s = document.querySelector(".sl-scene-detail");
        const img = s?.querySelector(".sl-creature-img");
        return { biome: s?.dataset.biome, stage: s?.dataset.stage, body: s?.querySelector(".sl-idle")?.dataset.body, art: img?.getAttribute("src"), parts: s?.querySelectorAll("[data-part]").length ?? 0 };
      });
      partsSeen += st.parts;
      if (!st.biome || st.biome === "sealed-vault" || st.stage !== String(i) || !st.body || !st.art?.includes(`/creatures/${id}/${i + 1}-`)) misses.push(`${id}@${i + 1}:${JSON.stringify(st)}`);
    }
    if (["mossling", "cryovant", "velynx", "neonyx", "duskwing"].includes(id)) await p.locator(".sl-scene-detail").first().screenshot({ path: `${out}/detail-${id}-ascended.png` });
  }
  ok("profiles: 22 species × 4 stages each show their own biome, idle and stage art", misses.length === 0, misses.slice(0, 3).join(" | "));
  ok("profiles: anatomical parts animate in the detail view", partsSeen > 0, String(partsSeen));
  await c.close();
}

// 5. Homepage: the hero is untouched and the Market Bond plate stays quiet.
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const [c, p] = await ctx({ viewport: vp });
  await p.goto(`${B}/`, { waitUntil: "networkidle" });
  await scrollThrough(p);
  const st = await p.evaluate(() => {
    const hero = [...document.querySelectorAll("main section")].find((s) => s.querySelector("h1"));
    const market = document.querySelector("#market");
    const quiet = market?.querySelector(".sl-scene-quiet");
    return {
      heroScenes: hero?.querySelectorAll(".sl-scene").length ?? -1,
      quiet: !!quiet,
      quietMotion: quiet ? quiet.querySelectorAll(".sl-mote, [data-part]").length : -1,
      tickers: market?.querySelectorAll("[data-stage-ticker]").length ?? 0,
      sw: document.documentElement.scrollWidth,
    };
  });
  ok(`home ${vp.width}: no scene in the hero`, st.heroScenes === 0, String(st.heroScenes));
  ok(`home ${vp.width}: Market Bond plate is a quiet scene (no particles or parts)`, st.quiet && st.quietMotion === 0, JSON.stringify(st));
  ok(`home ${vp.width}: the stock section's four stage tickers are still there`, st.tickers === 4, String(st.tickers));
  ok(`home ${vp.width}: no horizontal overflow`, st.sw <= vp.width, String(st.sw));
  await p.locator("#market").screenshot({ path: `${out}/home-market-${vp.width}.png` });
  await c.close();
}

ok("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
await browser.close();
console.log(res.join("\n"));
const fails = res.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${res.length - fails}/${res.length} passed`);
process.exit(fails ? 1 : 0);
