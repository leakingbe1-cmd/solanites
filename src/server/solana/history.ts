import { parseBaseUnits } from "../amounts";
import type { Commitment, RpcClient } from "./rpc";
import { TOKEN_PROGRAM_ID, type MintInfo } from "./token";

/** A transaction the node has not finalized (or not indexed) yet; try again later. */
export class TransactionNotAvailableError extends Error {
  readonly code = "TX_NOT_AVAILABLE";
}

export interface MintTokenAccount {
  address: string;
  owner: string;
  amount: bigint;
  state: "initialized" | "frozen";
}

type ParsedTokenAccount = { pubkey: string; account: { owner: string; data: { parsed?: { type?: string; info?: { mint: string; owner: string; state: string; tokenAmount: { amount: string; decimals: number } } } } | unknown[] } };

/**
 * Every token account for the mint, at one slot. This is the reconciliation
 * snapshot; it needs an RPC provider that serves getProgramAccounts for the
 * token program (Helius, Triton, QuickNode — not the public endpoint).
 */
/** One unpaginated call returns every account of the mint; a pump.fun mint with ~12k accounts takes ~8 s on the public RPC. */
const SNAPSHOT_TIMEOUT_MS = 30_000;

export async function fetchMintTokenAccounts(rpc: RpcClient, mint: MintInfo, commitment: Commitment): Promise<{ slot: number; accounts: MintTokenAccount[] }> {
  const filters: unknown[] = [{ memcmp: { offset: 0, bytes: mint.mint } }];
  // Classic SPL token accounts are exactly 165 bytes; Token-2022 accounts can carry extensions.
  if (mint.tokenProgram === TOKEN_PROGRAM_ID) filters.unshift({ dataSize: 165 });
  const res = await rpc.call<{ context: { slot: number }; value: ParsedTokenAccount[] }>("getProgramAccounts", [
    mint.tokenProgram,
    { encoding: "jsonParsed", commitment, withContext: true, filters },
  ], { timeoutMs: SNAPSHOT_TIMEOUT_MS });
  const seen = new Set<string>();
  const accounts: MintTokenAccount[] = [];
  for (const { pubkey, account } of res.value) {
    const parsed = Array.isArray(account.data) ? undefined : account.data.parsed;
    const info = parsed?.info;
    if (parsed?.type !== "account" || !info || info.mint !== mint.mint) continue;
    if (account.owner !== mint.tokenProgram) throw new Error("RPC returned a token account owned by another program.");
    if (info.tokenAmount.decimals !== mint.decimals) throw new Error("RPC token account decimals disagree with the mint.");
    if (seen.has(pubkey)) continue;
    seen.add(pubkey);
    accounts.push({ address: pubkey, owner: info.owner, amount: parseBaseUnits(info.tokenAmount.amount), state: info.state === "frozen" ? "frozen" : "initialized" });
  }
  return { slot: res.context.slot, accounts };
}

export interface SignatureInfo {
  signature: string;
  slot: number;
  failed: boolean;
}

/**
 * Signatures touching an address, newest first, back to (not including)
 * `until`. Pages through history; stops at `maxSignatures` and reports
 * whether history was cut short so callers never act on a partial view.
 */
export async function fetchSignaturesSince(
  rpc: RpcClient,
  address: string,
  opts: { until: string | null; minSlot: number; commitment: Commitment; maxSignatures: number; pageSize?: number },
): Promise<{ signatures: SignatureInfo[]; complete: boolean }> {
  const out: SignatureInfo[] = [];
  let before: string | undefined;
  const limit = opts.pageSize ?? 1000;
  for (;;) {
    const page = await rpc.call<{ signature: string; slot: number; err: unknown }[]>("getSignaturesForAddress", [
      address,
      { limit, commitment: opts.commitment, ...(opts.until ? { until: opts.until } : {}), ...(before ? { before } : {}) },
    ]);
    for (const s of page) {
      if (s.slot < opts.minSlot) return { signatures: out, complete: true };
      out.push({ signature: s.signature, slot: s.slot, failed: s.err !== null && s.err !== undefined });
      if (out.length >= opts.maxSignatures) return { signatures: out, complete: false };
    }
    if (page.length < limit) return { signatures: out, complete: true };
    before = page[page.length - 1].signature;
  }
}

export interface TransactionEffect {
  signature: string;
  slot: number;
  blockTimeMs: number | null;
  failed: boolean;
  /** Net balance change per wallet (owner) for this mint, summed over its token accounts. */
  owners: { owner: string; preBase: bigint; postBase: bigint }[];
  /** Token accounts of this mint touched by the transaction, with their owner. */
  accounts: { address: string; owner: string }[];
}

type TokenBalance = { accountIndex: number; mint: string; owner?: string; uiTokenAmount: { amount: string; decimals: number } };

/** Reads one transaction and works out how it changed each wallet's balance of this mint. */
export async function fetchTransactionEffect(rpc: RpcClient, signature: string, mint: MintInfo, commitment: Commitment): Promise<TransactionEffect> {
  const tx = await rpc.call<{
    slot: number;
    blockTime: number | null;
    meta: { err: unknown; preTokenBalances?: TokenBalance[]; postTokenBalances?: TokenBalance[] } | null;
    transaction: { message: { accountKeys: ({ pubkey: string } | string)[] } };
  } | null>("getTransaction", [signature, { encoding: "jsonParsed", commitment, maxSupportedTransactionVersion: 0 }]);
  if (!tx || !tx.meta) throw new TransactionNotAvailableError(`Transaction ${signature} is not available at ${commitment} commitment yet.`);

  const keys = tx.transaction.message.accountKeys.map((k) => (typeof k === "string" ? k : k.pubkey));
  const failed = tx.meta.err !== null && tx.meta.err !== undefined;
  const pre = new Map<string, bigint>();
  const post = new Map<string, bigint>();
  const accounts = new Map<string, string>();
  const collect = (list: TokenBalance[] | undefined, into: Map<string, bigint>) => {
    for (const b of list ?? []) {
      if (b.mint !== mint.mint) continue;
      if (!b.owner) throw new Error(`Transaction ${signature} has a token balance without an owner; cannot attribute it.`);
      if (b.uiTokenAmount.decimals !== mint.decimals) throw new Error("Transaction token balance decimals disagree with the mint.");
      const account = keys[b.accountIndex];
      if (!account) throw new Error(`Transaction ${signature} references an unknown account index.`);
      accounts.set(account, b.owner);
      into.set(b.owner, (into.get(b.owner) ?? 0n) + parseBaseUnits(b.uiTokenAmount.amount));
    }
  };
  collect(tx.meta.preTokenBalances, pre);
  collect(tx.meta.postTokenBalances, post);

  const owners = failed
    ? []
    : [...new Set([...pre.keys(), ...post.keys()])].map((owner) => ({ owner, preBase: pre.get(owner) ?? 0n, postBase: post.get(owner) ?? 0n })).filter((m) => m.preBase !== m.postBase);
  return {
    signature,
    slot: tx.slot,
    blockTimeMs: tx.blockTime === null ? null : tx.blockTime * 1000,
    failed,
    owners,
    accounts: [...accounts].map(([address, owner]) => ({ address, owner })),
  };
}
