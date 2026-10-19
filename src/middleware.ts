import { NextResponse, type NextRequest } from "next/server";

/**
 * Internal tools (/studio and anything under it) are never public. An environment
 * switch is not authentication, so this runs before any page code on every deployment:
 *
 * - STUDIO_BASIC_AUTH unset (or weak): 404 everywhere, production and previews alike.
 * - STUDIO_BASIC_AUTH="user:long-random-password" (server-only, 24+ characters):
 *   HTTP Basic authentication with exactly those credentials (HTTPS on Vercel).
 */
export function middleware(req: NextRequest) {
  const expected = process.env.STUDIO_BASIC_AUTH ?? "";
  if (expected.length < 24 || !expected.includes(":")) return new NextResponse(null, { status: 404 });

  if (!safeEqual(basicCredentials(req.headers.get("authorization")), expected)) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Solanites internal", charset="UTF-8"', "cache-control": "no-store" },
    });
  }
  const res = NextResponse.next();
  res.headers.set("cache-control", "no-store");
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/studio", "/studio/:path*", "/api/studio/:path*"] };

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
