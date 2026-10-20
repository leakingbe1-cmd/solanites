"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { nextWidgetStatus, overviewConfig, TRADINGVIEW_ATTRIBUTION, TRADINGVIEW_OVERVIEW_SCRIPT, type WidgetStatus } from "@/lib/market/tradingview";

/**
 * TradingView's Symbol Overview widget: prices and history served by TradingView in the
 * visitor's browser (timing per TradingView; free widgets may be delayed). Mounted once it
 * scrolls into view, following TradingView's React embed pattern (script appended to the outer
 * container). The attribution block is TradingView's own markup, unaltered, as its terms ask.
 * Only ever rendered for a snapshot the public route marked externalChart: "tradingview",
 * which it never does for classified species, and never inside owner tools.
 */
const FAIL_AFTER_MS = 15_000;

export function TradingViewOverview({ symbol, company, accent, onStatus }: { symbol: string; company: string; accent: string; onStatus?: (s: WidgetStatus) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [status, dispatch] = useReducer(nextWidgetStatus, "idle");

  useEffect(() => onStatus?.(status), [status, onStatus]);

  useEffect(() => {
    const el = host.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true));
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    const container = host.current;
    const widget = container?.querySelector<HTMLDivElement>(".tradingview-widget-container__widget");
    if (!visible || !container || !widget) return;
    dispatch("start");
    const script = document.createElement("script");
    script.src = TRADINGVIEW_OVERVIEW_SCRIPT;
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(overviewConfig(symbol, company, accent));
    script.onerror = () => dispatch("error");
    // Ready whenever TradingView's iframe appears, however late.
    const mo = new MutationObserver(() => container.querySelector("iframe") && dispatch("iframe"));
    mo.observe(container, { childList: true, subtree: true });
    container.appendChild(script);
    const timer = window.setTimeout(() => !container.querySelector("iframe") && dispatch("timeout"), FAIL_AFTER_MS);
    return () => {
      window.clearTimeout(timer);
      mo.disconnect();
      script.remove();
      widget.innerHTML = "";
    };
  }, [visible, symbol, company, accent]);

  return (
    <div ref={host} className="tradingview-widget-container relative" data-tv-symbol={symbol} data-tv-status={status}>
      <div className="tradingview-widget-container__widget h-[300px] sm:h-[340px]" />
      {status !== "ready" && (
        <div aria-hidden={status !== "failed"} className="pointer-events-none absolute inset-x-0 top-0 flex h-[300px] items-center justify-center rounded-xl border border-dashed border-rim px-6 text-center text-sm text-dust sm:h-[340px]">
          {status === "failed" ? "The TradingView chart couldn't load here (it may be blocked by the browser or network)." : "Loading TradingView's chart…"}
        </div>
      )}
      <div className="tradingview-widget-copyright">
        <a href={TRADINGVIEW_ATTRIBUTION.href} rel="noopener nofollow" target="_blank">
          <span className="blue-text">{TRADINGVIEW_ATTRIBUTION.text}</span>
        </a>
      </div>
    </div>
  );
}
