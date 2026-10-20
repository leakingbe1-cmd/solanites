"use client";

import { useEffect, useRef, useState } from "react";
import { overviewConfig, TRADINGVIEW_OVERVIEW_SCRIPT, tradingViewSymbolUrl } from "@/lib/market/tradingview";

/**
 * TradingView's Symbol Overview widget: genuine prices and history, served and licensed by
 * TradingView in the visitor's browser (stock prices are delayed on free widgets). Mounted
 * only once it scrolls near the viewport, so a page of many creatures doesn't load them all.
 * TradingView's attribution link stays as designed, which its widget terms require.
 */
export function TradingViewOverview({ symbol, company, accent, height = 340 }: { symbol: string; company: string; accent: string; height?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    const el = host.current?.querySelector<HTMLDivElement>(".tradingview-widget-container__widget");
    if (!visible || !el) return;
    setFailed(false);
    el.innerHTML = "";
    const script = document.createElement("script");
    script.src = TRADINGVIEW_OVERVIEW_SCRIPT;
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(overviewConfig(symbol, company, accent));
    script.onerror = () => setFailed(true);
    el.appendChild(script);
    // The widget replaces the script with an iframe; if none appears (blocked or offline), say so.
    const timer = window.setTimeout(() => !el.querySelector("iframe") && setFailed(true), 12_000);
    return () => {
      window.clearTimeout(timer);
      el.innerHTML = "";
    };
  }, [visible, symbol, company, accent]);

  return (
    <div ref={host} className="tradingview-widget-container relative" data-tv-symbol={symbol}>
      <div className="tradingview-widget-container__widget" style={{ height }} />
      {failed && (
        <div style={{ height }} className="absolute inset-x-0 top-0 flex items-center justify-center rounded-xl border border-dashed border-rim px-6 text-center text-sm text-dust">
          The TradingView chart couldn&apos;t load here (it may be blocked by the browser or network).
        </div>
      )}
      <div className="tradingview-widget-copyright mt-2 font-mono text-[10px] tracking-[0.06em] text-dust">
        <a href={tradingViewSymbolUrl(symbol)} rel="noopener nofollow" target="_blank" className="underline-offset-4 hover:text-bone hover:underline">
          {symbol} chart by TradingView
        </a>
      </div>
    </div>
  );
}
