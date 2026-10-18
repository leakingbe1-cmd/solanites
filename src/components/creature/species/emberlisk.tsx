import { byStage, Eye, Gem, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Emberlisk — a low, splayed, armour-plated salamander with lava seams. */
/** Evolved: the mature form. */
const evolved: Renderer = {
  shadow: 160,
  fit: 1.18,
  halo: [64, 230, 26],
  render: (c) => {
    const { p, u, g } = c;
    // Overlapping shield-shaped scutes along the spine, largest over the shoulders.
    const plates = [130, 160, 190, 220, 250, 278, 304].map((x, i) => ({ x, h: round((14 + 12 * Math.sin(((i + 1) / 8) * Math.PI)) * (0.55 + 0.45 * g)), w: 17 - i * 0.8 }));
    const limb = (d: string, near: boolean) => <path d={d} fill={near ? u("body") : p.bodyDark} {...(near ? rim(c) : {})} />;
    return (
      <g>
        {/* far legs */}
        {limb("M170,312 C160,322 156,332 160,342 C152,346 150,352 158,353 L182,353 C184,348 178,344 174,342 C172,334 176,326 184,318 Z", false)}
        {limb("M272,312 C282,322 288,332 286,342 C292,346 294,352 286,353 L262,353 C260,348 266,344 270,342 C270,334 266,326 258,318 Z", false)}
        {/* curled tail */}
        <g className="sl-sway-slow" style={{ transformOrigin: "330px 300px" }}>
          <path d="M322,296 C350,300 376,288 382,262 C386,242 372,228 356,234 C344,239 344,254 356,256 C366,258 368,268 362,276 C352,290 334,292 318,284 Z" fill={u("body")} {...rim(c)} />
          <path d="M330,290 C352,290 370,280 376,262" fill="none" stroke={p.accent} strokeWidth="1.6" opacity={0.4 + 0.5 * c.mark} filter={u("glow")} />
        </g>
        {/* dorsal scutes */}
        {plates.map(({ x, h, w }) => (
          <g key={x}>
            <path d={`M${x - w},272 C${x - w},${266 - h * 0.6} ${x - 4},${262 - h} ${x + 2},${262 - h} C${x + 8},${262 - h} ${x + w},${266 - h * 0.6} ${x + w},272 Z`} fill={u("body")} stroke={p.bodyDark} strokeWidth="1.3" />
            <path d={`M${x - w + 4},270 C${x - w + 4},${266 - h * 0.55} ${x - 3},${264 - h} ${x + 2},${264 - h} C${x + 7},${264 - h} ${x + w - 4},${266 - h * 0.55} ${x + w - 4},270`} fill="none" stroke={p.accent} strokeWidth="1.6" opacity={0.45 + 0.5 * c.mark} filter={u("glow")} className="sl-rune-pulse" />
            <path d={`M${x - 6},${268 - h * 0.7} C${x - 2},${264 - h * 0.9} ${x + 4},${264 - h * 0.9} ${x + 7},${267 - h * 0.7}`} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" />
          </g>
        ))}
        {/* long low body */}
        <path d="M92,298 C100,268 150,254 214,254 C282,254 322,268 338,292 C344,304 332,318 312,322 C280,328 240,330 210,330 C160,330 116,324 98,314 C92,310 90,304 92,298 Z" fill={u("body")} {...rim(c)} />
        <path d="M104,312 C150,326 276,328 326,312 C318,322 300,326 280,328 C240,332 160,332 116,322 Z" fill={p.belly} opacity="0.9" filter={u("glow")} />
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.7" fill="none" strokeLinecap="round" className="sl-rune-pulse">
          <path d="M146,282 C154,286 158,292 156,300 M156,300 C162,302 168,300 172,296 M206,276 C212,284 220,288 232,286 M232,286 C236,292 236,298 232,304 M268,282 C276,288 282,296 282,304" />
        </g>
        <Spec x={214} y={266} rx={64} ry={6} rot={0} o={0.16} />
        {/* near splayed legs with elbows */}
        {limb("M132,306 C118,314 108,324 106,336 C98,342 92,350 100,353 L128,353 C128,346 122,342 120,340 C122,330 130,322 144,316 Z", true)}
        {limb("M284,306 C298,314 308,324 310,336 C318,342 324,350 316,353 L288,353 C288,346 294,342 296,340 C294,330 286,322 272,316 Z", true)}
        {[98, 108, 118, 298, 308, 318].map((x) => (
          <path key={x} d={`M${x - 3},352 C${x - 2},356 ${x + 2},357 ${x + 4},353`} fill={p.horn} stroke={p.horn} strokeWidth="1.5" />
        ))}
        {/* wide flat head */}
        <path d="M112,298 C98,280 72,270 46,273 C28,276 16,286 18,297 C20,308 34,315 54,317 C80,320 102,316 114,310 Z" fill={u("body")} {...rim(c)} />
        <path d="M22,302 C40,312 74,314 108,308" fill="none" stroke={p.belly} strokeWidth="2.6" strokeLinecap="round" filter={u("glow")} />
        <path d="M54,278 C66,270 84,270 96,278 C90,282 84,284 76,284 C68,284 60,282 54,278 Z" fill={p.bodyDark} opacity="0.85" />
        <path d="M60,276 C70,272 82,272 90,277" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.2" />
        <Spec x={66} y={282} rx={26} ry={4} rot={-4} o={0.2} />
        <circle cx="26" cy="290" r="2.6" fill={p.accent} filter={u("glow")} className="sl-core" />
        <Eye c={c} x={70} y={290} r={6.4} kind="slit" flip angle={-6} />
        <Gem c={c} x={96} y={290} s={0.45} />
      </g>
    );
  },
};

/** Eggling: a chubby round newt with a big head and a row of glowing back spots — no plates yet. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const nub = (x: number, near: boolean) => (
    <path
      key={`${x}${near}`}
      d={`M${x - 12},322 C${x - 14},334 ${x - 12},344 ${x - 8},350 L${x + 9},350 C${x + 13},344 ${x + 14},334 ${x + 12},322 Z`}
      fill={near ? u("body") : p.bodyDark}
      {...(near ? rim(c, 1) : {})}
    />
  );
  return (
    <g>
      {nub(204, false)}
      {nub(282, false)}
      {/* short stubby tail with a curled tip */}
      <g className="sl-sway" style={{ transformOrigin: "292px 318px" }}>
        <path d="M288,306 C312,304 330,296 338,282 C344,272 338,264 330,268 C334,278 324,292 304,300 L292,330 Z" fill={u("body")} {...rim(c, 1)} />
      </g>
      <path d="M160,316 C162,286 196,270 236,270 C274,270 302,288 304,314 C306,334 288,346 256,346 L206,346 C178,346 160,336 160,316 Z" fill={u("body")} {...rim(c)} />
      <path d="M176,334 C204,344 266,344 294,330 C286,342 270,348 256,348 L206,348 C192,348 182,344 176,334 Z" fill={p.belly} opacity="0.8" filter={u("glow")} />
      {/* the first embers: glowing spots along the back */}
      <g filter={u("glow")} className="sl-twinkle">
        {[
          [206, 280, 4],
          [232, 274, 4.6],
          [258, 276, 4],
          [281, 286, 3.4],
          [222, 296, 2.4],
          [250, 294, 2.6],
        ].map(([x, y, r], i) => (
          <circle key={x} cx={x} cy={y} r={r} fill={i < 4 ? p.accent : p.eye} style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </g>
      <Spec x={240} y={282} rx={34} ry={6} rot={-4} o={0.2} />
      {nub(190, true)}
      {nub(270, true)}
      {[184, 190, 196, 264, 270, 276].map((x) => (
        <ellipse key={x} cx={x} cy="350" rx="2.6" ry="1.8" fill={p.accent} opacity="0.8" />
      ))}
      {/* big round head */}
      <path d="M100,300 C98,270 120,248 152,248 C184,248 204,270 204,298 C204,324 182,338 152,338 C122,338 102,326 100,300 Z" fill={u("body")} {...rim(c)} />
      <path d="M104,312 C120,326 170,330 196,316 C190,330 172,338 152,338 C128,338 110,328 104,312 Z" fill={p.belly} opacity="0.85" />
      <path d="M110,316 C126,322 146,322 160,318" fill="none" stroke={p.bodyDark} strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="108" cy="298" r="2" fill={p.bodyDark} />
      <ellipse cx="170" cy="312" rx="9" ry="5" fill={p.accent} opacity="0.3" />
      <Spec x={146} y={258} rx={24} ry={7} o={0.28} />
      <Eye c={c} x={140} y={288} r={11} kind="round" />
      <Gem c={c} x={176} y={262} s={0.45} />
    </g>
  );
}

/** Hatchling: a longer salamander with its first rounded plates and faint seams, head raised in curiosity. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  const leg = (x: number, near: boolean, back: boolean) => (
    <g key={`${x}${near}`}>
      <path
        d={back
          ? `M${x - 14},310 C${x - 8},324 ${x + 4},330 ${x + 4},344 C${x - 2},348 ${x - 2},353 ${x + 4},353 L${x + 18},353 C${x + 20},346 ${x + 14},342 ${x + 14},336 C${x + 16},324 ${x + 10},314 ${x + 6},306 Z`
          : `M${x - 8},306 C${x - 14},318 ${x - 16},330 ${x - 14},344 C${x - 20},348 ${x - 18},353 ${x - 12},353 L${x + 2},353 C${x + 4},346 ${x},342 ${x - 2},338 C${x},326 ${x + 6},316 ${x + 10},308 Z`}
        fill={near ? u("body") : p.bodyDark}
        {...(near ? rim(c, 1) : {})}
      />
      {near && [-10, -4, 2].map((d) => <ellipse key={d} cx={x + (back ? 12 : -6) + d} cy="353" rx="2.6" ry="1.8" fill={p.accent} opacity="0.8" />)}
    </g>
  );
  const plates = [168, 194, 220, 246, 270];
  return (
    <g>
      {leg(176, false, false)}
      {leg(278, false, true)}
      {/* long tapering tail, tip lifted */}
      <g className="sl-sway-slow" style={{ transformOrigin: "300px 306px" }}>
        <path d="M296,294 C326,296 352,290 370,270 C376,264 384,268 378,278 C362,306 330,322 296,324 Z" fill={u("body")} {...rim(c)} />
        <path d="M304,312 C330,312 354,300 370,280" fill="none" stroke={p.accent} strokeWidth="1.2" opacity="0.35" filter={u("glow")} />
      </g>
      {/* slim body */}
      <path d="M128,304 C134,282 172,272 216,272 C262,272 296,280 306,300 C312,316 296,326 270,328 L158,330 C138,330 126,320 128,304 Z" fill={u("body")} {...rim(c)} />
      <path d="M138,318 C176,330 262,330 300,314 C294,324 282,328 270,330 L158,332 C148,332 140,326 138,318 Z" fill={p.belly} opacity="0.8" filter={u("glow")} />
      {/* small rounded plates, just starting */}
      {plates.map((x, i) => {
        const h = [9, 12, 13, 11, 8][i];
        return (
          <g key={x}>
            <path d={`M${x - 11},${282 + i * 0.5} C${x - 10},${270 - h} ${x + 10},${270 - h} ${x + 11},${282 + i * 0.5} Z`} fill={u("body")} stroke={p.bodyDark} strokeWidth="1.2" />
            <path d={`M${x - 6},${279 + i * 0.5} C${x - 4},${273 - h} ${x + 4},${273 - h} ${x + 6},${279 + i * 0.5}`} fill="none" stroke={p.accent} strokeWidth="1.2" opacity="0.5" filter={u("glow")} />
          </g>
        );
      })}
      {/* first faint lava seams */}
      <g opacity="0.5" filter={u("glow")} stroke={p.accent} strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M188,290 C194,296 196,304 192,312 M236,286 C242,292 250,294 258,292" />
      </g>
      <Spec x={214} y={282} rx={46} ry={5} rot={-2} o={0.2} />
      {leg(156, true, false)}
      {leg(262, true, true)}
      {/* raised neck and head, looking up and ahead */}
      <path d="M146,300 C134,284 124,268 116,252 L146,238 C154,256 162,276 172,292 Z" fill={u("body")} {...rim(c)} />
      <path d="M118,262 C122,274 130,286 140,298" fill="none" stroke={p.belly} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M150,236 C150,216 134,204 112,204 C90,204 70,212 56,224 C48,232 52,242 62,244 C80,248 98,256 116,260 C138,264 150,254 150,236 Z" fill={u("body")} {...rim(c)} />
      <path d="M58,240 C76,246 98,254 120,258 C108,262 84,258 64,250 C56,248 54,244 58,240 Z" fill={p.belly} filter={u("glow")} opacity="0.85" />
      <circle cx="60" cy="230" r="2.2" fill={p.accent} filter={u("glow")} />
      <Spec x={110} y={212} rx={22} ry={5} rot={6} o={0.3} />
      <Eye c={c} x={106} y={226} r={8.5} kind="round" />
      <Gem c={c} x={136} y={218} s={0.48} />
    </g>
  );
}

