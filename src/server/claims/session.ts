import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived claim session, issued only after a verified wallet signature.
 * Stateless HMAC token: `address.expiresMs.mac`. Kept in an httpOnly cookie.
 */
export const SESSION_COOKIE = "sl_claim";
export const SESSION_TTL_MS = 15 * 60_000;

function mac(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function issueSession(secret: string, address: string, now: number): { token: string; expiresAt: number } {
  const expiresAt = now + SESSION_TTL_MS;
  const body = `${address}.${expiresAt}`;
  return { token: `${body}.${mac(secret, body)}`, expiresAt };
}

/** Returns the wallet address the session proves, or null. */
export function readSession(secret: string, token: string | undefined | null, now: number): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [address, exp, sig] = parts;
  const expected = Buffer.from(mac(secret, `${address}.${exp}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!/^\d+$/.test(exp) || Number(exp) < now) return null;
  return address;
}
