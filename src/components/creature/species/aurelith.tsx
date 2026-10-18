import { byStage, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Aurelith — an ancient sea turtle carrying a gilded, inlaid shell. Faces left, swimming. */

type Pt = [number, number];
type Bez = [Pt, Pt, Pt, Pt];

const mix = (a: Pt, b: Pt, k: number): Pt => [round(a[0] + (b[0] - a[0]) * k), round(a[1] + (b[1] - a[1]) * k)];
function at(b: Bez, t: number): Pt {
  const s = 1 - t;
  const k = [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t];
  return [round(k[0] * b[0][0] + k[1] * b[1][0] + k[2] * b[2][0] + k[3] * b[3][0]), round(k[0] * b[0][1] + k[1] * b[1][1] + k[2] * b[2][1] + k[3] * b[3][1])];
}
const poly = (pts: Pt[]) => `M${pts.join(" L")} Z`;
function inset(pts: Pt[], k: number): Pt[] {
  const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length;
  const cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
  return pts.map((q) => mix(q, [cx, cy], k));
}
const centre = (pts: Pt[]): Pt => inset(pts, 1)[0];

/**
 * Carapace seen from the side and slightly above: top silhouette O and lower rim B share
 * their end points, so the scute rows converge front and back like a real dome.
 * Vertebral hexes run along the ridge, costals below, marginals along the rim.
 */
function Shell({
  c,
  O,
  B,
  cuts,
  r = 0.17,
  v = 0.38,
  m = 0.8,
  marg = 10,
  serr = 0,
  seam = 0.6,
  plates = true,
  inlay = 0,
}: {
  c: Ctx;
  O: Bez;
  B: Bez;
  cuts: number[];
  r?: number;
  v?: number;
  m?: number;
  marg?: number;
  serr?: number;
  seam?: number;
  plates?: boolean;
  inlay?: 0 | 1 | 2;
}) {
  const { p, u } = c;
  const row = (k: number, t: number) => mix(at(O, t), at(B, t), k);
  const d = 0.035;
  const outline = `M${O[0]} C${O[1]} ${O[2]} ${O[3]} C${B[2]} ${B[1]} ${B[0]} Z`;
  const fan = (t: number) => round(t + (t - 0.5) * 0.2);
  const verts: Pt[][] = [];
  const costals: Pt[][] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i];
    const b = cuts[i + 1];
    verts.push([row(r, a), row(-0.03, a + d), row(-0.03, b - d), row(r, b), row(v, b - d), row(v, a + d)]);
    const fa = fan(a);
    const fb = fan(b);
    costals.push([row(r, a), row(v, a + d), row(v, b - d), row(r, b), row(m, fb), row(m, round(fb + (fa - fb) * 0.33)), row(m, round(fb + (fa - fb) * 0.66)), row(m, fa)]);
  }
  const t0 = 0.03;
  const t1 = 0.975;
  const margs: Pt[][] = Array.from({ length: marg }, (_, i) => {
    const a = round(t0 + ((t1 - t0) * i) / marg);
    const b = round(t0 + ((t1 - t0) * (i + 1)) / marg);
    const lo = mix(row(1, a), row(1, b), 0.5);
    // serrations grow toward the rear
    const notch: Pt = [round(lo[0] + serr * 0.4 * (i / marg)), round(lo[1] + serr * (0.3 + (0.7 * i) / marg))];
    return [row(m, a), row(m, b), row(1, b), notch, row(1, a)];
  });
  const plate = (pts: Pt[], key: string) => (
    <g key={key}>
      <path d={poly(pts)} fill={plates ? u("body") : "none"} stroke={p.bodyDark} strokeOpacity={seam} strokeWidth="1.6" strokeLinejoin="round" />
      {plates && <path d={poly(inset(pts, 0.16))} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.2" strokeLinejoin="round" />}
    </g>
  );
  return (
    <g>
      <path d={outline} fill={u("body")} {...rim(c)} />
      {costals.map((q, i) => plate(q, `c${i}`))}
      {verts.map((q, i) => plate(q, `v${i}`))}
      {margs.map((q, i) => plate(q, `m${i}`))}
      {inlay > 0 && (
        <g fill="none" stroke={p.accent} strokeLinejoin="round" filter={u("glow")} className="sl-rune-pulse" opacity={c.mark}>
          {verts.map((q, i) => (
            <path key={i} d={poly(inset(q, inlay > 1 ? 0.4 : 0.5))} strokeWidth={inlay > 1 ? 1.5 : 1.1} strokeOpacity={inlay > 1 ? 1 : 0.6} />
          ))}
          {inlay > 1 && costals.map((q, i) => <path key={`k${i}`} d={poly(inset(q, 0.42))} strokeWidth="1.1" strokeOpacity="0.8" />)}
        </g>
      )}
      {inlay > 1 && (
        <g filter={u("glow")} className="sl-twinkle">
          {costals.map((q, i) => {
            const [x, y] = centre(q);
            return <circle key={i} cx={x} cy={y} r="2.2" fill={p.accent} style={{ animationDelay: `${i * 0.5}s` }} />;
          })}
        </g>
      )}
      <path d={outline} fill={u("shade")} />
    </g>
  );
}

