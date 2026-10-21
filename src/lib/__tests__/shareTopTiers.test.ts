import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { SHARE_TOP_TIERS } from "@/config/share";
import { shareable } from "@/lib/share";
import { SPECIES, SPECIES_BY_ID } from "@/lib/species";

/** Mythic and Secret share cards stay off until launch: no button, no card, no share page. */
const OWNER = "5ynCKp91fYufur9VHzDWN2Dd26Kdo8enx2m1Q59oG1N1";
const eggOf = (speciesId: string) => ({ id: `egg_${OWNER}_1`, hatchedAt: 1, speciesId, evolution: { stage: 2 } });
let current = eggOf("driftfin");

vi.mock("@/server/runtime", () => ({ getRuntime: async () => ({ tracker: { holderView: async () => ({ eggs: [current] }) } }) }));
vi.mock("@/server/share/card", () => ({ renderCard: async () => new Response("png", { headers: { "content-type": "image/png" } }) }));

const { GET } = await import("@/app/api/card/[eggId]/route");
const card = () => GET(new Request("http://localhost/api/card/x"), { params: Promise.resolve({ eggId: current.id }) });

describe("Mythic and Secret share cards before launch", () => {
  it("the flag is off by default", () => {
    expect(SHARE_TOP_TIERS).toBe(false);
  });

  it("only Common to Legendary are shareable while it's off; every species once it's on", () => {
    for (const s of SPECIES) {
      expect(shareable(s)).toBe(s.rarity !== "mythic" && s.rarity !== "secret");
      expect(shareable(s, true)).toBe(true);
    }
  });

  it("the card route answers 404 for a hatched Mythic or Secret egg, and serves a Common one", async () => {
    for (const id of ["astravex", "orbelith", "genesis", "nullborn"]) {
      expect(["mythic", "secret"]).toContain(SPECIES_BY_ID[id].rarity);
      current = eggOf(id);
      expect((await card()).status).toBe(404);
    }
    current = eggOf("driftfin");
    const ok = await card();
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("image/png");
  });

  it("no share button for those tiers after the reveal or on the creature, and no share page", () => {
    const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");
    expect(read("components/hatchery/TrackedHatchery.tsx")).toContain("share={shareable(SPECIES_BY_ID[hatching.speciesId]) ? {");
    expect(read("components/creature/CreatureDetail.tsx")).toContain('record && ownerAddress ? (shareable(species) ? { kind: "egg"');
    expect(read("app/share/[eggId]/page.tsx")).toContain("return shareable(s) ? s : null;");
  });
});
