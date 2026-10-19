import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/gameConfig";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES } from "@/lib/species";
import { studioEnabled } from "@/studio/access";
import { CONTENT_PACK, packMarkdown } from "@/studio/contentPack";
import { CAMPAIGN_IDS, MASTER_CREATIVE, PLATFORMS, assertPrelaunchSafe, checkContent, defaultInput, generate, template, type PlatformId } from "@/studio/copy";
import { FACTS, FEATURES, FEATURE_IDS, PRELAUNCH, featureAllowed } from "@/studio/facts";
import { X_LIMIT, lintClaims, lintPrelaunch, xLength } from "@/studio/xText";

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

  it("ignores any URL typed in while the teaser phase is on", () => {
    expect(PRELAUNCH).toBe(true);
    const c = generate({ ...defaultInput("intro"), url: "https://solanites.vercel.app" });
    expect([c.caption, ...c.thread, c.cta, c.creative.url].join(" ")).not.toMatch(/vercel|https?:/);
    expect(c.notes.join(" ")).toMatch(/locked/);
  });
});

describe("master advert copy", () => {
  it("carries the brief's hook, callouts and end screen", () => {
    expect(plain(MASTER_CREATIVE.hook)).toBe("NOT JUST ANOTHER EGG.");
    expect(MASTER_CREATIVE.callouts.map(plain)).toEqual(["28 SPECIES TO DISCOVER", "6 RARITY TIERS", "HATCH. COLLECT. EVOLVE."]);
    expect(plain(MASTER_CREATIVE.tagline)).toBe("YOUR SOLANITE IS WAITING.");
    expect(MASTER_CREATIVE.cta.toUpperCase()).toBe("FOLLOW FOR THE REVEAL");
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
    expect(generate(defaultInput("community")).creative.points).toEqual(["PHOENIX", "SOMETHING RARE", "THE UNKNOWN"]);
  });

  it("holds launch, hatchery and rarity campaigns until the reveal, and flags dates", () => {
    for (const id of ["launch", "hatchery", "rarity"] as const) expect(generate(defaultInput(id)).notes.join(" "), id).toMatch(/HOLD until the reveal/);
    const withDate = generate({ ...defaultInput("launch"), details: "Opens 1 Nov, 18:00 UTC." });
    expect(checkContent(withDate).map((w) => w.reason).join(" ")).toMatch(/launch dates/);
  });

  it("never offers features that need live tracking or reveal the site", () => {
    for (const id of ["eggs", "walletless", "sealed", "incubation", "ascension", "demo"] as const) expect(featureAllowed(id), id).toBe(false);
    for (const campaign of CAMPAIGN_IDS) for (const f of template(campaign).features) expect(featureAllowed(f)).toBe(true);
    const forced = generate({ ...defaultInput("intro"), features: ["eggs", "walletless", "species"] });
    expect(forced.creative.callouts).toEqual([FEATURES.species.callout]);
  });
});

describe("content pack", () => {
  it("keeps every post within X's limit, clean, and link-free; approved posts are teaser-safe", () => {
    expect(CONTENT_PACK.map((p) => p.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(CONTENT_PACK.filter((p) => p.status === "approved").map((p) => p.id)).toEqual(["first-engagement", "phoenix-reveal", "collection", "video-launch", "community"]);
    for (const p of CONTENT_PACK) {
      expect(xLength(p.caption), p.id).toBeLessThanOrEqual(X_LIMIT);
      expect(lintClaims(p.caption), p.id).toEqual([]);
      expect(p.caption, p.id).not.toMatch(/vercel|https?:|\.app\b/);
      if (p.status === "approved") {
        expect(lintPrelaunch([p.caption, p.reply ?? ""].join("\n")), p.id).toEqual([]);
        for (const a of [p.asset, ...(p.altAssets ?? [])]) if (a.copy) expect(() => assertPrelaunchSafe({ ...MASTER_CREATIVE, ...a.copy }, a.file)).not.toThrow();
      } else expect(p.holdReason, p.id).toBeTruthy();
      if (p.reply) expect(xLength(p.reply)).toBeLessThanOrEqual(X_LIMIT);
      expect(p.objective.length).toBeGreaterThan(10);
      expect(p.asset.file).toMatch(/\.(jpg|mp4)$/);
      for (const t of p.thread ?? []) expect(xLength(t)).toBeLessThanOrEqual(X_LIMIT);
      for (const o of p.poll ?? []) expect(o.length).toBeLessThanOrEqual(25);
    }
    expect(packMarkdown()).toContain("## Post 9: Website traffic (hold)");
  });

  it("quotes the real rarity weights", () => {
    const rarity = CONTENT_PACK.find((p) => p.id === "rarity")!;
    expect(rarity.caption).toContain("Common 60%");
    expect(rarity.caption).toContain("Secret 0.2%");
  });
});

describe("first engagement post", () => {
  it("uses the verified creature count and the brief's three choices", () => {
    const first = CONTENT_PACK[0];
    expect(first.caption).toContain(`${SPECIES.length} creatures. One world.`);
    expect(first.caption).toMatch(/🔥 A Phoenix\n⚡ Something rare\n👁️ Something nobody has seen before/);
    expect(first.asset.format).toBe("poster-4x5");
    expect(first.altAssets?.[0].format).toBe("square");
    expect(first.reply).toBeTruthy();
  });
});

describe("prelaunch guard", () => {
  it("refuses any creative that could reveal the site or the coin", () => {
    expect(() => assertPrelaunchSafe(MASTER_CREATIVE)).not.toThrow();
    expect(() => assertPrelaunchSafe({ ...MASTER_CREATIVE, url: "solanites.vercel.app" })).toThrow(/prelaunch/);
    expect(() => assertPrelaunchSafe({ ...MASTER_CREATIVE, tagline: "Visit solanites.vercel.app" })).toThrow(/prelaunch/);
    expect(() => assertPrelaunchSafe({ ...MASTER_CREATIVE, sub: "CA: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" })).toThrow(/prelaunch/);
    expect(() => assertPrelaunchSafe({ ...MASTER_CREATIVE, sub: "Hold $SLNT to earn eggs" })).toThrow(/prelaunch/);
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
