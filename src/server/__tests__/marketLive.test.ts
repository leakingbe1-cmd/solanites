import { afterEach, describe, expect, it, vi } from "vitest";
import { createLiveMarket, etToEpoch } from "@/server/market/live";
import { MarketDataError } from "@/server/market/provider";
import { createTwelveDataClient, type TwelveDataClient } from "@/server/market/twelvedata";

/**
 * Twelve Data client and live service. These run against responses shaped like Twelve Data's
 * documented formats (time_series, quote, error objects), not the live API: this test
 * environment cannot reach api.twelvedata.com. The deployed check is scripts/qa/live-market.mjs.
 */

const KEY = "td-test-key-never-leaks";
// Mon 19 Oct 2026, 20:00 UTC = 4:00 pm ET: after the close. 14:30 UTC = 10:30 am ET: open.
const AFTER_CLOSE = Date.parse("2026-10-19T20:30:00Z");
const OPEN = Date.parse("2026-10-19T14:30:00Z");

function dailyValues(ticker: string, days: number, start = 100) {
  const out: { datetime: string; open: string; high: string; low: string; close: string; volume: string }[] = [];
  let d = Date.parse("2025-09-01T12:00:00Z");
  let price = start + ticker.length; // different tickers, different prices
  while (out.length < days) {
    const wd = new Date(d).getUTCDay();
    if (wd !== 0 && wd !== 6) {
      price = Math.round(price * (1 + (((out.length * 7) % 5) - 2) / 100) * 100) / 100;
      const c = price.toFixed(2);
      out.push({ datetime: new Date(d).toISOString().slice(0, 10), open: c, high: c, low: c, close: c, volume: "1000" });
    }
    d += 86_400_000;
  }
  return out.filter((v) => v.datetime <= "2026-10-19");
}

function fakeFetch(handler: (url: URL, init?: RequestInit) => unknown) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const body = handler(url, init);
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  });
}

const tdExchange = (url: URL) => url.searchParams.get("exchange");
function standardHandler(opts: { lastQuoteAt?: number | null; open?: boolean } = {}) {
  return (url: URL) => {
    const symbol = url.searchParams.get("symbol")!;
    const exchange = tdExchange(url);
    if (url.pathname === "/time_series") {
      const interval = url.searchParams.get("interval");
      if (interval === "5min") {
        const values = Array.from({ length: 12 }, (_, i) => ({ datetime: `2026-10-19 ${String(9 + Math.floor((30 + i * 5) / 60)).padStart(2, "0")}:${String((30 + i * 5) % 60).padStart(2, "0")}:00`, close: (50 + i).toFixed(2) }));
        return { meta: { symbol, interval, currency: "USD", exchange_timezone: "America/New_York", exchange, mic_code: "XNYS", type: "Common Stock" }, values, status: "ok" };
      }
      return { meta: { symbol, interval, currency: "USD", exchange_timezone: "America/New_York", exchange, mic_code: "XNYS", type: "Common Stock" }, values: dailyValues(symbol, 300), status: "ok" };
    }
    const vals = dailyValues(symbol, 300);
    const last = vals.at(-1)!;
    const prev = vals.at(-2)!;
    return {
      symbol,
      name: symbol,
      exchange,
      currency: "USD",
      datetime: last.datetime,
      timestamp: Math.floor(Date.parse(`${last.datetime}T13:30:00Z`) / 1000),
      close: last.close,
      previous_close: prev.close,
      change: (Number(last.close) - Number(prev.close)).toFixed(4),
      percent_change: (((Number(last.close) - Number(prev.close)) / Number(prev.close)) * 100).toFixed(4),
      is_market_open: opts.open ?? false,
      ...(opts.lastQuoteAt !== undefined && opts.lastQuoteAt !== null ? { last_quote_at: Math.floor(opts.lastQuoteAt / 1000) } : {}),
    };
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TWELVE_DATA_API_KEY;
  delete process.env.MARKET_PUBLIC_DISPLAY;
});

