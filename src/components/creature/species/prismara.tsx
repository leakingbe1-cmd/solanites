import { blade, byStage, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Prismara — a tall, crowned bird displaying a peacock fan of prism shards that split light into colour. */

/** The colours a shard splits light into. */
const SPECTRUM = ["#ff5a8a", "#ffa05a", "#ffe66b", "#7dff9a", "#6bfff1", "#7a9cff", "#c77aff"];

/** One faceted prism shard (a crystal display feather), pointing along +x from its quill at (0,0). */
function Prism({ c, l, w, i, o = 1, tip = true }: { c: Ctx; l: number; w: number; i: number; o?: number; tip?: boolean }) {
  const L = round(l);
  const W = round(w);
  const m = round(l * 0.62);
  const b = round(l * 0.16);
  const s = SPECTRUM[i % SPECTRUM.length];
  const [e0, e1, e2, ew] = [round(l * 0.7), round(l * 0.8), round(l * 0.9), round(w * 0.42)];
  return (
    <g opacity={o}>
      {/* quill */}
      <path d={`M0,0 L${b},0`} stroke={c.p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M${b},0 L${m},${-W} L${L},0 L${m},${W} Z`} fill={c.u("glass")} stroke={i % 2 ? c.p.accent : c.p.wingEdge} strokeOpacity="0.85" strokeWidth="1" strokeLinejoin="round" />
      <path d={`M${b},0 L${m},${-W} L${L},0 Z`} fill="#fff" opacity="0.16" className="sl-shimmer-facet" style={{ animationDelay: `${round((i * 0.37) % 3)}s` }} />
      <path d={`M${b},0 L${m},${W} L${L},0 Z`} fill={s} opacity="0.22" />
      <path d={`M${b},0 L${L},0`} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* refracting eye-facet near the tip, like a peacock's ocellus */}
      <path d={`M${e0},0 L${e1},${-ew} L${e2},0 L${e1},${ew} Z`} fill={s} opacity="0.9" />
      <path d={`M${e0},0 L${e1},${-ew} L${e1},0 Z`} fill="#fff" opacity="0.55" />
      {tip && <circle cx={L} cy="0" r="2.6" fill={s} filter={c.u("glow")} className="sl-twinkle" style={{ animationDelay: `${round((i * 0.41) % 3)}s` }} />}
    </g>
  );
}

/** A fan of `n` prism shards from (cx, cy) between angles `from`..`to`, longest in the middle. */
function fan(c: Ctx, key: string, cx: number, cy: number, n: number, from: number, to: number, len: number, w: number, o = 1, shift = 0) {
  return Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 0.5 : k / (n - 1);
    const a = round(from + (to - from) * t);
    const l = round(len * (0.74 + 0.26 * Math.sin(t * Math.PI)));
    return (
      <g key={`${key}${k}`} transform={`translate(${cx} ${cy}) rotate(${a})`}>
        <Prism c={c} l={l} w={w} i={k + shift} o={o} />
      </g>
    );
  });
}

/** Thin spectral beams refracted out of the fan. */
function beams(c: Ctx, key: string, cx: number, cy: number, n: number, from: number, to: number, r: number, o: number) {
  return (
    <g className="sl-twinkle" opacity={o} key={key}>
      {Array.from({ length: n }, (_, k) => {
        const a = from + ((to - from) * (k + 0.5)) / n;
        const [x1, y1] = polar(cx, cy, r, a - 1.6);
        const [x2, y2] = polar(cx, cy, r, a + 1.6);
        return <path key={k} d={`M${cx},${cy} L${x1},${y1} L${x2},${y2} Z`} fill={SPECTRUM[k % SPECTRUM.length]} style={{ animationDelay: `${round(k * 0.29)}s` }} />;
      })}
    </g>
  );
}

/** Scalloped down puffs round an ellipse (drawn before the body so only their outer halves show). */
function fluff(c: Ctx, cx: number, cy: number, rx: number, ry: number, n: number, r: number, from = 0, to = 360) {
  return Array.from({ length: n }, (_, i) => {
    const a = from + ((to - from) * (i + 0.5)) / n;
    const [x, y] = [round(cx + Math.cos((a * Math.PI) / 180) * rx), round(cy + Math.sin((a * Math.PI) / 180) * ry)];
    return <circle key={i} cx={x} cy={y} r={r} fill={c.u("body")} {...rim(c, 1)} />;
  });
}

/** Rows of small breast-feather scallops. */
function scallops(cx: number, top: number, rows: number[], gap = 9, size = 4) {
  return rows
    .map((half, r) => {
      const y = top + r * gap;
      const out: string[] = [];
      for (let x = cx - half; x <= cx + half; x += size * 2) out.push(`M${round(x - size)},${y} c${round(size * 0.5)},${round(size)} ${round(size * 1.5)},${round(size)} ${size * 2},0`);
      return out.join(" ");
    })
    .join(" ");
}

/**
 * Bird leg below a feathered thigh: knee knuckle, tapered scaled shank, ankle and splayed toes with claws.
 * `top` is the knee; the foot rests on y = 351.
 */
function Leg({ c, x, top, w = 4.5, dir = 0, anklet = false }: { c: Ctx; x: number; top: number; w?: number; dir?: number; anklet?: boolean }) {
  const { p, u } = c;
  const f = 349;
  const mid = round((top + f) / 2);
  const bands = Array.from({ length: Math.max(1, Math.floor((f - top - 10) / 7)) }, (_, i) => top + 8 + i * 7);
  const toe = (dx: number, dy: number, bend: number) => `M${x},${f} C${round(x + dx * 0.4)},${round(f + dy * 0.2 + bend)} ${round(x + dx * 0.8)},${round(f + dy * 0.7)} ${round(x + dx)},${round(f + dy)}`;
  const toes: [number, number, number][] = [
    [-17 + dir, 5, 1],
    [dir * 2, 8, 0],
    [17 + dir, 5, 1],
  ];
  return (
    <g>
      {/* hind toe */}
      <path d={`M${x},${f - 1} L${round(x - dir * 3 + 3)},${f - 5}`} stroke={p.bodyDark} strokeWidth={round(w * 0.8)} strokeLinecap="round" />
      <path
        d={`M${round(x - w)},${top} C${round(x - w * 1.05)},${mid} ${round(x - w * 0.7)},${f - 8} ${round(x - w * 0.8)},${f - 1} L${round(x + w * 0.8)},${f - 1} C${round(x + w * 0.7)},${f - 8} ${round(x + w * 1.05)},${mid} ${round(x + w)},${top} Z`}
        fill={u("horn")}
        {...rim(c, 1)}
      />
      <path d={bands.map((y) => `M${round(x - w * 0.75)},${y} L${round(x + w * 0.75)},${y + 1}`).join(" ")} stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="0.9" />
      <ellipse cx={x} cy={top + 2} rx={round(w * 1.25)} ry={round(w * 1.2)} fill={p.horn} {...rim(c, 1)} />
      {anklet && (
        <g>
          <path d={`M${round(x - w * 1.3)},${f - 16} L${round(x + w * 1.3)},${f - 15} L${round(x + w)},${f - 10} L${round(x - w)},${f - 11} Z`} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="0.9" />
          <circle cx={x} cy={f - 13} r="1.6" fill={p.accent} filter={u("glow")} />
        </g>
      )}
      {toes.map(([dx, dy, bend], i) => (
        <g key={i}>
          <path d={toe(dx, dy, bend)} fill="none" stroke={p.horn} strokeWidth={round(w * 0.9)} strokeLinecap="round" />
          <path d={toe(dx, dy, bend)} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx={round(x + dx + Math.sign(dx) * 1.5)} cy={round(f + dy + 1.2)} r={round(w * 0.42)} fill={p.bodyDark} />
        </g>
      ))}
    </g>
  );
}

/** Feathered thigh ("trouser") covering the top of a leg; `x, y` is the hip, `h` its drop to the knee. */
function Thigh({ c, x, y, w, h }: { c: Ctx; x: number; y: number; w: number; h: number }) {
  const { p, u } = c;
  return (
    <g>
      <path
        d={`M${round(x - w)},${y} C${round(x - w * 1.2)},${round(y + h * 0.55)} ${round(x - w * 0.6)},${y + h} ${x},${y + h} C${round(x + w * 0.6)},${y + h} ${round(x + w * 1.2)},${round(y + h * 0.55)} ${round(x + w)},${y} Z`}
        fill={u("body")}
        {...rim(c, 1)}
      />
      <path d={`M${round(x - w * 0.7)},${round(y + h * 0.62)} c3,4 7,4 10,0 M${round(x + w * 0.05)},${round(y + h * 0.66)} c3,4 7,4 10,0 M${round(x - w * 0.35)},${round(y + h * 0.88)} c3,3 6,3 9,0`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.1" />
    </g>
  );
}

/** Folded crystal-edged wing on the viewer's left; mirror for the right. */
function FoldedWing({ c, s = 1, lift = 0 }: { c: Ctx; s?: number; lift?: number }) {
  const { p, u } = c;
  return (
    <g transform={`translate(170 200) rotate(${lift}) scale(${s}) translate(-170 -200)`}>
      {/* primaries fanning below the folded wing */}
      {[96, 104, 112].map((a, i) => (
        <g key={a} transform={`translate(${168 + i * 3} ${300 - i * 4}) rotate(${a})`}>
          <path d={blade(42 - i * 6, 7, 0.75)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.45" />
          <path d={`M4,0 L${36 - i * 6},0`} stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="0.8" />
        </g>
      ))}
      <path d="M172,194 C152,210 146,256 154,292 C158,306 164,316 172,326 C176,296 182,254 192,212 Z" fill={u("wing")} {...rim(c, 1)} />
      {/* covert rows */}
      <path d="M160,232 c5,5 11,5 16,0 M156,254 c5,5 11,5 16,0 M174,250 c4,4 9,4 12,0 M158,276 c5,5 11,5 16,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.38" strokeWidth="1.1" />
      {/* crystal leading edge */}
      <path d="M172,194 C156,208 150,240 152,268 L160,262 C158,238 164,214 176,200 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />
      <path d="M172,194 C162,204 156,222 154,240 L160,236 C162,220 168,206 176,200 Z" fill="#fff" opacity="0.25" className="sl-shimmer-facet" />
    </g>
  );
}

/* ───────────────────────────── Evolved ───────────────────────────── */

/** Evolved: a tall slender bird standing upright, a full fan of prism shards raised behind it, three-point crown. */
const evolved: Renderer = {
  shadow: 60,
  halo: [200, 30, 26],
  render: (c) => {
    const { p, u } = c;
    return (
      <g>
        {/* the display fan: a slow sway */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 252px" }}>
          {beams(c, "b", 200, 252, 14, -172, -8, 168, 0.12)}
          <path d="M200,252 L64,252 A136,136 0 0 1 336,252 Z" fill={p.wing} opacity="0.18" />
          {fan(c, "f", 200, 252, 13, -174, -6, 140, 13)}
          {/* inner covert ring hiding the quills */}
          {fan(c, "i", 200, 252, 9, -164, -16, 62, 9, 0.95, 3)}
        </g>
        {/* legs */}
        <Leg c={c} x={186} top={320} dir={-2} />
        <Leg c={c} x={214} top={320} dir={2} />
        <Thigh c={c} x={185} y={292} w={15} h={30} />
        <Thigh c={c} x={215} y={292} w={15} h={30} />
        {/* slender upright body */}
        <path d="M200,166 C228,168 244,200 242,242 C240,282 226,308 200,314 C174,308 160,282 158,242 C156,200 172,168 200,166 Z" fill={u("body")} {...rim(c)} />
        <path d="M200,190 C216,192 226,218 224,252 C222,284 212,302 200,304 C188,302 178,284 176,252 C174,218 184,192 200,190 Z" fill={p.belly} opacity="0.42" />
        <path d={scallops(200, 214, [12, 16, 18, 18, 16, 12, 8], 11, 4)} fill="none" stroke={p.belly} strokeOpacity="0.65" strokeWidth="1.1" />
        <g opacity={c.mark} stroke={p.accent} strokeWidth="1.2" fill="none" filter={u("glow")}>
          <path d="M200,226 L192,246 L200,268 L208,246 Z" />
        </g>
        <Spec x={186} y={196} rx={7} ry={20} rot={12} o={0.26} />
        <FoldedWing c={c} />
        <g transform={MIRROR}>
          <FoldedWing c={c} />
        </g>
        {/* neck with an iridescent collar */}
        <path d="M188,176 C190,156 192,140 193,124 L207,124 C208,140 210,156 212,176 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M196,128 C196,146 196,160 198,174" fill="none" stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
        <path d={scallops(200, 160, [10, 13], 7, 3)} fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1.1" />
        {/* head */}
        <path d="M200,84 C215,84 223,98 223,110 C223,124 212,132 200,132 C188,132 177,124 177,110 C177,98 185,84 200,84 Z" fill={u("body")} {...rim(c)} />
        <path d="M183,116 C188,121 194,122 197,119 M217,116 C212,121 206,122 203,119" fill="none" stroke={p.belly} strokeOpacity="0.75" strokeWidth="1.8" strokeLinecap="round" />
        <Spec x={192} y={92} rx={7} ry={3} rot={-20} o={0.42} />
        <Eye c={c} x={190} y={108} r={4.8} kind="almond" flip />
        <Eye c={c} x={210} y={108} r={4.8} kind="almond" />
        {/* short beak */}
        <path d="M195,116 L205,116 L201,132 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
        <path d="M197,119 L203,119" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="0.8" />
        {/* three-point crown */}
        <g className="sl-sway" style={{ transformOrigin: "200px 88px" }}>
          <path d="M189,90 L179,62 L195,86 Z M211,90 L221,62 L205,86 Z M194,88 L200,48 L206,88 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.85" strokeWidth="1" strokeLinejoin="round" />
          <path d="M200,48 L200,88 L194,88 Z" fill="#fff" opacity="0.28" className="sl-shimmer-facet" />
          {[
            [179, 62],
            [200, 48],
            [221, 62],
          ].map(([x, y], i) => (
            <circle key={x} cx={x} cy={y} r="2.6" fill={SPECTRUM[i * 2 + 1]} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
        <Gem c={c} x={200} y={92} s={0.48} />
      </g>
    );
  },
};

/* ───────────────────────────── Eggling ───────────────────────────── */

/** Eggling: a round downy chick sitting on its toes, huge eyes, a crown bump and one first crystal shard in its tail. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* the single first shard, peeking up from the tail */}
      <g transform="translate(234 312)">
        <g className="sl-sway" style={{ transformOrigin: "0px 0px" }}>
          <g transform="rotate(-58)">
            <Prism c={c} l={66} w={11} i={4} />
          </g>
        </g>
      </g>
      {/* downy round body */}
      {fluff(c, 200, 306, 56, 44, 16, 9, 0, 360)}
      <path d="M200,256 C246,256 262,292 258,318 C254,342 230,352 200,352 C170,352 146,342 142,318 C138,292 154,256 200,256 Z" fill={u("body")} />
      <ellipse cx="200" cy="318" rx="34" ry="28" fill={p.belly} opacity="0.5" />
      <path d={scallops(200, 306, [16, 20, 16], 9, 4)} fill="none" stroke={p.belly} strokeOpacity="0.6" strokeWidth="1" />
      {/* stubby wing nubs */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M152,288 C138,296 136,318 146,330 C152,320 158,308 162,296 Z" fill={u("wing")} {...rim(c, 1)} />
          <path d="M146,302 c3,3 7,3 9,0 M144,314 c3,3 6,3 8,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" />
        </g>
      ))}
      {/* tiny toes peeking out */}
      {[180, 220].map((x) => (
        <g key={x} stroke={p.horn} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d={`M${x},346 L${x - 9},354 M${x},346 L${x},356 M${x},346 L${x + 9},354`} />
        </g>
      ))}
      {/* big round head */}
      {fluff(c, 200, 208, 50, 48, 12, 8, 200, 340)}
      <circle cx="200" cy="212" r="54" fill={u("body")} {...rim(c)} />
      <path d="M156,236 C166,256 186,264 200,264 C214,264 234,256 244,236 C232,248 214,252 200,252 C186,252 168,248 156,236 Z" fill={p.belly} opacity="0.6" />
      <Spec x={180} y={176} rx={20} ry={7} rot={-18} o={0.4} />
      {/* crown bump: three tiny crystal nubs */}
      <path d="M190,162 L186,150 L195,159 Z M210,162 L214,150 L205,159 Z M195,160 L200,144 L205,160 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="0.9" strokeLinejoin="round" />
      <circle cx="200" cy="144" r="2" fill={p.wingEdge} filter={u("glow")} />
      {/* face */}
      <ellipse cx="166" cy="232" rx="8" ry="5" fill={p.accent} opacity="0.32" />
      <ellipse cx="234" cy="232" rx="8" ry="5" fill={p.accent} opacity="0.32" />
      <Eye c={c} x={180} y={210} r={11.5} kind="round" />
      <Eye c={c} x={220} y={210} r={11.5} kind="round" />
      <path d="M194,226 L206,226 L200,238 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
      <Gem c={c} x={200} y={176} s={0.4} />
    </g>
  );
}

/* ───────────────────────────── Hatchling ───────────────────────────── */

/** Hatchling: a gangly fledgling on long knobbly legs, wings held out, a small fan of five shards and a forming crown. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* small fan of five shards */}
      <g className="sl-sway" style={{ transformOrigin: "200px 262px" }}>
        {beams(c, "b", 200, 262, 5, -150, -30, 110, 0.08)}
        {fan(c, "f", 200, 262, 5, -150, -30, 92, 11, 1, 2)}
      </g>
      {/* long knobbly legs */}
      <Leg c={c} x={188} top={302} w={3.8} dir={-2} />
      <Leg c={c} x={212} top={302} w={3.8} dir={2} />
      <Thigh c={c} x={187} y={278} w={12} h={26} />
      <Thigh c={c} x={213} y={278} w={12} h={26} />
      {/* lean body with leftover down */}
      {fluff(c, 200, 262, 30, 34, 9, 6, 20, 160)}
      <path d="M200,212 C224,214 236,238 234,262 C232,284 220,298 200,300 C180,298 168,284 166,262 C164,238 176,214 200,212 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,230 C212,232 218,248 217,266 C216,282 208,292 200,292 C192,292 184,282 183,266 C182,248 188,232 200,230 Z" fill={p.belly} opacity="0.45" />
      <path d={scallops(200, 246, [10, 12, 10], 10, 4)} fill="none" stroke={p.belly} strokeOpacity="0.6" strokeWidth="1" />
      <Spec x={188} y={228} rx={6} ry={14} rot={14} o={0.26} />
      {/* half-grown wings held out for balance */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <g className="sl-flap" style={{ transformOrigin: "172px 236px" }}>
            {[150, 162, 174].map((a, i) => (
              <g key={a} transform={`translate(160 ${258 + i * 3}) rotate(${a})`}>
                <path d={blade(30 - i * 4, 6, 0.75)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.45" />
              </g>
            ))}
            <path d="M174,232 C156,236 140,248 132,262 C146,262 160,262 170,256 C176,250 178,240 174,232 Z" fill={u("wing")} {...rim(c, 1)} />
            <path d="M172,234 C160,238 148,246 140,256 L146,256 C154,248 162,242 174,238 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.8" />
          </g>
        </g>
      ))}
      {/* thin neck */}
      <path d="M190,218 C191,204 192,194 193,184 L207,184 C208,194 209,204 210,218 Z" fill={u("body")} {...rim(c, 1)} />
      <path d={scallops(200, 206, [8], 7, 3)} fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1" />
      {/* big head, tilted with curiosity */}
      <g transform="rotate(-8 200 166)">
        {fluff(c, 200, 140, 18, 10, 4, 5, 220, 320)}
        <path d="M200,136 C220,136 230,152 230,166 C230,184 216,194 200,194 C184,194 170,184 170,166 C170,152 180,136 200,136 Z" fill={u("body")} {...rim(c)} />
        <Spec x={188} y={146} rx={9} ry={4} rot={-20} o={0.4} />
        {/* crown forming: three short points */}
        <path d="M190,142 L184,124 L196,138 Z M210,142 L216,124 L204,138 Z M195,140 L200,116 L205,140 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.85" strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M200,116 L200,140 L195,140 Z" fill="#fff" opacity="0.25" />
        <circle cx="200" cy="116" r="2.2" fill={p.wingEdge} filter={u("glow")} />
        <ellipse cx="178" cy="178" rx="6" ry="3.5" fill={p.accent} opacity="0.3" />
        <ellipse cx="222" cy="178" rx="6" ry="3.5" fill={p.accent} opacity="0.3" />
        <Eye c={c} x={187} y={164} r={7.2} kind="almond" flip />
        <Eye c={c} x={213} y={164} r={7.2} kind="almond" />
        <path d="M194,174 L206,174 L201,190 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
        <Gem c={c} x={200} y={146} s={0.4} />
      </g>
    </g>
  );
}

/* ───────────────────────────── Ascended ───────────────────────────── */

/** Ascended: the Refractor Queen — chest raised, wings half spread, a huge two-tier shard fan throwing spectral light, jewelled crown and crest plumes. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const crown: [number, number, number][] = [
    [172, 70, -30],
    [186, 56, -14],
    [200, 44, 0],
    [214, 56, 14],
    [228, 70, 30],
  ];
  return (
    <g>
      {/* spectral refraction behind everything */}
      {beams(c, "b", 200, 246, 28, -182, 2, 200, 0.16)}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 246px" }}>
        <circle cx="200" cy="246" r="150" fill={u("light")} opacity="0.12" />
        {/* back tier: long shards */}
        {fan(c, "f", 200, 246, 19, -184, 4, 166, 13)}
        {/* front tier: shorter, offset shards */}
        {fan(c, "m", 200, 246, 14, -174, -6, 112, 11, 1, 3)}
        {/* inner coverts */}
        {fan(c, "i", 200, 246, 9, -160, -20, 62, 8, 1, 5)}
      </g>
      {/* half-spread crystal wings */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <g className="sl-flap" style={{ transformOrigin: "172px 206px" }}>
            {[150, 160, 170, 180, 190].map((a, i) => (
              <g key={a} transform={`translate(${150 - i * 2} ${226 + i * 6}) rotate(${a})`}>
                <path d={blade(74 - i * 8, 9, 0.75)} fill={u("glass")} stroke={i % 2 ? p.accent : p.wingEdge} strokeOpacity="0.7" />
                <path d={`M6,0 L${70 - i * 8},0`} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
              </g>
            ))}
            <path d="M176,200 C150,204 126,220 114,244 C132,250 150,252 164,246 C176,236 182,218 176,200 Z" fill={u("wing")} {...rim(c, 1)} />
            <path d="M150,226 c5,4 10,4 14,0 M132,238 c5,4 10,4 14,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.1" />
            <path d="M176,200 C154,204 134,216 120,234 L128,236 C140,222 156,212 178,208 Z" fill="#fff" opacity="0.22" className="sl-shimmer-facet" />
          </g>
        </g>
      ))}
      {/* legs with crystal anklets */}
      <Leg c={c} x={185} top={318} w={5} dir={-2} anklet />
      <Leg c={c} x={215} top={318} w={5} dir={2} anklet />
      <Thigh c={c} x={184} y={284} w={17} h={36} />
      <Thigh c={c} x={216} y={284} w={17} h={36} />
      {/* full, raised chest */}
      <path d="M200,150 C234,152 250,188 248,232 C246,276 230,304 200,310 C170,304 154,276 152,232 C150,188 166,152 200,150 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,172 C220,174 232,204 230,240 C228,276 214,296 200,298 C186,296 172,276 170,240 C168,204 180,174 200,172 Z" fill={p.belly} opacity="0.4" />
      <path d={scallops(200, 222, [14, 18, 20, 20, 18, 14, 9], 11, 4)} fill="none" stroke={p.belly} strokeOpacity="0.6" strokeWidth="1.1" />
      {/* crystal breastplate */}
      <g opacity={c.mark}>
        <path d="M200,176 L222,196 L200,236 L178,196 Z" fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="1" />
        <path d="M200,176 L222,196 L200,206 Z M200,176 L178,196 L200,206 Z" fill="#fff" opacity="0.2" className="sl-shimmer-facet" />
        <path d="M200,206 L222,196 L200,236 Z" fill={SPECTRUM[5]} opacity="0.25" />
        <path d="M200,206 L178,196 L200,236 Z" fill={SPECTRUM[0]} opacity="0.2" />
        <path d="M200,236 L192,262 L200,284 L208,262 Z" fill="none" stroke={p.accent} strokeWidth="1.2" filter={u("glow")} />
      </g>
      <Spec x={182} y={180} rx={8} ry={22} rot={14} o={0.26} />
      {/* folded secondaries at the flanks */}
      {[0, 1].map((m) => (
        <path key={m} transform={m ? MIRROR : undefined} d="M164,196 C150,222 150,262 162,292 C168,270 174,240 182,212 Z" fill={u("wing")} {...rim(c, 1)} />
      ))}
      {/* neck lifted high, with a jewelled collar */}
      <path d="M187,162 C189,140 191,122 193,104 L207,104 C209,122 211,140 213,162 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M196,108 C196,128 196,144 198,160" fill="none" stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round" />
      <path d={scallops(200, 140, [10, 12, 14], 7, 3)} fill="none" stroke={p.wingEdge} strokeOpacity="0.75" strokeWidth="1.1" />
      <path d="M184,156 C192,164 208,164 216,156" fill="none" stroke={p.horn} strokeWidth="1.6" />
      {[188, 194, 200, 206, 212].map((x, i) => (
        <circle key={x} cx={x} cy={round(160 + (i === 2 ? 2.4 : i % 4 === 0 ? 0 : 1.6))} r={i === 2 ? 2.4 : 1.6} fill={SPECTRUM[(i * 2) % 7]} filter={u("glow")} />
      ))}
      {/* trailing crest plumes */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <g className="sl-sway" style={{ transformOrigin: "190px 72px" }}>
            <path d="M190,72 C176,52 160,40 140,36" fill="none" stroke={p.wingEdge} strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M140,36 L134,30 L128,36 L134,42 Z" fill={u("glass")} stroke={p.accent} strokeWidth="0.8" />
            <circle cx="134" cy="36" r="2" fill={p.accent} filter={u("glow")} />
          </g>
        </g>
      ))}
      {/* head */}
      <path d="M200,62 C216,62 225,76 225,90 C225,104 213,112 200,112 C187,112 175,104 175,90 C175,76 184,62 200,62 Z" fill={u("body")} {...rim(c)} />
      <path d="M181,96 C186,102 193,103 196,100 M219,96 C214,102 207,103 204,100" fill="none" stroke={p.belly} strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round" />
      <Spec x={191} y={70} rx={8} ry={3} rot={-20} o={0.42} />
      <Eye c={c} x={189} y={88} r={5} kind="almond" flip />
      <Eye c={c} x={211} y={88} r={5} kind="almond" />
      <path d="M195,96 L205,96 L201,113 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
      <path d="M197,99 L203,99" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="0.8" />
      {/* jewelled five-point crown */}
      <g className="sl-sway" style={{ transformOrigin: "200px 72px" }}>
        <path d="M176,74 C184,68 216,68 224,74 L222,80 C214,76 186,76 178,80 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.8" />
        {crown.map(([x, y, a], i) => {
          const h = 76 - y;
          return (
            <g key={x}>
              <path
                d={`M${x - 5},${round(72 + Math.abs(a) * 0.08)} L${x},${y} L${x + 5},${round(72 + Math.abs(a) * 0.08)} Z`}
                transform={`rotate(${round(a * 0.5)} ${x} 74)`}
                fill={u("glass")}
                stroke={p.wingEdge}
                strokeOpacity="0.9"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <g transform={`rotate(${round(a * 0.5)} ${x} 74)`}>
                <path d={`M${x},${y} L${x},${round(y + h * 0.9)} L${x - 4},${round(y + h * 0.9)} Z`} fill="#fff" opacity="0.3" className="sl-shimmer-facet" style={{ animationDelay: `${i * 0.3}s` }} />
                <circle cx={x} cy={y} r={i === 2 ? 3.2 : 2.4} fill={SPECTRUM[(i * 3) % 7]} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.35}s` }} />
              </g>
            </g>
          );
        })}
      </g>
      <Gem c={c} x={200} y={76} s={0.5} />
      {/* drifting refracted motes */}
      <g className="sl-twinkle">
        {[
          [58, 120],
          [344, 110],
          [40, 230],
          [362, 236],
          [110, 60],
          [292, 56],
        ].map(([x, y], i) => (
          <path key={x} d={`M${x},${y - 5} L${x + 2},${y} L${x},${y + 5} L${x - 2},${y} Z`} fill={SPECTRUM[(i * 2) % 7]} style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </g>
    </g>
  );
}

export const prismara: Renderer = {
  ...evolved,
  halo: [200, 22, 26],
  stageFit: [1.18, 1.08, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
