import { encodeBase58 } from "../solana/base58";
import { isOnCurve } from "../solana/curve";
import { RpcUnavailableError, type RpcClient } from "../solana/rpc";
import { TOKEN_PROGRAM_ID } from "../solana/token";

/**
 * A small in-memory Solana token ledger that answers the RPC methods the
 * tracker uses, in the same jsonParsed shapes a real node returns:
 * getAccountInfo (mint), getTokenAccountsByOwner, getProgramAccounts,
 * getSignaturesForAddress and getTransaction.
 *
 * Used by tests and by local fixture mode. It is NOT a chain and its holders
 * are not real; anything built on it is labelled "fixture".
 */

interface Account {
  address: string;
  owner: string;
  amount: bigint;
  state: "initialized" | "frozen";
  closed: boolean;
}

interface Tx {
  signature: string;
  slot: number;
  blockTime: number;
  failed: boolean;
  keys: string[];
  pre: { accountIndex: number; owner: string; amount: bigint }[];
  post: { accountIndex: number; owner: string; amount: bigint }[];
}

let counter = 0;
function fakeAddress(tag: string, offCurve: boolean): string {
  for (let i = 0; ; i++) {
    const bytes = new Uint8Array(32);
    const s = `${tag}:${counter++}:${i}`;
    for (let j = 0; j < 32; j++) bytes[j] = (s.charCodeAt(j % s.length) * (j + 7) + i * 13 + j) & 0xff;
    const a = encodeBase58(bytes);
    if (isOnCurve(a) === !offCurve) return a;
  }
}

/** An off-curve address, like a liquidity pool authority or a program vault. */
export function programAddress(tag = "pda"): string {
  return fakeAddress(tag, true);
}

