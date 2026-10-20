import { byStage, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "@/components/creature/kit";

/**
 * Orbelith — "The Celestine Coil". A living planet: a banded platinum orb
 * wrapped in a coiled ring-body lined with eyes, trailing comet tendrils and
 * keeping adopted moons in orbit. Drawn as four separate forms.
 */

type Pt = [number, number];

/** Half of an ellipse: the far (upper) or near (lower) arc. */
function arc(cx: number, cy: number, a: number, b: number, near: boolean) {
  return `M${round(cx - a)},${round(cy)} A${round(a)},${round(b)} 0 0 ${near ? 0 : 1} ${round(cx + a)},${round(cy)}`;
}

/** A point on an ellipse, t in degrees (0..180 is the near half). */
function onEll(cx: number, cy: number, a: number, b: number, t: number): Pt {
  const r = (t * Math.PI) / 180;
  return [round(cx + Math.cos(r) * a), round(cy + Math.sin(r) * b)];
}

/** Tapered tendril along a cubic, wide at the root, needle-thin at the tip. */
function taper(p0: Pt, p1: Pt, p2: Pt, p3: Pt, w: number) {
  const N = 16;
  const pt = (t: number): Pt => {
    const m = 1 - t;
    return [
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ];
  };
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = pt(t);
    const [ax, ay] = pt(Math.max(0, t - 0.02));
    const [bx, by] = pt(Math.min(1, t + 0.02));
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const hw = (w / 2) * Math.pow(1 - t, 0.9) + 0.4;
    L.push([round(x + nx * hw), round(y + ny * hw)]);
    R.push([round(x - nx * hw), round(y - ny * hw)]);
  }
  const pts = [...L, ...R.reverse()];
  return `M${pts.map(([x, y]) => `${x},${y}`).join(" L")} Z`;
}