/** Paddle flipper rooted at the origin, pointing along +x; `lead` -1 puts the thick leading edge on top. */
function Flipper({ c, x, y, a, L, W, far = false, lead = -1, claw = false, scales = 5, anim = "sl-flap" }: { c: Ctx; x: number; y: number; a: number; L: number; W: number; far?: boolean; lead?: 1 | -1; claw?: boolean; scales?: number; anim?: string }) {
  const { p, u } = c;
  const r = (n: number) => round(n);
  const edge: Bez = [[0, r(-W * 0.5)], [r(L * 0.35), r(-W * 1.05)], [r(L * 0.82), r(-W * 0.6)], [L, r(W * 0.25)]];
  const d = `M0,${r(-W * 0.5)} C${r(L * 0.35)},${r(-W * 1.05)} ${r(L * 0.82)},${r(-W * 0.6)} ${L},${r(W * 0.25)} C${r(L * 0.78)},${r(W * 0.42)} ${r(L * 0.38)},${r(W * 0.62)} 0,${r(W * 0.5)} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(1 ${lead === -1 ? 1 : -1})`}>
      <g className={anim} style={{ transformOrigin: "0px 0px" }}>
        <path d={d} fill={u("body")} {...rim(c)} />
        <path d={d} fill={p.bodyDark} opacity={far ? 0.42 : 0.16} />
        {/* thick leading edge catching the light */}
        <path d={`M${r(L * 0.06)},${r(-W * 0.6)} C${r(L * 0.36)},${r(-W * 0.92)} ${r(L * 0.78)},${r(-W * 0.52)} ${r(L * 0.94)},${r(W * 0.1)}`} fill="none" stroke={p.bodyLight} strokeOpacity={far ? 0.25 : 0.55} strokeWidth={r(Math.max(1.4, W * 0.08))} strokeLinecap="round" />
        {/* scutes hugging the leading edge, a second smaller row behind */}
        {[0, 1].map((row) => {
          const n = row ? scales - 1 : scales;
          return Array.from({ length: Math.max(n, 0) }, (_, i) => {
            const t = (i + 0.7 + row * 0.5) / (scales + 0.6);
            const [ex, ey] = at(edge, t);
            const [fx, fy] = at(edge, Math.min(t + 0.02, 1));
            const ang = round((Math.atan2(fy - ey, fx - ex) * 180) / Math.PI);
            const k = 1 - 0.55 * t;
            const off = W * (row ? 0.42 : 0.2) * k;
            return (
              <ellipse
                key={`${row}-${i}`}
                transform={`translate(${ex} ${round(ey + off)}) rotate(${ang})`}
                rx={r(W * (row ? 0.11 : 0.15) * k)}
                ry={r(W * (row ? 0.08 : 0.1) * k)}
                fill={p.bodyLight}
                fillOpacity={far ? 0.1 : 0.22}
                stroke={p.bodyDark}
                strokeOpacity="0.3"
                strokeWidth="0.9"
              />
            );
          });
        })}
        {/* trailing edge creases */}
        <path d={`M${r(L * 0.2)},${r(W * 0.45)} C${r(L * 0.45)},${r(W * 0.25)} ${r(L * 0.65)},${r(W * 0.15)} ${r(L * 0.8)},${r(W * 0.2)}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.1" />
        {claw && (
          <path
            d={`M${r(L * 0.22)},${r(-W * 0.7)} c${r(W * 0.06)},${r(-W * 0.18)} ${r(W * 0.26)},${r(-W * 0.24)} ${r(W * 0.36)},${r(-W * 0.14)} c${r(-W * 0.12)},${r(W * 0.02)} ${r(-W * 0.22)},${r(W * 0.08)} ${r(-W * 0.28)},${r(W * 0.16)} Z`}
            fill={p.horn}
            stroke={p.bodyDark}
            strokeOpacity="0.55"
            strokeWidth="0.8"
          />
        )}
      </g>
    </g>
  );
}

/** Skin: gold with a weathered bronze wash so the shell reads brighter. */
function Skin({ c, d, wash = 0.22 }: { c: Ctx; d: string; wash?: number }) {
  return (
    <>
      <path d={d} fill={c.u("body")} {...rim(c)} />
      <path d={d} fill={c.p.bodyDark} opacity={wash} />
    </>
  );
}

/** Rising bubbles / glints in the water. */
function Bubbles({ c, pts }: { c: Ctx; pts: [number, number, number][] }) {
  return (
    <g className="sl-twinkle">
      {pts.map(([x, y, r], i) => (
        <g key={i} style={{ animationDelay: `${i * 0.45}s` }}>
          <circle cx={x} cy={y} r={r} fill={c.p.wingEdge} fillOpacity="0.12" stroke={c.p.wingEdge} strokeOpacity="0.6" strokeWidth="1" />
          <circle cx={round(x - r * 0.35)} cy={round(y - r * 0.35)} r={round(r * 0.28)} fill="#fff" opacity="0.8" />
        </g>
      ))}
    </g>
  );
}

/** A baby's big glossy eye with an amber iris (the shared eye material is too pale on gold). */
function BabyEye({ c, x, y, r, stage }: { c: Ctx; x: number; y: number; r: number; stage: string }) {
  const gid = `${c.id}-${stage}-iris`;
  const k = round(r / 10);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <defs>
        <radialGradient id={gid} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff6c4" />
          <stop offset="0.45" stopColor={c.p.wing} />
          <stop offset="1" stopColor={c.p.bodyDark} />
        </radialGradient>
      </defs>
      <g className="sl-eye">
        <circle r="10" fill="#07040f" />
        <circle r="7.6" fill={`url(#${gid})`} />
        <circle cx="-0.6" cy="0.6" r="4.2" fill="#07040f" />
        <circle cx="-3.2" cy="-3.2" r="2.4" fill="#fff" />
        <circle cx="2.6" cy="3" r="1" fill="#fff" opacity="0.75" />
      </g>
    </g>
  );
}

