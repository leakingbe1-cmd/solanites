import "server-only";
import {
  blade,
  byStage,
  Constellation,
  Dots,
  Eye,
  Gem,
  rim,
  round,
  Spec,
  type Ctx,
  type EyeKind,
  type Renderer,
} from "@/components/creature/kit";

/** Astravex — a platinum stag whose antlers are constellations. Drawn as four separate forms. */

type Pt = [number, number];
/** A joint along a limb: x, y and the limb's width there. */
type Joint = [number, number, number];

/** Smooth tapered outline through a chain of joints, plus a rim-light line along one side. */
function limbPaths(pts: Joint[], lightSide: 1 | -1) {
  const n = pts.length;
  const norms = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
  });
  const side = (k: number) =>
    pts.map(
      ([x, y, w], i) =>
        [round(x + norms[i][0] * w * k), round(y + norms[i][1] * w * k)] as Pt,
    );
  const smooth = (q: Pt[], move: boolean) => {
    let d = `${move ? "M" : "L"}${q[0][0]},${q[0][1]}`;
    for (let i = 1; i < q.length - 1; i++)
      d += ` Q${q[i][0]},${q[i][1]} ${round((q[i][0] + q[i + 1][0]) / 2)},${round((q[i][1] + q[i + 1][1]) / 2)}`;
    return `${d} L${q[q.length - 1][0]},${q[q.length - 1][1]}`;
  };
  return {
    outline: `${smooth(side(0.5), true)} ${smooth(side(-0.5).reverse(), false)} Z`,
    light: smooth(side(0.3 * lightSide), true),
  };
}

