import "server-only";

import { SESSION_COOKIE, SESSION_TTL_MS } from "./claims/session";

export function sessionToken(req: Request): string | undefined {
  const cookie = req.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === SESSION_COOKIE) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function sessionCookie(token: string | null): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return token === null
    ? `${SESSION_COOKIE}=; Path=/api/claims; HttpOnly; SameSite=Strict; Max-Age=0${secure}`
    : `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/api/claims; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}
