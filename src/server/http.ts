import "server-only";

import { timingSafeEqual } from "node:crypto";
import { ClaimError } from "./claims/service";
import { ConfigError } from "./config";
import { createMemoryRateLimiter } from "./rateLimit";
import { RpcUnavailableError } from "./solana/rpc";
import { MintError } from "./solana/token";

export const noStore = { "cache-control": "no-store" };

export function fail(status: number, code: string, message: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return Response.json({ error: { code, message, ...extra } }, { status, headers: { ...noStore, ...headers } });
}

/** Maps known failures to safe responses. Never leaks RPC URLs, keys or stack traces. */
export function failFromError(e: unknown, tag: string) {
  if (e instanceof ConfigError) return fail(503, "NOT_CONFIGURED", "Holder tracking is not switched on yet on this server.");
  if (e instanceof RpcUnavailableError) return fail(503, "RPC_UNAVAILABLE", "Solana data is temporarily unavailable. Nothing has been changed; please try again shortly.");
  if (e instanceof MintError) {
    console.error(`[${tag}] mint misconfigured:`, e.message);
    return fail(503, "NOT_CONFIGURED", "The configured token mint could not be verified on-chain.");
  }
  if (e instanceof ClaimError) {
    const status = { NOT_OPEN: 403, NOT_CONFIGURED: 503, INVALID_ADDRESS: 400, INVALID_SIGNATURE: 401, NONCE_INVALID: 401, UNAUTHORIZED: 401, NOT_ELIGIBLE: 409 }[e.code];
    return fail(status, e.code, e.message);
  }
  console.error(`[${tag}] unexpected error:`, (e as Error).message);
  return fail(500, "UPSTREAM_ERROR", "Something went wrong on the server. Please try again.");
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

const limiters = new Map<string, ReturnType<typeof createMemoryRateLimiter>>();
/** Per-instance rate limit; returns a 429 response when exceeded. */
export function rateLimit(req: Request, bucket: string, max: number, windowMs: number): Response | null {
  let l = limiters.get(bucket);
  if (!l) limiters.set(bucket, (l = createMemoryRateLimiter(max, windowMs)));
  const r = l.take(clientIp(req));
  return r.allowed ? null : fail(429, "RATE_LIMITED", "Too many requests. Please wait a moment.", {}, { "retry-after": String(Math.ceil(r.retryAfterMs / 1000)) });
}

/** Rejects cross-site POSTs to cookie-authenticated endpoints. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Constant-time-ish bearer/secret comparison for scheduler and webhook calls. */
export function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
