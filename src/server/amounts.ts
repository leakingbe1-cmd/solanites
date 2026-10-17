/**
 * Token amounts are handled as bigint base units ("raw amounts") everywhere
 * authoritative. Decimal strings are only produced for display.
 */

/** Parses a non-negative integer string (as returned by RPC `tokenAmount.amount`). */
export function parseBaseUnits(raw: unknown): bigint {
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) throw new Error("Invalid token amount from RPC");
  return BigInt(raw);
}

/** Whole-token count → base units, e.g. 10_000 tokens with 6 decimals → 10_000_000_000n. */
export function wholeTokensToBase(tokens: number | bigint, decimals: number): bigint {
  if (typeof tokens === "number" && (!Number.isInteger(tokens) || tokens < 0)) throw new Error("Token threshold must be a non-negative integer");
  return BigInt(tokens) * 10n ** BigInt(decimals);
}

/** Base units → exact decimal string, trailing zeros trimmed ("12345.6"). */
export function formatBaseUnits(amount: bigint, decimals: number): string {
  const neg = amount < 0n;
  const abs = neg ? -amount : amount;
  const scale = 10n ** BigInt(decimals);
  const whole = abs / scale;
  const frac = (abs % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${neg ? "-" : ""}${whole}${frac ? `.${frac}` : ""}`;
}
