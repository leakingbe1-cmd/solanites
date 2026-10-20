/**
 * TradingView widget symbols for the linked stocks. The widget loads in the visitor's browser
 * from TradingView, which licenses and serves the prices (delayed for stocks on free widgets),
 * so no API key exists on our side. Only ever called with a stock the viewer may already see.
 */

const EXCHANGE_PREFIX: Record<string, string> = { NYSE: "NYSE", Nasdaq: "NASDAQ" };

/** "NYSE:DE", "NASDAQ:AMD"; null for an exchange we don't map, so nothing is guessed. */
export function tradingViewSymbol(exchange: string, ticker: string): string | null {
  const prefix = EXCHANGE_PREFIX[exchange];
  if (!prefix || !/^[A-Z][A-Z.]{0,9}$/.test(ticker)) return null;
  return `${prefix}:${ticker}`;
}

/** TradingView's own page for the symbol, used for the required attribution link. */
export function tradingViewSymbolUrl(symbol: string): string {
  return `https://www.tradingview.com/symbols/${symbol.replace(":", "-")}/`;
}

export const TRADINGVIEW_OVERVIEW_SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";

/** Symbol Overview widget settings, styled to the site: neutral line, accent-tinted area. */
export function overviewConfig(symbol: string, company: string, accent: string) {
  return {
    symbols: [[company, `${symbol}|1D`]],
    chartOnly: false,
    width: "100%",
    height: "100%",
    autosize: true,
    locale: "en",
    colorTheme: "dark",
    isTransparent: true,
    showVolume: false,
    showMA: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: "right",
    scaleMode: "Normal",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fontSize: "10",
    noTimeScale: false,
    valuesTracking: "1",
    changeMode: "price-and-percent",
    chartType: "area",
    lineWidth: 2,
    lineType: 0,
    dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W"],
    lineColor: "#efe8da",
    topColor: hexAlpha(accent, 0.22),
    bottomColor: "rgba(15, 13, 20, 0)",
    gridLineColor: "rgba(239, 232, 218, 0.06)",
    fontColor: "rgba(239, 232, 218, 0.62)",
    widgetFontColor: "rgba(239, 232, 218, 0.85)",
  };
}

function hexAlpha(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(239, 232, 218, ${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
