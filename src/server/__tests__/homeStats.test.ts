import { describe, expect, it, vi } from "vitest";
import { keypairFromSeed } from "../fixtures/keys";
import { createLedgerChain, programAddress } from "../fixtures/ledgerChain";
import type { TokenMarket } from "../market/tokenMarket";
import { countHolders, createHomeStats, type HomeStatsDeps } from "../stats/homeStats";

const W = (n: number) => keypairFromSeed(n).address;
const T0 = 1_900_000_000_000;

function setup(over: Partial<HomeStatsDeps> = {}) {
  const clock = { t: T0, now: () => clock.t };
  const chain = createLedgerChain({ now: clock.now });
  const pool = programAddress("pool");
  chain.mintTo(pool, chain.tokens(900_000_000));
  const market = vi.fn(async (): Promise<TokenMarket> => ({ priceUsd: 0.002, valueUsd: 1_946_568, kind: "circulating", source: "Test", asOf: clock.t }));
  const eggs = vi.fn(async () => ({ total: 7, lastSyncAt: clock.t }));
  const stats = createHomeStats({ chain: { rpc: chain.rpc, mint: chain.mint, excludedOwners: new Set() }, eggs, market, now: clock.now, ...over });
  return { clock, chain, pool, market, eggs, stats };
}

describe("holder counting rules", () => {
  it("counts unique owners with a positive balance once, however many accounts they have", () => {
    const a = W(1);
    const r = countHolders(
      [
        { owner: a, amount: 5n },
        { owner: a, amount: 1n },
        { owner: W(2), amount: 0n },
        { owner: W(3), amount: 1n },
      ],
      new Set(),
    );
    expect(r.holders).toBe(2);
  });

  it("excludes program-owned (off-curve) owners and configured project wallets, nothing else", () => {
    const treasury = W(4);
    const r = countHolders(
      [
        { owner: programAddress("pool"), amount: 100n },
        { owner: treasury, amount: 100n },
        { owner: W(5), amount: 1n },
      ],
      new Set([treasury]),
    );
    expect(r).toEqual({ holders: 1, programOwned: 1 });
  });
});

describe("/api/home-stats aggregation", () => {
  it("reports live holders from the chain, eggs from the tracker and the provider's market cap", async () => {
    const { stats, chain, pool } = setup();
    const two = W(11);
    chain.transfer(pool, W(10), chain.tokens(5));
    chain.transfer(pool, two, chain.tokens(1));
    chain.transfer(pool, two, chain.tokens(1), { toAccount: chain.openAccount(two) });
    chain.openAccount(W(12)); // empty account: not a holder
    const s = await stats.get();
    expect(s.holders).toMatchObject({ value: 2, status: "live" });
    expect(s.eggs).toMatchObject({ value: 7, status: "live" });
    expect(s.marketCap).toMatchObject({ value: 1_946_568, status: "live", kind: "circulating", priceUsd: 0.002, source: "Test" });
  });

  it("passes FDV through labelled as FDV, never as market cap", async () => {
    const { stats, clock } = setup({ market: async () => ({ priceUsd: 0.002, valueUsd: 2_000_000, kind: "fdv", source: "Test", asOf: clock.t }) });
    expect((await stats.get()).marketCap.kind).toBe("fdv");
  });

  it("eggs stay unavailable until the tracker has completed a sync: no invented total", async () => {
    const { stats } = setup({ eggs: async () => ({ total: 0, lastSyncAt: null }) });
    const s = await stats.get();
    expect(s.eggs).toMatchObject({ value: null, status: "unavailable", note: "Egg tracking has not completed a sync yet." });
  });

  it("eggs stay live between syncs and turn stale only when the tracker hasn't synced for 30 minutes", async () => {
    const { stats, clock } = setup({ eggs: async () => ({ total: 7, lastSyncAt: T0 }) });
    expect((await stats.get()).eggs).toMatchObject({ value: 7, status: "live", asOf: T0 });
    clock.t += 5 * 60_000;
    expect((await stats.get()).eggs).toMatchObject({ value: 7, status: "live", asOf: T0 });
    clock.t += 30 * 60_000;
    expect((await stats.get()).eggs).toMatchObject({ value: 7, status: "stale", asOf: T0, note: "Egg tracking hasn't synced for over 30 minutes." });
  });

  it("a provider error before any success is unavailable, never zero", async () => {
    const { stats } = setup({ market: async () => Promise.reject(new Error("HTTP 500")) });
    expect((await stats.get()).marketCap).toMatchObject({ value: null, status: "unavailable" });
  });

  it("rejects nonsense provider values", async () => {
    const { stats, clock } = setup({ market: async () => ({ priceUsd: Number.NaN, valueUsd: 0, kind: "circulating", source: "Test", asOf: clock.t }) });
    expect((await stats.get()).marketCap.status).toBe("unavailable");
  });

  it("after a failed refresh the last good value is shown as stale, then dropped once too old", async () => {
    let fail = false;
    const { stats, clock } = setup({
      market: async () => {
        if (fail) throw new Error("timeout");
        return { priceUsd: 0.002, valueUsd: 1_000_000, kind: "circulating", source: "Test", asOf: clock.t };
      },
    });
    await stats.get();
    fail = true;
    clock.t += 60_000;
    const s = await stats.get();
    expect(s.marketCap).toMatchObject({ value: 1_000_000, status: "stale", asOf: T0 });
    clock.t += 11 * 60_000;
    expect((await stats.get()).marketCap).toMatchObject({ value: null, status: "unavailable" });
  });

  it("caches per metric and makes one upstream call for concurrent visitors", async () => {
    const { stats, market, eggs } = setup();
    await Promise.all([stats.get(), stats.get(), stats.get()]);
    await stats.get();
    expect(market).toHaveBeenCalledTimes(1);
    expect(eggs).toHaveBeenCalledTimes(1);
  });

  it("backs off after a failure instead of asking the provider on every request", async () => {
    const market = vi.fn(async (): Promise<TokenMarket> => Promise.reject(new Error("429")));
    const { stats, clock } = setup({ market });
    await stats.get();
    await stats.get();
    expect(market).toHaveBeenCalledTimes(1);
    clock.t += 31_000;
    await stats.get();
    expect(market).toHaveBeenCalledTimes(2);
  });

  it("without a configured mint, holders and market cap are unavailable and nothing is fetched", async () => {
    const market = vi.fn();
    const { stats } = setup({ chain: null, market });
    const s = await stats.get();
    expect(s.holders).toMatchObject({ value: null, status: "unavailable", note: "Token tracking is not configured on this server." });
    expect(s.marketCap.status).toBe("unavailable");
    expect(market).not.toHaveBeenCalled();
  });

  it("switching the configured mint switches every source to it", async () => {
    const other = createLedgerChain({ mint: W(99) });
    other.mintTo(W(20), other.tokens(1));
    const market = vi.fn(async (mint: string): Promise<TokenMarket> => ({ priceUsd: 1, valueUsd: 1, kind: "circulating", source: mint, asOf: T0 }));
    const { stats } = setup({ chain: { rpc: other.rpc, mint: other.mint, excludedOwners: new Set() }, market });
    const s = await stats.get();
    expect(market).toHaveBeenCalledWith(W(99));
    expect(s.holders.value).toBe(1);
  });
});
