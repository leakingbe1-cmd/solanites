import { byStage, Constellation, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Aurorath — a sky whale trailing curtains of aurora beneath its belly. */

type P = [number, number];

/** Smooth Catmull-Rom curve through points, as cubic segments. `lead` is "M" to start a path or "L" to continue one. */
function spline(pts: P[], lead = "M") {
  let d = `${lead}${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${round(p1[0] + (p2[0] - p0[0]) / 6)},${round(p1[1] + (p2[1] - p0[1]) / 6)} ${round(p2[0] - (p3[0] - p1[0]) / 6)},${round(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * One aurora curtain: a folded, translucent ribbon hanging from a wavy top
 * edge, streaked with vertical rays and lit along its fold line.
 * A negative `len` makes it rise instead of hang.
 */
function Curtain({ c, top, len, shear = 24, tone = "veil", fill, delay = 0, o = 1 }: { c: Ctx; top: P[]; len: number; shear?: number; tone?: "veil" | "veil2"; fill?: string; delay?: number; o?: number }) {
  const edge = tone === "veil" ? c.p.accent : c.p.wingEdge;
  const bot: P[] = top.map(([x, y], i) => [round(x + shear + (i % 2 ? 6 : -6)), round(y + len * (0.9 + 0.1 * Math.sin(i * 2.1 + delay * 3)))]);
  const mid = top[Math.floor(top.length / 2)];
  const shape = `${spline(top)} ${spline([...bot].reverse(), "L")} Z`;
  const rays: [P, P][] = [];
  for (let i = 0; i < top.length; i++) {
    rays.push([top[i], bot[i]]);
    if (i < top.length - 1) {
      rays.push([
        [round((top[i][0] + top[i + 1][0]) / 2), round((top[i][1] + top[i + 1][1]) / 2)],
        [round((bot[i][0] + bot[i + 1][0]) / 2), round((bot[i][1] + bot[i + 1][1]) / 2)],
      ]);
    }
  }
  return (
    <g opacity={o}>
      <g className="sl-sway-slow" style={{ transformOrigin: `${mid[0]}px ${mid[1]}px`, animationDelay: `${delay}s` }}>
        <path d={shape} fill={fill ?? c.u(tone)} filter={c.u("blur8")} opacity="0.7" />
        <path d={shape} fill={fill ?? c.u(tone)} opacity="0.75" />
        <g stroke={edge} strokeLinecap="round" fill="none">
          {rays.map(([a, b], i) => (
            <path key={i} d={`M${a[0]},${a[1]} L${round(a[0] + (b[0] - a[0]) * 0.7)},${round(a[1] + (b[1] - a[1]) * 0.7)}`} strokeWidth={i % 2 ? 0.8 : 1.4} strokeOpacity={i % 2 ? 0.25 : 0.4} />
          ))}
        </g>
        <path d={spline(top)} fill="none" stroke={edge} strokeWidth="2.4" strokeOpacity="0.9" filter={c.u("glow")} />
        <path d={spline(top)} fill="none" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.65" />
      </g>
    </g>
  );
}

/** A long flowing aurora streamer (a glowing ribbon line). */
function Streamer({ c, d, color, w = 3, delay = 0, origin }: { c: Ctx; d: string; color: string; w?: number; delay?: number; origin: P }) {
  return (
    <g className="sl-sway" style={{ transformOrigin: `${origin[0]}px ${origin[1]}px`, animationDelay: `${delay}s` }} fill="none" strokeLinecap="round">
      <path d={d} stroke={color} strokeWidth={w * 2.4} strokeOpacity="0.18" filter={c.u("glow")} />
      <path d={d} stroke={color} strokeWidth={w} strokeOpacity="0.75" />
      <path d={d} stroke="#fff" strokeWidth={w * 0.3} strokeOpacity="0.6" />
    </g>
  );
}

/* ───────────────────────────── Eggling ───────────────────────────── */

/** Eggling: a round, big-headed calf curled with its tail up, stubby paddle fins and the faintest shimmer under its belly. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const body = "M118,206 C114,164 154,138 204,138 C252,138 290,166 292,204 C294,240 262,264 210,264 C158,264 120,248 118,206 Z";
  const clip = `${c.id}-eggling-body`;
  return (
    <g transform="translate(-34 -4)">
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* the first faint shimmer */}
      <Curtain c={c} top={[[168, 252], [186, 262], [206, 258], [226, 264], [244, 254]]} len={40} shear={4} tone="veil" o={0.55} />
      {/* tail stock curling up with tiny flukes */}
      <g className="sl-sway" style={{ transformOrigin: "282px 220px" }}>
        <path d="M274,206 C298,204 312,190 316,170 L328,174 C326,200 308,224 280,234 Z" fill={u("body")} {...rim(c)} />
        <path d="M318,178 C304,168 298,154 300,142 C314,146 322,158 324,170 C332,160 344,154 356,156 C350,168 338,178 324,184 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M302,148 C310,154 316,162 320,172 M352,158 C342,164 334,172 326,178" fill="none" stroke={p.accent} strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {/* far stubby fin */}
      <path d="M226,244 C236,262 252,272 266,270 C264,258 254,246 242,240 Z" fill={p.bodyDark} />
      {/* round calf body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${clip})`}>
        <path d="M110,214 C134,246 184,256 226,254 C258,252 280,240 296,222 L300,280 L110,280 Z" fill={p.belly} opacity="0.26" />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${128 + k * 4},${226 + k * 8} C${160},${248 + k * 5} ${210},${254 + k * 3} ${262 - k * 8},${244 + k * 3}`} fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="1.4" />
        ))}
        <path d="M170,150 C210,140 250,150 280,176" fill="none" stroke={p.accent} strokeWidth="4" strokeOpacity="0.35" filter={u("glow")} className="sl-rune-pulse" />
        <path d={body} fill={u("shade")} />
      </g>
      <Spec x={204} y={156} rx={42} ry={9} rot={-6} o={0.32} />
      {/* blowhole */}
      <path d="M196,142 C200,139 206,139 210,142" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* smile and cheek */}
      <path d="M122,214 C138,228 162,230 180,220" fill="none" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="174" cy="214" rx="10" ry="5" fill={p.accent} opacity="0.3" />
      <Eye c={c} x={156} y={194} r={12} kind="round" />
      {/* near stubby paddle fin */}
      <g className="sl-sway" style={{ transformOrigin: "196px 236px" }}>
        <path d="M184,234 C184,256 198,274 218,278 C224,264 218,246 206,234 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M188,242 C190,258 200,270 214,274" fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      </g>
      <Dots c={c} pts={[[150, 290], [262, 288], [300, 250], [132, 260]]} r={1.6} />
      <Gem c={c} x={178} y={160} s={0.45} />
    </g>
  );
}

/* ───────────────────────────── Hatchling ───────────────────────────── */

/** Hatchling: a longer, leaner calf with an upswept tail, longer pointed fins and its first thin aurora veils. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const body = "M70,206 C68,172 106,150 158,148 C210,146 258,160 292,182 C306,192 306,208 296,218 C268,242 214,252 158,250 C108,248 72,236 70,206 Z";
  const clip = `${c.id}-hatchling-body`;
  return (
    <g transform="translate(-28 -10)">
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* first thin veils */}
      <Curtain c={c} top={[[128, 240], [140, 248], [152, 244], [164, 250]]} len={66} shear={6} tone="veil" delay={0} />
      <Curtain c={c} top={[[186, 246], [198, 254], [212, 250], [224, 254]]} len={84} shear={8} tone="veil2" delay={0.8} />
      <Curtain c={c} top={[[244, 236], [256, 244], [268, 238], [280, 240]]} len={58} shear={6} tone="veil" delay={1.6} />
      {/* upswept tail stock and flukes */}
      <g className="sl-sway-slow" style={{ transformOrigin: "290px 204px" }}>
        <path d="M282,184 C308,184 330,172 344,150 L354,158 C344,184 322,206 290,216 Z" fill={u("body")} {...rim(c)} />
        <path d="M346,160 C334,144 330,128 336,114 C350,122 356,140 354,156 C366,146 382,142 394,146 C386,158 370,166 354,168 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M338,120 C346,132 350,144 350,156 M390,148 C378,154 366,160 356,164" fill="none" stroke={p.accent} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {/* far fin */}
      <path d="M186,236 C206,256 228,272 252,280 C244,264 226,246 208,232 Z" fill={p.bodyDark} />
      {/* small dorsal nub */}
      <path d="M232,158 C238,150 246,146 254,146 C252,152 252,160 256,166 Z" fill={u("body")} {...rim(c, 1)} />
      {/* body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${clip})`}>
        <path d="M64,214 C100,240 160,248 214,246 C252,244 280,232 300,214 L310,280 L64,280 Z" fill={p.belly} opacity="0.24" />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${76 + k * 4},${220 + k * 6} C${120},${242 + k * 4} ${180},${250 + k * 2} ${250 - k * 8},${240 + k * 3}`} fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="1.4" />
        ))}
        <path d="M118,160 C170,148 230,152 290,184" fill="none" stroke={p.accent} strokeWidth="4" strokeOpacity="0.55" filter={u("glow")} className="sl-rune-pulse" />
        <path d="M150,170 C196,164 240,170 282,194" fill="none" stroke={p.wingEdge} strokeWidth="2" strokeOpacity="0.4" />
        <path d={body} fill={u("shade")} />
      </g>
      <Spec x={156} y={160} rx={56} ry={8} rot={-4} o={0.3} />
      <path d="M128,152 C132,149 138,149 142,152" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* long mouth line */}
      <path d="M72,212 C92,224 122,226 142,216" fill="none" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="138" cy="210" rx="8" ry="4" fill={p.accent} opacity="0.25" />
      <Eye c={c} x={120} y={198} r={9} kind="round" />
      {/* longer, pointed pectoral fin */}
      <g className="sl-sway" style={{ transformOrigin: "150px 236px" }}>
        <path d="M134,232 C146,256 172,282 208,298 C212,300 214,294 210,290 C192,270 176,250 166,232 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M138,240 C152,262 176,284 204,296" fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="2.4" strokeLinecap="round" />
        {[
          [146, 254],
          [162, 270],
          [180, 284],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.2" fill={p.bodyLight} opacity="0.55" />
        ))}
      </g>
      <Dots c={c} pts={[[110, 290], [300, 270], [330, 214]]} r={1.6} />
      <Gem c={c} x={112} y={166} s={0.5} />
    </g>
  );
}

/* ───────────────────────────── Evolved ───────────────────────────── */

const EV_BODY = "M36,198 C38,168 78,146 130,138 C190,128 258,132 302,156 C322,166 338,176 354,182 C360,186 360,194 354,198 C336,204 318,214 296,228 C252,254 172,266 112,258 C66,252 36,232 36,198 Z";

/** Evolved: a great sky whale gliding level, full green and violet curtains hanging below, aurora bands on its back. */
function evolvedArt(c: Ctx) {
  const { p, u } = c;
  const clip = `${c.id}-evolved-body`;
  return (
    <g transform="translate(-4 -18)">
      <defs>
        <clipPath id={clip}>
          <path d={EV_BODY} />
        </clipPath>
      </defs>
      {/* aurora curtains */}
      <Curtain c={c} top={[[118, 236], [150, 250], [184, 244], [218, 256], [252, 244], [286, 232], [316, 214]]} len={104} shear={14} tone="veil2" delay={0.7} />
      <Curtain c={c} top={[[80, 234], [114, 252], [150, 246], [186, 258], [220, 250], [254, 240], [290, 224]]} len={92} shear={8} tone="veil" />
      {/* flukes */}
      <g className="sl-sway-slow" style={{ transformOrigin: "350px 190px" }}>
        <path d="M344,184 C360,168 376,150 394,142 C394,160 384,178 368,190 C384,200 394,216 396,236 C378,228 362,212 344,198 Z" fill={u("body")} {...rim(c)} />
        <path d="M392,146 C386,164 378,178 366,188 M394,232 C384,218 374,206 364,196" fill="none" stroke={p.accent} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" filter={u("glow")} />
      </g>
      {/* dorsal hump and far fin */}
      <path d="M272,152 C282,142 294,134 308,132 C304,142 304,152 308,162 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M172,240 C202,262 240,282 286,292 C264,276 232,256 208,236 Z" fill={p.bodyDark} />
      {/* body */}
      <path d={EV_BODY} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${clip})`}>
        <path d="M28,212 C70,238 140,252 210,252 C250,252 282,242 312,222 L360,300 L28,300 Z" fill={p.belly} opacity="0.22" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path key={k} d={`M${40 + k * 4},${214 + k * 6} C${96 + k * 2},${240 + k * 4} ${178},${254 + k * 2} ${266 - k * 8},${238 + k * 3}`} fill="none" stroke={p.belly} strokeOpacity="0.38" strokeWidth="1.4" />
        ))}
        <g fill="none" strokeLinecap="round" filter={u("glow")} className="sl-rune-pulse">
          <path d="M92,152 C160,132 240,134 322,172" stroke={p.accent} strokeWidth="5" strokeOpacity="0.6" />
          <path d="M118,166 C180,150 250,154 334,184" stroke={p.wingEdge} strokeWidth="3" strokeOpacity="0.55" />
          <path d="M146,180 C204,170 262,176 320,196" stroke={p.accent} strokeWidth="2" strokeOpacity="0.4" strokeDasharray="12 9" />
        </g>
        <path d={EV_BODY} fill={u("shade")} />
      </g>
      <Spec x={168} y={146} rx={74} ry={9} rot={-5} o={0.26} />
      <path d="M116,140 C120,137 126,137 130,140" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* long mouth line and kind eye */}
      <path d="M38,204 C62,214 98,218 124,212 C130,210 134,206 136,202" fill="none" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
      <Eye c={c} x={116} y={194} r={6.5} kind="lidded" />
      {/* long humpback pectoral fin with knobbed leading edge */}
      <g className="sl-sway-slow" style={{ transformOrigin: "140px 238px" }}>
        <path d="M118,236 C148,266 198,296 252,320 C260,322 262,314 256,310 C226,286 196,258 168,234 Z" fill={u("body")} {...rim(c)} />
        <path d="M124,244 C152,268 198,296 248,316" fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        {[
          [134, 254],
          [156, 272],
          [180, 288],
          [206, 302],
          [230, 312],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.8" fill={p.bodyLight} opacity="0.6" />
        ))}
      </g>
      <Gem c={c} x={88} y={168} s={0.6} />
    </g>
  );
}

