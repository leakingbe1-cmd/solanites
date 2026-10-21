import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { HatcheryProvider } from "@/state/HatcheryProvider";
import { Nav } from "@/components/layout/Nav";
import { PageTransition } from "@/components/layout/PageTransition";
import { CosmicBackdrop } from "@/components/layout/CosmicBackdrop";
import { Footer } from "@/components/layout/Footer";
import { FirstVisitIntro } from "@/components/intro/FirstVisitIntro";
import { INTRO_BOOT_SCRIPT } from "@/components/intro/introState";
import { INDEXING_ENABLED } from "@/config/indexing";

const TITLE = "Solanites — Your Solanite Is Waiting";
const DESCRIPTION = "Discover your creature. Hatch the extraordinary. Watch your Solanite grow stronger through its evolution.";
// Absolute URLs for the link-preview image: the production domain on Vercel, this deployment otherwise.
const SITE_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_HOST ? `https://${SITE_HOST}` : "http://localhost:3000"),
  title: TITLE,
  description: DESCRIPTION,
  // The 1200×630 card is src/app/opengraph-image.png (and twitter-image.png); Next adds the image tags.
  openGraph: { type: "website", siteName: "Solanites", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", site: "@Solanites_", creator: "@Solanites_", title: TITLE, description: DESCRIPTION },
  // Prelaunch: ask crawlers not to index (see src/config/indexing.ts).
  robots: INDEXING_ENABLED ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#05050a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the intro boot script may add an attribute to <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body className="sl-noise min-h-screen">
        {/* fixed behind every page; lives in the layout so navigation never restarts it */}
        <CosmicBackdrop />
        <HatcheryProvider>
          <Nav />
          <main className="relative">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <FirstVisitIntro />
        </HatcheryProvider>
      </body>
    </html>
  );
}
