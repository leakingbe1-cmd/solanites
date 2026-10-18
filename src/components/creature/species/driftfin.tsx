import { byStage, Dots, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Driftfin — long, legless eel with translucent sail fins. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  floating: true,
  fit: 0.94,
  shadow: 120,
  halo: [70, 132, 26],
  render: (c) => {
    const { p, u, g } = c;
    const sail = 0.6 + 0.4 * g;
    return (
      <g transform="translate(0 18)">
        {/* sails & fins behind the body */}
        <g className="sl-sway-slow" style={{ transformOrigin: "150px 170px" }}>
          <g transform={`translate(150 170) scale(1 ${sail}) translate(-150 -170)`}>
            <path d="M104,168 C104,118 140,92 172,112 C184,122 192,146 198,180 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
            <path d="M118,160 L128,112 M140,164 L152,104 M162,170 L170,114 M180,176 L186,128" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.2" />
          </g>
        </g>
        <g transform={`translate(280 190) scale(1 ${sail}) translate(-280 -190)`}>
          <path d="M246,186 C252,148 286,136 306,158 C314,170 318,192 322,222 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
          <path d="M262,186 L272,150 M282,194 L292,148 M300,206 L306,160" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.2" />
        </g>
        <path d="M178,224 C176,252 196,272 220,270 C212,256 212,244 216,232 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
        <g className="sl-sway" style={{ transformOrigin: "374px 224px" }}>
          <path d="M372,224 C380,196 398,186 398,204 C394,214 390,220 388,224 C392,230 398,242 398,252 C394,264 380,254 372,226 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        </g>
        {/* body */}
        <path
          d="M96,168 C138,126 188,206 234,188 C282,170 306,236 352,232 C364,231 372,226 380,220 L382,228 C374,240 364,250 350,252 C300,258 280,212 234,232 C186,252 136,178 98,212 Z"
          fill={u("body")}
          {...rim(c)}
        />
        <path d="M100,206 C140,172 186,244 234,226 C282,208 304,250 350,246" fill="none" stroke={p.belly} strokeWidth="5" strokeOpacity="0.55" strokeLinecap="round" />
        <path d="M100,178 C140,140 186,212 234,196 C282,180 304,240 350,236" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
        <g opacity={c.mark}>
          <Dots c={c} r={2.2} pts={[[124, 184], [152, 178], [180, 196], [208, 206], [238, 206], [266, 212], [294, 228], [322, 240], [348, 240]]} />
        </g>
        {/* pectoral fin */}
        <path d="M100,206 C94,232 106,252 132,258 C124,242 124,226 128,212 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        {/* head */}
        <path d="M96,172 C92,146 104,128 118,122 C114,142 114,160 108,178 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M92,170 C104,166 116,170 124,180 L122,204 C112,210 100,212 92,210 Z" fill={p.body} />
        <path d="M102,170 C80,158 52,158 34,174 C26,182 28,192 38,196 C56,204 84,210 104,212 Z" fill={u("body")} {...rim(c)} />
        <path d="M96,176 C102,186 102,198 96,208" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M36,194 C54,202 82,208 102,210 L102,200 C80,200 58,196 40,188 Z" fill={p.belly} opacity="0.85" />
        <Spec x={66} y={168} rx={20} ry={5} rot={-8} o={0.3} />
        <path d="M42,196 C40,212 46,224 56,230" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" className="sl-sway" style={{ transformOrigin: "42px 196px" }} />
        <Eye c={c} x={64} y={180} r={6.5} kind="round" />
        <Gem c={c} x={88} y={172} s={0.5} />
      </g>
    );
  },
};


/** Eggling: a round-headed tadpole with fin buds and a short wriggling tail — no sails yet. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* tail membrane behind the tail */}
      <g className="sl-sway" style={{ transformOrigin: "214px 204px" }}>
        <path d="M206,186 C250,170 292,176 334,196 C292,218 252,236 206,224 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.55" />
        <path d="M206,190 C246,186 286,190 326,198 C286,206 246,214 206,220 Z" fill={u("body")} {...rim(c, 1)} />
        <path d="M214,196 C250,194 284,196 316,198" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* big round head-body */}
      <ellipse cx="166" cy="204" rx="58" ry="48" fill={u("body")} {...rim(c)} />
      <path d="M118,222 C138,248 196,250 220,224 C214,246 190,254 166,254 C142,254 124,242 118,222 Z" fill={p.belly} opacity="0.85" />
      <Spec x={160} y={170} rx={30} ry={9} rot={-8} o={0.32} />
      {/* fin buds */}
      <path d="M176,240 C170,256 178,266 192,266 C190,256 192,248 196,240 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      <path d="M170,158 C172,148 180,142 190,142 C186,150 186,156 188,162 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      {/* face */}
      <path d="M116,220 C122,226 130,228 138,224" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="160" cy="222" rx="8" ry="4.5" fill={p.accent} opacity="0.25" />
      <Eye c={c} x={140} y={196} r={12} kind="round" />
      <Dots c={c} r={1.8} pts={[[190, 196], [204, 214], [184, 228]]} />
      <Gem c={c} x={170} y={172} s={0.45} />
    </g>
  );
}

