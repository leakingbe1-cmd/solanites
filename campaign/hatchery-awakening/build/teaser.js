// "The Hatchery is awakening": 18 s teaser built from the six exported X teasers
// (campaign/x-teasers/export, read only) and the existing Runway Phoenix footage.
// Works at any size; 1080×1920 and 1920×1080 are the two exports.

export const DURATION = 18;

// Every string this composition may draw. The posters carry their own approved copy.
export const APPROVED_TEXT = ["SOLANITES", "THE HATCHERY", "IS AWAKENING.", "THE HATCHERY IS AWAKENING."];

// Beats the soundtrack is cut to (seconds).
export const CUES = {
  heartbeat: [1.9, 2.5],
  riser: [1.6, 3.0],
  reveal: 3.0,
  wings: 6.4,
  flash: 7.6,
  cuts: [9.15, 10.55, 11.95, 13.35],
  riser2: [13.6, 14.6],
  end: 14.6,
  tagline: 15.8,
  fadeOut: [17.3, 18],
  // [start, end, notes, gain]: D minor, i – VI – VII – i
  chords: [
    [0.0, 3.0, ["D2", "A2"], 0.10],
    [3.0, 7.75, ["D3", "F3", "A3"], 0.12],
    [7.75, 10.55, ["Bb2", "D3", "F3"], 0.13],
    [10.55, 14.6, ["C3", "E3", "G3"], 0.13],
    [14.6, 18.0, ["D3", "A3", "E4", "F4"], 0.12],
  ],
};

const TEASERS = "../../x-teasers/export";
const P = { awakening: "01-awakening", hatch: "02-which-creature", stirring: "03-stirring", fire: "04-fire-beginning", legendary: "05-legendary", shape: "06-taking-shape" };

let A, posters, clip1, clip2, mark;

export async function init(E, { W, H }) {
  A = E;
  const ratio = W < H ? "4x5" : "1x1";
  posters = {};
  for (const [k, f] of Object.entries(P)) posters[k] = await E.loadImage(`${TEASERS}/${ratio}/${f}.jpg`);
  clip1 = E.sequence("../.cache/clip-1-awakening", 152);
  clip2 = E.sequence("../.cache/clip-2-rebirth", 302);
  mark = await E.loadImage(E.logoMarkSrc());
}

// A poster card with its blurred self behind it (parallax) for the parts of the frame it doesn't cover.
function poster(ctx, img, k, { W, H, alpha = 1, zoom = [1.0, 1.05], drift = 14, anchor = [.5, .5], bgDrift = -30 }) {
  if (alpha <= 0) return;
  const E = A, vertical = W < H;
  const z = E.lerp(zoom[0], zoom[1], E.ease.sine(k));
  const bg = E.blurred(img, 46, .5);
  ctx.save(); ctx.globalAlpha = alpha;
  E.place(ctx, bg, W / 2 + (vertical ? 0 : bgDrift * (k - .5)), H / 2 + (vertical ? bgDrift * (k - .5) : 0), E.coverScale(bg, W, H) * 1.12 * (1 + .04 * k));
  ctx.restore();
  const base = vertical ? W / img.naturalWidth : H / img.naturalHeight;
  const f = vertical ? E.feathered(img, { top: .07, bottom: .07 }) : E.feathered(img, { left: .07, right: .07 });
  // the anchor point stays fixed on screen while the card zooms around it
  const x = W / 2 + (anchor[0] - .5) * img.naturalWidth * base;
  const y = H / 2 + (anchor[1] - .5) * img.naturalHeight * base + drift * (.5 - k);
  E.place(ctx, f, x, y, base * z, { ax: anchor[0], ay: anchor[1], alpha });
}

// Fully hide `m` of the frame top and bottom, then fade in over `ramp`.
function matted(img, m, ramp) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "destination-in";
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(m, "rgba(0,0,0,0)"); gr.addColorStop(Math.min(m + ramp, .5), "#000");
  gr.addColorStop(Math.max(1 - m - ramp, .5), "#000"); gr.addColorStop(1 - m, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  return c;
}