/** A comet tendril: a translucent tapered tail with a bright core and a glowing nucleus at its tip. */
function Comet({ c, p0, p1, p2, p3, w, delay = 0, nucleus = 3 }: { c: Ctx; p0: Pt; p1: Pt; p2: Pt; p3: Pt; w: number; delay?: number; nucleus?: number }) {
  const { p, u } = c;
  const core = `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
  return (
    <g className="sl-sway-slow" style={{ transformOrigin: `${p0[0]}px ${p0[1]}px`, animationDelay: `${delay}s` }}>
      <path d={taper(p0, p1, p2, p3, w * 1.8)} fill={p.accent} opacity="0.18" filter={u("glow")} />
      <path d={taper(p0, p1, p2, p3, w)} fill={u("fin")} opacity="0.7" stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="0.8" />
      <path d={core} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth={round(Math.max(1, w * 0.12))} strokeLinecap="round" strokeDasharray="1 6" />
      <circle cx={p3[0]} cy={p3[1]} r={round(nucleus * 2.4)} fill={p.eye} opacity="0.45" filter={u("glow")} className="sl-twinkle" />
      <circle cx={p3[0]} cy={p3[1]} r={nucleus} fill="#fff" />
    </g>
  );
}

/** The planet-body: banded platinum sphere with a star-field showing through, terminator shade and limb glow. */
function Orb({ c, sid, cx, cy, r, tilt, bands, storm = false, stars = 0.6 }: { c: Ctx; sid: string; cx: number; cy: number; r: number; tilt: number; bands: [number, number, "dark" | "light" | "belly"][]; storm?: boolean; stars?: number }) {
  const { p, u, id } = c;
  const clip = `${id}-${sid}-orb`;
  const band = (f: number, th: number) => {
    const y0 = cy + r * f;
    const y1 = y0 + r * th;
    const wv = r * 0.1;
    return `M${round(cx - r * 1.1)},${round(y0)} C${round(cx - r * 0.4)},${round(y0 + wv)} ${round(cx + r * 0.3)},${round(y0 - wv)} ${round(cx + r * 1.1)},${round(y0 + wv * 0.3)} L${round(cx + r * 1.1)},${round(y1 + wv * 0.3)} C${round(cx + r * 0.3)},${round(y1 - wv)} ${round(cx - r * 0.4)},${round(y1 + wv)} ${round(cx - r * 1.1)},${round(y1)} Z`;
  };
  const col = { dark: p.bodyDark, light: p.bodyLight, belly: p.belly };
  const op = { dark: 0.28, light: 0.5, belly: 0.55 };
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={round(r + 10)} fill={p.accent} opacity="0.22" filter={u("blur8")} />
      <circle cx={cx} cy={cy} r={r} fill={u("body")} />
      <g clipPath={`url(#${clip})`}>
        <g transform={`rotate(${tilt} ${cx} ${cy})`}>
          {bands.map(([f, th, k]) => (
            <path key={f} d={band(f, th)} fill={col[k]} opacity={op[k]} />
          ))}
          {storm && (
            <g>
              <ellipse cx={round(cx + r * 0.32)} cy={round(cy + r * 0.3)} rx={round(r * 0.2)} ry={round(r * 0.09)} fill={p.belly} opacity="0.6" />
              <ellipse cx={round(cx + r * 0.32)} cy={round(cy + r * 0.3)} rx={round(r * 0.12)} ry={round(r * 0.05)} fill={p.accent} opacity="0.7" />
              <path d={`M${round(cx + r * 0.1)},${round(cy + r * 0.3)} C${round(cx + r * 0.2)},${round(cy + r * 0.18)} ${round(cx + r * 0.5)},${round(cy + r * 0.2)} ${round(cx + r * 0.56)},${round(cy + r * 0.3)}`} fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="1.2" />
            </g>
          )}
        </g>
        <rect x={round(cx - r)} y={round(cy - r)} width={r * 2} height={r * 2} fill={u("stars")} opacity={stars} className="sl-twinkle" />
        {/* night side */}
        <circle cx={round(cx + r * 0.5)} cy={round(cy + r * 0.55)} r={round(r * 0.95)} fill={p.belly} opacity="0.45" filter={u("blur20")} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill={u("shade")} {...rim(c)} />
      {/* atmospheric limb on the lit side */}
      <path d={`M${round(cx - r * 0.98)},${round(cy + r * 0.2)} A${r},${r} 0 0 1 ${round(cx + r * 0.2)},${round(cy - r * 0.98)}`} fill="none" stroke={p.eye} strokeWidth="2" strokeOpacity="0.7" filter={u("glow")} />
      <path d={`M${round(cx - r * 0.9)},${round(cy + r * 0.1)} A${round(r * 0.94)},${round(r * 0.94)} 0 0 1 ${round(cx + r * 0.1)},${round(cy - r * 0.9)}`} fill="none" stroke="#fff" strokeWidth="1.2" strokeOpacity="0.55" />
      <Spec x={round(cx - r * 0.34)} y={round(cy - r * 0.48)} rx={round(r * 0.3)} ry={round(r * 0.14)} rot={-32} o={0.5} />
      <circle cx={round(cx - r * 0.5)} cy={round(cy - r * 0.42)} r={round(r * 0.05)} fill="#fff" opacity="0.85" />
    </g>
  );
}

/**
 * The coil: a living tube-ring around the orb. `half` picks which half to draw
 * so the orb can sit between them. Optional planar dust sheet outside it.
 */
