// Browser checks for the Solanites site, against a running production build:
//
//   npm run build && npx next start -p 3100 &
//   node scripts/qa/phoenix-site.mjs <screenshot-dir> [base-url]
//
// The first-visit intro (switched off), the homepage awakening for returning visitors (interactive
// at once, waits for its image, fallbacks, reduced motion, no JavaScript), the approved art
// canon's presentation rules (W1–W2) on every route, media resolution, the sigil, the Hatchery
// chamber, the Collection bestiary, the hero at six widths, the main routes, Holder Rewards,
// navigation, transitions, history, overflow and console errors.
import { mkdirSync } from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

const out = process.argv[2] ?? "qa-shots";
const B = process.argv[3] ?? "http://localhost:3100";
mkdirSync(out, { recursive: true });
const res = [];
const errs = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
const browser = await chromium.launch();
// A returning visitor: the first-visit intro has been seen (src/components/intro/introState.ts).
const SEEN = `try{localStorage.setItem("solanites:intro:v1",JSON.stringify({seen:true,at:0}))}catch(e){}`;

async function ctx(opts = {}, init) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  if (init) await c.addInitScript(init);
  const p = await c.newPage();
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !/503|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  return [c, p];
}
const ROUTES_ALL = ["/", "/hatchery", "/collection", "/how-it-works", "/leaderboard", "/claims"];

// 0. The first-visit intro is switched off (owner decision, src/config/intro.ts): a first visit,
//    with or without reduced motion, lands straight on the Phoenix still and its headline. No
//    overlay, boot attribute, intro media request or replay button anywhere.
for (const opts of [{}, { reducedMotion: "reduce" }, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }]) {
  const label = opts.reducedMotion ? "reduced motion" : opts.viewport ? "390" : "1440";
  const [c, p] = await ctx(opts);
  const mediaReqs = [];
  p.on("request", (r) => /\.(mp4|webm|mov)(\?|$)|\/intro\//.test(r.url()) && mediaReqs.push(r.url()));
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({
    overlay: document.querySelectorAll(".sl-intro, [role='dialog']").length,
    boot: document.documentElement.hasAttribute("data-sl-intro"),
    video: document.querySelectorAll("video").length,
    still: !!document.querySelector(".sl-phx-art img"),
    art: getComputedStyle(document.querySelector(".sl-phx-art")).opacity,
    replay: [...document.querySelectorAll("button")].filter((b) => /intro/i.test(b.textContent ?? "")).length,
  }));
  ok(`intro off (${label}): a first visit opens straight on the Phoenix still`, st.overlay === 0 && !st.boot && st.video === 0 && st.still && st.art === "1", JSON.stringify(st));
  ok(`intro off (${label}): no intro video or poster requested`, mediaReqs.length === 0, mediaReqs.join(", "));
  ok(`intro off (${label}): headline in place`, (await p.locator("h1").innerText()).replace(/\s+/g, " ").trim().toUpperCase() === "A WORLD WAITING TO AWAKEN.");
  ok(`intro off (${label}): no replay-intro button`, st.replay === 0, String(st.replay));
  await p.screenshot({ path: `${out}/home-first-visit-${label.replace(/ /g, "-")}.png` });
  await p.goto(B + "/hatchery", { waitUntil: "networkidle" });
  ok(`intro off (${label}): none on the Hatchery either, and no replay link there`, (await p.locator(".sl-intro").count()) === 0 && (await p.getByRole("button", { name: /intro/i }).count()) === 0);
  await c.close();
}
{
  const [c, p] = await ctx();
  await p.goto(B + "/?intro=1", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  ok("intro off: ?intro=1 does not bring it back", (await p.locator(".sl-intro").count()) === 0);
  await c.close();
}

// 1. Homepage awakening for a returning visitor: usable at once, then awake once the image is ready.
{
  const [c, p] = await ctx({}, SEEN);
  const mediaReqs = [];
  p.on("request", (r) => /\.(mp4|webm|mov)(\?|$)|\/intro\//.test(r.url()) && mediaReqs.push(r.url()));
  await p.goto(B + "/", { waitUntil: "commit" });
  await p.waitForSelector("h1");
  ok("home, returning visitor: no intro overlay or video", (await p.locator('[role="dialog"]').count()) === 0 && (await p.locator("video").count()) === 0);
  ok("home: headline", (await p.locator("h1").innerText()).replace(/\s+/g, " ").trim().toUpperCase() === "A WORLD WAITING TO AWAKEN.");
  const t0 = Date.now();
  await p.getByRole("link", { name: /EXPLORE SOLANITES/ }).click({ timeout: 3000 });
  await p.waitForURL("**/collection");
  ok("home: Explore Solanites works immediately (no waiting for the animation)", Date.now() - t0 < 2500, `${Date.now() - t0} ms`);
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector("section[data-awake]") !== null, null, { timeout: 4000 }).catch(() => {});
  const st = await p.evaluate(() => ({ awake: !!document.querySelector("section[data-awake]"), art: getComputedStyle(document.querySelector(".sl-phx-art")).opacity, sigil: document.querySelectorAll("main .sl-sigil").length }));
  ok("home: awakens once the image has loaded", st.awake && st.art === "1", JSON.stringify(st));
  await p.screenshot({ path: `${out}/home-awake.png` });
  ok("home: sigil drawn beside the eyebrow", st.sigil >= 1);
  ok("home, returning visitor: no intro video requested", mediaReqs.length === 0, mediaReqs.join(", "));
  await p.getByRole("link", { name: /ENTER THE HATCHERY/ }).first().click();
  await p.waitForURL("**/hatchery");
  ok("home: Enter the Hatchery works", p.url().endsWith("/hatchery"));
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await c.route("**/hero/**", (r) => r.abort());
  await p.goto(B + "/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3000);
  const st = await p.evaluate(() => ({ awake: !!document.querySelector("section[data-awake]"), h1: document.querySelector("h1")?.getBoundingClientRect().height, sw: document.documentElement.scrollWidth }));
  ok("fallback: hero image missing → page still wakes, headline readable, no overflow", st.awake && st.h1 > 40 && st.sw <= 1440, JSON.stringify(st));
  await p.screenshot({ path: `${out}/home-image-missing.png` });
  await c.close();
}
{
  const [c, p] = await ctx({ reducedMotion: "reduce" }, SEEN);
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ art: getComputedStyle(document.querySelector(".sl-phx-art")).opacity, dawn: getComputedStyle(document.querySelector(".sl-phx-dawn")).display }));
  ok("reduced motion: awake frame at once (no dawn)", st.art === "1" && st.dawn === "none", JSON.stringify(st));
  await c.close();
}
{
  const [c, p] = await ctx({ javaScriptEnabled: false });
  await p.goto(B + "/", { waitUntil: "load" });
  const art = await p.evaluate(() => getComputedStyle(document.querySelector(".sl-phx-art")).opacity);
  ok("no JavaScript: the Phoenix still shows (noscript fallback)", art === "1", art);
  await c.close();
}

