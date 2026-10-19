// Solanites motion engine: deterministic, frame-by-frame compositing on a canvas.
// Every function here is a pure function of time, so any frame renders identically.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
/** 0→1 progress of t through [a, b]. */
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  inOut: k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  out: k => 1 - Math.pow(1 - k, 3),
  in: k => k * k * k,
  sine: k => -(Math.cos(Math.PI * k) - 1) / 2,
};

// ── Assets ─────────────────────────────────────────────────
const imgCache = new Map();
export function loadImage(src) {
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => i.decode().then(() => res(i), () => res(i));
      i.onerror = () => rej(new Error("missing " + src));
      i.src = src;
    }));
  }
  return imgCache.get(src);
}

/** A numbered JPEG sequence (0000.jpg …); frames are loaded on demand and evicted behind. */
export function sequence(dir, count) {
  return {
    count,
    async frame(i) {
      const n = clamp(Math.round(i), 0, count - 1);
      for (const key of imgCache.keys()) {
        if (key.startsWith(dir + "/")) {
          const k = +key.slice(dir.length + 1, -4);
          if (k < n - 4 || k > n + 8) imgCache.delete(key);
        }
      }
      return loadImage(`${dir}/${String(n).padStart(4, "0")}.jpg`);
    },
  };
}

function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

const derived = new WeakMap();
function memo(img, key, make) {
  let m = derived.get(img); if (!m) derived.set(img, (m = new Map()));
  if (!m.has(key)) m.set(key, make());
  return m.get(key);
}

/** Copy of an image with its edges faded to transparent (fractions of each side). */
export function feathered(img, { top = 0, bottom = 0, left = 0, right = 0 } = {}, { cache = true } = {}) {
  const make = () => {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const c = canvas(w, h), g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "destination-in";
    const v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, top ? "rgba(0,0,0,0)" : "#000"); v.addColorStop(Math.max(top, .0001), "#000");
    v.addColorStop(Math.min(1 - bottom, .9999), "#000"); v.addColorStop(1, bottom ? "rgba(0,0,0,0)" : "#000");
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    const hz = g.createLinearGradient(0, 0, w, 0);
    hz.addColorStop(0, left ? "rgba(0,0,0,0)" : "#000"); hz.addColorStop(Math.max(left, .0001), "#000");
    hz.addColorStop(Math.min(1 - right, .9999), "#000"); hz.addColorStop(1, right ? "rgba(0,0,0,0)" : "#000");
    g.fillStyle = hz; g.fillRect(0, 0, w, h);
    return c;
  };
  return cache ? memo(img, `f${top},${bottom},${left},${right}`, make) : make();
}

/** Blurred, darkened copy at reduced resolution, for backdrops and extensions. */
export function blurred(img, px = 40, brightness = .45) {
  return memo(img, `b${px},${brightness}`, () => {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, s = .35;
    const c = canvas(Math.round(w * s), Math.round(h * s)), g = c.getContext("2d");
    g.filter = `blur(${px * s}px) brightness(${brightness}) saturate(1.15)`;
    g.drawImage(img, -w * s * .05, -h * s * .05, w * s * 1.1, h * s * 1.1);
    return c;
  });
}

// ── Drawing ────────────────────────────────────────────────
/** Draw `img` so the point (ax, ay) of the source (0–1 fractions) lands on (x, y) at `scale`. */
export function place(ctx, img, x, y, scale, { ax = .5, ay = .5, alpha = 1, op } = {}) {
  const w = (img.naturalWidth || img.width) * scale, h = (img.naturalHeight || img.height) * scale;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (op) ctx.globalCompositeOperation = op;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, x - w * ax, y - h * ay, w, h);
  ctx.restore();
}
/** Scale that makes `img` cover a W×H frame. */
export const coverScale = (img, W, H) => Math.max(W / (img.naturalWidth || img.width), H / (img.naturalHeight || img.height));
export const fitScale = (img, W, H) => Math.min(W / (img.naturalWidth || img.width), H / (img.naturalHeight || img.height));

export function fill(ctx, W, H, color, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore();
}

export function vignette(ctx, W, H, strength = .8, inner = .45) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * inner * .5, W / 2, H / 2, Math.hypot(W, H) * .55);
  g.addColorStop(0, "rgba(3,3,8,0)"); g.addColorStop(1, `rgba(3,3,8,${strength})`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

export function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}