function Coil({ c, cx, cy, a, b, rot, w, near, sheet = 0, segs = 0 }: { c: Ctx; cx: number; cy: number; a: number; b: number; rot: number; w: number; near: boolean; sheet?: number; segs?: number }) {
  const { p, u } = c;
  const d = arc(cx, cy, a, b, near);
  const sa = a + w * 0.9 + sheet;
  const sb = round((b * sa) / a);
  const sa2 = a + w * 0.9;
  const sb2 = round((b * sa2) / a);
  const sheetPath =
    sheet > 0
      ? `${arc(cx, cy, sa, sb, near)} L${round(cx + sa2)},${cy} A${round(sa2)},${sb2} 0 0 ${near ? 1 : 0} ${round(cx - sa2)},${cy} Z`
      : "";
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {sheet > 0 && (
        <g>
          <path d={sheetPath} fill={p.wing} opacity={near ? 0.32 : 0.2} />
          <path d={arc(cx, cy, round(sa - sheet * 0.45), round((b * (sa - sheet * 0.45)) / a), near)} fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1" />
          <path d={arc(cx, cy, sa, sb, near)} fill="none" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="0.8" />
        </g>
      )}
      <g fill="none" strokeLinecap="round" opacity={near ? 1 : 0.8}>
        <path d={d} stroke={p.bodyDark} strokeWidth={round(w + 4)} strokeOpacity={near ? 0.8 : 0.9} />
        <path d={d} stroke={near ? p.wing : p.bodyDark} strokeWidth={w} />
        {near && <path d={d} stroke={p.belly} strokeOpacity="0.35" strokeWidth={round(w * 0.3)} transform={`translate(0 ${round(w * 0.24)})`} />}
        <path d={d} stroke={p.bodyLight} strokeOpacity={near ? 0.7 : 0.25} strokeWidth={round(w * 0.3)} transform={`translate(0 ${round(-w * 0.22)})`} />
        {near && <path d={d} stroke="#fff" strokeOpacity="0.55" strokeWidth={round(Math.max(0.8, w * 0.08))} transform={`translate(0 ${round(-w * 0.32)})`} />}
        {segs > 0 && <path d={d} stroke={p.bodyDark} strokeOpacity={near ? 0.35 : 0.2} strokeWidth={w} strokeDasharray={`1.2 ${segs}`} />}
      </g>
    </g>
  );
}