/* ───────────────────────────── Eggling ───────────────────────────── */

/** Eggling: a fresh hatchling — soft round shell, a huge head and eyes, stubby flippers, an egg tooth. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const O: Bez = [[166, 240], [164, 150], [292, 144], [300, 242]];
  const B: Bez = [[166, 240], [186, 262], [284, 264], [300, 242]];
  return (
    <g>
      <Bubbles c={c} pts={[[96, 150, 5], [112, 128, 3.2], [318, 176, 4], [330, 156, 2.6]]} />
      {/* far flipper, paddling up */}
      <Flipper c={c} x={202} y={204} a={-72} L={46} W={22} far claw={false} scales={2} />
      <Flipper c={c} x={286} y={238} a={-14} L={22} W={16} far claw={false} scales={0} />
      {/* tail nub */}
      <path d="M294,246 C304,246 312,250 316,256 C308,258 300,256 292,252 Z" fill={u("body")} {...rim(c, 1)} />
      {/* soft plastron */}
      <path d="M172,246 C196,268 276,272 296,248 C290,266 262,276 232,276 C204,276 182,266 172,246 Z" fill={u("belly")} {...rim(c, 1)} />
      {/* short neck under the big head */}
      <Skin c={c} d="M150,214 C162,210 176,218 182,232 C184,246 176,256 162,256 C148,254 140,240 150,214 Z" wash={0.12} />
      {/* soft round shell: only faint scute lines and a few gold freckles */}
      <Shell c={c} O={O} B={B} cuts={[0.18, 0.4, 0.62, 0.84]} r={0.2} v={0.44} m={0.82} marg={7} seam={0.22} plates={false} />
      <Spec x={220} y={186} rx={26} ry={7} rot={-12} o={0.3} />
      <g filter={u("glow")} className="sl-twinkle" opacity="0.7">
        {[[208, 196], [262, 200], [236, 222]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill={p.accent} style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
      </g>
      <Gem c={c} x={234} y={172} s={0.42} />
      {/* near flipper, stubby and forward */}
      <Flipper c={c} x={184} y={250} a={112} L={44} W={24} lead={1} claw={false} scales={2} />
      <Flipper c={c} x={284} y={254} a={34} L={24} W={17} claw={false} scales={0} />
      {/* big round head */}
      <Skin c={c} d="M134,170 C164,170 182,192 182,218 C182,244 162,260 134,260 C106,260 86,246 84,224 C82,212 84,204 90,196 C98,180 114,170 134,170 Z" wash={0.1} />
      <path d="M88,226 C96,248 116,258 138,258 C120,252 104,242 96,226 Z" fill={p.belly} opacity="0.55" />
      <Spec x={132} y={184} rx={20} ry={7} rot={-12} o={0.3} />
      {/* tiny beak with an egg tooth */}
      <path d="M90,200 C84,206 82,214 84,222 C88,224 92,222 94,220 C92,214 92,208 96,202 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1" />
      <path d="M86,206 l-4,-2 l3,4 Z" fill="#fff" />
      <path d="M86,224 C96,230 108,230 116,226" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="146" cy="234" rx="9" ry="5" fill={p.accent} opacity="0.3" />
      <BabyEye c={c} x={124} y={208} r={15} stage="eggling" />
    </g>
  );
}

