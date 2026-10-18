import { blade, byStage, Dots, Eye, Gem, rim, round, Spec, Tube, type Ctx, type Renderer } from "../kit";

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

/** Eggling: a plump coiled serpentling with a short neck, big round head and a crest bud. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* tail tip with a ribbon bud */}
      <path d={blade(20, 6)} transform="translate(316 322) rotate(-58)" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
      <Tube c={c} w={32} belly d="M316,324 C306,342 282,350 248,350 C198,352 156,344 160,322 C164,300 214,294 248,304" />
      <path d="M188,340 C214,346 252,346 282,338" fill="none" stroke={p.accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" filter={u("glow")} className="sl-rune-pulse" />
      {/* short neck */}
      <Tube c={c} w={26} belly d="M246,306 C222,300 206,288 200,266" />
      {/* crest bud */}
      <g className="sl-sway-slow" style={{ transformOrigin: "206px 214px" }}>
        <path d="M200,210 C214,198 230,198 240,206 C228,208 216,214 208,222 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      </g>
      {/* big round head */}
      <path d="M216,244 C216,218 196,204 172,204 C146,204 128,220 126,240 C114,244 108,252 112,260 C118,272 140,276 166,276 C196,276 216,266 216,244 Z" fill={u("body")} {...rim(c)} />
      <path d="M112,258 C124,268 150,272 176,270 C196,268 208,262 214,252 C210,270 192,280 166,280 C138,280 116,272 112,258 Z" fill={p.belly} opacity="0.75" />
      <Spec x={170} y={214} rx={22} ry={6} rot={-8} o={0.32} />
      <ellipse cx="118" cy="252" rx="2.2" ry="1.6" fill={p.bodyDark} />
      <path d="M124,264 C134,268 146,268 154,264" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <Eye c={c} x={162} y={238} r={11} kind="round" />
      <Gem c={c} x={196} y={222} s={0.42} />
    </g>
  );
}

/** Hatchling: two loose coils, a rising neck, a growing crest and its first ribbon fins. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <g className="sl-sway-slow" style={{ transformOrigin: "336px 318px" }}>
        <path d="M336,318 C350,300 362,288 378,284 C374,302 360,318 340,328 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
        <path d="M338,324 C356,320 370,322 382,330 C366,338 352,338 340,334 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.4" />
      </g>
      <Tube c={c} w={26} belly d="M336,322 C326,346 296,358 262,356 C230,354 210,346 190,348 C168,350 160,336 176,326 C192,316 214,316 230,320" />
      <g opacity="0.8" filter={u("glow")} stroke={p.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" className="sl-rune-pulse">
        <path d="M232,352 C260,358 294,352 316,340 M182,338 C190,330 204,326 216,326" />
      </g>
      <g className="sl-sway-slow" style={{ transformOrigin: "232px 318px" }}>
        {/* small neck fin */}
        <path d="M252,286 C268,290 282,288 294,280 C284,298 266,300 250,296 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
        <Tube c={c} w={20} belly d="M228,318 C258,322 264,292 250,270 C240,256 226,248 212,244" />
        <path d="M254,300 C258,290 256,280 250,272" fill="none" stroke={p.accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" filter={u("glow")} className="sl-rune-pulse" />
        {/* young head: big, rounded, tilted up and curious */}
        <g transform="rotate(-16 176 232) translate(176 232) scale(1.22) translate(-170 -206)">
          <path d="M200,194 C220,182 244,184 260,198 C242,198 224,200 208,206 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" className="sl-sway-slow" style={{ transformOrigin: "204px 200px" }} />
          <path d="M214,214 C212,194 194,184 170,186 C150,188 134,196 124,206 C134,218 156,224 176,226 C196,228 212,224 214,214 Z" fill={u("body")} {...rim(c)} />
          <path d="M126,208 C140,216 160,220 180,222 C196,224 208,222 212,218 L206,228 C184,232 150,226 128,212 Z" fill={p.belly} opacity="0.8" />
          <Spec x={172} y={194} rx={18} ry={4} rot={-6} o={0.35} />
          <Eye c={c} x={176} y={204} r={8} kind="round" />
          <Gem c={c} x={198} y={198} s={0.38} />
        </g>
      </g>
    </g>
  );
}

