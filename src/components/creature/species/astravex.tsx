import { blade, Constellation, Eye, Gem, rim, round, Spec, type Renderer } from "../kit";

/** Astravex — a platinum stag whose antlers are constellations. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 110,
  halo: [314, 36, 28],
  render: (c) => {
    const { p, u, g, id } = c;
    const body = "M128,238 C130,210 166,198 214,200 C252,202 278,210 286,228 C292,244 284,262 270,270 C250,280 214,280 180,276 C150,272 128,262 128,238 Z";
    const s = 0.55 + 0.45 * g;
    // Deer legs: tapered, with a knee (front) or hock (back) and a small hoof.
    const leg = (x: number, back: boolean, near: boolean) => (
      <g key={`${x}${near}`}>
        <path
          d={
            back
              ? `M${x - 10},252 C${x - 14},276 ${x - 2},292 ${x - 4},310 C${x - 5},324 ${x - 6},336 ${x - 6},344 L${x + 3},344 C${x + 3},334 ${x + 5},322 ${x + 7},306 C${x + 10},288 ${x + 10},268 ${x + 8},252 Z`
              : `M${x - 7},256 C${x - 8},276 ${x - 6},292 ${x - 5},304 C${x - 5},318 ${x - 4},332 ${x - 4},344 L${x + 4},344 C${x + 4},332 ${x + 5},318 ${x + 5},304 C${x + 6},290 ${x + 8},274 ${x + 8},256 Z`
          }
          fill={near ? u("body") : p.bodyDark}
          {...(near ? rim(c, 1) : {})}
        />
        <path d={`M${x - (back ? 7 : 5)},342 L${x + (back ? 4 : 5)},342 L${x + (back ? 5 : 6)},352 L${x - (back ? 8 : 6)},352 Z`} fill={near ? p.accent : p.bodyDark} opacity={near ? 0.85 : 1} />
      </g>
    );
    return (
      <g>
        <defs>
          <radialGradient id={`${id}-flankfade`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.45" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id={`${id}-flank`} maskUnits="userSpaceOnUse" x="120" y="190" width="180" height="100">
            <ellipse cx="204" cy="240" rx="66" ry="30" fill={`url(#${id}-flankfade)`} />
          </mask>
        </defs>
        {leg(152, true, false)}
        {leg(270, false, false)}
        {/* wispy tail */}
        <path d="M132,228 C108,220 96,236 92,254 C104,246 118,244 130,246 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" className="sl-sway" style={{ transformOrigin: "132px 236px" }} />
        {/* body; the star-field is a soft window that fades into the coat */}
        <path d={body} fill={u("body")} {...rim(c)} />
        <g mask={`url(#${id}-flank)`}>
          <ellipse cx="204" cy="240" rx="70" ry="34" fill={p.accent} opacity="0.32" />
          <ellipse cx="186" cy="234" rx="40" ry="18" fill={p.wingEdge} opacity="0.35" />
          <rect x="130" y="200" width="150" height="80" fill={u("stars")} className="sl-twinkle" />
        </g>
        <Spec x={206} y={208} rx={52} ry={5} rot={-2} o={0.4} />
        {leg(140, true, true)}
        {leg(260, false, true)}
        {/* flowing mane */}
        <g className="sl-sway-slow" style={{ transformOrigin: "282px 172px" }}>
          <path d="M298,146 C276,160 262,190 238,206 C268,206 286,186 302,166 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.6" />
          <path d="M292,170 C270,186 258,214 234,226 C264,224 282,204 298,186 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.4" />
        </g>
        {/* neck & head */}
        <path d="M254,222 C262,192 276,164 290,144 L312,150 C304,176 296,206 290,234 C280,240 262,236 254,222 Z" fill={u("body")} {...rim(c)} />
        <path d="M262,224 C270,200 280,176 292,156" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
        <path d={blade(28, 8)} transform="translate(300 132) rotate(-150)" fill={u("body")} {...rim(c, 1)} />
        <path d="M288,138 C298,124 318,122 330,130 C344,140 354,154 352,164 C346,170 332,166 318,160 C304,158 290,150 288,138 Z" fill={u("body")} {...rim(c)} />
        <path d="M336,150 C344,154 350,160 351,165 C344,168 334,164 328,160 Z" fill={p.belly} opacity="0.6" />
        <Spec x={312} y={128} rx={14} ry={4} rot={10} o={0.45} />
        <circle cx="350" cy="162" r="2.4" fill={p.bodyDark} />
        <Eye c={c} x={316} y={140} r={5} kind="orb" />
        {/* constellation antlers */}
        <g className="sl-sway-slow" style={{ transformOrigin: "306px 126px" }}>
          <g transform={`translate(306 126) scale(${s}) translate(-306 -126)`}>
            <Constellation c={c} pts={[[306, 126], [298, 96], [282, 72], [270, 48]]} />
            <Constellation c={c} pts={[[298, 96], [314, 74], [322, 50]]} />
            <Constellation c={c} pts={[[282, 72], [262, 66], [248, 74]]} />
            <Constellation c={c} pts={[[318, 124], [334, 100], [350, 86], [366, 82]]} />
            <Constellation c={c} pts={[[334, 100], [340, 76]]} />
          </g>
        </g>
        <Gem c={c} x={276} y={222} s={0.55} />
      </g>
    );
  },
};

export const astravex: Renderer = evolved;
