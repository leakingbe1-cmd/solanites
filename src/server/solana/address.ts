import { decodeBase58 } from "./base58";

export type AddressCheck = { ok: true; address: string } | { ok: false; reason: string };

/**
 * Validates a Solana public key: base58, exactly 32 bytes once decoded.
 *
 * This does not check that the key is on the ed25519 curve: wallet addresses
 * are, but program-derived addresses are not, and both can own tokens.
 */
export function checkSolanaAddress(raw: unknown): AddressCheck {
  if (typeof raw !== "string") return { ok: false, reason: "Address must be a string." };
  const address = raw.trim();
  if (address.length < 32 || address.length > 44) return { ok: false, reason: "A Solana address is 32–44 characters long." };
  const bytes = decodeBase58(address);
  if (!bytes) return { ok: false, reason: "Address contains characters that are not valid base58." };
  if (bytes.length !== 32) return { ok: false, reason: "Address does not decode to a 32-byte public key." };
  return { ok: true, address };
}