export function createLedgerChain(opts: { mint?: string; decimals?: number; program?: string; slot?: number; now?: () => number } = {}) {
  const mint = opts.mint ?? fakeAddress("mint", false);
  const decimals = opts.decimals ?? 6;
  const program = opts.program ?? TOKEN_PROGRAM_ID;
  const unit = 10n ** BigInt(decimals);
  const accounts = new Map<string, Account>();
  const txs = new Map<string, Tx>();
  const history = new Map<string, string[]>(); // account → signatures, oldest first
  const state = {
    slot: opts.slot ?? 300_000_000,
    /** Highest slot visible at "finalized"; defaults to everything. */
    finalizedSlot: Infinity as number,
    down: false,
    calls: [] as string[],
    /** Signatures getTransaction pretends not to have yet (indexing delay). */
    hidden: new Set<string>(),
  };
  let sigCounter = 0;

  const visible = (slot: number) => slot <= state.finalizedSlot;

  function accountFor(owner: string, explicit?: string): Account {
    if (explicit) {
      const a = accounts.get(explicit);
      if (a) return a;
      const created = { address: explicit, owner, amount: 0n, state: "initialized" as const, closed: false };
      accounts.set(explicit, created);
      return created;
    }
    const existing = [...accounts.values()].find((a) => a.owner === owner && !a.closed);
    if (existing) return existing;
    const created = { address: fakeAddress(`ata-${owner}`, true), owner, amount: 0n, state: "initialized" as const, closed: false };
    accounts.set(created.address, created);
    return created;
  }

  /** Records one transaction moving tokens between token accounts. */
  function record(moves: { from?: Account; to?: Account; amount: bigint }[], failed = false): string {
    state.slot += 1;
    const touched = [...new Set(moves.flatMap((m) => [m.from, m.to]).filter(Boolean) as Account[])];
    const pre = touched.map((a, i) => ({ accountIndex: i + 1, owner: a.owner, amount: a.amount }));
    if (!failed) {
      for (const m of moves) {
        if (m.from) {
          if (m.from.amount < m.amount) throw new Error("fixture: insufficient balance");
          m.from.amount -= m.amount;
        }
        if (m.to) m.to.amount += m.amount;
      }
    }
    const post = touched.map((a, i) => ({ accountIndex: i + 1, owner: a.owner, amount: a.amount }));
    const signature = encodeBase58(new Uint8Array(64).map((_, i) => (sigCounter * 31 + i * 17 + 3) & 0xff)) + (sigCounter++).toString(36);
    txs.set(signature, { signature, slot: state.slot, blockTime: opts.now ? Math.floor(opts.now() / 1000) : 1_800_000_000 + state.slot, failed, keys: ["FeePayer11111111111111111111111111111111111", ...touched.map((a) => a.address)], pre, post });
    for (const a of touched) history.set(a.address, [...(history.get(a.address) ?? []), signature]);
    return signature;
  }

  const chain = {
    mint,
    decimals,
    unit,
    state,
    /** Whole tokens → base units. */
    tokens: (n: number | bigint) => BigInt(n) * unit,
    mintTo(owner: string, amount: bigint, account?: string) {
      return record([{ to: accountFor(owner, account), amount }]);
    },
    transfer(fromOwner: string, toOwner: string, amount: bigint, o: { fromAccount?: string; toAccount?: string; failed?: boolean } = {}) {
      return record([{ from: accountFor(fromOwner, o.fromAccount), to: accountFor(toOwner, o.toAccount), amount }], o.failed);
    },
    /** A swap-like transaction with several legs (e.g. via a router). */
    multi(legs: { from: string; to: string; amount: bigint }[]) {
      return record(legs.map((l) => ({ from: accountFor(l.from), to: accountFor(l.to), amount: l.amount })));
    },
    /** Opens an additional token account for the same wallet. */
    openAccount(owner: string): string {
      const a = { address: fakeAddress(`extra-${owner}`, true), owner, amount: 0n, state: "initialized" as const, closed: false };
      accounts.set(a.address, a);
      return a.address;
    },
    closeAccount(address: string) {
      const a = accounts.get(address)!;
      if (a.amount !== 0n) throw new Error("fixture: close a non-empty account");
      a.closed = true;
    },
    freeze(address: string) {
      accounts.get(address)!.state = "frozen";
    },
    balanceOf: (owner: string) => [...accounts.values()].filter((a) => a.owner === owner && !a.closed).reduce((s, a) => s + a.amount, 0n),
    accountsOf: (owner: string) => [...accounts.values()].filter((a) => a.owner === owner && !a.closed).map((a) => a.address),
  };

  function parsedAccount(a: Account) {
    return {
      pubkey: a.address,
      account: {
        owner: program,
        data: { program: "spl-token", parsed: { type: "account", info: { mint, owner: a.owner, state: a.state, tokenAmount: { amount: a.amount.toString(), decimals } } } },
      },
    };
  }

  const rpc: RpcClient = {
    async call<T>(method: string, params: unknown[]): Promise<T> {
      state.calls.push(method);
      if (state.down) throw new RpcUnavailableError("Solana RPC unavailable after 4 attempts (HTTP 503)", 4);
      const ctx = { slot: Math.min(state.slot, state.finalizedSlot) };
      switch (method) {
        case "getAccountInfo":
          // Only this ledger's own mint exists; any other address has no account.
          if ((params as [string])[0] !== mint) return { context: ctx, value: null } as T;
          return {
            context: ctx,
            value: { owner: program, data: { program: "spl-token", parsed: { type: "mint", info: { decimals, supply: (1_000_000_000n * unit).toString(), isInitialized: true } } } },
          } as T;
        case "getTokenAccountsByOwner": {
          const [owner] = params as [string];
          return { context: ctx, value: [...accounts.values()].filter((a) => a.owner === owner && !a.closed).map(parsedAccount) } as T;
        }
        case "getProgramAccounts":
          return { context: ctx, value: [...accounts.values()].filter((a) => !a.closed).map(parsedAccount) } as T;
        case "getSignaturesForAddress": {
          const [address, o] = params as [string, { limit: number; before?: string; until?: string }];
          let list = [...(history.get(address) ?? [])].reverse().filter((s) => visible(txs.get(s)!.slot));
          if (o.before) list = list.slice(list.indexOf(o.before) + 1);
          if (o.until) {
            const i = list.indexOf(o.until);
            if (i >= 0) list = list.slice(0, i);
          }
          return list.slice(0, o.limit).map((s) => ({ signature: s, slot: txs.get(s)!.slot, err: txs.get(s)!.failed ? { InstructionError: [0, "Custom"] } : null })) as T;
        }
        case "getTransaction": {
          const [sig] = params as [string];
          const tx = txs.get(sig);
          if (!tx || state.hidden.has(sig) || !visible(tx.slot)) return null as T;
          const bal = (list: Tx["pre"]) => list.map((b) => ({ accountIndex: b.accountIndex, mint, owner: b.owner, programId: program, uiTokenAmount: { amount: b.amount.toString(), decimals } }));
          return {
            slot: tx.slot,
            blockTime: tx.blockTime,
            meta: { err: tx.failed ? { InstructionError: [0, "Custom"] } : null, preTokenBalances: bal(tx.pre), postTokenBalances: bal(tx.post) },
            transaction: { message: { accountKeys: tx.keys.map((pubkey) => ({ pubkey })) } },
          } as T;
        }
        default:
          throw new Error(`fixture chain: unexpected method ${method}`);
      }
    },
  };

  return { ...chain, rpc };
}

export type LedgerChain = ReturnType<typeof createLedgerChain>;
