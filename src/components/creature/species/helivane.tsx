import type { ReactNode } from "react";
import { blade, byStage, Dots, Eye, Gem, MIRROR, polar, rim, round, Spec, type Ctx, type Renderer } from "../kit";

/** Helivane — a raptor carrying a sun: falcon head, swept wings and a solar corona. Not a phoenix: no flame body. */

/** Scalloped outline for down and fluff. */
function fluff(cx: number, cy: number, rx: number, ry: number, n: number, b: number) {
  const pt = (deg: number, k: number) => [round(cx + Math.cos((deg * Math.PI) / 180) * rx * k), round(cy + Math.sin((deg * Math.PI) / 180) * ry * k)];
  const [x0, y0] = pt(0, 1);
  let d = `M${x0},${y0}`;
  for (let i = 0; i < n; i++) {
    const a = (360 * i) / n;
    const [qx, qy] = pt(a + 180 / n, 1 + b);
    const [x, y] = pt(a + 360 / n, 1);
    d += ` Q${qx},${qy} ${x},${y}`;
  }
  return d + " Z";
}

/** Fine dark chevrons across a falcon breast. */
function Bars({ c, rows }: { c: Ctx; rows: [number, number, number][] }) {
  return (
    <g fill="none" stroke={c.p.bodyDark} strokeOpacity="0.32" strokeWidth="1.6" strokeLinecap="round">
      {rows.flatMap(([y, x0, x1]) =>
        Array.from({ length: Math.max(1, Math.round((x1 - x0) / 11)) }, (_, i) => {
          const x = round(x0 + i * 11 + ((y / 12) % 2 ? 5 : 0));
          return <path key={`${y}-${x}`} d={`M${x - 4},${y} C${x - 1},${y + 3} ${x + 1},${y + 3} ${x + 4},${y}`} />;
        }),
      )}
    </g>
  );
}

