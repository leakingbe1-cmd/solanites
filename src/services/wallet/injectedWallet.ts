import type { WalletAdapter, WalletSession } from "./types";

/**
 * Connects to an injected Solana provider (Phantom, Solflare, Backpack…)
 * through the de-facto `window.solana`-style API. Used only for launch-fee
 * claims; egg tracking never needs a wallet connection.
 *
 * Connecting only proves the browser *claims* an address. Claims also ask the
 * wallet to sign a server-issued message, verified on the server.
 */

interface InjectedProvider {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signMessage?(message: Uint8Array, display?: "utf8"): Promise<{ signature: Uint8Array } | Uint8Array>;
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
  async signMessage(message: string) {
    const provider = getProvider();
    if (!provider?.signMessage) throw new Error("This wallet can't sign messages. Try Phantom, Solflare or Backpack.");
    const res = await provider.signMessage(new TextEncoder().encode(message), "utf8");
    return res instanceof Uint8Array ? res : res.signature;
  },
};
