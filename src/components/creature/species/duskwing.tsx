import { byStage, Dots, Eye, Gem, MIRROR, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Duskwing — a velvet moth with four eye-spotted wings and feathered antennae. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  shadow: 110,
  halo: [200, 96, 30],
  render: (c) => {
    const { p, u, g } = c;
    const ws = 0.7 + 0.3 * g;
    const wing = (
      <g transform={`translate(196 206) scale(${ws}) translate(-196 -206)`}>
        <g className="sl-flap" style={{ transformOrigin: "196px 206px" }}>
          <path d="M196,214 C160,226 108,250 94,292 C88,318 120,328 146,308 C170,288 188,254 200,228 Z" fill={u("wing")} {...rim(c)} />
          <path d="M196,190 C150,118 78,98 44,128 C26,148 50,198 96,214 C130,224 170,216 196,206 Z" fill={u("wing")} {...rim(c)} />
          <path d="M196,198 C160,170 110,140 62,134 M196,202 C150,196 110,196 72,190 M196,220 C170,250 140,276 112,296" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.4" />
          <path d="M44,128 C26,148 50,198 96,214 C130,224 170,216 196,206" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeDasharray="3 5" strokeOpacity="0.8" />
          <g opacity={0.5 + c.mark * 0.5}>
            <circle cx="104" cy="160" r="22" fill={p.bodyDark} />
            <circle cx="104" cy="160" r="16" fill={p.accent} opacity="0.85" />
            <circle cx="104" cy="160" r="9" fill={p.bodyDark} />
            <circle cx="100" cy="155" r="3" fill="#fff" />
            <circle cx="134" cy="286" r="10" fill={p.bodyDark} />
            <circle cx="134" cy="286" r="6" fill={p.accent} opacity="0.85" />
          </g>
        </g>
      </g>
    );
    return (
      <g>
        {wing}
        <g transform={MIRROR}>{wing}</g>
        {/* antennae */}
        {[1, -1].map((s) => (
          <g key={s} transform={s < 0 ? MIRROR : undefined} fill="none" stroke={p.horn} strokeLinecap="round">
            <path d={`M194,154 C186,${130 - 20 * g} 170,${110 - 24 * g} 152,${100 - 26 * g}`} strokeWidth="2.2" />
            {[0.3, 0.5, 0.7, 0.9].map((t) => {
              const x = 194 - 42 * t;
              const y = 154 - (54 + 26 * g) * t;
              return <path key={t} d={`M${x},${y} l-8,-5 M${x},${y} l4,-9`} strokeWidth="1.2" />;
            })}
          </g>
        ))}
        {/* abdomen */}
        <ellipse cx="200" cy="252" rx="16" ry="38" fill={u("body")} {...rim(c)} />
        {[232, 246, 260, 274].map((y) => (
          <path key={y} d={`M186,${y} C194,${y + 4} 206,${y + 4} 214,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" />
        ))}
        {/* furry thorax */}
        <ellipse cx="200" cy="200" rx="25" ry="30" fill={u("body")} />
        <ellipse cx="200" cy="200" rx="25" ry="30" fill="none" stroke={p.bodyLight} strokeWidth="5" strokeDasharray="2 3" opacity="0.55" />
        <Spec x={192} y={186} rx={10} ry={6} o={0.25} />
        {/* head */}
        <circle cx="200" cy="164" r="19" fill={u("body")} {...rim(c)} />
        <Eye c={c} x={188} y={164} r={6.5} kind="compound" />
        <Eye c={c} x={212} y={164} r={6.5} kind="compound" />
        <Gem c={c} x={200} y={204} s={0.65} />
      </g>
    );
  },
};


/** Eggling: a fuzzy, upright larva-moth with stubby wing buds and pom-pom antennae. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const fuzz = (cx: number, cy: number, rx: number, ry: number) => (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u("body")} {...rim(c)} />
      <ellipse cx={cx} cy={cy} rx={rx - 2} ry={ry - 2} fill="none" stroke={p.bodyLight} strokeWidth="4" strokeDasharray="2 3" opacity="0.5" />
    </>
  );
  const side = (
    <g>
      {/* wing bud */}
      <path d={`M176,214 C160,204 146,210 146,222 C146,234 162,238 178,228 Z`} fill={u("wing")} {...rim(c, 1)} />
      <circle cx="156" cy="222" r="3.5" fill={p.accent} opacity="0.6" />
      {/* stubby legs */}
      {[238, 254].map((y) => (
        <ellipse key={y} cx="172" cy={y} rx="7" ry="4.5" fill={p.bodyLight} transform={`rotate(-20 172 ${y})`} />
      ))}
      {/* pom-pom antenna */}
      <path d="M188,150 C182,138 176,130 168,124" fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round" />
      <circle cx="166" cy="121" r="8" fill={p.bodyLight} />
      <circle cx="164" cy="119" r="3" fill="#fff" opacity="0.45" />
    </g>
  );
  return (
    <g>
      {side}
      <g transform={MIRROR}>{side}</g>
      {fuzz(200, 266, 28, 22)}
      {fuzz(200, 234, 34, 26)}
      {[252, 282].map((y) => (
        <path key={y} d={`M178,${y} C192,${y + 5} 208,${y + 5} 222,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.5" />
      ))}
      {/* fluffy collar */}
      <g fill={p.belly} opacity="0.85">
        {[170, 184, 200, 216, 230].map((x, i) => (
          <circle key={x} cx={x} cy={i === 2 ? 214 : 210} r={9} />
        ))}
      </g>
      <circle cx="200" cy="176" r="40" fill={u("body")} {...rim(c)} />
      <circle cx="200" cy="176" r="38" fill="none" stroke={p.bodyLight} strokeWidth="4" strokeDasharray="2 3" opacity="0.4" />
      <Spec x={190} y={152} rx={18} ry={7} o={0.25} />
      <ellipse cx="174" cy="194" rx="7" ry="4" fill={p.eye} opacity="0.35" />
      <ellipse cx="226" cy="194" rx="7" ry="4" fill={p.eye} opacity="0.35" />
      <Eye c={c} x={184} y={178} r={11} kind="round" />
      <Eye c={c} x={216} y={178} r={11} kind="round" />
      <path d="M194,198 C198,202 202,202 206,198" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      <Gem c={c} x={200} y={238} s={0.55} />
    </g>
  );
}

/** Hatchling: a small moth whose first wings have just unfolded, still soft and crumpled. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const side = (
    <g>
      <g className="sl-flap" style={{ transformOrigin: "196px 206px" }}>
        {/* small rounded hindwing */}
        <path d="M194,214 C176,220 150,232 144,252 C140,268 156,274 168,264 C180,254 190,238 198,226 Z" fill={u("wing")} {...rim(c)} />
        {/* crumpled forewing: wavy trailing edge */}
        <path d="M196,196 C176,166 146,144 116,146 C104,148 100,160 106,170 C102,178 110,186 116,186 C114,196 124,202 132,200 C136,210 150,212 160,208 C172,212 186,210 196,206 Z" fill={u("wing")} {...rim(c)} />
        <path d="M196,198 C176,180 150,164 124,158 M196,203 C170,198 146,192 126,186" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M106,170 C102,178 110,186 116,186 C114,196 124,202 132,200 C136,210 150,212 160,208" fill="none" stroke={p.wingEdge} strokeWidth="2" strokeOpacity="0.6" />
        {/* first eye-spot */}
        <g opacity={0.6}>
          <circle cx="134" cy="168" r="10" fill={p.bodyDark} />
          <circle cx="134" cy="168" r="6.5" fill={p.accent} opacity="0.8" />
          <circle cx="134" cy="168" r="3" fill={p.bodyDark} />
        </g>
      </g>
      {/* dangling legs */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M190,${214 + i * 10} C${182 - i * 2},${226 + i * 10} ${178 - i * 2},${236 + i * 10} ${180 - i * 3},${246 + i * 10}`} fill="none" stroke={p.horn} strokeWidth="2.2" strokeLinecap="round" />
      ))}
      {/* antenna with a few short barbs */}
      <g fill="none" stroke={p.horn} strokeLinecap="round">
        <path d="M192,152 C184,132 174,118 160,108" strokeWidth="2.2" stroke={p.bodyLight} />
        {[0.4, 0.65, 0.88].map((t) => {
          const x = round(192 - 32 * t);
          const y = round(152 - 44 * t);
          return <path key={t} d={`M${x},${y} l-6,-3`} strokeWidth="1.2" stroke={p.bodyLight} />;
        })}
      </g>
    </g>
  );
  return (
    <g>
      {side}
      <g transform={MIRROR}>{side}</g>
      <ellipse cx="200" cy="248" rx="14" ry="28" fill={u("body")} {...rim(c)} />
      {[236, 250, 264].map((y) => (
        <path key={y} d={`M188,${y} C195,${y + 3} 205,${y + 3} 212,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.3" />
      ))}
      <ellipse cx="200" cy="204" rx="22" ry="25" fill={u("body")} />
      <ellipse cx="200" cy="204" rx="22" ry="25" fill="none" stroke={p.bodyLight} strokeWidth="5" strokeDasharray="2 3" opacity="0.55" />
      <Spec x={194} y={192} rx={8} ry={5} o={0.25} />
      <circle cx="200" cy="168" r="22" fill={u("body")} {...rim(c)} />
      <Spec x={194} y={156} rx={10} ry={4} o={0.25} />
      <Eye c={c} x={190} y={170} r={8} kind="round" />
      <Eye c={c} x={210} y={170} r={8} kind="round" />
      <Gem c={c} x={200} y={208} s={0.55} />
    </g>
  );
}

