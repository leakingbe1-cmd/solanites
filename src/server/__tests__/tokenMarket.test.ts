import { describe, expect, it, vi } from "vitest";
import { createTokenMarket, TOKEN_MARKET_TTL_MS } from "../market/tokenMarket";

/** Token market provider: DexScreener first, pump.fun as fallback, both mocked. */
const MINT = "TestMint1111111111111111111111111111111pump";
const OTHER = "OtherMint111111111111111111111111111111pump";
const T0 = Date.UTC(2026, 9, 20, 19, 0, 0);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const pair = (over: Record<string, unknown> = {}) => ({
  chainId: "solana",
  baseToken: { address: MINT },
  priceUsd: "0.0002",
  liquidity: { usd: 50_000 },
  marketCap: 190_000,
  fdv: 200_000,
  ...over,
});
const pumpCoin = (over: Record<string, unknown> = {}) => ({
  mint: MINT,
  base_decimals: 6,
  usd_market_cap: 192_873.42,
  total_supply: 1_000_000_000_000_000,
  total_supply_str: "1000000000000000",
  circulating_supply_str: "1000000000000000",
  ...over,
});

/** A fetch that answers per host; anything unlisted fails like a refused connection. */
function mockFetch(routes: { dex?: () => Response | Promise<Response>; pump?: () => Response | Promise<Response> }) {
  return vi.fn(async (url: string | URL | Request) => {
    const u = String(url);
    if (u.startsWith("https://api.dexscreener.com/tokens/v1/solana/") && routes.dex) return routes.dex();
    if (u.startsWith("https://frontend-api-v3.pump.fun/coins-v2/") && routes.pump) return routes.pump();
    throw new TypeError("fetch failed");
  });
}

function setup(routes: Parameters<typeof mockFetch>[0]) {
  let now = T0;
  const fetch = mockFetch(routes);
  const read = createTokenMarket({ fetch: fetch as unknown as typeof globalThis.fetch, now: () => now });
  return { read, fetch, advance: (ms: number) => (now += ms) };
}

describe("DexScreener (primary)", () => {
  it("uses the most liquid Solana pair for the mint; marketCap is circulating", async () => {
    const { read } = setup({
      dex: () =>
        json([
          pair({ priceUsd: "0.00019", liquidity: { usd: 2_000 }, marketCap: 180_000 }),
          pair(),
          pair({ chainId: "ethereum", liquidity: { usd: 9e9 } }),
          pair({ baseToken: { address: OTHER }, liquidity: { usd: 9e9 } }),
        ]),
    });
    expect(await read(MINT)).toEqual({ priceUsd: 0.0002, valueUsd: 190_000, kind: "circulating", source: "DexScreener", asOf: T0 });
  });

  it("only FDV available: kind fdv, never relabelled as market cap", async () => {
    const { read } = setup({ dex: () => json([pair({ marketCap: undefined })]) });
    expect(await read(MINT)).toMatchObject({ valueUsd: 200_000, kind: "fdv", source: "DexScreener" });
  });
});

describe("pump.fun (fallback)", () => {
  it("is used when DexScreener is unreachable; price from total supply, value from circulating supply", async () => {
    const { read } = setup({ pump: () => json(pumpCoin({ circulating_supply_str: "800000000000000" })) });
    const m = await read(MINT);
    expect(m.source).toBe("pump.fun");
    expect(m.kind).toBe("circulating");
    expect(m.priceUsd).toBeCloseTo(192_873.42 / 1e9, 12);
    expect(m.valueUsd).toBeCloseTo(192_873.42 * 0.8, 6);
    expect(m.asOf).toBe(T0);
  });

  it("is used when DexScreener has no pair for the mint (bonding-curve coin)", async () => {
    const { read } = setup({ dex: () => json([]), pump: () => json(pumpCoin()) });
    expect(await read(MINT)).toMatchObject({ source: "pump.fun", kind: "circulating" });
  });

  it("without a usable circulating supply it reports the total-supply figure as fdv", async () => {
    for (const circ of [undefined, "0", "-5", "abc", "2000000000000000"]) {
      const { read } = setup({ pump: () => json(pumpCoin({ circulating_supply_str: circ })) });
      expect(await read(MINT)).toMatchObject({ valueUsd: 192_873.42, kind: "fdv", source: "pump.fun" });
    }
  });
});