/** Hatchling: a lengthening young eel-fish with one small dorsal fin, real pectorals and a little fan tail. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* far pectoral */}
      <path d="M150,222 C150,244 160,258 176,262 C172,248 172,236 174,224 Z" fill={p.bodyDark} opacity="0.55" />
      {/* small dorsal fin */}
      <g className="sl-sway-slow" style={{ transformOrigin: "214px 186px" }}>
        <path d="M184,186 C190,156 218,146 236,160 C242,168 246,180 248,192 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M198,184 L206,160 M216,186 L224,156 M234,190 L238,166" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.1" />
      </g>
      {/* fan tail */}
      <g className="sl-sway" style={{ transformOrigin: "326px 214px" }}>
        <path d="M322,214 C340,186 362,178 368,190 C362,200 356,208 354,214 C358,222 366,232 366,242 C358,252 340,240 322,216 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M330,214 L360,190 M332,214 L362,214 M330,216 L360,238" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1" />
      </g>
      {/* body: thick at the head, tapering with one gentle wave */}
      <path d="M92,190 C120,176 160,180 200,186 C250,194 290,196 326,208 L326,220 C290,222 254,228 204,230 C164,232 120,234 92,224 Z" fill={u("body")} {...rim(c)} />
      <path d="M100,222 C140,228 190,226 230,222 C270,218 300,216 322,216" fill="none" stroke={p.belly} strokeWidth="6" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M110,186 C150,180 200,188 250,196 C280,200 300,204 318,208" fill="none" stroke="#fff" strokeOpacity="0.24" strokeWidth="3.5" strokeLinecap="round" />
      <g opacity={c.mark}>
        <Dots c={c} r={2} pts={[[160, 204], [196, 206], [232, 208], [268, 210]]} />
      </g>
      {/* near pectoral */}
      <path d="M124,220 C118,246 132,264 156,268 C148,252 148,236 152,222 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      <path d="M130,226 L138,256 M140,224 L148,260" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1" />
      {/* head */}
      <path d="M118,178 C96,168 66,170 48,186 C40,194 42,206 52,212 C70,222 98,228 120,226 Z" fill={u("body")} {...rim(c)} />
      <path d="M50,210 C68,220 96,224 118,222 L118,214 C96,214 72,210 54,202 Z" fill={p.belly} opacity="0.85" />
      <path d="M112,184 C118,196 118,210 112,220" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
      <Spec x={82} y={182} rx={20} ry={5} rot={-6} o={0.32} />
      {/* whisker nubs */}
      <path d="M52,208 C46,214 44,220 46,226 M60,212 C58,218 58,222 60,228" fill="none" stroke={p.accent} strokeWidth="2.2" strokeLinecap="round" />
      <Eye c={c} x={80} y={194} r={8.5} kind="round" />
      <Gem c={c} x={104} y={186} s={0.48} />
    </g>
  );
}

