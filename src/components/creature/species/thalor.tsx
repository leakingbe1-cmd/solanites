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

/** Overlapping armour scales (rounded edge toward the tail), clipped to the body outline. Listed tail-first so front scales overlap. */
function Scales({ c, clip, body, plates }: { c: Ctx; clip: string; body: string; plates: [number, number, number, number][] }) {
  const { p, u } = c;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {plates.map(([x, y, a, k]) => (
          <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`}>
            <path d="M-4,-17 C18,-17 28,-8 28,0 C28,8 18,17 -4,17 Z" fill={u("body")} stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.6" />
            <path d="M6,-13 C18,-12 24,-6 24,0 C24,6 18,12 6,13" fill="none" stroke={p.horn} strokeOpacity="0.55" strokeWidth="1.4" />
            <path d="M10,-9 C17,-8 21,-4 21,0" fill="none" stroke={p.accent} strokeWidth="1.2" filter={u("glow")} opacity={0.4 + 0.4 * c.mark} className="sl-rune-pulse" />
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
      <Scales c={c} clip={`${id}-th1`} body={body} plates={[[226, 186, 8, 0.85], [196, 178, 4, 0.9], [210, 208, 6, 0.8]]} />
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
      <Scales c={c} clip={`${id}-th2`} body={body} plates={[[268, 194, 14, 0.85], [236, 176, 6, 1], [246, 210, 10, 0.9], [200, 168, 2, 1.05], [210, 202, 6, 1], [176, 196, 2, 0.95]]} />
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

/** Ascended: the Deepwarden — surging up in a diagonal arc under a crowned helmet, cathedral fins and a vast ornate tail. */
function ascended(c: Ctx) {
  const { p, u, id } = c;
  // Heavy arched body: head high at upper left, curving down to the tail root at lower right.
  const body = "M62,140 C62,104 94,80 132,80 C192,80 248,118 282,170 C304,206 318,250 324,288 C326,300 314,308 304,300 C286,272 256,250 216,238 C170,224 120,208 90,188 C72,176 62,160 62,140 Z";
  const crown: [Pt, Pt, Pt][] = [
    [[150, 84], [174, 96], [206, 44]],
    [[128, 79], [152, 84], [180, 22]],
    [[106, 80], [130, 79], [150, 14]],
    [[86, 88], [108, 80], [118, 28]],
  ];
  return (
    <g>
      {/* tail streamers */}
      <g fill="none" strokeLinecap="round" className="sl-undulate" style={{ transformOrigin: "330px 320px" }}>
        <path d="M386,240 C396,224 392,206 380,198" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="2.2" />
        <path d="M378,252 C394,256 398,272 390,284" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.6" />
        <path d="M288,386 C268,396 250,392 242,380" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="2.2" />
        <path d="M300,380 C304,394 292,400 280,398" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.6" />
      </g>
      {/* huge ornate crescent tail sweeping down and back */}
      <g className="sl-sway" style={{ transformOrigin: "316px 298px" }}>
        <path d="M312,296 C336,286 362,266 386,240 C392,236 396,242 392,248 C376,272 362,296 354,318 C340,336 312,360 290,386 C284,392 278,386 282,380 C296,354 308,326 312,296 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.8" strokeWidth="1.5" />
        <path d="M354,318 C346,306 336,300 326,300 C334,312 340,324 342,334 Z" fill={p.wing} opacity="0.55" />
        {[[386, 244], [368, 270], [354, 300], [320, 350], [300, 374], [288, 384]].map(([x, y]) => (
          <path key={x} d={`M316,300 L${round(316 + (x - 316) * 0.92)},${round(300 + (y - 300) * 0.92)}`} stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.1" />
        ))}
        <Seam c={c} d="M386,240 C372,262 360,290 354,318 C340,336 312,360 290,386" w={1.3} />
        <Dots c={c} pts={[[372, 258], [358, 286], [326, 346], [306, 368]]} r={1.7} />
      </g>
      {/* back row of cathedral dorsal fins */}
      <g className="sl-sway-slow" style={{ transformOrigin: "240px 140px" }}>
        <Fin c={c} a={[184, 92]} t={[240, 16]} b={[228, 116]} rays={5} o={0.75} />
        <Fin c={c} a={[228, 116]} t={[296, 50]} b={[264, 150]} rays={5} o={0.75} />
        <Fin c={c} a={[264, 150]} t={[340, 104]} b={[292, 190]} rays={4} o={0.75} />
      </g>
      {/* far pectoral wing, spread down and back */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 212px" }}>
        <Fin c={c} a={[168, 206]} t={[244, 330]} b={[214, 228]} rays={5} o={0.8} />
      </g>
      <path d={body} fill={u("body")} {...rim(c)} />
      <path d="M86,186 C122,212 176,226 220,240 C258,252 290,276 306,302 C290,284 264,262 224,250 C176,236 120,222 86,186 Z" fill={p.belly} opacity="0.55" />
      <Scales
        c={c}
        clip={`${id}-th3`}
        body={body}
        plates={[
          [282, 236, 66, 0.9],
          [258, 196, 56, 1],
          [270, 222, 62, 0.85],
          [230, 158, 44, 1.05],
          [240, 188, 50, 1],
          [196, 130, 30, 1.1],
          [204, 164, 36, 1],
          [166, 118, 18, 1.05],
        ]}
      />
      <Spec x={196} y={102} rx={46} ry={6} rot={26} o={0.2} />
      {/* front row of dorsal fins */}
      <g className="sl-sway-slow" style={{ transformOrigin: "240px 140px" }}>
        <Fin c={c} a={[196, 98]} t={[230, 46]} b={[222, 112]} rays={3} />
        <Fin c={c} a={[236, 124]} t={[282, 84]} b={[256, 146]} rays={3} />
        <Fin c={c} a={[270, 160]} t={[318, 140]} b={[286, 184]} rays={3} />
      </g>
      {/* crown: swept-back horn ridges, back to front */}
      {crown.map(([b0, b1, t]) => {
        const k1: Pt = [round(b0[0] + (t[0] - b0[0]) * 0.15), round(b0[1] + (t[1] - b0[1]) * 0.7)];
        const k2: Pt = [round(b1[0] + (t[0] - b1[0]) * 0.55), round(b1[1] + (t[1] - b1[1]) * 0.3)];
        return (
          <g key={t[0]}>
            <path d={`M${b0} Q${k1} ${t} Q${k2} ${b1} Z`} fill={p.wing} stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="1.4" />
            <path d={`M${b0} Q${k1} ${t} Q${k2} ${b1} Z`} fill={u("horn")} opacity="0.35" />
            <path d={`M${b0} Q${k1} ${t} Q${k2} ${b1}`} fill="none" stroke={p.horn} strokeOpacity="0.8" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx={t[0]} cy={t[1]} r="2.6" fill={p.accent} filter={u("glow")} className="sl-twinkle" />
          </g>
        );
      })}
      <Seam c={c} d="M120,80 C128,58 138,34 148,18" w={1.2} />
      {/* dark crowned helmet with a nacre edge */}
      <path d="M62,134 C60,104 86,82 122,78 C150,75 172,84 186,100 C166,110 154,128 150,152 C120,142 90,136 62,134 Z" fill={u("body")} stroke={p.horn} strokeOpacity="0.85" strokeWidth="2.4" />
      <path d="M62,134 C60,104 86,82 122,78 C150,75 172,84 186,100 C166,110 154,128 150,152 C120,142 90,136 62,134 Z" fill={p.bodyDark} opacity="0.45" />
      <path d="M74,116 C88,96 114,86 146,86" fill="none" stroke={p.horn} strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M110,88 C118,104 122,120 122,138 M144,84 C146,104 146,124 144,146" fill="none" stroke={p.horn} strokeOpacity="0.25" strokeWidth="1.3" />
      <path d="M84,120 C96,110 116,108 130,114" fill="none" stroke={p.bodyDark} strokeOpacity="0.8" strokeWidth="4.6" strokeLinecap="round" />
      <Seam c={c} d="M64,134 C94,136 124,142 150,152" w={2} />
      {/* jaw & tusks */}
      <path d="M64,158 C80,170 104,176 130,172" fill="none" stroke={p.bodyDark} strokeOpacity="0.75" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M76,166 C64,152 62,136 68,122 C72,138 78,152 88,166 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
      <path d="M100,174 C92,162 90,150 94,138 C98,150 102,162 110,174 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
      {/* near pectoral wing, spread wide forward and down */}
      <g className="sl-sway-slow" style={{ transformOrigin: "150px 196px" }}>
        <Fin c={c} a={[176, 212]} t={[54, 292]} b={[138, 194]} rays={5} />
        <path d="M54,292 C40,302 36,318 46,330" fill="none" stroke={p.wingEdge} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" className="sl-undulate" />
      </g>
      <Eye c={c} x={102} y={126} r={9.5} kind="almond" flip angle={20} />
      <Dots c={c} pts={[[160, 196], [188, 208], [216, 222], [242, 236], [264, 254], [284, 274]]} r={2} />
      <Gem c={c} x={124} y={96} s={0.62} />
    </g>
  );
}

export const thalor: Renderer = {
  floating: true,
  shadow: 120,
  halo: [150, -4, 30],
  stageFit: [1.3, 1.12, 1, 0.88],
  render: byStage(eggling, hatchling, evolved, ascended),
};
