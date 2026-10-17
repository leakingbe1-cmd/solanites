/** Reads a wallet's balance of the configured token (UI units, decimals applied). */
export interface TokenBalanceProvider {
  readonly source: "mock" | "rpc";
  getBalance(owner: string): Promise<number>;
}