describe("Twelve Data client", () => {
  it("sends the key only in the Authorization header and pins the exchange", async () => {
    const f = fakeFetch(standardHandler());
    const c = createTwelveDataClient({ apiKey: KEY, fetch: f as unknown as typeof fetch });
    const bars = await c.timeSeries("DE", "NYSE", "1day", 270);
    expect(bars.length).toBeGreaterThan(200);
    const [url, init] = f.mock.calls[0];
    expect(String(url)).not.toContain(KEY);
    expect(String(url)).toContain("exchange=NYSE");
    expect((init!.headers as Record<string, string>).authorization).toBe(`apikey ${KEY}`);
    expect(bars.every((b, i) => i === 0 || bars[i - 1].datetime < b.datetime)).toBe(true);
  });

  it("rejects an answer for another symbol, exchange or currency, so prices can't cross creatures", async () => {
    const wrongSymbol = createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch((u) => ({ ...(standardHandler()(u) as object), meta: { symbol: "AMD", exchange: "NASDAQ", currency: "USD" } })) as unknown as typeof fetch });
    await expect(wrongSymbol.timeSeries("DE", "NYSE", "1day", 10)).rejects.toThrow(/different symbol/);
    const wrongExchange = createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch((u) => ({ meta: { symbol: u.searchParams.get("symbol"), exchange: "LSE", currency: "USD" }, values: [], status: "ok" })) as unknown as typeof fetch });
    await expect(wrongExchange.timeSeries("DE", "NYSE", "1day", 10)).rejects.toThrow(/different exchange/);
    const wrongCurrency = createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch((u) => ({ symbol: u.searchParams.get("symbol"), exchange: "NYSE", currency: "EUR", close: "10", datetime: "2026-10-19" })) as unknown as typeof fetch });
    await expect(wrongCurrency.quote("DE", "NYSE")).rejects.toThrow(/currency/);
  });

  it("drops malformed points and never invents any", async () => {
    const c = createTwelveDataClient({
      apiKey: KEY,
      fetch: fakeFetch((u) => ({
        meta: { symbol: u.searchParams.get("symbol"), exchange: "NYSE", currency: "USD" },
        values: [
          { datetime: "2026-10-15", close: "10.5" },
          { datetime: "2026-10-15", close: "11" },
          { datetime: "not a date", close: "12" },
          { datetime: "2026-10-16", close: "-3" },
          { datetime: "2026-10-17", close: "NaN" },
          { datetime: "2026-10-19", close: "12.25" },
        ],
        status: "ok",
      })) as unknown as typeof fetch,
    });
    // 2026-10-15 arrives twice with different closes (10.5 vs 11), so that date is dropped.
    expect(await c.timeSeries("DE", "NYSE", "1day", 10)).toEqual([{ datetime: "2026-10-19", close: 12.25 }]);
  });

  describe("duplicate and malformed records (policy: conflicting dates are dropped, order never matters)", () => {
    const series = (values: { datetime: string; close: string }[]) =>
      createTwelveDataClient({
        apiKey: KEY,
        fetch: fakeFetch((u) => ({ meta: { symbol: u.searchParams.get("symbol"), exchange: "NYSE", currency: "USD" }, values, status: "ok" })) as unknown as typeof fetch,
      }).timeSeries("DE", "NYSE", "1day", 10);

    it("identical duplicates collapse to one bar", async () => {
      expect(await series([{ datetime: "2026-10-15", close: "10.5" }, { datetime: "2026-10-15", close: "10.50" }])).toEqual([{ datetime: "2026-10-15", close: 10.5 }]);
    });

    it("conflicting duplicates drop the date, whichever order they arrive in", async () => {
      const a = [{ datetime: "2026-10-14", close: "9" }, { datetime: "2026-10-15", close: "10.5" }, { datetime: "2026-10-15", close: "11" }, { datetime: "2026-10-16", close: "12" }];
      const want = [{ datetime: "2026-10-14", close: 9 }, { datetime: "2026-10-16", close: 12 }];
      expect(await series(a)).toEqual(want);
      expect(await series([...a].reverse())).toEqual(want);
    });

    it("two agreeing records and one dissenting record still drop the date", async () => {
      const rows = [{ datetime: "2026-10-15", close: "10" }, { datetime: "2026-10-15", close: "10" }, { datetime: "2026-10-15", close: "10.01" }, { datetime: "2026-10-16", close: "12" }];
      expect(await series(rows)).toEqual([{ datetime: "2026-10-16", close: 12 }]);
      expect(await series([rows[2], rows[0], rows[3], rows[1]])).toEqual([{ datetime: "2026-10-16", close: 12 }]);
    });

    it("unsorted records come back in chronological order", async () => {
      expect(await series([{ datetime: "2026-10-16", close: "3" }, { datetime: "2026-10-14", close: "1" }, { datetime: "2026-10-15", close: "2" }])).toEqual([
        { datetime: "2026-10-14", close: 1 },
        { datetime: "2026-10-15", close: 2 },
        { datetime: "2026-10-16", close: 3 },
      ]);
    });

    it("invalid dates and closes are ignored and never create or break a date", async () => {
      const rows = [
        { datetime: "2026-10-15", close: "10" },
        { datetime: "2026-10-15", close: "NaN" }, // invalid: ignored, not a conflict
        { datetime: "2026-10-15", close: "-1" },
        { datetime: "15/10/2026", close: "10" },
        { datetime: "2026-10-16", close: "" },
        { datetime: "2026-10-17", close: "0" },
        { datetime: "2026-10-19", close: "12.25" },
      ];
      expect(await series(rows)).toEqual([{ datetime: "2026-10-15", close: 10 }, { datetime: "2026-10-19", close: 12.25 }]);
    });

    it("a clean series is unchanged", async () => {
      const bars = await createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch(standardHandler()) as unknown as typeof fetch }).timeSeries("DE", "NYSE", "1day", 270);
      expect(bars.length).toBe(dailyValues("DE", 300).length);
      expect(bars.every((b, i) => i === 0 || bars[i - 1].datetime < b.datetime)).toBe(true);
    });
  });

  it("maps provider errors to codes and never repeats the provider's message or the key", async () => {
    for (const [code, want] of [[429, "RATE_LIMITED"], [401, "FORBIDDEN"], [404, "NOT_FOUND"], [500, "UNAVAILABLE"]] as const) {
      const c = createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch(() => ({ code, message: `bad apikey ${KEY} detail`, status: "error" })) as unknown as typeof fetch });
      const e = await c.quote("DE", "NYSE").catch((x) => x);
      expect(e).toBeInstanceOf(MarketDataError);
      expect(e.code).toBe(want);
      expect(e.message).not.toContain(KEY);
      expect(e.message).not.toContain("detail");
    }
  });
});

