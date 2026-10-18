import { blade, byStage, Constellation, Dots, Eye, Gem, rim, round, Spec, Tube, type Ctx, type Renderer } from "../kit";

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

/** A small four-point star, used for nubs and orbiting motes. */
function star(x: number, y: number, r: number) {
  const k = round(r * 0.28);
  return `M${x},${y - r} L${x + k},${y - k} L${x + r},${y} L${x + k},${y + k} L${x},${y + r} L${x - k},${y + k} L${x - r},${y} L${x - k},${y - k} Z`;
}

/** Eggling: a newborn fawn lying folded, star-dappled, with two star nubs where antlers will grow. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g transform="translate(-36 0)">
      {/* folded hind leg and haunch */}
      <path d="M150,334 C136,340 122,344 112,348 L114,354 C128,352 144,350 158,346 Z" fill={p.bodyDark} />
      <path d="M112,346 L104,348 L106,355 L116,354 Z" fill={p.accent} opacity="0.85" />
      {/* puff tail */}
      <ellipse cx="124" cy="304" rx="11" ry="8" fill={u("body")} {...rim(c, 1)} transform="rotate(-30 124 304)" />
      <ellipse cx="120" cy="300" rx="5" ry="3.5" fill="#fff" opacity="0.6" transform="rotate(-30 120 300)" />
      {/* lying body */}
      <path d="M120,330 C118,296 160,282 204,282 C250,282 282,296 286,322 C288,342 268,352 236,352 L160,352 C134,352 122,344 120,330 Z" fill={u("body")} {...rim(c)} />
      <path d="M132,338 C170,350 250,352 280,336 C276,348 260,354 236,354 L160,354 C144,354 134,348 132,338 Z" fill={p.belly} opacity="0.35" />
      <ellipse cx="158" cy="320" rx="34" ry="27" fill={u("body")} {...rim(c, 1)} />
      <Spec x={156} y={302} rx={18} ry={5} o={0.35} />
      {/* star dapples along the back */}
      <Dots c={c} pts={[[176, 296], [204, 289], [232, 292], [194, 308], [222, 306], [254, 300], [166, 312]]} r={1.7} color="#fff" />
      <Spec x={214} y={288} rx={40} ry={5} rot={-2} o={0.4} />
      {/* tucked forelegs */}
      <Tube c={c} d="M246,338 C262,344 280,346 298,344" w={10} />
      <path d="M296,339 L306,340 L306,349 L296,349 Z" fill={p.accent} opacity="0.85" />
      {/* neck and big fawn head */}
      <path d="M240,304 C246,278 260,258 276,244 L302,252 C292,268 282,288 278,308 Z" fill={u("body")} {...rim(c)} />
      <path d={blade(30, 10)} transform="translate(286 210) rotate(-165)" fill={u("body")} {...rim(c, 1)} />
      <path d={blade(20, 5)} transform="translate(284 210) rotate(-165)" fill={p.accent} opacity="0.35" />
      <path d="M268,236 C266,210 284,194 306,194 C328,194 340,210 340,226 C352,232 358,242 352,250 C344,258 326,258 312,256 C288,258 270,254 268,236 Z" fill={u("body")} {...rim(c)} />
      <path d={blade(28, 9)} transform="translate(300 202) rotate(-118)" fill={u("body")} {...rim(c, 1)} />
      <path d={blade(18, 4.5)} transform="translate(300 201) rotate(-118)" fill={p.accent} opacity="0.4" />
      <path d="M332,238 C340,244 348,248 352,250 C344,256 330,256 320,254 Z" fill={p.belly} opacity="0.25" />
      <Spec x={300} y={204} rx={16} ry={5} rot={-10} o={0.5} />
      <circle cx="352" cy="244" r="3" fill={p.bodyDark} />
      <Eye c={c} x={310} y={224} r={9.5} kind="round" />
      {/* two star nubs */}
      <g filter={u("glow")} className="sl-twinkle">
        <path d={star(292, 192, 6)} fill="#fff" />
        <path d={star(316, 190, 5)} fill="#fff" style={{ animationDelay: "0.6s" }} />
      </g>
      <Gem c={c} x={268} y={300} s={0.45} />
    </g>
  );
}

