import { createRoot } from "react-dom/client";
import { HatcheryProvider } from "@/state/HatcheryProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import Home from "@/app/page";
import HatcheryPage from "@/app/hatchery/page";
import CollectionPage from "@/app/collection/page";
import HowItWorksPage from "@/app/how-it-works/page";
import LeaderboardPage from "@/app/leaderboard/page";
import { usePath } from "./router";

const PAGES: Record<string, () => React.ReactElement> = {
  "/": Home,
  "/hatchery": HatcheryPage,
  "/collection": CollectionPage,
  "/how-it-works": HowItWorksPage,
  "/leaderboard": LeaderboardPage,
};

function App() {
  const path = usePath();
  const Page = PAGES[path] ?? Home;
  return (
    <HatcheryProvider>
      <Nav />
      <main className="relative" key={path}>
        <Page />
      </main>
      <Footer />
    </HatcheryProvider>
  );
}

document.body.classList.add("sl-noise", "min-h-screen");
createRoot(document.getElementById("root")!).render(<App />);
