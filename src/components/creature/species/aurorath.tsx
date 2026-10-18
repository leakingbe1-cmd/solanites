import { Eye, Gem, rim, round, Spec, type Renderer } from "../kit";

/** Aurorath — a sky whale trailing curtains of aurora beneath its belly. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  fit: 0.98,
  shadow: 150,
  halo: [120, 96, 34],
  render: (c) => {
    const { p, u, g } = c;
    const curtain = 40 + 70 * g;
    return (
      <g transform="translate(0 -14)">
        {/* aurora curtains */}
        {[96, 140, 184, 228, 272, 312].map((x, i) => {
          const len = curtain * (1 - Math.abs(i - 2.5) * 0.08);
          return (
            <path
              key={x}
              d={`M${x},230 C${x + 10},${250 + len * 0.3} ${x - 12},${250 + len * 0.6} ${x + 6},${246 + len} L${x + 28},${244 + len * 0.95} C${x + 14},${250 + len * 0.55} ${x + 34},${250 + len * 0.3} ${x + 26},230 Z`}
              fill={i % 2 ? u("veil") : u("veil2")}
              opacity={0.75 + 0.25 * c.mark}
              className="sl-sway-slow"
              style={{ transformOrigin: `${x}px 230px`, animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
        {/* flukes */}
        <g className="sl-sway-slow" style={{ transformOrigin: "352px 204px" }}>
          <path d="M350,198 C366,170 388,156 398,158 C392,176 378,192 362,204 C378,214 392,232 396,250 C384,248 364,232 348,214 Z" fill={u("body")} {...rim(c)} />
        </g>
        {/* body */}
        <path d="M40,196 C40,146 110,116 200,122 C290,128 338,164 352,192 C358,204 360,212 352,222 C330,248 270,268 200,266 C110,264 40,246 40,196 Z" fill={u("body")} {...rim(c)} />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${70 + k * 4},${224 + k * 9} C${130},${248 + k * 7} ${230},${252 + k * 5} ${320 - k * 10},${230 + k * 5}`} fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="2" />
        ))}
        <g opacity={c.mark} fill="none" strokeLinecap="round" filter={u("glow")}>
          <path d="M120,138 C180,124 250,132 310,160" stroke={p.accent} strokeWidth="3" opacity="0.6" />
          <path d="M150,150 C200,142 250,148 300,170" stroke={p.wingEdge} strokeWidth="2" opacity="0.6" />
        </g>
        <Spec x={170} y={140} rx={70} ry={10} rot={-4} o={0.2} />
        {/* pectoral fin */}
        <path d="M150,240 C158,280 188,302 220,302 C202,284 192,264 192,246 Z" fill={u("body")} {...rim(c)} />
        <path d="M44,210 C72,220 112,220 142,210" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <Eye c={c} x={96} y={194} r={6} kind="lidded" />
        <Gem c={c} x={120} y={150} s={0.65} />
      </g>
    );
  },
};

export const aurorath: Renderer = evolved;
