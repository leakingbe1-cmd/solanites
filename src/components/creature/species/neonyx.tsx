import { blade, byStage, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/**
 * Neonyx — a deep-sea angler-wyrm: dark velvet skin, a gaping neon maw, frilled
 * fins, photophore rows and a lantern lure on a stalk from the forehead. The
 * Solgem burns inside the lantern at every stage.
 */

/** The lantern lure: magenta bulb with a cyan heart, optionally carrying the Solgem. */
function Lantern({ c, x, y, r, gem = 0, cyan = false, delay = 0 }: { c: Ctx; x: number; y: number; r: number; gem?: number; cyan?: boolean; delay?: number }) {
  const { p, u } = c;
  const outer = cyan ? p.eye : p.accent;
  const inner = cyan ? p.accent : p.eye;
  return (
    <g>
      <circle cx={x} cy={y} r={round(r * 2.3)} fill={outer} opacity="0.22" filter={u("blur8")} />
      <circle cx={x} cy={y} r={round(r * 1.45)} fill={outer} opacity="0.4" filter={u("glow")} className="sl-core" style={{ animationDelay: `${delay}s` }} />
      <circle cx={x} cy={y} r={r} fill={outer} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1" />
      <circle cx={x} cy={y} r={round(r * 0.78)} fill={u("light")} />
      <circle cx={x} cy={round(y + r * 0.12)} r={round(r * 0.42)} fill={inner} filter={u("glow")} />
      {gem > 0 && <Gem c={c} x={x} y={round(y + r * 0.05)} s={gem} />}
      <Spec x={round(x - r * 0.38)} y={round(y - r * 0.48)} rx={round(r * 0.32)} ry={round(r * 0.16)} rot={-30} o={0.75} />
    </g>
  );
}

/** A lure stalk: dark velvet stem with a lighter core and a glowing nerve dotted along it. */
function Stalk({ c, d, w }: { c: Ctx; d: string; w: number }) {
  const { p, u } = c;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={p.bodyDark} strokeWidth={w + 2.5} />
      <path d={d} stroke={p.body} strokeWidth={w} />
      <path d={d} stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth={round(w * 0.35)} transform="translate(-0.8 -0.8)" />
      <path d={d} stroke={p.accent} strokeWidth="1" strokeDasharray="1.5 7" filter={u("glow")} />
    </g>
  );
}

/** Needle teeth along a lip: [x, y, length]; dir 1 hangs down, -1 points up. */
function Fangs({ c, pts, dir, w = 2.6 }: { c: Ctx; pts: [number, number, number][]; dir: 1 | -1; w?: number }) {
  const { p, u } = c;
  return (
    <g fill={p.horn} filter={u("glow")}>
      {pts.map(([x, y, l]) => (
        <path key={`${x}${y}`} d={`M${round(x - w)},${y} C${round(x - w * 0.4)},${round(y + dir * l * 0.5)} ${round(x + w * 0.2)},${round(y + dir * l * 0.85)} ${round(x + w * 0.9)},${round(y + dir * l)} C${round(x + w * 0.9)},${round(y + dir * l * 0.55)} ${round(x + w)},${round(y + dir * l * 0.3)} ${round(x + w)},${y} Z`} />
      ))}
    </g>
  );
}

/** Translucent fin membrane with ray lines. */
function Fin({ c, d, rays, o = 0.6 }: { c: Ctx; d: string; rays?: string; o?: number }) {
  const { p, u } = c;
  return (
    <g>
      <path d={d} fill={u("fin")} stroke={p.wingEdge} strokeOpacity={o} />
      {rays && <path d={rays} fill="none" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />}
    </g>
  );
}

