import { byStage, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Thalor — a heavy, armoured deep-sea guardian: helmet head, layered fins, crescent tail. */

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [round(a[0] + (b[0] - a[0]) * t), round(a[1] + (b[1] - a[1]) * t)];

/** A ray-finned membrane from base point A (front) to tip T, closing back at base point B. */
function Fin({ c, a, t, b, rays = 4, o = 1 }: { c: Ctx; a: Pt; t: Pt; b: Pt; rays?: number; o?: number }) {
  const { p, u } = c;
  const c1 = lerp(a, t, 0.7);
  c1[0] = round(a[0] + (t[0] - a[0]) * 0.1);
  const c2: Pt = [round(t[0] - (t[0] - a[0]) * 0.3), t[1]];
  const c3: Pt = [round(t[0] + (b[0] - t[0]) * 0.15), round(t[1] + (b[1] - t[1]) * 0.55)];
  const c4: Pt = [round(b[0] - (b[0] - a[0]) * 0.25), round(b[1] - (b[1] - t[1]) * 0.1)];
  const d = `M${a} C${c1} ${c2} ${t} C${c3} ${c4} ${b} Z`;
  return (
    <g opacity={o}>
      <path d={d} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.65" strokeWidth="1.2" />
      {Array.from({ length: rays }, (_, i) => {
        const k = (i + 1) / (rays + 1);
        const s = lerp(a, b, k);
        const e = lerp(s, lerp(t, b, k * 0.8), 0.86);
        return <path key={i} d={`M${s} L${e}`} stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.1" />;
      })}
    </g>
  );
}

/** Glowing cyan seam line. */
function Seam({ c, d, w = 1.8 }: { c: Ctx; d: string; w?: number }) {
  return <path d={d} fill="none" stroke={c.p.accent} strokeWidth={w} strokeLinecap="round" filter={c.u("glow")} className="sl-rune-pulse" opacity={0.55 + 0.45 * c.mark} />;
}

/** Nacre armour bands across the back, clipped to the body outline. */
function Bands({ c, clip, body, xs, top, bottom, lean = 10 }: { c: Ctx; clip: string; body: string; xs: number[]; top: number; bottom: number; lean?: number }) {
  const { p } = c;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {xs.map((x, i) => (
          <g key={x}>
            <path d={`M${x},${top} C${x + lean + 6},${top + 30} ${x + lean + 6},${bottom - 24} ${x + lean},${bottom} L${x + lean + 30},${bottom} C${x + lean + 36},${bottom - 24} ${x + lean + 36},${top + 30} ${x + 30},${top} Z`} fill={i % 2 ? p.bodyLight : p.horn} opacity={i % 2 ? 0.16 : 0.1} />
            <path d={`M${x},${top} C${x + lean + 6},${top + 30} ${x + lean + 6},${bottom - 24} ${x + lean},${bottom}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="2" />
            <Seam c={c} d={`M${x + 3},${top} C${x + lean + 9},${top + 30} ${x + lean + 9},${bottom - 24} ${x + lean + 3},${bottom}`} w={1.3} />
          </g>
        ))}
      </g>
    </>
  );
}

/** Eggling: a round armoured fry with a tiny shell brow plate and stubby fan fins. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* stubby fan tail */}
      <g className="sl-sway" style={{ transformOrigin: "258px 214px" }}>
        <path d="M252,214 C266,196 280,184 294,180 C298,196 296,206 290,214 C296,222 298,232 294,248 C280,244 266,232 252,214 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.65" strokeWidth="1.2" />
        <path d="M262,212 L288,190 M264,214 L292,214 M262,216 L288,238" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1" />
      </g>
      {/* tiny dorsal bud */}
      <path d="M196,160 C204,146 218,142 228,146 C226,156 224,164 222,170 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      {/* round body */}
      <path d="M132,214 C132,174 162,152 198,152 C236,152 264,178 264,214 C264,250 236,274 198,274 C162,274 132,254 132,214 Z" fill={u("body")} {...rim(c)} />
      <path d="M144,236 C156,262 186,272 210,270 C236,268 254,254 260,236 C246,252 226,260 204,260 C180,260 158,252 144,236 Z" fill={p.belly} opacity="0.55" />
      <Spec x={204} y={168} rx={30} ry={7} rot={-6} o={0.25} />
      {/* shell brow plate */}
      <path d="M140,196 C140,172 160,156 186,156 C202,156 214,162 220,172 C206,174 194,182 188,194 C172,190 156,192 140,196 Z" fill={u("horn")} fillOpacity="0.72" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.2" />
      <path d="M150,186 C160,172 176,166 192,166" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <Seam c={c} d="M142,196 C158,192 174,191 188,195" w={1.4} />
      {/* stubby pectoral fan */}
      <g className="sl-sway-slow" style={{ transformOrigin: "208px 236px" }}>
        <path d="M204,232 C214,240 226,252 230,266 C220,268 210,262 200,248 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1.2" />
        <path d="M206,238 L224,262 M204,244 L214,264" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1" />
      </g>
      {/* face */}
      <Eye c={c} x={170} y={212} r={14} kind="round" />
      <path d="M140,236 C146,242 154,244 162,242" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="188" cy="236" rx="8" ry="4.5" fill={p.accent} opacity="0.2" />
      <Dots c={c} pts={[[214, 206], [228, 214], [240, 206], [226, 196]]} r={1.8} />
      <Gem c={c} x={176} y={170} s={0.42} />
    </g>
  );
}

/** Hatchling: a sturdy juvenile with a widening helmet, one dorsal fin and a forked tail. */
function hatchling(c: Ctx) {
  const { p, u, id } = c;
  const body = "M86,212 C86,176 118,158 164,158 C214,158 254,178 272,204 C278,214 274,224 264,230 C238,248 206,258 168,258 C120,258 86,242 86,212 Z";
  return (
    <g>
      {/* forked tail */}
      <g className="sl-sway" style={{ transformOrigin: "266px 212px" }}>
        <path d="M262,212 C280,202 294,184 304,162 C310,158 316,162 313,170 C307,188 302,202 300,212 C302,222 307,236 313,254 C316,262 310,266 304,262 C294,240 280,222 262,212 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.65" strokeWidth="1.2" />
        <path d="M274,208 L304,172 M276,216 L304,252 M278,212 L300,212" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1.1" />
      </g>
      {/* single dorsal fin */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 164px" }}>
        <Fin c={c} a={[170, 164]} t={[214, 112]} b={[236, 172]} rays={4} />
      </g>
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d="M100,234 C130,254 210,258 262,230 C244,248 208,260 170,260 C134,260 108,250 100,234 Z" fill={p.belly} opacity="0.6" />
      <Bands c={c} clip={`${id}-th1`} body={body} xs={[184, 218]} top={150} bottom={206} />
      <Spec x={200} y={172} rx={40} ry={6} rot={-4} o={0.22} />
      {/* helmet plate */}
      <path d="M90,202 C90,176 112,160 142,158 C162,156 178,162 186,172 C172,180 164,194 162,210 C140,202 112,200 90,202 Z" fill={u("horn")} fillOpacity="0.68" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.3" />
      <path d="M104,186 C116,172 136,166 160,166" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M118,192 C128,184 142,182 152,186" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <Seam c={c} d="M92,202 C114,199 140,201 162,210" w={1.5} />
      {/* pectoral fin */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 232px" }}>
        <Fin c={c} a={[168, 228]} t={[214, 286]} b={[196, 236]} rays={3} />
      </g>
      {/* face */}
      <Eye c={c} x={134} y={206} r={11} kind="round" />
      <path d="M90,226 C100,234 114,236 128,232" fill="none" stroke={p.bodyDark} strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <path d="M100,229 C98,222 100,216 104,212" fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round" />
      <Dots c={c} pts={[[150, 236], [172, 238], [194, 238], [216, 234], [238, 228]]} r={1.8} />
      <Gem c={c} x={144} y={172} s={0.48} />
    </g>
  );
}

/** Evolved: the broad-helmed guardian with three layered dorsal fins and a crescent tail. */
function evolved(c: Ctx) {
  const { p, u, id } = c;
  const body = "M62,212 C62,172 100,150 154,148 C218,146 274,168 304,196 C314,206 314,218 304,226 C276,252 222,272 160,272 C104,272 62,252 62,212 Z";
  return (
    <g>
      {/* crescent tail */}
      <g className="sl-sway" style={{ transformOrigin: "300px 212px" }}>
        <path d="M296,212 C320,198 340,170 352,132 C358,124 368,128 366,138 C358,172 350,196 348,212 C350,228 358,252 366,286 C368,296 358,300 352,292 C340,254 320,226 296,212 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" strokeWidth="1.3" />
        <path d="M310,206 L354,142 M314,212 L348,212 M310,218 L354,282 M320,200 L342,170 M320,224 L342,256" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1.1" />
      </g>
      {/* three layered dorsal fins, back to front */}
      <g className="sl-sway-slow" style={{ transformOrigin: "220px 156px" }}>
        <Fin c={c} a={[236, 162]} t={[286, 120]} b={[292, 184]} rays={3} o={0.85} />
        <Fin c={c} a={[198, 154]} t={[250, 96]} b={[264, 166]} rays={4} />
        <Fin c={c} a={[156, 150]} t={[204, 92]} b={[226, 156]} rays={4} />
      </g>
      {/* anal fin */}
      <Fin c={c} a={[232, 258]} t={[282, 286]} b={[276, 240]} rays={2} o={0.85} />
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d="M76,236 C110,268 220,276 300,226 C276,254 222,274 162,274 C112,274 84,258 76,236 Z" fill={p.belly} opacity="0.6" />
      <Bands c={c} clip={`${id}-th2`} body={body} xs={[176, 210, 244]} top={140} bottom={210} />
      <Spec x={214} y={164} rx={58} ry={7} rot={-3} o={0.22} />
      {/* broad helmet shield */}
      <path d="M64,200 C62,170 86,148 124,144 C150,141 172,148 184,160 C168,170 160,190 158,214 C128,204 94,200 64,200 Z" fill={u("horn")} fillOpacity="0.66" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M80,180 C94,160 122,152 152,154" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M110,160 C116,174 120,188 120,200 M140,154 C142,170 142,186 140,202" fill="none" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1.4" />
      <path d="M90,184 C102,174 120,172 132,178" fill="none" stroke={p.bodyDark} strokeOpacity="0.65" strokeWidth="4" strokeLinecap="round" />
      <Seam c={c} d="M66,200 C98,198 128,204 158,214" />
      {/* jaw & short tusks */}
      <path d="M66,228 C80,240 102,246 126,242" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M80,236 C76,226 78,218 84,212 C84,222 86,230 88,238 Z" fill={p.horn} stroke={p.bodyDark} strokeOpacity="0.4" />
      {/* long pectoral */}
      <g className="sl-sway-slow" style={{ transformOrigin: "160px 236px" }}>
        <Fin c={c} a={[150, 232]} t={[232, 312]} b={[190, 242]} rays={4} />
      </g>
      <Eye c={c} x={108} y={196} r={9} kind="almond" flip />
      <Dots c={c} pts={[[176, 234], [198, 238], [220, 238], [242, 234], [264, 226], [284, 216]]} r={1.9} />
      <Gem c={c} x={128} y={164} s={0.55} />
    </g>
  );
}

/** Ascended: the Deepwarden — crowned helmet, cathedral fins, tusks, streamers and a vast crescent tail. */
function ascended(c: Ctx) {
  const { p, u, id } = c;
  const body = "M58,206 C56,162 98,136 158,134 C226,132 282,156 310,188 C320,200 318,214 306,224 C276,252 220,276 160,278 C102,280 60,256 58,206 Z";
  return (
    <g transform="rotate(8 200 210)">
      {/* trailing streamers */}
      <g fill="none" strokeLinecap="round" className="sl-undulate" style={{ transformOrigin: "330px 210px" }}>
        <path d="M352,118 C366,96 380,92 392,98" stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="2.2" />
        <path d="M354,302 C368,326 382,330 392,322" stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="2.2" />
        <path d="M232,318 C246,342 266,350 286,344" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="2" />
        <path d="M212,312 C220,336 236,350 254,354" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1.6" />
      </g>
      {/* vast crescent tail */}
      <g className="sl-sway" style={{ transformOrigin: "304px 206px" }}>
        <path d="M300,206 C328,190 346,156 352,112 C356,102 368,104 368,116 C366,160 358,188 354,206 C358,226 366,256 368,298 C368,310 356,312 352,302 C344,258 328,222 300,206 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.75" strokeWidth="1.4" />
        <path d="M314,200 L356,122 M318,206 L354,206 M314,212 L356,292 M326,192 L346,158 M326,220 L346,256" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.1" />
        <Seam c={c} d="M352,112 C356,150 352,186 354,206 C356,232 364,264 368,298" w={1.2} />
      </g>
      {/* towering cathedral dorsal fins: two layers, back to front */}
      <g className="sl-sway-slow" style={{ transformOrigin: "214px 140px" }}>
        <Fin c={c} a={[246, 150]} t={[294, 86]} b={[302, 182]} rays={3} o={0.8} />
        <Fin c={c} a={[206, 140]} t={[258, 50]} b={[276, 156]} rays={5} o={0.9} />
        <Fin c={c} a={[162, 136]} t={[214, 36]} b={[236, 142]} rays={5} />
        <Fin c={c} a={[214, 142]} t={[240, 92]} b={[256, 150]} rays={2} o={0.75} />
      </g>
      <Fin c={c} a={[230, 262]} t={[290, 300]} b={[284, 236]} rays={3} o={0.85} />
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d="M72,236 C110,272 224,282 304,222 C278,254 224,280 162,280 C108,280 80,262 72,236 Z" fill={p.belly} opacity="0.6" />
      <Bands c={c} clip={`${id}-th3`} body={body} xs={[176, 206, 236, 266]} top={126} bottom={212} />
      <Spec x={222} y={150} rx={62} ry={7} rot={-4} o={0.22} />
      {/* swept-back horn ridges of the crown */}
      {[
        "M150,146 C170,120 200,104 236,100 C206,114 184,132 168,154 Z",
        "M128,140 C140,108 164,84 196,72 C174,96 160,120 150,146 Z",
        "M104,142 C108,112 122,88 144,72 C134,98 128,122 128,144 Z",
      ].map((d) => (
        <g key={d}>
          <path d={d} fill={u("horn")} fillOpacity="0.85" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.3" />
        </g>
      ))}
      <Seam c={c} d="M140,140 C150,116 168,96 192,78" w={1.3} />
      {/* crowned helmet shield */}
      <path d="M58,196 C56,164 82,140 122,134 C150,130 176,138 190,152 C172,164 164,186 162,212 C128,200 92,196 58,196 Z" fill={u("horn")} fillOpacity="0.66" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M74,172 C90,152 120,144 154,146" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
      <path d="M86,176 C100,166 120,164 134,170" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M108,150 C116,166 120,182 120,196 M142,144 C146,162 146,182 144,200" fill="none" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1.4" />
      <Seam c={c} d="M60,196 C96,194 128,200 162,212" w={2} />
      {/* jaw & tusks */}
      <path d="M62,226 C78,240 104,248 130,244" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M74,234 C64,220 64,204 72,192 C74,206 78,220 84,236 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.45" />
      <path d="M96,242 C90,230 90,218 96,208 C98,220 100,232 104,244 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.45" />
      {/* great layered pectoral fins */}
      <g className="sl-sway-slow" style={{ transformOrigin: "160px 236px" }}>
        <Fin c={c} a={[170, 236]} t={[262, 300]} b={[206, 246]} rays={3} o={0.8} />
        <Fin c={c} a={[148, 232]} t={[226, 320]} b={[188, 244]} rays={4} />
      </g>
      <Eye c={c} x={104} y={190} r={9.5} kind="almond" flip />
      <Dots c={c} pts={[[174, 238], [196, 244], [218, 246], [240, 242], [262, 234], [284, 222], [300, 212]]} r={2} />
      <Gem c={c} x={124} y={156} s={0.62} />
    </g>
  );
}

export const thalor: Renderer = {
  floating: true,
  shadow: 120,
  halo: [176, 22, 30],
  stageFit: [1.3, 1.12, 1, 0.88],
  render: byStage(eggling, hatchling, evolved, ascended),
};
