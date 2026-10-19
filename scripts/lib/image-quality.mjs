/**
 * Image quality checks shared by the art pipelines (hero, creatures).
 *
 * Pixel dimensions say nothing about sharpness: an enlarged image has the pixels but
 * not the detail. Enlargement removes energy from the top half of the frequency range,
 * so the check compares spectral energy at 0.30–0.50 cycles/px with energy at
 * 0.15–0.25 cycles/px, on the most detailed 512 px region (dark compositions are mostly
 * empty space, which says nothing either way).
 *
 * Measured on the most detailed 512 px region (ratio; higher = more fine detail):
 *   native 1K painted concept (Creature Studio V-A)     0.17
 *   native 2K painted concepts (website round 1)        0.32–0.66
 *   the retired phoenix still                            0.42
 *   that still enlarged 1.33× / V-A enlarged 2× / still 2×   0.153 / 0.039 / 0.017
 *
 * Only "upscaled" is a hard verdict. A mild enlargement (about 1.33×) scores close to
 * native, so the native size recorded with each generation (task ID, model, size) and
 * the 100% review remain the guard for that case.
 *
 * An earlier version used a downscale round-trip PSNR and scored tiles with sharp's
 * stats(), which reads the whole input rather than the extracted tile. It rejected native
 * painted art and measured the wrong region; both were replaced.
 */
import sharp from "sharp";

/** Below this the image is enlarged: reject. */
export const UPSCALED_RATIO = 0.08;
/** Below this, little fine detail: advisory, review at 100%. */
export const LOW_DETAIL_RATIO = 0.15;
const N = 512;

async function busiestRegion(file) {
  // Decode once to one luminance channel, then score tiles from the pixels themselves
  // (sharp's stats() reads the whole input, not an extracted region).
  const { data: all, info } = await sharp(file).flatten({ background: "#07060a" }).toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error(`expected one channel, got ${info.channels}`);
  const W = info.width;
  const s = Math.min(N, info.width, info.height);
  let best = null;
  for (let top = 0; top + s <= info.height; top += s / 2) {
    for (let left = 0; left + s <= W; left += s / 2) {
      let sum = 0;
      let sq = 0;
      for (let y = top; y < top + s; y += 2) {
        for (let x = left; x < left + s; x += 2) {
          const v = all[y * W + x];
          sum += v;
          sq += v * v;
        }
      }
      const k = (s / 2) * (s / 2);
      const sd = Math.sqrt(sq / k - (sum / k) ** 2);
      if (!best || sd > best.sd) best = { left, top, sd };
    }
  }
  const data = new Uint8Array(s * s);
  for (let y = 0; y < s; y++) data.set(all.subarray((best.top + y) * W + best.left, (best.top + y) * W + best.left + s), y * s);
  return { data, size: s };
}

/** In-place radix-2 FFT. */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k);
        const wi = Math.sin(ang * k);
        const ar = re[i + k + len / 2];
        const ai = im[i + k + len / 2];
        const tr = ar * wr - ai * wi;
        const ti = ar * wi + ai * wr;
        re[i + k + len / 2] = re[i + k] - tr;
        im[i + k + len / 2] = im[i + k] - ti;
        re[i + k] += tr;
        im[i + k] += ti;
      }
    }
  }
}

/** Energy at 0.30–0.50 cycles/px divided by energy at 0.15–0.25 cycles/px (Hann-windowed). */
export async function highFrequencyRatio(file) {
  const { data, size } = await busiestRegion(file);
  const n = 1 << Math.floor(Math.log2(size));
  let mean = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) mean += data[y * size + x];
  mean /= n * n;
  const hann = (i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
  const re = Array.from({ length: n }, () => new Float64Array(n));
  const im = Array.from({ length: n }, () => new Float64Array(n));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) re[y][x] = (data[y * size + x] - mean) * hann(x) * hann(y);
  for (let y = 0; y < n; y++) fft(re[y], im[y]);
  const colR = new Float64Array(n);
  const colI = new Float64Array(n);
  let hi = 0;
  let mid = 0;
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      colR[y] = re[y][x];
      colI[y] = im[y][x];
    }
    fft(colR, colI);
    const fx = (x < n / 2 ? x : x - n) / n;
    for (let y = 0; y < n; y++) {
      const fy = (y < n / 2 ? y : y - n) / n;
      const r = Math.hypot(fx, fy);
      const p = colR[y] * colR[y] + colI[y] * colI[y];
      if (r >= 0.3 && r < 0.5) hi += p;
      else if (r >= 0.15 && r < 0.25) mid += p;
    }
  }
  return mid === 0 ? 0 : hi / mid;
}

/** "native" | "low-detail" (advisory: review at 100%) | "upscaled" (reject). */
export async function detailCheck(file) {
  const ratio = await highFrequencyRatio(file);
  const verdict = ratio < UPSCALED_RATIO ? "upscaled" : ratio < LOW_DETAIL_RATIO ? "low-detail" : "native";
  return { ratio: Math.round(ratio * 1000) / 1000, verdict };
}