// 1b. Approved art canon, website rules W1–W2, as rendered: no ground shadow, floor, platform,
//     light shaft, motes, aura, rays, halo, nebula or glow blob under or behind any creature,
//     egg or the phoenix, and no coloured glow behind art on hover.
{
  const [c, p] = await ctx({}, SEEN);
  const PROHIBITED = [
    ".sl-aura", ".sl-halo", ".sl-backlight", ".sl-glitch-lines", ".sl-egg-halo", ".sl-rays",
    ".sl-chamber-floor", ".sl-chamber-shaft", ".sl-chamber-motes", ".sl-chamber-reflection",
    ".sl-portrait-cone", ".sl-portrait-floor", ".sl-phx-eclipse", ".sl-phx-glow", ".sl-phx-embers", ".sl-phx-current",
  ].join(",");
  for (const path of ["/", "/hatchery", "/collection", "/how-it-works", "/leaderboard"]) {
    await p.goto(B + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const st = await p.evaluate((sel) => {
      const art = [...document.querySelectorAll(".sl-creature, .sl-egg")];
      const shadows = document.querySelectorAll('.sl-creature ellipse[cx="200"][cy="376"], .sl-egg ellipse[cx="150"][cy="364"]').length;
      // a blurred blob (blur of 40 px or more) placed beside artwork in the same container
      const blobs = new Set();
      for (const a of art) {
        let host = a.parentElement;
        for (let up = 0; up < 4 && host; up++, host = host.parentElement) {
          for (const sib of host.children) {
            const m = getComputedStyle(sib).filter.match(/blur\((\d+(?:\.\d+)?)px\)/);
            if (m && parseFloat(m[1]) >= 40 && !sib.contains(a)) blobs.add(sib.className || sib.tagName);
          }
        }
      }
      return { art: art.length, prohibited: [...document.querySelectorAll(sel)].map((e) => e.getAttribute("class")), shadows, blobs: [...blobs] };
    }, PROHIBITED);
    ok(`canon ${path}: no prohibited ornaments around artwork`, st.prohibited.length === 0, st.prohibited.slice(0, 4).join(" | "));
    ok(`canon ${path}: no ground shadow under creatures or eggs (${st.art} artworks)`, st.shadows === 0, String(st.shadows));
    ok(`canon ${path}: no glow blobs behind artwork`, st.blobs.length === 0, st.blobs.join(" | "));
  }
  await p.goto(B + "/collection", { waitUntil: "networkidle" });
  const plate = p.locator("main button.sl-plate").first();
  await plate.hover();
  await p.waitForTimeout(450);
  const hover = await plate.evaluate((e) => getComputedStyle(e.querySelector(".sl-art-host")).filter);
  ok("canon: no coloured glow behind art on hover", !/drop-shadow/.test(hover), hover);
  await c.close();
}

// 1b. Market Bond: the stock feature directly after the hero, from the stock service, honest about data.
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const [c, p] = await ctx({ viewport: vp }, SEEN);
  const market = [];
  p.on("response", (r) => r.url().includes("/api/market/") && market.push(`${r.status()} ${new URL(r.url()).pathname}`));
  await p.goto(B + "/", { waitUntil: "networkidle" });
  const order = await p.evaluate(() => {
    const sections = [...document.querySelectorAll("main section")];
    const hero = sections.findIndex((x) => x.querySelector("h1"));
    return { hero, next: sections[hero + 1]?.id ?? null };
  });
  ok(`market ${vp.width}: the Market Bond section comes directly after the hero`, order.next === "market", JSON.stringify(order));
  await p.locator("#market").scrollIntoViewIfNeeded();
  await p.waitForSelector('[data-testid="market-status"]', { timeout: 8000 }).catch(() => {});
  const st = await p.evaluate(() => {
    const m = document.querySelector("#market");
    const tickers = [...m.querySelectorAll("[data-stage-ticker]")].map((e) => e.textContent.trim());
    return {
      height: m.getBoundingClientRect().height,
      headline: m.querySelector("h2")?.textContent ?? "",
      chip: m.querySelector('[data-testid="ticker-chip"]')?.textContent.trim(),
      tickers,
      status: m.querySelector('[data-testid="market-status"]')?.textContent.trim(),
      chart: m.querySelectorAll("svg[aria-label*='closing prices']").length,
      noChart: !!m.querySelector('[data-testid="market-no-chart"]'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      creature: m.querySelectorAll(".sl-creature").length,
    };
  });
  ok(`market ${vp.width}: a substantial section with a creature and the headline`, st.height > 700 && /real company/.test(st.headline) && st.creature >= 5, JSON.stringify({ h: st.height, creature: st.creature }));
  ok(`market ${vp.width}: ticker comes from /api/market and is the same at all four stages`, /^[A-Z]{1,5}$/.test(st.chip) && st.tickers.length === 4 && st.tickers.every((t) => t === st.chip) && market.some((m) => m.startsWith("200 /api/market/")), JSON.stringify({ chip: st.chip, tickers: st.tickers, market }));
  ok(`market ${vp.width}: data labelled by the service; no chart without data`, st.status === "Unavailable" ? st.chart === 0 && st.noChart : st.status === "Sample data" || st.status === "Previous close" || st.status === "Delayed 15 min" || st.status === "Stale data", JSON.stringify(st));
  ok(`market ${vp.width}: no horizontal scroll`, st.overflow <= 0, String(st.overflow));
  await p.locator("#market").screenshot({ path: `${out}/market-${vp.width}.png` });
  // pick another creature: the ticker changes, and still matches across stages
  await p.locator('#market [role="radio"]').nth(1).click();
  await p.waitForFunction((prev) => document.querySelector('#market [data-testid="ticker-chip"]')?.textContent.trim() !== prev, st.chip, { timeout: 8000 }).catch(() => {});
  const second = await p.evaluate(() => ({ chip: document.querySelector('#market [data-testid="ticker-chip"]')?.textContent.trim(), tickers: [...document.querySelectorAll("#market [data-stage-ticker]")].map((e) => e.textContent.trim()) }));
  ok(`market ${vp.width}: another creature shows its own stock, the same at every stage`, second.chip !== st.chip && second.tickers.every((t) => t === second.chip), JSON.stringify(second));
  if (vp.width === 1440) {
    await p.locator("#market a", { hasText: /PROFILE/ }).click();
    await p.waitForURL("**/collection?species=*");
    const panel = await p.waitForSelector('[aria-label="Solanite details"] section[aria-label*="stock linked"]', { timeout: 8000 }).then(() => true).catch(() => false);
    ok("market: the profile link opens that creature in the Collection with its stock panel", panel);
    await p.screenshot({ path: `${out}/collection-detail-stock.png` });
  }
  await c.close();
}

// 2. Media resolution in the browser (returning visitor): no video on any route; every raster
//    image's native size recorded. The intro video is switched off (section 0 checks that it is never requested).
{
  const [c, p] = await ctx({}, SEEN);
  const found = [];
  for (const path of ROUTES_ALL) {
    await p.goto(B + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    // naturalWidth is density-corrected for srcset images, so decode each served file on its own to read its real pixels
    const m = await p.evaluate(async () => ({
      videos: document.querySelectorAll("video").length,
      imgs: await Promise.all(
        [...document.querySelectorAll("img")]
          .filter((i) => i.currentSrc && !i.currentSrc.startsWith("data:"))
          .map(async (i) => {
            const probe = new Image();
            probe.src = i.currentSrc;
            await probe.decode().catch(() => {});
            return { src: i.currentSrc.split("/").pop(), creature: new URL(i.currentSrc).pathname.startsWith("/creatures/"), w: probe.naturalWidth, h: probe.naturalHeight };
          }),
      ),
    }));
    found.push(...m.imgs.map((i) => ({ ...i, path })));
    ok(`media ${path}: no video elements`, m.videos === 0);
  }
  // Creature paintings follow their own delivery spec (1024 × 1024, art canon C12; shown at most ~520 CSS px);
  // every other raster image (the Phoenix still and any page media) must be at least 1080 px.
  const small = found.filter((i) => Math.min(i.w, i.h) < (i.creature ? 1024 : 1080));
  ok("media: page images at least 1080 px and creature paintings at least 1024 px on the short edge", small.length === 0, (small.length ? small : found).map((i) => `${i.path} ${i.src} ${i.w}x${i.h}`).join("; "));
  await c.close();
}

// 3. Hatchery chamber and Collection bestiary.
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/hatchery", { waitUntil: "networkidle" });
  ok("hatchery: chamber presents the egg", (await p.locator(".sl-chamber .sl-chamber-egg svg").count()) >= 1);
  ok("hatchery: address field and demo still there", (await p.getByPlaceholder(/public address/i).count()) === 1 && (await p.getByRole("button", { name: /EXPLORE THE DEMO/i }).count()) === 1);
  await p.screenshot({ path: `${out}/hatchery-chamber.png` });
  await p.goto(B + "/collection", { waitUntil: "networkidle" });
  const plates = await p.locator("main button.sl-plate").count();
  ok("collection: 28 bestiary plates", plates === 28, String(plates));
  ok("collection: rarity tier pips on every plate", (await p.locator("main button.sl-plate .sl-pip").count()) === 28 * 6);
  await p.getByRole("button", { name: "Mythic", exact: true }).click();
  await p.waitForTimeout(300);
  const mythic = await p.locator("main button.sl-plate").count();
  ok("collection: rarity filter still filters", mythic > 0 && mythic < 28, String(mythic));
  await p.getByRole("button", { name: "All", exact: true }).click();
  // Tab like a keyboard user (programmatic focus doesn't show the keyboard focus ring)
  await p.locator("main h1").click();
  let outline = "none";
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    const st = await p.evaluate(() => ({ plate: document.activeElement?.classList.contains("sl-plate"), outline: getComputedStyle(document.activeElement).outlineStyle }));
    if (st.plate) {
      outline = st.outline;
      break;
    }
  }
  ok("collection: plates show a visible keyboard focus", outline !== "none", outline);
  await c.close();
}

