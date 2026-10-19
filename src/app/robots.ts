import type { MetadataRoute } from "next";
import { INDEXING_ENABLED } from "@/config/indexing";

export default function robots(): MetadataRoute.Robots {
  return INDEXING_ENABLED ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" } } : { rules: { userAgent: "*", disallow: "/" } };
}
