import type { MetadataRoute } from "next";
import { INDEXING_ENABLED } from "@/config/indexing";

/**
 * Before launch every crawler is asked to stay out, except X's link-preview bot: it may fetch pages
 * and the card images (/api/card/…, the /opengraph-image files) so shared links show their card.
 * Twitterbot doesn't index, and the noindex tag still applies to everyone.
 */
const TWITTERBOT = { userAgent: "Twitterbot", allow: ["/", "/api/card/"], disallow: ["/api/", "/studio"] };

export default function robots(): MetadataRoute.Robots {
  return INDEXING_ENABLED ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" } } : { rules: [TWITTERBOT, { userAgent: "*", disallow: "/" }] };
}
