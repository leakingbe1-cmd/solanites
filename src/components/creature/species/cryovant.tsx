import { byStage, Dots, Eye, Gem, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Cryovant — a faceted glass jellyfish trailing shard tendrils. */

const D = Math.PI / 180;
type Pt = [number, number];
const pts = (a: Pt[]) => a.map(([x, y]) => `${x},${y}`).join(" ");

/**
 * A faceted crystal bell seen slightly from above: a dome whose front half is
 * cut into triangular facets, each lit from the upper left. `soft` scales the
 * facet contrast (rounded baby bell → crisp gem-cut adult).
 */
function bellGeo(cx: number, by: number, w: number, h: number, k: number) {
  const P = (e: number, t: number): Pt => [round(cx + w * Math.cos(e * D) * Math.cos(t * D)), round(by - h * Math.sin(e * D) + k * w * Math.cos(e * D) * Math.sin(t * D))];
  const outline = `M${cx - w},${by} C${cx - w},${round(by - h * 0.56)} ${round(cx - w * 0.56)},${by - h} ${cx},${by - h} C${round(cx + w * 0.56)},${by - h} ${cx + w},${round(by - h * 0.56)} ${cx + w},${by} A${w} ${round(k * w)} 0 0 1 ${cx - w},${by} Z`;
  /** Point on the front (t in 0..180, 0 = right) or back rim. */
  const front = (t: number): Pt => P(0, t);
  const back = (t: number): Pt => P(0, -t);
  return { P, outline, front, back };
}

function Bell({ c, cx, by, w, h, k = 0.2, rings, seg, soft = 1, core = 0.6 }: { c: Ctx; cx: number; by: number; w: number; h: number; k?: number; rings: number[]; seg: number; soft?: number; core?: number }) {
  const { p, u } = c;
  const { P, outline } = bellGeo(cx, by, w, h, k);
  const E = [0, ...rings, 90];
  const L = [-0.5, 0.62, 0.6];
  const tris: { pts: Pt[]; d: number }[] = [];
  for (let i = 0; i < E.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const t0 = 180 - (180 / seg) * j;
      const t1 = 180 - (180 / seg) * (j + 1);
      const a = P(E[i], t0);
      const b = P(E[i], t1);
      const cc = P(E[i + 1], t1);
      const d = P(E[i + 1], t0);
      const parts: Pt[][] = E[i + 1] === 90 ? [[a, b, cc]] : (i + j) % 2 ? [[a, b, cc], [a, cc, d]] : [[a, b, d], [b, cc, d]];
      parts.forEach((tri, q) => {
        const em = (E[i] + E[i + 1]) / 2;
        const tm = (t0 + t1) / 2 + (q ? 6 : -6);
        const n = [Math.cos(em * D) * Math.cos(tm * D), Math.sin(em * D), Math.cos(em * D) * Math.sin(tm * D)];
        const dd = n[0] * L[0] + n[1] * L[1] + n[2] * L[2] + (((i * 3 + j * 5 + q) % 3) - 1) * 0.09;
        tris.push({ pts: tri, d: dd });
      });
    }
  }
  return (
    <g>
      <path d={outline} fill={u("glass")} {...rim(c)} />
      <ellipse cx={cx} cy={round(by - h * 0.42)} rx={round(w * 0.62)} ry={round(h * 0.48)} fill={u("light")} opacity={core} className="sl-core" />
      {tris.map((t, i) => (
        <polygon
          key={i}
          points={pts(t.pts)}
          fill={t.d > 0.5 ? "#fff" : p.bodyDark}
          fillOpacity={round(soft * (t.d > 0.5 ? (t.d - 0.4) * 0.55 : (0.5 - t.d) * 0.42))}
          stroke="#fff"
          strokeOpacity={round(0.08 + 0.3 * soft)}
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      ))}
      <path d={outline} fill="none" stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="1.2" />
    </g>
  );
}