/* ───────────────────────────── Hatchling ───────────────────────────── */

/** Hatchling: a juvenile mid-stroke — defined scutes with the first faint gold inlay, half-grown flippers. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const O: Bez = [[144, 232], [142, 136], [290, 120], [324, 236]];
  const B: Bez = [[144, 232], [168, 258], [298, 264], [324, 236]];
  return (
    <g>
      <Bubbles c={c} pts={[[64, 156, 4.5], [78, 132, 3], [346, 172, 3.6], [356, 150, 2.4], [92, 112, 2]]} />
      {/* far flipper raised on the upstroke */}
      <Flipper c={c} x={172} y={200} a={-72} L={88} W={34} far scales={3} />
      <Flipper c={c} x={308} y={234} a={-10} L={36} W={22} far claw={false} scales={1} />
      <path d="M318,240 C332,240 344,246 350,254 C338,256 326,254 314,248 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M150,238 C180,266 296,272 322,242 C314,266 278,280 236,280 C196,280 164,268 150,238 Z" fill={u("belly")} {...rim(c, 1)} />
      {[180, 214, 250, 286].map((x) => (
        <path key={x} d={`M${x},258 C${round(x + 2)},266 ${round(x + 2)},272 ${x},278`} fill="none" stroke={p.bodyDark} strokeOpacity="0.2" strokeWidth="1.2" />
      ))}
      {/* neck + head */}
      <Skin c={c} d="M160,204 C142,192 126,186 112,186 C92,178 68,180 56,194 C46,204 44,218 50,228 C58,240 76,246 96,246 C118,248 140,250 158,248 C170,240 172,220 160,204 Z" wash={0.16} />
      <path d="M52,226 C62,242 82,248 104,246 C86,240 70,234 58,222 Z" fill={p.belly} opacity="0.6" />
      <path d="M128,196 C122,212 124,230 132,244 M142,200 C136,216 138,232 146,246" fill="none" stroke={p.bodyDark} strokeOpacity="0.28" strokeWidth="1.4" />
      <Shell c={c} O={O} B={B} cuts={[0.13, 0.31, 0.5, 0.69, 0.87]} marg={9} seam={0.5} inlay={1} />
      <Spec x={212} y={166} rx={38} ry={7} rot={-8} o={0.28} />
      <Gem c={c} x={226} y={150} s={0.5} />
      {/* near flipper reaching forward on the downstroke */}
      <Flipper c={c} x={158} y={244} a={118} L={92} W={34} lead={1} scales={4} />
      <Flipper c={c} x={306} y={250} a={30} L={38} W={22} claw={false} scales={1} />
      {/* face */}
      <Spec x={96} y={190} rx={20} ry={6} rot={-8} o={0.28} />
      <path d="M62,190 C52,196 46,206 46,216 C48,222 52,226 56,224 C56,216 58,206 66,198 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1" />
      <path d="M52,226 C64,232 80,232 92,226" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M78,188 L90,196 L104,190 M90,196 L94,206" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
      <path d="M96,206 C104,206 110,214 108,224 C102,228 94,224 92,216 Z" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
      <BabyEye c={c} x={80} y={208} r={11} stage="hatchling" />
    </g>
  );
}

