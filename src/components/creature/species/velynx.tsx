import { blade, Eye, Gem, MIRROR, rim, round, Spec, Tube, type Ctx, type Renderer } from "../kit";

/**
 * Velynx — a sleek obsidian feline with long ears and cyan glyph markings.
 *
 * VECTOR PLACEHOLDER. The intended Legendary artwork is raster (see
 * docs/creature-art). Each stage still has its own proportions and features,
 * so the evolution reads correctly until the real art is supplied.
 */

/** Proportions per standing stage (1 Hatchling, 2 Evolved, 3 Ascended). */
const FIGURE = [
  null,
  { hip: 300, sh: 238, hc: 184, R: 40, ear: 0.62, w: 24, eye: 0.27 },
  { hip: 266, sh: 196, hc: 136, R: 35, ear: 1, w: 26, eye: 0.24 },
  { hip: 260, sh: 188, hc: 126, R: 34, ear: 1.28, w: 27, eye: 0.23 },
] as const;

const GROUND = 352;

function head(hc: number, R: number) {
  const r = (n: number) => round(n);
  return `M200,${r(hc - R)} C${r(200 + R * 0.68)},${r(hc - R)} ${r(200 + R * 1.06)},${r(hc - R * 0.55)} ${r(200 + R * 1.06)},${r(hc)} C${r(200 + R * 1.06)},${r(hc + R * 0.5)} ${r(200 + R * 0.72)},${r(hc + R * 0.92)} 200,${r(hc + R * 1.02)} C${r(200 - R * 0.72)},${r(hc + R * 0.92)} ${r(200 - R * 1.06)},${r(hc + R * 0.5)} ${r(200 - R * 1.06)},${r(hc)} C${r(200 - R * 1.06)},${r(hc - R * 0.55)} ${r(200 - R * 0.68)},${r(hc - R)} 200,${r(hc - R)} Z`;
}

/** Left ear rooted at the origin (wide feline base, sweeping up and out), length factor k; mirrored for the right ear. */
function ear(c: Ctx, k: number, glowEdge: boolean) {
  const r = (n: number) => round(n * k);
  const outer = `M-4,16 C${r(-16)},${r(-10)} ${r(-32)},${r(-38)} ${r(-48)},${r(-66)}`;
  return (
    <>
      <path d={`${outer} C${r(-22)},${r(-58)} ${r(6)},${r(-36)} 32,-2 Z`} fill={c.u("body")} {...rim(c, 1)} />
      <path d={`M2,8 C${r(-8)},${r(-12)} ${r(-22)},${r(-34)} ${r(-36)},${r(-54)} C${r(-14)},${r(-46)} ${r(6)},${r(-28)} 24,-2 Z`} fill={c.p.wing} opacity="0.9" />
      <path d={outer} fill="none" stroke={glowEdge ? c.p.accent : c.p.bodyLight} strokeWidth={glowEdge ? 1.8 : 1.2} strokeOpacity={glowEdge ? 1 : 0.7} filter={glowEdge ? c.u("glow") : undefined} className={glowEdge ? "sl-rune-pulse" : undefined} />
    </>
  );
}

/** Cyan glyph lines with nodes, like living circuitry. */
function Glyphs({ c, d, nodes, color, opacity = 1 }: { c: Ctx; d: string; nodes: [number, number][]; color?: string; opacity?: number }) {
  const col = color ?? c.p.accent;
  return (
    <g opacity={opacity} filter={c.u("glow")} className="sl-rune-pulse">
      <path d={d} fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={col} />
      ))}
    </g>
  );
}

