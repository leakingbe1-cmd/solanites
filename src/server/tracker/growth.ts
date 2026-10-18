/**
 * Qualifying holding time for a hatched creature: how long, since hatching,
 * the wallet's balance stayed at or above what backs that creature. Built
 * only from recorded on-chain balance changes, so it never counts holding
 * the tracker hasn't verified.
 */

export interface BalanceChange {
  /** Block time of the transaction (ms). */
  at: number;
  preBase: bigint;
  postBase: bigint;
}

export function qualifyingMs(from: number, to: number, thresholdBase: bigint, changes: BalanceChange[], currentBase: bigint): { ms: number; growing: boolean } {
  const sorted = [...changes].sort((a, b) => a.at - b.at);
  // Balance at `from`: after the last change before it, or before the first change after it.
  const before = sorted.filter((c) => c.at <= from);
  const after = sorted.filter((c) => c.at > from);
  let balance = before.length ? before[before.length - 1].postBase : after.length ? after[0].preBase : currentBase;
  if (to <= from) return { ms: 0, growing: balance >= thresholdBase };
  let t = from;
  let ms = 0;
  for (const c of after) {
    if (c.at >= to) break;
    if (balance >= thresholdBase) ms += c.at - t;
    t = c.at;
    balance = c.postBase;
  }
  if (balance >= thresholdBase) ms += to - t;
  return { ms, growing: balance >= thresholdBase };
}
