import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hatchClipFor } from "@/lib/hatchClip";
import heroAssets from "@/data/heroAssets.json";
import { gameConfig } from "@/config/gameConfig";
import { rollDemo } from "@/lib/heroDemo";
import { rarityChances, rollSpecies } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";

/** The homepage live demo: gameConfig odds, rolled before the tap, a clip per rarity or the built-in hatch. */
const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");

describe("homepage live demo", () => {
  it("rolls with the real odds (the same function as real eggs) and is deterministic per seed", () => {
    for (let s = 1; s < 50; s++) expect(rollDemo(s).id).toBe(rollSpecies(s, gameConfig));
    const counts = Object.fromEntries(RARITY_ORDER.map((r) => [r, 0])) as Record<string, number>;
    const N = 20_000;
    for (let s = 1; s <= N; s++) counts[rollDemo(s * 7919).rarity]++;
    const chances = rarityChances(gameConfig);
    for (const r of RARITY_ORDER) expect(Math.abs(counts[r] / N - chances[r])).toBeLessThan(0.02);
  });

  it("warms only the rolled species' clip, after first paint, without the clip map in the first load", () => {
    const c = read("components/landing/HeroDemo.tsx");
    expect(c).toContain('void import("@/lib/hatchClip").then(({ hatchClipFor }) =>');
    expect(c).toContain("hatchClipFor(result.id)");
    expect(c).not.toMatch(/^import .*hatchClip"/m);
    expect(hatchClipFor(rollDemo(1).id)).not.toBeNull();
  });

  it("is labelled simulated, offers a demo card only for Common to Legendary, and sits above the fold in the hero", () => {
    const c = read("components/landing/HeroDemo.tsx");
    expect(c).toContain("Demo · simulated");
    expect(c).toContain('demoShareable(species) && <ShareButton target={{ kind: "demo"');
    expect(c).toContain('href="/hatchery?demo=1"');
    const page = read("app/page.tsx");
    expect(page.indexOf("<HeroDemo />")).toBeGreaterThan(page.indexOf("<PhoenixHero />"));
    expect(page.indexOf("<HeroDemo />")).toBeLessThan(page.indexOf("</HeroSection>"));
  });

  it("labels the full-screen reveal and the clip as simulated whenever the result is a demo", () => {
    expect(read("components/ui/DemoTag.tsx")).toContain("Demo · simulated");
    const reveal = read("components/hatchery/HatchReveal.tsx");
    expect(reveal.indexOf("{demo && <DemoTag")).toBeGreaterThan(-1);
    expect(reveal.indexOf("{demo && <DemoTag")).toBeLessThan(reveal.indexOf("meta.label}"));
    const hero = read("components/landing/HeroDemo.tsx");
    expect(hero).toContain('closeLabel="Back to the egg" demo share=');
    expect(reveal.match(/\{demo && <DemoTag/g)).toHaveLength(2); // the clip and the built-in hatch
    expect(hero).toContain("<DemoTag className=\"mb-3\" />"); // the poster shown while the reveal loads
    expect(read("app/hatchery/page.tsx")).toContain("demo={h.isDemo}");
  });
});

describe("homepage first load stays light", () => {
  it("no creature-art code is imported up front by the layout, the hero egg or the sections below the fold", () => {
    expect(read("app/layout.tsx")).not.toMatch(/from "@\/components\/intro\/FirstVisitIntro"/);
    expect(read("components/intro/IntroLoader.tsx")).toContain('import("./FirstVisitIntro")');
    expect(read("components/egg/EggArt.tsx")).toMatch(/dynamic\(\(\) => import\("@\/components\/creature\/CreatureArt"\)[^;]*ssr: false/);
    const page = read("app/page.tsx");
    for (const s of ["StockShowcase", "RarityShowcase", "StageTimeline", "EvolutionShowcase", "HowSteps"]) expect(page).not.toContain(`from "@/components/landing/${s}"`);
    const hero = read("components/landing/HeroDemo.tsx");
    expect(hero).not.toMatch(/^import .*CreatureArt/m);
    expect(hero).not.toMatch(/^import .*HatchReveal/m);
  });

  it("portrait phones get the lighter centre crop of the Phoenix (same art, full height), first in the picture", () => {
    const { current, phone } = heroAssets as unknown as Record<string, { width: number; height: number; sources: Record<string, { src: string; bytes: number }[]> }>;
    expect(phone.height).toBe(current.height);
    expect(phone.width / phone.height).toBeCloseTo(1.3, 2);
    expect(phone.sources.avif[0].bytes).toBeLessThan(current.sources.avif[0].bytes * 0.6);
    const hero = read("components/landing/PhoenixHero.tsx");
    expect(hero.indexOf("media={PHONE_MEDIA}")).toBeLessThan(hero.indexOf("srcSet={srcSet(c.sources.avif)}"));
    expect(hero).toContain('media: `not all and ${PHONE_MEDIA}`');
  });
});
