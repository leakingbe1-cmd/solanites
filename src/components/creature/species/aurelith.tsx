import { Eye, Gem, polar, rim, Spec, type Renderer } from "../kit";

/** Aurelith — an ancient sea turtle carrying a gilded, inlaid shell. */
/** Evolved: the mature form. */
const evolved: Renderer = {
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

export const aurelith: Renderer = evolved;
