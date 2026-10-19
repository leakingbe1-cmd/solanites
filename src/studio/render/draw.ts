/**
 * Canvas renderer for the Solanites Phoenix campaign.
 *
 * One drawing path serves every output: the Content Studio's live preview,
 * its PNG export and in-browser recording, and the offline MP4/JPG render
 * (`npm run campaign:render`). Typography is drawn on top of the Runway
 * footage at the output's native resolution, so text stays sharp and is
 * never baked into the generated video.
 *
 * Layouts are composed per aspect ratio rather than centre-cropped: the
 * Phoenix's wings reach the edges of the 16:9 source, so taller formats show
 * the full frame in a feathered band over a blurred extension of itself, with
 * copy in the zones above and below.
 */

import { LOGO_PATHS } from "@/components/layout/Logo";
import { PRELAUNCH } from "@/studio/facts";

// ── Formats ─────────────────────────────────────────────────────────────────

export type CanvasFormatId = "landscape" | "vertical" | "square" | "portrait" | "x-image" | "poster" | "poster-4x5";

export interface CanvasFormat {
  id: CanvasFormatId;
  label: string;
  w: number;
  h: number;
}

export const CANVAS_FORMATS: Record<CanvasFormatId, CanvasFormat> = {
  landscape: { id: "landscape", label: "16:9 · 1920×1080", w: 1920, h: 1080 },
  vertical: { id: "vertical", label: "9:16 · 1080×1920", w: 1080, h: 1920 },
  square: { id: "square", label: "1:1 · 1080×1080", w: 1080, h: 1080 },
  portrait: { id: "portrait", label: "4:5 · 1080×1350", w: 1080, h: 1350 },
  "x-image": { id: "x-image", label: "X image 16:9 · 1600×900", w: 1600, h: 900 },
  poster: { id: "poster", label: "Poster 2:3 · 1200×1800", w: 1200, h: 1800 },
  "poster-4x5": { id: "poster-4x5", label: "Poster 4:5 · 1080×1350", w: 1080, h: 1350 },
};

export const VIDEO_FORMAT_IDS: CanvasFormatId[] = ["landscape", "vertical", "square", "portrait"];

// ── Timing ──────────────────────────────────────────────────────────────────

/** Length of the Runway source clip, in seconds. */
export const SOURCE_DURATION = 10.08;
/** The last frame is held this long so the end screen can be read. */
export const END_HOLD = 1.5;
export const AD_DURATION = SOURCE_DURATION + END_HOLD;
export const AD_FPS = 24;

/** Source timestamps worth using as stills. */
export const STILLS = {
  wingsRaised: 1.7,
  emerging: 0.5,
  vortex: 4.6,
  wingspan: 8.6,
} as const;

const T = {
  open: [0, 0.9],
  hook: [0.35, 2.15],
  bug: [0.8, 6.35],
  callouts: [2.35, 6.4],
  flash: 6.5,
  lockup: 6.7,
  tagline: 7.1,
  cta: 7.6,
  url: 7.9,
} as const;

// ── Copy ────────────────────────────────────────────────────────────────────

export interface Stat {
  value: string;
  label: string;
}

/** Everything the creatives print. `*word*` is drawn in gold. */
export interface CreativeCopy {
  hook: string;
  callouts: string[];
  tagline: string;
  cta: string;
  url: string;
  eyebrow: string;
  headline: string;
  sub: string;
  stats: Stat[];
  /** Up to three factual lines for the CTA graphic, or the options of the "choices" graphic. */
  points: string[];
  /** Footer line on stills when there is no URL (teaser CTA, e.g. FOLLOW FOR THE REVEAL). */
  signoff: string;
}

/** Last line of defence: during the teaser phase no URL is ever drawn, whatever the copy says. */
const guard = (c: CreativeCopy): CreativeCopy => (PRELAUNCH && c.url ? { ...c, url: "" } : c);

export type Graphic = "phoenix" | "species" | "rarity" | "stages" | "stats" | "question" | "cta" | "choices";

export interface GraphicData {
  elements: string[];
  rarities: { label: string; color: string; chance: number; classified: boolean }[];
  eggStages: string[];
  forms: string[];
}

// ── Palette and type ────────────────────────────────────────────────────────

