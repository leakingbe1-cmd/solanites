import { describe, expect, it } from "vitest";
import { cardPath, demoShareable, EGG_ID, sharePagePath, shareText, validStage, xIntentUrl } from "@/lib/share";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";
import { GET as demoCard } from "@/app/api/card/demo/route";
import { GET as eggCard } from "@/app/api/card/[eggId]/route";

/** Share cards: server-sourced for real eggs, DEMO-stamped and Common–Legendary only for the demo. */
const EGG = "egg_5ynCKp91fYufur9VHzDWN2Dd26Kdo8enx2m1Q59oG1N1_1";

describe("share links", () => {
  it("builds card and share-page paths for real and demo targets", () => {
    expect(cardPath({ kind: "egg", eggId: EGG })).toBe(`/api/card/${EGG}`);
    expect(sharePagePath({ kind: "egg", eggId: EGG })).toBe(`/share/${EGG}`);
    expect(cardPath({ kind: "demo", speciesId: "driftfin", stage: 3 })).toBe("/api/card/demo?species=driftfin&stage=3");
    expect(sharePagePath({ kind: "demo", speciesId: "driftfin", stage: 3 })).toBe("/share/demo?species=driftfin&stage=3");
    expect(EGG_ID.test(EGG)).toBe(true);
    expect(EGG_ID.test("egg_../../x_1")).toBe(false);
  });

  it("demo cards never show Mythic or Secret species", () => {
    for (const s of SPECIES) expect(demoShareable(s)).toBe(s.rarity !== "mythic" && s.rarity !== "secret");
    expect(validStage(0) && validStage(3)).toBe(true);
    expect(validStage(4) || validStage(-1) || validStage(1.5)).toBe(false);
  });

  it("the prefilled post names the creature, the handle and the ticker, never price or gains", () => {
    const real = shareText("aurelion", false);
    expect(real).toBe("I hatched a Legendary Aurelion in @Solanites_ by holding $SLNT.");
    expect(shareText("neonyx", true)).toBe("I hatched an Epic Neonyx in the @Solanites_ demo.");
    for (const s of SPECIES) expect(shareText(s.id, false)).not.toMatch(/price|moon|gain|profit|x\d|\$\d/i);
    const url = xIntentUrl(real, "https://example.test/share/x");
    expect(url.startsWith("https://x.com/intent/post?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("url=https://example.test/share/x");
  });
});

describe("card routes", () => {
  const req = (u: string) => new Request(`http://localhost${u}`);
  it("demo card: 404 for Mythic/Secret, unknown species or a bad stage", async () => {
    expect(SPECIES_BY_ID.nullborn.rarity).toBe("secret");
    for (const q of ["species=nullborn&stage=1", "species=astravex&stage=1", "species=nope&stage=1", "species=driftfin&stage=9", "species=driftfin"]) {
      expect((await demoCard(req(`/api/card/demo?${q}`))).status).toBe(404);
    }
  });

  it("egg card: 404 for anything that isn't an egg id", async () => {
    const res = await eggCard(req("/api/card/x"), { params: Promise.resolve({ eggId: "not-an-egg" }) });
    expect(res.status).toBe(404);
  });
});
