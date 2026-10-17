import { afterEach, describe, expect, it, vi } from "vitest";
import { formatBaseUnits, parseBaseUnits, wholeTokensToBase } from "../amounts";
import { ConfigError, readServerConfig, type ServerConfig } from "../config";
import { computeEggEligibility } from "../eligibility";
import { createMemoryRateLimiter } from "../rateLimit";
import { checkSolanaAddress } from "../solana/address";
import { createRpcClient, RpcResponseError, RpcUnavailableError } from "../solana/rpc";
import { fetchMintInfo, fetchOwnerBalance, MintError, TOKEN_2022_PROGRAM_ID } from "../solana/token";
import { createWalletLookup } from "../walletLookup";
import { addr, DECIMALS, encodeBase58, fakeChain, MINT, T } from "./fakeChain";

const WALLET = addr(2);
const RULES = { tokensPerEgg: 10_000, maxEggsPerWallet: 6 };

function config(over: Partial<ServerConfig> = {}): ServerConfig {
  return {
    mint: MINT,
    rpcUrl: "https://rpc.example",
    commitment: "confirmed",
    excludedOwners: new Set(),
    lookupRateLimit: { max: 20, windowMs: 60_000 },
    lookupCacheMs: 15_000,
    ...over,
  };
}

describe("wallet address validation (scenario 11)", () => {
  it("accepts 32-byte base58 keys, including all-zero system address", () => {
    expect(checkSolanaAddress(WALLET)).toEqual({ ok: true, address: WALLET });
    expect(checkSolanaAddress("11111111111111111111111111111111").ok).toBe(true);
    expect(checkSolanaAddress(`  ${WALLET}  `)).toEqual({ ok: true, address: WALLET });
  });

  it.each([
    ["empty", ""],
    ["too short", "abc"],
    ["non-base58 characters (0, O, I, l)", "0OIl" + WALLET.slice(4)],
    ["Ethereum address", "0x52908400098527886E0F7030069857D2E4169EE7"],
    ["33 bytes", encodeBase58(new Uint8Array(33).fill(9))],
    ["31 bytes", encodeBase58(new Uint8Array(31).fill(9))],
    ["script injection", "<script>alert(1)</script>xxxxxxxxxxxxxxxxx"],
  ])("rejects %s", (_, value) => {
    expect(checkSolanaAddress(value).ok).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(checkSolanaAddress(42).ok).toBe(false);
    expect(checkSolanaAddress(null).ok).toBe(false);
  });
});

describe("precision-safe amounts", () => {
  it("formats exact decimals from base units", () => {
    expect(formatBaseUnits(0n, 6)).toBe("0");
    expect(formatBaseUnits(10_000n * T, 6)).toBe("10000");
    expect(formatBaseUnits(9_999_999_999n, 6)).toBe("9999.999999");
    expect(formatBaseUnits(1n, 9)).toBe("0.000000001");
  });

  it("keeps balances beyond Number.MAX_SAFE_INTEGER exact", () => {
    const huge = 123_456_789_012_345_678_901n;
    expect(formatBaseUnits(huge, 6)).toBe("123456789012345.678901");
  });

  it("rejects non-integer or negative raw amounts", () => {
    expect(() => parseBaseUnits("1.5")).toThrow();
    expect(() => parseBaseUnits("-1")).toThrow();
    expect(() => parseBaseUnits(100)).toThrow();
    expect(() => wholeTokensToBase(1.5, 6)).toThrow();
  });
});