export const FONTS = {
  display: '"Unbounded Variable", "Unbounded", system-ui, sans-serif',
  sans: '"Inter Variable", "Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

/** Font descriptors to `document.fonts.load()` before drawing. */
export const FONT_LOADS = ['700 64px "Unbounded Variable"', '600 64px "Unbounded Variable"', '400 32px "Inter Variable"', '500 32px "Inter Variable"', '400 24px "JetBrains Mono"'];

const C = {
  void: "#05040a",
  white: "#f6f4ff",
  mist: "#b9b5d6",
  gold0: "#fff4cc",
  gold1: "#ffd66b",
  gold2: "#ff9a2a",
  ember: "#ff8a3d",
  violet: "#9945ff",
  violetSoft: "#b07cff",
  cyan: "#00c2ff",
  green: "#14f195",
};

// ── Small helpers ───────────────────────────────────────────────────────────

type Ctx = CanvasRenderingContext2D;
export interface FrameSource {
  image: CanvasImageSource;
  width: number;
  height: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => {
  const v = clamp01(x);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
/** 0→1 over [a, a+fi], 1 until b-fo, then →0 at b. */
function win(t: number, a: number, b = Infinity, fi = 0.4, fo = 0.35) {
  if (t < a || t > b) return 0;
  return Math.min(easeOut((t - a) / fi), b === Infinity ? 1 : easeInOut((b - t) / fo));
}

function rand(i: number) {
  let x = (i + 1) * 0x9e3779b1;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const canvases = new Map<string, HTMLCanvasElement>();
function scratch(key: string, w: number, h: number) {
  let c = canvases.get(key);
  if (!c) {
    c = document.createElement("canvas");
    canvases.set(key, c);
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ── Text ────────────────────────────────────────────────────────────────────

interface Seg {
  text: string;
  gold: boolean;
}
interface TextStyle {
  size: number;
  weight?: number;
  family?: string;
  /** Letter spacing in em. */
  tracking?: number;
  color?: string;
  shadow?: boolean;
}

/** `"YOUR *SOLANITE* IS WAITING."` → segments with gold emphasis. */
function parseRich(text: string): Seg[] {
  return text
    .split("*")
    .map((t, i) => ({ text: t, gold: i % 2 === 1 }))
    .filter((s) => s.text);
}

function setFont(ctx: Ctx, st: TextStyle) {
  ctx.font = `${st.weight ?? 600} ${st.size}px ${st.family ?? FONTS.display}`;
}

const widthCache = new Map<string, number>();
function charW(ctx: Ctx, ch: string) {
  const k = ctx.font + "|" + ch;
  let w = widthCache.get(k);
  if (w === undefined) {
    w = ctx.measureText(ch).width;
    widthCache.set(k, w);
  }
  return w;
}

function measureSegs(ctx: Ctx, segs: Seg[], st: TextStyle) {
  setFont(ctx, st);
  const tr = (st.tracking ?? 0) * st.size;
  let w = 0;
  let n = 0;
  for (const s of segs) for (const ch of s.text) {
    w += charW(ctx, ch) + tr;
    n++;
  }
  return n ? w - tr : 0;
}

function goldFill(ctx: Ctx, y: number, size: number) {
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.15);
  g.addColorStop(0, C.gold0);
  g.addColorStop(0.45, C.gold1);
  g.addColorStop(1, C.gold2);
  return g;
}

/** Draws tracked text on a baseline; returns its width. */
function drawSegs(ctx: Ctx, segs: Seg[], x: number, y: number, st: TextStyle, align: CanvasTextAlign = "center") {
  const w = measureSegs(ctx, segs, st);
  const tr = (st.tracking ?? 0) * st.size;
  let cx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (const s of segs) {
    ctx.save();
    if (s.gold) {
      ctx.fillStyle = goldFill(ctx, y, st.size);
      ctx.shadowColor = "rgba(255, 140, 40, 0.55)";
      ctx.shadowBlur = st.size * 0.45;
    } else {
      ctx.fillStyle = st.color ?? C.white;
      if (st.shadow !== false) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = st.size * 0.35;
      }
    }
    for (const ch of s.text) {
      ctx.fillText(ch, cx, y);
      cx += charW(ctx, ch) + tr;
    }
    ctx.restore();
  }
  return w;
}

/** Greedy word wrap that shrinks the type until it fits in `maxLines`. */
function fitRich(ctx: Ctx, text: string, st: TextStyle, maxW: number, maxLines: number) {
  const words: Seg[][] = [];
  const breaks = new Set<number>();
  for (const [li, line] of text.split("\n").entries()) {
    if (li > 0) breaks.add(words.length);
    let gold = false;
    for (const raw of line.split(" ")) {
      if (!raw) continue;
      const segs: Seg[] = [];
      for (const [i, part] of raw.split("*").entries()) {
        if (i > 0) gold = !gold;
        if (part) segs.push({ text: part, gold });
      }
      if (segs.length) words.push(segs);
    }
  }
  let size = st.size;
  for (let attempt = 0; attempt < 14; attempt++) {
    const s = { ...st, size };
    const space = measureSegs(ctx, [{ text: " ", gold: false }], s) + (st.tracking ?? 0) * size;
    const lines: Seg[][] = [];
    let cur: Seg[] = [];
    let curW = 0;
    let tooWide = false;
    words.forEach((w, i) => {
      const ww = measureSegs(ctx, w, s);
      if (ww > maxW) tooWide = true;
      if (cur.length && (breaks.has(i) || curW + space + ww > maxW)) {
        lines.push(cur);
        cur = [];
        curW = 0;
      }
      if (cur.length) {
        cur.push({ text: " ", gold: false });
        curW += space;
      }
      cur.push(...w);
      curW += ww;
    });
    if (cur.length) lines.push(cur);
    if ((lines.length <= maxLines && !tooWide) || size < st.size * 0.5) return { lines, style: s };
    size *= 0.92;
  }
  return { lines: [parseRich(text)], style: st };
}

/** Draws a wrapped block whose first baseline is at `y`; returns the y below it. */
function drawBlock(ctx: Ctx, text: string, x: number, y: number, st: TextStyle, maxW: number, maxLines: number, align: CanvasTextAlign = "center", lead = 1.12) {
  if (!text.trim()) return y;
  const { lines, style } = fitRich(ctx, text, st, maxW, maxLines);
  lines.forEach((l, i) => drawSegs(ctx, l, x, y + i * style.size * lead, style, align));
  return y + (lines.length - 1) * style.size * lead + style.size * 0.45;
}

// ── Brand ───────────────────────────────────────────────────────────────────

const logoPaths = typeof Path2D === "undefined" ? null : { shell: new Path2D(LOGO_PATHS.shell), gem: new Path2D(LOGO_PATHS.gem), wings: new Path2D(LOGO_PATHS.wings) };

/** The official LogoMark (40×40 artboard), centred on (cx, cy). */
function drawMark(ctx: Ctx, cx: number, cy: number, size: number, glow = 0) {
  if (!logoPaths) return;
  ctx.save();
  const s = size / 40;
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 0, 40, 40);
  g.addColorStop(0, "#9945ff");
  g.addColorStop(0.55, "#00c2ff");
  g.addColorStop(1, "#14f195");
  if (glow) {
    ctx.shadowColor = `rgba(153, 69, 255, ${0.8 * glow})`;
    ctx.shadowBlur = 18 * glow;
  }
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.stroke(logoPaths.shell);
  ctx.fill(logoPaths.gem);
  ctx.lineWidth = 1.5;
  ctx.stroke(logoPaths.wings);
  ctx.restore();
}

/** Mark + SOLANITES wordmark. Returns its width. */
function drawLockup(ctx: Ctx, x: number, cy: number, markSize: number, align: "center" | "left" = "center", glow = 0) {
  const st: TextStyle = { size: markSize * 0.5, weight: 600, tracking: 0.24, color: C.white };
  const segs = [{ text: "SOLANITES", gold: false }];
  const gap = markSize * 0.38;
  const total = markSize + gap + measureSegs(ctx, segs, st);
  const x0 = align === "center" ? x - total / 2 : x;
  drawMark(ctx, x0 + markSize / 2, cy, markSize, glow);
  drawSegs(ctx, segs, x0 + markSize + gap, cy + st.size * 0.36, st, "left");
  return total;
}

/** Primary button, styled like the site's `.sl-btn-primary`. Returns its width. */
function drawPill(ctx: Ctx, label: string, cx: number, cy: number, size: number, align: "center" | "left" = "center") {
  const st: TextStyle = { size, weight: 600, tracking: 0.2, color: "#ffffff", shadow: false };
  const text = `${label.toUpperCase()}  →`;
  const tw = measureSegs(ctx, [{ text, gold: false }], st);
  const h = size * 3.1;
  const w = tw + size * 3.4;
  const x = align === "center" ? cx - w / 2 : cx;
  ctx.save();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "#9945ff");
  g.addColorStop(0.45, "#6b5bff");
  g.addColorStop(0.8, "#00c2ff");
  g.addColorStop(1, "#14f195");
  ctx.shadowColor = "rgba(153, 69, 255, 0.7)";
  ctx.shadowBlur = size * 2.2;
  ctx.shadowOffsetY = size * 0.5;
  roundRect(ctx, x, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.stroke();
  ctx.restore();
  drawSegs(ctx, [{ text, gold: false }], x + w / 2, cy + size * 0.36, st, "center");
  return w;
}

function rule(ctx: Ctx, cx: number, y: number, w: number, a: number) {
  if (w <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, "rgba(255,200,90,0)");
  g.addColorStop(0.5, "rgba(255,214,107,0.95)");
  g.addColorStop(1, "rgba(255,200,90,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, y, w, Math.max(1.5, w / 400));
  ctx.restore();
}

// ── Atmosphere ──────────────────────────────────────────────────────────────

function cover(fw: number, fh: number, W: number, H: number) {
  const s = Math.max(W / fw, H / fh);
  return { w: fw * s, h: fh * s, x: (W - fw * s) / 2, y: (H - fh * s) / 2 };
}

/** Dark, blurred extension of the footage behind composed layouts. */
function drawBackdrop(ctx: Ctx, frame: FrameSource | null, W: number, H: number, dim = 0.5) {
  ctx.fillStyle = C.void;
  ctx.fillRect(0, 0, W, H);
  if (frame) {
    const small = scratch("blur-s", 48, 27);
    const sc = small.getContext("2d")!;
    sc.drawImage(frame.image, 0, 0, 48, 27);
    const mid = scratch("blur-m", 240, 135);
    const mc = mid.getContext("2d")!;
    mc.imageSmoothingQuality = "high";
    mc.drawImage(small, 0, 0, 240, 135);
    const r = cover(240, 135, W, H);
    ctx.save();
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = dim;
    ctx.drawImage(mid, r.x, r.y, r.w, r.h);
    ctx.restore();
  }
  // violet from above, a whisper of cyan below: the site's atmosphere
  const g1 = ctx.createRadialGradient(W * 0.2, -H * 0.05, 0, W * 0.2, -H * 0.05, Math.max(W, H) * 0.7);
  g1.addColorStop(0, "rgba(153, 69, 255, 0.26)");
  g1.addColorStop(1, "rgba(153, 69, 255, 0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.85, H * 1.05, 0, W * 0.85, H * 1.05, Math.max(W, H) * 0.6);
  g2.addColorStop(0, "rgba(0, 194, 255, 0.12)");
  g2.addColorStop(1, "rgba(0, 194, 255, 0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
}

/** The full source frame in a band, feathered into the backdrop at the top and bottom. */
function drawBand(ctx: Ctx, frame: FrameSource, W: number, y: number, zoom = 1, dx = 0) {
  const fw = W * zoom;
  const fh = (fw * frame.height) / frame.width;
  const h = Math.ceil(fh);
  const off = scratch("band", W, h);
  const o = off.getContext("2d")!;
  o.globalCompositeOperation = "source-over";
  o.clearRect(0, 0, W, h);
  o.imageSmoothingQuality = "high";
  o.drawImage(frame.image, (W - fw) / 2 + dx * W, 0, fw, fh);
  o.globalCompositeOperation = "destination-in";
  const f = Math.min(0.22, 90 / h);
  const g = o.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(f, "rgba(0,0,0,1)");
  g.addColorStop(1 - f * 1.4, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = g;
  o.fillRect(0, 0, W, h);
  o.globalCompositeOperation = "source-over";
  ctx.drawImage(off, 0, y);
  return h;
}

/** Full-bleed frame, optionally shifted right and feathered on its left edge (split layouts). */
function drawFull(ctx: Ctx, frame: FrameSource, W: number, H: number, shift = 0) {
  const r = cover(frame.width, frame.height, W, H);
  if (!shift) {
    ctx.drawImage(frame.image, r.x, r.y, r.w, r.h);
    return;
  }
  const off = scratch("split", W, H);
  const o = off.getContext("2d")!;
  o.globalCompositeOperation = "source-over";
  o.clearRect(0, 0, W, H);
  o.drawImage(frame.image, r.x + shift * W, r.y, r.w, r.h);
  o.globalCompositeOperation = "destination-in";
  const g = o.createLinearGradient(shift * W, 0, (shift + 0.28) * W, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,1)");
  o.fillStyle = g;
  o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = "source-over";
  ctx.drawImage(off, 0, 0);
}

function vignette(ctx: Ctx, W: number, H: number, strength = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function scrim(ctx: Ctx, W: number, y0: number, y1: number, a: number) {
  if (a <= 0) return;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "rgba(5,4,10,0)");
  g.addColorStop(0.55, `rgba(5,4,10,${a * 0.75})`);
  g.addColorStop(1, `rgba(5,4,10,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
}

/** Deterministic rising embers, mostly gold, a few violet and cyan. Same t → same frame. */
function embers(ctx: Ctx, t: number, W: number, H: number, count: number, alpha: number) {
  if (alpha <= 0) return;
  const unit = Math.min(W, H) / 1080;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i++) {
    const r = (k: number) => rand(i * 7 + k);
    const speed = (0.025 + 0.07 * r(1)) * H;
    const span = H * 1.15;
    const y = H * 1.05 - ((r(2) * span + t * speed) % span);
    const x = r(0) * W + Math.sin(t * (0.4 + r(3)) + i) * 24 * unit * r(4);
    const size = (1.2 + 3.2 * r(5) * r(5)) * unit;
    const flick = 0.55 + 0.45 * Math.sin(t * (2 + r(6) * 4) + i * 1.7);
    const kind = r(7);
    const col = kind < 0.86 ? (r(8) < 0.5 ? "255, 196, 90" : "255, 128, 50") : kind < 0.95 ? "176, 124, 255" : "126, 232, 255";
    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
    g.addColorStop(0, `rgba(${col}, ${0.9 * alpha * flick})`);
    g.addColorStop(0.25, `rgba(${col}, ${0.35 * alpha * flick})`);
    g.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
  }
  ctx.restore();
}

function glow(ctx: Ctx, cx: number, cy: number, r: number, color: string, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${color}, ${a})`);
  g.addColorStop(1, `rgba(${color}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

// ── Video advert layouts ────────────────────────────────────────────────────

interface AdLayout {
  /** Full-bleed footage (16:9) or a composed band. */
  band: { y: number; zoom: number } | null;
  margin: number;
  hook: { y: number; size: number; lines: number };
  callout: { y: number; size: number };
  bug: { x: number; y: number; size: number; align: "center" | "left" } | null;
  lockup: { y: number; size: number };
  tagline: { y: number; size: number; lines: number };
  cta: { y: number; size: number; urlInline: boolean };
  url: { y: number; size: number };
  /** Bottom scrim start, as a fraction of the height (full-bleed only). */
  scrimFrom?: number;
}

function adLayout(id: CanvasFormatId): AdLayout {
  switch (id) {
    case "vertical":
      return {
        // brand on top, Phoenix in the middle, copy underneath; clear of the platform UI at both ends
        band: { y: 620, zoom: 1 },
        margin: 80,
        hook: { y: 1390, size: 74, lines: 2 },
        callout: { y: 1420, size: 70 },
        bug: { x: 540, y: 460, size: 60, align: "center" },
        lockup: { y: 460, size: 60 },
        tagline: { y: 1370, size: 68, lines: 2 },
        cta: { y: 1580, size: 26, urlInline: false },
        url: { y: 1670, size: 28 },
      };
    case "square":
      return {
        band: { y: 205, zoom: 1 },
        margin: 64,
        hook: { y: 128, size: 50, lines: 1 },
        callout: { y: 128, size: 50 },
        bug: { x: 540, y: 935, size: 44, align: "center" },
        lockup: { y: 868, size: 50 },
        tagline: { y: 128, size: 50, lines: 1 },
        cta: { y: 968, size: 19, urlInline: true },
        url: { y: 968, size: 22 },
      };
    case "portrait":
      return {
        band: { y: 330, zoom: 1 },
        margin: 72,
        hook: { y: 200, size: 60, lines: 2 },
        callout: { y: 220, size: 58 },
        bug: { x: 540, y: 1060, size: 46, align: "center" },
        lockup: { y: 1000, size: 56 },
        tagline: { y: 158, size: 58, lines: 2 },
        cta: { y: 1125, size: 22, urlInline: false },
        url: { y: 1215, size: 25 },
      };
    default: {
      // 16:9 landscape (and the X image size): full bleed, copy in the lower third over the tail
      const f = CANVAS_FORMATS[id];
      const k = f.h / 1080;
      return {
        band: null,
        margin: 96 * k,
        hook: { y: 905 * k, size: 68 * k, lines: 1 },
        callout: { y: 915 * k, size: 64 * k },
        bug: { x: 96 * k, y: 92 * k, size: 44 * k, align: "left" },
        lockup: { y: 742 * k, size: 58 * k },
        tagline: { y: 862 * k, size: 60 * k, lines: 1 },
        cta: { y: 962 * k, size: 21 * k, urlInline: true },
        url: { y: 962 * k, size: 24 * k },
        scrimFrom: 0.5,
      };
    }
  }
}

/**
 * One frame of the video advert at time `t` (seconds, 0 … AD_DURATION).
 * `frame` is the source frame for min(t, SOURCE_DURATION).
 */
export function drawAdFrame(ctx: Ctx, id: CanvasFormatId, t: number, frame: FrameSource | null, input: CreativeCopy) {
  const copy = guard(input);
  const { w: W, h: H } = CANVAS_FORMATS[id];
  const L = adLayout(id);
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // footage
  let bandBottom = H;
  if (L.band) {
    drawBackdrop(ctx, frame, W, H, 0.4);
    if (frame) bandBottom = L.band.y + drawBand(ctx, frame, W, L.band.y, L.band.zoom);
  } else {
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, W, H);
    if (frame) drawFull(ctx, frame, W, H);
  }
  vignette(ctx, W, H, 0.5);

  const finalA = win(t, T.flash - 0.1, Infinity, 0.8);
  if (!L.band) {
    // lower-third scrim: light while callouts read, deeper for the end screen
    const textA = Math.max(win(t, T.hook[0] - 0.2, T.callouts[1] + 0.1, 0.5, 0.4) * 0.62, finalA * 0.9);
    scrim(ctx, W, H * (L.scrimFrom ?? 0.5), H, textA);
  }
  embers(ctx, t, W, H, L.band ? 70 : 60, 0.55 + 0.35 * win(t, 0.4, Infinity, 1.5));

  const cx = W / 2;
  const maxW = W - L.margin * 2;

  // corner brand bug, so muted autoplay always shows whose ad this is
  const bugA = win(t, T.bug[0], T.bug[1], 0.6, 0.4);
  if (L.bug && bugA > 0) {
    ctx.save();
    ctx.globalAlpha = bugA * 0.92;
    drawLockup(ctx, L.bug.x, L.bug.y, L.bug.size, L.bug.align);
    ctx.restore();
  }

  // hook
  const hookA = win(t, T.hook[0], T.hook[1], 0.5, 0.3);
  if (hookA > 0) {
    ctx.save();
    ctx.globalAlpha = hookA;
    const rise = (1 - easeOut((t - T.hook[0]) / 0.7)) * L.hook.size * 0.35;
    const bottom = drawBlock(ctx, copy.hook, cx, L.hook.y + rise, { size: L.hook.size, weight: 700, tracking: 0.04 }, maxW, L.hook.lines);
    rule(ctx, cx, bottom + L.hook.size * 0.25, maxW * 0.5 * easeOut((t - T.hook[0] - 0.2) / 0.8), hookA);
    ctx.restore();
  }

  // feature callouts, one at a time
  const calls = copy.callouts.filter((c) => c.trim()).slice(0, 3);
  if (calls.length) {
    const [c0, c1] = T.callouts;
    const slot = (c1 - c0) / calls.length;
    calls.forEach((text, i) => {
      const a0 = c0 + i * slot;
      const a = win(t, a0, a0 + slot - 0.05, 0.35, 0.3);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      const rise = (1 - easeOut((t - a0) / 0.6)) * L.callout.size * 0.3;
      const idx = `${String(i + 1).padStart(2, "0")} / ${String(calls.length).padStart(2, "0")}`;
      drawSegs(ctx, [{ text: idx, gold: false }], cx, L.callout.y - L.callout.size * 1.15 + rise, { size: Math.max(L.callout.size * 0.36, 18), family: FONTS.mono, weight: 400, tracking: 0.3, color: "rgba(255, 228, 175, 1)" });
      const bottom = drawBlock(ctx, text, cx, L.callout.y + rise, { size: L.callout.size, weight: 700, tracking: 0.03 }, maxW, 2);
      rule(ctx, cx, bottom + L.callout.size * 0.2, maxW * 0.36 * easeOut((t - a0 - 0.1) / 0.6), a);
      ctx.restore();
    });
  }

  // transition flash into the wingspan
  const flash = Math.max(0, 1 - Math.abs(t - T.flash) / 0.35);
  if (flash > 0) glow(ctx, cx, (L.band ? L.band.y + (bandBottom - L.band.y) * 0.3 : H * 0.3), Math.max(W, H) * 0.6, "255, 190, 90", 0.28 * flash);

  // end screen
  const lockA = win(t, T.lockup, Infinity, 0.7);
  if (lockA > 0) {
    ctx.save();
    ctx.globalAlpha = lockA;
    glow(ctx, cx, L.lockup.y, L.lockup.size * 4, "153, 69, 255", 0.22 * lockA);
    const s = 0.94 + 0.06 * easeOut((t - T.lockup) / 0.9);
    ctx.translate(cx, L.lockup.y);
    ctx.scale(s, s);
    drawLockup(ctx, 0, 0, L.lockup.size, "center", lockA);
    ctx.restore();
  }
  const tagA = win(t, T.tagline, Infinity, 0.6);
  if (tagA > 0) {
    ctx.save();
    ctx.globalAlpha = tagA;
    const rise = (1 - easeOut((t - T.tagline) / 0.7)) * L.tagline.size * 0.3;
    drawBlock(ctx, copy.tagline, cx, L.tagline.y + rise, { size: L.tagline.size, weight: 700, tracking: 0.03 }, maxW, L.tagline.lines);
    ctx.restore();
  }
  const ctaA = win(t, T.cta, Infinity, 0.5);
  const urlA = win(t, T.url, Infinity, 0.5);
  const urlStyle: TextStyle = { size: L.url.size, family: FONTS.mono, weight: 400, tracking: 0.08, color: C.mist };
  if (L.cta.urlInline) {
    // [ENTER THE HATCHERY →]  example.app, centred as one row (just the button when there is no URL)
    const pillW = measureSegs(ctx, [{ text: `${copy.cta.toUpperCase()}  →`, gold: false }], { size: L.cta.size, weight: 600, tracking: 0.2 }) + L.cta.size * 3.4;
    const gap = L.cta.size * 1.6;
    const urlW = copy.url ? measureSegs(ctx, [{ text: copy.url, gold: false }], urlStyle) : 0;
    const x0 = cx - (pillW + (urlW ? gap + urlW : 0)) / 2;
    if (ctaA > 0 && copy.cta) {
      ctx.save();
      ctx.globalAlpha = ctaA;
      drawPill(ctx, copy.cta, x0, L.cta.y, L.cta.size, "left");
      ctx.restore();
    }
    if (urlA > 0 && copy.url) {
      ctx.save();
      ctx.globalAlpha = urlA;
      drawSegs(ctx, [{ text: copy.url, gold: false }], x0 + pillW + gap, L.cta.y + L.url.size * 0.36, urlStyle, "left");
      ctx.restore();
    }
  } else {
    if (ctaA > 0 && copy.cta) {
      ctx.save();
      ctx.globalAlpha = ctaA;
      drawPill(ctx, copy.cta, cx, L.cta.y, L.cta.size);
      ctx.restore();
    }
    if (urlA > 0 && copy.url) {
      ctx.save();
      ctx.globalAlpha = urlA;
      drawSegs(ctx, [{ text: copy.url, gold: false }], cx, L.url.y, urlStyle);
      ctx.restore();
    }
  }

  // emerging from darkness
  const dark = 1 - easeInOut((t - T.open[0]) / (T.open[1] - T.open[0]));
  if (dark > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dark})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// ── Static creatives ────────────────────────────────────────────────────────

interface StaticLayout {
  split: boolean;
  band?: { y: number; zoom: number; dx: number };
  text: { x: number; y: number; w: number; align: CanvasTextAlign; size: number; lines: number };
  graphic: { x: number; y: number; w: number; h: number };
  footer: { y: number };
  margin: number;
}

function staticLayout(id: CanvasFormatId): StaticLayout {
  const { w: W, h: H } = CANVAS_FORMATS[id];
  switch (id) {
    case "square":
      return { split: false, band: { y: 300, zoom: 1, dx: 0 }, text: { x: W / 2, y: 132, w: 952, align: "center", size: 54, lines: 2 }, graphic: { x: 64, y: 790, w: 952, h: 190 }, footer: { y: 1028 }, margin: 64 };
    case "portrait":
      return { split: false, band: { y: 290, zoom: 1, dx: 0 }, text: { x: W / 2, y: 150, w: 940, align: "center", size: 58, lines: 1 }, graphic: { x: 70, y: 925, w: 940, h: 300 }, footer: { y: 1285 }, margin: 70 };
    case "vertical":
      return { split: false, band: { y: 600, zoom: 1, dx: 0 }, text: { x: W / 2, y: 330, w: 920, align: "center", size: 76, lines: 3 }, graphic: { x: 80, y: 1190, w: 920, h: 400 }, footer: { y: 1690 }, margin: 80 };
    case "poster-4x5":
      // the wings-raised still fits a larger band without losing a wingtip
      return { split: false, band: { y: 330, zoom: 1.22, dx: 0 }, text: { x: W / 2, y: 175, w: 960, align: "center", size: 74, lines: 2 }, graphic: { x: 60, y: 1010, w: 960, h: 210 }, footer: { y: 1292 }, margin: 60 };
    case "poster":
      return { split: false, band: { y: 450, zoom: 1.3, dx: 0 }, text: { x: W / 2, y: 225, w: 1040, align: "center", size: 92, lines: 2 }, graphic: { x: 80, y: 1265, w: 1040, h: 300 }, footer: { y: 1665 }, margin: 80 };
    default: {
      const k = H / 900;
      return { split: true, text: { x: 96 * k, y: 262 * k, w: W * 0.42, align: "left", size: 64 * k, lines: 3 }, graphic: { x: 96 * k, y: 0, w: W * 0.42, h: 300 * k }, footer: { y: 800 * k }, margin: 96 * k };
    }
  }
}

/** A still creative. `frame` should be a source still (see `STILLS`); split layouts suit `wingsRaised`. */
export function drawStatic(ctx: Ctx, id: CanvasFormatId, graphic: Graphic, frame: FrameSource | null, input: CreativeCopy, data: GraphicData) {
  const copy = guard(input);
  const { w: W, h: H } = CANVAS_FORMATS[id];
  const L = staticLayout(id);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  drawBackdrop(ctx, frame, W, H, L.split ? 0.35 : 0.5);
  if (frame) {
    if (L.split) drawFull(ctx, frame, W, H, 0.22);
    else if (L.band) drawBand(ctx, frame, W, L.band.y, L.band.zoom, L.band.dx);
  }
  vignette(ctx, W, H, 0.45);
  if (L.split) {
    const g = ctx.createLinearGradient(0, 0, W * 0.6, 0);
    g.addColorStop(0, "rgba(5,4,10,0.82)");
    g.addColorStop(1, "rgba(5,4,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else {
    scrim(ctx, W, L.graphic.y - 160, H, 0.85);
    scrim(ctx, W, (L.band?.y ?? 0) + 140, 0, 0.6);
  }
  embers(ctx, 3.3, W, H, 55, 0.7);

  const t = L.text;
  const unit = t.size / 64;
  let y = t.y;
  if (copy.eyebrow) {
    drawSegs(ctx, [{ text: copy.eyebrow.toUpperCase(), gold: false }], t.x, y - t.size * 1.2, { size: 18 * unit, family: FONTS.mono, weight: 400, tracking: 0.32, color: "rgba(255, 214, 140, 0.9)" }, t.align);
  }
  y = drawBlock(ctx, copy.headline, t.x, y, { size: t.size, weight: 700, tracking: 0.02 }, t.w, t.lines, t.align, 1.1);
  if (copy.sub) y = drawBlock(ctx, copy.sub, t.x, y + t.size * 0.62, { size: t.size * 0.36, family: FONTS.sans, weight: 400, color: C.mist, tracking: 0 }, t.w, 3, t.align, 1.45);

  const gr = L.split ? { ...L.graphic, y: y + t.size * 0.55, h: L.footer.y - (y + t.size * 0.55) - t.size * 0.9 } : L.graphic;
  drawGraphic(ctx, graphic, gr, L.split ? "left" : "center", unit, copy, data);

  // footer: lockup and URL
  const fy = L.footer.y;
  if (L.split) {
    const lw = drawLockup(ctx, L.margin, fy, 38 * unit, "left");
    const foot = copy.url || copy.signoff;
    if (foot) drawSegs(ctx, [{ text: foot, gold: false }], L.margin + lw + 36 * unit, fy + 7 * unit, { size: 19 * unit, family: FONTS.mono, weight: 400, tracking: copy.url ? 0.08 : 0.22, color: copy.url ? C.mist : "rgba(255, 222, 160, 0.9)" }, "left");
  } else {
    const ms = id === "square" ? 36 : 44;
    const st: TextStyle = { size: ms * 0.5, family: FONTS.mono, weight: 400, tracking: 0.08, color: C.mist };
    const lockW = ms + ms * 0.38 + measureSegs(ctx, [{ text: "SOLANITES", gold: false }], { size: ms * 0.5, weight: 600, tracking: 0.24 });
    const foot = copy.url || copy.signoff;
    if (!copy.url) Object.assign(st, { tracking: 0.22, color: "rgba(255, 222, 160, 0.9)" });
    const urlW = foot ? measureSegs(ctx, [{ text: foot, gold: false }], st) : 0;
    const gap = ms * 0.9;
    const x0 = W / 2 - (lockW + (urlW ? gap + urlW : 0)) / 2;
    drawLockup(ctx, x0, fy, ms, "left");
    if (urlW) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x0 + lockW + gap / 2 - 0.75, fy - ms * 0.3, 1.5, ms * 0.6);
      drawSegs(ctx, [{ text: foot, gold: false }], x0 + lockW + gap, fy + st.size * 0.36, st, "left");
    }
  }
  ctx.restore();
}

function chip(ctx: Ctx, text: string, x: number, cy: number, size: number, dot?: string) {
  const st: TextStyle = { size, family: FONTS.mono, weight: 400, tracking: 0.16, color: C.white, shadow: false };
  const tw = measureSegs(ctx, [{ text, gold: false }], st);
  const padX = size * 1.1;
  const dotW = dot ? size * 1.1 : 0;
  const w = tw + padX * 2 + dotW;
  const h = size * 2.3;
  ctx.save();
  roundRect(ctx, x, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (dot) {
    ctx.fillStyle = dot;
    ctx.shadowColor = dot;
    ctx.shadowBlur = size;
    ctx.beginPath();
    ctx.arc(x + padX + size * 0.3, cy, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  drawSegs(ctx, [{ text, gold: false }], x + padX + dotW, cy + size * 0.36, st, "left");
  return w;
}

/** Lays chips out in centred or left-aligned rows. */
function chipRows(ctx: Ctx, items: { text: string; dot?: string }[], r: { x: number; y: number; w: number; h: number }, align: "left" | "center", size: number) {
  const st: TextStyle = { size, family: FONTS.mono, weight: 400, tracking: 0.16 };
  const gap = size * 0.7;
  const widths = items.map((it) => measureSegs(ctx, [{ text: it.text, gold: false }], st) + size * 2.2 + (it.dot ? size * 1.1 : 0));
  const rows: number[][] = [[]];
  let rowW = 0;
  widths.forEach((w, i) => {
    if (rowW && rowW + gap + w > r.w) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(i);
    rowW += (rowW ? gap : 0) + w;
  });
  const rowH = size * 2.3 + gap;
  rows.forEach((row, ri) => {
    const total = row.reduce((s, i) => s + widths[i], 0) + gap * (row.length - 1);
    let x = align === "center" ? r.x + (r.w - total) / 2 : r.x;
    const cy = r.y + size * 1.15 + ri * rowH;
    row.forEach((i) => {
      chip(ctx, items[i].text, x, cy, size, items[i].dot);
      x += widths[i] + gap;
    });
  });
  return rows.length * rowH;
}

function fmtChance(c: number) {
  const p = c * 100;
  return `${p >= 10 ? p.toFixed(0) : String(Number(p.toFixed(1)))}%`;
}

function drawGraphic(ctx: Ctx, g: Graphic, r: { x: number; y: number; w: number; h: number }, align: "left" | "center", unit: number, copy: CreativeCopy, data: GraphicData) {
  const cx = align === "center" ? r.x + r.w / 2 : r.x;
  const ta: CanvasTextAlign = align;
  switch (g) {
    case "species": {
      const size = Math.min(17 * unit, r.h / 7);
      chipRows(ctx, data.elements.map((e) => ({ text: e.toUpperCase() })), r, align, size);
      return;
    }
    case "rarity": {
      const rows = data.rarities;
      const cols = r.h < 260 * unit ? 3 : 1;
      if (cols === 3) {
        const size = Math.min(16 * unit, r.h / 7);
        chipRows(ctx, rows.map((x) => ({ text: `${x.label.toUpperCase()} ${fmtChance(x.chance)}`, dot: x.color })), r, align, size);
        return;
      }
      const rowH = Math.min(r.h / rows.length, 52 * unit);
      const w = Math.min(r.w, 560 * unit);
      const x0 = align === "center" ? r.x + (r.w - w) / 2 : r.x;
      rows.forEach((x, i) => {
        const cy = r.y + rowH * (i + 0.5);
        ctx.save();
        ctx.fillStyle = x.color;
        ctx.shadowColor = x.color;
        ctx.shadowBlur = 14 * unit;
        ctx.beginPath();
        ctx.arc(x0 + 8 * unit, cy, 7 * unit, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawSegs(ctx, [{ text: x.label.toUpperCase(), gold: false }], x0 + 30 * unit, cy + 8 * unit, { size: 21 * unit, weight: 600, tracking: 0.12, color: C.white }, "left");
        if (x.classified) drawSegs(ctx, [{ text: "CLASSIFIED", gold: false }], x0 + w * 0.56, cy + 6 * unit, { size: 14 * unit, family: FONTS.mono, weight: 400, tracking: 0.22, color: "rgba(214,204,255,0.85)" }, "left");
        drawSegs(ctx, [{ text: fmtChance(x.chance), gold: false }], x0 + w, cy + 8 * unit, { size: 21 * unit, family: FONTS.mono, weight: 400, tracking: 0.04, color: C.gold1 }, "right");
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.fillRect(x0, cy + rowH / 2 - 0.5, w, 1);
      });
      return;
    }
    case "stages": {
      // Dormant → Awakening → Stirring → Ready to Hatch, then the forms
      const steps = data.eggStages;
      const w = Math.min(r.w, 900 * unit);
      const x0 = align === "center" ? r.x + (r.w - w) / 2 : r.x;
      const cy = r.y + 26 * unit;
      const step = w / (steps.length - 1);
      ctx.save();
      const line = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      line.addColorStop(0, "rgba(176,124,255,0.7)");
      line.addColorStop(1, "rgba(255,196,90,0.9)");
      ctx.fillStyle = line;
      ctx.fillRect(x0, cy - 1, w, 2);
      ctx.restore();
      steps.forEach((s, i) => {
        const x = x0 + step * i;
        const last = i === steps.length - 1;
        ctx.save();
        ctx.fillStyle = last ? C.gold1 : "#0d0b18";
        ctx.strokeStyle = last ? C.gold0 : "rgba(200,180,255,0.8)";
        ctx.lineWidth = 2 * unit;
        ctx.shadowColor = last ? "rgba(255,170,60,0.9)" : "rgba(153,69,255,0.8)";
        ctx.shadowBlur = 16 * unit;
        ctx.beginPath();
        ctx.ellipse(x, cy, 11 * unit, 14 * unit, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        const lAlign: CanvasTextAlign = i === 0 ? "left" : last ? "right" : "center";
        const lx = i === 0 ? x - 11 * unit : last ? x + 11 * unit : x;
        drawSegs(ctx, [{ text: String(i + 1).padStart(2, "0"), gold: false }], lx, cy + 46 * unit, { size: 14 * unit, family: FONTS.mono, weight: 400, tracking: 0.3, color: "rgba(255,214,140,0.9)" }, lAlign);
        // long names ("Ready to Hatch") break onto two lines so neighbours never collide
        const words = s.toUpperCase().split(" ");
        const label = words.length > 1 && s.length > 10 ? [words.slice(0, -1).join(" "), words.at(-1)!] : [s.toUpperCase()];
        label.forEach((l, li) => drawSegs(ctx, [{ text: l, gold: false }], lx, cy + (72 + li * 20) * unit, { size: 15 * unit, weight: 600, tracking: 0.1, color: C.white }, lAlign));
      });
      const fy = cy + 132 * unit;
      if (fy + 30 * unit < r.y + r.h + 40 * unit) {
        drawSegs(ctx, [{ text: `THEN: ${data.forms.join("  →  ").toUpperCase()}`, gold: false }], align === "center" ? r.x + r.w / 2 : x0, fy, { size: 15 * unit, family: FONTS.mono, weight: 400, tracking: 0.16, color: C.mist }, ta);
      }
      return;
    }
    case "stats": {
      const n = copy.stats.length;
      if (!n) return;
      const w = Math.min(r.w, 900 * unit);
      const x0 = align === "center" ? r.x + (r.w - w) / 2 : r.x;
      const colW = w / n;
      const big = Math.min(76 * unit, r.h * 0.42);
      copy.stats.forEach((s, i) => {
        const x = x0 + colW * (i + 0.5);
        drawSegs(ctx, [{ text: s.value, gold: true }], x, r.y + big, { size: big, weight: 700, tracking: 0 });
        drawSegs(ctx, [{ text: s.label.toUpperCase(), gold: false }], x, r.y + big + big * 0.6, { size: Math.max(big * 0.24, 14 * unit), family: FONTS.mono, weight: 400, tracking: 0.22, color: C.mist });
        if (i) {
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(x0 + colW * i - 0.5, r.y + big * 0.15, 1, big * 1.2);
        }
      });
      return;
    }
    case "cta": {
      let y = r.y + 10 * unit;
      const pts = copy.points.slice(0, 3);
      pts.forEach((p) => {
        const st: TextStyle = { size: 19 * unit, family: FONTS.sans, weight: 500, color: C.white, tracking: 0 };
        const tw = measureSegs(ctx, [{ text: p, gold: false }], st);
        const bx = align === "center" ? cx - (tw + 26 * unit) / 2 : r.x;
        ctx.save();
        ctx.fillStyle = C.gold1;
        ctx.shadowColor = "rgba(255,170,60,0.9)";
        ctx.shadowBlur = 10 * unit;
        ctx.translate(bx + 7 * unit, y - 6 * unit);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4.5 * unit, -4.5 * unit, 9 * unit, 9 * unit);
        ctx.restore();
        drawSegs(ctx, [{ text: p, gold: false }], bx + 26 * unit, y, st, "left");
        y += 40 * unit;
      });
      if (copy.cta && y + 50 * unit < r.y + r.h + 60 * unit) drawPill(ctx, copy.cta, align === "center" ? cx : r.x, y + 34 * unit, 17 * unit, align);
      return;
    }
    case "choices": {
      // three tiles: drawn icons (no emoji fonts needed) over a label each
      const opts = copy.points.slice(0, 3);
      const icons = ["fire", "bolt", "eye"] as const;
      const tint = ["255, 176, 64", "176, 124, 255", "126, 232, 255"];
      const gap = 18 * unit;
      const tw = Math.min((r.w - gap * (opts.length - 1)) / opts.length, 330 * unit);
      const th = Math.min(r.h, 210 * unit);
      const total = tw * opts.length + gap * (opts.length - 1);
      const x0 = align === "center" ? r.x + (r.w - total) / 2 : r.x;
      const y0 = r.y + (r.h - th) / 2;
      opts.forEach((label, i) => {
        const x = x0 + i * (tw + gap);
        ctx.save();
        roundRect(ctx, x, y0, tw, th, 22 * unit);
        const bg = ctx.createLinearGradient(0, y0, 0, y0 + th);
        bg.addColorStop(0, `rgba(${tint[i]}, 0.16)`);
        bg.addColorStop(1, "rgba(10, 8, 20, 0.72)");
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = `rgba(${tint[i]}, 0.55)`;
        ctx.lineWidth = 1.6 * unit;
        ctx.stroke();
        ctx.restore();
        drawIcon(ctx, icons[i], x + tw / 2, y0 + th * 0.36, th * 0.3, tint[i]);
        drawBlock(ctx, label, x + tw / 2, y0 + th * 0.74, { size: 25 * unit, weight: 700, tracking: 0.06 }, tw - 28 * unit, 2, "center", 1.08);
      });
      return;
    }
    case "question": {
      drawSegs(ctx, [{ text: "REPLY WITH YOURS ↓", gold: false }], cx, r.y + 30 * unit, { size: 15 * unit, family: FONTS.mono, weight: 400, tracking: 0.3, color: "rgba(255,214,140,0.85)" }, ta);
      return;
    }
    case "phoenix":
    default:
      return;
  }
}

/** Small vector icons for the choices graphic, centred on (cx, cy). */
function drawIcon(ctx: Ctx, kind: "fire" | "bolt" | "eye", cx: number, cy: number, size: number, rgb: string) {
  const s = size / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.shadowColor = `rgba(${rgb}, 0.95)`;
  ctx.shadowBlur = 28;
  if (kind === "fire") {
    const g = ctx.createLinearGradient(0, -50, 0, 50);
    g.addColorStop(0, "#fff4cc");
    g.addColorStop(0.45, "#ffc24a");
    g.addColorStop(1, "#ff6a1f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.bezierCurveTo(14, -30, 38, -14, 36, 14);
    ctx.bezierCurveTo(35, 38, 18, 50, 0, 50);
    ctx.bezierCurveTo(-18, 50, -35, 38, -36, 16);
    ctx.bezierCurveTo(-37, -4, -24, -14, -18, -30);
    ctx.bezierCurveTo(-10, -16, -6, -10, -2, -8);
    ctx.bezierCurveTo(-4, -26, -6, -38, 0, -52);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 248, 220, 0.9)";
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(10, 14, 16, 22, 15, 32);
    ctx.bezierCurveTo(14, 42, 7, 46, 0, 46);
    ctx.bezierCurveTo(-7, 46, -14, 42, -15, 33);
    ctx.bezierCurveTo(-16, 22, -6, 14, 0, 2);
    ctx.fill();
  } else if (kind === "bolt") {
    const g = ctx.createLinearGradient(-30, -50, 30, 50);
    g.addColorStop(0, "#f0e2ff");
    g.addColorStop(0.5, "#b07cff");
    g.addColorStop(1, "#6b5bff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(10, -54);
    ctx.lineTo(-30, 6);
    ctx.lineTo(-4, 6);
    ctx.lineTo(-14, 54);
    ctx.lineTo(30, -10);
    ctx.lineTo(4, -10);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = "#dff9ff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-52, 0);
    ctx.quadraticCurveTo(0, -46, 52, 0);
    ctx.quadraticCurveTo(0, 46, -52, 0);
    ctx.closePath();
    ctx.stroke();
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.35, "#7ee8ff");
    g.addColorStop(1, "#2a6bff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#05040a";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── End card ────────────────────────────────────────────────────────────────

/** Clean end card: logo, key figures and the website CTA over a dimmed Phoenix. */
export function drawEndCard(ctx: Ctx, id: CanvasFormatId, frame: FrameSource | null, input: CreativeCopy) {
  const copy = guard(input);
  const { w: W, h: H } = CANVAS_FORMATS[id];
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  drawBackdrop(ctx, frame, W, H, 0.45);
  if (frame) {
    ctx.save();
    ctx.globalAlpha = 0.32;
    if (W / H > 1.5) drawFull(ctx, frame, W, H);
    else drawBand(ctx, frame, W, H * 0.16, 1);
    ctx.restore();
  }
  vignette(ctx, W, H, 0.75);
  embers(ctx, 5.2, W, H, 45, 0.6);

  const u = Math.min(W, H) / 1080;
  const tall = H / W > 1.2;
  const cx = W / 2;
  const unit = H / W > 1.5 ? u * 1.35 : tall ? u * 1.1 : u;
  // vertical rhythm, centred as a group
  const block = 620 * unit;
  let y = (H - block) / 2 + 60 * unit;
  // a dark pool behind the type keeps it crisp over the footage
  const pool = ctx.createRadialGradient(cx, H / 2, 0, cx, H / 2, Math.max(W, H) * 0.5);
  pool.addColorStop(0, "rgba(5,4,10,0.55)");
  pool.addColorStop(1, "rgba(5,4,10,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, W, H);
  glow(ctx, cx, y, 300 * unit, "153, 69, 255", 0.3);
  drawMark(ctx, cx, y, 96 * unit, 1);
  y += 120 * unit;
  drawSegs(ctx, [{ text: "SOLANITES", gold: false }], cx, y, { size: 46 * unit, weight: 600, tracking: 0.3 });
  y += 110 * unit;
  y = drawBlock(ctx, copy.tagline, cx, y, { size: 58 * unit, weight: 700, tracking: 0.02 }, W - 140 * u, 2) + 60 * unit;
  const statsW = Math.min(W - 140 * u, 860 * unit);
  drawGraphic(ctx, "stats", { x: cx - statsW / 2, y, w: statsW, h: 150 * unit }, "center", unit * 0.8, copy, { elements: [], rarities: [], eggStages: [], forms: [] });
  y += 170 * unit;
  if (copy.cta) drawPill(ctx, copy.cta, cx, y, 21 * unit);
  y += 80 * unit;
  if (copy.url) drawSegs(ctx, [{ text: copy.url, gold: false }], cx, y, { size: 26 * unit, family: FONTS.mono, weight: 400, tracking: 0.08, color: C.mist });
  ctx.restore();
}
