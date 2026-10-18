import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { HatcheryProvider } from "@/state/HatcheryProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { FirstVisitIntro } from "@/components/intro/FirstVisitIntro";
import { INTRO_BOOT_SCRIPT } from "@/components/intro/introState";

export const metadata: Metadata = {
  title: "Solanites — Your Solanite Is Waiting",
  description: "Discover your creature. Hatch the extraordinary. Watch your Solanite grow stronger through its evolution.",
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
        <HatcheryProvider>
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
          <FirstVisitIntro />
        </HatcheryProvider>
      </body>
    </html>
  );
}
