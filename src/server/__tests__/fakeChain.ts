import type { RpcClient } from "../solana/rpc";
import { TOKEN_PROGRAM_ID } from "../solana/token";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function encodeBase58(bytes: Uint8Array): string {
  let value = 0n;
  for (const b of bytes) value = (value << 8n) + BigInt(b);
  let out = "";
  while (value > 0n) {
    out = ALPHABET[Number(value % 58n)] + out;
    value /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = "1" + out;
  }
  return out;
}

/** Deterministic valid 32-byte address for tests. */
export function addr(seed: number): string {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = (seed * 31 + i * 7 + 1) & 0xff;
  return encodeBase58(bytes);
}

export const MINT = addr(1);
export const DECIMALS = 6;
/** 1 whole token in base units for DECIMALS = 6. */
export const T = 10n ** BigInt(DECIMALS);

export interface FakeTokenAccount {
  pubkey: string;
  owner: string;
  mint?: string;
  amount: bigint;
  state?: "initialized" | "frozen";
  program?: string;
  decimals?: number;
}

/**
 * In-memory chain answering the two RPC methods the lookup uses, in the
 * same jsonParsed shape a real Solana node returns.
 */
export function fakeChain(opts: { accounts?: FakeTokenAccount[]; program?: string; mintExists?: boolean; slot?: number } = {}) {
  const program = opts.program ?? TOKEN_PROGRAM_ID;
  const state = { accounts: opts.accounts ?? [], slot: opts.slot ?? 300_000_000, calls: [] as string[], down: false };
  const rpc: RpcClient = {
    async call<T>(method: string, params: unknown[]): Promise<T> {
      state.calls.push(method);
      if (state.down) {
        const { RpcUnavailableError } = await import("../solana/rpc");
        throw new RpcUnavailableError("Solana RPC unavailable after 4 attempts (HTTP 503)", 4);
      }
      if (method === "getAccountInfo") {
        const value =
          opts.mintExists === false
            ? null
            : { owner: program, data: { program: "spl-token", parsed: { type: "mint", info: { decimals: DECIMALS, supply: (10_000_000n * T).toString(), isInitialized: true } } } };
        return { context: { slot: state.slot }, value } as T;
      }
      if (method === "getTokenAccountsByOwner") {
        const [owner, filter] = params as [string, { programId: string }];
        const value = state.accounts
          .filter((a) => a.owner === owner && (a.program ?? program) === filter.programId)
          .map((a) => ({
            pubkey: a.pubkey,
            account: {
              owner: a.program ?? program,
              data: {
                program: "spl-token",
                parsed: {
                  type: "account",
                  info: { mint: a.mint ?? MINT, owner: a.owner, state: a.state ?? "initialized", tokenAmount: { amount: a.amount.toString(), decimals: a.decimals ?? DECIMALS } },
                },
              },
            },
          }));
        return { context: { slot: state.slot }, value } as T;
      }
      throw new Error(`unexpected method ${method}`);
    },
  };
  return { rpc, state };
}
