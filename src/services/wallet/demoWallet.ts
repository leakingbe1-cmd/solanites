import type { WalletAdapter, WalletSession } from "./types";

/**
 * SIMULATED wallet. It never touches a real chain and the address is
 * intentionally prefixed with "DEMO" so it can't be mistaken for a real key.
 */
export const demoWallet: WalletAdapter = {
  kind: "demo",
  label: "Demo Wallet",
  isAvailable: () => true,
  async connect(): Promise<WalletSession> {
    return { kind: "demo", label: "Demo Wallet", address: "DEMOso1anitesHatcheryWa11etxxxxxxxxxxxxxxx" };
  },
  async disconnect() {},
};
