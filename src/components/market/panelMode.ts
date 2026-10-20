import { tradingViewSymbol } from "@/lib/market/tradingview";
import type { MarketSnapshot } from "@/lib/market/types";

/**
 * What a stock panel shows for a snapshot:
 *   "widget"  TradingView's embeddable chart: only when the public route marked the snapshot
 *             (externalChart, never set for classified species) and never inside owner tools,
 *             where a third-party script would sit next to classified data.
 *   "none"    identity only: the server has no displayable prices and no widget is enabled.
 *   "server"  prices, chart and Vigour from the server's snapshot.
 */
export type PanelMode = { kind: "widget"; symbol: string } | { kind: "none" } | { kind: "server" };

export function panelMode(snap: Pick<MarketSnapshot, "status" | "externalChart" | "stock">, opts: { ownerTools: boolean }): PanelMode {
  if (snap.status === "unavailable") {
    const symbol = !opts.ownerTools && snap.externalChart === "tradingview" ? tradingViewSymbol(snap.stock.exchange, snap.stock.ticker) : null;
    return symbol ? { kind: "widget", symbol } : { kind: "none" };
  }
  return { kind: "server" };
}
