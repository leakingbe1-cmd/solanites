import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_CHALLENGE, studioAccess } from "@/server/studioAuth";

/**
 * Internal tools (/studio and anything under it, including Developer Mode, and
 * /api/studio) are never public. An environment switch is not authentication, so
 * this runs before any page code on every deployment:
 *
 * - STUDIO_BASIC_AUTH unset (or weak): 404 everywhere, production and previews alike.
 * - STUDIO_BASIC_AUTH="user:long-random-password" (server-only, 24+ characters):
 *   HTTP Basic authentication with exactly those credentials (HTTPS on Vercel).
 * - DEVELOPER_MODE=off: 404 everywhere regardless of credentials (the go-live switch).
 *
 * Each internal page and API route checks again (src/server/studioAuth.ts).
 */
export function middleware(req: NextRequest) {
  const access = studioAccess(req.headers.get("authorization"));
  if (access === "disabled") return new NextResponse(null, { status: 404 });
  if (access === "unauthenticated") return new NextResponse("Authentication required.", { status: 401, headers: STUDIO_CHALLENGE });
  const res = NextResponse.next();
  res.headers.set("cache-control", "no-store");
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/studio", "/studio/:path*", "/api/studio/:path*"] };
