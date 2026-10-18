/**
 * Egg credit: which tokens have already earned an egg.
 *
 * Each wallet carries `credit`: an amount of its tokens that has already been
 * counted toward an egg. New eggs are only earned on tokens above credit, so
 * moving tokens between wallets cannot mint the same egg twice:
 *
 *   A holds 1M → earns egg 1 (credit 1M) → sends 1M to B → the 1M credit moves
 *   with the tokens → B holds 1M with 1M credit → B earns nothing.
 *
 * Rules (applied per processed transaction, from its pre/post balances):
 * - A sender spends uncredited tokens first. Credit only leaves when the
 *   sender's remaining balance can no longer cover it.
 * - Credit that leaves goes to the non-excluded recipients in proportion to
 *   what they received, never more than they received.
 * - Credit is never sent to excluded addresses (pools, treasury, exchanges).
 *   It stays with the sender instead, so selling into a pool and buying back
 *   does not earn the same egg again. Tokens bought from a pool are fresh.
 */

export interface OwnerMovement {
  owner: string;
  preBase: bigint;
  postBase: bigint;
}

export interface CreditHolder {
  credit: bigint;
  excluded: boolean;
}

export interface CreditChange {
  owner: string;
  before: bigint;
  after: bigint;
}

export function applyTransferCredit(movements: OwnerMovement[], holders: Map<string, CreditHolder>): { changes: CreditChange[]; moved: bigint } {
  const sorted = [...movements].sort((a, b) => (a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0));
  const credit = new Map<string, bigint>();
  for (const m of sorted) credit.set(m.owner, holders.get(m.owner)?.credit ?? 0n);
  const isExcluded = (o: string) => holders.get(o)?.excluded ?? false;

  const receivers = sorted.filter((m) => m.postBase > m.preBase && !isExcluded(m.owner));
  const received = receivers.reduce((s, m) => s + (m.postBase - m.preBase), 0n);

  // Credit each sender can no longer back with its remaining balance.
  let movable = 0n;
  const taken = new Map<string, bigint>();
  for (const m of sorted) {
    if (m.postBase >= m.preBase || isExcluded(m.owner)) continue;
    const c = credit.get(m.owner)!;
    const excess = c > m.postBase ? c - m.postBase : 0n;
    const take = excess < received - movable ? excess : received - movable;
    if (take > 0n) {
      taken.set(m.owner, take);
      movable += take;
    }
  }
  for (const [o, t] of taken) credit.set(o, credit.get(o)! - t);

  // Share it among recipients pro rata (floor), then hand out the remainder unit by unit.
  if (movable > 0n) {
    const share = new Map<string, bigint>();
    let given = 0n;
    for (const m of receivers) {
      const amt = (movable * (m.postBase - m.preBase)) / received;
      share.set(m.owner, amt);
      given += amt;
    }
    const byLargest = [...receivers].sort((a, b) => {
      const d = b.postBase - b.preBase - (a.postBase - a.preBase);
      return d > 0n ? 1 : d < 0n ? -1 : a.owner < b.owner ? -1 : 1;
    });
    for (let i = 0; given < movable; i = (i + 1) % byLargest.length) {
      const m = byLargest[i];
      if (share.get(m.owner)! < m.postBase - m.preBase) {
        share.set(m.owner, share.get(m.owner)! + 1n);
        given += 1n;
      }
    }
    for (const [o, s] of share) credit.set(o, credit.get(o)! + s);
  }

  const changes = sorted.map((m) => ({ owner: m.owner, before: holders.get(m.owner)?.credit ?? 0n, after: credit.get(m.owner)! }));
  return { changes, moved: movable };
}

/**
 * New eggs a wallet earns: one per full unit of uncredited tokens. Earned
 * eggs are never taken away; a lower balance only affects future eggs.
 */
export function eggsToAward(input: { balance: bigint; credit: bigint; eggsEarned: number; unitBase: bigint; cap: number | null; excluded: boolean }): number {
  if (input.excluded || input.unitBase <= 0n) return 0;
  const uncredited = input.balance > input.credit ? input.balance - input.credit : 0n;
  let n = Number(uncredited / input.unitBase);
  if (input.cap !== null) n = Math.min(n, Math.max(0, input.cap - input.eggsEarned));
  return n;
}
