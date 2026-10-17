import { blade, Eye, Gem, MIRROR, rim, round, Spec, Tube, type Renderer } from "../kit";

/* Rare: unusual structures — a rising neck, stilt legs, four wings, a glass body, armour. */

/** Vael — a ribbon serpent rising from its coils on a long swan neck. */
export const vael: Renderer = {
  shadow: 120,
  halo: [150, 76, 30],
  render: (c) => {
    const { p, u, g } = c;
    const neckTop = 128 - 20 * (g - 1);
    return (
      <g transform="translate(0 -16)">
        {/* trailing ribbons */}
        <g className="sl-sway-slow" style={{ transformOrigin: "318px 334px" }}>
          <path d="M318,334 C352,318 372,296 396,300 C380,314 360,330 326,346 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
          <path d="M318,340 C348,340 372,330 392,338 C374,348 352,354 324,352 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.4" />
        </g>
        {/* head crest trailing back */}
        <path
          d={`M190,${neckTop - 20} C224,${neckTop - 40} 270,${neckTop - 30} ${300 + 20 * g},${neckTop + 4} C266,${neckTop - 6} 234,${neckTop - 6} 200,${neckTop - 6} Z`}
          fill={u("fin")}
          stroke={p.wingEdge}
          strokeOpacity="0.6"
          className="sl-sway-slow"
          style={{ transformOrigin: `200px ${neckTop}px` }}
        />
        <Tube c={c} w={34} belly d="M318,334 C372,336 366,374 300,374 C230,374 168,362 158,334 C150,306 196,296 230,306" />
        {/* neck fin ribbon */}
        <path d="M262,236 C290,256 316,262 344,250 C318,280 284,280 256,262 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.5" />
        <Tube c={c} w={22} belly d={`M222,306 C262,320 272,270 254,224 C240,188 212,${neckTop + 34} 194,${neckTop + 6}`} />
        {/* glowing veins */}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.6" fill="none" strokeLinecap="round" className="sl-rune-pulse">
          <path d="M250,262 C256,246 254,232 248,218 M200,352 C230,358 270,360 300,356 M180,330 C188,318 204,312 220,312" />
        </g>
        {/* narrow elongated head */}
        <g transform={`translate(0 ${neckTop - 128})`}>
          <path d="M204,134 C200,112 178,100 150,104 C128,108 106,116 92,124 C106,132 132,136 160,138 C178,140 196,140 204,134 Z" fill={u("body")} {...rim(c)} />
          <path d="M94,124 C110,130 136,134 162,136 C178,138 194,138 202,134 L196,142 C170,146 128,140 96,128 Z" fill={p.belly} opacity="0.8" />
          <Spec x={160} y={110} rx={22} ry={4} rot={-6} o={0.35} />
          <Eye c={c} x={162} y={116} r={5.5} kind="slit" flip angle={-6} />
          <Gem c={c} x={184} y={110} s={0.45} />
        </g>
      </g>
    );
  },
};

