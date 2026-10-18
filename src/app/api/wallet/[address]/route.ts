import "server-only";
import { ConfigError, readServerConfig } from "@/server/config";
import { createMemoryRateLimiter, type RateLimiter } from "@/server/rateLimit";
import { checkSolanaAddress } from "@/server/solana/address";
import { createRpcClient, RpcUnavailableError } from "@/server/solana/rpc";
import { MintError } from "@/server/solana/token";
import { createWalletLookup } from "@/server/walletLookup";
import type { WalletLookupError } from "@/shared/walletLookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let service: { lookup: ReturnType<typeof createWalletLookup>; limiter: RateLimiter } | null = null;

function getService() {
  if (!service) {
    const config = readServerConfig();
    service = {
      lookup: createWalletLookup({ rpc: createRpcClient({ url: config.rpcUrl }), config }),
      limiter: createMemoryRateLimiter(config.lookupRateLimit.max, config.lookupRateLimit.windowMs),
    };
  }
  return service;
}

function fail(status: number, code: WalletLookupError["error"]["code"], message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: { code, message } } satisfies WalletLookupError, { status, headers: { "cache-control": "no-store", ...headers } });
}

/** GET /api/wallet/:address — read-only public lookup. Never asks for or accepts signatures or keys. */
export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address: raw } = await params;
  const check = checkSolanaAddress(decodeURIComponent(raw));
  if (!check.ok) return fail(400, "INVALID_ADDRESS", check.reason);

  let svc;
  try {
    svc = getService();
  } catch (e) {
    if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "On-chain lookups are not enabled yet: the official token mint has not been configured.");
    throw e;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const rl = svc.limiter.take(ip);
  if (!rl.allowed) return fail(429, "RATE_LIMITED", "Too many lookups. Please wait a moment.", { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) });

  try {
    const result = await svc.lookup(check.address);
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof RpcUnavailableError) return fail(503, "RPC_UNAVAILABLE", "Solana data is temporarily unavailable. No balance is shown rather than a possibly wrong one — please retry shortly.");
    if (e instanceof MintError) {
      console.error("[wallet-lookup] mint misconfigured:", e.message);
      return fail(503, "NOT_CONFIGURED", "The configured token mint could not be verified on-chain.");
    }
    console.error("[wallet-lookup] upstream error:", (e as Error).message);
    return fail(502, "UPSTREAM_ERROR", "The Solana data provider returned an unexpected response.");
  }
}