describe("egg eligibility (scenarios 1–4)", () => {
  const e = (base: bigint) => computeEggEligibility(base, DECIMALS, RULES);

  it("zero tokens → no eggs (1)", () => {
    expect(e(0n)).toMatchObject({ meetsThreshold: false, eggs: 0, toNextEggBase: 10_000n * T });
  });

  it("one base unit below the threshold → no eggs (2)", () => {
    expect(e(10_000n * T - 1n)).toMatchObject({ meetsThreshold: false, eggs: 0, toNextEggBase: 1n });
  });

  it("exactly 10,000 tokens → one egg (3)", () => {
    expect(e(10_000n * T)).toMatchObject({ meetsThreshold: true, eggs: 1, toNextEggBase: 10_000n * T });
  });

  it("several times the threshold → floor(balance / threshold) eggs (4)", () => {
    expect(e(35_500n * T)).toMatchObject({ eggs: 3, toNextEggBase: 4_500n * T });
  });

  it("caps at the per-wallet maximum", () => {
    expect(e(1_000_000n * T)).toMatchObject({ eggs: 6, toNextEggBase: 0n });
  });
});

describe("mint verification", () => {
  it("reads decimals and detects Token-2022 rather than assuming the program", async () => {
    const { rpc } = fakeChain({ program: TOKEN_2022_PROGRAM_ID });
    const info = await fetchMintInfo(rpc, MINT, "confirmed");
    expect(info).toMatchObject({ tokenProgram: TOKEN_2022_PROGRAM_ID, decimals: 6 });
  });

  it("refuses a mint that does not exist", async () => {
    const { rpc } = fakeChain({ mintExists: false });
    await expect(fetchMintInfo(rpc, MINT, "confirmed")).rejects.toBeInstanceOf(MintError);
  });

  it("refuses an account not owned by a token program", async () => {
    const { rpc } = fakeChain({ program: addr(99) });
    await expect(fetchMintInfo(rpc, MINT, "confirmed")).rejects.toBeInstanceOf(MintError);
  });
});

describe("owner balances", () => {
  it("aggregates multiple token accounts owned by one wallet (5)", async () => {
    const { rpc } = fakeChain({
      accounts: [
        { pubkey: addr(10), owner: WALLET, amount: 6_000n * T },
        { pubkey: addr(11), owner: WALLET, amount: 4_000n * T },
        { pubkey: addr(12), owner: WALLET, amount: 1n },
      ],
    });
    const mint = await fetchMintInfo(rpc, MINT, "confirmed");
    const bal = await fetchOwnerBalance(rpc, WALLET, mint, "confirmed");
    expect(bal.usable).toBe(10_000n * T + 1n);
    expect(bal.accounts).toHaveLength(3);
  });

  it("ignores other tokens and other owners' accounts", async () => {
    const { rpc } = fakeChain({
      accounts: [
        { pubkey: addr(10), owner: WALLET, amount: 5n * T },
        { pubkey: addr(11), owner: WALLET, amount: 999_999n * T, mint: addr(50) },
        { pubkey: addr(12), owner: addr(3), amount: 999_999n * T },
      ],
    });
    const mint = await fetchMintInfo(rpc, MINT, "confirmed");
    expect((await fetchOwnerBalance(rpc, WALLET, mint, "confirmed")).usable).toBe(5n * T);
  });

  it("shows frozen balances but does not count them toward eligibility", async () => {
    const { rpc } = fakeChain({
      accounts: [
        { pubkey: addr(10), owner: WALLET, amount: 9_000n * T },
        { pubkey: addr(11), owner: WALLET, amount: 5_000n * T, state: "frozen" },
      ],
    });
    const mint = await fetchMintInfo(rpc, MINT, "confirmed");
    const bal = await fetchOwnerBalance(rpc, WALLET, mint, "confirmed");
    expect(bal.usable).toBe(9_000n * T);
    expect(bal.frozen).toBe(5_000n * T);
  });

  it("never double-counts a token account the provider returns twice", async () => {
    const dup = { pubkey: addr(10), owner: WALLET, amount: 7_000n * T };
    const { rpc } = fakeChain({ accounts: [dup, dup] });
    const mint = await fetchMintInfo(rpc, MINT, "confirmed");
    expect((await fetchOwnerBalance(rpc, WALLET, mint, "confirmed")).usable).toBe(7_000n * T);
  });

  it("rejects provider data whose decimals disagree with the mint", async () => {
    const { rpc } = fakeChain({ accounts: [{ pubkey: addr(10), owner: WALLET, amount: 1n, decimals: 9 }] });
    const mint = await fetchMintInfo(rpc, MINT, "confirmed");
    await expect(fetchOwnerBalance(rpc, WALLET, mint, "confirmed")).rejects.toThrow(/decimals/);
  });
});

