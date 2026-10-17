import type { WalletAdapter, WalletSession } from "./types";

/**
 * EXPERIMENTAL: connects to an injected Solana provider (Phantom, Solflare,
 * Backpack…) through the de-facto `window.solana`-style API.
 *
 * Connecting only proves the browser *claims* an address. A production build
 * must additionally ask the wallet to sign a server-issued nonce (SIWS) and
 * verify that signature server-side before trusting the address.
 */

interface InjectedProvider {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
}

function getProvider(): InjectedProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    phantom?: { solana?: InjectedProvider };
    solflare?: InjectedProvider;
    backpack?: InjectedProvider;
    solana?: InjectedProvider;
  };
  return w.phantom?.solana ?? w.solflare ?? w.backpack ?? w.solana ?? null;
}

export const injectedWallet: WalletAdapter = {
  kind: "injected",
  label: "Solana Wallet",
  isAvailable: () => getProvider() !== null,
  async connect(): Promise<WalletSession> {
    const provider = getProvider();
    if (!provider) throw new Error("No Solana wallet extension detected.");
    const res = await provider.connect();
    return {
      kind: "injected",
      label: provider.isPhantom ? "Phantom" : "Solana Wallet",
      address: res.publicKey.toString(),
    };
  },
  async disconnect() {
    await getProvider()?.disconnect();
  },
};
