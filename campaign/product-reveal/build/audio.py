"""Original soundtrack for a Solanites composition, synthesised from scratch (numpy only).

    python3 audio.py <cues.json> <out.wav>

Nothing is sampled or licensed: every sound is generated here from sine waves and noise,
so the result is original and free to use. The cue file comes from the composition's
CUES export (see cues.mjs). Seeded, so the same cues always give the same file.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def note(name):
    names = {"C": -9, "C#": -8, "D": -7, "Eb": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "Ab": -1, "A": 0, "Bb": 1, "B": 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octave - 4)) / 12)


def spectral(x, gain_fn):
    """Static filter in the frequency domain; gain_fn maps frequency (Hz) to gain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * gain_fn(f), len(x))


def lowpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def highpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order)))


def swept_band(x, lo, hi, q=1.2):
    """Time-varying band-pass via STFT. `lo` is the band centre per sample (or, with `hi`, the low edge)."""
    n, hop = 2048, 512
    win = np.hanning(n)
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    out = np.zeros_like(pad)
    norm = np.zeros_like(pad)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    for start in range(0, len(pad) - n, hop):
        i = min(max(start - n + n // 2, 0), len(x) - 1)
        fc = lo[i] if hi is None else np.sqrt(lo[i] * hi[i])
        g = np.exp(-0.5 * (np.log2(np.maximum(freqs, 1) / fc) * q * 2) ** 2)
        seg = np.fft.irfft(np.fft.rfft(pad[start:start + n] * win) * g, n)
        out[start:start + n] += seg * win
        norm[start:start + n] += win ** 2
    out = out / np.maximum(norm, 1e-6)
    return out[n:n + len(x)]


def env_adsr(n, a, d, s, r, peak=1.0):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.full(n, s, float)
    e[:a] = np.linspace(0, peak, a, endpoint=False) if a else e[:a]
    e[a:a + d] = np.linspace(peak, s, len(e[a:a + d]), endpoint=False)
    if r:
        e[-r:] *= np.linspace(1, 0, len(e[-r:]))
    return e


class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, sig, at, gain=1.0, pan=0.0, send=0.3):
        i = int(at * SR)
        if i >= self.n:
            return
        sig = sig[: self.n - i]
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, l), (1, r)):
            self.dry[ch, i:i + len(sig)] += sig * gain * g * (1 - send * 0.5)
            self.wet[ch, i:i + len(sig)] += sig * gain * g * send


# ── Instruments ────────────────────────────────────────────

def drone(dur, base="D1"):
    t = t_axis(dur)
    f = note(base)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
    s = (0.55 * np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t + 0.3) + 0.12 * np.sin(2 * np.pi * 3 * f * t + 1.1)) * lfo
    rumble = lowpass(rng.standard_normal(len(t)), 110, 3) * 0.9
    return s + rumble


def pad_chord(notes, dur, bright=1800):
    t = t_axis(dur)
    out = np.zeros((2, len(t)))
    for nm in notes:
        f0 = note(nm)
        for ch, det in ((0, -0.004), (1, 0.004)):
            f = f0 * (1 + det)
            v = sum(np.sin(2 * np.pi * f * k * t + k) / k ** 1.6 for k in range(1, 9) if f * k < bright * 2)
            vib = 1 + 0.002 * np.sin(2 * np.pi * 4.7 * t + ch)
            out[ch] += v * vib
    for ch in range(2):
        out[ch] = lowpass(out[ch], bright, 2)
    return out / max(len(notes), 1)


def heartbeat():
    def thump(dur, f0, f1, amp):
        t = t_axis(dur)
        f = f1 + (f0 - f1) * np.exp(-t * 18)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * amp
    a = thump(0.35, 95, 48, 1.0)
    b = thump(0.35, 85, 44, 0.75)
    out = np.zeros(int(0.6 * SR))
    out[: len(a)] += a
    out[int(0.17 * SR): int(0.17 * SR) + len(b)] += b
    return out


def riser(dur, f_lo=220, f_hi=4200):
    t = t_axis(dur)
    k = t / dur
    noise = rng.standard_normal(len(t))
    band = swept_band(noise, f_lo * (f_hi / f_lo) ** (k ** 1.6), None, q=0.8)
    tone = np.sin(2 * np.pi * np.cumsum(180 + 620 * k ** 2) / SR) * 0.25
    return lowpass(band + tone, 6000, 3) * (k ** 2.2) * (1 - np.clip((k - 0.97) / 0.03, 0, 1))


def impact(size=1.0):
    dur = 3.5
    t = t_axis(dur)
    f = 30 + 70 * np.exp(-t * 7)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.6 / size))
    crack = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 9) * 0.8
    sub = np.sin(2 * np.pi * 36 * t) * np.exp(-t * 1.2) * 0.4
    return (boom + crack + sub) * size


def whoosh(dur=0.5, f0=500, f1=3000, f2=700):
    t = t_axis(dur)
    k = t / dur
    centre = np.where(k < 0.5, f0 * (f1 / f0) ** (k * 2), f1 * (f2 / f1) ** ((k - 0.5) * 2))
    band = swept_band(rng.standard_normal(len(t)), centre, None, q=1.0)
    return band * np.sin(np.pi * k) ** 1.5


