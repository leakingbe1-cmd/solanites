import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLASSIFIED_SLOTS, SEALED, sealedPreview, SPECIES } from "@/lib/species";
import { CLASSIFIED_SPECIES } from "@/server/classified";

/**
 * Owner-approved public previews for the six sealed species (Creature Studio 93f4c91). Each
 * catalogue slot carries its preview (src/lib/species.ts, keyed by catalogue number); this file
 * names no classified species, so the preview-to-species mapping never appears in the repo.
 */
const DIR = path.resolve(__dirname, "../../../public/sealed");

describe("sealed previews", () => {
  it("every classified species has a slot of its tier with its own distinct preview", () => {
    const previews = CLASSIFIED_SPECIES.map((s) => {
      const slot = CLASSIFIED_SLOTS.find((c) => c.dex === s.dex);
      expect(slot).toBeDefined();
      expect(slot!.rarity).toBe(s.rarity);
      expect(slot!.preview).toMatch(new RegExp(`^/sealed/${s.rarity}-[a-d]\\.webp$`));
      return slot!.preview;
    });
    expect(new Set(previews).size).toBe(CLASSIFIED_SPECIES.length);
  });

  it("files are the six tier-named previews, with no ids, names or metadata", () => {
    const files = readdirSync(DIR).sort();
    expect(files).toEqual(["mythic-a.webp", "mythic-b.webp", "mythic-c.webp", "mythic-d.webp", "secret-a.webp", "secret-b.webp"]);
    const secrets = CLASSIFIED_SPECIES.flatMap((s) => [s.id, s.name]);
    for (const f of files) {
      const buf = readFileSync(path.join(DIR, f));
      expect(buf.subarray(0, 4).toString()).toBe("RIFF");
      // a plain WebP: no EXIF or XMP chunk that could carry a name
      expect(buf.includes(Buffer.from("EXIF")) || buf.includes(Buffer.from("XMP "))).toBe(false);
      for (const word of secrets) expect(buf.includes(Buffer.from(word)), `${f} mentions ${word}`).toBe(false);
    }
  });

  it("only sealed stand-ins get a preview; generic tier stand-ins use their tier's", () => {
    expect(sealedPreview(SEALED.mythic)).toMatch(/^\/sealed\/mythic-[a-d]\.webp$/);
    expect(sealedPreview(SEALED.secret)).toMatch(/^\/sealed\/secret-[ab]\.webp$/);
    for (const s of SPECIES) expect(sealedPreview(s)).toBeNull();
    for (const s of CLASSIFIED_SPECIES) expect(sealedPreview(s), s.id).toBeNull();
  });
});
