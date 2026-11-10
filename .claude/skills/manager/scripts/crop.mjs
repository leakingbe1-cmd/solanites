#!/usr/bin/env node
// Crop a region out of a screenshot so a fault can be shown, not described. No image library needed: the PNG is
// loaded in a headless page and the clip is screenshotted (optionally zoomed).
//
//   node crop.mjs pages/home-390-full.png 0 1200 390 420 faults/01-hero-gap.png --zoom 2
//   node crop.mjs <source.png> <x> <y> <width> <height> <out.png> [--zoom N] [--label "text drawn under the crop"]
//
// x, y, width, height are pixels of the source image. The output is width*zoom by height*zoom (plus the label).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { loadPlaywright } from './pw.mjs';

const a = process.argv.slice(2);
const opt = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
const pos = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
const [src, x, y, w, h, out] = pos;
if (!src || !out || [x, y, w, h].some((v) => v === undefined || isNaN(+v))) { console.error('usage: crop.mjs <source.png> <x> <y> <width> <height> <out.png> [--zoom N] [--label text]'); process.exit(2); }
if (!existsSync(src)) { console.error(`no such file: ${src}`); process.exit(2); }
const zoom = +opt('zoom', 1), label = opt('label', '');
const X = +x, Y = +y, W = +w, H = +h;
// In the nightly review the reviewer reads untrusted pages, so crops may only be written inside its review folder.
const sandbox = process.env.MANAGER_SANDBOX_DIR;
if (sandbox) {
  const root = resolve(sandbox).toLowerCase() + (process.platform === 'win32' ? '\\' : '/');
  if (!resolve(out).toLowerCase().startsWith(root) || extname(out).toLowerCase() !== '.png') { console.error(`refused: ${out} is not a .png inside ${sandbox}`); process.exit(2); }
}
mkdirSync(dirname(resolve(out)), { recursive: true });

const pw = loadPlaywright();
const b = await pw.chromium.launch();
const labelH = label ? 28 : 0;
const page = await b.newPage({ viewport: { width: Math.max(1, Math.round(W * zoom)), height: Math.max(1, Math.round(H * zoom + labelH)) }, deviceScaleFactor: 1 });
// a blank page cannot load file:// images, so the source goes in as a data URI
const ext = extname(src).toLowerCase().replace('.', '') || 'png';
const file = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${readFileSync(src).toString('base64')}`;
await page.setContent(`<!doctype html><style>html,body{margin:0;background:#111;overflow:hidden}
#c{width:${W * zoom}px;height:${H * zoom}px;overflow:hidden;position:relative;outline:2px solid #e55;outline-offset:-2px}
#c img{position:absolute;left:${-X * zoom}px;top:${-Y * zoom}px;transform-origin:0 0;transform:scale(${zoom});image-rendering:${zoom > 1 ? 'pixelated' : 'auto'};display:block}
#l{font:13px/28px system-ui,sans-serif;color:#eee;padding:0 8px;height:${labelH}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#222}</style>
<div id="c"><img src="${file}"></div>${label ? `<div id="l">${label.replace(/[<&]/g, (c) => ({ '<': '&lt;', '&': '&amp;' }[c]))}</div>` : ''}`);
await page.waitForFunction(() => document.images[0]?.complete && document.images[0].naturalWidth > 0, null, { timeout: 15000 });
await page.screenshot({ path: out });
await b.close();
console.log(`${out}  (${W}x${H} from ${src} at ${X},${Y}${zoom !== 1 ? `, zoom ${zoom}` : ''})`);