describe("RPC client resilience (scenario 9)", () => {
  const ok = (result: unknown) => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200 });
  const noSleep = async () => {};

  it("retries transient HTTP failures, then succeeds", async () => {
    const f = vi.fn().mockResolvedValueOnce(new Response("", { status: 503 })).mockResolvedValueOnce(new Response("", { status: 429 })).mockResolvedValueOnce(ok(42));
    const rpc = createRpcClient({ url: "https://rpc.example", fetch: f, sleep: noSleep });
    await expect(rpc.call("getSlot", [])).resolves.toBe(42);
    expect(f).toHaveBeenCalledTimes(3);
  });

  it("gives up with RpcUnavailableError during an outage", async () => {
    const f = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const rpc = createRpcClient({ url: "https://secret-key@rpc.example", fetch: f, sleep: noSleep, retries: 2 });
    const err = (await rpc.call("getSlot", []).catch((e) => e)) as Error;
    expect(err).toBeInstanceOf(RpcUnavailableError);
    expect(f).toHaveBeenCalledTimes(3);
    expect(String(err.message)).not.toContain("secret-key");
  });

  it("does not retry a non-transient JSON-RPC error", async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32602, message: "Invalid params" } })));
    const rpc = createRpcClient({ url: "https://rpc.example", fetch: f, sleep: noSleep });
    await expect(rpc.call("getSlot", [])).rejects.toBeInstanceOf(RpcResponseError);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("times out a hung request and retries", async () => {
    const hang = (_: unknown, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))));
    const f = vi.fn().mockImplementationOnce(hang).mockResolvedValueOnce(ok("done"));
    const rpc = createRpcClient({ url: "https://rpc.example", fetch: f as unknown as typeof fetch, sleep: noSleep, timeoutMs: 20 });
    await expect(rpc.call("getSlot", [])).resolves.toBe("done");
  });
});

describe("wallet lookup service", () => {
  it("returns zero, not an error, for a valid wallet with no token accounts (1)", async () => {
    const { rpc } = fakeChain();
    const r = await createWalletLookup({ rpc, config: config() })(WALLET);
    expect(r.balance).toMatchObject({ amountBase: "0", amount: "0", tokenAccounts: [] });
    expect(r.eggs).toMatchObject({ meetsThreshold: false, eligibleEggs: 0, toNextEgg: "10000" });
    expect(r.holding.status).toBe("not_tracked");
    expect(r.rewards.status).toBe("not_available");
  });

  it("reports slot, commitment and live source; then marks repeat lookups as cached", async () => {
    let now = 1_000_000;
    const chain = fakeChain({ accounts: [{ pubkey: addr(10), owner: WALLET, amount: 25_000n * T }], slot: 123 });
    const lookup = createWalletLookup({ rpc: chain.rpc, config: config(), now: () => now });
    const first = await lookup(WALLET);
    expect(first.source).toMatchObject({ kind: "live-rpc", commitment: "confirmed", slot: 123, cached: false });
    expect(first.eggs.eligibleEggs).toBe(2);
    now += 5_000;
    expect((await lookup(WALLET)).source.cached).toBe(true);
    now += 20_000;
    expect((await lookup(WALLET)).source.cached).toBe(false);
    expect(chain.state.calls.filter((c) => c === "getAccountInfo")).toHaveLength(1); // mint info cached longer
  });

  it("propagates an outage instead of showing a fabricated zero balance (9)", async () => {
    const chain = fakeChain({ accounts: [{ pubkey: addr(10), owner: WALLET, amount: 50_000n * T }] });
    chain.state.down = true;
    await expect(createWalletLookup({ rpc: chain.rpc, config: config() })(WALLET)).rejects.toBeInstanceOf(RpcUnavailableError);
  });

  it("gives excluded project/treasury/LP addresses no eggs, while still showing their balance", async () => {
    const { rpc } = fakeChain({ accounts: [{ pubkey: addr(10), owner: WALLET, amount: 500_000n * T }] });
    const r = await createWalletLookup({ rpc, config: config({ excludedOwners: new Set([WALLET]) }) })(WALLET);
    expect(r.balance.amount).toBe("500000");
    expect(r.eggs).toMatchObject({ excluded: true, eligibleEggs: 0 });
  });
});

