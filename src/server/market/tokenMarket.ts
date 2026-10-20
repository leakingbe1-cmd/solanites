import "server-only";

/** Live market value of the configured token, from a provider that supports Solana mints. */
export interface TokenMarket {
  priceUsd: number;
  /** USD value; see kind for the supply basis. */
  valueUsd: number;
  /** "circulating": price × circulating supply as the provider defines it. "fdv": price × total supply. Never relabel FDV as market cap. */
  kind: "circulating" | "fdv";
  /** Provider name for attribution, e.g. "DexScreener". */
  source: string;
  /** When the provider observed the price (ms since epoch). */
  asOf: number;
}

/**
 * Fetches the token's market value. Implemented by the market workstream (provider choice,
 * timeouts, caching and rate limits live here). Throws on failure; callers keep the last good
 * value as stale and never invent one.
 */
export async function fetchTokenMarket(_mint: string): Promise<TokenMarket> {
  throw new Error("token market provider not implemented yet");
}