def bell(notes, dur=3.0):
    t = t_axis(dur)
    out = np.zeros(len(t))
    for nm in notes:
        f = note(nm)
        for k, (ratio, amp, decay) in enumerate(((1, 1, 1.4), (2.0, .4, 2.2), (2.76, .25, 3.0), (5.4, .1, 4.5))):
            out += np.sin(2 * np.pi * f * ratio * t + k) * amp * np.exp(-t * decay)
    return out / len(notes) * np.minimum(t / 0.004, 1)


def crackles(dur, density=4.0):
    n = int(dur * SR)
    out = np.zeros((2, n))
    count = int(dur * density)
    for _ in range(count):
        i = rng.integers(0, n - 400)
        L = rng.integers(60, 300)
        burst = rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * rng.uniform(0.2, 1.0)
        p = rng.uniform(-0.8, 0.8)
        out[0, i:i + L] += burst * (1 - p) / 2
        out[1, i:i + L] += burst * (1 + p) / 2
    return np.stack([highpass(out[0], 2500), highpass(out[1], 2500)])


def reverb(wet, seconds=2.4):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(wet)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds)
        ir = lowpass(ir, 5000)
        ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
        ir /= np.sqrt(np.sum(ir ** 2))
        L = len(wet[ch]) + n
        out[ch] = np.fft.irfft(np.fft.rfft(wet[ch], L) * np.fft.rfft(ir, L), L)[: len(wet[ch])]
    return out


def segment_env(n, a, b, fade=0.4):
    e = np.zeros(n)
    i0, i1 = int(a * SR), min(int(b * SR), n)
    e[i0:i1] = 1
    f = int(fade * SR)
    if i0 > 0:
        e[i0:i0 + f] *= np.linspace(0, 1, len(e[i0:i0 + f]))
    e[max(i1 - f, i0):i1] *= np.linspace(1, 0, len(e[max(i1 - f, i0):i1]))
    return e


# ── Score ──────────────────────────────────────────────────

def build(c):
    dur = c["duration"]
    m = Mix(dur)
    n = m.n
    t = np.arange(n) / SR

    # drone under everything, swelling at the reveal
    d = drone(dur)
    swell = 0.55 + 0.45 * np.clip((t - c["reveal"] + 0.3) / 1.2, 0, 1)
    m.add(d * swell * env_adsr(n, 2.0, 0.1, 1.0, 1.2), 0, gain=0.16, send=0.1)

    # chords (i – VI – VII – i in D minor) with soft crossfades
    for at, end, notes, gain in c["chords"]:
        p = pad_chord(notes, end - at + 0.6)
        e = segment_env(p.shape[1], 0, end - at + 0.6, fade=0.5)
        for ch, pan in ((0, -0.5), (1, 0.5)):
            m.add(p[ch] * e, at, gain=gain, pan=pan, send=0.45)

    for hb in c.get("heartbeat", []):
        m.add(heartbeat(), hb, gain=0.55, send=0.15)
    for key in ("riser", "riser2"):
        if key in c:
            a, b = c[key]
            m.add(riser(b - a), a, gain=0.12, send=0.35)
    m.add(impact(1.0), c["reveal"], gain=0.85, send=0.3)
    if "wings" in c:
        m.add(whoosh(1.1, 350, 2600, 500), c["wings"] - 0.4, gain=0.22, pan=-0.3, send=0.4)
    if "flash" in c:
        m.add(bell(["D5", "A5"], 3.0), c["flash"] - 0.05, gain=0.08, send=0.6)
        m.add(impact(0.55), c["flash"], gain=0.3, send=0.3)
    for i, cut in enumerate(c.get("cuts", [])):
        m.add(whoosh(0.45, 600, 3200, 900), cut - 0.25, gain=0.16, pan=(-0.45 if i % 2 else 0.45), send=0.35)
        m.add(impact(0.3), cut, gain=0.22, send=0.2)
    m.add(impact(1.25), c["end"], gain=0.85, send=0.35)
    if "tagline" in c:
        m.add(bell(["D6", "A6"], 3.5), c["tagline"], gain=0.07, send=0.7)

    cr = crackles(dur)
    heat = 0.4 + 0.6 * np.clip((t - c["reveal"]) / 1.0, 0, 1)
    m.dry += cr * heat * 0.04

    mix = m.dry + reverb(m.wet) * 0.42
    # master: gentle glue, fades
    mix = np.tanh(mix * 1.4) / 1.4
    fade_in = np.clip(t / 0.4, 0, 1)
    a, b = c["fadeOut"]
    fade_out = 1 - np.clip((t - a) / (b - a), 0, 1) ** 1.5
    mix *= fade_in * fade_out
    mix /= np.max(np.abs(mix)) / 0.89
    return mix


if __name__ == "__main__":
    cues = json.load(open(sys.argv[1]))
    audio = build(cues)
    pcm = (np.clip(audio.T, -1, 1) * 32767).astype("<i2")
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", sys.argv[2], f"{audio.shape[1] / SR:.2f} s")