// ── Atmosphere ─────────────────────────────────────────────
function rand(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

let emberSprite;
function sprite() {
  if (emberSprite) return emberSprite;
  const c = canvas(64, 64), g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,250,235,1)"); r.addColorStop(.15, "rgba(255,200,110,.95)");
  r.addColorStop(.4, "rgba(255,130,40,.35)"); r.addColorStop(1, "rgba(255,90,20,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return (emberSprite = c);
}

/**
 * Embers rising through the frame. Positions are a closed-form function of t,
 * so frames can be rendered in any order. `rise` is pixels per second.
 */
export function embers(ctx, t, W, H, { seed = 1, count = 70, size = [2, 7], rise = [40, 140], alpha = 1, region = [0, 1], blur = 0, drift = 30 } = {}) {
  if (alpha <= 0) return;
  const r = rand(seed), img = sprite();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (blur) ctx.filter = `blur(${blur}px)`;
  for (let i = 0; i < count; i++) {
    const x0 = (region[0] + r() * (region[1] - region[0])) * W;
    const speed = lerp(rise[0], rise[1], r());
    const s = lerp(size[0], size[1], Math.pow(r(), 2.2));
    const phase = r() * 100, wob = 8 + r() * drift, wf = .3 + r() * .9;
    const life = (H + 200) / speed;
    const age = ((t + phase) % life + life) % life;
    const y = H + 100 - age * speed;
    const x = x0 + Math.sin((t + phase) * wf) * wob + age * drift * .15;
    const flick = .55 + .45 * Math.sin((t + phase) * (3 + r() * 5));
    const fade = clamp(age / .8) * clamp((life - age) / 1.5);
    ctx.globalAlpha = alpha * flick * fade * (.45 + r() * .55);
    ctx.drawImage(img, x - s * 2, y - s * 2, s * 4, s * 4);
  }
  ctx.restore();
}

let smokeTile;
/** Build a seamless smoke tile once (SVG fractal noise rasterised into a canvas). */
export async function initSmoke() {
  if (smokeTile) return;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><filter id="s" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0028" numOctaves="6" seed="7" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -.78"/></filter><rect width="100%" height="100%" filter="url(#s)"/></svg>`;
  const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
  smokeTile = canvas(1024, 1024); smokeTile.getContext("2d").drawImage(img, 0, 0);
}

/** Tinted smoke drifting at (vx, vy) px/s; `scale` enlarges the tile. */
export function smoke(ctx, t, W, H, { alpha = .3, scale = 1.6, vx = 12, vy = -6, tint = "rgb(150,130,180)", op = "screen", seed = 0 } = {}) {
  if (!smokeTile || alpha <= 0) return;
  const size = 1024 * scale;
  const ox = ((seed * 377 + t * vx) % size + size) % size, oy = ((seed * 211 + t * vy) % size + size) % size;
  const layer = canvas(W, H), g = layer.getContext("2d");
  for (let x = -ox; x < W; x += size) for (let y = -oy; y < H; y += size) g.drawImage(smokeTile, x, y, size, size);
  g.globalCompositeOperation = "source-in"; g.fillStyle = tint; g.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = op; ctx.drawImage(layer, 0, 0); ctx.restore();
}

let grainTile;
export function grain(ctx, W, H, frame, alpha = .06) {
  if (!grainTile) {
    grainTile = canvas(512, 512);
    const g = grainTile.getContext("2d"), d = g.createImageData(512, 512), r = rand(99);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  }
  const r = rand(frame * 13 + 5), ox = Math.floor(r() * 512), oy = Math.floor(r() * 512);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "overlay";
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) ctx.drawImage(grainTile, x, y);
  ctx.restore();
}

// ── Typography ─────────────────────────────────────────────
export async function initFonts(base) {
  const faces = [
    new FontFace("Unbounded", `url(${base}/unbounded-latin-wght-normal.woff2)`, { weight: "200 900" }),
    new FontFace("JetBrains Mono", `url(${base}/jetbrains-mono-latin-400-normal.woff2)`, { weight: "400" }),
    new FontFace("Inter", `url(${base}/inter-latin-wght-normal.woff2)`, { weight: "100 900" }),
  ];
  for (const f of faces) document.fonts.add(await f.load());
}

/** Track every string drawn, so the renderer can check on-screen copy against the approved list. */
export const drawnText = new Set();

/**
 * Text with tracking, optional gold gradient and glow. `rise` slides it up as it fades in.
 * Returns the measured width.
 */
export function text(ctx, str, x, y, { size = 60, weight = 800, family = "Unbounded", tracking = 0, align = "center", color = "#f4f1ff", gold = false, glow: g = 0, alpha = 1, shadow = true, maxWidth } = {}) {
  if (alpha <= 0.001) return 0;
  drawnText.add(str);
  ctx.save();
  let s = size;
  const set = () => { ctx.font = `${weight} ${s}px "${family}"`; ctx.letterSpacing = `${tracking * s}px`; };
  set();
  if (maxWidth) while (ctx.measureText(str).width - tracking * s > maxWidth && s > 8) { s -= 1; set(); }
  const w = ctx.measureText(str).width - tracking * s;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.globalAlpha = alpha;
  if (gold) {
    const gr = ctx.createLinearGradient(0, y - s * .8, 0, y + s * .1);
    gr.addColorStop(0, "#fff3d6"); gr.addColorStop(.38, "#ffd27a"); gr.addColorStop(.78, "#f5a524"); gr.addColorStop(1, "#c96b12");
    ctx.fillStyle = gr;
  } else ctx.fillStyle = color;
  if (shadow) { ctx.shadowColor = "rgba(0,0,0,.85)"; ctx.shadowBlur = s * .45; ctx.shadowOffsetY = s * .06; ctx.fillText(str, x0, y); }
  if (g) { ctx.shadowColor = `rgba(255,150,40,${g})`; ctx.shadowBlur = s * .5; ctx.shadowOffsetY = 0; ctx.fillText(str, x0, y); }
  ctx.shadowColor = "transparent"; ctx.fillText(str, x0, y);
  ctx.restore();
  return w;
}

// Official mark from src/components/layout/Logo.tsx (same paths and gradient), as an image.
export function logoMarkSrc() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9945ff"/><stop offset=".55" stop-color="#00c2ff"/><stop offset="1" stop-color="#14f195"/></linearGradient></defs><path d="M20,3 C29,3 35,16 35,25 C35,33 28.5,38 20,38 C11.5,38 5,33 5,25 C5,16 11,3 20,3 Z" fill="none" stroke="url(#g)" stroke-width="2"/><path d="M20,14 L25,21 L20,29 L15,21 Z" fill="url(#g)"/><path d="M9,24 L14,22 L16,26 M31,24 L26,22 L24,26" fill="none" stroke="url(#g)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
export function logo(ctx, img, x, y, size, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,194,255,.45)"; ctx.shadowBlur = size * .35;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}
