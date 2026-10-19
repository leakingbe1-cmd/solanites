"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChartPoint, MarketChart } from "@/lib/market/types";

/**
 * One-series price chart: a 2px neutral line over a faint area in the creature's accent, a
 * recessive grid, and a crosshair that snaps to the nearest point on pointer or keyboard.
 * The line never takes the up/down colours, so it can't be mistaken for the daily signal.
 */

const H = 180;
const PAD = { top: 12, right: 12, bottom: 24, left: 52 };
const fmtPrice = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtWhen = (p: ChartPoint, intraday: boolean) =>
  intraday
    ? new Date(p.t).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET"
    : new Date(`${p.date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit", timeZone: "UTC" });

export function PriceChart({ chart, accent, label }: { chart: MarketChart; accent: string; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(560);
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const gid = useId().replace(/:/g, "");
  const intraday = chart.interval === "5min";
  const pts = chart.points;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => setHover(null), [chart]);

  const geo = useMemo(() => {
    if (pts.length < 2) return null;
    const lo = Math.min(...pts.map((p) => p.close));
    const hi = Math.max(...pts.map((p) => p.close));
    const span = hi - lo || hi * 0.01 || 1;
    const y0 = lo - span * 0.08;
    const y1 = hi + span * 0.08;
    const iw = w - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    // Even spacing by index: sessions, not calendar days, so weekends don't leave gaps.
    const x = (i: number) => PAD.left + (i / (pts.length - 1)) * iw;
    const y = (v: number) => PAD.top + (1 - (v - y0) / (y1 - y0)) * ih;
    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.close).toFixed(1)}`).join("");
    const area = `${line}L${x(pts.length - 1).toFixed(1)},${PAD.top + ih}L${x(0).toFixed(1)},${PAD.top + ih}Z`;
    const ticks = [lo, (lo + hi) / 2, hi];
    return { x, y, line, area, ticks, iw, ih };
  }, [pts, w]);

  if (!geo) {
    return (
      <div ref={wrap} className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-rim px-6 text-center text-sm text-dust">
        {chart.unavailable ?? "No prices to draw for this range yet."}
      </div>
    );
  }

  const pick = (clientX: number) => {
    const r = wrap.current!.getBoundingClientRect();
    const rel = (clientX - r.left - PAD.left) / geo.iw;
    setHover(Math.max(0, Math.min(pts.length - 1, Math.round(rel * (pts.length - 1)))));
  };
  const h = hover !== null ? pts[hover] : null;
  const first = pts[0];
  const last = pts[pts.length - 1];

  return (
    <div className="min-w-0">
      <div
        ref={wrap}
        className="relative w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-gilt/60 rounded-xl"
        tabIndex={0}
        role="img"
        aria-label={`${label}: ${fmtPrice(first.close)} on ${fmtWhen(first, intraday)} to ${fmtPrice(last.close)} on ${fmtWhen(last, intraday)}. Use the arrow keys to read each point.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            setHover((i) => Math.max(0, Math.min(pts.length - 1, (i ?? (e.key === "ArrowRight" ? -1 : pts.length)) + (e.key === "ArrowRight" ? 1 : -1))));
          } else if (e.key === "Escape") setHover(null);
        }}
        onBlur={() => setHover(null)}
      >
        <svg width={w} height={H} className="block" aria-hidden>
          <defs>
            <linearGradient id={`a${gid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.16" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {geo.ticks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} x2={w - PAD.right} y1={geo.y(v)} y2={geo.y(v)} stroke="rgba(239,232,218,0.07)" />
              <text x={PAD.left - 8} y={geo.y(v) + 3.5} textAnchor="end" className="fill-dust font-mono text-[10px]">
                {v >= 1000 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2)}
              </text>
            </g>
          ))}
          <path d={geo.area} fill={`url(#a${gid})`} />
          <path d={geo.line} fill="none" stroke="#efe8da" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <text x={PAD.left} y={H - 6} className="fill-dust font-mono text-[10px]">{fmtWhen(first, intraday)}</text>
          <text x={w - PAD.right} y={H - 6} textAnchor="end" className="fill-dust font-mono text-[10px]">{fmtWhen(last, intraday)}</text>
          {h && hover !== null && (
            <g>
              <line x1={geo.x(hover)} x2={geo.x(hover)} y1={PAD.top} y2={PAD.top + geo.ih} stroke="rgba(239,232,218,0.35)" />
              <circle cx={geo.x(hover)} cy={geo.y(h.close)} r={4} fill="#efe8da" stroke="#0f0d14" strokeWidth={2} />
            </g>
          )}
        </svg>
        {h && hover !== null && (
          <div
            className="pointer-events-none absolute top-1 rounded-lg border border-rim-strong bg-basalt/95 px-2.5 py-1.5 shadow-lg"
            style={{ left: Math.min(Math.max(geo.x(hover) - 70, 0), w - 150), width: 140 }}
            aria-live="polite"
          >
            <div className="font-display text-base leading-tight text-bone">{fmtPrice(h.close)}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-dust">{fmtWhen(h, intraday)}</div>
          </div>
        )}
      </div>
      <button type="button" onClick={() => setShowTable((v) => !v)} className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dust underline-offset-4 hover:text-bone hover:underline">
        {showTable ? "Hide data" : "Show data"}
      </button>
      {showTable && (
        <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-rim">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{label}</caption>
            <thead className="sticky top-0 bg-basalt font-mono text-[10px] uppercase tracking-[0.14em] text-dust">
              <tr><th className="px-3 py-1.5 font-normal">{intraday ? "Time" : "Session"}</th><th className="px-3 py-1.5 text-right font-normal">Close</th></tr>
            </thead>
            <tbody>
              {[...pts].reverse().map((p) => (
                <tr key={p.t} className="border-t border-rim text-vellum">
                  <td className="px-3 py-1">{fmtWhen(p, intraday)}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{fmtPrice(p.close)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
