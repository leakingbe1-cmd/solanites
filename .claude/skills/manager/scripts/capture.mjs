#!/usr/bin/env node
// Manager capture: everything the reviewer must LOOK AT, written to one review folder. It does not judge.
//
//   node capture.mjs --url https://preview.example --out qa-out/manager/2026-11-06-2300
//   node capture.mjs --dir dist --out review/               (serves a static folder on a free local port)
//   options: --pages /,/contact/   --max-pages 12   --browsers chromium,webkit   --widths 390,1440   --no-wow
//            --wait 800 (ms to let entrance motion settle)   --max-images 80   --ignore-console regex,regex
//
// Writes:  pages/<slug>-<w>-view.png (first screen), pages/<slug>-<w>-full.png (whole page), pages/<slug>-390-menu.png,
//          images/NN-<slug>.png (every <img> and background image, one by one, at phone width), wow/frame-SS.png +
//          wow/first-10s.webm (the first ten seconds on a phone), contact-sheet.png + index.html (all of it on one page),
//          findings.md (what the scripts found: console errors, sideways scroll, broken, upscaled or stretched images,
//          overlapping text, small tap targets, placeholder text, login wall), capture.json (the same, as data).
// The pictures still have to be opened and looked at, one by one. That is the reviewer's job, not this script's.
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync, renameSync, readdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { createServer } from 'node:http';
import { loadPlaywright, launchOptions } from './pw.mjs';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (n) => argv.includes(`--${n}`);
let ORIGIN = (arg('url', '') || '').replace(/\/$/, '');
const DIR = arg('dir', '');
const OUT = resolve(arg('out', join('qa-out', 'manager', stamp())));
const MAX_PAGES = +arg('max-pages', 12);
const MAX_IMAGES = +arg('max-images', 80);
const BROWSERS = arg('browsers', 'chromium').split(',');
const WIDTHS = arg('widths', '390,1440').split(',').map(Number);
const WAIT = +arg('wait', 800);
const IGNORE = new RegExp(['favicon', 'ERR_BLOCKED_BY_CLIENT', ...(arg('ignore-console', '') ? arg('ignore-console').split(',') : [])].join('|'), 'i');
const GIVEN_PAGES = arg('pages', '') ? arg('pages').split(',') : null;
if (!ORIGIN && !DIR) { console.error('usage: capture.mjs (--url URL | --dir folder) [--out folder] [--pages /,/a/] [--browsers chromium,webkit,firefox] [--no-wow]'); process.exit(2); }

function stamp() { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; }
const slug = (p) => (p.replace(/^https?:\/\/[^/]+/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home').slice(0, 60);
const rel = (p) => p.replace(OUT, '').replace(/^[\\/]/, '').replace(/\\/g, '/');
for (const d of ['pages', 'images', 'wow']) mkdirSync(join(OUT, d), { recursive: true });

// ---- optional static server (for dist/, proto/, a built folder) -------------------------------------------------
let server;
if (DIR) {
  const root = resolve(DIR);
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
  server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const tries = [p, join(p, 'index.html'), `${p}.html`, `${p}/index.html`];
    for (const t of tries) {
      const f = join(root, t);
      if (!f.startsWith(root)) break;
      if (existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { 'content-type': types[extname(f).toLowerCase()] || 'application/octet-stream' }); res.end(readFileSync(f)); return; }
    }
    res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  ORIGIN = `http://127.0.0.1:${server.address().port}`;
  console.log(`serving ${root} at ${ORIGIN}`);
}

const pw = loadPlaywright();
const data = { origin: ORIGIN, source: DIR ? `static folder ${resolve(DIR)}` : ORIGIN, started: new Date().toISOString(), loginWall: null, pages: [], images: [], wow: null, browsers: BROWSERS, widths: WIDTHS, notes: [] };
const findings = []; // { kind, where, detail }
const note = (kind, where, detail) => findings.push({ kind, where, detail });

// ---- login wall / reachability --------------------------------------------------------------------------------
async function probe(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  let res;
  try { res = await page.goto(ORIGIN + '/', { waitUntil: 'load', timeout: 45000 }); } catch (e) { await ctx.close(); return { ok: false, reason: `did not load: ${e.message.split('\n')[0]}` }; }
  await page.waitForTimeout(1200);
  const status = res ? res.status() : 0;
  const url = page.url();
  const text = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 4000);
  const hasPassword = await page.locator('input[type=password]').count();
  const wall = status === 401 || status === 403
    || /\/login|\/signin|\/sign-in|sso\.vercel|vercel\.com\/sso|accounts\.google|claude\.ai\/login|auth0|okta/i.test(url)
    || (hasPassword > 0 && /sign in|log in|password|authentication required|protected/i.test(text))
    || /Authentication Required|This deployment is protected|Log in to Vercel|Sign in to continue/i.test(text);
  await ctx.close();
  if (wall) return { ok: false, reason: `login wall (HTTP ${status}, landed on ${url})` };
  if (status >= 400) return { ok: false, reason: `HTTP ${status}` };
  return { ok: true };
}

