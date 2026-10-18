/** Base58 (Bitcoin/Solana alphabet), shared by server and browser. */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const INDEX = new Map([...ALPHABET].map((ch, i) => [ch, i]));

/** Decodes a base58 string. Returns null for any character outside the Bitcoin/Solana alphabet. */
export function decodeBase58(input: string): Uint8Array | null {
  if (input.length === 0) return new Uint8Array();
  let value = 0n;
  for (const ch of input) {
    const digit = INDEX.get(ch);
    if (digit === undefined) return null;
    value = value * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (value > 0n) {
    bytes.unshift(Number(value & 0xffn));
    value >>= 8n;
  }
  // Each leading "1" encodes a leading zero byte.
  for (const ch of input) {
    if (ch !== "1") break;
    bytes.unshift(0);
  }
  return Uint8Array.from(bytes);
}

/** Encodes bytes as base58 (Bitcoin/Solana alphabet). */
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
