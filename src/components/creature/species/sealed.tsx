import { rim, round, Spec, type Renderer } from "../kit";

/**
 * Fallback for an id with no renderer (an unknown or retired id, e.g. from an older saved
 * game): a plain obsidian seal-stone with one dim seam, so nothing crashes or invents a design.
 */
export const sealed: Renderer = {
  floating: true,
  shadow: 60,
  render: (c) => {
    const { u } = c;
    const h = round(118);
    const w = round(74);
    return (
      <g>
        <path d={`M200,${200 - h} L${200 + w},200 L200,${200 + h} L${200 - w},200 Z`} fill={u("body")} {...rim(c, 1.6)} />
        <path d={`M200,${200 - h} L${200 + w},200 L200,${200 + h} L${200 - w},200 Z`} fill={u("shade")} />
        <path d={`M200,${200 - h} L${200 + w * 0.32},200 L200,${200 + h}`} fill="none" stroke={c.p.wingEdge} strokeOpacity="0.35" strokeWidth="1.2" />
        <path d={`M200,${200 - h * 0.62} L200,${200 + h * 0.62}`} stroke={c.p.accent} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
        <Spec x={176} y={146} rx={14} ry={30} rot={-28} o={0.18} />
      </g>
    );
  },
};
