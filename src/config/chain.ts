/**
 * Chain configuration. Read from public env vars so the token mint and RPC
 * endpoint can be changed without code edits (see .env.example).
 */
export const chainConfig = {
  /** SPL mint of the Solanites token. Empty → mock mode. */
  tokenMint: process.env.NEXT_PUBLIC_SOLANITES_MINT?.trim() ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com",
};

export const isLiveChainConfigured = chainConfig.tokenMint.length > 0;