/** Eggling: a tiny round fry with a huge eye, fin buds and one glowing dot on a short stalk. Mouth closed. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* little fan tail */}
      <g className="sl-sway" style={{ transformOrigin: "176px 220px" }}>
        <path d="M180,202 C162,204 150,210 142,220 L146,232 C158,230 168,232 182,236 Z" fill={u("body")} {...rim(c, 1)} />
        <Fin c={c} d="M148,220 C136,204 122,198 114,202 C119,213 119,225 114,236 C122,246 136,242 148,232 Z" rays="M146,224 L118,206 M146,226 L118,220 M146,228 L118,234" />
      </g>
      {/* dorsal nub */}
      <Fin c={c} d="M196,176 C196,158 210,148 226,150 C219,158 219,166 222,176 Z" rays="M204,170 L212,154 M214,172 L220,156" />
      {/* round body */}
      <ellipse cx="218" cy="214" rx="50" ry="46" fill={u("body")} {...rim(c)} />
      <ellipse cx="218" cy="214" rx="50" ry="46" fill={u("shade")} />
      <path d="M176,232 C194,256 240,264 264,240 C254,258 238,262 218,262 C198,262 184,250 176,232 Z" fill={p.belly} opacity="0.3" />
      <Spec x={206} y={182} rx={24} ry={8} rot={-12} o={0.3} />
      {/* the first photophores, barely lit */}
      <g opacity={c.mark + 0.25}>
        <Dots c={c} r={2} color={p.belly} pts={[[196, 236], [184, 222], [208, 244]]} />
      </g>
      {/* pectoral bud */}
      <Fin c={c} d="M222,236 C210,240 202,250 202,262 C213,260 222,253 229,244 Z" rays="M220,242 L208,256" o={0.75} />
      {/* a short stalk with a single glowing dot */}
      <g className="sl-sway" style={{ transformOrigin: "246px 178px" }}>
        <Stalk c={c} d="M246,180 C247,163 257,152 270,153" w={3} />
        <Lantern c={c} x={273} y={156} r={6} gem={0.36} />
      </g>
      {/* face: huge eye, closed little mouth with a hint of underbite */}
      <path d="M246,238 C254,243 263,241 269,232" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" />
      <path d="M262,240 C266,240 269,237 270,233" fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="246" cy="228" rx="8" ry="4" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={238} y={204} r={14} kind="round" />
    </g>
  );
}

