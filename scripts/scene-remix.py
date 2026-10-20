#!/usr/bin/env python3
"""
Biome plates for the Mythic and Secret species, painted from the existing biome paintings
(no generation, no credits).

Each plate starts from one of the 22 painted plates, re-framed (mirrored, re-cropped) and
re-coloured with a gradient map that keeps every brush stroke but moves the whole painting
into the species' own light. A few species-specific elements are then painted on top: an
open night sky, small moons, an eclipse, a warm dawn wash, chromatic glitch bands. Canon W2
holds: no nebula blobs, sparkle stars, halos or rays.

    python3 scripts/scene-remix.py            # writes art/scenes/<id>/plate.png for the six
    node scripts/creature-scenes.mjs build    # encodes them to public/scenes like the rest

Sources are the masters in art/scenes/<source>/ when present, else the encoded
public/scenes/<source>/plate.webp, so the plates can be rebuilt in any checkout.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
N = 1024


def source(sid):
    for p in sorted((ROOT / "art/scenes" / sid).glob("plate.*")):
        return load(p)
    return load(ROOT / "public/scenes" / sid / "plate.webp")


def load(path):
    img = Image.open(path).convert("RGB").resize((N, N), Image.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255


def save(a, sid):
    out = ROOT / "art/scenes" / sid
    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).save(out / "plate.png")


def hexc(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255


def lum(a):
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def mirror(a):
    return a[:, ::-1]


def recrop(a, zoom, cx, cy):
    """Zoom in by `zoom` around (cx, cy) in 0–1, back to N×N."""
    w = N / zoom
    left = min(max(cx * N - w / 2, 0), N - w)
    top = min(max(cy * N - w / 2, 0), N - w)
    img = Image.fromarray((a * 255).astype(np.uint8)).crop((round(left), round(top), round(left + w), round(top + w)))
    return np.asarray(img.resize((N, N), Image.LANCZOS), dtype=np.float32) / 255


def gradient_map(a, stops, keep=0.0, gamma=1.0):
    """Recolour by luminance through colour stops [(t, '#hex'), …]; `keep` mixes back the original hue."""
    l = np.clip(lum(a), 0, 1) ** gamma
    ts = np.array([t for t, _ in stops], dtype=np.float32)
    cs = np.stack([hexc(c) for _, c in stops])
    out = np.stack([np.interp(l, ts, cs[:, k]) for k in range(3)], axis=-1)
    if keep:
        # keep a little of the painting's own colour variation, re-centred on the new luminance
        out = out + keep * (a - l[..., None])
    return out


def vgrad(top_hex, bottom_hex, y0=0.0, y1=1.0):
    y = np.clip((np.linspace(0, 1, N)[:, None] - y0) / (y1 - y0), 0, 1)
    return (hexc(top_hex) * (1 - y)[..., None] + hexc(bottom_hex) * y[..., None]) * np.ones((N, N, 1), np.float32)


def smoothmask(m, r):
    img = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(img, dtype=np.float32) / 255


def noise(seed, scale, octaves=4):
    """Soft value noise in 0–1 (painterly variation, never visible as a shape)."""
    rng = np.random.default_rng(seed)
    acc = np.zeros((N, N), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale * 2**o))
        small = Image.fromarray((rng.random((s, s)) * 255).astype(np.uint8))
        acc += amp * np.asarray(small.resize((N, N), Image.BICUBIC), dtype=np.float32) / 255
        total += amp
        amp *= 0.5
    return acc / total


def sky(a, top, bottom, reach, seed, soft=60):
    """Opens the upper plate into a clean painted sky: the painting's dark masses stay, its bright sky haze is replaced."""
    g = vgrad(top, bottom, 0, reach)
    g = g * (0.94 + 0.12 * noise(seed, 3)[..., None])
    y = np.linspace(0, 1, N)[:, None] * np.ones((1, N))
    region = np.clip(1 - y / reach, 0, 1) ** 0.7
    # only where the painting is lighter than the new sky: trees, ruins and cliffs stay in front
    open_ = smoothmask(np.clip((lum(a) - lum(g) + 0.04) * 6, 0, 1), 6)
    m = smoothmask(region * open_, soft / 6)
    return a * (1 - m[..., None]) + g * m[..., None]


def disc(a, cx, cy, r, colour, shade_dir=(-0.6, -0.5), shade=0.75, seed=1, rim=None):
    """A small painted moon: a soft-edged sphere lit from one side, with faint surface mottling."""
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    dx, dy = (xx - cx * N) / (r * N), (yy - cy * N) / (r * N)
    d = np.sqrt(dx**2 + dy**2)
    inside = np.clip((1 - d) * r * N / 1.6, 0, 1)
    nz = np.sqrt(np.clip(1 - d**2, 0, 1))
    light = np.clip(-(dx * shade_dir[0] + dy * shade_dir[1]) * 0.8 + nz * 0.6, 0, 1)
    body = hexc(colour) * (1 - shade + shade * light[..., None])
    body *= (0.9 + 0.2 * noise(seed, 18, 3))[..., None]
    if rim is not None:
        ring = np.clip(1 - np.abs(d - 1.0) * r * N / 5, 0, 1) * (0.35 + 0.65 * np.clip(-(dx * shade_dir[0] + dy * shade_dir[1]) + 0.2, 0, 1))
        body = body * (1 - ring[..., None]) + hexc(rim) * ring[..., None]
        inside = np.maximum(inside, ring)
    return a * (1 - inside[..., None]) + body * inside[..., None]


