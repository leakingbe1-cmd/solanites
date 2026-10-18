import { Eye, Gem, rim, round, Spec, Tube, type Renderer } from "../kit";

/** Vael — a ribbon serpent rising from its coils on a long swan neck. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 120,
  halo: [150, 76, 30],
  render: (c) => {
    const { p, u, g } = c;
    const neckTop = 128 - 20 * (g - 1);
    return (
      <g transform="translate(0 -16)">
        {/* trailing ribbons */}
        <g className="sl-sway-slow" style={{ transformOrigin: "318px 334px" }}>
          <path d="M318,334 C352,318 372,296 396,300 C380,314 360,330 326,346 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
          <path d="M318,340 C348,340 372,330 392,338 C374,348 352,354 324,352 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.4" />
        </g>
        <Tube c={c} w={34} belly d="M318,334 C372,336 366,374 300,374 C230,374 168,362 158,334 C150,306 196,296 230,306" />
        {/* glowing veins */}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.6" fill="none" strokeLinecap="round" className="sl-rune-pulse">
          <path d="M200,352 C230,358 270,360 300,356 M180,330 C188,318 204,312 220,312" />
        </g>
        {/* neck, crest and head sway together as one serpentine motion */}
        <g className="sl-sway-slow" style={{ transformOrigin: "230px 306px" }}>
          {/* head crest trailing back */}
          <path
            d={`M190,${neckTop - 20} C224,${neckTop - 40} 270,${neckTop - 30} ${300 + 20 * g},${neckTop + 4} C266,${neckTop - 6} 234,${neckTop - 6} 200,${neckTop - 6} Z`}
            fill={u("fin")}
            stroke={p.wingEdge}
            strokeOpacity="0.6"
            className="sl-sway-slow"
            style={{ transformOrigin: `200px ${neckTop}px` }}
          />
          {/* neck fin ribbon */}
          <path d="M262,236 C290,256 316,262 344,250 C318,280 284,280 256,262 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
          <Tube c={c} w={22} belly d={`M222,306 C262,320 272,270 254,224 C240,188 212,${neckTop + 34} 194,${neckTop + 6}`} />
          <path d="M250,262 C256,246 254,232 248,218" fill="none" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" opacity={c.mark} filter={u("glow")} className="sl-rune-pulse" />
          {/* narrow elongated head */}
          <g transform={`translate(0 ${neckTop - 128})`}>
            <path d="M204,134 C200,112 178,100 150,104 C128,108 106,116 92,124 C106,132 132,136 160,138 C178,140 196,140 204,134 Z" fill={u("body")} {...rim(c)} />
            <path d="M94,124 C110,130 136,134 162,136 C178,138 194,138 202,134 L196,142 C170,146 128,140 96,128 Z" fill={p.belly} opacity="0.8" />
            <Spec x={160} y={110} rx={22} ry={4} rot={-6} o={0.35} />
            <Eye c={c} x={162} y={116} r={5.5} kind="slit" flip angle={-6} />
            <Gem c={c} x={184} y={110} s={0.45} />
          </g>
        </g>
      </g>
    );
  },
};

export const vael: Renderer = evolved;
