// 4:5 promotional still: the cinematic Phoenix above a genuine screenshot of the
// Pyraurum entry in the website's Collection (its four real evolution forms).
export const DURATION = 1;
export const APPROVED_TEXT = ["FROM THE WEBSITE", "ONE CREATURE. FOUR FORMS.", "PYRAURUM · LEGENDARY", "SOLANITES"];

let E, still, ui, mark;
export async function init(engine) {
  E = engine;
  still = await E.loadImage("../../x-teasers/source/phoenix-still.png");
  ui = await E.loadImage("../captures/.frames/pyraurum-desktop/0060.jpg");
  mark = await E.loadImage(E.logoMarkSrc());
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export async function draw(ctx, t, frame, { W, H }) {
  const U = W / 1440;
  // Phoenix, head high in the frame, fading into the dark
  const art = E.feathered(still, { top: .04, bottom: .3, left: .05, right: .05 });
  E.place(ctx, art, W / 2, 360 * U, 1.12 * U, { ax: .505, ay: .34 });
  // darken under the copy so it reads over the tail flames
  const g = ctx.createLinearGradient(0, 640 * U, 0, 980 * U);
  g.addColorStop(0, "rgba(5,5,10,0)"); g.addColorStop(.55, "rgba(5,5,10,.82)"); g.addColorStop(1, "rgba(5,5,10,.95)");
  ctx.fillStyle = g; ctx.fillRect(0, 640 * U, W, H);
  E.vignette(ctx, W, H, .6, .6);
  E.embers(ctx, 2.5, W, H, { seed: 21, count: 70, size: [1.5 * U, 5 * U], rise: [40, 120], alpha: .9 });
  E.smoke(ctx, 3, W, H, { alpha: .1, scale: 2, tint: "rgb(150,120,190)", seed: 4 });

  // headline
  E.text(ctx, "FROM THE WEBSITE", W / 2, 806 * U, { size: 24 * U, weight: 400, family: "JetBrains Mono", tracking: .32, color: "rgba(255,210,140,.9)" });
  E.text(ctx, "ONE CREATURE. FOUR FORMS.", W / 2, 896 * U, { size: 74 * U, weight: 800, gold: true, glow: .4, maxWidth: W - 140 * U });

  // the real interface: Pyraurum's four stage cards, uncropped inside the panel
  const [cx, cy, cw, ch] = [700, 160, 1212, 500];
  const pw = 1300 * U, ph = pw * ch / cw, px = (W - pw) / 2, py = 960 * U;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.75)"; ctx.shadowBlur = 70 * U; ctx.shadowOffsetY = 24 * U;
  roundRect(ctx, px, py, pw, ph, 26 * U); ctx.fillStyle = "#06060c"; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.save(); roundRect(ctx, px, py, pw, ph, 26 * U); ctx.clip();
  ctx.imageSmoothingQuality = "high"; ctx.drawImage(ui, cx, cy, cw, ch, px, py, pw, ph);
  ctx.restore();
  roundRect(ctx, px + 1, py + 1, pw - 2, ph - 2, 26 * U);
  const b = ctx.createLinearGradient(px, py, px + pw, py + ph);
  b.addColorStop(0, "rgba(255,210,140,.6)"); b.addColorStop(.5, "rgba(255,255,255,.12)"); b.addColorStop(1, "rgba(153,69,255,.5)");
  ctx.strokeStyle = b; ctx.lineWidth = 2.5 * U; ctx.stroke();
  ctx.restore();

  E.text(ctx, "PYRAURUM · LEGENDARY", W / 2, py + ph + 70 * U, { size: 24 * U, weight: 400, family: "JetBrains Mono", tracking: .3, color: "rgba(255,201,74,.9)" });

  // brand lockup
  const ly = H - 70 * U;
  E.logo(ctx, mark, W / 2 - 172 * U, ly - 11 * U, 46 * U);
  E.text(ctx, "SOLANITES", W / 2 + 26 * U, ly, { size: 30 * U, weight: 600, tracking: .32 });
  E.grain(ctx, W, H, 1, .035);
}
