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
 * Token market value for a pump.fun Solana mint, from free, keyless public APIs, server side only.
 *
 * Providers, in order:
 *  1. DexScreener (api.dexscreener.com/tokens/v1/solana/<mint>): every pair for the mint; the most
 *     liquid Solana pair whose base token is the mint gives the price. Its `marketCap` is
 *     circulating (DexScreener's own supply data), so kind "circulating"; a pair with only `fdv`
 *     gives kind "fdv". DexScreener sends no observation time, so asOf is when it answered.
 *  2. pump.fun (frontend-api-v3.pump.fun/coins-v2/<mint>): covers bonding-curve and graduated
 *     coins. `usd_market_cap` is price × total supply, so price = usd_market_cap / total supply
 *     (raw units ÷ 10^base_decimals). With a valid `circulating_supply_str` the value is price ×
 *     circulating supply, kind "circulating"; without it, the total-supply figure, kind "fdv".
 *     Its figure follows the last trade; asOf is when pump.fun answered.
 *
 * Every response is validated: the mint must match, numbers must be finite and positive, and
 * nothing is filled in; a provider that fails or answers nonsense is skipped for the next one,
 * and if all fail this throws (callers keep their last good value as stale). Each request has an
 * 8 s timeout; results are cached in memory for 30 s per mint, concurrent callers share one
 * request, and a provider that answers 429 is skipped for 60 s. A cached value keeps the asOf it
 * was observed at; it is never re-stamped as fresh.
 */

export const TOKEN_MARKET_TTL_MS = 30_000;
const TIMEOUT_MS = 8_000;
const RATE_LIMIT_BACKOFF_MS = 60_000;
/** Solana addresses are base58, 32–44 characters. */
const MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

type Fetch = typeof fetch;
interface Provider {
  name: string;
  get(mint: string, doFetch: Fetch, now: number): Promise<TokenMarket>;
}

class ProviderError extends Error {
  constructor(readonly rateLimited = false) {
    super("token market provider failed");
  }
}

const positive = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function getJson(doFetch: Fetch, url: string): Promise<unknown> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await doFetch(url, { headers: { accept: "application/json" }, signal: ctl.signal, cache: "no-store" });
    if (res.status === 429) throw new ProviderError(true);
    if (!res.ok) throw new ProviderError();
    return await res.json();
  } catch (e) {
    throw e instanceof ProviderError ? e : new ProviderError();
  } finally {
    clearTimeout(timer);
  }
}

const dexScreener: Provider = {
  name: "DexScreener",
  async get(mint, doFetch, now) {
    const body = await getJson(doFetch, `https://api.dexscreener.com/tokens/v1/solana/${mint}`);
    if (!Array.isArray(body)) throw new ProviderError();
    let best: { liquidity: number; price: number; mcap: number | null; fdv: number | null } | null = null;
    for (const p of body as Record<string, unknown>[]) {
      const base = p?.baseToken as Record<string, unknown> | undefined;
      if (p?.chainId !== "solana" || base?.address !== mint) continue;
      const price = positive(p.priceUsd);
      const liquidity = positive((p.liquidity as Record<string, unknown> | undefined)?.usd);
      if (price === null || liquidity === null) continue;
      if (!best || liquidity > best.liquidity) best = { liquidity, price, mcap: positive(p.marketCap), fdv: positive(p.fdv) };
    }
    if (!best || (best.mcap === null && best.fdv === null)) throw new ProviderError();
    return best.mcap !== null
      ? { priceUsd: best.price, valueUsd: best.mcap, kind: "circulating", source: "DexScreener", asOf: now }
      : { priceUsd: best.price, valueUsd: best.fdv!, kind: "fdv", source: "DexScreener", asOf: now };
  },
};

const pumpFun: Provider = {
  name: "pump.fun",
  async get(mint, doFetch, now) {
    const c = (await getJson(doFetch, `https://frontend-api-v3.pump.fun/coins-v2/${mint}`)) as Record<string, unknown> | null;
    if (!c || c.mint !== mint) throw new ProviderError();
    const decimals = typeof c.base_decimals === "number" && Number.isInteger(c.base_decimals) && c.base_decimals >= 0 && c.base_decimals <= 18 ? c.base_decimals : null;
    const fdv = positive(c.usd_market_cap);
    const totalRaw = positive(c.total_supply_str ?? c.total_supply);
    if (decimals === null || fdv === null || totalRaw === null) throw new ProviderError();
    const scale = 10 ** decimals;
    const price = fdv / (totalRaw / scale);
    if (!Number.isFinite(price) || price <= 0) throw new ProviderError();
    const circulatingRaw = positive(c.circulating_supply_str);
    // A circulating figure above total supply is nonsense; fall back to the total-supply basis.
    if (circulatingRaw !== null && circulatingRaw <= totalRaw) {
      return { priceUsd: price, valueUsd: price * (circulatingRaw / scale), kind: "circulating", source: "pump.fun", asOf: now };
    }
    return { priceUsd: price, valueUsd: fdv, kind: "fdv", source: "pump.fun", asOf: now };
  },
};

export interface TokenMarketDeps {
  fetch?: Fetch;
  now?: () => number;
}

/** A token market reader with its own cache; the module default below is shared per process. */
export function createTokenMarket(deps: TokenMarketDeps = {}) {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const providers = [dexScreener, pumpFun];
  const cache = new Map<string, { value: TokenMarket; at: number }>();
  const inflight = new Map<string, Promise<TokenMarket>>();
  const backoffUntil = new Map<string, number>();

  async function load(mint: string): Promise<TokenMarket> {
    for (const p of providers) {
      if ((backoffUntil.get(p.name) ?? 0) > now()) continue;
      try {
        const value = await p.get(mint, doFetch, now());
        cache.set(mint, { value, at: now() });
        return value;
      } catch (e) {
        if (e instanceof ProviderError && e.rateLimited) backoffUntil.set(p.name, now() + RATE_LIMIT_BACKOFF_MS);
      }
    }
    throw new Error("Token market data is unavailable.");
  }

  return async function fetchTokenMarket(mint: string): Promise<TokenMarket> {
    if (!MINT.test(mint)) throw new Error("Invalid mint address.");
    const hit = cache.get(mint);
    if (hit && now() - hit.at < TOKEN_MARKET_TTL_MS) return hit.value;
    const running = inflight.get(mint);
    if (running) return running;
    const p = load(mint).finally(() => inflight.delete(mint));
    inflight.set(mint, p);
    return p;
  };
}

const shared = createTokenMarket();

/**
 * Fetches the token's market value (see the module comment for providers, supply basis, timeouts,
 * caching and rate limits). Throws on failure; callers keep the last good value as stale and never
 * invent one. The caller passes the mint (SOLANITES_MINT); none is built in.
 */
export async function fetchTokenMarket(mint: string): Promise<TokenMarket> {
  return shared(mint);
}