/** Ascended: the trench guardian — towering neck, crown crest, cobra-hood frills and silk ribbons. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const crown = [-118, -96, -74, -52, -30];
  return (
    <g>
      {/* deep-sea particles */}
      <Dots c={c} r={1.6} color={p.eye} pts={[[60, 200], [88, 300], [44, 120], [330, 92], [362, 200], [300, 60], [112, 248]]} />
      {/* silk ribbons trailing from the tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "332px 330px" }}>
        <path d="M332,326 C350,296 370,276 392,262 C384,290 366,316 338,340 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.55" />
        <path d="M334,334 C360,320 380,316 396,320 C382,334 362,344 338,348 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.45" />
        <path d="M330,342 C352,352 372,362 390,374 C366,374 344,366 326,354 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.35" />
      </g>
      {/* far hood frill */}
      <path d="M244,206 C214,190 192,166 186,140 C214,150 240,170 258,196 Z" fill={p.bodyDark} opacity="0.75" />
      {/* great coil */}
      <Tube c={c} w={36} belly d="M332,328 C380,334 376,356 322,356 L200,356 C138,356 118,332 148,312 C174,296 228,298 250,310" />
      <g filter={u("glow")} stroke={p.accent} strokeWidth="2" fill="none" strokeLinecap="round" className="sl-rune-pulse">
        <path d="M168,342 C210,350 270,350 320,344 M158,318 C170,306 190,300 214,302 M260,334 L272,326 M220,336 L232,328" />
      </g>
      <g className="sl-sway-slow" style={{ transformOrigin: "246px 312px" }}>
        {/* near hood frill, fanned like a cobra's */}
        <path d="M262,252 C300,240 334,206 344,160 C318,178 296,184 274,186 C296,166 304,140 300,112 C282,140 262,156 240,166 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M262,246 C292,226 316,200 332,170 M256,210 C278,188 290,160 296,128" fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.2" />
        <Tube c={c} w={25} belly d="M244,312 C288,322 294,262 270,214 C252,178 222,150 196,128" />
        <path d="M276,282 C284,262 282,240 274,222 M262,206 C250,186 234,168 216,152" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" filter={u("glow")} className="sl-rune-pulse" />
        {/* crown crest */}
        <g className="sl-sway-slow" style={{ transformOrigin: "206px 104px" }}>
          {crown.map((a, i) => (
            <g key={a} transform={`translate(206 106) rotate(${a})`}>
              <path d={blade(70 - Math.abs(i - 2) * 8, 9)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
              <circle cx={70 - Math.abs(i - 2) * 8} cy="0" r="2.6" fill={p.accent} filter={u("glow")} className="sl-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
            </g>
          ))}
        </g>
        {/* long regal head, angled down */}
        <g transform="rotate(14 160 112)">
          <path d="M212,112 C208,88 182,76 150,80 C124,84 98,94 80,104 C96,114 126,120 158,122 C180,124 204,122 212,112 Z" fill={u("body")} {...rim(c)} />
          <path d="M82,104 C100,112 130,116 160,118 C182,120 202,118 210,114 L204,124 C174,130 124,124 86,110 Z" fill={p.belly} opacity="0.85" />
          <path d="M120,98 C140,92 166,90 190,94" fill="none" stroke={p.accent} strokeWidth="1.4" strokeLinecap="round" filter={u("glow")} opacity="0.8" />
          {/* trailing barbels */}
          <path d="M96,112 C96,128 104,140 100,156 M108,116 C110,130 118,138 116,150" fill="none" stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" className="sl-sway" style={{ transformOrigin: "100px 112px" }} />
          <Spec x={156} y={88} rx={24} ry={4} rot={-6} o={0.38} />
          <Eye c={c} x={160} y={98} r={6.5} kind="slit" flip angle={-4} />
          <Gem c={c} x={186} y={92} s={0.55} />
        </g>
      </g>
    </g>
  );
}

export const vael: Renderer = {
  ...evolved,
  halo: [132, 44, 24],
  stageFit: [1.3, 1.08, 1, 0.98],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
