/**
 * Owner access to internal tools (/studio, including Developer Mode, and /api/studio):
 * HTTP Basic authentication against the server-only STUDIO_BASIC_AUTH secret
 * ("user:long-random-password", 24+ characters). With no secret, or a weak one, every
 * internal route is a 404 on every deployment. An environment switch alone is never
 * treated as authentication.
 *
 * DEVELOPER_MODE=off is the hard off switch for going live: every internal route is a
 * 404 even when STUDIO_BASIC_AUTH is set and the right credentials are sent, so turning
 * Developer Mode off never depends on deleting the secret (docs/developer-mode.md).
 *
 * Used by the middleware (first gate) and again by each internal page and API route
 * (second gate), so a routing or matcher mistake cannot expose them on its own.
 * Plain string work only, so it runs in the middleware's edge runtime too.
 */

export type StudioAccess = "disabled" | "unauthenticated" | "authorised";

/** True when DEVELOPER_MODE is "off" (also accepts 0, false, no, disabled; any case). */
export function developerModeSwitchedOff(value: string | undefined = process.env.DEVELOPER_MODE): boolean {
  return /^(off|0|false|no|disabled)$/i.test((value ?? "").trim());
}

export function studioAccess(authorization: string | null | undefined, expected: string = process.env.STUDIO_BASIC_AUTH ?? ""): StudioAccess {
  if (developerModeSwitchedOff()) return "disabled";
  if (expected.length < 24 || !expected.includes(":")) return "disabled";
  return safeEqual(basicCredentials(authorization ?? null), expected) ? "authorised" : "unauthenticated";
}

export const STUDIO_CHALLENGE = { "WWW-Authenticate": 'Basic realm="Solanites internal", charset="UTF-8"', "cache-control": "no-store" } as const;

/** For internal API routes: null when authorised, otherwise the response to return (404 or 401). */
export function studioApiGuard(req: Request): Response | null {
  const access = studioAccess(req.headers.get("authorization"));
  if (access === "authorised") return null;
  if (access === "disabled") return new Response(null, { status: 404 });
  return new Response(JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Authentication required." } }), {
    status: 401,
    headers: { ...STUDIO_CHALLENGE, "content-type": "application/json" },
  });
}

function basicCredentials(header: string | null): string {
  if (!header?.startsWith("Basic ")) return "";
  try {
    return atob(header.slice(6).trim());
  } catch {
    return "";
  }
}

/** Compares in time independent of where the strings differ. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return diff === 0;
}
