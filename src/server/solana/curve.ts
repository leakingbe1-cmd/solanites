import { decodeBase58 } from "./base58";

const P = 2n ** 255n - 19n;

function mod(a: bigint): bigint {
  const r = a % P;
  return r < 0n ? r + P : r;
}

function pow(base: bigint, exp: bigint): bigint {
  let result = 1n;
  let b = mod(base);
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = mod(result * b);
    b = mod(b * b);
    e >>= 1n;
  }
  return result;
}

// Edwards curve constant d = -121665 / 121666.
const D = mod(-121665n * pow(121666n, P - 2n));

/**
 * True when a 32-byte public key is a point on the ed25519 curve.
 *
 * Wallet keys are on the curve. Program-derived addresses (liquidity pool
 * authorities, vaults, escrow and other program-controlled accounts) are
 * deliberately off it, so no private key can ever sign for them.
 */
export function isOnCurve(address: string): boolean {
  const bytes = decodeBase58(address);
  if (!bytes || bytes.length !== 32) return false;
  const signBit = bytes[31] >> 7;
  let y = 0n;
  for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(i === 31 ? bytes[i] & 0x7f : bytes[i]);
  if (y >= P) return false;
  const y2 = mod(y * y);
  const u = mod(y2 - 1n);
  const v = mod(D * y2 + 1n);
  const x2 = mod(u * pow(v, P - 2n));
  if (x2 === 0n) return signBit === 0;
  // Euler's criterion: x² has a square root mod p exactly when x2^((p-1)/2) = 1.
  return pow(x2, (P - 1n) / 2n) === 1n;
}
