import type { RarityId } from "@/config/gameConfig";

/**
 * Tiny Web Audio synth — no audio assets required. Everything is opt-in:
 * nothing plays unless the user enables sound.
 */

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(v: boolean) {
  enabled = v;
  if (v) audio();
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, start: number, dur: number, opts: { type?: OscillatorType; gain?: number; glideTo?: number } = {}) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(opts.glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(start: number, dur: number, gain = 0.2, freq = 2000) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t0);
}

export const sfx = {
  click() {
    if (!enabled) return;
    tone(880, 0, 0.08, { type: "triangle", gain: 0.05 });
  },
  hover() {
    if (!enabled) return;
    tone(1320, 0, 0.05, { type: "sine", gain: 0.02 });
  },
  crack(intensity = 1) {
    if (!enabled) return;
    noise(0, 0.12, 0.35 * intensity, 2400);
    tone(140, 0, 0.15, { type: "triangle", gain: 0.08 * intensity, glideTo: 70 });
  },
  rumble() {
    if (!enabled) return;
    tone(55, 0, 1.6, { type: "sawtooth", gain: 0.05, glideTo: 110 });
    tone(110, 0.2, 1.4, { type: "sine", gain: 0.05, glideTo: 220 });
  },
  burst() {
    if (!enabled) return;
    noise(0, 0.6, 0.4, 900);
    tone(220, 0, 0.6, { type: "sawtooth", gain: 0.06, glideTo: 880 });
  },
  reveal(rarity: RarityId) {
    if (!enabled) return;
    const chords: Record<RarityId, number[]> = {
      common: [523.25, 659.25, 783.99],
      rare: [440, 554.37, 659.25, 880],
      epic: [392, 493.88, 587.33, 739.99, 987.77],
      legendary: [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5],
      mythic: [293.66, 369.99, 440, 554.37, 739.99, 880, 1108.73],
      secret: [233.08, 277.18, 349.23, 466.16, 554.37, 698.46, 932.33],
    };
    const notes = chords[rarity];
    const type: OscillatorType = rarity === "secret" ? "square" : rarity === "common" ? "sine" : "triangle";
    notes.forEach((f, i) => tone(f, i * 0.09, 1.8 - i * 0.08, { type, gain: 0.07 }));
    if (rarity === "legendary" || rarity === "mythic" || rarity === "secret") {
      notes.forEach((f, i) => tone(f * 2, 0.8 + i * 0.06, 1.4, { type: "sine", gain: 0.035 }));
    }
  },
};
