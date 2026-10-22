import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant";
import "@fontsource-variable/cormorant/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { HatcheryProvider } from "@/state/HatcheryProvider";
import { Nav } from "@/components/layout/Nav";
import { PageTransition } from "@/components/layout/PageTransition";
import { RealmLight } from "@/components/layout/RealmLight";
import { HorizonLine } from "@/components/layout/HorizonLine";
import { CosmicBackdrop } from "@/components/layout/CosmicBackdrop";
import { Footer } from "@/components/layout/Footer";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { INTRO_BOOT_SCRIPT } from "@/components/intro/introState";
import { FIRST_VISIT_INTRO } from "@/config/intro";
import { INDEXING_ENABLED } from "@/config/indexing";
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";
import { CATALOGUE_SIZE } from "@/lib/species";


const { symbol, tokensPerEgg } = gameConfig.token;
const TITLE = `Solanites (${symbol}) on Solana — Hold, Hatch, Evolve`;
const DESCRIPTION = `Hold ${symbol} on Solana. Every ${formatNumber(tokensPerEgg)} earns an egg that hatches into one of ${CATALOGUE_SIZE} creatures, and it keeps evolving while you hold.`;
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
      <head>{FIRST_VISIT_INTRO.enabled && <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />}</head>
      <body className="sl-noise min-h-screen">
        {/* fixed behind every page; lives in the layout so navigation never restarts it */}
        <CosmicBackdrop />
        <RealmLight />
        <HatcheryProvider>
          <Nav />
          <HorizonLine />
          <main className="relative">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          {FIRST_VISIT_INTRO.enabled && <IntroLoader />}
        </HatcheryProvider>
      </body>
    </html>
  );
}
