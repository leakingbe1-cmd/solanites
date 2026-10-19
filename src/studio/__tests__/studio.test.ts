import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES } from "@/lib/species";
import { studioEnabled } from "@/studio/access";
import { CONTENT_PACK, packMarkdown } from "@/studio/contentPack";
import { CAMPAIGN_IDS, MASTER_CREATIVE, PLATFORMS, checkContent, defaultInput, generate, type PlatformId } from "@/studio/copy";
import { FACTS, FEATURES, FEATURE_IDS } from "@/studio/facts";
import { X_LIMIT, lintClaims, xLength } from "@/studio/xText";

const plain = (s: string) => s.replace(/\*/g, "");

describe("campaign facts come from the live config", () => {
  it("matches the catalogue and rules", () => {
    expect(FACTS.speciesCount).toBe(SPECIES.length);
    expect(FACTS.speciesCount).toBe(28);
    expect(FACTS.rarityCount).toBe(RARITY_ORDER.length);
    expect(FACTS.formCount).toBe(gameConfig.evolution.names.length);
    expect(FACTS.phoenix.id).toBe("pyraurum");
    expect(FEATURES.species.callout).toBe(`*${SPECIES.length}* SPECIES TO DISCOVER`);
  });

  it("prints no website URL by default (teaser campaign; the domain will change)", () => {
    for (const campaign of CAMPAIGN_IDS) {
      const c = generate(defaultInput(campaign, "x-thread"));
      expect([c.caption, ...c.thread, c.cta, c.creative.url].join(" ")).not.toMatch(/https?:|vercel|\.app\b/);
    }
    expect(packMarkdown()).not.toMatch(/vercel|https?:/);
  });

  it("adds a URL everywhere once one is set", () => {
    const c = generate({ ...defaultInput("intro"), url: "https://solanites.example" });
    expect(c.caption).toContain("Enter the Hatchery → https://solanites.example");
    expect(c.creative.url).toBe("solanites.example");
  });
});

describe("master advert copy", () => {
  it("carries the brief's hook, callouts and end screen", () => {
    expect(plain(MASTER_CREATIVE.hook)).toBe("NOT JUST ANOTHER EGG.");
    expect(MASTER_CREATIVE.callouts.map(plain)).toEqual(["28 SPECIES TO DISCOVER", "6 RARITY TIERS", "HATCH. COLLECT. EVOLVE."]);
    expect(plain(MASTER_CREATIVE.tagline)).toBe("YOUR SOLANITE IS WAITING.");
    expect(MASTER_CREATIVE.cta.toUpperCase()).toBe("ENTER THE HATCHERY");
    expect(MASTER_CREATIVE.url).toBe("");
  });
});

describe("generated drafts", () => {
  const platforms = Object.keys(PLATFORMS) as PlatformId[];
  for (const campaign of CAMPAIGN_IDS) {
    it(`${campaign}: fits X, passes claim checks across variants`, () => {
      for (const platform of platforms) {
        for (let variant = 0; variant < 3; variant++) {
          const c = generate({ ...defaultInput(campaign, platform), variant });
          expect(xLength(c.caption)).toBeLessThanOrEqual(X_LIMIT);
          for (const post of c.thread) expect(xLength(post)).toBeLessThanOrEqual(X_LIMIT);
          expect(checkContent(c)).toEqual([]);
          expect(c.hashtags.length).toBeLessThanOrEqual(2);
          expect(c.creative.callouts.length).toBeLessThanOrEqual(3);
          expect(c.headline.length).toBeGreaterThan(0);
        }
      }
    });
  }

  it("only ever uses verified feature callouts", () => {
    const verified = new Set(FEATURE_IDS.map((id) => FEATURES[id].callout));
    for (const campaign of CAMPAIGN_IDS) {
      for (const c of generate(defaultInput(campaign)).creative.callouts) expect(verified.has(c)).toBe(true);
    }
  });

  it("uses the user's own message and keeps the community post link-free", () => {
    const c = generate({ ...defaultInput("intro"), message: "Hatch something rare" });
    expect(c.headline).toBe("Hatch something rare");
    expect(c.caption.startsWith("Hatch something rare.")).toBe(true);
    expect(generate({ ...defaultInput("community"), url: "https://solanites.example" }).caption).not.toContain("solanites.example");
  });

  it("asks for launch details instead of inventing a date", () => {
    expect(generate(defaultInput("launch")).notes.join(" ")).toMatch(/launch date/);
    const withDate = generate({ ...defaultInput("launch"), details: "Opens 1 Nov, 18:00 UTC." });
    expect(withDate.caption).toContain("Opens 1 Nov, 18:00 UTC.");
  });
});

describe("content pack", () => {
  it("has the eight briefed posts, all within X's limit and clean", () => {
    expect(CONTENT_PACK.map((p) => p.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const p of CONTENT_PACK) {
      expect(xLength(p.caption), p.id).toBeLessThanOrEqual(X_LIMIT);
      expect(lintClaims(p.caption), p.id).toEqual([]);
      expect(p.objective.length).toBeGreaterThan(10);
      expect(p.asset.file).toMatch(/\.(jpg|mp4)$/);
      for (const t of p.thread ?? []) expect(xLength(t)).toBeLessThanOrEqual(X_LIMIT);
      for (const o of p.poll ?? []) expect(o.length).toBeLessThanOrEqual(25);
    }
    expect(packMarkdown()).toContain("## Post 8: Website traffic");
  });

  it("quotes the real rarity weights", () => {
    const rarity = CONTENT_PACK.find((p) => p.id === "rarity")!;
    expect(rarity.caption).toContain("Common 60%");
    expect(rarity.caption).toContain("Secret 0.2%");
  });
});

describe("claim checks", () => {
  it("flags financial and unverifiable wording", () => {
    expect(lintClaims("Guaranteed 100x returns")).not.toEqual([]);
    expect(lintClaims("Proud partnership with a major exchange")).not.toEqual([]);
    expect(lintClaims("Claim your rewards today")).not.toEqual([]);
    expect(lintClaims("Join 10,000 holders")).not.toEqual([]);
    expect(lintClaims("No outcome is guaranteed.")).toEqual([]);
  });

  it("counts links as 23 characters", () => {
    expect(xLength("https://solanites.example.com/collection")).toBe(23);
    expect(xLength("hi solanites.app")).toBe(26);
  });
});

describe("studio access", () => {
  it("is on in development and off in production unless opted in", () => {
    expect(studioEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(studioEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(studioEnabled({ NODE_ENV: "production", SOLANITES_STUDIO: "1" })).toBe(true);
    expect(studioEnabled({ NODE_ENV: "production", SOLANITES_STUDIO: "true" })).toBe(false);
  });
});
