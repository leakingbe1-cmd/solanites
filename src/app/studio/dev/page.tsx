import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DeveloperMode } from "@/components/dev/DeveloperMode";
import { studioAccess } from "@/server/studioAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "[Developer Mode] Solanites",
  robots: { index: false, follow: false },
};

/**
 * Developer Mode: owner-only previews of every species, stage and rarity, and simulated
 * hatches with developer odds. The middleware already requires the owner credentials for
 * /studio; this page checks them again on the server and is a 404 for anyone else.
 */
export default async function DeveloperModePage() {
  if (studioAccess((await headers()).get("authorization")) !== "authorised") notFound();
  return <DeveloperMode />;
}
