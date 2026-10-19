// Solanites product reveal: the cinematic Phoenix, then genuine recordings of the website.
// One composition, three layouts, chosen by output shape:
//   16:9 main video (desktop recordings) · 9:16 cut (mobile recordings) · 4:5 short clips (?v=…)
// Every UI frame is an unaltered screen recording from captures/ (see capture.mjs); this file
// only frames, crops, scales and captions them. Captions state code-verified facts only.

const Q = new URL(import.meta.url).searchParams;
const VARIANT = Q.get("v") || "main";

// Verified against the release code (src/lib/species.ts, src/lib/rarity.ts, gameConfig):
// 28 species, 6 rarity tiers, 4 evolution forms per species; Pyraurum is a Legendary Ember phoenix.
export const APPROVED_TEXT = [
  "SOLANITES", "YOUR SOLANITE IS WAITING.", "YOUR SOLANITE", "IS WAITING.",
  "WATCH IT HATCH.", "28 SPECIES TO DISCOVER", "28 SPECIES", "TO DISCOVER",
  "ONE CREATURE. FOUR FORMS.", "ONE CREATURE.", "FOUR FORMS.",
  "SIX TIERS OF RARITY", "SIX TIERS", "OF RARITY",
  "FROM THE WEBSITE", "PYRAURUM · LEGENDARY",
];

// Shot lists. Times are output seconds; `src` is [start, end] seconds within the recording.
const MAIN = [
  { kind: "phoenix", t: [0, 2.35], src: [0.3, 2.65] },
  { kind: "ui", cap: "hero", t: [2.2, 5.5], src: [0.3, 3.6], caption: ["WATCH IT HATCH."] },
  { kind: "ui", cap: "collection", t: [5.4, 8.7], src: [0.6, 5.6], caption: ["28 SPECIES TO DISCOVER", "28 SPECIES", "TO DISCOVER"] },
  { kind: "ui", cap: "pyraurum", t: [8.6, 11.3], src: [0.5, 3.4], srcMobile: [2.8, 5.95], caption: ["ONE CREATURE. FOUR FORMS.", "ONE CREATURE.", "FOUR FORMS."] },
  { kind: "ui", cap: "rarity", t: [11.2, 13.9], src: [0.2, 3.6], srcMobile: [0.0, 2.9], caption: ["SIX TIERS OF RARITY", "SIX TIERS", "OF RARITY"] },
  { kind: "end", t: [13.8, 17.5] },
];
const CLIPS = {
  collection: [
    { kind: "phoenix", t: [0, 1.2], src: [1.2, 2.4] },
    { kind: "ui", cap: "collection", t: [1.05, 7.0], src: [0.2, 7.0], caption: ["28 SPECIES TO DISCOVER", "28 SPECIES", "TO DISCOVER"] },
    { kind: "end", t: [6.9, 9.0] },
  ],
  hatch: [
    { kind: "phoenix", t: [0, 1.2], src: [1.2, 2.4] },
    { kind: "ui", cap: "hero", t: [1.05, 9.6], src: [0.6, 13.4], caption: ["WATCH IT HATCH."] },
    { kind: "end", t: [9.5, 11.5] },
  ],
  rarity: [
    { kind: "phoenix", t: [0, 1.2], src: [1.2, 2.4] },
    { kind: "ui", cap: "rarity", t: [1.05, 5.6], src: [0.0, 4.0], srcMobile: [0.0, 2.9], caption: ["SIX TIERS OF RARITY", "SIX TIERS", "OF RARITY"] },
    { kind: "ui", cap: "pyraurum", t: [5.5, 8.6], src: [2.8, 5.95], caption: ["ONE CREATURE. FOUR FORMS.", "ONE CREATURE.", "FOUR FORMS."] },
    { kind: "end", t: [8.5, 10.5] },
  ],
};
const SHOTS = VARIANT === "main" ? MAIN : CLIPS[VARIANT];
export const DURATION = SHOTS.at(-1).t[1];