/** One faceted diamond shard hanging at (x, y). */
function Drop({ c, x, y, s, long = 1.5, o = 1 }: { c: Ctx; x: number; y: number; s: number; long?: number; o?: number }) {
  const t: Pt = [x, round(y - s * long)];
  const r: Pt = [round(x + s), y];
  const b: Pt = [x, round(y + s * long * 1.25)];
  const l: Pt = [round(x - s), y];
  const m: Pt = [round(x - s * 0.15), round(y - s * 0.2)];
  return (
    <g opacity={o}>
      <polygon points={pts([t, r, b, l])} fill={c.u("glass")} stroke={c.p.wingEdge} strokeOpacity="0.7" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points={pts([t, l, m])} fill="#fff" opacity="0.45" />
      <polygon points={pts([m, r, b])} fill={c.p.bodyDark} opacity="0.3" />
      <polygon points={pts([t, m, r])} fill="#fff" opacity="0.15" className="sl-shimmer-facet" />
    </g>
  );
}

/** A swaying chain of shrinking diamond shards on a fine frost thread. */
function Chain({ c, x, y, n, s, step, amp = 5, phase = 0, lean = 0, delay = 0, o = 1, slow = false, tip = false }: { c: Ctx; x: number; y: number; n: number; s: number; step: number; amp?: number; phase?: number; lean?: number; delay?: number; o?: number; slow?: boolean; tip?: boolean }) {
  const ps = Array.from({ length: n }, (_, k) => {
    const t = n > 1 ? k / (n - 1) : 0;
    return { x: round(x + lean * k * step + amp * Math.sin(phase + k * 0.9) * t), y: round(y + step * (k + 0.8)), s: round(s * (1 - 0.5 * t)) };
  });
  const last = ps[ps.length - 1];
  return (
    <g className={slow ? "sl-sway-slow" : "sl-sway"} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${delay}s` }} opacity={o}>
      <polyline points={pts([[x, y], ...ps.map((q) => [q.x, q.y] as Pt)])} fill="none" stroke={c.p.wingEdge} strokeOpacity="0.45" strokeWidth="1" />
      {ps.map((q, k) => (
        <Drop key={k} c={c} x={q.x} y={q.y} s={q.s} />
      ))}
      {tip && <circle cx={last.x} cy={round(last.y + last.s * 2.4)} r="2" fill={c.p.accent} filter={c.u("glow")} className="sl-twinkle" />}
    </g>
  );
}

/** A frilled ribbon (oral) arm trailing from under the bell. */
function Ribbon({ c, x, y, len, w, dir = 1, waves = 1.4, delay = 0, o = 0.85 }: { c: Ctx; x: number; y: number; len: number; w: number; dir?: number; waves?: number; delay?: number; o?: number }) {
  const N = 16;
  const mid: Pt[] = [];
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const mx = x + dir * w * 1.3 * Math.sin(t * Math.PI * waves) * (0.25 + t);
    const my = y + len * t;
    const hw = w * (1 - 0.8 * t) * (0.8 + 0.2 * Math.sin(t * Math.PI * waves * 3));
    mid.push([round(mx), round(my)]);
    L.push([round(mx - hw), round(my)]);
    R.push([round(mx + hw), round(my)]);
  }
  const edge = [...L, ...R.reverse()];
  return (
    <g className="sl-sway-slow" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${delay}s` }}>
      <polygon points={pts(edge)} fill={c.u("fin")} opacity={o} stroke={c.p.wingEdge} strokeOpacity="0.5" strokeWidth="0.9" strokeLinejoin="round" />
      <polyline points={pts(L)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="5 3" />
      <polyline points={pts(mid)} fill="none" stroke={c.p.belly} strokeOpacity="0.5" strokeWidth="1.3" />
    </g>
  );
}

