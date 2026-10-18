/**
 * Fixed-window rate limiter keyed by client (IP).
 *
 * In-memory, so on serverless it limits per instance only. That is enough to
 * stop casual abuse in Phase 2; swap the store for Redis/Upstash (same
 * interface) before relying on it as a hard limit.
 */
export interface RateLimiter {
  take(key: string, now?: number): { allowed: boolean; retryAfterMs: number };
}

export function createMemoryRateLimiter(max: number, windowMs: number, maxKeys = 10_000): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    take(key, now = Date.now()) {
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        if (hits.size >= maxKeys) {
          for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
          if (hits.size >= maxKeys) hits.delete(hits.keys().next().value as string);
        }
        entry = { count: 0, resetAt: now + windowMs };
        hits.set(key, entry);
      }
      entry.count++;
      return entry.count <= max ? { allowed: true, retryAfterMs: 0 } : { allowed: false, retryAfterMs: entry.resetAt - now };
    },
  };
}
