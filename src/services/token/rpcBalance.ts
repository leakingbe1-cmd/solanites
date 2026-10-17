import type { TokenBalanceProvider } from "./types";

/**
 * Reads an SPL token balance straight from Solana JSON-RPC.
 *
 * This is a *display* read only. Eligibility and progression must be computed
 * by a backend that snapshots balances on a schedule (or indexes transfers),
 * since anything the browser reports can be spoofed.
 */
export class RpcBalanceProvider implements TokenBalanceProvider {
  readonly source = "rpc" as const;
  constructor(
    private rpcUrl: string,
    private mint: string,
  ) {}

  async getBalance(owner: string): Promise<number> {
    const res = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [owner, { mint: this.mint }, { encoding: "jsonParsed", commitment: "confirmed" }],
      }),
    });
    if (!res.ok) throw new Error(`RPC error ${res.status}`);
    const json = (await res.json()) as {
      result?: { value: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number | null } } } } } }[] };
      error?: { message: string };
    };
    if (json.error) throw new Error(json.error.message);
    return (json.result?.value ?? []).reduce((sum, acc) => sum + (acc.account.data.parsed.info.tokenAmount.uiAmount ?? 0), 0);
  }
}
