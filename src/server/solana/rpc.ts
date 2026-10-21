/**
 * Minimal Solana JSON-RPC client with timeouts and retry/backoff.
 *
 * Kept dependency-free and injectable (fetch + sleep) so it can be tested
 * without a network and swapped for a provider SDK later.
 */

export type Commitment = "processed" | "confirmed" | "finalized";

export class RpcUnavailableError extends Error {
  readonly code = "RPC_UNAVAILABLE";
  constructor(message: string, readonly attempts: number) {
    super(message);
  }
}

export class RpcResponseError extends Error {
  readonly code = "RPC_ERROR";
  constructor(message: string, readonly rpcCode?: number) {
    super(message);
  }
}

export interface RpcClient {
  call<T>(method: string, params: unknown[], opts?: { timeoutMs?: number }): Promise<T>;
}

export interface RpcClientOptions {
  url: string;
  fetch?: typeof fetch;
  /** Retries after the first attempt. */
  retries?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

/** JSON-RPC error codes that mean "node temporarily can't answer" rather than "bad request". */
const TRANSIENT_RPC_CODES = new Set([-32004, -32005, -32014, -32016]);

export function createRpcClient(opts: RpcClientOptions): RpcClient {
  const doFetch = opts.fetch ?? fetch;
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const base = opts.baseDelayMs ?? 300;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  let nextId = 1;

  return {
    async call<T>(method: string, params: unknown[], callOpts?: { timeoutMs?: number }): Promise<T> {
      let lastError = "unknown error";
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) await sleep(base * 2 ** (attempt - 1) * (1 + Math.random() * 0.25));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), callOpts?.timeoutMs ?? timeoutMs);
        try {
          const res = await doFetch(opts.url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
            signal: controller.signal,
          });
          if (res.status === 429 || res.status >= 500) {
            lastError = `HTTP ${res.status}`;
            continue;
          }
          if (!res.ok) throw new RpcResponseError(`RPC HTTP ${res.status}`);
          const body = (await res.json()) as { result?: T; error?: { code: number; message: string } };
          if (body.error) {
            if (TRANSIENT_RPC_CODES.has(body.error.code)) {
              lastError = `RPC ${body.error.code}`;
              continue;
            }
            throw new RpcResponseError(body.error.message, body.error.code);
          }
          if (!("result" in body)) throw new RpcResponseError("RPC response had no result");
          return body.result as T;
        } catch (e) {
          if (e instanceof RpcResponseError) throw e;
          // Network failure or timeout: retry. Never log the URL — it may embed an API key.
          lastError = (e as Error).name === "AbortError" ? "timeout" : "network error";
        } finally {
          clearTimeout(timer);
        }
      }
      throw new RpcUnavailableError(`Solana RPC unavailable after ${retries + 1} attempts (${lastError}, ${method})`, retries + 1);
    },
  };
}
