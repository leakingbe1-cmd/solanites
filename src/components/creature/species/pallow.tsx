import { blade, byStage, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Pallow — a floating pearl orb ringed by layered feathers, one ancient eye. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 70,
  halo: [200, 128, 30],
  render: (c) => {
    const { p, u, g } = c;
    // Each frond varies a little in length, width, angle and taper, so the rings read as feathers rather than identical spikes.
    const ring = (n: number, len: number, w: number, start: number, fill: string, from = 40) =>
      Array.from({ length: n }).map((_, i) => {
        const l = round(len * (0.84 + 0.16 * Math.sin(i * 2.4 + start)));
        const ww = round(w * (0.85 + 0.15 * Math.cos(i * 1.7)));
        const a = round(start + (i * 360) / n + 3 * Math.sin(i * 3.1));
        return <path key={i} d={blade(l, ww, i % 2 ? 0.72 : 0.84)} transform={`translate(200 200) rotate(${a}) translate(${from} 0)`} fill={fill} stroke={p.bodyDark} strokeOpacity="0.2" />;
      });
    const tl = 70 + 50 * g;
    return (
      <g>
        {/* hanging tassels */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 236px" }}>
          {[
            [76, tl * 0.85],
            [90, tl],
            [104, tl * 0.85],
          ].map(([a, l]) => {
            const [ex, ey] = polar(200, 236, l * 0.86, a);
            return (
              <g key={a}>
                <path d={blade(l, 8, 0.9)} transform={`translate(200 236) rotate(${a})`} fill={u("feather")} />
                <circle cx={ex} cy={ey} r="4.5" fill={p.accent} filter={u("glow")} />
              </g>
            );
          })}
        </g>
        <g className="sl-spin-slow" style={{ transformOrigin: "200px 200px" }} opacity="0.85">
          {ring(14, 60 + 70 * g, 13, -90 + 12.8, u("feather"), 36)}
        </g>
        <g className="sl-spin-rev" style={{ transformOrigin: "200px 200px" }}>
          {ring(10, 44 + 52 * g, 16, -90, u("wing"), 38)}
        </g>
        {ring(8, 30 + 40 * g, 13, -90 + 22.5, u("feather"), 42)}
        {/* orb */}
        <circle cx="200" cy="200" r="50" fill={u("body")} {...rim(c)} />
        <circle cx="200" cy="200" r="50" fill={u("shade")} />
        <path d="M160,222 C176,244 224,244 240,222 C228,236 172,236 160,222 Z" fill={p.belly} opacity="0.7" />
        <Spec x={182} y={176} rx={18} ry={9} o={0.45} />
        <path d="M184,190 C192,184 208,184 216,190" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Eye c={c} x={200} y={206} r={11} kind="round" />
        <path d="M194,224 L192,234 M206,224 L208,234" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" opacity={c.mark} />
        <Gem c={c} x={200} y={168} s={0.75} />
      </g>
    );
  },
};

/** A trailing tassel: a slim feather ending in a glowing bead. */
function tassel(c: Ctx, x: number, y: number, a: number, l: number, w: number, bead: number) {
  const [ex, ey] = polar(x, y, l * 0.88, a);
  return (
    <g key={`${x}${a}`}>
      <path d={blade(l, w, 0.9)} transform={`translate(${x} ${y}) rotate(${a})`} fill={c.u("feather")} stroke={c.p.bodyDark} strokeOpacity="0.18" />
      <circle cx={ex} cy={ey} r={bead} fill={c.p.accent} filter={c.u("glow")} className="sl-twinkle" />
    </g>
  );
}

/** Eggling: a small pearl wrapped in soft down, eyes still heavy with sleep. */
function eggling(c: Ctx) {
  const { p, u } = c;
  // A short, fuzzy fringe of down: many tiny rounded tufts, no true feathers yet.
  const down = Array.from({ length: 22 }).map((_, i) => {
    const a = round(-90 + (i * 360) / 22 + 4 * Math.sin(i * 2.3));
    const l = round(15 + 4 * Math.sin(i * 1.9));
    return <path key={i} d={blade(l, 7, 0.55)} transform={`translate(200 206) rotate(${a}) translate(34 0)`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.14" />;
  });
  return (
    <g>
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 240px" }}>
        {tassel(c, 192, 238, 96, 34, 6, 3.2)}
        {tassel(c, 208, 238, 84, 30, 6, 3.2)}
      </g>
      {down}
      <circle cx="200" cy="206" r="40" fill={u("body")} {...rim(c)} />
      <circle cx="200" cy="206" r="40" fill={u("shade")} />
      <path d="M170,224 C184,240 216,240 230,224 C218,234 182,234 170,224 Z" fill={p.belly} opacity="0.7" />
      {/* a tuft of down on the crown */}
      <g fill={p.bodyLight}>
        <circle cx="194" cy="167" r="6" />
        <circle cx="203" cy="164" r="7" />
        <circle cx="211" cy="168" r="5" />
      </g>
      <Spec x={186} y={186} rx={14} ry={7} o={0.45} />
      <Eye c={c} x={200} y={210} r={10} kind="lidded" />
      <ellipse cx="178" cy="222" rx="6" ry="3.5" fill={p.accent} opacity="0.22" />
      <ellipse cx="222" cy="222" rx="6" ry="3.5" fill={p.accent} opacity="0.22" />
      <Gem c={c} x={200} y={184} s={0.5} />
    </g>
  );
}

/** Hatchling: one uneven ring of soft first feathers, eyes open, two fronds sprouting. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  // Seven rounded feathers of uneven length, spaced unevenly like a fledgling's first coat.
  const feathers: [number, number][] = [
    [-150, 40],
    [-108, 30],
    [-36, 34],
    [6, 46],
    [46, 38],
    [134, 40],
    [178, 48],
  ];
  return (
    <g>
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 244px" }}>
        {tassel(c, 186, 240, 100, 48, 7, 3.6)}
        {tassel(c, 200, 244, 90, 58, 7.5, 4)}
        {tassel(c, 214, 240, 80, 48, 7, 3.6)}
      </g>
      {feathers.map(([a, l]) => (
        <g key={a} transform={`translate(200 204) rotate(${a}) translate(36 0)`}>
          <path d={blade(l, 15, 0.62)} fill={u("feather")} {...rim(c, 1)} />
          <path d={`M4,0 C${round(l * 0.4)},1 ${round(l * 0.7)},1 ${round(l * 0.92)},0`} fill="none" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1" />
        </g>
      ))}
      {/* two upright fronds */}
      <g className="sl-sway" style={{ transformOrigin: "200px 162px" }}>
        <path d={blade(34, 8, 0.85)} transform="translate(194 164) rotate(-104)" fill={u("wing")} {...rim(c, 1)} />
        <path d={blade(28, 7, 0.85)} transform="translate(206 164) rotate(-72)" fill={u("wing")} {...rim(c, 1)} />
      </g>
      <circle cx="200" cy="204" r="44" fill={u("body")} {...rim(c)} />
      <circle cx="200" cy="204" r="44" fill={u("shade")} />
      <path d="M166,224 C182,244 218,244 234,224 C222,236 178,236 166,224 Z" fill={p.belly} opacity="0.7" />
      <Spec x={184} y={182} rx={16} ry={8} o={0.45} />
      <path d="M186,194 C194,189 206,189 214,194" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <Eye c={c} x={200} y={209} r={11} kind="round" />
      <Gem c={c} x={200} y={174} s={0.6} />
    </g>
  );
}

