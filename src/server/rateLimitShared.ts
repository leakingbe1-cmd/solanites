import { createHash } from "node:crypto";
import type { Db } from "./db/types";
import { log } from "./log";
import { createMemoryRateLimiter, type RateLimiter } from "./rateLimit";

export interface LimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export interface SharedRateLimiter {
  take(bucket: string, key: string, max: number, windowMs: number): Promise<LimitResult>;
}

/** Client keys are hashed so raw IP addresses are never stored. */
export const hashKey = (key: string) => createHash("sha256").update(key).digest("base64url").slice(0, 22);

/**
 * Fixed-window limiter backed by Postgres, so limits hold across every
 * serverless instance. One atomic upsert per request. If the database is
 * unavailable it falls back to a per-instance limiter instead of failing open.
 */
export function createSharedRateLimiter(db: Db | null, now: () => number = Date.now): SharedRateLimiter {
  const fallbacks = new Map<string, RateLimiter>();
  const fallback = (bucket: string, max: number, windowMs: number) => {
    let l = fallbacks.get(bucket);
    if (!l) fallbacks.set(bucket, (l = createMemoryRateLimiter(max, windowMs)));
    return l;
  };
  return {
    async take(bucket, key, max, windowMs) {
      const t = now();
      const windowStart = t - (t % windowMs);
      if (db) {
        try {
          const r = await db.query<{ count: number }>(
            `INSERT INTO rate_limits (bucket, key, window_start, count) VALUES ($1, $2, $3, 1)
             ON CONFLICT (bucket, key, window_start) DO UPDATE SET count = rate_limits.count + 1 RETURNING count`,
            [bucket, hashKey(key), windowStart],
          );
          const count = Number(r.rows[0].count);
          return count <= max ? { allowed: true, retryAfterMs: 0 } : { allowed: false, retryAfterMs: windowStart + windowMs - t };
        } catch (e) {
          log.warn("rate_limit.store_unavailable", { bucket, error: (e as Error).message });
        }
      }
      return fallback(bucket, max, windowMs).take(hashKey(key), t);
    },
  };
}

/** Deletes expired counters; called from the scheduled sync. */
export async function pruneRateLimits(db: Db, now: number, olderThanMs = 24 * 60 * 60 * 1000) {
  await db.query(`DELETE FROM rate_limits WHERE window_start < $1`, [now - olderThanMs]);
}
