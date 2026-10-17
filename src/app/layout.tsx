import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { HatcheryProvider } from "@/state/HatcheryProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Solanites — Your Solanite Is Waiting",
  description: "Hold Solana. Hatch the extraordinary. The longer you hold, the stronger they grow.",
};

export const viewport: Viewport = {
  themeColor: "#060608",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="sl-noise min-h-screen">
        <HatcheryProvider>
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
        </HatcheryProvider>
      </body>
    </html>
  );
}