function Face({ c, hc, R, eyeScale, kind }: { c: Ctx; hc: number; R: number; eyeScale: number; kind: "almond" | "round" }) {
  const { p } = c;
  const my = round(hc + R * 0.5);
  return (
    <>
      <path d={`M${round(200 - R * 0.34)},${my - 2} C${round(200 - R * 0.2)},${round(my - R * 0.18)} ${round(200 + R * 0.2)},${round(my - R * 0.18)} ${round(200 + R * 0.34)},${my - 2} C${round(200 + R * 0.34)},${round(my + R * 0.3)} ${round(200 + R * 0.16)},${round(my + R * 0.44)} 200,${round(my + R * 0.44)} C${round(200 - R * 0.16)},${round(my + R * 0.44)} ${round(200 - R * 0.34)},${round(my + R * 0.3)} ${round(200 - R * 0.34)},${my - 2} Z`} fill={p.belly} />
      <path d={`M196,${my + 2} L204,${my + 2} L200,${my + 6} Z`} fill={p.horn} />
      {/* a lopsided, knowing smile */}
      <path d={`M195,${my + 11} C198,${my + 14} 204,${my + 14} 208,${my + 8}`} fill="none" stroke={p.bodyDark} strokeWidth="1.5" strokeLinecap="round" />
      <Spec x={192} y={round(hc - R * 0.6)} rx={round(R * 0.5)} ry={round(R * 0.16)} o={0.22} />
      <Eye c={c} x={round(200 - R * 0.45)} y={round(hc + R * 0.04)} r={round(R * eyeScale)} kind={kind} angle={kind === "almond" ? 10 : 0} flip />
      <Eye c={c} x={round(200 + R * 0.45)} y={round(hc + R * 0.04)} r={round(R * eyeScale)} kind={kind} angle={kind === "almond" ? -10 : 0} />
    </>
  );
}

function Eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* short curl of a tail */}
      <g className="sl-sway" style={{ transformOrigin: "236px 322px" }}>
        <Tube c={c} w={9} d="M232,322 C258,328 274,312 268,292" />
        <circle cx="268" cy="290" r="5" fill={p.horn} />
      </g>
      {/* round sitting body */}
      <ellipse cx="200" cy="302" rx="46" ry="44" fill={u("body")} {...rim(c)} />
      <ellipse cx="200" cy="310" rx="26" ry="28" fill={p.belly} />
      {[166, 234].map((x) => (
        <ellipse key={x} cx={x} cy="334" rx="16" ry="14" fill={u("body")} {...rim(c, 1)} />
      ))}
      {[176, 224].map((x) => (
        <ellipse key={x} cx={x} cy="346" rx="10" ry="5" fill={p.horn} />
      ))}
      {[188, 212].map((x) => (
        <ellipse key={x} cx={x} cy="332" rx="7" ry="6" fill={p.horn} />
      ))}
      {/* the first glyphs, barely there */}
      <Glyphs c={c} d="M200,296 L200,304" nodes={[[200, 296], [192, 312], [208, 312]]} opacity={0.55} />
      <Gem c={c} x={200} y={282} s={0.42} />
      {/* big round head with short ears */}
      <g transform="translate(168 204)">{ear(c, 0.48, false)}</g>
      <g transform={MIRROR}>
        <g transform="translate(168 204)">{ear(c, 0.48, false)}</g>
      </g>
      <path d={head(226, 44)} fill={u("body")} {...rim(c)} />
      <Face c={c} hc={226} R={44} eyeScale={0.27} kind="round" />
    </g>
  );
}