// 4. The Phoenix hero across widths.
for (const [name, vp, mobile] of [
  ["320", { width: 320, height: 640 }, true],
  ["390", { width: 390, height: 844 }, true],
  ["768", { width: 768, height: 1024 }, true],
  ["1024", { width: 1024, height: 768 }, false],
  ["1440", { width: 1440, height: 900 }, false],
  ["1920", { width: 1920, height: 1080 }, false],
]) {
  const [c, p] = await ctx({ viewport: vp, isMobile: mobile, hasTouch: mobile }, SEEN);
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const img = await p.evaluate(async () => {
    const i = document.querySelector(".sl-phx img");
    const r = i.getBoundingClientRect();
    const probe = new Image();
    probe.src = i.currentSrc;
    await probe.decode().catch(() => {});
    // object-fit: cover — the drawn width is the larger of the box width and its height × the image's aspect
    const drawn = Math.max(r.width, r.height * (probe.naturalWidth / probe.naturalHeight)) * devicePixelRatio;
    return { loaded: i.complete && i.naturalWidth > 0, src: i.currentSrc.split("/").pop(), file: [probe.naturalWidth, probe.naturalHeight], enlargement: drawn / probe.naturalWidth, top: r.top, bottom: r.bottom, w: r.width };
  });
  ok(`hero ${name}: native Phoenix still served (2752 × 1536 set)`, img.loaded && /phoenix-still-2752-(2000|2752)\.(avif|webp|jpg)$/.test(img.src), img.src);
  ok(`hero ${name}: the still is never enlarged at standard density`, img.enlargement <= 1.0001, `${img.src} ${img.file.join("×")} drawn at ${img.enlargement.toFixed(2)}×`);
  ok(`hero ${name}: old cartoon hero gone`, (await p.locator('[data-testid="hero-caption"]').count()) === 0);
  const cta = await p.getByRole("link", { name: /ENTER THE HATCHERY/ }).first().boundingBox();
  ok(`hero ${name}: Enter the Hatchery visible`, cta && cta.width > 0, cta ? `bottom ${Math.round(cta.y + cta.height)} / ${vp.height}` : "missing");
  if (vp.width >= 390) ok(`hero ${name}: Enter the Hatchery within the first screen`, cta.y + cta.height <= vp.height);
  const pill = await p.getByText("No wallet needed to explore.").boundingBox();
  ok(`hero ${name}: walletless message near the CTA`, pill && Math.abs(cta.y - (pill.y + pill.height)) < 200, `${Math.round(cta.y - pill.y)}px`);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(`hero ${name}: no horizontal overflow`, sw <= vp.width, String(sw));
  // contrast: the headline sits on a dark backdrop (sample the hero shade under the h1)
  await p.screenshot({ path: `${out}/home-${name}.png` });
  await p.screenshot({ path: `${out}/home-${name}-full.png`, fullPage: true });
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/");
  await p.getByRole("link", { name: /ENTER THE HATCHERY/ }).first().click();
  await p.waitForURL("**/hatchery");
  ok("hero: Enter the Hatchery navigates", p.url().endsWith("/hatchery"));
  await p.goto(B + "/");
  await p.getByRole("link", { name: /EXPLORE SOLANITES/ }).click();
  await p.waitForURL("**/collection");
  ok("hero: Explore Solanites navigates", p.url().endsWith("/collection"));
  await c.close();
}
{
  const [c, p] = await ctx({ reducedMotion: "reduce" }, SEEN);
  await p.goto(B + "/");
  await p.waitForTimeout(600);
  const anim = await p.evaluate(() => ({ breathe: getComputedStyle(document.querySelector(".sl-phx-breathe")).animationName, dawn: getComputedStyle(document.querySelector(".sl-phx-dawn")).display, art: getComputedStyle(document.querySelector(".sl-phx-art")).opacity }));
  ok("hero: reduced motion stops the breath and the dawn, and shows the art at once", anim.breathe === "none" && anim.dawn === "none" && anim.art === "1", JSON.stringify(anim));
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/");
  await p.waitForTimeout(3200);
  const hero = await p.evaluate(() => ({
    pulse: document.querySelectorAll(".sl-phx-pulse").length,
    art: getComputedStyle(document.querySelector(".sl-phx-art")).opacity,
    dawn: getComputedStyle(document.querySelector(".sl-phx-dawn")).opacity,
    sheets: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /sl-phx-pulse/.test(r.cssText)); } catch { return false; } }),
  }));
  ok("hero: no ignition pulse element or rule; after the awakening the art rests fully visible", hero.pulse === 0 && !hero.sheets && hero.art === "1" && hero.dawn === "0", JSON.stringify(hero));
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/");
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo(0, 3000));
  // IntersectionObserver reports asynchronously; wait for it rather than a fixed delay.
  const paused = await p.waitForFunction(() => document.querySelector("section[data-offscreen]") !== null, null, { timeout: 3000 }).then(() => true, () => false);
  ok("hero: animations pause while scrolled away", paused);
  await c.close();
}