const evolved: Renderer = {
  floating: true,
  fit: 0.98,
  shadow: 150,
  halo: [120, 96, 34],
  render: evolvedArt,
};

/* ───────────────────────────── Ascended ───────────────────────────── */

const AS_BODY = "M24,192 C26,156 76,126 140,118 C204,110 270,118 312,144 C330,154 344,164 358,168 C366,172 366,182 358,186 C340,194 320,210 298,226 C252,256 172,270 106,262 C56,256 24,232 24,192 Z";

/** Ascended: an enormous starlit whale rising in a slow arc, an aurora crest streaming off its back, vast curtains and streamers below, under soft light rays. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const clip = `${c.id}-ascended-body`;
  const up = `${c.id}-ascended-up`;
  const beam = `${c.id}-ascended-beam`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={AS_BODY} />
        </clipPath>
        <linearGradient id={up} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={p.accent} stopOpacity="0.75" />
          <stop offset="0.55" stopColor={p.wingEdge} stopOpacity="0.4" />
          <stop offset="1" stopColor={p.wingEdge} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={beam} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.belly} stopOpacity="0" />
          <stop offset="0.25" stopColor={p.belly} stopOpacity="0.16" />
          <stop offset="0.6" stopColor={p.accent} stopOpacity="0.06" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gentle light rays falling from above */}
      <g className="sl-aura-pulse" style={{ transformOrigin: "200px 40px" }}>
        {[
          [150, 70, 10, 60],
          [196, 230, 8, 50],
          [244, 340, 7, 46],
          [110, -10, 6, 40],
        ].map(([x, bx, w, bw]) => (
          <path key={x} d={`M${x - w},20 L${x + w},20 L${bx + bw},330 L${bx - bw},330 Z`} fill={`url(#${beam})`} />
        ))}
      </g>
      <g transform="translate(-14 -8)">
        <g transform="rotate(8 200 210)">
          {/* aurora crest rising off the back */}
          <Curtain c={c} top={[[96, 132], [130, 120], [166, 114], [204, 112], [242, 116], [278, 128], [310, 146]]} len={-46} shear={18} fill={`url(#${up})`} delay={0.3} />
          {/* vast curtains below */}
          <Curtain c={c} top={[[130, 234], [164, 250], [198, 244], [232, 256], [266, 242], [300, 228], [330, 206]]} len={118} shear={16} tone="veil2" delay={0.9} />
          <Curtain c={c} top={[[70, 232], [104, 252], [140, 246], [176, 260], [212, 252], [248, 244], [284, 226]]} len={108} shear={10} tone="veil" />
          <Curtain c={c} top={[[60, 240], [90, 256], [122, 252], [154, 262]]} len={70} shear={6} tone="veil2" delay={1.7} o={0.8} />
          {/* fluke streamers */}
          <Streamer c={c} origin={[396, 120]} d="M396,118 C388,102 398,90 386,76" color={p.accent} w={2.4} />
          <Streamer c={c} origin={[404, 232]} d="M402,236 C396,252 404,266 394,280" color={p.wingEdge} w={2.4} delay={1} />
          {/* grand flukes */}
          <g className="sl-sway-slow" style={{ transformOrigin: "352px 180px" }}>
            <path d="M348,176 C362,154 376,132 396,116 C400,140 390,164 372,180 C390,190 402,210 404,236 C382,228 364,210 348,192 Z" fill={u("body")} {...rim(c)} />
            <path d="M348,176 C362,154 376,132 396,116 C400,140 390,164 372,180 C390,190 402,210 404,236 C382,228 364,210 348,192 Z" fill={u("stars")} opacity="0.45" />
            <path d="M394,122 C388,146 380,164 368,178 M402,230 C390,214 378,200 364,190" fill="none" stroke={p.accent} strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round" filter={u("glow")} />
          </g>
          {/* dorsal hump and far fin */}
          <path d="M276,134 C288,122 302,114 318,112 C312,124 312,136 316,148 Z" fill={u("body")} {...rim(c, 1)} />
          <path d="M170,240 C204,266 248,290 300,302 C276,284 240,260 210,236 Z" fill={p.bodyDark} />
          <Streamer c={c} origin={[300, 302]} d="M300,302 C324,312 334,300 356,312" color={p.wingEdge} w={1.8} delay={0.5} />
          {/* starlit body */}
          <path d={AS_BODY} fill={u("body")} {...rim(c)} />
          <g clipPath={`url(#${clip})`}>
            <rect x="20" y="100" width="360" height="180" fill={u("stars")} opacity="0.6" className="sl-twinkle" />
            <path d="M16,208 C64,236 140,250 214,250 C256,250 288,238 318,218 L370,300 L16,300 Z" fill={p.belly} opacity="0.22" />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <path key={k} d={`M${30 + k * 4},${210 + k * 6} C${92 + k * 2},${238 + k * 4} ${178},${254 + k * 2} ${272 - k * 8},${236 + k * 3}`} fill="none" stroke={p.belly} strokeOpacity="0.4" strokeWidth="1.4" />
            ))}
            <g fill="none" strokeLinecap="round" filter={u("glow")} className="sl-rune-pulse">
              <path d="M70,140 C150,114 240,116 330,160" stroke={p.accent} strokeWidth="6" strokeOpacity="0.65" />
              <path d="M98,156 C170,136 250,140 342,174" stroke={p.wingEdge} strokeWidth="3.5" strokeOpacity="0.6" />
              <path d="M126,172 C190,160 258,166 336,190" stroke={p.accent} strokeWidth="2" strokeOpacity="0.45" strokeDasharray="14 9" />
            </g>
            <path d={AS_BODY} fill={u("shade")} />
          </g>
          <Constellation c={c} pts={[[150, 196], [176, 186], [204, 192], [228, 182], [258, 190]]} />
          <Spec x={160} y={130} rx={84} ry={10} rot={-5} o={0.26} />
          <path d="M108,126 C112,122 120,122 124,126" fill="none" stroke={p.bodyDark} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* mouth, photophores along the jaw and the kind eye */}
          <path d="M26,200 C52,212 92,218 122,212 C128,210 132,206 134,200" fill="none" stroke={p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
          <Dots c={c} pts={[[44, 214], [62, 220], [82, 224], [102, 224]]} r={1.4} color={p.belly} />
          <Eye c={c} x={112} y={190} r={7} kind="lidded" />
          {/* very long pectoral fin with streamers */}
          <g className="sl-sway-slow" style={{ transformOrigin: "136px 236px" }}>
            <Streamer c={c} origin={[268, 330]} d="M266,330 C292,346 308,336 330,350 C344,360 354,354 366,362" color={p.accent} w={2.6} />
            <Streamer c={c} origin={[250, 318]} d="M246,322 C262,346 254,362 276,378" color={p.wingEdge} w={1.8} delay={0.7} />
            <path d="M112,234 C146,268 202,304 264,330 C272,332 274,324 268,320 C232,294 196,262 166,232 Z" fill={u("body")} {...rim(c)} />
            <path d="M112,234 C146,268 202,304 264,330 C272,332 274,324 268,320 C232,294 196,262 166,232 Z" fill={u("stars")} opacity="0.4" />
            <path d="M118,242 C150,270 202,302 258,326" fill="none" stroke={p.belly} strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
            {[
              [128, 252],
              [152, 272],
              [178, 290],
              [206, 306],
              [234, 318],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="3" fill={p.bodyLight} opacity="0.65" />
            ))}
          </g>
          <Gem c={c} x={80} y={156} s={0.66} />
        </g>
      </g>
    </g>
  );
}

export const aurorath: Renderer = {
  ...evolved,
  halo: [96, 72, 30],
  stageFit: [1.3, 1.08, 1, 0.86],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