// ---- page discovery -------------------------------------------------------------------------------------------
async function discover(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const found = ['/'];
  const skip = /\.(pdf|png|jpe?g|webp|gif|svg|zip|mp4|webm|glb|ics|xml|txt|json)$/i;
  const visit = async (path) => {
    try { await page.goto(ORIGIN + path, { waitUntil: 'load', timeout: 45000 }); } catch { return; }
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href));
    for (const h of hrefs) {
      let u; try { u = new URL(h); } catch { continue; }
      if (u.origin !== new URL(ORIGIN).origin) continue;
      let p = u.pathname; if (skip.test(p)) continue;
      if (!found.includes(p) && found.length < MAX_PAGES) found.push(p);
    }
  };
  await visit('/');
  for (const p of found.slice(1, 6)) await visit(p); // one level deeper, from the first few pages
  await ctx.close();
  return found;
}

// ---- in-page audit (runs inside the page) ---------------------------------------------------------------------
const AUDIT = async ({ phone }) => {
  const vw = document.documentElement.clientWidth, dpr = devicePixelRatio || 1;
  const shown = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const id = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.classList[0] ? `.${el.classList[0]}` : '');
  // sideways scroll (browser-matrix logic): the page really moves, or overflows and nothing clips it
  const y0 = scrollY; scrollTo(99999, y0); await new Promise((r) => setTimeout(r, 80));
  const movedX = Math.round(scrollX); scrollTo(0, y0);
  const clips = (el) => /clip|hidden/.test(getComputedStyle(el).overflowX);
  const clipped = clips(document.documentElement) || clips(document.body);
  const wide = [];
  for (const el of document.querySelectorAll('body *')) {
    const b = el.getBoundingClientRect();
    if (b.width && b.right > vw + 1 && getComputedStyle(el).position !== 'fixed') { wide.push(`${id(el)} right=${Math.round(b.right)}`); if (wide.length >= 3) break; }
  }
  // images: natural vs rendered size, aspect, broken, lazy still unloaded
  const imgs = [];
  for (const el of document.querySelectorAll('[data-mgr-img]')) el.removeAttribute('data-mgr-img');
  for (const i of document.images) {
    if (!shown(i)) continue;
    const r = i.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    i.setAttribute('data-mgr-img', String(imgs.length)); // so the element screenshot finds exactly this one
    const fit = getComputedStyle(i).objectFit;
    const natA = i.naturalWidth && i.naturalHeight ? i.naturalWidth / i.naturalHeight : 0;
    const renA = r.width / r.height;
    imgs.push({ kind: 'img', src: (i.currentSrc || i.src || '').split('?')[0], alt: i.alt || '', natural: [i.naturalWidth, i.naturalHeight], rendered: [Math.round(r.width), Math.round(r.height)], top: Math.round(r.top + scrollY), dpr, fit,
      broken: i.complete && i.naturalWidth === 0, upscale: i.naturalWidth ? +((r.width * dpr) / i.naturalWidth).toFixed(2) : null,
      stretched: natA && fit !== 'cover' && fit !== 'contain' && fit !== 'scale-down' && Math.abs(natA - renA) / natA > 0.06, selector: id(i), index: imgs.length });
  }
  for (const el of document.querySelectorAll('body *')) {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none' || !/url\(/.test(bg) || /gradient/.test(bg) && !/url\(/.test(bg)) continue;
    if (!shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) continue;
    const m = /url\(["']?([^"')]+)["']?\)/.exec(bg);
    if (!m || /^data:/.test(m[1])) continue;
    el.setAttribute('data-mgr-img', String(imgs.length));
    imgs.push({ kind: 'background', src: m[1].split('?')[0], alt: '', natural: null, rendered: [Math.round(r.width), Math.round(r.height)], top: Math.round(r.top + scrollY), dpr, fit: getComputedStyle(el).backgroundSize, broken: false, upscale: null, stretched: false, selector: id(el), index: imgs.length });
  }
  // text overlapping other text (two text nodes whose boxes cross; neither contains the other)
  // skip text that is faded (mid-animation or a dimmed layer) or scrolled out of a clipping ancestor (reels, carousels)
  const faded = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) if (+getComputedStyle(e).opacity < 0.5) return true; return false; };
  const clippedOut = (el) => { const r = el.getBoundingClientRect(); for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (/hidden|clip|auto|scroll/.test(s.overflowX + s.overflowY)) { const c = e.getBoundingClientRect(); if (r.right <= c.left + 1 || r.left >= c.right - 1 || r.bottom <= c.top + 1 || r.top >= c.bottom - 1) return true; } } return false; };
  const textEls = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,span,button,label,small,strong,em,dt,dd,figcaption,blockquote')]
    .filter((el) => shown(el) && el.innerText && el.innerText.trim().length > 1 && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1))
    .map((el) => ({ el, b: el.getBoundingClientRect(), t: el.innerText.trim().slice(0, 40) })).filter((x) => x.b.width > 8 && x.b.height > 8 && !faded(x.el) && !clippedOut(x.el)).slice(0, 600);
  const overlaps = [];
  for (let a = 0; a < textEls.length && overlaps.length < 12; a++) for (let b = a + 1; b < textEls.length; b++) {
    const A = textEls[a], B = textEls[b];
    if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
    // a scroll container's siblings (reel items) can share a row legitimately; two items of one list are not an overlap unless both are in view
    if (A.el.parentElement === B.el.parentElement && /auto|scroll/.test(getComputedStyle(A.el.parentElement).overflowX)) continue;
    const ix = Math.min(A.b.right, B.b.right) - Math.max(A.b.left, B.b.left), iy = Math.min(A.b.bottom, B.b.bottom) - Math.max(A.b.top, B.b.top);
    if (ix > 6 && iy > 6 && ix * iy > 0.25 * Math.min(A.b.width * A.b.height, B.b.width * B.b.height)) {
      // same stacking context tricks (one hidden behind another by design) are rare for text; report, the eye decides
      overlaps.push({ a: `${id(A.el)} "${A.t}"`, b: `${id(B.el)} "${B.t}"`, top: Math.round(Math.min(A.b.top, B.b.top) + scrollY) });
    }
  }
  // tap targets under 44 px on a phone
  const small = phone ? [...document.querySelectorAll('a[href],button,[role=button],input,select,summary')].filter(shown).map((el) => ({ el, b: el.getBoundingClientRect() }))
    .filter((x) => (x.b.width < 40 || x.b.height < 40) && !(x.b.width >= 44 && x.b.height >= 24 && x.el.tagName === 'A' && x.el.closest('p,li')))
    .slice(0, 10).map((x) => `${id(x.el)} ${Math.round(x.b.width)}x${Math.round(x.b.height)} "${(x.el.getAttribute('aria-label') || x.el.innerText || '').trim().slice(0, 25)}"`) : [];
  // text spilling out of its box
  const spill = [...document.querySelectorAll('h1,h2,h3,p,li,a,button,span')].filter(shown).filter((el) => el.scrollWidth > el.clientWidth + 4 && /hidden|clip/.test(getComputedStyle(el).overflowX) === false && getComputedStyle(el).whiteSpace === 'nowrap').slice(0, 8).map((el) => `${id(el)} "${el.innerText.trim().slice(0, 30)}"`);
  const text = document.body.innerText || '';
  const placeholders = [...new Set((text.match(/\[[A-Za-z][^\]\n]{0,40}\]|\bTO COME\b|\bTBC\b|lorem ipsum|will appear here|coming soon|07000 000000|01234 567890/gi) || []))].slice(0, 10);
  const hiddenShown = [...document.querySelectorAll('[hidden]')].filter((el) => shown(el) && getComputedStyle(el).display !== 'none').map(id).slice(0, 5);
  const h1 = [...document.querySelectorAll('h1')].filter(shown).length;
  const videos = [...document.querySelectorAll('video')].map((v) => ({ src: (v.currentSrc || v.src || v.querySelector('source')?.src || '').split('?')[0], autoplay: v.autoplay, muted: v.muted, loop: v.loop, paused: v.paused, readyState: v.readyState }));
  const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')].filter(shown).map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()))].slice(0, 8);
  const inter = fonts.filter((f) => /^(Inter|Arial|Times New Roman|system-ui|Roboto|Helvetica)$/i.test(f));
  return { vw, dpr, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, movedX, clipped, wide, imgs, overlaps, small, spill, placeholders, hiddenShown, h1, videos, fonts, inter, title: document.title, textLen: text.length };
};