/** Eyes set into the near half of a coil, each in a pale bezel like a porthole. */
function CoilEyes({ c, cx, cy, a, b, rot, ts, r, bezel }: { c: Ctx; cx: number; cy: number; a: number; b: number; rot: number; ts: number[]; r: number; bezel: number }) {
  const { p } = c;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {ts.map((t) => {
        const [x, y] = onEll(cx, cy, a, b, t);
        // eyes near the sides are seen edge-on
        const k = round(0.55 + 0.45 * Math.sin((t * Math.PI) / 180));
        return (
          <g key={t} transform={`translate(${x} ${y}) scale(${k} 1)`}>
            <ellipse rx={round(r * bezel)} ry={round(r * bezel * 0.9)} fill={p.belly} stroke={p.horn} strokeWidth="1.2" strokeOpacity="0.8" />
            <Eye c={c} x={0} y={0} r={r} kind="orb" />
            <path d={`M${round(-r * bezel)},${round(-r * 0.3)} C${round(-r * 0.6)},${round(-r * bezel * 1.05)} ${round(r * 0.6)},${round(-r * bezel * 1.05)} ${round(r * bezel)},${round(-r * 0.3)}`} fill="none" stroke={p.bodyLight} strokeWidth="1" strokeOpacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

/** A small adopted moon with craters, terminator and spec. */
function Moon({ c, x, y, r, ringed = false }: { c: Ctx; x: number; y: number; r: number; ringed?: boolean }) {
  const { p, u } = c;
  return (
    <g>
      <circle cx={x} cy={y} r={round(r * 1.8)} fill={p.accent} opacity="0.25" filter={u("glow")} />
      {ringed && <path d={arc(x, y, round(r * 1.8), round(r * 0.45), false)} fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1" transform={`rotate(-16 ${x} ${y})`} />}
      <circle cx={x} cy={y} r={r} fill={u("body")} {...rim(c, 0.8)} />
      <circle cx={round(x + r * 0.3)} cy={round(y + r * 0.3)} r={round(r * 0.85)} fill={p.belly} opacity="0.28" />
      <circle cx={round(x + r * 0.25)} cy={round(y - r * 0.1)} r={round(r * 0.22)} fill={p.bodyDark} opacity="0.35" />
      <circle cx={round(x - r * 0.2)} cy={round(y + r * 0.35)} r={round(r * 0.15)} fill={p.bodyDark} opacity="0.3" />
      <circle cx={round(x - r * 0.35)} cy={round(y - r * 0.35)} r={round(r * 0.3)} fill="#fff" opacity="0.6" />
      {ringed && <path d={arc(x, y, round(r * 1.8), round(r * 0.45), true)} fill="none" stroke={p.wingEdge} strokeOpacity="0.85" strokeWidth="1.2" transform={`rotate(-16 ${x} ${y})`} />}
    </g>
  );
}

/** A moon on an orbit: the spin and the moon's offset live on separate groups. */
function Orbiting({ c, cx, cy, at, r, cls = "sl-spin-slow", ringed = false, delay = 0 }: { c: Ctx; cx: number; cy: number; at: Pt; r: number; cls?: string; ringed?: boolean; delay?: number }) {
  return (
    <g className={cls} style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}>
      <Moon c={c} x={at[0]} y={at[1]} r={r} ringed={ringed} />
    </g>
  );
}

function Sparkle({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const k = round(s * 0.22);
  return <path d={`M${x},${round(y - s)} L${round(x + k)},${round(y - k)} L${round(x + s)},${y} L${round(x + k)},${round(y + k)} L${x},${round(y + s)} L${round(x - k)},${round(y + k)} L${round(x - s)},${y} L${round(x - k)},${round(y - k)} Z`} fill={color} className="sl-twinkle" />;
}

/** Eggling: a small round baby-world with one huge eye and a thin, faint ring. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const cx = 200;
  const cy = 206;
  const R = 62;
  return (
    <g>
      {/* two stubby comet wisps, just budding */}
      <Comet c={c} p0={[156, 240]} p1={[144, 256]} p2={[130, 258]} p3={[118, 270]} w={10} delay={0.0} nucleus={2.2} />
      <Comet c={c} p0={[176, 260]} p1={[170, 276]} p2={[158, 284]} p3={[150, 296]} w={9} delay={0.5} nucleus={2} />
      <Coil c={c} cx={cx} cy={232} a={104} b={20} rot={-8} w={3} near={false} />
      <Orb c={c} sid="egg" cx={cx} cy={cy} r={R} tilt={-8} stars={0.35} bands={[[0.38, 0.12, "dark"], [0.62, 0.2, "belly"], [-0.5, 0.08, "light"]]} />
      {/* soft cheeks and a tiny smile */}
      <ellipse cx="164" cy="228" rx="9" ry="5" fill={p.accent} opacity="0.3" />
      <ellipse cx="236" cy="228" rx="9" ry="5" fill={p.accent} opacity="0.3" />
      <path d="M193,236 C197,240 203,240 207,236" fill="none" stroke={p.bodyDark} strokeWidth="1.8" strokeLinecap="round" />
      {/* one big eye */}
      <ellipse cx="200" cy="202" rx="25" ry="24" fill={p.bodyDark} opacity="0.35" />
      <Eye c={c} x={200} y={200} r={19} kind="round" />
      <path d="M178,184 C188,172 212,172 222,184" fill="none" stroke={p.bodyLight} strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <Gem c={c} x={200} y={162} s={0.6} />
      {/* thin faint ring in front */}
      <Coil c={c} cx={cx} cy={232} a={104} b={20} rot={-8} w={3} near />
      <g opacity="0.85">
        <Sparkle x={300} y={170} s={6} color="#fff" />
        <Sparkle x={104} y={262} s={4} color={p.eye} />
        <circle cx="96" cy="190" r="1.8" fill="#fff" className="sl-twinkle" />
      </g>
    </g>
  );
}

/** Hatchling: a larger orb whose ring has thickened into a coil with three eyes, and its first moon. */
function hatchling(c: Ctx) {
  const { p } = c;
  const cx = 200;
  const cy = 204;
  const R = 64;
  const ring = { cx, cy: 218, a: 128, b: 30, rot: -12 };
  return (
    <g>
      <Comet c={c} p0={[152, 224]} p1={[132, 246]} p2={[106, 248]} p3={[84, 268]} w={12} delay={0.0} nucleus={2.6} />
      <Comet c={c} p0={[166, 248]} p1={[150, 276]} p2={[124, 286]} p3={[108, 310]} w={12} delay={0.5} nucleus={2.4} />
      <Comet c={c} p0={[190, 262]} p1={[182, 292]} p2={[160, 304]} p3={[148, 326]} w={10} delay={1.0} nucleus={2.2} />
      <Coil c={c} {...ring} w={8} near={false} />
      <Orb c={c} sid="hatch" cx={cx} cy={cy} r={R} tilt={-12} stars={0.5} bands={[[-0.55, 0.1, "light"], [0.18, 0.1, "dark"], [0.42, 0.14, "belly"], [0.7, 0.08, "dark"]]} />
      {/* the baby eye, now drowsy and sinking as the ring-eyes take over */}
      <ellipse cx="200" cy="214" rx="15" ry="11" fill={p.bodyDark} opacity="0.3" />
      <Eye c={c} x={200} y={213} r={10} kind="lidded" />
      <Gem c={c} x={200} y={176} s={0.66} />
      <Coil c={c} {...ring} w={8} near segs={9} />
      <CoilEyes c={c} {...ring} ts={[48, 90, 132]} r={5.6} bezel={1.6} />
      <Orbiting c={c} cx={cx} cy={cy} at={[316, 122]} r={9} />
      <Sparkle x={86} y={150} s={5} color="#fff" />
      <circle cx="320" cy="292" r="1.8" fill={p.eye} className="sl-twinkle" />
    </g>
  );
}

/** Evolved: a full ringed planet-being, five eyes on its coil, two moons and three long comet tendrils. */
function evolved(c: Ctx) {
  const ring = { cx: 200, cy: 210, a: 150, b: 38, rot: -14 };
  return (
    <g>
      <Comet c={c} p0={[150, 214]} p1={[120, 236]} p2={[86, 236]} p3={[54, 262]} w={14} delay={0.0} nucleus={3} />
      <Comet c={c} p0={[160, 240]} p1={[134, 276]} p2={[100, 282]} p3={[72, 312]} w={14} delay={0.5} nucleus={2.8} />
      <Comet c={c} p0={[182, 258]} p1={[166, 300]} p2={[132, 316]} p3={[112, 348]} w={12} delay={1.0} nucleus={2.6} />
      <Coil c={c} {...ring} w={13} near={false} sheet={16} segs={11} />
      <Orb c={c} sid="evo" cx={200} cy={200} r={70} tilt={-14} storm stars={0.7} bands={[[-0.66, 0.08, "light"], [-0.3, 0.1, "dark"], [0.06, 0.14, "belly"], [0.36, 0.08, "light"], [0.58, 0.12, "dark"]]} />
      <Gem c={c} x={200} y={180} s={0.85} />
      <Coil c={c} {...ring} w={13} near sheet={16} segs={11} />
      <CoilEyes c={c} {...ring} ts={[22, 56, 90, 124, 158]} r={5} bezel={1.55} />
      <Orbiting c={c} cx={200} cy={200} at={[200, 50]} r={10} />
      <Orbiting c={c} cx={200} cy={200} at={[352, 168]} r={7} cls="sl-spin" delay={-3} />
      <Sparkle x={330} y={300} s={5} color="#fff" />
      <Sparkle x={66} y={150} s={4} color={c.p.eye} />
    </g>
  );
}

/** Ascended: a grand, tilted world crowned with light, wrapped in two crossing coils of eyes, with three moons and long comet tails. */
function ascended(c: Ctx) {
  const { p, u, id } = c;
  const cx = 200;
  const cy = 196;
  const main = { cx, cy: 204, a: 164, b: 44, rot: -20 };
  const cross = { cx, cy: 196, a: 112, b: 24, rot: 58 };
  const rays = [-60, -40, -20, 0, 20, 40, 60];
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-asc-corona`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.45" stopColor={p.eye} stopOpacity="0.55" />
          <stop offset="0.7" stopColor={p.accent} stopOpacity="0.2" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* cosmic glow and a crown of light behind the world */}
      <circle cx={cx} cy={cy} r="128" fill={`url(#${id}-asc-corona)`} className="sl-aura-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <g opacity="0.85">
        {rays.map((a, i) => {
          const r0 = 78;
          const r1 = i % 2 ? 106 : 122;
          const t = ((a - 90) * Math.PI) / 180;
          const s = 0.045;
          const x0 = round(cx + Math.cos(t - s) * r0);
          const y0 = round(cy + Math.sin(t - s) * r0);
          const x1 = round(cx + Math.cos(t) * r1);
          const y1 = round(cy + Math.sin(t) * r1);
          const x2 = round(cx + Math.cos(t + s) * r0);
          const y2 = round(cy + Math.sin(t + s) * r0);
          return (
            <g key={a}>
              <path d={`M${x0},${y0} L${x1},${y1} L${x2},${y2} Z`} fill={u("horn")} {...rim(c, 0.7)} />
              <circle cx={x1} cy={y1} r={i % 2 ? 2 : 2.8} fill="#fff" filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
            </g>
          );
        })}
      </g>
      {/* long spiralling comet tails */}
      <Comet c={c} p0={[140, 208]} p1={[104, 224]} p2={[70, 216]} p3={[36, 236]} w={13} delay={0.0} nucleus={3} />
      <Comet c={c} p0={[146, 236]} p1={[110, 268]} p2={[74, 266]} p3={[44, 296]} w={15} delay={0.5} nucleus={3.2} />
      <Comet c={c} p0={[160, 258]} p1={[136, 298]} p2={[98, 306]} p3={[72, 340]} w={15} delay={1.0} nucleus={3.2} />
      <Comet c={c} p0={[184, 268]} p1={[172, 316]} p2={[136, 334]} p3={[116, 368]} w={13} delay={1.5} nucleus={3} />
      <Comet c={c} p0={[210, 272]} p1={[212, 320]} p2={[188, 346]} p3={[170, 374]} w={11} delay={2.0} nucleus={2.6} />
      <Coil c={c} {...main} w={15} near={false} sheet={22} segs={12} />
      <Coil c={c} {...cross} w={9} near={false} segs={9} />
      <Orb c={c} sid="asc" cx={cx} cy={cy} r={76} tilt={-20} storm stars={0.85} bands={[[-0.72, 0.07, "light"], [-0.44, 0.1, "dark"], [-0.12, 0.06, "light"], [0.04, 0.16, "belly"], [0.34, 0.08, "light"], [0.54, 0.12, "dark"], [0.78, 0.1, "belly"]]} />
      {/* polar aurora */}
      <path d={`M150,148 C170,128 230,124 252,140`} fill="none" stroke={p.eye} strokeWidth="3" strokeOpacity="0.7" filter={u("glow")} className="sl-rune-pulse" />
      <path d={`M158,156 C178,140 224,136 244,150`} fill="none" stroke={p.accent} strokeWidth="1.6" strokeOpacity="0.8" className="sl-rune-pulse" />
      <Gem c={c} x={200} y={178} s={1.05} />
      <Coil c={c} {...cross} w={9} near segs={9} />
      <CoilEyes c={c} {...cross} ts={[40, 90, 140]} r={3.8} bezel={1.5} />
      <Coil c={c} {...main} w={15} near sheet={22} segs={12} />
      <CoilEyes c={c} {...main} ts={[16, 40, 65, 90, 115, 140, 164]} r={5.2} bezel={1.5} />
      {/* three moons, the eldest ringed */}
      <Orbiting c={c} cx={cx} cy={cy} at={[56, 112]} r={11} ringed />
      <Orbiting c={c} cx={cx} cy={cy} at={[352, 120]} r={8} cls="sl-spin" delay={-4} />
      <Orbiting c={c} cx={cx} cy={cy} at={[340, 300]} r={6.5} cls="sl-spin-rev" delay={-2} />
      <Sparkle x={70} y={250} s={5} color={p.eye} />
      <Sparkle x={316} y={60} s={6} color="#fff" />
    </g>
  );
}

export const orbelith: Renderer = {
  floating: true,
  shadow: 110,
  halo: [200, 60, 28],
  stageFit: [1.2, 1.12, 1, 0.92],
  render: byStage(eggling, hatchling, evolved, ascended),
};
