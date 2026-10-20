import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/** Review fixes for the public market route, the widget switch and key hygiene. */
const req = (url: string) => new Request(`http://localhost:3000${url}`);
const params = (speciesId: string) => ({ params: Promise.resolve({ speciesId }) });

beforeAll(() => {
  process.env.SOLANITES_FIXTURES = "0";
});
afterEach(() => {
  delete process.env.MARKET_WIDGET;
  delete process.env.MARKET_PUBLIC_DISPLAY;
  delete process.env.TWELVE_DATA_API_KEY;
  vi.unstubAllGlobals();
});

describe("MARKET_WIDGET: the only public price display, decided by the server", () => {
  it("is off by default: no externalChart, nothing to embed", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const body = await (await GET(req("/api/market/mossling"), params("mossling"))).json();
    expect(body.status).toBe("unavailable");
    expect(body.externalChart).toBeUndefined();
  });

  it("when set to tradingview, public species get externalChart and honest wording; prices stay null", async () => {
    process.env.MARKET_WIDGET = "tradingview";
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const body = await (await GET(req("/api/market/pyraurum"), params("pyraurum"))).json();
    expect(body.externalChart).toBe("tradingview");
    expect(body.statusDetail).toBe("Prices and chart by TradingView; timing per TradingView, may be delayed.");
    expect(body.quote).toBeNull();
    expect(body.growth).toBeNull();
    expect(body.chart.points).toEqual([]);
  });

  it("never for a classified species: the same 404 as an unknown id", async () => {
    process.env.MARKET_WIDGET = "tradingview";
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const unknown = await GET(req("/api/market/no-such"), params("no-such"));
    for (const id of (await import("@/server/classified")).CLASSIFIED_SPECIES.map((s) => s.id)) {
      const r = await GET(req(`/api/market/${id}`), params(id));
      expect(r.status).toBe(404);
      expect(await r.json()).toEqual(await unknown.clone().json());
    }
  });

  it("the public identity answer carries no mapping notes or provider name", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    const r = await GET(req("/api/market/pyraurum"), params("pyraurum"));
    const body = await r.json();
    expect(body.review).toBeNull();
    expect(body.source).toEqual({ name: "None", plan: "Not published", fetchedAt: null });
    expect(body.statusDetail).toBe("This site doesn't publish stock prices.");
    expect(r.headers.get("cache-control")).toContain("no-store");
  });

  it("any other value is off", async () => {
    process.env.MARKET_WIDGET = "yes";
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    expect((await (await GET(req("/api/market/mossling"), params("mossling"))).json()).externalChart).toBeUndefined();
  });
});

describe("public route parity", () => {
  it("an invalid range answers 400 for every id, before any lookup", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    for (const id of ["mossling", "no-such", "astravex", "constructor"]) expect((await GET(req(`/api/market/${id}?range=10Y`), params(id))).status).toBe(400);
  });

  it("prototype names are unknown ids, not lookups", async () => {
    const { GET } = await import("@/app/api/market/[speciesId]/route");
    for (const id of ["constructor", "__proto__", "toString", "hasOwnProperty"]) expect((await GET(req(`/api/market/${id}`), params(id))).status).toBe(404);
    const { stockLinkOf } = await import("@/server/market/stockLinks");
    expect(stockLinkOf("constructor")).toBeNull();
    expect(stockLinkOf("__proto__")).toBeNull();
  });
});

describe("key hygiene", () => {
  it("log lines redact api keys in any of the provider's spellings", async () => {
    const lines: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a) => void lines.push(a.map(String).join(" ")));
    const { log } = await import("@/server/log");
    log.error("x", { detail: "GET /quote?apikey=abc123SECRET&symbol=DE", header: "apikey abc123SECRET", other: "api_key=abc123SECRET" });
    spy.mockRestore();
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain("[redacted]");
    expect(lines.join("\n")).not.toContain("abc123SECRET");
  });

  it("TWELVE_DATA_API_BASE is only honoured over https", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: RequestInfo | URL) => { seen.push(String(u)); return Response.json({ code: 500, status: "error" }); }));
    const { getLiveMarket } = await import("@/server/market/runtime");
    await getLiveMarket({ TWELVE_DATA_API_KEY: "k-http", TWELVE_DATA_API_BASE: "http://evil.example" })!.snapshot("mossling").catch(() => null);
    await getLiveMarket({ TWELVE_DATA_API_KEY: "k-https", TWELVE_DATA_API_BASE: "https://mock.example" })!.snapshot("mossling").catch(() => null);
    expect(seen.some((u) => u.startsWith("http://evil.example"))).toBe(false);
    expect(seen.some((u) => u.startsWith("https://api.twelvedata.com/"))).toBe(true);
    expect(seen.some((u) => u.startsWith("https://mock.example/"))).toBe(true);
  });
});