// The Runway footage, framed for the output: full-bleed at 16:9, a tall centre crop at 9:16.
// `matte` hides that fraction of the frame top and bottom behind a soft edge.
async function footage(ctx, seq, srcT, { W, H, alpha = 1, zoom = 1, anchor = [.5, .32], dim = 1, blur = 0, matte = 0 }) {
  if (alpha <= 0) return;
  const E = A, img = await seq.frame(srcT * 30);
  const vertical = W < H;
  const s = (vertical ? (H * .76) / img.naturalHeight : W / img.naturalWidth) * zoom;
  const edge = { top: vertical ? .14 : 0, bottom: vertical ? .16 : 0 };
  const f = matte > 0 ? matted(img, matte, vertical ? .16 : .1) : vertical ? E.feathered(img, edge) : img;
  ctx.save();
  if (dim !== 1 || blur) ctx.filter = `brightness(${dim})${blur ? ` blur(${blur}px)` : ""}`;
  const y = vertical ? H * .42 : H * .5;
  E.place(ctx, f, W / 2, y, s, { ax: .5, ay: vertical ? anchor[1] : .5, alpha });
  ctx.restore();
}

export async function draw(ctx, t, frame, { W, H, E }) {
  const vertical = W < H, U = Math.min(W, H) / 1080; // type scale

  // 1 · HOOK (0–3.4 s): the darkest teaser, slow push toward the eyes.
  if (t < 3.6) {
    const k = E.seg(t, 0, 3.4);
    const push = t < 3.0 ? E.lerp(1.0, 1.08, E.ease.sine(E.seg(t, 0, 3.0))) : E.lerp(1.08, 1.5, E.ease.in(E.seg(t, 3.0, 3.6)));
    const a = E.ease.out(E.seg(t, 0, .9)) * (1 - E.seg(t, 3.05, 3.55));
    poster(ctx, posters.stirring, k, { W, H, alpha: a, zoom: [push, push], drift: 0, anchor: [.5, .42] });
    // the eyes catch light on two heartbeats
    const img = posters.stirring, eyeY = H / 2 + (.42 - .5) * img.naturalHeight * (vertical ? W / img.naturalWidth : H / img.naturalHeight);
    for (const hb of [1.9, 2.5]) {
      const p = Math.exp(-Math.pow((t - hb - .08) / .12, 2));
      E.glow(ctx, W / 2, eyeY, 180 * U * push, "rgba(255,200,120,.55)", p * a);
    }
  }

  // 2 · PHOENIX REVEAL (3.0–7.9 s): the existing Runway awakening + rebirth footage, joined seamlessly.
  if (t >= 3.0 && t < 8.2) {
    const a = E.ease.out(E.seg(t, 3.0, 3.6));
    const zoom = E.lerp(1.0, 1.1, E.ease.sine(E.seg(t, 3.0, 7.9)));
    const src = 2.0 + (t - 3.0);
    const matte = .135 * (1 - E.ease.sine(E.seg(src, 3.0, 3.9)));
    if (t < 6.0) await footage(ctx, clip1, src, { W, H, alpha: a, zoom, matte });
    else await footage(ctx, clip2, Math.min(t - 6.0, 2.2), { W, H, alpha: 1, zoom });
    // flash on the wing beat into the montage
    const fl = Math.exp(-Math.pow((t - 7.75) / .16, 2));
    E.fill(ctx, W, H, "rgb(255,214,150)", fl * .7);
  }

  // 3 · MONTAGE (7.75–14.75 s): the remaining five teasers, crossfading with parallax.
  const order = [["awakening", [.5, .35]], ["fire", [.5, .45]], ["hatch", [.5, .4]], ["legendary", [.5, .4]], ["shape", [.5, .55]]];
  const start = 7.75, len = 1.4, xf = .35;
  order.forEach(([key, anchor], i) => {
    const a0 = start + i * len, a1 = a0 + len;
    if (t < a0 - xf || t > a1 + xf) return;
    const k = E.seg(t, a0 - xf, a1 + xf);
    // quick dip-through-dark crossfades, so two posters' copy never sits on top of each other
    const fadeIn = i === 0 ? E.seg(t, a0 - .05, a0 + .15) : E.ease.sine(E.seg(t, a0 - .02, a0 + .26));
    const fadeOut = i === order.length - 1 ? 1 - E.ease.sine(E.seg(t, 14.6, 15.1)) : 1 - E.ease.sine(E.seg(t, a1 - .2, a1 + .02));
    const zin = i % 2 === 0;
    poster(ctx, posters[key], k, { W, H, alpha: Math.min(fadeIn, fadeOut), zoom: zin ? [1.0, 1.06] : [1.07, 1.01], drift: zin ? 18 : -18, anchor, bgDrift: zin ? -40 : 40 });
  });
  if (t > 7.6 && t < 8.3) E.fill(ctx, W, H, "rgb(255,214,150)", Math.exp(-Math.pow((t - 7.75) / .16, 2)) * .7);

  // 4 · END CARD (14.6–18 s): the Phoenix settles in the dark behind the mark and the line.
  if (t >= 14.6) {
    const a = E.ease.sine(E.seg(t, 14.6, 15.3));
    await footage(ctx, clip2, E.lerp(7.6, 10.0, E.seg(t, 14.6, 18)), { W, H, alpha: a * .9, zoom: E.lerp(1.04, 1.12, E.seg(t, 14.6, 18)), dim: .34, blur: 2.5 });
    E.vignette(ctx, W, H, .75);
    const cy = vertical ? H * .47 : H * .44;
    const m = E.ease.out(E.seg(t, 15.0, 15.8));
    E.logo(ctx, mark, W / 2, cy - (vertical ? 250 : 190) * U, (vertical ? 150 : 120) * U * (.9 + .1 * m), m);
    const wm = E.ease.out(E.seg(t, 15.3, 16.1));
    E.text(ctx, "SOLANITES", W / 2, cy - 10 * U + (1 - wm) * 16 * U, { size: (vertical ? 96 : 92) * U, weight: 700, tracking: .24, alpha: wm });
    const tg = E.ease.out(E.seg(t, 15.8, 16.6)), rise = (1 - tg) * 22 * U;
    if (vertical) {
      E.text(ctx, "THE HATCHERY", W / 2, cy + 150 * U + rise, { size: 78 * U, weight: 800, gold: true, glow: .45, alpha: tg, maxWidth: W - 120 });
      E.text(ctx, "IS AWAKENING.", W / 2, cy + 248 * U + rise, { size: 78 * U, weight: 800, gold: true, glow: .45, alpha: tg, maxWidth: W - 120 });
    } else {
      E.text(ctx, "THE HATCHERY IS AWAKENING.", W / 2, cy + 140 * U + rise, { size: 62 * U, weight: 800, gold: true, glow: .45, alpha: tg, maxWidth: W - 200 });
    }
  }

  // Atmosphere over everything: smoke, embers (two depths), grain, vignette, fades.
  const heat = t < 3 ? .5 : t < 8 ? 1 : t < 14.6 ? .8 : .7;
  E.smoke(ctx, t, W, H, { alpha: .16, scale: 1.8, vx: 14, vy: -9, tint: "rgb(150,120,190)", seed: 1 });
  E.smoke(ctx, t, W, H, { alpha: .1, scale: 1.1, vx: -22, vy: -14, tint: "rgb(255,170,90)", seed: 2 });
  E.embers(ctx, t, W, H, { seed: 3, count: Math.round(60 * heat), size: [1.5 * U, 5 * U], rise: [50, 150], alpha: .9 });
  E.embers(ctx, t, W, H, { seed: 4, count: 9, size: [10 * U, 20 * U], rise: [90, 200], alpha: .45 * heat, blur: 5 });
  E.vignette(ctx, W, H, .55, .6);
  E.grain(ctx, W, H, frame, .05);
  E.fill(ctx, W, H, "#000", 1 - E.ease.sine(E.seg(t, 0, .7)));
  E.fill(ctx, W, H, "#000", E.ease.sine(E.seg(t, 17.35, 18)));
}
