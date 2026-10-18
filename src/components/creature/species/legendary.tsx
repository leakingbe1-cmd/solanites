import { blade, Eye, Gem, MIRROR, polar, rim, round, Spec, Tube, type Renderer } from "../kit";

/* Legendary: large, ornate compositions that fill the frame. */

/** Aurelion — the one true great dragon: rearing, crowned, with a vast wingspan. */
export const aurelion: Renderer = {
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

/** Solvanth — a leviathan coiled around a captive sun. */
export const solvanth: Renderer = {
  floating: true,
  shadow: 130,
  halo: [288, 46, 28],
  render: (c) => {
    const { p, u, g } = c;
    const tilt = (-14 * Math.PI) / 180;
    const pt = (t: number): [number, number] => {
      const x = 118 * Math.cos(t);
      const y = 42 * Math.sin(t);
      return [round(200 + x * Math.cos(tilt) - y * Math.sin(tilt)), round(236 + x * Math.sin(tilt) + y * Math.cos(tilt))];
    };
    const arc = (t0: number, t1: number) =>
      Array.from({ length: 41 })
        .map((_, i) => pt(t0 + ((t1 - t0) * i) / 40))
        .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
    const [rx, ry] = pt(0);
    const [lx, ly] = pt(Math.PI);
    return (
      <g>
        {/* corona */}
        <g className="sl-spin-slow" style={{ transformOrigin: "200px 214px" }} filter={u("glow")}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = i * 22.5;
            const [x1, y1] = polar(200, 214, 70, a - 4);
            const [x2, y2] = polar(200, 214, 70 + (14 + 16 * g) * (i % 2 ? 0.6 : 1), a);
            const [x3, y3] = polar(200, 214, 70, a + 4);
            return <path key={i} d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`} fill={p.accent} opacity="0.75" />;
          })}
        </g>
        {/* back of the coil */}
        <Tube c={c} w={26} d={arc(Math.PI, 2 * Math.PI)} />
        {/* the sun */}
        <circle cx="200" cy="214" r="66" fill={p.accent} filter={u("glow")} />
        <circle cx="200" cy="214" r="66" fill={u("light")} />
        <circle cx="200" cy="214" r="66" fill={u("shade")} opacity="0.5" />
        <Spec x={180} y={188} rx={22} ry={10} o={0.4} />
        {/* tail */}
        <Tube c={c} w={18} d={`M${lx},${ly} C70,280 60,310 80,336`} />
        <path d="M80,336 C64,344 60,360 70,372 C78,360 88,354 98,352 Z" fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
        {/* front of the coil */}
        <Tube c={c} w={28} belly d={arc(0, Math.PI)} />
        {[0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45, 2.8].map((t) => {
          const [x, y] = pt(t);
          return <path key={t} d={blade(14, 5)} transform={`translate(${x} ${y - 12}) rotate(-120)`} fill={p.wingEdge} opacity="0.85" />;
        })}
        {/* neck rising from the coil */}
        <Tube c={c} w={24} belly d={`M${rx},${ry} C344,170 336,132 300,108`} />
        {/* mane */}
        <g className="sl-sway" style={{ transformOrigin: "300px 96px" }}>
          {[-60, -30, 0, 30, 60].map((a, i) => (
            <path key={a} d={blade(34 + 16 * g - Math.abs(i - 2) * 6, 9)} transform={`translate(310 96) rotate(${a})`} fill={u("fin")} stroke={p.wingEdge} strokeOpacity="0.6" />
          ))}
        </g>
        {/* head (facing the sun) */}
        <path d="M312,84 L338,58 L322,92 Z M318,94 L350,80 L324,102 Z" fill={u("horn")} {...rim(c, 1)} />
        <path d="M322,98 C316,80 294,72 270,78 C252,82 238,92 230,104 C244,112 264,118 286,120 C308,122 324,114 322,98 Z" fill={u("body")} {...rim(c)} />
        <path d="M232,104 C248,112 268,116 290,118 L288,124 C264,124 244,118 234,110 Z" fill={p.belly} opacity="0.85" />
        <Spec x={284} y={86} rx={18} ry={4} rot={-8} o={0.4} />
        <Eye c={c} x={270} y={96} r={5.4} kind="slit" flip angle={-4} />
        <Gem c={c} x={296} y={88} s={0.45} />
      </g>
    );
  },
};

/** Pyraurum — a golden phoenix in full flight, trailing flame streamers. */
export const pyraurum: Renderer = {
  floating: true,
  shadow: 120,
  halo: [300, 150, 24],
  render: (c) => {
    const { p, u, g } = c;
    const wing = (from: number, to: number, n: number, base: number, amp: number, dark = false) =>
      Array.from({ length: n }).map((_, i) => {
        const t = i / (n - 1);
        const a = from + (to - from) * t;
        const l = base + amp * Math.sin(t * Math.PI * 0.8 + 0.3);
        return <path key={i} d={blade(l, 11)} transform={`rotate(${a})`} fill={u("feather")} stroke={p.bodyDark} strokeOpacity="0.3" opacity={dark ? 0.7 : 1} />;
      });
    return (
      <g transform="translate(0 10)">
        {/* flame streamers */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 230 + i * 20;
          const len = 80 + 40 * g;
          return (
            <g key={i} className="sl-sway-slow" style={{ transformOrigin: "128px 216px", animationDelay: `${i * 0.4}s` }}>
              <path d={`M128,${214 + i * 3} C${128 - len * 0.4},${y - 10} ${128 - len * 0.7},${y + 26} ${128 - len},${y + 14 + i * 6} C${128 - len * 0.6},${y + 8} ${128 - len * 0.3},${y - 2} 132,${220 + i * 3} Z`} fill={u("feather")} opacity="0.9" />
              <circle cx={128 - len} cy={y + 14 + i * 6} r="4" fill={p.accent} filter={u("glow")} />
            </g>
          );
        })}
        {/* far wing */}
        <g transform={`translate(214 196) scale(${0.6 + 0.4 * g})`}>
          <g className="sl-flap">{wing(-120, -50, 8, 70, 50, true)}</g>
        </g>
        {/* body */}
        <path d="M120,214 C150,194 210,184 252,190 C278,194 292,208 292,220 C288,234 262,240 236,240 C196,240 150,236 120,214 Z" fill={u("body")} {...rim(c)} />
        <path d="M150,226 C190,238 240,238 284,226 C266,240 196,244 150,226 Z" fill={p.belly} opacity="0.7" />
        <Spec x={220} y={196} rx={30} ry={5} rot={-4} o={0.35} />
        {/* near wing */}
        <g transform={`translate(200 202) scale(${0.6 + 0.4 * g})`}>
          <g className="sl-flap">{wing(-160, -70, 9, 80, 70)}</g>
        </g>
        {/* head */}
        <g className="sl-sway" style={{ transformOrigin: "296px 200px" }}>
          {[-150, -125, -100].map((a, i) => (
            <path key={a} d={blade(26 + 16 * g - i * 4, 6)} transform={`translate(292 194) rotate(${a + 40})`} fill={u("feather")} />
          ))}
        </g>
        <path d="M276,204 C278,188 300,182 312,194 C320,204 314,218 300,220 C286,222 274,216 276,204 Z" fill={u("body")} {...rim(c)} />
        <path d="M310,200 L340,208 L310,214 Z" fill={u("horn")} stroke={p.bodyDark} strokeOpacity="0.5" />
        <Eye c={c} x={298} y={202} r={4.8} kind="almond" angle={-6} />
        <Gem c={c} x={252} y={214} s={0.55} />
      </g>
    );
  },
};

/** Aurelith — an ancient sea turtle carrying a gilded, inlaid shell. */
export const aurelith: Renderer = {
  floating: true,
  shadow: 140,
  halo: [232, 92, 34],
  render: (c) => {
    const { p, u, g } = c;
    const scutes: [number, number, number][] = [
      [232, 140, 20],
      [190, 160, 18],
      [274, 160, 18],
      [232, 184, 20],
      [154, 190, 16],
      [310, 190, 16],
      [196, 206, 16],
      [270, 206, 16],
    ];
    const hex = (x: number, y: number, r: number) =>
      Array.from({ length: 6 })
        .map((_, i) => polar(x, y, r, i * 60 - 90))
        .map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)},${b.toFixed(1)}`)
        .join(" ") + " Z";
    const fl = 0.75 + 0.25 * g;
    return (
      <g transform="translate(0 20)">
        {/* far flipper */}
        <g transform={`translate(150 206) scale(${fl}) translate(-150 -206)`} className="sl-flap" style={{ transformOrigin: "150px 206px" }}>
          <path d="M156,204 C124,170 90,148 54,140 C74,164 108,188 144,218 Z" fill={p.bodyDark} opacity="0.85" />
        </g>
        <path d="M322,222 C342,246 364,258 386,258 C376,238 356,224 336,216 Z" fill={u("body")} {...rim(c)} />
        {/* shell */}
        <path d="M108,210 C118,138 198,106 270,120 C332,132 352,178 346,222 C320,238 280,244 220,244 C160,244 124,236 108,210 Z" fill={u("body")} {...rim(c)} />
        <path d="M118,214 C158,240 300,246 342,224 L338,238 C300,258 160,256 124,232 Z" fill={p.belly} opacity="0.8" />
        {scutes.map(([x, y, r], i) => (
          <g key={i}>
            <path d={hex(x, y, r)} fill={p.bodyDark} fillOpacity="0.12" stroke={p.horn} strokeWidth="2" />
            <path d={hex(x, y, r * 0.55)} fill="none" stroke={p.accent} strokeWidth="1.2" opacity={c.mark} filter={u("glow")} />
          </g>
        ))}
        <path d="M118,214 C150,230 300,236 342,220" fill="none" stroke={p.horn} strokeWidth="2.4" strokeDasharray="10 4" />
        <Spec x={224} y={126} rx={50} ry={10} rot={-4} o={0.3} />
        {/* near flipper */}
        <g transform={`translate(146 226) scale(${fl}) translate(-146 -226)`} className="sl-flap" style={{ transformOrigin: "146px 226px" }}>
          <path d="M150,224 C114,248 74,280 40,302 C70,308 118,290 160,254 Z" fill={u("body")} {...rim(c)} />
          <path d="M140,240 C110,262 80,282 56,296" fill="none" stroke={p.horn} strokeWidth="1.6" opacity="0.7" />
        </g>
        {/* head */}
        <path d="M124,214 C104,196 76,190 56,198 C38,206 36,226 52,236 C72,246 104,242 126,232 Z" fill={u("body")} {...rim(c)} />
        <path d="M40,218 C46,232 64,238 84,236 L80,228 C66,230 52,226 44,216 Z" fill={p.belly} opacity="0.9" />
        <path d="M100,206 C104,216 104,226 100,236 M110,208 C114,218 114,228 110,238" fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.4" />
        <Eye c={c} x={70} y={210} r={6} kind="lidded" flip />
        <Gem c={c} x={232} y={140} s={0.75} />
      </g>
    );
  },
};
