/**
 * Browser side of the reveal sign-in: asks an injected Solana wallet (Phantom, Solflare,
 * Backpack and others exposing the standard provider) to sign the server's plain-text
 * challenge. Signing a message sends no transaction, costs nothing and never shares a key.
 * The server verifies the signature and sets an httpOnly session; nothing secret is kept here.
 */

interface InjectedSolana {
  connect(): Promise<{ publicKey: { toString(): string } }>;
  signMessage(message: Uint8Array, display?: "utf8" | "hex"): Promise<{ signature: Uint8Array } | Uint8Array>;
  publicKey?: { toString(): string } | null;
}

type WalletWindow = Window & { phantom?: { solana?: InjectedSolana }; solflare?: InjectedSolana; backpack?: InjectedSolana; solana?: InjectedSolana };

export function injectedWallet(w: WalletWindow = window as WalletWindow): InjectedSolana | null {
  const p = w.phantom?.solana ?? w.solflare ?? w.backpack ?? w.solana ?? null;
  return p && typeof p.signMessage === "function" && typeof p.connect === "function" ? p : null;
}

export type RevealResult = { ok: true; address: string; expiresAt: number } | { ok: false; reason: string };

export async function revealWithWallet(opts: { wallet?: InjectedSolana | null; fetch?: typeof fetch } = {}): Promise<RevealResult> {
  const wallet = opts.wallet === undefined ? injectedWallet() : opts.wallet;
  const f = opts.fetch ?? fetch;
  if (!wallet) return { ok: false, reason: "No Solana wallet was found in this browser." };
  let address: string;
  try {
    address = (await wallet.connect()).publicKey.toString();
  } catch {
    return { ok: false, reason: "The wallet didn't connect." };
  }
  const post = (url: string, body: unknown) => f(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" });
  const c = await post("/api/owner/challenge", { address }).catch(() => null);
  if (!c?.ok) return { ok: false, reason: (await c?.json().catch(() => null))?.error?.message ?? "Couldn't start the sign-in." };
  const { message, nonce } = (await c.json()) as { message: string; nonce: string };
  let sig: Uint8Array;
  try {
    const signed = await wallet.signMessage(new TextEncoder().encode(message), "utf8");
    sig = signed instanceof Uint8Array ? signed : signed.signature;
  } catch {
    return { ok: false, reason: "The signature request was declined." };
  }
  const signature = btoa(String.fromCharCode(...sig));
  const s = await post("/api/owner/session", { address, nonce, signature }).catch(() => null);
  if (!s?.ok) return { ok: false, reason: (await s?.json().catch(() => null))?.error?.message ?? "The signature couldn't be verified." };
  const out = (await s.json()) as { address: string; expiresAt: number };
  return { ok: true, address: out.address, expiresAt: out.expiresAt };
}

export async function endReveal(f: typeof fetch = fetch): Promise<void> {
  await f("/api/owner/session", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
}
