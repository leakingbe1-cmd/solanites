import { createPublicKey, verify } from "node:crypto";
import { decodeBase58 } from "../solana/base58";

/**
 * Sign-In With Solana: the claimant's wallet signs a plain-text message with
 * a single-use server nonce. Signing a message costs nothing, sends no
 * transaction and never reveals a private key or seed phrase.
 */
export function buildSignInMessage(p: { domain: string; address: string; nonce: string; issuedAt: number; expiresAt: number }): string {
  return [
    `${p.domain} wants you to sign in with your Solana account:`,
    p.address,
    "",
    "Sign in to check and submit a Solanites launch fee claim. This does not send a transaction, cost a fee or give access to your funds.",
    "",
    "Action: launch-fee-claim-sign-in",
    `URI: https://${p.domain}`,
    "Version: 1",
    "Chain ID: mainnet",
    `Nonce: ${p.nonce}`,
    `Issued At: ${new Date(p.issuedAt).toISOString()}`,
    `Expiration Time: ${new Date(p.expiresAt).toISOString()}`,
  ].join("\n");
}

/** DER SubjectPublicKeyInfo header for a raw 32-byte ed25519 key. */
const SPKI_ED25519 = Buffer.from("302a300506032b6570032100", "hex");

/** Verifies an ed25519 signature (base58 or base64) over `message` by the wallet `address`. */
export function verifyWalletSignature(message: string, signature: string, address: string): boolean {
  const pub = decodeBase58(address);
  if (!pub || pub.length !== 32) return false;
  let sig: Uint8Array | null = decodeBase58(signature);
  if (!sig || sig.length !== 64) {
    const b = Buffer.from(signature, "base64");
    sig = b.length === 64 ? new Uint8Array(b) : null;
  }
  if (!sig) return false;
  try {
    const key = createPublicKey({ key: Buffer.concat([SPKI_ED25519, Buffer.from(pub)]), format: "der", type: "spki" });
    return verify(null, Buffer.from(message, "utf8"), key, Buffer.from(sig));
  } catch {
    return false;
  }
}