/** Hatchling: a rounder young angler — longer lure, a first frill, a few photophores and tiny teeth in a half-open mouth. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const body = "M288,200 C282,166 252,148 216,148 C176,148 146,174 144,210 C142,246 172,268 212,270 C246,272 278,262 290,244 C294,232 292,214 288,200 Z";
  return (
    <g>
      {/* far pectoral */}
      <path d="M244,254 C236,266 236,278 242,288 C248,278 256,270 266,262 Z" fill={u("fin")} opacity="0.55" stroke={p.wingEdge} strokeOpacity="0.3" />
      {/* tail and fan */}
      <g className="sl-sway" style={{ transformOrigin: "156px 214px" }}>
        <path d="M158,194 C136,196 120,206 110,220 C104,230 96,238 86,242 L92,256 C104,254 116,246 124,236 C134,226 146,224 164,230 Z" fill={u("body")} {...rim(c, 1)} />
        <Fin c={c} d="M94,242 C82,224 68,216 58,220 C63,231 63,241 59,250 C63,260 63,269 57,279 C70,281 84,268 96,256 Z" rays="M92,246 L62,224 M92,248 L62,248 M92,252 L62,274" />
      </g>
      {/* small three-spined dorsal frill */}
      <g className="sl-sway-slow" style={{ transformOrigin: "206px 154px" }}>
        <Fin c={c} d="M240,152 L222,120 C216,131 210,137 204,140 L199,122 C193,135 187,141 181,146 L178,132 C173,145 169,154 165,162 Z" />
        <path d="M232,152 L222,120 M206,150 L199,122 M184,156 L178,132" stroke={p.horn} strokeWidth="1.6" strokeLinecap="round" />
        <Dots c={c} r={1.6} pts={[[222, 120], [199, 122], [178, 132]]} />
      </g>
      {/* longer lure stalk */}
      <g className="sl-sway" style={{ transformOrigin: "258px 158px" }}>
        <Stalk c={c} d="M258,160 C261,130 283,110 307,115 C320,118 325,131 320,142" w={3.6} />
        <Lantern c={c} x={318} y={149} r={9} gem={0.5} />
      </g>
      {/* round body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      <path d="M160,236 C180,262 236,272 278,252 C264,268 238,272 212,270 C186,268 168,256 160,236 Z" fill={p.belly} opacity="0.3" />
      <Spec x={208} y={164} rx={32} ry={8} rot={-8} o={0.26} />
      {/* gill arc */}
      <path d="M232,180 C222,202 224,228 238,246" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
      <path d="M236,184 C228,204 230,226 241,242" fill="none" stroke={p.accent} strokeOpacity="0.5" strokeWidth="1.1" filter={u("glow")} />
      {/* a few photophores */}
      <g opacity={c.mark}>
        <Dots c={c} r={2.2} color={p.belly} pts={[[218, 242], [198, 240], [178, 230], [128, 226]]} />
        <Dots c={c} r={1.8} color={p.eye} pts={[[258, 254], [272, 250]]} />
      </g>
      {/* half-open mouth with small teeth */}
      <path d="M252,224 C266,217 278,213 289,212 C291,220 291,229 289,237 C275,237 263,232 252,224 Z" fill="#07030c" />
      <path d="M262,226 C270,224 280,226 288,230" fill="none" stroke={p.accent} strokeOpacity="0.55" strokeWidth="3" filter={u("glow")} />
      <Fangs c={c} dir={1} w={1.8} pts={[[266, 219, 5], [276, 216, 6], [285, 213, 5]]} />
      <Fangs c={c} dir={-1} w={1.8} pts={[[264, 230, 5], [274, 234, 6], [284, 236, 5]]} />
      <path d="M288,212 C291,220 291,229 289,237" fill="none" stroke={p.bodyLight} strokeOpacity="0.55" strokeWidth="1.2" />
      {/* pectoral fin */}
      <Fin c={c} d="M216,230 C201,235 190,247 185,262 C193,262 199,266 202,272 C208,262 216,254 228,248 Z" rays="M214,236 L190,260 M218,240 L201,268" o={0.75} />
      {/* eye under a soft brow */}
      <path d="M244,176 C252,170 264,170 270,177" fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <Eye c={c} x={257} y={192} r={10} kind="round" />
    </g>
  );
}

