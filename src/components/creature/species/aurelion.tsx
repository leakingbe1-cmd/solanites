import { blade, byStage, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Aurelion — the one true great dragon: rearing, crowned, with a vast wingspan. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 110,
  halo: [200, 26, 34],
  render: (c) => {
    const { p, u, g } = c;
    const ws = 0.62 + 0.38 * g;
    // Wing with real structure: shoulder → elbow → wrist, fingers fanning to scalloped membrane.
    const wing = (
      <g transform={`translate(176 200) scale(${ws}) translate(-176 -200)`}>
        <g className="sl-flap" style={{ transformOrigin: "176px 200px" }}>
          <path
            d="M178,202 C162,176 142,156 128,146 C116,132 106,116 98,106 C72,94 48,80 22,70 C34,96 36,124 30,150 C46,146 60,156 66,172 C82,166 100,174 108,190 C124,186 142,194 150,208 C160,208 170,212 178,224 Z"
            fill={u("wing")}
            {...rim(c)}
          />
          <path d="M98,106 C76,130 60,150 44,176 M98,106 C88,140 82,160 72,180" fill="none" stroke={p.wingEdge} strokeOpacity="0.25" strokeWidth="1" />
          <g fill="none" strokeLinecap="round" stroke={p.bodyDark} strokeOpacity="0.7">
            <path d="M178,202 C160,178 140,158 128,146 C118,134 106,118 98,106" strokeWidth="5" />
            <path d="M98,106 C72,94 48,80 22,70 M98,106 C70,124 46,140 30,150 M98,106 C88,132 76,152 66,172 M128,146 C122,162 114,176 108,190" strokeWidth="2.2" />
          </g>
          <path d="M178,202 C160,178 140,158 128,146 C118,134 106,118 98,106" fill="none" stroke={p.bodyLight} strokeOpacity="0.5" strokeWidth="1.4" />
          <path d="M98,106 l-5,-11 l9,5 Z" fill={p.horn} />
        </g>
      </g>
    );
    const seam = (y: number, w: number) => `M${200 - w},${y} C${200 - w * 0.5},${y + 7} ${200 + w * 0.5},${y + 7} ${200 + w},${y}`;
    return (
      <g>
        {/* tail */}
        <g className="sl-sway-slow" style={{ transformOrigin: "226px 318px" }}>
          <path d="M222,322 C268,350 332,350 352,318 C362,298 352,280 336,286 C346,300 336,316 316,320 C282,326 252,320 228,306 Z" fill={u("body")} {...rim(c)} />
          <path d="M240,330 C280,344 324,340 344,316" fill="none" stroke={p.bodyLight} strokeOpacity="0.4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M336,286 C334,276 334,268 338,262 C342,270 348,272 356,270 C352,278 350,284 352,290 Z" fill={p.horn} />
        </g>
        {wing}
        <g transform={MIRROR}>{wing}</g>
        {/* haunches and forward-set feet */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined}>
            <path d="M172,276 C146,280 132,302 134,326 C136,342 150,352 170,352 C186,352 196,342 194,326 C192,304 186,288 172,276 Z" fill={u("body")} {...rim(c)} />
            <path d="M146,300 C142,314 144,330 154,340" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
            <path d="M144,346 C144,338 158,334 172,336 C184,338 188,346 184,352 L148,352 C145,351 144,349 144,346 Z" fill={u("body")} {...rim(c, 1)} />
            {[150, 160, 170, 180].map((x) => (
              <path key={x} d={`M${x - 3},351 C${x - 2},356 ${x + 1},358 ${x + 3},352`} fill={p.horn} />
            ))}
          </g>
        ))}
        {/* torso */}
        <path d="M200,166 C232,168 250,198 252,238 C254,272 246,302 230,322 C222,334 212,342 200,344 C188,342 178,334 170,322 C154,302 146,272 148,238 C150,198 168,168 200,166 Z" fill={u("body")} {...rim(c)} />
        {/* armoured chest panel: one tapering plate with curved seams */}
        <path d="M200,194 C222,196 232,226 232,258 C232,290 222,318 200,332 C178,318 168,290 168,258 C168,226 178,196 200,194 Z" fill={p.belly} {...rim(c, 1)} />
        {[214, 234, 254, 274, 294, 312].map((y, i) => {
          const w = 30 - Math.abs(i - 2.2) * 3.2;
          return (
            <g key={y}>
              <path d={seam(y, w)} fill="none" stroke={p.bodyDark} strokeOpacity="0.38" strokeWidth="1.4" />
              <path d={seam(y + 2, w - 2)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
            </g>
          );
        })}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.3" fill="none" className="sl-rune-pulse">
          <path d="M196,240 L200,232 L204,240 M196,282 L200,290 L204,282" />
        </g>
        <Spec x={186} y={210} rx={10} ry={40} rot={8} o={0.18} />
        {/* forelimbs */}
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined}>
            <path d="M176,208 C154,218 146,244 150,266 C152,278 160,286 170,290 C178,292 186,288 186,282 C178,278 172,270 172,260 C172,246 178,232 190,222 Z" fill={u("body")} {...rim(c)} />
            {[166, 174, 182].map((x) => (
              <path key={x} d={`M${x - 2},287 C${x - 1},293 ${x + 2},295 ${x + 3},289`} fill={p.horn} />
            ))}
          </g>
        ))}
        {/* tapered neck */}
        <path d="M184,182 C182,160 186,134 192,112 L208,112 C214,134 218,160 216,182 C210,190 190,190 184,182 Z" fill={u("body")} {...rim(c)} />
        {[124, 140, 156, 170].map((y) => (
          <path key={y} d={`M${192 - (y - 112) * 0.05},${y} C196,${y + 4} 204,${y + 4} ${208 + (y - 112) * 0.05},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.3" />
        ))}
        {/* crown */}
        <g transform={`translate(200 70) scale(${0.6 + 0.4 * g}) translate(-200 -70)`}>
          {[0, 1].map((m) => (
            <g key={m} transform={m ? MIRROR : undefined}>
              <path d="M180,70 C168,48 152,34 126,24 C142,44 152,62 164,88 Z" fill={u("horn")} {...rim(c, 1)} />
              <path d="M172,64 C162,50 150,40 136,32" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
              <path d="M190,62 C188,50 188,40 192,30 C196,40 198,52 198,60 Z" fill={u("horn")} {...rim(c, 1)} />
            </g>
          ))}
        </g>
        {/* head */}
        <path d="M200,54 C222,54 238,68 240,86 C242,102 234,114 224,124 C216,134 210,144 200,148 C190,144 184,134 176,124 C166,114 158,102 160,86 C162,68 178,54 200,54 Z" fill={u("body")} {...rim(c)} />
        {[0, 1].map((m) => (
          <path key={m} d="M164,96 C154,94 146,98 140,104 C150,104 158,106 166,110 Z" transform={m ? MIRROR : undefined} fill={p.horn} />
        ))}
        <path d="M184,116 C190,108 210,108 216,116 C220,130 210,142 200,148 C190,142 180,130 184,116 Z" fill={p.belly} />
        <path d="M188,134 C194,138 206,138 212,134" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M192,126 l-2,3 M208,126 l2,3" stroke={p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M170,82 C178,76 190,78 196,86 M230,82 C222,76 210,78 204,86" fill="none" stroke={p.bodyDark} strokeWidth="3.2" strokeLinecap="round" />
        <Spec x={192} y={64} rx={16} ry={5} o={0.38} />
        <Eye c={c} x={184} y={92} r={5.6} kind="almond" angle={12} flip />
        <Eye c={c} x={216} y={92} r={5.6} kind="almond" angle={-12} />
        <Gem c={c} x={200} y={72} s={0.6} />
      </g>
    );
  },
};

/** Eggling: a round golden whelp lying curled, with tiny wing nubs and its tail tucked round. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* tail curled round the front, ending in a soft tuft */}
      <path d="M292,334 C322,340 326,358 298,360 C254,364 196,364 150,358" fill="none" stroke={p.bodyDark} strokeWidth="17" strokeLinecap="round" strokeOpacity="0.55" />
      <path d="M292,334 C322,340 326,358 298,360 C254,364 196,364 150,358" fill="none" stroke={p.body} strokeWidth="13" strokeLinecap="round" />
      <g className="sl-sway" style={{ transformOrigin: "150px 358px" }}>
        {[-170, -150, 170].map((a) => (
          <path key={a} d={blade(18, 7)} transform={`translate(152 358) rotate(${a})`} fill={p.bodyLight} {...rim(c, 1)} />
        ))}
      </g>
      {/* lying body */}
      <path d="M170,330 C170,296 200,278 240,278 C282,278 308,300 308,326 C308,346 292,354 264,354 L196,354 C180,354 170,346 170,330 Z" fill={u("body")} {...rim(c)} />
      <path d="M186,340 C214,352 270,352 298,340 C290,352 278,356 264,356 L198,356 C190,354 188,348 186,340 Z" fill={p.belly} opacity="0.6" />
      <g fill={p.bodyLight} opacity="0.65">
        {[
          [214, 288, 5],
          [236, 282, 6],
          [282, 292, 4.5],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} />
        ))}
      </g>
      <Spec x={246} y={292} rx={34} ry={6} rot={-4} o={0.22} />
      {/* folded wing nub */}
      <g className="sl-sway-slow" style={{ transformOrigin: "244px 298px" }}>
        <path d="M234,300 C238,278 254,266 274,264 C270,274 272,282 280,288 C266,290 254,294 246,304 Z" fill={u("wing")} {...rim(c, 1)} />
        <path d="M244,296 C252,284 262,276 272,270" fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1.2" />
      </g>
      {/* tucked forepaws */}
      {[
        [138, 350],
        [170, 352],
      ].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y - 4} rx="16" ry="9" fill={u("body")} {...rim(c, 1)} />
          {[-6, 0, 6].map((d) => (
            <path key={d} d={`M${x - 12 + d},${y + 2} l-2,4`} stroke={p.horn} strokeWidth="2" strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* big head */}
      <circle cx="132" cy="252" r="12" fill={u("body")} {...rim(c, 1)} />
      <circle cx="132" cy="252" r="6" fill={p.belly} opacity="0.7" />
      <circle cx="150" cy="300" r="46" fill={u("body")} {...rim(c)} />
      <circle cx="178" cy="262" r="11" fill={u("body")} {...rim(c, 1)} />
      <circle cx="178" cy="262" r="5" fill={p.belly} opacity="0.7" />
      {/* horn nubs */}
      <path d="M156,258 C158,248 162,242 168,240 C166,248 166,254 164,260 Z" fill={u("horn")} {...rim(c, 1)} />
      <ellipse cx="120" cy="318" rx="22" ry="15" fill={p.belly} />
      <ellipse cx="104" cy="312" rx="4" ry="3" fill={p.bodyDark} />
      <path d="M106,326 C112,330 122,330 128,326" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="166" cy="318" rx="9" ry="5" fill={p.accent} opacity="0.35" />
      <Spec x={146} y={268} rx={22} ry={8} o={0.3} />
      <Eye c={c} x={138} y={296} r={11} kind="round" />
      <Gem c={c} x={152} y={270} s={0.42} />
    </g>
  );
}

/** Hatchling: a lion-dragon cub on four legs, with small feathered wings, short horns and a first mane. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean, back: boolean) => (
    <g key={`${x}${near}`}>
      {back && <ellipse cx={x + 4} cy="276" rx="26" ry="24" fill={near ? u("body") : p.bodyDark} {...(near ? rim(c) : {})} />}
      <path
        d={`M${x - 10},282 C${x - 12},304 ${x - 11},324 ${x - 12},340 C${x - 18},343 ${x - 18},352 ${x - 8},352 L${x + 10},352 C${x + 16},352 ${x + 14},344 ${x + 9},341 C${x + 9},324 ${x + 11},304 ${x + 11},282 Z`}
        fill={near ? u("body") : p.bodyDark}
        {...(near ? rim(c, 1) : {})}
      />
      {near && [-8, -2, 4].map((d) => <path key={d} d={`M${x + d - 4},352 l-2,4`} stroke={p.horn} strokeWidth="2.2" strokeLinecap="round" />)}
    </g>
  );
  // Small feathered wing: a fan of rounded flight feathers from the shoulder.
  const wing = (near: boolean) => (
    <g transform={near ? undefined : "translate(16 -6)"} opacity={near ? 1 : 0.7}>
      <g className="sl-flap" style={{ transformOrigin: "212px 238px" }}>
        {[
          [-118, 40],
          [-96, 50],
          [-74, 54],
          [-52, 48],
          [-32, 38],
        ].map(([a, l]) => (
          <path key={a} d={blade(l, 10, 0.7)} transform={`translate(212 238) rotate(${a})`} fill={near ? u("feather") : p.bodyDark} stroke={near ? p.wingEdge : p.bodyDark} strokeOpacity="0.7" strokeWidth="1" />
        ))}
        <ellipse cx="214" cy="234" rx="14" ry="10" fill={near ? u("wing") : p.bodyDark} {...rim(c, 1)} />
      </g>
    </g>
  );
  return (
    <g>
      {leg(160, false, false)}
      {leg(262, false, true)}
      {/* long tail with a tuft */}
      <g className="sl-sway-slow" style={{ transformOrigin: "296px 262px" }}>
        <path d="M292,262 C322,268 336,250 340,226 C342,212 350,204 358,204" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="13" strokeLinecap="round" />
        <path d="M292,262 C322,268 336,250 340,226 C342,212 350,204 358,204" fill="none" stroke={p.body} strokeWidth="9" strokeLinecap="round" />
        {[-80, -50, -20].map((a) => (
          <path key={a} d={blade(22, 7)} transform={`translate(356 206) rotate(${a})`} fill={p.bodyLight} {...rim(c, 1)} />
        ))}
      </g>
      {wing(false)}
      <path d="M140,262 C140,236 170,226 214,226 C254,226 292,232 300,258 C306,280 292,298 264,298 L170,298 C150,296 140,284 140,262 Z" fill={u("body")} {...rim(c)} />
      <path d="M156,290 C190,300 250,300 290,288 C282,298 270,302 260,302 L172,302 C164,300 158,296 156,290 Z" fill={p.belly} opacity="0.7" />
      {/* first scale plates along the back */}
      {[184, 208, 232, 256].map((x, i) => (
        <path key={x} d={`M${x - 10},${232 - (i === 1 ? 2 : 0)} C${x - 6},${222 - i * 0} ${x + 6},${222} ${x + 10},${232}`} fill="none" stroke={p.bodyLight} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      ))}
      <Spec x={222} y={236} rx={44} ry={6} rot={-2} o={0.26} />
      {wing(true)}
      {leg(172, true, false)}
      {leg(276, true, true)}
      {/* first mane: a soft collar of tufts */}
      {[
        [150, 214, -30],
        [158, 234, 0],
        [156, 256, 30],
        [146, 274, 60],
      ].map(([x, y, a]) => (
        <path key={y} d={blade(26, 11)} transform={`translate(${x - 12} ${y}) rotate(${a})`} fill={p.wing} {...rim(c, 1)} />
      ))}
      {/* head */}
      <path d="M90,226 C88,204 104,188 124,188 C146,188 160,204 160,224 C160,246 146,262 126,264 C108,266 92,250 90,226 Z" fill={u("body")} {...rim(c)} />
      <path d="M66,236 C66,222 80,216 96,218 C110,220 114,234 112,246 C108,258 92,262 80,258 C70,254 66,246 66,236 Z" fill={p.belly} />
      <ellipse cx="72" cy="230" rx="4" ry="3" fill={p.bodyDark} />
      <path d="M72,248 C80,252 92,251 100,247" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      {/* short swept-back horns and a rounded ear */}
      <path d="M136,196 C146,184 160,178 176,176 C166,186 158,194 148,204 Z" fill={u("horn")} {...rim(c, 1)} />
      <path d="M124,192 C130,180 142,172 156,168 C148,178 142,186 136,196 Z" fill={u("horn")} {...rim(c, 1)} opacity="0.85" />
      <ellipse cx="146" cy="214" rx="10" ry="12" fill={u("body")} {...rim(c, 1)} />
      <ellipse cx="146" cy="215" rx="5" ry="6.5" fill={p.belly} opacity="0.8" />
      <Spec x={116} y={198} rx={16} ry={5} o={0.32} />
      <Eye c={c} x={112} y={222} r={8.5} kind="round" />
      <Gem c={c} x={126} y={200} s={0.46} />
    </g>
  );
}

/** Ascended: the Sovereign, front-on and towering, with upswept filigreed wings, a mane of gold plates and a tall crown. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const scallops: [number, number, number][] = [
    [60, 12, -118],
    [30, 62, -150],
    [24, 122, -178],
    [46, 174, 160],
    [90, 198, 128],
  ];
  const wing = (
    <g className="sl-flap" style={{ transformOrigin: "178px 206px" }}>
      <path
        d="M178,206 C160,180 140,150 128,120 C120,100 114,84 110,70 C96,48 80,28 60,12 C62,40 50,56 30,62 C44,82 44,104 24,122 C44,130 54,148 46,174 C66,170 84,180 90,198 C108,192 126,200 132,216 C148,210 164,216 176,232 Z"
        fill={u("wing")}
        {...rim(c)}
      />
      {/* filigree inside the membrane */}
      <g fill="none" stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="1.1">
        <path d="M100,92 C82,96 70,110 74,124 C78,136 92,132 90,122" />
        <path d="M118,140 C98,146 86,162 92,176 C96,186 108,182 106,172" />
        <path d="M86,60 C72,62 62,72 66,82" />
      </g>
      <g fill="none" strokeLinecap="round" stroke={p.bodyDark} strokeOpacity="0.7">
        <path d="M178,206 C160,180 140,150 128,120 C120,100 114,84 110,70" strokeWidth="6" />
        <path d="M110,70 L60,12 M110,70 C80,66 52,64 30,62 M110,70 C82,90 52,104 24,122 M120,100 C96,126 68,150 46,174 M128,120 C116,150 102,174 90,198" strokeWidth="2.4" />
      </g>
      <path d="M178,206 C160,180 140,150 128,120 C120,100 114,84 110,70" fill="none" stroke={p.bodyLight} strokeOpacity="0.6" strokeWidth="1.6" />
      {/* gilded feather tips at each scallop */}
      {scallops.map(([x, y, a]) => (
        <path key={x} d={blade(20, 6)} transform={`translate(${x} ${y}) rotate(${a})`} fill={p.horn} {...rim(c, 1)} />
      ))}
      <path d="M110,70 l-7,-12 l12,6 Z" fill={p.horn} />
    </g>
  );
  // Mane of golden plates radiating behind the head.
  const mane = Array.from({ length: 13 }, (_, i) => {
    const a = 150 + (240 / 12) * i;
    const [x, y] = polar(200, 112, 34, a);
    return { x, y, a: round(a), l: i % 2 ? 50 : 64 };
  });
  return (
    <g>
      {/* tail sweeping round the feet, ending in a flame-tuft */}
      <g className="sl-sway-slow" style={{ transformOrigin: "236px 330px" }}>
        <path d="M232,326 C282,354 346,352 366,316 C378,294 368,270 350,270" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="20" strokeLinecap="round" />
        <path d="M232,326 C282,354 346,352 366,316 C378,294 368,270 350,270" fill="none" stroke={p.body} strokeWidth="15" strokeLinecap="round" />
        <path d="M250,338 C290,350 336,346 356,320" fill="none" stroke={p.bodyLight} strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
        {[-150, -120, -90, -60].map((a) => (
          <path key={a} d={blade(30, 9)} transform={`translate(350 272) rotate(${a})`} fill={p.horn} {...rim(c, 1)} />
        ))}
      </g>
      {/* lower pair: long gilded flight feathers fanning from the hips */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <g className="sl-sway-slow" style={{ transformOrigin: "166px 250px" }}>
            {[
              [160, 92],
              [172, 104],
              [184, 98],
              [196, 84],
            ].map(([a, l]) => (
              <path key={a} d={blade(l, 13, 0.72)} transform={`translate(166 250) rotate(${a})`} fill={u("feather")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1" />
            ))}
          </g>
        </g>
      ))}
      {wing}
      <g transform={MIRROR}>{wing}</g>
      {/* haunches and planted paws */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M168,270 C138,276 124,302 128,328 C132,344 148,354 168,354 C186,354 196,342 194,326 C192,302 186,284 168,270 Z" fill={u("body")} {...rim(c)} />
          <path d="M140,296 C134,312 138,332 150,342" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
          {[146, 158, 170, 182].map((x) => (
            <path key={x} d={`M${x - 3},351 C${x - 2},357 ${x + 1},359 ${x + 3},352`} fill={p.horn} />
          ))}
        </g>
      ))}
      {/* torso with filigreed gold armour */}
      <path d="M200,158 C236,160 258,194 260,236 C262,274 252,306 234,326 C224,338 212,346 200,348 C188,346 176,338 166,326 C148,306 138,274 140,236 C142,194 164,160 200,158 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,190 C226,192 238,226 238,260 C238,294 226,322 200,338 C174,322 162,294 162,260 C162,226 174,192 200,190 Z" fill={p.belly} {...rim(c, 1)} />
      {[214, 236, 258, 280, 302].map((y, i) => {
        const w = 32 - Math.abs(i - 1.6) * 4;
        return <path key={y} d={`M${200 - w},${y} C${200 - w * 0.5},${y + 8} ${200 + w * 0.5},${y + 8} ${200 + w},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.4" />;
      })}
      {/* sun emblem on the breastplate */}
      <g filter={u("glow")} className="sl-rune-pulse">
        <circle cx="200" cy="250" r="10" fill="none" stroke={p.accent} strokeWidth="1.8" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const [x1, y1] = polar(200, 250, 13, a);
          const [x2, y2] = polar(200, 250, 19, a);
          return <path key={a} d={`M${x1},${y1} L${x2},${y2}`} stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" />;
        })}
      </g>
      <Spec x={184} y={204} rx={10} ry={40} rot={8} o={0.2} />
      {/* forelimbs with armoured bracers */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M172,200 C146,212 138,244 144,272 C148,290 158,300 170,304 C180,306 188,300 188,294 C178,288 172,276 172,262 C172,244 178,228 190,216 Z" fill={u("body")} {...rim(c)} />
          <path d="M146,246 C154,240 166,240 174,246 L172,262 C164,258 154,258 146,262 Z" fill={u("horn")} {...rim(c, 1)} />
          {[164, 172, 180].map((x) => (
            <path key={x} d={`M${x - 2},301 C${x - 1},307 ${x + 2},309 ${x + 3},303`} fill={p.horn} />
          ))}
        </g>
      ))}
      {/* mane of gold plates */}
      <g className="sl-sway-slow" style={{ transformOrigin: "200px 112px" }}>
        {mane.map((m) => (
          <path key={m.a} d={blade(m.l, 15, 0.7)} transform={`translate(${m.x} ${m.y}) rotate(${m.a})`} fill={m.l > 45 ? u("horn") : p.wing} {...rim(c, 1)} />
        ))}
      </g>
      {/* neck */}
      <path d="M182,176 C180,158 184,142 190,130 L210,130 C216,142 220,158 218,176 C210,184 190,184 182,176 Z" fill={u("body")} {...rim(c)} />
      {/* tall crown */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M178,84 C164,60 146,44 118,34 C136,56 146,76 160,102 Z" fill={u("horn")} {...rim(c, 1)} />
          <path d="M170,78 C160,62 146,50 130,40" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" />
          <path d="M188,76 C184,62 184,50 188,38 C194,50 196,64 196,74 Z" fill={u("horn")} {...rim(c, 1)} />
        </g>
      ))}
      <path d="M200,74 C194,60 194,44 200,28 C206,44 206,60 200,74 Z" fill={u("horn")} {...rim(c, 1)} />
      <circle cx="200" cy="30" r="3" fill={p.accent} filter={u("glow")} className="sl-twinkle" />
      {/* head */}
      <path d="M200,72 C222,72 238,86 240,104 C242,120 234,132 224,142 C216,152 210,160 200,164 C190,160 184,152 176,142 C166,132 158,120 160,104 C162,86 178,72 200,72 Z" fill={u("body")} {...rim(c)} />
      <path d="M184,134 C190,126 210,126 216,134 C220,148 210,158 200,164 C190,158 180,148 184,134 Z" fill={p.belly} />
      <path d="M188,152 C194,156 206,156 212,152" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M192,144 l-2,3 M208,144 l2,3" stroke={p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M170,100 C178,94 190,96 196,104 M230,100 C222,94 210,96 204,104" fill="none" stroke={p.bodyDark} strokeWidth="3.2" strokeLinecap="round" />
      {/* filigree brow lines */}
      <path d="M200,98 C196,90 196,84 200,80 C204,84 204,90 200,98 Z" fill={p.accent} opacity="0.6" />
      <Spec x={192} y={82} rx={16} ry={5} o={0.4} />
      <Eye c={c} x={184} y={110} r={5.8} kind="almond" angle={12} flip />
      <Eye c={c} x={216} y={110} r={5.8} kind="almond" angle={-12} />
      <Gem c={c} x={200} y={120} s={0.5} />
      {/* drifting golden motes */}
      <g filter={u("glow")} className="sl-twinkle">
        {[
          [120, 236],
          [282, 222],
          [96, 280],
          [306, 268],
        ].map(([x, y], i) => (
          <circle key={x} cx={x} cy={y} r="2.4" fill={p.accent} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
    </g>
  );
}

export const aurelion: Renderer = {
  ...evolved,
  halo: [200, 22, 30],
  stageFit: [1.25, 1.1, 1, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