/** Stormquill — a tall stilt-legged bird with a crown of lightning quills. */
export const stormquill: Renderer = {
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
        {[138, 150, 162, 174].map((a, i) => (
          <g key={a} transform={`translate(160 238) rotate(${a})`}>
            <path d={blade(70 + 30 * g - i * 6, 9)} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.4" />
            <path d="M30,-3 L38,3 L46,-3 L54,3" fill="none" stroke={p.accent} strokeWidth="1.8" opacity={c.mark} />
          </g>
        ))}
        {/* stilt legs */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M212,252 L222,302 L206,350" stroke={p.bodyDark} strokeWidth="6" />
          <path d="M196,254 L188,302 L196,350 M184,352 L196,350 L210,354 M194,350 L188,356" stroke={p.horn} strokeWidth="4.5" />
          <path d="M206,350 L194,354 M206,350 L218,354" stroke={p.bodyDark} strokeWidth="4" />
        </g>
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

/** Duskwing — a velvet moth with four eye-spotted wings and feathered antennae. */
export const duskwing: Renderer = {
  floating: true,
  shadow: 110,
  halo: [200, 96, 30],
  render: (c) => {
    const { p, u, g } = c;
    const ws = 0.7 + 0.3 * g;
    const wing = (
      <g transform={`translate(196 206) scale(${ws}) translate(-196 -206)`}>
        <g className="sl-flap" style={{ transformOrigin: "196px 206px" }}>
          <path d="M196,214 C160,226 108,250 94,292 C88,318 120,328 146,308 C170,288 188,254 200,228 Z" fill={u("wing")} {...rim(c)} />
          <path d="M196,190 C150,118 78,98 44,128 C26,148 50,198 96,214 C130,224 170,216 196,206 Z" fill={u("wing")} {...rim(c)} />
          <path d="M196,198 C160,170 110,140 62,134 M196,202 C150,196 110,196 72,190 M196,220 C170,250 140,276 112,296" fill="none" stroke={p.bodyDark} strokeOpacity="0.4" strokeWidth="1.4" />
          <path d="M44,128 C26,148 50,198 96,214 C130,224 170,216 196,206" fill="none" stroke={p.wingEdge} strokeWidth="3" strokeDasharray="3 5" strokeOpacity="0.8" />
          <g opacity={0.5 + c.mark * 0.5}>
            <circle cx="104" cy="160" r="22" fill={p.bodyDark} />
            <circle cx="104" cy="160" r="16" fill={p.accent} opacity="0.85" />
            <circle cx="104" cy="160" r="9" fill={p.bodyDark} />
            <circle cx="100" cy="155" r="3" fill="#fff" />
            <circle cx="134" cy="286" r="10" fill={p.bodyDark} />
            <circle cx="134" cy="286" r="6" fill={p.accent} opacity="0.85" />
          </g>
        </g>
      </g>
    );
    return (
      <g>
        {wing}
        <g transform={MIRROR}>{wing}</g>
        {/* antennae */}
        {[1, -1].map((s) => (
          <g key={s} transform={s < 0 ? MIRROR : undefined} fill="none" stroke={p.horn} strokeLinecap="round">
            <path d={`M194,154 C186,${130 - 20 * g} 170,${110 - 24 * g} 152,${100 - 26 * g}`} strokeWidth="2.2" />
            {[0.3, 0.5, 0.7, 0.9].map((t) => {
              const x = 194 - 42 * t;
              const y = 154 - (54 + 26 * g) * t;
              return <path key={t} d={`M${x},${y} l-8,-5 M${x},${y} l4,-9`} strokeWidth="1.2" />;
            })}
          </g>
        ))}
        {/* abdomen */}
        <ellipse cx="200" cy="252" rx="16" ry="38" fill={u("body")} {...rim(c)} />
        {[232, 246, 260, 274].map((y) => (
          <path key={y} d={`M186,${y} C194,${y + 4} 206,${y + 4} 214,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.5" strokeWidth="1.4" />
        ))}
        {/* furry thorax */}
        <ellipse cx="200" cy="200" rx="25" ry="30" fill={u("body")} />
        <ellipse cx="200" cy="200" rx="25" ry="30" fill="none" stroke={p.bodyLight} strokeWidth="5" strokeDasharray="2 3" opacity="0.55" />
        <Spec x={192} y={186} rx={10} ry={6} o={0.25} />
        {/* head */}
        <circle cx="200" cy="164" r="19" fill={u("body")} {...rim(c)} />
        <Eye c={c} x={188} y={164} r={6.5} kind="compound" />
        <Eye c={c} x={212} y={164} r={6.5} kind="compound" />
        <Gem c={c} x={200} y={204} s={0.65} />
      </g>
    );
  },
};

/** Cryovant — a faceted glass jellyfish trailing shard tendrils. */
export const cryovant: Renderer = {
  floating: true,
  fit: 1.22,
  shadow: 70,
  halo: [200, 82, 34],
  render: (c) => {
    const { p, u, g } = c;
    const tendrils = [138, 158, 178, 200, 222, 242, 262];
    return (
      <g transform="translate(0 -12)">
        {/* ribbon tendrils */}
        <g className="sl-sway-slow" style={{ transformOrigin: "200px 200px" }}>
          <path d={`M188,200 C176,250 210,290 192,${300 + 60 * g} C206,300 196,250 206,200 Z`} fill={u("fin")} />
          <path d={`M212,200 C226,240 196,284 214,${290 + 50 * g} C222,280 230,240 220,200 Z`} fill={u("fin")} opacity="0.8" />
        </g>
        {/* shard chains */}
        {tendrils.map((x, i) => {
          const n = Math.round((4 + 4 * g) * (1 - Math.abs(i - 3) * 0.12));
          return (
            <g key={x} className="sl-sway" style={{ transformOrigin: `${x}px 200px`, animationDelay: `${i * 0.3}s` }}>
              {Array.from({ length: n }).map((_, k) => {
                const y = 206 + k * 17;
                const s = 6 - k * 0.45;
                return <path key={k} d={`M${x},${y - s * 1.4} L${x + s},${y} L${x},${y + s * 1.4} L${x - s},${y} Z`} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.6" strokeWidth="0.8" />;
              })}
            </g>
          );
        })}
        {/* faceted bell */}
        <path d="M118,192 L138,140 L176,110 L224,110 L262,140 L282,192 L250,202 L200,208 L150,202 Z" fill={u("glass")} {...rim(c)} />
        <ellipse cx="200" cy="162" rx="50" ry="34" fill={u("light")} opacity="0.55" className="sl-core" />
        <g stroke="#fff" strokeOpacity="0.4" strokeWidth="1" fill="none">
          <path d="M176,110 L170,170 L118,192 M224,110 L230,170 L282,192 M170,170 L200,208 L230,170 L176,110 M138,140 L170,170 M262,140 L230,170" />
        </g>
        <path d="M176,110 L224,110 L200,150 Z" fill="#fff" opacity="0.3" />
        <path d="M118,192 L138,140 L170,170 Z" fill="#fff" opacity="0.16" />
        <path d="M262,140 L282,192 L230,170 Z" fill={p.bodyDark} opacity="0.25" />
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.3" fill="none" className="sl-rune-pulse">
          <path d="M150,176 L160,160 L176,156 M250,176 L240,160 L224,156" />
        </g>
        {/* rim crystals */}
        {[130, 150, 170, 190, 210, 230, 250, 270].map((x, i) => (
          <path key={x} d={`M${x - 7},${196 + (i % 2) * 4} L${x},${212 + (i % 2) * 6} L${x + 7},${198 + (i % 2) * 4} Z`} fill={u("glass")} stroke={p.wingEdge} strokeOpacity="0.5" />
        ))}
        <Eye c={c} x={184} y={188} r={6} kind="orb" />
        <Eye c={c} x={216} y={188} r={6} kind="orb" />
        <Gem c={c} x={200} y={126} s={0.7} />
      </g>
    );
  },
};

/** Emberlisk — a low, splayed, armour-plated salamander with lava seams. */
export const emberlisk: Renderer = {
  shadow: 160,
  fit: 1.12,
  halo: [70, 236, 26],
  render: (c) => {
    const { p, u, g } = c;
    const plates = [140, 172, 204, 236, 268, 298];
    return (
      <g>
        {/* far legs */}
        <path d="M150,300 L160,286 L172,300 L170,338 L184,346 L156,346 Z M262,298 L274,286 L286,300 L294,336 L308,344 L280,346 Z" fill={p.bodyDark} />
        {/* curled tail */}
        <path d="M326,298 C362,302 382,280 380,254 C378,236 360,230 348,242 C362,244 366,256 362,268 C356,282 340,286 322,284 Z" fill={u("body")} {...rim(c)} />
        {/* dorsal armour plates */}
        {plates.map((x, i) => {
          const h = round((16 + 10 * Math.sin((i / 5) * Math.PI)) * (0.6 + 0.4 * g));
          return (
            <g key={x}>
              <path d={`M${x - 16},270 C${x - 12},${262 - h} ${x + 8},${258 - h} ${x + 16},268 Z`} fill={u("body")} stroke={p.bodyDark} strokeWidth="1.4" />
              <path d={`M${x - 12},268 C${x - 8},${262 - h} ${x + 6},${260 - h} ${x + 12},266`} fill="none" stroke={p.accent} strokeWidth="1.5" opacity={0.4 + 0.5 * c.mark} filter={u("glow")} />
            </g>
          );
        })}
        {/* long low body */}
        <path d="M96,300 C110,268 160,258 220,260 C280,262 320,276 336,300 C326,318 290,326 220,326 C160,326 112,322 96,300 Z" fill={u("body")} {...rim(c)} />
        <path d="M110,310 C150,324 290,326 326,306 L320,318 C290,334 150,334 116,320 Z" fill={p.belly} opacity="0.85" filter={u("glow")} />
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" className="sl-rune-pulse">
          <path d="M150,284 L166,292 L160,304 M210,280 L222,294 L238,290 M276,286 L288,298 M190,300 L200,310" />
        </g>
        <Spec x={210} y={270} rx={60} ry={6} rot={0} o={0.18} />
        {/* near splayed legs */}
        <path d="M124,306 L108,334 L92,346 L126,350 L144,316 Z" fill={u("body")} {...rim(c)} />
        <path d="M282,308 L298,334 L318,346 L284,350 L264,316 Z" fill={u("body")} {...rim(c)} />
        {[96, 108, 120, 290, 302, 314].map((x) => (
          <path key={x} d={`M${x},346 L${x - 3},354 L${x + 4},350 Z`} fill={p.horn} />
        ))}
        {/* wide flat head */}
        <path d="M104,298 C88,280 58,274 30,282 C18,288 18,302 30,310 C56,320 90,320 110,312 Z" fill={u("body")} {...rim(c)} />
        <path d="M24,300 C50,310 84,312 108,306" fill="none" stroke={p.belly} strokeWidth="2.4" strokeLinecap="round" filter={u("glow")} />
        <path d="M54,280 C66,272 82,272 94,280 L88,286 C78,282 66,282 58,286 Z" fill={p.bodyDark} />
        <circle cx="30" cy="290" r="2.4" fill={p.accent} filter={u("glow")} />
        <Eye c={c} x={68} y={290} r={6} kind="slit" flip angle={-6} />
        <Gem c={c} x={92} y={288} s={0.45} />
      </g>
    );
  },
};