/** Downward crystal points around the front rim of the bell. */
function RimPoints({ c, cx, by, w, k, n, l, from = 8, to = 172 }: { c: Ctx; cx: number; by: number; w: number; k: number; n: number; l: number; from?: number; to?: number }) {
  const { front } = bellGeo(cx, by, w, 1, k);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = from + ((to - from) / (n - 1)) * i;
        const [x, y] = front(t);
        const L = round(l * (i % 2 ? 0.7 : 1) * (0.75 + 0.25 * Math.sin(t * D)));
        return (
          <g key={i}>
            <polygon points={pts([[round(x - 5), round(y - 2)], [x, round(y + L)], [round(x + 5), round(y - 2)]])} fill={c.u("glass")} stroke={c.p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />
            <polygon points={pts([[round(x - 5), round(y - 2)], [x, round(y + L)], [x, round(y - 1)]])} fill="#fff" opacity="0.3" />
          </g>
        );
      })}
    </g>
  );
}

/** Translucent scalloped velum skirt along the front rim. */
function Velum({ c, cx, by, w, k, depth, n = 10 }: { c: Ctx; cx: number; by: number; w: number; k: number; depth: number; n?: number }) {
  const { front } = bellGeo(cx, by, w, 1, k);
  const top = Array.from({ length: 21 }, (_, i) => front(i * 9));
  let d = `M${top[0][0]},${top[0][1]} `;
  for (let i = 0; i < n; i++) {
    const t0 = (180 / n) * i;
    const t1 = (180 / n) * (i + 1);
    const [x0, y0] = front(t0);
    const [x1, y1] = front(t1);
    const tm = (t0 + t1) / 2;
    const [xm, ym] = front(tm);
    const dd = depth * (0.6 + 0.4 * Math.sin(tm * D));
    if (i === 0) d = `M${x0},${y0} `;
    d += `Q${xm},${round(ym + dd * 2)} ${x1},${round(y1 + 1)} `;
  }
  d += `L${top.reverse().map(([x, y]) => `${x},${y}`).join(" L")} Z`;
  return <path d={d} fill={c.u("veil")} opacity="0.55" stroke={c.p.wingEdge} strokeOpacity="0.5" strokeWidth="0.9" />;
}

/* ───────────────────────────── Evolved ───────────────────────────── */

/** Evolved: a gem-cut crystal jellyfish with a bright core, rim crystals, velum, ribbon arms and long shard chains. */
const evolved: Renderer = {
  floating: true,
  fit: 1.08,
  shadow: 70,
  halo: [200, 70, 30],
  render: (c) => {
    const { p, u } = c;
    const cx = 200;
    const by = 176;
    const w = 88;
    const k = 0.2;
    const { front, back } = bellGeo(cx, by, w, 1, k);
    const backT = [30, 62, 96, 128, 156];
    const frontT = [16, 40, 64, 116, 140, 164];
    return (
      <g>
        {/* back chains, seen through the water behind the bell */}
        {backT.map((t, i) => {
          const [x, y] = back(t);
          return <Chain key={t} c={c} x={x} y={y} n={7} s={5} step={19} amp={6} phase={i} delay={i * 0.4} o={0.55} slow />;
        })}
        {/* ribbon arms */}
        <Ribbon c={c} x={186} y={184} len={160} w={13} dir={-1} delay={0.3} />
        <Ribbon c={c} x={214} y={184} len={142} w={12} dir={1} waves={1.7} delay={1.1} o={0.75} />
        <Bell c={c} cx={cx} by={by} w={w} h={88} k={k} rings={[22, 46, 68]} seg={8} core={0.7} />
        {/* refracted caustics inside the bell */}
        <g fill="none" stroke={p.accent} strokeLinecap="round" opacity="0.55" filter={u("glow")}>
          <path d="M150,150 C164,142 176,148 188,138" strokeWidth="1.2" />
          <path d="M214,120 C226,116 236,124 248,118" strokeWidth="1" />
        </g>
        <Spec x={164} y={112} rx={30} ry={9} rot={-34} o={0.34} />
        <Spec x={140} y={150} rx={6} ry={18} rot={10} o={0.2} />
        <Velum c={c} cx={cx} by={by} w={w} k={k} depth={7} />
        <RimPoints c={c} cx={cx} by={by} w={w} k={k} n={11} l={12} />
        {/* front chains hang from the rim */}
        {frontT.map((t, i) => {
          const [x, y] = front(t);
          const n = [7, 9, 10, 10, 9, 7][i];
          return <Chain key={t} c={c} x={x} y={round(y + 6)} n={n} s={6.4} step={17} amp={7} phase={i * 1.3} delay={i * 0.35} tip />;
        })}
        {/* face under the rim */}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.2" fill="none" className="sl-rune-pulse">
          <path d="M154,166 L164,152 L178,150 M246,166 L236,152 L222,150" />
        </g>
        <Eye c={c} x={182} y={170} r={6.5} kind="orb" />
        <Eye c={c} x={218} y={170} r={6.5} kind="orb" />
        <Gem c={c} x={200} y={130} s={0.72} />
      </g>
    );
  },
};