describe("live market service", () => {
  const clientWith = (h: ReturnType<typeof standardHandler>) => createTwelveDataClient({ apiKey: KEY, fetch: fakeFetch(h) as unknown as typeof fetch });

  it("after the close: the official close, labelled end-of-day, with change, 1M chart and Vigour from the same history", async () => {
    const live = createLiveMarket({ client: clientWith(standardHandler()), now: () => AFTER_CLOSE });
    const s = await live.snapshot("mossling", "1M");
    expect(s.stock.ticker).toBe("DE");
    expect(s.status).toBe("previous_close");
    expect(s.statusDetail).toMatch(/end-of-day/);
    expect(s.quote!.sessionDate).toBe("2026-10-19");
    expect(s.quote!.previousSessionDate).toBe("2026-10-16");
    expect(s.quote!.change).toBeCloseTo(s.quote!.price - s.quote!.previousClose!, 3);
    expect(s.chart.points).toHaveLength(22);
    expect(s.chart.points.at(-1)!.close).toBe(s.quote!.price);
    expect(s.growth!.window.length).toBe(20);
    expect(s.source).toMatchObject({ name: "Twelve Data" });
  });

  it("labels real-time only for a fresh intraday price while open; otherwise delayed or stale", async () => {
    const at = async (age: number | null) => (await createLiveMarket({ client: clientWith(standardHandler({ open: true, lastQuoteAt: age === null ? null : OPEN - age })), now: () => OPEN }).snapshot("mossling", "1W")).status;
    expect(await at(30_000)).toBe("realtime");
    expect(await at(10 * 60_000)).toBe("delayed");
    expect(await at(3 * 3600_000)).toBe("stale");
    expect(await at(null)).toBe("delayed");
  });

  it("while open, today's still-moving daily bar is not counted as a close", async () => {
    const s = await createLiveMarket({ client: clientWith(standardHandler({ open: true, lastQuoteAt: OPEN - 10_000 })), now: () => OPEN }).snapshot("mossling", "1W");
    expect(s.chart.points.every((p) => p.date < "2026-10-19")).toBe(true);
    expect(s.growth!.window[0].date).toBe("2026-10-16");
  });

  it("different creatures get their own tickers' data", async () => {
    const live = createLiveMarket({ client: clientWith(standardHandler()), now: () => AFTER_CLOSE });
    const a = await live.snapshot("mossling", "1M");
    const b = await live.snapshot("pyraurum", "1M");
    expect(a.stock.ticker).toBe("DE");
    expect(b.stock.ticker).toBe("AMD");
    expect(a.quote!.price).not.toBe(b.quote!.price);
  });

  it("caches, shares in-flight calls and enforces the per-minute budget before calling", async () => {
    const h = standardHandler();
    const f = fakeFetch(h);
    const c: TwelveDataClient = createTwelveDataClient({ apiKey: KEY, fetch: f as unknown as typeof fetch });
    let t = AFTER_CLOSE;
    const live = createLiveMarket({ client: c, now: () => t, creditsPerMinute: 8, creditsPerDay: 800 });
    await Promise.all([live.snapshot("mossling", "1M"), live.snapshot("mossling", "1Y"), live.snapshot("mossling", "1W")]);
    expect(f).toHaveBeenCalledTimes(2); // one daily series + one quote, shared
    await live.snapshot("mossling", "3M");
    expect(f).toHaveBeenCalledTimes(2); // cached
    for (const id of ["pyraurum", "velynx", "thalor"]) await live.snapshot(id, "1M"); // 6 more credits = 8
    const busy = await live.snapshot("zephrax", "1M").catch((e) => e);
    expect(busy.code).toBe("RATE_LIMITED");
    expect(f).toHaveBeenCalledTimes(8); // the 9th was refused before calling
    t += 61_000;
    await expect(live.snapshot("zephrax", "1M")).resolves.toMatchObject({ stock: { ticker: "TSLA" } });
  });

  it("a provider rate limit is remembered for a minute instead of retried at once", async () => {
    let calls = 0;
    const c = createTwelveDataClient({ apiKey: KEY, fetch: (async () => { calls++; return new Response(JSON.stringify({ code: 429, message: "x", status: "error" })); }) as unknown as typeof fetch });
    let t = AFTER_CLOSE;
    const live = createLiveMarket({ client: c, now: () => t });
    await expect(live.snapshot("mossling")).rejects.toMatchObject({ code: "RATE_LIMITED" });
    await expect(live.snapshot("mossling")).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(calls).toBe(1);
    t += 61_000;
    await live.snapshot("mossling").catch(() => null);
    expect(calls).toBe(2);
  });

  it("1D uses the session's 5-minute bars at the right instants", async () => {
    const s = await createLiveMarket({ client: clientWith(standardHandler()), now: () => AFTER_CLOSE }).snapshot("mossling", "1D");
    expect(s.chart.interval).toBe("5min");
    expect(s.chart.points[0].t).toBe(Date.parse("2026-10-19T13:30:00Z")); // 9:30 am EDT
    expect(etToEpoch("2026-12-01 09:30:00")).toBe(Date.parse("2026-12-01T14:30:00Z")); // EST
  });
});

