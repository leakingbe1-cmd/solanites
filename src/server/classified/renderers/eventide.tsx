import "server-only";
import type { ReactNode } from "react";
import { blade, byStage, Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type EyeKind, type Renderer } from "@/components/creature/kit";

/**
 * Eventide — an eclipse-headed dragonfly with four long glass wings, drawn as four separate forms.
 * Not a moth (no fur, no antennae plumes, no broad scaled wings) and not a bird: veined glass wings,
 * a jointed segmented abdomen and a black eclipse disc for a head.
 */

type Pt = [number, number];
/** A joint along a limb: x, y and the limb's width there. */
type J = [number, number, number];
type Stage = "egg" | "hat" | "evo" | "asc";
/** A galaxy painted inside a wing: position along the wing (0..1), across it (-1..1), radius, tilt. */
type Gal = [number, number, number, number];

/* ───────────────────────────── materials ───────────────────────────── */

function Materials({ c, s }: { c: Ctx; s: Stage }) {
  const { p, id } = c;
  const k = `${id}-${s}`;
  return (
    <defs>
      {/* glass along the wing: bright at the root and tip, dark night in the middle */}
      <linearGradient id={`${k}-glass`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.wingEdge} stopOpacity="0.62" />
        <stop offset="0.2" stopColor={p.accent} stopOpacity="0.3" />
        <stop offset="0.58" stopColor={p.wing} stopOpacity="0.5" />
        <stop offset="0.88" stopColor={p.accent} stopOpacity="0.32" />
        <stop offset="1" stopColor={p.wingEdge} stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id={`${k}-sheen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0.05" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      {/* abdomen segment, lit from the upper left: dark lacquer with a silver ridge */}
      <linearGradient id={`${k}-seg`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.belly} />
        <stop offset="0.24" stopColor={p.bodyDark} />
        <stop offset="0.4" stopColor={p.body} />
        <stop offset="0.56" stopColor={p.bodyDark} />
        <stop offset="0.9" stopColor={p.belly} />
        <stop offset="1" stopColor={p.bodyDark} />
      </linearGradient>
      <radialGradient id={`${k}-thorax`} cx="0.36" cy="0.3" r="0.8">
        <stop offset="0" stopColor={p.body} />
        <stop offset="0.34" stopColor={p.bodyDark} />
        <stop offset="0.88" stopColor={p.belly} />
        <stop offset="1" stopColor={p.bodyDark} />
      </radialGradient>
      <radialGradient id={`${k}-disc`} cx="0.42" cy="0.38" r="0.62">
        <stop offset="0" stopColor="#0d0a26" />
        <stop offset="0.82" stopColor="#04020c" />
        <stop offset="1" stopColor="#1c1646" />
      </radialGradient>
      {/* the corona: drawn at 2.1x the disc radius so the white edge sits on the limb */}
      <radialGradient id={`${k}-corona`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.44" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="0.52" stopColor={p.wingEdge} stopOpacity="0.6" />
        <stop offset="0.72" stopColor={p.accent} stopOpacity="0.22" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${k}-ray`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="0.45" stopColor={p.wingEdge} stopOpacity="0.45" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${k}-galaxy`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="0.18" stopColor={p.wingEdge} stopOpacity="0.75" />
        <stop offset="0.55" stopColor={p.accent} stopOpacity="0.35" />
        <stop offset="1" stopColor={p.accent} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const ev = (c: Ctx, s: Stage, name: string) => `url(#${c.id}-${s}-${name})`;

const star4 = (x: number, y: number, r: number) => {
  const q = round(r * 0.2);
  return `M${x},${round(y - r)} L${round(x + q)},${round(y - q)} L${round(x + r)},${y} L${round(x + q)},${round(y + q)} L${x},${round(y + r)} L${round(x - q)},${round(y + q)} L${round(x - r)},${y} L${round(x - q)},${round(y - q)} Z`;
};

/* ───────────────────────────── wings ───────────────────────────── */

/** Dragonfly wing along +x with the leading edge on -y; hind wings are broader at the root. */
function wingPath(l: number, w: number, hind: boolean) {
  const L = (k: number) => round(l * k);
  const W = (k: number) => round(w * k);
  return `M0,-1.5 C${L(0.22)},${W(-0.8)} ${L(0.68)},${W(-1.02)} ${L(0.92)},${W(-0.8)} C${L(1.02)},${W(-0.62)} ${L(1.02)},${W(0.12)} ${L(0.9)},${W(0.36)} C${L(0.66)},${W(0.82)} ${L(0.34)},${W(hind ? 1.3 : 0.95)} ${L(0.12)},${W(hind ? 0.95 : 0.55)} C${L(0.05)},${W(0.32)} 0,${W(0.14)} 0,1.5 Z`;
}

interface WingSpec {
  k: string;
  at: Pt;
  a: number;
  l: number;
  w: number;
  hind?: boolean;
  stars?: number;
  gal?: Gal[];
  /** Crumpled, still-unfolding glass (Hatchling). */
  soft?: boolean;
}

function Wing({ c, s, id, f }: { c: Ctx; s: Stage; id: string; f: WingSpec }) {
  const { p, u } = c;
  const { l, w, hind = false } = f;
  const cid = `${c.id}-${s}-wc-${id}`;
  const d = wingPath(l, w, hind);
  const L = (k: number) => round(l * k);
  const W = (k: number) => round(w * k);
  const step = l > 60 ? 6.5 : 5;
  const cross = Array.from({ length: Math.floor((l - 8) / step) }, (_, i) => round(8 + i * step));
  const slant = round(w * 0.35);
  return (
    <g>
      <clipPath id={cid}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={ev(c, s, "glass")} />
      <g clipPath={`url(#${cid})`}>
        <rect x="-4" y={W(-1.5)} width={L(1.1)} height={W(3)} fill={u("stars")} opacity={f.stars ?? 0.8} />
        {f.gal?.map(([t, o, r, rot], i) => {
          const gx = L(t);
          const gy = W(o);
          return (
            <g key={i} transform={`translate(${gx} ${gy}) rotate(${rot})`}>
              <ellipse rx={r} ry={round(r * 0.42)} fill={ev(c, s, "galaxy")} />
              <path
                d={`M0,0 C${round(r * 0.4)},${round(-r * 0.3)} ${round(r * 0.8)},${round(-r * 0.15)} ${round(r * 0.95)},${round(r * 0.12)} M0,0 C${round(-r * 0.4)},${round(r * 0.3)} ${round(-r * 0.8)},${round(r * 0.15)} ${round(-r * 0.95)},${round(-r * 0.12)}`}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.55"
                strokeWidth="0.9"
              />
              <circle r={round(r * 0.14)} fill="#fff" filter={u("glow")} />
            </g>
          );
        })}
        {/* cell network: cross-veins between the long veins */}
        <path d={cross.map((x) => `M${x},${W(-1.3)} L${round(x + slant)},${W(1.4)}`).join(" ")} stroke={p.wingEdge} strokeOpacity={f.soft ? 0.1 : 0.17} strokeWidth="0.6" />
        <path
          d={`M2,-1 Q${L(0.5)},${W(-0.66)} ${L(0.97)},${W(-0.5)} M2,0 Q${L(0.5)},${W(-0.12)} ${L(0.95)},${W(0.06)} M2,1 Q${L(0.45)},${W(0.42)} ${L(0.86)},${W(0.48)} M${L(0.06)},${W(0.4)} Q${L(0.24)},${W(hind ? 0.95 : 0.62)} ${L(0.52)},${W(0.72)}`}
          stroke={p.wingEdge}
          strokeOpacity="0.5"
          strokeWidth="0.8"
          fill="none"
        />
        {f.soft && <path d={`M${L(0.3)},${W(-1)} Q${L(0.4)},0 ${L(0.32)},${W(1)} M${L(0.6)},${W(-1)} Q${L(0.7)},0 ${L(0.62)},${W(1)}`} stroke={p.wingEdge} strokeOpacity="0.28" strokeWidth="1.4" fill="none" />}
        <path d={d} fill={ev(c, s, "sheen")} />
      </g>
      {/* costa: the strong bright leading edge */}
      <path
        d={`M0,-1.5 C${L(0.22)},${W(-0.8)} ${L(0.68)},${W(-1.02)} ${L(0.92)},${W(-0.8)} C${L(1.02)},${W(-0.62)} ${L(1.02)},${W(0.12)} ${L(0.9)},${W(0.36)}`}
        fill="none"
        stroke={p.wingEdge}
        strokeOpacity="0.95"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d={d} fill="none" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="0.8" />
      {/* pterostigma */}
      <path d={`M${L(0.79)},${W(-0.93)} L${L(0.87)},${W(-0.88)} L${L(0.86)},${W(-0.66)} L${L(0.78)},${W(-0.71)} Z`} fill={p.accent} filter={u("glow")} />
    </g>
  );
}

/** Both sides of a wing set; the left is the mirror of the right. Hind wings beat out of phase. */
function Wings({ c, s, specs }: { c: Ctx; s: Stage; specs: WingSpec[] }) {
  const side = (m: string) =>
    specs.map((f) => (
      <g key={m + f.k} className="sl-flap" style={{ transformOrigin: `${f.at[0]}px ${f.at[1]}px`, animationDelay: f.hind ? "-1.6s" : undefined }}>
        <g transform={`translate(${f.at[0]} ${f.at[1]}) rotate(${f.a})`}>
          <Wing c={c} s={s} id={m + f.k} f={f} />
        </g>
      </g>
    ));
  return (
    <g>
      {side("r")}
      <g transform={MIRROR}>{side("l")}</g>
    </g>
  );
}

/* ───────────────────────────── body ───────────────────────────── */

/** Angular tapered outline through a chain of joints (insect legs are segmented). */
function limb(pts: J[]) {
  const n = pts.length;
  const side = (k: number) =>
    pts.slice(0, -1).map(([x, y, w], i) => {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return `${round(x - ((b[1] - a[1]) / L) * w * k)},${round(y + ((b[0] - a[0]) / L) * w * k)}`;
    });
  const tip = pts[n - 1];
  return `M${side(0.5).join(" L")} L${round(tip[0])},${round(tip[1])} L${side(-0.5).reverse().join(" L")} Z`;
}

/** Right-side legs (mirrored to the left), tucked forward under the thorax as a hovering dragonfly holds them. */
function Legs({ c, legs }: { c: Ctx; legs: J[][] }) {
  const { p } = c;
  const draw = (m: string) =>
    legs.map((pts, i) => {
      const [kx, ky, kw] = pts[1];
      const [tx, ty] = pts[pts.length - 1];
      return (
        <g key={m + i}>
          <path d={limb(pts)} fill={p.bodyDark} stroke={p.belly} strokeWidth="0.8" strokeLinejoin="round" />
          <path d={`M${pts.map(([x, y, w]) => `${round(x - w * 0.15)},${round(y - w * 0.2)}`).join(" L")}`} fill="none" stroke={p.body} strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
          <circle cx={kx} cy={ky} r={round(kw * 0.62)} fill={p.bodyDark} stroke={p.body} strokeOpacity="0.4" strokeWidth="0.7" />
          <path d={`M${tx},${ty} l-2,-3 M${tx},${ty} l2.5,-2`} stroke={p.body} strokeWidth="1" strokeLinecap="round" />
        </g>
      );
    });
  return (
    <g>
      {draw("r")}
      <g transform={MIRROR}>{draw("l")}</g>
    </g>
  );
}

function bez([a, b, cc, d]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const m = 1 - t;
  return [round(m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * cc[0] + t * t * t * d[0]), round(m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * cc[1] + t * t * t * d[1])];
}

/** One abdominal segment along +y from 0 to h, half-width r, with a slight waist and a flared rear rim. */
function segPath(r: number, h: number) {
  const R = (k: number) => round(r * k);
  const H = (k: number) => round(h * k);
  return `M${-r},1 C${-r},${H(0.45)} ${R(-0.8)},${H(0.75)} ${R(-0.92)},${h} L${R(0.92)},${h} C${R(0.8)},${H(0.75)} ${r},${H(0.45)} ${r},1 C${R(0.55)},-1.5 ${R(-0.55)},-1.5 ${-r},1 Z`;
}

/**
 * The long segmented abdomen along a cubic spine. `width(t)` gives the half-width along it.
 * Drawn tip-first so each segment's rear rim overlaps the next. Returns the end point and heading.
 */
function Abdomen({ c, s, spine, n, width, marks = 0.9, glow = 1 }: { c: Ctx; s: Stage; spine: [Pt, Pt, Pt, Pt]; n: number; width: (t: number) => number; marks?: number; glow?: number }) {
  const { p, u } = c;
  const pts = Array.from({ length: n + 1 }, (_, i) => bez(spine, i / n));
  const segs = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1];
    const h = round(Math.hypot(b[0] - a[0], b[1] - a[1]) + 1.5);
    const ang = round((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90);
    return { a, h, ang, r: round(width(i / (n - 1))), i };
  });
  return (
    <g>
      {[...segs].reverse().map(({ a, h, ang, r, i }) => (
        <g key={i} transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
          <path d={segPath(r, h)} fill={ev(c, s, "seg")} {...rim(c, 1)} />
          <rect x={round(-r * 0.9)} y="0" width={round(r * 1.8)} height={h} fill={u("stars")} opacity="0.45" />
          {/* silver dorsal ridge and the dark intersegmental ring */}
          <path d={`M${round(-r * 0.32)},2 L${round(-r * 0.26)},${round(h - 2)}`} stroke="#fff" strokeOpacity="0.42" strokeWidth={round(Math.max(0.8, r * 0.12))} strokeLinecap="round" />
          <ellipse cx="0" cy={h} rx={round(r * 0.86)} ry="1.2" fill={p.belly} opacity="0.9" />
          {i % 2 === 0 && (
            <g opacity={marks * c.mark} filter={u("glow")}>
              <ellipse cx={round(-r * 0.46)} cy={round(h * 0.42)} rx={round(r * 0.2)} ry={round(h * 0.18)} fill={p.accent} />
              <ellipse cx={round(r * 0.46)} cy={round(h * 0.42)} rx={round(r * 0.2)} ry={round(h * 0.18)} fill={p.accent} />
            </g>
          )}
          {i % 3 === 1 && glow > 0 && <circle cx="0" cy={round(h * 0.5)} r={round(Math.max(0.8, r * 0.12))} fill="#fff" opacity={0.8 * glow} />}
        </g>
      ))}
    </g>
  );
}

/** Small anal appendages at the tail tip. */
function Cerci({ c, at, a, l }: { c: Ctx; at: Pt; a: number; l: number }) {
  const { p } = c;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${a})`}>
      {[-16, 16].map((d) => (
        <path key={d} d={blade(l, round(l * 0.16), 0.6)} transform={`rotate(${90 + d})`} fill={p.bodyDark} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.7" />
      ))}
    </g>
  );
}

/** Dorsal thorax: broad shoulders that carry the wings, antehumeral stripes and the Solgem. */
function Thorax({ c, s, x, y, rx, ry, gem }: { c: Ctx; s: Stage; x: number; y: number; rx: number; ry: number; gem: number }) {
  const { p, u } = c;
  const X = (k: number) => round(x + rx * k);
  const Y = (k: number) => round(y + ry * k);
  return (
    <g>
      <path
        d={`M${x},${Y(-1)} C${X(0.86)},${Y(-1)} ${X(1.06)},${Y(-0.4)} ${X(1)},${Y(0.12)} C${X(0.94)},${Y(0.72)} ${X(0.46)},${Y(1)} ${x},${Y(1)} C${X(-0.46)},${Y(1)} ${X(-0.94)},${Y(0.72)} ${X(-1)},${Y(0.12)} C${X(-1.06)},${Y(-0.4)} ${X(-0.86)},${Y(-1)} ${x},${Y(-1)} Z`}
        fill={ev(c, s, "thorax")}
        {...rim(c)}
      />
      <ellipse cx={x} cy={y} rx={round(rx * 0.86)} ry={round(ry * 0.86)} fill={u("stars")} opacity="0.5" />
      <path d={`M${x},${Y(-0.9)} L${x},${Y(0.92)}`} stroke={p.belly} strokeOpacity="0.8" strokeWidth="1.2" />
      <g fill="none" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round" opacity={c.mark} filter={u("glow")}>
        <path d={`M${X(-0.3)},${Y(-0.74)} C${X(-0.52)},${Y(-0.2)} ${X(-0.5)},${Y(0.3)} ${X(-0.28)},${Y(0.72)}`} />
        <path d={`M${X(0.3)},${Y(-0.74)} C${X(0.52)},${Y(-0.2)} ${X(0.5)},${Y(0.3)} ${X(0.28)},${Y(0.72)}`} />
      </g>
      <path d={`M${X(-0.9)},${Y(-0.2)} C${X(-0.8)},${Y(-0.8)} ${X(-0.3)},${Y(-0.98)} ${x},${Y(-0.98)}`} fill="none" stroke={p.bodyLight} strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={X(-0.32)} y={Y(-0.5)} rx={round(rx * 0.32)} ry={round(ry * 0.16)} rot={-30} o={0.3} />
      <Gem c={c} x={x} y={Y(0.08)} s={gem} />
    </g>
  );
}

/* ───────────────────────────── eclipse head ───────────────────────────── */

/**
 * The eclipse disc. phase 0: a dim halo; 1: a half-formed bright ring; 2: full ring and corona streamers;
 * 3: blazing corona, long spinning rays and prominence loops.
 */
function Eclipse({ c, s, x, y, r, phase, eye, kind = "orb", gap = 0.36, eyeY = 0.1, smile = false }: { c: Ctx; s: Stage; x: number; y: number; r: number; phase: 0 | 1 | 2 | 3; eye: number; kind?: EyeKind; gap?: number; eyeY?: number; smile?: boolean }) {
  const { p, u } = c;
  const streamers = phase >= 2 ? (phase === 3 ? 16 : 12) : 0;
  const ring = (a0: number, a1: number, rr: number) => {
    const [x0, y0] = polar(x, y, rr, a0);
    const [x1, y1] = polar(x, y, rr, a1);
    return `M${x0},${y0} A${rr},${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  const [dx, dy] = polar(x, y, r + 1, -52);
  return (
    <g>
      <circle cx={x} cy={y} r={round(r * 1.5)} fill={p.accent} opacity={[0.22, 0.3, 0.42, 0.55][phase]} filter={u("blur8")} />
      {phase >= 2 && <circle cx={x} cy={y} r={round(r * 2.15)} fill={ev(c, s, "corona")} className="sl-aura-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />}
      {phase === 3 && (
        <g className="sl-spin-slow" style={{ transformOrigin: `${x}px ${y}px` }}>
          {Array.from({ length: 24 }, (_, i) => {
            const a = i * 15 + 7;
            const len = round(r * (i % 2 ? 1.5 : 2.5) + (i % 3) * 6);
            const [tx, ty] = polar(x, y, r + len, a);
            const [lx, ly] = polar(x, y, r, a - 2.4);
            const [qx, qy] = polar(x, y, r, a + 2.4);
            return <path key={i} d={`M${lx},${ly} L${tx},${ty} L${qx},${qy} Z`} fill={i % 2 ? p.accent : p.wingEdge} opacity={i % 2 ? 0.55 : 0.75} />;
          })}
        </g>
      )}
      {streamers > 0 &&
        Array.from({ length: streamers }, (_, i) => {
          const a = (360 * i) / streamers - 90 + (i % 2 ? 6 : 0);
          const [bx, by] = polar(x, y, r * 0.9, a);
          const len = round(r * (i % 2 ? 0.6 : phase === 3 ? 1.25 : 1) + (i % 3) * 3);
          return <path key={i} d={blade(len, round(r * 0.17), 0.5)} transform={`translate(${bx} ${by}) rotate(${round(a)})`} fill={ev(c, s, "ray")} />;
        })}
      {phase === 3 && (
        <g fill="none" strokeLinecap="round" filter={u("glow")}>
          {[-128, -52, 38, 152].map((a, i) => {
            const [ax, ay] = polar(x, y, r, a - 9);
            const [bx, by] = polar(x, y, r, a + 9);
            const k = i % 2 ? 1.55 : 1.75;
            const [c1x, c1y] = polar(x, y, r * k, a - 16);
            const [c2x, c2y] = polar(x, y, r * k, a + 16);
            return (
              <g key={a}>
                <path d={`M${ax},${ay} C${c1x},${c1y} ${c2x},${c2y} ${bx},${by}`} stroke={p.accent} strokeWidth="3" />
                <path d={`M${ax},${ay} C${c1x},${c1y} ${c2x},${c2y} ${bx},${by}`} stroke="#fff" strokeWidth="1" />
              </g>
            );
          })}
        </g>
      )}
      {/* the limb of light */}
      {phase === 0 && <circle cx={x} cy={y} r={r + 2} fill="none" stroke={p.accent} strokeOpacity="0.5" strokeWidth="2.5" filter={u("glow")} className="sl-aura-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />}
      {phase === 1 && (
        <g fill="none" strokeLinecap="round">
          <circle cx={x} cy={y} r={r + 1} stroke={p.accent} strokeOpacity="0.28" strokeWidth="2" strokeDasharray="3 5" />
          <path d={ring(150, 390, r + 1)} stroke={p.wingEdge} strokeWidth="3" filter={u("glow")} />
          <path d={ring(160, 380, r + 1)} stroke="#fff" strokeWidth="1.2" />
        </g>
      )}
      {phase >= 2 && (
        <g fill="none">
          <circle cx={x} cy={y} r={r + 1} stroke={p.wingEdge} strokeWidth={phase === 3 ? 4 : 3.2} filter={u("glow")} />
          <circle cx={x} cy={y} r={r + 1} stroke="#fff" strokeWidth="1.3" />
        </g>
      )}
      <circle cx={x} cy={y} r={r} fill={ev(c, s, "disc")} />
      {/* earthshine on the shadowed face gives the disc some roundness */}
      <path d={`M${round(x - r * 0.86)},${round(y + r * 0.2)} C${round(x - r * 0.7)},${round(y + r * 0.8)} ${round(x + r * 0.2)},${round(y + r * 1.02)} ${round(x + r * 0.7)},${round(y + r * 0.6)} C${round(x + r * 0.1)},${round(y + r * 0.8)} ${round(x - r * 0.56)},${round(y + r * 0.66)} ${round(x - r * 0.86)},${round(y + r * 0.2)} Z`} fill={p.bodyDark} opacity="0.45" />
      <Spec x={round(x - r * 0.38)} y={round(y - r * 0.56)} rx={round(r * 0.3)} ry={round(r * 0.09)} rot={-32} o={0.18} />
      {phase >= 1 && (
        <g filter={u("glow")} className="sl-twinkle">
          <path d={star4(dx, dy, [0, 6, 9, 13][phase])} fill="#fff" />
          <circle cx={dx} cy={dy} r={[0, 1.8, 2.4, 3.2][phase]} fill="#fff" />
        </g>
      )}
      <Eye c={c} x={round(x - r * gap)} y={round(y + r * eyeY)} r={eye} kind={kind} />
      <Eye c={c} x={round(x + r * gap)} y={round(y + r * eyeY)} r={eye} kind={kind} />
      {smile && <path d={`M${round(x - r * 0.12)},${round(y + r * 0.46)} Q${x},${round(y + r * 0.56)} ${round(x + r * 0.12)},${round(y + r * 0.46)}`} fill="none" stroke={p.accent} strokeOpacity="0.8" strokeWidth="1.6" strokeLinecap="round" />}
    </g>
  );
}

/** Neck and mouthparts joining the disc to the thorax. */
function Neck({ c, x, y0, y1, w }: { c: Ctx; x: number; y0: number; y1: number; w: number }) {
  const { p } = c;
  return <path d={`M${round(x - w)},${y0} C${round(x - w * 0.6)},${round((y0 + y1) / 2)} ${round(x - w * 0.6)},${round((y0 + y1) / 2)} ${round(x - w * 0.9)},${y1} L${round(x + w * 0.9)},${y1} C${round(x + w * 0.6)},${round((y0 + y1) / 2)} ${round(x + w * 0.6)},${round((y0 + y1) / 2)} ${round(x + w)},${y0} Z`} fill={p.bodyDark} stroke={p.belly} strokeWidth="1" />;
}

/* ───────────────────────────── stages ───────────────────────────── */

/** Eggling: a plump little nymph. Huge eclipse head with a dim halo, wing pads, a short tail ending in three gill-leaves. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const s: Stage = "egg";
  return (
    <g>
      <Materials c={c} s={s} />
      {/* nymph gill-leaves at the tail tip */}
      <g className="sl-sway" style={{ transformOrigin: "200px 318px" }}>
        {[64, 90, 116].map((a) => (
          <g key={a} transform={`translate(200 316) rotate(${a})`}>
            <path d={blade(a === 90 ? 26 : 22, 7, 0.6)} fill={ev(c, s, "glass")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />
            <path d={`M2,0 L${a === 90 ? 22 : 18},0`} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.7" />
          </g>
        ))}
      </g>
      <Legs
        c={c}
        legs={[
          [
            [214, 224, 8],
            [230, 216, 7],
            [234, 204, 5],
          ],
          [
            [218, 236, 8],
            [236, 240, 7],
            [242, 230, 5],
          ],
          [
            [214, 248, 8],
            [232, 260, 7],
            [236, 272, 5],
          ],
        ]}
      />
      <Abdomen c={c} s={s} spine={[[200, 248], [200, 270], [200, 296], [200, 318]]} n={5} width={(t) => 21 - 9 * t} marks={0.7} glow={0.5} />
      <Thorax c={c} s={s} x={200} y={232} rx={27} ry={22} gem={0.5} />
      {/* wing pads: tiny glass buds folded back along the body */}
      <Wings
        c={c}
        s={s}
        specs={[
          { k: "h", at: [208, 240], a: 58, l: 30, w: 9, hind: true, stars: 0.6 },
          { k: "f", at: [210, 230], a: 40, l: 28, w: 8, stars: 0.6 },
        ]}
      />
      <Neck c={c} x={200} y0={200} y1={216} w={14} />
      <Eclipse c={c} s={s} x={200} y={166} r={44} phase={0} eye={9.5} kind="round" gap={0.37} eyeY={0.06} smile />
      <Dots c={c} r={1.3} color="#fff" pts={[[150, 136], [252, 128], [140, 262], [262, 300]]} />
    </g>
  );
}

/** Hatchling: a teneral juvenile; short glass wings still unfolding, a half-formed eclipse ring, a longer tail. */
function hatchling(c: Ctx) {
  const s: Stage = "hat";
  return (
    <g>
      <Materials c={c} s={s} />
      <Wings
        c={c}
        s={s}
        specs={[
          { k: "h", at: [210, 206], a: 18, l: 78, w: 17, hind: true, stars: 0.6, soft: true },
          { k: "f", at: [211, 192], a: -12, l: 86, w: 15, stars: 0.6, soft: true },
        ]}
      />
      <Legs
        c={c}
        legs={[
          [
            [210, 190, 6],
            [224, 182, 5],
            [224, 170, 3.2],
          ],
          [
            [212, 200, 6],
            [228, 202, 5],
            [231, 192, 3.2],
          ],
          [
            [210, 210, 6],
            [226, 218, 5],
            [229, 230, 3.2],
          ],
        ]}
      />
      <Abdomen c={c} s={s} spine={[[200, 220], [200, 260], [198, 300], [200, 336]]} n={8} width={(t) => (t < 0.15 ? 13 : 11 - 4.5 * t)} marks={0.85} glow={0.7} />
      <Cerci c={c} at={[200, 336]} a={0} l={12} />
      <Thorax c={c} s={s} x={200} y={200} rx={22} ry={21} gem={0.5} />
      <Neck c={c} x={200} y0={172} y1={184} w={11} />
      <Eclipse c={c} s={s} x={200} y={146} r={34} phase={1} eye={6.6} kind="round" gap={0.36} eyeY={0.1} />
      <Dots c={c} r={1.4} color="#fff" pts={[[120, 150], [282, 146], [118, 248], [284, 244], [160, 300]]} />
    </g>
  );
}

/** Evolved: the mature dragonfly; four long star-glass wings, the full eclipse with its corona, a long jointed tail. */
function evolved(c: Ctx) {
  const s: Stage = "evo";
  return (
    <g>
      <Materials c={c} s={s} />
      <Wings
        c={c}
        s={s}
        specs={[
          { k: "h", at: [209, 194], a: 13, l: 128, w: 23, hind: true, stars: 0.85 },
          { k: "f", at: [210, 178], a: -11, l: 140, w: 20, stars: 0.85 },
        ]}
      />
      <Legs
        c={c}
        legs={[
          [
            [207, 176, 5.4],
            [220, 168, 4.6],
            [219, 156, 2.8],
          ],
          [
            [209, 186, 5.4],
            [223, 188, 4.6],
            [226, 178, 2.8],
          ],
          [
            [207, 196, 5.4],
            [221, 204, 4.6],
            [224, 215, 2.8],
          ],
        ]}
      />
      <Abdomen c={c} s={s} spine={[[200, 208], [200, 262], [199, 316], [200, 356]]} n={10} width={(t) => (t < 0.1 ? 10.5 : t > 0.8 ? 6.6 : 8.4 - 3 * t)} />
      <Cerci c={c} at={[200, 356]} a={0} l={14} />
      <Thorax c={c} s={s} x={200} y={188} rx={18} ry={21} gem={0.52} />
      <Neck c={c} x={200} y0={160} y1={170} w={9} />
      <Eclipse c={c} s={s} x={200} y={136} r={28} phase={2} eye={3.8} gap={0.34} eyeY={0.1} />
      <Dots c={c} r={1.4} color="#fff" pts={[[112, 118], [290, 114], [96, 238], [306, 234], [150, 330], [256, 334]]} />
    </g>
  );
}

/** Ascended: Wing of the Last Light; galaxy-glass wings raised in a V, six wings, blazing corona, a curving tail shedding stardust. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const s: Stage = "asc";
  const tip: Pt = [226, 338];
  const trails: [Pt, Pt, Pt, Pt][] = [
    [tip, [226, 362], [196, 376], [150, 372]],
    [tip, [236, 366], [222, 384], [186, 386]],
  ];
  const dust: Pt[] = [[0.62, 0], [0.8, 0], [0.95, 0], [0.7, 1], [0.9, 1]].map(([t, k]) => bez(trails[k], t)).concat([[134, 366], [118, 356], [168, 392], [102, 344]] as Pt[]);
  /** A comet streamer: a ribbon tapering from the tail tip to nothing, with a bright core. */
  const trail = (key: string, q: [Pt, Pt, Pt, Pt], w0: number): ReactNode => {
    const n = 14;
    const pts = Array.from({ length: n + 1 }, (_, i) => bez(q, i / n));
    const edge = (k: number) =>
      pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(n, i + 1)];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const w = w0 * (1 - i / n) * k;
        return `${round(x - ((b[1] - a[1]) / L) * w)},${round(y + ((b[0] - a[0]) / L) * w)}`;
      });
    const d = `M${q[0][0]},${q[0][1]} C${q[1][0]},${q[1][1]} ${q[2][0]},${q[2][1]} ${q[3][0]},${q[3][1]}`;
    return (
      <g key={key}>
        <path d={`M${edge(1).join(" L")} L${edge(-1).reverse().join(" L")} Z`} fill={p.accent} opacity="0.55" filter={u("glow")} />
        <path d={`M${edge(0.55).join(" L")} L${edge(-0.55).reverse().join(" L")} Z`} fill={p.wingEdge} opacity="0.85" />
        <path d={d} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
      </g>
    );
  };
  return (
    <g>
      <Materials c={c} s={s} />
      {/* trailing stardust from the cerci streamers */}
      <g className="sl-sway-slow" style={{ transformOrigin: "226px 338px" }}>
        {trail("a", trails[0], 5.5)}
        {trail("b", trails[1], 4)}
        <Dots c={c} r={1.7} color="#fff" pts={dust} />
      </g>
      {/* the third pair: small veil wings near the tail root, an Ascended-only grace */}
      <Wings
        c={c}
        s={s}
        specs={[
          { k: "v", at: [207, 206], a: 64, l: 58, w: 11, hind: true, stars: 1 },
          { k: "h", at: [210, 182], a: -8, l: 146, w: 27, hind: true, stars: 1, gal: [[0.55, 0.2, 18, -12]] },
          { k: "f", at: [211, 164], a: -32, l: 158, w: 23, stars: 1, gal: [[0.42, -0.1, 14, 18], [0.72, -0.25, 11, -8]] },
        ]}
      />
      <Legs
        c={c}
        legs={[
          [
            [207, 162, 5.6],
            [221, 153, 4.8],
            [220, 140, 3],
          ],
          [
            [209, 172, 5.6],
            [224, 174, 4.8],
            [227, 163, 3],
          ],
          [
            [207, 182, 5.6],
            [222, 190, 4.8],
            [226, 201, 3],
          ],
        ]}
      />
      <Abdomen c={c} s={s} spine={[[200, 194], [198, 256], [242, 284], [226, 338]]} n={12} width={(t) => (t < 0.08 ? 11 : t > 0.82 ? 7 : 9 - 3 * t)} glow={1} />
      <Thorax c={c} s={s} x={200} y={174} rx={19} ry={22} gem={0.58} />
      <Neck c={c} x={200} y0={144} y1={156} w={10} />
      <Eclipse c={c} s={s} x={200} y={118} r={30} phase={3} eye={4} gap={0.34} eyeY={0.1} />
      <Dots c={c} r={1.6} color="#fff" pts={[[100, 92], [306, 90], [70, 200], [332, 196], [92, 290], [316, 300]]} />
    </g>
  );
}

export const eventide: Renderer = {
  floating: true,
  shadow: 100,
  halo: [200, 40, 30],
  stageFit: [1.35, 1.12, 1, 0.88],
  render: byStage(eggling, hatchling, evolved, ascended),
};
