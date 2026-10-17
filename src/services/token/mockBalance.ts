import type { TokenBalanceProvider } from "./types";

/** SIMULATED balances, editable from the Hatchery's simulation panel. */
export class MockBalanceProvider implements TokenBalanceProvider {
  readonly source = "mock" as const;
  constructor(private balance = 52_000) {}
  set(v: number) {
    this.balance = Math.max(0, v);
  }
  async getBalance(): Promise<number> {
    return this.balance;
  }
}