/** One flight feather; `hot` adds the white-hot tip. */
function Feather({ c, x, y, a, l, w, hot = true, barred = true }: { c: Ctx; x: number; y: number; a: number; l: number; w: number; hot?: boolean; barred?: boolean }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${round(a)})`}>
      <path d={blade(l, w, 0.82)} fill={c.u("feather")} stroke={c.p.bodyDark} strokeOpacity="0.4" strokeWidth="0.9" />
      {barred && <path d={`M${round(l * 0.42)},${round(-w * 0.75)} L${round(l * 0.42)},${round(w * 0.75)} M${round(l * 0.58)},${round(-w * 0.7)} L${round(l * 0.58)},${round(w * 0.7)}`} stroke={c.p.bodyDark} strokeOpacity="0.22" strokeWidth="1.4" />}
      {hot && <path d={blade(l * 0.3, w * 0.62, 0.7)} transform={`translate(${round(l * 0.7)} 0)`} fill={c.p.wingEdge} opacity="0.92" />}
      <path d={`M2,0 L${round(l * 0.9)},0`} stroke="#fff" strokeOpacity="0.28" strokeWidth="0.8" />
    </g>
  );
}

/** A spread wing: feathers grow from the arm (shoulder → wrist), fanning from angle a0 to a1. */
function Wing({ c, s, wr, a0, a1, l0, l1, n, w = 9, dim = false }: { c: Ctx; s: [number, number]; wr: [number, number]; a0: number; a1: number; l0: number; l1: number; n: number; w?: number; dim?: boolean }) {
  const feathers = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return { x: s[0] + (wr[0] - s[0]) * t, y: s[1] + (wr[1] - s[1]) * t, a: a0 + (a1 - a0) * t, l: l0 + (l1 - l0) * t, t };
  });
  const arm = `M${s[0]},${s[1]} Q${round((s[0] + wr[0]) / 2)},${round(Math.min(s[1], wr[1]) - 6)} ${wr[0]},${wr[1]}`;
  return (
    <g opacity={dim ? 0.78 : 1}>
      {feathers.map((f) => (
        <Feather key={f.t} c={c} x={f.x} y={f.y} a={f.a} l={f.l} w={w} />
      ))}
      <path d={arm} fill="none" stroke={c.p.bodyDark} strokeOpacity="0.5" strokeWidth={w * 2 + 3} strokeLinecap="round" />
      <path d={arm} fill="none" stroke={c.p.body} strokeWidth={w * 2} strokeLinecap="round" />
      {/* greater then lesser coverts layered over the feather roots and the arm */}
      {feathers.map((f) => (
        <path key={`gc${f.t}`} d={blade(f.l * 0.46, w * 1.35, 0.7)} transform={`translate(${round(f.x)} ${round(f.y)}) rotate(${round(f.a)})`} fill={c.u("wing")} stroke={c.p.bodyDark} strokeOpacity="0.32" strokeWidth="0.8" />
      ))}
      {feathers.map((f) => (
        <path key={`lc${f.t}`} d={blade(f.l * 0.24, w * 1.15, 0.7)} transform={`translate(${round(f.x)} ${round(f.y)}) rotate(${round(f.a)})`} fill={c.u("body")} stroke={c.p.bodyDark} strokeOpacity="0.3" strokeWidth="0.8" />
      ))}
      <path d={arm} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round" transform={`translate(0 ${-w * 0.7})`} />
    </g>
  );
}

/** Falcon head in profile facing left, centred on the skull. */
function Head({ c, x, y, s = 1, young = false, beak = 1, crown = false }: { c: Ctx; x: number; y: number; s?: number; young?: boolean; beak?: number; crown?: boolean }) {
  const { p, u } = c;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {crown && (
        <g className="sl-sway-slow" style={{ transformOrigin: "0px -26px" }}>
          {[-128, -112, -96, -80, -64].map((a, i) => (
            <g key={a} transform={`translate(${4 + i * 3} -24) rotate(${a})`}>
              <path d={blade(22 + (i === 2 ? 14 : i % 2 ? 8 : 0), 4.5, 0.85)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="0.8" />
              <circle cx={22 + (i === 2 ? 14 : i % 2 ? 8 : 0)} cy="0" r="2.4" fill={p.accent} filter={u("glow")} />
            </g>
          ))}
        </g>
      )}
      {young ? <path d={fluff(4, 0, 32, 31, 14, 0.07)} fill={u("body")} {...rim(c)} /> : <path d="M-24,2 C-26,-16 -10,-30 8,-30 C26,-30 38,-16 36,4 C34,22 20,32 2,32 C-14,32 -22,20 -24,2 Z" fill={u("body")} {...rim(c)} />}
      {/* dark hood */}
      <path d="M-22,-6 C-20,-22 -6,-30 10,-30 C24,-30 34,-20 36,-8 C24,-16 8,-20 -6,-16 C-14,-14 -18,-10 -22,-6 Z" fill={p.bodyDark} opacity={young ? 0.18 : 0.38} />
      {/* pale throat and the falcon cheek stripe */}
      <path d="M-20,10 C-12,26 6,32 20,26 C10,22 -2,18 -20,10 Z" fill={p.belly} />
      <path d="M-8,4 C-11,12 -9,20 -3,28 C3,20 3,12 0,4 Z" fill={p.bodyDark} opacity={young ? 0.4 : 0.72} />
      <Spec x={10} y={-22} rx={14} ry={5} o={0.3} />
      <g transform={`translate(-20 -2) scale(${beak}) translate(20 2)`}>
        <path d="M-22,-12 C-27,-8 -27,0 -22,4 L-17,4 L-17,-12 Z" fill={p.accent} opacity="0.85" />
        <path d="M-20,-12 C-32,-14 -44,-8 -46,4 C-47,11 -44,16 -40,18 C-40,12 -38,8 -34,6 C-28,5 -24,5 -20,4 Z" fill={p.accent} stroke={p.bodyDark} strokeOpacity="0.55" strokeWidth="1" />
        <path d="M-24,-10 C-32,-11 -40,-6 -42,2" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M-34,8 C-30,12 -24,12 -20,10 L-20,5 Z" fill={p.horn} stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="0.8" />
        <circle cx="-25" cy="-5" r="1.2" fill={p.bodyDark} opacity="0.6" />
      </g>
      {young ? (
        <Eye c={c} x={-4} y={-6} r={10} kind="round" />
      ) : (
        <>
          <circle cx="-4" cy="-6" r="9.6" fill={p.accent} />
          <Eye c={c} x={-4} y={-6} r={6.6} kind="round" />
          <path d="M-17,-15 C-9,-20 2,-19 9,-12" fill="none" stroke={p.bodyDark} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

/** Solar corona: a glowing disc with alternating rays, turning slowly. */
function Corona({ c, x, y, r, r0, r1, n, full = false }: { c: Ctx; x: number; y: number; r: number; r0: number; r1: number; n: number; full?: boolean }) {
  const { p, id } = c;
  const g = `${id}-hv-sun`;
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={full ? 0.95 : 0.7} />
          <stop offset="0.35" stopColor={p.accent} stopOpacity={full ? 0.9 : 0.6} />
          <stop offset="0.8" stopColor={p.wing} stopOpacity={full ? 0.55 : 0.3} />
          <stop offset="1" stopColor={p.wing} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r1 * 0.9} fill={p.accent} opacity={full ? 0.16 : 0.1} filter={c.u("blur20")} />
      <g className="sl-spin-slow" style={{ transformOrigin: `${x}px ${y}px` }}>
        {Array.from({ length: n }, (_, i) => {
          const a = (360 * i) / n;
          const len = i % 2 ? r0 + (r1 - r0) * 0.6 : r1;
          const [tx, ty] = polar(x, y, len, a);
          const [lx, ly] = polar(x, y, r0, a - 180 / n / (i % 2 ? 1.6 : 1.2));
          const [rx, ry] = polar(x, y, r0, a + 180 / n / (i % 2 ? 1.6 : 1.2));
          return <path key={a} d={`M${lx},${ly} L${tx},${ty} L${rx},${ry} Z`} fill={i % 2 ? p.wingEdge : p.accent} opacity={i % 2 ? 0.55 : 0.75} />;
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={`url(#${g})`} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="1.4" />
      <circle cx={x} cy={y} r={round(r * 0.78)} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </g>
  );
}