/** Ascended: a seraph of layered wing-fans, a plumed crown and a circlet of light. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // One wing-fan (left side): three tiers of feathers sweeping out horizontally.
  const tiers = [
    { n: 6, l: 128, w: 15, a0: 160, a1: 214, fill: u("feather"), o: 0.9 },
    { n: 5, l: 100, w: 16, a0: 166, a1: 206, fill: u("wing"), o: 1 },
    { n: 4, l: 66, w: 15, a0: 172, a1: 200, fill: u("feather"), o: 1 },
  ];
  const fan = (side: string) => (
    <g key={side} transform={side === "r" ? MIRROR : undefined}>
      <g className="sl-sway-slow" style={{ transformOrigin: "166px 206px" }}>
        {tiers.map((t, k) =>
          Array.from({ length: t.n }).map((_, i) => {
            const a = round(t.a0 + ((t.a1 - t.a0) * i) / (t.n - 1));
            const l = round(t.l * (0.86 + 0.14 * Math.sin(i * 1.3 + k)));
            return (
              <g key={`${k}-${i}`} transform={`translate(166 206) rotate(${a})`} opacity={t.o}>
                <path d={blade(l, t.w, 0.8)} fill={t.fill} stroke={p.bodyDark} strokeOpacity="0.24" />
                <path d={`M6,0 C${round(l * 0.4)},1 ${round(l * 0.7)},1 ${round(l * 0.95)},0`} fill="none" stroke={p.bodyDark} strokeOpacity="0.22" strokeWidth="1" />
              </g>
            );
          }),
        )}
        {/* glowing edge on the outer tier */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = 160 + (54 * i) / 5;
          const [x, y] = polar(166, 206, round(128 * (0.86 + 0.14 * Math.sin(i * 1.3))) - 6, a);
          return <circle key={i} cx={x} cy={y} r="2.4" fill={p.accent} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />;
        })}
      </g>
    </g>
  );
  const plumes: [number, number, number][] = [
    [-132, 52, 9],
    [-110, 66, 10],
    [-90, 76, 11],
    [-70, 66, 10],
    [-48, 52, 9],
  ];
  return (
    <g>
      {/* long trailing tassels */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 250px" }}>
        {tassel(c, 180, 246, 108, 82, 7, 4)}
        {tassel(c, 192, 252, 96, 104, 8, 4.6)}
        {tassel(c, 208, 252, 84, 104, 8, 4.6)}
        {tassel(c, 220, 246, 72, 82, 7, 4)}
      </g>
      {fan("l")}
      {fan("r")}
      {/* crown of five plumes */}
      <g className="sl-sway" style={{ transformOrigin: "200px 166px" }}>
        {plumes.map(([a, l, w]) => {
          const [ex, ey] = polar(200, 172, l * 0.9, a);
          return (
            <g key={a}>
              <path d={blade(l, w, 0.82)} transform={`translate(200 172) rotate(${a})`} fill={a === -90 ? u("wing") : u("feather")} {...rim(c, 1)} />
              <circle cx={ex} cy={ey} r="3" fill={p.accent} filter={u("glow")} />
            </g>
          );
        })}
      </g>
      {/* orb */}
      <circle cx="200" cy="208" r="48" fill={u("body")} {...rim(c)} />
      <circle cx="200" cy="208" r="48" fill={u("shade")} />
      <path d="M162,230 C178,252 222,252 238,230 C226,244 174,244 162,230 Z" fill={p.belly} opacity="0.75" />
      {/* ornamental circlet: back half behind the crown jewel, a thin bright ring */}
      <ellipse cx="200" cy="176" rx="42" ry="9" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.85" filter={u("glow")} />
      <ellipse cx="200" cy="176" rx="42" ry="9" fill="none" stroke="#fff" strokeWidth="0.9" opacity="0.8" />
      {[-30, -15, 15, 30].map((dx) => (
        <circle key={dx} cx={200 + dx} cy={round(176 + 9 * Math.sqrt(1 - (dx / 42) ** 2))} r="2" fill="#fff" />
      ))}
      <Spec x={182} y={190} rx={16} ry={8} o={0.45} />
      <path d="M184,200 C192,195 208,195 216,200" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Eye c={c} x={200} y={214} r={11.5} kind="almond" />
      <path d="M190,232 L188,242 M200,234 L200,245 M210,232 L212,242" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" />
      <Gem c={c} x={200} y={184} s={0.8} />
    </g>
  );
}

export const pallow: Renderer = {
  ...evolved,
  halo: [200, 70, 26],
  stageFit: [1.45, 1.2, 1, 1.03],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
