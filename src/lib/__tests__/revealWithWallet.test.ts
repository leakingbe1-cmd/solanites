import { describe, expect, it, vi } from "vitest";
import { injectedWallet, revealWithWallet } from "@/components/wallet/revealWithWallet";

/** The browser half of the reveal sign-in, against a stand-in wallet and server. */
describe("revealWithWallet", () => {
  const server = () =>
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (String(url).endsWith("/challenge")) return Response.json({ message: `sign me for ${body.address}`, nonce: "n1", expiresAt: 1 });
      return body.signature === btoa("sig!") ? Response.json({ address: body.address, expiresAt: 9 }) : Response.json({ error: { message: "bad signature" } }, { status: 401 });
    });
  const wallet = (sig = "sig!") => ({ connect: async () => ({ publicKey: { toString: () => "Addr111" } }), signMessage: vi.fn(async () => ({ signature: Uint8Array.from(sig, (c) => c.charCodeAt(0)) })) });

  it("connects, signs the server's challenge as text and opens a session", async () => {
    const f = server();
    const w = wallet();
    const r = await revealWithWallet({ wallet: w, fetch: f as unknown as typeof fetch });
    expect(r).toEqual({ ok: true, address: "Addr111", expiresAt: 9 });
    expect(new TextDecoder().decode((w.signMessage.mock.calls[0] as unknown as [Uint8Array])[0])).toBe("sign me for Addr111");
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("reports a missing wallet, a declined signature and a rejected signature without throwing", async () => {
    expect(await revealWithWallet({ wallet: null, fetch: server() as unknown as typeof fetch })).toMatchObject({ ok: false });
    const declined = { ...wallet(), signMessage: async () => { throw new Error("User rejected"); } };
    expect(await revealWithWallet({ wallet: declined, fetch: server() as unknown as typeof fetch })).toEqual({ ok: false, reason: "The signature request was declined." });
    expect(await revealWithWallet({ wallet: wallet("forged"), fetch: server() as unknown as typeof fetch })).toEqual({ ok: false, reason: "bad signature" });
  });

  it("only accepts a provider that can connect and sign messages", () => {
    expect(injectedWallet({ solana: { connect: async () => ({ publicKey: { toString: () => "" } }) } } as never)).toBeNull();
    const ok = wallet();
    expect(injectedWallet({ phantom: { solana: ok } } as never)).toBe(ok);
  });
});
