import { describe, expect, it } from "vitest";
import { panelMode } from "@/components/market/panelMode";
import { nextWidgetStatus, TRADINGVIEW_ATTRIBUTION, type WidgetStatus } from "@/lib/market/tradingview";

const stock = { ticker: "DE", company: "Deere & Company", exchange: "NYSE", sector: "", connection: "" };

describe("panel mode", () => {
  it("shows the widget only for a server-marked public snapshot outside owner tools", () => {
    expect(panelMode({ status: "unavailable", externalChart: "tradingview", stock }, { ownerTools: false })).toEqual({ kind: "widget", symbol: "NYSE:DE" });
    expect(panelMode({ status: "unavailable", externalChart: "tradingview", stock }, { ownerTools: true })).toEqual({ kind: "none" });
    expect(panelMode({ status: "unavailable", stock }, { ownerTools: false })).toEqual({ kind: "none" });
    expect(panelMode({ status: "unavailable", externalChart: "tradingview", stock: { ...stock, exchange: "LSE" } }, { ownerTools: false })).toEqual({ kind: "none" });
  });

  it("server data always wins over the widget", () => {
    for (const status of ["previous_close", "delayed", "stale", "sample"] as const) expect(panelMode({ status, externalChart: "tradingview", stock }, { ownerTools: false })).toEqual({ kind: "server" });
  });
});

describe("widget load state", () => {
  const run = (...events: Parameters<typeof nextWidgetStatus>[1][]) => events.reduce<WidgetStatus>((s, e) => nextWidgetStatus(s, e), "idle");
  it("loads, then is ready when the iframe appears", () => expect(run("start", "iframe")).toBe("ready"));
  it("fails on timeout or script error", () => {
    expect(run("start", "timeout")).toBe("failed");
    expect(run("start", "error")).toBe("failed");
  });
  it("an iframe arriving after the timeout clears the failure", () => expect(run("start", "timeout", "iframe")).toBe("ready"));
  it("a late timeout never hides a working chart", () => expect(run("start", "iframe", "timeout", "error")).toBe("ready"));
  it("a new symbol starts loading again", () => expect(run("start", "timeout", "start")).toBe("loading"));
  it("the attribution is TradingView's own builder text", () => expect(TRADINGVIEW_ATTRIBUTION).toEqual({ href: "https://www.tradingview.com/", text: "Track all markets on TradingView" }));
});
