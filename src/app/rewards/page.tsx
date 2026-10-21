import { notFound } from "next/navigation";
import { RewardsContent } from "@/components/rewards/RewardsContent";
import { REWARDS_PAGE_LIVE } from "@/config/holderDistribution";

// No title or preview metadata while the page is off: the route is a plain 404 before launch.
export const metadata = REWARDS_PAGE_LIVE ? { title: "Holder Rewards — Solanites" } : {};

/**
 * The planned holder distribution: the developer supply allocated for redistribution, divided
 * equally among eligible holders two hours after the official launch. Presentation only (see
 * src/config/holderDistribution.ts): nothing can be claimed, connected or signed here, no launch
 * time is shown, and terms the owner hasn't set are left out (never shown as pending). The supply
 * is only called "locked" once a lock proof link is set. Hidden (404) until REWARDS_PAGE_LIVE.
 * The dormant launch-fee claim API (src/server/claims, /api/claims/*) is not used by this page.
 */
export default function RewardsPage() {
  if (!REWARDS_PAGE_LIVE) notFound();
  return <RewardsContent />;
}
