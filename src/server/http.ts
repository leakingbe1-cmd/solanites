import "server-only";

import { timingSafeEqual } from "node:crypto";
import { ClaimError } from "./claims/service";
import { ConfigError } from "./config";
import { log } from "./log";
import { createSharedRateLimiter, type SharedRateLimiter } from "./rateLimitShared";
import { getRuntime } from "./runtime";
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
    log.error("mint.invalid", { route: tag, error: e.message });
    return fail(503, "NOT_CONFIGURED", "The configured token mint could not be verified on-chain.");
  }
  if (e instanceof ClaimError) {
    const status = { NOT_OPEN: 403, NOT_CONFIGURED: 503, INVALID_ADDRESS: 400, INVALID_SIGNATURE: 401, NONCE_INVALID: 401, UNAUTHORIZED: 401, NOT_ELIGIBLE: 409, BUDGET_EXHAUSTED: 409 }[e.code];
    return fail(status, e.code, e.message);
  }
  log.error("route.unexpected_error", { route: tag, error: (e as Error).message });
  return fail(500, "UPSTREAM_ERROR", "Something went wrong on the server. Please try again.");
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

let shared: SharedRateLimiter | null = null;
async function limiter(): Promise<SharedRateLimiter> {
  if (shared) return shared;
  let db = null;
  try {
    db = (await getRuntime()).db;
  } catch {
    // Not configured: per-instance fallback only.
  }
  return (shared = createSharedRateLimiter(db));
}

/**
 * Shared rate limit (across instances when the database is configured).
 * Returns a 429 response with Retry-After when exceeded. `key` defaults to the client IP.
 */
export async function rateLimit(req: Request, bucket: string, max: number, windowMs: number, key: string = clientIp(req)): Promise<Response | null> {
  const r = await (await limiter()).take(bucket, key, max, windowMs);
  return r.allowed ? null : fail(429, "RATE_LIMITED", "Too many requests. Please wait a moment.", {}, { "retry-after": String(Math.max(1, Math.ceil(r.retryAfterMs / 1000))) });
}

/** Reads a JSON body no larger than `maxBytes`. Returns a 413/400 response instead of throwing. */
export async function readJson(req: Request, maxBytes: number): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return { ok: false, response: fail(413, "PAYLOAD_TOO_LARGE", "Request body is too large.") };
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) return { ok: false, response: fail(413, "PAYLOAD_TOO_LARGE", "Request body is too large.") };
  if (!text) return { ok: true, body: null };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: fail(400, "INVALID_REQUEST", "Request body must be JSON.") };
  }
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