/** A deer leg: tapered forearm or gaskin, knee or hock, slim cannon and a small split hoof. */
function Leg({
  c,
  pts,
  near,
  lightSide = 1,
}: {
  c: Ctx;
  pts: Joint[];
  near: boolean;
  lightSide?: 1 | -1;
}) {
  const { outline, light } = limbPaths(pts, lightSide);
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const ang = round(
    (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90,
  );
  return (
    <g>
      <path
        d={outline}
        fill={near ? c.u("body") : c.p.bodyDark}
        {...(near ? rim(c, 1.1) : {})}
      />
      {near && (
        <path
          d={light}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      )}
      <g transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`}>
        <path
          d="M-4.6,-2 L4.6,-2 L6.2,8 L0.7,8 L0,5 L-0.7,8 L-6.2,8 Z"
          fill={near ? "#1d2140" : "#14172e"}
        />
        {near && (
          <path
            d="M-4,-0.5 L3,-0.5"
            stroke="#fff"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        )}
      </g>
    </g>
  );
}

/** Where a point in head space lands once the head is placed. */
function at(
  x: number,
  y: number,
  a: number,
  s: number,
  lx: number,
  ly: number,
): Pt {
  const r = (a * Math.PI) / 180;
  return [
    round(x + (lx * Math.cos(r) - ly * Math.sin(r)) * s),
    round(y + (lx * Math.sin(r) + ly * Math.cos(r)) * s),
  ];
}

/** A deer head facing right: fine tapered muzzle, dark nose, big leaf ears set back. Origin is the poll. */
function DeerHead({
  c,
  x,
  y,
  a = 0,
  s = 1,
  fawn = false,
  eye = "orb",
}: {
  c: Ctx;
  x: number;
  y: number;
  a?: number;
  s?: number;
  fawn?: boolean;
  eye?: EyeKind;
}) {
  const { p, u } = c;
  const skull = fawn
    ? "M-14,-6 C-12,-26 8,-31 22,-24 C31,-19 36,-11 40,-3 C44,2 47,7 46,11 C43,15 36,16 30,14 C20,12 8,14 -2,12 C-12,10 -16,2 -14,-6 Z"
    : "M-14,-6 C-12,-22 4,-27 18,-23 C30,-20 38,-11 46,-3 C52,2 57,7 56,12 C53,16 45,17 37,15 C25,13 10,15 -2,12 C-12,10 -16,2 -14,-6 Z";
  const nose: Pt = fawn ? [44, 8.5] : [54, 10];
  const ear = fawn ? [38, 15] : [33, 12];
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path
        d={blade(ear[0] - 2, ear[1] - 1, 0.6)}
        transform="translate(-4 -14) rotate(-162)"
        fill={p.bodyDark}
      />
      <path d={skull} fill={u("body")} {...rim(c)} />
      {/* pale muzzle, chin and cheek */}
      <path
        d={
          fawn
            ? "M24,6 C32,10 40,12 46,11 C43,15 36,16 30,14 C24,13 20,9 24,6 Z"
            : "M32,7 C40,11 48,13 56,12 C53,16 45,17 37,15 C31,14 27,10 32,7 Z"
        }
        fill={p.bodyLight}
        opacity="0.8"
      />
      <ellipse
        cx={fawn ? 4 : 6}
        cy="5"
        rx="12"
        ry="5"
        fill={p.bodyLight}
        opacity="0.35"
      />
      <Spec
        x={fawn ? 6 : 10}
        y={fawn ? -22 : -19}
        rx={fawn ? 14 : 16}
        ry={4}
        rot={8}
        o={0.55}
      />
      <path
        d={fawn ? "M24,-14 C30,-10 36,-4 40,0" : "M28,-12 C36,-7 44,-2 50,3"}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx={nose[0]} cy={nose[1]} rx="4.2" ry="3.4" fill="#1d2140" />
      <circle
        cx={nose[0] - 1.4}
        cy={nose[1] - 1.4}
        r="1"
        fill="#fff"
        opacity="0.6"
      />
      <path
        d={fawn ? "M34,13 C38,14 41,13 43,12" : "M42,14 C46,15 50,15 52,14"}
        fill="none"
        stroke={p.bodyDark}
        strokeOpacity="0.5"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* tear line below the eye, as on a real deer */}
      <path
        d={fawn ? "M20,-6 C23,-4 25,-2 26,0" : "M22,-7 C26,-5 29,-3 31,0"}
        fill="none"
        stroke={p.bodyDark}
        strokeOpacity="0.45"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Eye
        c={c}
        x={fawn ? 13 : 15}
        y={fawn ? -10 : -9}
        r={fawn ? 8.5 : 5.5}
        kind={eye}
      />
      <g transform="translate(2 -18) rotate(-132)">
        <path d={blade(ear[0], ear[1], 0.6)} fill={u("body")} {...rim(c, 1)} />
        <path
          d={blade(ear[0] * 0.7, ear[1] * 0.5, 0.6)}
          transform="translate(6 0)"
          fill={p.accent}
          opacity="0.35"
        />
        <path
          d={`M4,-1 C${ear[0] * 0.4},-2 ${ear[0] * 0.7},-2 ${ear[0] - 3},0`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
      </g>
    </g>
  );
}

/** Two constellation antlers rooted at the given bases; each branch is relative to its base. */
function Crown({
  c,
  bases,
  left,
  right,
  s = 1,
  sway,
}: {
  c: Ctx;
  bases: [Pt, Pt];
  left: Pt[][];
  right: Pt[][];
  s?: number;
  sway: string;
}) {
  const place = ([bx, by]: Pt, branch: Pt[]) =>
    branch.map(([x, y]) => [round(bx + x * s), round(by + y * s)] as Pt);
  return (
    <g className="sl-sway-slow" style={{ transformOrigin: sway }}>
      {left.map((b, i) => (
        <Constellation key={`l${i}`} c={c} pts={place(bases[0], b)} />
      ))}
      {right.map((b, i) => (
        <Constellation key={`r${i}`} c={c} pts={place(bases[1], b)} />
      ))}
    </g>
  );
}

/** A small four-point star, used for nubs, crown tips and orbiting motes. */
function star(x: number, y: number, r: number) {
  const k = round(r * 0.28);
  return `M${x},${y - r} L${x + k},${y - k} L${x + r},${y} L${x + k},${y + k} L${x},${y + r} L${x - k},${y + k} L${x - r},${y} L${x - k},${y - k} Z`;
}

/** A soft-edged star-field window: fades into the coat instead of reading as a hole. */
function StarWindow({
  c,
  name,
  cx,
  cy,
  rx,
  ry,
  rot = 0,
}: {
  c: Ctx;
  name: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
}) {
  const { p, u, id } = c;
  const k = `${id}-${name}`;
  return (
    <>
      <defs>
        <radialGradient id={`${k}-fade`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask
          id={`${k}-mask`}
          maskUnits="userSpaceOnUse"
          x={cx - rx - 10}
          y={cy - ry - 10}
          width={rx * 2 + 20}
          height={ry * 2 + 20}
        >
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={`url(#${k}-fade)`}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        </mask>
      </defs>
      <g mask={`url(#${k}-mask)`}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={p.belly}
          opacity="0.75"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
        <ellipse
          cx={cx - 8}
          cy={cy - 4}
          rx={rx * 0.6}
          ry={ry * 0.55}
          fill={p.accent}
          opacity="0.3"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
        <rect
          x={cx - rx}
          y={cy - ry - 10}
          width={rx * 2}
          height={ry * 2 + 20}
          fill={u("stars")}
          className="sl-twinkle"
        />
      </g>
    </>
  );
}

/** Muscle contour (shoulder or haunch): a soft rim-lit arc so the limb reads as growing out of the body. */
function Mass({
  c,
  cx,
  cy,
  rx,
  ry,
  rot = 0,
}: {
  c: Ctx;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
}) {
  const [x0, y0] = [round(cx - rx * 0.94), round(cy + ry * 0.34)];
  const [x1, y1] = [round(cx + rx * 0.5), round(cy - ry * 0.87)];
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <path
        d={`M${x0},${y0} A${rx},${ry} 0 0 1 ${x1},${y1}`}
        fill="none"
        stroke={c.p.bodyDark}
        strokeOpacity="0.22"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d={`M${round(x0 + 4)},${round(y0 - 6)} A${rx - 5},${ry - 5} 0 0 1 ${round(x1 - 2)},${round(y1 + 5)}`}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Short upright deer tail with a white underside. */
function Tail({ c, x, y, a }: { c: Ctx; x: number; y: number; a: number }) {
  return (
    <g className="sl-sway" style={{ transformOrigin: `${x}px ${y}px` }}>
      <g transform={`translate(${x} ${y}) rotate(${a})`}>
        <path d={blade(22, 8)} fill={c.u("body")} {...rim(c, 1)} />
        <path
          d={blade(16, 4)}
          transform="translate(3 2)"
          fill="#fff"
          opacity="0.8"
        />
      </g>
    </g>
  );
}

/** Nebula mane: violet star-cloud streaming back from the neck. */
function Mane({
  c,
  paths,
  origin,
}: {
  c: Ctx;
  paths: string[];
  origin: string;
}) {
  const { p, u } = c;
  return (
    <g className="sl-sway-slow" style={{ transformOrigin: origin }}>
      {paths.map((d, i) => (
        <g key={d}>
          <path
            d={d}
            fill={p.accent}
            opacity={0.75 - i * 0.15}
            stroke={p.wingEdge}
            strokeOpacity="0.5"
          />
          <path d={d} fill={u("stars")} opacity="0.9" />
        </g>
      ))}
    </g>
  );
}

const ADULT_BODY =
  "M126,236 C124,210 150,196 190,196 C226,196 256,190 276,200 C296,210 300,236 288,256 C278,270 258,272 240,270 C214,272 184,274 160,270 C138,266 126,256 126,236 Z";

/** Eggling: a newborn fawn lying folded, star-dappled, with two star nubs where antlers will grow. */
function eggling(c: Ctx) {
  const { p, u } = c;
  const head = { x: 284, y: 232, a: 8, s: 1.15 };
  const nubs = [
    at(head.x, head.y, head.a, head.s, 2, -28),
    at(head.x, head.y, head.a, head.s, 14, -29),
  ];
  return (
    <g transform="translate(-36 0)">
      <ellipse
        cx="124"
        cy="304"
        rx="11"
        ry="8"
        fill={u("body")}
        {...rim(c, 1)}
        transform="rotate(-30 124 304)"
      />
      <ellipse
        cx="120"
        cy="300"
        rx="5"
        ry="3.5"
        fill="#fff"
        opacity="0.7"
        transform="rotate(-30 120 300)"
      />
      <Leg
        c={c}
        pts={[
          [158, 338, 12],
          [140, 344, 8],
          [124, 346, 6.5],
          [116, 346, 6],
        ]}
        near
        lightSide={-1}
      />
      {/* arched neck, slim at the throat */}
      <path
        d="M236,312 C236,284 246,260 266,242 L292,252 C282,264 276,284 278,316 Z"
        fill={u("body")}
        {...rim(c)}
      />
      <ellipse
        cx="279"
        cy="276"
        rx="4.5"
        ry="15"
        fill={p.bodyLight}
        opacity="0.5"
        transform="rotate(10 284 274)"
      />
      <path
        d="M242,300 C244,280 252,264 264,252"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M120,330 C118,296 160,282 204,282 C250,282 282,296 286,322 C288,342 268,352 236,352 L160,352 C134,352 122,344 120,330 Z"
        fill={u("body")}
        {...rim(c)}
      />
      <path
        d="M132,338 C170,350 250,352 280,336 C276,348 260,354 236,354 L160,354 C144,354 134,348 132,338 Z"
        fill={p.belly}
        opacity="0.3"
      />
      <Dots
        c={c}
        pts={[
          [176, 296],
          [204, 289],
          [232, 292],
          [194, 308],
          [222, 306],
          [254, 300],
          [212, 320],
          [240, 318],
        ]}
        r={1.7}
        color="#fff"
      />
      <Spec x={214} y={288} rx={40} ry={5} rot={-2} o={0.4} />
      {/* folded hind leg with the hoof peeking out behind */}

      <Mass c={c} cx={160} cy={318} rx={34} ry={27} />
      <Dots
        c={c}
        pts={[
          [150, 306],
          [168, 312],
          [158, 324],
        ]}
        r={1.4}
        color="#fff"
        glow={false}
      />
      {/* tucked foreleg */}
      <Leg
        c={c}
        pts={[
          [246, 336, 14],
          [266, 342, 10],
          [282, 344, 7.5],
          [296, 344, 6.5],
          [302, 344, 6],
        ]}
        near
        lightSide={-1}
      />
      <DeerHead c={c} {...head} fawn eye="round" />
      <g filter={u("glow")} className="sl-twinkle">
        <path d={star(nubs[0][0], nubs[0][1], 6)} fill="#fff" />
        <path
          d={star(nubs[1][0], nubs[1][1], 5)}
          fill="#fff"
          style={{ animationDelay: "0.6s" }}
        />
      </g>
      <Gem c={c} x={262} y={302} s={0.45} />
    </g>
  );
}

/** Hatchling: a leggy young deer on unsteady legs with its first two-point constellation antlers. */
function hatchling(c: Ctx) {
  const { p, u, id } = c;
  const body =
    "M150,248 C150,226 176,216 208,216 C240,216 264,222 268,242 C272,258 258,272 236,274 C212,278 184,278 166,272 C154,266 150,258 150,248 Z";
  const head = { x: 282, y: 180, a: 12, s: 0.95 };
  const bases: [Pt, Pt] = [
    at(head.x, head.y, head.a, head.s, 4, -27),
    at(head.x, head.y, head.a, head.s, 15, -26),
  ];
  return (
    <g transform="translate(-34 0)">
      <defs>
        <clipPath id={`${id}-hatch-flank`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* far legs, splayed a little: still finding its balance */}
      <Leg
        c={c}
        pts={[
          [182, 258, 15],
          [188, 282, 10],
          [178, 300, 7],
          [177, 305, 8],
          [178, 312, 6],
          [182, 334, 5],
          [183, 344, 5],
        ]}
        near={false}
      />
      <Leg
        c={c}
        pts={[
          [246, 262, 13],
          [250, 286, 8.5],
          [253, 304, 6.5],
          [253, 309, 7.5],
          [254, 316, 5.6],
          [258, 336, 5],
          [259, 344, 5],
        ]}
        near={false}
      />
      <Tail c={c} x={154} y={236} a={-150} />
      <Leg
        c={c}
        pts={[
          [166, 260, 17],
          [174, 284, 11],
          [160, 302, 7],
          [158, 307, 8.5],
          [160, 314, 6],
          [163, 336, 5.5],
          [164, 344, 5.5],
        ]}
        near
      />
      <Leg
        c={c}
        pts={[
          [236, 264, 14],
          [236, 288, 9],
          [234, 306, 7],
          [234, 311, 8],
          [234, 318, 6],
          [236, 336, 5.5],
          [237, 344, 5.5],
        ]}
        near
      />
      {/* arched neck, slim at the throat */}
      <path
        d="M238,246 C240,220 252,198 270,184 L292,192 C282,206 276,226 276,256 Z"
        fill={u("body")}
        {...rim(c)}
      />
      <ellipse
        cx="277"
        cy="220"
        rx="4"
        ry="13"
        fill={p.bodyLight}
        opacity="0.5"
        transform="rotate(12 282 218)"
      />
      <path
        d="M246,236 C248,218 256,204 268,194"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d={body} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${id}-hatch-flank)`}>
        <StarWindow c={c} name="hatch" cx={206} cy={252} rx={40} ry={18} />
      </g>
      <Dots
        c={c}
        pts={[
          [180, 230],
          [204, 224],
          [232, 226],
          [192, 238],
          [218, 236],
        ]}
        r={1.5}
        color="#fff"
        glow={false}
      />
      <Spec x={206} y={224} rx={36} ry={4} rot={-2} o={0.45} />
      {/* near legs: long and knobbly */}

      <Mass c={c} cx={172} cy={248} rx={22} ry={25} rot={-10} />
      <Mass c={c} cx={248} cy={250} rx={16} ry={22} rot={8} />
      <DeerHead c={c} {...head} fawn eye="round" />
      <Crown
        c={c}
        bases={bases}
        sway={`${bases[0][0]}px ${bases[0][1]}px`}
        left={[
          [
            [0, 0],
            [-6, -20],
            [-16, -36],
          ],
          [
            [-6, -20],
            [6, -32],
          ],
        ]}
        right={[
          [
            [0, 0],
            [8, -20],
            [20, -32],
          ],
        ]}
      />
      <Gem c={c} x={256} y={244} s={0.45} />
    </g>
  );
}

/** Evolved: a proud platinum stag, one foreleg lifted, crowned with constellations. */
function evolvedForm(c: Ctx) {
  const { p, u, id } = c;
  const head = { x: 300, y: 118, a: 18, s: 0.9 };
  const bases: [Pt, Pt] = [
    at(head.x, head.y, head.a, head.s, 4, -23),
    at(head.x, head.y, head.a, head.s, 16, -23),
  ];
  return (
    <g transform="translate(-24 0)">
      <defs>
        <clipPath id={`${id}-evo-flank`}>
          <path d={ADULT_BODY} />
        </clipPath>
      </defs>
      <Leg
        c={c}
        pts={[
          [168, 250, 20],
          [178, 280, 13],
          [162, 302, 8.5],
          [160, 308, 10],
          [162, 316, 7],
          [165, 338, 6],
          [166, 344, 6],
        ]}
        near={false}
      />
      <Leg
        c={c}
        pts={[
          [258, 262, 16],
          [258, 288, 11],
          [259, 306, 7.5],
          [259, 312, 9],
          [259, 320, 6.5],
          [260, 338, 6],
          [260, 344, 6],
        ]}
        near={false}
      />
      <Tail c={c} x={130} y={222} a={-160} />
      <Leg
        c={c}
        pts={[
          [150, 252, 22],
          [160, 282, 14],
          [142, 304, 9],
          [140, 310, 10.5],
          [142, 318, 7],
          [145, 338, 6],
          [146, 344, 6],
        ]}
        near
      />
      <Leg
        c={c}
        pts={[
          [272, 258, 18],
          [280, 282, 11],
          [290, 298, 8.5],
          [291, 304, 9.5],
          [284, 316, 6.5],
          [278, 324, 6],
          [276, 328, 6],
        ]}
        near
      />
      {/* arched neck, slim at the throat */}
      <path
        d="M246,212 C254,174 270,144 290,120 L314,128 C306,150 298,180 298,218 C284,230 258,228 246,212 Z"
        fill={u("body")}
        {...rim(c)}
      />
      <ellipse
        cx="299"
        cy="166"
        rx="4.5"
        ry="19"
        fill={p.bodyLight}
        opacity="0.5"
        transform="rotate(12 306 162)"
      />
      <path
        d="M256,204 C262,176 274,152 290,132"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.32"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d={ADULT_BODY} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${id}-evo-flank)`}>
        <StarWindow c={c} name="evo" cx={206} cy={238} rx={58} ry={25} />
      </g>
      <Spec x={206} y={204} rx={52} ry={5} rot={-2} o={0.42} />

      {/* near foreleg lifted mid-step */}

      <Mass c={c} cx={152} cy={234} rx={32} ry={36} rot={-10} />
      <Mass c={c} cx={264} cy={236} rx={22} ry={30} rot={10} />
      <Mane
        c={c}
        origin="290px 130px"
        paths={[
          "M296,118 C266,124 238,144 206,150 C236,164 272,150 298,134 Z",
          "M288,146 C260,160 236,182 202,190 C236,202 268,184 292,166 Z",
          "M280,172 C258,190 236,208 210,216 C240,224 266,206 284,192 Z",
        ]}
      />
      <DeerHead c={c} {...head} />
      <Crown
        c={c}
        bases={bases}
        sway={`${bases[0][0]}px ${bases[0][1]}px`}
        left={[
          [
            [0, 0],
            [-8, -30],
            [-24, -54],
            [-36, -78],
          ],
          [
            [-8, -30],
            [8, -52],
            [16, -76],
          ],
          [
            [-24, -54],
            [-44, -60],
            [-58, -52],
          ],
        ]}
        right={[
          [
            [0, 0],
            [16, -24],
            [32, -38],
            [48, -42],
          ],
          [
            [16, -24],
            [22, -48],
          ],
        ]}
      />
      <Gem c={c} x={286} y={238} s={0.55} />
    </g>
  );
}

/** Ascended: a celestial stag rearing in balance under a vast constellation crown, a starry veil streaming from its shoulders. */
function ascended(c: Ctx) {
  const { p, u, id } = c;
  const head = { x: 266, y: 70, a: 24, s: 0.95 };
  const bases: [Pt, Pt] = [
    at(head.x, head.y, head.a, head.s, 4, -23),
    at(head.x, head.y, head.a, head.s, 16, -23),
  ];
  const veil =
    "M232,150 C190,148 148,168 116,196 C90,220 74,252 56,284 C70,278 82,280 92,288 C84,300 78,314 76,330 C94,314 108,306 124,302 C116,288 114,270 122,254 C138,222 180,178 232,162 Z";
  const veil2 =
    "M228,160 C196,170 166,192 148,218 C132,242 124,268 120,298 C134,286 146,282 158,284 C150,264 152,242 164,224 C180,200 204,180 228,170 Z";
  const tilt = "rotate(-35 152 250)";
  return (
    <g transform="translate(-20 0)">
      <defs>
        <clipPath id={`${id}-asc-veil`}>
          <path d={veil} />
        </clipPath>
        <clipPath id={`${id}-asc-flank`}>
          <path d={ADULT_BODY} transform={tilt} />
        </clipPath>
      </defs>
      {/* starry veil flowing off the shoulders */}
      <g className="sl-sway-slow" style={{ transformOrigin: "230px 156px" }}>
        <path
          d={veil}
          fill={p.belly}
          stroke={p.accent}
          strokeOpacity="0.8"
          strokeWidth="1.4"
        />
        <g clipPath={`url(#${id}-asc-veil)`}>
          <path d={veil} fill={p.accent} opacity="0.2" />
          <rect
            x="50"
            y="140"
            width="190"
            height="200"
            fill={u("stars")}
            className="sl-twinkle"
          />
          <path
            d="M226,156 C180,166 140,196 112,236 C96,260 86,282 80,306"
            fill="none"
            stroke={p.wingEdge}
            strokeOpacity="0.3"
            strokeWidth="6"
          />
        </g>
        <path
          d={veil2}
          fill={p.accent}
          opacity="0.32"
          stroke={p.wingEdge}
          strokeOpacity="0.45"
        />
        <path
          d="M118,200 C96,220 80,246 70,272 M140,214 C120,240 106,268 100,300"
          fill="none"
          stroke={p.wingEdge}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <Dots
          c={c}
          pts={[
            [150, 190],
            [120, 228],
            [96, 262],
            [86, 300],
            [176, 176],
            [134, 262],
          ]}
          r={1.8}
          color="#fff"
        />
      </g>
      <Leg
        c={c}
        pts={[
          [164, 248, 20],
          [180, 276, 13],
          [164, 304, 8.5],
          [162, 310, 10],
          [164, 318, 7],
          [168, 338, 6],
          [169, 344, 6],
        ]}
        near={false}
      />
      <Leg
        c={c}
        pts={[
          [250, 182, 16],
          [270, 192, 11],
          [282, 200, 8.5],
          [284, 206, 9.5],
          [280, 218, 6.5],
          [272, 230, 6],
          [268, 234, 6],
        ]}
        near={false}
        lightSide={-1}
      />
      <Tail c={c} x={124} y={252} a={175} />
      <Leg
        c={c}
        pts={[
          [146, 252, 22],
          [162, 282, 14],
          [142, 306, 9],
          [140, 312, 10.5],
          [142, 320, 7],
          [147, 338, 6],
          [148, 344, 6],
        ]}
        near
      />
      <Leg
        c={c}
        pts={[
          [236, 190, 18],
          [254, 206, 12],
          [264, 218, 8.5],
          [265, 224, 9.5],
          [258, 236, 6.5],
          [250, 248, 6],
          [246, 252, 6],
        ]}
        near
        lightSide={-1}
      />
      {/* arched neck, slim at the throat */}
      <path
        d="M216,150 C220,116 234,90 258,72 L282,82 C270,100 264,124 266,164 C252,174 228,168 216,150 Z"
        fill={u("body")}
        {...rim(c)}
      />
      <ellipse
        cx="267"
        cy="116"
        rx="4.5"
        ry="17"
        fill={p.bodyLight}
        opacity="0.5"
        transform="rotate(14 274 112)"
      />
      <path
        d="M226,142 C230,116 240,96 256,82"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.32"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d={ADULT_BODY} transform={tilt} fill={u("body")} {...rim(c)} />
      <g clipPath={`url(#${id}-asc-flank)`}>
        <StarWindow
          c={c}
          name="asc"
          cx={196}
          cy={220}
          rx={60}
          ry={26}
          rot={-35}
        />
      </g>
      <Spec x={170} y={196} rx={50} ry={5} rot={-35} o={0.42} />
      {/* hind legs planted under the body; forelegs tucked */}

      <Mass c={c} cx={146} cy={240} rx={32} ry={37} rot={-40} />
      <Mass c={c} cx={232} cy={176} rx={22} ry={30} rot={-25} />
      <Mane
        c={c}
        origin="250px 100px"
        paths={[
          "M262,78 C232,82 204,100 172,104 C200,118 236,106 260,94 Z",
          "M248,104 C222,116 196,136 164,140 C194,154 228,140 250,124 Z",
          "M236,130 C214,146 192,168 162,176 C194,186 222,168 240,150 Z",
        ]}
      />
      <DeerHead c={c} {...head} />
      <Crown
        c={c}
        bases={bases}
        sway={`${bases[0][0]}px ${bases[0][1]}px`}
        left={[
          [
            [0, 0],
            [-12, -28],
            [-36, -50],
            [-60, -60],
          ],
          [
            [-12, -28],
            [-40, -24],
            [-64, -12],
          ],
          [
            [-36, -50],
            [-44, -72],
          ],
          [
            [-40, -24],
            [-54, -36],
          ],
        ]}
        right={[
          [
            [0, 0],
            [18, -26],
            [40, -44],
            [66, -50],
          ],
          [
            [18, -26],
            [24, -54],
            [32, -72],
          ],
          [
            [40, -44],
            [58, -26],
            [74, -20],
          ],
        ]}
      />
      <g filter={u("glow")} className="sl-twinkle">
        {[
          [bases[0][0] - 60, bases[0][1] - 60, 6],
          [bases[0][0] - 44, bases[0][1] - 72, 5],
          [bases[1][0] + 32, bases[1][1] - 72, 6],
          [bases[1][0] + 66, bases[1][1] - 50, 5],
        ].map(([x, y, r], i) => (
          <path
            key={i}
            d={star(x, y, r)}
            fill="#fff"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </g>
      {/* orbiting stars */}
      <g className="sl-spin-slow" style={{ transformOrigin: "200px 210px" }}>
        {[0, 72, 144, 216, 288].map((a, i) => {
          const x = round(200 + Math.cos((a * Math.PI) / 180) * 150);
          const y = round(210 + Math.sin((a * Math.PI) / 180) * 66);
          return (
            <path
              key={a}
              d={star(x, y, 3.5)}
              fill={i % 2 ? p.accent : "#fff"}
              opacity="0.85"
              filter={u("glow")}
            />
          );
        })}
      </g>
      <Gem c={c} x={248} y={166} s={0.6} />
    </g>
  );
}

export const astravex: Renderer = {
  shadow: 110,
  halo: [262, -40, 15],
  stageFit: [1.3, 1.25, 1, 0.82],
  render: byStage(eggling, hatchling, evolvedForm, ascended),
};
