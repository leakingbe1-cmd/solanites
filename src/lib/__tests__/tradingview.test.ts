import { describe, expect, it } from "vitest";
import { overviewConfig, tradingViewSymbol, tradingViewSymbolUrl } from "@/lib/market/tradingview";

/** TradingView symbols are derived from the server's stock identity, never typed by hand. */
describe("TradingView symbols", () => {
  it("maps both exchanges and refuses anything unknown or malformed", () => {
    expect(tradingViewSymbol("NYSE", "DE")).toBe("NYSE:DE");
    expect(tradingViewSymbol("Nasdaq", "AMD")).toBe("NASDAQ:AMD");
    expect(tradingViewSymbol("LSE", "VOD")).toBeNull();
    expect(tradingViewSymbol("NYSE", "de")).toBeNull();
    expect(tradingViewSymbol("NYSE", "DE\"><script>")).toBeNull();
    expect(tradingViewSymbolUrl("NASDAQ:AMD")).toBe("https://www.tradingview.com/symbols/NASDAQ-AMD/");
  });

  it("the widget is configured for exactly the requested symbol, with delayed-data-safe settings", () => {
    const c = overviewConfig("NYSE:DE", "Deere & Company", "#46c9b0");
    expect(c.symbols).toEqual([["Deere & Company", "NYSE:DE|1D"]]);
    expect(c.colorTheme).toBe("dark");
    expect(c.topColor).toBe("rgba(70, 201, 176, 0.22)");
    expect(c.lineColor).toBe("#efe8da");
  });
});
