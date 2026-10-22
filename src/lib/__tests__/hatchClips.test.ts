import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HATCH_POSTER } from "@/config/hatchClips";
import { hatchClipFor } from "@/lib/hatchClip";
import { SPECIES } from "@/lib/species";

/** The owner's 3D hatch clips (HANDOFF.md, art/3d-creatures 10cde2d): one per rarity and element, every species covered. */
const pub = (p: string) => path.resolve(__dirname, "../../../public", p.replace(/^\//, ""));
const read = (f: string) => readFileSync(path.resolve(__dirname, "../..", f), "utf8");

describe("hatch clips", () => {
  it("every species has a clip of its own rarity, in webm and mp4, with its last frame", () => {
    const used = new Set<string>();
    for (const s of SPECIES) {
      const c = hatchClipFor(s.id);
      expect(c, s.id).not.toBeNull();
      expect(c!.name.split("_")[1], s.id).toBe(s.rarity);
      for (const f of [c!.webm, c!.mp4, c!.end]) expect(existsSync(pub(f)), f).toBe(true);
      used.add(c!.name);
    }
    expect(used.size).toBe(24);
    expect(existsSync(pub(HATCH_POSTER))).toBe(true);
    expect(hatchClipFor("not-a-species")).toBeNull();
  });

  it("follows the handoff: chosen from the hatch result, muted inline, poster first, reduced motion and built-in fallbacks", () => {
    const reveal = read("components/hatchery/HatchReveal.tsx");
    expect(reveal).toContain("const clip = hatchClipFor(species.id);"); // the result the reveal was opened with
    expect(reveal).toMatch(/<video[^>]*poster=\{HATCH_POSTER\}[^>]*muted playsInline autoPlay/);
    expect(reveal.indexOf('type="video/webm"')).toBeLessThan(reveal.indexOf('type="video/mp4"'));
    expect(reveal).toContain('reducedMotion() ? "still" : "clip"');
    expect(reveal).toContain('onFail={() => setMode("builtin")}');
    // real eggs open the reveal only with the server's hatch result
    expect(read("components/hatchery/TrackedHatchery.tsx")).toContain("species={SPECIES_BY_ID[hatching.speciesId]}");
  });

  it("the creature comes out of the egg, never pops in: at the burst in the clip, in the built-in hatch, and into the hero", () => {
    const reveal = read("components/hatchery/HatchReveal.tsx");
    expect(reveal).not.toContain("sl-pop");
    expect(reveal.match(/sl-emerge/g)?.length).toBe(2); // clip creature + built-in creature
    expect(reveal).toContain("if (v.currentTime * 1000 >= HATCH_CLIP_BURST_MS) fireBurst();");
    expect(reveal).toMatch(/\{burst && \(\s*<>\s*<div className="sl-egg-flash/);
    expect(reveal).toContain("HATCH_CLIP_BURST_MS + DETAILS_AFTER_BURST_MS) onReveal()");
    expect(read("components/landing/HeroDemo.tsx")).toContain('<div className="sl-arrive relative h-full w-full">');
    const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
    for (const k of ["@keyframes sl-emerge", "@keyframes sl-egg-flash", "@keyframes sl-arrive", "@keyframes sl-arrive-glow"]) expect(css).toContain(k);
    // reduced motion: a quick fade, no movement, no flash
    expect(css).toMatch(/\.sl-emerge,\s*\.sl-arrive \{\s*animation-name: sl-fade-in !important;/);
    expect(css).toMatch(/\.sl-egg-flash,\s*\.sl-arrive-glow \{ display: none; \}/);
  });
});
