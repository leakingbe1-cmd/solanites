import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentStudio } from "@/components/studio/ContentStudio";
import { studioEnabled } from "@/studio/access";

// Internal tool: never linked from the site, never indexed, and a 404 in
// production unless the deployment sets SOLANITES_STUDIO=1.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Studio · Solanites (internal)",
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioPage() {
  if (!studioEnabled()) notFound();
  return <ContentStudio />;
}