// Soundtrack cues for audio.py, derived from the shot list.
export function cuesFor(v = "main") {
  const shots = v === "main" ? MAIN : CLIPS[v];
  const dur = shots.at(-1).t[1];
  const ui = shots.filter(s => s.kind === "ui");
  const end = shots.at(-1).t[0];
  const chords = v === "main"
    ? [[0, 2.2, ["D3", "A3"], .11], [2.2, 5.45, ["D3", "F3", "A3"], .12], [5.45, 8.65, ["Bb2", "D3", "F3"], .12], [8.65, 11.25, ["C3", "E3", "G3"], .12], [11.25, end, ["F3", "A3", "C4"], .12], [end, dur, ["D3", "A3", "E4", "F4"], .12]]
    : [[0, end, ["D3", "F3", "A3"], .12], [end, dur, ["D3", "A3", "E4", "F4"], .12]];
  return {
    duration: dur, reveal: 0.25, flash: ui[0].t[0], cuts: ui.slice(1).map(s => s.t[0] + .05),
    riser2: [end - 1, end], end, tagline: end + .9, fadeOut: [dur - .6, dur], chords,
  };
}

let E, clip2, mark, seqs = {};
const FRAMES = "../captures/.frames";

// Where to look inside each recording (device pixels), per device. Filled from the real layouts.
const CROPS = {
  desktop: {
    // the egg and its lifecycle labels only: no balance, wallet or token copy in frame
    hero: [1145, 184, 821, 1026],
    collection: [0, 112, 2160, 1238], // below the fixed nav
    pyraurum: [700, 160, 1212, 640], // the four stage cards; the lore line stays out of frame
    rarity: [150, 430, 1860, 560], // the six tier cards, without the section copy
  },
  mobile: {
    hero: [0, 170, 860, 1070], // egg and lifecycle only; the token stats below stay out of frame
    collection: [0, 124, 860, 1740],
    pyraurum: [0, 150, 860, 1714],
    rarity: [0, 500, 860, 1364],
  },
};
const COUNTS = {};

export async function init(engine, { W, H }) {
  E = engine;
  const device = W > H ? "desktop" : "mobile";
  clip2 = E.sequence("../.cache/clip-2-rebirth", 302);
  mark = await E.loadImage(E.logoMarkSrc());
  for (const cap of ["hero", "collection", "pyraurum", "rarity"]) {
    const name = `${cap}-${device}`;
    const n = await countFrames(`${FRAMES}/${name}`);
    seqs[cap] = { seq: E.sequence(`${FRAMES}/${name}`, n), crop: CROPS[device][cap] };
  }
}
async function countFrames(dir) {
  if (COUNTS[dir]) return COUNTS[dir];
  let lo = 0, hi = 2000; // binary search the last frame that exists
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; (await exists(`${dir}/${String(mid).padStart(4, "0")}.jpg`)) ? (lo = mid) : (hi = mid - 1); }
  return (COUNTS[dir] = lo + 1);
}
const exists = src => fetch(src, { method: "HEAD" }).then(r => r.ok, () => false);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// A genuine recording in a floating glass panel. k = 0..1 progress through the shot.
async function panel(ctx, shot, t, { W, H, alpha, frame }) {
  const s = seqs[shot.cap], k = E.seg(t, shot.t[0], shot.t[1]);
  const range = W < H && shot.srcMobile ? shot.srcMobile : shot.src;
  const srcT = E.lerp(range[0], range[1], k);
  const img = await s.seq.frame(srcT * 30);
  let [cx, cy, cw, ch] = s.crop;
  const vertical = W < H, square = Math.abs(W / H - .8) < .01;
  // panel box
  const side = !vertical && !square && ch > cw; // a portrait crop on a landscape frame sits to the right
  const maxW = vertical || square ? W - 120 : side ? W * .4 : W * .8, maxH = vertical ? H * .79 : square ? H * .66 : side ? H * .8 : H * .72;
  if (shot.pan) { // drift the window across a wider crop
    const pw = Math.min(cw, ch * (maxW / maxH));
    cx = cx + (cw - pw) * E.ease.inOut(k); cw = pw;
  }
  const sc = Math.min(maxW / cw, maxH / ch);
  const pw = cw * sc, ph = ch * sc;
  const enter = E.ease.out(E.seg(t, shot.t[0], shot.t[0] + .45)), z = .965 + .035 * enter + .015 * k;
  const px = (side ? W * .68 : W / 2) - pw * z / 2, py = (vertical ? H * .565 : square ? H * .56 : side ? H * .5 : H * .56) - ph * z / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  roundRect(ctx, px, py, pw * z, ph * z, 22); ctx.fillStyle = "#06060c"; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.save(); roundRect(ctx, px, py, pw * z, ph * z, 22); ctx.clip();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, cx, cy, cw, ch, px, py, pw * z, ph * z);
  ctx.restore();
  roundRect(ctx, px + .5, py + .5, pw * z - 1, ph * z - 1, 22);
  const border = ctx.createLinearGradient(px, py, px + pw * z, py + ph * z);
  border.addColorStop(0, "rgba(255,210,140,.55)"); border.addColorStop(.5, "rgba(255,255,255,.12)"); border.addColorStop(1, "rgba(153,69,255,.45)");
  ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  return { px, py, pw: pw * z, ph: ph * z, side };
}