function Standing(c: Ctx, stage: 1 | 2 | 3) {
  const { p, u } = c;
  const f = FIGURE[stage]!;
  const { hip, sh, hc, R, w } = f;
  const L = GROUND - hip;
  const asc = stage === 3;
  const tail =
    stage === 1
      ? "M212,318 C246,326 272,312 276,286 C280,264 266,250 252,248"
      : stage === 2
        ? "M214,292 C262,306 306,290 314,252 C320,220 302,194 280,186"
        : "M214,286 C268,302 318,284 326,240 C332,204 312,174 286,164";
  const tip: [number, number, number] = stage === 1 ? [252, 248, -160] : stage === 2 ? [280, 186, -150] : [286, 164, -145];
  const leg = (
    <>
      <path
        d={`M184,${hip - 6} C166,${hip + 4} 160,${round(hip + L * 0.42)} 166,${round(hip + L * 0.6)} C170,${round(hip + L * 0.72)} 176,${round(hip + L * 0.84)} 178,${GROUND - 6} L192,${GROUND - 6} C190,${round(hip + L * 0.8)} 188,${round(hip + L * 0.66)} 190,${round(hip + L * 0.5)} C192,${round(hip + L * 0.3)} 196,${round(hip + L * 0.12)} 198,${hip} Z`}
        fill={u("body")}
        {...rim(c)}
      />
      <ellipse cx="184" cy={GROUND - 3} rx="12" ry="5" fill={p.horn} />
      {asc && <circle cx="184" cy={GROUND - 4} r="10" fill={p.eye} opacity="0.35" filter={u("blur8")} className="sl-aura-pulse" style={{ transformOrigin: `184px ${GROUND - 4}px` }} />}
    </>
  );
  const arm = (
    <>
      <path d={`M184,${sh + 8} C170,${sh + 20} 164,${sh + 44} 166,${sh + 64} C167,${sh + 74} 172,${sh + 80} 178,${sh + 80} C182,${sh + 78} 182,${sh + 72} 180,${sh + 66} C178,${sh + 50} 182,${sh + 30} 190,${sh + 18} Z`} fill={u("body")} {...rim(c)} />
      <ellipse cx="176" cy={sh + 80} rx="7" ry="6" fill={p.horn} />
    </>
  );
  const midY = round(sh + (hip - sh) * 0.6);
  const torso = `M200,${sh - 6} C${200 + w},${sh - 6} ${200 + w + 8},${round(sh + (hip - sh) * 0.35)} ${200 + w + 4},${midY} C${200 + w},${hip - 8} ${round(200 + w * 0.55)},${hip + 18} ${round(200 + w * 0.4)},${hip + 22} L${round(200 - w * 0.4)},${hip + 22} C${round(200 - w * 0.55)},${hip + 18} ${200 - w},${hip - 8} ${200 - w - 4},${midY} C${200 - w - 8},${round(sh + (hip - sh) * 0.35)} ${200 - w},${sh - 6} 200,${sh - 6} Z`;
  const neckTop = round(hc + R * 0.8);
  return (
    <g>
      {/* tail behind the body */}
      <g className="sl-sway-slow" style={{ transformOrigin: `214px ${hip + 26}px` }}>
        <Tube c={c} w={stage === 1 ? 9 : 11} d={tail} />
        {stage > 1 && <path d={tail} fill="none" stroke={p.accent} strokeWidth="1.4" strokeDasharray="2 9" opacity="0.8" filter={u("glow")} />}
        {asc &&
          [0.35, 0.55, 0.75].map((t, i) => {
            const x = round(214 + (326 - 214) * t + (i === 2 ? -16 : 0));
            const y = round(286 - 70 * t * t - 30 * t);
            return <path key={t} d={blade(16, 5)} transform={`translate(${x} ${y}) rotate(${-60 - i * 25})`} fill={u("wing")} stroke={p.wingEdge} strokeOpacity="0.7" />;
          })}
        <path d={blade(stage === 1 ? 18 : 26, stage === 1 ? 6 : 9)} transform={`translate(${tip[0]} ${tip[1]}) rotate(${tip[2]})`} fill={u("horn")} {...rim(c, 1)} />
        {asc && (
          <g filter={u("glow")} className="sl-spin-slow" style={{ transformOrigin: `${tip[0]}px ${tip[1]}px` }}>
            <ellipse cx={tip[0]} cy={tip[1]} rx="18" ry="5" fill="none" stroke={p.accent} strokeWidth="1.3" />
            <ellipse cx={tip[0]} cy={tip[1]} rx="12" ry="18" fill="none" stroke={p.eye} strokeWidth="1" opacity="0.8" />
          </g>
        )}
      </g>
      {/* legs */}
      {leg}
      <g transform={MIRROR}>{leg}</g>
      {/* torso */}
      <path d={torso} fill={u("body")} {...rim(c)} />
      <path d={`M200,${sh + 14} C${200 + w * 0.5},${sh + 16} ${200 + w * 0.55},${midY} ${200 + w * 0.3},${hip + 10} L${200 - w * 0.3},${hip + 10} C${200 - w * 0.55},${midY} ${200 - w * 0.5},${sh + 16} 200,${sh + 14} Z`} fill={p.belly} opacity="0.7" />
      <Spec x={190} y={sh + 14} rx={8} ry={round((hip - sh) * 0.3)} rot={8} o={0.14} />
      {/* glyph markings grow with each stage */}
      <Glyphs
        c={c}
        d={
          stage === 1
            ? `M200,${sh + 22} L200,${sh + 40} M192,${sh + 48} L200,${sh + 40} L208,${sh + 48}`
            : `M200,${sh + 22} L200,${sh + 46} L190,${sh + 56} L190,${hip - 2} M200,${sh + 46} L210,${sh + 56} L210,${hip - 2} M176,${hip + 30} L180,${hip + 46} L178,${hip + 62} M224,${hip + 30} L220,${hip + 46} L222,${hip + 62}`
        }
        nodes={
          stage === 1
            ? [[200, sh + 22], [192, sh + 48], [208, sh + 48]]
            : [[200, sh + 22], [190, hip - 2], [210, hip - 2], [178, hip + 62], [222, hip + 62]]
        }
      />
      {stage > 1 && (
        <g>
          <Glyphs c={c} d={`M170,${sh + 28} L168,${sh + 46} L172,${sh + 56}`} nodes={[[172, sh + 56]]} />
          <g transform={MIRROR}>
            <Glyphs c={c} d={`M170,${sh + 28} L168,${sh + 46} L172,${sh + 56}`} nodes={[[172, sh + 56]]} />
          </g>
        </g>
      )}
      {asc && <Glyphs c={c} d={`M186,${sh + 4} C192,${sh + 12} 208,${sh + 12} 214,${sh + 4} M194,${sh + 30} L200,${sh + 36} L206,${sh + 30}`} nodes={[[186, sh + 4], [214, sh + 4]]} color={p.eye} />}
      <Gem c={c} x={200} y={sh + 14} s={0.5} />
      {/* arms */}
      {arm}
      <g transform={MIRROR}>{arm}</g>
      {/* neck and head (tilted slightly in the final form) */}
      <g transform={asc ? `rotate(-5 200 ${sh})` : undefined}>
        <path d={`M188,${neckTop} C190,${neckTop + 8} 190,${sh - 4} 186,${sh + 2} L214,${sh + 2} C210,${sh - 4} 210,${neckTop + 8} 212,${neckTop} Z`} fill={u("body")} />
        <g className="sl-sway-slow" style={{ transformOrigin: `200px ${hc - R}px` }}>
          <g transform={`translate(${round(200 - R * 0.74)} ${round(hc - R * 0.5)})`}>{ear(c, f.ear, asc)}</g>
          <g transform={MIRROR}>
            <g transform={`translate(${round(200 - R * 0.74)} ${round(hc - R * 0.5)})`}>{ear(c, f.ear, asc)}</g>
          </g>
        </g>
        {/* cheek tufts */}
        {[0, 1].map((m) => (
          <path key={m} transform={m ? MIRROR : undefined} d={`M${round(200 - R * 0.9)},${round(hc + R * 0.2)} C${round(200 - R * 1.3)},${round(hc + R * 0.24)} ${round(200 - R * 1.5)},${round(hc + R * 0.46)} ${round(200 - R * 1.6)},${round(hc + R * 0.7)} C${round(200 - R * 1.2)},${round(hc + R * 0.62)} ${round(200 - R * 1)},${round(hc + R * 0.56)} ${round(200 - R * 0.76)},${round(hc + R * 0.5)} Z`} fill={u("body")} {...rim(c, 1)} />
        ))}
        <path d={head(hc, R)} fill={u("body")} {...rim(c)} />
        {stage > 1 && <Glyphs c={c} d={`M200,${round(hc - R * 0.95)} L200,${round(hc - R * 0.6)}`} nodes={[[200, round(hc - R * 0.6)]]} opacity={0.9} />}
        <Face c={c} hc={hc} R={R} eyeScale={f.eye} kind="almond" />
      </g>
    </g>
  );
}

export const velynx: Renderer = {
  shadow: 70,
  halo: [200, 46, 30],
  render: (c) => (c.evo === 0 ? Eggling(c) : Standing(c, c.evo as 1 | 2 | 3)),
};
