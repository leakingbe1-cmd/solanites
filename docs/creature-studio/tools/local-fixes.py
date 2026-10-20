"""Local, no-credit anatomy repairs on overhaul finals (owner: fix the asset itself, no paid generation).

Each entry of art/creature-studio/overhaul/local-fixes.json names a final and one operation:
  join  fill / retouch / cut polygons: fills become opaque and are inpainted from the surrounding
        paint, retouch areas are re-inpainted (removes seams and cross-lines), new silhouette edges
        get a soft outline in the local outline colour;
  bridge reconnects a detached piece (found inside `near`, an [x0,y0,x1,y1] box) to the body with
        a tapered stem painted along the shortest gap, coloured from both ends;
  holes fills every enclosed see-through hole inside `near` and inpaints it from the paint around it;
  smooth closes pinholes and repaints each polygon from the surrounding opaque paint (soft blur),
        for seams and hairlines left where a join was rebuilt;
  trim  removes only part-coloured pixels inside a polygon (e.g. a ribbon end poking above a body
        outline) and outlines the new edge.
Coordinates are pixels of the 1024 x 1024 final. Run after process-overhaul.py:
  python3 -I docs/creature-studio/tools/local-fixes.py
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path("art/creature-studio/overhaul")
STAGES = ["1-eggling", "2-hatchling", "3-evolved", "4-ascended"]


def poly_mask(size, polys):
    m = Image.new("L", size, 0); d = ImageDraw.Draw(m)
    for p in polys: d.polygon([tuple(pt) for pt in p], fill=255)
    return np.asarray(m) > 0

def fix(src, dst, fill=(), retouch=(), cut=(), radius=6, outline=True):
    im = Image.open(src).convert("RGBA"); a = np.asarray(im).copy()
    size = im.size
    F = poly_mask(size, fill); R = poly_mask(size, retouch); X = poly_mask(size, cut)
    alpha = a[..., 3].astype(float)
    solid = alpha > 128
    # colour field without background: transparent pixels take their nearest solid colour
    idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = a[..., :3][idx[0], idx[1]]
    mask = ((F | R) & ~X).astype(np.uint8) * 255
    out = cv2.inpaint(np.ascontiguousarray(rgb[..., ::-1]), mask, radius, cv2.INPAINT_TELEA)[..., ::-1]
    # soften the inpainted area a little so it reads as paint, not smear
    blur = cv2.GaussianBlur(out, (0, 0), 1.2)
    w = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 2.0)[..., None]
    res_rgb = (a[..., :3] * (1 - w) + (out * 0.7 + blur * 0.3) * w)
    new_alpha = alpha.copy()
    new_alpha[F] = 255
    new_alpha[X] = 0
    # antialias the new edge
    na = cv2.GaussianBlur(new_alpha.astype(np.float32), (0, 0), 0.8)
    na = np.where(F | X, na, alpha)
    if outline and F.any():
        nsolid = na > 128
        edge = nsolid & ~ndimage.binary_erosion(nsolid, iterations=3)
        newedge = edge & ndimage.binary_dilation(F, iterations=3) & ~ndimage.binary_dilation(solid & ~F, iterations=0)
        # local outline colour: darkest 10% of the old edge band nearby
        oldedge = solid & ~ndimage.binary_erosion(solid, iterations=3)
        near = oldedge & ndimage.binary_dilation(F, iterations=40)
        if near.any():
            lum = a[..., :3].mean(-1)
            col = a[..., :3][near & (lum <= np.percentile(lum[near], 15))].mean(0)
            k = cv2.GaussianBlur(newedge.astype(np.float32), (0, 0), 0.9)[..., None] * 0.85
            res_rgb = res_rgb * (1 - k) + col * k
    res = np.dstack([np.clip(res_rgb, 0, 255), np.clip(na, 0, 255)]).astype(np.uint8)
    Image.fromarray(res, "RGBA").save(dst, optimize=True)


def cut_colour(src, dst, poly, bminusr=25, minlum=110, outline=False, clear_ghost=True):
    job = dict(src=src, dst=dst, poly=poly, bminusr=bminusr, minlum=minlum, outline=outline, clear_ghost=clear_ghost)
    im = Image.open(job["src"]).convert("RGBA"); a = np.asarray(im).copy()
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).polygon([tuple(p) for p in job["poly"]], fill=255)
    poly = np.asarray(m) > 0
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    part = (b - r > job.get("bminusr", 25)) & ((r + g + b) / 3 > job.get("minlum", 110))
    kill = poly & part
    k = np.asarray(Image.fromarray((kill * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255
    old = a[..., 3] > 128
    a[..., 3] = (a[..., 3] * (1 - k)).astype(np.uint8)
    if job.get("outline"):
        from scipy import ndimage
        new = a[..., 3] > 128
        newedge = new & ~ndimage.binary_erosion(new, iterations=2) & ndimage.binary_dilation(kill, iterations=3)
        oe = old & ~ndimage.binary_erosion(old, iterations=2) & ndimage.binary_dilation(kill, iterations=30) & part
        lum = a[..., :3].mean(-1)
        col = a[..., :3][oe & (lum <= np.percentile(lum[oe], 20))].mean(0)
        kk = np.asarray(Image.fromarray((newedge * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float)[..., None] / 255 * 0.85
        a[..., :3] = (a[..., :3] * (1 - kk) + col * kk).astype(np.uint8)
    if job.get("clear_ghost", True):
        ghost = poly & (a[..., 3] < 90)
        a[..., 3][ghost] = 0
    Image.fromarray(a, "RGBA").save(job["dst"], optimize=True)


def fill_holes(src, dst, near, radius=4):
    im = Image.open(src).convert("RGBA"); a = np.asarray(im).copy()
    solid = a[..., 3] > 128
    x0, y0, x1, y1 = near
    box = np.zeros_like(solid); box[y0:y1, x0:x1] = True
    holes = ndimage.binary_fill_holes(solid) & ~solid & box
    holes = ndimage.binary_dilation(holes, iterations=1) & box
    idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = np.ascontiguousarray(a[..., :3][idx[0], idx[1]][..., ::-1])
    out = cv2.inpaint(rgb, holes.astype(np.uint8) * 255, radius, cv2.INPAINT_TELEA)[..., ::-1]
    a[holes, :3] = out[holes]; a[holes, 3] = 255
    Image.fromarray(a, "RGBA").save(dst, optimize=True)
    return int(holes.sum())


def smooth(src, dst, polys, sigma=3.0):
    a = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
    M = poly_mask((a.shape[1], a.shape[0]), polys)
    solid = a[..., 3] > 128
    closed = ndimage.binary_closing(solid, structure=np.ones((5, 5)))
    pin = closed & ~solid & M
    a[pin, 3] = 255
    w = (a[..., 3] > 230).astype(np.float32)
    num = np.stack([cv2.GaussianBlur(a[..., c] * w, (0, 0), sigma) for c in range(3)], -1)
    den = cv2.GaussianBlur(w, (0, 0), sigma)[..., None]
    sm = num / np.maximum(den, 1e-3)
    inside = M & (cv2.GaussianBlur(a[..., 3], (0, 0), 2) > 150)
    a[inside, :3] = sm[inside]
    a[inside, 3] = np.maximum(a[inside, 3], cv2.GaussianBlur(a[..., 3], (0, 0), 1.5)[inside])
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA").save(dst, optimize=True)


def bridge(src, dst, near, width=None):
    im = Image.open(src).convert("RGBA"); a = np.asarray(im).astype(float)
    solid = a[..., 3] > 128
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
    sizes = ndimage.sum(solid, lab, range(1, n + 1)); main = 1 + int(np.argmax(sizes))
    x0, y0, x1, y1 = near
    box = np.zeros_like(solid); box[y0:y1, x0:x1] = True
    ids = set(np.unique(lab[box & solid])) - {0, main}
    out = a.copy()
    for i in ids:
        isl = lab == i
        # nearest island pixel to the body and the body pixel it is nearest to
        d_body, idx = ndimage.distance_transform_edt(lab != main, return_indices=True)
        ys, xs = np.nonzero(isl); k = int(np.argmin(d_body[ys, xs]))
        p = np.array([xs[k], ys[k]]); q = np.array([idx[1][ys[k], xs[k]], idx[0][ys[k], xs[k]]])
        w = width or max(3, int(min(np.ptp(xs), np.ptp(ys)) * 0.5))
        cp, cq = a[p[1], p[0], :3], a[q[1], q[0], :3]
        L = max(1, int(np.hypot(*(q - p))))
        stroke = np.zeros(solid.shape, np.float32); col = np.zeros(a.shape[:2] + (3,))
        for t in np.linspace(-0.15, 1.15, L * 2 + 4):
            c = p + (q - p) * t; r = w / 2 * (1.0 - 0.25 * min(max(t, 0), 1))
            cv2.circle(stroke, (int(round(c[0])), int(round(c[1]))), max(1, int(round(r))), 1.0, -1)
            tt = min(max(t, 0), 1)
            m = np.zeros(solid.shape, np.uint8); cv2.circle(m, (int(round(c[0])), int(round(c[1]))), max(1, int(round(r))), 1, -1)
            col[m > 0] = cp * (1 - tt) + cq * tt
        k2 = cv2.GaussianBlur(stroke, (0, 0), 0.8)[..., None]
        out[..., :3] = out[..., :3] * (1 - k2) + col * k2
        out[..., 3] = np.maximum(out[..., 3], k2[..., 0] * 255)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA").save(dst, optimize=True)
    return len(ids)


if __name__ == "__main__":
    status = json.loads((ROOT / "status.json").read_text())
    for job in json.loads((ROOT / "local-fixes.json").read_text()):
        sid, n = job["key"].rsplit("-", 1)
        path = ROOT / "final" / sid / f"{STAGES[int(n) - 1]}.png"
        if job["op"] == "join":
            fix(path, path, job.get("fill", []), job.get("retouch", []), job.get("cut", []), job.get("radius", 6), job.get("outline", True))
        elif job["op"] == "smooth":
            smooth(path, path, job["polys"], job.get("sigma", 3.0))
        elif job["op"] == "holes":
            fill_holes(path, path, job["near"], job.get("radius", 4))
        elif job["op"] == "bridge":
            bridge(path, path, job["near"], job.get("width"))
        else:
            cut_colour(path, path, job["poly"], job.get("bminusr", 25), job.get("minlum", 110), job.get("outline", False))
        status[job["key"]].setdefault("local_fixes", []).append(job["why"])
        print("fixed", job["key"], "-", job["why"])
    (ROOT / "status.json").write_text(json.dumps(dict(sorted(status.items())), indent=1))