// ---- main -----------------------------------------------------------------------------------------------------
const seenImages = new Map(); // src -> saved file, so the same image isn't saved from every page
let imageCounter = 0;
for (const name of BROWSERS) {
  const type = pw[name];
  if (!type) { note('tooling', name, 'unknown browser'); continue; }
  let browser;
  try { browser = await type.launch(launchOptions(name)); } catch (e) { note('tooling', name, `launch failed: ${e.message.split('\n')[0]} (npx playwright install ${name})`); continue; }
  const first = name === BROWSERS[0];
  if (first) {
    const reach = await probe(browser);
    data.loginWall = !reach.ok;
    if (!reach.ok) { data.notes.push(`NOT TESTED: ${reach.reason}`); note('reachability', ORIGIN, reach.reason); await browser.close(); break; }
    data.pageList = GIVEN_PAGES || await discover(browser);
    console.log(`pages (${data.pageList.length}): ${data.pageList.join(' ')}`);
  }
  for (const w of WIDTHS) {
    const phone = w < 768;
    const opts = { viewport: { width: w, height: phone ? 844 : 900 }, hasTouch: phone, ...(phone && name !== 'firefox' ? { isMobile: true, deviceScaleFactor: 2 } : {}) };
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    let errors = [];
    page.on('pageerror', (e) => { if (!IGNORE.test(e.message)) errors.push(e.message.split('\n')[0]); });
    page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text().slice(0, 200)); });
    page.on('requestfailed', (r) => { if (!IGNORE.test(r.url())) errors.push(`request failed: ${r.url().split('?')[0]} ${r.failure()?.errorText || ''}`); });
    for (const path of data.pageList) {
      errors = [];
      const tag = `${name} ${w} ${path}`;
      const base = `${slug(path)}-${w}${name === 'chromium' ? '' : `-${name}`}`;
      const rec = { path, browser: name, width: w, shots: {} };
      let res;
      try { res = await page.goto(ORIGIN + path, { waitUntil: 'load', timeout: 60000 }); } catch (e) { note('load', tag, e.message.split('\n')[0]); data.pages.push({ ...rec, failed: true }); continue; }
      rec.status = res ? res.status() : 0;
      if (rec.status >= 400) note('load', tag, `HTTP ${rec.status}`);
      await page.waitForTimeout(WAIT);
      // first screen, as a visitor sees it (phone shots at device scale so detail survives)
      rec.shots.view = `pages/${base}-view.png`;
      await page.screenshot({ path: join(OUT, rec.shots.view) });
      // scroll through so lazy images and scroll scenes run, then back to the top
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
      await page.waitForTimeout(300);
      const a = await page.evaluate(AUDIT, { phone });
      rec.audit = { ...a, imgs: a.imgs.length };
      const sideways = a.movedX > 0 || (a.sw > a.vw && !a.clipped);
      if (sideways) note('sideways-scroll', tag, `page ${a.sw}px wide at ${a.vw}px${a.movedX ? `, scrolls ${a.movedX}px` : ''}; widest: ${a.wide.join(', ')}`);
      else if (a.sw > a.vw) note('overflow-clipped', tag, `content reaches ${a.sw}px at ${a.vw}px (${a.wide.join(', ')}); fine if the bleed is on purpose`);
      if (errors.length) note('console', tag, errors.slice(0, 4).join(' | '));
      for (const i of a.imgs.filter((x) => x.broken)) note('broken-image', tag, i.src);
      for (const i of a.imgs.filter((x) => x.upscale && x.upscale > 1.25)) note('upscaled-image', tag, `${i.src.split('/').pop()} is ${i.natural.join('x')} shown at ${i.rendered.join('x')} @${i.dpr}x (${i.upscale}x stretch, will look soft)`);
      for (const i of a.imgs.filter((x) => x.stretched)) note('stretched-image', tag, `${i.src.split('/').pop()} ${i.natural.join('x')} squeezed into ${i.rendered.join('x')} (object-fit: ${i.fit})`);
      for (const o of a.overlaps) note('text-overlap', tag, `${o.a} crosses ${o.b} (y=${o.top})`);
      for (const s of a.small) note('tap-target', tag, s);
      for (const s of a.spill) note('text-spill', tag, s);
      if (a.placeholders.length) note('placeholder', tag, a.placeholders.join(', '));
      if (a.hiddenShown.length) note('hidden-showing', tag, a.hiddenShown.join(', '));
      if (a.h1 !== 1) note('h1', tag, `${a.h1} visible h1`);
      if (a.inter.length && phone) note('default-font', tag, `display/body type is ${a.inter.join(', ')} (system or default font: either self-hosting failed or the type was never chosen)`);
      for (const v of a.videos) if (v.readyState === 0 && v.src) note('video', tag, `${v.src.split('/').pop()} has no data (readyState 0)`);
      // whole page (css scale keeps tall phone pages under the image size limit)
      rec.shots.full = `pages/${base}-full.png`;
      try { await page.screenshot({ path: join(OUT, rec.shots.full), fullPage: true, scale: 'css' }); }
      catch {
        const parts = [];
        for (let y = 0, i = 1; y < a.sh; y += 12000, i++) { const f = `pages/${base}-full-part${i}.png`; await page.screenshot({ path: join(OUT, f), fullPage: true, scale: 'css', clip: { x: 0, y, width: w, height: Math.min(12000, a.sh - y) } }); parts.push(f); }
        rec.shots.full = parts;
      }
      // a phone page 15,000 px tall cannot be read as one image: also save it in readable slices of two screens
      if (phone && first && a.sh > 2600) {
        rec.shots.sections = [];
        const step = 1688;
        for (let y = 0, n = 1; y < a.sh && n <= 24; y += step, n++) {
          const f = `pages/${base}-sec-${String(n).padStart(2, '0')}.png`;
          try { await page.screenshot({ path: join(OUT, f), fullPage: true, scale: 'css', clip: { x: 0, y, width: w, height: Math.min(step, a.sh - y) } }); rec.shots.sections.push(f); } catch { break; }
        }
      }
      // every image one by one, at phone width, in the first browser only
      if (phone && first) {
        for (const i of a.imgs) {
          if (data.images.length >= MAX_IMAGES) break;
          const key = `${i.src}|${i.rendered.join('x')}`;
          if (seenImages.has(key)) continue;
          const file = `images/${String(++imageCounter).padStart(2, '0')}-${slug(i.src.split('/').pop() || i.selector)}.png`;
          try {
            // the audit tagged each element with its index, so this is exactly the element that was measured
            const el = await page.$(`[data-mgr-img="${i.index}"]`);
            if (!el) { data.notes.push(`image not captured: ${i.src} on ${path} (element gone)`); continue; }
            await el.scrollIntoViewIfNeeded().catch(() => {});
            await page.waitForTimeout(250);
            await el.screenshot({ path: join(OUT, file), timeout: 8000 });
            seenImages.set(key, file);
            data.images.push({ file, page: path, ...i });
          } catch (e) { data.notes.push(`image not captured: ${i.src} on ${path} (${e.message.split('\n')[0]})`); }
        }
        // phone menu open state
        const menu = page.locator('header button, nav button, button[aria-label*="menu" i], button[aria-controls], [class*="burger" i], [class*="hamburger" i], [class*="menu-toggle" i], button[aria-expanded]').first();
        if (await menu.count().catch(() => 0)) {
          try { await page.evaluate(() => scrollTo(0, 0)); await menu.click({ timeout: 2500 }); await page.waitForTimeout(500); rec.shots.menu = `pages/${base}-menu.png`; await page.screenshot({ path: join(OUT, rec.shots.menu) }); await page.keyboard.press('Escape').catch(() => {}); }
          catch (e) { data.notes.push(`menu state not captured on ${path}: ${e.message.split('\n')[0]}`); }
        }
      }
      data.pages.push(rec);
      console.log(`shot  ${tag}  (${a.imgs.length} images, ${errors.length} console errors)`);
    }
    await ctx.close();
  }
  // the first ten seconds on a phone: a frame a second plus a video, home page only, first browser only
  if (first && !flag('no-wow')) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: name !== 'firefox', hasTouch: true, deviceScaleFactor: 2, recordVideo: { dir: join(OUT, 'wow'), size: { width: 390, height: 844 } } });
    const page = await ctx.newPage();
    const frames = [];
    const t0 = Date.now();
    const nav = page.goto(ORIGIN + '/', { waitUntil: 'commit', timeout: 60000 }).catch(() => {});
    await nav; // frame-00 is the first paint after commit; the clock still runs from the request
    for (let s = 0; s <= 10; s++) {
      const target = t0 + s * 1000;
      const left = target - Date.now(); if (left > 0) await page.waitForTimeout(left);
      const f = `wow/frame-${String(s).padStart(2, '0')}.png`;
      // frame 0 is the first paint: Chromium has nothing to capture at commit, so retry for up to a second
      for (let tries = s === 0 ? 8 : 1; tries > 0; tries--) {
        try { await page.screenshot({ path: join(OUT, f), timeout: 900 }); frames.push(f); break; }
        catch { if (tries > 1) await page.waitForTimeout(120); }
      }
      // a visitor reads the hero for three seconds, then thumbs down slowly
      if (s >= 3) await page.evaluate(() => scrollBy({ top: innerHeight * 0.45, behavior: 'smooth' })).catch(() => {});
    }
    await nav;
    const video = page.video();
    await ctx.close();
    try { const p = await video.path(); const dest = join(OUT, 'wow', 'first-10s.webm'); renameSync(p, dest); data.wow = { frames, video: 'wow/first-10s.webm' }; }
    catch { data.wow = { frames, video: null }; }
  }
  await browser.close();
}

