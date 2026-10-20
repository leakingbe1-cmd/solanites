import { describe, expect, it } from "vitest";
import { fetchTransactionEffect } from "../solana/history";
import type { RpcClient } from "../solana/rpc";

describe("getTransaction", () => {
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
});
