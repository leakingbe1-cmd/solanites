import { describe, expect, it } from "vitest";
import { createMassiveProvider, MarketDataError } from "../market/provider";

const KEY = "test-key-should-never-leak";

function mockFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const seen: { url: string; init: RequestInit }[] = [];
  const f = (async (url: string, init: RequestInit) => {
    seen.push({ url, init });
    return handler(url, init);
  }) as unknown as typeof fetch;
  return { f, seen };
}

describe("Massive provider adapter", () => {
  it("sends the key in a header, never in the URL, and asks for adjusted data", async () => {
    const { f, seen } = mockFetch(() => Response.json({ results: [] }));
    await createMassiveProvider({ apiKey: KEY, fetch: f }).groupedDaily("2026-10-19");
    expect(seen[0].url).toBe("https://api.massive.com/v2/aggs/grouped/locale/us/market/stocks/2026-10-19?adjusted=true");
    expect(seen[0].url).not.toContain(KEY);
    expect((seen[0].init.headers as Record<string, string>).authorization).toBe(`Bearer ${KEY}`);
  });

  it("parses grouped and daily bars, dropping unusable rows", async () => {
    const day = Date.parse("2026-10-19T04:00:00Z"); // midnight New York
    const { f } = mockFetch((url) =>
      url.includes("grouped")
        ? Response.json({ results: [{ T: "AMD", o: 1, h: 2, l: 0.5, c: 1.5, v: 10, t: day }, { T: "BAD", o: 1, h: 1, l: 1, c: 0, v: 1, t: day }] })
        : Response.json({ results: [{ o: 1, h: 2, l: 0.5, c: 1.5, v: 10, t: day }, { o: 1, h: 2, l: 0.5, c: NaN, v: 10, t: day }] }),
    );
    const p = createMassiveProvider({ apiKey: KEY, fetch: f });
    const g = await p.groupedDaily("2026-10-19");
    expect([...g.keys()]).toEqual(["AMD"]);
    expect(g.get("AMD")).toMatchObject({ date: "2026-10-19", close: 1.5 });
    expect(await p.dailyBars("AMD", "2026-10-01", "2026-10-19")).toEqual([{ date: "2026-10-19", open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 }]);
  });

  it("keeps only regular-hours intraday bars of the requested session", async () => {
    const { f } = mockFetch(() =>
      Response.json({
        results: [
          { o: 1, h: 1, l: 1, c: 1, v: 1, t: Date.parse("2026-10-19T12:00:00Z") }, // 8:00 pre-market
          { o: 1, h: 1, l: 1, c: 2, v: 1, t: Date.parse("2026-10-19T13:30:00Z") }, // 9:30 open
          { o: 1, h: 1, l: 1, c: 3, v: 1, t: Date.parse("2026-10-19T19:55:00Z") }, // 3:55 pm
          { o: 1, h: 1, l: 1, c: 4, v: 1, t: Date.parse("2026-10-19T20:00:00Z") }, // 4:00 pm after the bell
        ],
      }),
    );
    expect((await createMassiveProvider({ apiKey: KEY, fetch: f }).intradayBars("AMD", "2026-10-19")).map((b) => b.close)).toEqual([2, 3]);
  });

  it("maps provider failures to clear codes without ever including the key", async () => {
    const cases: [number | "network", string][] = [[401, "NOT_CONFIGURED"], [403, "FORBIDDEN"], [404, "NOT_FOUND"], [429, "RATE_LIMITED"], [500, "UNAVAILABLE"], ["network", "UNAVAILABLE"]];
    for (const [status, code] of cases) {
      const { f } = mockFetch(() => {
        if (status === "network") throw new Error(`connect failed with ${KEY}`);
        return new Response(`error for ${KEY}`, { status });
      });
      const err = await createMassiveProvider({ apiKey: KEY, fetch: f }).dailyBars("AMD", "2026-01-01", "2026-10-19").catch((e) => e);
      expect(err).toBeInstanceOf(MarketDataError);
      expect(err.code).toBe(code);
      expect(err.message).not.toContain(KEY);
    }
  });

  it("encodes tickers in the path", async () => {
    const { f, seen } = mockFetch(() => Response.json({ results: [] }));
    await createMassiveProvider({ apiKey: KEY, fetch: f }).dailyBars("BRK.B", "2026-01-01", "2026-10-19");
    expect(seen[0].url).toContain("/ticker/BRK.B/range/1/day/2026-01-01/2026-10-19");
  });
});
