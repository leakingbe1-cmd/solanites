import { parseBaseUnits } from "../amounts";
import type { Commitment, RpcClient } from "./rpc";

export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const TOKEN_PROGRAMS = new Set([TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]);

export class MintError extends Error {
  readonly code = "MINT_INVALID";
}

export interface MintInfo {
  mint: string;
  /** Owning program, read from chain — Token or Token-2022, never assumed. */
  tokenProgram: string;
  decimals: number;
  supply: bigint;
  slot: number;
}

interface ParsedAccount<T> {
  owner: string;
  data: { program?: string; parsed?: { type?: string; info?: T } } | unknown[];
}

/** Reads the mint account and confirms it really is an SPL mint. */
export async function fetchMintInfo(rpc: RpcClient, mint: string, commitment: Commitment): Promise<MintInfo> {
  const res = await rpc.call<{ context: { slot: number }; value: ParsedAccount<{ decimals: number; supply: string; isInitialized: boolean }> | null }>(
    "getAccountInfo",
    [mint, { encoding: "jsonParsed", commitment }],
  );
  const acc = res.value;
  if (!acc) throw new MintError("The configured mint account does not exist on this cluster.");
  if (!TOKEN_PROGRAMS.has(acc.owner)) throw new MintError("The configured mint is not owned by the SPL Token or Token-2022 program.");
  const parsed = Array.isArray(acc.data) ? undefined : acc.data.parsed;
  if (parsed?.type !== "mint" || !parsed.info) throw new MintError("The configured address is a token program account, but not a mint.");
  const { decimals, supply, isInitialized } = parsed.info;
  if (!isInitialized) throw new MintError("The configured mint is not initialised.");
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) throw new MintError("The mint reports an invalid decimals value.");
  return { mint, tokenProgram: acc.owner, decimals, supply: parseBaseUnits(supply), slot: res.context.slot };
}

export interface TokenAccountBalance {
  address: string;
  amount: bigint;
  state: "initialized" | "frozen";
}

export interface OwnerBalance {
  owner: string;
  /** Sum over initialized (not frozen) accounts — the amount used for eligibility. */
  usable: bigint;
  /** Sum over frozen accounts — shown, but not counted toward eligibility. */
  frozen: bigint;
  accounts: TokenAccountBalance[];
  slot: number;
}

type TokenAccountInfo = { mint: string; owner: string; state: string; tokenAmount: { amount: string; decimals: number } };

/**
 * All token accounts an owner holds for the mint, aggregated.
 *
 * Every account returned by the provider is re-checked (mint, owner, owning
 * program, decimals) so a misbehaving RPC can't inflate a balance.
 */
export async function fetchOwnerBalance(rpc: RpcClient, owner: string, mint: MintInfo, commitment: Commitment): Promise<OwnerBalance> {
  const res = await rpc.call<{ context: { slot: number }; value: { pubkey: string; account: ParsedAccount<TokenAccountInfo> }[] }>("getTokenAccountsByOwner", [
    owner,
    { programId: mint.tokenProgram },
    { encoding: "jsonParsed", commitment },
  ]);
  const accounts: TokenAccountBalance[] = [];
  const seen = new Set<string>();
  let usable = 0n;
  let frozen = 0n;
  for (const { pubkey, account } of res.value) {
    const parsed = Array.isArray(account.data) ? undefined : account.data.parsed;
    const info = parsed?.info;
    if (parsed?.type !== "account" || !info) continue;
    if (info.mint !== mint.mint) continue; // another token held by the same wallet
    if (info.owner !== owner || account.owner !== mint.tokenProgram) throw new Error("RPC returned a token account that does not belong to this owner/program.");
    if (info.tokenAmount.decimals !== mint.decimals) throw new Error("RPC token account decimals disagree with the mint.");
    if (seen.has(pubkey)) continue; // defensive: never double-count an account
    seen.add(pubkey);
    const amount = parseBaseUnits(info.tokenAmount.amount);
    const state = info.state === "frozen" ? "frozen" : "initialized";
    if (state === "frozen") frozen += amount;
    else usable += amount;
    accounts.push({ address: pubkey, amount, state });
  }
  accounts.sort((a, b) => (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0));
  return { owner, usable, frozen, accounts, slot: res.context.slot };
}
