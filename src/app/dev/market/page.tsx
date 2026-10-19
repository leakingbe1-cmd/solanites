import { notFound } from "next/navigation";
import { MarketInspector } from "@/components/market/MarketInspector";

export const dynamic = "force-dynamic";
export const metadata = { title: "Market links · Owner tools — Solanites", robots: { index: false, follow: false } };

/**
 * Owner test view for the creature → stock links: every species (classified ones too) in all
 * four forms, its ticker, data status, chart and growth calculation.
 *
 * Off in production unless SOLANITES_DEV_PAGES=1, and even then it shows nothing until the
 * owner enters SOLANITES_DEV_TOKEN, which the read-only /api/dev/market route checks on the
 * server. It can't change game state, ownership, odds or rewards.
 */
export default function DevMarketPage() {
  if (process.env.NODE_ENV === "production" && process.env.SOLANITES_DEV_PAGES !== "1") notFound();
  return <MarketInspector />;
}
