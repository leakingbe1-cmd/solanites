import { tube, fin, along, line, r, type P } from "../geometry";
import { Eye, Lit, Talon, u, type ArtCtx } from "../kit";

/* ── MOSSLING · shellback ─────────────────────────────────────────── */

export function Mossling(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const tail: P[] = [
    [318, 284],
    [348, 298],
    [370, 314],
    [386, 330],
  ];
  const dome = "M100,268 C104,212 160,172 222,170 C288,168 334,210 336,268 C300,277 140,277 100,268 Z";
  const moss = [
    // [x, y, r] highlight tufts on the moss cap; more grow with evolution
    [222, 174, 22],
    [196, 180, 18],
    [250, 180, 18],
    [170, 192, 15],
    [276, 192, 16],
    [148, 210, 12],
    [300, 212, 13],
    [212, 190, 14],
  ].slice(0, [2, 4, 6, 8][evo]);

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={p.wingEdge} />
          <stop offset="0.45" stopColor={p.wing} />
          <stop offset="1" stopColor={p.bodyDark} />
        </linearGradient>
        <radialGradient id={`${id}-moss`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#c6e6a8" />
          <stop offset="0.5" stopColor="#5e8a54" />
          <stop offset="1" stopColor="#24392a" />
        </radialGradient>
        <clipPath id={`${id}-domeclip`}>
          <path d={dome} />
        </clipPath>
      </defs>

      {/* far legs */}
      <path d={tube([[178, 292], [170, 318], [168, 334]], (t) => 22 - t * 4)} fill={p.bodyDark} />
      <path d={tube([[302, 290], [312, 314], [306, 334]], (t) => 26 - t * 8)} fill={p.bodyDark} />

      {/* tail */}
      <Lit ctx={ctx} d={tube(tail, (t) => 26 * (1 - t) + 3)} fill={u(ctx, "hideV")} />
      <path d={tube(tail, (t) => 26 * (1 - t) + 3)} fill={u(ctx, "scales")} opacity="0.6" />

      {/* body under shell */}
      <Lit ctx={ctx} d="M106,262 C112,302 160,314 220,314 C284,314 324,302 328,264 Z" fill={u(ctx, "hideV")} keyLight={false} />

      {/* near legs */}
      <Lit ctx={ctx} d={tube([[144, 286], [138, 312], [134, 332]], (t) => 28 - t * 8)} fill={u(ctx, "hide")} />
      <ellipse cx="128" cy="336" rx="17" ry="6" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.6" />
      {[-12, -4, 4].map((dx) => (
        <Talon key={dx} x={128 + dx} y={335} size={0.7} angle={75} fill={p.horn} />
      ))}
      <Lit ctx={ctx} d={tube([[282, 280], [294, 306], [286, 332]], (t) => 38 - t * 18)} fill={u(ctx, "hide")} />
      <ellipse cx="282" cy="336" rx="18" ry="6" fill={p.body} stroke={p.bodyDark} strokeOpacity="0.6" />
      {[-12, -4, 4].map((dx) => (
        <Talon key={dx} x={282 + dx} y={335} size={0.7} angle={75} fill={p.horn} />
      ))}

      {/* shell */}
      <path d={dome} fill={`url(#${id}-stone)`} stroke={p.bodyDark} strokeWidth="1.2" />
      <g clipPath={`url(#${id}-domeclip)`}>
        {/* plate seams */}
        {[
          "M132,272 C130,240 146,214 172,196",
          "M178,272 C176,236 186,206 206,184",
          "M236,272 C238,236 236,204 228,180",
          "M290,272 C294,238 284,208 262,186",
          "M108,236 C170,226 270,224 332,236",
        ]
          .slice(0, evo === 0 ? 3 : 5)
          .map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={p.bodyDark} strokeWidth="3" strokeOpacity="0.7" />
              <path d={d} fill="none" stroke={p.wingEdge} strokeWidth="0.8" strokeOpacity="0.45" transform="translate(1.6 -1.4)" />
            </g>
          ))}
        <path d={dome} fill={u(ctx, "key")} />
        <rect x="90" y="160" width="260" height="120" filter={`url(#${id}-grain)`} fill="#808080" opacity="0.18" />
      </g>
      <path d="M100,268 C140,277 300,277 336,268 L334,279 C300,288 138,288 102,279 Z" fill={p.bodyDark} />
      <path d={dome} fill="none" stroke={u(ctx, "rim")} strokeWidth="1.8" />

      {/* living moss */}
      <g>
        <g transform={`translate(222 178) scale(${[0.4, 0.62, 0.82, 1][evo]}) translate(-222 -178)`}>
          <path
            d="M132,222 C140,196 176,176 222,172 C268,170 306,190 316,222 C306,214 296,216 290,224 C282,212 270,212 262,222 C254,210 240,210 232,220 C222,208 208,208 200,220 C190,210 176,210 168,222 C160,212 146,212 140,224 Z"
            fill={`url(#${id}-moss)`}
          />
          {moss.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y + 6} r={r * 0.16} fill="#cfe8a8" opacity="0.7" />
          ))}
        </g>
        {evo >= 2 &&
          [
            [184, 176, -28],
            [262, 178, 24],
            [228, 166, -6],
          ].map(([x, y, a]) => (
            <path key={x} d="M0,0 C-2,-10 0,-20 4,-28 M0,-8 l-5,-4 M1,-14 l5,-4 M2,-20 l-5,-3" transform={`translate(${x} ${y}) rotate(${a})`} stroke="#9cc98a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          ))}
        {evo >= 3 && (
          <g className="sl-twinkle">
            {[
              [176, 160],
              [240, 150],
              [292, 176],
              [206, 146],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.6" fill={p.accent} filter={u(ctx, "bloom")} style={{ animationDelay: `${i * 0.7}s` }} />
            ))}
          </g>
        )}
        {evo >= 3 && (
          <g transform="translate(222 158)">
            <path d="M0,10 C1,0 -1,-10 2,-22" stroke="#5b4636" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="2" cy="-30" rx="16" ry="11" fill={`url(#${id}-moss)`} />
            <ellipse cx="-8" cy="-24" rx="9" ry="7" fill={`url(#${id}-moss)`} />
            <ellipse cx="12" cy="-23" rx="9" ry="7" fill={`url(#${id}-moss)`} />
          </g>
        )}
      </g>

      {/* neck + head */}
      <Lit ctx={ctx} d={tube([[124, 262], [100, 254], [80, 250]], (t) => 42 - t * 10)} fill={u(ctx, "hide")} />
      <Lit ctx={ctx} d="M88,230 C70,224 48,228 36,242 C26,253 28,267 42,273 C58,279 82,278 98,270 C110,262 106,238 88,230 Z" fill={u(ctx, "hide")} />
      <path d="M88,230 C70,224 48,228 36,242 C26,253 28,267 42,273 C58,279 82,278 98,270 C110,262 106,238 88,230 Z" fill={u(ctx, "scales")} opacity="0.55" />
      <path d="M33,262 C50,268 72,268 92,262" fill="none" stroke={p.bodyDark} strokeWidth="1.4" strokeOpacity="0.8" />
      <ellipse cx="38" cy="249" rx="2" ry="1.3" fill={p.bodyDark} />
      <path d="M54,238 C66,229 82,230 94,238 L90,243 C80,237 66,237 57,243 Z" fill={`url(#${id}-stone)`} />
      <Eye ctx={ctx} x={70} y={247} r={3.4} angle={-6} />
      {[
        [96, 236],
        [104, 246],
      ].map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="5" ry="3.5" fill={`url(#${id}-stone)`} />
      ))}
    </g>
  );
}

