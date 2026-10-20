import { createCipheriv, randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/data/creatureAssets.json";
import { registerStageAssets, stageAsset } from "@/lib/creatureAssets";
import { CLASSIFIED_SPECIES, classifiedBundle } from "@/server/classified";
import art from "@/server/classified/art.json";
import { artKey, openStage, type SealedStage } from "@/server/classified/artCrypto";

/** Painted art for Mythic and Secret species: server only, delivered inside a disclosed bundle. */
const ROOT = path.resolve(__dirname, "../../..");
const ids = CLASSIFIED_SPECIES.map((s) => s.id);
const painted = (art as { species: Record<string, (SealedStage | null)[]> }).species;

describe("classified painted art stays on the server", () => {
  it("has no public files, thumbnails, silhouettes or manifest entries", () => {
    const pub = path.join(ROOT, "public/creatures");
    const dirs = existsSync(pub) ? readdirSync(pub) : [];
    for (const id of ids) {
      expect(dirs, `public/creatures/${id}`).not.toContain(id);
      expect(Object.keys((manifest as { species: object }).species), `creatureAssets.json lists ${id}`).not.toContain(id);
    }
  });

  it("is imported only by the server-only classified module", () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(ts|tsx|js|mjs)$/.test(f.name) && /classified\/art(\.json)?["']/.test(readFileSync(p, "utf8"))) hits.push(path.relative(ROOT, p));
      }
    };
    walk(path.join(ROOT, "src"));
    expect(hits.filter((h) => !h.startsWith("src/server/"))).toEqual([]);
  });

  it("covers exactly the six classified species, committed only as ciphertext", () => {
    expect(Object.keys(painted).sort()).toEqual([...ids].sort());
    // The repository is public: no readable image may ever be committed.
    expect(readFileSync(path.join(ROOT, "src/server/classified/art.json"), "utf8")).not.toMatch(/data:image|iVBORw0KGgo|UklGR/);
    for (const stages of Object.values(painted)) {
      expect(stages).toHaveLength(4);
      for (const s of stages) if (s) expect(Object.keys(s).sort()).toEqual(["alpha", "data", "iv", "tag", "v"]);
    }
  });

  it("without the key no painted stage is disclosed", () => {
    expect(artKey()).toBeNull();
    for (const id of ids) expect(classifiedBundle(id).art.images, id).toBeUndefined();
  });

  it("a sealed stage opens only with the right key", () => {
    const key = randomBytes(32);
    const webp = Buffer.from("RIFF....WEBPVP8 fake image bytes");
    const iv = randomBytes(12);
    const c = createCipheriv("aes-256-gcm", key, iv);
    const data = Buffer.concat([c.update(webp), c.final()]);
    const sealed: SealedStage = { v: 1, iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), data: data.toString("base64"), alpha: true };
    const src = `data:image/webp;base64,${webp.toString("base64")}`;
    expect(openStage(sealed, key)).toEqual({ src, thumb: src, alpha: true });
    expect(openStage(sealed, randomBytes(32))).toBeNull();
    expect(openStage(sealed, null)).toBeNull();
    expect(openStage({ ...sealed, data: Buffer.from("tampered").toString("base64") }, key)).toBeNull();
    expect(artKey({ CLASSIFIED_ART_KEY: key.toString("base64") })?.equals(key)).toBe(true);
    expect(artKey({ CLASSIFIED_ART_KEY: "too-short" })).toBeNull();
  });

  it("a revealed species' painted stages are found through the runtime registry", () => {
    const fake = { src: "data:image/webp;base64,AAAA", thumb: "data:image/webp;base64,AAAA", alpha: true };
    registerStageAssets("test-classified", [null, fake, null, null]);
    expect(stageAsset("test-classified", 1)).toEqual(fake);
    expect(stageAsset("test-classified", 0)).toBeNull();
  });
});
