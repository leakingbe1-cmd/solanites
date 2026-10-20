"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { nextWidgetStatus, overviewConfig, TRADINGVIEW_ATTRIBUTION, TRADINGVIEW_OVERVIEW_SCRIPT, type WidgetStatus } from "@/lib/market/tradingview";

/**
 * TradingView's Symbol Overview widget: prices and history served by TradingView in the
 * visitor's browser (timing per TradingView; free widgets may be delayed). Mounted once it
 * scrolls into view, following TradingView's React embed pattern (script appended to the
 * container). Only ever rendered for a snapshot the public route marked externalChart:
 * "tradingview", which it never does for classified species, and never inside owner tools.
 *
 * Once loaded, TradingView's script replaces everything inside the container with its own
 * iframe and attribution (it adds tracking parameters to the attribution link). So the
 * container's contents are static markup React never updates, it is remounted by key when the
 * symbol changes, and its size, overlay and status live on the outer box React owns.
 */
const FAIL_AFTER_MS = 15_000;

export function TradingViewOverview({ symbol, company, accent, onStatus }: { symbol: string; company: string; accent: string; onStatus?: (s: WidgetStatus) => void }) {
  const outer = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [status, dispatch] = useReducer(nextWidgetStatus, "idle");

  useEffect(() => onStatus?.(status), [status, onStatus]);

  useEffect(() => {
    const el = outer.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true));
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    const container = host.current;
    if (!visible || !container) return;
    // Ready whenever TradingView's iframe appears, however late.
    const mo = new MutationObserver(() => container.querySelector("iframe") && dispatch("iframe"));
    mo.observe(container, { childList: true, subtree: true });
    // One script per container: the script is never removed (TradingView's loader throws if its
    // parent is gone when it runs), so a re-run of this effect must not add a second widget.
    if (!container.dataset.tvScript) {
      container.dataset.tvScript = "1";
      dispatch("start");
      const script = document.createElement("script");
      script.src = TRADINGVIEW_OVERVIEW_SCRIPT;
      script.async = true;
      script.type = "text/javascript";
      script.innerHTML = JSON.stringify(overviewConfig(symbol, company, accent));
      script.onerror = () => dispatch("error");
      container.appendChild(script);
    } else if (container.querySelector("iframe")) dispatch("iframe");
    const timer = window.setTimeout(() => !container.querySelector("iframe") && dispatch("timeout"), FAIL_AFTER_MS);
    // The container (keyed by symbol) is discarded whole on a symbol change or unmount, script
    // and all; removing just the script would break TradingView's loader mid-flight.
    return () => {
      window.clearTimeout(timer);
      mo.disconnect();
    };
  }, [visible, symbol, company, accent]);

  return (
    <div ref={outer} className="relative h-[300px] sm:h-[340px]" data-tv-symbol={symbol} data-tv-status={status}>
      <div key={symbol} ref={host} className="tradingview-widget-container h-full">
        <div className="tradingview-widget-container__widget h-[calc(100%-32px)]" />
        <div className="tradingview-widget-copyright">
          <a href={TRADINGVIEW_ATTRIBUTION.href} rel="noopener nofollow" target="_blank">
            <span className="blue-text">{TRADINGVIEW_ATTRIBUTION.text}</span>
          </a>
        </div>
      </div>
      {status !== "ready" && (
        <div aria-hidden={status !== "failed"} className="pointer-events-none absolute inset-x-0 top-0 bottom-8 flex items-center justify-center rounded-xl border border-dashed border-rim px-6 text-center text-sm text-dust">
          {status === "failed" ? "The TradingView chart couldn't load here (it may be blocked by the browser or network)." : "Loading TradingView's chart…"}
        </div>
      )}
    </div>
  );
}