// ---- contact sheet (an HTML index of everything, then one PNG of it) ------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pageCards = data.pages.filter((p) => !p.failed).map((p) => `<figure><img src="${esc(p.shots.view)}" loading="lazy"><figcaption>${esc(p.browser)} ${p.width} ${esc(p.path)}<br><a href="${esc(Array.isArray(p.shots.full) ? p.shots.full[0] : p.shots.full)}">full page</a>${p.shots.sections ? ` · ${p.shots.sections.length} slices` : ''}${p.shots.menu ? ` · <a href="${esc(p.shots.menu)}">menu</a>` : ''}</figcaption></figure>`).join('');
const imageCards = data.images.map((i) => { const flags = [i.broken && 'BROKEN', i.upscale > 1.25 && `${i.upscale}x upscaled`, i.stretched && 'stretched'].filter(Boolean); return `<figure class="${flags.length ? 'flag' : ''}"><img src="${esc(i.file)}" loading="lazy"><figcaption>${esc(i.file.replace('images/', ''))}<br>${i.natural ? i.natural.join('x') : 'bg'} → ${i.rendered.join('x')} @${i.dpr}x ${flags.length ? `<b>${esc(flags.join(', '))}</b>` : ''}<br><small>${esc(i.page)} · ${esc(i.src.split('/').pop())}</small></figcaption></figure>`; }).join('');
const wowStrip = data.wow ? data.wow.frames.map((f, n) => `<figure><img src="${esc(f)}"><figcaption>${n}s</figcaption></figure>`).join('') : '<p>no wow capture</p>';
const findingRows = findings.map((f) => `<tr><td>${esc(f.kind)}</td><td>${esc(f.where)}</td><td>${esc(f.detail)}</td></tr>`).join('');
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>manager capture ${esc(data.source)}</title>
<style>body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#111;color:#eee}h1,h2{font-weight:600}figure{display:inline-block;vertical-align:top;margin:0 12px 16px 0;width:200px}figure img{width:200px;max-height:360px;object-fit:contain;object-position:top;background:#222;border:1px solid #333;display:block}figcaption{font-size:11px;color:#bbb;margin-top:4px;word-break:break-all}.flag img{border-color:#e55}.flag b{color:#f88}.wow figure{width:120px}.wow img{width:120px}table{border-collapse:collapse;font-size:12px}td{border:1px solid #333;padding:4px 6px;vertical-align:top}a{color:#8cf}</style>
<h1>Manager capture: ${esc(data.source)}</h1><p>${esc(data.started)} · ${data.pages.length} page shots · ${data.images.length} images · ${findings.length} automated findings${data.loginWall ? ' · <b style="color:#f88">LOGIN WALL: NOT TESTED</b>' : ''}</p>
<h2>First 10 seconds on a phone (390)</h2><div class="wow">${wowStrip}</div>${data.wow?.video ? `<p><a href="${data.wow.video}">video</a></p>` : ''}
<h2>Pages: first screen</h2>${pageCards}
<h2>Every image at phone width (red border = the script flagged it)</h2>${imageCards || '<p>none</p>'}
<h2>Automated findings</h2><table><tr><td>kind</td><td>where</td><td>detail</td></tr>${findingRows || '<tr><td colspan=3>none</td></tr>'}</table>
${data.notes.length ? `<h2>Notes</h2><ul>${data.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}`;
writeFileSync(join(OUT, 'index.html'), html);
try {
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file:///' + join(OUT, 'index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForTimeout(800);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 900) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(OUT, 'contact-sheet.png'), fullPage: true });
  await b.close();
} catch (e) { data.notes.push(`contact sheet not rendered: ${e.message.split('\n')[0]}`); }

// ---- findings.md + capture.json -------------------------------------------------------------------------------
const byKind = {};
for (const f of findings) (byKind[f.kind] ||= []).push(f);
const md = [`# Capture findings: ${data.source}`, '', `Taken ${data.started}. ${data.pages.filter((p) => !p.failed).length} page shots (${data.pageList?.length || 0} pages × ${WIDTHS.join('/')} px × ${BROWSERS.join('/')}), ${data.images.length} images saved one by one at 390, wow strip ${data.wow ? `${data.wow.frames.length} frames${data.wow.video ? ' + video' : ''}` : 'not taken'}.`, '',
  data.loginWall ? `**NOT TESTED: ${data.notes[0]}.** Nothing here is a review of the site; it is a review of the login page. Fall back to a static build or ask for an unprotected preview.` : '',
  '## What the scripts found (the eye still has to confirm each one and find the rest)', ''];
if (!findings.length) md.push('Nothing automated. That proves little: open every picture.');
for (const [k, list] of Object.entries(byKind)) { md.push(`### ${k} (${list.length})`); for (const f of list) md.push(`- ${f.where}: ${f.detail}`); md.push(''); }
md.push('## Look at, in this order', '', '1. `wow/frame-00..10.png` (or `wow/first-10s.webm`): the first ten seconds on a phone.', '2. Every `pages/*-390-view.png`, then `*-390-sec-NN.png` (readable two-screen slices; the `-full.png` is for rhythm only), then the 1440 pair, then `*-menu.png`.', `3. Every file in \`images/\` (${data.images.length}), one at a time: edges, sharpness, crops, wrong photo, badges, stretched. Each file is that element's box on the live page, so text or bars drawn over the image are in the shot too (that is the point: it is how the visitor sees it).`, '4. `contact-sheet.png` last, to spot sections that read as different sites.', '', 'Crop a fault: `node <skill>/scripts/crop.mjs <png> <x> <y> <w> <h> <out.png> [--zoom 2]` (coordinates in the source image\'s pixels).');
if (data.notes.length) { md.push('', '## Notes', ''); for (const n of data.notes) md.push(`- ${n}`); }
writeFileSync(join(OUT, 'findings.md'), md.filter((l) => l !== null).join('\n'));
data.findings = findings;
data.finished = new Date().toISOString();
writeFileSync(join(OUT, 'capture.json'), JSON.stringify(data, null, 2));
if (server) server.close();
console.log(`\n${findings.length} automated findings. Review folder: ${OUT}\n  findings.md, index.html, contact-sheet.png, pages/ (${data.pages.length}), images/ (${data.images.length}), wow/ (${data.wow?.frames.length || 0} frames)`);
process.exit(data.loginWall ? 3 : 0);