/** Ascended: a twilight sentinel with vast tailed wings, a fur mane and plumed antennae. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const spot = (x: number, y: number, r: number) => (
    <g key={`${x}${y}`}>
      <circle cx={x} cy={y} r={r * 1.4} fill={p.bodyDark} />
      <circle cx={x} cy={y} r={r} fill={p.accent} filter={u("glow")} className="sl-rune-pulse" />
      <circle cx={x} cy={y} r={r * 0.75} fill={p.eye} opacity="0.8" />
      <circle cx={x} cy={y} r={r * 0.42} fill={p.bodyDark} />
      <circle cx={round(x - r * 0.2)} cy={round(y - r * 0.25)} r={round(r * 0.14)} fill="#fff" />
    </g>
  );
  // Scalloped forewing edge.
  const scallops = [
    [44, 70],
    [42, 98],
    [50, 126],
    [64, 152],
    [84, 174],
    [110, 192],
    [140, 204],
  ];
  const side = (
    <g>
      <g className="sl-flap" style={{ transformOrigin: "196px 206px" }}>
        {/* hindwing sweeping into a long trailing tail */}
        <path d="M196,216 C166,230 128,252 116,286 C110,310 118,336 108,372 C128,352 144,326 150,302 C168,278 186,250 200,232 Z" fill={u("wing")} {...rim(c)} />
        <path d="M196,220 C170,240 142,262 130,292 M196,226 C176,252 160,280 150,302" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M116,286 C110,310 118,336 108,372" fill="none" stroke={p.wingEdge} strokeWidth="2.5" strokeOpacity="0.7" />
        {/* great raised forewing */}
        <path d="M196,194 C176,130 120,70 46,58 C34,80 38,140 66,170 C100,206 156,214 196,208 Z" fill={u("wing")} {...rim(c)} />
        <path d="M66,170 C100,206 156,214 196,208 L196,194 C160,196 110,186 74,160 Z" fill={p.accent} opacity="0.18" />
        <path d="M196,198 C160,150 112,104 60,78 M196,202 C150,180 104,158 52,130 M196,205 C150,200 110,190 76,166" fill="none" stroke={p.bodyDark} strokeOpacity="0.38" strokeWidth="1.3" />
        <g fill={p.wingEdge} opacity="0.85">
          {scallops.map(([x, y]) => (
            <circle key={y} cx={x} cy={y} r="3.2" />
          ))}
        </g>
        <path d="M46,58 C34,80 38,140 66,170 C100,206 156,214 196,208" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeDasharray="3 5" strokeOpacity="0.85" />
        <g opacity={0.6 + c.mark * 0.4}>
          {spot(108, 124, 17)}
          {spot(156, 180, 8)}
          {spot(140, 288, 9)}
        </g>
      </g>
      {/* plumed antenna */}
      <g fill="none" stroke={p.belly} strokeOpacity="0.9" strokeLinecap="round">
        <path d="M192,142 C180,108 162,80 136,60" strokeWidth="2.6" />
        {[0.15, 0.27, 0.39, 0.51, 0.63, 0.75, 0.87].map((t) => {
          const x = round(192 - 56 * t);
          const y = round(142 - 82 * t);
          return <path key={t} d={`M${x},${y} l-11,-2 M${x},${y} l5,-11`} strokeWidth="1.4" />;
        })}
      </g>
      <circle cx="136" cy="60" r="3" fill={p.accent} filter={u("glow")} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M190,${222 + i * 12} C${180 - i * 2},${232 + i * 12} ${176 - i * 2},${242 + i * 12} ${178 - i * 3},${254 + i * 12}`} fill="none" stroke={p.horn} strokeWidth="2.4" strokeLinecap="round" />
      ))}
    </g>
  );
  return (
    <g>
      {side}
      <g transform={MIRROR}>{side}</g>
      <ellipse cx="200" cy="262" rx="17" ry="44" fill={u("body")} {...rim(c)} />
      {[230, 246, 262, 278, 294].map((y) => (
        <path key={y} d={`M185,${y} C194,${y + 4} 206,${y + 4} 215,${y}`} fill="none" stroke={p.accent} strokeOpacity="0.5" strokeWidth="1.4" />
      ))}
      <ellipse cx="200" cy="204" rx="27" ry="32" fill={u("body")} />
      <ellipse cx="200" cy="204" rx="27" ry="32" fill="none" stroke={p.bodyLight} strokeWidth="5" strokeDasharray="2 3" opacity="0.55" />
      {/* fur mane around the neck */}
      <g fill={p.bodyLight} opacity="0.75">
        {[-40, -20, 0, 20, 40].map((a) => {
          const x = round(200 + Math.sin((a * Math.PI) / 180) * 28);
          return <path key={a} d={blade_tuft(x, 184, a)} />;
        })}
      </g>
      <circle cx="200" cy="158" r="21" fill={u("body")} {...rim(c)} />
      <Spec x={194} y={146} rx={9} ry={4} o={0.3} />
      <Eye c={c} x={188} y={160} r={7} kind="compound" />
      <Eye c={c} x={212} y={160} r={7} kind="compound" />
      <Gem c={c} x={200} y={212} s={0.75} />
      <Dots c={c} pts={[[86, 236], [314, 236], [60, 210], [340, 206], [166, 330], [234, 330], [92, 330], [308, 330]]} r={1.8} color={p.wingEdge} />
    </g>
  );
}

/** A soft fur tuft hanging from (x, y), leaning by `a` degrees. */
function blade_tuft(x: number, y: number, a: number) {
  const dx = round(a * 0.15);
  return `M${x - 8},${y} C${x - 8},${y + 12} ${x + dx - 3},${y + 20} ${x + dx},${y + 26} C${x + dx + 3},${y + 20} ${x + 8},${y + 12} ${x + 8},${y} Z`;
}

export const duskwing: Renderer = {
  ...evolved,
  halo: [200, 100, 24],
  stageFit: [1.45, 1.2, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
