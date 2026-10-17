export type WalletKind = "demo" | "injected";

export interface WalletSession {
  kind: WalletKind;
  address: string;
  /** Human label, e.g. "Demo Wallet" or "Phantom". */
  label: string;
}

/**
 * Minimal wallet abstraction. Swap in @solana/wallet-adapter-react later by
 * implementing this interface (or replacing the provider that consumes it).
 */
export interface WalletAdapter {
  kind: WalletKind;
  label: string;
  isAvailable(): boolean;
  connect(): Promise<WalletSession>;
  disconnect(): Promise<void>;
}
