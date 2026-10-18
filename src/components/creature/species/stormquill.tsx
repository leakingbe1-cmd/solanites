import { blade, byStage, Eye, Gem, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Stormquill — a tall stilt-legged bird with a crown of lightning quills. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 70,
  halo: [274, 40, 26],
  render: (c) => {
    const { p, u, g } = c;
    const quills = Array.from({ length: 9 }).map((_, i) => {
      const a = -160 + i * 15;
      const l = (26 + 34 * g) * (0.7 + 0.3 * Math.sin((i / 8) * Math.PI));
      return { a, l };
    });
    return (
      <g>
        {/* tail plumes with lightning bars */}
        <g className="sl-sway-slow" style={{ transformOrigin: "160px 238px" }}>
          {[138, 150, 162, 174].map((a, i) => (
            <g key={a} transform={`translate(160 238) rotate(${a})`}>
              <path d={blade(70 + 30 * g - i * 6, 9)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.4" />
              <path d="M30,-3 L38,3 L46,-3 L54,3" fill="none" stroke={p.accent} strokeWidth="1.8" opacity={c.mark} />
            </g>
          ))}
        </g>
        {/* stilt legs: feathered thigh, reverse-bent knee, tapered scaled shin, spread toes */}
        <path d="M206,252 C214,270 222,286 222,300 C220,318 212,334 208,348 L203,348 C206,334 213,318 215,302 C214,290 208,276 200,262 Z" fill={p.bodyDark} />
        <path d="M200,350 L208,348 L220,353 M208,348 L206,356" fill="none" stroke={p.bodyDark} strokeWidth="3" strokeLinecap="round" />
        <path d="M190,250 C186,272 184,290 189,302 C192,318 194,334 195,348 L201,348 C200,334 199,318 196,302 C194,290 198,272 204,256 Z" fill={u("horn")} {...rim(c, 1)} />
        <ellipse cx="190" cy="302" rx="4.2" ry="5" fill={p.horn} {...rim(c, 1)} />
        <path d="M193,312 L197,312 M194,322 L198,322 M194,332 L198,332" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M183,353 L197,349 L212,354 M197,349 L192,357" fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M178,244 C182,262 196,270 210,262 C206,252 196,244 184,242 Z" fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.3" />
        {/* narrow body */}
        <path d="M152,232 C150,198 188,176 226,182 C258,188 268,214 256,236 C240,262 196,272 170,262 C158,256 152,246 152,232 Z" fill={u("body")} {...rim(c)} />
        <path d="M168,214 C196,196 242,200 258,222 C234,238 200,246 170,242 Z" fill={u("wing")} {...rim(c, 1)} />
        <path d="M184,222 C204,216 226,218 244,226 M178,232 C200,230 220,232 236,236" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" />
        <Spec x={200} y={194} rx={20} ry={6} o={0.28} />
        {/* long neck */}
        <path d="M232,190 C250,170 252,150 262,120" fill="none" stroke={p.bodyDark} strokeWidth="19" strokeLinecap="round" />
        <path d="M232,190 C250,170 252,150 262,120" fill="none" stroke={p.body} strokeWidth="14" strokeLinecap="round" />
        <path d="M238,184 C252,166 254,148 262,124" fill="none" stroke={p.belly} strokeOpacity="0.5" strokeWidth="4" transform="translate(3 2)" />
        {/* crown of quills */}
        <g className="sl-sway" style={{ transformOrigin: "268px 96px" }}>
          {quills.map(({ a, l }) => (
            <g key={a} transform={`translate(268 96) rotate(${a})`}>
              <path d={blade(l, 4, 0.9)} fill={u("feather")} />
              <circle cx={l} cy="0" r="2.4" fill={p.accent} filter={u("glow")} />
            </g>
          ))}
        </g>
        {/* head & beak */}
        <path d="M252,100 C258,86 280,84 290,96 C298,108 290,122 276,124 C262,126 250,116 252,100 Z" fill={u("body")} {...rim(c)} />
        <path d="M286,100 L340,108 L288,116 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
        <path d="M262,96 C270,92 280,92 286,98" fill="none" stroke={p.bodyDark} strokeWidth="2.6" strokeLinecap="round" />
        <Eye c={c} x={276} y={104} r={5} kind="round" />
        <Gem c={c} x={238} y={210} s={0.55} />
      </g>
    );
  },
};


/** Fluffy outline: scalloped down puffs around an ellipse, drawn before the body so only their outer halves show. */
function fluff(c: Ctx, cx: number, cy: number, rx: number, ry: number, n: number, r: number, from = 0, to = 360) {
  return Array.from({ length: n }, (_, i) => {
    const a = from + ((to - from) * (i + 0.5)) / n;
    const [x, y] = [round(cx + Math.cos((a * Math.PI) / 180) * rx), round(cy + Math.sin((a * Math.PI) / 180) * ry)];
    return <circle key={i} cx={x} cy={y} r={r} fill={c.u("body")} {...rim(c, 1)} />;
  });
}

/** Lightning bar across a feather, in feather-local coordinates. */
const bolt = (x: number, s = 1) => `M${x},${-3 * s} L${x + 6 * s},${2 * s} L${x + 10 * s},${-2 * s} L${x + 16 * s},${3 * s}`;

/** Eggling: a round fluffy storm-chick with stubby legs and three first quills. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* stubby legs and toes */}
      {[184, 214].map((x) => (
        <g key={x}>
          <path d={`M${x - 5},330 L${x - 4},348 L${x + 4},348 L${x + 5},330 Z`} fill={u("horn")} {...rim(c, 1)} />
          <path d={`M${x - 10},352 L${x},347 L${x + 10},352 M${x},347 L${x + 1},354`} fill="none" stroke={p.horn} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {/* tail tuft */}
      <g className="sl-sway" style={{ transformOrigin: "146px 296px" }}>
        {[160, 176, 192].map((a) => (
          <path key={a} d={blade(22, 7)} transform={`translate(146 296) rotate(${a})`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.35" />
        ))}
      </g>
      {/* downy round body */}
      {fluff(c, 196, 296, 54, 46, 16, 9, 100, 400)}
      <ellipse cx="196" cy="296" rx="56" ry="48" fill={u("body")} />
      <ellipse cx="204" cy="318" rx="34" ry="22" fill={p.belly} opacity="0.55" />
      {/* wing nub */}
      <path d="M156,286 C164,270 186,268 196,282 C194,300 178,312 162,308 C156,302 154,294 156,286 Z" fill={u("wing")} {...rim(c, 1)} />
      <path d="M164,296 L174,300 M168,288 L182,292" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
      <Spec x={186} y={262} rx={26} ry={7} o={0.22} />
      {/* three first quills */}
      <g className="sl-sway" style={{ transformOrigin: "234px 206px" }}>
        {[-120, -95, -70].map((a, i) => (
          <g key={a} transform={`translate(234 206) rotate(${a})`}>
            <path d={blade(i === 1 ? 30 : 22, 4, 0.9)} fill={u("feather")} />
            <circle cx={i === 1 ? 30 : 22} cy="0" r="2.4" fill={p.accent} filter={u("glow")} />
          </g>
        ))}
      </g>
      {/* big round head */}
      {fluff(c, 236, 244, 38, 36, 10, 7, 150, 330)}
      <circle cx="236" cy="244" r="40" fill={u("body")} {...rim(c)} />
      <ellipse cx="248" cy="268" rx="22" ry="12" fill={p.belly} opacity="0.5" />
      <Spec x={224} y={220} rx={18} ry={6} o={0.28} />
      {/* short beak */}
      <path d="M268,240 C280,240 292,244 298,250 C290,254 278,256 268,254 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
      <ellipse cx="262" cy="262" rx="7" ry="4" fill={p.accent} opacity="0.25" />
      <Eye c={c} x={248} y={238} r={11} kind="round" />
      <Gem c={c} x={204} y={300} s={0.45} />
    </g>
  );
}

/** Hatchling: a gangly juvenile on long knobbly legs, wings held out, a partial crest. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean) => (
    <g key={x}>
      <path d={`M${x - 4},248 C${x - 6},266 ${x - 4},280 ${x - 3},292 C${x - 4},310 ${x - 3},330 ${x - 2},348 L${x + 3},348 C${x + 4},330 ${x + 4},310 ${x + 4},292 C${x + 5},280 ${x + 6},266 ${x + 6},248 Z`} fill={near ? u("horn") : p.bodyDark} {...(near ? rim(c, 1) : {})} />
      {/* knobbly knee */}
      <ellipse cx={x} cy="292" rx="6.5" ry="7" fill={near ? p.horn : p.bodyDark} {...(near ? rim(c, 1) : {})} />
      <path d={`M${x - 12},354 L${x},348 L${x + 14},354 M${x},348 L${x - 2},356`} fill="none" stroke={near ? p.horn : p.bodyDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return (
    <g>
      {leg(210, false)}
      {/* short stub tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "152px 232px" }}>
        {[150, 164, 178].map((a, i) => (
          <path key={a} d={blade(34 - i * 4, 8)} transform={`translate(152 232) rotate(${a})`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.35" />
        ))}
      </g>
      {/* far wing, held out */}
      <g opacity="0.75" className="sl-flap" style={{ transformOrigin: "200px 210px" }}>
        {[-150, -132, -114].map((a, i) => (
          <path key={a} d={blade(40 - i * 5, 9)} transform={`translate(202 208) rotate(${a})`} fill={p.bodyDark} />
        ))}
      </g>
      {/* ruffled down along the back */}
      {fluff(c, 190, 226, 42, 32, 9, 7, 170, 350)}
      <ellipse cx="190" cy="228" rx="46" ry="34" fill={u("body")} transform="rotate(-10 190 228)" />
      <path d="M160,250 C176,262 214,262 230,244 C224,256 206,264 188,264 C174,264 164,258 160,250 Z" fill={p.belly} opacity="0.5" />
      <Spec x={184} y={206} rx={22} ry={6} rot={-12} o={0.24} />
      {leg(192, true)}
      {/* near wing, held out from the body */}
      <g className="sl-flap" style={{ transformOrigin: "190px 222px" }}>
        {[-170, -152, -134, -116].map((a, i) => (
          <g key={a} transform={`translate(190 222) rotate(${a})`}>
            <path d={blade(48 - i * 4, 10)} fill={u("wing")} {...rim(c, 1)} />
            <path d={bolt(22, 0.7)} fill="none" stroke={p.accent} strokeWidth="1.4" opacity={c.mark} />
          </g>
        ))}
        <path d="M172,208 C182,200 198,204 202,216 C198,228 186,232 176,226 C170,220 168,214 172,208 Z" fill={u("wing")} {...rim(c, 1)} />
      </g>
      {/* medium neck */}
      <path d="M218,214 C232,198 240,186 248,170" fill="none" stroke={p.bodyDark} strokeWidth="17" strokeLinecap="round" />
      <path d="M218,214 C232,198 240,186 248,170" fill="none" stroke={p.body} strokeWidth="12" strokeLinecap="round" />
      <path d="M224,210 C236,196 242,186 249,174" fill="none" stroke={p.belly} strokeOpacity="0.5" strokeWidth="3.5" transform="translate(3 2)" />
      {/* partial crest of five quills */}
      <g className="sl-sway" style={{ transformOrigin: "252px 146px" }}>
        {[-150, -128, -106, -84, -62].map((a, i) => {
          const l = [22, 32, 40, 30, 20][i];
          return (
            <g key={a} transform={`translate(252 146) rotate(${a})`}>
              <path d={blade(l, 3.5, 0.9)} fill={u("feather")} />
              <circle cx={l} cy="0" r="2.2" fill={p.accent} filter={u("glow")} />
            </g>
          );
        })}
      </g>
      {/* head with a juvenile beak */}
      <circle cx="256" cy="160" r="27" fill={u("body")} {...rim(c)} />
      <path d="M244,180 C252,186 266,186 276,178" fill="none" stroke={p.belly} strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      <path d="M278,154 L312,164 L278,172 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
      <Spec x={248} y={144} rx={12} ry={5} o={0.3} />
      <Eye c={c} x={264} y={156} r={8} kind="round" />
      <Gem c={c} x={214} y={236} s={0.48} />
    </g>
  );
}

/** Ascended: a griffin-like storm sovereign, wings raised, lightning arcing through a vast crest. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // Raised wing: secondaries along the arm, primaries fanning from the wrist; all pointing back and up.
  const wing = (dx: number, dy: number, turn: number, far: boolean) => {
    const S: [number, number] = [196 + dx, 206 + dy];
    const W: [number, number] = [128 + dx, 112 + dy];
    const feathers = Array.from({ length: 10 }, (_, i) => {
      const t = Math.min(i / 5, 1);
      const x = round(S[0] + (W[0] - S[0]) * t);
      const y = round(S[1] + (W[1] - S[1]) * t);
      const a = round((i < 5 ? 168 + i * 12 : 218 + (i - 5) * 13) + turn);
      const l = round(i < 5 ? 58 + i * 6 : 96 - (i - 5) * 4);
      return { x, y, a, l, i };
    }).reverse();
    return (
      <g opacity={far ? 0.8 : 1} className="sl-flap" style={{ transformOrigin: `${S[0]}px ${S[1]}px` }}>
        {feathers.map((f) => (
          <g key={f.i} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`}>
            <path d={blade(f.l, f.i < 5 ? 13 : 11, 0.82)} fill={far ? p.bodyDark : u("wing")} stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1" />
            {!far && (
              <>
                <path d={`M4,0 L${f.l - 6},0`} stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" />
                <path d={bolt(round(f.l * 0.45), 0.9)} fill="none" stroke={p.accent} strokeWidth="1.8" filter={u("glow")} opacity={c.mark} className="sl-rune-pulse" style={{ animationDelay: `${f.i * 0.15}s` }} />
              </>
            )}
          </g>
        ))}
        {/* coverts over the arm */}
        <path d={`M${S[0] + 10},${S[1] + 10} C${S[0] - 20},${S[1] + 4} ${W[0] - 14},${W[1] + 30} ${W[0] - 8},${W[1] - 4} C${W[0] + 10},${W[1] - 14} ${S[0] - 6},${S[1] - 40} ${S[0] + 16},${S[1] - 10} Z`} fill={far ? p.bodyDark : u("feather")} {...(far ? {} : rim(c, 1))} />
        {!far && <path d={`M${W[0] + 2},${W[1] + 4} C${W[0] + 30},${W[1] + 20} ${S[0] - 20},${S[1] - 20} ${S[0] + 6},${S[1] - 4}`} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />}
      </g>
    );
  };
  const crest = Array.from({ length: 11 }, (_, i) => {
    const a = -172 + i * 15;
    const l = round(34 + 44 * Math.sin(((i + 0.5) / 11) * Math.PI));
    return { a, l, tip: polar(262, 110, l, a) };
  });
  const talon = (x: number, near: boolean) => (
    <g key={x}>
      {/* feathered thigh */}
      <path d={`M${x - 16},250 C${x - 20},270 ${x - 14},290 ${x - 4},298 L${x + 10},296 C${x + 16},282 ${x + 16},264 ${x + 10},250 Z`} fill={near ? u("feather") : p.bodyDark} {...(near ? rim(c, 1) : {})} />
      <path d={`M${x - 7},294 C${x - 8},314 ${x - 6},330 ${x - 6},342 L${x + 6},342 C${x + 6},330 ${x + 7},314 ${x + 6},294 Z`} fill={near ? u("horn") : p.bodyDark} {...(near ? rim(c, 1) : {})} />
      {near && <path d={`M${x - 5},306 L${x + 5},306 M${x - 5},316 L${x + 5},316 M${x - 5},326 L${x + 5},326`} stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1" />}
      {/* hooked talons */}
      <path d={`M${x},342 C${x - 10},344 ${x - 18},348 ${x - 22},354 M${x},342 C${x + 10},344 ${x + 20},348 ${x + 24},354 M${x},342 C${x + 2},348 ${x + 4},352 ${x + 6},356`} fill="none" stroke={near ? p.horn : p.bodyDark} strokeWidth="4.5" strokeLinecap="round" />
      {near && <path d={`M${x - 22},354 l-3,4 M${x + 24},354 l3,4 M${x + 6},356 l1,4`} stroke={p.bodyDark} strokeWidth="2.6" strokeLinecap="round" />}
    </g>
  );
  return (
    <g>
      {wing(26, -14, 22, true)}
      {/* long trailing tail plumes */}
      <g className="sl-sway-slow" style={{ transformOrigin: "158px 252px" }}>
        {[150, 160, 170, 180].map((a, i) => (
          <g key={a} transform={`translate(158 252) rotate(${a})`}>
            <path d={blade(120 - i * 12, 11)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.4" />
            <path d={bolt(46 - i * 4)} fill="none" stroke={p.accent} strokeWidth="1.8" opacity={c.mark} filter={u("glow")} />
            <path d={bolt(80 - i * 8)} fill="none" stroke={p.accent} strokeWidth="1.6" opacity={c.mark * 0.8} />
          </g>
        ))}
        <path d="M156,256 C120,280 80,300 40,300 C60,292 72,284 80,276 C100,272 126,262 150,250 Z" fill={u("wing")} stroke={p.wingEdge} strokeOpacity="0.5" />
      </g>
      {talon(226, false)}
      {/* powerful chest */}
      <path d="M146,240 C142,198 184,170 228,174 C264,178 280,206 270,236 C256,270 206,282 176,274 C158,268 148,256 146,240 Z" fill={u("body")} {...rim(c)} />
      <path d="M236,190 C258,198 268,220 260,242 C250,262 228,272 206,274 C232,256 246,226 236,190 Z" fill={p.belly} opacity="0.55" />
      <path d="M232,214 c6,4 10,4 14,0 M226,232 c6,4 10,4 14,0 M216,250 c6,4 10,4 14,0" fill="none" stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="1.4" />
      <Spec x={200} y={186} rx={28} ry={7} rot={-14} o={0.26} />
      {talon(198, true)}
      {wing(0, 0, 0, false)}
      {/* strong arched neck with a ruff */}
      <path d="M232,192 C244,172 248,156 256,136" fill="none" stroke={p.bodyDark} strokeWidth="27" strokeLinecap="round" />
      <path d="M232,192 C244,172 248,156 256,136" fill="none" stroke={p.body} strokeWidth="22" strokeLinecap="round" />
      <path d="M240,188 C250,170 254,156 260,140" fill="none" stroke={p.belly} strokeOpacity="0.5" strokeWidth="6" transform="translate(4 2)" />
      {[[226, 184, 150], [236, 178, 130], [228, 196, 170]].map(([x, y, a]) => (
        <path key={a} d={blade(26, 8)} transform={`translate(${x} ${y}) rotate(${a})`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.35" />
      ))}
      {/* vast lightning crest */}
      <g className="sl-sway" style={{ transformOrigin: "262px 110px" }}>
        {crest.map(({ a, l }) => (
          <g key={a} transform={`translate(262 110) rotate(${a})`}>
            <path d={blade(l, 5, 0.9)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="0.8" />
            <circle cx={l} cy="0" r="3" fill={p.accent} filter={u("glow")} />
          </g>
        ))}
        <g fill="none" stroke={p.accent} strokeWidth="1.5" strokeLinejoin="round" filter={u("glow")} opacity={c.mark} className="sl-twinkle">
          {crest.slice(0, -1).map(({ tip }, i) => {
            const [x1, y1] = tip;
            const [x2, y2] = crest[i + 1].tip;
            const mx = round((x1 + x2) / 2);
            const my = round((y1 + y2) / 2);
            return <path key={i} d={`M${x1},${y1} L${round(mx + (y2 - y1) * 0.15)},${round(my - (x2 - x1) * 0.15)} L${round(mx - (y2 - y1) * 0.1)},${round(my + (x2 - x1) * 0.1)} L${x2},${y2}`} style={{ animationDelay: `${i * 0.2}s` }} />;
          })}
        </g>
      </g>
      {/* fierce head with a hooked raptor beak */}
      <path d="M236,120 C238,98 262,88 280,96 C296,104 300,124 290,138 C280,150 256,152 244,144 C236,138 234,130 236,120 Z" fill={u("body")} {...rim(c)} />
      <path d="M288,108 C304,108 324,114 334,124 C338,130 336,140 330,146 C330,138 326,134 320,132 C310,132 298,134 290,134 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.55" />
      <path d="M292,126 C304,126 316,128 322,132" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1.2" />
      <path d="M262,108 C272,102 286,102 294,108" fill="none" stroke={p.bodyDark} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M246,136 C254,142 270,144 282,140" fill="none" stroke={p.belly} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <Spec x={258} y={100} rx={14} ry={4} rot={-10} o={0.35} />
      <Eye c={c} x={278} y={116} r={6.5} kind="almond" angle={-8} />
      <Gem c={c} x={238} y={214} s={0.62} />
    </g>
  );
}

export const stormquill: Renderer = {
  ...evolved,
  halo: [262, 14, 22],
  stageFit: [1.2, 1.1, 1, 0.9],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
