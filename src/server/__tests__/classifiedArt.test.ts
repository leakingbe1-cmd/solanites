import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/data/creatureAssets.json";
import { registerStageAssets, stageAsset } from "@/lib/creatureAssets";
import { CLASSIFIED_SPECIES, classifiedBundle } from "@/server/classified";

/**
 * Painted art for Mythic and Secret species. Owner decision (20 Oct): it never enters the
 * public repository, as files, data URLs or ciphertext. It will be served from the private
 * Blob store after the existing access checks; until then classified species use vector art.
 */
const ROOT = path.resolve(__dirname, "../../..");
const ids = CLASSIFIED_SPECIES.map((s) => s.id);

describe("classified painted art never enters the repository", () => {
  it("has no public files, thumbnails, silhouettes or manifest entries", () => {
    const pub = path.join(ROOT, "public/creatures");
    const dirs = existsSync(pub) ? readdirSync(pub) : [];
    for (const id of ids) {
      expect(dirs, `public/creatures/${id}`).not.toContain(id);
      expect(Object.keys((manifest as { species: object }).species), `creatureAssets.json lists ${id}`).not.toContain(id);
    }
  });

  it("no tracked file under src/ embeds an image, plain or encrypted", () => {
    const tracked = execFileSync("git", ["ls-files", "src"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
    for (const f of tracked) {
      const p = path.join(ROOT, f);
      if (!existsSync(p) || statSync(p).size > 5_000_000 || !/\.(ts|tsx|json|mjs|js)$/.test(f)) continue;
      const text = readFileSync(p, "utf8");
      // data URLs of real images, raw PNG/WebP base64 headers, or sealed-stage ciphertext records
      expect(text, f).not.toMatch(/data:image\/(png|webp|jpe?g);base64,[A-Za-z0-9+/]{200}/);
      expect(text, f).not.toMatch(/iVBORw0KGgo[A-Za-z0-9+/]{200}|UklGR[A-Za-z0-9+/]{200}/);
      expect(text, f).not.toMatch(/"iv":\s*"[A-Za-z0-9+/=]{16}",\s*"tag":/);
    }
    expect(existsSync(path.join(ROOT, "src/server/classified/art.json"))).toBe(false);
  });

  it("a disclosed bundle carries vector art only until the private store is connected", () => {
    for (const id of ids) {
      const art = classifiedBundle(id).art;
      expect(art.stages, id).toHaveLength(4);
      expect(art.images, id).toBeUndefined();
    }
  });

  it("a revealed species' painted stages are found through the runtime registry", () => {
    const fake = { src: "data:image/webp;base64,AAAA", thumb: "data:image/webp;base64,AAAA", alpha: true };
    registerStageAssets("test-classified", [null, fake, null, null]);
    expect(stageAsset("test-classified", 1)).toEqual(fake);
    expect(stageAsset("test-classified", 0)).toBeNull();
  });
});