describe("configuration", () => {
  it("refuses to run without a mint and an https RPC URL — never falls back to guesses", () => {
    expect(() => readServerConfig({})).toThrow(ConfigError);
    try {
      readServerConfig({ SOLANITES_MINT: "not-a-mint", SOLANA_RPC_URL: "http://insecure" });
    } catch (e) {
      expect((e as ConfigError).missing).toEqual(["SOLANITES_MINT", "SOLANA_RPC_URL"]);
    }
  });

  it("parses a valid configuration including excluded owners", () => {
    const c = readServerConfig({ SOLANITES_MINT: MINT, SOLANA_RPC_URL: "https://rpc.example", SOLANITES_EXCLUDED_OWNERS: `${addr(5)}, ${addr(6)}` });
    expect(c.excludedOwners.size).toBe(2);
    expect(c.commitment).toBe("confirmed");
  });
});

describe("rate limiting", () => {
  it("blocks after the limit and resets after the window", () => {
    const rl = createMemoryRateLimiter(2, 1000);
    expect(rl.take("ip", 0).allowed).toBe(true);
    expect(rl.take("ip", 1).allowed).toBe(true);
    expect(rl.take("ip", 2)).toEqual({ allowed: false, retryAfterMs: 998 });
    expect(rl.take("other", 2).allowed).toBe(true);
    expect(rl.take("ip", 1000).allowed).toBe(true);
  });
});

describe("GET /api/wallet/[address]", () => {
  const ENV = { ...process.env };
  afterEach(() => {
    process.env = { ...ENV };
    vi.resetModules();
    vi.unstubAllGlobals();
  });
  const call = async (address: string) => {
    const { GET } = await import("@/app/api/wallet/[address]/route");
    return GET(new Request(`http://x/api/wallet/${address}`, { headers: { "x-forwarded-for": "1.2.3.4" } }), { params: Promise.resolve({ address }) });
  };

  it("400 for an invalid address, before touching config or RPC (11)", async () => {
    const res = await call("not-an-address");
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_ADDRESS");
  });

  it("503 NOT_CONFIGURED when the mint is missing — no invented values", async () => {
    delete process.env.SOLANITES_MINT;
    const res = await call(WALLET);
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("NOT_CONFIGURED");
  });

  it("serves a live lookup, then rate-limits", async () => {
    process.env.SOLANITES_MINT = MINT;
    process.env.SOLANA_RPC_URL = "https://rpc.example";
    process.env.LOOKUP_RATE_LIMIT_MAX = "2";
    const chain = fakeChain({ accounts: [{ pubkey: addr(10), owner: WALLET, amount: 10_000n * T }] });
    vi.stubGlobal("fetch", async (_: unknown, init: RequestInit) => {
      const { method, params } = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: await chain.rpc.call(method, params) }));
    });
    const ok = await call(WALLET);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ balance: { amount: "10000" }, eggs: { eligibleEggs: 1, meetsThreshold: true } });
    expect((await call(WALLET)).status).toBe(200);
    const limited = await call(WALLET);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });

  it("503 RPC_UNAVAILABLE during an outage (9)", async () => {
    process.env.SOLANITES_MINT = MINT;
    process.env.SOLANA_RPC_URL = "https://rpc.example";
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 50 });
    const res = await call(WALLET);
    vi.useRealTimers();
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("RPC_UNAVAILABLE");
  }, 20_000);
});

