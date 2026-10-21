// Solanites X campaign video, 1920×1080, built to marketing/x-campaign/template/SPEC.md (scale 1.2).
const W = 1920, H = 1080, K = 1.2;
const C = { void: "#07060a", bone: "#efe8da", vellum: "#bdb3a3", dust: "#8c8374", gilt: "#e8b75c", violet: "125,92,240", deep: "#241a4d" };
const F = { serif: '"Cormorant Variable", "Cormorant", serif', sans: '"Inter Variable", sans-serif', mono: '"JetBrains Mono", monospace' };
const IMG = (window.IMG = {});
const DUR = 42;

const clamp = (x) => Math.min(1, Math.max(0, x));
const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x) => { const v = clamp(x); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const lerp = (a, b, k) => a + (b - a) * k;
const win = (t, a, b, fi = 0.6, fo = 0.5) => (t < a || t > b ? 0 : Math.min(eo((t - a) / fi), b === Infinity ? 1 : eio((b - t) / fo)));
function rnd(i) { let x = (i + 1) * 0x9e3779b1; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b); x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; }
const cache = new Map();
function cv(k, w, h) { let c = cache.get(k); if (!c) { c = document.createElement("canvas"); cache.set(k, c); } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const gilt = (ctx, y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#fff1c9"); g.addColorStop(0.5, "#e8b75c"); g.addColorStop(1, "#a8692a"); return g; };

// ── type ──
function tracked(ctx, text, x, y, size, font, tr, color, align = "left") {
  ctx.font = font; let w = 0; for (const ch of text) w += ctx.measureText(ch).width + tr * size; w -= tr * size;
  let cx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.fillStyle = color; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + tr * size; }
  return w;
}
// headline: "*word*" = italic 500 with gilt gradient; "\n" = line break
function headline(ctx, text, x, y, size, align = "left") {
  const lines = text.split("\n"), lh = size * 0.98;
  lines.forEach((ln, li) => {
    const parts = ln.split("*").map((t, i) => ({ t, it: i % 2 === 1 })).filter((p) => p.t);
    const font = (p) => (p.it ? `italic 500 ${size}px ${F.serif}` : `600 ${size}px ${F.serif}`);
    let w = 0; for (const p of parts) { ctx.font = font(p); w += ctx.measureText(p.t).width; }
    let cx = align === "center" ? x - w / 2 : x; const by = y + li * lh;
    for (const p of parts) {
      ctx.font = font(p); ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = size * 0.25;
      ctx.fillStyle = p.it ? gilt(ctx, by - size * 0.75, by + size * 0.15) : C.bone;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(p.t, cx, by); ctx.restore();
      cx += ctx.measureText(p.t).width;
    }
  });
  return y + (lines.length - 1) * lh;
}
function wrap(ctx, text, maxW, font) { ctx.font = font; const out = []; let cur = ""; for (const w of text.split(" ")) { const t = cur ? cur + " " + w : w; if (cur && ctx.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }

// ── brand ──
function lockup(ctx, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  const e = IMG.emblem, ew = 62 * K / 1.2, eh = ew * 96 / 112; ctx.drawImage(e, 86, 72, ew, eh);
  tracked(ctx, "SOLANITES", 86 + ew + 17, 72 + eh * 0.5 + 10, 30, `600 30px ${F.serif}`, 0.32, C.bone);
  ctx.restore();
}
function kicker(ctx, text, x, y, a = 1, align = "left") {
  ctx.save(); ctx.globalAlpha = a; const size = 17 * K;
  ctx.font = `400 ${size}px ${F.mono}`; let w = 0; for (const ch of text) w += ctx.measureText(ch).width + 0.3 * size;
  const ruleW = 28 * K, gap = 14 * K, total = ruleW + gap + w - 0.3 * size;
  const x0 = align === "center" ? x - total / 2 : x;
  ctx.fillStyle = gilt(ctx, y - 10, y + 2); ctx.fillRect(x0, y - size * 0.32, ruleW, 1.6);
  tracked(ctx, text, x0 + ruleW + gap, y, size, `400 ${size}px ${F.mono}`, 0.3, C.gilt);
  ctx.restore();
}
function support(ctx, text, x, y, a = 1, maxW = 560 * K) {
  ctx.save(); ctx.globalAlpha = a; const size = 27 * K, font = `400 ${size}px ${F.sans}`;
  wrap(ctx, text, maxW, font).forEach((l, i) => { ctx.font = font; ctx.fillStyle = C.vellum; ctx.fillText(l, x, y + i * size * 1.42); });
  ctx.restore();
}
function pill(ctx, text, x, y, a = 1) {
  ctx.save(); ctx.globalAlpha = a; const size = 17 * K; ctx.font = `600 ${size}px ${F.mono}`;
  let w = 0; for (const ch of text) w += ctx.measureText(ch).width + 0.24 * size; w -= 0.24 * size;
  const ph = size * 2, pw = w + size * 2; rr(ctx, x, y - ph / 2, pw, ph, ph / 2); ctx.fillStyle = gilt(ctx, y - ph / 2, y + ph / 2); ctx.shadowColor = "rgba(232,183,92,.45)"; ctx.shadowBlur = 22; ctx.fill(); ctx.shadowColor = "transparent";
  tracked(ctx, text, x + size, y + size * 0.36, size, `600 ${size}px ${F.mono}`, 0.24, C.void); ctx.restore();
}
// footer right: "In-game art · <name>" with name in gilt; optional outlined label
function footer(ctx, left, right, name = "", outlined = false, a = 1) {
  ctx.save(); ctx.globalAlpha = a; const size = 15 * K, y = H - 62, font = `400 ${size}px ${F.mono}`;
  if (left) tracked(ctx, left, 86, y, size, font, 0.22, C.dust);
  if (right) {
    const full = right.toUpperCase() + (name ? " · " : ""); ctx.font = font;
    const meas = (s) => { let w = 0; for (const ch of s) w += ctx.measureText(ch).width + 0.22 * size; return w; };
    const wAll = meas(full) + (name ? meas(name.toUpperCase()) : 0) - 0.22 * size; let x = W - 86 - wAll;
    if (outlined) { const ph = size * 2.1; rr(ctx, x - size, y - size * 1.35, wAll + size * 2, ph, ph / 2); ctx.strokeStyle = C.gilt; ctx.lineWidth = 1.5; ctx.stroke(); }
    x += tracked(ctx, full, x, y, size, font, 0.22, outlined ? C.gilt : C.dust) + 0.22 * size;
    if (name) tracked(ctx, name.toUpperCase(), x, y, size, font, 0.22, C.gilt);
  }
  ctx.restore();
}

// ── background ──
function backdrop(ctx, t, heroGlow = 1) {
  ctx.fillStyle = C.void; ctx.fillRect(0, 0, W, H);
  const rg = (x, y, r, col, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  rg(0, H, 900, "36,26,77", 0.85);
  rg(1380, 540, 760, C.violet, 0.2 * heroGlow);
  rg(1500, 380, 520, "232,183,92", 0.05 * heroGlow);
  for (let i = 0; i < 110; i++) {
    const r = (k) => rnd(i * 5 + k); const x = r(0) * W, y = r(1) * H, s = 0.6 + 1.6 * r(2) * r(2);
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.6 + r(3) * 1.5) + i)), k = r(4);
    ctx.fillStyle = k < 0.7 ? `rgba(239,232,218,${0.55 * tw})` : k < 0.88 ? `rgba(255,241,201,${0.7 * tw})` : `rgba(164,140,255,${0.6 * tw})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
}
function embers(ctx, t, a, x0 = 900, x1 = W) {
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 45; i++) {
    const r = (k) => rnd(900 + i * 7 + k), sp = (0.03 + 0.06 * r(1)) * H, span = H * 1.15;
    const y = H * 1.05 - ((r(2) * span + t * sp) % span), x = x0 + r(0) * (x1 - x0) + Math.sin(t * (0.4 + r(3)) + i) * 20, s = 1.2 + 3 * r(5) * r(5);
    const f = 0.5 + 0.5 * Math.sin(t * (2 + r(6) * 3) + i), g = ctx.createRadialGradient(x, y, 0, x, y, s * 4);
    g.addColorStop(0, `rgba(255,${r(8) < 0.5 ? 196 : 150},90,${0.85 * a * f})`); g.addColorStop(1, "rgba(255,150,60,0)"); ctx.fillStyle = g; ctx.fillRect(x - s * 4, y - s * 4, s * 8, s * 8);
  }
  ctx.restore();
}

// ── heroes ──
const HERO = { x: 926, y: 86, w: 908, h: 908, cx: 1380, cy: 540 };
function frameCard(ctx, img, src, dx, dy, dw, dh, a = 1, r = 22) {
  if (!img || a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = `rgba(${C.violet},.45)`; ctx.shadowBlur = 80; rr(ctx, dx, dy, dw, dh, r); ctx.fillStyle = C.void; ctx.fill(); ctx.shadowColor = "transparent";
  ctx.save(); rr(ctx, dx, dy, dw, dh, r); ctx.clip(); ctx.imageSmoothingQuality = "high";
  if (src) ctx.drawImage(img, src[0], src[1], src[2], src[3], dx, dy, dw, dh); else ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore(); rr(ctx, dx, dy, dw, dh, r); ctx.strokeStyle = "rgba(232,183,92,.35)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
function creature(ctx, img, cx, cy, size, a = 1, glow = 0.5) {
  if (!img || a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(cx, cy + size * 0.1, 0, cx, cy + size * 0.1, size * 0.6); g.addColorStop(0, `rgba(232,183,92,${0.18 * glow})`); g.addColorStop(1, "rgba(232,183,92,0)"); ctx.fillStyle = g; ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
  ctx.imageSmoothingQuality = "high"; ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size); ctx.restore();
}
function plate(ctx, key, t, t0, a, extra) {
  if (a <= 0) return; const k = (t - t0) / 4, s = 1 + 0.06 * k, size = 860 * s;
  const off = cv("plate", 908, 908), o = off.getContext("2d"); o.clearRect(0, 0, 908, 908);
  o.imageSmoothingQuality = "high"; o.drawImage(IMG[key + "-plate"], 454 - size / 2, 454 - size / 2, size, size);
  if (extra) extra(o, size);
  o.globalCompositeOperation = "destination-in"; const g = o.createRadialGradient(454, 454, 330, 454, 454, 454); g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)"); o.fillStyle = g; o.fillRect(0, 0, 908, 908); o.globalCompositeOperation = "source-over";
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(off, HERO.x, HERO.y); ctx.restore();
}

// ── copy block: kicker / headline / support / pill, vertically centred in the copy column ──
function copy(ctx, t, t0, t1, k, h, s, extra) {
  const a = win(t, t0, t1, 0.7, 0.45); if (a <= 0) return;
  const rise = (1 - eo((t - t0) / 0.9)) * 26, size = 118 * K, lines = h.split("\n").length;
  const sLines = s ? wrap(ctx, s, 560 * K, `400 ${27 * K}px ${F.sans}`).length : 0;
  const blockH = 40 + size * 0.98 * lines + (s ? 34 + sLines * 27 * K * 1.42 : 0) + (extra ? 80 : 0);
  let y = 540 - blockH / 2 + rise;
  ctx.save(); ctx.globalAlpha = a;
  kicker(ctx, k, 86, y + 10); y += 40 + size * 0.78;
  const end = headline(ctx, h, 86, y, size); y = end + size * 0.22 + 34 + 27 * K * 0.8;
  if (s) { support(ctx, s, 86, y); y += sLines * 27 * K * 1.42; }
  if (extra) extra(y + 34);
  ctx.restore();
}

// ── timeline ──
const SCN = [
  // [start, end, kicker, headline, support, footerRight, name, outlined, caption]
  [0, 3.5, "GENESIS HATCHERY", "28 creatures.\nSealed in *eggs.*", "Hatch one. Raise it. Keep it.", "Key art", "", false, "28 creatures, sealed in eggs."],
  [3.5, 6.3, "THE HATCHERY", "Where every\negg *waits.*", "Your eggs live in the Hatchery, warming until they're ready to open.", "Hatchery demo · simulated data", "", true, "In the Hatchery, every egg waits to open."],
  [6.3, 10.5, "HATCHING", "It doesn't just\n*sit there.*", "It glows. It cracks. Then one day, it opens.", "Hatchery demo · simulated data", "", true, "It glows, it cracks, it hatches. Shown in demo mode."],
  [10.5, 14.5, "EVOLUTION", "One creature.\nFour *forms.*", "Eggling → Hatchling → Evolved → Ascended.", "In-game art", "Pyraurum", false, "Every creature grows through four forms."],
  [14.5, 18.5, "THE BLOODLINES", "Six\n*bloodlines.*", "From Common to Secret.", "Real site capture", "The bloodlines", false, "Six rarity tiers, from Common to Secret."],
  [18.5, 22.5, "THE COLLECTION", "28 species.\nNo two *alike.*", "Each with its own body, face and element.", "Real site capture", "The Collection", false, "28 species, each one different."],
  [22.5, 26, "YOUR COLLECTION", "It grows\n*with you.*", "Watch every Solanite climb from Eggling to Ascended.", "In-game art", "Velynx", false, "Your Solanites grow from Eggling to Ascended."],
  [26, 30, "HALL OF KEEPERS", "The Keepers'\n*board.*", "Most evolved. Longest held. Rarest finds.", "In-game art", "Aurelion", false, "A leaderboard for keepers. Live soon."],
  [30, 34, "MYTHIC & SECRET", "The rarest\nof *all.*", "Six of the 28 species are Mythic or Secret.", "In-game art", "Genesis", false, "Six of the 28 species are Mythic or Secret."],
];
const END = 34;

window.drawFrame = function (ctx, t, clip, captions) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  const sc = SCN.findIndex(([a, b]) => t >= a && t < b);
  backdrop(ctx, t, t < END ? 1 : 0.8);
  const sa = (i) => (SCN[i] ? win(t, SCN[i][0] - (i ? 0.25 : 0), SCN[i][1] + 0.25, 0.5, 0.5) : 0);

  // S1 — the Phoenix bursts out, framed right of the copy column
  if (t < 3.75 && clip) {
    const a = sa(0), z = t < 1.95 ? 1.34 : lerp(1.34, 1.02, eio((t - 1.95) / 1.4));
    const fw = 1280 * z * 1.5, fh = 720 * z * 1.5, off = cv("s1", W, H), o = off.getContext("2d");
    o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, W, H); o.imageSmoothingQuality = "high"; o.drawImage(clip, 1380 - fw / 2, 540 - fh / 2, fw, fh);
    o.globalCompositeOperation = "destination-in"; const g = o.createLinearGradient(700, 0, 1180, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "#000"); o.fillStyle = g; o.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(off, 0, 0); ctx.restore(); embers(ctx, t, 0.8 * a);
  }
  // S2/S3 — real hatch, cropped per phase (the mock balance never appears)
  if (t >= 3.25 && t < 10.75 && clip) {
    const a = Math.max(sa(1), sa(2));
    let src, dw, dh;
    if (t < 5.0) { src = [100, 548, 960, 336]; dw = 908; dh = 318; }
    else if (t < 6.3) { src = [330, 176, 790, 520]; dw = 860; dh = 566; }
    else { const k = eio((t - 6.3) / 4.2); src = [lerp(400, 440, k), lerp(70, 100, k), lerp(640, 580, k), lerp(640, 580, k)]; dw = 720; dh = 720; }
    frameCard(ctx, clip, src, 1380 - dw / 2, 540 - dh / 2, dw, dh, a);
  }
  // S4 — Pyraurum's four painted forms appear in turn
  if (sa(3) > 0) {
    const a = sa(3), keys = ["pyraurum-1", "pyraurum-2", "pyraurum-3", "pyraurum-4"], sizes = [150, 215, 280, 350], xs = [1005, 1150, 1350, 1625];
    keys.forEach((k, i) => { const ai = a * eo((t - 10.6 - i * 0.45) / 0.6); creature(ctx, IMG[k], xs[i], 560 - sizes[i] * 0.12, sizes[i] * (0.92 + 0.08 * ai), ai, i === 3 ? 1 : 0.5); ctx.save(); ctx.globalAlpha = ai; tracked(ctx, ["EGGLING", "HATCHLING", "EVOLVED", "ASCENDED"][i], xs[i], 760, 15 * K, `400 ${15 * K}px ${F.mono}`, 0.22, i === 3 ? C.gilt : C.dust, "center"); ctx.restore(); });
  }
  // S5 — the site's six-tier cards (real capture), slow push
  // three tiers at a time, panning across all six
  if (sa(4) > 0) { const k = eio((t - 14.7) / 3.4); frameCard(ctx, IMG.rarity, [lerp(0, 1230, k), 0, 1230, 725], 926, 540 - 268, 908, 535, sa(4)); }
  // S6 — real Collection scroll
  if (sa(5) > 0 && clip) frameCard(ctx, clip, [0, 0, 1440, 900], 926, 540 - 284, 908, 568, sa(5));
  // S7 — Velynx grows through its stages
  if (sa(6) > 0) { const a = sa(6), st = Math.min(3, Math.floor((t - 22.6) / 0.85)), k = ((t - 22.6) % 0.85) / 0.85; for (let i = 0; i < 4; i++) { const ai = i === st ? Math.min(1, k * 3) : i === st - 1 ? 1 - Math.min(1, k * 3) : 0; if (i === 3 && st === 3) creature(ctx, IMG["velynx-4"], 1380, 520, 640, a, 1); else if (ai > 0) creature(ctx, IMG["velynx-" + (i + 1)], 1380, 520, 300 + i * 110, a * ai, 0.6); } ctx.save(); ctx.globalAlpha = a; tracked(ctx, ["EGGLING", "HATCHLING", "EVOLVED", "ASCENDED"][Math.max(0, Math.min(3, st))], 1380, 900, 15 * K, `400 ${15 * K}px ${F.mono}`, 0.22, C.gilt, "center"); ctx.restore(); }
  // S8 — Aurelion on its biome; S9 — GENESIS with its living glow
  if (sa(7) > 0) plate(ctx, "aurelion", t, 26, sa(7), (o, s) => { o.imageSmoothingQuality = "high"; o.drawImage(IMG["aurelion-4"], 454 - 330, 454 - 300, 660, 660); });
  if (sa(8) > 0) plate(ctx, "genesis", t, 30, sa(8), (o, s) => { o.save(); o.globalCompositeOperation = "lighter"; ["genesis-glow-2", "genesis-glow-3", "genesis-glow-4"].forEach((g, i) => { o.globalAlpha = 0.35 + 0.35 * Math.sin(t * (1.2 + i * 0.5) + i); o.drawImage(IMG[g], 454 - s / 2, 454 - s / 2, s, s); }); o.restore(); o.drawImage(IMG["genesis-4"], 454 - 300, 454 - 290, 600, 600); });

  // copy + footer per scene
  SCN.forEach(([a, b, k, h, s, fr, name, outlined], i) => {
    copy(ctx, t, a + (i ? 0.1 : 0.3), b + 0.05, k, h, s, i === 7 ? (y) => pill(ctx, "LIVE SOON", 86, y + 14) : null);
    const fa = win(t, a, b, 0.4, 0.3); if (fa > 0) footer(ctx, `${String(i + 1).padStart(2, "0")} / 09`, fr, name, outlined, fa);
  });

  // end card: full sigil, SOLANITES, kicker (no URL)
  const ea = win(t, END, Infinity, 1.0);
  if (ea > 0) {
    ctx.save(); ctx.globalAlpha = ea;
    const g = ctx.createRadialGradient(960, 430, 0, 960, 430, 520); g.addColorStop(0, `rgba(${C.violet},.28)`); g.addColorStop(1, `rgba(${C.violet},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const s = 300 * (0.94 + 0.06 * eo((t - END) / 1.6)); ctx.shadowColor = "rgba(232,183,92,.5)"; ctx.shadowBlur = 40; ctx.drawImage(IMG.sigil, 960 - s / 2, 400 - s / 2, s, s); ctx.shadowColor = "transparent";
    tracked(ctx, "SOLANITES", 960, 660, 76, `600 76px ${F.serif}`, 0.32, C.bone, "center");
    const ta = win(t, END + 0.9, Infinity, 0.8); ctx.globalAlpha = ea * ta;
    ctx.font = `italic 500 46px ${F.serif}`; ctx.fillStyle = C.vellum; ctx.textAlign = "center"; ctx.fillText("28 creatures sleep in sealed eggs.", 960, 750);
    ctx.globalAlpha = ea * win(t, END + 1.6, Infinity, 0.8); kicker(ctx, "THE HATCHING BEGINS SOON", 960, 840, 1, "center");
    ctx.restore();
  }
  lockup(ctx, win(t, 0.4, END - 0.2, 0.8, 0.6));
  embers(ctx, t + 7, t >= END ? 0.5 : 0.18, 0, W);

  // muted-viewing captions (separate export)
  if (captions) {
    const cur = SCN.find(([a, b]) => t >= a + 0.15 && t < b - 0.1), endCap = t >= END + 0.6 ? "Solanites. The hatching begins soon." : null;
    const text = cur ? cur[8] : endCap;
    if (text) {
      const ca = cur ? win(t, cur[0] + 0.15, cur[1] - 0.1, 0.25, 0.2) : win(t, END + 0.6, Infinity, 0.3);
      ctx.save(); ctx.globalAlpha = ca; const size = 36; ctx.font = `500 ${size}px ${F.sans}`; const tw = ctx.measureText(text).width;
      const y = H - 112; rr(ctx, 960 - tw / 2 - 26, y - size - 10, tw + 52, size + 34, 12); ctx.fillStyle = "rgba(7,6,10,.78)"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.fillText(text, 960, y); ctx.restore();
    }
  }
  const open = 1 - eio(t / 0.8); if (open > 0) { ctx.fillStyle = `rgba(0,0,0,${open})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
};
window.SCENES = SCN; window.DUR = DUR;
