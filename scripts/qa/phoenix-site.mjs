// Browser checks for the phoenix video intro and the phoenix homepage hero, against a running
// production build:
//
//   npm run build && npx next start -p 3100 &
//   node scripts/qa/phoenix-site.mjs <screenshot-dir> [base-url]
//
// Plays the real intro files (desktop and phone), and checks skip, Escape, Enter the Hatchery,
// sound, repeat visits, the fallback when playback is blocked or the files are missing,
// reduced motion, the hero at several widths, and the main routes.
import { mkdirSync } from "node:fs";
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));

const out = process.argv[2] ?? "qa-shots";
const B = process.argv[3] ?? "http://localhost:3100";
mkdirSync(out, { recursive: true });
const res = [];
const errs = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
const browser = await chromium.launch();
const SEEN = () => localStorage.setItem("solanites:intro:v1", '{"seen":true}');

async function ctx(opts = {}, init) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  if (init) await c.addInitScript(init);
  const p = await c.newPage();
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !/503|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  return [c, p];
}
const dialog = (p) => p.locator('[role="dialog"][aria-labelledby="sl-intro-title"]');
const video = (p) =>
  p.evaluate(() => {
    const v = document.querySelector('[data-testid="phoenix-video"]');
    return v && { paused: v.paused, t: +v.currentTime.toFixed(2), d: +v.duration.toFixed(2), muted: v.muted, controls: v.controls, src: v.currentSrc.split("/").pop(), w: v.videoWidth, h: v.videoHeight, ready: v.readyState };
  });

// 1. Desktop: the real 16:9 intro plays to the end and hands over to the homepage.
{
  const [c, p] = await ctx();
  await p.goto(B + "/");
  await p.waitForTimeout(1200);
  ok("desktop: video intro is the default on a first visit", (await p.locator('[data-intro-variant="video"]').count()) === 1);
  const v1 = await video(p);
  ok("desktop: plays the 16:9 WebM, muted, no controls", v1 && !v1.paused && v1.t > 0 && v1.muted && !v1.controls && v1.src === "phoenix-16x9.webm" && v1.w === 1280, JSON.stringify(v1));
  ok("desktop: Skip and Enter the Hatchery visible during playback", (await p.getByRole("button", { name: "Skip intro" }).isVisible()) && (await p.getByRole("button", { name: /ENTER THE HATCHERY/ }).isVisible()));
  ok("desktop: page behind is inert", (await p.locator("body > main[inert]").count()) === 1);
  await p.screenshot({ path: `${out}/intro-desktop-01-awakening.png` });
  await p.waitForTimeout(3000);
  const v2 = await video(p);
  ok("desktop: playback advances in real time", v2.t - v1.t > 2.4, `${v1.t}s → ${v2.t}s`);
  await p.screenshot({ path: `${out}/intro-desktop-02-reveal.png` });
  await p.waitForFunction(() => document.querySelector('[data-testid="phoenix-video"]')?.currentTime > 10.5, null, { timeout: 15000 });
  await p.screenshot({ path: `${out}/intro-desktop-03-burst.png` });
  await p.waitForFunction(() => document.querySelector('[data-testid="phoenix-video"]')?.currentTime > 15.6, null, { timeout: 15000 });
  await p.screenshot({ path: `${out}/intro-desktop-04-wordmark.png` });
  const end = Date.now();
  await dialog(p).waitFor({ state: "detached", timeout: 8000 }).catch(() => {});
  ok("desktop: hands over to the homepage after the video ends", !(await dialog(p).isVisible()), `${Date.now() - end} ms after the wordmark frame`);
  ok("desktop: homepage interactive after the intro", (await p.locator("body > main[inert]").count()) === 0 && (await p.locator("h1").first().innerText()).replace(/\s+/g, " ").trim() === "YOUR SOLANITE IS WAITING.");
  await p.screenshot({ path: `${out}/intro-desktop-05-handover.png` });
  await p.reload();
  await p.waitForTimeout(900);
  ok("desktop: not shown again on a repeat visit", !(await dialog(p).isVisible()) && (await p.locator('[data-testid="phoenix-video"]').count()) === 0);
  await c.close();
}

// 2. Phone: the 9:16 cut plays; Skip closes it; repeat visit goes straight to the page.
{
  const [c, p] = await ctx({ ...devices["iPhone 13"], defaultBrowserType: undefined });
  await p.goto(B + "/");
  await p.waitForTimeout(1500);
  const v = await video(p);
  ok("phone: plays the 9:16 cut", v && !v.paused && v.t > 0 && v.src === "phoenix-9x16.webm" && v.h === 1280, JSON.stringify(v));
  await p.waitForFunction(() => document.querySelector('[data-testid="phoenix-video"]')?.currentTime > 8, null, { timeout: 15000 });
  await p.screenshot({ path: `${out}/intro-phone-01-phoenix.png` });
  await p.waitForFunction(() => document.querySelector('[data-testid="phoenix-video"]')?.currentTime > 15.6, null, { timeout: 15000 });
  await p.screenshot({ path: `${out}/intro-phone-02-wordmark.png` });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok("phone: no horizontal overflow during the intro", sw <= 390, String(sw));
  await p.getByRole("button", { name: "Skip intro" }).tap();
  await p.waitForTimeout(900);
  ok("phone: Skip closes the intro", !(await dialog(p).isVisible()));
  await p.screenshot({ path: `${out}/home-phone-after-skip.png` });
  await p.reload();
  await p.waitForTimeout(900);
  ok("phone: not shown again on a repeat visit", !(await dialog(p).isVisible()));
  await c.close();
}

