import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLASSIFIED_SLOTS, SEALED, sealedPreview, SPECIES } from "@/lib/species";
import { CLASSIFIED_SPECIES } from "@/server/classified";

/**
 * Owner-approved public previews for the six sealed species (Creature Studio 93f4c91). The
 * species-to-preview mapping lives only here, on the server side; the browser gets each slot's
 * catalogue number and a tier-only file name, never a species id, name or lore.
 */
const PREVIEW_OF: Record<string, string> = {
  helivane: "mythic-a",
  astravex: "mythic-b",
  eventide: "mythic-c",
  orbelith: "mythic-d",
  nullborn: "secret-a",
  genesis: "secret-b",
};
const DIR = path.resolve(__dirname, "../../../public/sealed");

describe("sealed previews", () => {
  it("each classified species' slot shows its own approved preview", () => {
    for (const s of CLASSIFIED_SPECIES) {
      const slot = CLASSIFIED_SLOTS.find((c) => c.dex === s.dex);
      expect(slot, s.id).toBeDefined();
      expect(slot!.rarity).toBe(s.rarity);
      expect(slot!.preview).toBe(`/sealed/${PREVIEW_OF[s.id]}.webp`);
    }
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
