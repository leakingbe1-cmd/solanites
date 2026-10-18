import { createPrivateKey, createPublicKey, sign } from "node:crypto";
import { encodeBase58 } from "../solana/base58";

/** PKCS#8 header for a raw 32-byte ed25519 seed. */
const PKCS8_ED25519 = Buffer.from("302e020100300506032b657004220420", "hex");

export interface TestKeypair {
  address: string;
  sign(message: Uint8Array): Uint8Array;
}

/**
 * Deterministic ed25519 keypair for tests and local fixtures, so fixture
 * wallets are real on-curve keys that can sign. Never used for real funds.
 */
export function keypairFromSeed(n: number): TestKeypair {
  const seed = Buffer.alloc(32);
  seed.writeUInt32BE(n >>> 0, 28);
  seed.write("solanites-fixture", 0);
  const key = createPrivateKey({ key: Buffer.concat([PKCS8_ED25519, seed]), format: "der", type: "pkcs8" });
  const spki = createPublicKey(key).export({ format: "der", type: "spki" });
  return {
    address: encodeBase58(new Uint8Array(spki.subarray(spki.length - 32))),
    sign: (message) => new Uint8Array(sign(null, Buffer.from(message), key)),
  };
}