/* ───────────────────────────── Evolved ───────────────────────────── */

/** Evolved: the ancient sea turtle — high gilded dome with ornate hex inlay, long sweeping flippers, a wise lidded face. */
function evolvedDraw(c: Ctx) {
  const { p, u } = c;
  const O: Bez = [[118, 224], [118, 106], [276, 84], [350, 226]];
  const B: Bez = [[118, 224], [148, 250], [300, 256], [350, 226]];
  return (
    <g>
      {/* water light */}
      <g fill="none" stroke={p.wingEdge} strokeLinecap="round" opacity="0.35" className="sl-twinkle">
        <path d="M36,120 C56,112 72,118 88,110" strokeWidth="1.4" />
        <path d="M300,312 C320,304 340,310 360,302" strokeWidth="1.2" />
      </g>
      <Bubbles c={c} pts={[[36, 168, 4], [48, 146, 2.8], [30, 128, 2], [366, 190, 3.4]]} />
      {/* far flipper sweeping up behind the dome */}
      <Flipper c={c} x={158} y={196} a={-70} L={132} W={42} far scales={5} />
      <Flipper c={c} x={330} y={228} a={-12} L={46} W={26} far claw={false} scales={2} />
      {/* tail */}
      <path d="M342,236 C358,236 372,242 380,252 C366,256 352,252 338,246 Z" fill={u("body")} {...rim(c, 1)} />
      {/* plastron */}
      <path d="M126,232 C160,262 300,268 346,234 C336,260 294,276 232,276 C178,276 140,262 126,232 Z" fill={u("belly")} {...rim(c, 1)} />
      {[164, 200, 236, 272, 306].map((x) => (
        <path key={x} d={`M${x},256 C${round(x + 2)},264 ${round(x + 2)},270 ${x},276`} fill="none" stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1.3" />
      ))}
      {/* neck & head */}
      <Skin c={c} d="M158,200 C142,190 124,184 108,184 C88,174 62,176 48,188 C38,196 34,208 38,218 C44,230 58,236 76,236 C98,240 120,244 142,248 C158,246 168,232 168,220 C168,210 164,204 158,200 Z" />
      <path d="M40,218 C48,232 64,238 84,238 C104,240 124,244 140,248 C120,238 96,232 74,230 C60,228 48,224 40,218 Z" fill={p.belly} opacity="0.55" />
      {/* neck folds and skin scales */}
      <path d="M116,192 C108,208 110,226 120,240 M130,194 C122,210 124,228 134,244 M144,198 C138,212 140,230 148,246" fill="none" stroke={p.bodyDark} strokeOpacity="0.32" strokeWidth="1.4" />
      {[[112, 216], [124, 226], [138, 222], [128, 206], [150, 230]].map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="4" ry="3" fill={p.bodyLight} fillOpacity="0.2" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="0.8" />
      ))}
      <Shell c={c} O={O} B={B} cuts={[0.12, 0.29, 0.46, 0.63, 0.8, 0.94]} marg={11} serr={7} inlay={2} />
      <Spec x={210} y={144} rx={50} ry={8} rot={-8} o={0.3} />
      <Gem c={c} x={214} y={140} s={0.62} />
      {/* near flipper: long, swept back on the downstroke */}
      <Flipper c={c} x={150} y={238} a={40} L={146} W={46} lead={1} scales={6} />
      <Flipper c={c} x={326} y={246} a={26} L={50} W={28} claw={false} scales={2} />
      {/* head scales */}
      <path d="M58,184 L70,192 L84,182 L98,190 L104,182 M70,192 L72,200 M98,190 L100,200" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M88,200 C98,202 104,212 100,224 C92,226 84,220 84,210 Z" fill={p.bodyLight} fillOpacity="0.12" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.2" />
      <Spec x={78} y={184} rx={22} ry={6} rot={-6} o={0.3} />
      {/* hooked beak */}
      <path d="M52,184 C42,190 36,200 36,210 C36,218 40,224 44,222 C46,216 50,214 56,214 C54,204 56,194 62,188 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.1" />
      <path d="M44,222 C58,226 72,226 88,220" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      {/* heavy wise brow */}
      <path d="M58,198 C64,190 78,188 88,194" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M62,214 C68,218 76,218 82,214" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
      <Eye c={c} x={72} y={204} r={8} kind="lidded" flip />
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 140,
  halo: [212, 40, 34],
  render: evolvedDraw,
};

