import type { ReactNode } from "react";
import { blade, byStage, Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Helivane — a raptor carrying a sun: falcon head, layered raptor wings and a solar corona. Not a phoenix: no flame body. */

type Pt = [number, number];

/** Helivane's own radiant amber/gold materials; bodyDark is kept for shading and the hood only. */
function Materials({ c }: { c: Ctx }) {
  const { p, id } = c;
  return (
    <defs>
      <radialGradient id={`${id}-hv-body`} cx="0.38" cy="0.26" r="0.86">
        <stop offset="0" stopColor={p.wingEdge} />
        <stop offset="0.3" stopColor={p.bodyLight} />
        <stop offset="0.66" stopColor={p.wing} />
        <stop offset="0.93" stopColor={p.body} />
        <stop offset="1" stopColor={p.bodyLight} />
      </radialGradient>
      {/* feather layers, each a shade lighter towards the white-hot tips (drawn along +x) */}
      <linearGradient id={`${id}-hv-cov`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.body} />
        <stop offset="1" stopColor={p.wing} />
      </linearGradient>
      <linearGradient id={`${id}-hv-sec`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.wing} />
        <stop offset="1" stopColor={p.bodyLight} />
      </linearGradient>
      <linearGradient id={`${id}-hv-pri`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={p.wing} />
        <stop offset="0.5" stopColor={p.bodyLight} />
        <stop offset="0.86" stopColor={p.wingEdge} />
        <stop offset="1" stopColor="#ffffff" />
      </linearGradient>
      <radialGradient id={`${id}-hv-sun`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.3" stopColor={p.wingEdge} />
        <stop offset="0.62" stopColor={p.accent} />
        <stop offset="0.9" stopColor={p.wing} stopOpacity="0.85" />
        <stop offset="1" stopColor={p.wing} stopOpacity="0.5" />
      </radialGradient>
    </defs>
  );
}

const hv = (c: Ctx, name: string) => `url(#${c.id}-hv-${name})`;

/** Scalloped outline for down and fluff. */
function fluff(cx: number, cy: number, rx: number, ry: number, n: number, b: number) {
  const pt = (deg: number, k: number) => [round(cx + Math.cos((deg * Math.PI) / 180) * rx * k), round(cy + Math.sin((deg * Math.PI) / 180) * ry * k)];
  const [x0, y0] = pt(0, 1);
  let d = `M${x0},${y0}`;
  for (let i = 0; i < n; i++) {
    const a = (360 * i) / n;
    const [qx, qy] = pt(a + 180 / n, 1 + b);
    const [x, y] = pt(a + 360 / n, 1);
    d += ` Q${qx},${qy} ${x},${y}`;
  }
  return d + " Z";
}

/** Fine chevrons across a falcon breast. */
function Bars({ c, rows }: { c: Ctx; rows: [number, number, number][] }) {
  return (
    <g fill="none" stroke={c.p.body} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round">
      {rows.flatMap(([y, x0, x1]) =>
        Array.from({ length: Math.max(1, Math.round((x1 - x0) / 11)) }, (_, i) => {
          const x = round(x0 + i * 11 + ((y / 12) % 2 ? 5 : 0));
          return <path key={`${y}-${x}`} d={`M${x - 4},${y} C${x - 1},${y + 3} ${x + 1},${y + 3} ${x + 4},${y}`} />;
        }),
      )}
    </g>
  );
}

/** A broad flight feather along +x with an emarginated (slotted) tip. */
function quill(l: number, w: number) {
  const L = (k: number) => round(l * k);
  const W = (k: number) => round(w * k);
  return `M0,${W(-0.55)} C${L(0.3)},${W(-1)} ${L(0.58)},${W(-1)} ${L(0.7)},${W(-0.62)} C${L(0.84)},${W(-0.5)} ${L(0.96)},${W(-0.3)} ${l},0 C${L(0.96)},${W(0.28)} ${L(0.84)},${W(0.46)} ${L(0.7)},${W(0.52)} C${L(0.56)},${W(0.9)} ${L(0.3)},${W(0.9)} 0,${W(0.55)} Z`;
}

function Quill({ c, at, a, l, w, fill, hot }: { c: Ctx; at: Pt; a: number; l: number; w: number; fill: string; hot?: boolean }) {
  return (
    <g transform={`translate(${round(at[0])} ${round(at[1])}) rotate(${round(a)})`}>
      <path d={quill(l, w)} fill={fill} stroke={c.p.body} strokeOpacity="0.55" strokeWidth="0.9" />
      <path d={`M2,0 L${round(l * 0.92)},0`} stroke={c.p.wingEdge} strokeOpacity="0.55" strokeWidth="0.9" />
      {hot && <ellipse cx={round(l * 0.9)} cy="0" rx={round(l * 0.09)} ry={round(w * 0.3)} fill="#fff" opacity="0.75" />}
    </g>
  );
}

/**
 * A layered raptor wing. The arm runs shoulder → wrist; secondaries hang from the arm (angles sa0 → sa1),
 * primaries fan from the wrist (pa0 → pa1), then greater coverts and a solid covert mass sit over the roots.
 */
function Wing({ c, s, wr, sa, pa, L, ns = 7, np = 6, dim = false }: { c: Ctx; s: Pt; wr: Pt; sa: [number, number]; pa: [number, number]; L: number; ns?: number; np?: number; dim?: boolean }) {
  const lerp = (t: number): Pt => [s[0] + (wr[0] - s[0]) * t, s[1] + (wr[1] - s[1]) * t];
  const secs = Array.from({ length: ns }, (_, i) => {
    const t = i / (ns - 1);
    return { at: lerp(t * 0.9), a: sa[0] + (sa[1] - sa[0]) * t, l: L * (0.5 + 0.06 * t), t };
  });
  const lens = [0.8, 0.88, 0.95, 1, 0.97, 0.88, 0.8, 0.74];
  const pris = Array.from({ length: np }, (_, i) => {
    const t = i / (np - 1);
    return { at: lerp(0.82 + 0.18 * t), a: pa[0] + (pa[1] - pa[0]) * t, l: L * lens[i % lens.length], t };
  });
  const roots = [...secs, ...pris];
  const off = (f: { at: Pt; a: number; l: number }, k: number): Pt => polar(f.at[0], f.at[1], f.l * k, f.a);
  // The covert mass: along the arm, then back along the roots pushed out over the feathers.
  const mass = [...roots.map((f) => f.at), ...roots.map((f) => off(f, 0.26)).reverse()];
  const massD = `M${mass.map(([x, y]) => `${round(x)},${round(y)}`).join(" L")} Z`;
  const w = L * 0.13;
  return (
    <g opacity={dim ? 0.82 : 1}>
      {[...pris].reverse().map((f) => (
        <Quill key={`p${f.t}`} c={c} at={f.at} a={f.a} l={f.l} w={w} fill={hv(c, "pri")} hot />
      ))}
      {[...secs].reverse().map((f) => (
        <Quill key={`s${f.t}`} c={c} at={f.at} a={f.a} l={f.l} w={w * 1.05} fill={hv(c, "sec")} />
      ))}
      {roots.map((f, i) => (
        <path key={`g${i}`} d={blade(f.l * 0.42, w * 0.95, 0.62)} transform={`translate(${round(f.at[0])} ${round(f.at[1])}) rotate(${round(f.a)})`} fill={hv(c, "cov")} stroke={c.p.body} strokeOpacity="0.6" strokeWidth="0.8" />
      ))}
      <path d={massD} fill={hv(c, "body")} stroke={c.p.body} strokeOpacity="0.6" strokeWidth="1" strokeLinejoin="round" />
      {/* lesser-covert scallops across the mass */}
      {roots
        .filter((_, i) => i % 2 === 0)
        .map((f, i) => {
          const [x, y] = off(f, 0.13);
          return <path key={`l${i}`} d={blade(f.l * 0.16, w * 0.7, 0.6)} transform={`translate(${round(x)} ${round(y)}) rotate(${round(f.a)})`} fill={c.p.bodyLight} opacity="0.55" />;
        })}
      {/* sunlit leading edge */}
      <path d={`M${round(s[0])},${round(s[1])} L${round(wr[0])},${round(wr[1])}`} stroke={c.p.wingEdge} strokeOpacity="0.85" strokeWidth="2.4" strokeLinecap="round" filter={c.u("glow")} />
    </g>
  );
}

/** Falcon head in profile facing left, centred on the skull. `crest` adds the swept-back gold crown. */
function Head({ c, x, y, s = 1, young = false, beak = 1, crest = false, lit = false }: { c: Ctx; x: number; y: number; s?: number; young?: boolean; beak?: number; crest?: boolean; lit?: boolean }) {
  const { p, u } = c;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {crest && (
        <g className="sl-sway-slow" style={{ transformOrigin: "16px -20px" }}>
          {(
            [
              [2, -26, -62, 30],
              [10, -26, -44, 40],
              [18, -24, -30, 46],
              [24, -18, -16, 40],
              [28, -10, -4, 30],
            ] as const
          ).map(([bx, by, a, l]) => (
            <g key={a} transform={`translate(${bx} ${by}) rotate(${a})`}>
              <path d={quill(l, 9)} fill={hv(c, "pri")} stroke={p.body} strokeOpacity="0.6" strokeWidth="0.8" />
              <path d={`M2,0 L${l - 3},0`} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
            </g>
          ))}
        </g>
      )}
      {young ? <path d={fluff(4, 0, 32, 31, 14, 0.07)} fill={hv(c, "body")} {...rim(c)} /> : <path d="M-24,2 C-26,-16 -10,-30 8,-30 C26,-30 38,-16 36,4 C34,22 20,32 2,32 C-14,32 -22,20 -24,2 Z" fill={hv(c, "body")} {...rim(c)} />}
      {/* hood */}
      <path d="M-22,-6 C-20,-22 -6,-30 10,-30 C24,-30 34,-20 36,-8 C24,-16 8,-20 -6,-16 C-14,-14 -18,-10 -22,-6 Z" fill={p.bodyDark} opacity={young ? 0.14 : 0.3} />
      {/* pale throat and the falcon cheek stripe */}
      <path d="M-20,10 C-12,26 6,32 20,26 C10,22 -2,18 -20,10 Z" fill={p.belly} />
      <path d="M-8,4 C-11,12 -9,20 -3,28 C3,20 3,12 0,4 Z" fill={p.bodyDark} opacity={young ? 0.35 : 0.6} />
      <Spec x={10} y={-22} rx={14} ry={5} o={0.35} />
      {lit && <path d="M8,-30 C24,-30 36,-18 36,0" fill="none" stroke={p.wingEdge} strokeWidth="2.4" strokeLinecap="round" filter={u("glow")} />}
      <g transform={`translate(-20 -2) scale(${beak}) translate(20 2)`}>
        <path d="M-22,-12 C-27,-8 -27,0 -22,4 L-17,4 L-17,-12 Z" fill={p.accent} opacity="0.85" />
        <path d="M-20,-12 C-32,-14 -44,-8 -46,4 C-47,11 -44,16 -40,18 C-40,12 -38,8 -34,6 C-28,5 -24,5 -20,4 Z" fill={p.accent} stroke={p.body} strokeOpacity="0.8" strokeWidth="1" />
        <path d="M-24,-10 C-32,-11 -40,-6 -42,2" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M-34,8 C-30,12 -24,12 -20,10 L-20,5 Z" fill={p.horn} stroke={p.body} strokeOpacity="0.6" strokeWidth="0.8" />
        <circle cx="-25" cy="-5" r="1.2" fill={p.bodyDark} opacity="0.6" />
      </g>
      {young ? (
        <Eye c={c} x={-4} y={-6} r={10} kind="round" />
      ) : (
        <>
          <circle cx="-4" cy="-6" r="9.6" fill={p.accent} />
          <Eye c={c} x={-4} y={-6} r={6.6} kind="round" />
          <path d="M-17,-15 C-9,-20 2,-19 9,-12" fill="none" stroke={p.bodyDark} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

/** Solar disc: soft bloom, alternating long/short rays turning slowly, a blazing disc and a bright core ring. */
function Sun({ c, x, y, r, r1, n, bright = 1 }: { c: Ctx; x: number; y: number; r: number; r1: number; n: number; bright?: number }) {
  const { p, u } = c;
  return (
    <g>
      <circle cx={x} cy={y} r={r1} fill={p.accent} opacity={0.2 * bright} filter={u("blur20")} />
      <g className="sl-spin-slow" style={{ transformOrigin: `${x}px ${y}px` }}>
        {Array.from({ length: n }, (_, i) => {
          const a = (360 * i) / n;
          const long = i % 2 === 0;
          const len = long ? r1 : r + (r1 - r) * 0.5;
          const half = (180 / n) * (long ? 0.62 : 0.5);
          const [tx, ty] = polar(x, y, len, a);
          const [lx, ly] = polar(x, y, r * 0.96, a - half);
          const [rx, ry] = polar(x, y, r * 0.96, a + half);
          return <path key={a} d={`M${lx},${ly} L${tx},${ty} L${rx},${ry} Z`} fill={long ? p.accent : p.wingEdge} opacity={(long ? 0.85 : 0.6) * bright} />;
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={hv(c, "sun")} opacity={0.6 + 0.4 * bright} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={p.wingEdge} strokeWidth="2" />
      <circle cx={x} cy={y} r={round(r * 0.66)} fill="none" stroke="#fff" strokeOpacity={0.8 * bright} strokeWidth="2.6" filter={u("glow")} className="sl-aura-pulse" />
    </g>
  );
}

/** Gold scaled tarsus ending in hooked talons. */
function Talons({ c, x, top, foot }: { c: Ctx; x: number; top: number; foot: number }) {
  const { p } = c;
  return (
    <g>
      <path d={`M${x - 4},${top} L${x - 5},${foot - 4} L${x + 5},${foot - 4} L${x + 4},${top} Z`} fill={p.accent} stroke={p.body} strokeOpacity="0.7" strokeWidth="0.9" />
      {Array.from({ length: Math.max(1, Math.floor((foot - top - 6) / 6)) }, (_, i) => (
        <path key={i} d={`M${x - 4},${top + 6 + i * 6} L${x + 4},${top + 6 + i * 6}`} stroke={p.body} strokeOpacity="0.45" strokeWidth="0.9" />
      ))}
      <path d={`M${x},${foot - 4} C${x - 8},${foot - 3} ${x - 14},${foot} ${x - 16},${foot + 4} M${x},${foot - 4} C${x - 2},${foot} ${x - 3},${foot + 3} ${x - 4},${foot + 5} M${x},${foot - 4} C${x + 6},${foot - 2} ${x + 10},${foot} ${x + 12},${foot + 4}`} fill="none" stroke={p.accent} strokeWidth="3.4" strokeLinecap="round" />
      <path d={`M${x - 16},${foot + 4} l-2,3 M${x - 4},${foot + 5} l-1,3 M${x + 12},${foot + 4} l2,3`} stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** Eggling: a round ball of amber down with a beak far too big for it. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Materials c={c} />
      <Talons c={c} x={188} top={338} foot={350} />
      <Talons c={c} x={228} top={338} foot={350} />
      <path d={fluff(208, 290, 64, 58, 22, 0.06)} fill={hv(c, "body")} {...rim(c)} />
      <path d={fluff(196, 304, 38, 36, 14, 0.08)} fill={p.belly} opacity="0.92" />
      <path d="M182,300 L186,306 M198,296 L200,303 M190,318 L193,324 M206,314 L208,320" stroke={p.body} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={222} y={252} rx={28} ry={8} rot={-10} o={0.25} />
      {/* stubby wing with three pin feathers */}
      <g className="sl-flap" style={{ transformOrigin: "244px 270px" }}>
        <path d="M240,266 C262,266 274,284 270,306 C266,318 256,322 248,318 C240,302 236,284 240,266 Z" fill={hv(c, "sec")} {...rim(c, 1)} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={blade(12, 3.5)} transform={`translate(${262 - i * 6} ${312 + i * 3}) rotate(${70 + i * 14})`} fill={p.wingEdge} opacity="0.9" />
        ))}
      </g>
      <Gem c={c} x={202} y={312} s={0.48} />
      <Head c={c} x={186} y={216} s={1.22} young beak={1.3} />
      {/* the sun-spark on its brow */}
      <g transform="translate(196 176)" filter={u("glow")} className="sl-twinkle">
        <path d="M0,-10 L2.4,-2.4 L10,0 L2.4,2.4 L0,10 L-2.4,2.4 L-10,0 L-2.4,-2.4 Z" fill={p.accent} />
        <circle r="2.6" fill="#fff" />
      </g>
    </g>
  );
}

/** Hatchling: a streaky juvenile falcon, half down, half flight feathers, wings half open. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Materials c={c} />
      {/* faint ring of light behind the head */}
      <circle cx="166" cy="198" r="50" fill={p.accent} opacity="0.08" />
      <circle cx="166" cy="198" r="50" fill="none" stroke={p.accent} strokeOpacity="0.7" strokeWidth="1.8" filter={u("glow")} className="sl-aura-pulse" />
      <Wing c={c} s={[230, 234]} wr={[268, 196]} sa={[40, 10]} pa={[-4, -46]} L={46} ns={5} np={4} dim />
      <g className="sl-sway" style={{ transformOrigin: "242px 312px" }}>
        {[48, 62, 76].map((a, i) => (
          <Quill key={a} c={c} at={[240, 312]} a={a} l={42 - i * 3} w={8} fill={hv(c, "sec")} />
        ))}
      </g>
      <Talons c={c} x={198} top={318} foot={350} />
      <Talons c={c} x={226} top={318} foot={350} />
      <path d={fluff(212, 270, 46, 58, 18, 0.05)} fill={hv(c, "body")} {...rim(c)} />
      <path d="M170,250 C178,232 198,228 208,240 C216,268 212,300 202,324 C186,320 176,304 172,288 C168,274 168,262 170,250 Z" fill={p.belly} />
      {/* juvenile streaks rather than adult bars */}
      <g fill={p.body} opacity="0.5">
        {[
          [182, 256],
          [196, 262],
          [186, 278],
          [200, 286],
          [190, 300],
          [180, 292],
          [202, 306],
        ].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x},${y - 5} C${x + 2},${y - 1} ${x + 2},${y + 3} ${x},${y + 5} C${x - 2},${y + 3} ${x - 2},${y - 1} ${x},${y - 5} Z`} />
        ))}
      </g>
      {/* leftover down tufts */}
      <g fill={p.wingEdge} opacity="0.7">
        {[
          [236, 232, 6],
          [248, 246, 5],
          [226, 222, 4.5],
          [252, 300, 5],
        ].map(([x, y, r]) => (
          <path key={x} d={fluff(x, y, r, r, 7, 0.25)} />
        ))}
      </g>
      <Spec x={222} y={226} rx={18} ry={6} rot={-20} o={0.25} />
      <Wing c={c} s={[220, 248]} wr={[266, 230]} sa={[70, 40]} pa={[30, -14]} L={56} ns={5} np={5} />
      <Gem c={c} x={190} y={268} s={0.5} />
      <path d="M152,214 C158,232 168,244 182,250 L210,236 C200,222 190,208 184,198 Z" fill={hv(c, "body")} />
      <path d="M154,216 C160,232 168,242 178,248 L188,240 C180,230 172,218 168,206 Z" fill={p.belly} />
      <Head c={c} x={168} y={200} s={1.08} young beak={1.12} lit />
      <g fill="none" stroke={p.wingEdge} strokeWidth="2.4" strokeLinecap="round">
        <path d="M172,170 C170,160 174,152 180,148 M182,172 C184,162 190,156 196,154 M164,172 C160,164 160,158 162,152" />
      </g>
    </g>
  );
}

/** Evolved: a perched solar raptor, wings swept back, a corona blazing at its shoulders. */
function evolved(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Materials c={c} />
      <Sun c={c} x={236} y={190} r={50} r1={112} n={22} bright={0.85} />
      {/* far wing raised and swept back */}
      <Wing c={c} s={[230, 208]} wr={[286, 164]} sa={[64, 30]} pa={[18, -34]} L={86} ns={6} np={6} dim />
      {/* fanned tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "236px 312px" }}>
        {[44, 56, 68, 80].map((a, i) => (
          <Quill key={a} c={c} at={[236, 312]} a={a} l={68 - Math.abs(i - 1.5) * 4} w={12} fill={hv(c, "pri")} hot />
        ))}
      </g>
      {/* the perch */}
      <path d="M70,346 C140,338 260,340 344,334 L346,348 C262,354 140,354 72,360 Z" fill={p.bodyDark} stroke={p.wing} strokeOpacity="0.45" />
      <path d="M90,348 C150,344 250,344 330,340" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
      {/* body */}
      <path d="M162,236 C158,198 180,176 210,176 C240,176 260,198 262,234 C264,276 250,312 226,328 C204,340 180,330 172,306 C164,286 164,262 162,236 Z" fill={hv(c, "body")} {...rim(c)} />
      <path d="M164,228 C176,214 196,214 206,230 C214,262 210,300 200,330 C184,328 174,312 170,294 C164,272 162,248 164,228 Z" fill={p.belly} />
      <Bars
        c={c}
        rows={[
          [244, 170, 200],
          [256, 170, 204],
          [268, 170, 204],
          [280, 172, 204],
          [292, 174, 200],
          [304, 178, 198],
        ]}
      />
      {/* rim light from the corona */}
      <path d="M214,177 C240,177 259,197 262,232" fill="none" stroke={p.wingEdge} strokeWidth="2.6" strokeLinecap="round" filter={u("glow")} />
      <Spec x={206} y={190} rx={24} ry={6} rot={-8} o={0.3} />
      {/* folded near wing: covert mass over long overlapping primaries */}
      {[70, 64, 58, 52].map((a, i) => (
        <Quill key={a} c={c} at={[238 + i * 5, 256 + i * 5]} a={a} l={92 - i * 9} w={13} fill={hv(c, "pri")} hot />
      ))}
      <path d="M206,196 C238,186 262,204 264,240 C266,262 268,278 272,292 C254,288 238,276 226,258 C212,238 202,218 206,196 Z" fill={hv(c, "sec")} {...rim(c)} />
      <path d="M208,198 C232,190 252,200 258,222 C246,214 228,212 214,220 C208,212 206,204 208,198 Z" fill={hv(c, "body")} />
      {[
        [222, 226, 64],
        [234, 238, 62],
        [244, 252, 62],
        [252, 266, 64],
      ].map(([x, y, a]) => (
        <path key={x} d={blade(22, 8, 0.62)} transform={`translate(${x} ${y}) rotate(${a})`} fill={hv(c, "cov")} stroke={p.body} strokeOpacity="0.55" strokeWidth="0.8" />
      ))}
      <path d="M210,196 C236,188 258,202 263,232" fill="none" stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round" />
      {/* feathered thighs and talons on the perch */}
      <ellipse cx="196" cy="320" rx="20" ry="15" fill={p.belly} {...rim(c, 1)} />
      <Bars
        c={c}
        rows={[
          [316, 184, 208],
          [326, 188, 204],
        ]}
      />
      <Talons c={c} x={190} top={330} foot={340} />
      <Talons c={c} x={210} top={330} foot={340} />
      <Gem c={c} x={186} y={250} s={0.55} />
      {/* neck and head */}
      <path d="M156,186 C160,206 166,220 176,228 L214,214 C206,200 198,186 192,176 Z" fill={hv(c, "body")} />
      <path d="M158,190 C162,206 168,220 178,230 L190,222 C182,210 176,198 172,186 Z" fill={p.belly} />
      <Head c={c} x={174} y={170} s={1.05} lit />
    </g>
  );
}

/** Ascended: the Sunpiercer — wings raised wide to frame a full blazing sun, sun-motes in orbit. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const motes: Pt[] = [0, 60, 120, 180, 240, 300].map((a) => polar(200, 168, 150, a + 20));
  const side = (key: string): ReactNode => (
    <g key={key}>
      {/* raised wing, kept outside the disc so it frames the sun */}
      <g className="sl-flap" style={{ transformOrigin: "166px 224px" }}>
        <Wing c={c} s={[166, 224]} wr={[100, 196]} sa={[118, 160]} pa={[196, 258]} L={104} ns={7} np={7} />
      </g>
      {/* tail streamer */}
      <g className="sl-sway-slow" style={{ transformOrigin: "196px 322px" }}>
        <path d="M196,320 C190,350 164,368 116,376 C156,360 180,344 188,318 Z" fill={hv(c, "pri")} stroke={p.body} strokeOpacity="0.55" />
        <circle cx="118" cy="375" r="3" fill="#fff" filter={u("glow")} />
      </g>
    </g>
  );
  return (
    <g>
      <Materials c={c} />
      <Sun c={c} x={200} y={168} r={82} r1={150} n={32} />
      <g className="sl-spin-rev" style={{ transformOrigin: "200px 168px" }}>
        <Dots c={c} pts={motes} r={3.6} color="#fff" />
      </g>
      {side("l")}
      <g transform={MIRROR}>{side("r")}</g>
      {/* short fanned tail between the streamers */}
      {[78, 90, 102].map((a, i) => (
        <Quill key={a} c={c} at={[200, 314]} a={a} l={i === 1 ? 52 : 46} w={12} fill={hv(c, "pri")} hot />
      ))}
      <Talons c={c} x={186} top={326} foot={350} />
      <Talons c={c} x={214} top={326} foot={350} />
      {/* body, facing out like a crest */}
      <path d="M156,236 C152,196 174,172 200,172 C226,172 248,196 244,236 C242,282 228,318 200,330 C172,318 158,282 156,236 Z" fill={hv(c, "body")} {...rim(c)} />
      <path d="M174,212 C186,204 214,204 226,212 C232,250 224,296 200,322 C176,296 168,250 174,212 Z" fill={p.belly} />
      <Bars
        c={c}
        rows={[
          [244, 180, 216],
          [256, 178, 220],
          [268, 180, 218],
          [280, 182, 216],
          [292, 186, 212],
          [304, 192, 206],
        ]}
      />
      {/* rim light from the sun behind */}
      <path d="M157,238 C154,204 172,176 200,174 C228,176 246,204 243,238" fill="none" stroke={p.wingEdge} strokeWidth="2.8" strokeLinecap="round" filter={u("glow")} />
      <ellipse cx="184" cy="318" rx="15" ry="13" fill={p.belly} {...rim(c, 1)} />
      <ellipse cx="216" cy="318" rx="15" ry="13" fill={p.belly} {...rim(c, 1)} />
      <Gem c={c} x={200} y={230} s={0.62} />
      <path d="M178,198 C180,178 188,164 196,158 L218,162 C220,178 222,188 226,200 Z" fill={hv(c, "body")} />
      <path d="M184,168 C188,184 192,196 194,208 L208,208 C210,192 212,180 214,168 Z" fill={p.belly} />
      <Head c={c} x={198} y={142} s={1.14} crest lit />
    </g>
  );
}

export const helivane: Renderer = {
  shadow: 96,
  halo: [214, 50, 22],
  stageFit: [1.2, 1.1, 1, 0.86],
  render: byStage(eggling, hatchling, evolved, ascended),
};