def wash(a, cx, cy, radius, colour, strength):
    """Broad light falling across the plate from a source off its edge (soft-light, never a visible shape)."""
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32) / N
    f = np.clip(1 - np.hypot(xx - cx, yy - cy) / radius, 0, 1) ** 2 * strength
    c = hexc(colour)
    lit = 1 - (1 - a) * (1 - c)  # screen
    return a * (1 - f[..., None]) + lit * f[..., None]


def glitch(a, seed, bands, tint):
    """Horizontal slices displaced sideways with a slight chromatic split, kept to the outer thirds."""
    rng = np.random.default_rng(seed)
    out = a.copy()
    for _ in range(bands):
        y = int(rng.uniform(0.06, 0.9) * N)
        h = int(rng.uniform(4, 20))
        shift = int(rng.choice([-1, 1]) * rng.uniform(10, 34))
        x0, x1 = (0, int(N * 0.3)) if rng.random() < 0.5 else (int(N * 0.7), N)
        sl = np.roll(a[y : y + h], shift, axis=1)[:, x0:x1].copy()
        sl[..., 0] = np.roll(sl[..., 0], 3, axis=1)
        sl[..., 2] = np.roll(sl[..., 2], -3, axis=1)
        out[y : y + h, x0:x1] = sl * 0.9 + hexc(tint) * (0.02 + 0.16 * lum(sl))[..., None]
    return out


def dust(a, angle, offset, width, colour, strength, seed):
    """A long, faint lane of painted star dust across the sky: low contrast, broken by noise, never a blob (W2)."""
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32) / N
    t = np.radians(angle)
    d = (xx - 0.5) * np.sin(t) - (yy - 0.5) * np.cos(t) - offset
    f = np.exp(-((d / width) ** 2)) * (0.35 + 0.65 * noise(seed, 6)) * (0.6 + 0.4 * noise(seed + 1, 24, 2)) * strength
    lit = 1 - (1 - a) * (1 - hexc(colour))
    return a * (1 - f[..., None]) + lit * f[..., None]


def limb(a, cx, cy, r, light, dark, seed):
    """The banded edge of a vast planet reaching into the frame from off its edge."""
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32) / N
    dx, dy = (xx - cx) / r, (yy - cy) / r
    d = np.sqrt(dx**2 + dy**2)
    inside = np.clip((1 - d) * r * N / 2, 0, 1)
    rng = np.random.default_rng(seed)
    bands = np.interp(np.sin((dy * 6 + (noise(seed, 5) - 0.5) * 3.2 + (noise(seed + 5, 14, 2) - 0.5) * 0.8) * np.pi) * 0.5 + 0.5, [0, 1], [0.72, 1.0])
    bands = bands * (0.85 + 0.3 * noise(seed + 2, 40, 2)) * (0.9 + 0.2 * rng.random())
    shade = (np.clip(1 - d**3, 0, 1) ** 0.6) * np.clip(0.25 + (-dx * 0.7 + dy * 0.7) * 0.9, 0.08, 1)  # lit from the lower left, darker toward the limb
    body = hexc(dark) + (hexc(light) - hexc(dark)) * (bands * shade)[..., None]
    return a * (1 - inside[..., None]) + body * inside[..., None]


def grid(a, rect, cells, colour, alpha, seed, broken=0.0):
    """A thin wall grid inside rect (x0, y0, x1, y1, in 0–1); `broken` drops and slips some of its cells."""
    from PIL import ImageDraw

    rng = np.random.default_rng(seed)
    m = Image.new("L", (N, N), 0)
    d = ImageDraw.Draw(m)
    x0, y0, x1, y1 = (v * N for v in rect)
    cw, ch = (x1 - x0) / cells, (y1 - y0) / cells
    for i in range(cells):
        for j in range(cells):
            if rng.random() < broken * 0.6:
                continue
            slip = rng.uniform(-0.6, 0.6) * cw if rng.random() < broken else 0
            gx, gy = x0 + i * cw + slip, y0 + j * ch
            fade = int(255 * (0.4 + 0.6 * rng.random()))
            d.line([(gx, gy), (gx + cw, gy)], fill=fade, width=1)
            d.line([(gx, gy), (gx, gy + ch)], fill=fade, width=1)
    m = np.asarray(m.filter(ImageFilter.GaussianBlur(0.7)), dtype=np.float32) / 255
    m *= alpha * (0.5 + 0.5 * noise(seed + 3, 4))
    lit = 1 - (1 - a) * (1 - hexc(colour))
    return a * (1 - m[..., None]) + lit * m[..., None]