/** Gold scaled tarsus ending in hooked talons. */
function Talons({ c, x, top, foot }: { c: Ctx; x: number; top: number; foot: number }) {
  const { p } = c;
  return (
    <g>
      <path d={`M${x - 4},${top} L${x - 5},${foot - 4} L${x + 5},${foot - 4} L${x + 4},${top} Z`} fill={p.accent} stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="0.9" />
      {Array.from({ length: Math.max(1, Math.floor((foot - top - 6) / 6)) }, (_, i) => (
        <path key={i} d={`M${x - 4},${top + 6 + i * 6} L${x + 4},${top + 6 + i * 6}`} stroke={p.bodyDark} strokeOpacity="0.25" strokeWidth="0.9" />
      ))}
      <path d={`M${x},${foot - 4} C${x - 8},${foot - 3} ${x - 14},${foot} ${x - 16},${foot + 4} M${x},${foot - 4} C${x - 2},${foot} ${x - 3},${foot + 3} ${x - 4},${foot + 5} M${x},${foot - 4} C${x + 6},${foot - 2} ${x + 10},${foot} ${x + 12},${foot + 4}`} fill="none" stroke={p.accent} strokeWidth="3.4" strokeLinecap="round" />
      <path d={`M${x - 16},${foot + 4} l-2,3 M${x - 4},${foot + 5} l-1,3 M${x + 12},${foot + 4} l2,3`} stroke={p.bodyDark} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** Eggling: a round ball of amber down with a beak far too big for it. */
function eggling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Talons c={c} x={188} top={338} foot={350} />
      <Talons c={c} x={228} top={338} foot={350} />
      <path d={fluff(208, 290, 64, 58, 22, 0.06)} fill={u("body")} {...rim(c)} />
      <path d={fluff(196, 304, 38, 36, 14, 0.08)} fill={p.belly} opacity="0.9" />
      <path d="M182,300 L186,306 M198,296 L200,303 M190,318 L193,324 M206,314 L208,320" stroke={p.bodyDark} strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />
      <Spec x={222} y={252} rx={28} ry={8} rot={-10} o={0.22} />
      {/* stubby wing with three pin feathers */}
      <g className="sl-flap" style={{ transformOrigin: "244px 270px" }}>
        <path d="M240,266 C262,266 274,284 270,306 C266,318 256,322 248,318 C240,302 236,284 240,266 Z" fill={u("wing")} {...rim(c, 1)} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={blade(12, 3.5)} transform={`translate(${262 - i * 6} ${312 + i * 3}) rotate(${70 + i * 14})`} fill={p.wingEdge} opacity="0.85" />
        ))}
      </g>
      <Gem c={c} x={202} y={312} s={0.48} />
      <Head c={c} x={186} y={216} s={1.22} young beak={1.3} />
      {/* the sun-spark on its brow */}
      <g transform="translate(196 176)" filter={u("glow")} className="sl-twinkle">
        <path d="M0,-10 L2.4,-2.4 L10,0 L2.4,2.4 L0,10 L-2.4,2.4 L-10,0 L-2.4,-2.4 Z" fill={p.accent} />
        <circle r="2.6" fill="#fff" />
      </g>
    </g>
  );
}