// 5. Main routes still load without errors (no wallet connected).
{
  const [c, p] = await ctx({}, SEEN);
  for (const path of ["/", "/hatchery", "/collection", "/how-it-works", "/leaderboard", "/claims", "/api/health", "/api/claims/status"]) {
    const r = await p.goto(B + path, { waitUntil: "networkidle" });
    ok(`route ${path} → ${r.status()}`, r.status() === 200);
  }
  await p.goto(B + "/collection", { waitUntil: "networkidle" });
  await p.locator("main button").filter({ hasText: "Mossling" }).first().click();
  await p.waitForTimeout(500);
  ok("collection: creature detail opens", await p.getByRole("dialog").isVisible().catch(() => false));
  await c.close();
}

// 6. Holder rewards (/claims): the planned distribution, readable on desktop and phones.
for (const [name, vp, mobile] of [["1440", { width: 1440, height: 900 }, false], ["390", { width: 390, height: 844 }, true], ["320", { width: 320, height: 640 }, true]]) {
  const [c, p] = await ctx({ viewport: vp, isMobile: mobile, hasTouch: mobile }, SEEN);
  await p.goto(B + "/claims", { waitUntil: "networkidle" });
  const main = (await p.locator("main").innerText()).replace(/\s+/g, " ");
  ok(`rewards ${name}: heading and two-hour rule`, (await p.locator("h1").innerText()).replace(/\s+/g, " ").trim() === "Locked developer supply returns to holders." && main.includes("Two hours after launch, the locked developer supply will be divided equally among eligible holders."));
  ok(`rewards ${name}: clock is the launch, not the visit`, main.includes("It does not depend on when you visit this page."));
  ok(`rewards ${name}: status and pending terms`, /scheduled after launch/i.test(main) && (main.match(/\bPENDING\b/gi) ?? []).length === 3);
  ok(`rewards ${name}: no refund wording or claim action`, !/refund|fee claim/i.test(main) && (await p.locator("main button, main form").count()) === 0);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(`rewards ${name}: no horizontal overflow`, sw <= vp.width, String(sw));
  const h = await p.getByText("+2h").boundingBox();
  ok(`rewards ${name}: +2h timing at the top of the page`, h && h.y + h.height <= vp.height * 1.15, h ? `bottom ${Math.round(h.y + h.height)} / ${vp.height}` : "missing");
  await p.screenshot({ path: `${out}/rewards-${name}.png`, fullPage: true });
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/");
  ok("nav: Rewards link goes to the holder rewards page", (await p.locator("header").getByRole("link", { name: "Rewards", exact: true }).count()) >= 1);
  await p.goto(B + "/claims");
  ok("footer: Holder Rewards link", (await p.locator("footer").getByRole("link", { name: "Holder Rewards" }).count()) === 1);
  await c.close();
}