def plates():
    # Astravex (Nebula): the night it carries in its flank, opened over a silver birch edge.
    # Clear deep sky with long faint lanes of star dust; the birches only at the margins.
    a = recrop(mirror(source("nyxara")), 1.22, 0.42, 0.7)
    a = gradient_map(a, [(0, "#03040c"), (0.25, "#10163a"), (0.55, "#3e4a86"), (0.8, "#9aa8d8"), (1, "#e4eaff")], keep=0.2, gamma=1.1)
    a = sky(a, "#02030c", "#1c286a", 0.66, 11)
    a = sky(a, "#02030c", "#1c286a", 0.4, 16, soft=30)
    a = dust(a, -24, -0.2, 0.12, "#9a90f0", 1.0, 5)
    a = dust(a, -24, -0.14, 0.05, "#d0d4ff", 0.6, 6)
    yield "astravex", a

    # Orbelith (Aether): the void a world keeps its orbits in. A vast banded planet leans in from
    # the corner, two small adopted moons, the cloud tops far below.
    a = recrop(mirror(source("pallow")), 1.18, 0.5, 0.7)
    a = gradient_map(a, [(0, "#02030a"), (0.3, "#0b1430"), (0.6, "#26406a"), (0.85, "#6e94bc"), (1, "#c6dcf0")], keep=0.1, gamma=1.4)
    a = sky(a, "#010208", "#0a1430", 0.7, 12)
    a = limb(a, 1.12, -0.18, 0.56, "#a8b8e0", "#0c1230", 3)
    a = disc(a, 0.18, 0.2, 0.034, "#c7d6ea", shade_dir=(0.8, -0.3), seed=7)
    a = disc(a, 0.36, 0.09, 0.014, "#9fb8d4", shade_dir=(0.8, -0.3), seed=8)
    yield "orbelith", a

    # Eventide (Void, the last light): a root-bound fen at totality, the eclipse high in a violet dark.
    a = recrop(mirror(source("mossling")), 1.24, 0.5, 0.6)
    a = gradient_map(a, [(0, "#040310"), (0.3, "#18123a"), (0.6, "#3a3274"), (0.85, "#7a80b4"), (1, "#c8ccec")], keep=0.25, gamma=1.15)
    a = sky(a, "#05041a", "#251e4c", 0.45, 13)
    a = disc(a, 0.74, 0.14, 0.05, "#05040a", shade_dir=(0.6, -0.5), shade=0.05, seed=9, rim="#efe4ff")
    yield "eventide", a

    # Helivane (Solar): the high orbit where the sun never sets. Space-dark above, the cloud tops
    # below lit gold by a sun just under the edge of the world.
    a = recrop(mirror(source("zephrax")), 1.12, 0.5, 0.62)
    a = gradient_map(a, [(0, "#08081a"), (0.3, "#24204a"), (0.55, "#7a4e5a"), (0.8, "#e6a060"), (1, "#fff0cc")], keep=0.1, gamma=0.95)
    a = sky(a, "#03061a", "#1a2458", 0.5, 14)
    a = wash(a, 0.0, 1.05, 0.9, "#ff9a40", 0.42)
    yield "helivane", a

    # GENESIS (Prism, Slot Zero): the vault that held before the first block. Black crystal,
    # its facet edges in signal green, and the faint grid of slot zero on the far wall.
    a = recrop(mirror(source("cryovant")), 1.16, 0.5, 0.5)
    l = lum(a)
    edge = np.clip((l - 0.55) * 3, 0, 1)
    a = gradient_map(a, [(0, "#040a0b"), (0.35, "#0e201d"), (0.6, "#1b3c34"), (0.85, "#306c56"), (1, "#7ccea6")], keep=0.0, gamma=1.1)
    a = a + edge[..., None] * hexc("#14f195") * 0.22
    a = grid(a, (0.26, 0.08, 0.74, 0.6), 9, "#14f195", 0.22, 31, broken=0.15)
    yield "genesis", a

    # Nullborn (Void, the Unindexed): a place no index reaches. A shrine's last pillars at the edges
    # of a pink-shifted void, broken grid fragments that fail to line up, rows slipping out of phase.
    a = recrop(mirror(source("duskwing")), 1.2, 0.5, 0.55)
    a = gradient_map(a, [(0, "#030205"), (0.3, "#110e16"), (0.6, "#2e2834"), (0.85, "#6c6474"), (1, "#c8c0d0")], keep=0.0, gamma=1.3)
    a = sky(a, "#0a0710", "#24162c", 0.75, 15)
    a = grid(a, (0.04, 0.1, 0.36, 0.5), 7, "#ff3df2", 0.6, 41, broken=0.7)
    a = grid(a, (0.66, 0.3, 0.97, 0.72), 7, "#ff3df2", 0.5, 42, broken=0.7)
    a = glitch(a, 21, 11, "#ff3df2")
    a = wash(a, 1.05, 0.2, 0.7, "#ff3df2", 0.1)
    yield "nullborn", a


if __name__ == "__main__":
    for sid, a in plates():
        save(a, sid)
        print(f"{sid}: art/scenes/{sid}/plate.png")