/** Ascended: a sea dragon rising in an S-curl, trailing long veil fins, crest, whiskers and tail streamers. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // Body as tapering tube segments: every outline first, then every fill, so joints don't seam.
  const segs: [string, number][] = [
    ["M132,144 C168,134 196,138 214,152", 32],
    ["M214,152 C236,168 244,186 240,208", 36],
    ["M240,208 C236,240 198,244 186,272", 32],
    ["M186,272 C176,302 214,326 262,320", 24],
    ["M262,320 C298,316 326,300 350,276", 14],
  ];
  return (
    <g>
      {/* far pectoral veil */}
      <path d="M200,166 C196,206 186,238 168,262 C192,250 214,222 222,180 Z" fill={p.bodyDark} opacity="0.5" />
      {/* long flowing dorsal veil along the outside of the curl */}
      <g className="sl-sway-slow" style={{ transformOrigin: "230px 170px" }}>
        <path d="M150,124 C170,82 236,74 272,116 C298,148 298,206 270,244 C262,214 256,178 232,154 C210,134 180,124 150,124 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M172,124 L182,94 M196,130 L214,90 M218,140 L246,100 M236,156 L274,126 M248,180 L288,166 M254,206 L286,206" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1.1" />
      </g>
      {/* lower veil under the coil */}
      <path d="M180,286 C150,306 150,336 178,350 C196,342 214,334 230,324 C206,318 188,304 180,286 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.55" />
      {/* tail streamers */}
      <g className="sl-sway" style={{ transformOrigin: "348px 278px" }}>
        <path d="M346,280 C356,250 372,226 392,214 C384,236 374,258 352,284 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M348,282 C368,272 386,270 396,280 C382,284 368,286 350,288 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        <path d="M346,286 C358,300 366,318 364,338 C354,320 346,306 340,292 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
      </g>
      <g fill="none" strokeLinecap="round">
        {segs.map(([d, w]) => <path key={`o${d}`} d={d} stroke={p.bodyDark} strokeWidth={w + 5} />)}
        {segs.map(([d, w]) => <path key={`f${d}`} d={d} stroke={p.body} strokeWidth={w} />)}
        {segs.map(([d, w]) => <path key={`b${d}`} d={d} stroke={p.belly} strokeOpacity="0.4" strokeWidth={round(w * 0.3)} transform={`translate(${round(-w * 0.12)} ${round(w * 0.2)})`} />)}
        {segs.map(([d, w]) => <path key={`l${d}`} d={d} stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth={round(w * 0.26)} transform={`translate(${round(w * 0.06)} ${round(-w * 0.22)})`} />)}
        {segs.map(([d, w]) => <path key={`s${d}`} d={d} stroke="#fff" strokeOpacity="0.25" strokeWidth={round(w * 0.08)} transform={`translate(${round(w * 0.08)} ${round(-w * 0.3)})`} />)}
      </g>
      <g opacity={c.mark}>
        <Dots c={c} r={2.3} pts={[[176, 140], [208, 148], [230, 170], [236, 200], [226, 226], [204, 244], [190, 270], [196, 298], [222, 314], [252, 316], [282, 310], [312, 298], [336, 284]]} />
      </g>
      {/* near pectoral veil, long and trailing */}
      <g className="sl-sway-slow" style={{ transformOrigin: "176px 158px" }}>
        <path d="M168,152 C152,190 124,226 92,256 C130,248 166,214 190,166 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.65" />
        <path d="M172,164 L122,232 M180,166 L142,232 M186,170 L162,220" stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="1" />
      </g>
      {/* head, drawn larger than the neck so it reads as a dragon's skull */}
      <g transform="translate(150 140) scale(1.2) translate(-150 -140)">
        {/* swept-back crest spines */}
        <g className="sl-sway-slow" style={{ transformOrigin: "130px 112px" }}>
          {[
            "M112,110 C116,86 128,68 146,56 C142,76 136,94 130,114 Z",
            "M126,112 C136,92 152,80 172,74 C162,90 152,104 144,120 Z",
            "M138,120 C152,106 170,100 190,100 C176,110 164,120 154,132 Z",
          ].map((d) => (
            <path key={d} d={d} fill={u("fin")} stroke={p.accent} strokeOpacity="0.75" />
          ))}
        </g>
        <path d="M156,132 C136,106 98,100 70,110 C52,116 44,130 50,140 C64,156 108,164 150,156 Z" fill={u("body")} {...rim(c)} />
        <path d="M52,140 C70,152 108,158 148,152 L150,144 C112,148 78,144 56,132 Z" fill={p.belly} opacity="0.85" />
        <path d="M140,120 C148,130 150,142 144,154" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
        {/* brow ridge sweeping into a short horn */}
        <path d="M80,114 C96,104 118,102 136,104 C148,104 158,98 166,90 C160,104 150,112 134,114 C116,114 98,114 80,114 Z" fill={p.horn} stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1" />
        <Spec x={88} y={120} rx={18} ry={4} rot={-6} o={0.34} />
        <ellipse cx="56" cy="128" rx="3" ry="2.2" fill={p.bodyDark} />
        <g className="sl-sway" style={{ transformOrigin: "54px 140px" }} fill="none" strokeLinecap="round">
          <path d="M54,140 C38,160 46,190 28,214" stroke={p.accent} strokeWidth="2" />
          <path d="M66,146 C58,170 70,196 58,224" stroke={p.accent} strokeWidth="1.7" opacity="0.8" />
        </g>
        <Eye c={c} x={96} y={126} r={7} kind="almond" angle={-4} />
        {/* gill frill hides the skull/neck joint */}
        <g className="sl-sway-slow" style={{ transformOrigin: "146px 136px" }}>
          <path d="M140,112 C158,116 170,132 168,156 C160,150 152,148 142,150 C148,138 146,124 140,112 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.7" />
          <path d="M146,122 L162,138 M146,134 L164,148" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="0.9" />
        </g>
      </g>
      <Gem c={c} x={166} y={150} s={0.6} />
    </g>
  );
}

export const driftfin: Renderer = {
  ...evolved,
  halo: [104, 44, 22],
  stageFit: [1.3, 1.05, 0.94, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