/** Hatchling: a streaky juvenile falcon, half down, half flight feathers, wings half open. */
function hatchling(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      {/* faint ring of light behind the head */}
      <circle cx="166" cy="198" r="50" fill="none" stroke={p.accent} strokeOpacity="0.55" strokeWidth="1.6" filter={u("glow")} className="sl-aura-pulse" />
      <Wing c={c} s={[232, 236]} wr={[274, 190]} a0={22} a1={-48} l0={22} l1={40} n={6} w={6} dim />
      <g className="sl-sway" style={{ transformOrigin: "242px 312px" }}>
        {[48, 64, 80].map((a, i) => (
          <Feather key={a} c={c} x={240} y={312} a={a} l={42 - i * 3} w={7} hot={false} />
        ))}
      </g>
      <Talons c={c} x={198} top={318} foot={350} />
      <Talons c={c} x={226} top={318} foot={350} />
      <path d={fluff(212, 270, 46, 58, 18, 0.05)} fill={u("body")} {...rim(c)} />
      <path d="M170,250 C178,232 198,228 208,240 C216,268 212,300 202,324 C186,320 176,304 172,288 C168,274 168,262 170,250 Z" fill={p.belly} />
      {/* juvenile streaks rather than adult bars */}
      <g fill={p.bodyDark} opacity="0.3">
        {[
          [182, 256],
          [196, 262],
          [186, 278],
          [200, 286],
          [190, 300],
          [180, 292],
          [202, 306],
        ].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x},${y - 5} C${x + 2},${y - 1} ${x + 2},${y + 3} ${x},${y + 5} C${x - 2},${y + 3} ${x - 2},${y - 1} ${x},${y - 5} Z`} />
        ))}
      </g>
      {/* leftover down tufts */}
      <g fill={p.bodyLight} opacity="0.75">
        {[
          [236, 232, 6],
          [248, 246, 5],
          [226, 222, 4.5],
          [252, 300, 5],
        ].map(([x, y, r]) => (
          <path key={x} d={fluff(x, y, r, r, 7, 0.25)} />
        ))}
      </g>
      <Spec x={222} y={226} rx={18} ry={6} rot={-20} o={0.22} />
      <Wing c={c} s={[222, 250]} wr={[276, 226]} a0={58} a1={-6} l0={24} l1={52} n={7} w={7} />
      <Gem c={c} x={190} y={268} s={0.5} />
      <path d="M152,214 C158,232 168,244 182,250 L210,236 C200,222 190,208 184,198 Z" fill={u("body")} />
      <Head c={c} x={168} y={200} s={1.08} young beak={1.12} />
      <g fill="none" stroke={p.bodyLight} strokeWidth="2.4" strokeLinecap="round">
        <path d="M172,170 C170,160 174,152 180,148 M182,172 C184,162 190,156 196,154 M164,172 C160,164 160,158 162,152" />
      </g>
    </g>
  );
}

/** Evolved: a perched solar raptor, wings swept back, a corona blazing at its shoulders. */
function evolved(c: Ctx) {
  const { p, u } = c;
  return (
    <g>
      <Corona c={c} x={226} y={198} r={52} r0={56} r1={96} n={20} />
      {/* far wing raised and swept back */}
      <Wing c={c} s={[226, 206]} wr={[290, 142]} a0={34} a1={-40} l0={40} l1={78} n={9} w={10} dim />
      {/* fanned tail */}
      <g className="sl-sway-slow" style={{ transformOrigin: "236px 312px" }}>
        {[46, 58, 70, 82].map((a, i) => (
          <Feather key={a} c={c} x={236} y={312} a={a} l={66 - Math.abs(i - 1.5) * 4} w={9} />
        ))}
      </g>
      {/* the perch */}
      <path d="M70,346 C140,338 260,340 344,334 L346,348 C262,354 140,354 72,360 Z" fill={p.bodyDark} stroke={p.wing} strokeOpacity="0.35" />
      <path d="M90,348 C150,344 250,344 330,340" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
      {/* body */}
      <path d="M162,236 C158,198 180,176 210,176 C240,176 260,198 262,234 C264,276 250,312 226,328 C204,340 180,330 172,306 C164,286 164,262 162,236 Z" fill={u("body")} {...rim(c)} />
      <path d="M164,228 C176,214 196,214 206,230 C214,262 210,300 200,330 C184,328 174,312 170,294 C164,272 162,248 164,228 Z" fill={p.belly} />
      <Bars
        c={c}
        rows={[
          [244, 170, 200],
          [256, 170, 204],
          [268, 170, 204],
          [280, 172, 204],
          [292, 174, 200],
          [304, 178, 198],
        ]}
      />
      <Spec x={206} y={190} rx={24} ry={6} rot={-8} o={0.25} />
      {/* folded near wing with long primaries */}
      <path d="M206,196 C238,186 262,204 264,240 C266,268 270,290 278,308 C258,300 238,284 226,264 C212,242 202,220 206,196 Z" fill={u("wing")} {...rim(c)} />
      <path d="M214,214 C228,208 244,212 252,224 M216,232 C232,226 248,232 256,244 M222,250 C236,246 250,252 258,264" fill="none" stroke={p.bodyDark} strokeOpacity="0.3" strokeWidth="1.3" />
      {[72, 66, 60, 54].map((a, i) => (
        <Feather key={a} c={c} x={244 + i * 4} y={262 + i * 4} a={a} l={86 - i * 8} w={8} />
      ))}
      {/* feathered thighs and talons on the perch */}
      <ellipse cx="196" cy="320" rx="20" ry="15" fill={p.belly} {...rim(c, 1)} />
      <Bars
        c={c}
        rows={[
          [316, 184, 208],
          [326, 188, 204],
        ]}
      />
      <Talons c={c} x={190} top={330} foot={340} />
      <Talons c={c} x={210} top={330} foot={340} />
      <Gem c={c} x={186} y={250} s={0.55} />
      {/* neck and head */}
      <path d="M156,186 C160,206 166,220 176,228 L214,214 C206,200 198,186 192,176 Z" fill={u("body")} />
      <Head c={c} x={174} y={170} s={1.05} />
    </g>
  );
}

/** Ascended: the Sunpiercer — wings raised wide before a full sun, sun-motes in orbit. */
function ascended(c: Ctx) {
  const { p, u } = c;
  const motes: [number, number][] = [0, 60, 120, 180, 240, 300].map((a) => polar(200, 176, 146, a + 20));
  const side = (key: string): ReactNode => (
    <g key={key}>
      {/* raised wing */}
      <g className="sl-flap" style={{ transformOrigin: "176px 210px" }}>
        <Wing c={c} s={[172, 212]} wr={[90, 128]} a0={132} a1={240} l0={50} l1={100} n={12} w={11} />
      </g>
      {/* tail streamer */}
      <g className="sl-sway-slow" style={{ transformOrigin: "196px 322px" }}>
        <path d="M196,320 C190,350 164,368 116,376 C156,360 180,344 188,318 Z" fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.35" />
        <circle cx="118" cy="375" r="3" fill={p.wingEdge} filter={u("glow")} />
      </g>
    </g>
  );
  return (
    <g>
      <Corona c={c} x={200} y={176} r={70} r0={76} r1={128} n={28} full />
      <g className="sl-spin-slow" style={{ transformOrigin: "200px 176px" }}>
        <Dots c={c} pts={motes} r={3.4} color={p.wingEdge} />
      </g>
      {side("l")}
      <g transform={MIRROR}>{side("r")}</g>
      {/* short fanned tail between the streamers */}
      {[78, 90, 102].map((a, i) => (
        <Feather key={a} c={c} x={200} y={314} a={a} l={i === 1 ? 50 : 44} w={9} />
      ))}
      <Talons c={c} x={186} top={326} foot={350} />
      <Talons c={c} x={214} top={326} foot={350} />
      {/* body, facing out like a crest */}
      <path d="M156,236 C152,196 174,172 200,172 C226,172 248,196 244,236 C242,282 228,318 200,330 C172,318 158,282 156,236 Z" fill={u("body")} {...rim(c)} />
      <path d="M174,212 C186,204 214,204 226,212 C232,250 224,296 200,322 C176,296 168,250 174,212 Z" fill={p.belly} />
      <Bars
        c={c}
        rows={[
          [244, 180, 216],
          [256, 178, 220],
          [268, 180, 218],
          [280, 182, 216],
          [292, 186, 212],
          [304, 192, 206],
        ]}
      />
      <path d="M160,224 C164,250 172,276 184,298 M240,224 C236,250 228,276 216,298" fill="none" stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="1.4" />
      <ellipse cx="184" cy="318" rx="15" ry="13" fill={p.belly} {...rim(c, 1)} />
      <ellipse cx="216" cy="318" rx="15" ry="13" fill={p.belly} {...rim(c, 1)} />
      <Gem c={c} x={200} y={230} s={0.62} />
      <path d="M178,198 C180,178 188,164 196,158 L218,162 C220,178 222,188 226,200 Z" fill={u("body")} />
      <Head c={c} x={200} y={140} s={1.1} crown />
    </g>
  );
}

export const helivane: Renderer = {
  shadow: 96,
  halo: [212, 56, 24],
  stageFit: [1.2, 1.1, 1, 0.9],
  render: byStage(eggling, hatchling, evolved, ascended),
};