/** Hatchling: a leggy young deer on wobbly legs with its first two-point constellation antlers. */
function hatchling(c: Ctx) {
  const { p, u, id } = c;
  const body = "M150,248 C150,226 176,216 208,216 C240,216 264,222 268,242 C272,258 258,272 236,274 C212,278 184,278 166,272 C154,266 150,258 150,248 Z";
  const leg = (d: string, near: boolean, hoof: [number, number]) => (
    <g key={d}>
      {near ? <Tube c={c} d={d} w={8} /> : <path d={d} fill="none" stroke={p.bodyDark} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />}
      <path d={`M${hoof[0] - 5},${hoof[1] - 4} L${hoof[0] + 5},${hoof[1] - 4} L${hoof[0] + 6},${hoof[1] + 3} L${hoof[0] - 6},${hoof[1] + 3} Z`} fill={near ? p.accent : p.bodyDark} opacity={near ? 0.85 : 1} />
    </g>
  );
  return (
    <g transform="translate(-34 0)">
      <defs>
        <clipPath id={`${id}-hatch-flank`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* far legs, splayed a little: still finding its balance */}
      {leg("M180,262 L172,304 L178,346", false, [178, 348])}
      {leg("M244,258 L252,300 L256,346", false, [256, 348])}
      {/* tail tuft */}
      <path d={blade(18, 6)} transform="translate(154 240) rotate(-150)" fill={u("body")} {...rim(c, 1)} className="sl-sway" style={{ transformOrigin: "154px 240px" }} />
      <path d={body} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${id}-hatch-flank)`}>
        <ellipse cx="204" cy="252" rx="40" ry="18" fill={p.belly} opacity="0.7" />
        <rect x="150" y="216" width="120" height="62" fill={u("stars")} opacity="0.8" className="sl-twinkle" />
      </g>
      <Dots c={c} pts={[[178, 230], [204, 224], [232, 226], [192, 238], [252, 234]]} r={1.5} color="#fff" glow={false} />
      <Spec x={206} y={224} rx={36} ry={4} rot={-2} o={0.45} />
      {/* near legs: long and knobbly */}
      {leg("M166,262 C162,284 156,300 160,316 C162,328 164,338 166,346", true, [166, 348])}
      {leg("M236,262 C240,284 246,300 244,316 C244,328 244,338 246,346", true, [246, 348])}
      <circle cx="159" cy="306" r="5" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.35" />
      <circle cx="245" cy="306" r="5" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.35" />
      {/* neck and head, raised and alert */}
      <path d="M242,240 C248,216 260,198 272,184 L292,190 C284,206 276,226 270,250 Z" fill={u("body")} {...rim(c)} />
      <path d="M250,234 C256,214 264,200 274,190" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.4" strokeLinecap="round" />
      <path d={blade(28, 9)} transform="translate(276 172) rotate(-160)" fill={u("body")} {...rim(c, 1)} />
      <path d="M266,182 C272,164 292,158 306,164 C322,172 332,188 330,198 C324,204 310,200 298,196 C284,194 268,194 266,182 Z" fill={u("body")} {...rim(c)} />
      <path d={blade(26, 8)} transform="translate(284 166) rotate(-112)" fill={u("body")} {...rim(c, 1)} />
      <path d={blade(16, 4)} transform="translate(284 165) rotate(-112)" fill={p.accent} opacity="0.4" />
      <Spec x={292} y={168} rx={13} ry={4} rot={12} o={0.5} />
      <circle cx="329" cy="194" r="2.4" fill={p.bodyDark} />
      <Eye c={c} x={294} y={180} r={7} kind="round" />
      {/* first constellation antlers: two points each */}
      <g className="sl-sway-slow" style={{ transformOrigin: "290px 164px" }}>
        <Constellation c={c} pts={[[286, 164], [280, 144], [270, 128]]} />
        <Constellation c={c} pts={[[280, 144], [292, 132]]} />
        <Constellation c={c} pts={[[298, 162], [306, 142], [318, 130]]} />
      </g>
      <Gem c={c} x={258} y={232} s={0.45} />
    </g>
  );
}

/** Ascended: a rearing celestial stag with a vast constellation crown, nebula mane and a cape of stars. */
function ascended(c: Ctx) {
  const { p, u, id } = c;
  const body = "M120,262 C112,232 140,206 180,192 C214,180 250,170 274,180 C294,190 296,214 284,234 C270,256 236,270 204,280 C170,290 128,290 120,262 Z";
  const cape = "M262,176 C220,170 170,188 132,214 C104,232 84,262 70,300 C88,288 104,284 118,288 C110,300 104,314 102,330 C122,310 140,296 160,286 C140,270 128,248 138,228 C170,204 214,186 262,176 Z";
  return (
    <g transform="translate(-20 0)">
      <defs>
        <clipPath id={`${id}-asc-flank`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${id}-asc-cape`}>
          <path d={cape} />
        </clipPath>
      </defs>
      {/* starry cape trailing from the shoulders */}
      <g className="sl-sway-slow" style={{ transformOrigin: "250px 180px" }}>
        <path d={cape} fill={u("fin")} stroke={p.accent} strokeOpacity="0.55" />
        <g clipPath={`url(#${id}-asc-cape)`}>
          <path d={cape} fill={p.belly} opacity="0.55" />
          <rect x="60" y="160" width="220" height="180" fill={u("stars")} className="sl-twinkle" />
        </g>
        <path d="M250,180 C206,186 164,204 136,226" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
      </g>
      {/* far hind leg */}
      <path d="M176,270 C166,292 150,306 156,322 C160,334 166,342 168,348 L178,348 C176,338 172,326 170,316 C168,304 186,292 190,276 Z" fill={p.bodyDark} />
      {/* far foreleg, raised */}
      <Tube c={c} d="M282,226 L318,222 L328,258" w={10} fill={p.bodyDark} />
      <path d="M322,256 L334,256 L336,266 L324,266 Z" fill={p.bodyDark} />
      {/* body */}
      <path d={body} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${id}-asc-flank)`}>
        <ellipse cx="200" cy="246" rx="60" ry="28" fill={p.belly} opacity="0.8" transform="rotate(-18 200 246)" />
        <ellipse cx="190" cy="240" rx="36" ry="16" fill={p.accent} opacity="0.3" transform="rotate(-18 190 240)" />
        <rect x="110" y="170" width="190" height="120" fill={u("stars")} className="sl-twinkle" />
      </g>
      <Spec x={214} y={190} rx={46} ry={5} rot={-18} o={0.45} />
      {/* near hind leg: powerful thigh, hock and hoof */}
      <ellipse cx="150" cy="262" rx="32" ry="38" fill={u("body")} {...rim(c)} transform="rotate(-20 150 262)" />
      <path d="M140,286 C132,302 122,314 128,326 C132,336 138,342 140,346 L152,346 C150,338 146,328 146,320 C146,308 160,298 166,284 Z" fill={u("body")} {...rim(c, 1)} />
      <path d="M136,344 L154,344 L156,354 L134,354 Z" fill={p.accent} opacity="0.9" />
      <Spec x={142} y={238} rx={14} ry={5} rot={-40} o={0.35} />
      {/* wispy tail */}
      <path d="M124,248 C100,246 86,262 80,282 C94,272 108,268 122,268 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" className="sl-sway" style={{ transformOrigin: "124px 256px" }} />
      {/* near foreleg, raised and folded */}
      <Tube c={c} d="M262,222 L300,212 L306,250" w={11} />
      <path d="M300,248 L313,248 L315,259 L301,259 Z" fill={p.accent} opacity="0.9" />
      {/* nebula mane */}
      <g className="sl-sway-slow" style={{ transformOrigin: "290px 110px" }}>
        <path d="M296,94 C270,112 256,150 232,176 C266,174 284,144 300,118 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.7" />
        <path d="M290,124 C268,144 256,176 226,196 C262,194 282,168 298,146 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.5" />
        <path d="M284,152 C266,170 252,196 224,212 C256,210 276,190 292,172 Z" fill={u("fin")} stroke={p.accent} strokeOpacity="0.35" />
        <Dots c={c} pts={[[270, 140], [256, 168], [282, 120], [246, 190]]} r={1.6} color="#fff" />
      </g>
      {/* neck and head held high */}
      <path d="M240,198 C248,160 264,128 282,102 L312,110 C304,140 296,172 290,212 C276,220 252,214 240,198 Z" fill={u("body")} {...rim(c)} />
      <path d="M250,192 C258,160 270,132 286,110" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      <path d={blade(30, 9)} transform="translate(294 92) rotate(-150)" fill={u("body")} {...rim(c, 1)} />
      <path d="M282,98 C292,82 316,80 330,88 C346,98 358,114 356,126 C350,132 334,128 318,122 C302,120 284,112 282,98 Z" fill={u("body")} {...rim(c)} />
      <path d="M338,110 C346,114 354,120 355,125 C348,128 336,124 330,120 Z" fill={p.belly} opacity="0.6" />
      <Spec x={308} y={88} rx={15} ry={4} rot={10} o={0.5} />
      <circle cx="354" cy="122" r="2.4" fill={p.bodyDark} />
      <Eye c={c} x={314} y={100} r={5.5} kind="orb" />
      {/* the vast constellation crown */}
      <g className="sl-sway-slow" style={{ transformOrigin: "306px 86px" }}>
        <Constellation c={c} pts={[[298, 86], [286, 58], [262, 36], [238, 26]]} />
        <Constellation c={c} pts={[[286, 58], [258, 62], [234, 74]]} />
        <Constellation c={c} pts={[[262, 36], [254, 14]]} />
        <Constellation c={c} pts={[[258, 62], [244, 50]]} />
        <Constellation c={c} pts={[[316, 84], [334, 58], [356, 40], [382, 34]]} />
        <Constellation c={c} pts={[[334, 58], [340, 30], [348, 12]]} />
        <Constellation c={c} pts={[[356, 40], [374, 58], [390, 64]]} />
        <g filter={u("glow")} className="sl-twinkle">
          <path d={star(238, 26, 6)} fill="#fff" />
          <path d={star(348, 12, 6)} fill="#fff" style={{ animationDelay: "0.5s" }} />
          <path d={star(382, 34, 5)} fill="#fff" style={{ animationDelay: "1s" }} />
        </g>
      </g>
      {/* orbiting stars */}
      <g className="sl-spin-slow" style={{ transformOrigin: "220px 200px" }}>
        {[0, 72, 144, 216, 288].map((a, i) => {
          const r = 150;
          const x = round(220 + Math.cos((a * Math.PI) / 180) * r);
          const y = round(200 + Math.sin((a * Math.PI) / 180) * r * 0.45);
          return <path key={a} d={star(x, y, 3.5)} fill={i % 2 ? p.accent : "#fff"} opacity="0.85" filter={u("glow")} />;
        })}
      </g>
      <Gem c={c} x={270} y={206} s={0.6} />
    </g>
  );
}

export const astravex: Renderer = {
  ...evolved,
  halo: [290, 40, 20],
  stageFit: [1.3, 1.25, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
