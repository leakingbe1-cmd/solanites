import type { WalletLookupError, WalletLookupResult } from "@/shared/walletLookup";
import type { TokenBalanceProvider } from "./types";

/**
 * Reads a wallet's balance through the Solanites server (/api/wallet).
 * The RPC endpoint and any API key stay on the server; the browser never
 * talks to Solana RPC directly.
 */
export class ApiBalanceProvider implements TokenBalanceProvider {
  readonly source = "rpc" as const;

  async lookup(owner: string): Promise<WalletLookupResult> {
    const res = await fetch(`/api/wallet/${encodeURIComponent(owner)}`, { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as WalletLookupResult | WalletLookupError | null;
    if (!res.ok || !body || "error" in body) throw new Error(body && "error" in body ? body.error.message : `Lookup failed (HTTP ${res.status})`);
    return body;
  }

  /** Display-only number for the prototype game; authoritative values stay as exact strings on the server. */
  async getBalance(owner: string): Promise<number> {
    return Number((await this.lookup(owner)).balance.amount);
  }
}