describe("failures and nonsense", () => {
  it("throws when every provider fails; nothing is invented", async () => {
    const { read } = setup({ dex: () => json({ error: "x" }, 500), pump: () => json({}, 503) });
    await expect(read(MINT)).rejects.toThrow("unavailable");
  });

  it("rejects malformed and nonsense answers (NaN, 0, negative, wrong mint, wrong shape)", async () => {
    const bad = [
      { dex: () => json({ pairs: [] }), pump: () => json(pumpCoin({ mint: OTHER })) },
      { dex: () => json([pair({ priceUsd: "NaN" })]), pump: () => json(pumpCoin({ usd_market_cap: 0 })) },
      { dex: () => json([pair({ priceUsd: "-1" })]), pump: () => json(pumpCoin({ usd_market_cap: -10 })) },
      { dex: () => json([pair({ marketCap: 0, fdv: "x" })]), pump: () => json(pumpCoin({ base_decimals: "6" })) },
      { dex: () => json([pair({ liquidity: {} })]), pump: () => new Response("<html>", { status: 200 }) },
      { dex: () => json(null), pump: () => json(pumpCoin({ total_supply: null, total_supply_str: undefined })) },
    ];
    for (const routes of bad) await expect(setup(routes).read(MINT)).rejects.toThrow();
  });

  it("refuses an invalid mint without calling any provider", async () => {
    const { read, fetch } = setup({ dex: () => json([pair()]) });
    for (const m of ["", "not a mint", "0OIl" + "1".repeat(40), "../../etc"]) await expect(read(m)).rejects.toThrow("Invalid mint");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("a timed-out provider falls through to the next", async () => {
    vi.useFakeTimers();
    try {
      const fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
        if (String(url).includes("dexscreener")) return new Promise<Response>((_, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))));
        return Promise.resolve(json(pumpCoin()));
      });
      const read = createTokenMarket({ fetch: fetch as unknown as typeof globalThis.fetch, now: () => T0 });
      const p = read(MINT);
      await vi.advanceTimersByTimeAsync(8_000);
      expect(await p).toMatchObject({ source: "pump.fun" });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("cache, staleness and rate limits", () => {
  it("serves one request per 30 s per mint and keeps the original asOf (never re-stamped as fresh)", async () => {
    const { read, fetch, advance } = setup({ dex: () => json([pair()]) });
    const first = await read(MINT);
    advance(TOKEN_MARKET_TTL_MS - 1);
    expect(await read(MINT)).toEqual(first);
    expect((await read(MINT)).asOf).toBe(T0);
    expect(fetch).toHaveBeenCalledTimes(1);
    advance(2);
    expect((await read(MINT)).asOf).toBe(T0 + TOKEN_MARKET_TTL_MS + 1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("concurrent callers share one request", async () => {
    const { read, fetch } = setup({ dex: () => json([pair()]) });
    await Promise.all([read(MINT), read(MINT), read(MINT)]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("an expired value is not served after a failed refresh; the caller decides what is stale", async () => {
    let up = true;
    const { read, advance } = setup({ dex: () => (up ? json([pair()]) : json({}, 500)) });
    await read(MINT);
    up = false;
    advance(TOKEN_MARKET_TTL_MS + 1);
    await expect(read(MINT)).rejects.toThrow("unavailable");
  });

  it("a provider answering 429 is skipped for 60 s, then tried again", async () => {
    const { read, fetch, advance } = setup({ dex: () => json({}, 429), pump: () => json(pumpCoin()) });
    expect((await read(MINT)).source).toBe("pump.fun");
    advance(TOKEN_MARKET_TTL_MS + 1);
    await read(MINT);
    const dexCalls = () => fetch.mock.calls.filter(([u]) => String(u).includes("dexscreener")).length;
    expect(dexCalls()).toBe(1);
    advance(60_000);
    await read(MINT);
    expect(dexCalls()).toBe(2);
  });
});