/* ───────────────────────────── Eggling ───────────────────────────── */

/** Eggling: a tiny rounded crystal bud, softly faceted, with huge glowing eyes and three short shard tendrils. */
function eggling(c: Ctx) {
  const { p } = c;
  const cx = 200;
  const by = 222;
  const w = 60;
  const k = 0.22;
  const { front, back } = bellGeo(cx, by, w, 1, k);
  return (
    <g>
      <Chain c={c} x={back(90)[0]} y={back(90)[1]} n={2} s={4} step={14} amp={2} o={0.5} slow />
      {/* bud nub on top */}
      <path d="M192,156 L200,138 L208,156 Z" fill={c.u("glass")} {...rim(c, 1)} />
      <path d="M192,156 L200,138 L200,156 Z" fill="#fff" opacity="0.35" />
      <Bell c={c} cx={cx} by={by} w={w} h={74} k={k} rings={[34, 64]} seg={4} soft={0.45} core={0.45} />
      <Spec x={172} y={172} rx={20} ry={8} rot={-38} o={0.42} />
      <Spec x={226} y={164} rx={5} ry={3} rot={-20} o={0.5} />
      {/* soft rim scallops */}
      {[30, 60, 90, 120, 150].map((t) => {
        const [x, y] = front(t);
        return <circle key={t} cx={x} cy={round(y - 1)} r="4.2" fill={c.u("glass")} stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="0.8" />;
      })}
      {/* three short shard tendrils */}
      {[48, 90, 132].map((t, i) => {
        const [x, y] = front(t);
        return <Chain key={t} c={c} x={x} y={round(y + 3)} n={i === 1 ? 4 : 3} s={5.6} step={14} amp={3} phase={i * 2} delay={i * 0.5} tip={i === 1} />;
      })}
      {/* big face */}
      <ellipse cx="170" cy="212" rx="8" ry="4.5" fill={p.accent} opacity="0.3" />
      <ellipse cx="230" cy="212" rx="8" ry="4.5" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={178} y={196} r={12} kind="round" />
      <Eye c={c} x={222} y={196} r={12} kind="round" />
      <path d="M194,214 C197,218 203,218 206,214" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round" />
      <Gem c={c} x={200} y={164} s={0.42} />
    </g>
  );
}

/* ───────────────────────────── Hatchling ───────────────────────────── */