describe("public display gate", () => {
  it("with a key configured but the gate off, public responses carry no provider numbers", async () => {
    process.env.TWELVE_DATA_API_KEY = KEY;
    const f = fakeFetch(standardHandler());
    vi.stubGlobal("fetch", f);
    const prevFixtures = process.env.SOLANITES_FIXTURES;
    process.env.SOLANITES_FIXTURES = "0";
    try {
      const { GET } = await import("@/app/api/market/[speciesId]/route");
      const res = await GET(new Request("http://localhost/api/market/mossling?range=1M"), { params: Promise.resolve({ speciesId: "mossling" }) });
      const body = await res.json();
      expect(body.status).toBe("unavailable");
      expect(body.quote).toBeNull();
      expect(body.growth).toBeNull();
      expect(body.chart.points).toEqual([]);
      expect(body.stock.ticker).toBe("DE");
      expect(f).not.toHaveBeenCalled();
      expect(JSON.stringify(body)).not.toContain(KEY);
      const classified = await GET(new Request("http://localhost/api/market/astravex"), { params: Promise.resolve({ speciesId: "astravex" }) });
      expect(classified.status).toBe(404);
    } finally {
      process.env.SOLANITES_FIXTURES = prevFixtures;
    }
  });

  it("with the gate on, the public route serves the provider's data, with no key in the response", async () => {
    process.env.TWELVE_DATA_API_KEY = KEY;
    process.env.MARKET_PUBLIC_DISPLAY = "1";
    vi.stubGlobal("fetch", fakeFetch(standardHandler()));
    const prevFixtures = process.env.SOLANITES_FIXTURES;
    process.env.SOLANITES_FIXTURES = "0";
    try {
      const { GET } = await import("@/app/api/market/[speciesId]/route");
      const res = await GET(new Request("http://localhost/api/market/pyraurum?range=1W"), { params: Promise.resolve({ speciesId: "pyraurum" }) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.stock.ticker).toBe("AMD");
      expect(body.quote.price).toBeGreaterThan(0);
      expect(body.source.name).toBe("Twelve Data");
      expect(JSON.stringify(body)).not.toContain(KEY);
      expect(res.headers.get("cache-control")).toContain("s-maxage=60");
    } finally {
      process.env.SOLANITES_FIXTURES = prevFixtures;
    }
  });
});