/* ───────────────────────────── Ascended ───────────────────────────── */

/** Barnacle jewels: a little crusted cluster of glowing pearls. */
function Barnacles({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  const { p, u } = c;
  const pts: [number, number, number][] = [
    [0, 0, 4.2],
    [6, -3, 3],
    [-5, -3, 2.6],
    [3, 4, 2.4],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="10" ry="6" fill={p.bodyDark} opacity="0.35" />
      {pts.map(([dx, dy, r], i) => (
        <g key={i}>
          <circle cx={dx} cy={dy} r={r} fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
          <circle cx={dx} cy={dy} r={round(r * 0.45)} fill={p.accent} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
        </g>
      ))}
    </g>
  );
}

/** Ascended: the Gilded Tide — a colossal turtle rising in a slow stroke under a two-tier temple-roof shell with upturned eaves, runes and barnacle jewels. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // lower tier: the broad carapace
  const O: Bez = [[96, 236], [98, 138], [318, 116], [370, 236]];
  const B: Bez = [[96, 236], [130, 266], [316, 272], [370, 236]];
  // upper tier: the raised roof
  const O2: Bez = [[146, 176], [154, 92], [292, 74], [330, 168]];
  const B2: Bez = [[146, 176], [178, 196], [292, 194], [330, 168]];
  const runes = [0.2, 0.36, 0.64, 0.8].map((t) => mix(at(O, t), at(B, t), 0.6));
  const top = at(O2, 0.52);
  return (
    <g>
      {/* molten-gold tide streaming behind */}
      <g className="sl-undulate">
        <path d="M330,252 C356,270 376,274 396,264 C380,288 352,296 324,284 Z" fill={u("veil")} />
        <path d="M300,278 C330,306 360,322 392,318 C368,338 330,336 296,306 Z" fill={u("veil")} opacity="0.7" />
        <path d="M250,290 C270,324 296,346 330,356 C298,364 262,346 242,312 Z" fill={u("veil")} opacity="0.55" />
        <g fill="none" stroke={p.accent} strokeLinecap="round" filter={u("glow")} opacity="0.75">
          <path d="M338,262 C356,272 374,274 390,268" strokeWidth="1.6" />
          <path d="M308,290 C334,310 360,318 384,318" strokeWidth="1.4" />
          <path d="M256,304 C272,330 296,346 322,352" strokeWidth="1.2" />
        </g>
      </g>
      <Dots c={c} pts={[[384, 284], [362, 332], [318, 366], [392, 250], [340, 348]]} r={1.8} />
      <g transform="rotate(-8 230 200)">
        {/* far flipper raised high like a wing */}
        <Flipper c={c} x={140} y={200} a={-74} L={150} W={46} far scales={6} anim="sl-sway-slow" />
        <Flipper c={c} x={352} y={238} a={-18} L={54} W={30} far claw={false} scales={2} />
        <path d="M360,246 C378,246 392,252 398,262 C384,268 368,264 354,256 Z" fill={u("body")} {...rim(c, 1)} />
        {/* plastron */}
        <path d="M104,244 C140,280 320,286 366,246 C354,276 306,294 236,294 C172,294 120,278 104,244 Z" fill={u("belly")} {...rim(c, 1)} />
        {[146, 186, 226, 266, 306, 340].map((x) => (
          <path key={x} d={`M${x},270 C${round(x + 2)},278 ${round(x + 2)},286 ${x},292`} fill="none" stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1.3" />
        ))}
        {/* neck & raised head */}
        <Skin c={c} d="M146,214 C130,198 112,186 94,178 C80,164 58,158 40,164 C26,170 18,184 20,196 C24,210 38,218 56,220 C78,226 100,240 122,256 C140,262 156,250 160,236 C160,226 156,218 146,214 Z" />
        <path d="M22,198 C30,212 46,220 64,222 C86,228 106,242 124,256 C104,236 84,224 62,216 C46,212 32,206 22,198 Z" fill={p.belly} opacity="0.55" />
        <path d="M100,186 C90,202 92,222 104,238 M114,194 C106,210 108,230 120,246 M128,204 C122,218 124,236 134,252" fill="none" stroke={p.bodyDark} strokeOpacity="0.32" strokeWidth="1.4" />
        {[[100, 214], [112, 226], [124, 222], [114, 206], [136, 236]].map(([x, y]) => (
          <ellipse key={x} cx={x} cy={y} rx="4.4" ry="3.2" fill={p.bodyLight} fillOpacity="0.22" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="0.8" />
        ))}
        {/* lower tier with upturned eaves */}
        <path d="M104,242 C86,244 70,236 62,220 C76,228 90,228 106,228 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.8" strokeWidth="1.4" />
        <path d="M362,242 C382,242 396,230 398,212 C388,224 376,228 358,228 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.8" strokeWidth="1.4" />
        <Shell c={c} O={O} B={B} cuts={[0.1, 0.26, 0.42, 0.58, 0.74, 0.9]} r={0.12} v={0.3} m={0.8} marg={13} serr={9} inlay={1} />
        <g fill="none" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter={u("glow")} className="sl-rune-pulse">
          {runes.map(([x, y], i) => (
            <path
              key={i}
              d={
                [
                  `M${round(x - 6)},${round(y + 5)} L${x},${round(y - 6)} L${round(x + 6)},${round(y + 5)} M${x},${round(y - 6)} L${x},${round(y + 7)}`,
                  `M${round(x - 6)},${y} A6,6 0 1,0 ${round(x + 6)},${y} A6,6 0 1,0 ${round(x - 6)},${y} M${x},${round(y - 8)} L${x},${round(y + 8)}`,
                  `M${round(x - 7)},${round(y + 5)} L${x},${round(y - 6)} L${round(x + 7)},${round(y + 5)} Z`,
                  `M${x},${round(y + 7)} L${x},${round(y - 7)} M${round(x - 6)},${round(y - 2)} L${round(x + 6)},${round(y - 2)}`,
                ][i]
              }
            />
          ))}
        </g>
        <Barnacles c={c} x={136} y={254} s={1.1} />
        <Barnacles c={c} x={296} y={264} s={0.9} />
        <Barnacles c={c} x={352} y={232} s={0.75} />
        {/* upper tier: the temple roof, eaves curling up at both ends */}
        <path d="M156,182 C138,186 120,180 110,162 C122,170 136,172 152,168 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.85" strokeWidth="1.4" />
        <path d="M322,176 C342,176 356,164 360,144 C350,156 338,160 324,160 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.85" strokeWidth="1.4" />
        <path d={`M${B2[0]} C${B2[1]} ${B2[2]} ${B2[3]}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="6" transform="translate(0 4)" />
        <Shell c={c} O={O2} B={B2} cuts={[0.12, 0.34, 0.56, 0.78, 0.94]} r={0.2} v={0.42} m={0.78} marg={10} serr={6} inlay={2} />
        <Spec x={214} y={112} rx={42} ry={7} rot={-8} o={0.32} />
        {/* finial: the Solgem crowning the roof */}
        <path d={`M${round(top[0] - 10)},${round(top[1] + 6)} C${round(top[0] - 6)},${round(top[1] - 2)} ${round(top[0] - 4)},${round(top[1] - 8)} ${top[0]},${round(top[1] - 12)} C${round(top[0] + 4)},${round(top[1] - 8)} ${round(top[0] + 6)},${round(top[1] - 2)} ${round(top[0] + 10)},${round(top[1] + 6)} Z`} fill={u("body")} stroke={p.horn} strokeOpacity="0.85" strokeWidth="1.2" />
        <Gem c={c} x={top[0]} y={round(top[1] - 20)} s={0.7} />
        {/* near flipper, vast and swept back */}
        <Flipper c={c} x={134} y={252} a={32} L={150} W={50} lead={1} scales={7} anim="sl-sway-slow" />
        <Flipper c={c} x={346} y={256} a={30} L={56} W={30} claw={false} scales={2} />
        {/* gilded crown plate on the head */}
        <path d="M40,164 C52,154 70,150 86,156 C94,160 98,168 96,176 C80,170 60,166 40,164 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.8" strokeWidth="1.3" />
        <path d="M54,160 L66,156 L78,160 L88,162" fill="none" stroke={p.accent} strokeWidth="1.3" strokeLinecap="round" filter={u("glow")} className="sl-rune-pulse" />
        <path d="M74,186 C86,188 94,198 90,210 C82,212 74,206 74,196 Z" fill={p.bodyLight} fillOpacity="0.12" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.2" />
        {/* hooked beak */}
        <path d="M32,170 C22,176 16,186 16,196 C16,204 20,210 24,208 C26,202 30,200 36,200 C34,190 36,180 42,174 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.1" />
        <path d="M24,208 C38,212 54,212 70,206" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        <path d="M40,184 C46,176 60,174 70,180" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="3.2" strokeLinecap="round" />
        <Eye c={c} x={54} y={190} r={8.5} kind="lidded" flip />
      </g>
    </g>
  );
}

export const aurelith: Renderer = {
  ...evolved,
  halo: [204, 42, 30],
  stageFit: [1.25, 1.1, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