function caption(ctx, shot, t, box, { W, H, alpha }) {
  const vertical = W < H, U = Math.min(W, H) / 1080;
  const a = alpha * E.ease.out(E.seg(t, shot.t[0] + .25, shot.t[0] + .75)), rise = (1 - E.ease.out(E.seg(t, shot.t[0] + .25, shot.t[0] + .75))) * 14 * U;
  const [full, l1, l2] = shot.caption;
  if (box.side) { // caption to the left of a side panel
    const x = W * .1, y = H * .5;
    E.text(ctx, "FROM THE WEBSITE", x, y - 70 * U + rise, { size: 20 * U, weight: 400, family: "JetBrains Mono", tracking: .32, color: "rgba(255,210,140,.85)", alpha: a, align: "left" });
    E.text(ctx, full, x, y + 10 * U + rise, { size: 64 * U, weight: 800, gold: true, glow: .35, alpha: a, align: "left", maxWidth: W * .42 });
    return;
  }
  const top = box.py - (vertical ? 70 : 52) * U;
  E.text(ctx, "FROM THE WEBSITE", W / 2, top - (vertical ? (l2 ? 128 : 70) : 64) * U + rise, { size: 20 * U, weight: 400, family: "JetBrains Mono", tracking: .32, color: "rgba(255,210,140,.85)", alpha: a, shadow: true });
  if (vertical && l2) {
    E.text(ctx, l1, W / 2, top - 64 * U + rise, { size: 58 * U, weight: 800, alpha: a, maxWidth: W - 100 });
    E.text(ctx, l2, W / 2, top + rise, { size: 58 * U, weight: 800, gold: true, glow: .35, alpha: a, maxWidth: W - 100 });
  } else {
    E.text(ctx, full, W / 2, top + rise, { size: (vertical ? 58 : 50) * U, weight: 800, gold: true, glow: .35, alpha: a, maxWidth: W - 120 });
  }
}

async function backdrop(ctx, t, { W, H }) {
  // the Phoenix stays alive behind the interface, dim and soft
  // the calm final pose, so the backdrop never competes with the interface
  const img = await clip2.frame(E.lerp(8.2, 9.9, E.seg(t, 0, DURATION)) * 30);
  ctx.save(); ctx.filter = "brightness(.2) blur(14px) saturate(1.1)";
  E.place(ctx, img, W / 2, H / 2, E.coverScale(img, W, H) * 1.08);
  ctx.restore();
}