/** Ascended: a raised armoured titan — chest high on clawed pillars, molten crest, horned helm and a spiked tail club. */
function ascended(c: Ctx) {
  const { p, u } = c;
  // Crest spikes ride the arched back from shoulder to hip, tallest over the shoulders.
  const crest: [number, number, number][] = [
    [146, 224, 40],
    [174, 210, 54],
    [204, 208, 48],
    [232, 216, 40],
    [258, 230, 32],
    [284, 248, 24],
  ];
  const claws = (x: number, y: number) =>
    [-14, -4, 6, 16].map((d) => <path key={d} d={`M${x + d - 3},${y} L${x + d - 7},${y + 7} L${x + d + 3},${y + 1} Z`} fill={p.eye} opacity="0.9" />);
  return (
    <g>
      {/* far legs */}
      <path d="M190,276 C196,300 194,326 190,346 L212,346 C216,326 218,300 214,280 Z" fill={p.bodyDark} />
      <path d="M296,292 C320,300 326,322 312,344 L332,346 C346,322 340,296 318,282 Z" fill={p.bodyDark} />
      {/* heavy tail ending in a spiked club */}
      <g className="sl-sway-slow" style={{ transformOrigin: "306px 300px" }}>
        <path d="M300,282 C332,288 352,292 360,276 C364,268 362,258 358,250 L374,248 C384,268 380,300 358,314 C338,326 314,322 296,318 Z" fill={u("body")} {...rim(c)} />
        <path d="M308,304 C330,308 354,304 368,282" fill="none" stroke={p.accent} strokeWidth="2" filter={u("glow")} className="sl-rune-pulse" />
        {[
          [366, 222, 0],
          [388, 238, 60],
          [346, 232, -60],
          [384, 262, 110],
        ].map(([x, y, a]) => (
          <path key={x} d="M-6,6 L0,-14 L6,6 Z" transform={`translate(${x} ${y}) rotate(${a})`} fill={p.horn} stroke={p.accent} strokeOpacity="0.7" strokeWidth="1.2" />
        ))}
        <circle cx="366" cy="246" r="18" fill={u("body")} {...rim(c)} />
        <path d="M352,240 L366,250 L380,238 M366,250 L366,262" fill="none" stroke={p.accent} strokeWidth="2" filter={u("glow")} className="sl-rune-pulse" />
        <Spec x={360} y={236} rx={8} ry={4} o={0.3} />
      </g>
      {/* jagged molten crest */}
      {crest.map(([x, y, h], i) => (
        <g key={x}>
          <path d={`M${x - 14},${y + 10} L${x - 6},${y - h * 0.5} L${x - 2},${y - h * 0.42} L${x + 6},${y - h} L${x + 8},${y - h * 0.4} L${x + 16},${y + 10} Z`} fill={u("body")} stroke={p.bodyDark} strokeWidth="1.4" strokeLinejoin="round" />
          <path d={`M${x - 8},${y + 6} L${x - 3},${y - h * 0.3} L${x + 1},${y - h * 0.25} L${x + 6},${y - h * 0.82}`} fill="none" stroke={p.accent} strokeWidth="2" strokeLinejoin="round" filter={u("glow")} className="sl-rune-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          <path d={`M${x + 5},${y - h * 0.92} L${x + 6},${y - h} L${x + 7},${y - h * 0.9} Z`} fill={p.eye} filter={u("glow")} />
        </g>
      ))}
      {/* raised armoured body: chest high, hips low */}
      <path d="M118,254 C124,222 166,204 208,212 C252,220 296,246 314,280 C322,300 312,320 288,324 C252,328 214,320 182,308 C148,296 116,282 118,254 Z" fill={u("body")} {...rim(c)} />
      <path d="M126,270 C140,292 170,304 200,312 C232,320 270,324 300,318 C286,328 254,330 222,324 C186,318 148,304 128,286 Z" fill={p.belly} opacity="0.9" filter={u("glow")} />
      {/* overlapping armour plates with bright lava seams between them */}
      {[
        "M150,224 C168,214 192,212 210,218 C206,238 196,252 180,258 C164,254 152,242 150,224 Z",
        "M212,220 C236,226 258,236 274,250 C262,264 246,272 228,272 C216,260 210,240 212,220 Z",
        "M276,252 C292,264 304,278 308,292 C294,300 278,300 266,294 C264,280 268,264 276,252 Z",
      ].map((d, i) => (
        <g key={i}>
          <path d={d} fill={u("body")} stroke={p.accent} strokeWidth="2.2" filter={u("glow")} className="sl-rune-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          <path d={d} fill={u("body")} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1" />
        </g>
      ))}
      <g filter={u("glow")} stroke={p.accent} strokeWidth="2" fill="none" strokeLinecap="round" className="sl-core">
        <path d="M180,258 C186,272 196,282 210,290 M228,272 C236,284 248,292 262,296" />
      </g>
      <Spec x={196} y={220} rx={40} ry={6} rot={8} o={0.22} />
      {/* near hind leg: bent and heavy */}
      <path d="M262,280 C292,276 314,296 306,320 C302,330 296,336 296,344 C304,346 306,354 298,355 L268,355 C266,348 272,344 276,340 C274,330 262,320 252,306 Z" fill={u("body")} {...rim(c)} />
      {claws(284, 352)}
      {/* near front leg: a thick armoured pillar under the raised chest */}
      <path d="M134,262 C130,290 132,320 130,346 C122,350 120,356 128,357 L166,357 C170,350 164,346 160,344 C160,318 166,292 170,268 Z" fill={u("body")} {...rim(c)} />
      <path d="M136,296 C148,292 160,292 168,296 L166,312 C156,308 146,308 134,312 Z" fill={p.horn} stroke={p.accent} strokeOpacity="0.6" strokeWidth="1.2" />
      <path d="M140,270 C138,290 140,310 138,330" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" />
      {claws(146, 354)}
      {/* neck rising to the helm */}
      <path d="M118,262 C108,240 100,222 96,206 L134,196 C140,214 152,232 166,246 Z" fill={u("body")} {...rim(c)} />
      <path d="M106,236 C114,250 124,262 136,272" fill="none" stroke={p.belly} strokeWidth="6" strokeLinecap="round" opacity="0.8" filter={u("glow")} />
      {/* swept horns */}
      <path d="M118,174 C132,158 150,148 172,146 C158,156 146,168 134,184 Z" fill={u("horn")} stroke={p.bodyDark} strokeWidth="1.3" />
      <path d="M104,172 C110,154 122,140 138,132 C130,146 124,160 120,176 Z" fill={u("horn")} stroke={p.bodyDark} strokeWidth="1.3" />
      <path d="M126,170 C140,158 154,152 168,148" fill="none" stroke={p.accent} strokeWidth="1.2" opacity="0.7" filter={u("glow")} />
      {/* armoured head with a glowing jaw */}
      <path d="M140,194 C140,174 120,164 98,166 C78,168 56,178 40,190 C32,198 36,210 46,212 C66,216 88,222 108,226 C128,228 140,214 140,194 Z" fill={u("body")} {...rim(c)} />
      <path d="M56,182 C72,172 96,168 118,172 C110,180 96,186 80,188 C70,188 62,186 56,182 Z" fill={p.horn} stroke={p.accent} strokeOpacity="0.5" strokeWidth="1" />
      <path d="M44,210 C64,218 90,224 116,226" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" filter={u("glow")} className="sl-core" />
      <path d="M50,212 C70,220 92,224 112,226 C100,232 72,228 54,220 Z" fill={p.belly} filter={u("glow")} />
      <circle cx="44" cy="198" r="2.6" fill={p.accent} filter={u("glow")} className="sl-core" />
      <Spec x={96} y={174} rx={20} ry={4} rot={4} o={0.25} />
      <Eye c={c} x={92} y={196} r={8} kind="slit" flip angle={-4} />
      <Gem c={c} x={130} y={246} s={0.62} />
    </g>
  );
}

export const emberlisk: Renderer = {
  ...evolved,
  halo: [104, 112, 26],
  stageFit: [1.3, 1.15, 1.03, 0.95],
  render: byStage(eggling, hatchling, evolved.render, ascended),
};
