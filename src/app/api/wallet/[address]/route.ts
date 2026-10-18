import "server-only";
import { ConfigError, readServerConfig } from "@/server/config";
import { rateLimit } from "@/server/http";
import { log } from "@/server/log";
import { checkSolanaAddress } from "@/server/solana/address";
import { createRpcClient, RpcUnavailableError } from "@/server/solana/rpc";
import { MintError } from "@/server/solana/token";
import { createWalletLookup } from "@/server/walletLookup";
import type { WalletLookupError } from "@/shared/walletLookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let service: { lookup: ReturnType<typeof createWalletLookup>; limit: { max: number; windowMs: number } } | null = null;

function getService() {
  if (!service) {
    const config = readServerConfig();
    service = {
      lookup: createWalletLookup({ rpc: createRpcClient({ url: config.rpcUrl }), config }),
      limit: config.lookupRateLimit,
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

  // Shared across instances when the database is configured; per-instance otherwise.
  const limited = await rateLimit(req, "wallet-lookup", svc.limit.max, svc.limit.windowMs);
  if (limited) return limited;

  try {
    const result = await svc.lookup(check.address);
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof RpcUnavailableError) return fail(503, "RPC_UNAVAILABLE", "Solana data is temporarily unavailable. No balance is shown rather than a possibly wrong one — please retry shortly.");
    if (e instanceof MintError) {
      log.error("mint.invalid", { route: "wallet-lookup", error: e.message });
      return fail(503, "NOT_CONFIGURED", "The configured token mint could not be verified on-chain.");
    }
    log.error("route.unexpected_error", { route: "wallet-lookup", error: (e as Error).message });
    return fail(502, "UPSTREAM_ERROR", "The Solana data provider returned an unexpected response.");
  }
}