export async function draw(ctx, t, frame, { W, H }) {
  const vertical = W < H, U = Math.min(W, H) / 1080;
  const end = SHOTS.at(-1);
  if (t > SHOTS[0].t[1] - .3 && t < end.t[0] + .6) await backdrop(ctx, t, { W, H });

  for (const shot of SHOTS) {
    if (t < shot.t[0] - .01 || t > shot.t[1] + .01) continue;
    const fin = E.ease.sine(E.seg(t, shot.t[0], shot.t[0] + .3)), fout = 1 - E.ease.sine(E.seg(t, shot.t[1] - .3, shot.t[1]));
    if (shot.kind === "phoenix") {
      const k = E.seg(t, shot.t[0], shot.t[1]);
      const img = await clip2.frame(E.lerp(shot.src[0], shot.src[1], k) * 30);
      const s = E.coverScale(img, W, H) * (vertical ? 1.0 : 1.0) * (1.0 + .08 * k);
      E.place(ctx, img, W / 2, vertical ? H * .45 : H / 2, s, { ay: vertical ? .4 : .5, alpha: Math.min(1, fout + .0) });
    } else if (shot.kind === "ui") {
      const a = Math.min(fin, fout);
      const box = await panel(ctx, shot, t, { W, H, alpha: a, frame });
      caption(ctx, shot, t, box, { W, H, alpha: a });
    } else if (shot.kind === "end") {
      const a = E.ease.sine(E.seg(t, end.t[0], end.t[0] + .6));
      const img = await clip2.frame(E.lerp(7.4, 10.0, E.seg(t, end.t[0], end.t[1])) * 30);
      ctx.save(); ctx.filter = "brightness(.36) blur(2px)";
      E.place(ctx, img, W / 2, H / 2, E.coverScale(img, W, H) * E.lerp(1.04, 1.1, E.seg(t, end.t[0], end.t[1])), { alpha: a });
      ctx.restore();
      E.vignette(ctx, W, H, .7);
      const cy = H * (vertical ? .46 : .45);
      const m = E.ease.out(E.seg(t, end.t[0] + .3, end.t[0] + 1));
      E.logo(ctx, mark, W / 2, cy - 200 * U, 120 * U * (.9 + .1 * m), m);
      const wm = E.ease.out(E.seg(t, end.t[0] + .55, end.t[0] + 1.25));
      E.text(ctx, "SOLANITES", W / 2, cy - 20 * U + (1 - wm) * 14 * U, { size: 88 * U, weight: 700, tracking: .24, alpha: wm });
      const tg = E.ease.out(E.seg(t, end.t[0] + .9, end.t[0] + 1.6)), rise = (1 - tg) * 18 * U;
      if (vertical) {
        E.text(ctx, "YOUR SOLANITE", W / 2, cy + 130 * U + rise, { size: 70 * U, weight: 800, alpha: tg, maxWidth: W - 120 });
        E.text(ctx, "IS WAITING.", W / 2, cy + 220 * U + rise, { size: 70 * U, weight: 800, gold: true, glow: .45, alpha: tg, maxWidth: W - 120 });
      } else {
        E.text(ctx, "YOUR SOLANITE IS WAITING.", W / 2, cy + 120 * U + rise, { size: 58 * U, weight: 800, gold: true, glow: .45, alpha: tg, maxWidth: W - 160 });
      }
    }
  }
  // light flash out of the Phoenix hook into the interface
  const hook = SHOTS[0].t[1];
  E.fill(ctx, W, H, "rgb(255,214,150)", Math.exp(-Math.pow((t - (hook - .12)) / .13, 2)) * .65);

  E.embers(ctx, t, W, H, { seed: 11, count: 36, size: [1.5 * U, 4.5 * U], rise: [50, 140], alpha: .75 });
  E.smoke(ctx, t, W, H, { alpha: .08, scale: 1.8, vx: 14, vy: -9, tint: "rgb(150,120,190)", seed: 1 });
  E.vignette(ctx, W, H, .45, .65);
  E.grain(ctx, W, H, frame, .035);
  E.fill(ctx, W, H, "#000", 1 - E.ease.sine(E.seg(t, 0, .35)));
  E.fill(ctx, W, H, "#000", E.ease.sine(E.seg(t, DURATION - .6, DURATION)));
}
