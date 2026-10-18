/** "watch" = an address followed read-only for automatic egg tracking: no connection, no signature. */
export type WalletKind = "demo" | "injected" | "watch";

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
  /** Asks the wallet to sign a plain-text message (used only for fee-claim sign-in). Returns the raw signature. */
  signMessage?(message: string): Promise<Uint8Array>;
}
