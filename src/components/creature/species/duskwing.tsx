import { Eye, Gem, MIRROR, rim, round, Spec, type Renderer } from "../kit";

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

export const duskwing: Renderer = evolved;