// 3. Skip, Escape and Enter the Hatchery work mid-video; sound toggles.
{
  const [c, p] = await ctx();
  await p.goto(B + "/");
  await p.waitForTimeout(1500);
  const sound = p.getByRole("button", { name: "Sound on" });
  ok("sound: starts muted with a Sound on control", (await sound.isVisible()) && (await video(p)).muted);
  await sound.click();
  ok("sound: Sound on unmutes and the label flips", !(await video(p)).muted && (await p.getByRole("button", { name: "Sound off" }).isVisible()));
  await p.getByRole("button", { name: "Skip intro" }).click();
  await p.waitForTimeout(900);
  ok("skip: Skip intro closes it mid-video", !(await dialog(p).isVisible()));
  await c.close();
}
{
  const [c, p] = await ctx();
  await p.goto(B + "/");
  await p.waitForTimeout(1500);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(900);
  ok("skip: Escape closes it mid-video", !(await dialog(p).isVisible()));
  await c.close();
}
{
  const [c, p] = await ctx();
  await p.goto(B + "/");
  await p.waitForTimeout(1500);
  await p.getByRole("button", { name: /ENTER THE HATCHERY/ }).click();
  await p.waitForURL("**/hatchery", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(900);
  ok("enter: Enter the Hatchery mid-video goes to the Hatchery", p.url().endsWith("/hatchery") && !(await dialog(p).isVisible()), p.url());
  await c.close();
}

// 4. Fallbacks: missing files, blocked autoplay, reduced motion.
{
  const [c, p] = await ctx();
  await c.route("**/intro/phoenix-*", (r) => r.abort());
  await p.goto(B + "/");
  await p.waitForTimeout(5500);
  ok("fallback: missing video files → animated intro", (await dialog(p).isVisible()) && (await p.locator('[data-intro-variant="video"]').count()) === 0 && (await p.locator(".sl-intro-creature").count()) === 1);
  await p.getByRole("button", { name: "Skip intro" }).click();
  await p.waitForTimeout(900);
  ok("fallback: Skip works on the animated intro", !(await dialog(p).isVisible()));
  await c.close();
}
{
  const [c, p] = await ctx({}, () => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("blocked", "NotAllowedError"));
  });
  await p.goto(B + "/");
  await p.waitForTimeout(800);
  ok("fallback: autoplay blocked → animated intro at once", (await dialog(p).isVisible()) && (await p.locator(".sl-intro-creature").count()) === 1);
  await c.close();
}
{
  const [c, p] = await ctx({ reducedMotion: "reduce" });
  await p.goto(B + "/");
  await p.waitForTimeout(800);
  ok("reduced motion: still animated-intro frame, no video", (await dialog(p).isVisible()) && (await p.locator('[data-testid="phoenix-video"]').count()) === 0);
  await c.close();
}

// 5. The phoenix hero across widths (intro already seen).
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
  const img = await p.evaluate(() => {
    const i = document.querySelector(".sl-phx img");
    const r = i.getBoundingClientRect();
    return { loaded: i.complete && i.naturalWidth > 0, src: i.currentSrc.split("/").pop(), top: r.top, bottom: r.bottom, w: r.width };
  });
  ok(`hero ${name}: realistic phoenix image loaded`, img.loaded && /phoenix-(1200|2000)\.webp/.test(img.src), img.src);
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
  await p.getByRole("link", { name: "Explore the Collection" }).click();
  await p.waitForURL("**/collection");
  ok("hero: Explore the Collection navigates", p.url().endsWith("/collection"));
  await c.close();
}
{
  const [c, p] = await ctx({ reducedMotion: "reduce" }, SEEN);
  await p.goto(B + "/");
  await p.waitForTimeout(600);
  const anim = await p.evaluate(() => ({ breathe: getComputedStyle(document.querySelector(".sl-phx-breathe")).animationName, embers: getComputedStyle(document.querySelector(".sl-phx-embers")).display }));
  ok("hero: reduced motion stops the breath and hides embers", anim.breathe === "none" && anim.embers === "none", JSON.stringify(anim));
  await c.close();
}
{
  const [c, p] = await ctx({}, SEEN);
  await p.goto(B + "/");
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo(0, 3000));
  await p.waitForTimeout(600);
  ok("hero: animations pause while scrolled away", await p.evaluate(() => document.querySelector("section[data-offscreen]") !== null));
  await c.close();
}

// 6. Main routes still load without errors (no wallet connected).
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
  await p.goto(B + "/claims", { waitUntil: "networkidle" });
  ok("claims: explains its wallet requirement", /wallet/i.test(await p.locator("main").innerText()));
  await c.close();
}

await browser.close();
ok("no page errors or console errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(res.join("\n"));
const fails = res.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${res.length - fails}/${res.length} passed`);
process.exit(fails ? 1 : 0);