/** Hatchling: a taller bell growing its first real facets, six lengthening shard tendrils and two short ribbon buds. */
function hatchling(c: Ctx) {
  const { p } = c;
  const cx = 200;
  const by = 198;
  const w = 70;
  const k = 0.2;
  const { front, back } = bellGeo(cx, by, w, 1, k);
  return (
    <g>
      {[50, 130].map((t, i) => {
        const [x, y] = back(t);
        return <Chain key={t} c={c} x={x} y={y} n={4} s={4.4} step={16} amp={4} phase={i} delay={i * 0.6} o={0.5} slow />;
      })}
      <Ribbon c={c} x={192} y={204} len={70} w={9} dir={-1} delay={0.4} o={0.7} />
      <Ribbon c={c} x={208} y={204} len={58} w={8} dir={1} delay={1} o={0.6} />
      <Bell c={c} cx={cx} by={by} w={w} h={84} k={k} rings={[28, 56]} seg={6} soft={0.75} core={0.4} />
      {/* tip crystal, slightly askew */}
      <path d="M194,116 L201,94 L208,116 Z" fill={c.u("glass")} {...rim(c, 1)} />
      <path d="M194,116 L201,94 L201,116 Z" fill="#fff" opacity="0.35" />
      <Spec x={166} y={142} rx={24} ry={8} rot={-40} o={0.38} />
      <RimPoints c={c} cx={cx} by={by} w={w} k={k} n={7} l={7} from={14} to={166} />
      {[18, 46, 74, 106, 134, 162].map((t, i) => {
        const [x, y] = front(t);
        const n = [4, 5, 6, 6, 5, 4][i];
        return <Chain key={t} c={c} x={x} y={round(y + 4)} n={n} s={5.6} step={16} amp={5} phase={i * 1.1} delay={i * 0.4} tip={i === 2 || i === 3} />;
      })}
      <ellipse cx="166" cy="190" rx="7" ry="3.6" fill={p.accent} opacity="0.25" />
      <ellipse cx="234" cy="190" rx="7" ry="3.6" fill={p.accent} opacity="0.25" />
      <Eye c={c} x={180} y={182} r={8.5} kind="round" />
      <Eye c={c} x={220} y={182} r={8.5} kind="round" />
      <Gem c={c} x={200} y={140} s={0.55} />
    </g>
  );
}

/* ───────────────────────────── Ascended ───────────────────────────── */