/** Evolved: the full angler-wyrm — gaping neon maw, frilled back, fan-tailed wyrm tail and a bright lantern. */
function evolvedArt(c: Ctx) {
  const { p, u } = c;
  const maw = `${c.id}evolvedMaw`;
  const body = "M332,186 C324,148 292,122 244,120 C192,118 152,146 140,182 C130,214 148,248 184,264 C218,280 272,282 306,268 C326,260 340,248 340,232 C340,216 338,200 332,186 Z";
  const mouth = "M254,210 C278,200 306,192 330,190 C336,204 338,218 338,230 C310,232 280,224 254,210 Z";
  return (
    <g>
      <defs>
        <radialGradient id={maw} cx="0.12" cy="0.5" r="0.95">
          <stop offset="0" stopColor={p.accent} stopOpacity="0.95" />
          <stop offset="0.45" stopColor={p.wing} />
          <stop offset="1" stopColor="#07030c" />
        </radialGradient>
      </defs>
      {/* far pectoral */}
      <path d="M262,258 C250,272 248,288 254,300 C262,288 274,278 290,268 Z" fill={u("fin")} opacity="0.55" stroke={p.wingEdge} strokeOpacity="0.3" />
      {/* wyrm tail with a ventral frill and fan */}
      <g className="sl-sway-slow" style={{ transformOrigin: "160px 196px" }}>
        <Fin c={c} d="M150,222 C140,244 128,262 112,276 C124,277 133,270 140,264 C139,274 139,282 135,292 C150,282 160,262 166,232 Z" rays="M150,232 L120,272 M156,236 L140,286" />
        <Fin c={c} d="M126,172 C112,158 98,152 84,156 C93,165 97,174 99,184 C91,182 83,184 75,190 C87,195 95,201 99,210 Z" rays="M118,174 L90,160 M108,186 L82,190" />
        <path d="M162,158 C124,166 100,188 90,214 C82,236 72,252 56,262 L64,276 C84,270 102,256 114,240 C128,222 150,214 180,226 Z" fill={u("body")} {...rim(c)} />
        <path d="M152,170 C122,180 104,198 96,220" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" />
        <g opacity={c.mark}>
          <Dots c={c} r={2} color={p.belly} pts={[[128, 218], [110, 234], [94, 250], [78, 262]]} />
        </g>
        <g className="sl-sway" style={{ transformOrigin: "62px 270px" }}>
          <Fin c={c} d="M66,262 C50,236 30,222 18,226 C24,240 26,252 22,262 C30,270 32,280 24,290 C28,302 26,312 18,322 C36,322 54,302 68,280 Z" rays="M64,268 L24,232 M62,270 L28,262 M62,274 L28,290 M64,276 L24,316" o={0.75} />
        </g>
      </g>
      {/* frilled dorsal crest: spined membrane with glowing tips */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 130px" }}>
        <Fin c={c} d="M248,126 L232,82 C226,96 218,104 212,106 L204,86 C198,100 192,108 186,112 L178,98 C172,112 166,120 160,126 L156,114 C152,128 148,136 144,142 L136,132 C138,150 140,160 142,170 Z" o={0.75} />
        <path d="M240,124 L232,82 M214,124 L204,86 M190,130 L178,98 M168,140 L156,114 M150,154 L136,132" stroke={p.horn} strokeWidth="1.8" strokeLinecap="round" />
        <Dots c={c} r={1.9} pts={[[232, 82], [204, 86], [178, 98], [156, 114], [136, 132]]} />
      </g>
      {/* lantern lure arching over the maw */}
      <g className="sl-sway" style={{ transformOrigin: "276px 130px" }}>
        <Stalk c={c} d="M276,132 C278,92 306,62 340,66 C362,68 372,86 366,104" w={4.4} />
        <path d="M360,124 C358,134 362,140 356,148 M368,124 C372,134 368,142 372,150" fill="none" stroke={p.eye} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" filter={u("glow")} />
        <Lantern c={c} x={364} y={114} r={13} gem={0.66} />
      </g>
      {/* bulbous body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      <path d="M160,236 C186,268 250,282 312,262 C292,278 246,284 210,276 C184,270 166,256 160,236 Z" fill={p.belly} opacity="0.28" />
      {/* throat ridges under the jaw */}
      <path d="M268,252 C290,260 314,258 334,246 M266,262 C288,270 310,268 326,258" fill="none" stroke={p.bodyLight} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={248} y={138} rx={36} ry={8} rot={-6} o={0.22} />
      {/* gill frill */}
      <Fin c={c} d="M240,164 C224,186 224,226 244,252 C236,226 236,194 248,170 Z" o={0.3} />
      <path d="M244,166 C230,190 230,224 246,248" fill="none" stroke={p.accent} strokeOpacity="0.6" strokeWidth="1.1" filter={u("glow")} className="sl-rune-pulse" />
      {/* neon patterning and photophore rows */}
      <g opacity={c.mark} filter={u("glow")} fill="none" strokeLinecap="round" className="sl-rune-pulse">
        <path d="M168,196 C192,208 216,210 232,204" stroke={p.eye} strokeWidth="1.3" opacity="0.7" />
        <path d="M176,170 L184,162 L192,170 M198,160 L206,152 L214,160 M220,156 L228,148 L236,156" stroke={p.accent} strokeWidth="1.5" />
      </g>
      <g opacity={c.mark}>
        <Dots c={c} r={2.2} color={p.belly} pts={[[222, 224], [204, 228], [186, 224], [168, 216], [154, 206]]} />
        <Dots c={c} r={2} color={p.eye} pts={[[286, 248], [302, 248], [318, 244], [204, 244], [184, 240]]} />
      </g>
      {/* gaping glowing maw */}
      <path d={mouth} fill={`url(#${maw})`} />
      <path d="M262,214 C282,214 306,214 334,212" fill="none" stroke={p.accent} strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round" filter={u("glow")} />
      <Fangs c={c} dir={1} pts={[[270, 205, 8], [284, 202, 12], [298, 198, 15], [312, 195, 13], [325, 192, 9]]} />
      <Fangs c={c} dir={-1} pts={[[276, 219, 9], [290, 222, 13], [304, 225, 16], [318, 227, 13], [331, 229, 9]]} />
      <path d="M332,188 C337,202 339,216 339,230" fill="none" stroke={p.belly} strokeOpacity="0.5" strokeWidth="1.4" filter={u("glow")} />
      <path d="M292,196 C306,192 318,190 330,189" fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      {/* near pectoral */}
      <g className="sl-sway-slow" style={{ transformOrigin: "228px 236px" }}>
        <Fin c={c} d="M228,230 C206,232 186,246 172,270 C184,268 190,272 192,282 C200,274 208,274 216,280 C216,264 224,250 236,242 Z" rays="M226,236 L178,268 M228,240 L196,278 M230,242 L214,276" o={0.8} />
      </g>
      {/* small glowing eye under a heavy brow */}
      <circle cx="286" cy="166" r="9" fill={p.bodyDark} opacity="0.7" />
      <path d="M268,158 C278,148 294,148 304,156" fill="none" stroke={p.bodyLight} strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />
      <Eye c={c} x={286} y={166} r={6.5} kind="orb" />
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  shadow: 120,
  halo: [214, 40, 26],
  render: evolvedArt,
};

/** Tapered S-coil of the Ascended tail: outlines first, then fills, so the joints don't seam. */
const COIL: [string, number][] = [
  ["M170,186 C140,198 112,214 98,240", 46],
  ["M98,240 C86,268 98,294 124,306", 34],
  ["M124,306 C150,318 178,320 200,312", 23],
  ["M200,312 C216,306 228,298 236,288", 13],
];

/** Ascended: a regal lantern-wyrm rearing upward — three lures, a towering frill, streaming veil fins and a coiled tail. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const maw = `${c.id}ascendedMaw`;
  const body = "M330,146 C322,108 290,84 244,82 C194,80 156,108 144,146 C134,180 150,214 184,232 C214,248 262,252 300,238 C322,230 340,216 342,198 C344,180 338,162 330,146 Z";
  const mouth = "M250,176 C276,164 304,152 330,150 C339,168 343,186 341,206 C312,206 278,196 250,176 Z";
  const spines: [number, number, number, number][] = [
    [244, 86, 236, 34],
    [222, 86, 204, 38],
    [200, 92, 174, 50],
    [180, 102, 146, 66],
    [164, 116, 122, 90],
    [152, 132, 104, 118],
  ];
  return (
    <g>
      <defs>
        <radialGradient id={maw} cx="0.12" cy="0.5" r="0.95">
          <stop offset="0" stopColor={p.eye} stopOpacity="0.9" />
          <stop offset="0.25" stopColor={p.accent} stopOpacity="0.95" />
          <stop offset="0.6" stopColor={p.wing} />
          <stop offset="1" stopColor="#07030c" />
        </radialGradient>
      </defs>
      {/* glowing motes drifting around it */}
      <g opacity="0.9">
        <Dots c={c} r={1.6} color={p.eye} pts={[[372, 150], [56, 120], [300, 300], [36, 200], [270, 30], [380, 210], [150, 360]]} />
        <Dots c={c} r={1.5} color={p.accent} pts={[[330, 290], [70, 160], [352, 30], [24, 270], [250, 350]]} />
      </g>
      {/* far pectoral veil */}
      <path d="M272,232 C262,252 262,272 270,288 C278,272 292,260 310,250 Z" fill={u("fin")} opacity="0.55" stroke={p.wingEdge} strokeOpacity="0.3" />
      {/* coiled wyrm tail with streaming veil fins */}
      <g className="sl-sway-slow" style={{ transformOrigin: "160px 200px" }}>
        <Fin c={c} d="M92,250 C66,262 52,290 56,322 C66,308 76,302 88,300 C84,316 88,332 98,344 C104,322 112,306 124,296 C104,288 94,272 92,250 Z" rays="M90,262 L62,312 M96,276 L96,336" o={0.7} />
        <g fill="none" strokeLinecap="round">
          {COIL.map(([d, w]) => <path key={`o${d}`} d={d} stroke={p.bodyDark} strokeWidth={w + 4} />)}
          {COIL.map(([d, w]) => <path key={`f${d}`} d={d} stroke={p.body} strokeWidth={w} />)}
          {COIL.map(([d, w]) => <path key={`l${d}`} d={d} stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth={round(w * 0.26)} transform={`translate(${round(w * 0.1)} ${round(-w * 0.2)})`} />)}
          {COIL.map(([d, w]) => <path key={`s${d}`} d={d} stroke="#fff" strokeOpacity="0.2" strokeWidth={round(w * 0.08)} transform={`translate(${round(w * 0.12)} ${round(-w * 0.28)})`} />)}
          <path d="M150,198 C124,210 106,224 98,244 C90,268 102,290 126,300 C152,312 182,312 204,304" stroke={p.accent} strokeWidth="1.4" strokeDasharray="10 6" filter={u("glow")} className="sl-rune-pulse" />
        </g>
        <g opacity={c.mark}>
          <Dots c={c} r={2.2} color={p.eye} pts={[[126, 214], [106, 236], [98, 262], [110, 286], [136, 300], [164, 306], [192, 302], [218, 294]]} />
        </g>
        <g className="sl-sway" style={{ transformOrigin: "236px 288px" }}>
          {[
            [-34, 70, 13],
            [6, 82, 15],
            [44, 66, 12],
          ].map(([a, l, w]) => (
            <g key={a} transform={`translate(236 288) rotate(${a})`}>
              <path d={blade(l, w, 0.7)} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
              <path d={`M4,0 L${l - 6},0`} stroke={p.accent} strokeWidth="1.1" opacity="0.8" filter={u("glow")} />
            </g>
          ))}
        </g>
      </g>
      {/* towering frill crest with long glowing spines */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 100px" }}>
        <Fin
          c={c}
          d="M256,90 L236,34 C230,54 224,66 216,72 L204,38 C198,58 190,70 182,76 L174,50 C168,72 160,84 152,90 L146,66 C142,90 136,102 128,108 L122,90 C120,112 114,124 106,130 L104,118 C108,140 122,154 146,164 Z"
          o={0.8}
        />
        {spines.map(([x1, y1, x2, y2]) => (
          <path key={x1} d={`M${x1},${y1} L${x2},${y2}`} stroke={p.horn} strokeWidth="2" strokeLinecap="round" />
        ))}
        <Dots c={c} r={2.2} pts={spines.map(([, , x, y]) => [x, y] as [number, number])} />
      </g>
      {/* main lantern on a tall arching stalk */}
      <g className="sl-sway" style={{ transformOrigin: "286px 96px" }}>
        <Stalk c={c} d="M286,98 C288,50 326,24 358,36 C378,44 382,64 372,78" w={5} />
        <path d="M362,100 C360,112 364,120 358,130 M372,100 C376,112 372,122 376,132" fill="none" stroke={p.eye} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" filter={u("glow")} />
        <Lantern c={c} x={368} y={88} r={15} gem={0.74} />
      </g>
      {/* regal body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d={body} fill={u("shade")} />
      <path d="M160,200 C186,234 252,252 316,232 C294,248 248,254 210,244 C186,238 168,224 160,200 Z" fill={p.belly} opacity="0.3" />
      <path d="M270,222 C292,230 316,226 336,214 M266,232 C288,240 312,236 330,226" fill="none" stroke={p.bodyLight} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={246} y={100} rx={38} ry={8} rot={-6} o={0.24} />
      {/* layered gill frills */}
      <Fin c={c} d="M236,126 C214,150 212,196 238,228 C230,196 232,160 246,132 Z" o={0.6} />
      <Fin c={c} d="M222,134 C204,158 204,194 222,220 C218,192 220,164 230,140 Z" o={0.45} />
      <path d="M240,130 C224,156 224,196 242,224" fill="none" stroke={p.accent} strokeOpacity="0.7" strokeWidth="1.2" filter={u("glow")} className="sl-rune-pulse" />
      {/* intricate neon tracery */}
      <g filter={u("glow")} fill="none" strokeLinecap="round" strokeLinejoin="round" className="sl-rune-pulse">
        <path d="M160,170 C186,184 212,186 228,180" stroke={p.eye} strokeWidth="1.4" opacity="0.8" />
        <path d="M168,150 L176,140 L184,150 L192,140 L200,150 L208,140 L216,150" stroke={p.accent} strokeWidth="1.5" />
        <path d="M174,198 C184,206 196,208 206,204 M184,214 C194,220 206,220 214,216" stroke={p.accent} strokeWidth="1.2" opacity="0.8" />
        <path d="M296,118 C304,112 314,114 318,122 C320,130 312,134 306,130" stroke={p.eye} strokeWidth="1.2" />
      </g>
      <g opacity={c.mark}>
        <Dots c={c} r={2.3} color={p.belly} pts={[[226, 194], [208, 196], [190, 192], [172, 184], [158, 172]]} />
        <Dots c={c} r={2} color={p.eye} pts={[[282, 220], [298, 220], [314, 216], [196, 226], [176, 216]]} />
      </g>
      {/* chin barbel lures in cyan */}
      <g className="sl-sway" style={{ transformOrigin: "324px 212px" }}>
        <Stalk c={c} d="M324,214 C328,240 342,254 358,252" w={2.6} />
        <Lantern c={c} x={362} y={252} r={7} cyan delay={0.8} />
      </g>
      <g className="sl-sway-slow" style={{ transformOrigin: "292px 232px" }}>
        <Stalk c={c} d="M292,234 C292,258 300,272 314,278" w={2.4} />
        <Lantern c={c} x={318} y={281} r={6} cyan delay={1.5} />
      </g>
      {/* the great open maw */}
      <path d={mouth} fill={`url(#${maw})`} />
      <path d="M258,182 C282,186 310,186 336,180" fill="none" stroke={p.accent} strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" filter={u("glow")} />
      <Fangs c={c} dir={1} w={3} pts={[[266, 169, 10], [280, 164, 14], [294, 160, 19], [308, 156, 17], [320, 153, 13], [329, 151, 8]]} />
      <Fangs c={c} dir={-1} w={3} pts={[[272, 190, 10], [286, 195, 15], [300, 199, 20], [314, 202, 17], [327, 204, 12], [336, 205, 7]]} />
      <path d="M330,148 C339,166 343,186 341,206" fill="none" stroke={p.belly} strokeOpacity="0.55" strokeWidth="1.6" filter={u("glow")} />
      <path d="M290,156 C304,152 318,150 330,149" fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      {/* long trailing pectoral veil */}
      <g className="sl-sway-slow" style={{ transformOrigin: "226px 206px" }}>
        <Fin c={c} d="M228,198 C200,204 172,228 150,266 C166,262 174,268 176,280 C186,268 196,268 206,276 C206,256 214,244 222,240 C222,228 230,218 240,212 Z" rays="M226,204 L158,262 M228,208 L178,274 M232,212 L204,270" o={0.85} />
      </g>
      {/* brow crest and small fierce eye */}
      <path d="M262,108 C272,92 288,86 304,90 C294,96 290,102 288,110 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
      <circle cx="286" cy="126" r="10" fill={p.bodyDark} opacity="0.7" />
      <path d="M266,118 C276,106 296,106 308,114" fill="none" stroke={p.bodyLight} strokeOpacity="0.7" strokeWidth="2.6" strokeLinecap="round" />
      <Eye c={c} x={286} y={126} r={7} kind="orb" />
    </g>
  );
}

export const neonyx: Renderer = {
  ...evolved,
  halo: [214, 18, 24],
  stageFit: [1.6, 1.18, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
