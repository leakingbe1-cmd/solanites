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

/** Eggling: a plump baby dragon sitting upright, front-on like the adult, with wing buds and horn nubs. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* short tail curling out to the side */}
      <g className="sl-sway" style={{ transformOrigin: "244px 336px" }}>
        <path d="M240,336 C270,350 304,344 312,322 C316,310 310,300 300,302" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="17" strokeLinecap="round" />
        <path d="M240,336 C270,350 304,344 312,322 C316,310 310,300 300,302" fill="none" stroke={p.body} strokeWidth="13" strokeLinecap="round" />
        <path d="M300,302 C296,292 298,284 304,280 C306,288 312,292 318,292 C314,298 308,302 300,302 Z" fill={p.horn} />
      </g>
      {/* tiny membrane wing buds */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <g className="sl-flap" style={{ transformOrigin: "160px 250px" }}>
            <path d="M162,252 C150,236 140,224 126,216 C128,228 124,238 116,244 C126,246 132,252 134,260 C142,256 152,258 160,264 Z" fill={u("wing")} {...rim(c, 1)} />
            <path d="M162,252 C150,238 140,226 126,216" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>
      ))}
      {/* plump body */}
      <path d="M200,226 C246,226 268,268 268,306 C268,336 244,354 200,354 C156,354 132,336 132,306 C132,268 154,226 200,226 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,250 C226,250 238,276 238,302 C238,326 222,342 200,344 C178,342 162,326 162,302 C162,276 174,250 200,250 Z" fill={p.belly} {...rim(c, 1)} />
      {[272, 292, 312, 330].map((y, i) => {
        const w = 30 - Math.abs(i - 1.5) * 4;
        return <path key={y} d={`M${200 - w},${y} C${200 - w * 0.5},${y + 6} ${200 + w * 0.5},${y + 6} ${200 + w},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.3" />;
      })}
      <Spec x={176} y={250} rx={10} ry={26} rot={14} o={0.2} />
      {/* feet and little forepaws */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <ellipse cx="160" cy="346" rx="22" ry="11" fill={u("body")} {...rim(c, 1)} />
          {[148, 158, 168].map((x) => (
            <path key={x} d={`M${x - 2},354 C${x - 1},358 ${x + 2},359 ${x + 3},355`} fill={p.horn} />
          ))}
          <path d="M166,266 C154,276 152,292 162,300 C170,304 178,300 180,294 C172,290 170,280 176,272 Z" fill={u("body")} {...rim(c, 1)} />
        </g>
      ))}
      {/* horn nubs and ear frills */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M140,164 C128,158 118,148 114,136 C126,140 138,144 146,152 Z" fill={u("wing")} {...rim(c, 1)} />
          <path d="M168,124 C164,112 166,102 172,94 C178,104 182,114 182,124 Z" fill={u("horn")} {...rim(c, 1)} />
        </g>
      ))}
      {/* big head with a rounded dragon snout */}
      <path d="M200,112 C240,112 266,138 266,172 C266,204 240,226 200,226 C160,226 134,204 134,172 C134,138 160,112 200,112 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,182 C224,182 236,194 236,206 C236,220 220,228 200,228 C180,228 164,220 164,206 C164,194 176,182 200,182 Z" fill={p.belly} {...rim(c, 1)} />
      <ellipse cx="190" cy="198" rx="3.2" ry="2.4" fill={p.bodyDark} />
      <ellipse cx="210" cy="198" rx="3.2" ry="2.4" fill={p.bodyDark} />
      <path d="M186,214 C194,220 206,220 214,214" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="156" cy="196" rx="9" ry="5" fill={p.accent} opacity="0.35" />
      <ellipse cx="244" cy="196" rx="9" ry="5" fill={p.accent} opacity="0.35" />
      <Spec x={188} y={124} rx={22} ry={7} o={0.32} />
      <Eye c={c} x={172} y={164} r={11} kind="round" />
      <Eye c={c} x={228} y={164} r={11} kind="round" />
      <Gem c={c} x={200} y={136} s={0.42} />
    </g>
  );
}

/** Hatchling: a young dragon sitting up on its haunches, slim-necked, membrane wings half open. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const wing = (
    <g className="sl-flap" style={{ transformOrigin: "180px 230px" }}>
      <path d="M182,232 C164,210 144,190 124,160 C112,166 98,170 84,168 C94,180 96,194 90,206 C104,204 116,212 118,226 C134,222 148,228 154,244 C164,240 174,242 182,250 Z" fill={u("wing")} {...rim(c)} />
      <g fill="none" stroke={p.bodyDark} strokeOpacity="0.65" strokeLinecap="round">
        <path d="M182,232 C164,210 144,190 124,160" strokeWidth="4" />
        <path d="M124,160 C110,184 100,196 90,206 M136,180 C128,198 122,212 118,226" strokeWidth="2" />
      </g>
      <path d="M124,160 l-4,-10 l9,5 Z" fill={p.horn} />
    </g>
  );
  return (
    <g>
      {/* long tail with a tuft */}
      <g className="sl-sway-slow" style={{ transformOrigin: "232px 330px" }}>
        <path d="M228,330 C266,350 318,344 340,312 C352,294 348,274 334,270" fill="none" stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="15" strokeLinecap="round" />
        <path d="M228,330 C266,350 318,344 340,312 C352,294 348,274 334,270" fill="none" stroke={p.body} strokeWidth="11" strokeLinecap="round" />
        {[-160, -130, -100].map((a) => (
          <path key={a} d={blade(22, 7)} transform={`translate(334 270) rotate(${a})`} fill={p.horn} {...rim(c, 1)} />
        ))}
      </g>
      {wing}
      <g transform={MIRROR}>{wing}</g>
      {/* haunches and clawed hind feet */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M172,286 C152,290 142,308 144,328 C146,342 158,350 172,350 C186,350 194,340 192,326 C190,308 184,296 172,286 Z" fill={u("body")} {...rim(c)} />
          <path d="M150,346 C150,340 160,338 172,340 C182,342 186,348 182,353 L154,353 C151,352 150,349 150,346 Z" fill={u("body")} {...rim(c, 1)} />
          {[156, 166, 176].map((x) => (
            <path key={x} d={`M${x - 3},352 C${x - 2},357 ${x + 1},358 ${x + 3},353`} fill={p.horn} />
          ))}
        </g>
      ))}
      {/* slim torso with cream belly plate */}
      <path d="M200,206 C226,208 240,238 242,270 C244,302 232,330 200,346 C168,330 156,302 158,270 C160,238 174,208 200,206 Z" fill={u("body")} {...rim(c)} />
      <path d="M200,226 C216,228 224,252 224,276 C224,302 214,322 200,334 C186,322 176,302 176,276 C176,252 184,228 200,226 Z" fill={p.belly} {...rim(c, 1)} />
      {[246, 264, 282, 300, 316].map((y, i) => {
        const w = 22 - Math.abs(i - 1.6) * 3;
        return <path key={y} d={`M${200 - w},${y} C${200 - w * 0.5},${y + 6} ${200 + w * 0.5},${y + 6} ${200 + w},${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.32" strokeWidth="1.3" />;
      })}
      <Spec x={186} y={236} rx={8} ry={30} rot={8} o={0.2} />
      {/* slim forelimbs with clawed paws */}
      {[0, 1].map((m) => (
        <g key={m} transform={m ? MIRROR : undefined}>
          <path d="M180,232 C164,242 160,264 164,284 C166,294 172,300 180,302 C186,302 190,298 190,294 C184,290 180,282 180,272 C180,258 184,246 192,238 Z" fill={u("body")} {...rim(c, 1)} />
          {[174, 181, 188].map((x) => (
            <path key={x} d={`M${x - 2},300 C${x - 1},305 ${x + 2},307 ${x + 3},301`} fill={p.horn} />
          ))}
        </g>
      ))}
      {/* slim neck */}
      <path d="M190,216 C188,192 190,170 194,148 L206,148 C210,170 212,192 210,216 C206,222 194,222 190,216 Z" fill={u("body")} {...rim(c)} />
      {[164, 180, 196].map((y) => (
        <path key={y} d={`M194,${y} C197,${y + 3} 203,${y + 3} 206,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.2" />
      ))}
      {/* playful tilted head */}
      <g transform="translate(0 14) rotate(-8 200 150) translate(200 150) scale(1.22) translate(-200 -150)">
        {[0, 1].map((m) => (
          <g key={m} transform={m ? MIRROR : undefined}>
            <path d="M184,92 C178,78 170,68 158,60 C162,74 166,88 174,100 Z" fill={u("horn")} {...rim(c, 1)} />
            <path d="M170,118 C160,114 152,116 146,122 C156,124 162,126 170,130 Z" fill={u("wing")} {...rim(c, 1)} />
          </g>
        ))}
        <path d="M200,82 C220,82 234,96 234,114 C234,128 226,138 218,146 C212,154 206,160 200,162 C194,160 188,154 182,146 C174,138 166,128 166,114 C166,96 180,82 200,82 Z" fill={u("body")} {...rim(c)} />
        <path d="M186,134 C192,126 208,126 214,134 C218,148 208,156 200,162 C192,156 182,148 186,134 Z" fill={p.belly} />
        <path d="M193,142 l-2,3 M207,142 l2,3" stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M190,152 C196,156 204,156 210,152" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round" />
        <Spec x={192} y={92} rx={14} ry={5} o={0.36} />
        <Eye c={c} x={185} y={112} r={6.8} kind="almond" angle={10} flip />
        <Eye c={c} x={215} y={112} r={6.8} kind="almond" angle={-10} />
        <Gem c={c} x={200} y={96} s={0.44} />
      </g>
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
  stageFit: [1.15, 1.08, 1, 0.94],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
