import { describe, expect, it } from "vitest";
import { fetchTransactionEffect } from "../solana/history";
import { fetchOwnerBalance } from "../solana/token";
import type { RpcClient } from "../solana/rpc";

describe("RPC request shapes that mainnet needs", () => {
  it("accepts version 1 transactions (mainnet rejects the request otherwise and the holder never syncs)", async () => {
    let params: unknown[] = [];
    const rpc: RpcClient = {
      call: async <T,>(_m: string, p: unknown[]) => {
        params = p;
        return null as T;
      },
    };
    await expect(fetchTransactionEffect(rpc, "sig", { mint: "m", decimals: 6, supply: 1n, tokenProgram: "p" } as never, "finalized")).rejects.toThrow();
    expect((params[1] as { maxSupportedTransactionVersion: number }).maxSupportedTransactionVersion).toBeGreaterThanOrEqual(1);
  });

  it("getTokenAccountsByOwner filters by mint, so wallets holding thousands of other tokens don't time out", async () => {
    let params: unknown[] = [];
    const rpc: RpcClient = {
      call: async <T,>(_m: string, p: unknown[]) => {
        params = p;
        return { context: { slot: 1 }, value: [] } as T;
      },
    };
    await fetchOwnerBalance(rpc, "owner", { mint: "the-mint", decimals: 6, supply: 1n, tokenProgram: "p" } as never, "confirmed");
    expect(params[1]).toEqual({ mint: "the-mint" });
  });
});