/** Ascended: a tilted crystal chandelier — gem-cut bell under a spired crown, frost filigree, festooned bead swags, cascading prism chains and four ribbon arms. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const id = `${c.id}asc`;
  const cx = 200;
  const by = 170;
  const w = 104;
  const k = 0.2;
  const { front, back } = bellGeo(cx, by, w, 1, k);
  const frontT = [10, 30, 50, 70, 90, 110, 130, 150, 170];
  const spectrum = ["#ff7ab6", "#ffd66e", "#7dffc0", "#7ab8ff", "#c08bff"];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-prism`} x1="0" y1="0" x2="1" y2="0">
          {spectrum.map((s, i) => (
            <stop key={s} offset={round(i / 4)} stopColor={s} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}-heart`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.4" stopColor={p.accent} stopOpacity="0.6" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* prismatic refraction fanning out from the heart */}
      <g opacity="0.32" className="sl-shimmer-facet">
        {[-160, -128, -52, -20].map((a) => {
          const [x1, y1] = polar(200, 128, 150, a);
          const [x2, y2] = polar(200, 128, 150, a + 7);
          return <polygon key={a} points={pts([[200, 128], [x1, y1], [x2, y2]])} fill={`url(#${id}-prism)`} />;
        })}
      </g>
      <g transform="rotate(-5 200 200)">
        {/* back chains */}
        {[24, 52, 80, 108, 136, 160].map((t, i) => {
          const [x, y] = back(t);
          return <Chain key={t} c={c} x={x} y={y} n={8} s={5} step={19} amp={6} phase={i} lean={0.04} delay={i * 0.4} o={0.5} slow />;
        })}
        {/* four ribbon arms */}
        <Ribbon c={c} x={178} y={180} len={178} w={14} dir={-1} delay={0.2} />
        <Ribbon c={c} x={222} y={180} len={168} w={13} dir={1} waves={1.7} delay={0.9} o={0.8} />
        <Ribbon c={c} x={192} y={184} len={130} w={10} dir={1} waves={1.2} delay={1.5} o={0.6} />
        <Ribbon c={c} x={208} y={184} len={120} w={9} dir={-1} waves={1.9} delay={2.1} o={0.55} />
        {/* crown spire behind the bell */}
        {[
          [-34, 40, 9],
          [-17, 56, 10],
          [0, 74, 12],
          [17, 56, 10],
          [34, 40, 9],
        ].map(([a, l, wd], i) => {
          const [x, y] = polar(200, 92, 8, a - 90);
          return (
            <g key={a} transform={`translate(${x} ${y}) rotate(${a})`}>
              <polygon points={pts([[-wd, 0], [round(-wd * 0.7), round(-l * 0.55)], [0, -l], [round(wd * 0.7), round(-l * 0.55)], [wd, 0]])} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.9" />
              <polygon points={pts([[-wd, 0], [round(-wd * 0.7), round(-l * 0.55)], [0, -l], [0, 0]])} fill="#fff" opacity="0.3" className="sl-shimmer-facet" style={{ animationDelay: `${i * 0.3}s` }} />
              <circle cx="0" cy={-l - 4} r={i === 2 ? 2.6 : 1.6} fill={p.accent} filter={u("glow")} className="sl-twinkle" />
            </g>
          );
        })}
        <Bell c={c} cx={cx} by={by} w={w} h={98} k={k} rings={[18, 38, 58, 76]} seg={10} core={0.85} />
        {/* heart of light */}
        <circle cx="200" cy="128" r="34" fill={`url(#${id}-heart)`} className="sl-core" />
        {/* frost filigree */}
        <g fill="none" stroke={p.belly} strokeLinecap="round" strokeOpacity="0.75" strokeWidth="1.3">
          {[1, -1].map((s) => (
            <g key={s} transform={s < 0 ? "translate(400 0) scale(-1 1)" : undefined}>
              <path d="M200,98 C186,100 174,108 170,120 C166,132 176,140 184,134 C190,128 184,120 178,124" />
              <path d="M170,120 C156,128 142,142 136,160 C132,172 142,178 148,170 C152,164 146,158 142,162" />
              <path d="M136,160 C128,164 118,166 110,164" />
              <path d="M184,152 C176,156 170,164 172,172" strokeOpacity="0.5" />
            </g>
          ))}
        </g>
        <Dots c={c} pts={[[178, 124], [222, 124], [142, 162], [258, 162], [200, 96]]} r={1.6} color="#fff" />
        {/* chromatic edge glints */}
        <g fill="none" strokeWidth="1.2" opacity="0.6">
          <path d="M108,166 C104,124 128,86 170,76" stroke="#ff7ab6" />
          <path d="M111,166 C107,125 131,88 172,79" stroke="#ffd66e" />
          <path d="M114,166 C110,126 134,90 174,82" stroke="#7dffc0" />
        </g>
        <Spec x={158} y={98} rx={34} ry={9} rot={-36} o={0.36} />
        <Velum c={c} cx={cx} by={by} w={w} k={k} depth={9} n={12} />
        <RimPoints c={c} cx={cx} by={by} w={w} k={k} n={13} l={15} />
        {/* festooned bead swags between the rim crystals */}
        <g fill="none" stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="1">
          {frontT.slice(0, -1).map((t, i) => {
            const [x0, y0] = front(t);
            const [x1, y1] = front(frontT[i + 1]);
            const mx = round((x0 + x1) / 2);
            const my = round((y0 + y1) / 2 + 26);
            return (
              <g key={t}>
                <path d={`M${x0},${round(y0 + 8)} Q${mx},${my} ${x1},${round(y1 + 8)}`} />
                <circle cx={mx} cy={round(my - 9)} r="2.4" fill={p.belly} fillOpacity="0.8" stroke="none" />
              </g>
            );
          })}
        </g>
        {/* cascading chandelier chains, longest in the middle, trailing as it rises */}
        {frontT.map((t, i) => {
          const [x, y] = front(t);
          const n = [6, 8, 9, 10, 11, 10, 9, 8, 6][i];
          return <Chain key={t} c={c} x={x} y={round(y + 8)} n={n} s={6.6} step={17} amp={6} phase={i * 1.2} lean={0.05} delay={i * 0.3} tip />;
        })}
        <Eye c={c} x={180} y={162} r={7} kind="orb" />
        <Eye c={c} x={220} y={162} r={7} kind="orb" />
        <Gem c={c} x={200} y={128} s={0.82} />
      </g>
    </g>
  );
}

export const cryovant: Renderer = {
  ...evolved,
  halo: [200, 30, 26],
  stageFit: [1.45, 1.2, 1.08, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
