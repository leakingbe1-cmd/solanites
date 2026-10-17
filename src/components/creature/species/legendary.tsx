import { blade, Eye, Gem, MIRROR, polar, rim, round, Spec, Tube, type Renderer } from "../kit";

/* Legendary: large, ornate compositions that fill the frame. */

/** Aurelion — the one true great dragon: rearing, crowned, with a vast wingspan. */
export const aurelion: Renderer = {
  shadow: 110,
  halo: [200, 30, 34],
  render: (c) => {
    const { p, u, g } = c;
    const ws = 0.62 + 0.38 * g;
    const wing = (
      <g transform={`translate(170 196) scale(${ws}) translate(-170 -196)`}>
        <g className="sl-flap" style={{ transformOrigin: "170px 196px" }}>
          <path d="M172,198 C134,124 84,74 20,64 C38,90 44,112 40,136 C60,128 76,138 80,154 C96,146 110,156 114,172 C130,168 144,178 148,192 C158,192 166,198 172,210 Z" fill={u("wing")} {...rim(c)} />
          <path d="M172,198 L20,64 M120,136 L40,136 M134,152 L80,154 M148,170 L114,172" stroke={p.bodyDark} strokeWidth="3" strokeOpacity="0.55" strokeLinecap="round" fill="none" />
          <path d="M172,198 L20,64" stroke={p.wingEdge} strokeWidth="1.2" strokeOpacity="0.8" />
          {[
            [20, 64],
            [40, 136],
            [80, 154],
            [114, 172],
          ].map(([x, y]) => (
            <path key={x} d={`M${x},${y} l-6,-8 l9,3 Z`} fill={p.horn} />
          ))}
        </g>
      </g>
    );
    return (
      <g>
        {/* tail */}
        <path d="M222,326 C272,350 334,350 352,318 C362,298 352,280 336,286 C346,298 336,316 316,320 C282,328 250,320 226,306 Z" fill={u("body")} {...rim(c)} />
        <path d="M336,286 L330,266 L346,278 L356,264 L352,288 Z" fill={p.horn} />
        {wing}
        <g transform={MIRROR}>{wing}</g>
        {/* haunches & feet */}
        {[166, 234].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy="316" rx="30" ry="32" fill={u("body")} {...rim(c)} />
            <ellipse cx={x + (i ? 8 : -8)} cy="344" rx="22" ry="9" fill={p.body} {...rim(c, 1)} />
            {[-12, -4, 4, 12].map((d) => (
              <path key={d} d={`M${x + (i ? 8 : -8) + d - 3},348 L${x + (i ? 8 : -8) + d},356 L${x + (i ? 8 : -8) + d + 3},348 Z`} fill={p.horn} />
            ))}
          </g>
        ))}
        {/* armoured chest */}
        <path d="M200,168 C238,170 254,216 252,262 C250,306 230,338 200,340 C170,338 150,306 148,262 C146,216 162,170 200,168 Z" fill={u("body")} {...rim(c)} />
        {[206, 228, 250, 272, 294, 314].map((y, i) => {
          const w = 30 - Math.abs(i - 2) * 3;
          return <path key={y} d={`M${200 - w},${y} C${200 - w / 2},${y + 10} ${200 + w / 2},${y + 10} ${200 + w},${y} L${200 + w - 2},${y + 14} C${200 + w / 2},${y + 22} ${200 - w / 2},${y + 22} ${200 - w + 2},${y + 14} Z`} fill={p.belly} stroke={p.bodyDark} strokeOpacity="0.45" />;
        })}
        <g opacity={c.mark} filter={u("glow")} stroke={p.accent} strokeWidth="1.4" fill="none" className="sl-rune-pulse">
          <path d="M162,232 L170,244 L162,256 M238,232 L230,244 L238,256 M164,286 L174,292 M236,286 L226,292" />
        </g>
        {/* arms */}
        <path d="M164,212 C142,230 136,262 146,284 L160,278 C156,258 160,238 174,226 Z" fill={u("body")} {...rim(c)} />
        <path d="M164,212 C142,230 136,262 146,284 L160,278 C156,258 160,238 174,226 Z" transform={MIRROR} fill={u("body")} {...rim(c)} />
        {/* long neck */}
        <path d="M182,184 C180,150 186,126 190,108 L210,108 C214,126 220,150 218,184 Z" fill={u("body")} {...rim(c)} />
        {[118, 134, 150, 166].map((y) => (
          <path key={y} d={`M190,${y} C196,${y + 4} 204,${y + 4} 210,${y}`} fill="none" stroke={p.bodyDark} strokeOpacity="0.35" strokeWidth="1.4" />
        ))}
        {/* crown of four horns */}
        <g transform={`translate(200 72) scale(${0.6 + 0.4 * g}) translate(-200 -72)`}>
          <path d="M178,72 C164,46 148,32 122,22 C138,42 148,60 160,86 Z" fill={u("horn")} {...rim(c, 1)} />
          <path d="M178,72 C164,46 148,32 122,22 C138,42 148,60 160,86 Z" transform={MIRROR} fill={u("horn")} {...rim(c, 1)} />
          <path d="M190,64 L184,30 L198,60 Z M210,64 L216,30 L202,60 Z" fill={u("horn")} {...rim(c, 1)} />
        </g>
        {/* head */}
        <path d="M200,56 C224,56 238,72 238,90 C238,104 230,116 222,126 C214,136 208,144 200,146 C192,144 186,136 178,126 C170,116 162,104 162,90 C162,72 176,56 200,56 Z" fill={u("body")} {...rim(c)} />
        <path d="M184,118 C190,108 210,108 216,118 C218,132 208,144 200,146 C192,144 182,132 184,118 Z" fill={p.belly} opacity="0.9" />
        <path d="M192,128 l-2,3 M208,128 l2,3" stroke={p.bodyDark} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M166,96 L156,92 L166,104 Z M234,96 L244,92 L234,104 Z" fill={p.horn} />
        <path d="M172,82 C180,78 190,80 196,86 M228,82 C220,78 210,80 204,86" fill="none" stroke={p.bodyDark} strokeWidth="3" strokeLinecap="round" />
        <Spec x={192} y={66} rx={16} ry={5} o={0.35} />
        <Eye c={c} x={184} y={92} r={5.6} kind="almond" angle={10} flip />
        <Eye c={c} x={216} y={92} r={5.6} kind="almond" angle={-10} />
        <Gem c={c} x={200} y={74} s={0.6} />
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
