"""Soundtrack for the Solanites website promo, synthesised locally (numpy only, no samples,
no paid services) and mixed with the original audio of the two existing Runway phoenix clips.

    python3 campaign/website-promo-video/build/audio.py      # writes build/.cache/soundtrack.wav

The cue times match the edit in promo.html (TIMELINE there). Everything is deterministic.
"""
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
SR = 48000
DUR = 27.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

# Edit points (seconds) — keep in sync with promo.html
S2, S3, S4, LOGO, END = 4.6, 10.2, 19.2, 23.0, 27.0
CUTS = [12.4, 14.6, 16.6]
REVEAL = 17.5

mix = np.zeros((N, 2))


def env(start, attack, hold, release, length=None):
    """Linear-attack / exponential-release envelope over the whole timeline."""
    e = np.zeros(N)
    a0 = int(start * SR)
    a1 = int((start + attack) * SR)
    h1 = int((start + attack + hold) * SR)
    e[a0:a1] = np.linspace(0, 1, max(1, a1 - a0))
    e[a1:h1] = 1
    tail = np.arange(N - h1) / SR
    e[h1:] = np.exp(-tail / max(release, 1e-3))
    return e


def lowpass(x, cutoff, order=2):
    """Zero-phase FFT low-pass (smooth roll-off)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** (2 * order))
    return np.fft.irfft(X, len(x))


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def add(sig, gain=1.0, pan=0.0):
    sig = np.asarray(sig)
    if sig.ndim == 1:
        left, right = sig * (1 - pan) ** 0.5, sig * (1 + pan) ** 0.5
        sig = np.stack([left, right], axis=1) / 2 ** 0.5
    mix[:] += sig * gain


def sweep_noise(start, dur, f0, f1, gain, pan=0.0):
    """Filtered-noise whoosh whose band centre glides from f0 to f1."""
    n = int(dur * SR)
    out = np.zeros(N)
    noise = rng.standard_normal(n)
    hop = 1024
    win = np.hanning(hop * 2)
    seg = np.zeros(n + hop * 2)
    for i in range(0, n, hop):
        frac = i / n
        fc = f0 * (f1 / f0) ** frac
        chunk = noise[i:i + hop * 2]
        if len(chunk) < hop * 2:
            chunk = np.pad(chunk, (0, hop * 2 - len(chunk)))
        X = np.fft.rfft(chunk * win)
        f = np.fft.rfftfreq(hop * 2, 1 / SR)
        X *= np.exp(-((np.log(f + 1) - np.log(fc)) ** 2) / 0.5)
        seg[i:i + hop * 2] += np.fft.irfft(X, hop * 2)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    s0 = int(start * SR)
    m = min(n, N - s0)
    out[s0:s0 + m] = seg[:m] * shape[:m]
    out /= np.max(np.abs(out)) + 1e-9
    add(out, gain, pan)


def boom(at, gain, length=2.5, f_hi=110, f_lo=36, crack_gain=0.6):
    """Cinematic sub impact: pitch-dropping sine plus a short low noise burst."""
    s0 = int(at * SR)
    n = min(int(length * SR), N - s0)
    tt = np.arange(n) / SR
    freq = f_lo + (f_hi - f_lo) * np.exp(-tt / 0.09)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-tt / (length / 3.2))
    crack = lowpass(rng.standard_normal(n), 900) * np.exp(-tt / 0.08) * crack_gain
    out = np.zeros(N)
    out[s0:s0 + n] = body + crack
    add(np.tanh(out * 1.4), gain)


def kick(at, gain):
    boom(at, gain, length=0.55, f_hi=120, f_lo=48, crack_gain=0.12)


def tone(freqs, start, attack, hold, release, gain, detune=0.0025, harmonics=4, bright=0.45, vibrato=0.0):
    e = env(start, attack, hold, release)
    sig = np.zeros(N)
    for f in freqs:
        for d in (-detune, 0, detune):
            ff = f * (1 + d)
            ph = 2 * np.pi * ff * t + (vibrato * np.sin(2 * np.pi * 5.2 * t) if vibrato else 0)
            for h in range(1, harmonics + 1):
                sig += np.sin(ph * h + h * 0.7) * (bright ** (h - 1)) / h
    sig *= e
    sig /= np.max(np.abs(sig)) + 1e-9
    return sig * gain


def note(name):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[pitch] + 12 * (octave - 4)) / 12)


def read_wav(path):
    with wave.open(path) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        return data.reshape(-1, w.getnchannels())


# ── 1. low drone across the whole piece, swelling into each act ──────────────
drone = np.zeros(N)
for f, g in ((55, 1.0), (82.41, 0.55), (110, 0.35)):
    drone += g * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
swell = np.interp(t, [0, 3, S2, S3, CUTS[2], S4, LOGO, END - 1.2, END], [0.0, 0.55, 0.45, 0.6, 0.8, 0.5, 0.7, 0.5, 0.0])
add(lowpass(drone, 260) * swell, 0.34)

# airy wind bed
wind = bandpass(rng.standard_normal(N), 180, 1400)
wind /= np.max(np.abs(wind))
add(np.stack([wind, np.roll(wind, 2400)], 1) * np.interp(t, [0, 2, S2, S3, S4, END], [0.0, 0.5, 0.3, 0.25, 0.35, 0.0])[:, None], 0.22)

# ── 2. original Runway clip audio (project-owned) ─────────────────────────────
c1 = read_wav(os.path.join(CACHE, "clip-1-awakening.wav"))
n1 = min(len(c1), int(S2 * SR) + int(0.4 * SR))
seg = c1[:n1] * np.interp(np.arange(n1) / SR, [0, 0.8, S2 - 0.3, S2 + 0.4], [0, 1, 1, 0])[:, None]
mix[:n1] += seg * 0.55

c2 = read_wav(os.path.join(CACHE, "clip-2-rebirth.wav"))
c2 = c2[int(3.2 * SR):]
s0 = int(S4 * SR)
n2 = min(len(c2), N - s0)
seg = c2[:n2] * np.interp(np.arange(n2) / SR, [0, 0.15, LOGO - S4 - 0.4, LOGO - S4 + 1.2], [0, 1, 1, 0.25])[:, None]
mix[s0:s0 + n2] += seg * 0.5

# ── 3. harmony: A minor → F → C → G (act 2 and 3), resolving to A on the logo ─
chords = [
    (S2, ["A2", "E3", "A3", "C4"]),
    (7.4, ["F2", "C3", "A3", "C4"]),
    (S3, ["C3", "G3", "C4", "E4"]),
    (CUTS[0], ["G2", "D3", "G3", "B3"]),
    (CUTS[1], ["A2", "E3", "A3", "C4"]),
    (CUTS[2], ["F2", "C3", "A3", "C4"]),
    (REVEAL, ["E2", "B2", "E3", "G#3"]),
]
for i, (start, notes) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else S4
    add(lowpass(tone([note(n) for n in notes], start - 0.15, 0.6, end - start - 0.3, 0.9, 1.0), 2400), 0.15, pan=0.15 * (-1) ** i)

# a slow arpeggio that tightens as the site section builds
arp = ["A4", "C5", "E5", "A5", "E5", "C5"]
step = 0.4
k = 0
tt = S3
while tt < S4 - 0.2:
    if tt >= CUTS[2]:
        step = 0.2
    add(tone([note(arp[k % len(arp)])], tt, 0.005, 0.02, 0.35, 1.0, detune=0.0008, harmonics=3, bright=0.3), 0.045, pan=0.5 * np.sin(k))
    k += 1
    tt += step

# ── 4. pulse: heartbeat kicks from act 2, doubling into the reveal ───────────
beat = S2 + 0.8
while beat < S4 - 0.1:
    kick(beat, 0.32 if beat < CUTS[2] else 0.4)
    if beat >= CUTS[1]:
        kick(beat + 0.4, 0.22)
    beat += 0.8

# ── 5. transitions, reveal, riser, impacts ───────────────────────────────────
for at in [S2] + [S3] + CUTS:
    sweep_noise(at - 0.45, 0.9, 300, 4500, 0.12, pan=0.3)
sweep_noise(S4 - 1.6, 1.6, 200, 9000, 0.2)                      # riser into the finale
add(tone([note("A5"), note("E6"), note("C#6")], REVEAL, 0.01, 0.1, 1.6, 1.0, harmonics=2, bright=0.2, vibrato=0.002), 0.07)
boom(S2, 0.45)
boom(S4, 0.6, length=3.0)
boom(LOGO, 0.75, length=3.6, f_hi=95, f_lo=32)
# logo shimmer: a bright A major chord that rings out under the end card
add(lowpass(tone([note(n) for n in ["A3", "E4", "A4", "C#5", "E5"]], LOGO - 0.05, 0.08, 1.2, 2.2, 1.0, harmonics=3, bright=0.35), 5000), 0.2)
add(tone([note("A6"), note("E7")], LOGO, 0.02, 0.2, 1.8, 1.0, harmonics=1, vibrato=0.003), 0.04)

# ── master ────────────────────────────────────────────────────────────────────
mix *= np.interp(t, [0, 0.4, END - 1.4, END], [0, 1, 1, 0])[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
os.makedirs(CACHE, exist_ok=True)
out = os.path.join(CACHE, "soundtrack-raw.wav")
with wave.open(out, "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("wrote", os.path.relpath(out, HERE), f"{DUR}s")