// 7. Site-wide overhaul: stable backdrop, page transitions, sliding nav indicator, history.
const ROUTES = [["/hatchery", "Hatchery"], ["/collection", "Collection"], ["/how-it-works", "How It Works"], ["/leaderboard", "Leaderboard"], ["/claims", "Rewards"]];
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/", { waitUntil: "networkidle" });
  ok("backdrop: rendered behind the page", (await p.locator(".sl-cosmos").count()) === 1);
  await p.evaluate(() => { document.querySelector(".sl-cosmos").dataset.qaMark = "kept"; });
  const xs = [];
  for (const [path, label] of ROUTES) {
    await p.locator("header").getByRole("link", { name: label, exact: true }).first().click();
    await p.waitForURL("**" + path);
    // Let the indicator finish sliding or fading in before sampling it.
    await p.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="nav-indicator"]')).opacity === "1", null, { timeout: 2000 }).catch(() => {});
    await p.waitForTimeout(350);
    const st = await p.evaluate(() => {
      const ind = document.querySelector('[data-testid="nav-indicator"]');
      const cur = document.querySelector('header a[aria-current="page"]');
      return { kept: document.querySelector(".sl-cosmos")?.dataset.qaMark === "kept", backdrops: document.querySelectorAll(".sl-cosmos").length, transitions: Number(document.querySelector("[data-page-transition]")?.dataset.transitions ?? 0), x: ind ? new DOMMatrix(getComputedStyle(ind).transform).m41 : null, on: ind ? getComputedStyle(ind).opacity : null, current: cur?.textContent?.trim() };
    });
    xs.push(st.x);
    ok(`nav ${label}: client navigation keeps the same backdrop (no remount)`, st.kept && st.backdrops === 1);
    ok(`nav ${label}: page transition played`, st.transitions === xs.length, `${st.transitions} transitions after ${xs.length} navigations`);
    ok(`nav ${label}: indicator visible and marks the current link`, st.on === "1" && st.current === label, `${st.current} opacity ${st.on}`);
  }
  ok("nav: indicator moves between links", new Set(xs.map((x) => Math.round(x))).size === ROUTES.length, xs.map((x) => Math.round(x)).join(","));
  await p.goBack();
  await p.waitForURL("**/leaderboard");
  ok("history: back returns to the previous page", (await p.locator("h1").first().innerText()).includes("Leaderboard"));
  await p.goForward();
  await p.waitForURL("**/claims");
  ok("history: forward works", (await p.locator("h1").first().innerText()).includes("Locked developer supply"));
  await p.reload({ waitUntil: "networkidle" });
  ok("history: refresh keeps the page", (await p.locator("h1").first().innerText()).includes("Locked developer supply"));
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  ok("nav: indicator hidden on the homepage", (await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid="nav-indicator"]')).opacity)) === "0");
  await c.close();
}
for (const [name, vp, mobile] of [["320", { width: 320, height: 640 }, true], ["390", { width: 390, height: 844 }, true], ["1440", { width: 1440, height: 900 }, false]]) {
  const [c, p] = await ctx({ viewport: vp, isMobile: mobile, hasTouch: mobile }, SEEN);
  for (const [path] of [["/"], ...ROUTES]) {
    const r = await p.goto(B + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(350);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(`layout ${name} ${path}: loads directly, no horizontal overflow`, r.status() === 200 && sw <= vp.width, `${r.status()} / ${sw}`);
    const clash = await p.evaluate(() => {
      const r = (el) => el?.getBoundingClientRect();
      const logo = r(document.querySelector('header a[aria-label="Solanites home"]'));
      const right = [...document.querySelectorAll("header nav > div:last-child > *")].map(r).filter((b) => b && b.width > 0);
      return right.some((b) => logo && b.left < logo.right - 0.5);
    });
    ok(`layout ${name} ${path}: header logo and buttons don't overlap`, !clash);
    if (name !== "1440" || path !== "/") await p.screenshot({ path: `${out}/page-${name}${path === "/" ? "-home" : path.replace(/\//g, "-")}.png` });
  }
  await c.close();
}
{
  const [c, p] = await ctx({ reducedMotion: "reduce" }, SEEN);
  await p.goto(B + "/collection", { waitUntil: "networkidle" });
  const rm = await p.evaluate(() => ({ stars: getComputedStyle(document.querySelector(".sl-cosmos-stars")).animationName, glints: getComputedStyle(document.querySelector(".sl-cosmos-glints")).animationName, embers: document.querySelectorAll(".sl-cosmos-embers").length, realm: getComputedStyle(document.querySelector(".sl-realm-gold")).animationName }));
  ok("reduced motion: backdrop still, no embers", rm.stars === "none" && rm.glints === "none" && rm.embers === 0, JSON.stringify(rm));
  await c.close();
}

await browser.close();
ok("no page errors or console errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(res.join("\n"));
const fails = res.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${res.length - fails}/${res.length} passed`);
process.exit(fails ? 1 : 0);