/* ── DRIFTFIN · veilfin ───────────────────────────────────────────── */

export function Driftfin(ctx: ArtCtx) {
  const { id, p, evo } = ctx;
  const spine: P[] = [
    [62, 196],
    [116, 176],
    [178, 186],
    [236, 220],
    [296, 214],
    [344, 182],
    [378, 166],
  ];
  const w = (t: number) => (t < 0.08 ? 26 + t * 140 : 38 * Math.pow(1 - (t - 0.08) / 0.92, 1.25) + 2);
  const finScale = [0.55, 0.75, 0.9, 1.05][evo];
  const dorsal = fin(spine, w, -1, 0.12, 0.86, (k) => Math.sin(k * Math.PI) * 26 * finScale + 3);
  const ventral = fin(spine, w, 1, 0.42, 0.8, (k) => Math.sin(k * Math.PI) * 18 * finScale);
  const pect = along(spine, 0.16, 1, w);
  const pect2 = along(spine, 0.5, 1, w);

  return (
    <g className="sl-hover">
      {/* veils behind body */}
      <path d={dorsal} fill={u(ctx, "veil")} stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="0.8" />
      <path d={ventral} fill={u(ctx, "veil")} stroke={p.wingEdge} strokeOpacity="0.3" strokeWidth="0.8" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = along(spine, 0.14 + i * 0.045, -1, w);
        return <path key={i} d={`M0,0 l0,${-r(Math.sin(((i + 0.5) / 16) * Math.PI) * 24 * finScale + 3)}`} transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} stroke={p.wingEdge} strokeOpacity="0.35" strokeWidth="0.6" />;
      })}

      {/* tail fluke */}
      <g transform="translate(378 166) rotate(-24)">
        <path d={`M0,0 C14,-10 28,-22 ${44 * finScale + 10},-30 C34,-12 30,-4 ${30 * finScale + 8},0 C30,6 34,14 ${40 * finScale + 10},28 C26,20 12,10 0,0 Z`} fill={u(ctx, "veil")} stroke={p.wingEdge} strokeOpacity="0.45" strokeWidth="0.8" />
      </g>

      {/* body */}
      <Lit ctx={ctx} d={tube(spine, w)} fill={u(ctx, "hideV")} />
      <path d={tube(spine, (t) => w(t) * 0.38)} fill={p.belly} opacity="0.5" transform="translate(0 7)" />
      <path d={line(spine)} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" transform="translate(0 -6)" />

      {/* lateral line lights (grow with evolution) */}
      {Array.from({ length: [0, 4, 7, 10][evo] }).map((_, i) => {
        const a = along(spine, 0.2 + i * 0.065);
        return <circle key={i} cx={a.x} cy={a.y} r="1.4" fill={p.accent} filter={u(ctx, "bloom")} opacity="0.85" />;
      })}

      {/* pectoral veils */}
      {[pect, pect2].slice(0, evo >= 2 ? 2 : 1).map((a, i) => (
        <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.angle + 70})`}>
          <path d={`M0,0 C10,18 6,${44 * finScale} -14,${70 * finScale} C-8,${46 * finScale} -10,22 -6,0 Z`} fill={u(ctx, "veil")} stroke={p.wingEdge} strokeOpacity="0.5" strokeWidth="0.8" />
          <path d={`M-2,2 C2,24 -2,${46 * finScale} -12,${64 * finScale}`} stroke={p.wingEdge} strokeOpacity="0.4" strokeWidth="0.6" fill="none" />
        </g>
      ))}

      {/* head detail */}
      <path d="M44,198 C52,188 66,184 80,186" fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.2" />
      <path d="M40,202 C52,206 66,206 78,202" fill="none" stroke={p.bodyDark} strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M86,182 C92,188 92,202 86,210" fill="none" stroke={p.bodyDark} strokeOpacity="0.45" strokeWidth="1" />
      <path d="M92,180 C99,188 99,204 92,214" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1" />
      <Eye ctx={ctx} x={64} y={192} r={3.2} slit={false} />
      {/* barbels */}
      <path d="M44,204 C34,216 30,230 34,246" fill="none" stroke={p.horn} strokeOpacity="0.8" strokeWidth="1.1" className="sl-sway" style={{ transformOrigin: "44px 204px" }} />
    </g>
  );
}
