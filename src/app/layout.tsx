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
import { FirstVisitIntro } from "@/components/intro/FirstVisitIntro";
import { INTRO_BOOT_SCRIPT } from "@/components/intro/introState";
import { INDEXING_ENABLED } from "@/config/indexing";

export const metadata: Metadata = {
  title: "Solanites — Your Solanite Is Waiting",
  description: "Discover your creature. Hatch the extraordinary. Watch your Solanite grow stronger through its evolution.",
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
        <RealmLight />
        <HatcheryProvider>
          <Nav />
          <HorizonLine />
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
